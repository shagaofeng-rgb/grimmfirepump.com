import Link from "next/link";
import { ArrowUpRight, FileText, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, EmptyState, inputClass } from "@/components/admin/admin-widgets";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { sitePages } from "@/lib/site-pages";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

export default async function PagesPage({ searchParams }: { searchParams: Promise<{ query?: string; page?: string; pageSize?: string }> }) {
  const [params, admin] = await Promise.all([searchParams, getCurrentAdmin()]);
  const query = typeof params.query === "string" ? params.query.trim().slice(0, 120) : "";
  const filtered = sitePages.filter((page) => [page.label, page.path, page.group].join(" ").toLowerCase().includes(query.toLowerCase()));
  const paged = paginate(filtered, parsePositiveInt(params.page), paginationPageSize(params.pageSize, 20));
  return <AdminShell>
    <AdminPageHeader eyebrow="网站内容" title="页面目录" />
    <section className="mt-6 rounded-lg border border-slate-200 bg-white">
      <form method="get" className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
        <input name="query" aria-label="搜索页面" defaultValue={query} placeholder="页面名称或路径" className={`${inputClass} min-w-0 flex-1`} />
        <button className="button button-primary" type="submit"><Search size={16} />搜索</button>
      </form>
      {paged.items.length ? <ul className="divide-y divide-slate-100">
        {paged.items.map((page) => <li key={page.path} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3"><FileText size={19} className="shrink-0 text-orange-700" /><div className="min-w-0"><strong className="block text-sm">{page.label}</strong><span className="block break-all text-xs text-slate-600">{page.path}</span></div></div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-slate-600">{page.group}</span>
            {"editor" in page && (admin?.role === "super_admin" || page.editor === "/admin/news" || page.editor === "/admin/news-automation" || page.editor === "/admin/downloads") && <Link href={page.editor} className="font-semibold text-orange-800">管理</Link>}
            <Link href={page.path} target="_blank" rel="noopener noreferrer" prefetch={false} aria-label={`查看${page.label}`} className="inline-flex items-center gap-1 font-semibold text-slate-800">查看 <ArrowUpRight size={15} /></Link>
          </div>
        </li>)}
      </ul> : <div className="p-4"><EmptyState text="没有匹配的页面。" /></div>}
      <AdminPagination pathname="/admin/pages" query={{ query }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="页面" />
    </section>
  </AdminShell>;
}
