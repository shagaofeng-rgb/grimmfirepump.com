import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cmsStore, isLegacyImportedBlogSlug, logAudit, type CmsNews } from "@/lib/admin-cms";
import { toArticleContentBlocks } from "@/lib/article-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  sign: z.string().min(1),
  class_id: z.string().trim().max(80).optional().default("blog"),
  title: z.string().trim().max(180).optional().default(""),
  content: z.string().trim().max(100_000).optional().default(""),
  author_id: z.string().trim().max(120).optional().default(""),
  image_url: z.string().trim().max(2_000).optional().default(""),
});
const minBodyLength = 20;
const maxProbeTitleLength = 40;

function response(code: 0 | 1, msg: string) {
  return NextResponse.json({ code, msg }, { status: 200 });
}

function validSecret(value: string, expected: string) {
  const actual = Buffer.from(value);
  const secret = Buffer.from(expected);
  return actual.length === secret.length && timingSafeEqual(actual, secret);
}

function toSlug(value: string, suffix: string) {
  const readable = value
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 76);
  return `${readable || "industry-article"}-${suffix.slice(0, 10)}`;
}

function plainText(value: string) {
  return value
    .replace(/<\/?(p|div|br|li|h[1-6])\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function validImage(value: string) {
  const fallback = "/assets/applications/hero-edj.webp";
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function categoryFor(classId: string) {
  const normalized = classId.trim().toLowerCase();
  if (normalized === "31" || normalized === "blog") return "Industry News";
  return `External Blog ${classId.trim().slice(0, 40)}`;
}

async function uniqueSlug(preferred: string, id: string) {
  const owners = await cmsStore.findNewsBySlug(preferred);
  return isLegacyImportedBlogSlug(preferred) || owners.some((owner) => owner.id !== id)
    ? `${preferred}-${id.slice(-6)}` : preferred;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function firstText(...values: unknown[]) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0) || "";
}

async function parsePayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let raw: Record<string, unknown>;
  if (contentType.includes("application/json")) {
    raw = asRecord(await request.json());
  } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    raw = Object.fromEntries((await request.formData()).entries());
  } else {
    raw = Object.fromEntries(new URLSearchParams(await request.text()).entries());
  }

  const authorization = request.headers.get("authorization") || "";
  const bearerToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  return payloadSchema.safeParse({
    sign: firstText(raw.sign, raw.api_key, raw.apiKey, raw.token, raw.key, request.headers.get("x-blog-sign"), request.headers.get("x-webhook-signature"), bearerToken),
    class_id: firstText(raw.class_id, raw.classId, raw.category_id, raw.categoryId) || "blog",
    title: firstText(raw.title, raw.article_title, raw.articleTitle),
    content: firstText(raw.content, raw.article_content, raw.articleContent, raw.body),
    author_id: firstText(raw.author_id, raw.authorId, raw.author),
    image_url: firstText(raw.image_url, raw.imageUrl, raw.image),
  });
}

function readableArticle(value: string) {
  const paragraphs = value
    .replace(/<h([1-6])\b[^>]*>/gi, (_, level: string) => Number(level) <= 2 ? "\n## " : "\n### ")
    .replace(/<\/?(?:p|div|br|li|h[1-6])\b[^>]*>/gi, "\n")
    .replace(/<img\b[^>]*>/gi, " ")
    .split("\n");
  const blocks = toArticleContentBlocks(paragraphs, Infinity);
  return {
    content: blocks.flatMap((block) => block.type === "image" ? [] : [
      block.type === "heading" ? `${"#".repeat(block.level)} ${block.value}` : block.value,
    ]).join("\n\n"),
    summary: blocks.flatMap((block) => block.type === "paragraph" ? [block.value] : []).join(" "),
  };
}

