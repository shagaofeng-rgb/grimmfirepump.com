import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, AdminCard, StatusPill } from "@/components/admin/admin-widgets";

const forms = [
  ["Contact Us", "contact", "前台联系表单", "active"],
  ["Product Inquiry", "product-inquiry", "产品详情询价表单", "active"],
  ["Download Gate", "download-gate", "目录下载表单", "active"],
  ["OEM / ODM Application", "oem-odm", "OEM/ODM 合作申请预留", "draft"],
  ["Facebook Lead Ads", "facebook-leads", "Meta Lead Ads Webhook 预留", "draft"],
];

export default function FormsPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="表单管理" title="网站表单和第三方线索入口" description="所有前台询盘、资料下载、OEM/ODM 和 Facebook Lead Ads 入口统一进入线索系统。" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {forms.map(([name, key, desc, status]) => (
          <AdminCard key={key} title={name}>
            <p className="text-sm leading-6 text-slate-600">{desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <code className="rounded bg-slate-100 px-2 py-1 text-xs">{key}</code>
              <StatusPill value={status} />
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
