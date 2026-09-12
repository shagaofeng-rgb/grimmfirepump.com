import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination, adminQuery } from "@/components/admin/admin-pagination";
import { AdminCard, AdminPageHeader, EmptyState, StatCard, StatusPill } from "@/components/admin/admin-widgets";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { getNewsAutomationHealth, getNewsConfig, listNewsArticles, listNewsAudits, listNewsJobs, listNewsSources } from "@/lib/news-automation";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type View = "articles" | "sources" | "history";

function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function viewParam(value: string): View {
  return value === "sources" || value === "history" ? value : "articles";
}

export default async function AdminNewsAutomationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = viewParam(param(params, "view"));
  const pageSize = paginationPageSize(param(params, "pageSize"));
  const page = parsePositiveInt(param(params, "page"));
  const [articles, jobs, audits, sources, health] = await Promise.all([
    listNewsArticles(),
    listNewsJobs(),
    listNewsAudits(),
    listNewsSources(),
    getNewsAutomationHealth(),
  ]);
  const config = getNewsConfig();
  const published = articles.filter((item) => item.status === "published" || item.status === "published_success");
  const failed = articles.filter((item) => item.status === "failed").length;
  const latestAudit = audits[0];
  const pagedArticles = paginate(articles, page, pageSize);
  const pagedSources = paginate(sources, page, pageSize);
  const pagedJobs = paginate(jobs, page, pageSize);
  const formatTime = (value: string | null) => value
    ? new Intl.DateTimeFormat("zh-CN", { timeZone: config.timezone, dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "等待首次发布";
  const tabQuery = { pageSize: String(pageSize) };

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="内容管理"
        title="行业资讯运营"
        description="查看行业资讯的来源、发布状态、图片使用状态和网站展示记录。"
        action={<Link className="button button-primary" href="/news" target="_blank">查看前台 News</Link>}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="发布状态" value={health.overdue ? "需要处理" : health.due ? "准备发布" : "正常"} hint={`最近发布：${formatTime(health.lastSuccessAt)}`} />
        <StatCard label="下一次内容更新" value={health.due ? "准备中" : formatTime(health.eligibleAt)} />
        <StatCard label="行业资讯总数" value={articles.length} hint={`已发布 ${published.length} / 需处理 ${failed}`} />
        <StatCard label="可用资讯来源" value={health.availableCandidates} hint={`${sources.filter((item) => item.enabled).length} 个来源已启用`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard title="发布计划">
          <div className="grid gap-3 text-sm">
            {[
              ["资讯发布", config.autoPublish ? "启用" : "关闭"],
              ["网站展示", health.productionEnabled ? "启用" : "关闭"],
              ["更新频率", "每 48 小时 1 篇"],
              ["来源检查", "每 12 小时"],
              ["重复内容检查", `${config.dedupDays} 天`],
              ["异常处理次数", `${config.maxRetries} 次`],
              ["通知状态", config.alertEmailConfigured ? "已配置" : "未配置"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-slate-50 p-4">
                <span className="font-black text-slate-700">{label}</span>
                <span className="font-bold text-slate-500">{value}</span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="最近发布记录">
          {latestAudit ? (
            <div className="rounded-md bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <strong>{latestAudit.date}</strong>
                <StatusPill value={latestAudit.status} />
              </div>
              <p className="mt-3 leading-6 text-slate-600">{latestAudit.message}</p>
              <p className="mt-3 text-xs font-bold text-slate-500">成功发布 {latestAudit.published} 篇，内容生成 {latestAudit.generated} 篇，重复拦截 {latestAudit.duplicates} 篇，失败 {latestAudit.failed} 篇。</p>
            </div>
          ) : (
            <EmptyState text="暂无发布记录。首次完成内容更新后会显示。" />
          )}
        </AdminCard>
      </div>

      <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="行业资讯记录">
            {([
              ["articles", "资讯内容"],
              ["sources", "资讯来源"],
              ["history", "执行记录"],
            ] as const).map(([id, label]) => (
              <Link key={id} href={adminQuery("/admin/news-automation", { ...tabQuery, view: id })} aria-current={view === id ? "page" : undefined} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 aria-[current=page]:border-orange-600 aria-[current=page]:bg-orange-600 aria-[current=page]:text-white">{label}</Link>
            ))}
          </div>
          <form method="get" className="flex items-center gap-2">
            <input type="hidden" name="view" value={view} />
            <select name="pageSize" defaultValue={String(pageSize)} className="min-h-10 rounded-md border border-slate-200 px-2 text-sm"><option value="20">20 / 页</option><option value="25">25 / 页</option><option value="50">50 / 页</option><option value="100">100 / 页</option></select>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold">更新</button>
          </form>
        </div>

        {view === "articles" ? <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>{["文章", "状态", "来源", "图片使用", "关联产品", "发布时间"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead>
              <tbody>
                {pagedArticles.items.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-4"><strong>{item.title}</strong><p className="mt-1 max-w-xl truncate text-slate-500">{item.summary}</p></td><td className="px-4 py-4"><StatusPill value={item.status} /></td><td className="px-4 py-4"><a className="text-blue-700 underline" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName}</a></td><td className="px-4 py-4"><a className="text-blue-700 underline" href={item.coverImagePageUrl || item.coverImageSourceUrl} target="_blank" rel="noreferrer">{item.coverImageStatus}</a></td><td className="px-4 py-4 text-slate-600">{item.relatedProducts.map((product) => product.title).join(" / ") || "-"}</td><td className="px-4 py-4 text-slate-500">{item.publishAt ? new Date(item.publishAt).toLocaleString("zh-CN") : "-"}</td></tr>)}
              </tbody>
            </table>
            {!pagedArticles.items.length ? <div className="p-5"><EmptyState text="暂无行业资讯文章。" /></div> : null}
          </div>
          <AdminPagination pathname="/admin/news-automation" query={{ ...tabQuery, view }} page={pagedArticles.page} totalPages={pagedArticles.totalPages} total={pagedArticles.total} pageSize={pagedArticles.pageSize} label="文章" />
        </> : null}

        {view === "sources" ? <>
          <div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["来源", "地址", "状态", "最近检查", "说明"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead><tbody>{pagedSources.items.map((source) => <tr key={source.id} className="border-t border-slate-100"><td className="px-4 py-4 font-bold">{source.name}</td><td className="max-w-xs px-4 py-4"><a className="block truncate text-blue-700 underline" href={source.url} target="_blank" rel="noreferrer">{source.url}</a></td><td className="px-4 py-4"><StatusPill value={source.lastStatus || "not_configured"} /></td><td className="px-4 py-4 text-slate-600">{source.lastFetchedAt ? new Date(source.lastFetchedAt).toLocaleString("zh-CN") : "暂无记录"}</td><td className="max-w-sm px-4 py-4 text-slate-600">{source.lastError || "状态正常"}</td></tr>)}</tbody></table>{!pagedSources.items.length ? <div className="p-5"><EmptyState text="暂无资讯来源。" /></div> : null}</div>
          <AdminPagination pathname="/admin/news-automation" query={{ ...tabQuery, view }} page={pagedSources.page} totalPages={pagedSources.totalPages} total={pagedSources.total} pageSize={pagedSources.pageSize} label="来源" />
        </> : null}

        {view === "history" ? <>
          <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{["时间", "任务", "状态", "执行说明"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead><tbody>{pagedJobs.items.map((job) => <tr key={job.id} className="border-t border-slate-100"><td className="px-4 py-4 text-slate-600">{new Date(job.createdAt).toLocaleString("zh-CN")}</td><td className="px-4 py-4 font-bold">{job.type}</td><td className="px-4 py-4"><StatusPill value={job.status} /></td><td className="max-w-xl px-4 py-4 text-slate-600">{job.message}</td></tr>)}</tbody></table>{!pagedJobs.items.length ? <div className="p-5"><EmptyState text="暂无执行记录。" /></div> : null}</div>
          <AdminPagination pathname="/admin/news-automation" query={{ ...tabQuery, view }} page={pagedJobs.page} totalPages={pagedJobs.totalPages} total={pagedJobs.total} pageSize={pagedJobs.pageSize} label="记录" />
        </> : null}
      </section>
    </AdminShell>
  );
}
