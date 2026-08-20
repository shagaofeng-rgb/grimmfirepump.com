export const SOURCE_GROUPS = [
  "fire-protection-life-safety",
  "pump-fluid-handling",
  "mep-building-codes",
  "water-infrastructure",
  "industrial-safety-oil-gas-mining",
] as const;

export type SourceGroup = (typeof SOURCE_GROUPS)[number];
export type SourceTier = "A" | "B" | "C" | "discovery-only";
export type SourceValidationStatus = "pending" | "valid" | "invalid" | "restricted";

export type NewsSourceCatalogRecord = {
  id: string; ordinal: number; name: string; url: string; domain: string; sourceGroup: SourceGroup;
  industryTags: string[]; discoveryMethod: Array<"rss" | "sitemap" | "public-page" | "api">;
  tier: SourceTier; active: boolean; validationStatus: SourceValidationStatus; lastCheckedAt?: string;
  lastUsedAt?: string; useCount: number; notes?: string;
};

const groupByOrdinal = (ordinal: number): SourceGroup => ordinal <= 60 ? "fire-protection-life-safety"
  : ordinal <= 120 ? "pump-fluid-handling" : ordinal <= 180 ? "mep-building-codes"
  : ordinal <= 240 ? "water-infrastructure" : "industrial-safety-oil-gas-mining";

const tierA = ["nfpa", "sfpe", "fm global", "ul solutions", "nfsa", "afsa", "icc", "awwa", "iwa", "hydraulic institute", "europump", "ashrae", "aspe", "nist", "iafc", "fema", "wef"];

function inferredTier(name: string, domain: string): SourceTier {
  const candidate = `${name} ${domain}`.toLowerCase();
  if (tierA.some((term) => candidate.includes(term))) return "A";
  return /(journal|magazine|newsroom|engineering|technology|buyer|world|network)/.test(candidate) ? "B" : "C";
}

export function normalizeSourceUrl(value: string) {
  const parsed = new URL(value.trim()); parsed.hash = ""; parsed.hostname = parsed.hostname.toLowerCase();
  return parsed.toString().replace(/\/$/, "");
}

export function normalizeSourceDomain(value: string) {
  return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
}

export function parseSourceCatalog(markdown: string): NewsSourceCatalogRecord[] {
  const records: NewsSourceCatalogRecord[] = [];
  for (const match of markdown.matchAll(/^\s*(\d{1,3})\.\s+(.+?)\s+-\s+(https?:\/\/\S+)\s*$/gm)) {
    const ordinal = Number(match[1]); const name = match[2].trim(); const url = normalizeSourceUrl(match[3]);
    const sourceGroup = groupByOrdinal(ordinal);
    records.push({
      id: `grimm-source-${String(ordinal).padStart(3, "0")}`, ordinal, name, url, domain: normalizeSourceDomain(url),
      sourceGroup, industryTags: sourceGroup.split("-").filter((tag) => !["and", "oil", "gas"].includes(tag)),
      discoveryMethod: ["rss", "sitemap", "public-page"], tier: inferredTier(name, normalizeSourceDomain(url)),
      active: true, validationStatus: "pending", useCount: 0,
    });
  }
  return records.sort((a, b) => a.ordinal - b.ordinal);
}

export function validateCatalog(records: NewsSourceCatalogRecord[]) {
  const ordinals = records.map((record) => record.ordinal);
  const duplicateOrdinals = ordinals.filter((ordinal, index) => ordinals.indexOf(ordinal) !== index);
  const duplicateUrls = records.filter((record, index) => records.findIndex((candidate) => candidate.url === record.url) !== index).map((record) => record.id);
  const missingOrdinals = Array.from({ length: 300 }, (_, index) => index + 1).filter((ordinal) => !ordinals.includes(ordinal));
  const groupCounts = Object.fromEntries(SOURCE_GROUPS.map((group) => [group, records.filter((record) => record.sourceGroup === group).length]));
  return { valid: records.length === 300 && !duplicateOrdinals.length && !missingOrdinals.length && SOURCE_GROUPS.every((group) => groupCounts[group] === 60), recordCount: records.length, duplicateOrdinals: [...new Set(duplicateOrdinals)], duplicateUrls: [...new Set(duplicateUrls)], missingOrdinals, groupCounts };
}

export function toCsv(records: NewsSourceCatalogRecord[]) {
  const fields = ["id", "ordinal", "name", "url", "domain", "sourceGroup", "industryTags", "tier", "active", "validationStatus", "useCount"] as const;
  const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [fields.join(","), ...records.map((record) => fields.map((field) => quote(Array.isArray(record[field]) ? record[field].join("|") : record[field])).join(","))].join("\n") + "\n";
}