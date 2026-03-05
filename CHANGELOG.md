# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-20

### Added
- **Differential Update Mode**: New `ENABLE_DIFF_CHECK` parameter to compare existing Firestore documents with new data
  - Only writes documents that have actual data changes
  - Reduces Firestore write costs by up to 90% for low-change-rate tables
  - Adds `documentsSkipped` to sync statistics
  - Most cost-effective when change rate is < 30%
- **Full Sync Mode**: Support for tables without timestamp columns
  - `TIMESTAMP_COLUMN` is now optional
  - When not provided, all records are synced on every run
- Cost comparison table in README with monthly cost estimates
- New helper functions:
  - `getExistingDocuments()`: Efficiently fetches existing documents for comparison
  - `hasDocumentChanged()`: Deep comparison of document data
  - `sortObjectKeys()`: Ensures consistent JSON comparison

### Changed
- `TIMESTAMP_COLUMN` parameter is now optional (was required)
- `ExtensionConfig` interface now includes `enableDiffCheck: boolean`
- `SyncStats` interface now includes `documentsSkipped: number`
- Updated all mock configs in tests to include `enableDiffCheck` field
- Enhanced logging to include diff check status and skipped document counts

### Performance
- **Write Cost Reduction**: ~70-90% reduction in Firestore writes when change rate is < 30%
- **Read Cost Increase**: Adds Firestore read operations for existing documents (when diff check is enabled)
- **Trade-off**: Best for scenarios where read:write cost ratio favors reducing writes

## [0.1.2] - 2026-02-20

### Changed
- Updated Firebase Functions to v7 API (`onSchedule` from v2/scheduler)
- Updated all dependencies to latest versions
- Migrated to ESLint v9 flat config
- Migrated to ES Modules

### Fixed
- Fixed primary key handling in `transformRow()`
- Fixed test expectations to match actual data types

### Added
- Comprehensive test coverage (37 tests)
- Linting and formatting configuration

## [0.1.1] - 2026-02-20

### Changed
- Updated dependencies to latest versions
- Added linting and formatting tools

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
