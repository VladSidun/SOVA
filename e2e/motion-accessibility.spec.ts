import { expect, test } from "@playwright/test";

test("goal selection supports Space and moves keyboard focus to the lead area", async ({ page }) => {
  await page.goto("/uk");
  const goal = page.getByRole("button", { name: "Обрати ціль: НМТ / ЄВІ", exact: true });
  await goal.focus();
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/goal=nmt#lead$/);
  await expect(page.locator("#lead")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("radio", { name: "Дитина", exact: true })).toBeFocused();
});

test("resizing an open mobile menu to desktop releases the page scroll lock", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/uk");
  await page.getByRole("button", { name: "Відкрити меню" }).click();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.setViewportSize({ width: 1366, height: 800 });
  await expect(page.getByRole("navigation", { name: "Мобільна навігація" })).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.getByRole("navigation", { name: "Основна навігація" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Основна навігація" }).getByRole("link").first()).toBeFocused();
});

test("editorial reveals and staggered items settle fully visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/uk");
  const method = page.locator("#method");
  await method.scrollIntoViewIfNeeded();
  for (const item of await method.locator('[data-motion-reveal="staggerContainer"] > div').all()) {
    await expect(item).toHaveCSS("opacity", "1");
  }
  await expect(method.getByText("Pearson", { exact: true })).toBeVisible();
});

test("reduced motion is instant, responds live and leaves CTA interaction available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  const heroCta = page.locator('[data-analytics-source="hero"][data-analytics-cta="trial"]');
  await expect(heroCta).toHaveCSS("opacity", "1");
  await heroCta.click();
  await expect(page).toHaveURL(/#lead$/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("#method").scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reveals = page.locator('[data-motion-reveal]');
  for (const reveal of await reveals.all()) {
    await expect(reveal).toHaveCSS("opacity", "1");
    await expect(reveal).toHaveCSS("transform", "none");
  }
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});
