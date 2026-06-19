"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function track(event: string, label = "", metadata: Record<string, unknown> = {}) {
  return fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, label, path: window.location.pathname, metadata }),
  }).catch(() => undefined);
}

export function AnalyticsListener() {
  const pathname = usePathname();

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
