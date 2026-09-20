import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { business } from "@/config/business";
import { sectionIds } from "@/config/navigation";
import { pricing } from "@/config/pricing";
import { formats } from "@/content/formats";
import type { FormatDetail, Locale } from "@/types/content";

export function FormatsPricing() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Conversion.Formats");

  const getDetail = (detail: FormatDetail) => {
    switch (detail) {
      case "groupSize":
        return t("details.groupSize", {
          min: pricing.group.groupSizeMin,
          max: pricing.group.groupSizeMax,
        });
      case "pairSize":
        return t("details.pairSize");
      case "personalPlan":
        return t("details.personalPlan");
      case "frequency":
        return t("details.frequency", {
          min: business.frequencyPerWeek.min,
          max: business.frequencyPerWeek.max,
        });
      case "duration":
        return t("details.duration", {
          min: business.lessonMinutes.min,
          max: business.lessonMinutes.max,
        });
      case "modes":
        return t("details.modes");
    }
  };

  return (
    <Section className="bg-white py-16 sm:py-20 lg:py-24" id={sectionIds.formats}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-brand-black sm:text-5xl">
            {t("title")}
          </h2>
        </div>
        <p className="max-w-xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">{t("intro")}</p>
      </div>

      <div className="mt-10 scroll-mt-24" id={sectionIds.pricing}>
        <div className="grid gap-4 lg:grid-cols-3">
          {formats.map((format, index) => {
            const price = pricing[format.id];
            const featured = format.id === "group";

            return (
              <article
                className={`flex min-h-[30rem] flex-col rounded-[1.75rem] border p-6 sm:p-8 ${
                  featured
                    ? "border-brand-red bg-brand-red text-white shadow-[0_24px_60px_rgba(211,47,47,0.2)]"
                    : "border-black/10 bg-[var(--surface-soft)] text-brand-black"
                }`}
                key={format.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                      featured ? "text-white" : "text-brand-red"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  {featured ? (
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-red">
                      {t("popular")}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                  {format.title[locale]}
                </h3>
                <p className={`mt-3 text-sm leading-6 ${featured ? "text-white" : "text-[var(--text-muted)]"}`}>
                  {format.description[locale]}
                </p>

                <p className="mt-8 font-heading text-[2.65rem] font-bold leading-none tracking-[-0.045em] sm:text-5xl">
                  {price.priceUAH} <span className="text-lg font-semibold tracking-normal">{t(`units.${price.unit}`)}</span>
                </p>

                <ul
                  className={`mt-8 space-y-0 border-t ${featured ? "border-white/20" : "border-black/10"}`}
                >
                  {format.details.map((detail) => (
                    <li
                      className={`flex min-h-14 items-center gap-3 border-b text-sm font-medium ${
                        featured ? "border-white/20" : "border-black/10"
                      }`}
                      key={detail}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-1.5 shrink-0 rounded-full ${featured ? "bg-white" : "bg-brand-red"}`}
                      />
                      {getDetail(detail)}
                    </li>
                  ))}
                </ul>

                <a
                  className={`mt-auto inline-flex min-h-12 items-center justify-center rounded-full px-5 pt-0 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 ${
                    featured
                      ? "bg-white text-brand-red hover:bg-white/90 focus-visible:outline-white"
                      : "bg-brand-black text-white hover:bg-black/85 focus-visible:outline-brand-red"
                  }`}
                  href={`#${sectionIds.lead}`}
                >
                  {t("cta")}
                </a>
              </article>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-[var(--surface-soft)] px-5 py-5 sm:px-7">
          <p className="text-sm font-semibold leading-6 text-brand-black sm:text-base">{t("examNote")}</p>
        </div>
      </div>
    </Section>
  );
}
