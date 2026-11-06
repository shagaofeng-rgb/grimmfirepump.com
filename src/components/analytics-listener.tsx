"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || "";
const visitorStorageKey = "grimm_visitor_id";
const visitStorageKey = "grimm_visit_number";
const sessionStorageKey = "grimm_session_id";
const sessionReferrerKey = "grimm_session_referrer";
const sessionCampaignKey = "grimm_session_campaign";
const consentStorageKey = "grimm_analytics_consent";
const consentCopy: Record<string, { message: string; policy: string; allow: string; decline: string }> = {
  en: { message: "We use optional analytics to understand visits and improve this site. You can continue without analytics.", policy: "Privacy Policy", allow: "Allow analytics", decline: "Decline" },
  es: { message: "Usamos analíticas opcionales para mejorar este sitio. Puede continuar sin ellas.", policy: "Política de privacidad", allow: "Permitir analíticas", decline: "Rechazar" },
  ru: { message: "Мы используем необязательную аналитику для улучшения сайта. Вы можете продолжить без нее.", policy: "Политика конфиденциальности", allow: "Разрешить аналитику", decline: "Отказаться" },
  ar: { message: "نستخدم تحليلات اختيارية لتحسين الموقع. يمكنك المتابعة بدونها.", policy: "سياسة الخصوصية", allow: "السماح بالتحليلات", decline: "رفض" },
  fr: { message: "Nous utilisons des analyses facultatives pour améliorer ce site. Vous pouvez continuer sans elles.", policy: "Politique de confidentialité", allow: "Autoriser les analyses", decline: "Refuser" },
  pt: { message: "Usamos análises opcionais para melhorar este site. Pode continuar sem elas.", policy: "Política de privacidade", allow: "Permitir análises", decline: "Recusar" },
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[][];
  }
}

function getStoredValue(key: string, storage: Storage) {
  try { return storage.getItem(key) || ""; } catch { return ""; }
}

