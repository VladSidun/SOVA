import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import uk from "@/i18n/messages/uk.json";
import en from "@/i18n/messages/en.json";

function TranslationSmokeTarget() {
  const t = useTranslations("Foundation");
  return <p>{t("status")}</p>;
}

describe("UA/EN scaffolding", () => {
  it("uses the Ukrainian URL locale code and deterministic default", () => {
    expect(routing.locales).toEqual(["uk", "en"]);
    expect(routing.defaultLocale).toBe("uk");
    expect(routing.localeDetection).toBe(false);
    expect(Object.keys(uk)).toEqual(Object.keys(en));
    expect(Object.keys(uk.Foundation)).toEqual(Object.keys(en.Foundation));
    expect(Object.keys(uk.Navigation)).toEqual(Object.keys(en.Navigation));
    expect(Object.keys(uk.Footer)).toEqual(Object.keys(en.Footer));
    expect(Object.keys(uk.Conversion)).toEqual(Object.keys(en.Conversion));
    expect(Object.keys(uk.Conversion.Hero)).toEqual(Object.keys(en.Conversion.Hero));
    expect(Object.keys(uk.Conversion.GoalMatcher)).toEqual(Object.keys(en.Conversion.GoalMatcher));
    expect(Object.keys(uk.Conversion.Formats)).toEqual(Object.keys(en.Conversion.Formats));
  });

  it.each([
    { locale: "uk", messages: uk },
    { locale: "en", messages: en },
  ])("renders the $locale dictionary using next-intl", ({ locale, messages }) => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Kyiv">
        <TranslationSmokeTarget />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(messages.Foundation.status)).toBeInTheDocument();
  });
});
