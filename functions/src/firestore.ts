/**
 * Firestore operations for the extension
 */

import * as admin from 'firebase-admin'

import {logInfo, logError} from './cloudLogger'
import {ExtensionConfig} from './config'
import {FirestoreDocument, SyncState} from './types'

const SYNC_STATE_COLLECTION = '_bigquery_firestore_sync_state'

/**
 * Get the last sync timestamp from Firestore
 */
export async function getLastSyncTimestamp(
  db: admin.firestore.Firestore,
  config: ExtensionConfig
): Promise<Date | null> {
  const stateDoc = await db
    .collection(SYNC_STATE_COLLECTION)
    .doc(config.firestoreCollectionPath.replace(/\//g, '_'))
    .get()

  if (!stateDoc.exists) {
    logInfo('前回の同期状態が見つかりません。初回同期です')
    return null
  }

  const state = stateDoc.data() as SyncState
  return state.lastSyncTimestamp ? new Date(state.lastSyncTimestamp) : null
}

/**
 * Update the sync state in Firestore
 */
export async function updateSyncState(
  db: admin.firestore.Firestore,
  config: ExtensionConfig,
  timestamp: Date,
  totalSynced: number,
  error?: string
): Promise<void> {
  const stateRef = db
    .collection(SYNC_STATE_COLLECTION)
    .doc(config.firestoreCollectionPath.replace(/\//g, '_'))

  const updateData: Partial<SyncState> = {
    lastSyncTimestamp: timestamp,
    totalDocumentsSynced: totalSynced,
  }

  if (!error) {
    updateData.lastSuccessfulSync = new Date()
  } else {
    updateData.lastError = error
  }

  await stateRef.set(updateData, {merge: true})
  logInfo('同期状態を更新しました', {additionalPayload: updateData})
}

/**
 * Get existing documents from Firestore for diff checking
 */
export async function getExistingDocuments(
  db: admin.firestore.Firestore,
  config: ExtensionConfig,
  documentIds: string[]
): Promise<Map<string, Record<string, unknown>>> {
  const existingDocs = new Map<string, Record<string, unknown>>()

  if (documentIds.length === 0) {
    return existingDocs
  }

  const collectionRef = db.collection(config.firestoreCollectionPath)

  // Process in batches of 500 (Firestore limit for 'in' queries is 30, so we use getAll)
  for (let i = 0; i < documentIds.length; i += 500) {
    const batchIds = documentIds.slice(i, i + 500)
    const docRefs = batchIds.map((id) => collectionRef.doc(id))

    try {
      const snapshots = await db.getAll(...docRefs)
      for (const snapshot of snapshots) {
        if (snapshot.exists) {
          existingDocs.set(snapshot.id, snapshot.data() as Record<string, unknown>)
        }
      }
    } catch (error) {
      logError('既存ドキュメントの取得中にエラーが発生しました', {
        error: error instanceof Error ? error : new Error(String(error)),
        additionalPayload: {batchSize: batchIds.length},
      })
    }
  }

  logInfo('既存ドキュメントを取得しました', {additionalPayload: {count: existingDocs.size}})
  return existingDocs
}

/**
 * Check if document data has changed
 */
export function hasDocumentChanged(
  newData: Record<string, unknown>,
  existingData: Record<string, unknown> | undefined
): boolean {
  if (!existingData) {
    return true // New document
  }

  // Deep comparison using JSON serialization
  const newDataStr = JSON.stringify(sortObjectKeys(newData))
  const existingDataStr = JSON.stringify(sortObjectKeys(existingData))

  return newDataStr !== existingDataStr
}

/**
 * Sort object keys for consistent comparison
 */
function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sortObjectKeys(item))
  }

  const record = obj as Record<string, unknown>
  return Object.keys(record)
    .sort()
    .reduce((result: Record<string, unknown>, key) => {
      const value = record[key]
      result[key] = sortObjectKeys(value)
      return result
    }, {})
}

/**
 * Write documents to Firestore in batches
 */
export async function writeDocumentsBatch(
  db: admin.firestore.Firestore,
  config: ExtensionConfig,
  documents: FirestoreDocument[]
): Promise<{created: number; updated: number; skipped: number; errors: number}> {
  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  // Get existing documents if diff check is enabled
  const existingDocs: Map<string, Record<string, unknown>> | undefined = config.enableDiffCheck
    ? await (async (): Promise<Map<string, Record<string, unknown>>> => {
        const documentIds = documents.map((doc) => doc.id)
        const docs = await getExistingDocuments(db, config, documentIds)
        logInfo('差分チェックが有効です。変更があるドキュメントのみを更新します')
        return docs
      })()
    : undefined

  // Split documents into batches of config.batchSize
  for (let i = 0; i < documents.length; i += config.batchSize) {
    const batch = db.batch()
    const batchDocs = documents.slice(i, i + config.batchSize)

    for (const doc of batchDocs) {
      const collectionRef = db.collection(config.firestoreCollectionPath)
      const docRef = collectionRef.doc(doc.id)

      // Check if document has changed (if diff check is enabled)
      if (existingDocs !== undefined) {
        const existingData = existingDocs.get(doc.id)
        if (!hasDocumentChanged(doc.data, existingData)) {
          skipped++
          continue // Skip unchanged document
        }

        if (existingData) {
          updated++
        } else {
          created++
        }
      } else {
        // Without diff check, check if document exists
        const exists = await docRef.get().then((snapshot) => snapshot.exists)
        if (exists) {
          updated++
        } else {
          created++
        }
      }

      try {
        batch.set(docRef, doc.data, {merge: true})
      } catch (error) {
        console.error('Error preparing document for batch:', doc.id, error)
        errors++
      }
    }

    try {
      await batch.commit()
      console.log(`Batch committed: ${batchDocs.length} documents`)
    } catch (error) {
      console.error('Error committing batch:', error)
      errors += batchDocs.length
    }
  }

  return {created, updated, skipped, errors}
}

/**
 * Get all document IDs from Firestore collection
 */
export async function getAllDocumentIds(
  db: admin.firestore.Firestore,
  config: ExtensionConfig
): Promise<Set<string>> {
  const ids = new Set<string>()
  const collectionRef = db.collection(config.firestoreCollectionPath)

  const query = collectionRef.select()
  const snapshot = await query.get()

  snapshot.docs.forEach((doc) => {
    ids.add(doc.id)
  })

  logInfo('Firestoreコレクションでドキュメントを見つけました', {
    additionalPayload: {count: ids.size},
  })
  return ids
}

/**
 * Delete documents from Firestore in batches
 */
export async function deleteDocumentsBatch(
  db: admin.firestore.Firestore,
  config: ExtensionConfig,
  documentIds: string[]
): Promise<number> {
  let deleted = 0

  // Split document IDs into batches of config.batchSize
  for (let i = 0; i < documentIds.length; i += config.batchSize) {
    const batch = db.batch()
    const batchIds = documentIds.slice(i, i + config.batchSize)

    for (const id of batchIds) {
      const docRef = db.collection(config.firestoreCollectionPath).doc(id)
      batch.delete(docRef)
    }

    try {
      await batch.commit()
      deleted += batchIds.length
      logInfo('バッチ削除を実行しました', {additionalPayload: {documentCount: batchIds.length}})
    } catch (error) {
      logError('バッチ削除中にエラーが発生しました', {
        error: error instanceof Error ? error : new Error(String(error)),
      })
    }
  }

  return deleted
}
