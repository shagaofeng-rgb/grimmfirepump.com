import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { ArrowRight, BookOpen, FileChartColumn, FileText, FolderOpen, Settings, Wrench, Zap } from "lucide-react";
import { FactoryHomeHeader } from "./factory-home-header";
import { getPublicProductNavigation, getPublicProducts } from "@/lib/public-cms";
import { keyParameters } from "@/lib/catalog-presentation";
import { interiorProductPhoto } from "@/lib/interior-product-images";
import "./factory-home.css";

const sans = localFont({
  src: [
    { path: "../../../public/assets/fonts/grimm-home/barlow-400.woff2", weight: "400" },
    { path: "../../../public/assets/fonts/grimm-home/barlow-600.woff2", weight: "600" },
    { path: "../../../public/assets/fonts/grimm-home/barlow-800.woff2", weight: "800" },
  ],
  variable: "--factory-font-sans",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const condensed = localFont({
  src: "../../../public/assets/fonts/grimm-home/barlow-condensed-800.woff2",
  weight: "800",
  variable: "--factory-font-display",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

const featuredSystems = [
  { slug: "edj-fire-pump-set", title: "EDJ Fire Pump Sets", subtitle: "Electric + Diesel + Jockey" },
  { slug: "diesel-engine-plus-jockey-pump-set", title: "Diesel Fire Pump Systems", subtitle: "Diesel + Jockey" },
  { slug: "2-electric-plus-jockey-pump-set", title: "Electric Fire Pump Systems", subtitle: "Electric + Jockey" },
];

const capabilities = [
  { title: "Machining", description: "Key components produced with controlled quality." },
  { title: "Pump Assembly", description: "Pumps, drivers and piping assembled into systems." },
  { title: "Controller Assembly", description: "Fire pump controllers assembled, wired and function-checked." },
];

const checks = [
  { Icon: Wrench, title: "Assembly review", text: "Verify key components, assembly and system configuration against project requirements." },
  { Icon: Settings, title: "Operating checks", text: "Run and check pump operation, flow, pressure and changeover functions under set conditions." },
  { Icon: Zap, title: "Controller checks", text: "Check controller wiring, logic and operating sequences for electric, diesel and jockey pumps." },
  { Icon: FileText, title: "Project documents", text: "Provide product documents for project submission, including drawings, data sheets and other required documentation." },
];

export async function FactoryHome() {
  const [products, groups] = await Promise.all([getPublicProducts(), getPublicProductNavigation()]);
  const systems = featuredSystems.flatMap((item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    return product ? [{ ...item, product }] : [];
  });
  const edj = products.find((product) => product.slug === "edj-fire-pump-set");
  const ranges = edj ? keyParameters(edj.parameters, 12).filter((parameter) => /flow|pressure/i.test(parameter.name)).slice(0, 2) : [];

  return (
    <div className={`factory-home ${sans.variable} ${condensed.variable}`}>
      <FactoryHomeHeader groups={groups} />
      <main id="factory-main">
        <section className="factory-hero" aria-labelledby="factory-title">
          <div className="factory-hero-scene">
            <div className="factory-hero-photograph"><Image src="/assets/factory/real/production-capacity.webp" alt="Pump casings and water supply equipment in the GRIMM production workshop" fill priority sizes="(min-width: 768px) 67vw, 100vw" /></div>
            <div className="factory-hero-title">
              <p className="factory-kicker">GRIMM PUMP &middot; FIRE PUMP SYSTEMS</p>
              <h1 id="factory-title"><span>INSIDE </span><span>THE </span><span>FACTORY.</span></h1>
              <p className="factory-hero-tagline">BEHIND EVERY SYSTEM.</p>
            </div>
          </div>
          <div className="factory-container factory-hero-intro">
            <div className="factory-intro-copy">
              <p>A manufacturer in Quzhou, China, providing fire pump systems configured for project requirements.</p>
              <Link className="factory-button" href="/factory">Explore Our Manufacturing <ArrowRight size={21} /></Link>
            </div>
            {edj && <div className="factory-hero-range"><strong>EDJ RANGE ONLY</strong>{ranges.map((parameter) => <span key={parameter.name}>{parameter.name}: {parameter.value}{parameter.unit ? ` ${parameter.unit}` : ""}</span>)}</div>}
            <div className="factory-hero-pump"><Image src="/assets/home-reference/edj-package-cutout.webp" alt="GRIMM electric, diesel and jockey fire pump package" fill priority sizes="(min-width: 1440px) 460px, (min-width: 768px) 34vw, 76vw" /></div>
          </div>
        </section>

        <section className="factory-container factory-manufacturing" aria-labelledby="factory-manufacturing-heading">
          <div className="factory-manufacturing-photo"><Image src="/assets/factory/real/production-capacity.webp" alt="Rows of pump components prepared for machining and assembly" fill sizes="(min-width: 768px) 40vw, 100vw" /></div>
          <div className="factory-manufacturing-copy">
            <h2 id="factory-manufacturing-heading">From components<br className="factory-desktop-break" /> to complete systems.</h2>
            <p>We manufacture key pump components and configure them into complete fire pump systems for commercial, industrial and infrastructure projects.</p>
            <div className="factory-capabilities">{capabilities.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.description}</p></div>)}</div>
          </div>
        </section>

        <section className="factory-container factory-products" aria-labelledby="factory-products-heading">
          <div className="factory-product-heading"><h2 id="factory-products-heading">FIRE PUMP SYSTEMS</h2><span aria-hidden="true" /><Link href="/products">View Other Pumping Solutions <ArrowRight size={21} /></Link></div>
          <div className="factory-product-grid">{systems.map(({ product, title, subtitle }) => <Link className="factory-product" href={`/products/${product.slug}`} key={product.slug}>
            <div className="factory-product-image"><Image src={interiorProductPhoto(product.image)} alt={product.title} fill sizes="(min-width: 1440px) 400px, (min-width: 768px) 31vw, 85vw" /></div>
            <div className="factory-product-label"><h3>{title}<ArrowRight size={23} aria-hidden="true" /></h3><p>({subtitle})</p></div>
          </Link>)}</div>
        </section>

        <section className="factory-checks" aria-labelledby="factory-checks-heading">
          <div className="factory-container factory-checks-inner">
            <div className="factory-checks-heading"><h2 id="factory-checks-heading">ASSEMBLY.<br />CHECKS.<br />DOCUMENTATION.</h2><Link className="factory-button" href="/testing">Explore Testing <ArrowRight size={21} /></Link></div>
            <div className="factory-checks-list">{checks.map(({ Icon, title, text }) => <div className="factory-check-row" key={title}><Icon size={29} strokeWidth={1.4} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></div>)}</div>
          </div>
        </section>

        <section className="factory-container factory-applications" aria-labelledby="factory-applications-heading">
          <div className="factory-application-photo"><Image src="/assets/home-reference/industrial-building.webp" alt="Illustrative exterior of a modern industrial building" fill sizes="(min-width: 1000px) 42vw, (min-width: 768px) 70vw, 100vw" /></div>
          <div className="factory-application-copy"><h2 id="factory-applications-heading">Where our systems<br />are considered.</h2><p>Fire pump systems for a wide range of building and industrial projects, typically including:</p></div>
          <nav className="factory-application-links" aria-label="Fire pump applications">
            <Link href="/applications/commercial-building-fire-pump">Commercial Buildings <ArrowRight size={22} /></Link>
            <Link href="/applications/industrial-plant-fire-protection">Industrial Facilities <ArrowRight size={22} /></Link>
            <Link href="/applications/warehouse-fire-protection">Warehouses <ArrowRight size={22} /></Link>
          </nav>
        </section>

        <section className="factory-container factory-documents" aria-labelledby="factory-documents-heading">
          <h2 id="factory-documents-heading">The documents behind<br />the equipment.</h2>
          <Link href="/downloads" data-event="download_click" data-label="Homepage catalog"><BookOpen size={29} strokeWidth={1.4} /><span>Request Catalog</span><ArrowRight size={20} /></Link>
          <Link href="/contact?request=pump-curves"><FileChartColumn size={29} strokeWidth={1.4} /><span>Request Pump Curves</span><ArrowRight size={20} /></Link>
          <Link href="/certificates"><FolderOpen size={29} strokeWidth={1.4} /><span><strong>Certificates &amp; Documents</strong><small>ISO 9001, ISO 14001, ISO 45001 and Machinery &amp; EMC documentation.</small></span><ArrowRight size={20} /></Link>
        </section>

        <section className="factory-project-cta" aria-labelledby="factory-project-heading"><div className="factory-container factory-project-inner"><h2 id="factory-project-heading">LET&apos;S REVIEW<br />YOUR REQUIREMENTS.</h2><p>Tell us about your project, and our team will provide a suitable fire pump system proposal.</p><Link className="factory-button factory-button-light" href="/contact" data-event="quote_click" data-label="Homepage project requirements">Send Project Requirements <ArrowRight size={24} /></Link></div></section>
      </main>
    </div>
  );
}
