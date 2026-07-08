import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-widgets";
import { NewsForm } from "@/components/admin/news-form";

export default function NewNewsPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="新闻管理" title="新增文章" description="创建新闻、行业知识或公司动态内容。" />
      <div className="mt-8"><NewsForm /></div>
    </AdminShell>
  );
}
