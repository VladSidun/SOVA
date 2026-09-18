# SOVA repository instructions

## Source of truth
Priority: current user instructions → `SOVA_WEBSITE_SPEC_v2.md` (business,
content, UX) → `SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md` (implementation) → code.
Read both documents before changes; report material conflicts. Work only on
the requested phase. Current implementation is Phase 0, not a finished MVP.

## Repository map
- `src/app/[locale]`: UA/EN routes; `src/app/api`: future server endpoints.
- `src/components`: layout, sections, lead, UI, analytics (currently reserved).
- `src/config`: verified business/pricing, social links, feature flags.
- `src/content`, `src/types`: typed content and data; no invented records.
- `src/i18n`: routing, navigation, request config, `uk`/`en` dictionaries.
- `src/lib`: public/server environment boundaries; future integration logic.
- `src/styles`, `public/brand`, `public/images`, `public/video`: styles/assets.
- `tests`, `e2e`, `.github/workflows`: unit/component, browser smoke tests, CI.
- `PROGRESS_CODEX.md`: dated phase reports; preserve existing history.

## Commands
Node 24, npm, committed `package-lock.json`. Setup: `npm ci`.
Development: `npm run dev`. Checks: `npm run typecheck`, `npm run lint`,
`npm test`, `npm run build`, `git diff --check`.
Browser smoke: `npx playwright install chromium`, then `npm run e2e`
after building. `npm run start` serves the production build.

## Content and security
No fake teachers/reviews/results, unverified claims, contacts or stock student
imagery in production. Ukrainian address is formal: «ви», «ваш», «оберіть».
Keep unfinished sections and their nav links hidden; no empty gaps.
Do not render «8 років» until business confirmation. No universal rescheduling
policy until confirmed per format. Reuse business/pricing constants.
Never commit local env/secrets. Only `.env.example` is tracked. Server secrets
must stay behind `server-only`; never use a public prefix for credentials.
Do not send name/phone/comment to analytics or public logs. Validate future
lead input server-side. No DB, Sova Hub or additional delivery channels without
explicit authorization.

## Git and PR
Check status, branch, history and origin before changes. Origin must be
`https://github.com/VladSidun/SOVA.git`. Preserve user changes.
Branch from current `develop` into the requested feature branch; use small
Conventional Commits. PR into `develop`; `main` is the release branch.
No automatic merge, force push or destructive reset. PRs state scope, checks
actually run and known limitations; never claim unrun checks passed.

## Definition of Done
Requested scope only; strict types, UA/EN, appropriate accessibility/responsive
behavior, correct config/flags, no fake content or secret leaks. Relevant
tests and all required checks pass. A phase is not the whole MVP: real lead
delivery, fallback, production SEO and launch materials belong to later phases.
Before the final phase response, automatically update `PROGRESS_CODEX.md` as
required by Guide section 38.1. Record actual checks/Git status and end both the
entry and final phase response with a `❌` list of fixed/remaining problems.
