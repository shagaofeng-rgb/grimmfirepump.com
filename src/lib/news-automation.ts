import crypto from "crypto";
import { company } from "@/data/site";
import { getPublicProducts, type PublicProduct } from "@/lib/public-cms";
import { createId, readStore, upsertStore, writeStore } from "@/lib/local-store";

export type NewsStatus =
  | "discovered"
  | "fetched"
  | "rejected"
  | "duplicate"
  | "analyzing"
  | "draft"
  | "review_required"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "archived";

export type NewsSource = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  url: string;
  type: "rss" | "api" | "manual";
  enabled: boolean;
  language: string;
  lastFetchedAt?: string;
  lastStatus?: "success" | "failed" | "not_configured";
  lastError?: string;
};

export type NewsArticle = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: NewsStatus;
  title: string;
  slug: string;
  summary: string;
  body: string[];
  category: string;
  language: string;
  sourceName: string;
  sourceUrl: string;
  sourceCanonicalUrl: string;
  sourceTitle: string;
  sourcePublishedAt: string;
  sourceFetchedAt: string;
  sourceFacts: string[];
  sourceFingerprint: string;
  eventFingerprint: string;
  contentHash: string;
  relatedProducts: Array<{ slug: string; title: string; score: number }>;
  coverImageUrl: string;
  coverImageSourceUrl: string;
  coverImagePageUrl: string;
  coverImageAlt: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  coverImageFetchedAt: string;
  coverImageHash: string;
  coverImageStatus: "ready" | "failed" | "pending";
  seoTitle: string;
  seoDescription: string;
  geoSummary: string;
  promptVersion: string;
  generatedModel: string;
  publishAt?: string;
  failureReason?: string;
  retries: number;
};

export type NewsJob = {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: "collect" | "generate" | "publish" | "retry" | "daily-run";
  status: "running" | "success" | "failed" | "skipped";
  startedAt: string;
  finishedAt?: string;
  message: string;
  stats: Record<string, number | string>;
};

export type NewsPublicationAudit = {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  target: number;
  published: number;
  generated: number;
  duplicates: number;
  rejected: number;
  failed: number;
  status: "success" | "partial" | "failed";
  message: string;
};

type FeedItem = {
  title: string;
  link: string;
  canonicalUrl: string;
  description: string;
  publishedAt: string;
  sourceName: string;
  sourceFeedUrl: string;
  language: string;
  imageUrl?: string;
  imageSourceUrl?: string;
};

const ARTICLES_STORE = "news-articles.json";
const SOURCES_STORE = "news-sources.json";
const JOBS_STORE = "news-jobs.json";
const AUDITS_STORE = "news-publication-audits.json";

const fallbackNewsImages = [
  {
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    source: "https://unsplash.com/",
    topic: "industrial fire protection pump room",
  },
  {
    url: "https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=1200&q=80",
    source: "https://unsplash.com/",
    topic: "factory engineering equipment",
  },
  {
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    source: "https://unsplash.com/",
    topic: "commercial building fire protection",
  },
  {
    url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    source: "https://unsplash.com/",
    topic: "infrastructure water system",
  },
];

const defaultSourceUrls = [
  "https://news.google.com/rss/search?q=%22fire%20pump%22%20OR%20%22fire%20protection%22%20industrial&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=%22NFPA%2020%22%20%22fire%20pump%22&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=%22data%20center%22%20%22fire%20protection%22&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=%22warehouse%22%20%22fire%20protection%22%20pump&hl=en-US&gl=US&ceid=US:en",
];

export function getNewsConfig() {
  const dailyTarget = Number(process.env.NEWS_DAILY_TARGET || 4);
  const lookbackHours = Number(process.env.NEWS_LOOKBACK_HOURS || 72);
  const dedupDays = Number(process.env.NEWS_DEDUP_DAYS || 7);
  const maxRetries = Number(process.env.NEWS_MAX_RETRIES || 3);
  const relevanceThreshold = Number(process.env.NEWS_RELEVANCE_THRESHOLD || 10);
  const autoPublish = process.env.NEWS_AUTO_PUBLISH !== "false";
  const allowedLanguages = (process.env.NEWS_ALLOWED_LANGUAGES || "en")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sourceWhitelist = (process.env.NEWS_SOURCE_WHITELIST || defaultSourceUrls.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    dailyTarget: Number.isFinite(dailyTarget) ? dailyTarget : 4,
    timezone: process.env.NEWS_TIMEZONE || "Asia/Shanghai",
    lookbackHours: Number.isFinite(lookbackHours) ? lookbackHours : 72,
    dedupDays: Number.isFinite(dedupDays) ? dedupDays : 7,
    maxRetries: Number.isFinite(maxRetries) ? maxRetries : 3,
    relevanceThreshold: Number.isFinite(relevanceThreshold) ? relevanceThreshold : 10,
    autoPublish,
    allowedLanguages,
    sourceWhitelist,
    alertEmailConfigured: Boolean(process.env.NEWS_ALERT_EMAIL || process.env.RESEND_API_KEY),
  };
}

