import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/session";

export interface CurrentUser {
  id: string;
  email: string;
}

/**
 * 讀取目前登入的使用者。
 * 未登入 / token 失效 / 使用者已被刪除 -> 回傳 null。
 * 只回傳安全欄位（不含 passwordHash）。
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session?.sub) return null;

  await connectToDatabase();
  const user = await User.findById(session.sub).select("_id email").lean();
  if (!user) return null;

  return { id: String(user._id), email: user.email };
}

/**
 * API 用的登入檢查。
 * 通過回傳 { user }；否則回傳 { response } —— 直接把它 return 出去即可。
 */
export async function requireUser(): Promise<
  { user: CurrentUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "請先登入" }, { status: 401 }),
    };
  }
  return { user, response: null };
}
