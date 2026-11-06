"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { company } from "@/data/site";
import { getVisitorContext, hasAnalyticsConsent } from "@/components/analytics-listener";

type ProductInquiryFormProps = {
  productTitle?: string;
  products?: string[];
  initial?: { product?: string; flow?: string; head?: string; application?: string; voltage?: string };
};

export function ProductInquiryForm({ productTitle, products = [], initial }: ProductInquiryFormProps) {
  const [result, setResult] = useState<{ ok: boolean; text: string }>();
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(undefined);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const visitor = getVisitorContext();

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...visitor, sourcePage: window.location.pathname }),
      });
      if (!response.ok) throw new Error("Submission failed");
      if (hasAnalyticsConsent()) void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "inquiry_submit", path: window.location.pathname, label: String(data.product || "project brief"), ...visitor }),
      }).catch(() => undefined);

      setResult({ ok: true, text: "Inquiry received. Our team will reply using the contact details you provided." });
      form.reset();
    } catch {
      setResult({ ok: false, text: `Unable to send your inquiry. Please try again or email ${company.email}.` });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} method="post" className="interior-form">
      <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      {productTitle && <input name="product" type="hidden" value={productTitle} readOnly />}
      <label className="interior-field">Full name * <input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
      <label className="interior-field">Work email * <input name="email" required type="email" maxLength={254} autoComplete="email" /></label>
      <label className="interior-field">Company <input name="company" maxLength={180} autoComplete="organization" /></label>
      <label className="interior-field">Country or region <input name="country" maxLength={120} autoComplete="country-name" /></label>
      <label className="interior-field">Required flow <input name="flow" maxLength={80} defaultValue={initial?.flow} placeholder="e.g. 500 GPM" /></label>
      <label className="interior-field">Head / pressure <input name="head" maxLength={80} defaultValue={initial?.head} placeholder="e.g. 10 bar" /></label>
      <label className="interior-field interior-form-wide">Project requirements <textarea name="message" rows={4} maxLength={5000} placeholder="Application, water source and document requirements" /></label>
      <details className="interior-form-wide interior-form-more" open={initial?.product || initial?.application || initial?.voltage ? true : undefined}>
        <summary>Additional project details <span aria-hidden="true">+</span></summary>
        <div className="interior-form mt-3">
          {!productTitle && <label className="interior-field">Product
            <select name="product" defaultValue={initial?.product || ""}>
              <option value="">Not yet selected</option>
              {products.map((product) => <option key={product}>{product}</option>)}
            </select>
          </label>}
          <label className="interior-field">Phone / WhatsApp <input name="phone" type="tel" maxLength={80} autoComplete="tel" /></label>
          <label className="interior-field">Power / driver <input name="voltage" maxLength={80} defaultValue={initial?.voltage} /></label>
          <label className="interior-field">Application <input name="application" maxLength={180} defaultValue={initial?.application} /></label>
          <label className="interior-field">Project documents
            <select name="certification" defaultValue="">
              <option value="">Not specified</option><option>Need datasheet</option><option>Need project submittal</option><option>CE documentation</option><option>Factory test report</option><option>Need replacement selection</option>
            </select>
          </label>
        </div>
      </details>
      <div className="interior-actions interior-form-wide">
        <button className="interior-button interior-primary" type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send inquiry"} <ArrowRight size={16} /></button>
        <Link href="/privacy" prefetch={false} className="interior-text-link">Privacy policy</Link>
      </div>
      <div className="interior-form-wide" role="status" aria-live="polite">
        {result && <p className={`flex items-start gap-2 text-sm ${result.ok ? "text-emerald-800" : "text-red-800"}`}>{result.ok && <CheckCircle2 size={17} />}{result.text}</p>}
      </div>
    </form>
  );
}
