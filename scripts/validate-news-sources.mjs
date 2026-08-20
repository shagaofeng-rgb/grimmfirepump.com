import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseSourceCatalog, validateCatalog } from "../src/lib/news/source-catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = await readFile(path.join(root, "data", "news", "grimmfirepump-global-news-sources.md"), "utf8");
const records = parseSourceCatalog(raw);
const result = validateCatalog(records);
const domains = new Map();
for (const record of records) domains.set(record.domain, [...(domains.get(record.domain) || []), record]);
const csv = (rows) => rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n") + "\n";
await Promise.all([
  writeFile(path.join(root, "reports", "news-source-domain-dedup.csv"), csv([["domain", "records", "canonicalRecordId", "duplicateRecordIds"], ...[...domains.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([domain, entries]) => [domain, entries.length, entries[0].id, entries.slice(1).map((entry) => entry.id).join("|")])])),
  writeFile(path.join(root, "reports", "news-source-validation.csv"), csv([["id", "ordinal", "name", "url", "domain", "sourceGroup", "tier", "validationStatus", "discoveryMethod", "notes"], ...records.map((record) => [record.id, record.ordinal, record.name, record.url, record.domain, record.sourceGroup, record.tier, record.validationStatus, record.discoveryMethod.join("|"), "Not yet probed. A source validator must respect robots and classify public access before use."])])),
]);
console.log(JSON.stringify({ ...result, uniqueDomains: domains.size, duplicateDomains: [...domains.values()].filter((entries) => entries.length > 1).length }, null, 2));
if (!result.valid) process.exitCode = 1;