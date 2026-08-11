import { z } from "zod";

const sourceSchema = z.object({
  domain: z.string().min(3),
  type: z.enum(["regulator", "standards-body", "trade-media", "research-institute", "manufacturer-newsroom"]),
  allowedTopics: z.array(z.string()).min(1),
  allowedLanguages: z.array(z.string()).min(1),
  rssOrApiUrl: z.string().url(),
  sourceTrustScore: z.number().min(0).max(100),
});

const siteSchema = z.object({
  siteId: z.string().min(3),
  enabled: z.boolean(),
  brandName: z.string().min(2),
  siteUrl: z.string().url(),
  industry: z.string().min(2),
  industryScope: z.string().min(40),
  targetMarkets: z.array(z.string()).min(1),
  publicationLanguage: z.string().min(2),
  locale: z.string().min(2),
  timezone: z.string().min(2),
  news: z.object({
    enabled: z.boolean(),
    listRoute: z.string().startsWith("/"),
    detailRoutePattern: z.string().startsWith("/"),
    rssRoute: z.string().startsWith("/"),
    sitemapRoute: z.string().startsWith("/"),
    desiredWordCount: z.object({ min: z.number().int().min(700), max: z.number().int().max(1000) }),
    ingestIntervalHours: z.literal(12),
    publishIntervalHours: z.literal(48),
    candidateMaxAgeHours: z.number().int().positive(),
    fallbackCandidateMaxAgeDays: z.number().int().positive(),
    minScore: z.number().int().min(0).max(100),
    maxInternalProductLinks: z.literal(1),
    defaultAuthorType: z.string().min(2),
  }),
  blog: z.object({
    enabled: z.boolean(),
    listRoute: z.string().startsWith("/"),
    detailRoutePattern: z.string().startsWith("/"),
    sitemapRoute: z.string().startsWith("/"),
    contentSource: z.string().min(2),
    allowNewsAutomation: z.literal(false),
  }),
  productThemePlan: z.object({
    sourceType: z.enum(["cms_collection", "database", "yaml"]),
    sourceReference: z.string().min(2),
    requiredFields: z.array(z.string()).min(1),
  }),
  sources: z.object({ primaryWhitelist: z.array(sourceSchema).min(1), fallbackWhitelist: z.array(sourceSchema).min(1) }),
  publishing: z.object({
    cmsAdapter: z.string().min(2),
    contentStatusAfterPublish: z.literal("published"),
    requireFrontendVerification: z.literal(true),
    alertChannel: z.string().min(2),
    productionEnabled: z.boolean(),
  }),
});

export type SiteNewsConfig = z.infer<typeof siteSchema>;

// This is the single configuration boundary for the current site. Workers must
// receive a siteId and must not derive a destination from an arbitrary domain.
const configuredSites = [
  {
    siteId: "grimm-firepump-global",
    enabled: true,
    brandName: "GRIMM PUMP",
    siteUrl: "https://www.grimmfirepump.com",
    industry: "Industrial fire pumps and fire-water systems",
    industryScope: "UL/FM fire pump packages, diesel and electric fire pumps, jockey pumps, fire-water systems, pump rooms, NFPA 20, data centers, warehouses, oil and gas, industrial facilities, EPC procurement, commissioning, maintenance and supply-chain risks. Excludes consumer fire incidents, wildfire, emergency response and unrelated water topics.",
    targetMarkets: ["US", "EU", "Middle East", "Southeast Asia", "Africa", "South America"],
    publicationLanguage: "en",
    locale: "en-US",
    timezone: "Asia/Shanghai",
    news: {
      enabled: true, listRoute: "/news", detailRoutePattern: "/news/[slug]", rssRoute: "/news/rss.xml", sitemapRoute: "/news-sitemap.xml",
      desiredWordCount: { min: 700, max: 1000 }, ingestIntervalHours: 12, publishIntervalHours: 48,
      candidateMaxAgeHours: 72, fallbackCandidateMaxAgeDays: 7, minScore: 70, maxInternalProductLinks: 1, defaultAuthorType: "Editorial Team",
    },
    blog: { enabled: true, listRoute: "/blog", detailRoutePattern: "/blog/[slug]", sitemapRoute: "/blog-sitemap.xml", contentSource: "cms-news.json (legacy Blog collection)", allowNewsAutomation: false },
    productThemePlan: { sourceType: "cms_collection", sourceReference: "cms-products.json", requiredFields: ["theme_id", "product_url", "product_name", "start_at", "end_at", "status"] },
    sources: {
      primaryWhitelist: [{ domain: "datacenterdynamics.com", type: "trade-media", allowedTopics: ["data center", "critical infrastructure"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.datacenterdynamics.com/en/rss/", sourceTrustScore: 85 }],
      fallbackWhitelist: [{ domain: "nfpa.org", type: "standards-body", allowedTopics: ["fire protection", "standards"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.nfpa.org/news-blogs-and-articles", sourceTrustScore: 95 }],
    },
    publishing: { cmsAdapter: "lead_store_news_articles", contentStatusAfterPublish: "published", requireFrontendVerification: true, alertChannel: "admin-news-automation", productionEnabled: false },
  },
] as const;

export const siteNewsConfigs = configuredSites.map((value) => siteSchema.parse(value));

export function getSiteNewsConfig(siteId: string) {
  const config = siteNewsConfigs.find((site) => site.siteId === siteId);
  if (!config) throw new Error(`Unknown news site_id: ${siteId}`);
  return config;
}

export function validateSiteNewsConfig(siteId: string) {
  const config = getSiteNewsConfig(siteId);
  if (!config.enabled || !config.news.enabled) throw new Error(`News is disabled for site_id ${siteId}`);
  if (config.blog.allowNewsAutomation) throw new Error(`Blog automation must remain disabled for site_id ${siteId}`);
  return config;
}
