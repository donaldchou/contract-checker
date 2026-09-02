import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Contract } from "@/models/Contract";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "無效的 id" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    // 綁定會員：查詢時就限定 user，別人的合約會直接當成找不到
    const doc = await Contract.findOne({ _id: id, user: user.id }).lean();
    if (!doc) {
      return NextResponse.json({ error: "找不到合約" }, { status: 404 });
    }

    return NextResponse.json({
      id: String(doc._id),
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      blobUrl: doc.blobUrl,
      analysis: doc.analysis,
      model: doc.model,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("讀取合約失敗", err);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}
