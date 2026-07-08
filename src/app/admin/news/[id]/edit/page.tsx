import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-widgets";
import { NewsForm } from "@/components/admin/news-form";
import { listCmsNews } from "@/lib/admin-cms";

type EditNewsPageProps = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params;
  const item = (await listCmsNews()).find((news) => news.id === id);
  if (!item) notFound();
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="新闻管理" title={`编辑文章：${item.title}`} description="修改标题、正文、封面、SEO 和发布状态。" />
      <div className="mt-8"><NewsForm news={item} /></div>
    </AdminShell>
  );
}
