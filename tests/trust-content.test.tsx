import { fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { FAQ } from "@/components/sections/FAQ";
import { Location } from "@/components/sections/Location";
import { OptionalContentSections } from "@/components/sections/OptionalContentSections";
import { TrialProcess } from "@/components/sections/TrialProcess";
import { WhySova } from "@/components/sections/WhySova";
import { business } from "@/config/business";
import uk from "@/i18n/messages/uk.json";

function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="uk" messages={uk} timeZone="Europe/Kyiv">
      {children}
    </NextIntlClientProvider>
  );
}

describe("Phase 3 trust content", () => {
  it("renders the complete 45-minute trial and accurate host options", () => {
    render(<TrialProcess />, { wrapper: Providers });

    expect(screen.getByText("Що входить у 45 хвилин")).toBeInTheDocument();
    expect(screen.getByText("знайомство й контекст вашої цілі")).toBeInTheDocument();
    expect(screen.getByText("тестування знань")).toBeInTheDocument();
    expect(screen.getByText("визначення рівня")).toBeInTheDocument();
    expect(screen.getByText("коротка мовна діагностика")).toBeInTheDocument();
    expect(screen.getByText("програма під ціль, рівень і дедлайн")).toBeInTheDocument();
    expect(screen.getByText("обговорення графіка")).toBeInTheDocument();
    expect(screen.getByText("пояснення форматів і цін")).toBeInTheDocument();
    expect(
      screen.getByText("Пробний проводить потенційний викладач або адміністратор / головний викладач."),
    ).toBeInTheDocument();
    expect(screen.getByText(/екскурсію школою та покажемо навчальні матеріали/)).toBeInTheDocument();
  });

  it("renders the proof composition without turning it into ten identical cards", () => {
    const { container } = render(<WhySova />, { wrapper: Providers });

    expect(screen.getByText(business.lifetimeStudents)).toBeInTheDocument();
    expect(screen.getByText(business.currentStudents)).toBeInTheDocument();
    expect(screen.getByText("Навчання під конкретну ціль")).toBeInTheDocument();
    expect(screen.getByText("Speaking first")).toBeInTheDocument();
    expect(screen.getByText("Cambridge")).toBeInTheDocument();
    expect(screen.getByText("Oxford")).toBeInTheDocument();
    expect(screen.getByText("Pearson")).toBeInTheDocument();
    expect(container.querySelectorAll("article")).toHaveLength(6);
  });

  it("renders the configured address, hours and Google Maps destination", () => {
    render(<Location />, { wrapper: Providers });

    const location = screen.getByRole("heading", { name: "SOVA у центрі Мукачева." }).closest("section");
    expect(location).not.toBeNull();
    expect(within(location!).getByText("м. Мукачево, площа Кирила і Мефодія, 26/11")).toBeInTheDocument();
    expect(within(location!).getByText("Пн–Сб: 09:00–20:00")).toBeInTheDocument();
    expect(within(location!).getByText(/Поруч є платна парковка/)).toBeInTheDocument();
    expect(within(location!).getByRole("link", { name: /Прокласти маршрут/ })).toHaveAttribute(
      "href",
      business.googleMaps,
    );
    expect(within(location!).getByTestId("location-map-preview")).toHaveAttribute(
      "href",
      business.googleMaps,
    );
  });

  it("uses native accessible details and avoids a universal rescheduling promise", () => {
    render(<FAQ />, { wrapper: Providers });

    const question = screen.getByText("Які правила перенесення занять?");
    const details = question.closest("details");
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");

    fireEvent.click(question.closest("summary")!);

    expect(details).toHaveAttribute("open");
    expect(within(details!).getByText(/Умови залежать від формату навчання/)).toBeInTheDocument();
    expect(within(details!).getByText(/не застосовуємо одне непідтверджене правило/)).toBeInTheDocument();
  });

  it("keeps teachers, results and reviews absent while their flags and content are unavailable", () => {
    const { container } = render(<OptionalContentSections />, { wrapper: Providers });

    expect(container).toBeEmptyDOMElement();
    expect(document.querySelector("#teachers, #results, #reviews")).toBeNull();
  });
});
