import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { connectToDatabase } from "@/lib/mongodb";
import { Contract } from "@/models/Contract";
import { analyzeContract, lastUsedModel } from "@/lib/gemini";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "請以 multipart/form-data 上傳檔案" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少檔案欄位 file" }, { status: 400 });
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ACCEPTED_TYPES.has(mimeType)) {
    return NextResponse.json(
      { error: `不支援的檔案類型：${mimeType}（支援 PDF、PNG、JPEG、WebP、純文字）` },
      { status: 415 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "檔案超過 10MB 上限" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // 1. 上傳到 Vercel Blob
  let blobUrl: string;
  try {
    const blob = await put(`contracts/${Date.now()}-${file.name}`, bytes, {
      access: "public",
      addRandomSuffix: true,
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    blobUrl = blob.url;
  } catch (err) {
    console.error("Blob 上傳失敗", err);
    return NextResponse.json({ error: "檔案上傳失敗" }, { status: 502 });
  }

  // 2. 呼叫 Gemini 分析
  let analysis;
  try {
    analysis = await analyzeContract(bytes.toString("base64"), mimeType);
  } catch (err) {
    console.error("Gemini 分析失敗", err);
    return NextResponse.json(
      { error: "AI 分析失敗", detail: err instanceof Error ? err.message : String(err), blobUrl },
      { status: 502 },
    );
  }

  // 3. 存進 MongoDB
  try {
    await connectToDatabase();
    const doc = await Contract.create({
      user: user.id,
      fileName: file.name,
      fileType: mimeType,
      fileSize: file.size,
      blobUrl,
      analysis,
      model: lastUsedModel,
    });

    return NextResponse.json({
      id: doc._id,
      fileName: doc.fileName,
      blobUrl: doc.blobUrl,
      analysis: doc.analysis,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("寫入資料庫失敗", err);
    // 分析成功但存檔失敗，仍回傳結果
    return NextResponse.json(
      { analysis, blobUrl, fileName: file.name, saved: false },
      { status: 200 },
    );
  }
}
