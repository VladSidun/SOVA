import { business } from "@/config/business";

export type LeadFallbackLinks = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  viber: string;
  telegram?: string;
};

type ContactLinkOverrides = {
  whatsapp?: string;
  viber?: string;
  telegram?: string;
};

export function buildLeadFallbackLinks(overrides: ContactLinkOverrides = {}): LeadFallbackLinks {
  const phoneDigits = business.phoneE164.replaceAll(/\D/g, "");

  return {
    phone: `tel:${business.phoneE164}`,
    phoneDisplay: business.phoneDisplay,
    whatsapp: overrides.whatsapp ?? `https://wa.me/${phoneDigits}`,
    viber: overrides.viber ?? `viber://chat?number=${encodeURIComponent(business.phoneE164)}`,
    ...(overrides.telegram ? { telegram: overrides.telegram } : {}),
  };
}
