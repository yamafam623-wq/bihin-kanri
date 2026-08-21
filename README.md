# 備品管理システム（社内備品在庫管理Webアプリ）

社内の備品在庫を管理するWebアプリです。使用登録によって在庫数を自動的に減算し、在庫が発注点を下回った場合は画面上の警告表示とメール通知の両方でお知らせします。

## 技術スタック

- フロントエンド/バックエンド: Next.js 16（App Router）+ TypeScript
- DB: SQLite + Prisma 7（`file:./dev.db`。将来的にPostgreSQL等へ移行する場合はPrismaのdatasource providerとdriver adapterを切り替えるだけで対応できます）
- メール送信: Nodemailer（SMTP設定は環境変数で切り替え。開発時はMailtrap等のテスト用SMTPで確認可能）
- UI: Tailwind CSS
- テスト: Vitest

## 認証について（簡易実装）

要件に基づき、実装がシンプルな**単一の管理者パスワードによるログイン**を採用しています。

- 保護対象は「社員マスタ管理」（`/employees`）と「備品マスタ管理」（`/items`）のみです。
- 「在庫一覧」「使用登録」「使用履歴」は社内ネットワーク内であれば誰でも利用できる想定で、ログイン不要です（複数の社員が同時に使うことを想定しているため、社員ごとの個別ログインは行わず、使用登録時にドロップダウンで使用者を選択する方式にしています）。
- ログインすると、`ADMIN_PASSWORD`のハッシュ値をhttpOnly Cookieに保存し、以後の管理画面アクセス時に検証します（`proxy.ts`で実装）。
- 本番運用でセキュリティ要件が高まる場合は、社員ごとのアカウント管理（NextAuth等）への切り替えを推奨します。

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

`npm install` 完了後に `postinstall` フックでPrisma Client（`app/generated/prisma`）が自動生成されます。もし生成されていない場合は `npx prisma generate` を実行してください。

### 2. 環境変数の設定

`.env.example` を `.env` にコピーし、内容を編集してください。

```bash
cp .env.example .env
```

| 変数名 | 説明 |
|---|---|
| `DATABASE_URL` | SQLiteのDBファイルパス（初期値 `file:./dev.db` のままで問題ありません） |
| `ADMIN_PASSWORD` | 社員マスタ・備品マスタ管理画面に入るためのパスワード |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | SMTPサーバーのホスト・ポート・TLS有無 |
| `SMTP_USER` / `SMTP_PASS` | SMTP認証情報（Mailtrap等の場合はサンドボックスの認証情報を設定） |
| `SMTP_FROM` | 送信元メールアドレス |
| `ALERT_EMAILS` | 在庫僅少通知の送信先（管理者メールアドレス。複数はカンマ区切り） |
| `LOW_STOCK_RENOTIFY_HOURS` | 同一品目について再通知しない期間（時間単位、初期値24） |

### 3. データベースの初期化

```bash
npm run db:migrate
```

初回実行時にマイグレーションが適用され、`dev.db` が作成されます。

### 4. サンプルデータの投入

社員3件・備品3件（うち1件は発注点を下回るサンプル）を投入します。

```bash
npm run db:seed
```

### 5. メール送信設定（開発時）

