"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";

const NAV = [
  { href: "/#features", label: "功能" },
  { href: "/#how", label: "運作方式" },
  { href: "/#privacy", label: "隱私" },
];

export default function Header() {
  const { me, ready, authenticate, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function reset() {
    setEmail("");
    setPassword("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await authenticate(mode, email.trim(), password);
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      reset();
    } else {
      setError(res.error ?? "操作失敗");
    }
  }

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-background/0"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-solid text-white shadow-elev-sm transition-transform group-hover:-rotate-6">
            <LogoMark />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            AI 合約<span className="gradient-text">審查</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex items-center gap-2">
          <Link
            href="/analyze"
            onClick={() => setOpen(false)}
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-brand sm:block"
          >
            合約審查
          </Link>

          {!ready ? (
            <span className="h-9 w-24 animate-pulse rounded-lg bg-surface-2" />
          ) : me ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden max-w-[11rem] truncate text-sm text-muted lg:inline">
                {me.email}
              </span>
              <button
                onClick={() => logout()}
                className="rounded-lg border border-border-strong px-3 py-2 text-sm transition-colors hover:bg-surface-2"
              >
                登出
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setOpen((v) => !v);
                reset();
              }}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-px active:translate-y-0"
            >
              登入 / 註冊
            </button>
          )}

          {open && !me && (
            <>
              <button
                aria-label="關閉"
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute right-0 top-[calc(100%+0.6rem)] z-20 w-[19rem] rounded-2xl border border-border bg-card p-5 shadow-elev-lg">
                <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 text-sm">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m);
                        setError(null);
                      }}
                      className={`rounded-lg py-1.5 font-medium transition-colors ${
                        mode === m
                          ? "bg-card text-foreground shadow-elev-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {m === "login" ? "登入" : "註冊"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand"
                  />
                  <input
                    type="password"
                    required
                    autoComplete={
                      mode === "register" ? "new-password" : "current-password"
                    }
                    placeholder={
                      mode === "register" ? "設定密碼（至少 8 碼）" : "密碼"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-lg bg-brand-solid px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    {busy
                      ? "處理中…"
                      : mode === "register"
                        ? "建立帳號"
                        : "登入"}
                  </button>
                </form>

                {error && (
                  <p className="mt-2.5 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <p className="mt-3 text-xs leading-5 text-muted">
                  密碼以 bcrypt 加密儲存，登入狀態以 http-only cookie 保持。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5 2.5 3.8v4c0 3.4 2.3 5.6 5.5 6.7 3.2-1.1 5.5-3.3 5.5-6.7v-4L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m5.7 8 1.7 1.7L10.6 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
