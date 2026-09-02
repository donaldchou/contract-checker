# AI 合約審查器（ai-contract-checker）

上傳合約檔案 → 由 API 打到 Gemini AI 分析 → 檔案存到 Vercel Blob → 分析結果與 Blob 連結存進 MongoDB。
有 email/password 會員系統，合約綁定會員，只有本人看得到。

## 技術

- Next.js 16（App Router, Turbopack）+ TypeScript + Tailwind CSS v4
- Gemini REST `generateContent`（`gemini-3.6-flash`，配額/過載時自動退回 `gemini-3.5-flash-lite`）
- **BYOK**：Gemini 金鑰由使用者自行輸入，只存在瀏覽器 localStorage，分析時經 header 送出，伺服器不留存
- 會員：bcryptjs 雜湊 + jose HS256 JWT（http-only cookie）
- Vercel Blob（`@vercel/blob`）
- MongoDB Atlas + Mongoose

## 環境變數（`.env.local`）

| 變數 | 說明 |
|------|------|
| `MONGODB_URI`    | MongoDB 連線字串（db: `contract-checker`）|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 讀寫 token |
| `JWT_SECRET`     | 會員登入 JWT 簽章金鑰（隨機字串）|
| `GEMINI_MODEL`   | （選填）覆寫主要 model，預設 `gemini-3.6-flash` |

> Gemini API 金鑰**不在**環境變數，改由使用者在頁面上輸入。

## 開發

```bash
npm run dev      # http://localhost:3000
```

## API

| 方法 | 路徑 | 說明 |
|------|------|------|
| `POST` | `/api/auth/register` · `login` · `logout` · `me` | 會員註冊 / 登入 / 登出 / 目前使用者 |
| `POST` | `/api/analyze` | 需登入。header `x-gemini-api-key` 帶使用者金鑰；`multipart/form-data` 欄位 `file`（PDF / PNG / JPEG / WebP / txt，≤10MB）。上傳 Blob → Gemini 分析 → 存 Mongo，回傳分析結果 |
| `GET`  | `/api/contracts` | 需登入。目前會員最近 50 筆審查紀錄 |
| `GET`  | `/api/contracts/[id]` | 需登入。單筆紀錄詳情（僅限本人）|

## 資料模型（`models/Contract.ts`）

`fileName` / `fileType` / `fileSize` / `blobUrl` / `analysis`（summary、contractType、parties、overallRisk、risks[]、missingClauses[]、recommendations[]）/ `model` / `timestamps`
