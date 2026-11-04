import { buildSitemap, getSeoSettings } from "@/lib/seo";

export default function sitemap() {
  const { origin, indexable } = getSeoSettings();
  return buildSitemap(origin, indexable);
}
