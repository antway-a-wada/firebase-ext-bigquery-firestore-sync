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
    logInfo('No previous sync state found. This is the initial sync.')
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
  logInfo('Sync state updated', {additionalPayload: updateData})
}

/**
 * Write documents to Firestore in batches
 */
export async function writeDocumentsBatch(
  db: admin.firestore.Firestore,
  config: ExtensionConfig,
  documents: FirestoreDocument[]
): Promise<{created: number; updated: number; errors: number}> {
  let created = 0
  let updated = 0
  let errors = 0

  // Split documents into batches of config.batchSize
  for (let i = 0; i < documents.length; i += config.batchSize) {
    const batch = db.batch()
    const batchDocs = documents.slice(i, i + config.batchSize)

    for (const doc of batchDocs) {
      try {
        const docRef = db.collection(config.firestoreCollectionPath).doc(doc.id)

        // Check if document exists to track created vs updated
        const existing = await docRef.get()
        if (existing.exists) {
          updated++
        } else {
          created++
        }

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

  return {created, updated, errors}
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

  logInfo('Found documents in Firestore collection', {additionalPayload: {count: ids.size}})
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
      logInfo('Deleted batch', {additionalPayload: {documentCount: batchIds.length}})
    } catch (error) {
      logError('Error deleting batch', {
        error: error instanceof Error ? error : new Error(String(error)),
      })
    }
  }

  return deleted
}
