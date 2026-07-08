import { saveManagedPage } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, Field, StatusPill, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { listManagedPages } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const pages = await listManagedPages();
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="页面管理" title="网站页面和可控区块" description="管理页面标题、内容、Banner、CTA 和 SEO 信息。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={saveManagedPage} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">新增页面记录</h2>
          <Field label="页面标题"><input name="title" required className={inputClass} /></Field>
          <Field label="Slug"><input name="slug" required className={inputClass} /></Field>
          <Field label="页面模块"><input name="module" className={inputClass} /></Field>
          <Field label="Banner"><input name="banner" className={inputClass} /></Field>
          <Field label="CTA"><input name="cta" defaultValue="/contact" className={inputClass} /></Field>
          <Field label="状态"><select name="status" className={inputClass}><option value="published">已发布</option><option value="draft">草稿</option></select></Field>
          <Field label="内容"><textarea name="content" rows={4} className={textareaClass} /></Field>
          <Field label="SEO Title"><input name="seoTitle" className={inputClass} /></Field>
          <Field label="SEO Description"><textarea name="seoDescription" rows={3} className={textareaClass} /></Field>
          <button className="button button-primary" type="submit">保存页面</button>
        </form>
        <section className="grid gap-3">
          {pages.map((page) => <article key={page.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-4"><div><strong>{page.title}</strong><p className="mt-1 text-sm text-slate-500">{page.slug} · {page.module}</p></div><StatusPill value={page.status} /></div></article>)}
        </section>
      </div>
    </AdminShell>
  );
}
