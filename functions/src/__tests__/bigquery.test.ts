/**
 * Tests for bigquery module
 */

import {queryUpdatedRecords, queryAllDocumentIds, getMaxTimestamp} from '../bigquery';
import {ExtensionConfig} from '../config';

// Mock BigQuery
jest.mock('@google-cloud/bigquery');

const mockConfig: ExtensionConfig = {
  bigqueryProjectId: 'test-project',
  bigqueryDataset: 'test_dataset',
  bigqueryTable: 'test_table',
  firestoreCollectionPath: 'test_collection',
  primaryKeyColumn: 'id',
  timestampColumn: 'updated_at',
  enableDeleteSync: false,
  batchSize: 500,
  fieldMapping: {},
  excludeFields: [],
};

describe('queryUpdatedRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query records without timestamp filter on initial sync', async () => {
    const {BigQuery} = require('@google-cloud/bigquery');
    const mockGetQueryResults = jest.fn().mockResolvedValue([
      [
        {id: '1', name: 'User 1', updated_at: '2024-01-01T00:00:00Z'},
        {id: '2', name: 'User 2', updated_at: '2024-01-02T00:00:00Z'},
      ],
    ]);
    const mockGetMetadata = jest.fn().mockResolvedValue([
      {statistics: {query: {totalBytesProcessed: '1024'}}},
    ]);
    const mockJob = {
      id: 'job123',
      getQueryResults: mockGetQueryResults,
      getMetadata: mockGetMetadata,
    };
    const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob]);

    BigQuery.mockImplementation(() => ({
      createQueryJob: mockCreateQueryJob,
    }));

    const result = await queryUpdatedRecords(mockConfig, null);

    expect(result).toHaveLength(2);
    expect(mockCreateQueryJob).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.not.stringContaining('WHERE'),
      })
    );
  });

  it('should query records with timestamp filter', async () => {
    const {BigQuery} = require('@google-cloud/bigquery');
    const sinceTimestamp = new Date('2024-01-01T00:00:00Z');
    
    const mockGetQueryResults = jest.fn().mockResolvedValue([
      [
        {id: '2', name: 'User 2', updated_at: '2024-01-02T00:00:00Z'},
      ],
    ]);
    const mockGetMetadata = jest.fn().mockResolvedValue([
      {statistics: {query: {totalBytesProcessed: '512'}}},
    ]);
    const mockJob = {
      id: 'job123',
      getQueryResults: mockGetQueryResults,
      getMetadata: mockGetMetadata,
    };
    const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob]);

    BigQuery.mockImplementation(() => ({
      createQueryJob: mockCreateQueryJob,
    }));

    const result = await queryUpdatedRecords(mockConfig, sinceTimestamp);

    expect(result).toHaveLength(1);
    expect(mockCreateQueryJob).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.stringContaining('WHERE'),
      })
    );
  });
});

describe('queryAllDocumentIds', () => {
  it('should return all document IDs', async () => {
    const {BigQuery} = require('@google-cloud/bigquery');
    
    const mockGetQueryResults = jest.fn().mockResolvedValue([
      [
        {id: '1'},
        {id: '2'},
        {id: '3'},
      ],
    ]);
    const mockJob = {
      getQueryResults: mockGetQueryResults,
    };
    const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob]);

    BigQuery.mockImplementation(() => ({
      createQueryJob: mockCreateQueryJob,
    }));

    const result = await queryAllDocumentIds(mockConfig);

    expect(result.size).toBe(3);
    expect(result.has('1')).toBe(true);
    expect(result.has('2')).toBe(true);
    expect(result.has('3')).toBe(true);
  });

  it('should handle empty result', async () => {
    const {BigQuery} = require('@google-cloud/bigquery');
    
    const mockGetQueryResults = jest.fn().mockResolvedValue([[]]);
    const mockJob = {
      getQueryResults: mockGetQueryResults,
    };
    const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob]);

    BigQuery.mockImplementation(() => ({
      createQueryJob: mockCreateQueryJob,
    }));

    const result = await queryAllDocumentIds(mockConfig);

    expect(result.size).toBe(0);
  });
});

describe('getMaxTimestamp', () => {
  it('should return the maximum timestamp', async () => {
    const {BigQuery} = require('@google-cloud/bigquery');
    
    const mockGetQueryResults = jest.fn().mockResolvedValue([
      [
        {max_timestamp: {value: '2024-01-15T12:00:00.000Z'}},
      ],
    ]);
    const mockJob = {
      getQueryResults: mockGetQueryResults,
    };
    const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob]);

    BigQuery.mockImplementation(() => ({
      createQueryJob: mockCreateQueryJob,
    }));

    const result = await getMaxTimestamp(mockConfig);

    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe('2024-01-15T12:00:00.000Z');
  });

  it('should return null if no records exist', async () => {
    const {BigQuery} = require('@google-cloud/bigquery');
    
    const mockGetQueryResults = jest.fn().mockResolvedValue([[]]);
    const mockJob = {
      getQueryResults: mockGetQueryResults,
    };
    const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob]);

    BigQuery.mockImplementation(() => ({
      createQueryJob: mockCreateQueryJob,
    }));

    const result = await getMaxTimestamp(mockConfig);

    expect(result).toBeNull();
  });
});
