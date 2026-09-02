"use client";

import Link from "next/link";
import { useAuth } from "@/app/auth-context";

/**
 * 導向 /analyze 的主要行動按鈕，文案依登入狀態調整。
 */
export default function StartButton({
  size = "md",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const { me, ready } = useAuth();

  const label = !ready
    ? "開始審查合約"
    : me
      ? "前往合約審查"
      : "免費開始 · 上傳第一份合約";

  const sizeCls =
    size === "lg"
      ? "px-6 py-3.5 text-[15px]"
      : "px-5 py-3 text-sm";

  return (
    <Link
      href="/analyze"
      className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-solid font-semibold text-white shadow-elev-md transition-all hover:bg-brand-hover hover:shadow-elev-lg hover:-translate-y-0.5 ${sizeCls} ${className}`}
    >
      {label}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="transition-transform group-hover:translate-x-0.5"
      >
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
