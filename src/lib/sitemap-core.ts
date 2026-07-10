import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export type SitemapGroup = "pages" | "products" | "posts" | "categories";

export type SitemapEntry = {
  url: string;
  lastModified: string;
  group: SitemapGroup;
};

export type SitemapChunk = {
  group: SitemapGroup;
  fileName: string;
  entries: SitemapEntry[];
  lastModified: string;
  xml: string;
  bytes: number;
};

export function isSitemapRecordEligible(input: {
  status?: string;
  indexable?: boolean;
  canonicalUrl?: string;
  expectedUrl: string;
  publishAt?: string;
  now?: number;
}) {
  if (input.status && input.status !== "published") return false;
  if (input.indexable === false) return false;
  if (input.publishAt && new Date(input.publishAt).getTime() > (input.now ?? Date.now())) return false;
  if (!input.canonicalUrl) return true;
  try {
    const canonical = new URL(input.canonicalUrl, input.expectedUrl);
    const expected = new URL(input.expectedUrl);
    return !canonical.search && canonical.origin === expected.origin && canonical.pathname === expected.pathname;
  } catch {
    return false;
  }
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const URLSET_OPEN = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const URLSET_CLOSE = "</urlset>";

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function normalizeLastModified(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid lastmod: ${String(value)}`);
  return date.toISOString();
}

export function normalizeSitemapEntry(entry: SitemapEntry): SitemapEntry {
  const url = new URL(entry.url);
  url.hash = "";
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Unsupported Sitemap URL: ${entry.url}`);
  return { ...entry, url: url.toString(), lastModified: normalizeLastModified(entry.lastModified) };
}

function renderUrl(entry: SitemapEntry) {
  return `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>\n  </url>`;
}

export function buildUrlsetXml(entries: SitemapEntry[]) {
  const normalized = entries.map(normalizeSitemapEntry);
  return `${XML_HEADER}\n${URLSET_OPEN}\n${normalized.map(renderUrl).join("\n")}\n${URLSET_CLOSE}\n`;
}

export function buildSitemapIndexXml(
  origin: string,
  chunks: Array<Pick<SitemapChunk, "fileName" | "lastModified">>,
) {
  const base = origin.replace(/\/$/, "");
  const rows = chunks.map((chunk) => {
    const location = `${base}/sitemaps/${encodeURIComponent(chunk.fileName)}`;
    return `  <sitemap>\n    <loc>${escapeXml(location)}</loc>\n    <lastmod>${escapeXml(normalizeLastModified(chunk.lastModified))}</lastmod>\n  </sitemap>`;
  });
  return `${XML_HEADER}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</sitemapindex>\n`;
}

function byteLength(value: string) {
  return Buffer.byteLength(value, "utf8");
}

export function chunkSitemapEntries(
  group: SitemapGroup,
  entries: SitemapEntry[],
  limits: { maxUrls?: number; maxBytes?: number } = {},
) {
  const maxUrls = Math.min(limits.maxUrls || 45_000, 50_000);
  const maxBytes = Math.min(limits.maxBytes || 45 * 1024 * 1024, 50 * 1024 * 1024);
  const normalized = entries.map(normalizeSitemapEntry).sort((a, b) => a.url.localeCompare(b.url));
  const chunks: SitemapEntry[][] = [];
  let current: SitemapEntry[] = [];
  let currentBytes = byteLength(`${XML_HEADER}\n${URLSET_OPEN}\n${URLSET_CLOSE}\n`);

  for (const entry of normalized) {
    const rowBytes = byteLength(`${renderUrl(entry)}\n`);
    if (current.length && (current.length >= maxUrls || currentBytes + rowBytes > maxBytes)) {
      chunks.push(current);
      current = [];
      currentBytes = byteLength(`${XML_HEADER}\n${URLSET_OPEN}\n${URLSET_CLOSE}\n`);
    }
    current.push(entry);
    currentBytes += rowBytes;
  }
  if (current.length) chunks.push(current);

  return chunks.map((chunkEntries, index): SitemapChunk => {
    const xml = buildUrlsetXml(chunkEntries);
    const lastModified = chunkEntries.reduce(
      (latest, entry) => (entry.lastModified > latest ? entry.lastModified : latest),
      chunkEntries[0]?.lastModified || new Date(0).toISOString(),
    );
    return {
      group,
      fileName: `${group}-${index + 1}.xml`,
      entries: chunkEntries,
      lastModified,
      xml,
      bytes: byteLength(xml),
    };
  });
}

export function validateSitemapXml(xml: string) {
  const isIndex = xml.includes("<sitemapindex");
  const isUrlset = xml.includes("<urlset");
  if (!xml.startsWith(XML_HEADER)) return false;
  if (isIndex === isUrlset) return false;
  if (isIndex && !xml.trimEnd().endsWith("</sitemapindex>")) return false;
  if (isUrlset && !xml.trimEnd().endsWith(URLSET_CLOSE)) return false;
  if (/<loc>[^<]*&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml)) return false;
  return true;
}

export function diffSitemapEntries(previous: SitemapEntry[], current: SitemapEntry[]) {
  const previousMap = new Map(previous.map((entry) => [entry.url, entry.lastModified]));
  const currentMap = new Map(current.map((entry) => [entry.url, entry.lastModified]));
  return {
    added: current.filter((entry) => !previousMap.has(entry.url)).map((entry) => entry.url),
    modified: current
      .filter((entry) => previousMap.has(entry.url) && previousMap.get(entry.url) !== entry.lastModified)
      .map((entry) => entry.url),
    removed: previous.filter((entry) => !currentMap.has(entry.url)).map((entry) => entry.url),
  };
}

export async function writeSitemapFilesAtomically(outputDir: string, files: Record<string, string>) {
  await mkdir(outputDir, { recursive: true });
  const written: string[] = [];
  for (const [fileName, xml] of Object.entries(files)) {
    if (!validateSitemapXml(xml)) throw new Error(`Refusing to write invalid Sitemap XML: ${fileName}`);
    const target = path.join(outputDir, fileName);
    const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
    try {
      await writeFile(temporary, xml, { encoding: "utf8", flag: "wx" });
      const verification = await readFile(temporary, "utf8");
      if (!validateSitemapXml(verification)) throw new Error(`Temporary Sitemap verification failed: ${fileName}`);
      await rename(temporary, target);
      written.push(target);
    } catch (error) {
      await rm(temporary, { force: true }).catch(() => undefined);
      throw error;
    }
  }
  return written;
}

export async function acquireFileLock(lockPath: string, ttlMs = 10 * 60 * 1000) {
  await mkdir(path.dirname(lockPath), { recursive: true });
  const tryAcquire = async () => {
    const handle = await open(lockPath, "wx");
    await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
    await handle.close();
  };

  try {
    await tryAcquire();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "EEXIST") throw error;
    const details = await stat(lockPath).catch(() => null);
    if (!details || Date.now() - details.mtimeMs <= ttlMs) return null;
    await rm(lockPath, { force: true });
    await tryAcquire();
  }

  let released = false;
  return async () => {
    if (released) return;
    released = true;
    await rm(lockPath, { force: true });
  };
}
