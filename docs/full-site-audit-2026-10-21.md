# GRIMM website audit and release, 2026-10-21

Scope: `www.grimmfirepump.com`, repository `shagaofeng-rgb/grimmfirepump.com`.
The Maige domain and repository mentioned in the original checklist are not in scope; the owner confirmed GRIMM.

## Baseline and data flow

- Production baseline: 108 public URLs in five sitemap shards; deep audit found zero failing URLs. Median HTTP response 542 ms, p95 1,461 ms, maximum 3,827 ms. Site self-audit passed 23 routes.
- Core flow: public product, article and download pages -> Next.js server/API -> Neon-backed CMS and lead stores -> protected `/admin` lists. First-party analytics and WhatsApp clicks -> respective API/store -> protected dashboard.
- Read-only database inventory before changes: 29 CMS products, 10 product categories, 71 CMS news/blog records (one published Blog article), 14 inquiries, 77 download leads, 6,878 analytics events, 62 WhatsApp clicks, 52 News articles and 74 sitemap runs.
- Three actual products were traced from database through admin to their public product details (HTTP 200). The published Blog entry was present in admin and its public detail returned HTTP 200. Three inquiry IDs were present in database and admin. Unauthenticated inquiry, download-lead and analytics API reads returned 401.
- No database schema migration or content deletion was performed. Identifiable test inquiry and download records were inserted through the real APIs and removed by exact ID after database/admin response comparison; respective counts returned to 14 and 77. Invalid input returned 400 or 404 without writing.

## Findings and changes

1. The downloads page used static document cards and a hard-coded catalog return URL. It now lists published CMS assets, deduplicates identical file URLs and returns the selected asset's actual URL. The download API validates published status, unique file mapping and safe URL format. A real gated-catalog API test returned the expected asset; a duplicate/hidden asset test returned 404.
2. Localized product and download cards could lag CMS changes. They now read published CMS records on dynamic routes. This improves current-data consistency but does not translate newly entered English product copy automatically.
3. Analytics persisted identifiers before any explicit visitor choice. First-party/GA analytics now require opt-in; visitors can decline or reset the choice. Public privacy/terms pages and notices beside inquiry/download forms were added. Admin pages do not load analytics.
4. Eight admin views fetched all twelve data collections even when they required only one to three. Each now requests only the collections it uses. The download asset count is derived from actual lead records instead of a stored display number.
5. Three world-map PNGs totaling 4,295,283 bytes were converted to WebP totaling 129,856 bytes. Originals remain in the repository for rollback. Responsive rendering still requires real-device visual confirmation.
6. The homepage footer's Quality link pointed to missing `/quality`; it now points to `/certificates`. The decorative English selector now links to the six existing language home pages, including mobile navigation.
7. The Search Console submission cron remains Monday 03:00 UTC (`0 3 * * 1`, Monday 11:00 Shanghai). The previous maintenance path suppressed a due Monday submission whenever the sitemap was unchanged; that condition was removed. The weekly schedule gate and single cron remain intact. This change must be verified after the next scheduled production run; no claim is made that Google has indexed any URL.
8. Privacy and terms pages were added to the sitemap.

## Automation inventory and conflict review

- Vercel project: Next.js frontend/API and one production cron, `/api/cron/sitemap`, Mondays 03:00 UTC. No separate production News cron appears in `vercel.json`.
- Third-party Blog publishing uses its dedicated webhook and remains enabled; this release does not change its authorization or publication rules.
- Earlier News generation was disabled by prior owner instruction. This release does not restart it or create substitute News posts.
- The sitemap/Google workflow and Blog webhook are independent. No background queue or additional scheduler was proved active from accessible project configuration. External platform automations cannot be ruled out from repository inspection alone.

## Tests and measurements

- Local TypeScript check, sitemap tests, and optimized Next.js build: see release command output. Existing focused tests had 31 passing checks before the final navigation edit; final type/build/sitemap checks were rerun.
- Locally built site: 110 public URLs in five shards, zero deep-audit failures, 23/23 self-audit routes passed. Local median 1,752 ms, p95 4,300 ms, reflecting remote database latency from the developer machine; not a production speed regression comparison.
- Homepage, downloads, Blog, product pages, protected admin routes, unauthorized API responses, and real inquiry/download submissions were exercised. Production post-deployment checks are recorded in the release response.

## External limitations and follow-up

- `_dmarc.grimmfirepump.com` currently resolves to three separate DMARC TXT records. DNS is hosted at DNSPod, outside this repository and Vercel project. Consolidate them into exactly one valid DMARC TXT record. SPF was observed; DKIM selector and actual notification delivery could not be validated. Form data writes were tested, but no SMTP/transactional-mail integration was proven.
- No active GA4 measurement ID or authenticated GA4/Search Console report access was available during this audit. Admin analytics were validated as first-party event data, not represented as GA4 or Search Console data. Consent opt-in will intentionally reduce first-party event counts relative to unconsented traffic.
- Browser automation was unavailable during this session, so complete desktop/tablet/mobile screenshot, console, keyboard and regional network verification is not marked passed. HTTP, HTML, build and API coverage cannot replace visual/device QA.
- The provided checklist mentioned `info@maigebio.com`; that address is unrelated to GRIMM and was not configured as a notification destination. A verified GRIMM notification mailbox and service credentials are required to test email delivery.
- International probes from Middle East, Africa, Southeast Asia and South America were not available. Public HTTP timings above are from the local audit location only.

## Safety and rollback

- Before modification, code baseline was Git commit `378f7e8`; private lead/content backup is outside the repository at `/Users/apple/Documents/格瑞姆水处理/.private-backups/grimm-2026-10-21/content-and-leads.json` (mode 600). Secret values are intentionally omitted from this report.
- Roll back code by redeploying commit `378f7e8` or restoring the previous Vercel deployment. No database migration was made; the backup is only for selective recovery after inspecting affected records. Do not replace the entire production database with this snapshot.
- The pre-existing untracked `src/app/admin/visual-options/` and `src/app/design-directions/` directories are not part of this release.
