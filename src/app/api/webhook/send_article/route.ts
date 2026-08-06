import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { cmsStore, logAudit, type CmsNews } from "@/lib/admin-cms";
import { listCmsNews } from "@/lib/admin-cms";
import { markSitemapDirty } from "@/lib/sitemap-dirty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  sign: z.string().min(1),
  class_id: z.string().optional().default("blog"),
  title: z.string().trim().min(2).max(180),
  content: z.string().trim().min(20).max(100_000),
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
  if (!value) return "/assets/applications/hero-edj.webp";
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "/assets/applications/hero-edj.webp";
  } catch {
    return "/assets/applications/hero-edj.webp";
  }
}

function categoryFor(classId: string) {
  const normalized = classId.trim().toLowerCase();
  if (normalized === "31" || normalized === "blog") return "Industry News";
  return `External Blog ${classId.trim().slice(0, 40)}`;
}

async function parsePayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return payloadSchema.safeParse(await request.json());
  const form = await request.formData();
  return payloadSchema.safeParse(Object.fromEntries(form.entries()));
}

export async function POST(request: Request) {
  const secret = process.env.BLOG_WEBHOOK_API_KEY;
  if (!secret) return response(0, "Webhook is not configured.");

  try {
    const parsed = await parsePayload(request);
    if (!parsed.success) return response(0, "Invalid article data: title and content are required.");
    if (!validSecret(parsed.data.sign, secret)) return response(0, "Invalid API key.");

    const now = new Date().toISOString();
    const content = plainText(parsed.data.content);
    if (content.length < 20) return response(0, "Article content is too short after formatting.");
    const fingerprint = createHash("sha256")
      .update(`${parsed.data.class_id}\n${parsed.data.title}\n${parsed.data.author_id}`)
      .digest("hex");
    const id = `webhook_blog_${fingerprint.slice(0, 20)}`;
    const existing = (await listCmsNews()).find((article) => article.id === id);
    const item: CmsNews = {
      id,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      title: parsed.data.title,
      subtitle: content.slice(0, 180),
      slug: existing?.slug || toSlug(parsed.data.title, fingerprint),
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

    await cmsStore.upsertNews(item);
    await logAudit({ actor: "blog_webhook", action: existing ? "update_webhook_blog" : "publish_webhook_blog", target: item.id, result: "success" });
    await markSitemapDirty("external_blog_webhook");
    revalidateTag("cms-blog");
    revalidateTag("sitemap-data");
    revalidatePath("/blog");
    revalidatePath(`/blog/${item.slug}`);
    revalidatePath("/sitemap.xml");
    return response(1, existing ? "Article updated successfully." : "Article published successfully.");
  } catch (error) {
    console.error("Blog webhook publish failed", error);
    return response(0, "Article publishing failed. Please retry.");
  }
}

export async function GET() {
  return response(0, "Use POST with application/x-www-form-urlencoded article data.");
}
