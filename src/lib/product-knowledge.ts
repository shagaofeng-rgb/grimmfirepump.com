import { getProductFamily } from "@/lib/product-taxonomy";

export type ProductKnowledge = {
  productSlug: string;
  productSeries: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  specificationKeywords: string[];
  applicationKeywords: string[];
  industries: string[];
  scenarios: string[];
  buyerPainPoints: string[];
  solutionSummary: string;
  buyerBenefits: string[];
  relatedProductSlugs: string[];
  relatedApplicationSlugs: string[];
  relatedKnowledgeSlugs: string[];
  prohibitedClaims: string[];
};

const fireIndustries = ["Warehouse and Logistics", "Data Centers", "Industrial Plants", "Oil and Gas Facilities", "Commercial Buildings", "Hospitals", "Airports", "Power Plants", "EPC Contractors", "Fire Protection Contractors"];
const waterIndustries = ["High-rise Buildings", "Hospitals", "Hotels", "Schools", "Factories", "Industrial Utilities", "Municipal Water Supply"];
const drainageIndustries = ["Municipal Drainage", "Commercial Buildings", "Basement Drainage", "Industrial Wastewater", "Construction Projects", "Pump Stations", "Flood Control Projects"];

const systemKeywords = ["fire pump system", "fire pump package", "fire pump manufacturer", "fire pump supplier", "fire fighting pump", "fire protection pump", "fire water pump", "industrial fire pump", "commercial fire pump", "fire pump skid", "fire pump set", "fire pump station", "fire pump room equipment"];

const specific: Record<string, Partial<ProductKnowledge>> = {
  "edj-fire-pump-set": { primaryKeyword: "EDJ fire pump set", secondaryKeywords: ["EDJ fire pump system", "electric diesel jockey fire pump", "electric main diesel standby jockey pump", "EDJ fire pump manufacturer"], scenarios: ["warehouse fire protection", "industrial plant fire protection", "data center fire protection"], solutionSummary: "An EDJ package combines an electric main pump, a diesel standby pump and a jockey pump for pressure maintenance.", buyerPainPoints: ["need for electric and diesel duty options", "pressure stability between fire events", "submittal coordination"], relatedApplicationSlugs: ["warehouse-fire-protection", "data-center-fire-protection", "industrial-plant-fire-protection"] },
  "diesel-engine-fire-pump": { primaryKeyword: "diesel engine fire pump", secondaryKeywords: ["diesel driven fire pump", "diesel fire pump set", "diesel standby fire pump", "diesel fire pump supplier"], scenarios: ["remote industrial fire water", "oil and gas fire protection"], relatedApplicationSlugs: ["oil-gas-fire-pump-package", "industrial-plant-fire-protection"] },
  "2-electric-plus-jockey-pump-set": { primaryKeyword: "electric fire pump set", secondaryKeywords: ["electric motor driven fire pump", "electric fire pump package", "fire pump with jockey pump"], scenarios: ["warehouse sprinkler systems", "commercial building fire protection"] },
  "vertical-stainless-steel-multistage-pump-jockey-pump": { primaryKeyword: "jockey pump", secondaryKeywords: ["fire jockey pump", "fire pump pressure maintenance pump", "vertical multistage jockey pump"], scenarios: ["fire-system pressure maintenance"], buyerPainPoints: ["unnecessary main-pump starts", "small system leakage"], solutionSummary: "A jockey pump maintains standby system pressure; it is not represented as the main fire pump." },
  "electric-long-shaft-fire-pump": { primaryKeyword: "electric long shaft fire pump", secondaryKeywords: ["vertical turbine fire pump", "deep well fire pump", "fire pump for water tank"], scenarios: ["underground water-source fire protection"] },
  "diesel-engine-long-shaft-fire-pump": { primaryKeyword: "diesel long shaft fire pump", secondaryKeywords: ["vertical turbine fire pump", "fire pump for water tank", "deep well fire pump"], scenarios: ["remote water-source fire protection"] },
};

export function getProductKnowledge(productSlug: string, title = "", category = ""): ProductKnowledge {
  const family = getProductFamily(productSlug, title, category);
  const base: ProductKnowledge = {
    productSlug,
    productSeries: family.name,
    primaryKeyword: family.id === "fire-pump-systems" ? "fire pump system" : family.id === "water-supply-systems" ? "water supply equipment" : family.id === "sewage-drainage-pumps" ? "submersible sewage pump" : "diesel irrigation pump trailer",
    secondaryKeywords: family.id === "fire-pump-systems" ? systemKeywords : family.id === "water-supply-systems" ? ["automatic water supply system", "variable frequency water supply system", "constant pressure water supply system", "booster pump system"] : family.id === "sewage-drainage-pumps" ? ["sewage transfer pump", "wastewater pump", "pipeline sewage pump", "prefabricated pump station"] : ["mobile irrigation pump", "trailer mounted diesel pump", "emergency drainage pump", "mobile dewatering pump"],
    specificationKeywords: ["flow", "head", "voltage", "frequency", "motor or engine power", "connection size"],
    applicationKeywords: [],
    industries: family.id === "fire-pump-systems" ? fireIndustries : family.id === "water-supply-systems" ? waterIndustries : family.id === "sewage-drainage-pumps" ? drainageIndustries : ["Agriculture", "Irrigation", "Emergency Drainage", "Flood Control", "Construction Water Transfer", "Remote Sites"],
    scenarios: [],
    buyerPainPoints: ["matching equipment to verified duty data", "project documentation and installation coordination"],
    solutionSummary: "Selection should be based on the project duty, fluid conditions, installation environment and requested documents.",
    buyerBenefits: ["clear selection inputs", "project-specific configuration support", "maintainable equipment layout"],
    relatedProductSlugs: [],
    relatedApplicationSlugs: [],
    relatedKnowledgeSlugs: [],
    prohibitedClaims: ["UL certified unless supplied in approved project documents", "FM approved unless supplied in approved project documents", "NFPA 20 compliant without project review", "guaranteed delivery", "best in the world"],
  };
  const override = specific[productSlug] || {};
  return { ...base, ...override, secondaryKeywords: override.secondaryKeywords || base.secondaryKeywords, industries: override.industries || base.industries, scenarios: override.scenarios || base.scenarios, buyerPainPoints: override.buyerPainPoints || base.buyerPainPoints, relatedApplicationSlugs: override.relatedApplicationSlugs || base.relatedApplicationSlugs };
}
