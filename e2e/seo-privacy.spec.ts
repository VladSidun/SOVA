import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

for (const locale of ["uk", "en"]) {
  test(`${locale} preview emits safe metadata and verified JSON-LD without a domain`, async ({ page }) => {
    const vendorRequests: string[] = [];
    page.on("request", (request) => {
      if (/google-analytics|googletagmanager|connect.facebook|analytics.tiktok/.test(request.url())) vendorRequests.push(request.url());
    });
    const response = await page.goto(`/${locale}?phone=private-query`);
    const html = await response!.text();
    expect(html).not.toMatch(/<link[^>]*rel="canonical"/);
    expect(html).not.toMatch(/<meta[^>]*property="og:url"/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /SOVA/);
    await expect(page).toHaveTitle(/SOVA.*(?:Мукачеві|Mukachevo)/);
    const json = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    expect(json.telephone).toBe("+380992671906");
    expect(json.address.addressLocality).toBe("Мукачево");
    expect(json).not.toHaveProperty("url");
    expect(json).not.toHaveProperty("aggregateRating");
    await page.locator("#pricing").scrollIntoViewIfNeeded();
    await page.locator("#lead").scrollIntoViewIfNeeded();
    expect(vendorRequests).toEqual([]);
  });

  test(`${locale} privacy, locale switch and home anchors remain accessible`, async ({ page }) => {
    await page.goto(`/${locale}/privacy`);
    await expect(page).toHaveTitle(locale === "uk" ? "Політика конфіденційності | SOVA" : "Privacy policy | SOVA");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(locale === "uk" ? "Політика конфіденційності" : "Privacy policy");
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(axe.violations).toEqual([]);
    for (const width of [360, 768, 1366]) {
      await page.setViewportSize({ width, height: 800 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    const nav = page.getByRole("navigation", { name: locale === "uk" ? "Основна навігація" : "Primary navigation" });
    await nav.getByRole("link", { name: locale === "uk" ? "Контакти" : "Contacts", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}#contacts$`));
    await page.goto(`/${locale}/privacy`);
    await page.getByRole("link", { name: locale === "uk" ? "Перейти на англійську" : "Switch to Ukrainian" }).first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale === "uk" ? "en" : "uk"}/privacy$`));
  });
}

test("privacy alias redirects; preview sitemap and robots have no invented host", async ({ request }) => {
  const response = await request.get("/privacy");
  expect(new URL(response.url()).pathname).toBe("/uk/privacy");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  expect(await robots.text()).not.toContain("Sitemap:");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain("<loc>");
});
