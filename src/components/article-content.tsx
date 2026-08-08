import { toArticleContentBlocks } from "@/lib/article-content";

type ArticleContentProps = {
  content: string | string[];
  maxBlocks?: number;
};

export function ArticleContent({ content, maxBlocks }: ArticleContentProps) {
  const blocks = toArticleContentBlocks(content, maxBlocks);

  return (
    <div className="article-content mt-10 grid min-w-0 gap-5 text-base leading-8 text-slate-700">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level === 2 ? "h2" : "h3";
          return <Heading key={`${block.type}-${index}`} className={block.level === 2 ? "article-content-heading mt-5 text-2xl font-black leading-tight text-[var(--navy-950)]" : "article-content-heading mt-3 text-xl font-black leading-tight text-[var(--navy-950)]"}>{block.value}</Heading>;
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
