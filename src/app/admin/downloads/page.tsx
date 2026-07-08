import { saveDownloadAsset } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, Field, StatusPill, inputClass } from "@/components/admin/admin-widgets";
import { getAdminData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDownloadsPage() {
  const { cmsDownloads, downloadLeads } = await getAdminData();
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="下载资料" title="目录、Datasheet、证书和项目提交文件" description="支持 gated download，客户填写信息后自动进入线索系统。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={saveDownloadAsset} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">新增下载资料</h2>
          <Field label="文件名称"><input name="title" required className={inputClass} /></Field>
          <Field label="分类"><input name="category" className={inputClass} placeholder="Catalog / Datasheet / Certificate" /></Field>
          <Field label="关联产品"><input name="relatedProduct" className={inputClass} /></Field>
          <Field label="版本"><input name="version" defaultValue="v1.0" className={inputClass} /></Field>
          <Field label="语言"><input name="language" defaultValue="English" className={inputClass} /></Field>
          <Field label="文件 URL"><input name="fileUrl" required className={inputClass} placeholder="/assets/downloads/..." /></Field>
          <Field label="状态"><select name="status" className={inputClass}><option value="published">已发布</option><option value="draft">草稿</option><option value="offline">下架</option></select></Field>
          <Field label="SEO 标题"><input name="seoTitle" className={inputClass} /></Field>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="gated" type="checkbox" defaultChecked /> 下载前要求填写表单</label>
          <button className="button button-primary" type="submit">保存资料</button>
        </form>
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr>{["资料", "分类", "语言/版本", "表单", "状态", "下载"].map((head) => <th key={head} className="px-4 py-3 font-black">{head}</th>)}</tr></thead>
            <tbody>
              {cmsDownloads.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-4"><strong>{item.title}</strong><p className="mt-1 break-all text-slate-500">{item.fileUrl}</p></td>
                  <td className="px-4 py-4">{item.category}</td>
                  <td className="px-4 py-4">{item.language} / {item.version}</td>
                  <td className="px-4 py-4">{item.gated ? "需要" : "不需要"}</td>
                  <td className="px-4 py-4"><StatusPill value={item.status} /></td>
                  <td className="px-4 py-4">{item.downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">最近下载线索</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {downloadLeads.slice(0, 8).map((lead) => <div key={lead.id} className="rounded-md bg-slate-50 p-4 text-sm"><strong>{lead.name}</strong><p className="mt-1 text-slate-500">{lead.assetTitle} · {lead.email}</p></div>)}
        </div>
      </section>
    </AdminShell>
  );
}
