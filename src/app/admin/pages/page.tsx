import { saveManagedPage } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, EmptyState, Field, StatusPill, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { listManagedPages } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
function value(params: Record<string, string | string[] | undefined>, name: string) { const item = params[name]; return Array.isArray(item) ? item[0] || "" : item || ""; }

export default async function PagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const pages = await listManagedPages();
  const filters = { query: value(params, "query"), status: value(params, "status") || "all" };
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const filtered = pages.filter((item) => { const search = filters.query.toLowerCase(); return (!search || [item.title, item.slug, item.module].join(" ").toLowerCase().includes(search)) && (filters.status === "all" || item.status === filters.status); }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const paged = paginate(filtered, page, pageSize);
  return <AdminShell>
    <AdminPageHeader eyebrow="内容管理" title="页面内容" description="管理可配置页面的标题、内容区块、横幅、行动入口和 SEO 信息。" />
    <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]"><form action={saveManagedPage} className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-slate-950">新增页面记录</h2><Field label="页面标题"><input name="title" required className={inputClass} /></Field><Field label="路径标识"><input name="slug" required className={inputClass} /></Field><Field label="内容区块"><input name="module" className={inputClass} /></Field><Field label="横幅图片"><input name="banner" className={inputClass} /></Field><Field label="行动链接"><input name="cta" defaultValue="/contact" className={inputClass} /></Field><Field label="状态"><select name="status" className={inputClass}><option value="published">已发布</option><option value="draft">草稿</option></select></Field><Field label="页面内容"><textarea name="content" rows={4} className={textareaClass} /></Field><Field label="SEO Title"><input name="seoTitle" className={inputClass} /></Field><Field label="SEO Description"><textarea name="seoDescription" rows={3} className={textareaClass} /></Field><button className="button button-primary" type="submit">保存页面</button></form><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><form className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-4" method="get"><input name="query" defaultValue={filters.query} className={inputClass} placeholder="搜索页面标题、路径或内容区块" /><select name="status" defaultValue={filters.status} className={inputClass}><option value="all">全部状态</option><option value="published">已发布</option><option value="draft">草稿</option></select><select name="pageSize" defaultValue={String(paged.pageSize)} className={inputClass}><option value="20">20 条 / 页</option><option value="25">25 条 / 页</option><option value="50">50 条 / 页</option><option value="100">100 条 / 页</option></select><button className="button button-primary min-h-11" type="submit">应用筛选</button></form><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["页面", "路径", "内容区块", "状态", "更新时间"].map((head) => <th key={head} className="px-5 py-3 font-black">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{paged.items.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><strong className="block text-slate-950">{item.title}</strong><span className="block max-w-md truncate text-xs text-slate-500">{item.seoTitle || item.content || "未添加内容说明"}</span></td><td className="px-5 py-4 text-slate-700">/{item.slug}</td><td className="px-5 py-4 text-slate-700">{item.module || "默认"}</td><td className="px-5 py-4"><StatusPill value={item.status} /></td><td className="px-5 py-4 text-slate-600">{new Date(item.updatedAt).toLocaleString("zh-CN")}</td></tr>)}</tbody></table>{!paged.items.length ? <div className="p-5"><EmptyState text="没有符合条件的页面记录。" /></div> : null}</div><AdminPagination pathname="/admin/pages" query={{ ...filters, pageSize: paged.pageSize }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="页面" /></section></div>
  </AdminShell>;
}
