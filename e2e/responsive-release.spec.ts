import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { business } from "../src/config/business";
import uk from "../src/i18n/messages/uk.json" with { type: "json" };
import en from "../src/i18n/messages/en.json" with { type: "json" };

const widths = [360, 390, 430, 768, 1024, 1366, 1920];
const artifacts = "output/playwright/phase-8/responsive";

for (const locale of ["uk", "en"] as const) {
  const t = (locale === "uk" ? uk : en).LeadForm;
  for (const width of widths) {
    test(`${locale} ${width}px landing, pricing, goals and contact errors remain usable`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("requestfailed", (request) => errors.push(`failed ${request.url()}`));
      page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      await page.goto(`/${locale}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const headingLevels = await page.getByRole("main").getByRole("heading").evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
      for (let i = 1; i < headingLevels.length; i += 1) expect(headingLevels[i]).toBeLessThanOrEqual(headingLevels[i - 1] + 1);
      await mkdir(artifacts, { recursive: true });
      await page.screenshot({ path: `${artifacts}/${locale}-${width}-hero.png` });
      if ([360, 768, 1366].includes(width)) await page.screenshot({ path: `${artifacts}/${locale}-${width}-full.png`, fullPage: true });
      await expect(page.locator("#teachers, #reviews, #results, video")).toHaveCount(0);
      await expect(page.locator('a[href="#teachers"], a[href="#reviews"], a[href="#results"]')).toHaveCount(0);
      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/Lorem ipsum|\{\{|8 років|8 years of experience/i);
      const maps = page.locator("#contacts").getByRole("link");
      for (const link of await maps.all()) {
        await expect(link).toHaveAttribute("href", business.googleMaps);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noreferrer/);
      }
      await page.locator("#pricing").scrollIntoViewIfNeeded();
      const priceText = await page.locator("#pricing").innerText();
      for (const price of [1500, 350, 500]) expect(priceText).toContain(String(price));
      await page.locator("#lead").scrollIntoViewIfNeeded();
      const assertWidth = async () => {
        const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        expect(size.scroll).toBeLessThanOrEqual(size.client);
        const clipped = await page.locator("#lead label, #lead button, #pricing article").evaluateAll((elements) => elements.filter((element) => element.scrollWidth > element.clientWidth + 1).map((element) => element.tagName));
        expect(clipped).toEqual([]);
      };
      await assertWidth();
      await page.getByRole("radio", { name: t.audience.options.adult, exact: true }).check();
      await page.getByRole("button", { name: t.actions.next }).click();
      await assertWidth();
      await page.getByRole("heading", { name: t.goals.title, exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${artifacts}/${locale}-${width}-goals.png` });
      await page.getByRole("checkbox", { name: "Speaking", exact: true }).check();
      await page.getByRole("radio", { name: t.studyMode.options.online, exact: true }).check();
      await page.getByRole("button", { name: t.actions.next }).click();
      await page.getByRole("button", { name: t.actions.submit, exact: true }).click();
      await expect(page.locator("#name-error")).toBeVisible();
      await assertWidth();
      await page.getByRole("heading", { name: t.contact.title, exact: true }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${artifacts}/${locale}-${width}-contact.png` });
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(axe.violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}
