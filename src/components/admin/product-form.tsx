import { saveProduct } from "@/app/admin/actions";
import { Field, inputClass, textareaClass } from "@/components/admin/admin-widgets";
import type { CmsProduct, CmsProductCategory } from "@/lib/admin-cms";

export function ProductForm({ product, categories }: { product?: CmsProduct; categories: CmsProductCategory[] }) {
  const parameters = product?.parameters.map((item) => `${item.name}|${item.value}|${item.unit}`).join("\n") || "";

  return (
    <form action={saveProduct} className="grid gap-6">
      <input type="hidden" name="id" value={product?.id || ""} />
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <h2 className="text-xl font-black text-slate-950 md:col-span-2">基础信息</h2>
        <Field label="产品名称"><input name="title" required defaultValue={product?.title} className={inputClass} /></Field>
        <Field label="英文产品名"><input name="englishName" defaultValue={product?.englishName} className={inputClass} /></Field>
        <Field label="副标题"><input name="subtitle" defaultValue={product?.subtitle} className={inputClass} /></Field>
        <Field label="URL Slug"><input name="slug" required defaultValue={product?.slug} className={inputClass} /></Field>
        <Field label="型号"><input name="model" defaultValue={product?.model} className={inputClass} /></Field>
        <Field label="SKU"><input name="sku" defaultValue={product?.sku} className={inputClass} /></Field>
        <Field label="分类">
          <select name="categoryId" defaultValue={product?.categoryId || categories[0]?.id} className={inputClass}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="状态">
          <select name="status" defaultValue={product?.status || "draft"} className={inputClass}>
            <option value="draft">草稿</option>
            <option value="review">待审核</option>
            <option value="published">已发布</option>
            <option value="offline">已下架</option>
            <option value="archived">已归档</option>
          </select>
        </Field>
        <Field label="品牌"><input name="brand" defaultValue={product?.brand || "GRIMM PUMP"} className={inputClass} /></Field>
        <Field label="负责人"><input name="owner" defaultValue={product?.owner || "Product Manager"} className={inputClass} /></Field>
        <Field label="排序"><input name="sortOrder" type="number" defaultValue={product?.sortOrder || 0} className={inputClass} /></Field>
        <Field label="标签，逗号分隔"><input name="tags" defaultValue={product?.tags.join(", ")} className={inputClass} /></Field>
        <div className="flex flex-wrap gap-4 md:col-span-2">
          {[
            ["featured", "推荐产品", product?.featured],
            ["hot", "热门产品", product?.hot],
            ["isNew", "新品标识", product?.isNew],
          ].map(([name, label, checked]) => (
            <label key={String(name)} className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <input name={String(name)} type="checkbox" defaultChecked={Boolean(checked)} /> {label}
            </label>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">产品内容</h2>
        <Field label="简短描述"><textarea name="summary" rows={3} defaultValue={product?.summary} className={textareaClass} /></Field>
        <Field label="完整介绍"><textarea name="description" rows={7} defaultValue={product?.description} className={textareaClass} /></Field>
        <Field label="产品卖点"><textarea name="sellingPoints" rows={4} defaultValue={product?.sellingPoints} className={textareaClass} /></Field>
        <Field label="应用领域"><textarea name="applications" rows={4} defaultValue={product?.applications} className={textareaClass} /></Field>
        <Field label="产品结构"><textarea name="structure" rows={4} defaultValue={product?.structure} className={textareaClass} /></Field>
        <Field label="选型说明"><textarea name="selectionGuide" rows={4} defaultValue={product?.selectionGuide} className={textareaClass} /></Field>
        <Field label="安装说明"><textarea name="installation" rows={4} defaultValue={product?.installation} className={textareaClass} /></Field>
        <Field label="售后支持"><textarea name="afterSales" rows={4} defaultValue={product?.afterSales} className={textareaClass} /></Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <h2 className="text-xl font-black text-slate-950 md:col-span-2">媒体与技术参数</h2>
        <Field label="产品主图路径"><input name="mainImage" defaultValue={product?.mainImage} className={inputClass} /></Field>
        <Field label="OG 图片路径"><input name="ogImage" defaultValue={product?.ogImage || product?.mainImage} className={inputClass} /></Field>
        <Field label="产品图库，逗号分隔"><textarea name="gallery" rows={3} defaultValue={product?.gallery.join(", ")} className={`${textareaClass} md:col-span-2`} /></Field>
        <Field label="动态技术参数：参数名|参数值|单位，每行一个"><textarea name="parameters" rows={8} defaultValue={parameters} className={textareaClass} /></Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <h2 className="text-xl font-black text-slate-950 md:col-span-2">SEO 设置</h2>
        <Field label="SEO Title"><input name="seoTitle" defaultValue={product?.seoTitle} className={inputClass} /></Field>
        <Field label="Canonical URL"><input name="canonicalUrl" defaultValue={product?.canonicalUrl} className={inputClass} /></Field>
        <Field label="SEO Keywords"><input name="seoKeywords" defaultValue={product?.seoKeywords} className={inputClass} /></Field>
        <Field label="Meta Description"><textarea name="seoDescription" rows={3} defaultValue={product?.seoDescription} className={textareaClass} /></Field>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 md:col-span-2">
          <input name="indexable" type="checkbox" defaultChecked={product?.indexable ?? true} /> 允许搜索引擎收录
        </label>
      </section>

      <div className="flex gap-3">
        <button className="button button-primary" type="submit">保存产品</button>
        <a className="button button-secondary" href="/admin/products">返回列表</a>
      </div>
    </form>
  );
}
