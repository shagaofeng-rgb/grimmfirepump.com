/**
 * URL-level migration decisions for the legacy Flame Primes site. Keep this
 * list explicit: a permanent redirect is only used where a relevant GRIMM
 * destination exists. Historical content remains in the CMS audit trail.
 */
export type LegacyUrlDecision =
  | { kind: "redirect"; destination: string }
  | { kind: "gone" };

const redirect = (destination: string): LegacyUrlDecision => ({ kind: "redirect", destination });
const gone: LegacyUrlDecision = { kind: "gone" };

export const legacyUrlDecisions: Record<string, LegacyUrlDecision> = {
  // Legacy product detail URLs.
  "/product/2Electricjockeypumpset.html": redirect("/products/2-electric-plus-jockey-pump-set"),
  "/product/DieselEngineLongShaftFirePump.html": redirect("/products/diesel-engine-long-shaft-fire-pump"),
  "/product/Electrichorizontalsplitendsuctionpump.html": redirect("/products/electric-horizontal-split-end-suction-pump"),
  "/product/Dieselengineirrigationpumptrailertype.html": redirect("/products/diesel-engine-irrigation-pump-trailer-type"),
  "/product/Dieselenginejockeypumpset.html": redirect("/products/diesel-engine-plus-jockey-pump-set"),
  "/product/EDJFirepumpset.html": redirect("/products/edj-fire-pump-set"),
  "/product/ElectricLongShaftFirePump.html": redirect("/products/electric-long-shaft-fire-pump"),
  "/product/Frequencyconversionwatersupplyequipment.html": redirect("/products/frequency-conversion-water-supply-equipment"),
  "/product/Horizontalboosterpumpgroup.html": redirect("/products/horizontal-booster-pump-group"),
  "/product/IntegratedprefabricatedpumpstationFRP.html": redirect("/products/integrated-prefabricated-pump-station-frp"),
  "/product/Submersiblesewagepump.html": redirect("/products/submersible-sewage-pump"),
  "/product/VerticalstainlesssteelmultistagepumpJockeypump.html": redirect("/products/vertical-stainless-steel-multistage-pump-jockey-pump"),

  // Legacy .html news URLs. Do not route unrelated historical stories to the homepage.
  "/news/EDJFIREPUMP.html": redirect("/products/edj-fire-pump-set"),
  "/news/FirePump.html": redirect("/knowledge/how-to-select-a-fire-pump-system"),
  "/news/USFIRE.html": gone,
  "/news/Whychooseus2.html": redirect("/about"),
  "/news/advanced-fire-pump-manufacturing.html": redirect("/factory"),
  "/news/diesel-fire-pump-1000gpm-argentina.html": redirect("/projects"),
  "/news/fire-pump-industry-growth-global-safety-regulations.html": redirect("/news"),
  "/news/fire-pump-industry-trends-2026.html": redirect("/news"),
  "/news/production.html": redirect("/factory"),
  "/news/news-AI-data-centers-fire-pump-systems.html": redirect("/knowledge/data-center-fire-protection-pumps"),
  "/news/news-battery-energy-storage-fire-protection-requirements.html": gone,
  "/news/news-data-center-fire-safety-fire-protection-systems.html": redirect("/knowledge/data-center-fire-protection-pumps"),
  "/news/news-dragon-boat-festival-2026.html": gone,
  "/news/news-fire-pump-testing-and-maintenance.html": redirect("/testing"),
  "/news/news-industrial-fire-incidents-fire-protection-lessons.html": redirect("/news"),
  "/news/news-semiconductor-fire-protection-systems.html": redirect("/knowledge/data-center-fire-protection-pumps"),
  "/news/warehouse-fire-fire-pump-systems.html": redirect("/knowledge/warehouse-fire-pump-system-design"),
  "/news/why-fire-pumps-are-essential-to-modern-fire-protection.html": redirect("/knowledge/how-to-select-a-fire-pump-system"),

  // Rebuilt legacy Blog URLs that used the imported news records.
  "/blog/edj-fire-pump-unit-the-ultimate-solution-for-reliable-emergency-water-supply": redirect("/products/edj-fire-pump-set"),
  "/blog/fire-pump-industry-enters-a-new-era-of-intelligence-and-efficiency": redirect("/knowledge/how-to-select-a-fire-pump-system"),
  "/blog/fire-aboard-uss-gerald-r-ford-injures-sailors-triggers-navy-investigation": gone,
  "/blog/why-choose-us2": redirect("/about"),
  "/blog/why-choose-us": redirect("/about"),
  "/blog/driving-fire-safety-innovation-with-advanced-fire-pump-manufacturing": redirect("/factory"),
  "/blog/si-necesita-una-bomba-contra-incendios-o-no-sabe-c-mo-elegir-una-puede-ponerse-e": redirect("/tools/fire-pump-selector"),
  "/blog/1000-gpm-7-bar-diesel-engine-fire-pump-with-jockey-pump-2-sets-ready-for-argenti": redirect("/projects"),
  "/blog/global-fire-pump-industry-growth-accelerates-amid-stricter-safety-regulations": redirect("/news"),
  "/blog/global-fire-pump-market-accelerates-with-smart-technology-and-data-center-expans": redirect("/news"),
  "/blog/trailer-type-fire-pump-truck-equipped-with-a-fire-monitor": redirect("/products/diesel-engine-irrigation-pump-trailer-type"),
  "/blog/ai-data-centers-drive-growing-demand-for-advanced-fire-pump-systems": redirect("/knowledge/data-center-fire-protection-pumps"),
  "/blog/battery-energy-storage-projects-drive-new-fire-protection-requirements": gone,
  "/blog/data-center-fire-safety-why-fire-protection-systems-matter-more-than-ever": redirect("/knowledge/data-center-fire-protection-pumps"),
  "/blog/dragon-boat-festival-2026-traditions-history-and-cultural-significance": gone,
  "/blog/fire-pump-testing-and-maintenance-become-a-priority-for-critical-facilities": redirect("/testing"),
  "/blog/lessons-learned-from-recent-industrial-fire-incidents": redirect("/news"),
  "/blog/major-warehouse-fire-highlights-the-need-for-reliable-fire-pump-systems": redirect("/knowledge/warehouse-fire-pump-system-design"),
  "/blog/professional-production-of-fire-pumps-and-water-supply-equipment": redirect("/factory"),
  "/blog/semiconductor-manufacturing-expansion-increases-demand-for-fire-protection-syste": redirect("/knowledge/data-center-fire-protection-pumps"),
  "/blog/why-fire-pumps-are-essential-to-modern-fire-protection-systems": redirect("/knowledge/how-to-select-a-fire-pump-system"),
};

const normalizedLegacyUrlDecisions = new Map(
  Object.entries(legacyUrlDecisions).map(([pathname, decision]) => [pathname.toLowerCase(), decision]),
);

export function legacyUrlDecision(pathname: string) {
  return normalizedLegacyUrlDecisions.get(pathname.toLowerCase());
}
