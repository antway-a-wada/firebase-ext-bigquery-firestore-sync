/**
 * Main synchronization logic
 */

import * as admin from 'firebase-admin'

import {queryUpdatedRecords, queryAllDocumentIds} from './bigquery'
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
    console.log('Starting incremental sync...')
    console.log('Configuration:', {
      dataset: config.bigqueryDataset,
      table: config.bigqueryTable,
      collection: config.firestoreCollectionPath,
    })

    // Get last sync timestamp
    const lastSyncTimestamp = await getLastSyncTimestamp(db, config)
    console.log('Last sync timestamp:', lastSyncTimestamp?.toISOString() ?? 'None (initial sync)')

    // Query BigQuery for updated records
    const rows = await queryUpdatedRecords(config, lastSyncTimestamp)
    console.log(`Retrieved ${rows.length} rows from BigQuery`)

    if (rows.length === 0) {
      console.log('No new or updated records found.')
      await updateSyncState(db, config, new Date(), 0)
      stats.endTime = new Date()
      return stats
    }

    // Transform rows to Firestore documents
    const documents = transformRows(rows, config)
    console.log(`Transformed ${documents.length} documents`)

    // Validate documents
    const validDocuments = documents.filter(doc => validateDocument(doc))
    console.log(`${validDocuments.length} documents passed validation`)

    if (validDocuments.length === 0) {
      console.log('No valid documents to sync.')
      await updateSyncState(db, config, new Date(), 0)
      stats.endTime = new Date()
      return stats
    }

    // Write documents to Firestore
    const writeResult = await writeDocumentsBatch(db, config, validDocuments)
    stats.documentsCreated = writeResult.created
    stats.documentsUpdated = writeResult.updated
    stats.errors = writeResult.errors

    console.log('Write completed:', writeResult)

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
    console.log('Incremental sync completed:', stats)

    return stats
  } catch (error) {
    console.error('Error during incremental sync:', error)
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
      console.error('Failed to update sync state:', updateError)
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
    console.log('Starting delete synchronization...')

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
      console.log('No documents to delete.')
      return 0
    }

    console.log(`Found ${idsToDelete.length} documents to delete`)

    // Delete documents from Firestore
    const deletedCount = await deleteDocumentsBatch(db, config, idsToDelete)
    console.log(`Delete synchronization completed. Deleted ${deletedCount} documents.`)

    return deletedCount
  } catch (error) {
    console.error('Error during delete synchronization:', error)
    throw error
  }
}
