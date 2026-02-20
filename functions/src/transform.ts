/**
 * Data transformation utilities for BigQuery to Firestore conversion
 */

import {ExtensionConfig} from './config';
import {BigQueryRow, FirestoreDocument} from './types';

/**
 * Convert BigQuery value to Firestore-compatible value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  // BigQuery TIMESTAMP to Firestore Timestamp
  if (value && typeof value === 'object' && 'value' in value) {
    const timestamp = new Date((value as {value: string}).value);
    if (!Number.isNaN(timestamp.getTime())) {
      return timestamp;
    }
  }

  // BigQuery DATE to Firestore Timestamp
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  // BigQuery DATETIME to Firestore Timestamp
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const datetime = new Date(value);
    if (!Number.isNaN(datetime.getTime())) {
      return datetime;
    }
  }

  // BigQuery INT64 (comes as string)
  if (typeof value === 'string' && /^-?\d+$/.test(value)) {
    const num = parseInt(value, 10);
    if (!Number.isNaN(num) && num <= Number.MAX_SAFE_INTEGER && num >= Number.MIN_SAFE_INTEGER) {
      return num;
    }
  }

  // BigQuery FLOAT64
  if (typeof value === 'number') {
    return value;
  }

  // BigQuery BOOL
  if (typeof value === 'boolean') {
    return value;
  }

  // BigQuery STRING
  if (typeof value === 'string') {
    return value;
  }

  // BigQuery ARRAY
  if (Array.isArray(value)) {
    return value.map((item) => convertValue(item));
  }

  // BigQuery STRUCT/RECORD
  if (typeof value === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const converted: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      converted[key] = convertValue(val);
    }
    return converted;
  }

  // Default: return as-is
  return value;
}

/**
 * Transform a BigQuery row into a Firestore document
 */
export function transformRow(
  row: BigQueryRow,
  config: ExtensionConfig
): FirestoreDocument | null {
  try {
    const primaryKeyValue = row[config.primaryKeyColumn];
    
    if (primaryKeyValue === undefined || primaryKeyValue === null) {
      console.warn('Row missing primary key:', config.primaryKeyColumn);
      return null;
    }
    
    const documentId = String(primaryKeyValue);

    const data: Record<string, any> = {};

    for (const [key, value] of Object.entries(row)) {
      // Skip excluded fields
      if (config.excludeFields.includes(key)) {
        continue;
      }

      // Apply field mapping
      const firestoreKey = config.fieldMapping[key] || key;

      // Convert value to Firestore-compatible type
      data[firestoreKey] = convertValue(value);
    }

    return {
      id: documentId,
      data,
    };
  } catch (error) {
    console.error('Error transforming row:', error, row);
    return null;
  }
}

/**
 * Transform multiple BigQuery rows into Firestore documents
 */
export function transformRows(
  rows: BigQueryRow[],
  config: ExtensionConfig
): FirestoreDocument[] {
  const documents: FirestoreDocument[] = [];

  for (const row of rows) {
    const doc = transformRow(row, config);
    if (doc) {
      documents.push(doc);
    }
  }

  console.log(`Transformed ${documents.length} out of ${rows.length} rows`);
  return documents;
}

/**
 * Validate that a document can be written to Firestore
 */
export function validateDocument(doc: FirestoreDocument): boolean {
  // Firestore document ID must not be empty
  if (!doc.id || doc.id.trim() === '') {
    console.warn('Invalid document: empty ID');
    return false;
  }

  // Firestore document ID must not contain '/'
  if (doc.id.includes('/')) {
    console.warn('Invalid document: ID contains "/":', doc.id);
    return false;
  }

  // Check document size (approximate)
  const docSize = JSON.stringify(doc.data).length;
  if (docSize > 1000000) { // 1 MB limit
    console.warn('Document too large:', doc.id, docSize, 'bytes');
    return false;
  }

  return true;
}
