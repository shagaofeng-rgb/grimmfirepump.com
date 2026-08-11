# SEO and indexation baseline

- Primary sitemap: `/sitemap.xml`.
- Dedicated News sitemap: `/news-sitemap.xml`; only frontend-published News records are included.
- Dedicated Blog sitemap: `/blog-sitemap.xml`; only indexable Blog records are included.
- News RSS and Blog RSS are separate.
- News detail pages provide canonical metadata, Article JSON-LD, source attribution, original publication date, image-use status and editorial disclaimer.
- Existing historical URLs are not redirected, noindexed or removed by this implementation change. Their individual content decisions are in `04-existing-content-triage.csv`.
