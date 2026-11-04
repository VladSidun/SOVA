/* eslint-disable @eslint-react/dom-no-dangerously-set-innerhtml -- JSON-LD uses fixed config and a tested serializer escaping every less-than sign. */
import { getSeoSettings } from "@/lib/seo";
import { buildOrganizationJsonLd, serializeJsonLd } from "@/lib/structured-data";

export function OrganizationJsonLd() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildOrganizationJsonLd(getSeoSettings().origin)) }}
      type="application/ld+json"
    />
  );
}
