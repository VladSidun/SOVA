import { describe, expect, it } from "vitest";
import { business } from "@/config/business";
import { buildOrganizationJsonLd, serializeJsonLd } from "@/lib/structured-data";

describe("verified organization structured data", () => {
  it("contains only SPEC-backed business facts", () => {
    expect(buildOrganizationJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": ["EducationalOrganization", "LocalBusiness"],
      name: business.officialName,
      alternateName: "SOVA",
      telephone: "+380992671906",
      address: { "@type": "PostalAddress", streetAddress: "площа Кирила і Мефодія, 26/11", addressLocality: "Мукачево", addressCountry: "UA" },
      openingHoursSpecification: [{
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00", closes: "20:00",
      }],
      sameAs: [business.instagram, business.facebook],
      hasMap: business.googleMaps,
      areaServed: ["Мукачево", "Мукачівський район", "Закарпатська область", "Україна"].map((name) => ({ "@type": "Place", name })),
    });
    expect(JSON.stringify(buildOrganizationJsonLd())).not.toMatch(/aggregateRating|reviewCount|awards|accreditations|geo|postalCode|8 років/);
  });
  it("adds identity only for a configured production origin", () => {
    expect(buildOrganizationJsonLd("https://language-school.org")).toMatchObject({
      "@id": "https://language-school.org/#organization", url: "https://language-school.org",
    });
    expect(buildOrganizationJsonLd("http://localhost:3000")).not.toHaveProperty("url");
  });
  it("escapes script-breaking content while preserving JSON", () => {
    const value = { name: "</script><script>alert(1)</script>" };
    const serialized = serializeJsonLd(value);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(value);
  });
});
