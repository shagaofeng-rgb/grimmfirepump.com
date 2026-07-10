import crypto from "node:crypto";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { applications, company, knowledgePosts } from "@/data/site";
import { listCmsNews, listCmsProducts, listManagedPages } from "@/lib/admin-cms";
import { localizedLocales, localizedPath, supportedLocalizedPaths } from "@/lib/i18n";
import { acquireTaskLock, createId, readStore, writeStore } from "@/lib/local-store";
import { listPublishedNews } from "@/lib/news-automation";
import { submitSitemapToSearchConsole, type SearchConsoleSubmission } from "@/lib/search-console";
import { markSitemapDirty } from "@/lib/sitemap-dirty";
import {
  buildSitemapIndexXml,
  chunkSitemapEntries,
  diffSitemapEntries,
  normalizeLastModified,
  type SitemapChunk,
  type SitemapEntry,
  type SitemapGroup,
  writeSitemapFilesAtomically,
} from "@/lib/sitemap-core";

const MANIFEST_STORE = "sitemap-manifest.json";
const RUNS_STORE = "sitemap-runs.json";
const DIRTY_STORE = "sitemap-dirty.json";
const STATIC_CONTENT_UPDATED_AT = "2026-07-10T00:00:00.000Z";
const GROUPS: SitemapGroup[] = ["pages", "products", "posts", "categories"];

export type SitemapManifest = {
  id: "sitemap_manifest";
  createdAt: string;
  updatedAt: string;
  digest: string;
  entries: SitemapEntry[];
  files: Array<{ fileName: string; lastModified: string; bytes: number; urls: number }>;
};

export type SitemapRun = {
  id: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  trigger: string;
  status: "success" | "skipped" | "failed" | "locked";
  processed: number;
  success: number;
  skipped: number;
  errors: string[];
  files: Array<{ fileName: string; bytes: number; urls: number }>;
  split: boolean;
  added: string[];
  modified: string[];
  removed: string[];
  robotsDeclared: boolean;
  searchConsole: SearchConsoleSubmission;
  message: string;
};

export type SitemapBundle = {
  origin: string;
  entries: SitemapEntry[];
  chunks: SitemapChunk[];
  indexXml: string;
  skipped: string[];
  errors: string[];
};

export function getSiteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL || company.website).replace(/\/$/, "");
}

