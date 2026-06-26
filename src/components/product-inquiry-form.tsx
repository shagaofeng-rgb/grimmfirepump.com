"use client";

import { FormEvent, useState } from "react";
import { company } from "@/data/site";

type ProductInquiryFormProps = {
  productTitle: string;
};

export function ProductInquiryForm({ productTitle }: ProductInquiryFormProps) {
  const [message, setMessage] = useState("Send flow, head, voltage and project country. Our sales engineer will reply with a suitable configuration.");
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
        body: JSON.stringify({ ...data, product: productTitle, sourcePage: window.location.pathname }),
      });
      if (!response.ok) throw new Error("Submission failed");

      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "inquiry_submit", path: window.location.pathname, label: productTitle }),
      }).catch(() => undefined);

      setMessage(`Inquiry received. We will reply via ${company.email} or WhatsApp.`);
      form.reset();
    } catch {
      setMessage("Submission failed. Please contact us by email or WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg bg-white p-5 md:grid-cols-2">
      <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <input name="product" type="hidden" value={productTitle} readOnly />
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Name
        <input name="name" required className="min-h-12 rounded-md border border-slate-300 px-3" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Email
        <input name="email" required type="email" className="min-h-12 rounded-md border border-slate-300 px-3" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Company
        <input name="company" className="min-h-12 rounded-md border border-slate-300 px-3" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Phone / WhatsApp
        <input name="phone" className="min-h-12 rounded-md border border-slate-300 px-3" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Country
        <input name="country" className="min-h-12 rounded-md border border-slate-300 px-3" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Flow
        <input name="flow" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="e.g. 500 GPM" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Head / Pressure
        <input name="head" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="e.g. 10 bar" />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Project Stage
        <select name="certification" className="min-h-12 rounded-md border border-slate-300 px-3">
          <option>Need quotation</option>
          <option>Need datasheet</option>
          <option>Need project submittal</option>
          <option>Need replacement selection</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
        Requirement
        <textarea
          name="message"
          rows={4}
          className="rounded-md border border-slate-300 px-3 py-3"
          placeholder="Application, quantity, voltage, frequency, material, installation site and delivery time"
        />
      </label>
      <button className="button button-primary md:col-span-2" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Get Quote for This Product"}
      </button>
      <p className="text-sm leading-6 text-slate-500 md:col-span-2">{message}</p>
    </form>
  );
}
