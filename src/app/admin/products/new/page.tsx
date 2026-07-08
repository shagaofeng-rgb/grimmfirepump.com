import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-widgets";
import { ProductForm } from "@/components/admin/product-form";
import { listProductCategories } from "@/lib/admin-cms";

export default async function NewProductPage() {
  const categories = await listProductCategories();
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="产品管理" title="新增产品" description="创建产品草稿，完善参数、图片、文件和 SEO 后再发布。" />
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </AdminShell>
  );
}
