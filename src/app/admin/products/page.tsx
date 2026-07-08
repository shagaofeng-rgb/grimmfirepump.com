import Link from "next/link";
import { deleteProduct } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-widgets";
import { listCmsProducts } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listCmsProducts();

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="产品管理"
        title="产品上传、编辑与发布"
        description="管理工业品产品名称、分类、型号、SKU、技术参数、图片、SEO、发布状态和推荐状态。"
        action={<Link className="button button-primary" href="/admin/products/new">新增产品</Link>}
      />
      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_180px_160px]">
          <input className="min-h-11 rounded-md border border-slate-300 px-3 text-sm" placeholder="搜索产品名称、型号、SKU..." />
          <select className="min-h-11 rounded-md border border-slate-300 px-3 text-sm">
            <option>全部状态</option>
            <option>published</option>
            <option>draft</option>
            <option>offline</option>
          </select>
          <a className="button button-secondary min-h-11 text-sm" href="/api/admin/export?type=products">导出 CSV</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {["产品", "分类", "型号/SKU", "状态", "推荐", "更新时间", "操作"].map((head) => (
                  <th key={head} className="px-4 py-3 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-4">
                    <strong className="block text-slate-950">{product.title}</strong>
                    <span className="mt-1 block max-w-md truncate text-slate-500">{product.summary}</span>
                  </td>
                  <td className="px-4 py-4">{product.categoryName}</td>
                  <td className="px-4 py-4">{product.model}<br /><span className="text-slate-400">{product.sku}</span></td>
                  <td className="px-4 py-4"><StatusPill value={product.status} /></td>
                  <td className="px-4 py-4">{product.featured ? "推荐" : "普通"} / {product.hot ? "热门" : "非热门"}</td>
                  <td className="px-4 py-4 text-slate-500">{new Date(product.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="rounded-md bg-slate-100 px-3 py-2 font-bold text-slate-700" href={`/admin/products/${product.id}/edit`}>编辑</Link>
                      <Link className="rounded-md bg-blue-50 px-3 py-2 font-bold text-blue-700" href={`/products/${product.slug}`} target="_blank">预览</Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button className="rounded-md bg-red-50 px-3 py-2 font-bold text-red-700" type="submit">删除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
