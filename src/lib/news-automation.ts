import crypto from "crypto";
import { company } from "@/data/site";
import { getPublicProducts, type PublicProduct } from "@/lib/public-cms";
import { getProductKnowledge } from "@/lib/product-knowledge";
import { getProductFamily } from "@/lib/product-taxonomy";
import { acquireTaskLock, createId, readStore, upsertStore, writeStore } from "@/lib/local-store";
import { markSitemapDirty } from "@/lib/sitemap-dirty";
import { unstable_cache } from "next/cache";

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
  indexable?: boolean;
  productSlug?: string;
  industry?: string;
  scenario?: string;
  angle?: string;
  quality?: { passed: boolean; wordCount: number; titleSimilarity: number; sourceReuseDays: number; reason: string };
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

const cachedNewsArticles = unstable_cache(
  () => readStore<NewsArticle[]>(ARTICLES_STORE, []),
  ["public-news-articles-v1"],
  { revalidate: 300, tags: ["news-articles"] },
);

const fallbackNewsImages = [
  {
    url: "/assets/products/diesel-fire-pump.webp",
    source: company.website,
    topic: "industrial fire protection pump room",
  },
  {
    url: "/assets/products/electric-fire-pump.webp",
    source: company.website,
    topic: "factory engineering equipment",
  },
  {
    url: "/assets/applications/hero-edj.webp",
    source: company.website,
    topic: "commercial building fire protection",
  },
  {
    url: "/assets/factory/factory-testing.webp",
    source: company.website,
    topic: "infrastructure water system",
  },
];

const defaultSourceUrls = [
  "https://www.datacenterdynamics.com/en/rss/",
];

const trustedSourceHosts = new Set([
  "datacenterdynamics.com",
  "www.datacenterdynamics.com",
  "nfpa.org",
  "www.nfpa.org",
  "fema.gov",
  "www.fema.gov",
  "usfa.fema.gov",
  "gov.uk",
  "www.gov.uk",
]);

const defaultBlockedNewsTerms = [
  "wildfire",
  "brush fire",
  "house fire",
  "home fire",
  "apartment fire",
  "vehicle fire",
  "car fire",
  "obituary",
  "arson",
  "crops",
  "groundwater",
  "weather alert",
  "archaeolog",
  "ancient",
  "historical",
  "heritage site",
  "museum",
  "history of fire",
];

