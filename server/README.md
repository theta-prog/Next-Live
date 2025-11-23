# Next-Live Server (Phase 1 Complete)

Fastify + Prisma による完全なBFF実装（Google認証、CRUD、画像アップロード、同期API）。

## セットアップ

1. 依存インストール
```bash
cd server
npm install
```
2. `.env` 作成
```bash
cp .env.example .env
# 値を入力 (DATABASE_URL, GOOGLE_CLIENT_ID, JWT_ACCESS_SECRET ...)
```
3. DB マイグレーション
```bash
npx prisma migrate dev --name init
```
4. 開発起動
```bash
npm run dev
# http://localhost:3000/healthz で {"status":"ok"}
```

## エンドポイント

### 認証
| Method | Path | Auth | 説明 |
|--------|------|------|------|
| POST | /v1/auth/google | none | Google ID Token でログイン |
| POST | /v1/auth/refresh | none | Refresh Token でアクセストークン更新 |
| POST | /v1/auth/logout | Bearer | ログアウト（Refresh Token 無効化） |

### アーティスト
| Method | Path | Auth | 説明 |
|--------|------|------|------|
| GET | /v1/artists | Bearer | アーティスト一覧 |
| POST | /v1/artists | Bearer | アーティスト作成 |
| PATCH | /v1/artists/:id | Bearer | アーティスト更新 |
| DELETE | /v1/artists/:id | Bearer | アーティスト削除 |

### ライブイベント
| Method | Path | Auth | 説明 |
|--------|------|------|------|
| GET | /v1/live-events | Bearer | イベント一覧 |
| GET | /v1/live-events/:id | Bearer | イベント詳細 |
| POST | /v1/live-events | Bearer | イベント作成 |
| PATCH | /v1/live-events/:id | Bearer | イベント更新 |
| DELETE | /v1/live-events/:id | Bearer | イベント削除 |

### 思い出
| Method | Path | Auth | 説明 |
|--------|------|------|------|
| GET | /v1/memories | Bearer | 思い出一覧 |
| GET | /v1/memories/:id | Bearer | 思い出詳細 |
| POST | /v1/memories | Bearer | 思い出作成 |
| PATCH | /v1/memories/:id | Bearer | 思い出更新 |
| DELETE | /v1/memories/:id | Bearer | 思い出削除 |
| GET | /v1/live-events/:eventId/memories | Bearer | イベント別思い出一覧 |

### ストレージ
| Method | Path | Auth | 説明 |
|--------|------|------|------|
| POST | /v1/storage/presign | Bearer | 画像アップロード用URL生成 |
| DELETE | /v1/storage/:key | Bearer | 画像削除 |

### 同期
| Method | Path | Auth | 説明 |
|--------|------|------|------|
| POST | /v1/sync | Bearer | データ同期 |
| GET | /v1/sync/status | Bearer | 同期ステータス |

### ヘルスチェック
| Method | Path | Auth | 説明 |
|--------|------|------|------|
| GET | /healthz | none | サーバーヘルスチェック |

### 認証フロー (開発)

1. Google で ID Token を取得（モバイル: Expo AuthSession / Web: Google Identity Services）
2. `POST /v1/auth/google { idToken }`
3. レスポンス: `{ accessToken, user }`
4. 以降 `Authorization: Bearer <accessToken>` を付与

`MOCK_GOOGLE=true` で ID Token 検証をスキップ（任意文字列 10 文字以上で可）。
`SKIP_DB=true` を併用すると DB への upsert を行わずダミーユーザーで即レスポンス（疎通/フロント統合用）。

### 例 (curl)
```bash
curl -X POST http://localhost:3000/v1/auth/google \
  -H 'Content-Type: application/json' \
  -d '{"idToken":"mock-token-1234567890"}'

curl -H 'Authorization: Bearer <token>' http://localhost:3000/v1/artists
```

## テスト実行

```bash
npm test
```

全テストファイル:
- `auth.test.ts` - Google認証
- `auth.refresh.test.ts` - Refresh Token
- `artists.validation.test.ts` - バリデーション
- `artists.skipdb.test.ts` - SKIP_DBモード
- `artists.db.test.ts` - DB連携
- `liveEvents.test.ts` - ライブイベントCRUD
- `memories.test.ts` - 思い出CRUD
- `sync.test.ts` - 同期API
- `storage.test.ts` - ストレージAPI

## デプロイ（Fly.io 概要）

1. `fly launch` で Dockerfile 自動生成（未作成なら）
2. Secrets 設定: `fly secrets set JWT_ACCESS_SECRET=... GOOGLE_CLIENT_ID=...` など
3. `fly deploy`

## 注意

- 本段階では SSR / Cookie ベース Web 認証は未実装（ネイティブ優先）。
- エラーハンドリングと型厳密化は後続フェーズで拡張。
