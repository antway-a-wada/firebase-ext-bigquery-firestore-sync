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
      logInfo('BigQueryからFirestoreへの同期を開始します')

      // Load configuration
      const config = loadConfig()
      logInfo('設定を読み込みました', {
        additionalPayload: {
          bigQueryTable: `${config.bigqueryProjectId}.${config.bigqueryDataset}.${config.bigqueryTable}`,
          firestoreCollection: config.firestoreCollectionPath,
          primaryKey: config.primaryKeyColumn,
          timestampColumn: config.timestampColumn ?? '未設定（全件同期）',
          batchSize: config.batchSize,
          diffCheck: config.enableDiffCheck,
          deleteSync: config.enableDeleteSync,
        },
      })

      const db = admin.firestore()

      // Perform incremental sync
      const stats = await performIncrementalSync(db, config)

      logInfo('同期統計', {
        additionalPayload: {
          created: stats.documentsCreated,
          updated: stats.documentsUpdated,
          skipped: stats.documentsSkipped,
          deleted: stats.documentsDeleted,
          errors: stats.errors,
          duration: stats.endTime.getTime() - stats.startTime.getTime(),
        },
      })

      // Perform delete sync if enabled
      if (config.enableDeleteSync) {
        logInfo('削除同期が有効です。削除同期を開始します')
        const deletedCount = await performDeleteSync(db, config)
        logInfo(`削除同期が完了しました。${deletedCount}件のドキュメントを削除しました`)
      }

      logInfo('BigQueryからFirestoreへの同期が正常に完了しました')
    } catch (error) {
      logError('BigQueryからFirestoreへの同期が失敗しました', {
        error: error instanceof Error ? error : new Error(String(error)),
      })

      // Re-throw to mark the function execution as failed
      throw error
    }
  }
)
