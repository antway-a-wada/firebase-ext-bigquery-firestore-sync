/**
 * Main synchronization logic
 */

import * as admin from 'firebase-admin'

import {queryUpdatedRecords, queryAllDocumentIds} from './bigquery'
import {logInfo, logError} from './cloudLogger'
import {ExtensionConfig} from './config'
import {
  getLastSyncTimestamp,
  updateSyncState,
  writeDocumentsBatch,
  getAllDocumentIds,
  deleteDocumentsBatch,
} from './firestore'
import {transformRows, validateDocument} from './transform'
import {SyncStats} from './types'

/**
 * Perform incremental sync from BigQuery to Firestore
 */
export async function performIncrementalSync(
  db: admin.firestore.Firestore,
  config: ExtensionConfig
): Promise<SyncStats> {
  const stats: SyncStats = {
    documentsCreated: 0,
    documentsUpdated: 0,
    documentsDeleted: 0,
    errors: 0,
    startTime: new Date(),
    endTime: new Date(),
  }

  try {
    logInfo('増分同期を開始します')
    logInfo('設定', {
      additionalPayload: {
        dataset: config.bigqueryDataset,
        table: config.bigqueryTable,
        collection: config.firestoreCollectionPath,
      },
    })

    // Get last sync timestamp
    const lastSyncTimestamp = await getLastSyncTimestamp(db, config)
    logInfo('前回の同期タイムスタンプ', {
      details: lastSyncTimestamp?.toISOString() ?? 'なし（初回同期）',
    })

    // Query BigQuery for updated records
    const rows = await queryUpdatedRecords(config, lastSyncTimestamp)
    logInfo('BigQueryから行を取得しました', {additionalPayload: {rowCount: rows.length}})

    if (rows.length === 0) {
      logInfo('新規または更新されたレコードが見つかりませんでした')
      await updateSyncState(db, config, new Date(), 0)
      stats.endTime = new Date()
      return stats
    }

    // Transform rows to Firestore documents
    const documents = transformRows(rows, config)
    logInfo('ドキュメントを変換しました', {additionalPayload: {documentCount: documents.length}})

    // Validate documents
    const validDocuments = documents.filter((doc) => validateDocument(doc))
    logInfo('ドキュメントの検証が完了しました', {
      additionalPayload: {validCount: validDocuments.length},
    })

    if (validDocuments.length === 0) {
      logInfo('同期する有効なドキュメントがありません')
      await updateSyncState(db, config, new Date(), 0)
      stats.endTime = new Date()
      return stats
    }

    // Write documents to Firestore
    const writeResult = await writeDocumentsBatch(db, config, validDocuments)
    stats.documentsCreated = writeResult.created
    stats.documentsUpdated = writeResult.updated
    stats.errors = writeResult.errors

    logInfo('書き込みが完了しました', {additionalPayload: writeResult})

    // Update sync state
    const currentTimestamp = new Date()
    await updateSyncState(
      db,
      config,
      currentTimestamp,
      validDocuments.length,
      stats.errors > 0 ? `${stats.errors} errors occurred` : undefined
    )

    stats.endTime = new Date()
    logInfo('増分同期が完了しました', {
      additionalPayload: {
        documentsCreated: stats.documentsCreated,
        documentsUpdated: stats.documentsUpdated,
        documentsDeleted: stats.documentsDeleted,
        errors: stats.errors,
      },
    })

    return stats
  } catch (error) {
    logError('増分同期中にエラーが発生しました', {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    stats.errors++
    stats.endTime = new Date()

    try {
      await updateSyncState(
        db,
        config,
        new Date(),
        0,
        error instanceof Error ? error.message : String(error)
      )
    } catch (updateError) {
      logError('同期状態の更新に失敗しました', {
        error: updateError instanceof Error ? updateError : new Error(String(updateError)),
      })
    }

    throw error
  }
}

/**
 * Perform delete synchronization
 * Removes Firestore documents that no longer exist in BigQuery
 */
export async function performDeleteSync(
  db: admin.firestore.Firestore,
  config: ExtensionConfig
): Promise<number> {
  try {
    logInfo('削除同期を開始します')

    // Get all document IDs from BigQuery
    const bigQueryIds = await queryAllDocumentIds(config)

    // Get all document IDs from Firestore
    const firestoreIds = await getAllDocumentIds(db, config)

    // Find documents to delete (in Firestore but not in BigQuery)
    const idsToDelete: string[] = []
    for (const firestoreId of firestoreIds) {
      if (!bigQueryIds.has(firestoreId)) {
        idsToDelete.push(firestoreId)
      }
    }

    if (idsToDelete.length === 0) {
      logInfo('削除するドキュメントはありません')
      return 0
    }

    logInfo('削除するドキュメントを見つけました', {additionalPayload: {count: idsToDelete.length}})

    // Delete documents from Firestore
    const deletedCount = await deleteDocumentsBatch(db, config, idsToDelete)
    logInfo('削除同期が完了しました', {additionalPayload: {deletedCount}})

    return deletedCount
  } catch (error) {
    logError('削除同期中にエラーが発生しました', {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    throw error
  }
}
