# 🎉 Installation Complete!

The BigQuery to Firestore Sync extension has been successfully installed in your Firebase project.

## ✅ What Was Installed

The extension created the following resources:

1. **Cloud Function**: `ext-bigquery-firestore-sync-syncBigQueryToFirestore`
   - Scheduled to run based on your configured Cron expression
   - Syncs data from BigQuery to Firestore incrementally

2. **Service Account**: With permissions to:
   - Read data from your BigQuery table
   - Write data to your Firestore collection

## 🔍 Monitoring Your Extension

### View Logs

Check the execution logs in the Firebase Console:

```
Firebase Console > Functions > ext-bigquery-firestore-sync-syncBigQueryToFirestore
```

You can also view logs using the Firebase CLI:

```bash
firebase functions:log --only ext-bigquery-firestore-sync-syncBigQueryToFirestore
```

### Check Sync Status

Monitor the extension's activity:

1. **Cloud Functions Dashboard**: View execution count, errors, and duration
2. **Firestore Console**: Watch for new/updated documents in your collection
3. **BigQuery Console**: Review query history and bytes scanned

## 📊 Your Configuration

The extension is configured with the following parameters:

- **BigQuery Table**: `${param:BIGQUERY_PROJECT_ID}.${param:BIGQUERY_DATASET}.${param:BIGQUERY_TABLE}`
- **Firestore Collection**: `${param:FIRESTORE_COLLECTION_PATH}`
- **Primary Key**: `${param:PRIMARY_KEY_COLUMN}`
- **Timestamp Column**: `${param:TIMESTAMP_COLUMN}`
- **Sync Schedule**: `${param:SYNC_SCHEDULE}`
- **Delete Sync**: `${param:ENABLE_DELETE_SYNC}`
- **Batch Size**: `${param:BATCH_SIZE}`

## 🚀 Next Steps

### 1. Wait for First Sync

The function will automatically run based on your configured schedule. The first sync will process all existing records in your BigQuery table.

**Note**: For large tables, the initial sync may take several minutes or require multiple executions.

### 2. Verify Data in Firestore

After the first scheduled run, check your Firestore collection:

```
Firebase Console > Firestore > ${param:FIRESTORE_COLLECTION_PATH}
```

You should see documents with IDs matching your BigQuery primary key values.

### 3. Set Up Firestore Security Rules

⚠️ **Important**: Update your Firestore security rules to control access to the synced data.

Example rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Replace 'your_collection' with your actual collection path
    match /${param:FIRESTORE_COLLECTION_PATH}/{docId} {
      // Read access for authenticated users
      allow read: if request.auth != null;
      
      // Write access only for the extension (not for client apps)
      allow write: if false;
    }
  }
}
```

Apply rules using:

```bash
firebase deploy --only firestore:rules
```

### 4. Monitor Costs

Keep an eye on your billing:

- **BigQuery**: Check bytes scanned per query
- **Firestore**: Monitor write operations
- **Cloud Functions**: Track execution time and invocations

## 🔧 Reconfiguration

To change extension parameters:

```bash
firebase ext:configure bigquery-firestore-sync
```

Or update through the Firebase Console:

```
Extensions > bigquery-firestore-sync > Configuration
```

## 🐛 Troubleshooting

### No Data Appearing in Firestore

1. **Check function logs** for errors:
   ```bash
   firebase functions:log --only ext-bigquery-firestore-sync-syncBigQueryToFirestore
   ```

2. **Verify BigQuery permissions**: Ensure the service account can read your table

3. **Check the timestamp column**: Make sure it has recent values (within your sync window)

4. **Wait for schedule**: The function only runs at scheduled times

### Permission Errors

If you see permission errors:

1. Verify the BigQuery table exists and is accessible
2. Check that the service account has the correct IAM roles
3. Ensure Firestore is initialized in your project

### Timeout Errors

If the function times out:

1. Reduce `BATCH_SIZE` to process fewer documents per batch
2. Increase sync frequency to handle smaller chunks
3. Consider partitioning your BigQuery table

### Data Type Issues

If certain fields fail to sync:

1. Use `EXCLUDE_FIELDS` to skip problematic columns
2. Check `FIELD_MAPPING` configuration
3. Review BigQuery column types for compatibility

## 📚 Additional Resources

- [Extension README](README.md)
- [Firebase Extensions Documentation](https://firebase.google.com/docs/extensions)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

## 💡 Tips for Success

1. **Start Small**: Test with a subset of data first using a WHERE clause in BigQuery views
2. **Monitor Closely**: Watch the first few sync runs to ensure everything works as expected
3. **Optimize Queries**: Use partitioned and clustered BigQuery tables for better performance
4. **Index Firestore**: Add appropriate indexes for your query patterns
5. **Document Schema**: Keep track of field mappings and transformations

## 🆘 Need Help?

If you encounter issues:

1. Check the [README](README.md) for detailed documentation
2. Review Cloud Functions logs for error messages
3. Visit the [GitHub repository](https://github.com/tsukurioki/firebase-ext-bigquery-firestore-sync) for known issues
4. Open an issue with your logs and configuration (redact sensitive data)

---

Thank you for using BigQuery to Firestore Sync! 🙏

Made with ❤️ by Tsukurioki
