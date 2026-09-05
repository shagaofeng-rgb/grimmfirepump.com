"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { company } from "@/data/site";

export function QuoteSection() {
  const [message, setMessage] = useState("Tell us your project requirement and our team will reply by email or WhatsApp.");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sourcePage: window.location.pathname }),
      });
      if (!response.ok) throw new Error("Submission failed");
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "inquiry_submit", path: window.location.pathname, label: String(data.product || "project brief") }),
      });
      setSubmitted(true);
      setMessage("Project brief received. Our team will reply using the contact details you provided.");
      form.reset();
    } catch {
      setMessage("Submission failed. Please email us or contact WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="home-quote-section" id="project-brief">
      <div className="container-shell grid gap-12 py-20 md:py-24 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div>
          <p className="home-kicker">Start a focused discussion</p>
          <h2 className="home-display mt-4 text-4xl leading-[1.02] text-white md:text-[52px]">
            Have a duty point or project drawing?
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
            Share the available inputs. We will use them to begin a fire pump configuration and document discussion.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-slate-300">
            {["Flow and head", "Power or driver preference", "Water source and application", "Required project documents"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[var(--orange)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-9 text-sm leading-7 text-slate-400">
            <a className="font-bold text-white" href={"mailto:" + company.email}>{company.email}</a><br />
            <a className="font-bold text-white" href={company.whatsappUrl} data-event="whatsapp_click">WhatsApp: {company.phone}</a>
          </div>
        </div>

        <form onSubmit={submit} className="home-project-form grid gap-4 p-6 md:grid-cols-2 md:p-8">
          <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
          <label className="home-form-label">Name <input name="name" required className="home-form-control" autoComplete="name" /></label>
          <label className="home-form-label">Email <input name="email" required type="email" className="home-form-control" autoComplete="email" /></label>
          <label className="home-form-label">Company <input name="company" className="home-form-control" autoComplete="organization" /></label>
          <label className="home-form-label">Phone / WhatsApp <input name="phone" className="home-form-control" autoComplete="tel" /></label>
          <label className="home-form-label">Country <input name="country" className="home-form-control" autoComplete="country-name" /></label>
          <label className="home-form-label">Product interest
            <select name="product" className="home-form-control">
              <option>EDJ Fire Pump System</option>
              <option>Diesel Fire Pump Set</option>
              <option>Electric Fire Pump Set</option>
              <option>Vertical Turbine Fire Pump</option>
              <option>Jockey Pump</option>
            </select>
          </label>
          <label className="home-form-label">Flow <input name="flow" className="home-form-control" placeholder="e.g. 500 GPM" /></label>
          <label className="home-form-label">Head / pressure <input name="head" className="home-form-control" placeholder="e.g. 10 bar" /></label>
          <label className="home-form-label">Power / driver preference <input name="voltage" className="home-form-control" placeholder="Electric supply or diesel" /></label>
          <label className="home-form-label">Water source / application <input name="application" className="home-form-control" placeholder="Tank, reservoir, building type" /></label>
          <label className="home-form-label md:col-span-2">Project documents
            <select name="certification" className="home-form-control">
              <option>Project document package</option>
              <option>CE documentation</option>
              <option>Factory test report</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label className="home-form-label md:col-span-2">Requirement
            <textarea name="message" rows={4} className="home-form-control resize-y py-3" placeholder="Application, quantity, project stage and other available information" />
          </label>
          <button className="button home-button-primary md:col-span-2" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Send project brief"}
            {!submitting ? <ArrowRight size={17} /> : null}
          </button>
          <p className={submitted ? "text-sm text-emerald-700 md:col-span-2" : "text-sm text-slate-500 md:col-span-2"} aria-live="polite">
            {message}
          </p>
          <p className="text-xs leading-5 text-slate-500 md:col-span-2">
            Prefer a separate page? <Link href="/contact" className="font-bold text-[var(--navy-900)] underline">Open the full contact page.</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
