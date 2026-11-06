import type { Metadata } from "next";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { InteriorFrame, PageMast, SectionHeading } from "@/components/interior/frame";
import { ProductInquiryForm } from "@/components/product-inquiry-form";
import { WhatsAppIcon } from "@/components/social-platform-icons";
import { company } from "@/data/site";
import { getPublicProducts } from "@/lib/public-cms";
import { boundedQuery } from "@/lib/catalog-presentation";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Contact GRIMM PUMP for Fire Pump Quotations",
  description: "Contact GRIMM PUMP by inquiry form, email or WhatsApp for fire pump selection, datasheets, catalog requests and project quotations.",
  alternates: localizedAlternates("/contact"),
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [products, params] = await Promise.all([getPublicProducts(), searchParams]);
  const options = [...new Set(products.map((product) => product.title))];
  const product = products.find((item) => item.slug === params.product || item.title === params.product)?.title;
  const initial = { product, flow: boundedQuery(params.flow, 80), head: boundedQuery(params.head, 80), application: boundedQuery(params.application, 180), voltage: boundedQuery(params.voltage, 80) };
  return (
    <InteriorFrame path="/contact" breadcrumbs={[{ label: "Contact" }]}>
      <PageMast eyebrow="Engineering sales" title="Contact GRIMM PUMP" text="For quotations, pump selection and project documentation." />
      <div className="interior-shell interior-band interior-split interior-quote-split">
        <section>
          <SectionHeading title="Sales & engineering" />
          <dl className="interior-contact-list">
            <div><dt><Mail size={17} /> Email</dt><dd><a href={`mailto:${company.email}`}>{company.email}</a></dd></div>
            <div><dt><Phone size={17} /> Phone</dt><dd><a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`}>{company.phone}</a></dd></div>
            <div><dt><WhatsAppIcon className="size-[17px]" /> WhatsApp</dt><dd><a href={company.whatsappUrl} target="_blank" rel="noreferrer" data-event="whatsapp_click" data-whatsapp-account="grimm-main" data-whatsapp-placement="contact">Open WhatsApp</a></dd></div>
            <div><dt><Building2 size={17} /> Company</dt><dd>{company.legalName}</dd></div>
            <div><dt><MapPin size={17} /> Address</dt><dd>{company.address}</dd></div>
          </dl>
        </section>
        <section className="interior-form-surface">
          <SectionHeading eyebrow="Project inquiry" title="Tell us about your project" />
          <ProductInquiryForm products={options} initial={initial} />
        </section>
      </div>
    </InteriorFrame>
  );
}
