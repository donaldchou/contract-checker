# AI 合約審查器（ai-contract-checker）

上傳合約檔案 → 由 API 打到 Gemini AI 分析 → 檔案存到 Vercel Blob → 分析結果與 Blob 連結存進 MongoDB。

## 技術

- Next.js 16（App Router, Turbopack）+ TypeScript + Tailwind CSS v4
- Gemini REST `generateContent`（`gemini-3.6-flash`，配額/過載時自動退回 `gemini-3.5-flash-lite`）
- Vercel Blob（`@vercel/blob`）
- MongoDB Atlas + Mongoose

## 環境變數（`.env.local`）

| 變數 | 說明 |
|------|------|
| `GEMINI_API_KEY` | Google AI Studio 金鑰 |
| `GEMINI_MODEL`   | （選填）覆寫主要 model，預設 `gemini-3.6-flash` |
| `MONGODB_URI`    | MongoDB 連線字串（db: `contract-checker`）|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 讀寫 token |

## 開發

```bash
npm run dev      # http://localhost:3000
```

## API

| 方法 | 路徑 | 說明 |
|------|------|------|
| `POST` | `/api/analyze` | `multipart/form-data`，欄位 `file`（PDF / PNG / JPEG / WebP / txt，≤10MB）。上傳 Blob → Gemini 分析 → 存 Mongo，回傳分析結果 |
| `GET`  | `/api/contracts` | 最近 50 筆審查紀錄 |
| `GET`  | `/api/contracts/[id]` | 單筆紀錄詳情 |

## 資料模型（`models/Contract.ts`）

`fileName` / `fileType` / `fileSize` / `blobUrl` / `analysis`（summary、contractType、parties、overallRisk、risks[]、missingClauses[]、recommendations[]）/ `model` / `timestamps`
