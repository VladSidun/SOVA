import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { faq } from "@/content/faq";
import type { Locale } from "@/types/content";

export function FAQ() {
  const locale = useLocale() as Locale;
  const t = useTranslations("TrustContent.FAQ");

  return (
    <Section className="bg-[var(--surface-soft)] py-16 sm:py-20 lg:py-24" id="faq">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{t("title")}</h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-muted)] sm:text-lg">{t("intro")}</p>
        </div>

        <div className="border-t border-black/10">
          {faq.map((item) => (
            <details className="group border-b border-black/10" key={item.id}>
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 font-heading text-lg font-bold leading-snug marker:hidden focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red sm:text-xl [&::-webkit-details-marker]:hidden">
                {item.question[locale]}
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-black/15 text-xl font-normal transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 pr-14 text-sm leading-6 text-[var(--text-muted)] sm:text-base sm:leading-7">
                {item.answer[locale]}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
