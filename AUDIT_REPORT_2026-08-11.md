# GRIMM PUMP full-site audit and repair record

**Audit time:** 2026-08-11 (Asia/Shanghai)  
**Scope:** production-bound source, connected Neon database, local production build, CMS,
Blog publishing Webhook, News/Sitemap automation, public routes, admin authentication, and
technical SEO surfaces.

## Backup and rollback

- Database/config snapshot created before modifications:
  `/Users/apple/Documents/格瑞姆水处理/backups/grimm-full-audit-2026-08-11T02-42-12-244Z`.
- The snapshot contains 3,001 database records across 22 stores and has SHA-256
  `7d12e6f46226e0ca8069c7db45e0fca3e8971a3f793e18282609af2f6e8eca00`.
- No existing product, lead, Blog, News, or SEO record was deleted. The one purpose-labelled
  webhook test record was retained as `archived` and `noindex` after validation.
- Roll back source by reverting the release commit. Restore database data only after review by
  importing the captured `lead-store-before.json` into the same `lead_store` schema; do not use
  the snapshot to overwrite newer customer leads without a row-level comparison.

## Confirmed normal

| Area | Evidence |
| --- | --- |
| Database | Neon connection succeeded. `lead_store` has non-null `store_name`, `id`, `created_at`, and JSONB `payload`; primary key and `idx_lead_store_name_created` exist; no active task locks remained after audit. |
| CMS data | 20/20 products are published with valid, unique slugs. 28 Blog records are published and three are deliberately archived; no Blog record lacks a slug or a valid publication date. |
| Real data path | Three sampled products, three sampled Blog records, and three sampled inquiry records matched database records to authenticated admin/API reads and public pages. |
| Blog views | `/blog`, `/blog/[slug]`, the authenticated `/admin/news` list, Blog RSS, structured data, canonical metadata, and Sitemap are present. |
| Access control | `/admin` and protected lead/admin APIs reject unauthenticated access; the signed admin session was accepted for authorised reads. |
| SEO surfaces | `robots.txt`, Sitemap index and four shards, canonical URLs, article schema, Open Graph metadata, admin `noindex`, and public language checks passed. |

## Repaired

### Third-party Blog publishing

- Root cause: the former policy had intentionally changed
  `src/app/api/webhook/send_article/route.ts` to HTTP 410 and removed root `POST` forwarding.
- Restored a signed Webhook at `/api/webhook/send_article` and internal root `POST /` forwarding
  in `src/middleware.ts`. Homepage GET and normal canonical redirects are unchanged.
- The endpoint accepts form-urlencoded and JSON payloads, validates the secret with a timing-safe
  comparison, returns the provider's `{code,msg}` contract, treats short signed payloads as
  non-writing verification, and writes complete articles as published CMS records.
- The deterministic external article id makes provider retries update rather than duplicate a
  record. It records success/failure audits, invalidates Blog/Sitemap caches, and marks Sitemap
  state dirty. It uses `WEBHOOK_ARTICLE_SIGN` first and retains the existing
  `BLOG_WEBHOOK_API_KEY` only as compatibility fallback; neither value is in source control.
- Local end-to-end evidence: root verification returned `{"code":1,"msg":"验证成功"}`;
  invalid authentication returned `{"code":0,"msg":"秘钥错误"}`; two identical full posts
  returned success and created one database row with two success audit events. The record then
  appeared in CMS, Blog list, Blog detail and Sitemap before it was archived. After cache refresh
  it returned the expected 404 and was absent from both list and Sitemap.

### Historical Blog URL collision

- Found two different published legacy Blog records with the same slug. Neither was deleted.
- The newer record received the unique suffix `-2026-08-02`; an `audit-logs.json` repair entry
  records the change.
- `saveNews` now rejects a duplicate manual slug, the Webhook resolves a slug collision safely,
  and `getPublicPosts` defensively de-duplicates any malformed historical slug before routing.

## Automation inventory

