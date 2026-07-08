import { deleteMedia, saveMedia } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, Field, EmptyState, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import { listMediaFiles } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await listMediaFiles();
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="媒体资源" title="图片、PDF、视频和技术文件资源库" description="管理网站图片、资料文件、视频链接和技术文件路径。" />
      <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={saveMedia} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">登记媒体文件</h2>
          <Field label="文件名称"><input name="name" required className={inputClass} /></Field>
          <Field label="文件类型"><select name="type" className={inputClass}><option value="image">图片</option><option value="pdf">PDF</option><option value="video">视频</option><option value="document">Word/Excel</option><option value="cad">CAD</option><option value="archive">ZIP</option><option value="other">其他</option></select></Field>
          <Field label="文件 URL / 路径"><input name="url" required className={inputClass} placeholder="/assets/..." /></Field>
          <Field label="文件夹"><input name="folder" defaultValue="General" className={inputClass} /></Field>
          <Field label="Alt 文本"><input name="alt" className={inputClass} /></Field>
          <Field label="大小"><input name="sizeLabel" className={inputClass} placeholder="320KB" /></Field>
          <Field label="引用位置"><input name="usedBy" className={inputClass} /></Field>
          <Field label="描述"><textarea name="description" rows={3} className={textareaClass} /></Field>
          <button className="button button-primary" type="submit">保存媒体</button>
        </form>
        <section className="grid gap-4">
          {media.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap justify-between gap-4">
                <div><strong>{item.name}</strong><p className="mt-1 text-sm text-slate-500">{item.type} · {item.folder} · {item.sizeLabel || "未填写大小"}</p><p className="mt-2 break-all text-sm text-slate-600">{item.url}</p></div>
                <form action={deleteMedia}><input type="hidden" name="id" value={item.id} /><button className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">删除</button></form>
              </div>
            </article>
          ))}
          {!media.length ? <EmptyState text="暂无媒体资源。" /> : null}
        </section>
      </div>
    </AdminShell>
  );
}
