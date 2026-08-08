export type ProductFamily = {
  id: "fire-pump-systems" | "water-supply-systems" | "sewage-drainage-pumps" | "mobile-irrigation-solutions";
  name: string;
  description: string;
};

export const productFamilies: ProductFamily[] = [
  { id: "fire-pump-systems", name: "Fire Pump Systems", description: "Fire pump packages, drivers and pressure-maintenance pumps for project fire-water systems." },
  { id: "water-supply-systems", name: "Water Supply Systems", description: "Booster and constant-pressure water supply equipment for building and industrial utility applications." },
  { id: "sewage-drainage-pumps", name: "Sewage & Drainage Pumps", description: "Sewage transfer, drainage and prefabricated pump-station equipment." },
  { id: "mobile-irrigation-solutions", name: "Mobile & Irrigation Pump Solutions", description: "Trailer-mounted diesel pumping for irrigation, emergency drainage and temporary water transfer." },
];

const familyBySlug: Record<string, ProductFamily["id"]> = {
  "edj-fire-pump-set": "fire-pump-systems",
  "ej-fire-pump-set": "fire-pump-systems",
  "diesel-engine-plus-jockey-pump-set": "fire-pump-systems",
  "2-electric-plus-jockey-pump-set": "fire-pump-systems",
  "diesel-engine-fire-pump": "fire-pump-systems",
  "electric-horizontal-split-end-suction-pump": "fire-pump-systems",
  "electric-long-shaft-fire-pump": "fire-pump-systems",
  "diesel-engine-long-shaft-fire-pump": "fire-pump-systems",
  "vertical-stainless-steel-multistage-pump-jockey-pump": "fire-pump-systems",
  "cdl-fire-pump-set": "fire-pump-systems",
  "xbd-dl-fire-pump-set": "fire-pump-systems",
  "xbd-l-fire-pump-set": "fire-pump-systems",
  "frequency-conversion-water-supply-equipment": "water-supply-systems",
  "horizontal-booster-pump-group": "water-supply-systems",
  "vertical-booster-pump-group": "water-supply-systems",
  "isw-water-supply-series-pump": "water-supply-systems",
  "isg-water-supply-series-pump": "water-supply-systems",
  "zwl-zxl-water-supply-series-pump": "water-supply-systems",
  "zwzx-water-supply-series-pump": "water-supply-systems",
  "submersible-sewage-pump": "sewage-drainage-pumps",
  "integrated-prefabricated-pump-station-frp": "sewage-drainage-pumps",
  "gw-sewage-pump-series-pump": "sewage-drainage-pumps",
  "lw-sewage-pump-series-pump": "sewage-drainage-pumps",
  "yw-sewage-pump-series-pump": "sewage-drainage-pumps",
  "wqp-sewage-pump-series-pump": "sewage-drainage-pumps",
  "wqk-sewage-pump-series-pump": "sewage-drainage-pumps",
  "diesel-engine-irrigation-pump-trailer-type": "mobile-irrigation-solutions",
};

const displayBySlug: Record<string, string> = {
  "edj-fire-pump-set": "EDJ Fire Pump Set",
  "diesel-engine-plus-jockey-pump-set": "Diesel Engine + Jockey Pump Set",
  "2-electric-plus-jockey-pump-set": "Electric + Jockey Pump Set",
  "diesel-engine-fire-pump": "Diesel Engine Fire Pump",
  "electric-horizontal-split-end-suction-pump": "Electric Horizontal Split Case Fire Pump",
  "electric-long-shaft-fire-pump": "Electric Long-Shaft Fire Pump",
  "diesel-engine-long-shaft-fire-pump": "Diesel Engine Long-Shaft Fire Pump",
  "vertical-stainless-steel-multistage-pump-jockey-pump": "Jockey Pump / Vertical Multistage Fire Pump",
  "frequency-conversion-water-supply-equipment": "Frequency Conversion Water Supply Equipment",
  "horizontal-booster-pump-group": "Horizontal Booster Pump Group",
  "vertical-booster-pump-group": "Vertical Booster Pump Set",
  "submersible-sewage-pump": "Submersible Sewage Pump",
  "gw-sewage-pump-series-pump": "GW Pipeline Sewage Pump",
  "lw-sewage-pump-series-pump": "LW Vertical Sewage Pump",
  "yw-sewage-pump-series-pump": "YW Submersible Sewage Pump",
  "integrated-prefabricated-pump-station-frp": "Integrated Prefabricated Pump Station FRP",
  "diesel-engine-irrigation-pump-trailer-type": "Diesel Engine Irrigation Pump Trailer Type",
};

function normalizedSlug(slug: string) {
  return slug.toLowerCase();
}

export function getProductFamily(slug: string, title = "", currentCategory = "") {
  const known = familyBySlug[normalizedSlug(slug)];
  if (known) return productFamilies.find((family) => family.id === known)!;
  const text = `${slug} ${title} ${currentCategory}`.toLowerCase();
  if (/(sewage|drainage|pump.station|wastewater|\b(gw|lw|yw|wqp|wqk)\b)/.test(text)) return productFamilies[2];
  if (/(irrigation|trailer|mobile|flood)/.test(text)) return productFamilies[3];
  if (/(water supply|booster|frequency|constant pressure|\b(isg|isw|zw)\b)/.test(text)) return productFamilies[1];
  return productFamilies[0];
}

export function getProductDisplayName(slug: string, title: string) {
  return displayBySlug[normalizedSlug(slug)] || title.replace(/\s+/g, " ").trim();
}

export function productFamilySlug(family: ProductFamily["id"]) {
  return family;
}

export function isFirePumpProduct(slug: string, title = "", category = "") {
  return getProductFamily(slug, title, category).id === "fire-pump-systems";
}
