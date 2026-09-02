"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Me {
  id: string;
  email: string;
}

interface AuthContextValue {
  me: Me | null;
  /** 是否已經問過後端一次（避免畫面閃動） */
  ready: boolean;
  /** email/password 登入或註冊 */
  authenticate: (
    mode: "login" | "register",
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  /** 重新向後端確認登入狀態 */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  // cookie 是 http-only，重新整理後瀏覽器仍會自動帶上 -> 問一次後端即可保持登入
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json().catch(() => null);
      setMe(res.ok && data?.user ? data.user : null);
    } catch {
      setMe(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => null);
        if (!cancelled) setMe(res.ok && data?.user ? data.user : null);
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const authenticate = useCallback(
    async (mode: "login" | "register", email: string, password: string) => {
      try {
        const res = await fetch(`/api/auth/${mode}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          return { ok: false, error: data?.error ?? "操作失敗" };
        }
        setMe(data.user as Me);
        return { ok: true };
      } catch {
        return { ok: false, error: "網路錯誤，請稍後再試" };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ me, ready, authenticate, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必須在 <AuthProvider> 內使用");
  return ctx;
}
