# SOVA — Phase 1 site shell

Next.js App Router foundation for **Центр вивчення іноземних мов SOVA**.
Implemented scope: **Phase 0 foundation + Phase 1 shell**. This is not the full
marketing website or a production-ready MVP. `/uk` and `/en` render the
localized Header, navigation, current foundation content and contact Footer;
`/` redirects to `/uk` regardless of browser language. Hero and all Phase 2
conversion sections remain intentionally unimplemented.

## Source of truth

- [Website specification](./SOVA_WEBSITE_SPEC_v2.md): business, content, UX.
- [Implementation guide](./SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md): technical contract.
- [Agent instructions](./AGENTS.md): short repository workflow.
- [Phase progress](./PROGRESS_CODEX.md): delivered scope, checks and limitations.

Current user instructions take precedence over those documents.

## Requirements and dependency decisions

- Node.js **24.x** (`.nvmrc` and package engines), npm; tested locally on Node 24.
- Next.js **16.3.5**, React **19.3.0**, TypeScript strict.
- Tailwind **4.3.3** via `@tailwindcss/postcss` (CSS-first configuration).
- next-intl **4.14.5**, locale URLs `/uk` and `/en`; Next 16 `src/proxy.ts` and
  `next/root-params` request configuration.
- Inter (400/500/600), Manrope (600/700) through `next/font/google`, including
  Cyrillic subsets. Next downloads/self-hosts fonts at build time: clean builds
  need network access to the font provider.
- Zod 4 for environment validation; `server-only` for private env access.
- ESLint **10.10.0** with explicit Next/TypeScript/React/Hooks/import-x flat
  configs, Vitest **5.0.1** + Testing Library/jsdom, Playwright **1.63.0**
  with Chromium and axe accessibility smoke scaffolding.

`package-lock.json` fixes the resolved dependency graph. Use `npm ci` for
reproducible installs. Motion, React Hook Form, phone normalization and delivery
SDKs are deferred until their phases; no database or hosting-specific APIs.

The bundled `eslint-config-next` React/import/accessibility plugins still
declare ESLint 9 peer ranges. Instead of forcing incompatible peers, this
foundation uses the official Next plugin directly, typescript-eslint,
eslint-react, React Hooks and import-x with a TypeScript-aware resolver.
Their rulesets differ from the old preset; this is not a claim of identical
static rule coverage. The legacy JSX accessibility plugin is removed, and
axe checks both rendered locale pages for WCAG 2/2.1 A/AA violations. Continue
adding keyboard/focus/interaction tests when implementing UI; axe does not
replace manual accessibility review. No force/legacy-peer-deps or overrides.

## Setup and development

Run commands from the repository root (`Sova_Project/SOVA`):

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Copy `.env.example` only if `.env.local` does not already exist; preserve local
credentials. Open `http://localhost:3000/uk` or `http://localhost:3000/en`.
On macOS/Linux, use `cp .env.example .env.local` for the copy step.

## Environment and security

The example contains no secrets. `.env*` is ignored, except `.env.example`;
private keys, build output, dependencies and test artifacts are also ignored.

- `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` for foundation
  development. Public env values are validated when Next loads its config.
  Set a real HTTPS site URL before production SEO; no placeholder canonical
  domain is emitted in this phase.
- `NEXT_PUBLIC_*` values are public identifiers/verified contact URLs, never
  credentials. `src/lib/public-env.ts` whitelists them and strips unknown keys.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET_KEY` are optional
  for Phase 0. Future server code must use `getServerEnv()` in
  `src/lib/env.ts` (`server-only`). Telegram token/chat ID must be configured
  together. Validation errors report key names, not supplied values.
- Telegram/Turnstile/GA/Meta/TikTok integrations are not connected. Optional
  blank variables do not enable an integration. Future integration phases must
  require their credentials when those integrations are actually used.

Never commit `.env.local`, tokens or private administration links.

## Commands and tests

```powershell
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

