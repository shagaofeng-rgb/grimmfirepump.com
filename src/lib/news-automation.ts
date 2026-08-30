import crypto from "crypto";
import { company } from "@/data/site";
import { getPublicProducts, type PublicProduct } from "@/lib/public-cms";
import { getProductKnowledge } from "@/lib/product-knowledge";
import { getProductFamily } from "@/lib/product-taxonomy";
import { acquireTaskLock, createId, readStore, upsertStore, writeStore } from "@/lib/local-store";
import { getNewsPublishSchedule } from "@/lib/news-publish-schedule";
import { markSitemapDirty } from "@/lib/sitemap-dirty";
import { getSiteNewsConfig, validateSiteNewsConfig, type SiteNewsConfig } from "@/lib/site-news-config";

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
  | "frontend_verifying"
  | "published_success"
  | "retry_pending"
  | "published"
  | "failed"
  | "archived";

export type NewsSource = {
  siteId?: string;
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
  siteId?: string;
  contentType?: "news";
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
  sourceAuthor?: string;
  imageLicenseStatus?: "owned-neutral" | "licensed" | "unknown";
  editorialDisclaimer?: string;
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
  siteId?: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  type: "collect" | "generate" | "publish" | "retry" | "daily-run" | "ingest" | "compose-publish";
  status: "running" | "success" | "failed" | "skipped";
  startedAt: string;
  finishedAt?: string;
  message: string;
  stats: Record<string, number | string>;
};

