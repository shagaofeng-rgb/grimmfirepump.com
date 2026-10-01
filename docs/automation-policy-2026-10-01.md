# Automation policy, 2026-10-01

- News ingestion and composition/publication are disabled by `news-automation-policy.ts` before configuration loading, network requests, locks or writes. This covers cron, admin and fallback callers. Historical articles remain available.
- Removed both News Vercel crons. Build-time source network probing also exits without requests.
- Blog webhook, authentication, article handling and configuration are unchanged.
- Google Search Console sitemap maintenance runs Monday at 03:00 UTC (11:00 Asia/Shanghai). The submission gate accepts only Monday after this time and prevents repeated submissions in the same weekly window. Next scheduled invocation: 2026-10-05 11:00 Asia/Shanghai.
- Live sitemap routes continue working independently of the submission schedule.
- Validation: weekly eligibility, duplicate suppression, year rollover, cron isolation and existing sitemap tests. Production endpoint verification follows deployment.
- Rollback: deploy branch `backup/automation-before-20261001` or revert the policy commit. No database migrations or content deletions.
