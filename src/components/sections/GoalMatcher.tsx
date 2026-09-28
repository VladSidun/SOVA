"use client";

import { useLocale, useTranslations } from "next-intl";
import { LeadGoalLink, useLeadGoal } from "@/components/lead/LeadGoalProvider";
import { Section } from "@/components/layout/Section";
import { goalOptions } from "@/content/goals";
import type { Locale } from "@/types/content";

export function GoalMatcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Conversion.GoalMatcher");
  const { selectedGoal } = useLeadGoal();
  const selected = goalOptions.find((goal) => goal.id === selectedGoal);

  return (
    <Section
      className="bg-[var(--surface-soft)] py-16 sm:py-20 lg:py-24"
      containerClassName="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-14"
    >
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">
          {t("eyebrow")}
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-brand-black sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-5 text-base leading-7 text-[var(--text-muted)] sm:text-lg">{t("intro")}</p>
        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5 sm:p-6" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {selected ? t("selectedLabel") : t("emptyLabel")}
          </p>
          <p className="mt-2 font-heading text-xl font-bold text-brand-black sm:text-2xl">
            {selected ? selected.label[locale] : t("emptyValue")}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {selected ? t("selectedNote") : t("emptyNote")}
          </p>
        </div>
      </div>

      <div>
        <p className="font-heading text-lg font-semibold text-brand-black">{t("question")}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {goalOptions.map((goal) => (
            <LeadGoalLink
              activeClassName="!border-brand-red !bg-brand-red !text-white shadow-[0_10px_24px_rgba(211,47,47,0.2)]"
              aria-label={t("selectAria", { goal: goal.label[locale] })}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-center text-sm font-semibold text-brand-black transition-colors hover:border-black/30 hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              goal={goal.id}
              key={goal.id}
            >
              {goal.label[locale]}
            </LeadGoalLink>
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-[var(--text-muted)]">{t("privacyNote")}</p>
      </div>
    </Section>
  );
}
