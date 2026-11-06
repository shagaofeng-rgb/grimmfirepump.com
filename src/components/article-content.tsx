import { toArticleContentBlocks, type ArticleContentBlock } from "@/lib/article-content";

type ArticleContentProps = {
  content?: string | string[];
  maxBlocks?: number;
  blocks?: ArticleContentBlock[];
  headingIds?: boolean;
};

export function ArticleContent({ content = "", maxBlocks, blocks: parsed, headingIds = false }: ArticleContentProps) {
  const blocks = parsed || toArticleContentBlocks(content, maxBlocks);
  let hasH2 = false;

  return (
    <div className="article-content mt-10 grid min-w-0 gap-5 text-base leading-8 text-slate-700">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level === 2 || !hasH2 ? "h2" : "h3";
          if (Heading === "h2") hasH2 = true;
          return <Heading key={`${block.type}-${index}`} id={headingIds ? `article-heading-${index}` : undefined} className={Heading === "h2" ? "article-content-heading interior-anchor mt-5 text-2xl font-black leading-tight text-[var(--navy-950)]" : "article-content-heading interior-anchor mt-3 text-xl font-black leading-tight text-[var(--navy-950)]"}>{block.value}</Heading>;
        }
        if (block.type === "image") {
          return (
            <figure key={`${block.type}-${index}`} className="article-content-media overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img src={block.src} alt={block.alt} className="h-auto w-full object-cover" loading="lazy" decoding="async" />
            </figure>
          );
        }
        return <p key={`${block.type}-${index}`} className="article-content-copy">{block.value}</p>;
      })}
    </div>
  );
}
