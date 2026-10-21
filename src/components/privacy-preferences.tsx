"use client";

export function PrivacyPreferences() {
  function reset() {
    window.localStorage.removeItem("grimm_analytics_consent");
    window.location.reload();
  }

  return <button type="button" onClick={reset} className="mt-3 rounded border border-slate-400 px-4 py-2 font-semibold text-slate-900">Change analytics choice</button>;
}
