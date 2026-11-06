import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, List } from "lucide-react";
import type { ReactNode } from "react";
import { ArticleContent } from "@/components/article-content";
import { safeArticleImageUrl, toArticleContentBlocks } from "@/lib/article-content";

export type EditorialItem = { href: string; title: string; label: string; date?: string; image?: string; text?: string };

function canOptimize(image: string) {
  if (image.startsWith("/")) return true;
  const url = new URL(image);
  return url.protocol === "https:" && (
    url.hostname.endsWith(".public.blob.vercel-storage.com")
    || (url.hostname === "laikegeo.oss-cn-shanghai.aliyuncs.com" && url.pathname.startsWith("/uploads/"))
  );
}

export function EditorialImage({ src, alt, priority = false, sizes = "(min-width: 1000px) 820px, 100vw" }: { src?: string; alt: string; priority?: boolean; sizes?: string }) {
  const image = safeArticleImageUrl(src || "");
  if (!image) return null;
  return (
    <div className="interior-image interior-editorial-image">
      {canOptimize(image) ?
        <Image src={image} alt={alt} fill sizes={sizes} priority={priority} />
        : <img src={image} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" />}
    </div>
  );
}

export function EditorialFeature({ item, linkText }: { item: EditorialItem; linkText: string }) {
  return (
    <article className="interior-card interior-editorial-feature">
      {item.image && <Link href={item.href} prefetch={false} aria-label={item.title}><EditorialImage src={item.image} alt="" priority sizes="(min-width: 1000px) 720px, 100vw" /></Link>}
      <div className="interior-card-body">
        <p className="interior-card-meta">{item.label}{item.date && <> · <time dateTime={item.date}>{item.date}</time></>}</p>
        <h3 className="interior-card-title"><Link href={item.href} prefetch={false}>{item.title}</Link></h3>
        {item.text && <p className="interior-card-copy line-clamp-3">{item.text}</p>}
        <Link className="interior-text-link" href={item.href} prefetch={false}>{linkText} <ArrowRight size={15} /></Link>
      </div>
    </article>
  );
}

export function EditorialRows({ items, images = false, linkText }: { items: EditorialItem[]; images?: boolean; linkText: string }) {
  return (
    <div className="interior-editorial-rows">
      {items.map((item) => (
        <article className={`interior-editorial-row${images && item.image ? " interior-editorial-row-media" : ""}`} key={item.href}>
          {images && item.image && <Link href={item.href} prefetch={false} aria-label={item.title}><EditorialImage src={item.image} alt="" sizes="(max-width: 700px) 110px, 170px" /></Link>}
          <div>
            <p className="interior-card-meta">{item.label}{item.date && <> · <time dateTime={item.date}>{item.date}</time></>}</p>
            <h3 className="interior-card-title mt-1"><Link href={item.href} prefetch={false}>{item.title}</Link></h3>
            {item.text && <p className="interior-card-copy mt-1 line-clamp-2">{item.text}</p>}
            <Link className="interior-text-link mt-1" href={item.href} prefetch={false}>{linkText} <ArrowRight size={15} /></Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ArticleReader({
  title, label, text, date, image, imageAlt, imageCredit, content, source, after, back, lang,
}: {
  title: string; label: string; text: string; date?: string; image?: string; imageAlt?: string;
  imageCredit?: ReactNode; content: string | string[]; source?: ReactNode; after?: ReactNode;
  back: { href: string; label: string }; lang?: string;
}) {
  const blocks = toArticleContentBlocks(content, Number.POSITIVE_INFINITY);
  const headings = blocks.flatMap((block, index) => block.type === "heading" ? [{ label: block.value, href: `#article-heading-${index}` }] : []);
  return (
    <article className="interior-white" lang={lang} dir={lang === "en" ? "ltr" : undefined}>
      <div className="interior-shell interior-article-inner">
        <header className="interior-article-head">
          <p className="interior-kicker">{label}</p>
          <h1 className="interior-title article-title">{title}</h1>
          {text && <p className="interior-deck">{text}</p>}
          {date && <p className="interior-article-date"><CalendarDays size={15} /><time dateTime={date}>{date}</time></p>}
        </header>
        <div className="interior-article-layout">
          <aside className="interior-article-aside">
            {headings.length > 0 && <nav aria-label="On this page"><p><List size={16} /> On this page</p>{headings.map((entry) => <a key={entry.href} href={entry.href}>{entry.label}</a>)}</nav>}
            <Link className="interior-text-link mt-3" href={back.href} prefetch={false}><FileText size={15} />{back.label} <ArrowRight size={14} /></Link>
          </aside>
          <div className="min-w-0">
            {image && <figure><EditorialImage src={image} alt={imageAlt || title} priority />{imageCredit && <figcaption className="interior-image-credit">{imageCredit}</figcaption>}</figure>}
            {source}
            <div id="article-body" className="interior-anchor"><ArticleContent blocks={blocks} headingIds /></div>
            {after}
          </div>
        </div>
      </div>
    </article>
  );
}