`typecheck` generates Next route types before running `tsc --noEmit`, so it
works on a clean checkout. `lint` invokes ESLint directly; `test` is a single
Vitest run, and `npm run test:watch` starts watch mode.

Browser smoke checks use the built application on isolated port 3100:

```powershell
npm run build
npx playwright install chromium
npm run e2e
```

On Linux, browser installation may need `npx playwright install --with-deps
chromium`. Playwright starts/stops `next start`; no existing server is reused.
The Playwright runner clears inherited `NO_COLOR` because Playwright forces
color in workers/server processes; the host shell environment is unchanged.
Smoke coverage: root redirect, both locales, HTML language, localized shell,
desktop/contact anchor navigation, locale switching, mobile 360/768 overflow,
mobile menu Escape/focus behavior, unsupported-locale 404 and automated
accessibility scans of both locale pages. Unit tests cover the Phase 0
configuration/env/i18n contracts plus Phase 1 menu keyboard behavior and
feature-gated navigation. Later lead/form/SEO tests are not included.

Production-build inspection locally: `npm run build`, then `npm run start`.
The Phase 0 pages intentionally emit `noindex, nofollow` until Phase 6 SEO work.

GitHub Actions runs install, typecheck, lint, unit tests, build, Chromium smoke
and whitespace checks on PRs to `develop`/`main` and pushes to those branches.

## Repository map

```text
src/app/[locale]/    localized shell layout and minimal non-Hero page content
src/app/api/leads/   reserved directory, no API endpoint
src/components/layout/ Header, Footer, Container and Section primitives
src/components/     later sections/lead/ui/analytics directories remain reserved
src/config/         business, pricing, social links, disabled feature flags
src/content/        typed empty content collections
src/types/          locale/content/lead data contracts
src/i18n/           routing/navigation/request config and dictionaries
src/lib/            public/private environment validation
src/styles/         Tailwind, SVG-derived colors, font tokens
public/brand/       unchanged supplied logo.svg
public/images/      reserved school/students/reviews/placeholders directories
public/video/       reserved media directory
tests/              configuration/environment/localization smoke tests
e2e/                browser foundation smoke tests
```

Reserved directories use `.gitkeep`. Future functionality is not represented
by fake route handlers, content records or assets. Logo artwork matches the
supplied `SOVA_LOGO.svg`; only trailing whitespace was removed for Git checks,
without redesign. SVG brand red is `#D32F2F`, black is `#1A1A1A`.
Favicon and OG image have not been created.

## Content readiness and later phases

All content flags are false: teachers, reviews, results, hero video and the
eight-year statistic. Analytics flags are false too. Business config contains
only confirmed facts; prices are stored once with their billing units.
Empty collections contain no sample people, reviews or exam claims.

Phase 1 provides the Header, mobile menu, Footer, language switch and anchor
registry. Only the contact anchor is exposed because it is the only rendered
target in this phase; planned and feature-gated entries remain absent until
their real sections exist. Hero, marketing sections, form, lead API,
Telegram/Turnstile runtime integrations, analytics, production SEO, privacy
content and deployment are not implemented.
No DB or Sova Hub has been added.

Known document ambiguities for future work: hide the Reviews nav link while
its section is hidden; resolve the English hero eyebrow versus mixed-language
rule when building Hero; choose `/uk/privacy` and `/en/privacy` plus a `/privacy`
redirect when building the consent flow. Confirm rescheduling terms and
eight-year claim with the owner before publishing them.

## Git workflow

`main` is the release branch; `develop` is integration. Phase 0 uses
`feature/phase-0-foundation`, opened as a PR into `develop`, without auto-merge.
PR #1 was merged into `develop` after passing CI and explicit user authorization.
Because the remote was empty, `main`/`develop` start from a documentation and
ignore-rules bootstrap commit, not an existing deployed application. Future
phases branch from updated `develop`. Do not force push or erase user changes.
