import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, EmptyState, StatusPill, inputClass } from "@/components/admin/admin-widgets";
import { listCmsProducts, listProductCategories } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, name: string) {
  const item = params[name];
  return Array.isArray(item) ? item[0] || "" : item || "";
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([listCmsProducts(), listProductCategories()]);
  const filters = { query: value(params, "query"), status: value(params, "status") || "all", category: value(params, "category") || "all" };
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const filtered = products.filter((product) => {
    const search = filters.query.toLowerCase();
    return (!search || [product.title, product.model, product.sku, product.categoryName, product.tags.join(" ")].join(" ").toLowerCase().includes(search))
      && (filters.status === "all" || product.status === filters.status)
      && (filters.category === "all" || product.categoryId === filters.category);
  }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const paged = paginate(filtered, page, pageSize);
  return <AdminShell>
    <AdminPageHeader eyebrow="内容管理" title="产品" description="管理产品资料、型号、技术参数、图片、SEO 和发布状态。" action={<Link className="button button-primary" href="/admin/products/new">新增产品</Link>} />
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <form className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_220px_auto]" method="get"><input name="query" defaultValue={filters.query} className={inputClass} placeholder="搜索产品名称、型号、SKU" /><select name="status" defaultValue={filters.status} className={inputClass}><option value="all">全部状态</option><option value="published">已发布</option><option value="draft">草稿</option><option value="offline">下架</option><option value="archived">已归档</option></select><select name="category" defaultValue={filters.category} className={inputClass}><option value="all">全部分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><select name="pageSize" defaultValue={String(paged.pageSize)} className={inputClass}><option value="20">20 条 / 页</option><option value="25">25 条 / 页</option><option value="50">50 条 / 页</option><option value="100">100 条 / 页</option></select><button className="button button-primary min-h-11" type="submit">应用筛选</button></form>
      <div className="overflow-x-auto"><table className="min-w-[1080px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["产品", "分类", "型号 / SKU", "状态", "标记", "更新时间", "操作"].map((head) => <th key={head} className="px-5 py-3 font-black">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{paged.items.map((product) => <tr key={product.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><strong className="block max-w-sm truncate text-slate-950">{product.title}</strong><span className="mt-1 block max-w-md truncate text-xs text-slate-500">{product.summary}</span></td><td className="px-5 py-4 text-slate-700">{product.categoryName || "未分类"}</td><td className="px-5 py-4 text-slate-700">{product.model || "-"}<span className="block text-xs text-slate-500">{product.sku || "-"}</span></td><td className="px-5 py-4"><StatusPill value={product.status} /></td><td className="px-5 py-4 text-xs text-slate-600">{product.featured ? "推荐" : "普通"} · {product.hot ? "热门" : "常规"}</td><td className="px-5 py-4 text-slate-600">{new Date(product.updatedAt).toLocaleString("zh-CN")}</td><td className="px-5 py-4"><div className="flex gap-2"><Link className="rounded-md bg-slate-900 px-3 py-2 text-xs font-black text-white" href={`/admin/products/${product.id}/edit`}>编辑</Link><Link className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-slate-700" href={`/products/${product.slug}`} target="_blank">查看网站</Link></div></td></tr>)}</tbody></table>{!paged.items.length ? <div className="p-5"><EmptyState text="没有符合条件的产品。" /></div> : null}</div>
      <AdminPagination pathname="/admin/products" query={{ ...filters, pageSize: paged.pageSize }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="产品" />
    </section>
  </AdminShell>;
}
