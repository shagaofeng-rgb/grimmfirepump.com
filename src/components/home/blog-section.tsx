import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { ContentPagination, getPageSlice } from "@/components/content-pagination";
import { posts } from "@/data/site";

type BlogPostCard = {
  slug: string;
  title: string;
  category: string;
  date?: string;
  image: string;
  text: string;
};

type BlogSectionProps = {
  items?: BlogPostCard[];
  basePath?: "/blog" | "/knowledge";
  eyebrow?: string;
  title?: string;
  page?: number;
  paginationPath?: "/blog" | "/knowledge";
};

export function BlogSection({
  items = posts,
  basePath = "/blog",
  eyebrow = "News Center",
  title = "Fire pump articles, company news and buyer education content.",
  page = 1,
  paginationPath,
}: BlogSectionProps) {
  const pagedPosts = paginationPath ? getPageSlice(items, page, 6) : { items, currentPage: 1 };

  return (
    <section className="section bg-[var(--grey-50)]">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="container-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {pagedPosts.items.map((post) => (
          <Link key={post.slug} href={`${basePath}/${post.slug}`} className="card overflow-hidden">
            <div className="relative h-44 bg-slate-100">
              <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(min-width: 1280px) 30vw, 50vw" />
            </div>
            <div className="p-5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--orange)]">{post.category}</span>
            <h3 className="mt-3 max-h-[3.5rem] overflow-hidden text-lg font-black leading-7 text-[var(--navy-950)]">{post.title}</h3>
            <p className="mt-2 text-xs font-bold text-slate-400">{post.date}</p>
            <p className="mt-3 max-h-[4.5rem] overflow-hidden text-sm leading-6 text-slate-600">{post.text}</p>
            </div>
          </Link>
        ))}
      </div>
      {paginationPath ? (
        <div className="container-shell">
          <ContentPagination currentPage={pagedPosts.currentPage} totalItems={items.length} pageSize={6} pathname={paginationPath} />
        </div>
      ) : null}
    </section>
  );
}
