import Link from "next/link";
import { ArrowRight, Boxes, CalendarDays, Globe2, Inbox, MessageCircle, Newspaper } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { isWithinReportingDateRange, resolveDateRange } from "@/lib/admin-listing";
import { getAnalyticsSummary } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] || "" : item || "";
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const [data, settings] = await Promise.all([getAdminData(), getSiteSettings()]);
  const range = resolveDateRange(value(params, "range") || "today", { from: value(params, "from"), to: value(params, "to"), timeZone: settings.timezone || "Asia/Shanghai" });
  const timeZone = settings.timezone || "Asia/Shanghai";
  const traffic = getAnalyticsSummary(data.events, { from: range.from, to: range.to, timeZone, traffic: "real" });
  const periodLeads = data.inquiries.filter((item) => isWithinReportingDateRange(item.createdAt, range.from, range.to, timeZone));
  const pending = periodLeads.filter((item) => ["new", "pending"].includes(item.status || item.stage || "new")).length;
  const whatsappClicks = data.whatsappClicks.filter((item) => item.trafficType === "real" && isWithinReportingDateRange(item.createdAt, range.from, range.to, timeZone));
  const sharedQuery = { range: range.preset, from: range.from, to: range.to };

  return <AdminShell>
    <AdminPageHeader eyebrow="经营概览" title="工作台" description="网站内容与客户动态" />
    <section className="admin-dashboard-range mt-6 rounded-md border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><CalendarDays size={17} className="text-[#b64d29]" />统计范围<span className="text-xs text-slate-400">{range.label}</span></div><form method="get" className="min-w-0"><DateRangeFilter pathname="/admin/dashboard" query={sharedQuery} preset={range.preset} from={range.from} to={range.to} compact /></form></div>
    </section>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Link href={`/admin/leads?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="新增客户线索" value={periodLeads.length} hint={`待跟进 ${pending}`} /></Link>
      <Link href={`/admin/whatsapp?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="WhatsApp 点击" value={whatsappClicks.length} hint={range.label} /></Link>
      <Link href={`/admin/analytics?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="网站访客" value={traffic.uniqueVisitors} hint={`会话 ${traffic.uniqueSessions}`} /></Link>
      <Link href={`/admin/analytics?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="转化动作" value={traffic.conversions.length} hint="询盘、下载、WhatsApp" /></Link>
    </div>
    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <AdminCard title="待跟进客户"><div className="grid gap-3">{periodLeads.filter((item) => ["new", "pending"].includes(item.status || item.stage || "new")).slice(0, 5).map((item) => <Link key={item.id} href={`/admin/leads/${item.id}`} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-4 py-3 transition-colors hover:border-orange-200 hover:bg-orange-50/40"><div className="min-w-0"><strong className="block truncate text-slate-900">{item.name || item.company || "未命名客户"}</strong><span className="block truncate text-xs text-slate-500">{item.product || "一般咨询"} · {item.country || "未填写国家"}</span></div><span className="shrink-0 text-xs font-bold text-slate-500">{dateLabel(item.createdAt)}</span></Link>)}{!periodLeads.some((item) => ["new", "pending"].includes(item.status || item.stage || "new")) ? <EmptyState text="暂无待跟进客户。" /> : null}</div><Link href="/admin/leads" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-700">查看客户线索 <ArrowRight size={16} /></Link></AdminCard>
      <section className="grid gap-6"><AdminCard title="页面浏览来源"><div className="grid gap-3">{traffic.channels.slice(0, 4).map(([name, count]) => <Link key={name} href={`/admin/analytics?channel=${encodeURIComponent(name)}`} className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm"><span className="font-bold text-slate-700">{name}</span><strong>{count}</strong></Link>)}{!traffic.channels.length ? <EmptyState text="暂无来源数据。" /> : null}</div></AdminCard><AdminCard title="快捷入口"><div className="admin-dashboard-quick"><Link href="/admin/leads"><Inbox size={18} />客户线索<ArrowRight size={15} /></Link><Link href="/admin/products"><Boxes size={18} />产品管理<ArrowRight size={15} /></Link><Link href="/admin/whatsapp"><MessageCircle size={18} />WhatsApp<ArrowRight size={15} /></Link><Link href="/admin/news"><Newspaper size={18} />文章管理<ArrowRight size={15} /></Link></div></AdminCard></section>
    </div>
    <div className="mt-8"><AdminCard title="页面浏览国家"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{traffic.countries.slice(0, 8).map(([name, count]) => <div key={name} className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm"><span className="flex items-center gap-2 font-bold text-slate-700"><Globe2 size={15} className="text-cyan-700" />{name}</span><strong>{count}</strong></div>)}{!traffic.countries.length ? <EmptyState text="暂无访问国家数据。" /> : null}</div></AdminCard></div>
  </AdminShell>;
}
