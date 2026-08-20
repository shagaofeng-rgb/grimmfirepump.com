import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(path.join(root, "src", "data", "synced-content.json"), "utf8"));
const products = Array.isArray(source.products) ? source.products : [];
const assetRoot = path.join(root, "public");
const exists = async (src) => { try { return Boolean(src?.startsWith("/") && (await stat(path.join(assetRoot, src))).isFile()); } catch { return false; } };
const normalize = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();
const hasPlaceholder = (value) => /^(tbd|todo|n\/a|na|placeholder|untitled|sample)$/i.test(cleanText(value));
const modelCandidates = (product) => {
  const values = [product.model, ...(product.detailLines || []), ...(product.specs || [])].map(cleanText);
  const direct = values.filter((value) => /^(model\s*[:：]\s*)?[a-z]{1,8}[-\d/().a-z]+$/i.test(value));
  return [...new Set(direct.map((value) => value.replace(/^model\s*[:：]\s*/i, "")))];
};
const audits = await Promise.all(products.map(async (product, index) => {
  const image = product.image || ""; const missingFields = [];
  const specs = Array.isArray(product.specs) ? product.specs.filter((spec) => cleanText(spec)) : [];
  const models = modelCandidates(product);
  if (!product.slug || hasPlaceholder(product.slug)) missingFields.push("slug");
  if (!product.title || hasPlaceholder(product.title)) missingFields.push("productName");
  if (!product.summary || hasPlaceholder(product.summary)) missingFields.push("shortDescription");
  if (!specs.length) missingFields.push("specifications");
  if (!image) missingFields.push("mainImage");
  if (image && !await exists(image)) missingFields.push("verifiedMainImage");
  if (!models.length && !product.model) missingFields.push("modelOrSeries");
  if (specs.some((spec) => hasPlaceholder(spec))) missingFields.push("placeholderSpecification");
  return {
    id: product.id || product.slug || `product-${index + 1}`,
    slug: product.slug || "",
    category: product.category || "Unclassified",
    series: product.series,
    productName: product.title || "Untitled product",
    model: product.model || models[0],
    currentUrl: product.slug ? `https://www.grimmfirepump.com/products/${product.slug}` : "",
    shortDescription: product.summary,
    existingSpecifications: Object.fromEntries(specs.map((value, specIndex) => [`specification_${specIndex + 1}`, value])),
    existingImages: image ? [{ src: image, alt: product.title || "", ownership: image.startsWith("/assets/") ? "owned" : "unknown" }] : [],
    visibleApplications: product.applications || [],
    visibleIndustries: product.industries || [],
    downloads: product.downloads || [],
    missingFields,
    dataConfidence: missingFields.length === 0 ? "verified" : (product.summary || image) ? "partial" : "placeholder",
    _models: models,
  };
}));
const duplicateEntries = (entries, kind) => {
  const map = new Map();
  for (const [value, id] of entries) {
    const key = normalize(value);
    if (key) map.set(key, [...(map.get(key) || []), id]);
  }
  return [...map.entries()].filter(([, ids]) => ids.length > 1).map(([value, ids]) => ({ kind, value, ids }));
};
const duplicateSlugs = duplicateEntries(audits.map((audit) => [audit.slug, audit.id]), "slug");
const duplicateModels = duplicateEntries(audits.flatMap((audit) => audit._models.map((model) => [model, audit.id])), "model");
const duplicates = [...duplicateSlugs, ...duplicateModels];
const publicAudits = audits.map(({ _models, ...audit }) => audit);
const profiles = publicAudits.map((audit) => ({
  productId: audit.id,
  productName: audit.productName,
  category: audit.category,
  primaryKeywords: [audit.productName, audit.category].filter(Boolean),
  secondaryKeywords: audit.visibleApplications,
  longTailKeywords: audit.visibleApplications.map((application) => `${audit.productName} for ${application}`),
  industries: audit.visibleIndustries,
  applicationScenarios: audit.visibleApplications,
  buyerRoles: ["EPC contractor", "fire protection engineer", "project procurement"],
  painPoints: ["configuration evidence", "project-specific selection"],
  selectionFactors: ["flow", "pressure", "driver", "water source", "local code"],
  approvedFactSources: ["src/data/synced-content.json", audit.currentUrl].filter(Boolean),
  prohibitedClaims: ["unverified certifications", "unverified performance", "customer and project claims"],
}));
const csv = (rows) => rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n") + "\n";
await mkdir(path.join(root, "reports"), { recursive: true });
await mkdir(path.join(root, "data", "products"), { recursive: true });
await Promise.all([
  writeFile(path.join(root, "reports", "product-audit.json"), `${JSON.stringify(publicAudits, null, 2)}\n`),
  writeFile(path.join(root, "reports", "product-audit.csv"), csv([["id", "slug", "category", "productName", "model", "dataConfidence", "missingFields"], ...publicAudits.map((audit) => [audit.id, audit.slug, audit.category, audit.productName, audit.model, audit.dataConfidence, audit.missingFields.join("|")])])),
  writeFile(path.join(root, "reports", "product-data-gaps.md"), `# Product data gaps\n\n${publicAudits.filter((audit) => audit.missingFields.length).map((audit) => `- **${audit.productName}**: ${audit.missingFields.join(", ")}`).join("\n") || "No gaps detected by the structured audit."}\n`),
  writeFile(path.join(root, "reports", "product-duplicate-and-slug-audit.md"), `# Product duplicate and slug audit\n\n${duplicates.length ? duplicates.map((item) => `- ${item.kind}: ${item.value} (${item.ids.join(", ")})`).join("\n") : "No duplicate slugs or identifiable duplicate models detected."}\n`),
  writeFile(path.join(root, "data", "products", "product-topic-profiles.json"), `${JSON.stringify(profiles, null, 2)}\n`),
  writeFile(path.join(root, "reports", "product-keyword-industry-scenario-matrix.csv"), csv([["productId", "productName", "category", "primaryKeywords", "industries", "applicationScenarios"], ...profiles.map((profile) => [profile.productId, profile.productName, profile.category, profile.primaryKeywords.join("|"), profile.industries.join("|"), profile.applicationScenarios.join("|")])])),
]);
console.log(JSON.stringify({ products: publicAudits.length, duplicateSlugs: duplicateSlugs.length, duplicateModels: duplicateModels.length, gaps: publicAudits.filter((audit) => audit.missingFields.length).length }, null, 2));
