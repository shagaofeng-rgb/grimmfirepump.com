# GRIMM PUMP Full-Site Audit and Remediation Report

Audit date: 2026-08-31 (Asia/Shanghai)

Production site: https://www.grimmfirepump.com

Repository: `shagaofeng-rgb/grimmfirepump.com`
Application: Next.js 15.5.21, React 19.0.4, Neon PostgreSQL, Vercel

## 1. Safety, Backup and Rollback

- Git rollback branch: `backup/full-site-audit-20260830-203234`
- File and database backup: `/Users/apple/Documents/格瑞姆水处理/.backups/grimm-full-audit-20260830-203234`
- Database snapshot: `lead-store-backup.json`, 4,237 rows at backup time, directory mode 700 and file mode 600.
- No production content was deleted. Marked inquiry, download, analytics, Meta and Blog test records were removed after verification.
- Code rollback: redeploy the rollback branch or revert the audit commit.
- Data rollback: restore only affected `lead_store` records from the JSON backup by `(store_name, id)`; do not replace the entire table unless a full disaster recovery is required.

## 2. Runtime and Task Inventory

| Component | Trigger / schedule | Input | Output | Current result |
| --- | --- | --- | --- | --- |
| Next.js public site | HTTP request | CMS and site configuration | HTML, XML, JSON | Local production build and route checks passed |
| Admin CMS | Authenticated `/admin/*` | Admin actions | Product, Blog, lead and SEO records | RBAC and unauthenticated blocking verified |
| Neon `lead_store` | Application read/write | Structured JSON records | CMS and operational persistence | Connected; PK and created-time index verified |
| News ingest | Vercel Cron `0 0,12 * * *` UTC | Site-scoped source whitelist | Candidates and audit jobs only | 12-hour schedule retained; no publish call in ingest |
| News publish | Vercel Cron `30 0,12 * * *` UTC plus 48-hour application gate | Verified unused candidate | One frontend-verified News article | Latest production delivery check passed |
| Legacy News cron | None | N/A | HTTP 410 | Retired to prevent duplicate publishing |
| Blog webhook | Signed root POST rewrite or `/api/webhook/send_article` | Third-party Blog payload | Published CMS Blog record | Validation, write, frontend and idempotency passed |
| Google Sitemap maintenance | Daily Vercel wake-up `0 3 * * *` UTC plus strict 72-hour gate | Published public records | Sitemap snapshot, diff and optional Google submission | Schedule repaired; Google credentials still require external authorization |
| GitHub News validation | Push / pull request to `main` | Source catalog and test suite | Validation status | Self-committing workflow removed |
| Meta Lead webhook | Signed Meta request | Lead payload | Idempotent lead record | Signature and idempotency logic passed locally; production Meta secret is not configured |

Conflict review found one obsolete combined News endpoint, one irregular day-of-month Google schedule and one disabled production Blog credential. The combined News endpoint now returns 410, the Google schedule uses a daily wake-up with a 72-hour persisted gate, and the existing Blog key has been restored to the production environment. No second News or Blog scheduler is present in `vercel.json`.

## 3. Database and Data Consistency

Schema confirmed:

- `lead_store(store_name TEXT, id TEXT, created_at TIMESTAMPTZ, payload JSONB)`
- Primary key: `(store_name, id)`
- Read index: `idx_lead_store_name_created(store_name, created_at DESC)`
- Duplicate primary-key groups: 0
- Active task locks at audit: 0

Current major record counts after remediation:

| Store | Records | Notes |
| --- | ---: | --- |
| CMS products | 28 | 28 published; five missing live products inserted |
| CMS Blog | 31 | 16 published; News automation cannot access this collection |
| News articles | 36 | Latest successful publication 2026-08-30 |
| News candidates | 387 | Site-scoped candidate pool |
| News delivery checks | 15 | Latest three all passed list/detail/RSS/Sitemap checks |
| Inquiries | 7 | Real records retained |
| Download leads | 32 | Real records retained |
| Analytics events | 3,278 | Marked local visual-QA events removed |

Three products, three Blog posts and three inquiries were sampled through database, admin/API and public presentation. Identifiers, titles, states and timestamps matched across the available boundaries. The public product source no longer supplements missing database fields from static product data.

Two published products had obsolete non-self Canonical values and were excluded from the product Sitemap. Their Canonicals were corrected to their existing live slugs:

- `/products/GW-Sewage-Pump-Series-Pump`
- `/products/LW-Sewage-Pump-Series-Pump`

The product Sitemap subsequently increased from 26 to 28 valid URLs.

## 4. Findings and Repairs

### Confirmed and repaired

