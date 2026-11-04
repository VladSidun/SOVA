import type { Metadata, MetadataRoute } from "next";
import { seo } from "@/config/seo";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/content";

export type SeoPage = "" | "/privacy";

// A missing, local or malformed URL must never become an invented canonical.
export function getSiteOrigin(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash ||
      url.hostname === "localhost" || !url.hostname.includes(".") ||
      /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) ||
      /\.(localhost|local|test|invalid|example)$/.test(url.hostname) ||
      /^(example\.(com|org|net))$/.test(url.hostname)) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export function getSeoSettings() {
  const origin = getSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  return {
    origin,
    indexable: Boolean(origin && process.env.SOVA_INDEXABLE === "true" &&
      process.env.VERCEL_ENV !== "preview"),
  };
}

export function localizedUrl(origin: string, locale: Locale, page: SeoPage = "") {
  return new URL(`/${locale}${page}`, origin).href;
}

export function buildPageMetadata(
  locale: Locale,
  page: SeoPage = "",
  { origin, indexable = false }: { origin?: string; indexable?: boolean } = {},
): Metadata {
  const site = getSiteOrigin(origin);
  const copy = seo[locale];
  const title = page ? copy.privacyTitle : copy.title;
  const description = page ? copy.privacyDescription : copy.description;
  const url = site ? localizedUrl(site, locale, page) : undefined;
  return {
    title,
    description,
    robots: { index: Boolean(site && indexable), follow: Boolean(site && indexable) },
    ...(site ? {
      metadataBase: new URL(site),
      alternates: {
        canonical: url,
        languages: {
          uk: localizedUrl(site, "uk", page),
          en: localizedUrl(site, "en", page),
          "x-default": localizedUrl(site, routing.defaultLocale, page),
        },
      },
    } : {}),
    openGraph: {
      title, description, type: "website", siteName: "SOVA",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      alternateLocale: locale === "uk" ? "en_US" : "uk_UA",
      ...(url ? { url } : {}),
    },
    twitter: { card: "summary", title, description },
  };
}

export function buildSitemap(origin?: string, indexable = false): MetadataRoute.Sitemap {
  const site = getSiteOrigin(origin);
  if (!site || !indexable) return [];
  return (["", "/privacy"] as const).flatMap((page) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(site, locale, page),
      alternates: { languages: {
        uk: localizedUrl(site, "uk", page),
        en: localizedUrl(site, "en", page),
        "x-default": localizedUrl(site, routing.defaultLocale, page),
      } },
    })),
  );
}

export function buildRobots(origin?: string, indexable = false): MetadataRoute.Robots {
  const site = getSiteOrigin(origin);
  return site && indexable
    ? { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${site}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
