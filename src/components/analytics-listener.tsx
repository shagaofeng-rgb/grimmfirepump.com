"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[][];
  }
}

function track(event: string, label = "", metadata: Record<string, unknown> = {}) {
  window.gtag?.("event", event, { event_label: label, page_path: window.location.pathname, ...metadata });
  return fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, label, path: window.location.pathname, metadata }),
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
    track("page_view", document.title);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-event]") : null;
      if (!target) return;
      const eventName = target.dataset.event || "cta_click";
      const label = target.dataset.label || target.textContent?.trim() || target.getAttribute("href") || "";
      void track(eventName, label.slice(0, 120), { href: target.getAttribute("href") });
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