function setStoredValue(key: string, value: string, storage: Storage) {
  try { storage.setItem(key, value); } catch { /* tracking remains anonymous */ }
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `v_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getVisitorContext() {
  const allowed = hasAnalyticsConsent();
  const visitorId = allowed ? getStoredValue(visitorStorageKey, window.localStorage) || createId() : "";
  const existingSession = allowed ? getStoredValue(sessionStorageKey, window.sessionStorage) : "";
  const sessionId = allowed ? existingSession || createId() : "";
  const currentVisit = allowed ? Math.min(99999, Math.max(0, Number(getStoredValue(visitStorageKey, window.localStorage)) || 0)) : 0;
  const visitNumber = allowed ? (existingSession ? Math.max(1, currentVisit) : currentVisit + 1) : 1;
  if (allowed) {
    setStoredValue(visitorStorageKey, visitorId, window.localStorage);
    setStoredValue(sessionStorageKey, sessionId, window.sessionStorage);
    setStoredValue(visitStorageKey, String(visitNumber), window.localStorage);
  }
  let entryReferrer = "";
  if (allowed && document.referrer) {
    try {
      const source = new URL(document.referrer);
      if (source.origin !== window.location.origin && /^https?:$/.test(source.protocol)) entryReferrer = source.origin;
    } catch { /* invalid referrer */ }
  }
  const referrer = allowed ? getStoredValue(sessionReferrerKey, window.sessionStorage) || entryReferrer : "";
  if (allowed) setStoredValue(sessionReferrerKey, referrer, window.sessionStorage);
  const params = new URLSearchParams(window.location.search);
  const campaignKeys = ["utm_source", "utm_medium", "utm_campaign"];
  const hasCampaign = campaignKeys.some((key) => params.has(key));
  if (allowed && hasCampaign) {
    setStoredValue(sessionCampaignKey, new URLSearchParams(campaignKeys.map((key) => [key, (params.get(key) || "").slice(0, 160)])).toString(), window.sessionStorage);
  }
  const campaign = new URLSearchParams(allowed ? getStoredValue(sessionCampaignKey, window.sessionStorage) : "");
  return {
    visitorId,
    sessionId,
    visitNumber,
    referrer,
    utmSource: campaign.get("utm_source") || "",
    utmMedium: campaign.get("utm_medium") || "",
    utmCampaign: campaign.get("utm_campaign") || "",
    testTraffic: params.get("grimm_traffic") === "test",
  };
}

export function hasAnalyticsConsent() {
  return typeof window !== "undefined" && getStoredValue(consentStorageKey, window.localStorage) === "accepted";
}

export function trackSiteEvent(event: string, label = "", metadata: Record<string, unknown> = {}) {
  if (!hasAnalyticsConsent()) return Promise.resolve();
  const context = getVisitorContext();
  if (!context.testTraffic) window.gtag?.("event", event, { event_label: label, page_path: window.location.pathname, ...metadata });
  return fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event,
      label: label.slice(0, 200),
      path: window.location.pathname,
      ...context,
      metadata: { ...metadata, testTraffic: context.testTraffic },
    }),
  }).catch(() => undefined);
}

async function trackWhatsAppClick(target: HTMLElement, label: string) {
  if (!hasAnalyticsConsent()) return;
  const context = getVisitorContext();
  const targetUrl = target.getAttribute("href") || "";
  const placement = target.dataset.whatsappPlacement || "website";
  const accountId = target.dataset.whatsappAccount || "grimm-main";
  const clientClickId = createId();
  if (!context.testTraffic) window.gtag?.("event", "whatsapp_click", {
    event_label: label,
    page_path: window.location.pathname,
    whatsapp_placement: placement,
    whatsapp_account: accountId,
  });
  const body = JSON.stringify({ accountId, targetUrl, placement, path: window.location.pathname, label, clientClickId, ...context });
  const send = () => fetch("/api/whatsapp/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body,
  }).catch(() => undefined);
  const result = await send();
  if ((!result || result.status >= 500) && hasAnalyticsConsent()) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (hasAnalyticsConsent()) await send();
  }
}

export function AnalyticsListener() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"accepted" | "declined" | "unset">("unset");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = getStoredValue(consentStorageKey, window.localStorage);
    setConsent(saved === "accepted" || saved === "declined" ? saved : "unset");
    setReady(true);
  }, []);

  function choose(value: "accepted" | "declined") {
    setStoredValue(consentStorageKey, value, window.localStorage);
    if (value === "declined") {
      for (const key of [visitorStorageKey, visitStorageKey]) window.localStorage.removeItem(key);
      for (const key of [sessionStorageKey, sessionReferrerKey, sessionCampaignKey]) window.sessionStorage.removeItem(key);
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
    } else window.gtag?.("consent", "update", { analytics_storage: "granted" });
    setConsent(value);
  }

  useEffect(() => {
    if (pathname.startsWith("/admin") || consent !== "accepted" || !gaMeasurementId || document.querySelector(`script[data-grimm-ga="${gaMeasurementId}"]`)) return;
    window.gtag = window.gtag || function gtag(...args: unknown[]) { (window.dataLayer = window.dataLayer || []).push(args); };
    window.gtag("js", new Date());
    window.gtag("config", gaMeasurementId, { send_page_view: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
    script.dataset.grimmGa = gaMeasurementId;
    document.head.appendChild(script);
  }, [consent, pathname]);

  useEffect(() => {
    if (!pathname.startsWith("/admin") && consent === "accepted") void trackSiteEvent("page_view", document.title, { pageTitle: document.title.slice(0, 300) });
  }, [pathname, consent]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-event]") : null;
      if (!target) return;
      const eventName = target.dataset.event || "cta_click";
      const label = target.dataset.label || target.textContent?.trim() || target.getAttribute("href") || "";
      if (eventName === "whatsapp_click") {
        void trackWhatsAppClick(target, label.slice(0, 120));
        return;
      }
      void trackSiteEvent(eventName, label.slice(0, 120), { href: (target.getAttribute("href") || "").split("?")[0].slice(0, 500) });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!ready || consent !== "unset" || pathname.startsWith("/admin")) return null;
  const locale = pathname.split("/")[1];
  const copy = consentCopy[locale] || consentCopy.en;
  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-2xl rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-xl" aria-label="Analytics preferences" dir={locale === "ar" ? "rtl" : "ltr"}>
      <p>{copy.message} <Link href="/privacy" className="font-semibold underline">{copy.policy}</Link>.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("accepted")} className="rounded bg-slate-900 px-4 py-2 font-semibold text-white">{copy.allow}</button>
        <button type="button" onClick={() => choose("declined")} className="rounded border border-slate-400 px-4 py-2 font-semibold">{copy.decline}</button>
      </div>
    </aside>
  );
}
