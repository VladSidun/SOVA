import { useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { business } from "@/config/business";

const stepKeys = ["apply", "connect", "diagnose", "plan"] as const;
const detailKeys = ["meet", "test", "level", "diagnostic", "programme", "schedule", "pricing"] as const;

export function TrialProcess() {
  const t = useTranslations("TrustContent.Trial");

  return (
    <Section className="bg-brand-black py-16 text-white sm:py-20 lg:py-24" id="trial">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300 sm:text-sm">
            {t("eyebrow", { minutes: business.trialMinutes })}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{t("title")}</h2>
          <p className="mt-5 text-base leading-7 text-white/70 sm:text-lg">{t("intro")}</p>

          <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/[0.06] p-6">
            <p className="text-sm font-semibold leading-6 text-white">{t("host")}</p>
            <p className="mt-3 text-sm leading-6 text-white/65">{t("offlineBonus")}</p>
          </div>
        </div>

        <div>
          <ol className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/15 sm:grid-cols-2">
            {stepKeys.map((step, index) => (
              <li className="min-h-52 bg-brand-black p-6 sm:p-7" key={step}>
                <span className="text-xs font-semibold tracking-[0.16em] text-red-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-bold leading-tight tracking-[-0.025em] sm:text-2xl">
                  {t(`steps.${step}.title`, { minutes: business.trialMinutes })}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/65">{t(`steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-[1.5rem] bg-white p-6 text-brand-black sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">
              {t("insideLabel")}
            </p>
            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {detailKeys.map((detail) => (
                <li className="flex gap-3 text-sm leading-6 text-[var(--text-muted)]" key={detail}>
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-red" />
                  {t(`details.${detail}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
