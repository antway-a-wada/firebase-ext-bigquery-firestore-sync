# BigQuery to Firestore Sync - Installation Guide

Use this extension to automatically sync data from BigQuery tables to Firestore collections with incremental updates.

## Before Installation

### 1. Prerequisites

Before installing this extension, make sure you have:

✅ **Firebase Project**: A Firebase project with the Blaze (pay-as-you-go) plan enabled

✅ **Cloud Firestore**: Firestore database created in your project

✅ **BigQuery Table**: A BigQuery table with:
- A unique identifier column (for Firestore document IDs)
- A timestamp column (for tracking updates)
- Data you want to sync to Firestore

### 2. Required APIs

This extension automatically enables the following APIs:
- Cloud Firestore API
- BigQuery API
- Cloud Functions API

### 3. Required Permissions

The extension requires the following IAM roles:
- `datastore.user` - To write data to Firestore
- `bigquery.dataViewer` - To read data from BigQuery

These permissions are automatically granted to the extension's service account during installation.

## 🔧 Configuration Planning

Before starting the installation, gather the following information:

### BigQuery Configuration

1. **Project ID** (if different from Firebase project)
2. **Dataset name** - e.g., `my_dataset`
3. **Table name** - e.g., `users`
4. **Primary key column** - The column containing unique IDs (e.g., `id`, `user_id`)
5. **Timestamp column** - The column tracking when records were last updated (e.g., `updated_at`, `modified_time`)

### Firestore Configuration

1. **Collection path** - Where to store the synced data (e.g., `users`, `products/active/items`)
2. **Field mapping** (optional) - If you want to rename fields between BigQuery and Firestore

### Sync Configuration

1. **Sync frequency** - How often to sync data (Cron format)
   - Hourly: `0 * * * *`
   - Every 6 hours: `0 */6 * * *`
   - Daily at midnight: `0 0 * * *`

2. **Delete synchronization** - Whether to delete Firestore documents when BigQuery records are removed
   - ⚠️ Enabling this requires periodic full table scans and will increase costs

3. **Batch size** - Number of documents to process at once (1-500, default: 500)

## 💰 Billing Considerations

This extension uses billable Google Cloud services:

### Expected Costs

- **Cloud Functions**: ~$0.40 per million invocations
- **Firestore**: ~$0.18 per 100K writes
- **BigQuery**: ~$5 per TB of data scanned

### Cost Example

For a table with 100,000 rows syncing hourly with 1% daily change rate:

- BigQuery: ~0.1 GB scanned per hour × 24 hours × 30 days × $5/TB = **~$0.36/month**
- Firestore: 1,000 changes × 24 hours × 30 days × $0.18/100K = **~$1.30/month**
- Cloud Functions: 720 executions × $0.40/million = **~$0.00/month**

**Estimated Total: ~$2/month**

### Cost Optimization

- Use a timestamp column to enable incremental sync (only changed records)
- Adjust sync frequency based on your needs
- Consider partitioning BigQuery tables by date
- Use `EXCLUDE_FIELDS` to skip unnecessary columns
- Disable delete sync if not needed

## 🎯 Use Cases

This extension is ideal for:

- **Data Warehouse → App Database**: Sync processed data from BigQuery to Firestore for application use
- **Analytics → Production**: Push aggregated metrics to Firestore for dashboard access
- **Multi-source Integration**: Combine data from various sources in BigQuery, then sync to Firestore
- **Reporting**: Keep Firestore updated with the latest analytics data

## ⚠️ Important Notes

### Performance Considerations

- Initial sync of large tables may take significant time
- Very large datasets (millions of records) should be synced less frequently
- Function timeout is 9 minutes - if sync can't complete, reduce batch size or increase frequency

### Data Consistency

- The extension provides **eventual consistency**, not real-time sync
- Changes in BigQuery may take time to reflect in Firestore (based on your sync schedule)
- Concurrent updates during sync may cause race conditions

### Limitations

- Maximum 500 documents per batch (Firestore limitation)
- Maximum 1 MB per Firestore document
- Nested/repeated BigQuery fields are converted to JSON-compatible formats

## 📋 Installation Checklist

Before proceeding, confirm:

- [ ] Blaze plan is enabled on your Firebase project
- [ ] BigQuery table exists and has required columns (primary key + timestamp)
- [ ] You have the necessary information (dataset name, table name, column names)
- [ ] You've decided on sync frequency and whether to enable delete sync
- [ ] You understand the billing implications
- [ ] Firestore security rules allow the extension to write data

## 🚀 Next Steps

Click "Install" to proceed with the extension configuration.

You'll be prompted to provide:
1. Cloud Functions deployment location
2. BigQuery configuration (project, dataset, table)
3. Firestore collection path
4. Column names (primary key, timestamp)
5. Sync schedule and options

After installation, you can monitor the extension in:
- Firebase Console > Extensions
- Cloud Functions > Logs
- Firestore Console

---

Need help? Check the [README](README.md) for detailed documentation.
