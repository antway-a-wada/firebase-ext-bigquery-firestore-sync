# BigQuery to Firestore Sync

**Author**: Tsukurioki (**[tsukurioki.jp](https://tsukurioki.jp)**)

**Description**: Syncs data from BigQuery tables to Firestore collections with incremental updates.

---

## 🧩 Install this extension

### Console

[![Install this extension in your Firebase project](https://www.gstatic.com/mobilesdk/210513_mobilesdk/install-extension.png "Install this extension in your Firebase project")](https://console.firebase.google.com/project/_/extensions/install?ref=tsukurioki/bigquery-firestore-sync)

### Firebase CLI

```bash
firebase ext:install tsukurioki/bigquery-firestore-sync --project=projectId-here
```

---

## 📝 Overview

Use this extension to automatically sync data from BigQuery tables to Firestore collections. The extension performs incremental synchronization based on a timestamp column, ensuring efficient data updates without processing unchanged records.

### Key Features

- **Incremental Sync**: Only syncs records that have changed since the last sync
- **Scheduled Updates**: Configurable sync frequency using Cron expressions
- **Delete Synchronization**: Optional feature to remove Firestore documents when corresponding BigQuery records are deleted
- **Field Mapping**: Customize field names between BigQuery and Firestore
- **Batch Processing**: Efficiently handles large datasets with configurable batch sizes
- **Type Conversion**: Automatically converts BigQuery data types to Firestore-compatible types

### How it works

1. On schedule, the extension queries BigQuery for records updated since the last sync
2. Retrieved records are transformed and validated
3. Data is written to Firestore in batches (up to 500 documents per batch)
4. The last sync timestamp is stored for the next run
5. Optionally, deleted records in BigQuery are removed from Firestore

### Use Cases

- **Data Warehouse to Application Database**: Sync processed data from your data warehouse to your application's Firestore database
- **Analytics to Production**: Push aggregated analytics data to Firestore for real-time access
- **Multi-source Integration**: Combine data from multiple sources in BigQuery and sync to Firestore
- **Reporting Dashboards**: Keep Firestore updated with the latest reporting data from BigQuery

---

## 🧩 Configuration Parameters

During installation, you'll configure the following parameters:

### Required Parameters

- **BigQuery Dataset**: The dataset containing your source table
- **BigQuery Table**: The table name to sync from
- **Firestore Collection Path**: The destination Firestore collection
- **Primary Key Column**: The BigQuery column to use as Firestore document ID
- **Timestamp Column**: The column tracking when records were last updated
- **Sync Schedule**: How often to run the sync (Cron format)

### Optional Parameters

- **BigQuery Project ID**: Use a different GCP project for BigQuery (defaults to Firebase project)
- **Enable Delete Sync**: Automatically delete Firestore documents when BigQuery records are removed
- **Delete Sync Schedule**: How often to check for deletions (if enabled)
- **Batch Size**: Number of documents per batch (1-500, default: 500)
- **Field Mapping**: JSON object mapping BigQuery columns to Firestore fields
- **Exclude Fields**: Comma-separated list of columns to exclude from sync

---

## 🔑 Prerequisites

Before installing this extension, you'll need to:

1. **Set up a Firebase project**: If you don't already have one, create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)

2. **Enable Cloud Firestore**: Go to the Firestore section and create a database

3. **Enable Billing**: This extension requires the Blaze (pay-as-you-go) plan

4. **Create BigQuery Table**: Ensure your BigQuery table exists and has:
   - A unique identifier column (for document IDs)
   - A timestamp column (for incremental sync)

5. **Grant Permissions**: The extension will automatically request necessary permissions, but ensure your Firebase project has access to read from the BigQuery project

---

## 💰 Billing

This extension uses the following Firebase and Google Cloud Platform services, which may have associated charges:

- **Cloud Functions**: Scheduled function execution ([pricing](https://firebase.google.com/pricing))
- **Cloud Firestore**: Document writes and storage ([pricing](https://firebase.google.com/docs/firestore/quotas))
- **BigQuery**: Query execution and data scanned ([pricing](https://cloud.google.com/bigquery/pricing))

You are responsible for any costs associated with your use of these services.

### Cost Optimization Tips

- Use the timestamp column effectively to minimize data scanned in BigQuery
- Adjust sync frequency based on your needs (less frequent = lower costs)
- Use `EXCLUDE_FIELDS` to avoid syncing unnecessary data
- Consider partitioning your BigQuery table by the timestamp column
- Disable delete sync if not needed to avoid full table scans

---

## 📊 Monitoring

After installation, you can monitor the extension's activity:

1. **Cloud Functions Logs**: View logs in the Firebase Console under Functions
2. **Extension Metrics**: Check the Extensions dashboard for execution history
3. **Firestore Activity**: Monitor document writes in the Firestore console
4. **BigQuery Query History**: Review query execution in BigQuery console

### Key Metrics to Watch

- Sync execution time
- Number of documents synced per run
- BigQuery bytes scanned
- Firestore write operations
- Error rates and types

---

## 🔧 Advanced Usage

### Field Mapping Example

If your BigQuery columns use snake_case but you prefer camelCase in Firestore:

```json
{
  "user_id": "userId",
  "created_at": "createdAt",
  "updated_at": "updatedAt",
  "first_name": "firstName",
  "last_name": "lastName"
}
```

### Nested Collections

You can sync to subcollections using wildcards:

```
users/{userId}/orders
```

The extension will create separate documents for each unique `userId` value.

### Cron Schedule Examples

- Every hour: `0 * * * *`
- Every 6 hours: `0 */6 * * *`
- Daily at midnight UTC: `0 0 * * *`
- Weekdays at 9 AM UTC: `0 9 * * 1-5`

---

## ⚠️ Important Considerations

### Data Consistency

- The extension provides eventual consistency, not real-time sync
- There may be a delay between BigQuery updates and Firestore reflection
- Concurrent BigQuery updates during sync may result in race conditions

### Performance

- For very large datasets (millions of records), initial sync may take time
- Consider running a manual initial sync during off-peak hours
- Monitor BigQuery slot usage if you have many concurrent queries

### Limitations

- Maximum batch size is 500 documents (Firestore limit)
- Function timeout is 9 minutes (540 seconds)
- Very large sync operations may need to be split across multiple runs
- Firestore document size limit is 1 MB

---

## 🐛 Troubleshooting

### Common Issues

**Sync not running**
- Check Cloud Functions logs for errors
- Verify the Cron schedule is correct
- Ensure the function is deployed

**Permission errors**
- Verify BigQuery dataset permissions
- Check Firestore security rules
- Ensure service account has necessary roles

**Timeout errors**
- Reduce batch size
- Increase sync frequency to process smaller chunks
- Consider partitioning your BigQuery table

**Data type errors**
- Review field mapping configuration
- Check for incompatible BigQuery types (e.g., GEOGRAPHY)
- Use EXCLUDE_FIELDS for problematic columns

---

## 📚 Further Reading

- [Firebase Extensions Documentation](https://firebase.google.com/docs/extensions)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Functions Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)

---

## License

Apache-2.0

---

## Support

If you encounter any issues or have questions:

1. Check the [GitHub repository](https://github.com/tsukurioki/firebase-ext-bigquery-firestore-sync) for known issues
2. Review Cloud Functions logs for error details
3. Open an issue on GitHub with reproduction steps

---

Made with ❤️ by Tsukurioki
