# SOVA website

Bilingual Next.js marketing website for Центр вивчення іноземних мов SOVA.
Phase 0–5 are merged into develop. Phase 6 adds local SEO, privacy and analytics
adapters. This remains a development preview until the production launch gates
are completed. See PROGRESS_CODEX.md for current delivery and verification.

## Source of truth

Current user instructions → [SPEC](./SOVA_WEBSITE_SPEC_v2.md) →
[Guide](./SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md) → code.
Read [AGENTS.md](./AGENTS.md) and [progress](./PROGRESS_CODEX.md) before changes.
Work only on the authorized phase; leave PR merging to the user.

## Setup

Node 24.x, npm and the committed package-lock.json are required.
Run from the checkout containing package.json; worktrees have independent local
env, dependencies and builds.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000/uk or http://localhost:3000/en. If needed, copy
.env.example to .env.local only when the local file does not already exist.
Never commit credentials or private administration links.

## Implemented behavior

- UA/EN landing, responsive shell, goal selection, confirmed formats/prices,
  trial process, method, location, FAQ; unavailable content stays hidden.
- Three-step accessible lead form, consent, first-touch session attribution,
  phone normalization and Turnstile; secure POST /api/leads delivers to a private
  Telegram destination and returns controlled errors with direct-contact fallback.
- Locale metadata, canonical/hreflang, verified organization JSON-LD,
  sitemap/robots, /uk/privacy and /en/privacy (/privacy redirects to Ukrainian).
- Restricted analytics event helper and GA/Meta/TikTok runtime adapters. The
  site does not automatically load vendor SDKs or collect analytics credentials.

## Environment

- Blank NEXT_PUBLIC_SITE_URL emits no canonical, hreflang or OG URL. Set only
  the real HTTPS origin before launch; localhost and reserved hosts are ignored.
- SOVA_INDEXABLE defaults off. Production indexing requires both the valid
  origin and SOVA_INDEXABLE=true; Vercel previews stay protected. Rebuild after
  env changes. Preview robots disallows crawling and preview sitemap is empty.
- TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID and TURNSTILE_SECRET_KEY stay server-only;
  the public Turnstile site key is separate. Real delivery needs a verified
  hostname and an authorized test of the destination.
- Public messenger overrides must be verified. Telegram contact remains hidden
  without its public URL; never expose the private admin destination.
- Analytics requires public flags, IDs, separate visitor tracking consent and
  an audited initialized SDK. Missing any gate produces no tracking. Contact
  consent never grants analytics consent. Provider adapters alone do not prove
  a configured or working external account.

Use [domain and analytics checklist](./docs/SEO_ANALYTICS_SETUP.md) for later
Search Console, Google Business Profile and provider setup. Privacy processors,
retention and tracking choices require school confirmation before public launch.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run e2e
git diff --check
```

Typecheck generates route types. Tests cover prior UI/API contracts plus SEO,
verified structured data and analytics PII restrictions. E2E uses the production
build on isolated port 3100, mocked lead API, Chromium and Axe. Keep external
credentials absent in the isolated test checkout; real send is a separate check.
Fonts use next/font and require network access on a clean build. Dependency
audit results are recorded in progress; do not equate passing tests with a clean
security audit.

## Code map

| Path | Responsibility |
| --- | --- |
| src/app/[locale] | Landing, locale layout and privacy |
| src/app/api/leads | Secure lead submission |
| src/app/{sitemap,robots}.ts | Domain-aware crawler routes |
| src/components/{layout,sections,lead} | UI and lead lifecycle |
| src/components/analytics | Explicit interaction observers and JSON-LD renderer |
| src/config | Verified business, pricing, flags and bilingual SEO copy |
| src/content, src/i18n | Typed content and dictionaries |
| src/lib/{seo,structured-data,analytics}.ts | URL rules, verified schema and PII boundary |
| src/lib/{lead-api,telegram,turnstile}.ts | Server delivery and verification |
| tests, e2e | Unit/component/API and browser regression checks |

Motion/final polish, media, deployment, DB/Sova Hub and additional delivery
channels remain outside Phase 6. No fake reviews, ratings, teachers, stock
student photos or accreditations are included.
