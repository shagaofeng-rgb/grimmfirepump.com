import Link from "next/link";
import { ArrowRight, Globe2, Inbox, MessageCircle, Newspaper } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { resolveDateRange } from "@/lib/admin-listing";
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
  const traffic = getAnalyticsSummary(data.events, { from: range.from, to: range.to, traffic: "real" });
  const periodLeads = data.inquiries.filter((item) => {
    const time = Date.parse(item.createdAt);
    return (!range.from || time >= Date.parse(`${range.from}T00:00:00`)) && (!range.to || time <= Date.parse(`${range.to}T23:59:59.999`));
  });
  const pending = periodLeads.filter((item) => ["new", "pending"].includes(item.status || item.stage || "new")).length;
  const whatsappClicks = data.whatsappClicks.filter((item) => item.trafficType === "real" && (!range.from || Date.parse(item.createdAt) >= Date.parse(`${range.from}T00:00:00`)) && (!range.to || Date.parse(item.createdAt) <= Date.parse(`${range.to}T23:59:59.999`)));
  const sharedQuery = { range: range.preset, from: range.from, to: range.to };

  return <AdminShell>
    <AdminPageHeader eyebrow="工作台" title="运营概览" />
    <section className="mt-6 rounded-xl bg-[#071426] p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">GRIMM PUMP</p><h2 className="mt-2 text-2xl font-black">网站与客户动态</h2></div><div className="w-full max-w-2xl rounded-lg border border-white/10 bg-white/5 p-3"><DateRangeFilter pathname="/admin/dashboard" query={sharedQuery} preset={range.preset} from={range.from} to={range.to} compact /></div></div>
    </section>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Link href={`/admin/leads?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="新增客户线索" value={periodLeads.length} hint={`待跟进 ${pending}`} /></Link>
      <Link href={`/admin/whatsapp?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="WhatsApp 点击" value={whatsappClicks.length} hint={range.label} /></Link>
      <Link href={`/admin/analytics?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="网站访客" value={traffic.uniqueVisitors} hint={`会话 ${traffic.uniqueSessions}`} /></Link>
      <Link href={`/admin/analytics?range=${range.preset}&from=${range.from}&to=${range.to}`}><StatCard label="转化动作" value={traffic.conversions.length} hint="询盘、下载、WhatsApp" /></Link>
    </div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <AdminCard title="待跟进客户"><div className="grid gap-3">{periodLeads.filter((item) => ["new", "pending"].includes(item.status || item.stage || "new")).slice(0, 5).map((item) => <Link key={item.id} href={`/admin/leads/${item.id}`} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-4 py-3 transition-colors hover:border-orange-200 hover:bg-orange-50/40"><div className="min-w-0"><strong className="block truncate text-slate-900">{item.name || item.company || "未命名客户"}</strong><span className="block truncate text-xs text-slate-500">{item.product || "一般咨询"} · {item.country || "未填写国家"}</span></div><span className="shrink-0 text-xs font-bold text-slate-500">{dateLabel(item.createdAt)}</span></Link>)}{!periodLeads.some((item) => ["new", "pending"].includes(item.status || item.stage || "new")) ? <EmptyState text="暂无待跟进客户。" /> : null}</div><Link href="/admin/leads" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-700">查看客户线索 <ArrowRight size={16} /></Link></AdminCard>
      <section className="grid gap-6"><AdminCard title="主要来源"><div className="grid gap-3">{traffic.channels.slice(0, 4).map(([name, count]) => <Link key={name} href={`/admin/analytics?channel=${encodeURIComponent(name)}`} className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm"><span className="font-bold text-slate-700">{name}</span><strong>{count}</strong></Link>)}{!traffic.channels.length ? <EmptyState text="暂无来源数据。" /> : null}</div></AdminCard><AdminCard title="快捷入口"><div className="grid grid-cols-3 gap-3 text-center text-sm font-black"><Link href="/admin/leads" className="rounded-md bg-orange-50 p-3 text-orange-800"><Inbox className="mx-auto mb-2" size={18} />客户线索</Link><Link href="/admin/whatsapp" className="rounded-md bg-emerald-50 p-3 text-emerald-800"><MessageCircle className="mx-auto mb-2" size={18} />WhatsApp</Link><Link href="/admin/news" className="rounded-md bg-slate-100 p-3 text-slate-700"><Newspaper className="mx-auto mb-2" size={18} />文章管理</Link></div></AdminCard></section>
    </div>
    <div className="mt-8"><AdminCard title="访问国家"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{traffic.countries.slice(0, 8).map(([name, count]) => <div key={name} className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm"><span className="flex items-center gap-2 font-bold text-slate-700"><Globe2 size={15} className="text-cyan-700" />{name}</span><strong>{count}</strong></div>)}{!traffic.countries.length ? <EmptyState text="暂无访问国家数据。" /> : null}</div></AdminCard></div>
  </AdminShell>;
}
