"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || "";
const visitorStorageKey = "grimm_visitor_id";
const visitStorageKey = "grimm_visit_number";
const sessionStorageKey = "grimm_session_id";
const sessionReferrerKey = "grimm_session_referrer";

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

function getVisitorContext() {
  const visitorId = getStoredValue(visitorStorageKey, window.localStorage) || createId();
  const sessionId = getStoredValue(sessionStorageKey, window.sessionStorage) || createId();
  const currentVisit = Number(getStoredValue(visitStorageKey, window.localStorage) || "0");
  const isNewVisitor = !getStoredValue(visitorStorageKey, window.localStorage);
  const visitNumber = isNewVisitor ? currentVisit + 1 : Math.max(1, currentVisit);
  setStoredValue(visitorStorageKey, visitorId, window.localStorage);
  setStoredValue(sessionStorageKey, sessionId, window.sessionStorage);
  setStoredValue(visitStorageKey, String(visitNumber), window.localStorage);
  const referrer = getStoredValue(sessionReferrerKey, window.sessionStorage) || document.referrer || "";
  setStoredValue(sessionReferrerKey, referrer, window.sessionStorage);
  const params = new URLSearchParams(window.location.search);
  return {
    visitorId,
    sessionId,
    visitNumber,
    referrer,
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    testTraffic: params.get("grimm_traffic") === "test",
  };
}

function track(event: string, label = "", metadata: Record<string, unknown> = {}) {
  const context = getVisitorContext();
  window.gtag?.("event", event, { event_label: label, page_path: window.location.pathname, ...metadata });
  return fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event,
      label,
      path: window.location.pathname,
      ...context,
      metadata: { ...metadata, testTraffic: context.testTraffic },
    }),
  }).catch(() => undefined);
}

export function AnalyticsListener() {
  const pathname = usePathname();

  useEffect(() => {
    if (!gaMeasurementId || document.querySelector(`script[data-grimm-ga="${gaMeasurementId}"]`)) return;
    window.gtag = window.gtag || function gtag(...args: unknown[]) { (window.dataLayer = window.dataLayer || []).push(args); };
    window.gtag("js", new Date());
    window.gtag("config", gaMeasurementId, { send_page_view: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
    script.dataset.grimmGa = gaMeasurementId;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    void track("page_view", document.title, { pageTitle: document.title });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-event]") : null;
      if (!target) return;
      const eventName = target.dataset.event || "cta_click";
      const label = target.dataset.label || target.textContent?.trim() || target.getAttribute("href") || "";
      void track(eventName, label.slice(0, 120), { href: target.getAttribute("href") || "" });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
