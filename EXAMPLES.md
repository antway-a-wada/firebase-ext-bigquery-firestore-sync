# Usage Examples

This document provides practical examples of using the BigQuery to Firestore Sync extension.

## Basic Usage

### Example 1: Syncing User Data

**BigQuery Table: `users`**
```sql
CREATE TABLE my_dataset.users (
  user_id STRING NOT NULL,
  email STRING,
  display_name STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Extension Configuration:**
- BigQuery Dataset: `my_dataset`
- BigQuery Table: `users`
- Firestore Collection Path: `users`
- Primary Key Column: `user_id`
- Timestamp Column: `updated_at`
- Sync Schedule: `0 * * * *` (hourly)

**Result in Firestore:**
```
/users/{user_id}
  - email: "user@example.com"
  - display_name: "John Doe"
  - created_at: Timestamp
  - updated_at: Timestamp
```

---

### Example 2: Field Mapping (snake_case to camelCase)

**BigQuery Table: `products`**
```sql
CREATE TABLE my_dataset.products (
  product_id STRING NOT NULL,
  product_name STRING,
  unit_price FLOAT64,
  stock_quantity INT64,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Extension Configuration:**
- Field Mapping (JSON):
```json
{
  "product_id": "productId",
  "product_name": "productName",
  "unit_price": "unitPrice",
  "stock_quantity": "stockQuantity",
  "created_at": "createdAt",
  "updated_at": "updatedAt"
}
```

**Result in Firestore:**
```
/products/{product_id}
  - productId: "prod_123"
  - productName: "Widget"
  - unitPrice: 29.99
  - stockQuantity: 100
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

---

### Example 3: Excluding Sensitive Fields

**BigQuery Table: `customers`**
```sql
CREATE TABLE my_dataset.customers (
  customer_id STRING NOT NULL,
  name STRING,
  email STRING,
  ssn STRING,
  internal_notes STRING,
  updated_at TIMESTAMP
);
```

**Extension Configuration:**
- Exclude Fields: `ssn,internal_notes`

**Result in Firestore:**
```
/customers/{customer_id}
  - customer_id: "cust_456"
  - name: "Jane Smith"
  - email: "jane@example.com"
  - updated_at: Timestamp
  # ssn and internal_notes are excluded
```

---

### Example 4: Nested Collections

**BigQuery Table: `order_items`**
```sql
CREATE TABLE my_dataset.order_items (
  order_id STRING NOT NULL,
  item_id STRING NOT NULL,
  product_name STRING,
  quantity INT64,
  price FLOAT64,
  updated_at TIMESTAMP
);
```

**Extension Configuration:**
- Firestore Collection Path: `orders/{order_id}/items`
- Primary Key Column: `item_id`
- Timestamp Column: `updated_at`

**Result in Firestore:**
```
/orders/{order_id}/items/{item_id}
  - product_name: "Widget"
  - quantity: 2
  - price: 29.99
  - updated_at: Timestamp
```

---

### Example 5: Complex Data Types

**BigQuery Table: `events`**
```sql
CREATE TABLE my_dataset.events (
  event_id STRING NOT NULL,
  event_name STRING,
  event_date DATE,
  location STRUCT<
    city STRING,
    country STRING,
    postal_code STRING
  >,
  tags ARRAY<STRING>,
  metadata JSON,
  updated_at TIMESTAMP
);
```

**Extension Configuration:**
- Standard configuration (no special mapping needed)

**Result in Firestore:**
```
/events/{event_id}
  - event_name: "Conference 2024"
  - event_date: Timestamp (converted from DATE)
  - location: {
      city: "Tokyo",
      country: "Japan",
      postal_code: "100-0001"
    }
  - tags: ["tech", "ai", "cloud"]
  - metadata: { ... }
  - updated_at: Timestamp
```

---

### Example 6: Aggregated Analytics Data

**BigQuery View: `daily_metrics`**
```sql
CREATE VIEW my_dataset.daily_metrics AS
SELECT
  DATE(created_at) as metric_date,
  COUNT(*) as total_orders,
  SUM(amount) as total_revenue,
  AVG(amount) as average_order_value,
  MAX(created_at) as last_updated
FROM my_dataset.orders
GROUP BY DATE(created_at);
```

**Extension Configuration:**
- BigQuery Table: `daily_metrics` (views work too!)
- Primary Key Column: `metric_date`
- Timestamp Column: `last_updated`
- Sync Schedule: `0 1 * * *` (daily at 1 AM)

**Result in Firestore:**
```
/metrics/{metric_date}
  - metric_date: Timestamp
  - total_orders: 150
  - total_revenue: 15750.00
  - average_order_value: 105.00
  - last_updated: Timestamp
```

---

## Advanced Configurations

### High-Frequency Sync (Every 5 minutes)

For near real-time data:

**Sync Schedule:** `*/5 * * * *`

⚠️ **Note:** More frequent syncs = higher costs. Use only when necessary.

---

### Delete Synchronization

Enable delete sync to remove Firestore documents when BigQuery records are deleted:

**Configuration:**
- Enable Delete Sync: `true`
- Delete Sync Schedule: `0 0 * * *` (daily)

**How it works:**
1. Incremental sync runs hourly (or per your schedule)
2. Delete sync runs daily to clean up removed records
3. Extension queries all IDs from BigQuery
4. Compares with Firestore and deletes orphaned documents

---

### Cross-Project Sync

Sync from BigQuery in one project to Firestore in another:

**Configuration:**
- BigQuery Project ID: `analytics-project-123`
- Firebase Project: `app-project-456`

**Required:**
- Grant BigQuery Data Viewer role to the extension's service account in the analytics project

---

## Performance Optimization

### Partitioned Tables

For large tables, use BigQuery partitioning:

```sql
CREATE TABLE my_dataset.events (
  event_id STRING NOT NULL,
  event_data STRING,
  updated_at TIMESTAMP
)
PARTITION BY DATE(updated_at);
```

Benefits:
- Reduced bytes scanned
- Lower query costs
- Faster sync execution

---

### Batch Size Tuning

Adjust batch size based on document size:

- **Small documents** (< 1KB): `BATCH_SIZE=500`
- **Medium documents** (1-10KB): `BATCH_SIZE=200`
- **Large documents** (> 10KB): `BATCH_SIZE=100`

---

## Monitoring and Debugging

### Check Sync Status

View the sync state document:

```javascript
// In Firestore Console or client SDK
const stateDoc = await db
  .collection('_bigquery_firestore_sync_state')
  .doc('your_collection_name')
  .get();

console.log(stateDoc.data());
// {
//   lastSyncTimestamp: Timestamp,
//   lastSuccessfulSync: Timestamp,
//   totalDocumentsSynced: 1500
// }
```

---

### View Logs

```bash
# Firebase CLI
firebase functions:log --only ext-bigquery-firestore-sync-syncBigQueryToFirestore

# Recent errors only
firebase functions:log --only ext-bigquery-firestore-sync-syncBigQueryToFirestore | grep ERROR
```

---

### Trigger Manual Sync

You can trigger a sync manually for testing:

```bash
# Using Cloud Functions emulator
curl -X POST http://localhost:5001/YOUR_PROJECT/us-central1/ext-bigquery-firestore-sync-syncBigQueryToFirestore

# Or via Firebase Console
# Functions → ext-bigquery-firestore-sync-syncBigQueryToFirestore → Test
```

---

## Common Patterns

### Pattern 1: Denormalized Data

Sync denormalized/flattened data for faster client queries:

**BigQuery Query:**
```sql
CREATE VIEW my_dataset.user_orders AS
SELECT
  o.order_id,
  o.order_date,
  o.status,
  u.user_id,
  u.email,
  u.display_name,
  o.updated_at
FROM my_dataset.orders o
JOIN my_dataset.users u ON o.user_id = u.user_id;
```

Sync this view to Firestore for efficient client-side queries.

---

### Pattern 2: Computed Fields

Pre-compute expensive calculations in BigQuery:

```sql
CREATE VIEW my_dataset.product_stats AS
SELECT
  product_id,
  product_name,
  COUNT(DISTINCT order_id) as total_orders,
  SUM(quantity) as total_sold,
  AVG(rating) as average_rating,
  MAX(updated_at) as last_updated
FROM my_dataset.order_items
GROUP BY product_id, product_name;
```

---

### Pattern 3: Time-Series Data

Sync recent time-series data for real-time dashboards:

```sql
CREATE VIEW my_dataset.recent_metrics AS
SELECT *
FROM my_dataset.metrics
WHERE metric_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY);
```

Configure with frequent sync (e.g., every 15 minutes) for near real-time updates.

---

## Troubleshooting Examples

### Issue: Large Initial Sync Timeout

**Solution:** Use BigQuery to create a smaller initial dataset:

```sql
-- Create a staging view with recent data only
CREATE VIEW my_dataset.users_recent AS
SELECT *
FROM my_dataset.users
WHERE updated_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY);
```

Sync `users_recent` first, then switch to full `users` table.

---

### Issue: Field Type Mismatch

**BigQuery:** `amount NUMERIC`
**Firestore:** Receives as string

**Solution:** Cast in BigQuery view:

```sql
CREATE VIEW my_dataset.orders_formatted AS
SELECT
  order_id,
  CAST(amount AS FLOAT64) as amount,
  updated_at
FROM my_dataset.orders;
```

---

## Next Steps

- Review the [README](README.md) for detailed documentation
- Check [POSTINSTALL](POSTINSTALL.md) for setup guidance
- See [CONTRIBUTING](CONTRIBUTING.md) if you want to contribute

---

Questions? Open an issue on GitHub!
