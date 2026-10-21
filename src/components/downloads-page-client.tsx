"use client";

import { FormEvent, useState } from "react";
import type { DownloadAsset } from "@/lib/admin-cms";
import { hasAnalyticsConsent } from "@/components/analytics-listener";

export function DownloadsPageClient({ assets }: { assets: DownloadAsset[] }) {
  const [active, setActive] = useState<DownloadAsset | null>(null);
  const [message, setMessage] = useState("Submit buyer details to unlock the download.");
  const [submitting, setSubmitting] = useState(false);

  async function submitDownload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    setSubmitting(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/download-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, assetId: active.id, sourcePage: window.location.pathname }),
      });
      if (!response.ok) throw new Error("Download request failed");
      const result = await response.json();
      if (hasAnalyticsConsent()) void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "download_click", path: window.location.pathname, label: active.title }),
      }).catch(() => undefined);
      setMessage("Download unlocked. Opening catalog...");
      form.reset();
      const link = document.createElement("a");
      link.href = result.file;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
      setActive(null);
    } catch {
      setMessage("Download request failed. Please contact us for the file.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <main>
        <section className="dark-gradient px-6 py-16 md:py-20">
          <div className="mx-auto max-w-[1240px]">
            <p className="text-sm font-bold text-orange-200">Download center</p>
            <h1 className="mt-3 max-w-4xl text-[38px] font-black leading-[1.08] text-white md:text-[56px]">Available fire pump documents for buyer review.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Review the available documents before discussing your project with our team.</p>
          </div>
        </section>
        <section className="section">
          <div className="container-shell grid gap-6 lg:grid-cols-3">
            {assets.map((item) => (
              <article key={item.id} className="card p-6 md:p-7">
                <h2 className="text-2xl font-black text-[var(--navy-950)]">{item.title}</h2>
                <p className="mt-4 leading-7 text-slate-600">{item.category} · {item.language} · {item.version}</p>
                {item.gated ? <button className="button button-primary mt-6" type="button" onClick={() => { setActive(item); setMessage("Submit buyer details to unlock the download."); }}>Request Download</button> : <a className="button button-primary mt-6" href={item.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>}
              </article>
            ))}
          </div>
        </section>
      </main>
      {active ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(7,20,38,0.64)] p-4">
          <form onSubmit={submitDownload} className="grid w-full max-w-xl gap-4 rounded-lg bg-white p-6 shadow-[0_24px_60px_rgba(7,20,38,0.28)] md:p-8">
            <button type="button" className="justify-self-end text-2xl" aria-label="Close download form" onClick={() => setActive(null)}>×</button>
            <h2 className="text-3xl font-black text-[var(--navy-950)]">{active.title}</h2>
            <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <input name="name" required className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Name" />
            <input name="email" required className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Email" type="email" />
            <input name="company" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Company" />
            <input name="country" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Country" />
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit & Download"}
            </button>
            <p className="text-xs text-slate-500">We use your details to provide the requested document. <a href="/privacy" className="underline">Privacy Policy</a></p>
            <p className="text-sm text-slate-500">{message}</p>
          </form>
        </div>
      ) : null}
    </>
  );
}
