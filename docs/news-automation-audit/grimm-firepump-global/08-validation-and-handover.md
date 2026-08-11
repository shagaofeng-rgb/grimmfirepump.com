# Validation and handover

## Configuration

| site_id | domain | industry | language | timezone | ingest | publish |
| --- | --- | --- | --- | --- | --- | --- |
| `grimm-firepump-global` | `www.grimmfirepump.com` | Industrial fire pumps and fire-water systems | en | Asia/Shanghai | 12 hours | 48-hour window, checked every 12 hours |

## Verified locally

- Type check passed.
- Next.js production build completed with 176 generated pages.
- Sitemap test suite: 13/13 passed.
- Public smoke audit: 23/23 routes passed.
- Dedicated News sitemap contained 2 current News URLs; Blog sitemap contained 28 Blog URLs; intersection was 0.
- `robots.txt` advertises both dedicated sitemaps.
- A signed dry-run ingest fetched 20 source items, identified 9 qualifying candidates, rejected 10 and blocked one duplicate. `news-articles.json` remained at 21 records before and after; no candidate record was persisted in dry-run mode.

## Not executed in this change set

- No production deployment or scheduler change was made, because this instruction did not grant production deployment approval.
- No 48-hour live publication was triggered against the shared production database. That acceptance test must run after deployment with Vercel environment variables and the deployed frontend available to the worker.
- The configured fallback NFPA source is a permitted official web page but needs an RSS/API adapter before it can be used as an automated fallback feed. The publish path records a failed cycle rather than inventing a News article if no compliant feed candidate is available.

## Runbook

1. Deploy the code and set `NEWS_CRON_SECRET` (or `CRON_SECRET`) plus `NEWS_FRONTEND_VERIFY_URL=https://www.grimmfirepump.com` in Production.
2. Confirm Vercel invokes `/api/cron/news-ingest` every 12 hours and `/api/cron/news-publish` every 12 hours.
3. Inspect `/admin/news-automation` and `news-delivery-checks.json`; a cycle is successful only with status `passed` and a public `/news/[slug]` URL.
4. Before enabling fallback publishing, replace the NFPA page URL with a verified RSS/API adapter or add another licensed authoritative RSS/API source. Do not loosen whitelist or source attribution rules.
