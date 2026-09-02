import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/schemas/auth";
import { signSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

// POST /api/auth/register - 註冊：bcrypt 雜湊密碼 -> 存 MongoDB -> 直接建立 session
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join("、") },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    await connectToDatabase();

    if (await User.exists({ email })) {
      return NextResponse.json(
        { error: "這個 email 已經被註冊" },
        { status: 409 },
      );
    }

    // salt rounds = 10：安全與效能的常見折衷
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    const token = await signSession({ sub: String(user._id), email: user.email });
    await setSessionCookie(token);

    return NextResponse.json(
      { user: { id: String(user._id), email: user.email } },
      { status: 201 },
    );
  } catch (err) {
    // 併發下 unique index 仍可能擋下重複 email
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "這個 email 已經被註冊" },
        { status: 409 },
      );
    }
    console.error("註冊失敗", err);
    return NextResponse.json({ error: "註冊失敗" }, { status: 500 });
  }
}
