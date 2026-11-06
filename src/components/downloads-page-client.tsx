"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Download, X } from "lucide-react";
import Link from "next/link";
import { getVisitorContext, hasAnalyticsConsent, trackSiteEvent } from "@/components/analytics-listener";
import { useSubmissionToken } from "@/components/use-submission-token";

export function DownloadRequest({ id, title }: { id: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [file, setFile] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const revision = useRef(0);
  const submission = useSubmissionToken();
  const started = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const run = revision.current;
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/download-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...getVisitorContext(), assetId: id, sourcePage: window.location.pathname, submissionToken: submission.tokenFor(data) }),
      });
      if (!response.ok) throw new Error("Download request failed");
      const result = await response.json();
      if (typeof result.file !== "string" || !(/^\/(?!\/)/.test(result.file) || result.file.startsWith("https://"))) throw new Error("Missing file");
      if (run !== revision.current) return;
      setFile(result.file);
      submission.clear();
    } catch {
      if (run === revision.current) setError("Unable to prepare the download. Try again or contact our team.");
    } finally {
      if (run === revision.current) setSubmitting(false);
    }
  }

  return (
    <>
      <button className="interior-button interior-primary" type="button" onClick={() => { dialog.current?.showModal(); void trackSiteEvent("form_open", title); }}><Download size={16} /> Get document</button>
      <dialog className="interior-dialog interior-download-dialog" ref={dialog} aria-labelledby={headingId} onClose={() => {
        revision.current++;
        setError("");
        setFile("");
        setSubmitting(false);
        started.current = false;
      }}>
        <div className="interior-dialog-head">
          <h2 id={headingId}>{title}</h2>
          <form method="dialog"><button className="interior-icon-button" aria-label="Close download form" title="Close"><X size={20} /></button></form>
        </div>
        {file ? (
          <div role="status">
            <p className="interior-copy mb-3">Your download is ready.</p>
            <a className="interior-button interior-primary" href={file} target="_blank" rel="noopener noreferrer" data-event="download_click" data-label={title} autoFocus><Download size={16} /> Open document</a>
          </div>
        ) : (
          <form className="interior-form" method="post" onSubmit={submit} onChange={() => {
            if (!started.current && hasAnalyticsConsent()) {
              started.current = true;
              void trackSiteEvent("form_start", title);
            }
          }}>
            <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <label className="interior-field">Full name * <input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
            <label className="interior-field">Work email * <input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
            <label className="interior-field">Company <input name="company" maxLength={180} autoComplete="organization" /></label>
            <label className="interior-field">Country or region <input name="country" maxLength={120} autoComplete="country-name" /></label>
            <div className="interior-actions interior-form-wide">
              <button className="interior-button interior-primary" type="submit" disabled={submitting}>{submitting ? "Preparing..." : "Request download"} <Download size={16} /></button>
              <Link href="/privacy" prefetch={false} className="interior-text-link">Privacy policy</Link>
            </div>
            {error && <p role="alert" className="interior-form-wide text-sm text-red-800">{error}</p>}
          </form>
        )}
      </dialog>
    </>
  );
}
