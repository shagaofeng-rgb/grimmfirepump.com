import Link from "next/link";
import { Activity, ArrowRight, MousePointerClick, UserRound } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AnalyticsRefresh } from "@/components/admin/analytics-refresh";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt, resolveDateRange } from "@/lib/admin-listing";
import { filterAnalyticsEvents, getAnalyticsSummary, getVisitorProfiles, paginate, type AnalyticsFilters } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function MiniList({ items, empty }: { items: Array<[string, number]>; empty: string }) {
  if (!items.length) return <EmptyState text={empty} />;
  const max = Math.max(...items.map(([, count]) => count), 1);
  return <div className="grid gap-3">{items.map(([label, count]) => <div key={label} className="grid gap-2"><div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-bold text-slate-700">{label}</span><strong className="text-slate-950">{count}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(8, Math.round((count / max) * 100))}%` }} /></div></div>)}</div>;
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const range = resolveDateRange(param(params, "range"), {
    from: param(params, "from"),
    to: param(params, "to"),
    timeZone: settings.timezone || "Asia/Shanghai",
  });
  const filters: AnalyticsFilters = {
    from: range.from,
    to: range.to,
    country: param(params, "country") || "all",
    channel: param(params, "channel") || "all",
    traffic: "real",
    query: param(params, "query"),
  };
  const page = parsePositiveInt(param(params, "page"));
  const visitorPage = parsePositiveInt(param(params, "visitorPage"));
  const pageSize = paginationPageSize(param(params, "pageSize"));
  const { events } = await getAdminData();
  const summary = getAnalyticsSummary(events, filters);
  const visibleEvents = filterAnalyticsEvents(events, filters).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const profiles = getVisitorProfiles(events, filters);
  const pagedEvents = paginate(visibleEvents, page, pageSize);
  const pagedProfiles = paginate(profiles, visitorPage, pageSize);
  const availableCountries = [...new Map(events.filter((event) => event.countryCode).map((event) => [event.countryCode || "", event.country || event.countryCode || "Unknown"])).entries()];
  const availableChannels = [...new Set(events.map((event) => event.channel).filter(Boolean))] as string[];
  const baseQuery = { range: range.preset, from: range.from, to: range.to, country: filters.country, channel: filters.channel, traffic: filters.traffic, query: filters.query, pageSize: String(pageSize) };

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="访客分析" title="访客、来源和转化运营中心" description="按统一时间范围查看正常网站访问、客户来源与访问路径。" action={<AnalyticsRefresh />} />

      <section className="mt-8 overflow-hidden rounded-xl bg-[#091b32] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Visitor overview</p><h2 className="mt-2 text-2xl font-black">统一查看网站访问数据</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">时间、国家、来源渠道会同时作用于指标、客户档案、事件与导出。</p></div><div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm"><span className="text-slate-300">当前数据范围</span><strong className="ml-2 text-lg text-orange-300">正常网站访问</strong></div></div>
        <form className="mt-6 grid gap-3 xl:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]" method="get">
          <DateRangeFilter pathname="/admin/analytics" query={baseQuery} preset={range.preset} from={range.from} to={range.to} compact />
          <select name="country" defaultValue={filters.country} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900"><option value="all">全部国家</option>{availableCountries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select>
          <select name="channel" defaultValue={filters.channel} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900"><option value="all">全部渠道</option>{availableChannels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}</select>
          <div className="flex gap-2 xl:col-span-2"><input name="query" defaultValue={filters.query} placeholder="页面、访客或来源..." className="min-h-11 min-w-0 flex-1 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900" /><button className="button button-primary min-h-11" type="submit">应用筛选</button></div>
        </form>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="真实独立访客" value={summary.uniqueVisitors} hint="按首方 visitor ID 去重" />
        <StatCard label="访问会话" value={summary.uniqueSessions} hint="每次浏览器会话独立统计" />
        <StatCard label="页面浏览" value={summary.pageViews.length} hint={range.label} />
        <StatCard label="回访访客" value={summary.returningVisitors} hint="访问次数大于 1" />
        <StatCard label="转化动作" value={summary.conversions.length} hint="询盘、下载、WhatsApp、报价" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminCard title="实时真实访客活动">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><span className="flex items-center gap-2"><Activity size={16} /> 最近访客活动</span><span>{summary.recentActivity.length} 条最近活动</span></div>
          <div className="grid gap-3">{summary.recentActivity.map((event) => <div key={event.id} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[120px_1fr_auto] sm:items-center"><div className="text-xs font-bold text-slate-500">{formatDate(event.createdAt)}<br />{event.country || "Unknown"} · {event.ipMasked || "IP 已隐藏"}</div><div className="min-w-0">{event.visitorId ? <Link href={`/admin/analytics/visitors/${encodeURIComponent(event.visitorId)}?range=${range.preset}&from=${range.from}&to=${range.to}`} className="block truncate font-black text-slate-900 hover:text-orange-700">{event.path || "/"}</Link> : <p className="truncate font-black text-slate-900">{event.path || "/"}</p>}<p className="mt-1 truncate text-xs text-slate-500">{event.channel || "Direct"} · {event.referrer || "无外部来源"} · 第 {event.visitNumber || 1} 次访问</p></div><span className="w-fit rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">{event.event}</span></div>)}{!summary.recentActivity.length ? <EmptyState text="当前筛选条件下暂无真实访客活动。" /> : null}</div>
        </AdminCard>
        <section className="grid gap-6"><AdminCard title="来源渠道"><MiniList items={summary.channels} empty="暂无渠道数据。" /></AdminCard><AdminCard title="国家 / 地区"><MiniList items={summary.countries} empty="暂无地理数据。" /></AdminCard></section>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-black text-orange-700">访客中心</p><h2 className="mt-1 text-xl font-black text-slate-950">按客户归属查看完整访问路径</h2></div><form method="get" className="flex gap-2"><input type="hidden" name="range" value={range.preset} /><input type="hidden" name="from" value={range.from} /><input type="hidden" name="to" value={range.to} /><input type="hidden" name="country" value={filters.country} /><input type="hidden" name="channel" value={filters.channel} /><input type="hidden" name="traffic" value={filters.traffic} /><input type="hidden" name="query" value={filters.query} /><select name="pageSize" defaultValue={String(pageSize)} className="min-h-10 rounded-md border border-slate-200 px-2 text-sm"><option value="20">20 / 页</option><option value="25">25 / 页</option><option value="50">50 / 页</option><option value="100">100 / 页</option></select><button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">更新</button></form></div>
        <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">访客</th><th className="px-5 py-3">国家 / 来源</th><th className="px-5 py-3">访问</th><th className="px-5 py-3">最后路径</th><th className="px-5 py-3">最后访问</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{pagedProfiles.items.map((profile) => <tr key={profile.visitorId} className="hover:bg-slate-50/70"><td className="px-5 py-4"><strong className="block text-slate-900">{profile.visitorId.slice(0, 12)}</strong><span className="text-xs text-slate-500">{profile.ipMasked || "IP 已隐藏"}</span></td><td className="px-5 py-4">{profile.country}<span className="block text-xs text-slate-500">{profile.channel}</span></td><td className="px-5 py-4">{profile.visits} 次 / {profile.sessions} 会话<span className="block text-xs text-slate-500">{profile.conversions} 转化</span></td><td className="max-w-[280px] px-5 py-4"><span className="block truncate font-bold text-slate-800">{profile.latestPath}</span></td><td className="px-5 py-4 text-slate-600">{formatDate(profile.lastSeenAt)}</td><td className="px-5 py-4"><Link href={`/admin/analytics/visitors/${encodeURIComponent(profile.visitorId)}?range=${range.preset}&from=${range.from}&to=${range.to}`} className="inline-flex items-center gap-1 font-black text-orange-700">访问详情 <ArrowRight size={14} /></Link></td></tr>)}</tbody></table>{!pagedProfiles.items.length ? <div className="p-5"><EmptyState text="没有符合条件的真实访客。" /></div> : null}</div>
        <AdminPagination pathname="/admin/analytics" query={baseQuery} page={pagedProfiles.page} totalPages={pagedProfiles.totalPages} total={pagedProfiles.total} pageSize={pagedProfiles.pageSize} label="访客" pageParam="visitorPage" />
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-black text-orange-700">访问事件明细</p><h2 className="mt-1 text-xl font-black text-slate-950">可筛选、可分页的原始记录</h2></div><a className="button button-secondary min-h-10 text-sm" href="/api/admin/export?type=events">导出筛选结果 CSV</a></div>
        <div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">时间 / 访客</th><th className="px-5 py-3">页面</th><th className="px-5 py-3">国家 / IP</th><th className="px-5 py-3">渠道</th><th className="px-5 py-3">行为</th><th className="px-5 py-3">类型</th></tr></thead><tbody className="divide-y divide-slate-100">{pagedEvents.items.map((event) => <tr key={event.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><strong className="block text-slate-900">{formatDate(event.createdAt)}</strong>{event.visitorId ? <Link className="text-xs text-orange-700 hover:underline" href={`/admin/analytics/visitors/${encodeURIComponent(event.visitorId)}?range=${range.preset}&from=${range.from}&to=${range.to}`}>第 {event.visitNumber || 1} 次 · 查看档案</Link> : <span className="text-xs text-slate-500">历史记录</span>}</td><td className="max-w-[280px] px-5 py-4"><span className="block truncate font-bold text-slate-800">{event.path || "/"}</span><span className="block truncate text-xs text-slate-500">{event.label || "—"}</span></td><td className="px-5 py-4">{event.country || "Unknown"}<span className="block text-xs text-slate-500">{event.ipMasked || "—"}</span></td><td className="px-5 py-4">{event.channel || "Direct"}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700"><MousePointerClick size={13} />{event.event}</span></td><td className="px-5 py-4"><span className={event.trafficType === "real" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600"}>{event.trafficType || "real"}</span></td></tr>)}</tbody></table>{!pagedEvents.items.length ? <div className="p-5"><EmptyState text="没有符合条件的访问记录。" /></div> : null}</div>
        <AdminPagination pathname="/admin/analytics" query={baseQuery} page={pagedEvents.page} totalPages={pagedEvents.totalPages} total={pagedEvents.total} pageSize={pagedEvents.pageSize} label="访问记录" />
      </section>
    </AdminShell>
  );
}
