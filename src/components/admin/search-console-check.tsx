"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";

type HealthResponse = {
  configuration?: { status?: string; message?: string; siteUrl?: string; sitemapUrl?: string };
  connection?: { connected?: boolean; message?: string; httpStatus?: number } | null;
  latestSitemapRun?: { finishedAt?: string; searchConsole?: { status?: string; message?: string; success?: boolean } } | null;
  error?: string;
};

export function SearchConsoleCheck() {
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function runCheck() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/search-console/health?check=1", { cache: "no-store" });
      setResult(await response.json() as HealthResponse);
    } catch {
      setResult({ error: "The connection check could not reach the server." });
    } finally {
      setLoading(false);
    }
  }

  const connected = result?.connection?.connected === true;
  const statusMessage = result?.error || result?.connection?.message || result?.configuration?.message;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <button
        type="button"
        onClick={runCheck}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--navy-950)] px-3.5 py-2 text-sm font-black text-white disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? <LoaderCircle size={16} className="animate-spin" /> : connected ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
        {loading ? "Checking Google…" : "Test Google connection"}
      </button>
      {statusMessage ? (
        <p className={`mt-3 text-sm leading-6 ${connected ? "text-emerald-700" : "text-slate-600"}`}>
          {statusMessage}{result?.connection?.httpStatus ? ` (HTTP ${result.connection.httpStatus})` : ""}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">Runs a read-only property check. It never exposes credentials or triggers a sitemap submission.</p>
      )}
    </div>
  );
}