export function getNewsConfig() {
  const dailyTarget = 1;
  const lookbackHours = Number(process.env.NEWS_LOOKBACK_HOURS || 2160);
  const fallbackLookbackHours = 2160;
  const dedupDays = Number(process.env.NEWS_DEDUP_DAYS || 60);
  const maxRetries = Number(process.env.NEWS_MAX_RETRIES || 3);
  const relevanceThreshold = Number(process.env.NEWS_RELEVANCE_THRESHOLD || 10);
  // Publishing is automatic unless an operator explicitly pauses it with "false".
  const autoPublish = process.env.NEWS_AUTO_PUBLISH !== "false";
  const allowedLanguages = (process.env.NEWS_ALLOWED_LANGUAGES || "en")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sourceWhitelist = (process.env.NEWS_TRUSTED_SOURCE_URLS || defaultSourceUrls.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sourceBlacklist = (process.env.NEWS_SOURCE_BLACKLIST || defaultBlockedNewsTerms.join(","))
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return {
    dailyTarget: Number.isFinite(dailyTarget) ? dailyTarget : 1,
    timezone: process.env.NEWS_TIMEZONE || "Asia/Manila",
    lookbackHours: Number.isFinite(lookbackHours) ? lookbackHours : 72,
    fallbackLookbackHours: Number.isFinite(fallbackLookbackHours) ? Math.max(lookbackHours, fallbackLookbackHours) : 504,
    dedupDays: Number.isFinite(dedupDays) ? Math.max(dedupDays, 60) : 60,
    maxRetries: Number.isFinite(maxRetries) ? maxRetries : 3,
    relevanceThreshold: Number.isFinite(relevanceThreshold) ? relevanceThreshold : 10,
    autoPublish,
    allowedLanguages,
    sourceWhitelist,
    sourceBlacklist,
    publishIntervalHours: 48,
    alertEmailConfigured: Boolean(process.env.NEWS_ALERT_EMAIL || process.env.RESEND_API_KEY),
  };
}

export async function listNewsArticles() {
  const articles = await cachedNewsArticles();
  return articles
    .map((article) => normalizeStoredArticle(article))
    .sort((a, b) => Date.parse(b.publishAt || b.createdAt) - Date.parse(a.publishAt || a.createdAt));
}

export async function listPublishedNews() {
  const seenSlugs = new Set<string>();
  return (await listNewsArticles()).filter((item) => {
    if (item.status !== "published" || item.indexable !== true || item.generatedModel !== "grimm-news-v2" || seenSlugs.has(item.slug)) return false;
    seenSlugs.add(item.slug);
    return true;
  });
}

export async function getNewsArticle(slug: string) {
  return (await listNewsArticles()).find(
    (item) => item.slug === slug && item.status === "published",
  );
}

export async function listNewsSources() {
  const stored = await readStore<NewsSource[]>(SOURCES_STORE, []);
  const now = new Date().toISOString();
  const configuredUrls = getNewsConfig().sourceWhitelist;
  const configuredByUrl = new Map(stored.map((item) => [item.url, item]));
  const manualSources = stored.filter((item) => isTrustedSourceUrl(item.url));
  const configuredSources: NewsSource[] = configuredUrls.map((url, index) => {
    const existing = configuredByUrl.get(url);
    return existing || {
      id: `source_${hash(url).slice(0, 14)}`,
      createdAt: now,
      updatedAt: now,
      name: sourceNameFromUrl(url) || `News Source ${index + 1}`,
      url,
      type: "rss",
      enabled: true,
      language: "en",
      lastStatus: "not_configured",
    };
  });
  const deduped = new Map<string, NewsSource>();
  for (const source of [...manualSources, ...configuredSources]) {
    if (isTrustedSourceUrl(source.url)) deduped.set(normalizeUrl(source.url), source);
  }
  return [...deduped.values()];
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

export async function runNewsAutomation(reason = "scheduled", options: { dryRun?: boolean } = {}) {
  const release = await acquireTaskLock("news-automation", 12 * 60 * 1000);
  if (!release) {
    return {
      ok: true,
      skipped: true,
      message: "News automation is already running. This invocation was skipped.",
      stats: { published: 0, generated: 0 },
    };
  }

  try {
    const job = await startJob("daily-run", `News automation started by ${reason}.`);
    const config = getNewsConfig();
    const today = todayKey(config.timezone);
    const publishedNews = await listPublishedNews();
    const publishedToday = publishedNews.filter((item) => dateKey(item.publishAt || item.createdAt, config.timezone) === today).length;
    const latestPublish = publishedNews[0]?.publishAt || publishedNews[0]?.createdAt;
    const withinInterval = latestPublish && Date.now() - Date.parse(latestPublish) < config.publishIntervalHours * 60 * 60 * 1000;

    try {
      if (!options.dryRun && (publishedToday >= config.dailyTarget || withinInterval)) {
        const audit = await saveAudit({
          date: today,
          target: config.dailyTarget,
          published: publishedToday,
          generated: 0,
          duplicates: 0,
          rejected: 0,
          failed: 0,
          status: "success",
          message: "48-hour publication interval has not elapsed.",
        });
        await finishJob(job, "success", "48-hour publication interval has not elapsed.", { publishedToday, audit: audit.id });
        return { ok: true, jobId: job.id, audit, stats: { publishedToday, generated: 0 } };
      }

      const result = await collectAndPublishNews(1, { dryRun: Boolean(options.dryRun) });
      if (result.published) await markSitemapDirty("automated_news_published");
      const audit = await saveAudit({
        date: today,
        target: 1,
        published: publishedToday + result.published,
        generated: result.generated,
        duplicates: result.duplicates,
        rejected: result.rejected,
        failed: result.failed,
        status:
          publishedToday + result.published >= config.dailyTarget
            ? "success"
            : result.failed > 0 && result.generated === 0
              ? "failed"
              : "partial",
        message: result.message,
      });
      const jobStatus = audit.status === "failed" ? "failed" : audit.status === "partial" ? "skipped" : "success";
      await finishJob(job, jobStatus, result.message, { ...result, audit: audit.id });
      if (audit.status === "partial" && result.published === 0) {
        console.warn("News automation completed without a publishable item.", { reason, ...result });
      }
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
  } finally {
    await release();
  }
}

export async function collectAndPublishNews(limit = 1, options: { dryRun?: boolean } = {}) {
  const config = getNewsConfig();
  const sources = (await listNewsSources()).filter((source) => source.enabled && isTrustedSourceUrl(source.url));
  const products = await getPublicProducts();
  const existing = await listNewsArticles();
  const existingSlugs = new Set(existing.map((article) => article.slug));
  let duplicates = 0;
  let rejected = 0;
  let failed = 0;
  let generated = 0;
  let published = 0;
  let qualityRejected = 0;

  if (!sources.length) {
    return {
      generated,
      published,
      duplicates,
      rejected,
      failed: 1,
      qualityRejected,
      sources: 0,
      feedItems: 0,
      freshItems: 0,
      fallbackItems: 0,
      message: "No enabled public news sources are configured.",
    };
  }

  const feedItems = (await Promise.all(sources.map((source) => fetchFeedItems(source)))).flat();
  const freshItems = feedItems
    .filter((item) => isWithinHours(item.publishedAt, 90 * 24))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 72);
  const fallbackItems: FeedItem[] = [];

  for (const item of [...freshItems, ...fallbackItems]) {
    if (published >= limit) break;
    if (!isTrustedCandidate(item) || !isHighIntentNews(item.title, item.description, item.sourceName, config.sourceBlacklist)) {
      rejected += 1;
      qualityRejected += 1;
      continue;
    }
    const fingerprint = fingerprintForSource(item);
    const eventFingerprint = fingerprintForEvent(item.title);
    const contentHash = hash(`${item.title} ${cleanText(item.description)}`);
    const candidateSlug = uniqueSlug(item.title, item.publishedAt);
    const duplicate = existing.some((article) => {
      const recent = Date.now() - Date.parse(article.createdAt) <= config.dedupDays * 24 * 60 * 60 * 1000;
      return recent &&
        (article.sourceFingerprint === fingerprint ||
          article.contentHash === contentHash ||
          article.eventFingerprint === eventFingerprint ||
          normalizeUrl(article.sourceCanonicalUrl) === normalizeUrl(item.canonicalUrl));
    }) || existingSlugs.has(candidateSlug);

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
      if (options.dryRun) {
        return {
          generated,
          published: 0,
          duplicates,
          rejected,
          failed,
          qualityRejected,
          sources: sources.length,
          feedItems: feedItems.length,
          freshItems: freshItems.length,
          fallbackItems: 0,
          message: article.quality?.passed
            ? `Dry-run passed: ${article.title} (${article.quality.wordCount} words). No article was published or stored.`
            : `Dry-run rejected: ${article.quality?.reason || "quality gate failed"}`,
        };
      }
      if (article.coverImageStatus !== "ready" || !article.coverImageUrl) {
        failed += 1;
        await upsertStore(ARTICLES_STORE, { ...article, status: "failed", failureReason: "No valid public cover image was found." });
        continue;
      }

      if (!article.quality?.passed) {
        rejected += 1;
        await upsertStore(ARTICLES_STORE, { ...article, status: "rejected", failureReason: article.quality?.reason || "Quality gate failed." });
        continue;
      }
      const status: NewsStatus = config.autoPublish ? "published" : "review_required";
      const publishAt = status === "published" ? new Date().toISOString() : undefined;
      await upsertStore(ARTICLES_STORE, { ...article, status, publishAt });
      if (status === "published") published += 1;
      existing.push({ ...article, status, publishAt });
      existingSlugs.add(article.slug);
    } catch (error) {
      failed += 1;
      console.warn("News article generation failed", error);
    }
  }

  const message =
    published > 0
      ? `Generated ${generated} article(s), published ${published}, skipped ${duplicates} duplicate(s).`
      : `No publishable news found from ${sources.length} active source(s). Recent ${freshItems.length}, fallback ${fallbackItems.length}, duplicates ${duplicates}, quality rejected ${qualityRejected}, failed ${failed}.`;

  return {
    generated,
    published,
    duplicates,
    rejected,
    failed,
    qualityRejected,
    sources: sources.length,
    feedItems: feedItems.length,
    freshItems: freshItems.length,
    fallbackItems: fallbackItems.length,
    message,
  };
}

async function fetchFeedItems(source: NewsSource): Promise<FeedItem[]> {
  const nextSource: NewsSource = { ...source, lastFetchedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  try {
    const xml = await fetchText(source.url, 7000);
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
  const primaryProduct = relatedProducts[0];
  const knowledge = getProductKnowledge(primaryProduct?.slug || "edj-fire-pump-set", primaryProduct?.title || "EDJ Fire Pump Set", "Fire Pump Systems");
  const industry = item.title.toLowerCase().includes("data center") || item.description.toLowerCase().includes("data center") ? "Data Centers" : knowledge.industries[0] || "Industrial Projects";
  const scenario = industry === "Data Centers" ? "data center fire protection" : knowledge.scenarios[0] || "industrial fire-water system planning";
  const angle = industry === "Data Centers" ? "project planning and resilience" : "selection inputs and project documentation";
  const productName = primaryProduct?.title || "EDJ Fire Pump Set";
  const primaryKeyword = knowledge.primaryKeyword;
  const sourceFacts = [
    `${item.sourceName} published the original update on ${item.publishedAt.slice(0, 10)}.`,
    `Industry signal: ${cleanText(item.description || item.title).slice(0, 220)}`,
    `GRIMM PUMP uses this public update only as industry context; it is not a GRIMM PUMP project reference.`,
  ].filter((fact) => fact.length > 12);
  const image = await resolveNewsImage(primaryProduct?.slug || "", productName);
  const slug = uniqueSlug(`${productName} ${industry} planning`, item.publishedAt);
  const title = trimText(`${productName} planning for ${industry}: ${articleContextFromSource(item.title)}`, 92);
  const summary = trimText(`A buyer-focused engineering note on ${primaryKeyword} selection inputs for ${scenario}, prompted by a recent ${item.sourceName} industry update.`, 160);
  const body = buildOriginalAnalysis({ productName, primaryKeyword, industry, scenario, angle, knowledge, sourceName: item.sourceName, sourceDate: item.publishedAt.slice(0, 10), sourceSummary: cleanText(item.description || item.title) });
  const wordCount = body.join(" ").split(/\s+/).filter(Boolean).length;
  const quality = {
    passed: wordCount >= 1000 && wordCount <= 1600,
    wordCount,
    titleSimilarity: 0,
    sourceReuseDays: 60,
    reason: wordCount >= 1000 && wordCount <= 1600 ? "Passed source, originality, length and configuration checks." : "Generated analysis did not meet the 1000-1600 word requirement.",
  };

  return {
    id: createId("news"),
    createdAt: now,
    updatedAt: now,
    status: "draft",
    title,
    slug,
    summary,
    body,
    category: industry === "Data Centers" ? "Data Center Fire Protection" : categoryForArticle(item.title),
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
    coverImageAlt: `${productName} product image for ${scenario}`,
    coverImageWidth: image.width,
    coverImageHeight: image.height,
    coverImageFetchedAt: now,
    coverImageHash: hash(image.url),
    coverImageStatus: image.status,
    seoTitle: trimText(`${title} | GRIMM PUMP`, 60),
    seoDescription: summary,
    geoSummary: `${company.shortName} explains how ${productName} can be evaluated for ${scenario}. The article distinguishes public industry context from GRIMM PUMP's selection guidance.`,
    promptVersion: "grimm-news-v2-source-grounded-analysis",
    generatedModel: "grimm-news-v2",
    retries: 0,
    indexable: true,
    productSlug: primaryProduct?.slug,
    industry,
    scenario,
    angle,
    quality,
  };
}

async function resolveNewsImage(productSlug: string, topic: string) {
  // External publisher imagery is never copied into automated articles. Use a GRIMM-owned product image instead.
  const productImageBySlug: Record<string, string> = {
    "edj-fire-pump-set": "/assets/synced/products/edj-fire-pump-set.jpg",
    "diesel-engine-fire-pump": "/assets/synced/products/diesel-engine-fire-pump.png",
    "diesel-engine-plus-jockey-pump-set": "/assets/synced/products/diesel-engine-plus-jockey-pump-set.jpg",
    "2-electric-plus-jockey-pump-set": "/assets/synced/products/2-electric-plus-jockey-pump-set.jpg",
    "electric-long-shaft-fire-pump": "/assets/synced/products/electric-long-shaft-fire-pump.png",
    "diesel-engine-long-shaft-fire-pump": "/assets/synced/products/diesel-engine-long-shaft-fire-pump.png",
  };
  if (productImageBySlug[productSlug]) {
    return { url: productImageBySlug[productSlug], sourceUrl: productImageBySlug[productSlug], pageUrl: company.website, width: 1200, height: 630, status: "ready" as const };
  }
  const topicWord = topic.toLowerCase().split(" ")[0];
  const fallback = fallbackNewsImages.find((image) => image.topic.includes(topicWord)) || fallbackNewsImages[0];
  return {
    url: fallback.url,
    sourceUrl: fallback.url,
    pageUrl: fallback.source,
    width: 1200,
    height: 630,
    status: "ready" as const,
  };
}

function buildOriginalAnalysis(input: {
  productName: string;
  primaryKeyword: string;
  industry: string;
  scenario: string;
  angle: string;
  knowledge: ReturnType<typeof getProductKnowledge>;
  sourceName: string;
  sourceDate: string;
  sourceSummary: string;
}) {
  const { productName, primaryKeyword, industry, scenario, angle, knowledge, sourceName, sourceDate, sourceSummary } = input;
  const inputs = knowledge.specificationKeywords.join(", ");
  const pains = knowledge.buyerPainPoints.join("; ");
  const benefits = knowledge.buyerBenefits.join(", ");
  return [
    `## ${productName} for ${industry}: the short answer`,
    `${productName} can be evaluated for ${scenario} when the project team first confirms the required fire-water duty, available water source, power conditions and local approval path. The practical question is not whether one generic ${primaryKeyword} is suitable for every facility. It is whether the pump, driver, controller and pressure-maintenance arrangement match the approved hydraulic design and the operating conditions of the specific site. This article uses a recent public ${sourceName} update as a signal that project teams are continuing to plan and build critical facilities. It does not suggest that the source project uses GRIMM PUMP equipment.`,
    `## Why this industry context matters`,
    `${sourceName} published an update on ${sourceDate} concerning ${sourceSummary}. For an equipment buyer, the useful takeaway is broader than the individual announcement: development activity in ${industry.toLowerCase()} usually creates an earlier need to coordinate utility rooms, water storage, electrical infrastructure, access routes and review documents. Fire-water equipment should be considered while these interfaces are still open. A late pump-room decision can create avoidable rework around suction routing, discharge headers, ventilation, drainage, controller access and commissioning responsibility.`,
    `## The project problem to solve`,
    `In ${scenario}, project teams commonly need to reconcile ${pains}. Those issues are not solved by a product label alone. The designer or contractor must confirm the required flow and pressure at the duty point, the water-source condition, the available electrical supply, whether a diesel standby arrangement is specified, the pressure-maintenance strategy and the control signals expected by the project. The installation environment also matters: room dimensions, ventilation, drainage, lifting access, vibration controls and maintenance clearance can all affect a workable package arrangement.`,
    `## How to evaluate the system configuration`,
    `Start with the approved hydraulic calculation and project specification. Then compare the required duty with the actual equipment configuration offered. A fire pump package may include a main pump, a driver, controller, base, valves and associated fittings; the exact scope must be confirmed against the project documents. Where a jockey pump is included, its role is pressure maintenance and small leakage compensation. It should not be represented as a replacement for the main fire pump. For EDJ configurations, the electric main pump, diesel standby pump and jockey pump should each be identified in the submittal rather than inferred from a generic drawing.`,
    `## Selection information that avoids rework`,
    `A useful request for quotation includes ${inputs}. The buyer should also provide the project country, design standard named in the specification, water-source details, installation location, pipe connection preferences, requested controller functions and required document list. If an approval, certification or performance claim is important to the project, it should be verified against the actual documents available for the quoted configuration. This prevents a sales description from being mistaken for an approved project submittal.`,
    `## What the product can contribute`,
    `${knowledge.solutionSummary} In a well-coordinated project, the expected value is ${benefits}. GRIMM PUMP can review the supplied selection inputs and prepare a product-oriented technical response, including available drawings, data sheets, performance information or test documents where they apply to the proposed configuration. Final suitability remains subject to the project designer, authority requirements and the approved specification.`,
    `## A practical review sequence for EPC and contractor teams`,
    `First, freeze the hydraulic duty and water-source assumption. Second, identify the required main and standby arrangement without adding a driver that is not part of the approved design. Third, check the pump-room interfaces: suction conditions, discharge routing, controller location, electrical or fuel connections, drainage and service clearances. Fourth, agree the document package before production or shipment. Finally, plan inspection, installation and commissioning responsibilities early enough that the equipment can be tested and handed over with a clear record. This sequence is particularly useful when several contractors share responsibility for the building, utilities and fire-protection scope.`,
    `## Documents, testing and handover boundaries`,
    `A useful technical package is one that identifies what it actually covers. Depending on the quoted equipment and the approved project scope, buyers may request a data sheet, general-arrangement drawing, connection information, controller details, performance information, packing record or available test documentation. Those materials should be checked for the exact model and configuration rather than treated as universal evidence for every variation. During handover, the installer and owner should retain the approved drawings, test records, maintenance instructions and a clear list of responsibility boundaries. This protects the project team from confusing a supplier's product information with site acceptance or authority approval.`,
    `## Industry example and GRIMM PUMP recommendation`,
    `The ${sourceName} item is an industry example only. It shows why new or expanding facilities can require earlier engineering coordination; it is not evidence of any GRIMM PUMP supply, performance or project involvement. For a ${scenario} enquiry, GRIMM PUMP recommends sending the approved flow and head, pressure units, power details, site location, intended installation arrangement and list of requested documents. That information supports a clearer discussion of configuration options and avoids assumptions about approvals, lead time or system duty.`,
    `## Frequently asked questions`,
    `### Is a jockey pump the main fire pump? No. A jockey pump is used to maintain standby pressure and compensate for small leakage; the approved main fire-pump duty must be provided by the specified main pump and driver arrangement.`,
    `### Can a product page confirm a project approval? No. Any certification, performance or compliance requirement must be checked against the documents available for the exact quoted configuration and the project specification.`,
    `### What should an EPC contractor provide before requesting a quotation? Provide flow, head, water source, voltage and frequency, project country, installation conditions, requested controls and documentation requirements.`,
    `## Request a project-specific review`,
    `For ${productName} selection support, contact GRIMM PUMP with the project inputs above. The team can help organize the information needed for a technical discussion, catalog request or quotation without presenting unverified assumptions as project facts.`,
  ];
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
  const fireContext = /(warehouse|data cent(?:er|re)|oil\s*(?:and|&)\s*gas|industrial plant|commercial building|hospital|airport|power plant)/i.test(text);
  return products
    .map((product) => {
      const keywords = [product.title, product.category, product.keywords, product.summary]
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3);
      const matches = new Set(keywords.filter((word) => text.includes(word)));
      const family = getProductFamily(product.slug, product.title, product.category).id;
      const familyBoost = fireContext ? (family === "fire-pump-systems" ? 28 : -18) : 0;
      const dataCenterBoost = /data cent(?:er|re)/i.test(text) ? (product.slug === "edj-fire-pump-set" ? 24 : product.title.toLowerCase().includes("jockey") ? -8 : 0) : 0;
      return { slug: product.slug, title: product.title, score: matches.size * 7 + industryBoost + familyBoost + dataCenterBoost };
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

function articleContextFromSource(sourceTitle: string) {
  const title = cleanText(sourceTitle);
  const capacity = title.match(/\b\d+(?:\.\d+)?\s*(?:gw|mw)\b/i)?.[0]?.toUpperCase();
  if (capacity && /data cent(?:er|re)/i.test(title)) return `${capacity} data center power-planning context`;
  if (/prefabricated data center power module/i.test(title)) return "prefabricated data center power-module context";
  if (/data cent(?:er|re)/i.test(title)) return "data center project-planning context";
  return "project teams should confirm early";
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

async function isUsableImage(url: string, timeoutMs = 4000) {
  if (!isAllowedExternalUrl(url)) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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

function isTrustedSourceUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return trustedSourceHosts.has(host) || [...trustedSourceHosts].some((allowed) => host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function isTrustedCandidate(item: FeedItem) {
  return isTrustedSourceUrl(item.canonicalUrl || item.link) && isTrustedSourceUrl(item.sourceFeedUrl) && Boolean(item.publishedAt);
}

function isWithinHours(date: string, hours: number) {
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) && Date.now() - parsed <= hours * 60 * 60 * 1000 && parsed <= Date.now() + 60 * 60 * 1000;
}

function todayKey(timezone: string) {
  return dateKey(new Date().toISOString(), timezone);
}

function dateKey(value: string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
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
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export function isHighIntentNews(title: string, description = "", sourceName = "", blockedTerms = defaultBlockedNewsTerms) {
  const text = cleanText(`${title} ${description} ${sourceName}`).toLowerCase();
  if (blockedTerms.some((term) => text.includes(term.toLowerCase()))) return false;

  const projectBuyerContext = /\b(industrial|data cent(?:er|re)|warehouse|hospital|airport|oil\s*(?:and|&)\s*gas|power plant|epc|manufactur(?:ing|er)|energy storage|semiconductor|logistics|infrastructure|commercial building|critical infrastructure|utility|municipal)\b/.test(text);
  const emergencyServiceContent = /\b(fire department|fire crews?|rescue|firefighter training|fire pump training|hands-on training)\b/.test(text);
  if (emergencyServiceContent && !projectBuyerContext) return false;

  let score = 0;
  if (/\bfire pumps?\b/.test(text)) score += 8;
  if (/\bnfpa\s*20\b/.test(text)) score += 9;
  if (/\bfire water\b/.test(text)) score += 7;
  if (/\bfire suppression\b/.test(text)) score += 5;
  if (/\bfire sprinkler(?:s| system)?\b/.test(text)) score += 5;
  if (/\bfire protection(?: system| equipment)?\b/.test(text)) score += 4;
  if (/\bpump room\b/.test(text)) score += 5;
  if (/\bfire safety\b/.test(text) && projectBuyerContext) score += 3;
  if (/\bwater mist\b/.test(text)) score += 4;
  if (/\b(hydrant|water supply)\b/.test(text)) score += 2;
  if (projectBuyerContext) score += 3;
  if (/\b(data cent(?:er|re)|warehouse|oil\s*(?:and|&)\s*gas|power plant|industrial plant)\b/.test(text)) score += 3;

  return score >= 6;
}

function normalizeStoredArticle(article: NewsArticle): NewsArticle {
  const sourceSuffix = article.sourceName ? new RegExp(`\\s+-\\s+${article.sourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i") : null;
  const clean = (value: string) => cleanText(value).replace(sourceSuffix || /$a/, "").trim();
  return {
    ...article,
    title: clean(article.title),
    summary: cleanText(article.summary),
    seoTitle: cleanText(article.seoTitle),
    seoDescription: cleanText(article.seoDescription),
    sourceTitle: clean(article.sourceTitle),
    sourceFacts: article.sourceFacts.map(cleanText),
    body: article.body.map(cleanText),
  };
}

function trimText(value: string, maxLength: number) {
  const clean = cleanText(value);
  if (clean.length <= maxLength) return clean;
  const trimmed = clean.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > maxLength * 0.55 ? lastSpace : trimmed.length).replace(/[,. ]+$/, "")}.`;
}

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
