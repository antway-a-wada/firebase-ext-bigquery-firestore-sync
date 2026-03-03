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
    logInfo('Starting incremental sync')
    logInfo('Configuration', {
      additionalPayload: {
        dataset: config.bigqueryDataset,
        table: config.bigqueryTable,
        collection: config.firestoreCollectionPath,
      },
    })

    // Get last sync timestamp
    const lastSyncTimestamp = await getLastSyncTimestamp(db, config)
    logInfo('Last sync timestamp', {
      details: lastSyncTimestamp?.toISOString() ?? 'None (initial sync)',
    })

    // Query BigQuery for updated records
    const rows = await queryUpdatedRecords(config, lastSyncTimestamp)
    logInfo('Retrieved rows from BigQuery', {additionalPayload: {rowCount: rows.length}})

    if (rows.length === 0) {
      logInfo('No new or updated records found')
      await updateSyncState(db, config, new Date(), 0)
      stats.endTime = new Date()
      return stats
    }

    // Transform rows to Firestore documents
    const documents = transformRows(rows, config)
    logInfo('Transformed documents', {additionalPayload: {documentCount: documents.length}})

    // Validate documents
    const validDocuments = documents.filter((doc) => validateDocument(doc))
    logInfo('Documents passed validation', {additionalPayload: {validCount: validDocuments.length}})

    if (validDocuments.length === 0) {
      logInfo('No valid documents to sync')
      await updateSyncState(db, config, new Date(), 0)
      stats.endTime = new Date()
      return stats
    }

    // Write documents to Firestore
    const writeResult = await writeDocumentsBatch(db, config, validDocuments)
    stats.documentsCreated = writeResult.created
    stats.documentsUpdated = writeResult.updated
    stats.errors = writeResult.errors

    logInfo('Write completed', {additionalPayload: writeResult})

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
    logInfo('Incremental sync completed', {
      additionalPayload: {
        documentsCreated: stats.documentsCreated,
        documentsUpdated: stats.documentsUpdated,
        documentsDeleted: stats.documentsDeleted,
        errors: stats.errors,
      },
    })

    return stats
  } catch (error) {
    logError('Error during incremental sync', {
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
      logError('Failed to update sync state', {
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
    logInfo('Starting delete synchronization')

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
      logInfo('No documents to delete')
      return 0
    }

    logInfo('Found documents to delete', {additionalPayload: {count: idsToDelete.length}})

    // Delete documents from Firestore
    const deletedCount = await deleteDocumentsBatch(db, config, idsToDelete)
    logInfo('Delete synchronization completed', {additionalPayload: {deletedCount}})

    return deletedCount
  } catch (error) {
    logError('Error during delete synchronization', {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    throw error
  }
}
