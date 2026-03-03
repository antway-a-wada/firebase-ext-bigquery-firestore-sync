/**
 * Tests for firestore module
 */

import {ExtensionConfig} from '../config'
import {
  getLastSyncTimestamp,
  updateSyncState,
  writeDocumentsBatch,
  getAllDocumentIds,
  deleteDocumentsBatch,
} from '../firestore'
import {FirestoreDocument} from '../types'

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const mockDoc = jest.fn()
  const mockCollection = jest.fn()
  const mockBatch = jest.fn()
  const mockSelect = jest.fn()

  return {
    firestore: jest.fn(() => ({
      collection: mockCollection,
      batch: mockBatch,
    })),
    __mockCollection: mockCollection,
    __mockDoc: mockDoc,
    __mockBatch: mockBatch,
    __mockSelect: mockSelect,
  }
})

const mockConfig: ExtensionConfig = {
  bigqueryProjectId: 'test-project',
  bigqueryDataset: 'test_dataset',
  bigqueryTable: 'test_table',
  firestoreCollectionPath: 'test_collection',
  primaryKeyColumn: 'id',
  timestampColumn: 'updated_at',
  enableDeleteSync: false,
  batchSize: 3,
  fieldMapping: {},
  excludeFields: [],
}

describe('getLastSyncTimestamp', () => {
  it('should return null if no previous sync state exists', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      exists: false,
    })
    const mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
    })
    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    })
    const mockDb = {
      collection: mockCollection,
    } as any

    const result = await getLastSyncTimestamp(mockDb, mockConfig)

    expect(result).toBeNull()
  })

  it('should return the last sync timestamp', async () => {
    const lastSync = new Date('2024-01-01T00:00:00Z')
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        lastSyncTimestamp: lastSync,
      }),
    })
    const mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
    })
    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    })
    const mockDb = {
      collection: mockCollection,
    } as any

    const result = await getLastSyncTimestamp(mockDb, mockConfig)

    expect(result).toEqual(lastSync)
  })
})

describe('updateSyncState', () => {
  it('should update sync state successfully', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined)
    const mockDoc = jest.fn().mockReturnValue({
      set: mockSet,
    })
    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    })
    const mockDb = {
      collection: mockCollection,
    } as any

    const timestamp = new Date('2024-01-01T00:00:00Z')
    await updateSyncState(mockDb, mockConfig, timestamp, 100)

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        lastSyncTimestamp: timestamp,
        totalDocumentsSynced: 100,
      }),
      {merge: true}
    )
  })

  it('should include error in sync state if provided', async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined)
    const mockDoc = jest.fn().mockReturnValue({
      set: mockSet,
    })
    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    })
    const mockDb = {
      collection: mockCollection,
    } as any

    const timestamp = new Date('2024-01-01T00:00:00Z')
    await updateSyncState(mockDb, mockConfig, timestamp, 0, 'Test error')

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        lastError: 'Test error',
      }),
      {merge: true}
    )
  })
})

describe('writeDocumentsBatch', () => {
  it('should write documents in batches', async () => {
    const mockCommit = jest.fn().mockResolvedValue(undefined)
    const mockSet = jest.fn()
    const mockBatch = {
      set: mockSet,
      commit: mockCommit,
    }
    const mockGet = jest.fn().mockResolvedValue({exists: false})
    const mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
    })
    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    })
    const mockDb = {
      collection: mockCollection,
      batch: jest.fn().mockReturnValue(mockBatch),
    } as any

    const documents: FirestoreDocument[] = [
      {id: '1', data: {name: 'User 1'}},
      {id: '2', data: {name: 'User 2'}},
      {id: '3', data: {name: 'User 3'}},
      {id: '4', data: {name: 'User 4'}},
      {id: '5', data: {name: 'User 5'}},
    ]

    const result = await writeDocumentsBatch(mockDb, mockConfig, documents)

    expect(result.created).toBe(5)
    expect(result.updated).toBe(0)
    expect(result.errors).toBe(0)
    expect(mockCommit).toHaveBeenCalledTimes(2) // 2 batches (3 + 2)
  })

  it('should track created vs updated documents', async () => {
    const mockCommit = jest.fn().mockResolvedValue(undefined)
    const mockSet = jest.fn()
    const mockBatch = {
      set: mockSet,
      commit: mockCommit,
    }
    const mockGet = jest
      .fn()
      .mockResolvedValueOnce({exists: true})
      .mockResolvedValueOnce({exists: false})
    const mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
    })
    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    })
    const mockDb = {
      collection: mockCollection,
      batch: jest.fn().mockReturnValue(mockBatch),
    } as any

    const documents: FirestoreDocument[] = [
      {id: '1', data: {name: 'User 1'}},
      {id: '2', data: {name: 'User 2'}},
    ]

    const result = await writeDocumentsBatch(mockDb, mockConfig, documents)

    expect(result.created).toBe(1)
    expect(result.updated).toBe(1)
  })
})

describe('getAllDocumentIds', () => {
  it('should return all document IDs from Firestore', async () => {
    const mockDocs = [{id: '1'}, {id: '2'}, {id: '3'}]
    const mockGet = jest.fn().mockResolvedValue({
      docs: mockDocs,
    })
    const mockSelect = jest.fn().mockReturnValue({
      get: mockGet,
    })
    const mockCollection = jest.fn().mockReturnValue({
      select: mockSelect,
    })
    const mockDb = {
      collection: mockCollection,
    } as any

    const result = await getAllDocumentIds(mockDb, mockConfig)

    expect(result.size).toBe(3)
    expect(result.has('1')).toBe(true)
    expect(result.has('2')).toBe(true)
    expect(result.has('3')).toBe(true)
  })
})

describe('deleteDocumentsBatch', () => {
  it('should delete documents in batches', async () => {
    const mockCommit = jest.fn().mockResolvedValue(undefined)
    const mockDelete = jest.fn()
    const mockBatch = {
      delete: mockDelete,
      commit: mockCommit,
    }
    const mockDoc = jest.fn()
    const mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
    })
    const mockDb = {
      collection: mockCollection,
      batch: jest.fn().mockReturnValue(mockBatch),
    } as any

    const documentIds = ['1', '2', '3', '4', '5']

    const result = await deleteDocumentsBatch(mockDb, mockConfig, documentIds)

    expect(result).toBe(5)
    expect(mockCommit).toHaveBeenCalledTimes(2) // 2 batches (3 + 2)
  })
})
