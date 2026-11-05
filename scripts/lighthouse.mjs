import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";

// Audit the running production build. Keep preview noindex intact: its SEO
// score deliberately includes the crawlability failure. No skipped audits.
const baseURL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3100";
const runs = Number(process.env.QA_LIGHTHOUSE_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 10) throw new Error("QA_LIGHTHOUSE_RUNS must be 1–10");
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
      const result = await lighthouse(`${baseURL}/${locale}`, {
        port, output: ["json", "html"], logLevel: "error",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      });
      if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError ?? "No Lighthouse result"));
      await writeFile(`${output}/${locale}-${run}.json`, result.report[0]);
      await writeFile(`${output}/${locale}-${run}.html`, result.report[1]);
      const { lhr } = result;
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
