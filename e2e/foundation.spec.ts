import { expect, test } from "@playwright/test";

test("root redirects to Ukrainian", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/uk$/);
});

for (const { locale, status } of [
  { locale: "uk", status: "Сайт готується до запуску." },
  { locale: "en", status: "The website is being prepared for launch." },
]) {
  test(`${locale} foundation route loads without marketing sections`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { level: 1, name: "SOVA", exact: true })).toBeVisible();
    await expect(page.getByText(status, { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation")).toHaveCount(0);
    await expect(page.getByText(/8 років|8 years/)).toHaveCount(0);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
    // Confirms that Tailwind's .p-6 utility is compiled and loaded.
    await expect(page.getByRole("main")).toHaveCSS("padding-top", "24px");
    expect(pageErrors).toEqual([]);
  });
}

test("unsupported locale is not silently rendered", async ({ page }) => {
  const response = await page.goto("/de");
  expect(response?.status()).toBe(404);
});
