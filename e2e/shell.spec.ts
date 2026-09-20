import { expect, test } from "@playwright/test";

test("desktop anchor navigation and locale switching work", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/uk");

  const primaryNavigation = page.getByRole("navigation", { name: "Основна навігація" });
  await expect(primaryNavigation).toBeVisible();
  await expect(primaryNavigation.getByRole("link", { name: "Відгуки" })).toHaveCount(0);

  await primaryNavigation.getByRole("link", { name: "Контакти" }).click();
  await expect(page).toHaveURL(/\/uk#contacts$/);
  await expect(page.locator("#contacts")).toBeInViewport();

  await page.getByRole("link", { name: "Перейти на англійську" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "English built around your goal — from entrance exams to working abroad.",
  );
});

for (const width of [360, 768]) {
  test(String(width) + "px shell has no horizontal overflow and mobile menu works", async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/uk");

    const trigger = page.getByRole("button", { name: "Відкрити меню" });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const mobileNavigation = page.getByRole("navigation", { name: "Мобільна навігація" });
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: "Відгуки" })).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(mobileNavigation).toHaveCount(0);
    await expect(trigger).toBeFocused();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });
}
