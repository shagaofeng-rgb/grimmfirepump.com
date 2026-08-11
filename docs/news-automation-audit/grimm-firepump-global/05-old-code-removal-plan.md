# Old code removal plan

1. The scheduled combined fetch-and-publish trigger is replaced by separate ingest and publish routes.
2. `runNewsAutomation` remains as a compatibility alias to the publish-only path. It must not be reintroduced as a fetch-and-publish task.
3. Historical Google News source rows are preserved for audit but no longer pass the central site whitelist.
4. The legacy combined collector is retained temporarily as unexported code for rollback comparison; no route invokes it. Remove only after at least one deployed 48-hour frontend-verified cycle is recorded.
5. No historical Blog, News, product or lead data is deleted by this change set.
