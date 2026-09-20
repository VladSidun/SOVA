import { features } from "./features";

export const sectionIds = {
  directions: "directions",
  formats: "formats",
  about: "about",
  pricing: "pricing",
  reviews: "reviews",
  contacts: "contacts",
  lead: "lead",
} as const;

export type SectionId = (typeof sectionIds)[keyof typeof sectionIds];

export type NavigationItem = {
  id: SectionId;
  href: `#${SectionId}`;
  labelKey: "directions" | "formats" | "about" | "pricing" | "reviews" | "contacts";
};

type FeatureFlags = typeof features;

const navigationItems: ReadonlyArray<NavigationItem & { feature?: keyof FeatureFlags }> = [
  { id: sectionIds.directions, href: "#directions", labelKey: "directions" },
  { id: sectionIds.formats, href: "#formats", labelKey: "formats" },
  { id: sectionIds.about, href: "#about", labelKey: "about" },
  { id: sectionIds.pricing, href: "#pricing", labelKey: "pricing" },
  { id: sectionIds.reviews, href: "#reviews", labelKey: "reviews", feature: "showReviews" },
  { id: sectionIds.contacts, href: "#contacts", labelKey: "contacts" },
];

// Phase 1 renders only the contact anchor in the Footer. Later phases extend
// this list as their real sections are added, so the shell never emits dead links.
export const renderedSectionIds: ReadonlyArray<SectionId> = [sectionIds.contacts];

export function getNavigationItems({
  flags = features,
  renderedSections = renderedSectionIds,
}: {
  flags?: FeatureFlags;
  renderedSections?: ReadonlyArray<SectionId>;
} = {}): NavigationItem[] {
  const rendered = new Set<SectionId>(renderedSections);

  return navigationItems
    .filter((item) => rendered.has(item.id))
    .filter((item) => item.feature === undefined || flags[item.feature])
    .map((item) => ({ id: item.id, href: item.href, labelKey: item.labelKey }));
}
