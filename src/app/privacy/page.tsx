import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { company } from "@/data/site";
import { PrivacyPreferences } from "@/components/privacy-preferences";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GRIMM PUMP handles inquiry details, download requests and optional website analytics.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <><Header /><main className="container-shell max-w-3xl py-12 text-slate-700 md:py-20">
    <h1 className="text-4xl font-black text-slate-950">Privacy Policy</h1>
    <p className="mt-4">Last updated: 21 October 2026</p>
    <div className="mt-10 space-y-7 leading-8">
      <section><h2 className="text-xl font-bold text-slate-950">Information we receive</h2><p>When you send an inquiry or request a document, we receive the details you submit, such as your name, email, company, country and project requirements. Our forms also record the source page and technical request information needed to respond and protect the service from abuse.</p></section>
      <section><h2 className="text-xl font-bold text-slate-950">Optional analytics</h2><p>With your permission, we use a browser identifier and website analytics, including Google Analytics when configured, to understand visits, page use and contact-button activity. We do not load optional analytics until you choose to allow them. You may decline or change your choice below.</p><PrivacyPreferences /></section>
      <section><h2 className="text-xl font-bold text-slate-950">How we use and protect data</h2><p>We use submitted business contact details to reply to requests and administer our website. Authorized staff can view inquiries and download requests in the protected administration area. We use service providers for hosting and data storage. We do not sell submitted contact details.</p></section>
      <section><h2 className="text-xl font-bold text-slate-950">Your choices and contact</h2><p>You can request access, correction or deletion of your submitted details by emailing <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>. We will review requests in accordance with applicable requirements. External services reached through links, including WhatsApp, Facebook and YouTube, have their own privacy practices.</p></section>
    </div>
  </main><Footer /></>;
}
