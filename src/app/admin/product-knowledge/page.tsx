import { saveProductKnowledge } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-widgets";
import { listCmsProductKnowledge } from "@/lib/admin-cms";

export const dynamic = "force-dynamic";

const fieldClass = "min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm";
const join = (items: string[]) => items.join(", ");

export default async function ProductKnowledgePage() {
  const items = await listCmsProductKnowledge();
  return <AdminShell><AdminPageHeader eyebrow="内容知识库" title="产品关键词、行业与场景映射" description="用于 SEO、内链和 News 自动分析；参数与认证信息仍以产品后台的真实资料为准。" />
    <div className="mt-8 grid gap-6">{items.map((item) => <form key={item.id} action={saveProductKnowledge} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><input type="hidden" name="id" value={item.id} /><div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-lg text-[var(--navy-950)]">{item.productSlug}</strong><p className="mt-1 text-sm text-slate-500">{item.productSeries}</p></div><label className="text-sm font-bold"><input name="enabled" type="checkbox" defaultChecked={item.enabled} /> 启用</label></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">主关键词<input name="primaryKeyword" defaultValue={item.primaryKeyword} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">次关键词<input name="secondaryKeywords" defaultValue={join(item.secondaryKeywords)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">规格关键词<input name="specificationKeywords" defaultValue={join(item.specificationKeywords)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">行业<input name="industries" defaultValue={join(item.industries)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">应用场景<input name="scenarios" defaultValue={join(item.scenarios)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">客户痛点<input name="buyerPainPoints" defaultValue={join(item.buyerPainPoints)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold md:col-span-2">解决方案<textarea name="solutionSummary" defaultValue={item.solutionSummary} rows={3} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">客户收益<input name="buyerBenefits" defaultValue={join(item.buyerBenefits)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">关联产品 Slug<input name="relatedProductSlugs" defaultValue={join(item.relatedProductSlugs)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">关联应用页<input name="relatedApplicationSlugs" defaultValue={join(item.relatedApplicationSlugs)} className={`${fieldClass} mt-2`} /></label><label className="text-sm font-bold">禁止夸大词<input name="prohibitedClaims" defaultValue={join(item.prohibitedClaims)} className={`${fieldClass} mt-2`} /></label></div><button className="button button-primary mt-5" type="submit">保存知识库记录</button></form>)}</div>
  </AdminShell>;
}
