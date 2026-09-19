import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, EmptyState, StatCard } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

const channels = [
  { key: "contact", name: "联系咨询", path: "/contact" },
  { key: "product", name: "产品询价", path: "/products" },
  { key: "download", name: "资料下载", path: "/downloads" },
  { key: "oem", name: "合作咨询", path: "/contact" },
];

function channelFor(value: string) {
  const normalized = value.toLowerCase();
  if (/(download|catalog|资料)/.test(normalized)) return "download";
  if (/(oem|odm|partner|合作)/.test(normalized)) return "oem";
  if (/(product|quote|询价)/.test(normalized)) return "product";
  return "contact";
}

export default async function FormsPage() {
  const { inquiries, downloadLeads } = await getAdminData();
  const counts = new Map(channels.map((item) => [item.key, 0]));
  inquiries.forEach((item) => counts.set(channelFor(`${item.sourceType} ${item.sourcePage} ${item.product}`), (counts.get(channelFor(`${item.sourceType} ${item.sourcePage} ${item.product}`)) || 0) + 1));
  counts.set("download", (counts.get("download") || 0) + downloadLeads.length);
  const latest = [...inquiries, ...downloadLeads].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];

  return <AdminShell>
    <AdminPageHeader eyebrow="客户与销售" title="客户入口" />
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{channels.map((item) => <StatCard key={item.key} label={item.name} value={counts.get(item.key) || 0} hint="累计提交" />)}</div>
    <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="text-xl font-black text-slate-950">入口记录</h2><Link href="/admin/leads" className="text-sm font-black text-orange-700">查看客户线索</Link></div>
      <div className="divide-y divide-slate-100">{channels.map((item) => <div key={item.key} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"><div><strong className="block text-slate-900">{item.name}</strong><span className="mt-1 block text-xs text-slate-500">{item.path}</span></div><div className="text-right"><strong className="block text-lg text-slate-950">{counts.get(item.key) || 0}</strong><span className="text-xs text-slate-500">条记录</span></div></div>)}{!latest ? <div className="p-5"><EmptyState text="暂无客户提交记录。" /></div> : null}</div>
    </section>
  </AdminShell>;
}
