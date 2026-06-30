import {
  Building2,
  ClipboardCheck,
  Factory,
  Flame,
  Gauge,
  Globe2,
  Landmark,
  Mail,
  MapPinned,
  MessageCircle,
  Plane,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";
import syncedContent from "./synced-content.json";

type SyncedNews = (typeof syncedContent.news)[number];

const productPriority = [
  "edj-fire-pump-set",
  "diesel-engine-plus-jockey-pump-set",
  "2-electric-plus-jockey-pump-set",
  "diesel-engine-fire-pump",
  "electric-horizontal-split-end-suction-pump",
  "vertical-stainless-steel-multistage-pump-jockey-pump",
  "diesel-engine-long-shaft-fire-pump",
  "electric-long-shaft-fire-pump",
];

const productFallbackImages = [
  "/assets/products/edj-package.webp",
  "/assets/products/diesel-fire-pump.webp",
  "/assets/products/electric-fire-pump-clean.webp",
  "/assets/products/jockey-pump.webp",
  "/assets/products/vertical-turbine-fire-pump.webp",
  "/assets/products/containerized-pump.webp",
];

const newsFallbackImages = [
  "/assets/applications/hero-edj.webp",
  "/assets/factory/factory-testing.webp",
  "/assets/applications/diesel-site.webp",
  "/assets/factory/factory-assembly.webp",
];

function oneLine(value: string) {
  return value.replace(/\s*\n\s*/g, " · ").replace(/\s+/g, " ").trim();
}

function trimMeta(value: string, maxLength = 180) {
  const cleanValue = oneLine(value);

  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  const trimmed = cleanValue.slice(0, maxLength - 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 120 ? lastSpace : trimmed.length).replace(/[,. ]+$/, "")}.`;
}

function isUsefulNewsLine(line: string) {
  const cleanLine = oneLine(line);
  return (
    cleanLine.length > 24 &&
    !/^url:/i.test(cleanLine) &&
    !/^keywords:?$/i.test(cleanLine) &&
    !/^previous:/i.test(cleanLine) &&
    !/^next:/i.test(cleanLine)
  );
}

const newsTitleOverrides: Record<string, string> = {
  "si-necesita-una-bomba-contra-incendios-o-no-sabe-c-mo-elegir-una-puede-ponerse-e":
    "Need a Fire Pump Selection? GRIMM Can Help Design Your Pump Package",
};

const newsSummaryOverrides: Record<string, string> = {
  "si-necesita-una-bomba-contra-incendios-o-no-sabe-c-mo-elegir-una-puede-ponerse-e":
    "GRIMM helps overseas buyers select fire pump packages by flow, pressure, application, voltage and project conditions, then prepares quotation support.",
  "trailer-type-fire-pump-truck-equipped-with-a-fire-monitor":
    "Trailer-mounted fire pump trucks can support emergency water supply, temporary firefighting and drainage projects where mobility and fast deployment matter.",
};

function buildNewsSummary(post: SyncedNews) {
  const override = newsSummaryOverrides[post.slug];
  if (override) return trimMeta(override);

  const currentText = oneLine(post.text);
  if (currentText.length >= 70) return trimMeta(currentText);

  const contentSummary = post.content.map(oneLine).filter(isUsefulNewsLine).slice(0, 2).join(" ");
  const fallback = contentSummary
    ? `${post.title}. ${contentSummary}`
    : `${post.title} from GRIMM PUMP, covering fire pump selection, pump package configuration and engineering support for global project buyers.`;

  return trimMeta(fallback);
}

export const company = {
  name: "GRIMM PUMP Fire Pump Systems",
  legalName: "Grimm Water Treatment (Zhejiang) Co.,Ltd.",
  shortName: "GRIMM PUMP",
  website: "https://grimmfirepump.com",
  email: "jackcheng@flameprimes.com",
  phone: "+86-15215721057",
  whatsapp: "8615215721057",
  whatsappUrl: "https://wa.me/message/JV3PVHGQYO5SB1",
  facebookUrl: "https://www.facebook.com/profile.php?id=61587114525850",
  address: "No.2, Weilong Road, Nianli Town, Qujiang District, Quzhou City, Zhejiang Province",
};

export const navItems = [
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Applications", href: "/applications" },
  { label: "Projects", href: "/projects" },
  { label: "Factory", href: "/factory" },
  { label: "Testing", href: "/testing" },
  { label: "Downloads", href: "/downloads" },
  { label: "Knowledge", href: "/knowledge" },
];

export const advantages = [
  {
    icon: ShieldCheck,
    title: "Complete pump packages",
    text: "EDJ, DJ and EJ systems combine main pumps, jockey pumps, controllers, valves, pipework and base frames.",
  },
  {
    icon: Gauge,
    title: "Configured by flow and pressure",
    text: "Structured EDJ model tables cover 50-2500 GPM with electric, diesel and CDL jockey pump configurations.",
  },
  {
    icon: ClipboardCheck,
    title: "Testing and documents",
    text: "Testing reports, quality certificates, CE documents and patent materials are prepared for buyer review.",
  },
  {
    icon: MessageCircle,
    title: "Direct export communication",
    text: "Reach sales directly by email or WhatsApp for pump selection, catalog download and project quotation.",
  },
];

export const products = [...syncedContent.products]
  .sort((a, b) => {
    const aIndex = productPriority.indexOf(a.slug);
    const bIndex = productPriority.indexOf(b.slug);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  })
  .map((product, index) => ({
    ...product,
    image: product.image || productFallbackImages[index % productFallbackImages.length],
    summary: oneLine(product.summary),
    description: oneLine(product.description),
    specs: product.specs.slice(0, 6).map(oneLine),
  }));

function menuProduct(slug: string) {
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return null;
  }

  return {
    title: product.title,
    href: `/products/${product.slug}`,
    image: product.image,
    summary: product.summary,
  };
}

function menuProducts(slugs: string[]) {
  return slugs.map(menuProduct).filter((item): item is NonNullable<ReturnType<typeof menuProduct>> => Boolean(item));
}

export const productMegaMenuGroups = [
  {
    title: "Fire Pump Series",
    href: "/products",
    description: "Complete fire pump packages, diesel sets, electric sets and jockey pump combinations.",
    image: "/assets/synced/products/edj-fire-pump-set.jpg",
    items: menuProducts([
      "edj-fire-pump-set",
      "diesel-engine-plus-jockey-pump-set",
      "2-electric-plus-jockey-pump-set",
      "diesel-engine-fire-pump",
      "electric-horizontal-split-end-suction-pump",
      "vertical-stainless-steel-multistage-pump-jockey-pump",
    ]),
  },
  {
    title: "Water Supply Series",
    href: "/products",
    description: "Booster and variable-frequency water supply equipment for building and utility projects.",
    image: "/assets/synced/products/frequency-conversion-water-supply-equipment.jpg",
    items: menuProducts([
      "frequency-conversion-water-supply-equipment",
      "horizontal-booster-pump-group",
      "vertical-stainless-steel-multistage-pump-jockey-pump",
    ]),
  },
  {
    title: "Mobile Pump Truck",
    href: "/products/diesel-engine-irrigation-pump-trailer-type",
    description: "Trailer-mounted diesel pump solutions for emergency drainage, irrigation and temporary water transfer.",
    image: "/assets/synced/products/diesel-engine-irrigation-pump-trailer-type.jpg",
    items: menuProducts(["diesel-engine-irrigation-pump-trailer-type"]),
  },
  {
    title: "Sewage Pump Series",
    href: "/products",
    description: "Submersible sewage pumps and integrated prefabricated pump stations for drainage projects.",
    image: "/assets/synced/products/integrated-prefabricated-pump-station-frp.jpg",
    items: menuProducts(["submersible-sewage-pump", "integrated-prefabricated-pump-station-frp"]),
  },
  {
    title: "Pumps",
    href: "/products",
    description: "Core pump models for fire protection, pressure boosting and long-shaft installation conditions.",
    image: "/assets/synced/products/electric-long-shaft-fire-pump.png",
    items: menuProducts([
      "electric-horizontal-split-end-suction-pump",
      "electric-long-shaft-fire-pump",
      "diesel-engine-long-shaft-fire-pump",
      "vertical-stainless-steel-multistage-pump-jockey-pump",
    ]),
  },
];

export const applications = [
  {
    slug: "warehouse-fire-protection",
    title: "Warehouse",
    icon: Building2,
    image: "/assets/applications/industry/warehouse.webp",
    keyword: "warehouse fire protection pump",
    recommended: "Electric or EDJ Fire Pump System",
    text: "Sprinkler demand, stable pressure and fast response for logistics and storage facilities.",
  },
  {
    slug: "data-center-fire-protection",
    title: "Data Center",
    icon: Zap,
    image: "/assets/applications/industry/data-center.webp",
    keyword: "data center fire protection pump",
    recommended: "EDJ Fire Pump System",
    text: "Redundant fire water supply for mission-critical facilities requiring reliable backup.",
  },
  {
    slug: "oil-gas-fire-pump-package",
    title: "Oil & Gas",
    icon: Flame,
    image: "/assets/applications/industry/oil-gas.webp",
    keyword: "oil and gas fire pump package",
    recommended: "Diesel Fire Pump Set",
    text: "Diesel standby configuration for harsh industrial environments and remote sites.",
  },
  {
    slug: "airport-fire-pump-system",
    title: "Airport",
    icon: Plane,
    image: "/assets/applications/industry/airport.webp",
    keyword: "airport fire pump system",
    recommended: "Diesel or EDJ Fire Pump System",
    text: "High-flow fire protection packages for terminals, hangars and airport utility buildings.",
  },
  {
    slug: "hospital-fire-pump-system",
    title: "Hospital",
    icon: Landmark,
    image: "/assets/applications/industry/hospital.webp",
    keyword: "hospital fire pump system",
    recommended: "Diesel or EDJ Fire Pump System",
    text: "Reliable fire water supply for life-safety systems where backup operation matters.",
  },
  {
    slug: "industrial-plant-fire-protection",
    title: "Industrial Plant",
    icon: Factory,
    image: "/assets/applications/industry/industrial-plant.webp",
    keyword: "industrial fire pump system",
    recommended: "EDJ / Diesel Fire Pump System",
    text: "Configured fire pump packages for process plants, workshops and utility buildings.",
  },
  {
    slug: "power-plant-fire-pump-system",
    title: "Power Plant",
    icon: Zap,
    image: "/assets/applications/industry/power-plant.webp",
    keyword: "power plant fire pump system",
    recommended: "Diesel or EDJ Fire Pump System",
    text: "Packaged pump systems with standby capability for critical energy infrastructure.",
  },
  {
    slug: "commercial-building-fire-pump",
    title: "Commercial Building",
    icon: Building2,
    image: "/assets/applications/industry/commercial-building.webp",
    keyword: "commercial building fire pump",
    recommended: "Electric Fire Pump Set",
    text: "Compact and reliable pump system options for offices, hotels and mixed-use buildings.",
  },
];

export const projects = [
  {
    title: "Diesel Fire Pump Package for Industrial Facility",
    region: "Middle East",
    image: "/assets/applications/diesel-site.webp",
    meta: "Oil & Gas / Diesel Fire Pump / Remote backup",
    text: "A diesel driven fire pump configuration is recommended for industrial facilities where power supply reliability and rapid emergency startup are critical.",
  },
  {
    title: "EDJ Pump Room System for Commercial Project",
    region: "Southeast Asia",
    image: "/assets/applications/hero-edj.webp",
    meta: "Commercial Building / EDJ System / Controller package",
    text: "Electric, diesel and jockey pump combinations can be shipped as a complete package to reduce installation complexity for contractors.",
  },
  {
    title: "EDJ Fire Pump System for South American Utility Project",
    region: "South America",
    image: "/assets/applications/hero-edj.webp",
    meta: "Utility Building / EDJ Fire Pump System / Backup supply",
    text: "For South American projects with variable site conditions, an EDJ package gives contractors electric operation, diesel standby and jockey pump pressure maintenance in one coordinated system.",
  },
  {
    title: "Packaged Fire Pump Solution for Warehouse",
    region: "Africa",
    image: "/assets/applications/electric-room.webp",
    meta: "Warehouse / Electric Fire Pump / Pressure maintenance",
    text: "For warehouse fire protection, buyers can submit sprinkler demand, building area and water source conditions for a fast configuration proposal.",
  },
];

export const factoryImages = [
  { src: "/assets/factory/factory-assembly.webp", title: "Fire pump package assembly", wide: true },
  { src: "/assets/factory/factory-machining.webp", title: "Pump machining capability" },
  { src: "/assets/factory/factory-testing.webp", title: "Performance testing area" },
  { src: "/assets/factory/factory-warehouse.webp", title: "Parts and finished goods storage" },
  { src: "/assets/factory/factory-products.webp", title: "Finished pump systems" },
];

export const certificates = [
  { src: "/assets/certificates/ce.png", title: "CE", note: "Machinery directive documentation" },
  { src: "/assets/certificates/quality.png", title: "Quality", note: "Management system certificate" },
  { src: "/assets/certificates/test-report.png", title: "Test Reports", note: "Pump testing report sample" },
  { src: "/assets/certificates/patent.png", title: "Patents", note: "Product innovation documents" },
];

export const downloads = [
  {
    title: "Fire Pump Catalog",
    text: "Product overview, company profile and main pump package combinations.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
  {
    title: "EDJ Model Table",
    text: "Flow, pressure and model configurations for electric, diesel and jockey pumps.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
  {
    title: "Certificate Package",
    text: "CE, test reports, patents and management system documents for buyer review.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
  {
    title: "Installation & Maintenance Guide",
    text: "Documents for installation review, pump room coordination, testing preparation and after-sales support.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
  {
    title: "Project Submittal Pack",
    text: "Suggested package for EPC buyers: datasheet, general arrangement drawing, certificate list and testing evidence.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
];

export const posts = [...syncedContent.news]
  .sort((a, b) => Date.parse(b.date || "1970-01-01") - Date.parse(a.date || "1970-01-01"))
  .map((post, index) => ({
    ...post,
    title: newsTitleOverrides[post.slug] || post.title,
    image: post.image || newsFallbackImages[index % newsFallbackImages.length],
    text: buildNewsSummary(post),
  }));

export const knowledgePosts = [
  {
    slug: "how-to-select-a-fire-pump-system",
    title: "How to Select a Fire Pump System for an Industrial Project",
    category: "Pump Selection",
    date: "2026-06-23",
    image: "/assets/applications/industry/industrial-plant.webp",
    text: "A practical selection guide covering flow, pressure, backup power, pump room layout and project documentation.",
    content: [
      "Fire pump selection starts with the project fire water demand. Buyers should confirm required flow, pressure, water source, voltage, fuel availability and installation space before requesting a quotation.",
      "For industrial plants, the pump package usually needs more than a single pump. A complete system may include an electric main pump, diesel standby pump, jockey pump, controllers, valves, header piping and a shared base frame.",
      "Flow is normally defined by the sprinkler or hydrant design. Pressure is influenced by building height, pipe losses, hose demand and the distance between pump room and protected area.",
      "If the site has unstable power or critical operation requirements, a diesel or EDJ configuration is usually more suitable than an electric-only pump set.",
      "The quotation should include pump model, driver power, controller scope, material, connection size, base frame, testing evidence, packing method and delivery schedule.",
      "A clear technical inquiry helps the manufacturer recommend a reliable package faster and reduces revisions during project submittal.",
    ],
  },
  {
    slug: "warehouse-fire-pump-system-design",
    title: "Warehouse Fire Pump System Design Considerations",
    category: "Applications",
    date: "2026-06-23",
    image: "/assets/applications/industry/warehouse.webp",
    text: "Warehouses need stable pressure, fast startup and reliable sprinkler water supply for large storage areas.",
    content: [
      "Warehouse fire protection depends on stable sprinkler pressure across long pipe runs and high storage areas. The pump system should be selected from the fire protection design demand, not only from the building area.",
      "Common inquiry information includes sprinkler flow, hydrant demand, required residual pressure, tank level, pump room distance, voltage and installation altitude.",
      "For many logistics buildings, an electric main pump with a jockey pump can maintain pressure efficiently. Where backup power is required, an EDJ package provides a stronger safety margin.",
      "The pump room layout should reserve space for controllers, valves, maintenance access, header piping and future inspection.",
      "For export projects, contractors should request performance curves, test reports, wiring diagrams, packing photos and installation guidance before shipment.",
    ],
  },
  {
    slug: "data-center-fire-protection-pumps",
    title: "Data Center Fire Protection Pumps: Reliability Comes First",
    category: "Applications",
    date: "2026-06-23",
    image: "/assets/applications/industry/data-center.webp",
    text: "Data centers require dependable fire water supply, redundant operation and careful coordination with critical infrastructure.",
    content: [
      "Data centers place high value on uptime, redundancy and controlled risk. Fire pump systems for data centers should be reviewed together with water storage, electrical supply and emergency response requirements.",
      "A suitable pump package should provide reliable startup, stable pressure and clear controller status. Diesel backup or EDJ configurations are often considered when continuity is critical.",
      "The jockey pump helps maintain system pressure and reduces unnecessary main pump starts. This is important for facilities where repeated false starts create operational concern.",
      "Buyers should verify pump performance, controller compatibility, alarm signals, power conditions, room ventilation and maintenance access.",
      "Documentation should be prepared early because data center projects usually require strict consultant review before installation.",
    ],
  },
  {
    slug: "airport-fire-pump-package",
    title: "Airport Fire Pump Packages for Terminals and Utility Buildings",
    category: "Applications",
    date: "2026-06-23",
    image: "/assets/applications/industry/airport.webp",
    text: "Airport projects need high-flow pump packages that support terminals, hangars and infrastructure fire protection.",
    content: [
      "Airport fire protection can include terminals, hangars, fuel areas, utility buildings and service zones. Each area may create different flow and pressure requirements.",
      "For airport projects, a diesel or EDJ fire pump system is often preferred because emergency backup capability is important for public infrastructure.",
      "When selecting a pump package, buyers should provide water source condition, design flow, pressure, voltage, fuel preference, installation location and project schedule.",
      "Large infrastructure projects also need clear packing, shipping and installation coordination because equipment may be handled by multiple contractors.",
      "A good submittal package should include pump curves, general arrangement drawings, controller information, testing documents and shipment evidence.",
    ],
  },
  {
    slug: "hospital-fire-pump-system",
    title: "Hospital Fire Pump Systems: Backup and Stability",
    category: "Applications",
    date: "2026-06-23",
    image: "/assets/applications/industry/hospital.webp",
    text: "Hospitals need fire pump systems that support life-safety operation with stable pressure and dependable backup.",
    content: [
      "Hospitals are life-safety projects, so fire pump reliability is more important than lowest initial cost. A pump system should support stable water supply and predictable emergency startup.",
      "A diesel or EDJ package can improve backup capability where local rules or project consultants require redundancy.",
      "The pump room should be planned for easy access, ventilation, drainage, controller operation and maintenance work.",
      "Noise, vibration and space should also be considered because hospital pump rooms may be close to occupied buildings.",
      "Before ordering, contractors should confirm flow, pressure, power supply, controller requirements, pipe connections and documentation expectations.",
    ],
  },
  {
    slug: "diesel-fire-pump-maintenance",
    title: "Diesel Fire Pump Maintenance Checklist for Project Owners",
    category: "Maintenance",
    date: "2026-06-23",
    image: "/assets/applications/diesel-site.webp",
    text: "Diesel fire pumps require regular checks of fuel, battery, cooling, controller and test operation.",
    content: [
      "Diesel fire pumps are selected because they can operate when electrical power is unreliable. That advantage only remains true if the engine and controller are maintained correctly.",
      "Routine checks should include fuel level, battery status, oil level, coolant condition, controller alarms, pipe leakage and room ventilation.",
      "Periodic test running helps confirm startup reliability and allows operators to identify abnormal vibration, noise or temperature before an emergency.",
      "Spare parts and service records should be kept near the pump room so maintenance teams can act quickly.",
      "For remote industrial sites, owners should train local operators and keep a clear maintenance schedule after commissioning.",
    ],
  },
  {
    slug: "power-plant-fire-pump-systems",
    title: "Power Plant Fire Pump Systems for Critical Energy Facilities",
    category: "Applications",
    date: "2026-06-23",
    image: "/assets/applications/industry/power-plant.webp",
    text: "Power plants need robust fire pump packages with backup operation and clear testing documentation.",
    content: [
      "Power plants contain critical equipment, fuel areas and utility systems that require dependable fire protection. Pump packages should be selected for reliability and maintainability.",
      "A diesel or EDJ system is often suitable because backup operation is important for critical energy infrastructure.",
      "Project teams should review flow, pressure, water source, electrical supply, fuel storage, installation environment and local operating conditions.",
      "Testing evidence is important for owner confidence. Factory testing, inspection photos and clear documentation help reduce site uncertainty.",
      "For export projects, the pump package should be prepared with strong packing and clear installation guidance for the local contractor.",
    ],
  },
  {
    slug: "commercial-building-fire-pump-selection",
    title: "Commercial Building Fire Pump Selection Guide",
    category: "Applications",
    date: "2026-06-23",
    image: "/assets/applications/industry/commercial-building.webp",
    text: "Commercial buildings need compact, reliable fire pump systems coordinated with building height and pipe losses.",
    content: [
      "Commercial buildings such as offices, hotels and mixed-use properties require fire pump systems that fit limited pump room space while maintaining reliable pressure.",
      "The selection should consider building height, sprinkler demand, hydrant demand, available city pressure, tank location and pipe losses.",
      "Electric fire pumps are commonly used where power supply is stable. If backup is required, diesel or EDJ packages can be evaluated.",
      "A compact layout, controller accessibility and easy maintenance access are important for long-term building operation.",
      "Buyers should submit building type, flow, head, voltage and room constraints so the manufacturer can recommend a practical pump package.",
    ],
  },
];

export const footerColumns = [
  { title: "Products", items: ["EDJ Fire Pump System", "Diesel Fire Pump", "Electric Fire Pump", "Jockey Pump"] },
  { title: "Trust", items: ["Factory Strength", "Testing Capability", "Certificates", "Project Cases"] },
  { title: "Resources", items: ["Download Catalog", "Knowledge Center", "Fire Pump Selector", "Contact Sales"] },
];

export const toolIcons = { Wrench, Globe2, Mail, MapPinned };
