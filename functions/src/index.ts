/**
 * BigQuery to Firestore Sync Extension
 *
 * This extension syncs data from BigQuery tables to Firestore collections
 * with incremental updates based on a timestamp column.
 */

import * as admin from 'firebase-admin'
import {onSchedule} from 'firebase-functions/v2/scheduler'

import {logInfo, logError} from './cloudLogger'
import {loadConfig} from './config'
import {performIncrementalSync, performDeleteSync} from './sync'

// Initialize Firebase Admin
admin.initializeApp()

/**
 * Scheduled function to sync data from BigQuery to Firestore
 */
export const syncBigQueryToFirestore = onSchedule(
  {
    schedule: 'every 1 hours', // This will be overridden by extension.yaml
    timeoutSeconds: 1800, // 30 minutes
    memory: '512MiB',
  },
  async () => {
    try {
      logInfo('BigQuery to Firestore Sync Started')

      // Load configuration
      const config = loadConfig()
      logInfo('Configuration loaded', {
        additionalPayload: {
          bigQueryTable: `${config.bigqueryProjectId}.${config.bigqueryDataset}.${config.bigqueryTable}`,
          firestoreCollection: config.firestoreCollectionPath,
          primaryKey: config.primaryKeyColumn,
          timestampColumn: config.timestampColumn,
          batchSize: config.batchSize,
          deleteSync: config.enableDeleteSync,
        },
      })

      const db = admin.firestore()

      // Perform incremental sync
      const stats = await performIncrementalSync(db, config)

      logInfo('Sync statistics', {
        additionalPayload: {
          created: stats.documentsCreated,
          updated: stats.documentsUpdated,
          deleted: stats.documentsDeleted,
          errors: stats.errors,
          duration: stats.endTime.getTime() - stats.startTime.getTime(),
        },
      })

      // Perform delete sync if enabled
      if (config.enableDeleteSync) {
        logInfo('Delete sync is enabled. Starting delete synchronization...')
        const deletedCount = await performDeleteSync(db, config)
        logInfo(`Delete sync completed. Deleted ${deletedCount} documents.`)
      }

      logInfo('BigQuery to Firestore Sync Completed Successfully')
    } catch (error) {
      logError('BigQuery to Firestore Sync Failed', {
        error: error instanceof Error ? error : new Error(String(error)),
      })

      // Re-throw to mark the function execution as failed
      throw error
    }
  }
)
