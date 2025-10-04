# Next-Live Server (Phase 0)

Fastify + Prisma による最小 BFF 実装（Google 認証 + Artists CRUD）。

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

## エンドポイント (Phase 0)

| Method | Path | Auth | 説明 |
|--------|------|------|------|
| POST | /v1/auth/google | none | Google ID Token でログイン（accessToken返却） |
| GET | /v1/artists | Bearer | アーティスト一覧 |
| POST | /v1/artists | Bearer | 作成 |
| PATCH | /v1/artists/:id | Bearer | 更新 |
| DELETE | /v1/artists/:id | Bearer | 削除 |
| GET | /healthz | none | ヘルスチェック |

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

## 今後 (Phase1 予定)

- Refresh トークン & ローテーション
- 画像 R2 presign `/v1/storage/presign`
- LiveEvents / Memories CRUD
- 差分同期 `/v1/sync`
- ルート単体の E2E テスト (supertest) 追加

## デプロイ（Fly.io 概要）

1. `fly launch` で Dockerfile 自動生成（未作成なら）
2. Secrets 設定: `fly secrets set JWT_ACCESS_SECRET=... GOOGLE_CLIENT_ID=...` など
3. `fly deploy`

## 注意

- 本段階では SSR / Cookie ベース Web 認証は未実装（ネイティブ優先）。
- エラーハンドリングと型厳密化は後続フェーズで拡張。
