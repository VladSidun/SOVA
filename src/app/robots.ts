import { buildRobots, getSeoSettings } from "@/lib/seo";

export default function robots() {
  const { origin, indexable } = getSeoSettings();
  return buildRobots(origin, indexable);
}
