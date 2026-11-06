"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLocalizedLocale } from "@/lib/i18n";

export function DocumentLocale() {
  const pathname = usePathname();
  useEffect(() => {
    const prefix = pathname.split("/")[1];
    const locale = prefix === "admin" ? "zh-CN" : isLocalizedLocale(prefix) ? prefix : "en";
    document.documentElement.lang = locale === "pt" ? "pt-BR" : locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [pathname]);
  return null;
}
