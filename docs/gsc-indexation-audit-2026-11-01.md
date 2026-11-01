# GRIMM GSC indexation audit - 2026-11-01

Scope: `grimmfirepump.com` repository and production deployment only. Code baseline: `aefe35195f6b0cd4b3a10e37fbc34dfe705f3179`.

## Evidence and limits

- GSC Page indexing overview (last updated 2026-10-23): 133 indexed, 150 not indexed. Categories: proper canonical alternative 57, noindex 22, redirect 17, 404 11, discovered not indexed 24, crawled not indexed 13, Google-selected different canonical 5, duplicate without user canonical 1. These are not 150 confirmed defects.
- GSC sitemap overview: Success, 119 URLs, last read 2026-11-01. The live XML inventory before this fix contained 123 final canonical URLs; GSC reporting and live XML are snapshots with different update times and must not be equated.
- GSC category drilldowns could not be operated through the available browser connection. No affected-URL export, last-crawl dates or validation details were obtained. The user chose to proceed with public evidence. `gsc_last_crawl` and `gsc_validation` in the CSV are explicitly `not-exported`, not fabricated.
- [Public URL inventory](./gsc-indexation-2026-11-01-url-inventory.csv) contains 153 checked URLs from the deployed production domain: 125 sitemap entries, 21 internally linked noindex HTML pages and 7 linked image/XML resources. It is **not** a GSC export.

## Findings and disposition

| Group | Decision | Evidence / next action |
| --- | --- | --- |
| 57 proper canonical alternatives | Intentional unless URL-level evidence contradicts | Bare `grimmfirepump.com` redirects 301 to `www`; regional `www` variants canonicalize to their own apex domain. Keep valid variants. |
| 5 Google-selected different canonical, 1 duplicate without canonical | Evidence insufficient | Need the six GSC URLs and Google-selected canonical before changing any canonical or regional site. Current 125 sitemap pages are self-canonical. |
| 22 noindex | Partly intentional, remainder unverified | 21 publicly linked noindex pages found: `/search` and 20 incomplete locale routes (`/products`, `/applications`, `/projects`, `/downloads` in five languages). They are absent from the sitemap by design. The GSC set cannot be matched without its URL export. |
| 17 redirects, 11 404 | Evidence insufficient for GSC-specific rows | 51 reviewed legacy URL rules were tested: 45 return 301 to a 200 destination, 6 return intentional 410, zero failures. Unmapped GSC 404 URLs need review; do not redirect deleted pages to the homepage. |
| 24 discovered / 13 crawled not indexed | Awaiting Google recrawl and content review | Current sitemap pages return 200, self-canonical and indexable. Technical eligibility cannot guarantee indexing; compare the GSC URL-level report after recrawl. |
| Two published product pages absent from sitemap | Fixed; awaiting Google recrawl | `/products/fire-fighting-jockey-pump` and `/products/jpwq-automatic-agitating-submersible-sewage-pump` were 200/self-canonical/indexable but omitted because stored CMS canonical fields pointed to wrong paths. Corrected both CMS fields and made sitemap use the actual public-page canonical policy. Local sitemap rose 123 -> 125. |
| Repeated meta descriptions | Fixed; awaiting Google recrawl | Several product descriptions and News template summaries reused identical metadata. Product metadata now starts with the real product title; affected News metadata uses the real event title and a recorded source fact. Local 125-page audit reports no duplicate descriptions. |

## Regional-domain check

`https://grimmfirepump.cl/es` responds 200 and canonicalizes to `https://grimmfirepump.cl/es`; `https://grimmfirepump.co.za/` responds 200 and canonicalizes to `https://grimmfirepump.co.za`. Both have distinct regional content. The `www` variants resolve 200 but canonicalize to their respective apex domain. No GRIMM global-page canonical or hreflang points at a regional domain, so no cross-domain canonical change was made. Regional domains are outside this repository's deployment scope.

## Verification

- Production baseline: `scripts/site-deep-audit.mjs` checked 5 sitemap shards, 123 public URLs, zero eligibility failures (median 419 ms, p95 943 ms, max 1135 ms for concurrent HTTP requests).
- Local updated build: `tsc --noEmit` passed; `next build` passed; 34/34 tests passed.
- Local updated URL audit: 5 shards, 125 sitemap URLs, 121 internal link targets, 28 additional linked resources/noindex pages, zero failures; median 409 ms, p95 1746 ms, max 1881 ms for concurrent HTTP requests. Local and production latency are different environments, not a before/after speed claim.
- Every sitemap entry was checked for final 200, self canonical, no noindex, one H1 and language. Internal indexable HTML pages absent from the sitemap now fail the regression audit.
- Production deployment `dpl_3GVfyGWZPgLGtaWFgo8pCt3ftnUz` reached READY with code commit `c3686ca46b0764e639d3c32fb3415d767fffead6` and both `grimmfirepump.com` and `www.grimmfirepump.com` aliases. At 2026-11-01 10:34 UTC, the same deep audit against `https://www.grimmfirepump.com` passed: 5 shards, 125 sitemap URLs, 121 internal link targets, 28 additional linked noindex/resource URLs, zero failures; median 421 ms, p95 955 ms, max 1186 ms (concurrent HTTP requests).
- GSC recrawl/validation status remains pending. The site cannot force Google to index a page, and the six disputed-canonical URLs plus GSC 404 list remain unavailable without affected-URL exports.

## Changes and rollback

Code: `src/lib/sitemap-service.ts`, `src/app/admin/actions.ts`, `src/app/products/[slug]/page.tsx`, `src/app/news/[slug]/page.tsx`, `scripts/site-deep-audit.mjs`.

Data: only the two `cms-products.json` payloads named above had `canonicalUrl` corrected. Before-images are stored outside Git at `/Users/apple/Documents/格瑞姆水处理/backups/gsc-indexation-2026-11-01/product-canonical-before.json` (mode 0600). No rows were deleted and no schema was changed.

Rollback: revert the deployment commit; restore each of the two original `canonicalUrl` values from the backup using guarded updates on the same `lead_store` IDs; then invalidate/rebuild the sitemap cache. Recheck both product pages and sitemap after rollback. Do not restore unrelated CMS fields.
