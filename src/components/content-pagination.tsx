import Link from "next/link";
import type { SiteLocale } from "@/lib/i18n";

type ContentPaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
  locale?: SiteLocale;
};

const labels = {
  en: { page: "Page", of: "of", previous: "Previous", next: "Next", navigation: "Pagination" },
  es: { page: "Página", of: "de", previous: "Anterior", next: "Siguiente", navigation: "Paginación" },
  ru: { page: "Страница", of: "из", previous: "Назад", next: "Далее", navigation: "Страницы" },
  ar: { page: "الصفحة", of: "من", previous: "السابق", next: "التالي", navigation: "ترقيم الصفحات" },
  fr: { page: "Page", of: "sur", previous: "Précédent", next: "Suivant", navigation: "Pagination" },
  pt: { page: "Página", of: "de", previous: "Anterior", next: "Próxima", navigation: "Paginação" },
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

export function getPageNumber(value: unknown) {
  const page = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
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

export function ContentPagination({ currentPage, totalItems, pageSize, pathname, searchParams = {}, locale = "en" }: ContentPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const pages = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page) => page >= 1 && page <= totalPages))].sort((a, b) => a - b);
  const copy = labels[locale];

  return (
    <nav className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4" aria-label={copy.navigation}>
      <p className="text-sm font-bold text-slate-600">
        {copy.page} {currentPage} {copy.of} {totalPages}
      </p>
      <div className="flex flex-wrap gap-2">
        {currentPage > 1 ? (
          <Link className="button button-secondary min-h-10 px-4 text-sm" prefetch={false} href={hrefForPage(pathname, currentPage - 1, searchParams)}>
            {copy.previous}
          </Link>
        ) : null}
        {pages.map((page, index) => (
          <span key={page} className="inline-flex items-center gap-2">
            {index > 0 && page - pages[index - 1] > 1 && <span aria-hidden="true">…</span>}
            <Link
              prefetch={false}
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
          </span>
        ))}
        {currentPage < totalPages ? (
          <Link className="button button-secondary min-h-10 px-4 text-sm" prefetch={false} href={hrefForPage(pathname, currentPage + 1, searchParams)}>
            {copy.next}
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
