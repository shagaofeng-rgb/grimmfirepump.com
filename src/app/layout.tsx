import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import "./globals.css";
import { company } from "@/data/site";
import { AnalyticsListener } from "@/components/analytics-listener";

export const metadata: Metadata = {
  metadataBase: new URL(company.website),
  title: {
    default: "GRIMM PUMP | Fire Pump Systems for Global Projects",
    template: "%s | GRIMM PUMP",
  },
  description:
    "GRIMM PUMP supplies fire pump systems, diesel fire pumps, electric fire pumps, jockey pumps and packaged pump solutions for global fire protection projects.",
  openGraph: {
    title: "GRIMM PUMP Fire Pump Systems",
    description: "Factory-built fire pump systems for industrial, commercial and infrastructure projects worldwide.",
    url: company.website,
    siteName: "GRIMM PUMP",
    images: [{ url: "/assets/applications/hero-edj.webp", width: 1200, height: 900 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRIMM PUMP Fire Pump Systems",
    description: "Factory-built fire pump systems for industrial, commercial and infrastructure projects worldwide.",
    images: ["/assets/applications/hero-edj.webp"],
  },
  icons: {
    icon: "/assets/images/logo.png",
    shortcut: "/assets/images/logo.png",
    apple: "/assets/images/logo.png",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = (await headers()).get("x-site-locale") || "en";
  const languageMap: Record<string, string> = { en: "en", es: "es", ru: "ru", ar: "ar", fr: "fr", pt: "pt-BR" };
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    legalName: company.legalName,
    url: company.website,
    email: company.email,
    telephone: company.phone,
    address: company.address,
    sameAs: [company.facebookUrl],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: company.shortName,
    url: company.website,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: company.name,
      url: company.website,
    },
  };

  return (
    <html lang={languageMap[locale] || "en"} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        {children}
        <AnalyticsListener />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  );
}
