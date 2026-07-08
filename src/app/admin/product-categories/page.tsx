import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, Field, StatusPill, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { listCmsProducts, listProductCategories } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  const [categories, products] = await Promise.all([listProductCategories(), listCmsProducts()]);
  const productCounts = new Map(categories.map((category) => [category.id, products.filter((product) => product.categoryId === category.id).length]));

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="产品分类" title="产品分类与 SEO 管理" description="支持父分类、排序、启用停用、SEO、Canonical、OG 图片和收录开关。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">新增 / 编辑分类</h2>
          <form action={saveCategory} className="mt-5 grid gap-4">
            <Field label="分类英文名称"><input name="name" required className={inputClass} placeholder="Fire Pump Series" /></Field>
            <Field label="URL Slug"><input name="slug" required className={inputClass} placeholder="fire-pump-series" /></Field>
            <Field label="父分类 ID"><input name="parentId" className={inputClass} placeholder="留空为一级分类" /></Field>
            <Field label="排序"><input name="sortOrder" type="number" defaultValue="10" className={inputClass} /></Field>
            <Field label="封面图片"><input name="coverImage" className={inputClass} placeholder="/assets/..." /></Field>
            <Field label="分类简介"><textarea name="summary" rows={3} className={textareaClass} /></Field>
            <Field label="详细描述"><textarea name="description" rows={4} className={textareaClass} /></Field>
            <Field label="SEO Title"><input name="seoTitle" className={inputClass} /></Field>
            <Field label="SEO Description"><textarea name="seoDescription" rows={3} className={textareaClass} /></Field>
            <Field label="SEO Keywords"><input name="seoKeywords" className={inputClass} /></Field>
            <Field label="Canonical URL"><input name="canonicalUrl" className={inputClass} /></Field>
            <Field label="Open Graph 图片"><input name="ogImage" className={inputClass} /></Field>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="enabled" type="checkbox" defaultChecked /> 启用分类</label>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="indexable" type="checkbox" defaultChecked /> 允许收录</label>
            <button className="button button-primary" type="submit">保存分类</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>{["分类", "Slug", "产品数", "状态", "排序", "操作"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-slate-100">
                  <td className="px-4 py-4"><strong>{category.name}</strong><p className="mt-1 text-slate-500">{category.summary}</p></td>
                  <td className="px-4 py-4">{category.slug}</td>
                  <td className="px-4 py-4">{productCounts.get(category.id) || 0}</td>
                  <td className="px-4 py-4"><StatusPill value={category.enabled ? "active" : "disabled"} /></td>
                  <td className="px-4 py-4">{category.sortOrder}</td>
                  <td className="px-4 py-4">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={category.id} />
                      <button className="rounded-md bg-red-50 px-3 py-2 font-bold text-red-700" type="submit">删除</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AdminShell>
  );
}
