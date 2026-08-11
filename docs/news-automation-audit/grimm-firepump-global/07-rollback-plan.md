# Rollback plan

1. Source baseline before the change: see backup directory `grimm-news-unification-2026-08-11T11-38-55` and its recorded Git HEAD.
2. Database snapshot: `lead-store-before.json` in the same protected backup directory; restore only with a row-level comparison to avoid overwriting newer leads or manual content.
3. To rollback code, revert the eventual News-unification commit; do not use `git reset --hard`.
4. To rollback scheduling, restore the backed-up `vercel.before.json` only after confirming no new delivery run is active.
5. Candidate, delivery and audit stores are additive. Their removal is not required to restore historical News or Blog content.
