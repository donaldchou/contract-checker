import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Contract } from "@/models/Contract";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  try {
    await connectToDatabase();
    // 只回傳目前登入會員自己的合約
    const docs = await Contract.find({ user: user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      items: docs.map((d) => ({
        id: String(d._id),
        fileName: d.fileName,
        blobUrl: d.blobUrl,
        analysis: d.analysis,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error("讀取合約列表失敗", err);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}
