import type { LeadPayload } from "@/types/lead";
import { attributionSchema } from "./lead-schema";

export const attributionStorageKey = "sova.lead-attribution.v1";

type Attribution = LeadPayload["attribution"];

export function captureAttribution(landingUrl: string, referrer = ""): Attribution {
  const url = new URL(landingUrl);
  const readUtm = (name: string) => url.searchParams.get(name)?.trim() || undefined;

  return {
    source: readUtm("utm_source"),
    medium: readUtm("utm_medium"),
    campaign: readUtm("utm_campaign"),
    content: readUtm("utm_content"),
    term: readUtm("utm_term"),
    referrer: referrer.trim() || undefined,
    landingUrl: url.href,
  };
}

export function getSessionAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.sessionStorage.getItem(attributionStorageKey);
    if (stored) {
      const parsed = attributionSchema.safeParse(JSON.parse(stored));
      if (parsed.success) return parsed.data;
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }

  const attribution = captureAttribution(window.location.href, document.referrer);

  try {
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
  } catch {
    // The current visit still keeps the captured data in form state.
  }

  return attribution;
}