export async function listNewsArticles() {
  const articles = await readStore<NewsArticle[]>(ARTICLES_STORE, []);
  return articles.sort((a, b) => Date.parse(b.publishAt || b.createdAt) - Date.parse(a.publishAt || a.createdAt));
}

export async function listPublishedNews() {
  return (await listNewsArticles()).filter((item) => item.status === "published");
}

export async function getNewsArticle(slug: string) {
  return (await listNewsArticles()).find((item) => item.slug === slug && item.status === "published");
}

export async function listNewsSources() {
  const stored = await readStore<NewsSource[]>(SOURCES_STORE, []);
  const storedUrls = new Set(stored.map((item) => item.url));
  const now = new Date().toISOString();
  const configSources: NewsSource[] = getNewsConfig().sourceWhitelist
    .filter((url) => !storedUrls.has(url))
    .map((url, index) => ({
      id: `source_${hash(url).slice(0, 14)}`,
      createdAt: now,
      updatedAt: now,
      name: sourceNameFromUrl(url) || `News Source ${index + 1}`,
      url,
      type: "rss",
      enabled: true,
      language: "en",
      lastStatus: "not_configured",
    }));
  return [...stored, ...configSources];
}

export async function listNewsJobs() {
  return (await readStore<NewsJob[]>(JOBS_STORE, [])).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function listNewsAudits() {
  return (await readStore<NewsPublicationAudit[]>(AUDITS_STORE, [])).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getRelatedNewsForProduct(productSlug: string, limit = 3) {
  return (await listPublishedNews())
    .filter((article) => article.relatedProducts.some((product) => product.slug === productSlug))
    .slice(0, limit);
}

export async function runNewsAutomation(reason = "scheduled") {
  const job = await startJob("daily-run", `News automation started by ${reason}.`);
  const config = getNewsConfig();
  const today = todayKey();
  const publishedToday = (await listPublishedNews()).filter((item) => (item.publishAt || item.createdAt).slice(0, 10) === today).length;

  if (publishedToday >= config.dailyTarget) {
    const audit = await saveAudit({
      date: today,
      target: config.dailyTarget,
      published: publishedToday,
      generated: 0,
      duplicates: 0,
      rejected: 0,
      failed: 0,
      status: "success",
      message: "Daily target already met.",
    });
    await finishJob(job, "success", "Daily target already met.", { publishedToday, audit: audit.id });
    return { ok: true, jobId: job.id, audit, stats: { publishedToday, generated: 0 } };
  }

  try {
    const result = await collectAndPublishNews(config.dailyTarget - publishedToday);
    const audit = await saveAudit({
      date: today,
      target: config.dailyTarget,
      published: publishedToday + result.published,
      generated: result.generated,
      duplicates: result.duplicates,
      rejected: result.rejected,
      failed: result.failed,
      status: publishedToday + result.published >= config.dailyTarget ? "success" : result.published ? "partial" : "failed",
      message: result.message,
    });
    await finishJob(job, audit.status === "failed" ? "failed" : "success", result.message, { ...result, audit: audit.id });
    return { ok: audit.status !== "failed", jobId: job.id, audit, stats: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown news automation error";
    await finishJob(job, "failed", message, { failed: 1 });
    const audit = await saveAudit({
      date: today,
      target: config.dailyTarget,
      published: publishedToday,
      generated: 0,
      duplicates: 0,
      rejected: 0,
      failed: 1,
      status: "failed",
      message,
    });
    return { ok: false, jobId: job.id, audit, stats: { failed: 1 }, error: message };
  }
}

export async function collectAndPublishNews(limit = getNewsConfig().dailyTarget) {
  const config = getNewsConfig();
  const sources = (await listNewsSources()).filter((source) => source.enabled && isAllowedExternalUrl(source.url));
  const products = await getPublicProducts();
  const existing = await listNewsArticles();
  let duplicates = 0;
  let rejected = 0;
  let failed = 0;
  let generated = 0;
  let published = 0;

  if (!sources.length) {
    return { generated, published, duplicates, rejected, failed: 1, message: "No enabled public news sources are configured." };
  }

  const feedItems = (await Promise.all(sources.map((source) => fetchFeedItems(source)))).flat();
  const freshItems = feedItems
    .filter((item) => isWithinHours(item.publishedAt, config.lookbackHours))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  for (const item of freshItems) {
    if (published >= limit) break;
    const fingerprint = fingerprintForSource(item);
    const eventFingerprint = fingerprintForEvent(item.title);
    const contentHash = hash(`${item.title} ${cleanText(item.description)}`);
    const duplicate = existing.some((article) => {
      const recent = Date.now() - Date.parse(article.createdAt) <= config.dedupDays * 24 * 60 * 60 * 1000;
      return (
        recent &&
        (article.sourceFingerprint === fingerprint ||
          article.contentHash === contentHash ||
          article.eventFingerprint === eventFingerprint ||
          normalizeUrl(article.sourceCanonicalUrl) === normalizeUrl(item.canonicalUrl))
      );
    });

    if (duplicate) {
      duplicates += 1;
      continue;
    }

    const relatedProducts = rankProducts(item, products).slice(0, 3);
    const totalScore = relatedProducts[0]?.score || 0;
    if (!relatedProducts.length || totalScore < config.relevanceThreshold) {
      rejected += 1;
      continue;
    }

    try {
      const article = await buildArticle(item, relatedProducts);
      generated += 1;
      if (article.coverImageStatus !== "ready" || !article.coverImageUrl) {
        failed += 1;
        await upsertStore(ARTICLES_STORE, { ...article, status: "failed", failureReason: "No valid public cover image was found." });
        continue;
      }

      const status: NewsStatus = config.autoPublish ? "published" : "review_required";
      const publishAt = status === "published" ? new Date().toISOString() : undefined;
      await upsertStore(ARTICLES_STORE, { ...article, status, publishAt });
      if (status === "published") published += 1;
      existing.push({ ...article, status, publishAt });
    } catch (error) {
      failed += 1;
      console.warn("News article generation failed", error);
    }
  }

  const message =
    published > 0
      ? `Generated ${generated} article(s), published ${published}, skipped ${duplicates} duplicate(s).`
      : `No publishable fresh news found. Generated ${generated}, duplicates ${duplicates}, rejected ${rejected}, failed ${failed}.`;

  return { generated, published, duplicates, rejected, failed, message };
}

async function fetchFeedItems(source: NewsSource): Promise<FeedItem[]> {
  const nextSource: NewsSource = { ...source, lastFetchedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  try {
    const xml = await fetchText(source.url, 12000);
    const items = parseFeed(xml, source).slice(0, 24);
    await upsertStore(SOURCES_STORE, { ...nextSource, lastStatus: "success", lastError: "" });
    return items;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Source fetch failed";
    await upsertStore(SOURCES_STORE, { ...nextSource, lastStatus: "failed", lastError: message });
    return [];
  }
}

async function buildArticle(item: FeedItem, relatedProducts: Array<{ slug: string; title: string; score: number }>): Promise<NewsArticle> {
  const now = new Date().toISOString();
  const sourceFacts = [
    `${item.sourceName} published the original update on ${item.publishedAt.slice(0, 10)}.`,
    cleanText(item.description || item.title).slice(0, 220),
    `The source topic is related to ${relatedProducts.map((product) => product.title).join(", ")}.`,
  ].filter((fact) => fact.length > 12);
  const image = await resolveNewsImage(item, relatedProducts[0]?.title || "industrial fire pump");
  const slug = uniqueSlug(item.title, item.publishedAt);
  const summary = trimText(
    `${cleanText(item.title)} This update is relevant for fire protection buyers reviewing pump capacity, package configuration and project reliability.`,
    170,
  );
  const productLinks = relatedProducts.map((product) => product.title).join(", ");

  return {
    id: createId("news"),
    createdAt: now,
    updatedAt: now,
    status: "draft",
    title: cleanText(item.title),
    slug,
    summary,
    body: [
      `Source fact: ${sourceFacts[1] || cleanText(item.title)}`,
      `Why it matters: fire protection projects depend on stable water supply, compliant pump selection and reliable backup power. Buyers should review flow, pressure, duty point, driver type and local approval requirements before confirming a pump package.`,
      `GRIMM engineering view: this topic connects with ${productLinks}. Our team can help compare diesel, electric, jockey and packaged pump configurations according to the project application, installation room and documentation requirement.`,
      `What buyers can do next: share the required flow, head, voltage, frequency, project country and expected delivery time so the engineering team can prepare a technical recommendation and quotation.`,
    ],
    category: categoryForArticle(item.title),
    language: item.language || "en",
    sourceName: item.sourceName,
    sourceUrl: item.link,
    sourceCanonicalUrl: item.canonicalUrl,
    sourceTitle: cleanText(item.title),
    sourcePublishedAt: item.publishedAt,
    sourceFetchedAt: now,
    sourceFacts,
    sourceFingerprint: fingerprintForSource(item),
    eventFingerprint: fingerprintForEvent(item.title),
    contentHash: hash(`${item.title} ${cleanText(item.description)}`),
    relatedProducts,
    coverImageUrl: image.url,
    coverImageSourceUrl: image.sourceUrl,
    coverImagePageUrl: image.pageUrl,
    coverImageAlt: `${cleanText(item.title)} - industrial fire protection news`,
    coverImageWidth: image.width,
    coverImageHeight: image.height,
    coverImageFetchedAt: now,
    coverImageHash: hash(image.url),
    coverImageStatus: image.status,
    seoTitle: trimText(`${cleanText(item.title)} | Fire Pump Industry News`, 64),
    seoDescription: summary,
    geoSummary: `This NewsArticle connects a recent public source with GRIMM fire pump products, buyer applications and engineering selection guidance.`,
    promptVersion: "news-automation-v1",
    generatedModel: "template-analysis",
    retries: 0,
  };
}

async function resolveNewsImage(item: FeedItem, topic: string) {
  const candidates = [
    item.imageUrl
      ? {
          url: absoluteUrl(item.imageUrl, item.link),
          sourceUrl: item.imageSourceUrl || item.link,
          pageUrl: item.link,
          width: 1200,
          height: 630,
        }
      : null,
    ...(await extractPageImages(item.link)).map((url) => ({
      url,
      sourceUrl: url,
      pageUrl: item.link,
      width: 1200,
      height: 630,
    })),
    ...fallbackNewsImages
      .filter((image) => image.topic.includes(topic.toLowerCase().split(" ")[0]) || topic)
      .map((image) => ({
        url: image.url,
        sourceUrl: image.url,
        pageUrl: image.source,
        width: 1200,
        height: 630,
      })),
  ].filter((candidate): candidate is { url: string; sourceUrl: string; pageUrl: string; width: number; height: number } =>
    Boolean(candidate?.url && isAllowedExternalUrl(candidate.url)),
  );

  for (const candidate of candidates) {
    if (await isUsableImage(candidate.url)) {
      return { ...candidate, status: "ready" as const };
    }
  }

  return {
    url: "",
    sourceUrl: "",
    pageUrl: "",
    width: 0,
    height: 0,
    status: "failed" as const,
  };
}

async function extractPageImages(pageUrl: string) {
  if (!isAllowedExternalUrl(pageUrl)) return [];
  try {
    const html = await fetchText(pageUrl, 9000);
    const images = [
      ...matchAll(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi),
      ...matchAll(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi),
      ...matchAll(html, /"image"\s*:\s*"([^"]+)"/gi),
      ...matchAll(html, /<img[^>]+src=["']([^"']+)["'][^>]*>/gi),
    ];
    return Array.from(new Set(images.map((src) => absoluteUrl(src, pageUrl)).filter((url) => isAllowedExternalUrl(url)))).slice(0, 5);
  } catch {
    return [];
  }
}

function parseFeed(xml: string, source: NewsSource) {
  const blocks = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((match) => match[0]);
  const atomBlocks = blocks.length ? [] : Array.from(xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)).map((match) => match[0]);
  return [...blocks, ...atomBlocks]
    .map((block) => {
      const title = decodeEntities(stripTags(getTag(block, "title")));
      const link = decodeEntities(getLink(block));
      const description = decodeEntities(stripTags(getTag(block, "description") || getTag(block, "summary") || getTag(block, "content:encoded")));
      const publishedAt = parseDate(getTag(block, "pubDate") || getTag(block, "published") || getTag(block, "updated"));
      const imageUrl = getImageFromBlock(block);
      return {
        title,
        link,
        canonicalUrl: normalizeUrl(link),
        description,
        publishedAt,
        sourceName: getTag(block, "source") ? decodeEntities(stripTags(getTag(block, "source"))) : source.name,
        sourceFeedUrl: source.url,
        language: source.language || "en",
        imageUrl,
        imageSourceUrl: imageUrl ? source.url : undefined,
      };
    })
    .filter((item) => item.title.length > 8 && isAllowedExternalUrl(item.link) && !Number.isNaN(Date.parse(item.publishedAt)));
}

function getTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() || "";
}

function getLink(block: string) {
  const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  return atomLink || getTag(block, "link");
}

function getImageFromBlock(block: string) {
  return (
    block.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1] ||
    block.match(/<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*>/i)?.[1] ||
    block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image\/[^"']+["'][^>]*>/i)?.[1] ||
    ""
  );
}

function rankProducts(item: FeedItem, products: PublicProduct[]) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const industryBoost = /(fire|pump|nfpa|sprinkler|water|industrial|warehouse|data center|oil|gas|building|protection)/i.test(text) ? 10 : 0;
  return products
    .map((product) => {
      const keywords = [product.title, product.category, product.keywords, product.summary]
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3);
      const matches = new Set(keywords.filter((word) => text.includes(word)));
      return { slug: product.slug, title: product.title, score: matches.size * 7 + industryBoost };
    })
    .filter((product) => product.score > 0)
    .sort((a, b) => b.score - a.score);
}

