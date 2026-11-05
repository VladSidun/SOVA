import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const folder = "output/playwright/phase-8/lighthouse";
const summary = JSON.parse(await readFile(`${folder}/summary.json`, "utf8"));
assert.equal(summary.results.length, 6, "Evidence requires three final runs per locale");
const results = [];
for (const run of summary.results) {
  const rawReport = `${folder}/${run.locale}-${run.run}.json`;
  const raw = await readFile(rawReport);
  const lhr = JSON.parse(raw);
  assert.equal(lhr.lighthouseVersion, "13.6.0");
  assert.equal(lhr.runtimeError, undefined);
  results.push({
    locale: run.locale, run: run.run, fetchedAt: lhr.fetchTime,
    scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, value.score === null ? null : Math.round(value.score * 100)])),
    lcpMs: lhr.audits["largest-contentful-paint"].numericValue,
    observedLcpMs: lhr.audits.metrics.details.items[0].observedLargestContentfulPaint,
    cls: lhr.audits["cumulative-layout-shift"].numericValue,
    tbtMs: lhr.audits["total-blocking-time"].numericValue,
    warnings: lhr.runWarnings, rawReport,
    sha256: createHash("sha256").update(raw).digest("hex"),
    failingSeoAudits: lhr.categories.seo.auditRefs.filter((ref) => lhr.audits[ref.id].score !== null && lhr.audits[ref.id].score < 1).map((ref) => ref.id),
  });
}
const comparison = [];
for (const locale of ["uk", "en"]) for (let run = 1; run <= 3; run += 1) {
  const rawReport = `${folder}/simulation-13.5/${locale}-${run}.json`;
  const raw = await readFile(rawReport).catch((error) => {
    if (error.code === "ENOENT") return undefined;
    throw error;
  });
  if (!raw) continue;
  const lhr = JSON.parse(raw);
  const metrics = lhr.audits.metrics.details.items[0];
  comparison.push({ locale, run, lighthouseVersion: lhr.lighthouseVersion,
    performance: Math.round(lhr.categories.performance.score * 100),
    lcpMs: lhr.audits["largest-contentful-paint"].numericValue,
    observedLcpMs: metrics.observedLargestContentfulPaint,
    observedFcpMs: metrics.observedFirstContentfulPaint,
    rawReport, sha256: createHash("sha256").update(raw).digest("hex"),
  });
}
const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const applicationCommit = git(["log", "-1", "--format=%H", "--", "src", "public"]);
const evidence = {
  applicationCommit,
  verificationToolsCommit: git(["log", "-1", "--format=%H", "--", "scripts/lighthouse.mjs"]),
  sourceTree: git(["rev-parse", `${applicationCommit}:src`]),
  build: "next build / next start on loopback; no credentials or site URL",
  baseURL: summary.baseURL, lighthouseVersion: summary.results[0].lighthouseVersion,
  browser: summary.results[0].browser, settings: summary.results[0].settings,
  inp: null, inpNote: summary.inpNote, results,
  simulationComparison13_5: comparison,
  simulationFixSource: "https://github.com/GoogleChrome/lighthouse/releases/tag/v13.6.0",
};
await mkdir("docs/qa", { recursive: true });
await writeFile("docs/qa/phase-8-lighthouse.json", `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ locale, run, scores, lcpMs, cls, tbtMs }) => ({ locale, run, scores, lcpMs, cls, tbtMs })), null, 2));
