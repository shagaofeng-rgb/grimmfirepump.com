import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader, EmptyState, StatCard, StatusPill } from "@/components/admin/admin-widgets";
import { getNewsConfig, listNewsArticles, listNewsAudits, listNewsJobs, listNewsSources } from "@/lib/news-automation";

export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminNewsAutomationPage() {
  const [articles, jobs, audits, sources] = await Promise.all([listNewsArticles(), listNewsJobs(), listNewsAudits(), listNewsSources()]);
  const config = getNewsConfig();
  const today = todayKey();
  const published = articles.filter((item) => item.status === "published");
  const publishedToday = published.filter((item) => (item.publishAt || item.createdAt).slice(0, 10) === today).length;
  const failed = articles.filter((item) => item.status === "failed").length;
  const latestAudit = audits[0];

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="新闻自动化"
        title="News 自动采集、去重、发布与审计"
        description="检查公开新闻来源、72 小时过滤、7 天去重、产品关联、图片来源、RSS/Sitemap 和发布审计状态。"
        action={<Link className="button button-primary" href="/news" target="_blank">查看前台 News</Link>}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="每日发布目标" value={config.dailyTarget} hint={`${config.timezone} · ${config.lookbackHours} 小时来源窗口`} />
        <StatCard label="今日已发布" value={publishedToday} hint={publishedToday >= config.dailyTarget ? "今日目标已达成" : "自动任务会继续补发"} />
        <StatCard label="自动 News 总数" value={articles.length} hint={`已发布 ${published.length} / 失败 ${failed}`} />
        <StatCard label="新闻来源" value={sources.length} hint={`${sources.filter((item) => item.enabled).length} 个已启用`} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard title="运行配置">
          <div className="grid gap-3 text-sm">
            {[
              ["自动发布", config.autoPublish ? "启用" : "关闭"],
              ["去重窗口", `${config.dedupDays} 天`],
              ["最大重试", `${config.maxRetries} 次`],
              ["产品相关性阈值", `${config.relevanceThreshold}`],
              ["告警邮箱/Webhook", config.alertEmailConfigured ? "已配置" : "未配置"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-slate-50 p-4">
                <span className="font-black text-slate-700">{label}</span>
                <span className="font-bold text-slate-500">{value}</span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="最近发布审计">
          {latestAudit ? (
            <div className="rounded-md bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <strong>{latestAudit.date}</strong>
                <StatusPill value={latestAudit.status} />
              </div>
              <p className="mt-3 leading-6 text-slate-600">{latestAudit.message}</p>
              <p className="mt-3 text-xs font-bold text-slate-500">
                Published {latestAudit.published} / Generated {latestAudit.generated} / Duplicate {latestAudit.duplicates} / Failed {latestAudit.failed}
              </p>
            </div>
          ) : (
            <EmptyState text="暂无自动发布审计记录。Cron 首次运行后会显示。" />
          )}
        </AdminCard>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdminCard title="新闻来源状态">
          <div className="grid gap-3">
            {sources.map((source) => (
              <div key={source.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <strong className="truncate">{source.name}</strong>
                  <StatusPill value={source.lastStatus || "not_configured"} />
                </div>
                <p className="mt-2 truncate text-xs font-bold text-slate-500">{source.url}</p>
                {source.lastError ? <p className="mt-2 text-xs font-bold text-red-600">{source.lastError}</p> : null}
              </div>
            ))}
            {!sources.length ? <EmptyState text="暂无新闻来源。" /> : null}
          </div>
        </AdminCard>

        <AdminCard title="最近任务">
          <div className="grid gap-3">
            {jobs.slice(0, 8).map((job) => (
              <div key={job.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <strong>{job.type}</strong>
                  <StatusPill value={job.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{job.message}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{new Date(job.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {!jobs.length ? <EmptyState text="暂无任务记录。" /> : null}
          </div>
        </AdminCard>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>{["文章", "状态", "来源", "图片来源", "关联产品", "发布时间"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr>
          </thead>
          <tbody>
            {articles.slice(0, 20).map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-4">
                  <strong>{item.title}</strong>
                  <p className="mt-1 max-w-xl truncate text-slate-500">{item.summary}</p>
                </td>
                <td className="px-4 py-4"><StatusPill value={item.status} /></td>
                <td className="px-4 py-4"><a className="text-blue-700 underline" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName}</a></td>
                <td className="px-4 py-4"><a className="text-blue-700 underline" href={item.coverImagePageUrl || item.coverImageSourceUrl} target="_blank" rel="noreferrer">{item.coverImageStatus}</a></td>
                <td className="px-4 py-4 text-slate-600">{item.relatedProducts.map((product) => product.title).join(" / ")}</td>
                <td className="px-4 py-4 text-slate-500">{item.publishAt ? new Date(item.publishAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
            {!articles.length ? (
              <tr>
                <td className="px-4 py-6" colSpan={6}><EmptyState text="暂无自动 News 文章。" /></td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
