import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, AdminCard, StatusPill } from "@/components/admin/admin-widgets";

const forms = [
  ["Contact Us", "contact", "联系页面询盘", "active"],
  ["Product Inquiry", "product-inquiry", "产品详情询价", "active"],
  ["Download Gate", "download-gate", "资料下载线索", "active"],
  ["OEM / ODM Application", "oem-odm", "OEM/ODM 合作申请", "active"],
  ["广告线索", "ad-leads", "广告表单线索接入", "not_configured"],
];

export default function FormsPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="表单管理" title="网站表单和线索入口" description="管理网站询盘、资料下载、OEM/ODM 合作和广告线索来源。" />
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
