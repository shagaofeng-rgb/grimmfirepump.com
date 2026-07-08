export const localizedLocales = ["es", "ru", "ar", "fr", "pt"] as const;
export type LocalizedLocale = (typeof localizedLocales)[number];
export type SiteLocale = "en" | LocalizedLocale;

export const supportedLocalizedPaths = [
  "/",
  "/about",
  "/products",
  "/applications",
  "/projects",
  "/factory",
  "/testing",
  "/certificates",
  "/downloads",
  "/news",
  "/blog",
  "/knowledge",
  "/contact",
  "/search",
  "/tools/fire-pump-selector",
] as const;

export type LocalizedPath = (typeof supportedLocalizedPaths)[number];

export function isLocalizedLocale(locale: string): locale is LocalizedLocale {
  return (localizedLocales as readonly string[]).includes(locale);
}

export function normalizeLocalizedPath(path: string) {
  const cleanPath = `/${path}`.replace(/\/+/g, "/").replace(/\/$/, "");
  return cleanPath === "" ? "/" : cleanPath;
}

export function isSupportedLocalizedPath(path: string): path is LocalizedPath {
  return (supportedLocalizedPaths as readonly string[]).includes(normalizeLocalizedPath(path));
}

export function localizedPath(path: string, locale: SiteLocale = "en") {
  const normalizedPath = normalizeLocalizedPath(path);
  if (locale === "en") {
    return normalizedPath;
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function localizedAlternates(path: string, canonicalLocale: SiteLocale = "en") {
  const normalizedPath = normalizeLocalizedPath(path);
  return {
    canonical: localizedPath(normalizedPath, canonicalLocale),
    languages: {
      en: localizedPath(normalizedPath, "en"),
      es: localizedPath(normalizedPath, "es"),
      ru: localizedPath(normalizedPath, "ru"),
      ar: localizedPath(normalizedPath, "ar"),
      fr: localizedPath(normalizedPath, "fr"),
      pt: localizedPath(normalizedPath, "pt"),
      "x-default": localizedPath(normalizedPath, "en"),
    },
  };
}
