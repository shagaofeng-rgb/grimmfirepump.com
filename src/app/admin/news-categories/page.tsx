import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, EmptyState } from "@/components/admin/admin-widgets";

export default function NewsCategoriesPage() {
  return (
    <AdminShell>
      <AdminPageHeader eyebrow="新闻分类" title="新闻分类管理" description="当前新闻分类使用文章字段管理；下一步可拆成独立多级分类表。" />
      <div className="mt-8"><EmptyState text="已预留 /admin/news-categories 路由。新闻发布流程已可通过 /admin/news 使用。" /></div>
    </AdminShell>
  );
}
