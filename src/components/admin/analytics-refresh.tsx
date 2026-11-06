"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnalyticsRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button type="button" className="button button-secondary" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      <RefreshCw size={16} aria-hidden="true" className={pending ? "motion-safe:animate-spin" : ""} />
      {pending ? "正在读取" : "刷新数据"}
    </button>
  );
}
