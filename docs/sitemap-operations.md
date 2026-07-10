# Sitemap Automation and Search Console

## Architecture

The public Sitemap is generated dynamically from published CMS records and static public routes. `/sitemap.xml` is a Sitemap Index and links to UTF-8 XML URL sets under `/sitemaps/`:

- `/sitemaps/pages-1.xml`
- `/sitemaps/products-1.xml`
- `/sitemaps/posts-1.xml`
- `/sitemaps/categories-1.xml`

Each file is split before 45,000 URLs or 45 MB, leaving margin below Google's 50,000 URL and 50 MB limits. Draft, review, offline, archived, scheduled, noindex, parameterized and non-self-canonical records are excluded. `lastmod` comes from each record's real update or publish date; static pages use their recorded content update date.

Content changes mark the Sitemap dirty and invalidate the public Sitemap routes. The daily Vercel Cron performs a consistency check, writes an atomically verified runtime snapshot, compares the current URL manifest with the previous one, records added/modified/removed URLs and optionally submits the Sitemap Index through the Google Search Console Sitemaps API.

## Public URLs

- Sitemap Index: `https://www.grimmfirepump.com/sitemap.xml`
- Robots: `https://www.grimmfirepump.com/robots.txt`
- XML shards: `https://www.grimmfirepump.com/sitemaps/<group>-<number>.xml`

## Manual execution

The command calls a protected application endpoint. Set `SITEMAP_MANUAL_TOKEN`, `SITEMAP_CRON_SECRET` or `CRON_SECRET` in the shell without committing it.

```bash
npm run sitemap:generate -- --dry-run --verbose
npm run sitemap:generate -- --force
npm run sitemap:generate -- --force --submit --verbose
```

Supported flags:

- `--force`: regenerate even when the manifest digest is unchanged.
- `--dry-run`: inspect and diff without writing a snapshot or manifest.
- `--submit`: submit the Sitemap Index when generation succeeds and content changed.
- `--verbose`: print the complete sanitized execution result.

For a local server, set `SITEMAP_BASE_URL=http://localhost:4174`. The production endpoint rejects unauthenticated calls.

## Scheduled execution

Vercel runs `/api/cron/sitemap` daily at `03:00 UTC`, configured in `vercel.json`. Do not configure a second Linux cron or external scheduler unless the Vercel Cron is removed. `SITEMAP_CRON_SECRET` or `CRON_SECRET` must be configured in production.

## Search Console configuration

Set:

```env
GOOGLE_SEARCH_CONSOLE_ENABLED=true
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://www.grimmfirepump.com/
GOOGLE_SEARCH_CONSOLE_SITEMAP_URL=https://www.grimmfirepump.com/sitemap.xml
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON={...}
```

`GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_BASE64` is also supported. `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH` is intended for a private server and is not normally suitable for Vercel. Never commit credentials.

In Google Cloud, enable the Search Console API and create a Service Account. In Google Search Console, add the Service Account email as an owner or full user of the exact URL-prefix Property (including `https://` and the `www` host), or use a matching Domain Property. The system requests the `webmasters` OAuth scope and calls the Search Console Sitemaps API. It does not use the retired Sitemap Ping endpoint or the Indexing API.

## Logs and tests

The most recent 100 sanitized runs are stored through the existing `lead_store` adapter under `sitemap-runs.json`; the latest manifest is stored under `sitemap-manifest.json`. The admin SEO page displays the latest status and URL changes.

```bash
npm run test:sitemap
npm run typecheck
npm run build
npm run audit:site
```

## Troubleshooting

- Sitemap 404: confirm the latest deployment contains `src/app/sitemap.xml/route.ts` and the domain aliases point to it.
- XML error: run `npm run test:sitemap`; failed generation preserves the previous verified runtime snapshot.
- robots.txt missing Sitemap: verify `src/app/robots.ts` and `NEXT_PUBLIC_SITE_URL=https://www.grimmfirepump.com`.
- Search Console API 403: verify the Service Account has access to the exact Property string and that the Search Console API is enabled.
- Submitted but not indexed: inspect coverage, canonical, crawl permissions, content quality and internal links in Search Console.

Sitemap submission only helps Google discover URLs. A successful submission does not prove Google crawled the pages, and a crawl does not guarantee indexing. Final indexing status must be confirmed in Google Search Console.
