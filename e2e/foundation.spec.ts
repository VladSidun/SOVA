import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test("root redirects to Ukrainian", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/uk$/);
});

for (const { locale, heroTitle } of [
  { locale: "uk", heroTitle: "Англійська під вашу ціль — від НМТ до роботи за кордоном." },
  {
    locale: "en",
    heroTitle: "English built around your goal — from entrance exams to working abroad.",
  },
]) {
  test(`${locale} conversion route loads cleanly and accessibly`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const failedFirstPartyResponses: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (url.origin === "http://127.0.0.1:3100" && response.status() >= 400) {
        failedFirstPartyResponses.push(`${response.status()} ${url.pathname}`);
      }
    });
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { level: 1, name: heroTitle, exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: locale === "uk" ? "Основна навігація" : "Primary navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: locale === "uk" ? "Контакти" : "Contacts", exact: true }).first()).toHaveAttribute("href", "#contacts");
    await expect(page.locator("#contacts")).toBeAttached();
    await expect(page.getByText(/8 років|8 years of experience/)).toHaveCount(0);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
    await expect(page.locator("link[rel='icon']")).toHaveAttribute("href", "/brand/logo.svg");
    // Confirms that the responsive Tailwind container utility is compiled and loaded.
    await expect(page.getByRole("main").locator("section > div").first()).toHaveCSS(
      "padding-left",
      "32px",
    );
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(failedFirstPartyResponses).toEqual([]);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
}

test("unsupported locale is not silently rendered", async ({ page }) => {
  const response = await page.goto("/de");
  expect(response?.status()).toBe(404);
});
