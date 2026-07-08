import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, AdminCard, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key] || "unknown");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export default async function AdminAnalyticsPage() {
  const { events, eventCounts, inquiries } = await getAdminData();
  const pageViews = events.filter((item) => item.event === "page_view");
  const conversions = events.filter((item) => ["inquiry_submit", "download_click", "whatsapp_click"].includes(item.event));
  const topPages = Object.entries(countBy(events, "path")).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const sourceDistribution = Object.entries(countBy(inquiries, "sourcePage")).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="访问分析" title="网站自有事件和转化分析" description="GA4、Search Console、Meta Pixel 未配置时显示未配置状态；本页展示网站自有事件，不伪造第三方数据。" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="总事件" value={events.length} />
        <StatCard label="页面访问" value={pageViews.length} />
        <StatCard label="转化事件" value={conversions.length} />
        <StatCard label="表单转化率" value={pageViews.length ? `${Math.round((inquiries.length / pageViews.length) * 100)}%` : "0%"} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <AdminCard title="事件类型分布">
          <div className="grid gap-3">{Object.entries(eventCounts).map(([event, count]) => <div key={event} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm"><strong>{event}</strong><span>{count}</span></div>)}</div>
        </AdminCard>
        <AdminCard title="热门页面">
          <div className="grid gap-3">{topPages.map(([path, count]) => <div key={path} className="flex justify-between gap-4 rounded-md bg-slate-50 p-3 text-sm"><span className="break-all">{path}</span><strong>{count}</strong></div>)}</div>
        </AdminCard>
        <AdminCard title="询盘来源分布">
          <div className="grid gap-3">{sourceDistribution.map(([source, count]) => <div key={source} className="flex justify-between gap-4 rounded-md bg-slate-50 p-3 text-sm"><span className="break-all">{source}</span><strong>{count}</strong></div>)}</div>
        </AdminCard>
        <AdminCard title="第三方同步状态">
          <div className="grid gap-3 text-sm text-slate-600">
            <p>GA4 API：未配置凭证时不显示真实第三方数据。</p>
            <p>Google Search Console：已预留设置字段和 SEO 页面。</p>
            <p>Meta Lead Ads：已预留 Webhook 接口 `/api/integrations/meta-leads`。</p>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
