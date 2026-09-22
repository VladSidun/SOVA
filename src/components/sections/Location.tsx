import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { business, businessAddress } from "@/config/business";
import { sectionIds } from "@/config/navigation";
import type { Locale } from "@/types/content";

export function Location() {
  const locale = useLocale() as Locale;
  const t = useTranslations("TrustContent.Location");

  return (
    <Section className="bg-brand-black py-16 text-white sm:py-20 lg:py-24" id={sectionIds.contacts}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch lg:gap-10">
        <div className="flex flex-col rounded-[1.75rem] border border-white/15 p-7 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300 sm:text-sm">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{t("title")}</h2>
          <address className="mt-8 not-italic">
            <p className="font-heading text-xl font-bold leading-snug sm:text-2xl">{businessAddress[locale]}</p>
            <p className="mt-5 text-base font-semibold">{t("hours", { hours: business.schedule.mondayToSaturday })}</p>
            <p className="mt-3 text-sm leading-6 text-white/65">{t("note")}</p>
          </address>
          <a
            className="mt-8 inline-flex min-h-12 items-center justify-center self-start rounded-full bg-brand-red px-6 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            href={business.googleMaps}
            rel="noreferrer"
            target="_blank"
          >
            {t("route")}
            <span aria-hidden="true" className="ml-2">↗</span>
          </a>
        </div>

        <a
          aria-label={t("mapTitle")}
          className="group relative min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#252525] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-[28rem]"
          data-testid="location-map-preview"
          href={business.googleMaps}
          rel="noreferrer"
          target="_blank"
        >
          <span aria-hidden="true" className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.09)_1px,transparent_1px)] [background-size:3rem_3rem]" />
          <span aria-hidden="true" className="absolute -left-20 top-[38%] h-12 w-[130%] -rotate-6 rounded-full border-y border-white/20 bg-white/[0.04]" />
          <span aria-hidden="true" className="absolute left-[52%] top-[-12%] h-[130%] w-10 rotate-[24deg] rounded-full border-x border-white/15 bg-white/[0.03]" />
          <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-brand-red shadow-[0_18px_45px_rgba(211,47,47,0.35)] transition-transform group-hover:-translate-y-1">
              <span className="size-4 rounded-full border-4 border-white" />
            </span>
            <span className="mt-4 rounded-full bg-white px-4 py-2 text-center text-xs font-bold text-brand-black shadow-xl">
              {business.brandName} · {business.city}
            </span>
          </span>
          <span className="absolute bottom-5 right-5 rounded-full border border-white/15 bg-brand-black/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
            {t("openMap")} ↗
          </span>
        </a>
      </div>
    </Section>
  );
}
