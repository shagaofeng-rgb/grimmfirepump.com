export type ArticleContentBlock =
  | { type: "heading"; level: 2 | 3; value: string }
  | { type: "image"; src: string; alt: string }
  | { type: "paragraph"; value: string };

const metadataLine = /^(?:url|keywords?|previous|next)\s*:/i;
const unsafeBlock = /<(?:script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/(?:script|style|iframe|object|embed)>/gi;
const htmlImage = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i;
const htmlImageAlt = /\balt\s*=\s*["']([^"']*)["']/i;
const markdownImage = /^!\[([^\]]*)\]\(([^\s)]+)(?:\s+[^)]*)?\)$/;
const codeLikeLine = /^(?:const|let|var|function|import|export|class|interface|type|return|if|for|while|do|switch|case|try|catch|throw|async|await|public|private|protected|curl|npm|pnpm|yarn|git|select|insert|update|delete|create|alter|drop)\b|^(?:\$\s*)?[\w.-]+\s*(?:=>|\{\s*$)|^<\?php\b|^\{?\s*["']?(?:code|status|error|message)["']?\s*[:=]/i;

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function safeArticleImageUrl(value: string) {
  const source = value.trim();
  if (source.startsWith("/") && !source.startsWith("//")) return source;
  try {
    const parsed = new URL(source);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function toImageBlock(value: string): ArticleContentBlock | null {
  const markdown = value.match(markdownImage);
  const html = value.match(htmlImage);
  const src = safeArticleImageUrl(markdown?.[2] || html?.[1] || "");
  if (!src) return null;
  return {
    type: "image",
    src,
    alt: cleanText(markdown?.[1] || html?.[0].match(htmlImageAlt)?.[1] || "Article image") || "Article image",
  };
}

/** Converts untrusted CMS text to a deliberately small, responsive content model. */
export function toArticleContentBlocks(content: string | string[], maxBlocks = 80): ArticleContentBlock[] {
  const raw = (Array.isArray(content) ? content.join("\n\n") : content || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(unsafeBlock, "")
    .replace(/<(?:script|style|iframe|object|embed)\b[^>]*>[\s\S]*/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\r/g, "");

  return raw
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block): ArticleContentBlock[] => {
      const image = toImageBlock(block);
      if (image) return [image];

      const line = cleanText(block);
      if (!line || metadataLine.test(line) || codeLikeLine.test(line)) return [];

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        return [{ type: "heading", level: heading[1].length >= 3 ? 3 : 2, value: heading[2].trim() }];
      }

      return [{ type: "paragraph", value: line }];
    })
    .slice(0, maxBlocks);
}
