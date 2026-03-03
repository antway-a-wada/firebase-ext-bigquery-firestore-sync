# BigQuery to Firestore Sync

Use this extension to automatically sync data from BigQuery tables to Firestore collections with incremental updates.

## Before Installation

Before installing this extension, make sure you have:

### 1. **BigQuery Table Ready**
- A BigQuery table with data you want to sync
- A column to use as a unique identifier (for Firestore document IDs)
- A timestamp column for tracking updates

### 2. **Firestore Database**
- A Firestore database created in your Firebase project
- Appropriate security rules configured for your collection

### 3. **Billing Enabled**
- This extension requires the Blaze (pay-as-you-go) plan
- You'll incur costs for:
  - Cloud Functions execution
  - BigQuery queries
  - Firestore writes

### 4. **Required APIs**
The following APIs will be enabled automatically if not already enabled:
- BigQuery API
- Cloud Firestore API

### 5. **Permissions**
The extension will request the following permissions:
- **BigQuery Data Viewer**: To read data from your BigQuery tables
- **Cloud Datastore User**: To write data to Firestore

## Configuration Planning

Before starting the installation, gather the following information:

| Parameter | Example | Notes |
|-----------|---------|-------|
| BigQuery Dataset | `analytics_data` | The dataset containing your table |
| BigQuery Table | `user_profiles` | The table you want to sync |
| Firestore Collection | `users` | Where to store the synced data |
| Primary Key Column | `user_id` | Unique identifier column |
| Timestamp Column | `updated_at` | Column tracking last update time |
| Sync Schedule | `0 * * * *` | Cron format (default: every hour) |

## Cost Estimation

Costs depend on:
- **Sync Frequency**: More frequent syncs = higher costs
- **Data Volume**: Amount of data scanned in BigQuery
- **Change Rate**: Number of documents updated per sync

### Example Monthly Cost (Approximate)
For a table with 100,000 rows, syncing hourly with 1% daily change rate:
- Cloud Functions: ~$5-10/month
- BigQuery: ~$5-15/month (depends on table size and partitioning)
- Firestore: ~$5-20/month (depends on write volume)

💡 **Tip**: Use partitioned tables in BigQuery and adjust sync frequency to optimize costs.

## Next Steps

After installation:
1. Monitor the Functions logs to verify successful sync
2. Check your Firestore collection for synced data
3. Adjust parameters if needed using `firebase ext:configure`

---

Ready to install? Click "Install extension" to continue.
