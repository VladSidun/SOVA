import { expect, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { business } from "../src/config/business";
import uk from "../src/i18n/messages/uk.json" with { type: "json" };
import en from "../src/i18n/messages/en.json" with { type: "json" };

for (const locale of ["uk", "en"] as const) {
  const messages = locale === "uk" ? uk : en;
  const t = messages.LeadForm;
  const nav = messages.Navigation;

  test(`${locale} mobile menu traps keyboard focus, closes with Escape and follows anchors`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: nav.skipToContent })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    const trigger = page.getByRole("button", { name: nav.openMenu });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("navigation", { name: nav.mobileLabel });
    const links = menu.getByRole("link");
    await expect(links.first()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(links.last()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(links.first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await trigger.click();
    await menu.getByRole("link", { name: nav.pricing, exact: true }).click();
    await expect(menu).toHaveCount(0);
    await expect(page.locator("#pricing")).toBeInViewport();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test(`${locale} validation covers all steps and focuses the first invalid field`, async ({ page }) => {
    let requests = 0;
    await page.route("**/api/leads", async (route) => { requests += 1; await route.abort(); });
    await page.goto(`/${locale}`);
    await page.getByRole("button", { name: t.actions.next }).click();
    await expect(page.locator('#lead input[name="audience"]').first()).toBeFocused();
    await expect(page.locator("#audience-error")).toBeVisible();
    await page.getByRole("radio", { name: t.audience.options.adult, exact: true }).check();
    await page.getByRole("button", { name: t.actions.next }).click();
    await expect(page.getByRole("heading", { name: t.goals.title, exact: true })).toBeFocused();
    await page.getByRole("button", { name: t.actions.next }).click();
    await expect(page.locator("#goals-error")).toBeVisible();
    await expect(page.locator("#study-mode-error")).toBeVisible();
    await page.getByRole("checkbox", { name: "Speaking", exact: true }).check();
    await page.getByRole("radio", { name: t.studyMode.options.online, exact: true }).check();
    await page.getByRole("button", { name: t.actions.next }).click();
    await page.getByRole("button", { name: t.actions.submit, exact: true }).click();
    await expect(page.getByLabel(t.contact.name, { exact: true })).toBeFocused();
    for (const id of ["name-error", "phone-error", "contact-method-error", "consent-error"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await page.getByLabel(t.contact.name, { exact: true }).fill("Q");
    await page.getByRole("textbox", { name: t.contact.phone, exact: true }).fill("123");
    await page.getByRole("button", { name: t.actions.submit, exact: true }).click();
    await expect(page.locator("#name-error")).toBeVisible();
    await expect(page.locator("#phone-error")).toBeVisible();
    expect(requests).toBe(0);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations).toEqual([]);
  });

  test(`${locale} network loss preserves data, exposes contacts and permits a deliberate retry`, async ({ page }) => {
    let requests = 0;
    await page.route("**/api/leads", async (route) => {
      requests += 1;
      if (requests === 1) await route.abort("internetdisconnected");
      else await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto(`/${locale}?utm_source=qa&utm_medium=preview&utm_campaign=phase8&utm_content=flow&utm_term=english`);
    await page.getByRole("radio", { name: t.audience.options.adult, exact: true }).check();
    await page.getByRole("button", { name: t.actions.next }).click();
    await page.getByRole("checkbox", { name: "Speaking", exact: true }).check();
    await page.getByRole("radio", { name: t.studyMode.options.online, exact: true }).check();
    await page.getByRole("button", { name: t.actions.next }).click();
    await page.getByLabel(t.contact.name, { exact: true }).fill("QA Preview");
    await page.getByRole("textbox", { name: t.contact.phone, exact: true }).fill("099 123 45 67");
    await page.getByRole("radio", { name: t.contact.methods.call, exact: true }).check();
    await page.getByRole("checkbox", { name: t.contact.consent }).check();
    await page.getByRole("button", { name: t.actions.submit, exact: true }).click();
    const alert = page.locator("#lead").getByRole("alert");
    await expect(alert).toContainText(t.error);
    await expect(page.getByLabel(t.contact.name, { exact: true })).toHaveValue("QA Preview");
    await expect(alert.getByRole("link", { name: "WhatsApp", exact: true })).toHaveAttribute("href", "https://wa.me/380992671906");
    await expect(alert.getByRole("link", { name: "Viber", exact: true })).toHaveAttribute("href", "viber://chat?number=%2B380992671906");
    await expect(alert.getByRole("link", { name: "Telegram", exact: true })).toHaveCount(0);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await alert.getByRole("button", { name: t.fallback.copy }).click();
    await expect(alert.getByRole("button", { name: t.fallback.copied })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(business.phoneDisplay);
    expect(requests).toBe(1);
    const posted = page.waitForRequest((request) => request.url().endsWith("/api/leads") && request.method() === "POST");
    await page.getByRole("button", { name: t.actions.submit, exact: true }).click();
    const payload = (await posted).postDataJSON();
    expect(payload).toMatchObject({ locale, phone: "+380991234567", goals: ["speaking"], attribution: {
      source: "qa", medium: "preview", campaign: "phase8", content: "flow", term: "english",
    } });
    await expect(page.getByRole("heading", { name: t.success.title })).toBeFocused();
    expect(requests).toBe(2);
  });
}

test("unconfigured preview API fails safely through the actual route", async ({ request }) => {
  const response = await request.post("/api/leads", { data: {} });
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ ok: false, code: "SERVICE_UNAVAILABLE" });
  expect(response.headers()["cache-control"] ?? "").not.toContain("public");
});
