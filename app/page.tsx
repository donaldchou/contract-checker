import Link from "next/link";
import StartButton from "./components/StartButton";
import Reveal from "./components/Reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <SampleSection />
      <Privacy />
      <CtaBand />
    </>
  );
}

/* ============================================================ Hero */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="glow left-1/2 top-[-12rem] h-[28rem] w-[42rem] -translate-x-1/2 bg-[#8b5cf6]" />
      <div className="glow left-[8%] top-[2rem] h-[20rem] w-[20rem] bg-[#6366f1]" />
      <div className="glow right-[6%] top-[6rem] h-[18rem] w-[18rem] bg-[#d946ef]" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            繁體中文 · 自帶 Gemini 金鑰
          </span>

          <h1 className="animate-rise mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            簽約前，先讓 AI
            <br className="hidden sm:block" />
            <span className="gradient-text"> 幫你抓出風險條款</span>
          </h1>

          <p className="animate-rise mx-auto mt-6 max-w-xl text-base leading-7 text-ink-2 sm:text-lg">
            上傳勞動契約、租賃、採購或保密協議，AI
            會站在你的立場摘要重點、逐條標出對你不利的條款、指出缺漏，並給出具體談判建議。
          </p>

          <div className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <StartButton size="lg" />
            <Link
              href="/#how"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong px-5 py-3.5 text-[15px] font-medium transition-colors hover:bg-surface-2"
            >
              看看運作方式
            </Link>
          </div>

          <p className="animate-rise mt-4 text-xs text-muted">
            免費註冊 · 每份合約只有你自己看得到
          </p>
        </div>

        <Reveal className="mx-auto mt-16 max-w-3xl" delay={120}>
          <SampleReport />
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ Logos / trust */
function LogosStrip() {
  const items: [string, string][] = [
    ["~6 秒", "端到端分析"],
    ["5 種", "檔案格式支援"],
    ["10MB", "單檔上限"],
    ["100%", "繁體中文輸出"],
  ];
  return (
    <section className="border-y border-border bg-bg-subtle">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden px-5 sm:grid-cols-4 sm:px-8">
        {items.map(([big, small]) => (
          <div key={small} className="px-2 py-8 text-center">
            <div className="text-2xl font-semibold tracking-tight">{big}</div>
            <div className="mt-1 text-xs text-muted">{small}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ Features */
const FEATURES = [
  {
    icon: <IconShield />,
    title: "風險條款逐條標示",
    body: "找出對你不利、模糊或有法律爭議的條款，標上高／中／低風險等級，並解釋問題出在哪。",
  },
  {
    icon: <IconMagnifier />,
    title: "缺漏條款提醒",
    body: "比對常見合約應有的保護條款，指出這份合約少了什麼，例如違約金上限、保固範圍、解約機制。",
  },
  {
    icon: <IconChat />,
    title: "具體談判建議",
    body: "不只說「這裡有風險」，還會給出可以直接拿去談的修改方向與替代條文說法。",
  },
  {
    icon: <IconDoc />,
    title: "重點摘要與當事人",
    body: "先用幾句話讓你掌握合約類型、雙方角色與核心義務，再深入細節。",
  },
  {
    icon: <IconLock />,
    title: "資料綁定你的帳號",
    body: "每份上傳的合約與分析結果只綁定在你的帳號，其他使用者完全看不到。",
  },
  {
    icon: <IconBolt />,
    title: "快速且穩定",
    body: "主模型遇到流量限制會自動退回備援模型，多數合約數秒內就有結果。",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
      <Reveal className="max-w-2xl">
        <SectionKicker>功能</SectionKicker>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          像請了一位隨時待命的合約律師
        </h2>
        <p className="mt-4 text-base leading-7 text-ink-2">
          AI 以「委託審閱的那一方」的立場閱讀整份合約，把散落各處的風險整理成一份好讀的報告。
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 80}>
            <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-border-strong hover:shadow-elev-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-weak text-brand transition-transform group-hover:scale-105">
                {f.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ How it works */
const STEPS = [
  {
    n: "01",
    title: "註冊並登入",
    body: "用 email 與密碼建立帳號。密碼以 bcrypt 加密儲存，登入後以 cookie 保持登入狀態。",
  },
  {
    n: "02",
    title: "填入你的 Gemini 金鑰並上傳",
    body: "貼上你自己的 Gemini API 金鑰（只存在瀏覽器），選擇合約檔案，支援 PDF、圖片與純文字，最大 10MB。",
  },
  {
    n: "03",
    title: "取得風險報告",
    body: "數秒後得到摘要、風險條款清單、缺漏提醒與談判建議，並保存在你的歷史紀錄中。",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-bg-subtle">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="max-w-2xl">
          <SectionKicker>運作方式</SectionKicker>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            三個步驟，從上傳到報告
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-7">
                <div className="gradient-text text-4xl font-semibold tracking-tight">
                  {step.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ Sample */
function SampleSection() {
  const points = [
    "風險依嚴重程度分級，一眼看出該先處理哪一條",
    "每條風險都附上可直接使用的修改建議",
    "歷史紀錄隨時回看，比較不同版本的合約",
  ];
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionKicker>報告長什麼樣</SectionKicker>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            清楚、可行動的分析結果
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-2">
            每份報告都用一致的結構呈現：整體風險等級、逐條風險說明與建議、應補上的條款，以及簽約前的行動清單。
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {points.map((t) => (
              <li key={t} className="flex gap-3">
                <IconCheck />
                <span className="text-ink-2">{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <StartButton />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <SampleReport />
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ Privacy */
function Privacy() {
  const cards: [string, string][] = [
    ["自帶金鑰", "Gemini API 金鑰只存在你的瀏覽器，分析時直接送到 Google，不進我們的伺服器。"],
    ["密碼加密", "以 bcrypt 雜湊儲存，資料庫外洩也無法還原明碼。"],
    ["安全登入", "session 存在 http-only cookie，JavaScript 無法讀取。"],
    ["資料隔離", "查詢一律綁定你的帳號 ID，別人的合約對你等同不存在。"],
  ];
  return (
    <section id="privacy" className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12">
          <div className="glow right-[-4rem] top-[-6rem] h-64 w-64 bg-[#6366f1]" />
          <div className="relative">
            <SectionKicker>隱私與安全</SectionKicker>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              你的金鑰與合約，只有你看得到
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(([t, b]) => (
                <div key={t}>
                  <div className="text-sm font-semibold">{t}</div>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================ CTA band */
function CtaBand() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-bg-subtle px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
          <div className="glow left-1/2 top-[-8rem] h-72 w-[36rem] -translate-x-1/2 bg-[#8b5cf6]" />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              現在就上傳你的第一份合約
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-ink-2">
              花不到一分鐘註冊，讓 AI 在你簽名之前先看過一遍。
            </p>
            <div className="mt-8 flex justify-center">
              <StartButton size="lg" />
            </div>
            <p className="mt-6 text-xs text-muted">
              分析結果由 AI 生成，僅供參考，不構成正式法律意見。
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================ bits */
function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
      <span className="h-px w-6 bg-brand/50" />
      {children}
    </span>
  );
}

function SampleReport() {
  const counts: [string, string][] = [
    ["風險條款", "5"],
    ["建議補充", "3"],
    ["行動建議", "4"],
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elev-lg">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 truncate text-xs text-muted">
          委外技術服務合約書.pdf
        </span>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted">合約類型</div>
            <div className="text-sm font-semibold">委外技術服務契約</div>
          </div>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
            整體 高風險
          </span>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
              高風險
            </span>
            <span className="text-xs text-muted">第 8 條 · 智慧財產權</span>
          </div>
          <p className="text-sm leading-6">
            所有成果著作權「無條件」歸委託方所有，未保留承包方既有元件的授權，日後可能構成侵權。
          </p>
          <p className="mt-2 rounded-lg bg-brand-weak px-3 py-2 text-sm leading-6">
            <span className="font-medium">建議：</span>
            加入「承包方既有智慧財產仍屬承包方，並授予委託方非專屬使用權」的但書。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {counts.map(([t, n]) => (
            <div key={t} className="rounded-lg border border-border py-2.5">
              <div className="text-base font-semibold">{n}</div>
              <div className="mt-0.5 text-muted">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- icons ---- */
const s = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}
function IconShield() {
  return (
    <IconBase>
      <path d="M12 3 5 5.5v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9v-5L12 3Z" {...s} />
      <path d="m9 12 2 2 4-4.5" {...s} />
    </IconBase>
  );
}
function IconMagnifier() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="6" {...s} />
      <path d="m20 20-3.5-3.5" {...s} />
    </IconBase>
  );
}
function IconChat() {
  return (
    <IconBase>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4V6Z" {...s} />
      <path d="M8 9h8M8 12h5" {...s} />
    </IconBase>
  );
}
function IconDoc() {
  return (
    <IconBase>
      <path d="M7 3h7l4 4v14H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" {...s} />
      <path d="M14 3v4h4M9 12h6M9 16h6" {...s} />
    </IconBase>
  );
}
function IconLock() {
  return (
    <IconBase>
      <rect x="5" y="10" width="14" height="10" rx="2" {...s} />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" {...s} />
    </IconBase>
  );
}
function IconBolt() {
  return (
    <IconBase>
      <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" {...s} />
    </IconBase>
  );
}
function IconCheck() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-weak text-brand">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="m5 12 4 4 10-11" {...s} />
      </svg>
    </span>
  );
}
