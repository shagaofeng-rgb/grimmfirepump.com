import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-widgets";
import { listCmsBlogCategories, listCmsNews } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function NewsCategoriesPage() {
  const [news, configuredCategories] = await Promise.all([listCmsNews(), listCmsBlogCategories()]);
  const counts = news.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const categories = [...configuredCategories.map((item) => [item.name, counts[item.name] || 0] as const), ...Object.entries(counts).filter(([name]) => !configuredCategories.some((item) => item.name === name))]
    .sort((a, b) => b[1] - a[1]);

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="新闻分类" title="新闻分类统计" description="按已发布和已录入文章的分类字段统计内容数量。" />
      <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 font-black">分类</th><th className="px-4 py-3 font-black">文章数量</th><th className="px-4 py-3 font-black">状态</th></tr></thead>
          <tbody>
            {categories.map(([category, count]) => (
              <tr key={category} className="border-t border-slate-100">
                <td className="px-4 py-4 font-bold">{category}</td>
                <td className="px-4 py-4">{count}</td>
                <td className="px-4 py-4"><StatusPill value="active" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
