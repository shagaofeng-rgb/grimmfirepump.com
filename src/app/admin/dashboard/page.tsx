import Link from "next/link";
import { Activity, ArrowRight, BarChart3, Globe2, Inbox } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsRefresh } from "@/components/admin/analytics-refresh";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { SearchConsoleCheck } from "@/components/admin/search-console-check";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { resolveDateRange } from "@/lib/admin-listing";
import { getAnalyticsSummary } from "@/lib/visitor-analytics";
import { getSearchConsoleConfiguration } from "@/lib/search-console";
import { listSitemapRuns } from "@/lib/sitemap-service";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] || "" : item || "";
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const [data, sitemapRuns, settings] = await Promise.all([getAdminData(), listSitemapRuns(), getSiteSettings()]);
  const range = resolveDateRange(value(params, "range") || "today", { from: value(params, "from"), to: value(params, "to"), timeZone: settings.timezone || "Asia/Shanghai" });
  const traffic = getAnalyticsSummary(data.events, { from: range.from, to: range.to, traffic: "real" });
  const searchConsole = getSearchConsoleConfiguration();
  const latestSitemapRun = sitemapRuns[0] || null;
  const periodLeads = data.inquiries.filter((item) => {
    const time = Date.parse(item.createdAt);
    return (!range.from || time >= Date.parse(range.from + "T00:00:00")) && (!range.to || time <= Date.parse(range.to + "T23:59:59.999"));
  });
  const highIntent = periodLeads.filter((item) => item.score >= 60 || item.intent === "A").length;
  const sharedQuery = { range: range.preset, from: range.from, to: range.to };

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="运营总览"
        title="网站运营总览"
        description="集中查看真实访问、客户询盘、市场来源和内容运营情况。"
        action={<AnalyticsRefresh />}
      />
      <section className="mt-8 rounded-xl bg-[#071426] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4"><DateRangeFilter pathname="/admin/dashboard" query={sharedQuery} preset={range.preset} from={range.from} to={range.to} compact /><form method="get" className="mt-2 flex justify-end"><input type="hidden" name="range" value="custom" /><input type="hidden" name="from" value={range.from} /><input type="hidden" name="to" value={range.to} /><button className="rounded-md bg-white px-3 py-2 text-xs font-black text-slate-900" type="submit">应用时间范围</button></form></div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">GRIMM PUMP</p><h2 className="mt-2 text-3xl font-black">客户与网站运营概览</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">按时间范围查看网站访问、客户来源和销售线索，进入对应栏目可查看详细记录。</p></div>
          <div className="grid grid-cols-3 gap-4 rounded-lg border border-white/10 bg-white/5 p-4 text-center"><div><strong className="block text-2xl text-orange-300">{traffic.uniqueVisitors}</strong><span className="text-xs text-slate-300">真实访客</span></div><div><strong className="block text-2xl text-orange-300">{traffic.conversions.length}</strong><span className="text-xs text-slate-300">转化动作</span></div><div><strong className="block text-2xl text-orange-300">{highIntent}</strong><span className="text-xs text-slate-300">高意向</span></div></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3"><Link href={"/admin/analytics?range=" + range.preset + "&from=" + range.from + "&to=" + range.to} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-slate-900">查看真实流量 <ArrowRight size={16} /></Link><Link href={"/admin/leads?range=" + range.preset + "&from=" + range.from + "&to=" + range.to} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-sm font-black text-white">处理新询盘 <Inbox size={16} /></Link></div>
      </section>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/analytics"><StatCard label="真实独立访客" value={traffic.uniqueVisitors} hint={"会话 " + traffic.uniqueSessions + " · 回访 " + traffic.returningVisitors} /></Link>
        <Link href="/admin/analytics"><StatCard label="页面浏览" value={traffic.pageViews.length} hint={range.label + " · 正常网站访问"} /></Link>
        <Link href="/admin/leads"><StatCard label="客户询盘" value={periodLeads.length} hint={range.label + " · 高意向 " + highIntent} /></Link>
        <Link href="/admin/analytics"><StatCard label="转化动作" value={traffic.conversions.length} hint="询盘、下载、WhatsApp、报价" /></Link>
      </div>
      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdminCard title="搜索引擎连接状态">
          <div className="grid gap-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 p-3"><span className="font-bold text-slate-700">自动提交</span><strong className={searchConsole.status === "ready" ? "text-emerald-700" : "text-amber-700"}>{searchConsole.status === "ready" ? "已配置，待连接验证" : searchConsole.status === "disabled" ? "未启用" : "配置不完整"}</strong></div>
            <p className="leading-6 text-slate-600">{searchConsole.message}</p>
            <p className="leading-6 text-slate-500">属性：{searchConsole.siteUrl || "未配置"}<br />Sitemap：{searchConsole.sitemapUrl || "未配置"}</p>
            <SearchConsoleCheck />
          </div>
        </AdminCard>
        <AdminCard title="网站地图状态">
          {latestSitemapRun ? <div className="grid gap-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 p-3"><span className="font-bold text-slate-700">运行结果</span><strong>{latestSitemapRun.status}</strong></div>
            <p className="text-slate-600">完成时间：{new Date(latestSitemapRun.finishedAt).toLocaleString("zh-CN")}</p>
            <p className="text-slate-600">Google：{latestSitemapRun.searchConsole.status} · {latestSitemapRun.searchConsole.message}</p>
          </div> : <EmptyState text="尚无可读取的 Sitemap 运行记录。" />}
        </AdminCard>
      </section>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard title="最近真实访客">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><span className="flex items-center gap-2"><Activity size={16} /> 最近活动</span><span>{traffic.recentActivity.length} 条记录</span></div>
          <div className="grid gap-3">{traffic.recentActivity.map((item) => <Link key={item.id} href="/admin/analytics" className="grid gap-2 rounded-lg border border-slate-200 p-4 hover:border-orange-200 hover:bg-orange-50/30 sm:grid-cols-[1fr_auto]"><div><strong className="block truncate text-slate-900">{item.path || "/"}</strong><p className="mt-1 text-sm text-slate-500">{item.country || "Unknown"} · {item.channel || "Direct"} · 第 {item.visitNumber || 1} 次访问</p></div><span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{item.event}</span></Link>)}{!traffic.recentActivity.length ? <EmptyState text="当前时间范围内暂无真实访问记录。" /> : null}</div>
          <Link href="/admin/analytics" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-700">进入访客分析 <BarChart3 size={16} /></Link>
        </AdminCard>
        <section className="grid gap-6">
          <AdminCard title="市场来源"><div className="grid gap-3">{traffic.channels.slice(0, 5).map(([name, count]) => <Link key={name} href={"/admin/analytics?channel=" + encodeURIComponent(name)} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm hover:bg-orange-50"><span className="font-bold text-slate-700">{name}</span><strong>{count}</strong></Link>)}{!traffic.channels.length ? <EmptyState text="暂无来源数据。" /> : null}</div></AdminCard>
          <AdminCard title="访问国家"><div className="grid gap-3">{traffic.countries.slice(0, 5).map(([name, count]) => <div key={name} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm"><span className="flex items-center gap-2 font-bold text-slate-700"><Globe2 size={15} className="text-cyan-700" />{name}</span><strong>{count}</strong></div>)}{!traffic.countries.length ? <EmptyState text="暂无地理数据。" /> : null}</div></AdminCard>
        </section>
      </div>
    </AdminShell>
  );
}
