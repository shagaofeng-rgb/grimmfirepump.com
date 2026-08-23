import Link from "next/link";
import { Activity, ArrowDownRight, MousePointerClick } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsRefresh } from "@/components/admin/analytics-refresh";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { filterAnalyticsEvents, getAnalyticsSummary, paginate, type AnalyticsFilters } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function linkFor(filters: AnalyticsFilters, patch: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  const values = { ...filters, ...patch };
  for (const [key, value] of Object.entries(values)) if (value && value !== "all") query.set(key, String(value));
  const rendered = query.toString();
  return rendered ? `/admin/analytics?${rendered}` : "/admin/analytics";
}

function MiniList({ items, empty }: { items: Array<[string, number]>; empty: string }) {
  if (!items.length) return <EmptyState text={empty} />;
  const max = Math.max(...items.map(([, count]) => count), 1);
  return <div className="grid gap-3">{items.map(([label, count]) => (
    <div key={label} className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-bold text-slate-700">{label}</span><strong className="text-slate-950">{count}</strong></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(8, Math.round((count / max) * 100))}%` }} /></div>
    </div>
  )}</div>;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: AnalyticsFilters = {
    from: param(params, "from"),
    to: param(params, "to"),
    country: param(params, "country") || "all",
    channel: param(params, "channel") || "all",
    traffic: (param(params, "traffic") || "real") as AnalyticsFilters["traffic"],
    query: param(params, "query"),
  };
  const page = Math.max(1, Number(param(params, "page") || "1"));
  const pageSize = Number(param(params, "pageSize") || "25");
  const { events } = await getAdminData();
  const summary = getAnalyticsSummary(events, filters);
  const visibleEvents = filterAnalyticsEvents(events, filters).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const paged = paginate(visibleEvents, page, pageSize);
  const availableCountries = [...new Map(events.filter((event) => event.countryCode).map((event) => [event.countryCode || "", event.country || event.countryCode || "Unknown"])).entries()];
  const availableChannels = [...new Set(events.map((event) => event.channel).filter(Boolean))] as string[];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="真实流量分析"
        title="访客、来源和转化运营中心"
        description="默认隐藏预览、Collects/自动化与已配置测试流量。访客数据每 30 秒同步一次，可从指标直接下钻。"
        action={<AnalyticsRefresh />}
      />

      <section className="mt-8 overflow-hidden rounded-xl bg-[#091b32] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Traffic intelligence</p>
            <h2 className="mt-2 text-2xl font-black">筛选真实访客数据</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">筛选会同时作用于指标、趋势、访客活动和导出结果。测试与机器人流量不会混入默认经营数据。</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <span className="text-slate-300">已过滤非真实事件</span>
            <strong className="ml-2 text-lg text-orange-300">{summary.filteredEvents}</strong>
          </div>
        </div>
        <form className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6" method="get">
          <input type="date" name="from" defaultValue={filters.from} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900" aria-label="开始日期" />
          <input type="date" name="to" defaultValue={filters.to} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900" aria-label="结束日期" />
          <select name="country" defaultValue={filters.country} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900"><option value="all">全部国家</option>{availableCountries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
          <select name="channel" defaultValue={filters.channel} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900"><option value="all">全部渠道</option>{availableChannels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}</select>
          <select name="traffic" defaultValue={filters.traffic} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900"><option value="real">真实流量</option><option value="test">测试流量</option><option value="bot">机器人流量</option><option value="all">全部流量</option></select>
          <div className="flex gap-2"><input name="query" defaultValue={filters.query} placeholder="页面、IP、来源..." className="min-h-11 min-w-0 flex-1 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900" /><button className="button button-primary min-h-11" type="submit">应用筛选</button></div>
        </form>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="真实独立访客" value={summary.uniqueVisitors} hint="按首方 visitor ID 去重" />
        <StatCard label="访问会话" value={summary.uniqueSessions} hint="每次浏览器会话独立统计" />
        <StatCard label="页面浏览" value={summary.pageViews.length} hint="当前筛选范围内" />
        <StatCard label="回访访客" value={summary.returningVisitors} hint="访问次数大于 1" />
        <StatCard label="转化动作" value={summary.conversions.length} hint="询盘、下载、WhatsApp、报价" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminCard title="实时真实访客活动">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><span className="flex items-center gap-2"><Activity size={16} /> 自动刷新中</span><span>{summary.recentActivity.length} 条最近活动</span></div>
          <div className="grid gap-3">
            {summary.recentActivity.map((event) => (
              <div key={event.id} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                <div className="text-xs font-bold text-slate-500">{formatDate(event.createdAt)}<br />{event.country || "Unknown"} · {event.ipMasked || "IP 已隐藏"}</div>
                <div className="min-w-0"><p className="truncate font-black text-slate-900">{event.path || "/"}</p><p className="mt-1 truncate text-xs text-slate-500">{event.channel || "Direct"} · {event.referrer || "无外部来源"} · 第 {event.visitNumber || 1} 次访问</p></div>
                <span className="w-fit rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">{event.event}</span>
              </div>
            ))}
            {!summary.recentActivity.length ? <EmptyState text="当前筛选条件下暂无真实访客活动。新的访问会在此实时出现。" /> : null}
          </div>
        </AdminCard>

        <section className="grid gap-6">
          <AdminCard title="来源渠道"><MiniList items={summary.channels} empty="暂无渠道数据。" /></AdminCard>
          <AdminCard title="国家 / 地区"><MiniList items={summary.countries} empty="暂无地理数据。" /></AdminCard>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdminCard title="热门页面"><MiniList items={summary.topPages} empty="暂无页面访问。" /></AdminCard>
        <AdminCard title="筛选说明">
          <div className="grid gap-4 text-sm leading-6 text-slate-600">
            <p><strong className="text-slate-900">真实流量：</strong>生产域名上的人工访问；预览、localhost、已排除 IP/UA 与自动化访问会被独立标记。</p>
            <p><strong className="text-slate-900">数据隐私：</strong>报表仅显示脱敏 IP。国家由 Vercel 请求头识别；历史事件缺少会话和国家时不会被补造。</p>
            <Link href="/admin/settings" className="font-black text-orange-700">管理统计工具与流量规则 <ArrowDownRight className="inline" size={15} /></Link>
          </div>
        </AdminCard>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font-black text-orange-700">访客事件明细</p><h2 className="mt-1 text-xl font-black text-slate-950">可筛选、可分页的访问记录</h2></div>
          <div className="flex items-center gap-3">
            <form method="get" className="flex items-center gap-2"><input type="hidden" name="from" value={filters.from} /><input type="hidden" name="to" value={filters.to} /><input type="hidden" name="country" value={filters.country} /><input type="hidden" name="channel" value={filters.channel} /><input type="hidden" name="traffic" value={filters.traffic} /><input type="hidden" name="query" value={filters.query} /><select name="pageSize" defaultValue={String(paged.pageSize)} className="min-h-10 rounded-md border border-slate-200 px-2 text-sm"><option value="20">20 / 页</option><option value="25">25 / 页</option><option value="50">50 / 页</option><option value="100">100 / 页</option></select><button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold" type="submit">更新</button></form>
            <a className="button button-secondary min-h-10 text-sm" href="/api/admin/export?type=events">导出 CSV</a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">时间 / 访客</th><th className="px-5 py-3">页面</th><th className="px-5 py-3">国家 / IP</th><th className="px-5 py-3">渠道</th><th className="px-5 py-3">行为</th><th className="px-5 py-3">类型</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{paged.items.map((event) => <tr key={event.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><strong className="block text-slate-900">{formatDate(event.createdAt)}</strong><span className="text-xs text-slate-500">第 {event.visitNumber || 1} 次 · {event.visitorId?.slice(0, 8) || "历史记录"}</span></td><td className="max-w-[280px] px-5 py-4"><span className="block truncate font-bold text-slate-800">{event.path || "/"}</span><span className="block truncate text-xs text-slate-500">{event.label || "—"}</span></td><td className="px-5 py-4">{event.country || "Unknown"}<span className="block text-xs text-slate-500">{event.ipMasked || "—"}</span></td><td className="px-5 py-4">{event.channel || "Direct"}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700"><MousePointerClick size={13} />{event.event}</span></td><td className="px-5 py-4"><span className={event.trafficType === "real" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600"}>{event.trafficType || "real"}</span></td></tr>)}</tbody>
          </table>
          {!paged.items.length ? <div className="p-5"><EmptyState text="没有符合条件的访问记录。" /></div> : null}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>第 {paged.page} / {paged.totalPages} 页，共 {paged.total} 条</span><div className="flex gap-2"><Link aria-disabled={paged.page <= 1} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={linkFor(filters, { page: paged.page - 1, pageSize: paged.pageSize })}>上一页</Link><Link aria-disabled={paged.page >= paged.totalPages} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={linkFor(filters, { page: paged.page + 1, pageSize: paged.pageSize })}>下一页</Link></div></div>
      </section>
    </AdminShell>
  );
}
