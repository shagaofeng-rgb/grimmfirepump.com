import { deleteLead, updateLeadStatus } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, EmptyState, Field, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { inquiries, downloadLeads } = await getAdminData();
  return (
    <AdminShell>
      <AdminPageHeader
        eyebrow="客户询盘 CRM"
        title="客户线索、跟进状态和自动评分"
        description="管理网站询盘、产品询价、资料下载、OEM/ODM 合作和广告线索。"
        action={<a className="button button-secondary" href="/api/admin/export?type=leads">导出线索 CSV</a>}
      />
      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_180px_180px]">
          <input className={inputClass} placeholder="搜索姓名、邮箱、国家、产品..." />
          <select className={inputClass}><option>全部来源</option><option>联系页面</option><option>产品询价</option><option>资料下载</option><option>广告线索</option></select>
          <select className={inputClass}><option>全部状态</option><option>新询盘</option><option>已联系</option><option>已报价</option><option>已成交</option></select>
        </div>
        <div className="grid gap-4 p-4">
          {inquiries.map((lead) => (
            <article key={lead.id} className="rounded-lg border border-slate-200 p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-slate-950">{lead.name}</h2>
                    <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-700">评分 {lead.score}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{lead.status || lead.stage || "new"}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{lead.email} · {lead.phone || "未填写电话"} · {lead.country || "未填写国家"} · {lead.company || "未填写公司"}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{lead.product || "未填写产品"} / Flow: {lead.flow || "-"} / Head: {lead.head || "-"} / Cert: {lead.certification || "-"}</p>
                  <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">{lead.message || "未填写需求内容"}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{lead.sourcePage || "website"} · {new Date(lead.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid gap-3 rounded-md bg-slate-50 p-4">
                <form action={updateLeadStatus} className="grid gap-3">
                  <input type="hidden" name="id" value={lead.id} />
                  <Field label="跟进状态">
                    <select name="status" defaultValue={lead.status || "new"} className={inputClass}>
                      {["new", "pending", "contacted", "quoted", "following", "sample", "negotiating", "won", "lost", "spam", "invalid"].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </Field>
                  <Field label="意向等级">
                    <select name="intent" defaultValue={lead.intent || "unrated"} className={inputClass}>
                      <option value="A">A 高意向</option>
                      <option value="B">B 中意向</option>
                      <option value="C">C 低意向</option>
                      <option value="unrated">未判断</option>
                    </select>
                  </Field>
                  <Field label="销售负责人"><input name="owner" defaultValue={lead.owner} className={inputClass} /></Field>
                  <Field label="内部备注"><textarea name="notes" rows={3} defaultValue={lead.notes} className={textareaClass} /></Field>
                  <button className="button button-primary min-h-10 text-sm" type="submit">保存跟进</button>
                </form>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={lead.id} />
                  <button className="button button-secondary min-h-10 w-full text-sm" type="submit">删除线索</button>
                </form>
                </div>
              </div>
            </article>
          ))}
          {!inquiries.length ? <EmptyState text="暂无网站询盘。" /> : null}
        </div>
      </div>
      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">下载资料线索</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {downloadLeads.map((lead) => (
            <div key={lead.id} className="rounded-md bg-slate-50 p-4 text-sm">
              <strong>{lead.name}</strong>
              <p className="mt-1 text-slate-500">{lead.assetTitle} · {lead.email} · {lead.country || "未填写国家"}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
