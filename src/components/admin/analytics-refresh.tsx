"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnalyticsRefresh() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      router.refresh();
      setUpdatedAt(new Date());
    }, 30000);
    return () => window.clearInterval(timer);
  }, [enabled, router]);

  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">
      <RefreshCw size={14} className={enabled ? "text-emerald-600" : "text-slate-400"} />
      <span>{enabled ? "30 秒自动同步" : "已暂停同步"}</span>
      <button type="button" className="font-black text-orange-700" onClick={() => setEnabled((value) => !value)}>
        {enabled ? "暂停" : "开启"}
      </button>
      <span className="hidden border-l border-slate-200 pl-2 sm:inline">{updatedAt.toLocaleTimeString()}</span>
    </div>
  );
}