function categoryForArticle(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("data center")) return "Data Center Fire Protection";
  if (lower.includes("warehouse")) return "Warehouse Fire Protection";
  if (lower.includes("nfpa")) return "NFPA20";
  if (lower.includes("diesel")) return "Diesel Fire Pump";
  if (lower.includes("water")) return "Water Supply";
  return "Fire Pump Industry";
}

function fingerprintForSource(item: FeedItem) {
  return hash(`${normalizeUrl(item.canonicalUrl || item.link)}|${item.publishedAt}|${item.title.toLowerCase()}`);
}

function fingerprintForEvent(title: string) {
  return hash(
    cleanText(title)
      .toLowerCase()
      .replace(/\b(the|a|an|and|or|to|of|for|in|on|with|by|from|new|update|report)\b/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim(),
  );
}

function uniqueSlug(title: string, date: string) {
  const base = cleanText(title)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
    .replace(/-$/g, "");
  return `${base || "fire-pump-news"}-${date.slice(0, 10)}`;
}

async function startJob(type: NewsJob["type"], message: string) {
  const now = new Date().toISOString();
  const job: NewsJob = {
    id: createId("newsjob"),
    createdAt: now,
    updatedAt: now,
    type,
    status: "running",
    startedAt: now,
    message,
    stats: {},
  };
  await upsertStore(JOBS_STORE, job);
  return job;
}

async function finishJob(job: NewsJob, status: NewsJob["status"], message: string, stats: NewsJob["stats"]) {
  const now = new Date().toISOString();
  await upsertStore(JOBS_STORE, { ...job, status, message, stats, updatedAt: now, finishedAt: now });
}

async function saveAudit(input: Omit<NewsPublicationAudit, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const audit: NewsPublicationAudit = {
    id: `audit_${input.date}`,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  await upsertStore(AUDITS_STORE, audit);
  return audit;
}

async function fetchText(url: string, timeoutMs: number) {
  if (!isAllowedExternalUrl(url)) throw new Error("Blocked external URL");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": `${company.shortName} news monitor; ${company.website}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return text.slice(0, 500000);
  } finally {
    clearTimeout(timeout);
  }
}

async function isUsableImage(url: string) {
  if (!isAllowedExternalUrl(url)) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "user-agent": `${company.shortName} image verifier; ${company.website}` },
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") || "";
    return response.ok && contentType.startsWith("image/");
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export function isAllowedExternalUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host === "0.0.0.0" ||
      host === "::1" ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((param) =>
      url.searchParams.delete(param),
    );
    url.hash = "";
    return url.toString();
  } catch {
    return value;
  }
}

function absoluteUrl(value: string, base: string) {
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function sourceNameFromUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return host.split(".").slice(0, -1).join(".") || host;
  } catch {
    return "";
  }
}

function isWithinHours(date: string, hours: number) {
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) && Date.now() - parsed <= hours * 60 * 60 * 1000 && parsed <= Date.now() + 60 * 60 * 1000;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(value: string) {
  const parsed = Date.parse(decodeEntities(stripTags(value)));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function stripTags(value: string) {
  return value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]*>/g, " ");
}

function cleanText(value: string) {
  return decodeEntities(stripTags(value)).replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function trimText(value: string, maxLength: number) {
  const clean = cleanText(value);
  if (clean.length <= maxLength) return clean;
  const trimmed = clean.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > maxLength * 0.55 ? lastSpace : trimmed.length).replace(/[,. ]+$/, "")}.`;
}

function matchAll(value: string, pattern: RegExp) {
  return Array.from(value.matchAll(pattern)).map((match) => match[1]).filter(Boolean);
}

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
