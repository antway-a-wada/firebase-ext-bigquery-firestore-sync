/**
 * Type definitions for the extension
 */

/**
 * Represents a row from BigQuery
 */
export interface BigQueryRow {
  [key: string]: any;
}

/**
 * Represents a document to be written to Firestore
 */
export interface FirestoreDocument {
  id: string;
  data: Record<string, any>;
}

/**
 * Sync state stored in Firestore
 */
export interface SyncState {
  lastSyncTimestamp: Date;
  lastSuccessfulSync: Date;
  totalDocumentsSynced: number;
  lastError?: string;
}

/**
 * Statistics for a sync operation
 */
export interface SyncStats {
  documentsCreated: number;
  documentsUpdated: number;
  documentsDeleted: number;
  errors: number;
  startTime: Date;
  endTime: Date;
  bigQueryBytesProcessed?: number;
}
