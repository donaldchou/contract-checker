import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/schemas/auth";
import { signSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

// POST /api/auth/login - 登入：比對密碼 -> 建立 JWT -> 寫入 http-only cookie
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join("、") },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    await connectToDatabase();

    // passwordHash 預設 select:false，比對時要明確帶出來
    const user = await User.findOne({ email }).select("+passwordHash");

    // 查無此人或密碼錯都回一樣訊息，避免洩漏哪個 email 有註冊
    const match =
      user?.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash));
    if (!user || !match) {
      return NextResponse.json(
        { error: "email 或密碼錯誤" },
        { status: 401 },
      );
    }

    const token = await signSession({ sub: String(user._id), email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: String(user._id), email: user.email },
    });
  } catch (err) {
    console.error("登入失敗", err);
    return NextResponse.json({ error: "登入失敗" }, { status: 500 });
  }
}
