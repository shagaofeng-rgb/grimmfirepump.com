import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, EmptyState, StatCard, StatusPill } from "@/components/admin/admin-widgets";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { getNewsAutomationHealth, listNewsArticles } from "@/lib/news-automation";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function formatTime(value: string | null) {
  return value ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "暂无记录";
}

export default async function AdminNewsAutomationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parsePositiveInt(param(params, "page"));
  const pageSize = paginationPageSize(param(params, "pageSize"));
  const [articles, health] = await Promise.all([listNewsArticles(), getNewsAutomationHealth()]);
  const published = articles.filter((item) => item.status === "published" || item.status === "published_success");
  const paged = paginate(articles, page, pageSize);

  return <AdminShell>
    <AdminPageHeader eyebrow="网站内容" title="资讯发布" action={<Link className="button button-secondary" href="/news" target="_blank">查看前台</Link>} />
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <StatCard label="发布状态" value={health.overdue ? "待处理" : "正常"} hint={`最近发布 ${formatTime(health.lastSuccessAt)}`} />
      <StatCard label="下一次更新" value={formatTime(health.eligibleAt)} />
      <StatCard label="已发布资讯" value={published.length} hint={`共 ${articles.length} 篇`} />
    </div>
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between"><h2 className="text-xl font-black text-slate-950">资讯记录</h2><form method="get" className="flex gap-2"><select name="pageSize" defaultValue={String(pageSize)} className="min-h-10 rounded-md border border-slate-200 px-2 text-sm"><option value="20">20 / 页</option><option value="25">25 / 页</option><option value="50">50 / 页</option><option value="100">100 / 页</option></select><button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">更新</button></form></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["资讯", "状态", "来源", "发布时间", "网站展示"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead><tbody>{paged.items.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-4"><strong className="block max-w-xl truncate text-slate-900">{item.title}</strong><span className="mt-1 block max-w-xl truncate text-xs text-slate-500">{item.summary}</span></td><td className="px-4 py-4"><StatusPill value={item.status} /></td><td className="px-4 py-4 text-slate-600">{item.sourceName || "-"}</td><td className="px-4 py-4 text-slate-600">{item.publishAt ? formatTime(item.publishAt) : "-"}</td><td className="px-4 py-4">{item.slug ? <Link className="font-black text-orange-700" href={`/news/${item.slug}`} target="_blank">查看</Link> : "-"}</td></tr>)}</tbody></table>{!paged.items.length ? <div className="p-5"><EmptyState text="暂无资讯记录。" /></div> : null}</div>
      <AdminPagination pathname="/admin/news-automation" query={{ pageSize: String(pageSize) }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="资讯" />
    </section>
  </AdminShell>;
}
