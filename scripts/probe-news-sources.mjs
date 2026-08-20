import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseSourceCatalog } from "../src/lib/news/source-catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(root, "reports", "news-source-validation.csv");
const raw = await readFile(path.join(root, "data", "news", "grimmfirepump-global-news-sources.md"), "utf8");
const records = parseSourceCatalog(raw);
const timeoutMs = 12000;
const concurrent = 6;

function escaped(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function robotsPathAllowed(robots, pathname) {
  const lines = robots.split(/\r?\n/).map((line) => line.replace(/#.*/, "").trim());
  let applies = false; const disallows = [];
  for (const line of lines) {
    const [key, ...rest] = line.split(":"); const value = rest.join(":").trim();
    if (key.toLowerCase() === "user-agent") applies = value === "*" || value.toLowerCase().includes("grimm");
    if (applies && key.toLowerCase() === "disallow" && value) disallows.push(value);
  }
  return !disallows.some((rule) => pathname.startsWith(rule));
}
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { redirect: "manual", signal: controller.signal, headers: { "user-agent": "GRIMMPUMPSourceValidator/1.0 (+https://www.grimmfirepump.com/)" }, ...options }); }
  finally { clearTimeout(timer); }
}
async function probe(record) {
  const checkedAt = new Date().toISOString();
  try {
    const target = new URL(record.url); const robotsUrl = new URL("/robots.txt", target.origin);
    let robotsAllowed = ""; let robotsStatus = "";
    try {
      const robots = await fetchWithTimeout(robotsUrl);
      robotsStatus = String(robots.status);
      if (robots.ok) robotsAllowed = String(robotsPathAllowed(await robots.text(), target.pathname));
    } catch { robotsStatus = "unavailable"; }
    if (robotsAllowed === "false") return { ...record, status: "restricted", httpStatus: "", robotsAllowed, robotsStatus, checkedAt, notes: "robots.txt disallows the supplied path; no page content was read." };
    const response = await fetchWithTimeout(record.url, { method: "HEAD" });
    const status = response.status;
    const classification = (status >= 200 && status < 400) ? "valid" : ([401, 403, 429].includes(status) ? "restricted" : "invalid");
    return { ...record, status: classification, httpStatus: status, robotsAllowed: robotsAllowed || "unknown", robotsStatus, checkedAt, notes: classification === "valid" ? "Public endpoint reachable; editorial suitability remains subject to manual review." : `Endpoint returned HTTP ${status}; record retained and excluded from automatic publication.` };
  } catch (error) {
    return { ...record, status: "invalid", httpStatus: "", robotsAllowed: "unknown", robotsStatus: "unavailable", checkedAt, notes: `Network validation failed: ${error instanceof Error ? error.name : "unknown error"}` };
  }
}
const results = new Array(records.length); let index = 0;
await Promise.all(Array.from({ length: Math.min(concurrent, records.length) }, async () => {
  while (index < records.length) { const current = index++; results[current] = await probe(records[current]); }
}));
const header = ["id", "ordinal", "name", "url", "domain", "sourceGroup", "tier", "validationStatus", "httpStatus", "robotsAllowed", "robotsStatus", "lastCheckedAt", "notes"];
await writeFile(reportPath, [header.join(","), ...results.map((item) => [item.id, item.ordinal, item.name, item.url, item.domain, item.sourceGroup, item.tier, item.status, item.httpStatus, item.robotsAllowed, item.robotsStatus, item.checkedAt, item.notes].map(escaped).join(","))].join("\n") + "\n");
const counts = Object.fromEntries(["valid", "invalid", "restricted"].map((status) => [status, results.filter((item) => item.status === status).length]));
console.log(JSON.stringify({ checked: results.length, ...counts }, null, 2));