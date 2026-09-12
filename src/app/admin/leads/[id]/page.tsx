import Link from "next/link";
import { ArrowLeft, Globe2, Mail, Route } from "lucide-react";
import { notFound } from "next/navigation";
import { updateLeadStatus } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, AdminPageHeader, Field, StatusPill, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";
import { getVisitorSessions } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function stamp(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function Value({ label, value }: { label: string; value?: string | number | boolean }) {
  const rendered = value === true ? "是" : value === false ? "否" : value || "未填写";
  return <div className="min-w-0 rounded-md bg-slate-50 p-3"><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-slate-800">{rendered}</dd></div>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const { inquiries, events, downloadLeads } = await getAdminData();
  const lead = inquiries.find((item) => item.id === id);
  if (!lead) notFound();
  const sessions = lead.visitorId ? getVisitorSessions(events, lead.visitorId, { traffic: "real" }) : [];
  const linkedDownloads = downloadLeads.filter((item) => item.email.toLowerCase() === lead.email.toLowerCase());
  return <AdminShell>
    <Link href="/admin/leads" className="inline-flex items-center gap-2 text-sm font-black text-orange-700"><ArrowLeft size={16} /> 返回客户询盘</Link>
    <AdminPageHeader eyebrow="客户详情" title={lead.name || lead.email} description="查看客户资料、项目需求、来源归因、销售跟进及同一浏览器下的访问轨迹。" />
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-6">
        <AdminCard title="客户与项目资料"><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Value label="邮箱" value={lead.email} /><Value label="电话 / WhatsApp" value={lead.phone} /><Value label="公司" value={lead.company} /><Value label="国家 / 地区" value={lead.country} /><Value label="职位" value={lead.jobTitle} /><Value label="客户类型" value={lead.customerType} /><Value label="产品需求" value={lead.product} /><Value label="应用场景" value={lead.application} /><Value label="项目类型" value={lead.projectType} /><Value label="流量" value={lead.flow} /><Value label="扬程 / 压力" value={lead.head} /><Value label="认证 / 资料" value={lead.certification} /><Value label="电压" value={lead.voltage} /><Value label="频率" value={lead.frequency} /><Value label="数量" value={lead.quantity} /><Value label="采购时间" value={lead.purchaseTime} /><Value label="项目阶段" value={lead.projectStage} /><Value label="OEM / ODM" value={lead.oemOdm} /></dl><div className="mt-4 rounded-md border border-slate-200 p-4"><p className="text-xs font-bold text-slate-500">客户需求说明</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{lead.message || "客户未填写详细需求。"}</p></div></AdminCard>
        <AdminCard title="来源与提交信息"><dl className="grid gap-3 sm:grid-cols-2"><Value label="来源类型" value={lead.sourceType} /><Value label="来源页面" value={lead.sourcePage} /><Value label="访问渠道" value={lead.channel} /><Value label="外部来源" value={lead.referrer} /><Value label="营销来源" value={lead.utmSource} /><Value label="营销活动" value={lead.utmCampaign} /><Value label="提交时间" value={stamp(lead.createdAt)} /><Value label="隐私同意" value={lead.privacyConsent} /></dl></AdminCard>
        <AdminCard title="访问轨迹"><div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm leading-6 text-slate-600">{lead.visitorId ? "仅显示该客户提交表单前后，同一浏览器的真实访问记录。" : "该询盘来自历史表单，未携带可关联的访问标识。后续新询盘会自动建立关联。"}</p>{lead.visitorId ? <Link href={`/admin/analytics/visitors/${encodeURIComponent(lead.visitorId)}?range=all`} className="shrink-0 text-sm font-black text-orange-700">完整访客档案</Link> : null}</div>{sessions.length ? <div className="grid gap-3">{sessions.slice(0, 8).map((session) => <article key={session.sessionId} className="rounded-md border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-slate-900">{stamp(session.startedAt)}</strong><span className="text-xs text-slate-500">{session.country} · {session.channel} · {session.eventCount} 个行为</span></div><div className="mt-3 flex items-start gap-2 text-sm text-slate-700"><Route size={15} className="mt-0.5 shrink-0 text-orange-700" /><span className="break-words">{session.entryPath} → {session.exitPath}</span></div></article>)}</div> : <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无可显示的关联访问轨迹。</p>}</AdminCard>
        {linkedDownloads.length ? <AdminCard title="关联下载"><div className="grid gap-3">{linkedDownloads.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-md bg-slate-50 p-3 text-sm"><Mail size={16} className="text-orange-700" /><span><strong>{item.assetTitle}</strong><span className="ml-2 text-slate-500">{stamp(item.createdAt)}</span></span></div>)}</div></AdminCard> : null}
      </div>
      <aside className="grid content-start gap-6"><AdminCard title="销售跟进"><div className="mb-4 flex flex-wrap gap-2"><StatusPill value={lead.status || lead.stage || "new"} />{lead.intent ? <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">{lead.intent} 类意向</span> : null}<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">评分 {lead.score}</span></div><form action={updateLeadStatus} className="grid gap-4"><input type="hidden" name="id" value={lead.id} /><Field label="跟进状态"><select name="status" defaultValue={lead.status || lead.stage || "new"} className={inputClass}>{["new", "pending", "contacted", "quoted", "following", "sample", "negotiating", "won", "lost", "spam", "invalid"].map((status) => <option key={status} value={status}>{status}</option>)}</select></Field><Field label="意向等级"><select name="intent" defaultValue={lead.intent || "unrated"} className={inputClass}><option value="A">A 高意向</option><option value="B">B 中意向</option><option value="C">C 低意向</option><option value="unrated">未判断</option></select></Field><Field label="销售负责人"><input name="owner" defaultValue={lead.owner} className={inputClass} /></Field><Field label="跟进备注"><textarea name="notes" rows={7} defaultValue={lead.notes} className={textareaClass} /></Field><button className="button button-primary min-h-11" type="submit">保存跟进记录</button></form></AdminCard>
        <AdminCard title="客户识别"><div className="grid gap-3 text-sm text-slate-600"><p className="flex items-start gap-2"><Globe2 size={16} className="mt-0.5 shrink-0 text-orange-700" />访问轨迹基于本站第一方标识，仅用于本次网站运营分析。</p><p>客户不会因设备、浏览器或无法验证的身份而被强行合并。</p></div></AdminCard>
      </aside>
    </div>
  </AdminShell>;
}
