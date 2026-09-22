import Image from "next/image";
import { useTranslations } from "next-intl";
import { business } from "@/config/business";
import { sectionIds } from "@/config/navigation";
import { Container } from "@/components/layout/Container";

export function Hero() {
  const t = useTranslations("Conversion.Hero");

  return (
    <section className="overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:gap-14">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red sm:text-sm">
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 text-[clamp(2.45rem,7vw,5.5rem)] font-bold leading-[0.96] tracking-[-0.045em] text-brand-black">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--text-muted)] sm:text-lg sm:leading-8">
              {t("body")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-red px-6 text-center text-sm font-semibold text-white shadow-[0_12px_28px_rgba(211,47,47,0.22)] transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red sm:min-h-14 sm:text-base"
                href={`#${sectionIds.lead}`}
              >
                {t("primaryCta")}
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/15 bg-white px-6 text-center text-sm font-semibold text-brand-black transition-colors hover:border-black/30 hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red sm:min-h-14 sm:text-base"
                href={`#${sectionIds.lead}`}
              >
                {t("secondaryCta")}
              </a>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
              {t("microcopy", { minutes: business.trialMinutes })}
            </p>
          </div>

          <div
            aria-label={t("mediaLabel")}
            className="relative mx-auto aspect-[4/5] w-full max-w-[32rem] overflow-hidden rounded-[2rem] border border-black/10 bg-[var(--surface-soft)] shadow-[0_26px_80px_rgba(26,26,26,0.12)]"
            data-testid="hero-media-placeholder"
            role="img"
          >
            <div className="absolute -right-[16%] -top-[5%] size-[66%] rounded-full bg-brand-red" />
            <div className="absolute -bottom-[12%] -left-[28%] aspect-square w-[82%] rounded-full border-[3rem] border-brand-black sm:border-[4.5rem]" />
            <div className="absolute inset-x-6 top-6 flex items-center justify-between sm:inset-x-8 sm:top-8">
              <span className="rounded-full bg-white/90 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-black shadow-sm">
                {t("mediaBadge")}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Mukachevo</span>
            </div>
            <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] bg-white/95 p-6 shadow-lg backdrop-blur sm:inset-x-8 sm:bottom-8 sm:p-7">
              <Image alt="" aria-hidden="true" height={64} src="/brand/logo.svg" width={64} />
              <p className="mt-4 max-w-xs font-heading text-2xl font-bold leading-tight tracking-[-0.03em] text-brand-black sm:text-3xl">
                {t("mediaTitle")}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{t("mediaNote")}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
