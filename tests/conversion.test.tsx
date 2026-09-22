import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LeadGoalProvider } from "@/components/lead/LeadGoalProvider";
import { Directions } from "@/components/sections/Directions";
import { FormatsPricing } from "@/components/sections/FormatsPricing";
import { GoalMatcher } from "@/components/sections/GoalMatcher";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import uk from "@/i18n/messages/uk.json";

function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="uk" messages={uk} timeZone="Europe/Kyiv">
      <LeadGoalProvider>{children}</LeadGoalProvider>
    </NextIntlClientProvider>
  );
}

describe("Phase 2 conversion sections", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/uk");
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders the exact verified pricing and format facts", () => {
    render(<FormatsPricing />, { wrapper: Providers });

    const group = screen.getByRole("heading", { name: "Групове" }).closest("article");
    const pair = screen.getByRole("heading", { name: "Парне" }).closest("article");
    const individual = screen.getByRole("heading", { name: "Індивідуальне" }).closest("article");

    expect(group).not.toBeNull();
    expect(group).toHaveTextContent("1500 грн / місяць");
    expect(group).toHaveTextContent("3–5 людей");
    expect(group).toHaveTextContent("60–75 хв");
    expect(group).toHaveTextContent("2–3 рази / тиждень");
    expect(pair).not.toBeNull();
    expect(pair).toHaveTextContent("350 грн / заняття");
    expect(pair).toHaveTextContent("60–75 хв");
    expect(pair).toHaveTextContent("2–3 рази / тиждень");
    expect(individual).not.toBeNull();
    expect(individual).toHaveTextContent("500 грн / заняття");
    expect(individual).toHaveTextContent("60–75 хв");
    expect(individual).not.toHaveTextContent("2–3 рази / тиждень");
    expect(screen.getByText(/за стандартною ціною обраного формату/)).toBeInTheDocument();
  });

  it("keeps the unverified eight-year statistic absent while its flag is false", () => {
    render(<TrustStrip />, { wrapper: Providers });

    expect(screen.getByText("Працюємо з 2019 року")).toBeInTheDocument();
    expect(screen.getByText("100+ студентів зараз")).toBeInTheDocument();
    expect(screen.getByText("1000+ студентів за весь час")).toBeInTheDocument();
    expect(screen.queryByText(/8 років/i)).not.toBeInTheDocument();
  });

  it("maps a direction card to a typed LeadGoal and preserves it in the URL", async () => {
    window.history.replaceState({}, "", "/uk?utm_source=test");
    render(
      <>
        <Directions />
        <GoalMatcher />
      </>,
      { wrapper: Providers },
    );

    const directionLink = screen.getByRole("button", { name: "Обрати ціль: НМТ / ЄВІ" });
    expect(directionLink).toHaveAttribute("href", "?goal=nmt#lead");

    fireEvent.click(directionLink);

    await waitFor(() => expect(new URL(window.location.href).searchParams.get("goal")).toBe("nmt"));
    expect(new URL(window.location.href).searchParams.get("utm_source")).toBe("test");
    expect(window.location.hash).toBe("#lead");
    const selectionSummary = screen.getByText("Обрана ціль").parentElement;
    expect(selectionSummary).not.toBeNull();
    expect(within(selectionSummary!).getByText("НМТ")).toBeInTheDocument();
  });

  it("restores a valid preselected goal from the query for the future form", async () => {
    window.history.replaceState({}, "", "/uk?goal=fce#lead");
    render(<GoalMatcher />, { wrapper: Providers });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Зберегти ціль: FCE" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
  });

  it("renders working Hero conversion targets and the verified trial duration", () => {
    render(
      <>
        <Hero />
        <div id="lead" />
      </>,
      { wrapper: Providers },
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Англійська під вашу ціль — від НМТ до роботи за кордоном.",
    );
    expect(screen.getByText(/^45 хвилин/)).toBeInTheDocument();

    const primary = screen.getByRole("link", { name: "Заберіть свій безкоштовний пробний урок" });
    const secondary = screen.getByRole("link", { name: "Підберіть програму за 60 секунд" });
    expect(primary).toHaveAttribute("href", "#lead");
    expect(secondary).toHaveAttribute("href", "#lead");
    expect(within(screen.getByTestId("hero-media-placeholder")).queryByRole("img")).toBeNull();
  });
});
