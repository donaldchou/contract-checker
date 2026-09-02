import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-bg-subtle">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-solid text-white">
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
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                AI 合約<span className="gradient-text">審查</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              上傳合約，讓 AI 為你摘要重點、標出風險條款並提供談判建議。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <div className="font-medium text-foreground">產品</div>
              <ul className="mt-3 space-y-2.5 text-muted">
                <li>
                  <Link href="/#features" className="transition-colors hover:text-foreground">
                    功能
                  </Link>
                </li>
                <li>
                  <Link href="/#how" className="transition-colors hover:text-foreground">
                    運作方式
                  </Link>
                </li>
                <li>
                  <Link href="/analyze" className="transition-colors hover:text-foreground">
                    開始審查
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-foreground">安全</div>
              <ul className="mt-3 space-y-2.5 text-muted">
                <li>
                  <Link href="/#privacy" className="transition-colors hover:text-foreground">
                    資料隱私
                  </Link>
                </li>
                <li>密碼 bcrypt 加密</li>
                <li>合約僅本人可見</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs leading-6 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} AI 合約審查</p>
          <p>本網站分析結果由 AI 生成，僅供參考，不構成正式法律意見。</p>
        </div>
      </div>
    </footer>
  );
}
