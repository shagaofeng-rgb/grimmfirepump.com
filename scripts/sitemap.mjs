const args = new Set(process.argv.slice(2));
const flags = {
  force: args.has("--force"),
  dryRun: args.has("--dry-run"),
  submit: args.has("--submit"),
  verbose: args.has("--verbose"),
};
const baseUrl = (process.env.SITEMAP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.grimmfirepump.com").replace(/\/$/, "");
const token = process.env.SITEMAP_MANUAL_TOKEN || process.env.SITEMAP_CRON_SECRET || process.env.CRON_SECRET || "";

if (!token && new URL(baseUrl).hostname !== "localhost") {
  throw new Error("Set SITEMAP_MANUAL_TOKEN, SITEMAP_CRON_SECRET or CRON_SECRET before calling the production manual endpoint.");
}

const response = await fetch(`${baseUrl}/api/admin/sitemap/run`, {
  method: "POST",
  headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(flags),
});
const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
if (flags.verbose) console.dir(body, { depth: null });
else console.log(JSON.stringify({ status: body.status, message: body.message, processed: body.processed, files: body.files, searchConsole: body.searchConsole }, null, 2));
if (!response.ok) process.exitCode = 1;
