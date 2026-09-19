import Link from "next/link";
import { ExternalLink, MessageCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData, type InquiryRecord, type WhatsAppClickRecord } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt, resolveDateRange } from "@/lib/admin-listing";
import { isWithinDateRange, paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const current = params[key];
  return Array.isArray(current) ? current[0] || "" : current || "";
}

function stamp(date: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

function matchingInquiry(click: WhatsAppClickRecord, inquiries: InquiryRecord[]) {
  return inquiries
    .filter((lead) => lead.whatsappClickId === click.id || (
      Date.parse(lead.createdAt) >= Date.parse(click.createdAt)
      && ((click.sessionId && lead.sessionId === click.sessionId) || (click.visitorId && lead.visitorId === click.visitorId))
    ))
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))[0];
}

export default async function WhatsAppConversionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const range = resolveDateRange(value(params, "range"), {
    from: value(params, "from"),
    to: value(params, "to"),
    timeZone: settings.timezone || "Asia/Shanghai",
  });
  const placement = value(params, "placement") || "all";
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const { whatsappClicks, inquiries } = await getAdminData();
  const visibleClicks = whatsappClicks
    .filter((click) => click.trafficType === "real")
    .filter((click) => isWithinDateRange(click.createdAt, { from: range.from, to: range.to }))
    .filter((click) => placement === "all" || click.placement === placement)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const paged = paginate(visibleClicks, page, pageSize);
  const attribution = new Map(visibleClicks.map((click) => [click.id, matchingInquiry(click, inquiries)]));
  const uniqueVisitors = new Set(visibleClicks.map((click) => click.visitorId).filter(Boolean)).size;
  const attributedInquiries = [...attribution.values()].filter(Boolean).length;
  const placements = [...new Set(whatsappClicks.map((click) => click.placement).filter(Boolean))].sort();
  const query = { range: range.preset, from: range.from, to: range.to, placement, pageSize: String(pageSize) };

  return <AdminShell>
    <AdminPageHeader eyebrow="客户与销售" title="WhatsApp 线索" />
    <section className="mt-7 rounded-xl bg-[#091b32] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">GRIMM PUMP</p><h2 className="mt-2 flex items-center gap-2 text-2xl font-black"><MessageCircle size={23} /> 官方 WhatsApp</h2></div><a className="inline-flex min-h-11 items-center gap-2 self-start rounded-md border border-white/20 px-4 py-2 text-sm font-black text-white hover:bg-white/10" href="https://wa.me/message/JV3PVHGQYO5SB1" target="_blank" rel="noreferrer">打开账号 <ExternalLink size={15} /></a></div>
      <form className="mt-6 grid gap-3 xl:grid-cols-[1.4fr_280px_auto]" method="get"><DateRangeFilter pathname="/admin/whatsapp" query={query} preset={range.preset} from={range.from} to={range.to} compact /><select name="placement" defaultValue={placement} className="min-h-11 rounded-md border border-white/15 bg-white px-3 text-sm text-slate-900"><option value="all">全部网站入口</option>{placements.map((item) => <option key={item} value={item}>{item}</option>)}</select><button className="button button-primary min-h-11" type="submit">应用筛选</button></form>
    </section>

    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <StatCard label="WhatsApp 点击" value={visibleClicks.length} hint={range.label} />
      <StatCard label="点击访客" value={uniqueVisitors} hint="去重后统计" />
      <StatCard label="关联客户线索" value={attributedInquiries} hint="已匹配网站提交" />
    </div>

    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between"><h2 className="text-xl font-black text-slate-950">点击记录</h2><form method="get" className="flex gap-2"><input type="hidden" name="range" value={range.preset} /><input type="hidden" name="from" value={range.from} /><input type="hidden" name="to" value={range.to} /><input type="hidden" name="placement" value={placement} /><select name="pageSize" defaultValue={String(pageSize)} className="min-h-10 rounded-md border border-slate-200 px-2 text-sm"><option value="20">20 / 页</option><option value="25">25 / 页</option><option value="50">50 / 页</option><option value="100">100 / 页</option></select><button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">更新</button></form></div>
      <div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">时间</th><th className="px-5 py-3">入口</th><th className="px-5 py-3">来源</th><th className="px-5 py-3">关联客户</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{paged.items.map((click) => { const lead = attribution.get(click.id); return <tr key={click.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><strong className="block text-slate-900">{stamp(click.createdAt)}</strong></td><td className="px-5 py-4"><strong className="block text-slate-800">{click.placement}</strong><span className="block max-w-[210px] truncate text-xs text-slate-500">{click.path || "/"}</span></td><td className="px-5 py-4"><strong className="block text-slate-700">{click.country || "Unknown"} · {click.channel || "Direct"}</strong><span className="block max-w-[190px] truncate text-xs text-slate-500">{click.referrer || "无外部来源"}</span></td><td className="px-5 py-4">{lead ? <Link href={`/admin/leads/${lead.id}`} className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">{lead.name || lead.email}</Link> : <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">暂未关联</span>}</td><td className="px-5 py-4"><a href={click.targetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-black text-orange-700">查看账号 <ExternalLink size={14} /></a></td></tr>; })}</tbody></table>{!paged.items.length ? <div className="p-5"><EmptyState text="当前范围内暂无 WhatsApp 点击。" /></div> : null}</div>
      <AdminPagination pathname="/admin/whatsapp" query={query} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="点击" />
    </section>
  </AdminShell>;
}
