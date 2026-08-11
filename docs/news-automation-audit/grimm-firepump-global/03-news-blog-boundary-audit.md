# News / Blog boundary audit

| Boundary | News | Blog | Status |
| --- | --- | --- | --- |
| URL | `/news/*` | `/blog/*` | Separate |
| Runtime store | `news-articles.json`, candidates, delivery checks | `cms-news.json` legacy Blog collection | Separate |
| Automation | ingest/publish functions only read News candidates | Webhook/manual CMS only | Enforced |
| RSS / sitemap | `/news/rss.xml`, `/news-sitemap.xml` | `/blog/rss.xml`, `/blog-sitemap.xml` | Separate |
| Templates | source panel, editorial disclaimer, no sales CTA | original-content Blog template | Separate |
| Admin path | automation dashboard and News APIs | existing CMS article editor | Retained |

The legacy Blog collection name is historical; it is not queried by News automation and no News article is written to it. Existing Blog records are preserved.