1. Production database failures could silently fall back to `/tmp`. Production now fails closed; only local development may use the file fallback.
2. Product public data mixed database and static fallback fields. Public products now use published CMS database records only.
3. Five live product routes were absent from CMS. They were migrated into the existing collection without deleting existing products.
4. Two product Canonicals pointed to old `-Set` paths. They now self-canonicalize and are included in the Sitemap.
5. Admin route checks did not consistently enforce roles. Middleware, server actions and navigation now apply role-specific access.
6. Public form endpoints lacked persistent rate limiting and returned unnecessary record data. They now use hashed-client, database-backed limits and minimal responses.
7. Meta Lead delivery identity depended on mutable payload shape. Stable `leadgen_id` and raw-delivery fingerprints now prevent duplicate writes; request bodies are capped at 1 MB.
8. The old combined News cron could conflict with the isolated ingest/publish design. It is retired with HTTP 410.
9. Blog and News labels/routes were ambiguous in admin and metadata. Blog is explicitly technical/original content; automated News remains isolated.
10. Localized pages exposed partially English product/application modules. Localized public pages now use translated summaries; only substantially translated routes are indexable.
11. Arabic mobile navigation overflow risk was corrected with a responsive menu and RTL validation.
12. Seven factory images were converted to WebP and their references updated. Resulting files range from 83 KB to 473 KB.
13. Outdated package versions and transitive vulnerabilities were remediated. `npm audit --omit=dev` reports zero vulnerabilities.
14. `X-Powered-By` is disabled and sensitive session cookies use high priority.
15. Google `*/3` day-of-month scheduling was not a strict 72-hour interval. Vercel now wakes daily and application history opens one submission window every 72 hours, including across month boundaries.
16. Search Console submission was incorrectly conditional on Sitemap content changing. A due submission now runs even when the digest is unchanged.
17. The production Blog Webhook key was absent. The already verified local plugin key was restored to Vercel as `WEBHOOK_ARTICLE_SIGN` without exposing it.
18. Production now has a dedicated randomly generated `REQUEST_RATE_LIMIT_SECRET`; admin password-hash verification is also configured.

### Confirmed normal

- News 12-hour ingest and 48-hour publish separation.
- News latest delivery: list, detail, RSS, Sitemap and Blog isolation all passed.
- Blog webhook deterministic id prevents duplicate records on retries.
- Admin redirect and protected APIs reject unauthenticated access.
- 404 page returns HTTP 404; search page returns HTTP 200.
- Robots, Sitemap index, product/pages/knowledge/category shards, Blog Sitemap and News Sitemap are available.
- Canonical, H1, language and Arabic RTL checks passed for all 107 URLs exposed by the local Sitemap audit.
- Production-bound WebP assets are all referenced; the original source photos remain available for rollback.

### External authorization still required

- Google Search Console Service Account credentials are not present in Vercel and cannot be fabricated. `GOOGLE_SEARCH_CONSOLE_ENABLED` remains explicitly false. The 72-hour task, API client, URLs and logs are ready; enabling requires a real Google Service Account that has access to the exact Search Console property.
- `META_APP_SECRET` is not present in Vercel. The Meta webhook correctly fails closed until the real Meta application secret is provided.
- Email alert delivery has no Resend/API credential. News failures remain visible in the admin job and audit history, but outbound email alerting is not active.

## 5. Verification Evidence

Automated checks:

- TypeScript: passed.
- Next.js production build: passed; 172 static pages generated and 28 product routes built.
- Sitemap suite: 20/20 passed, including strict 72-hour and month-boundary tests.
- News source catalog: 3/3 passed; 300 ordered entries and 290 unique domains.
- News quality gates: 2/2 passed.
- News schedule tests: 4/4 passed.
- Dependency audit: 0 vulnerabilities.
- Core route self-audit: 23/23 passed.
- Deep Sitemap audit: 107 public URLs, 6 Sitemap files, 0 Canonical/H1/lang/RTL/security failures.
- Responsive visual matrix: 48 checks across 390, 768 and 1,440 px, 0 overflow, broken-image or runtime-error failures.

Blog webhook end-to-end test:

- Signed validation response: HTTP 200, `code: 1`, `验证成功`.
- First and repeated publish: HTTP 200, `code: 1`, `发布成功`.
- Database rows after duplicate delivery: exactly 1.
- Blog list and detail: HTTP 200 and marked title visible.
- Cleanup: marked test record count 0.

Local warm-response samples after build:

| Route | Median | Max (5 runs) |
| --- | ---: | ---: |
| `/` | 107 ms | 303 ms |
| `/products` | 109 ms | 169 ms |
| `/news` | 550 ms | 1,855 ms |
| `/blog` | 67 ms | 79 ms |
| `/factory` | 40 ms | 50 ms |

The local deep audit intentionally issued concurrent requests against the remote production database; its median was 564 ms and p95 2,982 ms. Production edge measurements must be used for final user-facing latency and are recorded after deployment verification.

Visual evidence:

- `/Users/apple/Documents/格瑞姆水处理/.backups/grimm-full-audit-20260830-203234/evidence/desktop-home.png`
- `/Users/apple/Documents/格瑞姆水处理/.backups/grimm-full-audit-20260830-203234/evidence/arabic-mobile-menu.png`

## 6. Modified Areas

- Authentication and RBAC: `src/lib/admin-auth.ts`, `src/middleware.ts`, admin actions and shell.
- Persistence and public CMS: `src/lib/local-store.ts`, `src/lib/admin-cms.ts`, `src/lib/public-cms.ts`.
- API security: inquiry, download, analytics, Meta and request-rate-limit modules.
- Automation: retired combined News cron, isolated admin labels, Vercel/GitHub schedules.
- SEO: Sitemap service, Search Console client, strict submission scheduler and operations guide.
- Localization and responsive UI: localized catch-all page, locale policy and admin/mobile navigation.
- Assets: seven optimized factory WebP files and their page references.
- Dependencies: `package.json` and lockfile.

## 7. Production Acceptance

This section is completed against the production deployment after the audited commit is pushed. A deployment is not accepted until the custom domain, public routes, Blog webhook validation, latest News, Sitemaps, security headers and Vercel runtime error telemetry have been checked.
