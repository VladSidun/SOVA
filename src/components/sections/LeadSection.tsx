"use client";

import { useTranslations } from "next-intl";
import { LeadForm } from "@/components/lead/LeadForm";
import { Section } from "@/components/layout/Section";
import { sectionIds } from "@/config/navigation";
import type { GetTurnstileToken, SubmitLead } from "@/lib/lead-client";
import type { TrackLeadEvent } from "@/lib/lead-analytics";

type LeadSectionProps = {
  submitLead?: SubmitLead;
  getTurnstileToken?: GetTurnstileToken;
  trackEvent?: TrackLeadEvent;
};

export function LeadSection(props: LeadSectionProps) {
  const t = useTranslations("LeadForm");

  return (
    <Section
      className="bg-[var(--surface-soft)] py-16 sm:py-20 lg:py-24"
      containerClassName="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-14"
      id={sectionIds.lead}
    >
      <div className="max-w-xl lg:sticky lg:top-28">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">{t("eyebrow")}</p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-brand-black sm:text-5xl">{t("title")}</h2>
        <p className="mt-5 text-base leading-7 text-[var(--text-muted)] sm:text-lg">{t("intro")}</p>
        <p className="mt-6 rounded-2xl border border-black/10 bg-white p-5 text-sm leading-6 text-[var(--text-muted)]">{t("privacyNote")}</p>
      </div>
      <LeadForm {...props} />
    </Section>
  );
}
