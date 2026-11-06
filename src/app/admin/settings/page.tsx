import { saveSettings } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, Field, StatusPill, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { company } from "@/data/site";
import { getSiteSettings } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [settings, { result }] = await Promise.all([getSiteSettings(), searchParams]);
  const gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID);
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="系统管理" title="网站设置" />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">当前公开信息</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            {[
              ["公司名称", company.legalName], ["网站域名", company.website], ["邮箱", company.email],
              ["WhatsApp", company.phone], ["地址", company.address], ["默认语言", "English"],
            ].map(([label, value]) => <div key={label}><dt className="font-semibold text-slate-600">{label}</dt><dd className="mt-1 break-words">{value}</dd></div>)}
            <div className="flex items-center justify-between gap-3"><dt>Google Analytics 4</dt><dd><StatusPill value={gaEnabled ? "configured" : "not_configured"} /></dd></div>
          </dl>
        </section>
        <form action={saveSettings} className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">访问统计设置</h2>
          {result === "saved" && <p role="status" className="text-sm font-semibold text-emerald-800">设置已保存。</p>}
          {result === "timezone" && <p role="alert" className="text-sm font-semibold text-red-800">请输入有效的 IANA 时区。</p>}
          {result === "ip" && <p role="alert" className="text-sm font-semibold text-red-800">排除规则须为 IP 地址或 CIDR 网段。</p>}
          <Field label="报表时区"><input name="timezone" maxLength={80} required defaultValue={settings.timezone} className={inputClass} /></Field>
          <Field label="排除 IP 或网段"><textarea name="analyticsExcludedIps" rows={3} maxLength={4000} defaultValue={settings.analyticsExcludedIps} className={textareaClass} /></Field>
          <Field label="排除 User-Agent 关键词"><textarea name="analyticsExcludedUserAgents" rows={3} maxLength={4000} defaultValue={settings.analyticsExcludedUserAgents} className={textareaClass} /></Field>
          <button className="button button-primary justify-self-start" type="submit">保存设置</button>
        </form>
      </div>
    </AdminShell>
  );
}
