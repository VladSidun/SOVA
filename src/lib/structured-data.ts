import { business } from "@/config/business";
import { getSiteOrigin } from "./seo";

export function buildOrganizationJsonLd(origin?: string) {
  const site = getSiteOrigin(origin);
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    name: business.officialName,
    alternateName: business.brandName,
    ...(site ? { "@id": `${site}/#organization`, url: site } : {}),
    telephone: business.phoneE164,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.postalAddress.streetAddress,
      addressLocality: business.city,
      addressCountry: business.postalAddress.addressCountry,
    },
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: business.schedule.opens,
      closes: business.schedule.closes,
    }],
    sameAs: [business.instagram, business.facebook],
    hasMap: business.googleMaps,
    areaServed: business.areaServed.map((name) => ({ "@type": "Place", name })),
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
