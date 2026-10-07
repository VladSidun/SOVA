import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { business } from "@/config/business";
import { privacy } from "@/content/privacy";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, getSeoSettings } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return buildPageMetadata(locale, "/privacy", getSeoSettings());
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const copy = privacy[locale];
  return (
    <main className="py-12 sm:py-20" id="main-content" tabIndex={-1}>
      <Container className="max-w-3xl!">
        <a className="inline-flex min-h-11 items-center font-semibold text-brand-red underline underline-offset-4" href={`/${locale}`}>{copy.back}</a>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="mt-6 text-lg leading-8 text-[var(--text-muted)]">{copy.intro}</p>
        {copy.sections.map((section) => (
          <section className="mt-9" key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-3 leading-7 text-[var(--text-muted)]">{section.body}</p>
          </section>
        ))}
        <p className="mt-9 font-semibold">{copy.contact}: <a className="inline-flex min-h-11 items-center text-brand-red underline underline-offset-4" href={`tel:${business.phoneE164}`} data-analytics-event="phone_click" data-analytics-source="footer">{business.phoneDisplay}</a></p>
      </Container>
    </main>
  );
}
