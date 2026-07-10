import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  acquireFileLock,
  buildSitemapIndexXml,
  buildUrlsetXml,
  chunkSitemapEntries,
  diffSitemapEntries,
  isSitemapRecordEligible,
  validateSitemapXml,
  writeSitemapFilesAtomically,
} from "../src/lib/sitemap-core.ts";
import { submitSitemapToSearchConsole } from "../src/lib/search-console.ts";

const entry = (url, lastModified = "2026-06-23T00:00:00.000Z") => ({ url, lastModified, group: "products" });

test("generates a normal Sitemap URL set", () => {
  const xml = buildUrlsetXml([entry("https://www.grimmfirepump.com/products/test-pump")]);
  assert.match(xml, /<urlset/);
  assert.match(xml, /<lastmod>2026-06-23T00:00:00.000Z<\/lastmod>/);
});

test("validates XML structure", () => {
  assert.equal(validateSitemapXml(buildUrlsetXml([entry("https://www.grimmfirepump.com/")])), true);
  assert.equal(validateSitemapXml("<urlset>"), false);
});

test("escapes URL XML characters", () => {
  const xml = buildUrlsetXml([entry("https://www.grimmfirepump.com/products/test?flow=10&head=20")]);
  assert.match(xml, /flow=10&amp;head=20/);
  assert.doesNotMatch(xml, /flow=10&head=20/);
});

test("excludes draft, noindex, future and non-self canonical records", () => {
  const expectedUrl = "https://www.grimmfirepump.com/products/test";
  assert.equal(isSitemapRecordEligible({ status: "draft", indexable: true, expectedUrl }), false);
  assert.equal(isSitemapRecordEligible({ status: "published", indexable: false, expectedUrl }), false);
  assert.equal(isSitemapRecordEligible({ status: "published", indexable: true, expectedUrl, publishAt: "2099-01-01" }), false);
  assert.equal(isSitemapRecordEligible({ status: "published", indexable: true, expectedUrl, canonicalUrl: "/products/other" }), false);
  assert.equal(isSitemapRecordEligible({ status: "published", indexable: true, expectedUrl, canonicalUrl: "/products/test" }), true);
});

test("reports deleted URLs as removed", () => {
  const removed = entry("https://www.grimmfirepump.com/products/removed");
  const current = entry("https://www.grimmfirepump.com/products/current");
  const diff = diffSitemapEntries([removed, current], [current]);
  assert.deepEqual(diff.removed, [removed.url]);
});

test("preserves source lastmod instead of using current time", () => {
  const xml = buildUrlsetXml([entry("https://www.grimmfirepump.com/products/test", "2024-02-03T04:05:06Z")]);
  assert.match(xml, /2024-02-03T04:05:06.000Z/);
  assert.doesNotMatch(xml, new RegExp(new Date().toISOString().slice(0, 10)));
});

test("splits large URL sets at configured threshold", () => {
  const chunks = chunkSitemapEntries("products", [1, 2, 3, 4, 5].map((id) => entry(`https://www.grimmfirepump.com/products/p-${id}`)), { maxUrls: 2 });
  assert.deepEqual(chunks.map((chunk) => chunk.entries.length), [2, 2, 1]);
  assert.equal(chunks[2].fileName, "products-3.xml");
});

test("generates a valid Sitemap index", () => {
  const chunks = chunkSitemapEntries("products", [entry("https://www.grimmfirepump.com/products/test")]);
  const xml = buildSitemapIndexXml("https://www.grimmfirepump.com", chunks);
  assert.equal(validateSitemapXml(xml), true);
  assert.match(xml, /sitemaps\/products-1.xml/);
});

test("prevents concurrent lock acquisition", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "grimm-sitemap-lock-"));
  const lockPath = path.join(dir, "run.lock");
  const release = await acquireFileLock(lockPath);
  assert.ok(release);
  assert.equal(await acquireFileLock(lockPath), null);
  await release();
  assert.ok(await acquireFileLock(lockPath));
  await rm(dir, { recursive: true, force: true });
});

test("preserves the previous file when a replacement is invalid", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "grimm-sitemap-write-"));
  const original = buildUrlsetXml([entry("https://www.grimmfirepump.com/products/original")]);
  await writeFile(path.join(dir, "sitemap.xml"), original);
  await assert.rejects(writeSitemapFilesAtomically(dir, { "sitemap.xml": "invalid" }));
  assert.equal(await readFile(path.join(dir, "sitemap.xml"), "utf8"), original);
  await rm(dir, { recursive: true, force: true });
});

function credentials() {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return JSON.stringify({ client_email: "sitemap@example.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }) });
}

test("submits through the Search Console Sitemaps API", async () => {
  const calls = [];
  const result = await submitSitemapToSearchConsole({
    env: {
      GOOGLE_SEARCH_CONSOLE_ENABLED: "true",
      GOOGLE_SEARCH_CONSOLE_SITE_URL: "https://www.grimmfirepump.com/",
      GOOGLE_SEARCH_CONSOLE_SITEMAP_URL: "https://www.grimmfirepump.com/sitemap.xml",
      GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON: credentials(),
    },
    fetchImpl: async (url, init = {}) => {
      calls.push([String(url), init.method || "GET"]);
      if (String(url).endsWith("sitemap.xml")) return new Response("<sitemapindex />", { status: 200 });
      if (String(url).includes("oauth2")) return Response.json({ access_token: "redacted-test-token" });
      return new Response(null, { status: 204 });
    },
  });
  assert.equal(result.success, true);
  assert.equal(calls.at(-1)[1], "PUT");
});

test("records Google authentication failure without throwing", async () => {
  const result = await submitSitemapToSearchConsole({
    env: {
      GOOGLE_SEARCH_CONSOLE_ENABLED: "true",
      GOOGLE_SEARCH_CONSOLE_SITE_URL: "https://www.grimmfirepump.com/",
      GOOGLE_SEARCH_CONSOLE_SITEMAP_URL: "https://www.grimmfirepump.com/sitemap.xml",
      GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON: credentials(),
    },
    fetchImpl: async (url) => String(url).endsWith("sitemap.xml") ? new Response("ok") : new Response("unauthorized", { status: 401 }),
  });
  assert.equal(result.success, false);
  assert.match(result.message, /authentication failed/i);
});

test("does not call Google when Search Console submission is disabled", async () => {
  let calls = 0;
  const result = await submitSitemapToSearchConsole({ env: { GOOGLE_SEARCH_CONSOLE_ENABLED: "false" }, fetchImpl: async () => { calls += 1; return new Response(); } });
  assert.equal(result.status, "disabled");
  assert.equal(calls, 0);
});
