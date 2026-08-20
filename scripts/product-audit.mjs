import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(path.join(root, "src", "data", "synced-content.json"), "utf8"));
const products = Array.isArray(source.products) ? source.products : [];
const assetRoot = path.join(root, "public");
const exists = async (src) => { try { return Boolean(src?.startsWith("/") && (await stat(path.join(assetRoot, src))).isFile()); } catch { return false; } };
const audits = await Promise.all(products.map(async (product) => {
  const image = product.image || ""; const missingFields = [];
  if (!product.slug) missingFields.push("slug"); if (!product.title) missingFields.push("productName");
  if (!product.summary) missingFields.push("shortDescription"); if (!Array.isArray(product.specs) || !product.specs.length) missingFields.push("specifications");
  if (!image) missingFields.push("mainImage"); if (image && !await exists(image)) missingFields.push("verifiedMainImage");
  return { id: product.id || product.slug, slug: product.slug || "", category: product.category || "Unclassified", series: product.series, productName: product.title || "Untitled product", model: product.model, currentUrl: product.slug ? `https://www.grimmfirepump.com/products/${product.slug}` : "", shortDescription: product.summary, existingSpecifications: Object.fromEntries((product.specs || []).map((value, index) => [`specification_${index + 1}`, value])), existingImages: image ? [{ src: image, alt: product.title || "", ownership: image.startsWith("/assets/") ? "owned" : "unknown" }] : [], visibleApplications: product.applications || [], visibleIndustries: product.industries || [], downloads: product.downloads || [], missingFields, dataConfidence: missingFields.length === 0 ? "verified" : (product.summary || image) ? "partial" : "placeholder" };
}));
const map = new Map(); for (const audit of audits) map.set(audit.slug, [...(map.get(audit.slug) || []), audit.id]);
const duplicates = [...map.entries()].filter(([slug, ids]) => slug && ids.length > 1).map(([slug, ids]) => ({ kind: "slug", value: slug, ids }));
const profiles = audits.map((audit) => ({ productId: audit.id, productName: audit.productName, category: audit.category, primaryKeywords: [audit.productName, audit.category].filter(Boolean), secondaryKeywords: audit.visibleApplications, longTailKeywords: audit.visibleApplications.map((application) => `${audit.productName} for ${application}`), industries: audit.visibleIndustries, applicationScenarios: audit.visibleApplications, buyerRoles: ["EPC contractor", "fire protection engineer", "project procurement"], painPoints: ["configuration evidence", "project-specific selection"], selectionFactors: ["flow", "pressure", "driver", "water source", "local code"], approvedFactSources: ["src/data/synced-content.json", audit.currentUrl].filter(Boolean), prohibitedClaims: ["unverified certifications", "unverified performance", "customer and project claims"] }));
const csv = (rows) => rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n") + "\n";
await mkdir(path.join(root, "reports"), { recursive: true }); await mkdir(path.join(root, "data", "products"), { recursive: true });
await Promise.all([
  writeFile(path.join(root, "reports", "product-audit.json"), `${JSON.stringify(audits, null, 2)}\n`),
  writeFile(path.join(root, "reports", "product-audit.csv"), csv([["id", "slug", "category", "productName", "dataConfidence", "missingFields"], ...audits.map((audit) => [audit.id, audit.slug, audit.category, audit.productName, audit.dataConfidence, audit.missingFields.join("|")])])),
  writeFile(path.join(root, "reports", "product-data-gaps.md"), `# Product data gaps\n\n${audits.filter((audit) => audit.missingFields.length).map((audit) => `- **${audit.productName}**: ${audit.missingFields.join(", ")}`).join("\n") || "No gaps detected by the structured audit."}\n`),
  writeFile(path.join(root, "reports", "product-duplicate-and-slug-audit.md"), `# Product duplicate and slug audit\n\n${duplicates.length ? duplicates.map((item) => `- ${item.kind}: ${item.value} (${item.ids.join(", ")})`).join("\n") : "No duplicate slugs detected."}\n`),
  writeFile(path.join(root, "data", "products", "product-topic-profiles.json"), `${JSON.stringify(profiles, null, 2)}\n`),
  writeFile(path.join(root, "reports", "product-keyword-industry-scenario-matrix.csv"), csv([["productId", "productName", "category", "primaryKeywords", "industries", "applicationScenarios"], ...profiles.map((profile) => [profile.productId, profile.productName, profile.category, profile.primaryKeywords.join("|"), profile.industries.join("|"), profile.applicationScenarios.join("|")])])),
]);
console.log(JSON.stringify({ products: audits.length, duplicates: duplicates.length, gaps: audits.filter((audit) => audit.missingFields.length).length }, null, 2));