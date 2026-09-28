import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import type { LeadPayload } from "../src/types/lead";

for (const viewport of [
  { name: "mobile", width: 360, height: 800 },
  { name: "desktop", width: 1366, height: 900 },
]) {
  test(`${viewport.name} completes the three-step lead experience once`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    let receivedPayload: LeadPayload | undefined;
    let releaseRequest: (() => void) | undefined;
    const requestGate = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });
    await page.route("**/api/leads", async (route) => {
      receivedPayload = route.request().postDataJSON() as LeadPayload;
      await requestGate;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/uk?utm_source=google&utm_medium=cpc&utm_campaign=phase4");
    await page.getByRole("button", { name: "Обрати ціль: НМТ / ЄВІ" }).click();
    await expect(page.locator("#lead")).toBeInViewport();

    await page.getByRole("radio", { name: "Дорослий" }).check();
    await page.getByRole("button", { name: "Далі" }).click();
    await expect(page.getByRole("checkbox", { name: "НМТ" })).toBeChecked();
    await page.getByRole("radio", { name: "Онлайн" }).check();
    await page.getByRole("button", { name: "Далі" }).click();

    const submit = page.getByRole("button", { name: "Заберіть безкоштовний пробний урок" });
    await expect(submit).toBeEnabled();
    const accessibility = await new AxeBuilder({ page })
      .include("#lead")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.getByLabel("Ім’я").fill("Олена");
    await page.getByRole("textbox", { name: "Телефон", exact: true }).fill("099 123 45 67");
    await page.getByRole("radio", { name: "Telegram" }).check();
    await page.getByLabel(/Коментар/).fill("Напишіть після 18:00");
    await page.getByRole("checkbox", { name: /SOVA використає мої контактні дані/ }).check();
    await submit.click();

    await expect(page.getByRole("button", { name: "Надсилаємо…" })).toBeDisabled();
    releaseRequest?.();
    await expect(page.getByRole("heading", { name: "Дякуємо — заявку прийнято." })).toBeVisible();
    await expect(submit).toHaveCount(0);

    expect(receivedPayload).toMatchObject({
      audience: "adult",
      goals: ["nmt"],
      studyMode: "online",
      name: "Олена",
      phone: "+380991234567",
      contactMethod: "telegram",
      comment: "Напишіть після 18:00",
      consent: true,
      locale: "uk",
      attribution: {
        source: "google",
        medium: "cpc",
        campaign: "phase4",
      },
      turnstileToken: "",
    });
    expect(receivedPayload?.attribution.landingUrl).toContain("utm_source=google");
  });
}

test("validation errors are inline, associated and do not erase input", async ({ page }) => {
  await page.goto("/uk");
  await page.locator("#lead").scrollIntoViewIfNeeded();

  await page.getByRole("button", { name: "Далі" }).click();
  const audienceError = page.getByText("Оберіть, хто буде навчатися.");
  await expect(audienceError).toBeVisible();
  await expect(page.getByRole("group", { name: "Хто буде навчатися?" })).toHaveAttribute(
    "aria-describedby",
    "audience-error",
  );

  await page.getByRole("radio", { name: "Школяр" }).check();
  await page.getByLabel(/Вік або клас/).fill("8 клас");
  await page.getByRole("button", { name: "Далі" }).click();
  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page.getByRole("radio", { name: "Школяр" })).toBeChecked();
  await expect(page.getByLabel(/Вік або клас/)).toHaveValue("8 клас");
});
