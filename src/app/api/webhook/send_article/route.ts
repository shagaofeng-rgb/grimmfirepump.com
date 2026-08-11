import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cmsStore, listCmsNews, logAudit, type CmsNews } from "@/lib/admin-cms";
import { markSitemapDirty } from "@/lib/sitemap-dirty";

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

function uniqueSlug(preferred: string, id: string, articles: CmsNews[]) {
  const owner = articles.find((article) => article.slug === preferred);
  return !owner || owner.id === id ? preferred : `${preferred}-${id.slice(-6)}`;
}

async function parsePayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return payloadSchema.safeParse(await request.json());
  const form = await request.formData();
  return payloadSchema.safeParse(Object.fromEntries(form.entries()));
}

function isPublishableArticle(title: string, content: string) {
  return title.trim().length >= 2 && plainText(content).length >= 20;
}

async function recordFailure(action: string, target: string) {
  try {
    await logAudit({ actor: "blog_webhook", action, target: target.slice(0, 120), result: "failed" });
  } catch {
    // A logging failure must not reveal implementation details or change the plugin contract.
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
      await recordFailure("webhook_invalid_payload", "blog");
      return response(0, "请求参数不符合要求。");
    }
    if (!validSecret(parsed.data.sign, secret)) {
      await recordFailure("webhook_auth_failed", parsed.data.class_id);
      return response(0, "秘钥错误");
    }

    // Custom framework verification sends only a signed class_id (or short placeholders).
    // It is intentionally accepted without creating a database record.
    if (!isPublishableArticle(parsed.data.title, parsed.data.content)) return response(1, "验证成功");

    const now = new Date().toISOString();
    const content = plainText(parsed.data.content);
    const fingerprint = createHash("sha256")
      .update(`${parsed.data.class_id}\\n${parsed.data.title}\\n${parsed.data.author_id}`)
      .digest("hex");
    const id = `webhook_blog_${fingerprint.slice(0, 20)}`;
    const articles = await listCmsNews();
    const existing = articles.find((article) => article.id === id);
    const slug = existing?.slug || uniqueSlug(toSlug(parsed.data.title, fingerprint), id, articles);
    const item: CmsNews = {
      id,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      title: parsed.data.title,
      subtitle: content.slice(0, 180),
      slug,
      category: categoryFor(parsed.data.class_id),
      tags: ["external-plugin", parsed.data.class_id].filter(Boolean),
      author: parsed.data.author_id || "External Content Partner",
      coverImage: validImage(parsed.data.image_url),
      excerpt: content.slice(0, 220),
      content,
      status: "published",
      featured: false,
      pinned: false,
      source: "",
      publishAt: existing?.publishAt || now,
      seoTitle: parsed.data.title.slice(0, 60),
      seoDescription: content.slice(0, 160),
      indexable: true,
    };

    // The deterministic id makes transport retries update the same article instead of duplicating it.
    await cmsStore.upsertNews(item);
    await logAudit({ actor: "blog_webhook", action: existing ? "update_webhook_blog" : "publish_webhook_blog", target: item.id, result: "success" });
    await markSitemapDirty("external_blog_webhook");
    revalidateTag("cms-blog");
    revalidateTag("sitemap-data");
    revalidatePath("/blog");
    revalidatePath(`/blog/${item.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemaps/[file]", "page");
    return response(1, "发布成功");
  } catch (error) {
    console.error("Blog webhook publish failed", error);
    await recordFailure("webhook_publish_failed", "blog");
    return response(0, "发布失败，请稍后重试。");
  }
}

export async function GET() {
  return response(0, "仅支持POST请求。");
}
