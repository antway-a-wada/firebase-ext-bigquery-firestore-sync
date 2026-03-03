# Firebase Extensions Publisher Guide

このドキュメントは、この拡張機能をFirebase Extensions Hubに公開するための手順をまとめたものです。

## 📋 公開前チェックリスト

### ✅ 必須ファイル

- [x] `extension.yaml` - 拡張機能の設定
- [x] `PREINSTALL.md` - インストール前の説明
- [x] `POSTINSTALL.md` - インストール後の説明
- [x] `README.md` - 詳細ドキュメント
- [x] `CHANGELOG.md` - 変更履歴
- [x] `LICENSE` - ライセンス情報
- [ ] `icon.png` - 拡張機能のアイコン（128x128px）

### ✅ リポジトリ設定

- [ ] リポジトリをpublicにする
- [ ] GitHub Releasesでバージョンタグを作成（v0.1.2）
- [ ] リポジトリのDescriptionを設定
- [ ] リポジトリのTopicsを設定（firebase-extension, bigquery, firestore）

### ✅ コード品質

- [x] すべてのテストが通る
- [x] Lintエラーがない
- [x] TypeScriptのビルドが成功する
- [x] 日本語ログメッセージ
- [x] 構造化ログ（cloudLogger）

## 🚀 公開手順

### 1. リポジトリをPublicにする

```bash
# GitHubのリポジトリ設定で:
# Settings → Danger Zone → Change repository visibility → Make public
```

### 2. アイコン画像を追加

拡張機能のアイコンを作成して追加：

```bash
# 128x128pxのPNG画像を作成
# ファイル名: icon.png
# 配置場所: リポジトリルート
```

**アイコンガイドライン:**
- サイズ: 128x128ピクセル
- フォーマット: PNG
- 背景: 透過または白
- デザイン: シンプルで分かりやすいもの
- 推奨: BigQueryとFirestoreを組み合わせたデザイン

### 3. GitHub Releaseを作成

```bash
# GitHubで:
# Releases → Create a new release
# Tag: v0.1.2
# Title: v0.1.2 - Initial Release
# Description: CHANGELOGから抜粋
```

### 4. Firebase Extensions Publisherに登録

#### 4.1 Publisher Accountを作成

1. [Firebase Extensions Publisher Portal](https://console.firebase.google.com/project/_/extensions/publishers) にアクセス
2. **Create Publisher** をクリック
3. 以下の情報を入力：
   - Publisher ID: `antway` または `antway-inc`
   - Publisher Name: `Antway.inc`
   - Website: `https://antway.co.jp`
   - Support Email: あなたのサポートメールアドレス

#### 4.2 拡張機能を登録

```bash
# Firebase CLIで拡張機能を公開
firebase ext:dev:register

# 対話式で以下を入力:
# - Publisher ID: antway
# - Extension ID: bigquery-firestore-sync
# - GitHub Repository: antway-a-wada/firebase-ext-bigquery-firestore-sync
```

### 5. 拡張機能をテスト

公開前に、拡張機能をテストプロジェクトにインストールしてテスト：

```bash
# ローカルからインストール（最終確認）
firebase ext:install . --project=test-project-id

# すべての機能が正常に動作することを確認:
# - BigQueryからのデータ取得
# - Firestoreへの書き込み
# - 増分同期
# - 削除同期（有効な場合）
# - エラーハンドリング
```

### 6. 拡張機能を公開

```bash
# 拡張機能を公開
firebase ext:dev:publish antway/bigquery-firestore-sync@0.1.2

# 公開が承認されるまで待機（通常1-3営業日）
```

## 📝 extension.yamlの確認項目

### 基本情報

- [x] `name`: bigquery-firestore-sync
- [x] `version`: 0.1.2
- [x] `displayName`: 分かりやすい表示名
- [x] `description`: 簡潔な説明
- [x] `license`: Apache-2.0

### 著者情報

- [x] `author.authorName`: Antway.inc
- [x] `author.url`: https://antway.co.jp

### 権限とAPI

- [x] `billingRequired`: true
- [x] `apis`: BigQuery、Firestore
- [x] `roles`: 必要な最小限のIAMロール

### パラメータ

- [x] すべての必須パラメータに`required: true`
- [x] デフォルト値の設定
- [x] バリデーション設定
- [x] 分かりやすい説明とサンプル

## 🔍 レビュープロセス

Firebase Extensionsチームが以下を確認します：

1. **セキュリティ**: 適切な権限設定、セキュアなコード
2. **品質**: テストカバレッジ、エラーハンドリング
3. **ドキュメント**: 完全で分かりやすい説明
4. **ユーザー体験**: インストールが簡単、設定が直感的

### よくある指摘事項

- パラメータの説明が不十分
- エラーハンドリングが不完全
- セキュリティ上の問題
- ドキュメントの不備
- テストの不足

## 📊 公開後の管理

### バージョン更新

```bash
# 1. extension.yamlのversionを更新
# 2. CHANGELOGを更新
# 3. GitHub Releaseを作成
# 4. 新バージョンを公開
firebase ext:dev:publish antway/bigquery-firestore-sync@0.1.3
```

### 使用状況の確認

Firebase Consoleで確認できる項目：
- インストール数
- アクティブインストール数
- バージョン分布
- エラー率

### サポート対応

- GitHub Issuesで質問や問題を受け付ける
- 重要なバグは優先的に対応
- 定期的にドキュメントを更新

## 🎯 公開後のプロモーション

### コミュニティでの共有

1. **Firebase Blog**: Guest post投稿を検討
2. **Twitter/X**: @firebase をメンションして共有
3. **Reddit**: r/Firebase で紹介
4. **Qiita/Zenn**: 日本語記事を投稿
5. **GitHub**: README.mdにバッジを追加

### バッジの追加

公開後、READMEにインストールバッジを追加：

```markdown
[![Install this extension in your Firebase project](https://www.gstatic.com/mobilesdk/210513_mobilesdk/install-extension.png)](https://console.firebase.google.com/project/_/extensions/install?ref=antway/bigquery-firestore-sync)
```

## 📚 参考リンク

- [Firebase Extensions Documentation](https://firebase.google.com/docs/extensions)
- [Extension Publishing Guide](https://firebase.google.com/docs/extensions/publishers)
- [Extension Manifest Reference](https://firebase.google.com/docs/extensions/reference/extension-yaml)
- [Extension Best Practices](https://firebase.google.com/docs/extensions/best-practices)

## ⚠️ 重要な注意事項

1. **一度公開したバージョンは削除できません**
   - 慎重にバージョン番号を管理
   - 十分なテストを実施

2. **Publisher IDは変更できません**
   - 最初に適切なIDを選択

3. **公開審査には時間がかかります**
   - 余裕を持ったスケジュールで

4. **セキュリティ問題は最優先で対応**
   - 脆弱性が見つかったら即座にパッチリリース

---

**準備ができたら**：上記のチェックリストをすべて完了させてから公開プロセスを開始してください。
