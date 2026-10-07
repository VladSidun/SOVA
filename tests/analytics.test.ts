import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyticsEvents, createAnalyticsTracker, sanitizeAnalyticsParams,
  setAnalyticsConsent, track, type AnalyticsEvent, type AnalyticsParams,
} from "@/lib/analytics";

afterEach(() => {
  setAnalyticsConsent(false);
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function setup({ consent = true, enabled = true, ids = true } = {}) {
  const gtag = vi.fn();
  const fbq = vi.fn();
  const tiktokTrack = vi.fn();
  const instance = vi.fn(() => ({ track: tiktokTrack }));
  const tracker = createAnalyticsTracker({
    config: {
      ga: { enabled, id: ids ? "G-TEST123" : undefined },
      meta: { enabled, id: ids ? "1234567890" : undefined },
      tiktok: { enabled, id: ids ? "TESTPIXEL12345" : undefined },
    },
    hasConsent: () => consent,
    getRuntime: () => ({ gtag, fbq, ttq: { instance } }),
  });
  return { tracker, gtag, fbq, tiktokTrack, instance };
}

describe("analytics restriction and provider adapters", () => {
  it.each(["name", "phone", "comment", "email", "ageOrGrade", "attribution", "pageUrl", "referrer", "landingUrl", "turnstileToken", "user_id", "firstName", "Phone", "utm_source", "properties"])(
    "rejects the whole event when %s is supplied", (key) => {
      const params = { locale: "uk", [key]: "private" };
      expect(sanitizeAnalyticsParams(params)).toBeNull();
      const { tracker, gtag, fbq, tiktokTrack } = setup();
      tracker("trial_form_submit", params as AnalyticsParams);
      expect(gtag).not.toHaveBeenCalled();
      expect(fbq).not.toHaveBeenCalled();
      expect(tiktokTrack).not.toHaveBeenCalled();
    },
  );
  it.each([
    { locale: "Олена" }, { source: "+380991234567" }, { goal: "private comment" },
    { videoId: "https://private.org/?name=test" }, { contactMethod: { phone: "private" } },
    { step: 4 }, { goalCount: 100 }, { goalCount: 1.5 }, { goalCount: NaN }, null, [],
  ])("rejects unsafe or nested values %j", (params) => {
    expect(sanitizeAnalyticsParams(params)).toBeNull();
  });
  it("dispatches every Guide event only with sanitized values and explicit IDs", () => {
    const { tracker, gtag, fbq, tiktokTrack, instance } = setup();
    for (const event of analyticsEvents) tracker(event, { locale: "uk", step: 2 });
    expect(gtag).toHaveBeenCalledTimes(17);
    expect(gtag).toHaveBeenCalledWith("event", "cta_click", { locale: "uk", step: 2, send_to: "G-TEST123" });
    expect(fbq).toHaveBeenCalledWith("trackSingleCustom", "1234567890", "map_click", { locale: "uk", step: 2 });
    expect(instance).toHaveBeenCalledWith("TESTPIXEL12345");
    expect(tiktokTrack).toHaveBeenCalledWith("video_play", { locale: "uk", step: 2 });
  });
  it.each([{ consent: false }, { enabled: false }, { ids: false }])("is a no-op when a gate is absent: %j", (options) => {
    const { tracker, gtag, fbq, tiktokTrack } = setup(options);
    tracker("trial_form_success", { locale: "en" });
    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
    expect(tiktokTrack).not.toHaveBeenCalled();
  });
  it("rejects unknown events and tolerates missing SDKs and provider exceptions", () => {
    const { tracker, gtag } = setup();
    tracker("private event" as AnalyticsEvent, {});
    expect(gtag).not.toHaveBeenCalled();
    const missing = createAnalyticsTracker({ config: { ga: { enabled: true, id: "G-TEST123" } }, hasConsent: () => true, getRuntime: () => undefined });
    expect(() => missing("phone_click")).not.toThrow();
    const fbq = vi.fn();
    const failing = createAnalyticsTracker({
      config: { ga: { enabled: true, id: "G-TEST123" }, meta: { enabled: true, id: "1234" } },
      hasConsent: () => true,
      getRuntime: () => ({ gtag: () => { throw new Error("provider failed"); }, fbq }),
    });
    expect(() => failing("cta_click")).not.toThrow();
    expect(fbq).toHaveBeenCalledOnce();
  });
  it("uses the public track helper gates and stops immediately on consent withdrawal", () => {
    const gtag = vi.fn();
    Object.defineProperty(window, "gtag", { configurable: true, value: gtag });
    vi.stubEnv("NEXT_PUBLIC_ENABLE_GA", "true");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST123");
    track("cta_click", { locale: "en" });
    expect(gtag).not.toHaveBeenCalled();
    setAnalyticsConsent(true);
    track("cta_click", { locale: "en" });
    expect(gtag).toHaveBeenCalledOnce();
    setAnalyticsConsent(false);
    track("cta_click", { locale: "en" });
    expect(gtag).toHaveBeenCalledOnce();
    Reflect.deleteProperty(window, "gtag");
  });
  it("rejects malformed IDs and works during server rendering", () => {
    const gtag = vi.fn();
    const tracker = createAnalyticsTracker({ config: { ga: { enabled: true, id: "private" } }, hasConsent: () => true, getRuntime: () => ({ gtag }) });
    tracker("price_view");
    expect(gtag).not.toHaveBeenCalled();
    vi.stubGlobal("window", undefined);
    setAnalyticsConsent(true);
    expect(() => track("cta_click")).not.toThrow();
  });
});
