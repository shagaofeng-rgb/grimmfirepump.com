import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-widgets";
import { ProductForm } from "@/components/admin/product-form";
import { listCmsProducts, listProductCategories } from "@/lib/admin-cms";

type EditProductPageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [products, categories] = await Promise.all([listCmsProducts(), listProductCategories()]);
  const product = products.find((item) => item.id === id);
  if (!product) notFound();

  return (
    <AdminShell>
      <AdminPageHeader eyebrow="产品管理" title={`编辑产品：${product.title}`} description="修改会写入后台数据库，不会破坏现有前台 URL。" />
      <div className="mt-8">
        <ProductForm product={product} categories={categories} />
      </div>
    </AdminShell>
  );
}
