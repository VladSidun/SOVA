"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { track, type AnalyticsEvent, type AnalyticsParams } from "@/lib/analytics";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/types/content";

// Only explicitly marked elements are observed. Never read text, href, form
// values, campaign parameters or the current URL.
export function AnalyticsEvents() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.closest<HTMLElement>("[data-analytics-event]");
      if (!element) return;
      track(element.dataset.analyticsEvent as AnalyticsEvent, {
        locale,
        ...(element.dataset.analyticsSource ? { source: element.dataset.analyticsSource as AnalyticsParams["source"] } : {}),
        ...(element.dataset.analyticsCta ? { cta: element.dataset.analyticsCta as AnalyticsParams["cta"] } : {}),
      });
    };
    const onPlay = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLVideoElement) || !target.dataset.analyticsVideo) return;
      track("video_play", { locale, videoId: target.dataset.analyticsVideo as AnalyticsParams["videoId"] });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("play", onPlay, true);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        track(entry.target.id === "pricing" ? "price_view" : "trial_form_open", { locale });
        observer?.unobserve(entry.target);
      }
    }, { threshold: 0.2 });
    for (const id of ["pricing", "lead"]) {
      const element = document.getElementById(id);
      if (element) observer?.observe(element);
    }
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("play", onPlay, true);
      observer?.disconnect();
    };
  }, [locale, pathname]);
  return null;
}
