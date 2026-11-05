import { expect, test, type Page } from "@playwright/test";

async function contactStep(page: Page) {
  await page.goto("/en");
  await page.getByRole("radio", { name: "Adult", exact: true }).check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("checkbox", { name: "Speaking", exact: true }).check();
  await page.getByRole("radio", { name: "Online", exact: true }).check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("QA Preview");
  await page.getByRole("textbox", { name: "Phone", exact: true }).fill("099 123 45 67");
  await page.getByRole("radio", { name: "Phone call", exact: true }).check();
  await page.getByRole("checkbox", { name: /I agree that SOVA/ }).check();
}

test("Enter on a revisited first step advances without sending stored contact details", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/leads", async (route) => {
    requests += 1;
    await route.fulfill({ status: 201, json: { ok: true } });
  });
  await contactStep(page);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByLabel(/Age or school year/).press("Enter");
  await expect(page.getByRole("heading", { name: "What is your goal?" })).toBeVisible();
  expect(requests).toBe(0);
});

test("successful submission transfers focus to its confirmation", async ({ page }) => {
  await page.route("**/api/leads", (route) => route.fulfill({ status: 201, json: { ok: true } }));
  await contactStep(page);
  await page.getByRole("button", { name: "Claim your free trial lesson", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Thank you — we have your enquiry." })).toBeFocused();
});

test("a pending submission keeps Back disabled until its result is known", async ({ page }) => {
  let release = () => {};
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/leads", async (route) => {
    await pending;
    await route.fulfill({ status: 201, json: { ok: true } });
  });
  await contactStep(page);
  await page.getByRole("button", { name: "Claim your free trial lesson", exact: true }).click();
  try {
    await expect(page.getByRole("button", { name: "Sending…", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Back", exact: true })).toBeDisabled();
  } finally {
    release();
  }
  await expect(page.getByRole("heading", { name: "Thank you — we have your enquiry." })).toBeVisible();
});

test("an unexpected successful HTTP document cannot falsely confirm lead delivery", async ({ page }) => {
  await page.route("**/api/leads", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Gateway</h1>" }));
  await contactStep(page);
  await page.getByRole("button", { name: "Claim your free trial lesson", exact: true }).click();
  await expect(page.locator("#lead").getByRole("alert")).toContainText("We could not send your enquiry automatically.");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("QA Preview");
});
