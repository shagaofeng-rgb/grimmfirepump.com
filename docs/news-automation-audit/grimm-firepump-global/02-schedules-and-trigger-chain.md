# Schedules and trigger chain

| Task | Entry | Schedule / timezone | Writes | Can publish | Decision |
| --- | --- | --- | --- | --- | --- |
| News ingest | `/api/cron/news-ingest` | `0 0,12 * * *` UTC | `news-candidates.json`, source health, job audit | No | Active; fetch, verify, deduplicate, score, classify and store only. |
| News publish | `/api/cron/news-publish` | `30 0,12 * * *` UTC, 48-hour site window | News articles, delivery checks, publication audit | Yes | Active; skips until due, then requires frontend verification. |
| Legacy News endpoint | `/api/cron/news` | No longer scheduled | Publication compatibility only | Yes | Retained for authenticated backward compatibility; does not collect. |
| Sitemap maintenance | `/api/cron/sitemap` | `0 3 */3 * *` UTC | Sitemap manifest/runs | No | Unchanged. |
| Admin collect | `/api/admin/news/collect` | Manual | Candidates and job audit | No | Active. |
| Admin publish/retry | `/api/admin/news/publish`, `/retry` | Manual | News and delivery checks | Yes | Active; uses the same frontend-verifying state machine. |

No GitHub Actions, queue worker or second repository scheduler was found. Historical Google News RSS source records remain in the database but are excluded by the central whitelist rather than deleted.
