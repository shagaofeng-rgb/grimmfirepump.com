# SEO Indexation Remediation - 2026-08-13

## Scope and rollback

- Backup: `/Users/apple/Documents/格瑞姆水处理/backups/grimm-seo-indexation-2026-08-13T13-33-09`
- Code baseline: `63ef00c`
- No CMS records are deleted. Imported legacy Blog records are retained with
  `status=archived` and `indexable=false` when the CMS is next read.
- Rollback: revert this commit, then restore the backed-up runtime data or the
  `cms-news.json` records in the admin database if an editorial decision changes.

## Canonical and migration policy

- `www.grimmfirepump.com` is canonical; bare-domain requests already redirect
  permanently.
- `src/lib/legacy-url-governance.ts` is the complete reviewed mapping for old
  product, old `.html` news, and rebuilt legacy Blog URLs.
- Relevant successors use HTTP `301`; unrelated material uses HTTP `410`.
  No retired URL is redirected to the homepage.

## Content governance

- The 21 records seeded from the former site's `news` export are not treated as
  authored Blog content. They are preserved in CMS storage for audit/recovery
  but removed from public Blog lists, Blog sitemap, and indexation. The public
  read layer applies the same exclusion so a stale CMS cache cannot expose a
  legacy record while the archival write is being refreshed.
- New manual or webhook-created Blog records are unaffected because their slugs
  are not part of the legacy seed set.
- Verified external industry coverage is published only through `/news` and
  `/news-sitemap.xml`.

## Sitemap and language rules

- Root sitemap indexes pages, products, knowledge, categories, plus the two
  dedicated Blog and News sitemaps. Blog and News detail URLs are no longer
  duplicated in a generic `posts` sitemap.
- Locale routes with complete reviewed page copy remain indexable. Locale
  product, Blog, News, knowledge, project and tool routes are user-accessible
  but `noindex,follow` and canonicalize to English until their full body content
  has real translations.

## Remaining external action

1. Add a Search Console Service Account and grant it owner or full user access
   to the `https://www.grimmfirepump.com/` property before enabling API sitemap
   submission.
2. In Search Console, submit `/sitemap.xml` once after deployment and inspect
   the URL-level status for the top product pages and new News pages.
3. Publish real translated product and article bodies before re-enabling their
   locale-specific canonicals and hreflang annotations.
