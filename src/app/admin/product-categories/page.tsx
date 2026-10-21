import Link from "next/link";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, EmptyState, Field, StatusPill, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { listCmsProducts, listProductCategories } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function value(params: Record<string, string | string[] | undefined>, name: string) {
  const item = params[name];
  return Array.isArray(item) ? item[0] || "" : item || "";
}

export default async function ProductCategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([listProductCategories(), listCmsProducts()]);
  const query = value(params, "query");
  const editing = categories.find((item) => item.id === value(params, "edit"));
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const productCounts = new Map(categories.map((category) => [category.id, products.filter((product) => product.categoryId === category.id).length]));
  const filtered = categories
    .filter((item) => !query || [item.name, item.slug, item.summary].join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const paged = paginate(filtered, page, pageSize);

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="内容管理" title="产品分类" description="维护分类层级、排序、展示状态和搜索信息。" />
      {value(params, "error") === "category-in-use" ? <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">此分类仍有关联产品，请先调整产品分类。</p> : null}
      <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form action={saveCategory} className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">{editing ? "编辑分类" : "新增分类"}</h2>
            {editing ? <Link className="text-sm font-bold text-[var(--navy-800)]" href="/admin/product-categories">取消</Link> : null}
          </div>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="分类名称"><input name="name" required minLength={2} defaultValue={editing?.name} className={inputClass} placeholder="Fire Pump Series" /></Field>
          <Field label="路径标识"><input name="slug" required minLength={2} defaultValue={editing?.slug} className={inputClass} placeholder="fire-pump-series" /></Field>
          <Field label="上级分类">
            <select name="parentId" defaultValue={editing?.parentId || ""} className={inputClass}>
              <option value="">一级分类</option>
              {categories.filter((item) => item.enabled && !item.parentId && item.id !== editing?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="排序"><input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 10} className={inputClass} /></Field>
          <Field label="封面图片"><input name="coverImage" defaultValue={editing?.coverImage} className={inputClass} /></Field>
          <Field label="简介"><textarea name="summary" rows={3} defaultValue={editing?.summary} className={textareaClass} /></Field>
          <Field label="详细说明"><textarea name="description" rows={3} defaultValue={editing?.description} className={textareaClass} /></Field>
          <Field label="SEO Title"><input name="seoTitle" defaultValue={editing?.seoTitle} className={inputClass} /></Field>
          <Field label="SEO Description"><textarea name="seoDescription" rows={3} defaultValue={editing?.seoDescription} className={textareaClass} /></Field>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="enabled" type="checkbox" defaultChecked={editing?.enabled ?? true} /> 启用分类</label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="indexable" type="checkbox" defaultChecked={editing?.indexable ?? true} /> 允许收录</label>
          <button className="button button-primary" type="submit">{editing ? "更新分类" : "保存分类"}</button>
        </form>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <form className="flex gap-3 border-b border-slate-200 bg-slate-50 p-4" method="get">
            <input name="query" defaultValue={query} className={inputClass} placeholder="搜索分类名称或路径" />
            <select name="pageSize" defaultValue={String(paged.pageSize)} className={inputClass}>
              {[20, 25, 50, 100].map((size) => <option key={size} value={size}>{size} 条 / 页</option>)}
            </select>
            <button className="button button-primary min-h-11" type="submit">筛选</button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>{["分类", "路径", "产品数", "状态", "排序", "操作"].map((head) => <th key={head} className="px-5 py-3 font-black">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><strong className="block text-slate-950">{item.name}</strong><span className="block max-w-md truncate text-xs text-slate-500">{item.summary}</span></td>
                    <td className="px-5 py-4 text-slate-700">{item.slug}</td>
                    <td className="px-5 py-4 text-slate-700">{productCounts.get(item.id) || 0}</td>
                    <td className="px-5 py-4"><StatusPill value={item.enabled ? "active" : "offline"} /></td>
                    <td className="px-5 py-4 text-slate-700">{item.sortOrder}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-[var(--navy-800)]" href={`/admin/product-categories?edit=${encodeURIComponent(item.id)}`}>编辑</Link>
                        {item.enabled ? <form action={deleteCategory}><input type="hidden" name="id" value={item.id} /><button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600" type="submit">停用</button></form> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!paged.items.length ? <div className="p-5"><EmptyState text="没有符合条件的产品分类。" /></div> : null}
          </div>
          <AdminPagination pathname="/admin/product-categories" query={{ query, pageSize: paged.pageSize }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="分类" />
        </section>
      </div>
    </AdminShell>
  );
}
