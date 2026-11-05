import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { chromium } from "@playwright/test";

// Audit the running production build. Keep preview noindex intact: its SEO
// score deliberately includes the crawlability failure. No skipped audits.
const baseURL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3100";
const runs = Number(process.env.QA_LIGHTHOUSE_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 10) throw new Error("QA_LIGHTHOUSE_RUNS must be 1–10");
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run through npm run qa:lighthouse");
const output = "output/playwright/phase-8/lighthouse";
await mkdir(output, { recursive: true });
const server = createServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
const results = [];
try {
  for (const locale of ["uk", "en"]) {
    for (let run = 1; run <= runs; run += 1) {
      // Keep the external audit tool outside the application dependency graph.
      // 13.6 fixes the text-LCP-at-FCP simulation defect in 13.5 (see report).
      const prefix = `${output}/${locale}-${run}`;
      const command = spawn(process.execPath, [npmCli, "exec", "--yes", "--package=lighthouse@13.6.0", "--", "lighthouse", `${baseURL}/${locale}`,
        `--port=${port}`, "--output=json", "--output=html", `--output-path=${prefix}`,
        "--only-categories=performance,accessibility,best-practices,seo", "--no-enable-error-reporting", "--quiet"], {
        stdio: "inherit", windowsHide: true,
      });
      // Keep Playwright's browser connection responsive while the CLI audits.
      const status = await new Promise((resolve, reject) => {
        command.once("error", reject);
        command.once("exit", resolve);
      });
      if (status !== 0) throw new Error(`Lighthouse CLI failed: ${status}`);
      const json = await readFile(`${prefix}.report.json`, "utf8");
      const lhr = JSON.parse(json);
      if (lhr.lighthouseVersion !== "13.6.0") throw new Error("Unexpected Lighthouse version");
      if (lhr.runtimeError) throw new Error(JSON.stringify(lhr.runtimeError));
      await writeFile(`${prefix}.json`, json);
      await writeFile(`${prefix}.html`, await readFile(`${prefix}.report.html`));
      const entry = {
        locale, run, fetchedAt: lhr.fetchTime, lighthouseVersion: lhr.lighthouseVersion,
        browser: lhr.environment.hostUserAgent, settings: lhr.configSettings,
        scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, value.score === null ? null : Math.round(value.score * 100)])),
        lcpMs: lhr.audits["largest-contentful-paint"].numericValue,
        cls: lhr.audits["cumulative-layout-shift"].numericValue,
        tbtMs: lhr.audits["total-blocking-time"].numericValue,
        warnings: lhr.runWarnings,
        failedAudits: Object.entries(lhr.audits).filter(([, audit]) => audit.score !== null && audit.score < 1).map(([id, audit]) => ({ id, title: audit.title, score: audit.score, displayValue: audit.displayValue })),
      };
      results.push(entry);
      console.log(JSON.stringify({ locale, run, scores: entry.scores, lcpMs: entry.lcpMs, cls: entry.cls, tbtMs: entry.tbtMs }));
    }
  }
} finally {
  await browser.close();
  await writeFile(`${output}/summary.json`, JSON.stringify({ baseURL, inp: null, inpNote: "Navigation audits do not measure interaction INP. TBT is not INP.", results }, null, 2));
}
