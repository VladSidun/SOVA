# Phase 6 — domain and analytics setup

## Current status

Phase 6 adds code and testable provider adapters. Search Console, Google Business
Profile, GA4, Meta Pixel and TikTok Pixel have **not** been configured or verified
in authenticated accounts. There is no live analytics SDK or consent manager.
No analytics scripts, network requests, cookies or event queues are created by
this implementation. Missing credentials do not block preview.

## Domain / indexing checklist

- [ ] Obtain the real domain, configure hosting DNS and HTTPS, and choose one
  preferred origin. Redirect other hosts to it.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to that HTTPS origin only (no path, query,
  credentials or fragment). Rebuild: public values are captured at build time.
  Local/reserved origins are ignored; blank means no canonical/hreflang/OG URL.
- [ ] Keep `SOVA_INDEXABLE=false` in preview. Vercel previews are additionally
  protected even if the flag was mistakenly enabled.
- [ ] Complete the SPEC launch gates, then set `SOVA_INDEXABLE=true` only on
  production and rebuild. Without a valid origin the flag cannot enable indexing.
- [ ] Inspect source for `/uk`, `/en`, `/uk/privacy`, `/en/privacy`: each has its
  own canonical, reciprocal `uk` / `en` hreflang and `x-default` pointing to
  the Ukrainian equivalent. `/privacy` redirects to `/uk/privacy`.
- [ ] Inspect `/robots.txt` and `/sitemap.xml`: the live sitemap contains four
  real routes, no goal/query/anchor URLs. `/api/` is excluded from crawling.
  Preview sitemap is empty; preview robots disallows crawling.
- [ ] Validate JSON-LD with Google's Rich Results Test / Schema Markup Validator.
  Verified NAP, Monday–Saturday hours, social accounts and Maps URL come from
  `business.ts`. Service geography comes from SPEC 26. No rating, award,
  accreditation, invented coordinates, postcode or Sunday schedule is emitted.
- [ ] With authenticated owner access, verify a Search Console domain property
  through DNS, submit the production sitemap, inspect UA/EN URLs.
- [ ] With authenticated owner access, recover/verify Google Business Profile;
  reconcile name/address/phone, hours, website and genuine school photos.
  Do not create a duplicate profile or claim these steps happened before they do.

## Provider connection checklist

Adapters in `src/lib/analytics.ts` call an already initialized, audited runtime:

| Provider | Public ID | Public flag | Dispatch |
| --- | --- | --- | --- |
| GA4 | `NEXT_PUBLIC_GA_ID` (`G-…`) | `NEXT_PUBLIC_ENABLE_GA=true` | `gtag('event', event, {...safeParams, send_to: id})` |
| Meta | `NEXT_PUBLIC_META_PIXEL_ID` (digits) | `NEXT_PUBLIC_ENABLE_META_PIXEL=true` | `fbq('trackSingleCustom', id, event, safeParams)` |
| TikTok | `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | `NEXT_PUBLIC_ENABLE_TIKTOK_PIXEL=true` | `ttq.instance(id).track(event, safeParams)` |

The config feature flags are also supported. IDs and flags alone do not load
SDKs or grant consent. Do not paste a default tracking snippet into the layout.
Actual SDK installation is a later, separately reviewed external setup:

- [ ] Obtain authorized GA/Meta/TikTok account access and create the required
  property/pixel. Record real IDs only in local/deployment env, then rebuild.
- [ ] Implement a separate consent choice and an audited SDK bootstrap. Call
  `setAnalyticsConsent(true)` only after the visitor grants tracking consent;
  call `setAnalyticsConsent(false)` immediately on withdrawal. The lead checkbox
  grants contact consent only. Pre-consent events are discarded, never replayed.
- [ ] For GA, disable automatic pageviews (`send_page_view:false`), enhanced
  measurement/form events, user-provided data and Google Signals. Use only
  explicitly sanitized page locations/referrers if a future pageview is added.
- [ ] For Meta/TikTok, disable automatic/advanced matching, automatic events,
  URL query capture and DOM/form collection. Never call `identify`, never hash
  or forward contact data. Verify SDK behavior, not just helper arguments.
- [ ] Audit outgoing SDK requests on a dedicated test page with synthetic
  name/phone/comment and query-string canaries. If an SDK cannot satisfy the
  privacy restriction, leave its flag off and use a separately scoped alternative.
- [ ] Confirm events in the provider's authenticated debug/test tools, consent
  denial and withdrawal, missing ID/flag, blocked SDK and provider failure.
- [ ] Update the bilingual privacy policy for the actual processors, retention,
  cookies and consent implementation before enabling live tracking.

SDKs are deliberately not automatically loaded in Phase 6 because provider
defaults can collect page URLs or form details outside the sanitizer. The
adapters are verified with mocked provider APIs; live delivery is unverified.

## Event contract and manual verification

`track(event, params)` validates event names and rejects the entire event if any
unknown key or unsafe value appears. It never logs rejected input. Allowed
parameters: `locale`, `step`, `goalCount`, `goal`, `studyMode`, `contactMethod`,
`source`, `cta`, `videoId`; all string values are closed categories.
No arbitrary text, nested properties, name, phone, comment, age, token, URL,
referrer or UTM can cross this boundary.

| Events | Trigger |
| --- | --- |
| `cta_click` | Header, hero, direction/goal links and pricing CTA |
| `goal_select` | Direction/goal selection or checked form goal |
| `trial_form_open` | Lead section becomes visible, once per locale mount |
| `trial_form_start` | First changed form control, once per form mount |
| `trial_form_step_complete` | Valid steps 1/2 and validated contact step 3 |
| `trial_form_submit`, `trial_form_success`, `trial_form_error` | Valid submission attempt, API result or Turnstile failure; no raw error message |
| `phone_click`, `telegram_click`, `viber_click`, `whatsapp_click` | Confirmed rendered phone/fallback links |
| `instagram_click`, `facebook_click`, `map_click` | Social links and location/footer route/map links |
| `price_view` | Pricing becomes visible, once per locale mount |
| `video_play` | A real video with `data-analytics-video="hero|school|review"` plays |

No real video exists yet, so placeholders never emit `video_play`. Future real
media must add the attribute. Future clickable elements use explicit
`data-analytics-event`, `data-analytics-source`, `data-analytics-cta`; DOM text
and links are never read to build analytics parameters.

For manual preview: inspect both locales, follow the footer and form privacy
links, switch language while on privacy, then use Header CTA to return to the
home form. In DevTools Network, verify there are no GA/Meta/TikTok requests.
Use mocked APIs in tests to inspect payloads before connecting live providers.

Official implementation references:
[Next metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images),
[Next JSON-LD](https://nextjs.org/docs/app/guides/json-ld),
[GA manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views),
[TikTok custom events](https://ads.tiktok.com/resources/help/article/custom-events?lang=en),
[TikTok advanced matching](https://ads.tiktok.com/help/article/how-to-set-up-automatic-advanced-matching?lang=en).
