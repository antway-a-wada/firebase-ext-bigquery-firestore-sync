/**
 * Tests for transform module
 */

import {transformRow, transformRows, validateDocument} from '../transform';
import {ExtensionConfig} from '../config';
import {BigQueryRow} from '../types';

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

describe('transformRow', () => {
  it('should transform a simple row', () => {
    const row: BigQueryRow = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
    };

    const result = transformRow(row, mockConfig);

    expect(result).toEqual({
      id: '123',
      data: {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      },
    });
  });

  it('should apply field mapping', () => {
    const config: ExtensionConfig = {
      ...mockConfig,
      fieldMapping: {
        user_id: 'userId',
        created_at: 'createdAt',
      },
    };

    const row: BigQueryRow = {
      id: '123',
      user_id: 'user_456',
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = transformRow(row, config);

    expect(result?.data).toHaveProperty('userId', 'user_456');
    expect(result?.data).toHaveProperty('createdAt');
    expect(result?.data).not.toHaveProperty('user_id');
  });

  it('should exclude specified fields', () => {
    const config: ExtensionConfig = {
      ...mockConfig,
      excludeFields: ['internal_id', 'temp_field'],
    };

    const row: BigQueryRow = {
      id: '123',
      name: 'Test User',
      internal_id: 'internal_123',
      temp_field: 'temp_value',
    };

    const result = transformRow(row, config);

    expect(result?.data).toHaveProperty('name');
    expect(result?.data).not.toHaveProperty('internal_id');
    expect(result?.data).not.toHaveProperty('temp_field');
  });

  it('should convert BigQuery TIMESTAMP to Date', () => {
    const row: BigQueryRow = {
      id: '123',
      created_at: {value: '2024-01-01T12:00:00.000Z'},
    };

    const result = transformRow(row, mockConfig);

    expect(result?.data.created_at).toBeInstanceOf(Date);
    expect(result?.data.created_at.toISOString()).toBe('2024-01-01T12:00:00.000Z');
  });

  it('should convert BigQuery DATE string to Date', () => {
    const row: BigQueryRow = {
      id: '123',
      birth_date: '2024-01-01',
    };

    const result = transformRow(row, mockConfig);

    expect(result?.data.birth_date).toBeInstanceOf(Date);
  });

  it('should convert BigQuery INT64 string to number', () => {
    const row: BigQueryRow = {
      id: '123',
      count: '42',
      negative: '-10',
    };

    const result = transformRow(row, mockConfig);

    expect(result?.data.count).toBe(42);
    expect(result?.data.negative).toBe(-10);
  });

  it('should handle arrays', () => {
    const row: BigQueryRow = {
      id: '123',
      tags: ['tag1', 'tag2', 'tag3'],
    };

    const result = transformRow(row, mockConfig);

    expect(result?.data.tags).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('should handle nested objects (STRUCT)', () => {
    const row: BigQueryRow = {
      id: '123',
      address: {
        street: '123 Main St',
        city: 'Tokyo',
        postal_code: '100-0001',
      },
    };

    const result = transformRow(row, mockConfig);

    expect(result?.data.address).toEqual({
      street: '123 Main St',
      city: 'Tokyo',
      postal_code: '100-0001',
    });
  });

  it('should handle null values', () => {
    const row: BigQueryRow = {
      id: '123',
      name: 'Test User',
      email: null,
      phone: undefined,
    };

    const result = transformRow(row, mockConfig);

    expect(result?.data.email).toBeNull();
    expect(result?.data.phone).toBeNull();
  });

  it('should return null if primary key is missing', () => {
    const row: BigQueryRow = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const result = transformRow(row, mockConfig);

    expect(result).toBeNull();
  });
});

describe('transformRows', () => {
  it('should transform multiple rows', () => {
    const rows: BigQueryRow[] = [
      {id: '1', name: 'User 1'},
      {id: '2', name: 'User 2'},
      {id: '3', name: 'User 3'},
    ];

    const result = transformRows(rows, mockConfig);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('should filter out invalid rows', () => {
    const rows: BigQueryRow[] = [
      {id: '1', name: 'User 1'},
      {name: 'User without ID'},
      {id: '3', name: 'User 3'},
    ];

    const result = transformRows(rows, mockConfig);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });
});

describe('validateDocument', () => {
  it('should validate a valid document', () => {
    const doc = {
      id: '123',
      data: {name: 'Test User', email: 'test@example.com'},
    };

    expect(validateDocument(doc)).toBe(true);
  });

  it('should reject document with empty ID', () => {
    const doc = {
      id: '',
      data: {name: 'Test User'},
    };

    expect(validateDocument(doc)).toBe(false);
  });

  it('should reject document with ID containing slash', () => {
    const doc = {
      id: 'users/123',
      data: {name: 'Test User'},
    };

    expect(validateDocument(doc)).toBe(false);
  });

  it('should reject document that is too large', () => {
    const largeData: Record<string, string> = {};
    for (let i = 0; i < 100000; i++) {
      largeData[`field_${i}`] = 'x'.repeat(100);
    }

    const doc = {
      id: '123',
      data: largeData,
    };

    expect(validateDocument(doc)).toBe(false);
  });
});
