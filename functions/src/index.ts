/**
 * BigQuery to Firestore Sync Extension
 *
 * This extension syncs data from BigQuery tables to Firestore collections
 * with incremental updates based on a timestamp column.
 */

import * as admin from 'firebase-admin';
import {onSchedule} from 'firebase-functions/v2/scheduler';

import {loadConfig} from './config';
import {performIncrementalSync, performDeleteSync} from './sync';

// Initialize Firebase Admin
admin.initializeApp();

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
      console.log('=== BigQuery to Firestore Sync Started ===');

      // Load configuration
      const config = loadConfig();
      console.log('Configuration loaded:', {
        bigQueryTable: `${config.bigqueryProjectId}.${config.bigqueryDataset}.${config.bigqueryTable}`,
        firestoreCollection: config.firestoreCollectionPath,
        primaryKey: config.primaryKeyColumn,
        timestampColumn: config.timestampColumn,
        batchSize: config.batchSize,
        deleteSync: config.enableDeleteSync,
      });

      const db = admin.firestore();

      // Perform incremental sync
      const stats = await performIncrementalSync(db, config);

      console.log('Sync statistics:', {
        created: stats.documentsCreated,
        updated: stats.documentsUpdated,
        deleted: stats.documentsDeleted,
        errors: stats.errors,
        duration: stats.endTime.getTime() - stats.startTime.getTime(),
      });

      // Perform delete sync if enabled
      if (config.enableDeleteSync) {
        console.log('Delete sync is enabled. Starting delete synchronization...');
        const deletedCount = await performDeleteSync(db, config);
        console.log(`Delete sync completed. Deleted ${deletedCount} documents.`);
      }

      console.log('=== BigQuery to Firestore Sync Completed Successfully ===');
    } catch (error) {
      console.error('=== BigQuery to Firestore Sync Failed ===');
      console.error('Error:', error);

      // Re-throw to mark the function execution as failed
      throw error;
    }
  }
);
