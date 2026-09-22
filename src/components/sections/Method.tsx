import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { business } from "@/config/business";

const principles = ["goal", "speaking", "standards", "younger"] as const;

export function Method() {
  const t = useTranslations("TrustContent.Method");

  return (
    <Section className="bg-white py-16 sm:py-20 lg:py-24" id="method">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <div className="max-w-xl lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-brand-black sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-muted)] sm:text-lg">{t("intro")}</p>
          <div className="mt-8 flex flex-wrap gap-2" aria-label={t("standardsLabel")}>
            {["CEFR", "Cambridge", "Oxford", "Pearson"].map((standard) => (
              <span
                className="rounded-full border border-black/10 bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold"
                key={standard}
              >
                {standard}
              </span>
            ))}
          </div>
        </div>

        <ol className="border-t border-black/10">
          {principles.map((principle, index) => (
            <li className="grid gap-4 border-b border-black/10 py-7 sm:grid-cols-[4rem_1fr] sm:py-9" key={principle}>
              <span className="font-heading text-sm font-bold text-brand-red">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-bold tracking-[-0.025em] sm:text-2xl">
                  {t(`principles.${principle}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)] sm:text-base sm:leading-7">
                  {t(`principles.${principle}.body`, {
                    min: business.frequencyPerWeek.min,
                    max: business.frequencyPerWeek.max,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
