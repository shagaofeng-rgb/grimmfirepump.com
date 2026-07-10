const baseUrl = process.env.AUDIT_BASE_URL || "http://localhost:4174";

const routes = [
  "/",
  "/products",
  "/products/edj-fire-pump-set",
  "/applications",
  "/projects",
  "/factory",
  "/downloads",
  "/news",
  "/blog",
  "/knowledge",
  "/contact",
  "/search?q=fire%20pump",
  "/sitemap.xml",
  "/sitemaps/pages-1.xml",
  "/sitemaps/products-1.xml",
  "/sitemaps/posts-1.xml",
  "/sitemaps/categories-1.xml",
  "/robots.txt",
  "/news/rss.xml",
  "/blog/rss.xml",
  "/api/news",
  "/api/news/categories",
  "/api/search?q=fire%20pump",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkRoute(path) {
  const url = new URL(path, baseUrl).toString();
  const started = Date.now();
  const response = await fetch(url, { redirect: "manual" });
  const elapsed = Date.now() - started;
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  assert(response.status >= 200 && response.status < 400, `${path} returned HTTP ${response.status}`);

  if (contentType.includes("text/html")) {
    assert(/<title>|<h1/i.test(body), `${path} is missing basic title or h1 content`);
    assert(!body.includes("NEXT_HTTP_ERROR_FALLBACK"), `${path} rendered a Next.js error fallback`);
  }

  if (path.endsWith(".xml")) {
    assert(body.includes("<?xml") || body.includes("<urlset") || body.includes("<rss"), `${path} is not valid XML/RSS output`);
  }

  if (path === "/sitemap.xml") {
    assert(body.includes("https://www.grimmfirepump.com/sitemaps/"), "Sitemap index does not use the production www domain");
    assert(!body.includes("/search"), "Sitemap index must not include search pages");
  }

  if (path === "/robots.txt") {
    assert(body.includes("Sitemap: https://www.grimmfirepump.com/sitemap.xml"), "robots.txt is missing the production Sitemap declaration");
  }

  if (path.startsWith("/api/")) {
    JSON.parse(body);
  }

  return { path, status: response.status, elapsed, bytes: body.length };
}

async function main() {
  const results = [];
  const failures = [];

  for (const route of routes) {
    try {
      results.push(await checkRoute(route));
    } catch (error) {
      failures.push({ path: route, error: error.message });
    }
  }

  console.table(results);
  if (failures.length) {
    console.table(failures);
    process.exitCode = 1;
    return;
  }

  console.log(`Self-audit passed for ${results.length} routes at ${baseUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