開発時は [Mailtrap](https://mailtrap.io/) 等のテスト用SMTPサービスの利用を推奨します。Mailtrapの場合、Sandbox の SMTP Settings 画面に表示される `Host` / `Port` / `Username` / `Password` を `.env` の `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` にそれぞれ設定してください。

なお、SMTP未設定・送信失敗時でも在庫の登録・減算処理自体は失敗しません（メール送信エラーはサーバーログに記録されるのみです）。

### 6. 起動方法

```bash
npm run dev
```

`http://localhost:3000` にアクセスしてください。

本番相当のビルド・起動は以下の通りです。

```bash
npm run build
npm run start
```

## 画面構成

| パス | 画面 | 認証 |
|---|---|---|
| `/` | 在庫一覧（発注点以下の品目を赤色でハイライト・警告バッジ表示） | 不要 |
| `/usage/new` | 使用登録（備品・使用者をドロップダウンから選択し登録） | 不要 |
| `/usage` | 使用履歴（新しい順、品目名・使用者名・期間で絞り込み） | 不要 |
| `/stock-in` | 入荷登録（備品・入荷数量・入荷日を入力して在庫数に加算、入荷履歴を一覧表示） | 不要 |
| `/employees` | 社員マスタ管理（追加・編集・無効化） | 必要 |
| `/items` | 備品マスタ管理（追加・編集・発注点変更・在庫数の手動調整） | 必要 |
| `/login` | 管理者ログイン | - |

## 在庫僅少時の通知の仕組み

1. 使用登録（`/usage/new`）または備品マスタでの在庫調整・発注点変更（`/items`）により、対象品目の在庫数が発注点以下になった時点でチェックが走ります（[lib/stock.ts](lib/stock.ts)）。
2. 在庫一覧画面（`/`）では該当行が赤色でハイライトされ、警告バッジが表示されます。
3. 同時に、`ALERT_EMAILS` で指定した宛先へメール通知を送信します（品目名・現在庫数・発注点を記載）。
4. 同一品目について、直近の通知（`NotificationLog`テーブルに記録）から `LOW_STOCK_RENOTIFY_HOURS`（初期値24時間）以内であれば再送しません。

## テスト・動作確認手順

### 自動テスト

在庫減算・在庫不足エラー・発注点到達時のメール通知トリガー・再送抑制について、Vitestによる自動テストを用意しています（[tests/stock.test.ts](tests/stock.test.ts)）。テスト実行時は `prisma/test.db` という開発用DBとは別のSQLiteファイルを都度作り直して使用するため、`dev.db` のデータには影響しません。

```bash
npm test
```

### 手動確認手順

1. `npm run dev` でアプリを起動し、`/` で在庫一覧を確認する（シードデータでは「油性ボールペン(黒)」が発注点以下として赤くハイライトされます）。
2. `/usage/new` で備品・使用者・数量・使用日を入力して登録する。
3. `/` に自動遷移し、在庫数が使用数量分減っていることを確認する。
4. 在庫数が発注点以下になる数量を登録し、対象品目が赤色ハイライト＋警告バッジ表示になること、また `ALERT_EMAILS` 宛にメールが届くこと（Mailtrap等の受信箱で確認）を確認する。
5. 続けて同じ品目についてもう一度発注点以下となる登録を行い、`LOW_STOCK_RENOTIFY_HOURS` 以内は再度メールが送信されないことを確認する。
6. `/usage/new` で在庫数を超える数量を入力し、「在庫数が不足しているため登録できません。」というエラーが表示され、在庫が変化しないことを確認する。
7. `/usage` で品目名・使用者名・期間による絞り込みを確認する。
8. `/stock-in` で備品・入荷数量・入荷日を入力して登録し、在庫数が入荷数量分増えていること、入荷履歴に1件追加されていることを確認する。
9. `/employees`・`/items` にログインせずアクセスすると `/login` にリダイレクトされることを確認する。ログイン後、社員の追加・編集・無効化、備品の追加・編集・発注点変更・在庫数の手動調整（棚卸し）ができることを確認する。

## ディレクトリ構成（主要部分）

```
app/
  page.tsx                在庫一覧
  usage/new/               使用登録
  usage/page.tsx           使用履歴
  stock-in/                 入荷登録
  employees/                社員マスタ管理
  items/                    備品マスタ管理
  login/                     管理者ログイン
  components/NavBar.tsx     共通ナビゲーション
lib/
  prisma.ts                 Prismaクライアント（better-sqlite3ドライバアダプタ経由）
  stock.ts                  使用登録・入荷登録・在庫僅少通知のコアロジック
  mail.ts                   Nodemailerによるメール送信
  auth.ts                   簡易管理者認証
proxy.ts                    管理画面への認証ガード（Next.js 16のmiddleware相当）
prisma/
  schema.prisma              DBスキーマ
  seed.ts                    サンプルデータ投入スクリプト
tests/
  stock.test.ts               在庫減算・入荷加算・通知ロジックの自動テスト
```
