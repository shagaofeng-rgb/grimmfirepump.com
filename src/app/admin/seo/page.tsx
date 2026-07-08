import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, AdminCard, StatusPill } from "@/components/admin/admin-widgets";
import { getSiteSettings, listCmsProducts, listCmsNews } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const [settings, products, news] = await Promise.all([getSiteSettings(), listCmsProducts(), listCmsNews()]);
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
    </AdminShell>
  );
}
