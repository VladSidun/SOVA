import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/layout/Container";
import { features } from "@/config/features";
import { getTrustStats } from "@/content/trust";
import type { Locale } from "@/types/content";

export function TrustStrip() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Conversion.Trust");
  const stats = getTrustStats(locale, features.showEightYearsStat);

  return (
    <section aria-label={t("label")} className="border-y border-black/10 bg-brand-black text-white">
      <Container>
        <ul className="grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-4 md:divide-y-0">
          {stats.map((stat) => (
            <li
              className="flex min-h-24 items-center justify-center px-3 py-5 text-center font-heading text-sm font-semibold leading-5 sm:min-h-28 sm:px-5 sm:text-base"
              key={stat}
            >
              {stat}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
