import { saveSettings } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, Field, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { getSiteSettings } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="系统设置" title="公司信息、SEO、统计和第三方集成设置" description="敏感 Secret 仍必须放在 Vercel 环境变量；这里仅保存公开配置和接入状态。" />
      <form action={saveSettings} className="mt-8 grid gap-6">
        <input type="hidden" name="createdAt" value={settings.createdAt} />
        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <h2 className="text-xl font-black text-slate-950 md:col-span-2">公司与联系方式</h2>
          <Field label="公司名称"><input name="companyName" defaultValue={settings.companyName} className={inputClass} /></Field>
          <Field label="网站域名"><input name="website" defaultValue={settings.website} className={inputClass} /></Field>
          <Field label="邮箱"><input name="email" defaultValue={settings.email} className={inputClass} /></Field>
          <Field label="WhatsApp"><input name="whatsapp" defaultValue={settings.whatsapp} className={inputClass} /></Field>
          <Field label="默认语言"><input name="defaultLanguage" defaultValue={settings.defaultLanguage} className={inputClass} /></Field>
          <Field label="时区"><input name="timezone" defaultValue={settings.timezone} className={inputClass} /></Field>
          <Field label="地址"><textarea name="address" rows={3} defaultValue={settings.address} className={textareaClass} /></Field>
        </section>
        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <h2 className="text-xl font-black text-slate-950 md:col-span-2">SEO 与统计</h2>
          <Field label="GA4 Measurement ID"><input name="ga4Id" defaultValue={settings.ga4Id} className={inputClass} /></Field>
          <Field label="Google Tag Manager ID"><input name="gtmId" defaultValue={settings.gtmId} className={inputClass} /></Field>
          <Field label="Meta Pixel ID"><input name="metaPixelId" defaultValue={settings.metaPixelId} className={inputClass} /></Field>
          <Field label="Google Verification"><input name="googleVerification" defaultValue={settings.googleVerification} className={inputClass} /></Field>
          <Field label="Bing Verification"><input name="bingVerification" defaultValue={settings.bingVerification} className={inputClass} /></Field>
          <Field label="Robots Policy"><input name="robotsPolicy" defaultValue={settings.robotsPolicy} className={inputClass} /></Field>
        </section>
        <button className="button button-primary justify-self-start" type="submit">保存设置</button>
      </form>
    </AdminShell>
  );
}
