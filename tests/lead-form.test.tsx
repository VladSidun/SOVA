import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LeadGoalProvider } from "@/components/lead/LeadGoalProvider";
import { Directions } from "@/components/sections/Directions";
import { LeadSection } from "@/components/sections/LeadSection";
import { attributionStorageKey, captureAttribution } from "@/lib/attribution";
import { toLeadAnalyticsParams } from "@/lib/lead-analytics";
import type { SubmitLead } from "@/lib/lead-client";
import uk from "@/i18n/messages/uk.json";
import type { LeadPayload } from "@/types/lead";

function Providers({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="uk" messages={uk} timeZone="Europe/Kyiv">
      <LeadGoalProvider>{children}</LeadGoalProvider>
    </NextIntlClientProvider>
  );
}

async function reachContactStep() {
  fireEvent.click(screen.getByRole("radio", { name: "Дорослий" }));
  fireEvent.click(screen.getByRole("button", { name: "Далі" }));
  await screen.findByRole("heading", { name: "Яка ваша ціль?" });
  fireEvent.click(screen.getByRole("checkbox", { name: "НМТ" }));
  fireEvent.click(screen.getByRole("radio", { name: "Онлайн" }));
  fireEvent.click(screen.getByRole("button", { name: "Далі" }));
  await screen.findByRole("heading", { name: "Як з вами зв’язатися?" });
}

async function fillAndSubmitContact() {
  fireEvent.change(screen.getByLabelText("Ім’я"), { target: { value: "Олена" } });
  fireEvent.change(screen.getByLabelText("Телефон"), { target: { value: "099 123 45 67" } });
  fireEvent.click(screen.getByRole("radio", { name: "Telegram" }));
  fireEvent.change(screen.getByLabelText(/Коментар/), { target: { value: "Зателефонуйте після 18:00" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /SOVA використає мої контактні дані/ }));
  fireEvent.click(screen.getByRole("button", { name: "Заберіть безкоштовний пробний урок" }));
}

describe("Phase 4 lead form", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/uk");
    window.sessionStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("preserves entered values while moving Back and Next", async () => {
    render(<LeadSection submitLead={vi.fn<SubmitLead>()} />, { wrapper: Providers });

    expect(screen.queryByLabelText(/email|електронна пошта/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Школяр" }));
    fireEvent.change(screen.getByLabelText(/Вік або клас/), { target: { value: "8 клас" } });
    fireEvent.click(screen.getByRole("button", { name: "Далі" }));
    await screen.findByRole("heading", { name: "Яка ваша ціль?" });
    fireEvent.click(screen.getByRole("checkbox", { name: "Шкільна англійська" }));
    fireEvent.click(screen.getByRole("radio", { name: "Офлайн" }));
    fireEvent.click(screen.getByRole("button", { name: "Далі" }));
    await screen.findByRole("heading", { name: "Як з вами зв’язатися?" });

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByRole("checkbox", { name: "Шкільна англійська" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Офлайн" })).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByRole("radio", { name: "Школяр" })).toBeChecked();
    expect(screen.getByLabelText(/Вік або клас/)).toHaveValue("8 клас");
  });

  it("carries a direction card preselection into the multi-select form step", async () => {
    render(
      <>
        <Directions />
        <LeadSection submitLead={vi.fn<SubmitLead>()} />
      </>,
      { wrapper: Providers },
    );

    fireEvent.click(screen.getByRole("button", { name: "Обрати ціль: НМТ / ЄВІ" }));
    fireEvent.click(screen.getByRole("radio", { name: "Студент" }));
    fireEvent.click(screen.getByRole("button", { name: "Далі" }));

    expect(await screen.findByRole("checkbox", { name: "НМТ" })).toBeChecked();
    expect(screen.getByText(/Ціль, обрана вище, уже додана/)).toBeInTheDocument();
  });

  it("persists first-touch UTM data and includes it in the normalized payload", async () => {
    window.history.replaceState({}, "", "/uk?utm_source=google&utm_medium=cpc&utm_campaign=autumn");
    const submitLead = vi.fn<SubmitLead>().mockResolvedValue(undefined);
    render(
      <LeadSection getTurnstileToken={async () => "turnstile-client-token"} submitLead={submitLead} />,
      { wrapper: Providers },
    );

    await waitFor(() => expect(window.sessionStorage.getItem(attributionStorageKey)).not.toBeNull());
    window.history.replaceState({}, "", "/uk?utm_source=overwritten");
    await reachContactStep();
    await fillAndSubmitContact();

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1));
    const payload = submitLead.mock.calls[0][0];
    expect(payload.phone).toBe("+380991234567");
    expect(payload.attribution).toMatchObject({
      source: "google",
      medium: "cpc",
      campaign: "autumn",
    });
    expect(payload.attribution.landingUrl).toContain("utm_source=google");
    expect(payload.turnstileToken).toBe("turnstile-client-token");
    expect(await screen.findByRole("heading", { name: "Дякуємо — заявку прийнято." })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Заберіть безкоштовний пробний урок" })).not.toBeInTheDocument();
  });

  it("captures every supported campaign field, referrer and original landing URL", () => {
    const attribution = captureAttribution(
      "https://sova.example/uk?utm_source=instagram&utm_medium=paid&utm_campaign=school&utm_content=video&utm_term=english",
      "https://instagram.com/",
    );

    expect(attribution).toEqual({
      source: "instagram",
      medium: "paid",
      campaign: "school",
      content: "video",
      term: "english",
      referrer: "https://instagram.com/",
      landingUrl:
        "https://sova.example/uk?utm_source=instagram&utm_medium=paid&utm_campaign=school&utm_content=video&utm_term=english",
    });
  });

  it("preserves user data after a submission error", async () => {
    const submitLead = vi.fn<SubmitLead>().mockRejectedValue(new Error("offline"));
    render(<LeadSection submitLead={submitLead} />, { wrapper: Providers });

    await reachContactStep();
    await fillAndSubmitContact();

    expect(await screen.findByRole("alert")).toHaveTextContent("Ваші дані збережено у формі");
    expect(screen.getByLabelText("Ім’я")).toHaveValue("Олена");
    expect(screen.getByLabelText("Телефон")).toHaveValue("099 123 45 67");
    expect(screen.getByLabelText(/Коментар/)).toHaveValue("Зателефонуйте після 18:00");
  });

  it("removes all PII from analytics helper parameters", () => {
    const lead: LeadPayload = {
      audience: "adult",
      goals: ["speaking"],
      studyMode: "online",
      name: "Олена",
      phone: "+380991234567",
      contactMethod: "telegram",
      comment: "Private comment",
      consent: true,
      locale: "uk",
      attribution: { source: "google" },
      pageUrl: "https://sova.example/uk",
      turnstileToken: "secret-client-token",
    };

    const analytics = toLeadAnalyticsParams(lead);
    expect(analytics).toEqual({
      locale: "uk",
      goalCount: 1,
      studyMode: "online",
      contactMethod: "telegram",
    });
    expect(JSON.stringify(analytics)).not.toContain("Олена");
    expect(JSON.stringify(analytics)).not.toContain("+380991234567");
    expect(JSON.stringify(analytics)).not.toContain("Private comment");
    expect(JSON.stringify(analytics)).not.toContain("secret-client-token");
  });
});
