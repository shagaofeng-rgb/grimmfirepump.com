import Link from "next/link";
import { deleteLead, updateLeadStatus } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, EmptyState, Field, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { getAdminData, type InquiryRecord } from "@/lib/admin-data";
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
  return [lead.name, lead.email, lead.company, lead.country, lead.product, lead.phone, lead.sourcePage].join(" ").toLowerCase().includes(value);
}

function urlFor(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, String(value));
  return "/admin/leads?" + params.toString();
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    query: param(params, "query"),
    source: param(params, "source") || "all",
    status: param(params, "status") || "all",
    intent: param(params, "intent") || "all",
    from: param(params, "from"),
    to: param(params, "to"),
  };
  const page = Math.max(1, Number(param(params, "page") || "1"));
  const pageSize = Number(param(params, "pageSize") || "25");
  const { inquiries, downloadLeads } = await getAdminData();
  const filtered = inquiries.filter((lead) => {
    if (!matches(lead, filters.query)) return false;
    if (filters.source !== "all" && lead.sourceType !== filters.source) return false;
    if (filters.status !== "all" && (lead.status || lead.stage || "new") !== filters.status) return false;
    if (filters.intent !== "all" && lead.intent !== filters.intent) return false;
    const created = new Date(lead.createdAt).getTime();
    if (filters.from && created < new Date(filters.from + "T00:00:00").getTime()) return false;
    if (filters.to && created > new Date(filters.to + "T23:59:59").getTime()) return false;
    return true;
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const paged = paginate(filtered, page, pageSize);

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="客户询盘 CRM" title="客户线索、来源路径和销售跟进" description="从网站访问、产品咨询、资料下载与广告表单获得的线索统一管理。筛选条件可叠加并支持分页导出。" action={<a className="button button-secondary" href="/api/admin/export?type=leads">导出线索 CSV</a>} />
      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <form className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4" method="get">
          <input name="query" defaultValue={filters.query} className={inputClass} placeholder="姓名、邮箱、国家、产品、公司..." />
          <select name="source" defaultValue={filters.source} className={inputClass}><option value="all">全部来源</option><option value="website_form">网站表单</option><option value="product_inquiry">产品询价</option><option value="download">资料下载</option><option value="advertising">广告线索</option></select>
          <select name="status" defaultValue={filters.status} className={inputClass}><option value="all">全部状态</option>{["new","pending","contacted","quoted","following","sample","negotiating","won","lost","spam","invalid"].map((status) => <option key={status} value={status}>{status}</option>)}</select>
          <select name="intent" defaultValue={filters.intent} className={inputClass}><option value="all">全部意向</option><option value="A">A 高意向</option><option value="B">B 中意向</option><option value="C">C 低意向</option><option value="unrated">未判断</option></select>
          <input type="date" name="from" defaultValue={filters.from} className={inputClass} aria-label="开始日期" />
          <input type="date" name="to" defaultValue={filters.to} className={inputClass} aria-label="结束日期" />
          <select name="pageSize" defaultValue={String(paged.pageSize)} className={inputClass}><option value="20">20 条 / 页</option><option value="25">25 条 / 页</option><option value="50">50 条 / 页</option><option value="100">100 条 / 页</option></select>
          <button className="button button-primary min-h-11" type="submit">筛选线索</button>
        </form>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-sm text-slate-500"><span>显示 {paged.items.length} / {paged.total} 条线索</span><span>按最新提交时间排序</span></div>
        <div className="grid gap-4 p-4">
          {paged.items.map((lead) => (
            <article key={lead.id} className="rounded-lg border border-slate-200 p-4 transition hover:border-orange-200">
              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-black text-slate-950">{lead.name}</h2><span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-700">评分 {lead.score}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{lead.status || lead.stage || "new"}</span>{lead.intent ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{lead.intent} 类意向</span> : null}</div>
                  <p className="mt-2 text-sm text-slate-500">{lead.email} · {lead.phone || "未填写电话"} · {lead.country || "未填写国家"} · {lead.company || "未填写公司"}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{lead.product || "未填写产品"} / Flow: {lead.flow || "-"} / Head: {lead.head || "-"} / Cert: {lead.certification || "-"}</p>
                  <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">{lead.message || "未填写需求内容"}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{lead.sourcePage || "website"} · {lead.sourceType || "website_form"} · {new Date(lead.createdAt).toLocaleString()} · {lead.channel || "Direct"}</p>
                </div>
                <div className="grid gap-3 rounded-md bg-slate-50 p-4">
                  <form action={updateLeadStatus} className="grid gap-3"><input type="hidden" name="id" value={lead.id} /><Field label="跟进状态"><select name="status" defaultValue={lead.status || "new"} className={inputClass}>{["new","pending","contacted","quoted","following","sample","negotiating","won","lost","spam","invalid"].map((status) => <option key={status} value={status}>{status}</option>)}</select></Field><Field label="意向等级"><select name="intent" defaultValue={lead.intent || "unrated"} className={inputClass}><option value="A">A 高意向</option><option value="B">B 中意向</option><option value="C">C 低意向</option><option value="unrated">未判断</option></select></Field><Field label="销售负责人"><input name="owner" defaultValue={lead.owner} className={inputClass} /></Field><Field label="内部备注"><textarea name="notes" rows={3} defaultValue={lead.notes} className={textareaClass} /></Field><button className="button button-primary min-h-10 text-sm" type="submit">保存跟进</button></form>
                  <form action={deleteLead}><input type="hidden" name="id" value={lead.id} /><button className="button button-secondary min-h-10 w-full text-sm" type="submit">删除线索</button></form>
                </div>
              </div>
            </article>
          ))}
          {!paged.items.length ? <EmptyState text="当前筛选条件下暂无线索。" /> : null}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm"><span className="text-slate-500">第 {paged.page} / {paged.totalPages} 页</span><div className="flex gap-2"><Link aria-disabled={paged.page <= 1} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={urlFor({ ...filters, page: paged.page - 1, pageSize: paged.pageSize })}>上一页</Link><Link aria-disabled={paged.page >= paged.totalPages} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={urlFor({ ...filters, page: paged.page + 1, pageSize: paged.pageSize })}>下一页</Link></div></div>
      </section>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-950">下载资料线索</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{downloadLeads.slice(0, 20).map((lead) => <div key={lead.id} className="rounded-md bg-slate-50 p-4 text-sm"><strong>{lead.name}</strong><p className="mt-1 text-slate-500">{lead.assetTitle} · {lead.email} · {lead.country || "未填写国家"}</p></div>)}{!downloadLeads.length ? <EmptyState text="暂无下载资料线索。" /> : null}</div></section>
    </AdminShell>
  );
}
