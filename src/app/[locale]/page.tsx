import { getTranslations } from "next-intl/server";
import { Section } from "@/components/layout/Section";
import { business } from "@/config/business";

// Minimal route smoke target, not a landing section or Hero.
export default async function FoundationPage() {
  const t = await getTranslations("Foundation");

  return (
    <main id="main-content" tabIndex={-1}>
      <Section containerClassName="min-h-[45vh] py-6">
        <h1 className="text-2xl font-bold">{business.brandName}</h1>
        <p className="mt-2">{t("status")}</p>
      </Section>
    </main>
  );
}
