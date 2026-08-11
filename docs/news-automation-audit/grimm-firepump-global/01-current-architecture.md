# Current architecture baseline

- **Site:** `grimm-firepump-global` / `https://www.grimmfirepump.com`
- **Framework:** Next.js 15; deployment configuration in `vercel.json`.
- **Persistence:** Neon Postgres `lead_store` JSONB adapter (`src/lib/local-store.ts`). Runtime News data is in `news-articles.json`; Blog data is retained in the independent legacy CMS collection `cms-news.json`.
- **News public surfaces:** `/news`, `/news/[slug]`, `/news/rss.xml`, `/news-sitemap.xml`.
- **Blog public surfaces:** `/blog`, `/blog/[slug]`, `/blog/rss.xml`, `/blog-sitemap.xml`.
- **Historical issue:** the former cron entered a combined `runNewsAutomation` path that could fetch and publish in one invocation. The new path splits ingest from publication and treats frontend delivery as the publication completion gate.

No production deployment is included in this audit change set.
