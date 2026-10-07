import { afterEach, describe, expect, it, vi } from "vitest";
import { seo } from "@/config/seo";
import { buildPageMetadata, buildRobots, buildSitemap, getSeoSettings, getSiteOrigin } from "@/lib/seo";

// Synthetic test origin only; no production domain has been claimed.
const origin = "https://language-school.org";
afterEach(() => vi.unstubAllEnvs());

describe("locale SEO and domain readiness", () => {
  it.each(["uk", "en"] as const)("builds %s canonical, hreflang and adapted copy", (locale) => {
    const metadata = buildPageMetadata(locale, "", { origin, indexable: true });
    expect(metadata.title).toBe(seo[locale].title);
    expect(metadata.description).toBe(seo[locale].description);
    expect(metadata.alternates).toEqual({
      canonical: `${origin}/${locale}`,
      languages: { uk: `${origin}/uk`, en: `${origin}/en`, "x-default": `${origin}/uk` },
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ url: `${origin}/${locale}` });
  });

  it("keeps privacy canonical on the privacy route", () => {
    const metadata = buildPageMetadata("en", "/privacy", { origin });
    expect(metadata.alternates?.canonical).toBe(`${origin}/en/privacy`);
    expect(metadata.alternates?.languages).toMatchObject({ uk: `${origin}/uk/privacy`, "x-default": `${origin}/uk/privacy` });
    expect(metadata.title).toBe(seo.en.privacyTitle);
  });

  it.each([undefined, "", "http://localhost:3000", "https://localhost", "https://127.0.0.1", "https://192.168.1.1", "https://example.com", "https://sova.example", "https://language-school.org/path", "https://language-school.org/?name=private", "https://user:private@language-school.org", "javascript:alert(1)", "not a URL"])(
    "omits every site URL for missing or unsafe origin %s", (value) => {
      expect(getSiteOrigin(value)).toBeUndefined();
      const metadata = buildPageMetadata("uk", "", { origin: value, indexable: true });
      expect(metadata).not.toHaveProperty("metadataBase");
      expect(metadata).not.toHaveProperty("alternates");
      expect(metadata.openGraph).not.toHaveProperty("url");
      expect(metadata.robots).toEqual({ index: false, follow: false });
      expect(JSON.stringify(metadata)).not.toMatch(/localhost|example\.|127\.0\.0\.1/);
      expect(buildSitemap(value, true)).toEqual([]);
      expect(buildRobots(value, true)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    },
  );

  it("normalizes an HTTPS origin and requires a separate indexing gate", () => {
    expect(getSiteOrigin(` ${origin}/ `)).toBe(origin);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", origin);
    vi.stubEnv("SOVA_INDEXABLE", "false");
    expect(getSeoSettings()).toEqual({ origin, indexable: false });
    vi.stubEnv("SOVA_INDEXABLE", "true");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getSeoSettings().indexable).toBe(true);
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(getSeoSettings().indexable).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSeoSettings().indexable).toBe(false);
  });

  it("publishes only real bilingual routes and excludes the lead API", () => {
    expect(buildSitemap(origin, false)).toEqual([]);
    expect(buildSitemap(origin, true).map((entry) => entry.url)).toEqual([
      `${origin}/uk`, `${origin}/en`, `${origin}/uk/privacy`, `${origin}/en/privacy`,
    ]);
    expect(buildRobots(origin, true)).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${origin}/sitemap.xml`,
    });
  });
});
