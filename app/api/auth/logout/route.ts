import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

// POST /api/auth/logout - 登出：清掉 session cookie
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
