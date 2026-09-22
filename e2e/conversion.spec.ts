import { expect, test } from "@playwright/test";

test("direction selection persists the exact LeadGoal for the future form", async ({ page }) => {
  await page.goto("/uk");

  await page.getByRole("button", { name: "Обрати ціль: НМТ / ЄВІ" }).click();

  await expect(page).toHaveURL(/\/uk\?goal=nmt#lead$/);
  await expect(page.locator("#lead")).toBeInViewport();
  await expect(page.getByRole("button", { name: "Зберегти ціль: НМТ" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("Обрана ціль")).toBeVisible();
});

test("verified prices render and unavailable sections stay absent", async ({ page }) => {
  await page.goto("/uk");
  await page.locator("#pricing").scrollIntoViewIfNeeded();

  await expect(page.getByText("1500 грн / місяць", { exact: false })).toBeVisible();
  await expect(page.getByText("350 грн / заняття", { exact: false })).toBeVisible();
  await expect(page.getByText("500 грн / заняття", { exact: false })).toBeVisible();
  await expect(page.locator("#about, #reviews, #teachers, #results")).toHaveCount(0);
  await expect(page.getByText(/Lorem ipsum/i)).toHaveCount(0);
});

for (const width of [360, 390, 768, 1366, 1920]) {
  test(`${width}px conversion layout has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    await page.goto("/uk");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("hero-media-placeholder")).toBeVisible();
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Групове" })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  });
}
