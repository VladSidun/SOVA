import { getTranslations } from "next-intl/server";
import { business, businessAddress } from "@/config/business";
import { social } from "@/config/social";
import type { Locale } from "@/types/content";
import { Container } from "./Container";

type FooterProps = {
  locale: Locale;
};

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "Footer" });

  return (
    <footer className="border-t border-white/10 bg-brand-black py-10 text-white sm:py-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-start">
          <div className="max-w-xl">
            <p className="font-heading text-2xl font-bold tracking-[0.12em]">{business.brandName}</p>
            <p className="mt-3 text-sm leading-6 text-white/70">{t("description")}</p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold">{t("heading")}</h2>
            <address className="mt-4 space-y-3 text-sm not-italic leading-6 text-white/80">
              <p>
                <a
                  className="inline-flex min-h-11 items-center underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={`tel:${business.phoneE164}`}
                >
                  {business.phoneDisplay}
                </a>
              </p>
              <p>
                <a
                  className="inline-flex min-h-11 items-center underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={business.googleMaps}
                  rel="noreferrer"
                  target="_blank"
                >
                  {businessAddress[locale]}
                </a>
              </p>
              <p>{t("hours", { hours: business.schedule.mondayToSaturday })}</p>
            </address>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-white/55">{t("copyright")}</p>
          <nav aria-label={t("socialLabel")}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <li>
                <a
                  className="inline-flex min-h-11 items-center hover:text-red-300 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={social.instagram}
                  rel="noreferrer"
                  target="_blank"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  className="inline-flex min-h-11 items-center hover:text-red-300 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={social.facebook}
                  rel="noreferrer"
                  target="_blank"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  className="inline-flex min-h-11 items-center hover:text-red-300 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={business.googleMaps}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t("route")}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
