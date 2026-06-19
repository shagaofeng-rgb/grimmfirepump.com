"use client";

import { FormEvent, useState } from "react";
import { company } from "@/data/site";

export function QuoteSection() {
  const [message, setMessage] = useState("Submit your requirement. The local admin dashboard will capture this lead.");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sourcePage: window.location.pathname }),
      });
      if (!response.ok) throw new Error("Submission failed");
      const result = await response.json();
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "inquiry_submit", path: window.location.pathname, label: String(data.product || "quote form") }),
      });
      setMessage(`Inquiry saved. Lead score: ${result.inquiry?.score ?? "--"}. We will reply via ${company.email}.`);
      form.reset();
    } catch {
      setMessage("Submission failed. Please email us or contact WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dark-gradient px-6 py-20">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.82fr_1fr]">
        <div>
          <p className="eyebrow mb-4">Project Inquiry</p>
          <h2 className="text-3xl font-black leading-tight text-white md:text-[40px]">Send your fire pump requirement.</h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Our team will reply with suggested pump configuration, catalog and quotation information.
          </p>
          <address className="mt-8 not-italic leading-8 text-slate-300">
            Email: <a className="font-bold text-white" href={`mailto:${company.email}`}>{company.email}</a><br />
            WhatsApp: <a className="font-bold text-white" href={company.whatsappUrl} data-event="whatsapp_click">{company.phone}</a><br />
            {company.address}
          </address>
        </div>
        <form onSubmit={submit} className="grid gap-4 rounded-lg bg-white p-6 md:grid-cols-2">
          <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
          <label className="grid gap-2 text-sm font-bold text-slate-700">Name <input name="name" required className="min-h-12 rounded-md border border-slate-300 px-3" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Email <input name="email" required type="email" className="min-h-12 rounded-md border border-slate-300 px-3" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Company <input name="company" className="min-h-12 rounded-md border border-slate-300 px-3" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Phone / WhatsApp <input name="phone" className="min-h-12 rounded-md border border-slate-300 px-3" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Country <input name="country" className="min-h-12 rounded-md border border-slate-300 px-3" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Product Interest
            <select name="product" className="min-h-12 rounded-md border border-slate-300 px-3">
              <option>UL Fire Pump System</option>
              <option>EDJ Fire Pump System</option>
              <option>Diesel Fire Pump Set</option>
              <option>Electric Fire Pump Set</option>
              <option>Vertical Turbine Fire Pump</option>
              <option>Jockey Pump</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Flow <input name="flow" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="e.g. 500 GPM" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">Head / Pressure <input name="head" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="e.g. 10 bar" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">Certification Needed
            <select name="certification" className="min-h-12 rounded-md border border-slate-300 px-3">
              <option>UL / FM / NFPA20 related</option>
              <option>CE documentation</option>
              <option>Factory test report</option>
              <option>Not sure yet</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">Requirement
            <textarea name="message" rows={4} className="rounded-md border border-slate-300 px-3 py-3" placeholder="Flow, pressure, application, quantity and project stage" />
          </label>
          <button className="button button-primary md:col-span-2" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Inquiry"}
          </button>
          <p className="text-sm text-slate-500 md:col-span-2">{message}</p>
        </form>
      </div>
    </section>
  );
}
