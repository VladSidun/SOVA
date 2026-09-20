import { useLocale, useTranslations } from "next-intl";
import { LeadGoalLink } from "@/components/lead/LeadGoalProvider";
import { Section } from "@/components/layout/Section";
import { sectionIds } from "@/config/navigation";
import { directions } from "@/content/directions";
import type { Locale } from "@/types/content";

export function Directions() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Conversion.Directions");

  return (
    <Section className="bg-white py-16 sm:py-20 lg:py-24" id={sectionIds.directions}>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">
          {t("eyebrow")}
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-brand-black sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mt-5 text-base leading-7 text-[var(--text-muted)] sm:text-lg">{t("intro")}</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-12">
        {directions.map((direction, index) => (
          <article
            className={`group flex min-h-64 flex-col rounded-[1.5rem] border border-black/10 bg-[var(--surface-soft)] p-6 transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-black/25 hover:shadow-[0_18px_45px_rgba(26,26,26,0.08)] sm:p-7 ${
              index < 3 ? "xl:col-span-4" : "xl:col-span-3"
            } ${
              index === directions.length - 1 ? "md:col-span-2 xl:col-span-3" : ""
            }`}
            key={direction.id}
          >
            <span className="text-xs font-semibold tracking-[0.16em] text-brand-red">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-5 text-xl font-bold leading-tight tracking-[-0.025em] sm:text-2xl">
              {direction.title[locale]}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{direction.description[locale]}</p>
            <LeadGoalLink
              aria-label={t("selectAria", { goal: direction.title[locale] })}
              className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-6 text-sm font-semibold text-brand-black focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
              goal={direction.leadGoal}
            >
              {t("action")}
              <span aria-hidden="true" className="text-brand-red transition-transform group-hover:translate-x-1">
                →
              </span>
            </LeadGoalLink>
          </article>
        ))}
      </div>
    </Section>
  );
}
