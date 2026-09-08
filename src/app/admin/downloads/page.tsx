import Link from "next/link";
import { saveDownloadAsset } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { AdminPageHeader, EmptyState, Field, StatusPill, inputClass } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { getSiteSettings } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt, resolveDateRange } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] || "" : item || "";
}

function queryFor(values: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) query.set(key, String(value));
  return \`/admin/downloads?\${query.toString()}\`;
}

function inRange(createdAt: string | undefined, from: string, to: string) {
  if (!createdAt) return true;
  const date = Date.parse(createdAt);
  return (!from || date >= Date.parse(from + "T00:00:00")) && (!to || date <= Date.parse(to + "T23:59:59.999"));
}

export default async function AdminDownloadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  const range = resolveDateRange(value(params, "range"), { from: value(params, "from"), to: value(params, "to"), timeZone: settings.timezone || "Asia/Shanghai" });
  const query = value(params, "query").toLowerCase();
  const status = value(params, "status") || "all";
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const { cmsDownloads, downloadLeads } = await getAdminData();
  const assets = cmsDownloads.filter((item) => inRange(item.createdAt, range.from, range.to) && (status === "all" || item.status === status) && (!query || [item.title, item.category, item.relatedProduct, item.language].join(" ").toLowerCase().includes(query))).sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || ""));
  const leads = downloadLeads.filter((item) => inRange(item.createdAt, range.from, range.to) && (!query || [item.name, item.email, item.country, item.assetTitle, item.company].join(" ").toLowerCase().includes(query))).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const pagedAssets = paginate(assets, page, pageSize);
  const pagedLeads = paginate(leads, page, pageSize);
  const base = { range: range.preset, from: range.from, to: range.to, query, status, pageSize: String(pageSize) };

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="下载资料" title="目录、Datasheet、证书和项目提交文件" description="资料和下载线索共用统一时间范围、关键词和分页查询；不会随数据增长而无限堆叠。" />
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form method="get" className="grid gap-3 xl:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <DateRangeFilter pathname="/admin/downloads" query={base} preset={range.preset} from={range.from} to={range.to} compact />
          <input name="query" defaultValue={query} className={inputClass} placeholder="资料、产品、联系人、邮箱、国家..." />
          <select name="status" defaultValue={status} className={inputClass}><option value="all">全部资料状态</option><option value="published">已发布</option><option value="draft">草稿</option><option value="offline">下架</option></select>
          <div className="flex gap-2"><select name="pageSize" defaultValue={String(pageSize)} className={inputClass + " flex-1"}><option value="20">20 / 页</option><option value="25">25 / 页</option><option value="50">50 / 页</option><option value="100">100 / 页</option></select><button className="button button-primary" type="submit">应用筛选</button></div>
        </form>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <form action={saveDownloadAsset} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-950">新增下载资料</h2><Field label="文件名称"><input name="title" required className={inputClass} /></Field><Field label="分类"><input name="category" className={inputClass} placeholder="Catalog / Datasheet / Certificate" /></Field><Field label="关联产品"><input name="relatedProduct" className={inputClass} /></Field><Field label="版本"><input name="version" defaultValue="v1.0" className={inputClass} /></Field><Field label="语言"><input name="language" defaultValue="English" className={inputClass} /></Field><Field label="文件 URL"><input name="fileUrl" required className={inputClass} placeholder="/assets/downloads/..." /></Field><Field label="状态"><select name="status" className={inputClass}><option value="published">已发布</option><option value="draft">草稿</option><option value="offline">下架</option></select></Field><Field label="SEO 标题"><input name="seoTitle" className={inputClass} /></Field><label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="gated" type="checkbox" defaultChecked /> 下载前要求填写表单</label><button className="button button-primary" type="submit">保存资料</button></form>
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 className="text-xl font-black text-slate-950">下载资料库</h2><p className="mt-1 text-sm text-slate-500">当前范围共 {pagedAssets.total} 条</p></div></div><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["资料", "分类", "语言/版本", "下载表单", "状态", "下载"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead><tbody>{pagedAssets.items.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-4"><strong>{item.title}</strong><p className="mt-1 break-all text-slate-500">{item.fileUrl}</p></td><td className="px-4 py-4">{item.category}</td><td className="px-4 py-4">{item.language} / {item.version}</td><td className="px-4 py-4">{item.gated ? "需要" : "不需要"}</td><td className="px-4 py-4"><StatusPill value={item.status} /></td><td className="px-4 py-4">{item.downloads}</td></tr>)}</tbody></table>{!pagedAssets.items.length ? <div className="p-5"><EmptyState text="当前筛选条件下没有资料。" /></div> : null}</div></section>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black text-slate-950">下载资料线索</h2><p className="mt-1 text-sm text-slate-500">当前范围共 {pagedLeads.total} 条</p></div><div className="grid gap-3 p-5 md:grid-cols-2">{pagedLeads.items.map((lead) => <div key={lead.id} className="rounded-md bg-slate-50 p-4 text-sm"><strong>{lead.name}</strong><p className="mt-1 text-slate-500">{lead.assetTitle} · {lead.email} · {lead.country || "未填写国家"}</p></div>)}{!pagedLeads.items.length ? <EmptyState text="当前筛选条件下暂无下载资料线索。" /> : null}</div></section>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-600"><span>第 {Math.max(pagedAssets.page, pagedLeads.page)} 页</span><div className="flex gap-2"><Link aria-disabled={page <= 1} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={queryFor({ ...base, page: page - 1 })}>上一页</Link><Link aria-disabled={page >= Math.max(pagedAssets.totalPages, pagedLeads.totalPages)} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={queryFor({ ...base, page: page + 1 })}>下一页</Link></div></div>
    </AdminShell>
  );
}
