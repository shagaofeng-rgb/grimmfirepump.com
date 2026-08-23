import Link from "next/link";
import { Activity, ArrowRight, BarChart3, Globe2, Inbox } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsRefresh } from "@/components/admin/analytics-refresh";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { getAnalyticsSummary } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

function isToday(date: string) {
  const value = new Date(date);
  const today = new Date();
  return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth() && value.getDate() === today.getDate();
}

export default async function AdminDashboardPage() {
  const data = await getAdminData();
  const traffic = getAnalyticsSummary(data.events);
  const todayLeads = data.inquiries.filter((item) => isToday(item.createdAt)).length;
  const highIntent = data.inquiries.filter((item) => item.score >= 60 || item.intent === "A").length;

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="运营总览"
        title="GRIMM PUMP 增长与客户控制台"
        description="一个页面查看真实访问、市场来源、转化和待处理客户。测试与自动化流量已从经营指标中隔离。"
        action={<AnalyticsRefresh />}
      />
      <section className="mt-8 rounded-xl bg-gradient-to-br from-[#071426] via-[#0d2a48] to-[#164e63] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Live operations</p><h2 className="mt-2 text-3xl font-black">真实访客正在转化为可跟进的客户</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">访客分析按首方会话、来源渠道和国家归因。点击任意模块可继续下钻。</p></div>
          <div className="grid grid-cols-3 gap-4 rounded-lg border border-white/10 bg-white/5 p-4 text-center"><div><strong className="block text-2xl text-orange-300">{traffic.uniqueVisitors}</strong><span className="text-xs text-slate-300">真实访客</span></div><div><strong className="block text-2xl text-orange-300">{traffic.conversions.length}</strong><span className="text-xs text-slate-300">转化动作</span></div><div><strong className="block text-2xl text-orange-300">{highIntent}</strong><span className="text-xs text-slate-300">高意向</span></div></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/admin/analytics" className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-black text-slate-900">查看真实流量 <ArrowRight size={16} /></Link><Link href="/admin/leads" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-sm font-black text-white">处理新询盘 <Inbox size={16} /></Link></div>
      </section>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/analytics"><StatCard label="真实独立访客" value={traffic.uniqueVisitors} hint={"会话 " + traffic.uniqueSessions + " · 回访 " + traffic.returningVisitors} /></Link>
        <Link href="/admin/analytics"><StatCard label="真实页面浏览" value={traffic.pageViews.length} hint={"已过滤非真实事件 " + traffic.filteredEvents} /></Link>
        <Link href="/admin/leads"><StatCard label="客户询盘" value={data.totals.inquiries} hint={"今日 " + todayLeads + " · 高意向 " + highIntent} /></Link>
        <Link href="/admin/analytics"><StatCard label="转化动作" value={traffic.conversions.length} hint="询盘、下载、WhatsApp、报价" /></Link>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard title="最近真实访客">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><span className="flex items-center gap-2"><Activity size={16} /> 自动同步中</span><span>{traffic.recentActivity.length} 条活动</span></div>
          <div className="grid gap-3">{traffic.recentActivity.map((item) => <Link key={item.id} href="/admin/analytics" className="grid gap-2 rounded-lg border border-slate-200 p-4 hover:border-orange-200 hover:bg-orange-50/30 sm:grid-cols-[1fr_auto]"><div><strong className="block truncate text-slate-900">{item.path || "/"}</strong><p className="mt-1 text-sm text-slate-500">{item.country || "Unknown"} · {item.channel || "Direct"} · 第 {item.visitNumber || 1} 次访问</p></div><span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{item.event}</span></Link>)}{!traffic.recentActivity.length ? <EmptyState text="暂无真实访问。新流量将自动同步至此。" /> : null}</div>
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
