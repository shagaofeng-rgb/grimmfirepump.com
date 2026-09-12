import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, AdminCard, StatusPill } from "@/components/admin/admin-widgets";

const forms = [
  ["联系咨询", "网站联系页和首页项目咨询", "客户询盘"],
  ["产品询价", "产品详情页的技术参数与报价咨询", "客户询盘"],
  ["资料下载", "目录和技术文件下载后留下的客户信息", "下载线索"],
  ["OEM / ODM 合作", "合作需求与项目采购信息", "客户询盘"],
];

export default function FormsPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="客户管理" title="客户入口" description="查看网站已启用的客户咨询、产品询价、资料下载和合作需求入口。提交记录统一进入客户询盘或下载线索。" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {forms.map(([name, desc, destination]) => (
          <AdminCard key={name} title={name}>
            <p className="text-sm leading-6 text-slate-600">{desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">提交后进入：{destination}</span>
              <StatusPill value="active" />
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
