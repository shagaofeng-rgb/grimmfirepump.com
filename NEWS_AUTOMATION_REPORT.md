# GRIMM PUMP News Automation v2 Report

Date: 2026-08-08  
Publication target: `/news` only

## Old automation inventory and retirement

| Item | Previous behavior | v2 status |
| --- | --- | --- |
| `src/lib/news-automation.ts` | Google News search RSS, six-hour schedule, short template posts, external image probing | Replaced in the active path with trusted-source, source-grounded v2 rules and owned product imagery only. |
| `vercel.json` `/api/cron/news` | `0 */6 * * *` | Replaced with `30 1 */2 * *` UTC, corresponding to 09:30 Asia/Manila every two days. |
| `/api/webhook/send_article` and root POST rewrite | Could write automatic content to `/blog` | Retired. Endpoint returns 410 and does not write. |
| Legacy Google News sources | Search aggregation and uncontrolled source domain results | Excluded from the v2 source set. |

Historical News URLs were not deleted. The 19 prior automated entries are retained but marked `noindex` and removed from the v2 News list, RSS and Sitemap until editorial rewrite.

## v2 architecture

1. Read CMS product data and the backend-maintained product keyword knowledge records.
2. Fetch only configured trusted source feeds. Current configured source: Data Center Dynamics RSS.
3. Accept only public items dated within 90 days and from trusted source/feed domains.
4. Match product, industry and scenario; data-center context prioritizes a complete EDJ system rather than a sewage or jockey-only product.
5. Enforce one source reuse per 60 days, 48-hour publish interval, product/industry/scenario deduplication and a single article limit.
6. Generate an original English analysis of 1000-1600 words. The source is explicitly labelled industry context, never a GRIMM PUMP case study.
7. Use a GRIMM-owned product image only; no source-site imagery is copied.
8. Require source, word-count, image and quality checks before publishing.
9. Publish only to `/news`, refresh News cache/Sitemap, and record jobs/audits in the backend.

## Quality and copyright rules

- Maximum two sources is supported; v2 currently uses one source per article.
- A source description is summarized, not copied as article body.
- Product, certification, performance, delivery, project and customer claims are not invented.
- Jockey pumps are described only as pressure-maintenance equipment.
- Every v2 article has article metadata, canonical URL, Article JSON-LD, Breadcrumb JSON-LD, RSS entry, product link and enquiry path.

## Dry-run evidence

Protected local dry-run endpoint: `/api/cron/news?dryRun=1`

Result on 2026-08-08:

```json
{
  "sources": 1,
  "feedItems": 20,
  "freshItems": 20,
  "generated": 1,
  "published": 0,
  "candidate": "EDJ Fire Pump Set planning for Data Centers: what project teams should confirm early",
  "wordCount": 1041,
  "result": "passed; no article stored or published"
}
```

## First publication evidence

The controlled first production-data publication completed from the same qualified source after dry-run:

- Article: `EDJ Fire Pump Set planning for Data Centers: what project teams should confirm early`
- URL: `/news/edj-fire-pump-set-data-centers-planning-2026-08-07`
- Source: Data Center Dynamics, public RSS item; used only as industry context.
- Word count: 1041.
- Product: `edj-fire-pump-set`.
- Image: GRIMM-owned `/assets/synced/products/edj-fire-pump-set.jpg`.
- Publish result: one generated, one published, zero duplicates, zero failures, zero quality rejections.
- Local verification: article URL, `/news`, `/news/rss.xml` and `/sitemap.xml` returned HTTP 200 before deployment.

## Google Search Console truthfulness

The system updates discoverability surfaces (Sitemap, RSS and internal product links). It does not use Google Indexing API or Sitemap ping for ordinary content. Search Console ownership/credentials were not configured at audit time, so the only valid current status is **awaiting Search Console authorization**. No indexing claim is made.

## Operational controls

- Vercel Cron: protected by existing `CRON_SECRET`; no secret is recorded in this file.
- Dry-run: protected endpoint query `?dryRun=1`, no News record writes.
- Manual intervention: `/admin/news-automation` shows sources, jobs, audits and articles; `/admin/product-knowledge` maintains source context for matching.
- Failure behavior: no qualified source or quality failure records an audit result and publishes nothing.
- Production environment values: `NEWS_AUTO_PUBLISH=true`, `NEWS_TIMEZONE=Asia/Manila`, `NEWS_DEDUP_DAYS=60`, and `NEWS_TRUSTED_SOURCE_URLS` configured to the approved feed.
