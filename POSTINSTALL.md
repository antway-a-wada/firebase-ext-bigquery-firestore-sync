# Installation Complete! 🎉

Your **BigQuery to Firestore Sync** extension has been successfully installed.

## What's Next?

### 1. Verify the Installation

Check that the Cloud Function was deployed successfully:

```bash
firebase functions:list
```

You should see `ext-bigquery-firestore-sync-syncBigQueryToFirestore` in the list.

### 2. Monitor the First Sync

The extension will run according to your configured schedule. To monitor execution:

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Functions** → **Logs**
3. Look for logs from `syncBigQueryToFirestore`

**Expected log messages:**
- `BigQueryからFirestoreへの同期を開始します` (Sync started)
- `設定を読み込みました` (Configuration loaded)
- `BigQueryから行を取得しました` (Rows retrieved)
- `同期が完了しました` (Sync completed)

### 3. Verify Data in Firestore

Check your Firestore collection to confirm data was synced:

1. Open the [Firestore Console](https://console.firebase.google.com/project/_/firestore)
2. Navigate to your configured collection path
3. Verify that documents appear with correct data

### 4. Understanding Sync Behavior

**Incremental Sync:**
- Only processes records updated since the last sync
- Tracks sync state in the `_ext_bigquery_sync_state` collection
- Efficient for large datasets with infrequent changes

**Delete Sync (if enabled):**
- Periodically checks for records deleted in BigQuery
- Removes corresponding Firestore documents
- Runs on a separate schedule (typically less frequent)

## Configuration

Your current configuration:

| Parameter | Value |
|-----------|-------|
| BigQuery Dataset | `${param:BIGQUERY_DATASET}` |
| BigQuery Table | `${param:BIGQUERY_TABLE}` |
| Firestore Collection | `${param:FIRESTORE_COLLECTION_PATH}` |
| Primary Key Column | `${param:PRIMARY_KEY_COLUMN}` |
| Timestamp Column | `${param:TIMESTAMP_COLUMN}` |
| Sync Schedule | `${param:SYNC_SCHEDULE}` |
| Delete Sync | `${param:ENABLE_DELETE_SYNC}` |
| Batch Size | `${param:BATCH_SIZE}` |

### Updating Configuration

To modify extension parameters:

```bash
firebase ext:configure ${param:EXT_INSTANCE_ID}
```

Or reconfigure from the Firebase Console:
1. Go to **Extensions**
2. Click on **BigQuery to Firestore Sync**
3. Click **Manage** → **Reconfigure**

## Monitoring and Optimization

### Key Metrics to Watch

1. **Execution Time**: Check function execution duration in logs
2. **Documents Synced**: Monitor the number of documents per sync
3. **BigQuery Costs**: Review BigQuery query history and bytes scanned
4. **Error Rate**: Watch for any sync failures in logs

### Cost Optimization Tips

- **Partition your BigQuery table** by the timestamp column
- **Adjust sync frequency** based on your data update patterns
- **Use field mapping and exclusions** to sync only necessary data
- **Disable delete sync** if you don't need to remove Firestore documents

### Performance Tuning

If syncs are timing out or taking too long:

1. **Reduce batch size**: Try 250 or 100 instead of 500
2. **Increase sync frequency**: Sync more often to process smaller chunks
3. **Optimize BigQuery table**: Add indexes on timestamp and primary key columns
4. **Exclude large fields**: Use `EXCLUDE_FIELDS` for columns you don't need

## Troubleshooting

### Common Issues

**❌ "Permission denied" errors**
- Verify the service account has BigQuery Data Viewer role
- Check Firestore security rules allow writes from the extension

**❌ "Function timeout" errors**
- Reduce `BATCH_SIZE` parameter
- Increase sync frequency to process less data per run
- Consider partitioning your BigQuery table

**❌ "No records synced"**
- Verify your BigQuery table has data
- Check that the timestamp column contains valid timestamps
- Ensure the primary key column has unique values

**❌ "Invalid document ID" errors**
- Primary key values must be valid Firestore document IDs
- IDs cannot contain forward slashes or be empty
- Consider using field mapping to transform IDs

### Getting Help

If you encounter issues:

1. **Check the logs** in Firebase Console → Functions → Logs
2. **Review the documentation** in the [GitHub repository](https://github.com/antway-a-wada/firebase-ext-bigquery-firestore-sync)
3. **Open an issue** on GitHub with:
   - Error messages from logs
   - Your configuration (remove sensitive data)
   - Steps to reproduce the issue

## Advanced Usage

### Field Mapping

Transform BigQuery column names to Firestore field names:

```json
{
  "user_id": "userId",
  "first_name": "firstName",
  "last_name": "lastName",
  "created_at": "createdAt"
}
```

Update via:
```bash
firebase ext:configure ${param:EXT_INSTANCE_ID} --params FIELD_MAPPING='{"user_id":"userId"}'
```

### Subcollections

Sync to nested collections using wildcards in the collection path:

```
users/{userId}/orders
```

The extension will create documents under each unique `userId`.

### Manual Trigger (for testing)

To manually trigger a sync for testing:

```bash
firebase functions:shell
> syncBigQueryToFirestore()
```

## Resources

- [Extension Documentation](https://github.com/antway-a-wada/firebase-ext-bigquery-firestore-sync)
- [Firebase Extensions](https://firebase.google.com/products/extensions)
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

---

**Need help?** Check the logs first, then visit our [GitHub repository](https://github.com/antway-a-wada/firebase-ext-bigquery-firestore-sync) for support.

Happy syncing! 🚀
