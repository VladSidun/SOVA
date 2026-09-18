import { getTranslations } from "next-intl/server";
import { business } from "@/config/business";

// Minimal route smoke target, not a landing section or Hero.
export default async function FoundationPage() {
  const t = await getTranslations("Foundation");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">{business.brandName}</h1>
      <p className="mt-2">{t("status")}</p>
    </main>
  );
}
