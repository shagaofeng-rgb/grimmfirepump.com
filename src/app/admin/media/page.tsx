import Image from "next/image";
import { deleteMedia, saveMedia } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminPageHeader, EmptyState, inputClass } from "@/components/admin/admin-widgets";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { listMediaFiles } from "@/lib/admin-cms";
import { paginationPageSize, parsePositiveInt } from "@/lib/admin-listing";
import { paginate } from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
function value(params: Record<string, string | string[] | undefined>, name: string) { const item = params[name]; return Array.isArray(item) ? item[0] || "" : item || ""; }

export default async function MediaPage({ searchParams }: Props) {
  const params = await searchParams;
  const media = await listMediaFiles();
  const filters = { query: value(params, "query"), type: value(params, "type") || "all", folder: value(params, "folder") || "all" };
  const page = parsePositiveInt(value(params, "page"));
  const pageSize = paginationPageSize(value(params, "pageSize"));
  const folders = [...new Set(media.map((item) => item.folder).filter(Boolean))];
  const filtered = media.filter((item) => { const search = filters.query.toLowerCase(); return (!search || [item.name, item.url, item.folder, item.alt, item.usedBy].join(" ").toLowerCase().includes(search)) && (filters.type === "all" || item.type === filters.type) && (filters.folder === "all" || item.folder === filters.folder); }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const paged = paginate(filtered, page, pageSize);
  return <AdminShell>
    <AdminPageHeader eyebrow="内容管理" title="媒体资源" description="集中维护网站图片、PDF、视频和技术资料；资源列表与上传操作分离，避免长页面堆叠。" />
    <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]"><MediaUploadForm action={saveMedia} /><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><form className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-4" method="get"><input name="query" defaultValue={filters.query} className={inputClass} placeholder="搜索名称、地址、分类或使用位置" /><select name="type" defaultValue={filters.type} className={inputClass}><option value="all">全部类型</option>{["image", "pdf", "video", "document", "cad", "archive", "other"].map((type) => <option key={type} value={type}>{type}</option>)}</select><select name="folder" defaultValue={filters.folder} className={inputClass}><option value="all">全部分类</option>{folders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}</select><select name="pageSize" defaultValue={String(paged.pageSize)} className={inputClass}><option value="20">20 条 / 页</option><option value="25">25 条 / 页</option><option value="50">50 条 / 页</option><option value="100">100 条 / 页</option></select><button className="button button-primary min-h-11" type="submit">应用筛选</button></form><div className="grid gap-4 p-5 sm:grid-cols-2 2xl:grid-cols-3">{paged.items.map((item) => <article key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="grid aspect-[16/10] place-items-center bg-slate-50">{item.type === "image" ? <Image src={item.url} alt={item.alt || item.name} width={640} height={400} className="h-full w-full object-contain" unoptimized /> : <span className="text-sm font-black text-slate-500">{item.type.toUpperCase()}</span>}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-slate-900">{item.name}</strong><p className="mt-1 text-xs text-slate-500">{item.type} · {item.folder || "未分类"}</p></div><form action={deleteMedia}><input type="hidden" name="id" value={item.id} /><button className="rounded-md border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600">移除</button></form></div><p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{item.usedBy || item.description || "尚未添加使用说明"}</p></div></article>)}{!paged.items.length ? <div className="sm:col-span-2 2xl:col-span-3"><EmptyState text="没有符合条件的媒体资源。" /></div> : null}</div><AdminPagination pathname="/admin/media" query={{ ...filters, pageSize: paged.pageSize }} page={paged.page} totalPages={paged.totalPages} total={paged.total} pageSize={paged.pageSize} label="资源" /></section></div>
  </AdminShell>;
}
