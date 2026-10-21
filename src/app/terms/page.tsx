import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using GRIMM PUMP's website and technical information.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <><Header /><main className="container-shell max-w-3xl py-12 text-slate-700 md:py-20">
    <h1 className="text-4xl font-black text-slate-950">Terms of Use</h1>
    <p className="mt-4">Last updated: 21 October 2026</p>
    <div className="mt-10 space-y-7 leading-8">
      <section><h2 className="text-xl font-bold text-slate-950">Website information</h2><p>Product descriptions and technical information are provided for general project evaluation. Confirm model selection, specifications, certification scope and applicable documents with our team before purchasing or specifying equipment.</p></section>
      <section><h2 className="text-xl font-bold text-slate-950">Documents and external links</h2><p>Documents made available here are for buyer review. Do not alter or present them as certification for a different product. External sites are operated by their respective providers.</p></section>
      <section><h2 className="text-xl font-bold text-slate-950">Contact</h2><p>For technical or website questions, email <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>.</p></section>
    </div>
  </main><Footer /></>;
}
