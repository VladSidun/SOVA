import { expect, test } from "@playwright/test";
import { business } from "../src/config/business";

test("Phase 3 location uses verified business facts and the configured map URL", async ({ page }) => {
  await page.goto("/uk");
  const location = page.locator("#contacts");

  await expect(location.getByText("м. Мукачево, площа Кирила і Мефодія, 26/11")).toBeVisible();
  await expect(location.getByText("Пн–Сб: 09:00–20:00")).toBeVisible();
  await expect(location.getByText(/Поруч є платна парковка/)).toBeVisible();
  await expect(location.getByRole("link", { name: /Прокласти маршрут/ })).toHaveAttribute(
    "href",
    business.googleMaps,
  );
  await expect(location.getByTitle("Карта розташування SOVA у Мукачеві")).toHaveAttribute(
    "loading",
    "lazy",
  );
});

test("native FAQ works by keyboard and states format-specific rescheduling terms", async ({ page }) => {
  await page.goto("/uk");
  const summary = page.getByText("Які правила перенесення занять?");
  const details = summary.locator("xpath=ancestor::details");

  await summary.focus();
  await page.keyboard.press("Enter");

  await expect(details).toHaveAttribute("open", "");
  await expect(details.getByText(/Умови залежать від формату навчання/)).toBeVisible();
});

test("Phase 3 exposes only ready navigation targets and keeps deferred modules absent", async ({ page }) => {
  await page.goto("/uk");

  await expect(page.getByRole("link", { name: "Про SOVA", exact: true }).first()).toHaveAttribute(
    "href",
    "#about",
  );
  await expect(page.locator("#about, #method, #contacts, #faq")).toHaveCount(4);
  await expect(page.locator("#teachers, #results, #reviews")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Відгуки", exact: true })).toHaveCount(0);
});

for (const width of [360, 768, 1366]) {
  test(`${width}px Phase 3 layout has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 900 });
    await page.goto("/uk");
    await page.locator("#faq").scrollIntoViewIfNeeded();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
    await expect(page.getByRole("heading", { name: "Коротко про важливе." })).toBeVisible();
  });
}
