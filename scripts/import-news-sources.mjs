import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseSourceCatalog, toCsv, validateCatalog } from "../src/lib/news/source-catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = await readFile(path.join(root, "data", "news", "grimmfirepump-global-news-sources.md"), "utf8");
const records = parseSourceCatalog(raw);
const validation = validateCatalog(records);
if (!validation.valid) throw new Error(`Source catalog is not complete: ${JSON.stringify(validation)}`);
await mkdir(path.join(root, "data", "news"), { recursive: true });
await mkdir(path.join(root, "reports"), { recursive: true });
await Promise.all([
  writeFile(path.join(root, "data", "news", "source-catalog.seed.json"), `${JSON.stringify(records, null, 2)}\n`),
  writeFile(path.join(root, "data", "news", "source-catalog.seed.csv"), toCsv(records)),
  writeFile(path.join(root, "data", "news", "source-catalog.seed.md"), `# GRIMM PUMP source catalog seed\n\nImported records: ${records.length}\n\n${records.map((record) => `${record.ordinal}. ${record.name} - ${record.url}`).join("\n")}\n`),
  writeFile(path.join(root, "reports", "news-source-import-report.md"), `# News source import report\n\n- Records: ${records.length}\n- Validation: passed\n- Group counts: ${Object.entries(validation.groupCounts).map(([group, count]) => `${group}: ${count}`).join(", ")}\n`),
]);
console.log(JSON.stringify({ status: "imported", ...validation }, null, 2));