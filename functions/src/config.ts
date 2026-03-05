/**
 * Extension configuration loaded from environment variables
 */

import {logWarning, logError} from './cloudLogger'

export interface ExtensionConfig {
  bigqueryProjectId: string
  bigqueryDataset: string
  bigqueryTable: string
  firestoreCollectionPath: string
  primaryKeyColumn: string
  timestampColumn: string | undefined
  enableDiffCheck: boolean
  enableDeleteSync: boolean
  batchSize: number
  fieldMapping: Record<string, string>
  excludeFields: string[]
}

/**
 * Parse field mapping from JSON string
 */
function parseFieldMapping(mappingStr: string | undefined): Record<string, string> {
  if (!mappingStr || mappingStr.trim() === '') {
    return {}
  }

  try {
    const parsed = JSON.parse(mappingStr) as unknown
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      logWarning('FIELD_MAPPINGはJSONオブジェクトである必要があります。空のマッピングを使用します')
      return {}
    }
    return parsed as Record<string, string>
  } catch (error) {
    logError('FIELD_MAPPINGのパースに失敗しました', {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return {}
  }
}

/**
 * Parse exclude fields from comma-separated string
 */
function parseExcludeFields(excludeStr: string | undefined): string[] {
  if (!excludeStr || excludeStr.trim() === '') {
    return []
  }

  return excludeStr
    .split(',')
    .map((field) => field.trim())
    .filter((field) => field.length > 0)
}

/**
 * Load and validate extension configuration from environment variables
 */
export function loadConfig(): ExtensionConfig {
  const requiredEnvVars = [
    'BIGQUERY_DATASET',
    'BIGQUERY_TABLE',
    'FIRESTORE_COLLECTION_PATH',
    'PRIMARY_KEY_COLUMN',
    'TIMESTAMP_COLUMN',
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`)
    }
  }

  const config: ExtensionConfig = {
    bigqueryProjectId: process.env.BIGQUERY_PROJECT_ID ?? process.env.PROJECT_ID ?? '',
    bigqueryDataset: process.env.BIGQUERY_DATASET!,
    bigqueryTable: process.env.BIGQUERY_TABLE!,
    firestoreCollectionPath: process.env.FIRESTORE_COLLECTION_PATH!,
    primaryKeyColumn: process.env.PRIMARY_KEY_COLUMN!,
    timestampColumn: process.env.TIMESTAMP_COLUMN ?? undefined,
    enableDiffCheck: process.env.ENABLE_DIFF_CHECK === 'true',
    enableDeleteSync: process.env.ENABLE_DELETE_SYNC === 'true',
    batchSize: parseInt(process.env.BATCH_SIZE ?? '500', 10),
    fieldMapping: parseFieldMapping(process.env.FIELD_MAPPING),
    excludeFields: parseExcludeFields(process.env.EXCLUDE_FIELDS),
  }

  if (config.batchSize < 1 || config.batchSize > 500) {
    throw new Error('BATCH_SIZE must be between 1 and 500')
  }

  return config
}
