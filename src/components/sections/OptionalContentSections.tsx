import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/layout/Section";
import { features } from "@/config/features";
import { cases } from "@/content/cases";
import { reviews } from "@/content/reviews";
import { teachers } from "@/content/teachers";
import type { Locale } from "@/types/content";

export function OptionalContentSections() {
  const locale = useLocale() as Locale;
  const t = useTranslations("TrustContent.Deferred");
  const showTeachers = features.showTeachers && teachers.length > 0;
  const showResults = features.showResults && cases.length > 0;
  const showReviews = features.showReviews && reviews.length > 0;

  if (!showTeachers && !showResults && !showReviews) return null;

  return (
    <>
      {showTeachers ? (
        <Section id="teachers">
          <h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{t("teachers")}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <article className="rounded-3xl border border-black/10 p-6" key={teacher.id}>
                <h3 className="text-xl font-bold">{teacher.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{teacher.experience[locale]}</p>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {showResults ? (
        <Section className="bg-[var(--surface-soft)]" id="results">
          <h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{t("results")}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {cases.map((item) => (
              <article className="rounded-3xl border border-black/10 bg-white p-6" key={item.id}>
                <h3 className="text-xl font-bold">{item.title[locale]}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{item.description[locale]}</p>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {showReviews ? (
        <Section id="reviews">
          <h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{t("reviews")}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <figure className="rounded-3xl border border-black/10 p-6" key={review.id}>
                <blockquote className="text-base leading-7">{review.text[locale]}</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">{review.author}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
