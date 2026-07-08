import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function withinDays(date: string, days: number) {
  return Date.now() - Date.parse(date) <= days * 24 * 60 * 60 * 1000;
}

export default async function AdminDashboardPage() {
  const data = await getAdminData();
  const todayLeads = data.inquiries.filter((item) => isToday(item.createdAt)).length;
  const weekLeads = data.inquiries.filter((item) => withinDays(item.createdAt, 7)).length;
  const monthLeads = data.inquiries.filter((item) => withinDays(item.createdAt, 30)).length;
  const highIntent = data.inquiries.filter((item) => item.score >= 60 || item.intent === "A").length;
  const pageViews = data.events.filter((item) => item.event === "page_view");
  const topEvents = Object.entries(data.eventCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="数据概览"
        title="工业品外贸网站运营控制台"
        description="集中查看产品、新闻、询盘、下载资料、访问事件、SEO 和待处理任务。第三方 GA4 / Search Console / Meta 数据未配置时不会伪造数据。"
        action={<Link className="button button-primary" href="/admin/leads">处理询盘</Link>}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="产品总数" value={data.totals.products} hint={`已发布 ${data.totals.publishedProducts} / 草稿 ${data.totals.draftProducts}`} />
        <StatCard label="新闻总数" value={data.totals.posts} hint={`已发布 ${data.totals.publishedNews}`} />
        <StatCard label="客户询盘" value={data.totals.inquiries} hint={`今日 ${todayLeads} / 本周 ${weekLeads} / 本月 ${monthLeads}`} />
        <StatCard label="高意向询盘" value={highIntent} hint="按线索评分和意向等级统计" />
        <StatCard label="下载线索" value={data.totals.downloadLeads} hint="目录、资料下载表单" />
        <StatCard label="访问事件" value={data.totals.events} hint={`页面访问 ${pageViews.length}`} />
        <StatCard label="媒体资源" value={data.totals.media} hint="图片、PDF、视频、CAD 文件" />
        <StatCard label="操作日志" value={data.totals.auditLogs} hint="登录、编辑、删除、设置变更" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard title="最近询盘">
          <div className="grid gap-3">
            {data.inquiries.slice(0, 6).map((item) => (
              <Link key={item.id} href="/admin/leads" className="rounded-md border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-4">
                  <strong>{item.name}</strong>
                  <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-700">Score {item.score}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.product || "Product TBD"} · {item.country || "Country TBD"} · {item.email}</p>
              </Link>
            ))}
            {!data.inquiries.length ? <EmptyState text="暂无询盘。前台 Contact 和产品询价提交后会进入这里。" /> : null}
          </div>
        </AdminCard>

        <AdminCard title="事件与转化">
          <div className="grid gap-3">
            {topEvents.map(([event, count]) => (
              <div key={event} className="flex items-center justify-between rounded-md bg-slate-50 p-4 text-sm">
                <span className="font-black text-slate-700">{event}</span>
                <span className="font-black text-orange-600">{count}</span>
              </div>
            ))}
            {!topEvents.length ? <EmptyState text="暂无访问事件。前台页面访问和 CTA 点击会逐步记录。" /> : null}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
