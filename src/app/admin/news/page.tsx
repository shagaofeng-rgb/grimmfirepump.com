import Link from "next/link";
import { ArrowRight, ExternalLink, Filter, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, EmptyState, StatusPill, inputClass } from "@/components/admin/admin-widgets";
import { isLegacyImportedBlogSlug, listCmsNews } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
function value(params: Record<string, string | string[] | undefined>, name: string) { const item = params[name]; return Array.isArray(item) ? item[0] || "" : item || ""; }

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const news = await listCmsNews();
  const filters = { query: value(params, "query"), status: value(params, "status") || "all", category: value(params, "category") || "all" };
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const categories = [...new Set(news.map((item) => item.category).filter(Boolean))];
  const filtered = news.filter((item) => {
    const search = filters.query.toLowerCase();
    return (!search || [item.title, item.excerpt, item.category, item.tags.join(" ")].join(" ").toLowerCase().includes(search)) && (filters.status === "all" || item.status === filters.status) && (filters.category === "all" || item.category === filters.category);
  }).sort((a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt));
  const paged = paginate(filtered, page, pageSize);
  return <AdminShell>
    <AdminPageHeader eyebrow="网站内容" title="文章管理" description="管理文章内容、分类与发布状态" action={<Link className="button button-primary" href="/admin/news/new"><Plus size={16} />新增文章</Link>} />
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <form className="admin-list-toolbar grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_180px_220px_auto]" method="get"><input name="query" defaultValue={filters.query} className={inputClass} placeholder="搜索文章标题、摘要或标签" /><select name="status" defaultValue={filters.status} className={inputClass}><option value="all">全部状态</option><option value="published">已发布</option><option value="draft">草稿</option><option value="archived">已归档</option></select><select name="category" defaultValue={filters.category} className={inputClass}><option value="all">全部分类</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><select name="pageSize" defaultValue={String(paged.pageSize)} className={inputClass}><option value="20">20 条 / 页</option><option value="25">25 条 / 页</option><option value="50">50 条 / 页</option><option value="100">100 条 / 页</option></select><button className="button button-primary min-h-11" type="submit"><Filter size={16} />应用筛选</button></form>
      <div className="overflow-x-auto"><table className="admin-news-table min-w-[880px] w-full text-left text-sm"><thead><tr>{["文章", "分类", "状态", "操作"].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{paged.items.map((item) => <tr key={item.id}><td className="px-5 py-4"><strong className="block max-w-lg truncate">{item.title}</strong><span className="mt-1 block max-w-lg truncate text-xs text-slate-500">{item.excerpt}</span><time className="mt-1 block text-xs text-slate-500" dateTime={item.publishAt}>{item.status === "published" ? "发布于" : "计划时间"} {new Date(item.publishAt).toLocaleString("zh-CN")}</time></td><td className="px-5 py-4">{item.category || "未分类"}</td><td className="px-5 py-4"><StatusPill value={item.status} /><span className="mt-1 block text-xs text-slate-500">{item.featured ? "推荐" : "普通"} · {item.pinned ? "置顶" : "未置顶"}</span></td><td className="px-5 py-4"><div className="flex gap-2"><Link className="admin-inline-action admin-inline-action-primary" href={`/admin/news/${item.id}/edit`}>编辑 <ArrowRight size={14} /></Link>{item.status === "published" && Date.parse(item.publishAt) <= Date.now() && !isLegacyImportedBlogSlug(item.slug) ? <Link className="admin-inline-action" href={`/blog/${item.slug}`} target="_blank" rel="noopener noreferrer">查看网站 <ExternalLink size={14} /></Link> : null}</div></td></tr>)}</tbody></table>{!paged.items.length ? <div className="p-5"><EmptyState text="没有符合条件的文章。" /></div> : null}</div>
      <AdminPagination pathname="/admin/news" query={{ ...filters, pageSize: paged.pageSize }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="文章" />
    </section>
  </AdminShell>;
}
