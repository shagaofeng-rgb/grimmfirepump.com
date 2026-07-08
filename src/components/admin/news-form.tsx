import { saveNews } from "@/app/admin/actions";
import { Field, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import type { CmsNews } from "@/lib/admin-cms";

export function NewsForm({ news }: { news?: CmsNews }) {
  return (
    <form action={saveNews} className="grid gap-6">
      <input type="hidden" name="id" value={news?.id || ""} />
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <h2 className="text-xl font-black text-slate-950 md:col-span-2">文章基础信息</h2>
        <Field label="文章标题"><input name="title" required defaultValue={news?.title} className={inputClass} /></Field>
        <Field label="URL Slug"><input name="slug" required defaultValue={news?.slug} className={inputClass} /></Field>
        <Field label="副标题"><input name="subtitle" defaultValue={news?.subtitle} className={inputClass} /></Field>
        <Field label="分类"><input name="category" defaultValue={news?.category || "Industry News"} className={inputClass} /></Field>
        <Field label="标签，逗号分隔"><input name="tags" defaultValue={news?.tags.join(", ")} className={inputClass} /></Field>
        <Field label="作者"><input name="author" defaultValue={news?.author || "GRIMM PUMP"} className={inputClass} /></Field>
        <Field label="封面图片"><input name="coverImage" defaultValue={news?.coverImage} className={inputClass} /></Field>
        <Field label="发布时间"><input name="publishAt" type="datetime-local" defaultValue={news?.publishAt?.slice(0, 16)} className={inputClass} /></Field>
        <Field label="状态">
          <select name="status" defaultValue={news?.status || "draft"} className={inputClass}>
            <option value="draft">草稿</option>
            <option value="review">待审核</option>
            <option value="published">已发布</option>
            <option value="offline">已下架</option>
            <option value="archived">已归档</option>
          </select>
        </Field>
        <Field label="文章来源"><input name="source" defaultValue={news?.source} className={inputClass} /></Field>
        <div className="flex flex-wrap gap-4 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="featured" type="checkbox" defaultChecked={news?.featured} /> 推荐文章</label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="pinned" type="checkbox" defaultChecked={news?.pinned} /> 置顶文章</label>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input name="indexable" type="checkbox" defaultChecked={news?.indexable ?? true} /> 允许收录</label>
        </div>
      </section>
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">内容编辑</h2>
        <Field label="摘要"><textarea name="excerpt" rows={3} defaultValue={news?.excerpt} className={textareaClass} /></Field>
        <Field label="正文"><textarea name="content" rows={16} defaultValue={news?.content} className={textareaClass} /></Field>
      </section>
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <h2 className="text-xl font-black text-slate-950 md:col-span-2">SEO</h2>
        <Field label="SEO Title"><input name="seoTitle" defaultValue={news?.seoTitle} className={inputClass} /></Field>
        <Field label="Meta Description"><textarea name="seoDescription" rows={3} defaultValue={news?.seoDescription} className={textareaClass} /></Field>
      </section>
      <div className="flex gap-3">
        <button className="button button-primary" type="submit">保存文章</button>
        <a className="button button-secondary" href="/admin/news">返回列表</a>
      </div>
    </form>
  );
}