function revalidatePublicBlog(slug?: string) {
  revalidateTag("cms-blog");
  revalidateTag("sitemap-data");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/blog-sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function recordAudit(action: string, target: string, result: "success" | "failed") {
  try {
    await logAudit({ actor: "blog_webhook", action, target, result });
  } catch {
    console.error("Blog webhook audit write failed", { action, target });
  }
}

export async function POST(request: Request) {
  // BLOG_WEBHOOK_API_KEY remains a compatibility fallback for the already configured plugin.
  // New installations should use WEBHOOK_ARTICLE_SIGN as documented in .env.example.
  const secret = process.env.WEBHOOK_ARTICLE_SIGN || process.env.BLOG_WEBHOOK_API_KEY;
  if (!secret) return response(0, "发布接口未配置。");

  try {
    const parsed = await parsePayload(request);
    if (!parsed.success) {
      await recordAudit("webhook_invalid_payload", "blog", "failed");
      return response(0, "请求参数不符合要求。");
    }
    if (!validSecret(parsed.data.sign, secret)) {
      await recordAudit("webhook_auth_failed", "blog", "failed");
      return response(0, "秘钥错误");
    }

    // Custom framework verification sends only a signed class_id (or short placeholders).
    // It never creates a record, but it also serves as an authenticated cache sync
    // point after an operator removes or withdraws a Blog entry in the database.
    const probeText = plainText(parsed.data.content);
    if (parsed.data.title.length <= maxProbeTitleLength && (!parsed.data.content || (probeText.length > 0 && probeText.length < minBodyLength))) {
      revalidatePublicBlog();
      return response(1, "验证成功");
    }

    const { content, summary } = readableArticle(parsed.data.content);
    const visibleTitle = plainText(parsed.data.title);
    if (summary.length < minBodyLength || !/\p{L}/u.test(summary) || visibleTitle.length < 2 || !/[\p{L}\p{N}]/u.test(visibleTitle)) {
      await recordAudit("webhook_invalid_article", "blog", "failed");
      return response(0, "文章需要包含有效标题和可阅读的正文。");
    }

    const now = new Date().toISOString();
    // Preserve the legacy fingerprint so a retry cannot publish an old draft as a new post.
    const fingerprint = createHash("sha256")
      .update(`${parsed.data.class_id}\\n${parsed.data.title}\\n${parsed.data.author_id}`)
      .digest("hex");
    const id = `webhook_blog_${fingerprint.slice(0, 20)}`;
    const slug = await uniqueSlug(toSlug(parsed.data.title, fingerprint), id);
    const item: CmsNews = {
      id,
      createdAt: now,
      updatedAt: now,
      title: parsed.data.title,
      subtitle: summary.slice(0, 180),
      slug,
      category: categoryFor(parsed.data.class_id),
      tags: ["external-plugin", parsed.data.class_id].filter(Boolean),
      author: parsed.data.author_id || "External Content Partner",
      coverImage: validImage(parsed.data.image_url),
      excerpt: summary.slice(0, 220),
      content,
      status: "published",
      featured: false,
      pinned: false,
      source: "",
      publishAt: now,
      seoTitle: parsed.data.title.slice(0, 60),
      seoDescription: summary.slice(0, 160),
      indexable: false,
    };

    if (!(await cmsStore.insertNews(item))) {
      const existing = await cmsStore.getNews(id);
      if (!existing) throw new Error("Blog deduplication record could not be read.");
      if (existing.status !== "published") return response(1, "文章已存在，保留原有状态");
      revalidatePublicBlog(existing.slug);
      return response(1, "发布成功");
    }

    await recordAudit("publish_webhook_blog", item.id, "success");
    revalidatePublicBlog(item.slug);
    return response(1, "发布成功");
  } catch {
    console.error("Blog webhook publish failed");
    await recordAudit("webhook_publish_failed", "blog", "failed");
    return response(0, "发布失败，请稍后重试。");
  }
}

export async function GET(request: Request) {
  // Some provider dashboards validate a webhook by GET before sending content.
  // A signed GET confirms reachability but never creates or updates an article.
  const secret = process.env.WEBHOOK_ARTICLE_SIGN || process.env.BLOG_WEBHOOK_API_KEY;
  const sign = new URL(request.url).searchParams.get("sign") || "";
  if (secret && sign && validSecret(sign, secret)) return response(1, "验证成功");
  return response(0, "仅支持POST请求。");
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "GET, POST, OPTIONS" } });
}
