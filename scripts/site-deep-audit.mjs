import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.AUDIT_BASE_URL || "http://localhost:4174").replace(/\/$/, "");
const productionOrigin = "https://www.grimmfirepump.com";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decodeXml(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function xmlLocations(xml) {
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => decodeXml(match[1]));
}

function attribute(tag, name) {
  return tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || "";
}

function pageTemplate(pathname) {
  if (pathname === "/") return "home";
  const parts = pathname.split("/").filter(Boolean);
  if (["es", "ru", "ar", "fr", "pt"].includes(parts[0])) return `localized-${parts[1] || "home"}`;
  if (["products", "blog", "news", "applications", "knowledge"].includes(parts[0]) && parts.length > 1) return `${parts[0]}-detail`;
  return parts[0] || "home";
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

async function fetchText(pathname, options = {}) {
  const started = Date.now();
  const response = await fetch(`${baseUrl}${pathname}`, { redirect: "manual", signal: AbortSignal.timeout(20000), ...options });
  return { response, text: await response.text(), elapsed: Date.now() - started };
}

async function auditSitemapPage(url) {
  const source = new URL(url);
  const expectedCanonical = source.pathname === "/" ? productionOrigin : `${productionOrigin}${source.pathname}`;
  const { response, text, elapsed } = await fetchText(source.pathname);
  const contentType = response.headers.get("content-type") || "";
  const issues = [];
  if (response.status !== 200) issues.push(`HTTP ${response.status}`);
  if (!contentType.includes("text/html")) issues.push(`unexpected content-type ${contentType}`);
  const canonicalTag = text.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || text.match(/<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i)?.[0] || "";
  const canonical = attribute(canonicalTag, "href");
  if (canonical !== expectedCanonical) issues.push(`canonical ${canonical || "missing"}`);
  const descriptionTag = text.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] || "";
  const description = attribute(descriptionTag, "content");
  if (!description) issues.push("missing meta description");
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(text);
  if (noindex) issues.push("noindex");
  const h1Count = (text.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) issues.push(`${h1Count} H1 elements`);
  const htmlTag = text.match(/<html\b[^>]*>/i)?.[0] || "";
  const lang = attribute(htmlTag, "lang");
  const locale = source.pathname.match(/^\/(es|ru|ar|fr|pt)(?:\/|$)/)?.[1] || "en";
  if (!lang.toLowerCase().startsWith(locale)) issues.push(`lang ${lang || "missing"}`);
  if (locale === "ar" && attribute(htmlTag, "dir") !== "rtl") issues.push("Arabic page missing html dir=rtl");
  const internalTargets = Array.from(text.matchAll(/<a\b[^>]*>/gi), ([tag]) => attribute(tag, "href"))
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .map((href) => new URL(href, productionOrigin).pathname);
  return { path: source.pathname, status: response.status, elapsed, canonical, noindex, description, internalTargets, issues };
}

async function mapConcurrent(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current]);
    }
  }));
  return results;
}

