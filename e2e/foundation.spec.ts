import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test("root redirects to Ukrainian", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/uk$/);
});

for (const { locale, status } of [
  { locale: "uk", status: "Сайт готується до запуску." },
  { locale: "en", status: "The website is being prepared for launch." },
]) {
  test(`${locale} shell route loads without marketing sections`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { level: 1, name: "SOVA", exact: true })).toBeVisible();
    await expect(page.getByText(status, { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: locale === "uk" ? "Основна навігація" : "Primary navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: locale === "uk" ? "Контакти" : "Contacts", exact: true }).first()).toHaveAttribute("href", "#contacts");
    await expect(page.locator("#contacts")).toBeAttached();
    await expect(page.getByText(/8 років|8 years/)).toHaveCount(0);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
    // Confirms that the responsive Tailwind container utility is compiled and loaded.
    await expect(page.getByRole("main").locator("section > div")).toHaveCSS("padding-left", "32px");
    expect(pageErrors).toEqual([]);
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
