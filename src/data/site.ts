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

export const company = {
  name: "Flame Primes Fire Pump Systems",
  legalName: "Grimm Water Treatment (Zhejiang) Co.,Ltd.",
  shortName: "Flame Primes",
  website: "https://grimmfirepump.com",
  email: "jackcheng@flameprimes.com",
  phone: "+86-15215721057",
  whatsapp: "8615215721057",
  whatsappUrl: "https://wa.me/message/BAOYAXABBLMKF1",
  facebookUrl: "https://www.facebook.com/profile.php?id=61587114525850",
  address: "No.2, Weilong Road, Nianli Town, Qujiang District, Quzhou City, Zhejiang Province",
};

export const navItems = [
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "UL Systems", href: "/products/ul-fire-pump-systems" },
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

export const applications = [
  {
    slug: "warehouse-fire-protection",
    title: "Warehouse",
    icon: Building2,
    image: "/assets/applications/electric-room.webp",
    keyword: "warehouse fire protection pump",
    recommended: "Electric or EDJ Fire Pump System",
    text: "Sprinkler demand, stable pressure and fast response for logistics and storage facilities.",
  },
  {
    slug: "data-center-fire-protection",
    title: "Data Center",
    icon: Zap,
    image: "/assets/applications/cdl-room.webp",
    keyword: "data center fire protection pump",
    recommended: "EDJ Fire Pump System",
    text: "Redundant fire water supply for mission-critical facilities requiring reliable backup.",
  },
  {
    slug: "oil-gas-fire-pump-package",
    title: "Oil & Gas",
    icon: Flame,
    image: "/assets/applications/diesel-site.webp",
    keyword: "oil and gas fire pump package",
    recommended: "Diesel Fire Pump Set",
    text: "Diesel standby configuration for harsh industrial environments and remote sites.",
  },
  {
    slug: "airport-fire-pump-system",
    title: "Airport",
    icon: Plane,
    image: "/assets/applications/vertical-turbine.webp",
    keyword: "airport fire pump system",
    recommended: "Vertical Turbine Fire Pump",
    text: "High-flow fire protection solutions for large-area public infrastructure.",
  },
  {
    slug: "hospital-fire-pump-system",
    title: "Hospital",
    icon: Landmark,
    image: "/assets/applications/jockey-room.webp",
    keyword: "hospital fire pump system",
    recommended: "Electric Fire Pump + Jockey Pump",
    text: "Quiet, stable and reliable pressure maintenance for life-safety systems.",
  },
  {
    slug: "industrial-plant-fire-protection",
    title: "Industrial Plant",
    icon: Factory,
    image: "/assets/applications/edj-testing.webp",
    keyword: "industrial fire pump system",
    recommended: "EDJ / Diesel Fire Pump System",
    text: "Configured fire pump packages for process plants, workshops and utility buildings.",
  },
  {
    slug: "power-plant-fire-pump-system",
    title: "Power Plant",
    icon: Zap,
    image: "/assets/applications/hero-edj.webp",
    keyword: "power plant fire pump system",
    recommended: "Diesel + Electric Package",
    text: "Packaged pump systems with standby capability for critical energy infrastructure.",
  },
  {
    slug: "commercial-building-fire-pump",
    title: "Commercial Building",
    icon: Building2,
    image: "/assets/applications/mobile-pump.webp",
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
    title: "Vertical Turbine Pump for Infrastructure Water Source",
    region: "South America",
    image: "/assets/applications/vertical-turbine.webp",
    meta: "Infrastructure / Vertical Turbine / Deep water source",
    text: "Vertical turbine pump configurations help projects draw water from tanks, reservoirs or deep sources where horizontal pumps are not ideal.",
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
  { src: "/assets/factory/factory-assembly.webp", title: "Assembly workshop", wide: true },
  { src: "/assets/factory/factory-machining.webp", title: "Machining" },
  { src: "/assets/factory/factory-testing.webp", title: "Testing area" },
  { src: "/assets/factory/factory-warehouse.webp", title: "Warehouse" },
  { src: "/assets/factory/factory-products.webp", title: "Production capacity" },
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
    title: "UL / NFPA20 Checklist",
    text: "Buyer checklist for UL fire pump package, NFPA20 configuration questions and quotation preparation.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
  {
    title: "Installation & Maintenance Guide",
    text: "Documents for installation review, pump room coordination, testing preparation and after-sales support.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
  {
    title: "Project Submittal Pack",
    text: "Suggested package for EPC buyers: datasheet, drawing placeholder, certificate list and testing evidence.",
    file: "/assets/downloads/grimm-fire-pump-catalog.pdf",
  },
];

export const posts = [...syncedContent.news]
  .sort((a, b) => Date.parse(b.date || "1970-01-01") - Date.parse(a.date || "1970-01-01"))
  .map((post, index) => ({
    ...post,
    image: post.image || newsFallbackImages[index % newsFallbackImages.length],
    text: oneLine(post.text),
  }));

export const footerColumns = [
  { title: "Products", items: ["UL Fire Pump Systems", "EDJ Fire Pump System", "Diesel Fire Pump", "Jockey Pump"] },
  { title: "Trust", items: ["Factory Strength", "Testing Capability", "Certificates", "Project Cases"] },
  { title: "Resources", items: ["Download Catalog", "Knowledge Center", "Fire Pump Selector", "Admin Dashboard"] },
];

export const toolIcons = { Wrench, Globe2, Mail, MapPinned };
