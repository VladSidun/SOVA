import { defineConfig, devices } from "@playwright/test";

// Playwright forces color in its workers and web server. Avoid conflicting
// NO_COLOR inherited from the local runner; this does not alter the host shell.
delete process.env.NO_COLOR;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/uk",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
