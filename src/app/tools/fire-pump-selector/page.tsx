import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator, ClipboardList, Gauge } from "lucide-react";
import { InteriorFrame, InteriorTabs, PageMast, SectionHeading } from "@/components/interior/frame";
import { PowerCalculator } from "@/components/interior/power-calculator";
import { catalogHref } from "@/lib/catalog-presentation";
import { getPublicProduct } from "@/lib/public-cms";
import { interiorProductPhoto } from "@/lib/interior-product-images";
import { applications } from "@/data/site";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Fire Pump Selector and Pump Power Calculator",
  description: "Prepare flow, pressure and installation requirements for engineering review, or estimate water pump shaft power from flow, head and efficiency.",
  alternates: localizedAlternates("/tools/fire-pump-selector"),
};

const path = "/tools/fire-pump-selector";
const flowUnits = ["GPM", "L/s", "m³/h"] as const;
const pressureUnits = ["bar", "psi", "kPa"] as const;
const waterSources = ["Tank or reservoir", "Municipal supply", "Other / to confirm"] as const;
const drivers = ["To be confirmed", "Electric", "Diesel", "Electric + diesel"] as const;

function selectedValue(values: readonly string[], value: unknown) {
  return values.find((item) => item === value) || values[0];
}

function dutyValue(value: unknown) {
  if (typeof value !== "string" || value.length > 16) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= .01 && number <= 100000 ? number : undefined;
}

export default async function FirePumpSelectorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, edj] = await Promise.all([searchParams, getPublicProduct("edj-fire-pump-set")]);
  const power = params.mode === "power";
  const flow = dutyValue(params.flow);
  const pressure = dutyValue(params.pressure);
  const review = !power && params.step === "review" && flow !== undefined && pressure !== undefined;
  const flowUnit = selectedValue(flowUnits, params.flowUnit);
  const pressureUnit = selectedValue(pressureUnits, params.pressureUnit);
  const industry = applications.find((item) => item.slug === params.application) || applications[0];
  const water = selectedValue(waterSources, params.water);
  const driver = selectedValue(drivers, params.driver);
  const edit = catalogHref(path, { flow: flow?.toString(), pressure: pressure?.toString(), flowUnit, pressureUnit, application: industry.slug, water, driver });
  return (
    <InteriorFrame path={path} breadcrumbs={[{ label: "Knowledge center", href: "/knowledge" }, { label: power ? "Power calculator" : "Fire pump selector" }]}>
      <PageMast eyebrow="Engineering tools" title={power ? "Pump power calculator" : "Fire pump selector"}
        text={power ? "Estimate pump shaft power from flow, head and pump efficiency." : "Prepare your project duty point for engineering review."} />
      <div className="interior-shell interior-band interior-split">
        <section className="interior-form-surface">
          <InteriorTabs label="Engineering tool" links={[
            { label: "Fire pump selector", href: path, current: !power, icon: <Gauge size={16} /> },
            { label: "Power calculator", href: `${path}?mode=power`, current: power, icon: <Calculator size={16} /> },
          ]} />
          <div className="pt-4">
            {power ? <><SectionHeading title="Operating values" /><PowerCalculator /></> : <>
              <ol className="interior-stepper" aria-label="Selection steps">
                <li aria-current={!review ? "step" : undefined}><span>1</span> Duty point</li>
                <li aria-current={review ? "step" : undefined}><span>2</span> Review request</li>
              </ol>
              {review ? <>
                <SectionHeading title="Review project requirements" />
                <dl className="interior-contact-list">
                  {Object.entries({ Flow: `${flow} ${flowUnit}`, Pressure: `${pressure} ${pressureUnit}`, Application: industry.title, "Water source": water, "Driver preference": driver }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="ps-0">{value}</dd></div>)}
                </dl>
                <div className="interior-actions mt-4">
                  <Link className="interior-button interior-primary" href={catalogHref("/contact", { flow: `${flow} ${flowUnit}`, head: `${pressure} ${pressureUnit}`, application: `${industry.title} / ${water}`, voltage: driver })} prefetch={false}>Request engineering review <ArrowRight size={16} /></Link>
                  <Link className="interior-button" href={edit} prefetch={false}>Edit duty point</Link>
                </div>
              </> : <>
                <SectionHeading title="Project duty point" />
                <form className="interior-form" action={path} method="get">
                  <input type="hidden" name="step" value="review" />
                  <div className="interior-unit-field">
                    <label className="interior-field">Design flow<input type="number" name="flow" min=".01" max="100000" step="any" required defaultValue={flow} placeholder="750" /></label>
                    <label className="interior-field"><span className="sr-only">Flow unit</span><select name="flowUnit" defaultValue={flowUnit}>{flowUnits.map((unit) => <option key={unit}>{unit}</option>)}</select></label>
                  </div>
                  <div className="interior-unit-field">
                    <label className="interior-field">Design pressure<input type="number" name="pressure" min=".01" max="100000" step="any" required defaultValue={pressure} placeholder="9" /></label>
                    <label className="interior-field"><span className="sr-only">Pressure unit</span><select name="pressureUnit" defaultValue={pressureUnit}>{pressureUnits.map((unit) => <option key={unit}>{unit}</option>)}</select></label>
                  </div>
                  <label className="interior-field">Application<select name="application" defaultValue={industry.slug}>{applications.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}</select></label>
                  <label className="interior-field">Water source<select name="water" defaultValue={water}>{waterSources.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="interior-field">Driver preference<select name="driver" defaultValue={driver}>{drivers.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <div className="interior-form-wide"><button type="submit" className="interior-button interior-primary">Review requirements <ArrowRight size={16} /></button></div>
                </form>
              </>}
            </>}
          </div>
        </section>
        <aside className="min-w-0">
          {edj && <div className="interior-figure interior-figure-primary mb-4"><Image src={interiorProductPhoto(edj.image)} alt={edj.title} fill sizes="(min-width: 701px) 440px, 100vw" /></div>}
          <p className="interior-kicker"><ClipboardList size={15} /> Engineering review</p>
          <h2 className="interior-subtitle">{power ? "Power estimate for water" : "Project-specific selection"}</h2>
          <p className="interior-copy mt-2">{power ? "This estimate is not a motor or engine rating. Confirm the pump curve and operating range with the project engineer." : "Final pump and driver selection depends on the verified duty point, pump curve and project requirements."}</p>
          {edj && <Link className="interior-text-link mt-3" href={`/products/${edj.slug}`} prefetch={false}>View {edj.title} <ArrowRight size={16} /></Link>}
        </aside>
      </div>
    </InteriorFrame>
  );
}
