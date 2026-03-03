/**
 * Tests for config module
 */

import {loadConfig} from '../config'

describe('loadConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {...originalEnv}
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should load all required configuration', () => {
    process.env.PROJECT_ID = 'test-project'
    process.env.BIGQUERY_DATASET = 'test_dataset'
    process.env.BIGQUERY_TABLE = 'test_table'
    process.env.FIRESTORE_COLLECTION_PATH = 'test_collection'
    process.env.PRIMARY_KEY_COLUMN = 'id'
    process.env.TIMESTAMP_COLUMN = 'updated_at'

    const config = loadConfig()

    expect(config.bigqueryProjectId).toBe('test-project')
    expect(config.bigqueryDataset).toBe('test_dataset')
    expect(config.bigqueryTable).toBe('test_table')
    expect(config.firestoreCollectionPath).toBe('test_collection')
    expect(config.primaryKeyColumn).toBe('id')
    expect(config.timestampColumn).toBe('updated_at')
    expect(config.batchSize).toBe(500)
    expect(config.enableDeleteSync).toBe(false)
  })

  it('should throw error if required env var is missing', () => {
    process.env.BIGQUERY_DATASET = 'test_dataset'
    // Missing other required vars

    expect(() => loadConfig()).toThrow('Required environment variable')
  })

  it('should parse field mapping correctly', () => {
    process.env.PROJECT_ID = 'test-project'
    process.env.BIGQUERY_DATASET = 'test_dataset'
    process.env.BIGQUERY_TABLE = 'test_table'
    process.env.FIRESTORE_COLLECTION_PATH = 'test_collection'
    process.env.PRIMARY_KEY_COLUMN = 'id'
    process.env.TIMESTAMP_COLUMN = 'updated_at'
    process.env.FIELD_MAPPING = '{"user_id": "userId", "created_at": "createdAt"}'

    const config = loadConfig()

    expect(config.fieldMapping).toEqual({
      user_id: 'userId',
      created_at: 'createdAt',
    })
  })

  it('should handle invalid field mapping JSON', () => {
    process.env.PROJECT_ID = 'test-project'
    process.env.BIGQUERY_DATASET = 'test_dataset'
    process.env.BIGQUERY_TABLE = 'test_table'
    process.env.FIRESTORE_COLLECTION_PATH = 'test_collection'
    process.env.PRIMARY_KEY_COLUMN = 'id'
    process.env.TIMESTAMP_COLUMN = 'updated_at'
    process.env.FIELD_MAPPING = 'invalid json'

    const config = loadConfig()

    expect(config.fieldMapping).toEqual({})
  })

  it('should parse exclude fields correctly', () => {
    process.env.PROJECT_ID = 'test-project'
    process.env.BIGQUERY_DATASET = 'test_dataset'
    process.env.BIGQUERY_TABLE = 'test_table'
    process.env.FIRESTORE_COLLECTION_PATH = 'test_collection'
    process.env.PRIMARY_KEY_COLUMN = 'id'
    process.env.TIMESTAMP_COLUMN = 'updated_at'
    process.env.EXCLUDE_FIELDS = 'internal_id, temp_field, debug_info'

    const config = loadConfig()

    expect(config.excludeFields).toEqual(['internal_id', 'temp_field', 'debug_info'])
  })

  it('should validate batch size', () => {
    process.env.PROJECT_ID = 'test-project'
    process.env.BIGQUERY_DATASET = 'test_dataset'
    process.env.BIGQUERY_TABLE = 'test_table'
    process.env.FIRESTORE_COLLECTION_PATH = 'test_collection'
    process.env.PRIMARY_KEY_COLUMN = 'id'
    process.env.TIMESTAMP_COLUMN = 'updated_at'
    process.env.BATCH_SIZE = '600'

    expect(() => loadConfig()).toThrow('BATCH_SIZE must be between 1 and 500')
  })

  it('should enable delete sync when set', () => {
    process.env.PROJECT_ID = 'test-project'
    process.env.BIGQUERY_DATASET = 'test_dataset'
    process.env.BIGQUERY_TABLE = 'test_table'
    process.env.FIRESTORE_COLLECTION_PATH = 'test_collection'
    process.env.PRIMARY_KEY_COLUMN = 'id'
    process.env.TIMESTAMP_COLUMN = 'updated_at'
    process.env.ENABLE_DELETE_SYNC = 'true'

    const config = loadConfig()

    expect(config.enableDeleteSync).toBe(true)
  })
})
