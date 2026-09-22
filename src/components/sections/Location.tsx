import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { business, businessAddress } from "@/config/business";
import { sectionIds } from "@/config/navigation";
import type { Locale } from "@/types/content";

const mapEmbedUrl =
  "https://www.google.com/maps?q=26%2F11%20Kyryla%20i%20Mefodiia%20Square%2C%20Mukachevo&output=embed";

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

        <div className="min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/5 sm:min-h-[28rem]">
          <iframe
            className="h-full min-h-[22rem] w-full border-0 sm:min-h-[28rem]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            title={t("mapTitle")}
          />
        </div>
      </div>
    </Section>
  );
}
