# SOVA — передача контексту Codex

Оновлено: 2026-09-18. Мета: продовжити роботу в іншому чаті без пошуку
попередніх розмов. Це стан реалізації, не заміна ТЗ.

## 1. Почніть звідси

- Прочитайте `AGENTS.md`, цей файл і обидва source-of-truth документи перед
  змінами: user instruction → `SOVA_WEBSITE_SPEC_v2.md` (бізнес/UX) →
  `SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md` (техніка) → код.
- Phase 0 **виконано**. Phase 1 **не розпочато**; Phase 2–9 теж не розпочато.
  Подальшу фазу реалізовуйте лише за прямим завданням користувача.
- Origin: `https://github.com/VladSidun/SOVA.git`. Integration: `develop`;
  release: `main`. Перевірений integration commit: `d754752` (PR #2).
  Main залишається на `e645b78`, documentation bootstrap, не реліз сайту.
- [PR #1](https://github.com/VladSidun/SOVA/pull/1) і
  [PR #2](https://github.com/VladSidun/SOVA/pull/2) **merged у develop**.
  [CI develop на d754752](https://github.com/VladSidun/SOVA/actions/runs/35368778828)
  **passed**. Перед новою роботою перевірте status/branch/log/remotes,
  отримайте актуальний develop, збережіть user changes.
- Це development foundation з `noindex, nofollow`, а не production MVP.

## 2. Що реалізовано і як використовувати

| Частина | Реалізація / точки входу |
| --- | --- |
| Runtime | Node 24.x, npm, committed `package-lock.json`; setup `npm ci`. Next 16.3.5, React 19.3.0, TS strict; alias `@/` → `src/`. |
| Маршрути | `src/app/[locale]/layout.tsx`, `page.tsx`: static `/uk`, `/en`, лише H1 SOVA та локалізований launch status. Немає landing UI. |
| i18n | next-intl 4.14.5; `src/i18n/routing.ts`: uk/en, default uk, prefix always, detection false. `src/proxy.ts` redirects `/` → `/uk`; unsupported locale → 404. |
| Переклади / navigation | `src/i18n/messages/{uk,en}.json`; `request.ts` через `next/root-params`, timezone Europe/Kyiv. `navigation.ts` exports localized `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` — повторно використовуйте для Phase 1. |
| Styles / fonts | Tailwind 4.3.3 через PostCSS; tokens у `src/styles/globals.css`. Inter 400/500/600 body та Manrope 600/700 headings через next/font у locale layout, latin+cyrillic; `font-sans`, `font-heading`, brand color utilities. Clean font build потребує network. |
| Бізнес / ціни | `src/config/business.ts`, `pricing.ts`, `social.ts` — єдині конфігурації підтверджених даних; не дублюйте constants у компонентах. Ціни: group 1500/month, pair 350/lesson, individual 500/lesson (UAH). |
| Flags | `src/config/features.ts`: showTeachers/showReviews/showResults/showHeroVideo/showEightYearsStat=false; enableGA/enableMetaPixel/enableTikTokPixel=false. «8 років» не рендериться. |
| Content / types | `src/types/content.ts`: Locale, LocalizedString, Direction, FormatContent, Teacher, Review, StudentCase, FAQItem; `lead.ts`: контракти заявки, не runtime validation. `src/content/*.ts` — типізовані порожні колекції, без sample records. |
| Public env | `src/lib/public-env.ts`: `parsePublicEnv`, `getPublicEnv`, whitelist NEXT_PUBLIC_*; Zod 4, blank optional values допустимі. `next.config.ts` перевіряє public env; SITE_URL default localhost, production canonical ще не генерується. |
| Private env | `src/lib/env.ts`: lazy `getServerEnv()` за server-only; `env-schema.ts` вимагає Telegram token/chat ID разом або жодного. Credentials необов’язкові у Phase 0; errors містять лише key names. Secrets ніколи не передавати client/analytics/logs. |
| Assets / reserved modules | `public/brand/logo.svg` — існуючий SVG без редизайну, лише whitespace normalized; red #D32F2F, black #1A1A1A. `src/components/{layout,sections,lead,ui,analytics}`, privacy/API directories та media dirs лише reserved `.gitkeep`. |
| Lint | ESLint 10.10.0, flat config: Next plugin + typescript-eslint + eslint-react + Hooks + import-x/TS resolver. Legacy eslint-config-next видалений через несумісні peers; rule coverage відрізняється, див. README. Без force/peer overrides. |
| Tests / CI | Vitest 5.0.1 + Testing Library/jsdom (`tests/`); Playwright 1.63.0 + axe 4.13.0 (`e2e/`). `playwright.config.ts` production server 127.0.0.1:3100, reuse=false, CI retries=2; очищає NO_COLOR лише в runner для сумісності з forced color workers. CI: Ubuntu 24.04, Node 24, install→typecheck→lint→unit→build→Chromium E2E→diff check. |

## 3. Перевірки та команди

Остання повна перевірка: 2026-09-18, integration `d754752`, CI за посиланням вище.
Typecheck, lint (0 warnings), 10 unit tests/3 files, build, 4 Chromium E2E та
whitespace check — passed. Axe UA/EN: 0 WCAG 2/2.1 A/AA violations.
Unit coverage: business/pricing/flags, empty collections, env boundaries, i18n.
E2E: root redirect, UA/EN lang/status/Tailwind/no marketing/no 8 years/noindex,
unsupported locale 404. Targeted lint smoke підтвердив any/Hooks/async client/
unresolved imports rules. API/form/mobile menu/landing tests ще не існують.

```text
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run e2e
git diff --check
```

E2E потребує попереднього build; Linux: browser install з `--with-deps`.
`npm run start` — production server; `npm run test:watch` — watch mode.
`.env.example` можна скопіювати в `.env.local`, лише якщо його ще немає.
Secrets/local env ignored; єдиний tracked env файл — `.env.example`.

## 4. Наступний scope та відкладені рішення

Phase 1 за Guide: Header, mobile menu, Footer, container, anchors, language
switch. Використовуйте locale navigation helpers, fonts/tokens, config та
існуючі tests. Hero/trust/directions/matcher/pricing UI належать Phase 2.
Не додавайте dead CTA/anchors; приховані секції не повинні мати nav links.

Ще не реалізовано: landing sections, form/server lead schema, API/Telegram/
Turnstile runtime, attribution, analytics, production SEO/JSON-LD/sitemap/
robots, privacy content, favicon/OG image, motion, deployment, DB чи Sova Hub.
Motion/RHF/phone/integration libraries не встановлені — додавайте за фазою.

Не блокують Phase 1: Telegram bot/chat credentials; Turnstile keys; domain,
DNS/hosting/HTTPS; GA/Meta/TikTok IDs; Search Console/Google Business доступи;
реальні media/reviews/cases/teachers і перевірені public messenger links.
До публікації узгодити «8 років», rescheduling per format, privacy/media consent.
Майбутні UX рішення: hide Reviews nav з секцією; English hero eyebrow versus
no mixed language; locale privacy routes/redirect. Не вирішуйте бізнес-конфлікти
мовчки. Формальна українська «ви»; ніякого fake content/stock student imagery.

## 5. Компактна історія Phase 0

| Delivery | Commits / результат |
| --- | --- |
| Bootstrap | e645b78 — source-of-truth docs та ignore rules, основа main/develop. |
| Foundation | 4636cb0 — framework/config; 7599eab — quality/tests; 79ad9a0 — README/AGENTS. |
| Compatibility | b0c8238 — CI Node 24 actions; b34c555 — ESLint 10/plugins/axe. PR #1 merged: f97bdb5. |
| Reporting / warning fix | a04dbb3 — Playwright color fix; 26c6f57 — report/rules; a33905d — verified CI evidence. PR #2 merged: d754752. |
| Формат handoff · 2026-09-18 | [PR #3](https://github.com/VladSidun/SOVA/pull/3), docs/phase-0-handoff: стислий контекст нового агента та правильні ✅/❌ у Guide §38.1/AGENTS. Documentation-only, git diff --check passed. Delivery status — у PR/Git history; ця правка не змінює завершений scope Phase 0. |

Після кожної фази оновлюйте sections 1–4 до актуального стану, додавайте короткий
рядок delivery у section 5 та актуальні outcomes нижче. Зберігайте факти виконаних
фаз, прибирайте дублікати й застарілі pending statuses. Не записуйте майбутні hash,
merge чи неперевірені результати; own report commit hash не потрібен.

## 6. Результати / невирішені проблеми

- ✅ Phase 0 реалізовано, PR #1/#2 merged, local та CI checks passed; Phase 1 не розпочато.
- ✅ Push 403 виправлено вибором GitHub account з write-доступом; CI runtime warnings усунено.
- ✅ ESLint peer incompatibility/ERESOLVE та AxeBuilder import warning виправлено; reproducible npm ci passed.
- ✅ Playwright color warning усунено, E2E output чистий. Static lint coverage tradeoff задокументовано; manual a11y QA майбутнього UI залишається потрібною.
- ❌ Видалення старої dependency backup автоматична перевірка безпеки відхилила без деталізації причини. Лише локальні `.git/eslint9-node_modules-backup` та `.git/package-lock-eslint9.json` залишаються невидаленими; untracked, не використовуються, не blocker. За потреби користувач може очистити ці backup-файли локально; не обходьте відхилення й не видаляйте `.git` цілком.
