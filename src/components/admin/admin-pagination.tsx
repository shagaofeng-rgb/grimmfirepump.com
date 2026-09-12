import Link from "next/link";

type QueryValue = string | number | undefined | null;

export function adminQuery(pathname: string, values: Record<string, QueryValue>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "" && value !== "all") params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function pageNumbers(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

export function AdminPagination({ pathname, query, page, totalPages, total, pageSize, label = "记录", pageParam = "page" }: {
  pathname: string;
  query: Record<string, QueryValue>;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  label?: string;
  pageParam?: string;
}) {
  const pages = pageNumbers(page, totalPages);
  return <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
    <span>第 {page} / {totalPages} 页，共 {total} 条{label}，每页 {pageSize} 条</span>
    <div className="flex flex-wrap items-center gap-1.5">
      <Link aria-disabled={page <= 1} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={adminQuery(pathname, { ...query, [pageParam]: page - 1 })}>上一页</Link>
      {pages.map((number, index) => <span key={number} className="contents">
        {index > 0 && number - pages[index - 1] > 1 ? <span className="px-1 text-slate-400">...</span> : null}
        <Link aria-current={number === page ? "page" : undefined} className="min-w-9 rounded-md border border-slate-200 px-2 py-2 text-center font-bold aria-[current=page]:border-orange-600 aria-[current=page]:bg-orange-600 aria-[current=page]:text-white" href={adminQuery(pathname, { ...query, [pageParam]: number })}>{number}</Link>
      </span>)}
      <Link aria-disabled={page >= totalPages} className="rounded-md border border-slate-200 px-3 py-2 font-bold aria-disabled:pointer-events-none aria-disabled:opacity-40" href={adminQuery(pathname, { ...query, [pageParam]: page + 1 })}>下一页</Link>
      <form method="get" className="ml-1 flex items-center gap-1.5">
        {Object.entries(query).map(([key, value]) => value !== undefined && value !== null && value !== "" && value !== "all" ? <input key={key} type="hidden" name={key} value={String(value)} /> : null)}
        <label className="sr-only" htmlFor={`${pageParam}-jump`}>跳转页码</label>
        <input id={`${pageParam}-jump`} name={pageParam} type="number" min="1" max={totalPages} defaultValue={page} className="h-9 w-14 rounded-md border border-slate-200 px-2 text-center text-sm" />
        <button className="h-9 rounded-md border border-slate-200 px-2 text-xs font-bold" type="submit">跳转</button>
      </form>
    </div>
  </div>;
}
