"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-context";

type Severity = "high" | "medium" | "low";

interface RiskItem {
  clause: string;
  issue: string;
  severity: Severity;
  suggestion: string;
}

interface Analysis {
  summary: string;
  contractType: string;
  parties: string[];
  overallRisk: Severity;
  risks: RiskItem[];
  missingClauses: string[];
  recommendations: string[];
}

interface ContractRecord {
  id: string;
  fileName: string;
  blobUrl: string;
  analysis: Analysis;
  createdAt: string;
}

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "高風險",
  medium: "中風險",
  low: "低風險",
};

const SEVERITY_CLASS: Record<Severity, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const SEVERITY_DOT: Record<Severity, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.txt";
const MAX_SIZE = 10 * 1024 * 1024;

// BYOK：使用者自帶的 Gemini 金鑰只存在瀏覽器 localStorage，分析時經 header 送出、伺服器不留存
const KEY_STORAGE = "gemini-api-key";

function readStoredKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function maskKey(k: string): string {
  if (k.length <= 8) return "••••";
  return `${k.slice(0, 4)}••••${k.slice(-4)}`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ContractChecker() {
  const { me, ready } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContractRecord | null>(null);
  const [history, setHistory] = useState<ContractRecord[]>([]);
  const [apiKey, setApiKey] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 載入瀏覽器已儲存的金鑰（localStorage 只能在 client 讀，故放 effect）
  useEffect(() => {
    const stored = readStoredKey();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setApiKey(stored);
  }, []);

  const saveKey = useCallback((k: string) => {
    const trimmed = k.trim();
    setApiKey(trimmed);
    try {
      if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed);
      else localStorage.removeItem(KEY_STORAGE);
    } catch {
      /* 隱私模式等情況忽略 */
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts");
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.items ?? []);
    } catch {
      /* 略過歷史載入錯誤 */
    }
  }, []);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/contracts").catch(() => null);
      if (!res || !res.ok || cancelled) return;
      const data = await res.json().catch(() => null);
      if (data && !cancelled) setHistory(data.items ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [me]);

  // 登出後不顯示殘留資料（純畫面層過濾）
  const visibleHistory = me ? history : [];
  const visibleResult = me ? result : null;

  function pickFile(f: File | null) {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("檔案超過 10MB 上限");
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || loading) return;
    if (!me) {
      setError("請先從右上角登入或註冊，才能上傳合約。");
      return;
    }
    if (!apiKey.trim()) {
      setError("請先在下方輸入你自己的 Gemini API 金鑰。");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "x-gemini-api-key": apiKey.trim() },
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.error || "分析失敗");
        return;
      }

      setResult(data as ContractRecord);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
      <header className="animate-rise">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          <span className="h-px w-6 bg-brand/50" />
          合約審查
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          上傳一份合約
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-2">
          AI
          會站在你的立場摘要重點、逐條標出風險條款、指出缺漏並給談判建議。使用你自己的
          Gemini API 金鑰，支援 PDF、圖片與純文字，上限 10MB。
        </p>
      </header>

      {ready && !me && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand-weak px-5 py-4">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-solid text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 8v5M12 16h.01M12 3l9 16H3l9-16Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="text-sm leading-6">
            請先從右上角<span className="font-semibold">登入 / 註冊</span>
            。每份合約的分析結果只會綁定在你的帳號，其他人看不到。
          </p>
        </div>
      )}

      <ApiKeyCard apiKey={apiKey} onSave={saveKey} disabled={!me} />

      <form onSubmit={handleSubmit} className="mt-6">
        <label
          htmlFor="file"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragging
              ? "border-brand bg-brand-weak"
              : "border-border-strong bg-card hover:border-brand hover:bg-surface-2"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-weak text-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-sm font-medium">
            {file ? file.name : "拖曳檔案到這裡，或點擊選擇"}
          </span>
          <span className="text-xs text-muted">
            {file
              ? `${formatSize(file.size)} · 點擊可重新選擇`
              : "PDF、PNG、JPEG、WebP、純文字 · 上限 10MB"}
          </span>
          <input
            ref={inputRef}
            id="file"
            name="file"
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <button
          type="submit"
          disabled={!file || loading || (ready && !me) || !apiKey.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-solid px-4 py-3.5 text-sm font-semibold text-white shadow-elev-md transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "AI 審查中…（可能需 20–40 秒）" : "開始審查"}
        </button>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-300">
            {error}
          </p>
        )}
      </form>

      {visibleResult && <ResultView record={visibleResult} />}

      {visibleHistory.length > 0 && (
        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
            歷史審查紀錄
          </h2>
          <ul className="mt-4 space-y-2.5">
            {visibleHistory.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => {
                    setResult(h);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-all hover:-translate-y-px hover:border-border-strong hover:shadow-elev-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {h.fileName}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(h.createdAt).toLocaleString("zh-TW")} ·{" "}
                      {h.analysis.contractType || "未分類"}
                    </span>
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${SEVERITY_CLASS[h.analysis.overallRisk]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[h.analysis.overallRisk]}`}
                    />
                    {SEVERITY_LABEL[h.analysis.overallRisk]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ApiKeyCard({
  apiKey,
  onSave,
  disabled,
}: {
  apiKey: string;
  onSave: (k: string) => void;
  disabled?: boolean;
}) {
  const [forceEdit, setForceEdit] = useState(false);
  const [draft, setDraft] = useState("");

  const hasKey = apiKey.trim().length > 0;
  const editing = forceEdit || !hasKey;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-weak text-brand">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M14 7a4 4 0 1 1-3.9 5H7v3H4v-3l6.1-.1A4 4 0 0 1 14 7Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="text-sm font-semibold">Gemini API 金鑰</h2>
        {hasKey && !editing && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            已設定
          </span>
        )}
      </div>

      {hasKey && !editing ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs">
            {maskKey(apiKey)}
          </code>
          <button
            type="button"
            onClick={() => {
              setDraft("");
              setForceEdit(true);
            }}
            className="text-xs font-medium text-brand hover:underline"
          >
            更換
          </button>
          <button
            type="button"
            onClick={() => {
              onSave("");
              setDraft("");
              setForceEdit(false);
            }}
            className="text-xs font-medium text-muted hover:text-foreground"
          >
            清除
          </button>
        </div>
      ) : (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            onSave(draft);
            setDraft("");
            setForceEdit(false);
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              autoComplete="off"
              placeholder="貼上你的 Gemini API 金鑰"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={disabled}
              className="flex-1 rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={disabled || !draft.trim()}
              className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
            >
              儲存
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  setForceEdit(false);
                }}
                className="rounded-lg border border-border-strong px-4 py-2.5 text-sm transition-colors hover:bg-surface-2"
              >
                取消
              </button>
            )}
          </div>
        </form>
      )}

      <p className="mt-3 text-xs leading-5 text-muted">
        金鑰只會儲存在<span className="font-medium">你的瀏覽器</span>
        ，分析時直接送到 Google，不會存進我們的伺服器或資料庫。可到{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand hover:underline"
        >
          Google AI Studio
        </a>{" "}
        免費申請。
      </p>
    </section>
  );
}

function ResultView({ record }: { record: ContractRecord }) {
  const a = record.analysis;
  return (
    <article className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-elev-md">
      <div className="border-b border-border bg-surface-2 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {record.fileName}
            </h2>
            <a
              href={record.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              開啟原始檔案
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M7 17 17 7M9 7h8v8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${SEVERITY_CLASS[a.overallRisk]}`}
          >
            <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[a.overallRisk]}`} />
            整體 {SEVERITY_LABEL[a.overallRisk]}
          </span>
        </div>
      </div>

      <div className="space-y-7 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="合約類型" value={a.contractType || "—"} />
          <Field label="當事人" value={a.parties.join("、") || "—"} />
        </div>

        <Section title="摘要">
          <p className="whitespace-pre-wrap text-sm leading-7 text-ink-2">
            {a.summary}
          </p>
        </Section>

        {a.risks.length > 0 && (
          <Section title={`風險條款（${a.risks.length}）`}>
            <ul className="space-y-3">
              {a.risks.map((r, i) => (
                <li key={i} className="rounded-xl border border-border p-4">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_CLASS[r.severity]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[r.severity]}`}
                      />
                      {SEVERITY_LABEL[r.severity]}
                    </span>
                    {r.clause && (
                      <span className="text-xs text-muted">{r.clause}</span>
                    )}
                  </div>
                  <p className="text-sm leading-7">{r.issue}</p>
                  {r.suggestion && (
                    <p className="mt-2.5 rounded-lg bg-brand-weak px-3 py-2.5 text-sm leading-7">
                      <span className="font-medium">建議：</span>
                      {r.suggestion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {a.missingClauses.length > 0 && (
          <Section title="建議補充的條款">
            <ul className="space-y-2 text-sm leading-7 text-ink-2">
              {a.missingClauses.map((c, i) => (
                <li key={i} className="flex gap-2.5">
                  <Dot />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {a.recommendations.length > 0 && (
          <Section title="整體建議">
            <ul className="space-y-2 text-sm leading-7 text-ink-2">
              {a.recommendations.map((c, i) => (
                <li key={i} className="flex gap-2.5">
                  <Dot />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <p className="border-t border-border pt-4 text-xs text-muted">
          本結果由 AI 生成，僅供參考，不構成正式法律意見。
        </p>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}

function Dot() {
  return (
    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
  );
}