| Task | Trigger | Current rule | Result |
| --- | --- | --- | --- |
| News collection/publication | Vercel Cron `/api/cron/news` | `30 1 * * *` UTC; 48-hour publication interval | Latest recorded run at `2026-08-11T02:10:17Z` succeeded with one generated and published News article. |
| Sitemap maintenance | Vercel Cron `/api/cron/sitemap` | `0 3 */3 * *` UTC | The only Sitemap/Google submission schedule found. Manual protected run succeeded: 155 URLs, 0 errors, four shards. |
| External Blog plugin | Plugin POST | Provider initiated; signed and idempotent | Restored and locally verified as above. |
| Admin/manual Blog publishing | CMS server action | Operator initiated | Existing draft/review/published/offline/archived controls remain available. |

No GitHub Actions, second Vercel Cron, local server cron, queue consumer, or hidden Blog auto-publisher
was found in the repository. News and Blog use separate stores and routes, so the restored Blog
Webhook does not trigger News automation.

## Google Search Console status

- The actual production-bound schedule is already every three days in `vercel.json`; it was not
  merely changed in a UI label or document.
- The Sitemap service uses the official Search Console Sitemaps API only when an enabled service
  account configuration exists. The audit maintenance run recorded `searchConsole: disabled`,
  so it did **not** make a false Google-submission claim.
- Search Console service-account/ownership variables are not present in the inspected local
  configuration. Production Vercel environment values cannot be read without Vercel project
  credentials; production validation after deployment checks scheduling code and public Sitemap,
  but cannot prove an unprovided Google credential exists.

## Production validation after deployment

- Release commit: `bc0db41` (`Restore secure Blog webhook publishing`) was pushed to `main` and
  production served the new endpoint response (`GET /api/webhook/send_article` returned the new
  POST-only contract rather than the retired 410 message).
- Production smoke test: 23/23 primary routes returned HTTP 200. Production deep audit checked
  156 Sitemap URLs across four shards with zero canonical, language, robots, admin-protection,
  security-header, or status failures. Observed network timings were median 404 ms, p95 977 ms,
  max 1,819 ms; these are single-location audit timings, not field Core Web Vitals.
- A signed, non-writing root Webhook verification on production returned
  `{"code":0,"msg":"发布接口未配置。"}`. This proves the deployment is live but neither
  `WEBHOOK_ARTICLE_SIGN` nor the legacy `BLOG_WEBHOOK_API_KEY` is currently available to the
  Vercel Production runtime. No production article was written.
- Required production action: add one high-entropy existing plugin key as the secret
  `WEBHOOK_ARTICLE_SIGN` in Vercel Production (or restore the legacy compatibility key), then
  redeploy. This workstation has no Vercel API/CLI credential that can safely change a Production
  environment variable. Repeat the signed root verification afterward; it must return
  `{"code":1,"msg":"验证成功"}` before enabling plugin publishing.

## Tests and performance evidence

- Type check: passed (`tsc --noEmit`).
- Production build: passed (Next.js 15.5.19; 176 generated pages).
- Sitemap test suite: 13/13 passed.
- Main-route smoke test: 23/23 passed, including public pages, search, News/Blog RSS, Sitemap,
  robots and public APIs.
- Deep Sitemap/SEO test: 155 public URLs across four shards, 0 failures; median local route
  latency 90 ms, p95 162 ms, max 220 ms after warm-up. This is a local application measurement,
  not a claimed global Core Web Vitals score.

## Constraints and follow-up

- The third-party provider's brand/account identifier is not stored in the repository or database;
  its confirmed integration mode is the documented Custom/Generic Framework Webhook contract.
- Vercel environment values and dashboard run history are not accessible from this workstation
  without a Vercel credential. The deployment must retain the existing Blog secret in Production;
  after deployment a signed, non-writing root verification is used to validate that fact.
- Search Console can be enabled only after a Google service account is granted access to the
  `https://www.grimmfirepump.com/` property and its credentials are added to Vercel Production.
