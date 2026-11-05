# GRIMM Neon cost audit (2026-11-05)

Scope: the Neon project used by `grimmfirepump.com` only. No database records or branches were deleted.

## Billing baseline

- October 2026 project consumption: 423,147 compute-unit seconds = 117.54 CU-hours. At the Launch price of $0.106/CU-hour, compute is about $12.46, accounting for nearly all of the reported $12.48 bill.
- Root branch storage was about 43 MB-month; restore history about 1.7 MB-month. Public transfer was about 10.1 GB, within the Launch included allowance.
- One main branch and one read-write compute endpoint exist. No extra compute branch was found.
- November 1-4 daily consumption: 19,111, 17,316, 19,379 and 17,098 CU-seconds. Without intervention, the November run rate would exceed October's.
- On November 3 every hour recorded 554-1,215 CU-seconds. At the configured 0.25 CU minimum, this is approximately 37-81 minutes of equivalent minimum-size compute per hour. Autoscaling can make exact active minutes differ.

## Original production compute configuration (recorded before change)

- Project: `withered-glitter-85063650`; branch: `br-aged-band-atnev1ey`; endpoint: `ep-twilight-hill-atikcw1e`.
- `autoscaling_limit_min_cu=0.25`, `autoscaling_limit_max_cu=8`, `suspend_timeout_seconds=0` (Neon's default 300-second idle timeout), `disabled=false`.
- The only production cron in `vercel.json` is the Monday sitemap job. News automation is disabled and was not re-enabled for this optimization.

## Observed request paths

- Public product/category/Blog records used a 300-second Next data cache. Published CMS edits and Blog webhook publication already invalidate their respective cache tags.
- Product detail pages read the News store for related articles on every dynamic request. Public News list/detail and related-article reads now share one tagged, one-hour data cache. The unpublished/admin News reader remains uncached; publish invalidates the tag before frontend verification and after final status updates.
- The analytics endpoint writes consenting user events to Neon. After October 23, new analytics rows dropped sharply while compute usage increased, so analytics writes alone do not explain the increase.
- Vercel runtime log grouping returned no path records for the queried window, and `pg_stat_statements` is not installed. Exact per-route database-query counts are therefore not established.

## Changes and rollback

- Public product/category/Blog data cache: 300 to 3,600 seconds. Existing CMS and webhook tag invalidation is retained.
- Public News cache: tagged with `news-articles`, 3,600-second fallback revalidation. Publication invalidates the tag before frontend verification and after final status changes.
- A 60-second Neon idle suspend was attempted but rejected with HTTP 412: `suspend interval is too short for your plan`. The Launch compute endpoint remains unchanged at `suspend_timeout_seconds=0` (the five-minute default). There is no compute-setting rollback to perform.
- To roll back code, revert only the changes in `src/lib/public-cms.ts`, `src/lib/news-automation.ts`, and `src/app/api/admin/news/publish/route.ts`, then redeploy. Do not modify database contents.

## Cost guardrail

At $0.106/CU-hour, a $3 monthly target allows about 28.3 CU-hours including negligible storage, or roughly 0.9 CU-hour/day. This is a usage target, not a hard billing cap. A database quota that suspends production at $3 was not set because it could break the public site and lead capture. Compare daily consumption after deployment before claiming the target has been achieved.
