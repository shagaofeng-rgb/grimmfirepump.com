import Link from "next/link";

type ContentPaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
};

function hrefForPage(pathname: string, page: number, searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });

  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function getPageNumber(value: string | undefined) {
  const page = Number(value || "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function getPageSlice<T>(items: T[], currentPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage: safePage,
    totalPages,
  };
}

export function ContentPagination({ currentPage, totalItems, pageSize, pathname, searchParams = {} }: ContentPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6" aria-label="Pagination">
      <p className="text-sm font-bold text-slate-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap gap-2">
        {currentPage > 1 ? (
          <Link className="button button-secondary min-h-10 px-4 text-sm" href={hrefForPage(pathname, currentPage - 1, searchParams)}>
            Previous
          </Link>
        ) : null}
        {pages.map((page) => (
          <Link
            key={page}
            aria-current={page === currentPage ? "page" : undefined}
            className={`grid h-10 min-w-10 place-items-center rounded-md border text-sm font-black transition ${
              page === currentPage
                ? "border-[var(--navy-950)] bg-[var(--navy-950)] text-white"
                : "border-slate-200 bg-white text-[var(--navy-900)] hover:border-[var(--orange)] hover:text-[var(--orange-dark)]"
            }`}
            href={hrefForPage(pathname, page, searchParams)}
          >
            {page}
          </Link>
        ))}
        {currentPage < totalPages ? (
          <Link className="button button-secondary min-h-10 px-4 text-sm" href={hrefForPage(pathname, currentPage + 1, searchParams)}>
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
