import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, AdminCard, StatusPill } from "@/components/admin/admin-widgets";
import { getSiteSettings, listCmsProducts, listCmsNews } from "@/lib/admin-cms";
import { listSitemapRuns } from "@/lib/sitemap-service";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const [settings, products, news, sitemapRuns] = await Promise.all([getSiteSettings(), listCmsProducts(), listCmsNews(), listSitemapRuns()]);
  const sitemap = sitemapRuns[0];
  const seoIssues = [
    ...products.filter((item) => !item.seoTitle || item.seoDescription.length < 70).map((item) => ({ type: "Product", title: item.title, issue: "SEO 标题或描述不足" })),
    ...news.filter((item) => !item.seoTitle || item.seoDescription.length < 70).map((item) => ({ type: "News", title: item.title, issue: "SEO 标题或描述不足" })),
  ];
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="SEO 管理" title="SEO、GEO 和搜索数据配置" description="管理页面 SEO、搜索验证、统计代码和基础页面审计。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminCard title="网站级 SEO 设置">
          <div className="grid gap-3 text-sm text-slate-600">
            <p><strong>Canonical 域名：</strong>{settings.website}</p>
            <p className="flex items-center justify-between gap-4"><strong>GA4</strong><StatusPill value={settings.ga4Id ? "configured" : "not_configured"} /></p>
            <p className="flex items-center justify-between gap-4"><strong>GTM</strong><StatusPill value={settings.gtmId ? "configured" : "not_configured"} /></p>
            <p className="flex items-center justify-between gap-4"><strong>Meta Pixel</strong><StatusPill value={settings.metaPixelId ? "configured" : "not_configured"} /></p>
            <p className="flex items-center justify-between gap-4"><strong>Google 验证</strong><StatusPill value={settings.googleVerification ? "configured" : "not_configured"} /></p>
            <p className="flex items-center justify-between gap-4"><strong>Bing 验证</strong><StatusPill value={settings.bingVerification ? "configured" : "not_configured"} /></p>
          </div>
        </AdminCard>
        <AdminCard title="SEO 异常提醒">
          <div className="grid gap-3">
            {seoIssues.slice(0, 12).map((item) => <div key={`${item.type}-${item.title}`} className="flex justify-between gap-4 rounded-md bg-slate-50 p-3 text-sm"><span>{item.type}: {item.title}</span><StatusPill value={item.issue} /></div>)}
            {!seoIssues.length ? <StatusPill value="success" /> : null}
          </div>
        </AdminCard>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminCard title="Sitemap 自动更新">
          <div className="grid gap-3 text-sm text-slate-600">
            <p className="flex items-center justify-between gap-4"><strong>公开入口</strong><a className="font-bold text-blue-700 underline" href="/sitemap.xml" target="_blank">/sitemap.xml</a></p>
            <p className="flex items-center justify-between gap-4"><strong>最近状态</strong><StatusPill value={sitemap?.status || "not_run"} /></p>
            <p><strong>最近执行：</strong>{sitemap?.finishedAt ? new Date(sitemap.finishedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "尚无执行记录"}</p>
            <p><strong>已收录 URL：</strong>{sitemap?.success ?? 0}，跳过 {sitemap?.skipped ?? 0}，错误 {sitemap?.errors.length ?? 0}</p>
            <p><strong>内容差异：</strong>新增 {sitemap?.added.length ?? 0}，修改 {sitemap?.modified.length ?? 0}，删除 {sitemap?.removed.length ?? 0}</p>
          </div>
        </AdminCard>
        <AdminCard title="Google Search Console 提交">
          <div className="grid gap-3 text-sm text-slate-600">
            <p className="flex items-center justify-between gap-4"><strong>最近提交</strong><StatusPill value={sitemap?.searchConsole.status || "not_configured"} /></p>
            <p>{sitemap?.searchConsole.message || "配置 Service Account 并授权 Search Console Property 后才会启用。"}</p>
            <p className="text-xs leading-6 text-slate-500">提交成功只表示 Google 已接收 Sitemap，不代表页面已经抓取或收录。最终状态以 Search Console 为准。</p>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
