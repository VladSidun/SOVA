import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const baseURL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3100";
const origin = process.env.QA_SITE_ORIGIN;
const indexable = process.env.QA_EXPECT_INDEXABLE === "true";
const staticBuild = process.argv.includes("--static");
if (indexable && !origin) throw new Error("Set QA_SITE_ORIGIN for indexable fixture checks");
async function content(route, extension = "html") {
  if (staticBuild) return readFile(`.next/server/app${route}.${extension}`, "utf8");
  const response = await fetch(`${baseURL}${route}${extension === "html" ? "?phone=qa-private-query" : ""}`);
  assert.equal(response.status, 200);
  return response.text();
}
for (const locale of ["uk", "en"]) {
  for (const suffix of ["", "/privacy"]) {
    const route = `/${locale}${suffix}`;
    const { document } = new JSDOM(await content(route)).window;
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name);
    assert.equal(document.documentElement.lang, locale);
    assert.match(document.title, /SOVA/);
    assert.ok(attr('meta[name="description"]', "content"));
    assert.match(attr('meta[name="robots"]', "content"), indexable ? /^index, follow$/ : /noindex/);
    assert.equal(attr('link[rel="canonical"]', "href"), origin ? `${origin}${route}` : undefined);
    assert.equal(attr('meta[property="og:url"]', "content"), origin ? `${origin}${route}` : undefined);
    if (origin) {
      for (const language of ["uk", "en", "x-default"]) {
        assert.equal(attr(`link[hreflang="${language}"]`, "href"), `${origin}/${language === "x-default" ? "uk" : language}${suffix}`);
      }
    } else assert.equal(document.querySelectorAll("link[hreflang]").length, 0);
    if (!suffix) {
      const json = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
      assert.deepEqual(json["@type"], ["EducationalOrganization", "LocalBusiness"]);
      assert.equal(json.telephone, "+380992671906");
      assert.equal(json.address.streetAddress, "площа Кирила і Мефодія, 26/11");
      assert.equal(json.url, origin);
      assert.equal(json["@id"], origin ? `${origin}/#organization` : undefined);
      for (const field of ["aggregateRating", "reviewCount", "awards", "accreditations", "geo"]) assert.equal(json[field], undefined);
    }
    assert.equal(document.querySelectorAll("h1").length, 1);
    console.log(`${route}: metadata, robots, canonical/hreflang, headings${suffix ? "" : ", JSON-LD"} passed`);
  }
}
const robots = await content("/robots.txt", "body");
const sitemap = await content("/sitemap.xml", "body");
if (indexable) {
  assert.match(robots, /Disallow: \/api\//);
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  const xml = new JSDOM(sitemap, { contentType: "text/xml" }).window.document;
  assert.deepEqual([...xml.querySelectorAll("loc")].map((node) => node.textContent).sort(), ["/uk", "/en", "/uk/privacy", "/en/privacy"].map((route) => `${origin}${route}`).sort());
  assert.equal(xml.querySelectorAll('link[hreflang="x-default"]').length, 4);
} else {
  assert.match(robots, /Disallow: \/\s/);
  assert.ok(!robots.includes("Sitemap:"));
  assert.ok(!sitemap.includes("<loc>"));
}
console.log(`Crawler routes passed; staticBuild=${staticBuild}; indexable=${indexable}; origin=${origin ?? "unset"}`);
