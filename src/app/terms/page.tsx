import type { Metadata } from "next";
import { PolicyPage } from "@/components/interior/policy";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using GRIMM PUMP's website and technical information.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <PolicyPage path="/terms" title="Terms of Use" sections={[
    { id: "information", heading: "Website information", content: <p>Product descriptions and technical information are provided for general project evaluation. Confirm model selection, specifications, certification scope and applicable documents with our team before purchasing or specifying equipment.</p> },
    { id: "documents", heading: "Documents and external links", content: <p>Documents made available here are for buyer review. Do not alter or present them as certification for a different product. External sites are operated by their respective providers.</p> },
    { id: "contact", heading: "Contact", content: <p>For technical or website questions, email <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>.</p> },
  ]} />;
}