function absoluteUrl(pathname: string) {
  const url = new URL(pathname, `${getSiteOrigin()}/`);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function canonicalIsSelf(canonical: string, expectedPath: string) {
  if (!canonical) return true;
  try {
    const canonicalUrl = new URL(canonical, `${getSiteOrigin()}/`);
    const expectedUrl = new URL(expectedPath, `${getSiteOrigin()}/`);
    return !canonicalUrl.search && canonicalUrl.origin === expectedUrl.origin && canonicalUrl.pathname === expectedUrl.pathname;
  } catch {
    return false;
  }
}

function safeSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function latestDate(values: string[], fallback = STATIC_CONTENT_UPDATED_AT) {
  const valid = values.map((value) => new Date(value)).filter((date) => !Number.isNaN(date.getTime()));
  if (!valid.length) return normalizeLastModified(fallback);
  return normalizeLastModified(new Date(Math.max(...valid.map((date) => date.getTime()))));
}

function addEntry(map: Map<string, SitemapEntry>, entry: SitemapEntry, errors: string[]) {
  try {
    const normalized: SitemapEntry = { ...entry, lastModified: normalizeLastModified(entry.lastModified) };
    new URL(normalized.url);
    const existing = map.get(normalized.url);
    if (!existing || existing.lastModified < normalized.lastModified) map.set(normalized.url, normalized);
  } catch (error) {
    errors.push(`${entry.url}: ${error instanceof Error ? error.message : "invalid Sitemap record"}`);
  }
}

async function buildSitemapBundleUncached(): Promise<SitemapBundle> {
  const [products, blogPosts, managedPages, automatedNews] = await Promise.all([
    listCmsProducts(),
    listCmsNews(),
    listManagedPages(),
    listPublishedNews(),
  ]);
  const maps = new Map<SitemapGroup, Map<string, SitemapEntry>>(GROUPS.map((group) => [group, new Map()]));
  const skipped: string[] = [];
  const errors: string[] = [];
  const add = (group: SitemapGroup, pathname: string, lastModified: string) => {
    addEntry(maps.get(group)!, { group, url: absoluteUrl(pathname), lastModified }, errors);
  };

  const managedPageBySlug = new Map(managedPages.map((page) => [page.slug === "/" ? "/" : `/${page.slug.replace(/^\//, "")}`, page]));
  const pagePaths = ["/", "/about", "/projects", "/factory", "/testing", "/certificates", "/downloads", "/contact", "/tools/fire-pump-selector"];
  for (const pathname of pagePaths) {
    const managed = managedPageBySlug.get(pathname);
    if (managed && managed.status !== "published") {
      skipped.push(`${pathname}: page status is ${managed.status}`);
      continue;
    }
    add("pages", pathname, managed?.updatedAt || STATIC_CONTENT_UPDATED_AT);
  }

  for (const locale of localizedLocales) {
    for (const pathname of supportedLocalizedPaths) {
      if (pathname === "/search") continue;
      add("pages", localizedPath(pathname, locale), STATIC_CONTENT_UPDATED_AT);
    }
  }

  for (const product of products) {
    const pathname = `/products/${product.slug}`;
    if (product.status !== "published" || !product.indexable) {
      skipped.push(`${pathname}: unpublished or noindex`);
      continue;
    }
    if (!safeSlug(product.slug) || !canonicalIsSelf(product.canonicalUrl, pathname)) {
      skipped.push(`${pathname}: invalid slug or non-self canonical`);
      continue;
    }
    add("products", pathname, product.updatedAt || product.createdAt);
  }

  for (const post of blogPosts) {
    const pathname = `/blog/${post.slug}`;
    if (post.status !== "published" || !post.indexable || new Date(post.publishAt).getTime() > Date.now()) {
      skipped.push(`${pathname}: unpublished, scheduled or noindex`);
      continue;
    }
    if (!safeSlug(post.slug)) {
      skipped.push(`${pathname}: invalid slug`);
      continue;
    }
    add("posts", pathname, post.updatedAt || post.publishAt || post.createdAt);
  }

  for (const article of automatedNews) {
    const pathname = `/news/${article.slug}`;
    if (!safeSlug(article.slug) || new Date(article.publishAt || article.createdAt).getTime() > Date.now()) {
      skipped.push(`${pathname}: invalid slug or scheduled`);
      continue;
    }
    add("posts", pathname, article.updatedAt || article.publishAt || article.createdAt);
  }

  for (const post of knowledgePosts) add("posts", `/knowledge/${post.slug}`, post.date);

  const productDates = products.filter((item) => item.status === "published" && item.indexable).map((item) => item.updatedAt || item.createdAt);
  const blogDates = blogPosts.filter((item) => item.status === "published" && item.indexable).map((item) => item.updatedAt || item.publishAt);
  const newsDates = automatedNews.map((item) => item.updatedAt || item.publishAt || item.createdAt);
  const knowledgeDates = knowledgePosts.map((item) => item.date);
  add("categories", "/products", latestDate(productDates));
  add("categories", "/applications", STATIC_CONTENT_UPDATED_AT);
  add("categories", "/blog", latestDate(blogDates));
  add("categories", "/news", latestDate(newsDates, STATIC_CONTENT_UPDATED_AT));
  add("categories", "/knowledge", latestDate(knowledgeDates));
  for (const application of applications) add("categories", `/applications/${application.slug}`, STATIC_CONTENT_UPDATED_AT);

  const entries = GROUPS.flatMap((group) => Array.from(maps.get(group)!.values()));
  const chunks = GROUPS.flatMap((group) => chunkSitemapEntries(group, Array.from(maps.get(group)!.values())));
  return { origin: getSiteOrigin(), entries, chunks, indexXml: buildSitemapIndexXml(getSiteOrigin(), chunks), skipped, errors };
}

export const buildSitemapBundle = unstable_cache(buildSitemapBundleUncached, ["sitemap-bundle-v2"], {
  revalidate: 300,
  tags: ["sitemap-data"],
});

function digestEntries(entries: SitemapEntry[]) {
  return crypto.createHash("sha256").update(JSON.stringify(entries.map((item) => [item.url, item.lastModified]).sort())).digest("hex");
}

export { markSitemapDirty };

export async function listSitemapRuns() {
  return (await readStore<SitemapRun[]>(RUNS_STORE, [])).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function saveRun(run: SitemapRun) {
  const runs = await readStore<SitemapRun[]>(RUNS_STORE, []);
  await writeStore(RUNS_STORE, [run, ...runs.filter((item) => item.id !== run.id)].slice(0, 100));
}

export async function runSitemapMaintenance(options: {
  trigger: string;
  force?: boolean;
  dryRun?: boolean;
  submit?: boolean;
  verbose?: boolean;
}) {
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const release = await acquireTaskLock("sitemap-generation", 15 * 60 * 1000);
  if (!release) {
    const now = new Date().toISOString();
    const lockedRun: SitemapRun = {
      id: createId("sitemap_run"), createdAt: now, updatedAt: now, startedAt, finishedAt: now,
      durationMs: Date.now() - started, trigger: options.trigger, status: "locked", processed: 0, success: 0,
      skipped: 0, errors: [], files: [], split: false, added: [], modified: [], removed: [], robotsDeclared: true,
      searchConsole: { attempted: false, success: false, status: "disabled", message: "Skipped because another Sitemap task holds the lock." },
      message: "Another Sitemap task is already running.",
    };
    await saveRun(lockedRun);
    return lockedRun;
  }

  try {
    const bundle = await buildSitemapBundle();
    const manifests = await readStore<SitemapManifest[]>(MANIFEST_STORE, []);
    const previous = manifests[0];
    const diff = diffSitemapEntries(previous?.entries || [], bundle.entries);
    const digest = digestEntries(bundle.entries);
    const changed = options.force || !previous || previous.digest !== digest;
    const files = Object.fromEntries([
      ["sitemap.xml", bundle.indexXml],
      ...bundle.chunks.map((chunk) => [chunk.fileName, chunk.xml]),
    ]);

    if (!options.dryRun && changed) {
      const outputDir = process.env.VERCEL ? path.join("/tmp", "grimm-pump-sitemaps") : path.join(process.cwd(), "data", "runtime", "sitemaps");
      await writeSitemapFilesAtomically(outputDir, files);
      const now = new Date().toISOString();
      const manifest: SitemapManifest = {
        id: "sitemap_manifest",
        createdAt: previous?.createdAt || now,
        updatedAt: now,
        digest,
        entries: bundle.entries,
        files: bundle.chunks.map((chunk) => ({ fileName: chunk.fileName, lastModified: chunk.lastModified, bytes: chunk.bytes, urls: chunk.entries.length })),
      };
      await writeStore(MANIFEST_STORE, [manifest]);
      await writeStore(DIRTY_STORE, []);
    }

    const searchConsole = options.submit && !options.dryRun && changed
      ? await submitSitemapToSearchConsole()
      : { attempted: false, success: false, status: "disabled" as const, message: "Submission not requested or Sitemap unchanged." };
    const finishedAt = new Date().toISOString();
    const run: SitemapRun = {
      id: createId("sitemap_run"),
      createdAt: finishedAt,
      updatedAt: finishedAt,
      startedAt,
      finishedAt,
      durationMs: Date.now() - started,
      trigger: options.trigger,
      status: bundle.errors.length ? "failed" : changed ? "success" : "skipped",
      processed: bundle.entries.length + bundle.skipped.length + bundle.errors.length,
      success: bundle.entries.length,
      skipped: bundle.skipped.length,
      errors: bundle.errors,
      files: bundle.chunks.map((chunk) => ({ fileName: chunk.fileName, bytes: chunk.bytes, urls: chunk.entries.length })),
      split: bundle.chunks.some((chunk) => chunk.fileName.endsWith("-2.xml")),
      added: diff.added,
      modified: diff.modified,
      removed: diff.removed,
      robotsDeclared: true,
      searchConsole,
      message: options.dryRun ? "Dry run completed; no files or manifest were changed." : changed ? "Sitemap generated and verified." : "Sitemap already matches public content.",
    };
    await saveRun(run);
    return run;
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const run: SitemapRun = {
      id: createId("sitemap_run"), createdAt: finishedAt, updatedAt: finishedAt, startedAt, finishedAt,
      durationMs: Date.now() - started, trigger: options.trigger, status: "failed", processed: 0, success: 0, skipped: 0,
      errors: [error instanceof Error ? error.message : "Unknown Sitemap maintenance error"], files: [], split: false,
      added: [], modified: [], removed: [], robotsDeclared: true,
      searchConsole: { attempted: false, success: false, status: "failed", message: "Sitemap generation failed before Search Console submission." },
      message: "Sitemap generation failed; the last valid Sitemap snapshot was preserved.",
    };
    await saveRun(run);
    return run;
  } finally {
    await release();
  }
}
