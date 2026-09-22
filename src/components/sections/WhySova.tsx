import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { business } from "@/config/business";
import { sectionIds } from "@/config/navigation";
import { pricing } from "@/config/pricing";

export function WhySova() {
  const t = useTranslations("TrustContent.Why");

  return (
    <Section className="bg-[var(--surface-soft)] py-16 sm:py-20 lg:py-24" id={sectionIds.about}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{t("title")}</h2>
        </div>
        <p className="max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">{t("intro")}</p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-12">
        <article className="rounded-[1.75rem] bg-brand-red p-7 text-white sm:p-9 lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">{t("reach.label")}</p>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="font-heading text-4xl font-bold tracking-[-0.05em] sm:text-6xl">{business.lifetimeStudents}</p>
              <p className="mt-3 max-w-44 text-sm leading-6 text-white/80">{t("reach.lifetime")}</p>
            </div>
            <div className="border-l border-white/25 pl-6">
              <p className="font-heading text-4xl font-bold tracking-[-0.05em] sm:text-6xl">{business.currentStudents}</p>
              <p className="mt-3 max-w-44 text-sm leading-6 text-white/80">{t("reach.current")}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-black/10 bg-white p-7 sm:p-9 lg:col-span-5">
          <span className="font-heading text-5xl font-bold text-brand-red" aria-hidden="true">↗</span>
          <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em]">{t("goal.title")}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{t("goal.body")}</p>
        </article>

        <article className="rounded-[1.75rem] bg-brand-black p-7 text-white sm:p-9 lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300">Speaking first</p>
          <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em]">{t("speaking.title")}</h3>
          <p className="mt-3 text-sm leading-6 text-white/65">{t("speaking.body")}</p>
        </article>

        <article className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white p-7 sm:p-9 lg:col-span-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">CEFR</p>
              <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{t("materials.title")}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{t("materials.body")}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:max-w-xs sm:justify-end">
              {["Cambridge", "Oxford", "Pearson"].map((publisher) => (
                <span className="rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold" key={publisher}>
                  {publisher}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-white p-7 sm:p-9 lg:col-span-7">
          <div aria-hidden="true" className="absolute -right-16 -top-16 size-44 rounded-full border-[2.5rem] border-brand-red/10" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">{business.city}</p>
          <h3 className="relative mt-8 max-w-lg text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{t("place.title")}</h3>
          <p className="relative mt-3 max-w-xl text-sm leading-6 text-[var(--text-muted)]">{t("place.body")}</p>
        </article>

        <article className="rounded-[1.75rem] border border-black/10 bg-white p-7 sm:p-9 lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-red font-heading text-lg font-bold text-white">
              {pricing.group.groupSizeMin}–{pricing.group.groupSizeMax}
            </span>
            <span className="text-sm font-semibold">{t("smallGroups.badge")}</span>
          </div>
          <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em]">{t("smallGroups.title")}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
            {t("smallGroups.body", { minutes: business.trialMinutes })}
          </p>
        </article>
      </div>
    </Section>
  );
}
