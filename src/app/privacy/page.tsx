import type { Metadata } from "next";
import { PolicyPage } from "@/components/interior/policy";
import { company } from "@/data/site";
import { PrivacyPreferences } from "@/components/privacy-preferences";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GRIMM PUMP handles inquiry details, download requests and optional website analytics.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PolicyPage path="/privacy" title="Privacy Policy" sections={[
    { id: "information", heading: "Information we receive", content: <p>When you send an inquiry or request a document, we receive the details you submit, such as your name, email, company, country and project requirements. Our forms also record the source page and technical request information needed to respond and protect the service from abuse.</p> },
    { id: "analytics", heading: "Optional analytics", content: <><p>With your permission, we use a browser identifier and website analytics, including Google Analytics when configured, to understand visits, page use and contact-button activity. We do not load optional analytics until you choose to allow them. You may decline or change your choice below.</p><PrivacyPreferences /></> },
    { id: "data-protection", heading: "How we use and protect data", content: <p>We use submitted business contact details to reply to requests and administer our website. Authorized staff can view inquiries and download requests in the protected administration area. We use service providers for hosting and data storage. We do not sell submitted contact details.</p> },
    { id: "choices", heading: "Your choices and contact", content: <p>You can request access, correction or deletion of your submitted details by emailing <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>. We will review requests in accordance with applicable requirements. External services reached through links, including WhatsApp, Facebook and YouTube, have their own privacy practices.</p> },
  ]} />;
}
