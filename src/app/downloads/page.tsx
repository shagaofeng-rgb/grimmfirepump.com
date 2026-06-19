"use client";

import { FormEvent, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StickyCta } from "@/components/sticky-cta";
import { downloads } from "@/data/site";

export default function DownloadsPage() {
  const [active, setActive] = useState<string | null>(null);
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
        body: JSON.stringify({ ...data, assetTitle: active, sourcePage: window.location.pathname }),
      });
      if (!response.ok) throw new Error("Download request failed");
      const result = await response.json();
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "download_click", path: window.location.pathname, label: active }),
      });
      setMessage("Download unlocked. Opening catalog...");
      form.reset();
      window.open(result.file, "_blank");
      setActive(null);
    } catch {
      setMessage("Download request failed. Please contact us for the file.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className="dark-gradient px-6 py-24">
          <div className="mx-auto max-w-[1200px]">
            <p className="eyebrow mb-4">Download Center</p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight text-white md:text-6xl">Catalogs, datasheets and certificates for buyer review.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Downloads are gated in production to collect country, application, email and WhatsApp.</p>
          </div>
        </section>
        <section className="section">
          <div className="container-shell grid gap-6 lg:grid-cols-3">
            {downloads.map((item) => (
              <article key={item.title} className="card p-7">
                <h2 className="text-2xl font-black text-[var(--navy-950)]">{item.title}</h2>
                <p className="mt-4 leading-7 text-slate-600">{item.text}</p>
                <button className="button button-primary mt-6" type="button" onClick={() => { setActive(item.title); setMessage("Submit buyer details to unlock the download."); }}>Request Download</button>
              </article>
            ))}
          </div>
        </section>
      </main>
      {active ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(7,20,38,0.64)] p-4">
          <form onSubmit={submitDownload} className="grid w-full max-w-xl gap-4 rounded-lg bg-white p-8">
            <button type="button" className="justify-self-end text-2xl" onClick={() => setActive(null)}>×</button>
            <p className="eyebrow">Download Gate</p>
            <h2 className="text-3xl font-black text-[var(--navy-950)]">{active}</h2>
            <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <input name="name" required className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Name" />
            <input name="email" required className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Email" type="email" />
            <input name="company" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Company" />
            <input name="country" className="min-h-12 rounded-md border border-slate-300 px-3" placeholder="Country" />
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit & Download"}
            </button>
            <p className="text-sm text-slate-500">{message}</p>
          </form>
        </div>
      ) : null}
      <Footer />
      <StickyCta />
    </>
  );
}