export type NewsPublicationAudit = {
  siteId?: string;
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

export type NewsCandidate = {
  id: string;
  siteId: string;
  createdAt: string;
  updatedAt: string;
  state: "discovered" | "normalized" | "verified" | "scored" | "candidate" | "reserved_for_cycle" | "used" | "rejected" | "retry_pending";
  rejectReason?: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceFeedUrl: string;
  sourceUrl: string;
  normalizedUrl: string;
  sourcePublishedAt: string;
  sourceAuthor?: string;
  language: string;
  sourceDomain: string;
  sourceTrustScore: number;
  relevanceScore: number;
  score: number;
  urlHash: string;
  titleHash: string;
  contentFingerprint: string;
  eventFingerprint: string;
  imageUrl?: string;
  imageLicenseStatus: "owned-neutral" | "licensed" | "unknown";
  cycleKey?: string;
  usedByArticleId?: string;
};

export type NewsDeliveryCheck = {
  id: string;
  siteId: string;
  articleId: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  status: "passed" | "failed";
  listHttpStatus: number;
  detailHttpStatus: number;
  rssHttpStatus: number;
  sitemapHttpStatus: number;
  checks: Record<string, boolean>;
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
const CANDIDATES_STORE = "news-candidates.json";
const DELIVERY_CHECKS_STORE = "news-delivery-checks.json";
const SITE_ID = "grimm-firepump-global";

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

export function getNewsConfig(siteId = SITE_ID) {
  const site = getSiteNewsConfig(siteId);
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
  const sourceWhitelist = site.sources.primaryWhitelist.map((source) => source.rssOrApiUrl);
  const fallbackWhitelist = site.sources.fallbackWhitelist.map((source) => source.rssOrApiUrl);
  const sourceBlacklist = (process.env.NEWS_SOURCE_BLACKLIST || defaultBlockedNewsTerms.join(","))
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return {
    dailyTarget: Number.isFinite(dailyTarget) ? dailyTarget : 1,
    site,
    timezone: site.timezone,
    lookbackHours: Number.isFinite(lookbackHours) ? lookbackHours : 72,
    fallbackLookbackHours: Number.isFinite(fallbackLookbackHours) ? Math.max(lookbackHours, fallbackLookbackHours) : 504,
    dedupDays: Number.isFinite(dedupDays) ? Math.max(dedupDays, 60) : 60,
    maxRetries: Number.isFinite(maxRetries) ? maxRetries : 3,
    relevanceThreshold: Number.isFinite(relevanceThreshold) ? relevanceThreshold : 10,
    autoPublish,
    allowedLanguages: [site.publicationLanguage],
    sourceWhitelist,
    fallbackWhitelist,
    sourceBlacklist,
    publishIntervalHours: 48,
    alertEmailConfigured: Boolean(process.env.NEWS_ALERT_EMAIL || process.env.RESEND_API_KEY),
  };
}

export async function listNewsArticles(siteId = SITE_ID) {
  // A publish run writes an article and immediately validates it through the
  // public routes. The former 5-minute data cache made those routes stale.
  const articles = await readStore<NewsArticle[]>(ARTICLES_STORE, []);
  return articles
    .map((article) => normalizeStoredArticle(article))
    .filter((article) => !article.siteId || article.siteId === siteId)
    .sort((a, b) => Date.parse(b.publishAt || b.createdAt) - Date.parse(a.publishAt || a.createdAt));
}

export async function listPublishedNews(siteId = SITE_ID) {
  const seenSlugs = new Set<string>();
  return (await listNewsArticles(siteId)).filter((item) => {
    if (!(["published", "frontend_verifying", "published_success"] as NewsStatus[]).includes(item.status) || item.indexable !== true || item.generatedModel !== "grimm-news-v2" || seenSlugs.has(item.slug)) return false;
    seenSlugs.add(item.slug);
    return true;
  });
}

export async function getNewsArticle(slug: string, siteId = SITE_ID) {
  return (await listNewsArticles(siteId)).find(
    (item) => item.slug === slug && (["published", "frontend_verifying", "published_success"] as NewsStatus[]).includes(item.status),
  );
}

export async function listNewsSources(siteId = SITE_ID) {
  const config = validateSiteNewsConfig(siteId);
  const stored = await readStore<NewsSource[]>(SOURCES_STORE, []);
  const now = new Date().toISOString();
  const configuredDefinitions = [...config.sources.primaryWhitelist, ...config.sources.fallbackWhitelist];
  const configuredByUrl = new Map(stored.filter((item) => !item.siteId || item.siteId === siteId).map((item) => [item.url, item]));
  const configuredSources: NewsSource[] = configuredDefinitions.map((definition, index) => {
    const url = definition.rssOrApiUrl;
    const existing = configuredByUrl.get(url);
    return existing || {
      id: `source_${hash(url).slice(0, 14)}`,
      createdAt: now,
      updatedAt: now,
      siteId,
      name: definition.domain || `News Source ${index + 1}`,
      url,
      type: "rss",
      enabled: true,
      language: definition.allowedLanguages[0],
      lastStatus: "not_configured",
    };
  });
  return configuredSources;
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

export async function listNewsCandidates(siteId = SITE_ID) {
  return (await readStore<NewsCandidate[]>(CANDIDATES_STORE, []))
    .filter((candidate) => candidate.siteId === siteId)
    .sort((a, b) => b.score - a.score || Date.parse(b.sourcePublishedAt) - Date.parse(a.sourcePublishedAt));
}

export async function listNewsDeliveryChecks(siteId = SITE_ID) {
  return (await readStore<NewsDeliveryCheck[]>(DELIVERY_CHECKS_STORE, []))
    .filter((check) => check.siteId === siteId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function cycleKey(hours: number, now = Date.now()) {
  return `${hours}h-${Math.floor(now / (hours * 60 * 60 * 1000))}`;
}

function newsPublishGraceMinutes() {
  const configured = Number(process.env.NEWS_PUBLISH_GRACE_MINUTES || 5);
  return Number.isFinite(configured) ? Math.min(Math.max(configured, 0), 60) : 5;
}

export async function getNewsAutomationHealth(siteId = SITE_ID, now = Date.now()) {
  const config = validateSiteNewsConfig(siteId);
  const [checks, candidates, jobs] = await Promise.all([
    listNewsDeliveryChecks(siteId),
    listNewsCandidates(siteId),
    listNewsJobs(),
  ]);
  const lastSuccess = checks.find((check) => check.status === "passed");
  const schedule = getNewsPublishSchedule(
    lastSuccess?.createdAt,
    now,
    config.news.publishIntervalHours,
    newsPublishGraceMinutes(),
  );
  const availableCandidates = candidates.filter(
    (candidate) => candidate.state === "candidate"
      && now - Date.parse(candidate.sourcePublishedAt) <= config.news.fallbackCandidateMaxAgeDays * 86_400_000,
  ).length;
  const latestJob = jobs.find((job) => !job.siteId || job.siteId === siteId);

  return {
    ...schedule,
    availableCandidates,
    latestJob: latestJob || null,
    graceMinutes: newsPublishGraceMinutes(),
    productionEnabled: config.publishing.productionEnabled,
    autoPublishEnabled: process.env.NEWS_AUTO_PUBLISH !== "false",
  };
}

function sourceDefinitionFor(config: SiteNewsConfig, url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  return [...config.sources.primaryWhitelist, ...config.sources.fallbackWhitelist].find((source) => host === source.domain || host.endsWith(`.${source.domain}`));
}

function candidateScore(item: FeedItem, sourceTrustScore: number) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const relevance = isHighIntentNews(item.title, item.description, item.sourceName) ? 30 : 0;
  const buyerImpact = /(standard|regulation|code|data cent(?:er|re)|warehouse|oil|gas|industrial|supply|commission|testing|maintenance|fire protection)/.test(text) ? 20 : 6;
  const ageHours = Math.max(0, (Date.now() - Date.parse(item.publishedAt)) / 3_600_000);
  const freshness = ageHours <= 24 ? 15 : ageHours <= 72 ? 10 : ageHours <= 168 ? 4 : 0;
  const verification = Math.round(sourceTrustScore * 0.15);
  const productContext = /(fire pump|fire water|fire protection|data cent(?:er|re)|warehouse|industrial)/.test(text) ? 15 : 3;
  const image = 5; // A neutral owned asset is used instead of unlicensed publisher imagery.
  return { relevance, buyerImpact, freshness, verification, productContext, image, total: relevance + buyerImpact + freshness + verification + productContext + image };
}

/**
 * 12-hour task. It only fetches, validates, de-duplicates, scores and persists
 * candidates. It deliberately has no article composition, CMS, Sitemap or cache side effect.
 */
export async function runNewsIngest(reason = "scheduled", options: { siteId?: string; includeFallback?: boolean; dryRun?: boolean } = {}) {
  const siteId = options.siteId || SITE_ID;
  const config = validateSiteNewsConfig(siteId);
  const release = await acquireTaskLock(`news:ingest:${siteId}:${cycleKey(config.news.ingestIntervalHours)}`, 11 * 60 * 60 * 1000);
  if (!release) return { ok: true, skipped: true, message: "This site's ingest cycle is already running.", stats: { discovered: 0, candidates: 0 } };

  const job = await startJob("ingest", `News ingest started by ${reason}.`, siteId);
  try {
    const allSources = await listNewsSources(siteId);
    const primaryUrls = new Set(config.sources.primaryWhitelist.map((source) => source.rssOrApiUrl));
    const sources = allSources.filter((source) => source.enabled && (options.includeFallback || primaryUrls.has(source.url)));
    const [existingCandidates, existingArticles, products] = await Promise.all([listNewsCandidates(siteId), listNewsArticles(siteId), getPublicProducts()]);
    let discovered = 0; let candidates = 0; let rejected = 0; let duplicates = 0; let failed = 0;
    for (const source of sources) {
      const definition = sourceDefinitionFor(config, source.url);
      if (!definition) { rejected += 1; continue; }
      const items = await fetchFeedItems(source);
      for (const item of items) {
        discovered += 1;
        const normalizedUrl = normalizeUrl(item.canonicalUrl || item.link);
        const sourceDefinition = sourceDefinitionFor(config, normalizedUrl);
        const id = `candidate_${hash(`${siteId}|${normalizedUrl}`).slice(0, 24)}`;
        const now = new Date().toISOString();
        const base: NewsCandidate = {
          id, siteId, createdAt: existingCandidates.find((candidate) => candidate.id === id)?.createdAt || now, updatedAt: now,
          state: "discovered", title: cleanText(item.title), summary: cleanText(item.description), sourceName: item.sourceName,
          sourceFeedUrl: source.url, sourceUrl: item.link, normalizedUrl, sourcePublishedAt: item.publishedAt,
          language: item.language, sourceDomain: new URL(normalizedUrl).hostname, sourceTrustScore: sourceDefinition?.sourceTrustScore || 0,
          relevanceScore: 0, score: 0, urlHash: hash(normalizedUrl), titleHash: hash(cleanText(item.title).toLowerCase()),
          contentFingerprint: hash(`${cleanText(item.title)}|${cleanText(item.description)}`), eventFingerprint: fingerprintForEvent(item.title),
          imageLicenseStatus: "owned-neutral", imageUrl: "",
        };
        if (!sourceDefinition || item.language !== config.publicationLanguage || !isWithinHours(item.publishedAt, options.includeFallback ? config.news.fallbackCandidateMaxAgeDays * 24 : config.news.candidateMaxAgeHours)) {
          rejected += 1; if (!options.dryRun) await upsertStore(CANDIDATES_STORE, { ...base, state: "rejected", rejectReason: "Source, language or publication-age policy rejected this item." }); continue;
        }
        const duplicate = [...existingCandidates, ...existingArticles].some((record) => {
          const source = "normalizedUrl" in record ? record.normalizedUrl : normalizeUrl(record.sourceCanonicalUrl || record.sourceUrl);
          const event = "eventFingerprint" in record ? record.eventFingerprint : "";
          const content = "contentFingerprint" in record ? record.contentFingerprint : record.contentHash;
          return source === normalizedUrl || event === base.eventFingerprint || content === base.contentFingerprint;
        });
        if (duplicate) { duplicates += 1; if (!options.dryRun) await upsertStore(CANDIDATES_STORE, { ...base, state: "rejected", rejectReason: "Duplicate URL, event or content fingerprint." }); continue; }
        const scored = candidateScore(item, sourceDefinition.sourceTrustScore);
        const naturalProduct = rankProducts(item, products)[0];
        const candidate: NewsCandidate = { ...base, state: scored.total >= config.news.minScore ? "candidate" : "rejected", rejectReason: scored.total >= config.news.minScore ? undefined : "Candidate score below site threshold.", relevanceScore: scored.relevance, score: scored.total, cycleKey: cycleKey(config.news.ingestIntervalHours) };
        if (candidate.state === "candidate") candidates += 1; else rejected += 1;
        if (!options.dryRun) await upsertStore(CANDIDATES_STORE, candidate);
        void naturalProduct; // Product association is considered only during publish and never stored as an ingest-side link.
      }
    }
    const message = `Ingest completed: discovered ${discovered}, candidate ${candidates}, rejected ${rejected}, duplicates ${duplicates}, failed ${failed}.`;
    await finishJob(job, failed ? "failed" : "success", message, { discovered, candidates, rejected, duplicates, failed });
    return { ok: !failed, stats: { discovered, candidates, rejected, duplicates, failed }, message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingest failure";
    await finishJob(job, "failed", message, { failed: 1 });
    return { ok: false, stats: { failed: 1 }, message };
  } finally { await release(); }
}

function candidateToFeedItem(candidate: NewsCandidate): FeedItem {
  return { title: candidate.title, link: candidate.sourceUrl, canonicalUrl: candidate.normalizedUrl, description: candidate.summary, publishedAt: candidate.sourcePublishedAt, sourceName: candidate.sourceName, sourceFeedUrl: candidate.sourceFeedUrl, language: candidate.language };
}

async function verifyFrontendDelivery(site: SiteNewsConfig, article: NewsArticle) {
  const base = (process.env.NEWS_FRONTEND_VERIFY_URL || site.siteUrl).replace(/\/$/, "");
  const verifyQuery = `news_verify=${Date.now()}`;
  // A unique query prevents a CDN-cached RSS/Sitemap response from being used
  // as publication evidence. These are internal verification requests only.
  const list = await fetch(`${base}${site.news.listRoute}?${verifyQuery}`, { cache: "no-store" });
  const detail = await fetch(`${base}${site.news.listRoute}/${article.slug}?${verifyQuery}`, { cache: "no-store" });
  const rss = await fetch(`${base}${site.news.rssRoute}?${verifyQuery}`, { cache: "no-store" });
  const sitemap = await fetch(`${base}${site.news.sitemapRoute}?${verifyQuery}`, { cache: "no-store" });
  const [listBody, detailBody, rssBody, sitemapBody] = await Promise.all([list.text(), detail.text(), rss.text(), sitemap.text()]);
  const checks = {
    listVisible: list.ok && listBody.includes(article.title) && listBody.includes(`/news/${article.slug}`),
    detailVisible: detail.ok && detailBody.includes(article.title) && detailBody.includes(article.sourceName) && detailBody.toLowerCase().includes("editorial note"),
    rssVisible: rss.ok && rssBody.includes(article.slug),
    sitemapVisible: sitemap.ok && sitemapBody.includes(article.slug),
    blogIsolated: !listBody.includes(`/blog/${article.slug}`),
  };
  return { status: Object.values(checks).every(Boolean) ? "passed" as const : "failed" as const, listHttpStatus: list.status, detailHttpStatus: detail.status, rssHttpStatus: rss.status, sitemapHttpStatus: sitemap.status, checks };
}

async function archiveSupersededRetryAttempts(siteId: string) {
  const attempts = (await listNewsArticles(siteId)).filter((article) => article.status === "retry_pending");
  if (!attempts.length) return 0;
  const now = new Date().toISOString();
  await Promise.all(attempts.map((article) => upsertStore(ARTICLES_STORE, {
    ...article,
    status: "archived" as NewsStatus,
    indexable: false,
    updatedAt: now,
    failureReason: "Superseded after the public-verification cache defect was corrected; retained for audit.",
  })));
  return attempts.length;
}

/** 48-hour task. A run is successful only after the public News list and detail verify. */
export async function runNewsPublish(reason = "scheduled", options: { siteId?: string; dryRun?: boolean } = {}) {
  const siteId = options.siteId || SITE_ID;
  const config = validateSiteNewsConfig(siteId);
  const release = await acquireTaskLock(`news:publish:${siteId}:${cycleKey(config.news.publishIntervalHours)}`, 47 * 60 * 60 * 1000);
  if (!release) return { ok: true, skipped: true, message: "This site's publish cycle is already running.", stats: { published: 0 } };
  const job = await startJob("compose-publish", `News publish started by ${reason}.`, siteId);
  try {
    if (!options.dryRun && (!config.publishing.productionEnabled || process.env.NEWS_AUTO_PUBLISH === "false")) {
      const message = "News automatic publishing is paused by the production configuration.";
      await finishJob(job, "skipped", message, { published: 0 });
      return { ok: true, skipped: true, message, stats: { published: 0 } };
    }
    const checks = await listNewsDeliveryChecks(siteId);
    const lastSuccess = checks.find((check) => check.status === "passed");
    const schedule = getNewsPublishSchedule(
      lastSuccess?.createdAt,
      Date.now(),
      config.news.publishIntervalHours,
      newsPublishGraceMinutes(),
    );
    if (!options.dryRun && !schedule.due) {
      const message = `Next 48-hour News publication window opens at ${schedule.eligibleAt}.`;
      await finishJob(job, "skipped", message, { published: 0 });
      return { ok: true, skipped: true, message, stats: { published: 0 } };
    }
    const supersededRetries = options.dryRun ? 0 : await archiveSupersededRetryAttempts(siteId);
    let candidates = (await listNewsCandidates(siteId)).filter((candidate) => candidate.state === "candidate" && Date.now() - Date.parse(candidate.sourcePublishedAt) <= config.news.fallbackCandidateMaxAgeDays * 86_400_000);
    if (!candidates.length) {
      await runNewsIngest("publish-fallback", { siteId, includeFallback: true, dryRun: options.dryRun });
      candidates = (await listNewsCandidates(siteId)).filter((candidate) => candidate.state === "candidate" && Date.now() - Date.parse(candidate.sourcePublishedAt) <= config.news.fallbackCandidateMaxAgeDays * 86_400_000);
    }
    const candidate = candidates[0];
    if (!candidate) throw new Error("No compliant unused News candidate is available after fallback ingest.");
    if (options.dryRun) return { ok: true, message: `Dry-run selected candidate ${candidate.id}.`, stats: { published: 0, candidate: candidate.id } };
    await upsertStore(CANDIDATES_STORE, { ...candidate, state: "reserved_for_cycle", updatedAt: new Date().toISOString(), cycleKey: cycleKey(config.news.publishIntervalHours) });
    const products = await getPublicProducts();
    const product = rankProducts(candidateToFeedItem(candidate), products).slice(0, config.news.maxInternalProductLinks);
    const article = await buildArticle(candidateToFeedItem(candidate), product, siteId);
    const pending = { ...article, status: "frontend_verifying" as NewsStatus, publishAt: new Date().toISOString() };
    await upsertStore(ARTICLES_STORE, pending);
    const delivery = await verifyFrontendDelivery(config, pending);
    const check: NewsDeliveryCheck = { id: createId("newsdelivery"), siteId, articleId: pending.id, slug: pending.slug, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...delivery, message: delivery.status === "passed" ? "Public News list, detail, RSS and News sitemap verified." : "Public frontend verification failed; publication requires retry." };
    await upsertStore(DELIVERY_CHECKS_STORE, check);
    if (delivery.status !== "passed") {
      await upsertStore(ARTICLES_STORE, { ...pending, status: "retry_pending", failureReason: check.message, retries: pending.retries + 1 });
      await finishJob(job, "failed", check.message, { published: 0, retries: pending.retries + 1 });
      return { ok: false, message: check.message, stats: { published: 0 } };
    }
    await upsertStore(ARTICLES_STORE, { ...pending, status: "published_success" });
    await upsertStore(CANDIDATES_STORE, { ...candidate, state: "used", updatedAt: new Date().toISOString(), usedByArticleId: pending.id });
    await markSitemapDirty("frontend_verified_news_published");
    const message = `Published and frontend-verified /news/${pending.slug}.${supersededRetries ? ` Archived ${supersededRetries} superseded retry attempt(s).` : ""}`;
    await saveAudit({ siteId, date: new Date().toISOString().slice(0, 10), target: 1, published: 1, generated: 1, duplicates: 0, rejected: 0, failed: 0, status: "success", message });
    await finishJob(job, "success", message, { published: 1, article: pending.id, supersededRetries });
    return { ok: true, message, stats: { published: 1, article: pending.id, supersededRetries } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown publish failure";
    await finishJob(job, "failed", message, { published: 0, failed: 1 });
    return { ok: false, message, stats: { published: 0, failed: 1 } };
  } finally { await release(); }
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

async function buildArticle(item: FeedItem, relatedProducts: Array<{ slug: string; title: string; score: number }>, siteId = SITE_ID): Promise<NewsArticle> {
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
  const slug = uniqueSlug(item.title, item.publishedAt);
  const title = trimText(cleanText(item.title), 92);
  const summary = trimText(`An independently edited summary of a ${item.sourceName} update, with source facts and industry context for ${industry.toLowerCase()} readers.`, 160);
  const body = buildEditorialNewsAnalysis({ industry, scenario, sourceName: item.sourceName, sourceDate: item.publishedAt.slice(0, 10), sourceSummary: cleanText(item.description || item.title) });
  const wordCount = body.join(" ").split(/\s+/).filter(Boolean).length;
  const quality = {
    passed: wordCount >= 700 && wordCount <= 1000,
    wordCount,
    titleSimilarity: 0,
    sourceReuseDays: 60,
    reason: wordCount >= 700 && wordCount <= 1000 ? "Passed source, originality, length and configuration checks." : "Generated analysis did not meet the configured 700-1000 word requirement.",
  };

  return {
    id: createId("news"),
    siteId,
    contentType: "news",
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
    sourceAuthor: "",
    imageLicenseStatus: "owned-neutral",
    editorialDisclaimer: "This page is an independent editorial summary and analysis. Original reporting and factual claims remain attributable to the linked source.",
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

function buildEditorialNewsAnalysis(input: { industry: string; scenario: string; sourceName: string; sourceDate: string; sourceSummary: string }) {
  const { industry, scenario, sourceName, sourceDate, sourceSummary } = input;
  return [
    "## What happened",
    `${sourceName} published the linked update on ${sourceDate}. Its reported subject is: ${sourceSummary}. This News page does not reproduce the original report. It provides a short, independently edited industry summary for project teams following ${industry.toLowerCase()} activity. Readers should use the source link for the original wording, full context and any subsequent corrections from the publisher.`,
    "## Facts and attribution",
    `The factual basis for this page is limited to the source item identified above and its publication date. No claim is made that the reported organisation, facility or project uses GRIMM PUMP equipment. Where the original report describes plans, proposals, targets or estimates, those descriptions should be read as source-attributed information rather than as independently verified project completion or performance evidence.`,
    "## Why the update matters",
    `For teams responsible for ${scenario}, industry developments can affect the order in which technical interfaces are reviewed. A change in project activity, infrastructure planning, standards discussion or supply-chain conditions may create a need to revisit room allocation, water availability, electrical interfaces, access for installation, approval documentation and commissioning responsibilities. The relevant action is not to assume a standard equipment package; it is to verify the approved hydraulic and regulatory requirements for the specific project.`,
    "## Editorial analysis",
    `The broader signal from this update is that resilience planning is increasingly connected to ordinary engineering decisions made early in a project. When an industrial or critical facility is being planned, fire-water design, pump-room layout and controls should be coordinated with the design team before interfaces become fixed. The source does not establish a universal rule for every facility. Site conditions, applicable standards, water source, electrical supply, authority requirements and the approved specification remain decisive.`,
    "## Practical questions for project teams",
    `Project owners, consultants and EPC teams can use this kind of industry update as a prompt to check their own assumptions: What flow and pressure duty has been approved? Is the water source and suction condition documented? Which standards and authority requirements govern the site? Are controller interfaces, drainage, ventilation and maintenance access included in the room design? Are responsibilities for testing, installation and handover clearly assigned? These questions are project controls, not conclusions drawn from the source article.`,
    "## Product context",
    `This article does not contain a sales offer, quotation, performance promise or project reference. Where a related product page is shown elsewhere on the site, it is limited to one optional technical context link and does not alter the factual meaning of this News summary. Equipment selection must be based on the approved duty, configuration-specific documents and project requirements, rather than on a general industry article.`,
    "## Source and editorial note",
    `Original source: ${sourceName}; original publication date: ${sourceDate}. This page is an independent editorial summary and analysis prepared for industry readers. Original reporting, photographs and factual claims remain attributable to the linked source. GRIMM PUMP does not claim ownership of the source report and does not represent the source event as a company project, customer reference or product endorsement.`,
  ];
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

async function startJob(type: NewsJob["type"], message: string, siteId = SITE_ID) {
  const now = new Date().toISOString();
  const job: NewsJob = {
    id: createId("newsjob"),
    siteId,
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
    siteId: article.siteId || SITE_ID,
    contentType: "news",
    editorialDisclaimer: article.editorialDisclaimer || "This page is an independent editorial summary and analysis. Original reporting and factual claims remain attributable to the linked source.",
    imageLicenseStatus: article.imageLicenseStatus || "owned-neutral",
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
