import Link from "next/link";
import type { DateRangePreset } from "@/lib/admin-listing";

const options: Array<{ value: DateRangePreset; label: string }> = [
  { value: "today", label: "今天" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
  { value: "last30", label: "最近 30 天" },
  { value: "custom", label: "自定义" },
  { value: "all", label: "全部" },
];

function hrefFor(pathname: string, values: Record<string, string>, preset: DateRangePreset) {
  const params = new URLSearchParams(values);
  params.set("range", preset);
  params.delete("page");
  if (preset !== "custom") {
    params.delete("from");
    params.delete("to");
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function DateRangeFilter({
  pathname,
  query,
  preset,
  from,
  to,
  compact = false,
}: {
  pathname: string;
  query: Record<string, string | undefined>;
  preset: DateRangePreset;
  from: string;
  to: string;
  compact?: boolean;
}) {
  const values = Object.fromEntries(Object.entries(query).filter(([, value]) => Boolean(value))) as Record<string, string>;

  return (
    <div className={compact ? "grid gap-2" : "grid gap-3"}>
      <div className="flex flex-wrap gap-2" aria-label="时间范围">
        {options.map((item) => (
          <Link
            key={item.value}
            href={hrefFor(pathname, values, item.value)}
            className={preset === item.value
              ? "rounded-md bg-[var(--navy-950)] px-3 py-2 text-xs font-black text-white"
              : "rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:border-orange-300 hover:text-orange-700"}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className={compact ? "grid gap-2" : "grid gap-2 sm:grid-cols-3"}>
        <select
          name="range"
          defaultValue={preset}
          className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900"
          aria-label="日期范围模式"
        >
          {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <input type="date" name="from" defaultValue={from} className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900" aria-label="开始日期" />
        <input type="date" name="to" defaultValue={to} className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900" aria-label="结束日期" />
      </div>
      <p className="text-xs font-bold text-slate-500">可快捷切换预设范围，或选择“自定义”并填写日期后应用筛选。日期按后台时区计算。</p>
    </div>
  );
}
