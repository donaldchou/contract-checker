import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("請在 .env.local 設定 JWT_SECRET");
}

const encodedKey = new TextEncoder().encode(JWT_SECRET);

/** http-only cookie 名稱 */
export const SESSION_COOKIE = "session";

/** session 有效天數 */
const SESSION_DAYS = 7;
const MAX_AGE = SESSION_DAYS * 24 * 60 * 60; // 秒

export type SessionPayload = {
  sub: string; // user id
  email: string;
};

/** 產生一個 HS256 簽章的 JWT */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(encodedKey);
}

/** 驗證 JWT，失敗（過期 / 竄改 / 無 token）回傳 null */
export async function verifySession(
  token: string | undefined,
): Promise<(SessionPayload & { iat: number; exp: number }) | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload & { iat: number; exp: number };
  } catch {
    return null;
  }
}

/** 把 JWT 寫進 http-only cookie（只能在 Route Handler / Server Action 呼叫） */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // JS 讀不到，降低 XSS 風險
    secure: process.env.NODE_ENV === "production", // 正式環境只走 https
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** 清掉 session cookie（登出用） */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** 從當前請求的 cookie 取出並驗證 session */
export async function getSession() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}
