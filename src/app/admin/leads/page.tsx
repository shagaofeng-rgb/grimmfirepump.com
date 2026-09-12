import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination, adminQuery } from "@/components/admin/admin-pagination";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminPageHeader, EmptyState, StatusPill, inputClass } from "@/components/admin/admin-widgets";
import { getAdminData, type InquiryRecord } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt, resolveDateRange } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function matches(lead: InquiryRecord, query: string) {
  if (!query) return true;
  const value = query.toLowerCase();
  return [lead.name, lead.email, lead.company, lead.country, lead.product, lead.phone, lead.sourcePage, lead.owner].join(" ").toLowerCase().includes(value);
}

function stamp(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const range = resolveDateRange(param(params, "range"), { from: param(params, "from"), to: param(params, "to"), timeZone: settings.timezone || "Asia/Shanghai" });
  const filters = { range: range.preset, query: param(params, "query"), source: param(params, "source") || "all", status: param(params, "status") || "all", intent: param(params, "intent") || "all", from: range.from, to: range.to };
  const page = parsePositiveInt(param(params, "page"));
  const pageSize = paginationPageSize(param(params, "pageSize"));
  const { inquiries } = await getAdminData();
  const filtered = inquiries.filter((lead) => {
    if (!matches(lead, filters.query)) return false;
    if (filters.source !== "all" && lead.sourceType !== filters.source) return false;
    if (filters.status !== "all" && (lead.status || lead.stage || "new") !== filters.status) return false;
    if (filters.intent !== "all" && lead.intent !== filters.intent) return false;
    const created = Date.parse(lead.createdAt);
    return (!filters.from || created >= Date.parse(`${filters.from}T00:00:00`)) && (!filters.to || created <= Date.parse(`${filters.to}T23:59:59.999`));
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const paged = paginate(filtered, page, pageSize);
  const sourceOptions = [...new Set(inquiries.map((lead) => lead.sourceType).filter(Boolean))];

  return <AdminShell>
    <AdminPageHeader eyebrow="客户管理" title="客户询盘" description="查看真实网站询盘及其来源、项目需求、销售跟进和已关联访问记录。" action={<a className="button button-secondary" href="/api/admin/export?type=leads">导出当前线索</a>} />
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <form className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4" method="get">
        <div className="xl:col-span-4"><DateRangeFilter pathname="/admin/leads" query={filters} preset={range.preset} from={range.from} to={range.to} /></div>
        <input name="query" defaultValue={filters.query} className={inputClass} placeholder="姓名、公司、邮箱、产品或负责人" />
        <select name="source" defaultValue={filters.source} className={inputClass}><option value="all">全部来源</option>{sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}</select>
        <select name="status" defaultValue={filters.status} className={inputClass}><option value="all">全部跟进状态</option>{["new", "pending", "contacted", "quoted", "following", "sample", "negotiating", "won", "lost", "spam", "invalid"].map((status) => <option key={status} value={status}>{status}</option>)}</select>
        <select name="intent" defaultValue={filters.intent} className={inputClass}><option value="all">全部意向等级</option><option value="A">A 高意向</option><option value="B">B 中意向</option><option value="C">C 低意向</option><option value="unrated">未判断</option></select>
        <select name="pageSize" defaultValue={String(paged.pageSize)} className={inputClass}><option value="20">20 条 / 页</option><option value="25">25 条 / 页</option><option value="50">50 条 / 页</option><option value="100">100 条 / 页</option></select>
        <button className="button button-primary min-h-11" type="submit">应用筛选</button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 text-sm text-slate-500"><span>显示 {paged.items.length} / {paged.total} 条线索</span><span>按提交时间从新到旧排列</span></div>
      <div className="overflow-x-auto"><table className="min-w-[1040px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">客户</th><th className="px-5 py-3">需求</th><th className="px-5 py-3">来源</th><th className="px-5 py-3">意向 / 状态</th><th className="px-5 py-3">负责人</th><th className="px-5 py-3">提交时间</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">
        {paged.items.map((lead) => <tr key={lead.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><strong className="block text-slate-950">{lead.name}</strong><span className="block max-w-[220px] truncate text-xs text-slate-500">{lead.company || "未填写公司"} · {lead.country || "未填写国家"}</span><span className="block max-w-[220px] truncate text-xs text-slate-500">{lead.email}</span></td><td className="px-5 py-4"><strong className="block max-w-[200px] truncate text-slate-800">{lead.product || "一般咨询"}</strong><span className="block text-xs text-slate-500">{lead.flow || "-"} / {lead.head || "-"}</span></td><td className="px-5 py-4"><span className="block font-bold text-slate-700">{lead.sourceType || "网站表单"}</span><span className="block max-w-[180px] truncate text-xs text-slate-500">{lead.sourcePage || "/"}</span></td><td className="px-5 py-4"><div className="flex flex-wrap gap-1.5"><StatusPill value={lead.status || lead.stage || "new"} />{lead.intent ? <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">{lead.intent} 类</span> : null}</div><span className="mt-1 block text-xs text-slate-500">评分 {lead.score}</span></td><td className="px-5 py-4 text-slate-600">{lead.owner || "未分配"}</td><td className="px-5 py-4 text-slate-600">{stamp(lead.createdAt)}</td><td className="px-5 py-4"><Link href={adminQuery(`/admin/leads/${lead.id}`, { range: range.preset, from: range.from, to: range.to })} className="inline-flex rounded-md bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700">查看详情</Link></td></tr>)}
      </tbody></table>{!paged.items.length ? <div className="p-5"><EmptyState text="当前筛选条件下没有客户询盘。" /></div> : null}</div>
      <AdminPagination pathname="/admin/leads" query={{ ...filters, pageSize: paged.pageSize }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="线索" />
    </section>
  </AdminShell>;
}
