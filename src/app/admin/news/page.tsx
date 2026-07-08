import Link from "next/link";
import { deleteNews } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-widgets";
import { listCmsNews } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await listCmsNews();
  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="新闻管理"
        title="新闻、博客和行业知识内容"
        description="支持草稿、发布、置顶、推荐、SEO、来源和历史编辑记录预留。"
        action={<Link className="button button-primary" href="/admin/news/new">新增文章</Link>}
      />
      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>{["文章", "分类", "状态", "推荐/置顶", "发布时间", "操作"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr>
          </thead>
          <tbody>
            {news.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-4"><strong>{item.title}</strong><p className="mt-1 max-w-xl truncate text-slate-500">{item.excerpt}</p></td>
                <td className="px-4 py-4">{item.category}</td>
                <td className="px-4 py-4"><StatusPill value={item.status} /></td>
                <td className="px-4 py-4">{item.featured ? "推荐" : "普通"} / {item.pinned ? "置顶" : "未置顶"}</td>
                <td className="px-4 py-4 text-slate-500">{new Date(item.publishAt).toLocaleString()}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link className="rounded-md bg-slate-100 px-3 py-2 font-bold text-slate-700" href={`/admin/news/${item.id}/edit`}>编辑</Link>
                    <Link className="rounded-md bg-blue-50 px-3 py-2 font-bold text-blue-700" href={`/blog/${item.slug}`} target="_blank">预览</Link>
                    <form action={deleteNews}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="rounded-md bg-red-50 px-3 py-2 font-bold text-red-700" type="submit">删除</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