async function main() {
  const failures = [];
  const index = await fetchText("/sitemap.xml");
  assert(index.response.status === 200, `Sitemap Index returned ${index.response.status}`);
  assert((index.response.headers.get("content-type") || "").includes("application/xml"), "Sitemap Index content-type is not application/xml");
  const shardUrls = xmlLocations(index.text);
  assert(shardUrls.length >= 4, "Sitemap Index is missing expected shards");
  assert(shardUrls.every((url) => new URL(url).origin === productionOrigin), "Sitemap Index has an off-site shard");

  const pageUrls = [];
  for (const shardUrl of shardUrls) {
    const shardPath = new URL(shardUrl).pathname;
    const shard = await fetchText(shardPath);
    assert(shard.response.status === 200, `${shardPath} returned ${shard.response.status}`);
    assert((shard.response.headers.get("content-type") || "").includes("application/xml"), `${shardPath} content-type is not application/xml`);
    pageUrls.push(...xmlLocations(shard.text));
  }
  assert(new Set(pageUrls).size === pageUrls.length, "Sitemap contains duplicate URLs");
  assert(pageUrls.every((url) => new URL(url).origin === productionOrigin), "Sitemap contains an off-site URL");
  assert(!pageUrls.some((url) => new URL(url).search || new URL(url).pathname.includes("/search")), "Sitemap contains search or parameter URLs");
  const pages = await mapConcurrent(pageUrls, 8, auditSitemapPage);
  for (const page of pages) if (page.issues.length) failures.push(`${page.path}: ${page.issues.join(", ")}`);

  const descriptions = new Map();
  for (const page of pages) {
    if (!page.description) continue;
    const prior = descriptions.get(page.description);
    if (prior) failures.push(`${page.path}: duplicate meta description also used by ${prior}`);
    else descriptions.set(page.description, page.path);
  }
  const sitemapPaths = new Set(pageUrls.map((url) => new URL(url).pathname));
  const linkedPaths = new Set(pages.flatMap((page) => page.internalTargets));
  const additionalPaths = [...linkedPaths].filter((pathname) => !sitemapPaths.has(pathname));
  const additionalResults = await mapConcurrent(additionalPaths, 8, async (pathname) => {
    const { response, text } = await fetchText(pathname);
    const canonicalTag = text.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || "";
    return {
      pathname,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      canonical: attribute(canonicalTag, "href"),
      noindex: /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(text),
    };
  });
  for (const result of additionalResults) {
    if (result.status !== 200) failures.push(`${result.pathname}: internal link returned HTTP ${result.status}`);
    if (result.status === 200 && result.contentType.includes("text/html") && !result.noindex
      && result.canonical === `${productionOrigin}${result.pathname}`) {
      failures.push(`${result.pathname}: indexable internal page is absent from Sitemap`);
    }
  }

  if (process.env.AUDIT_CSV_PATH) {
    const observedAt = new Date().toISOString();
    const rows = [
      ["url", "template", "discovered_via", "http_status", "canonical", "noindex", "disposition", "gsc_last_crawl", "gsc_validation", "observed_at"],
      ...pages.map((page) => [
        `${productionOrigin}${page.path === "/" ? "" : page.path}`, pageTemplate(page.path), "sitemap", page.status,
        page.canonical, page.noindex, page.issues.length ? "needs-review" : "public-checks-pass-awaiting-gsc-recrawl", "not-exported", "not-exported", observedAt,
      ]),
      ...additionalResults.map((page) => [
        `${productionOrigin}${page.pathname}`, pageTemplate(page.pathname), "internal-link", page.status,
        page.canonical, page.noindex, !page.contentType.includes("text/html") ? "non-html-resource"
          : page.noindex ? "intentional-exclusion-review" : "not-in-sitemap-review", "not-exported", "not-exported", observedAt,
      ]),
    ];
    await writeFile(process.env.AUDIT_CSV_PATH, `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
  }

  const robots = await fetchText("/robots.txt");
  assert(robots.response.status === 200, "robots.txt is unavailable");
  assert(robots.text.includes(`Sitemap: ${productionOrigin}/sitemap.xml`), "robots.txt Sitemap declaration is incorrect");
  assert(/^Disallow:\s*\/admin\/?\s*$/mi.test(robots.text), "robots.txt does not disallow admin routes");
  assert(/^Disallow:\s*\/api\/\s*$/mi.test(robots.text), "robots.txt does not disallow API routes");
  assert(!/^Disallow:\s*\/(?:es\/|ru\/|ar\/|fr\/|pt\/)?search\s*$/mi.test(robots.text), "Robots blocks search pages before crawlers can read their noindex");

  const admin = await fetchText("/admin");
  assert([302, 303, 307, 308].includes(admin.response.status), `/admin should redirect to login, got ${admin.response.status}`);
  for (const protectedPath of ["/api/admin/news/jobs", "/api/inquiries", "/api/download-leads", "/api/analytics"]) {
    const protectedApi = await fetchText(protectedPath);
    assert([401, 403, 302, 303, 307, 308].includes(protectedApi.response.status), `${protectedPath} returned ${protectedApi.response.status} without a session`);
  }
  const login = await fetchText("/admin/login");
  assert(login.response.status === 200 && /noindex/i.test(login.text), "Admin login must be available and noindex");

  const security = await fetchText("/");
  for (const header of ["x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"]) {
    assert(Boolean(security.response.headers.get(header)), `Missing security header ${header}`);
  }

  const elapsed = pages.map((page) => page.elapsed).sort((a, b) => a - b);
  const p95 = elapsed[Math.floor(elapsed.length * 0.95)] || 0;
  console.log(JSON.stringify({
    baseUrl,
    sitemapShards: shardUrls.length,
    publicUrls: pageUrls.length,
    linkedPaths: linkedPaths.size,
    additionalLinkedPaths: additionalPaths.length,
    failures,
    latencyMs: { median: elapsed[Math.floor(elapsed.length / 2)] || 0, p95, max: elapsed.at(-1) || 0 },
    slowest: [...pages].sort((a, b) => b.elapsed - a.elapsed).slice(0, 10).map(({ path, elapsed }) => ({ path, elapsed })),
  }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
