# BigQuery to Firestore Sync

**Author**: Tsukurioki (**[tsukurioki.jp](https://tsukurioki.jp)**)

**Description**: Syncs data from BigQuery tables to Firestore collections with incremental updates.

---

## 🧩 Install this extension

### ローカルからインストール（プライベート使用）

```bash
# リポジトリをクローン
git clone https://github.com/antway-a-wada/firebase-ext-bigquery-firestore-sync.git
cd firebase-ext-bigquery-firestore-sync

# Firebaseプロジェクトを選択
firebase use <your-project-id>

# ローカルからインストール
firebase ext:install . --project=<your-project-id>
```

### 公開後のインストール（将来的に公開する場合）

公開後は以下の方法でインストール可能になります：

#### Console
[![Install this extension in your Firebase project](https://www.gstatic.com/mobilesdk/210513_mobilesdk/install-extension.png "Install this extension in your Firebase project")](https://console.firebase.google.com/project/_/extensions/install?ref=antway-a-wada/bigquery-firestore-sync)

#### Firebase CLI
```bash
firebase ext:install antway-a-wada/bigquery-firestore-sync --project=projectId-here
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
- Function timeout is 30 minutes (1800 seconds)
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

---
---

# BigQuery to Firestore Sync（日本語）

**作成者**: Tsukurioki (**[tsukurioki.jp](https://tsukurioki.jp)**)

**説明**: BigQueryテーブルからFirestoreコレクションへ、増分更新でデータを同期します。

---

## 🧩 この拡張機能をインストール

### ローカルからインストール（プライベート使用）

```bash
# リポジトリをクローン
git clone https://github.com/antway-a-wada/firebase-ext-bigquery-firestore-sync.git
cd firebase-ext-bigquery-firestore-sync

# Firebaseプロジェクトを選択
firebase use <your-project-id>

# ローカルからインストール
firebase ext:install . --project=<your-project-id>
```

### 公開後のインストール（将来的に公開する場合）

公開後は以下の方法でインストール可能になります：

#### コンソール
[![Install this extension in your Firebase project](https://www.gstatic.com/mobilesdk/210513_mobilesdk/install-extension.png "Install this extension in your Firebase project")](https://console.firebase.google.com/project/_/extensions/install?ref=antway-a-wada/bigquery-firestore-sync)

#### Firebase CLI
```bash
firebase ext:install antway-a-wada/bigquery-firestore-sync --project=projectId-here
```

---

## 📝 概要

この拡張機能を使用すると、BigQueryテーブルからFirestoreコレクションへデータを自動的に同期できます。タイムスタンプ列に基づいて増分同期を行い、変更されていないレコードを処理することなく、効率的にデータを更新します。

### 主な機能

- **増分同期**: 前回の同期以降に変更されたレコードのみを同期
- **スケジュール更新**: Cron式を使用して同期頻度を設定可能
- **削除同期**: BigQueryでレコードが削除された際にFirestoreドキュメントも削除するオプション機能
- **フィールドマッピング**: BigQueryとFirestore間でフィールド名をカスタマイズ可能
- **バッチ処理**: 設定可能なバッチサイズで大規模データセットを効率的に処理
- **型変換**: BigQueryのデータ型をFirestore互換の型に自動変換

### 動作の仕組み

1. スケジュールに従い、前回の同期以降に更新されたレコードをBigQueryにクエリ
2. 取得したレコードを変換・検証
3. データをFirestoreにバッチで書き込み（1バッチ最大500ドキュメント）
4. 次回実行のために最終同期タイムスタンプを保存
5. オプションで、BigQueryで削除されたレコードをFirestoreからも削除

### ユースケース

- **データウェアハウスからアプリケーションデータベースへ**: データウェアハウスで処理されたデータをアプリケーションのFirestoreデータベースに同期
- **分析から本番環境へ**: 集計された分析データをFirestoreにプッシュしてリアルタイムアクセスを実現
- **マルチソース統合**: BigQueryで複数のソースからのデータを結合してFirestoreに同期
- **レポートダッシュボード**: BigQueryからの最新レポートデータでFirestoreを常に更新

---

## 🧩 設定パラメータ

インストール時に以下のパラメータを設定します：

### 必須パラメータ

- **BigQuery Dataset**: ソーステーブルを含むデータセット
- **BigQuery Table**: 同期元のテーブル名
- **Firestore Collection Path**: 同期先のFirestoreコレクション
- **Primary Key Column**: FirestoreドキュメントIDとして使用するBigQueryの列
- **Timestamp Column**: レコードが最後に更新された時刻を追跡する列
- **Sync Schedule**: 同期を実行する頻度（Cron形式）

### オプションパラメータ

- **BigQuery Project ID**: BigQueryに別のGCPプロジェクトを使用（デフォルトはFirebaseプロジェクト）
- **Enable Delete Sync**: BigQueryレコードが削除された際にFirestoreドキュメントを自動削除
- **Delete Sync Schedule**: 削除チェックを実行する頻度（有効な場合）
- **Batch Size**: バッチごとのドキュメント数（1-500、デフォルト: 500）
- **Field Mapping**: BigQueryの列をFirestoreフィールドにマッピングするJSONオブジェクト
- **Exclude Fields**: 同期から除外する列のカンマ区切りリスト

---

## 🔑 前提条件

この拡張機能をインストールする前に、以下が必要です：

1. **Firebaseプロジェクトのセットアップ**: まだない場合は、[Firebase Console](https://console.firebase.google.com/)で新しいFirebaseプロジェクトを作成

2. **Cloud Firestoreの有効化**: Firestoreセクションに移動してデータベースを作成

3. **課金の有効化**: この拡張機能にはBlaze（従量課金制）プランが必要です

4. **BigQueryテーブルの作成**: BigQueryテーブルが存在し、以下を含むことを確認：
   - 一意の識別子列（ドキュメントID用）
   - タイムスタンプ列（増分同期用）

5. **権限の付与**: 拡張機能は必要な権限を自動的に要求しますが、FirebaseプロジェクトがBigQueryプロジェクトから読み取りアクセスできることを確認してください

---

## 💰 課金

この拡張機能は以下のFirebaseおよびGoogle Cloud Platformサービスを使用し、料金が発生する場合があります：

- **Cloud Functions**: スケジュール関数の実行（[料金](https://firebase.google.com/pricing)）
- **Cloud Firestore**: ドキュメント書き込みとストレージ（[料金](https://firebase.google.com/docs/firestore/quotas)）
- **BigQuery**: クエリ実行とスキャンされたデータ（[料金](https://cloud.google.com/bigquery/pricing)）

これらのサービスの使用に関連するコストについては、お客様の責任となります。

### コスト最適化のヒント

- BigQueryでスキャンされるデータを最小化するため、タイムスタンプ列を効果的に使用
- 必要に応じて同期頻度を調整（頻度が低い = コストが低い）
- 不要なデータの同期を避けるため`EXCLUDE_FIELDS`を使用
- タイムスタンプ列でBigQueryテーブルをパーティション分割することを検討
- 不要な場合は削除同期を無効化してフルテーブルスキャンを回避

---

## 📊 モニタリング

インストール後、拡張機能のアクティビティを監視できます：

1. **Cloud Functionsログ**: Firebase ConsoleのFunctionsでログを表示
2. **拡張機能メトリクス**: Extensionsダッシュボードで実行履歴を確認
3. **Firestoreアクティビティ**: Firestoreコンソールでドキュメント書き込みを監視
4. **BigQueryクエリ履歴**: BigQueryコンソールでクエリ実行を確認

### 監視すべき主要メトリクス

- 同期実行時間
- 実行ごとに同期されたドキュメント数
- BigQueryでスキャンされたバイト数
- Firestore書き込み操作
- エラー率とタイプ

---

## 🔧 高度な使用方法

### フィールドマッピングの例

BigQueryの列がsnake_caseを使用しているが、FirestoreではcamelCaseを使いたい場合：

```json
{
  "user_id": "userId",
  "created_at": "createdAt",
  "updated_at": "updatedAt",
  "first_name": "firstName",
  "last_name": "lastName"
}
```

### ネストされたコレクション

ワイルドカードを使用してサブコレクションに同期できます：

```
users/{userId}/orders
```

拡張機能は各一意の`userId`値に対して個別のドキュメントを作成します。

### Cronスケジュールの例

- 1時間ごと: `0 * * * *`
- 6時間ごと: `0 */6 * * *`
- 毎日午前0時（UTC）: `0 0 * * *`
- 平日の午前9時（UTC）: `0 9 * * 1-5`

---

## ⚠️ 重要な考慮事項

### データ整合性

- この拡張機能は結果整合性を提供し、リアルタイム同期ではありません
- BigQueryの更新とFirestoreへの反映の間に遅延が発生する可能性があります
- 同期中のBigQueryの同時更新は競合状態を引き起こす可能性があります

### パフォーマンス

- 非常に大規模なデータセット（数百万レコード）の場合、初期同期に時間がかかる場合があります
- オフピーク時に手動で初期同期を実行することを検討してください
- 多数の同時クエリがある場合は、BigQueryスロット使用量を監視してください

### 制限事項

- 最大バッチサイズは500ドキュメント（Firestoreの制限）
- 関数タイムアウトは30分（1800秒）
- 非常に大規模な同期操作は、複数回の実行に分割する必要がある場合があります
- Firestoreドキュメントサイズの制限は1 MB

---

## 🐛 トラブルシューティング

### よくある問題

**同期が実行されない**
- Cloud Functionsログでエラーを確認
- Cronスケジュールが正しいことを確認
- 関数がデプロイされていることを確認

**権限エラー**
- BigQueryデータセットの権限を確認
- Firestoreセキュリティルールを確認
- サービスアカウントに必要なロールがあることを確認

**タイムアウトエラー**
- バッチサイズを減らす
- 同期頻度を増やして、より小さいチャンクを処理
- BigQueryテーブルのパーティション分割を検討

**データ型エラー**
- フィールドマッピング設定を確認
- 互換性のないBigQuery型を確認（例：GEOGRAPHY）
- 問題のある列にはEXCLUDE_FIELDSを使用

---

## 📚 参考資料

- [Firebase Extensions ドキュメント](https://firebase.google.com/docs/extensions)
- [BigQuery ドキュメント](https://cloud.google.com/bigquery/docs)
- [Firestore ドキュメント](https://firebase.google.com/docs/firestore)
- [Cloud Functions スケジュール関数](https://firebase.google.com/docs/functions/schedule-functions)

---

## ライセンス

Apache-2.0

---

## サポート

問題が発生した場合や質問がある場合：

1. [GitHubリポジトリ](https://github.com/antway-a-wada/firebase-ext-bigquery-firestore-sync)で既知の問題を確認
2. Cloud Functionsログでエラーの詳細を確認
3. 再現手順を含むissueをGitHubで開く

---

Tsukuriokiが❤️を込めて作成
