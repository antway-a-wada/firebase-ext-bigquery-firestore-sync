# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-02-20

### Changed
- **Major Dependency Updates**:
  - Upgraded `firebase-admin` from 12.0.0 to 13.6.1
  - Upgraded `firebase-functions` from 5.0.0 to 7.0.5
  - Upgraded `@google-cloud/bigquery` from 7.3.0 to 8.1.1
  - Upgraded `@typescript-eslint/*` from 6.x to 8.18.2
  - Upgraded `eslint` from 8.56.0 to 9.18.0
  - Upgraded `@types/node` from 20.11.0 to 22.10.2
  - Upgraded `typescript` from 5.3.0 to 5.7.2
  - Upgraded `prettier` from 3.2.0 to 3.4.2
  - Upgraded various other dev dependencies to latest versions

### Added
- `UPGRADE_NOTES.md` documenting migration guide and breaking changes
- Enhanced linting and formatting configuration
- Comprehensive development setup documentation

### Fixed
- Improved type safety with latest TypeScript ESLint rules
- Better error handling with updated Firebase SDK
- Performance improvements from BigQuery v8

### Security
- Updated all dependencies to address security vulnerabilities
- Enhanced validation in Firebase Admin SDK 13.x

## [0.1.0] - 2026-02-20

### Added
- Initial release of BigQuery to Firestore Sync extension
- Incremental sync based on timestamp column
- Scheduled synchronization using Cloud Scheduler
- Configurable sync frequency via Cron expressions
- Optional delete synchronization to remove stale Firestore documents
- Field mapping support to rename columns between BigQuery and Firestore
- Exclude fields feature to skip specific columns
- Batch processing for efficient large dataset handling
- Automatic data type conversion (BigQuery → Firestore)
- Sync state tracking in Firestore
- Comprehensive logging and error handling
- Support for wildcards in collection paths
- Configurable batch size (1-500 documents)
- Cross-project BigQuery support

### Features
- **Incremental Sync**: Only processes records changed since last sync
- **Type Conversion**: Automatic conversion of BigQuery types to Firestore-compatible types
  - TIMESTAMP → Firestore Timestamp
  - DATE → Firestore Timestamp
  - DATETIME → Firestore Timestamp
  - INT64 → Number
  - FLOAT64 → Number
  - BOOL → Boolean
  - STRING → String
  - ARRAY → Array
  - STRUCT/RECORD → Object
- **Delete Sync**: Optional feature to remove Firestore documents when BigQuery records are deleted
- **Field Mapping**: Customize field names between BigQuery and Firestore
- **Field Exclusion**: Skip specific columns during sync
- **Batch Processing**: Handles up to 500 documents per batch
- **Error Handling**: Graceful error handling with detailed logging
- **Sync State**: Tracks last sync timestamp and statistics

### Configuration Parameters
- `LOCATION`: Cloud Functions deployment location
- `BIGQUERY_PROJECT_ID`: Source BigQuery project
- `BIGQUERY_DATASET`: Source dataset name
- `BIGQUERY_TABLE`: Source table name
- `FIRESTORE_COLLECTION_PATH`: Destination Firestore collection
- `PRIMARY_KEY_COLUMN`: Column to use as document ID
- `TIMESTAMP_COLUMN`: Column for incremental sync
- `SYNC_SCHEDULE`: Cron expression for sync frequency
- `ENABLE_DELETE_SYNC`: Enable/disable delete synchronization
- `DELETE_SYNC_SCHEDULE`: Cron expression for delete sync
- `BATCH_SIZE`: Number of documents per batch (1-500)
- `FIELD_MAPPING`: JSON object for field name mapping
- `EXCLUDE_FIELDS`: Comma-separated list of fields to exclude

### Documentation
- Comprehensive README with usage examples
- PREINSTALL guide with prerequisites and planning
- POSTINSTALL guide with next steps and troubleshooting
- Inline code documentation

### Dependencies
- firebase-admin: ^12.0.0
- firebase-functions: ^5.0.0
- @google-cloud/bigquery: ^7.3.0

### Known Limitations
- Maximum 500 documents per batch (Firestore limitation)
- Function timeout: 9 minutes (540 seconds)
- Firestore document size limit: 1 MB
- Very large sync operations may require multiple runs

## [Unreleased]

### Planned Features
- Support for nested/repeated BigQuery fields
- Custom transformation functions
- Dry-run mode for testing
- Metrics export to Cloud Monitoring
- Support for multiple BigQuery tables
- Incremental backfill for large initial syncs
- Resume capability for interrupted syncs
