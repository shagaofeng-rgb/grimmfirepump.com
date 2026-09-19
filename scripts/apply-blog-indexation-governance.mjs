import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function envFile(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

function isLowValuePublicBlog(item) {
  return item.status === "published" && item.indexable === true && (
    item.id.startsWith("webhook_blog_")
    || Boolean(item.source)
    || item.slug.startsWith("project-brief-")
  );
}

const apply = process.argv.includes("--apply");
const timestamp = new Date().toISOString();
const backupDirectory = process.env.BLOG_GOVERNANCE_BACKUP_DIR || path.join(process.cwd(), "backups", `blog-indexation-${timestamp.replace(/[:.]/g, "-")}`);
const environment = envFile(await readFile(path.join(process.cwd(), ".env.local"), "utf8"));
const databaseUrl = environment.POSTGRES_URL || environment.DATABASE_URL;

if (!databaseUrl) throw new Error("POSTGRES_URL or DATABASE_URL is required.");

const sql = neon(databaseUrl);
const rows = await sql`SELECT id, created_at, payload FROM lead_store WHERE store_name = 'cms-news.json' ORDER BY created_at DESC`;
const candidates = rows.filter((row) => isLowValuePublicBlog(row.payload));

await mkdir(backupDirectory, { recursive: true });
await writeFile(path.join(backupDirectory, "cms-news-before.json"), JSON.stringify({ timestamp, records: rows }, null, 2));
await writeFile(path.join(backupDirectory, "governance-plan.json"), JSON.stringify({
  timestamp,
  apply,
  candidates: candidates.map((row) => ({ id: row.id, slug: row.payload.slug, title: row.payload.title, reason: row.payload.id.startsWith("webhook_blog_") ? "automated-webhook" : "external-or-project-brief" })),
}, null, 2));

if (!apply) {
  console.log(JSON.stringify({ mode: "dry-run", candidates: candidates.length, backupDirectory }, null, 2));
  process.exit(0);
}

for (const row of candidates) {
  const item = {
    ...row.payload,
    status: "archived",
    indexable: false,
    updatedAt: timestamp,
    archivedAt: timestamp,
    archiveReason: row.payload.id.startsWith("webhook_blog_")
      ? "Automated Blog publication stopped during SEO content-quality recovery."
      : "External or duplicated Project Brief removed from Blog indexation during SEO content-quality recovery.",
  };
  await sql`UPDATE lead_store SET payload = ${JSON.stringify(item)}::jsonb WHERE store_name = 'cms-news.json' AND id = ${row.id}`;
}

const auditId = `seo_blog_governance_${Date.now()}`;
const audit = {
  id: auditId,
  createdAt: timestamp,
  updatedAt: timestamp,
  actor: "seo_governance",
  action: "archive_low_value_blog_records",
  target: `${candidates.length} Blog records`,
  result: "success",
};
await sql`
  INSERT INTO lead_store (store_name, id, created_at, payload)
  VALUES ('audit-logs.json', ${auditId}, ${timestamp}, ${JSON.stringify(audit)}::jsonb)
  ON CONFLICT (store_name, id) DO UPDATE SET payload = EXCLUDED.payload
`;

const dirtyId = `sitemap_dirty_${Date.now()}`;
const dirty = { id: dirtyId, createdAt: timestamp, updatedAt: timestamp, reason: "seo_blog_content_governance" };
await sql`
  INSERT INTO lead_store (store_name, id, created_at, payload)
  VALUES ('sitemap-dirty.json', ${dirtyId}, ${timestamp}, ${JSON.stringify(dirty)}::jsonb)
  ON CONFLICT (store_name, id) DO UPDATE SET payload = EXCLUDED.payload
`;

console.log(JSON.stringify({ mode: "applied", archived: candidates.length, backupDirectory, auditId }, null, 2));
