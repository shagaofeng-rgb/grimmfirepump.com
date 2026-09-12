import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-widgets";
import { listCmsBlogCategories, listCmsNews } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function NewsCategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [news, configuredCategories] = await Promise.all([listCmsNews(), listCmsBlogCategories()]);
  const counts = news.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const categories = [...configuredCategories.map((item) => [item.name, counts[item.name] || 0] as const), ...Object.entries(counts).filter(([name]) => !configuredCategories.some((item) => item.name === name))]
    .sort((a, b) => b[1] - a[1]);
  const pageSize = paginationPageSize(param(params, "pageSize"));
  const pagedCategories = paginate(categories, parsePositiveInt(param(params, "page")), pageSize);

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="新闻分类" title="新闻分类统计" description="按已发布和已录入文章的分类字段统计内容数量。" />
      <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 font-black">分类</th><th className="px-4 py-3 font-black">文章数量</th><th className="px-4 py-3 font-black">状态</th></tr></thead>
          <tbody>
            {pagedCategories.items.map(([category, count]) => (
              <tr key={category} className="border-t border-slate-100">
                <td className="px-4 py-4 font-bold">{category}</td>
                <td className="px-4 py-4">{count}</td>
                <td className="px-4 py-4"><StatusPill value="active" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <AdminPagination pathname="/admin/news-categories" query={{ pageSize: String(pageSize) }} page={pagedCategories.page} totalPages={pagedCategories.totalPages} total={pagedCategories.total} pageSize={pagedCategories.pageSize} label="分类" />
      </section>
    </AdminShell>
  );
}
