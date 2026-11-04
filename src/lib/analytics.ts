import { z } from "zod";
import { features } from "@/config/features";
import { isLeadGoal } from "@/lib/lead-goal";
import { getPublicEnv } from "@/lib/public-env";

export const analyticsEvents = [
  "cta_click", "goal_select", "trial_form_open", "trial_form_start",
  "trial_form_step_complete", "trial_form_submit", "trial_form_success",
  "trial_form_error", "phone_click", "telegram_click", "viber_click",
  "whatsapp_click", "instagram_click", "facebook_click", "price_view",
  "video_play", "map_click",
] as const;
export type AnalyticsEvent = (typeof analyticsEvents)[number];

// Closed values prevent PII hidden inside an otherwise legitimate parameter.
const paramsSchema = z.object({
  locale: z.enum(["uk", "en"]).optional(),
  step: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  goalCount: z.number().int().min(0).max(14).optional(),
  goal: z.string().refine((value) => isLeadGoal(value)).optional(),
  studyMode: z.enum(["offline", "online", "unsure"]).optional(),
  contactMethod: z.enum(["call", "telegram", "viber", "whatsapp"]).optional(),
  source: z.enum(["header", "hero", "directions", "goal_matcher", "pricing", "trial", "location", "footer", "lead", "fallback"]).optional(),
  cta: z.enum(["trial", "program", "goal"]).optional(),
  videoId: z.enum(["hero", "school", "review"]).optional(),
}).strict();
export type AnalyticsParams = z.infer<typeof paramsSchema>;
const eventSchema = z.enum(analyticsEvents);

// Reject the entire event on unknown fields; never log rejected input.
export function sanitizeAnalyticsParams(params: unknown): AnalyticsParams | null {
  const result = paramsSchema.safeParse(params);
  return result.success ? result.data : null;
}

export type AnalyticsConfig = {
  ga?: { enabled: boolean; id?: string };
  meta?: { enabled: boolean; id?: string };
  tiktok?: { enabled: boolean; id?: string };
};
export type AnalyticsRuntime = {
  gtag?: (command: "event", event: AnalyticsEvent, params: AnalyticsParams & { send_to: string }) => void;
  fbq?: (command: "trackSingleCustom", id: string, event: AnalyticsEvent, params: AnalyticsParams) => void;
  ttq?: { instance: (id: string) => { track: (event: AnalyticsEvent, params: AnalyticsParams) => void } };
};

export function createAnalyticsTracker({
  config, getRuntime, hasConsent,
}: {
  config: AnalyticsConfig;
  getRuntime: () => AnalyticsRuntime | undefined;
  hasConsent: () => boolean;
}) {
  return (event: AnalyticsEvent, params: AnalyticsParams = {}): void => {
    if (!eventSchema.safeParse(event).success) return;
    const safe = sanitizeAnalyticsParams(params);
    if (!safe || !hasConsent()) return;
    const runtime = getRuntime();
    if (!runtime) return;
    // Provider errors must never interrupt navigation or turn a sent lead into an error.
    const send = (action: () => void) => { try { action(); } catch { /* no logging */ } };
    const ga = config.ga;
    if (ga?.enabled && ga.id && /^G-[A-Z0-9]+$/.test(ga.id)) {
      send(() => runtime.gtag?.("event", event, { ...safe, send_to: ga.id! }));
    }
    const meta = config.meta;
    if (meta?.enabled && meta.id && /^\d+$/.test(meta.id)) {
      send(() => runtime.fbq?.("trackSingleCustom", meta.id!, event, { ...safe }));
    }
    const tiktok = config.tiktok;
    if (tiktok?.enabled && tiktok.id && /^[A-Z0-9]{10,30}$/.test(tiktok.id)) {
      send(() => runtime.ttq?.instance(tiktok.id!).track(event, { ...safe }));
    }
  };
}

let analyticsConsent = false;

// A future consent manager calls this after a separate analytics choice.
// The lead contact checkbox must NEVER grant tracking consent.
export function setAnalyticsConsent(granted: boolean) {
  analyticsConsent = granted === true;
}

// No script injection, automatic pageviews, DOM scraping, identity calls or
// pre-consent queue. Ad SDK bootstrapping belongs to the authenticated setup gate.
export function track(event: AnalyticsEvent, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined" || !analyticsConsent) return;
  const env = getPublicEnv();
  const tracker = createAnalyticsTracker({
    config: {
      ga: { enabled: features.enableGA || env.NEXT_PUBLIC_ENABLE_GA === "true", id: env.NEXT_PUBLIC_GA_ID },
      meta: { enabled: features.enableMetaPixel || env.NEXT_PUBLIC_ENABLE_META_PIXEL === "true", id: env.NEXT_PUBLIC_META_PIXEL_ID },
      tiktok: { enabled: features.enableTikTokPixel || env.NEXT_PUBLIC_ENABLE_TIKTOK_PIXEL === "true", id: env.NEXT_PUBLIC_TIKTOK_PIXEL_ID },
    },
    getRuntime: () => window as Window & AnalyticsRuntime,
    hasConsent: () => analyticsConsent,
  });
  tracker(event, params);
}
