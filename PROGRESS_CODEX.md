# SOVA — журнал виконання фаз

Цей файл містить фактичні результати роботи, а не бізнес-вимоги.
Source of truth: `SOVA_WEBSITE_SPEC_v2.md` та
`SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md`. Попередні записи зберігаються;
доповнення до завершеної фази оформлюються окремим датованим записом.

## Phase 0 — Foundation · 2026-09-18

**Статус:** Phase 0 виконано; основний PR #1 merged у `develop`.
Phase 1 не розпочато. Це фундамент для розробки, а не готовий до launch сайт.

### Що створено

- Next.js App Router із TypeScript strict та Tailwind CSS; мінімальні
  локалізовані сторінки без маркетингових секцій.
- next-intl: `/uk`, `/en`, редирект `/` → `/uk`, navigation/request/routing
  scaffolding і словники. Непідтримувана локаль повертає 404.
- Inter для body/UI та Manrope для headings через `next/font/google`,
  потрібні ваги й кириличні subsets.
- Структура `src/app`, `components`, `config`, `content`, `types`, `i18n`,
  `lib`, `styles`, `public`, `tests`, `e2e`; майбутні модулі резервуються
  через `.gitkeep`, без фіктивних endpoint-ів.
- `src/config/business.ts`: лише підтверджені назва, адреса, телефон,
  соцмережі, графік, рік заснування, показники студентів, тривалість занять
  та пробного уроку.
- `src/config/pricing.ts`: група 1500 грн/місяць, пара 350 грн/заняття,
  індивідуально 500 грн/заняття; група 3–5 людей.
- `src/config/features.ts`: `showTeachers`, `showReviews`, `showResults`,
  `showHeroVideo`, `showEightYearsStat` — `false`; analytics flags теж `false`.
- Базові типи контенту й заявки; порожні типізовані колекції без вигаданих
  людей, відгуків, результатів чи бізнес-даних.
- Zod env validation: розділення public/server змінних, `server-only`,
  `.env.example` без secrets; локальні env, залежності та artifacts ignored.
- Існуючий SVG у `public/brand/logo.svg` без редизайну; видалено лише trailing
  whitespace. Кольори з SVG: red `#D32F2F`, black `#1A1A1A`.
- Vitest, Testing Library/jsdom, Playwright Chromium; конфігураційні,
  локалізаційні, env та browser smoke tests; axe scans UA/EN.
- Scripts `dev`, `start`, `build`, `lint`, `typecheck`, `test`, `test:watch`,
  `e2e`; README із setup/dev/test instructions і короткий кореневий AGENTS.md.
- GitHub Actions: Node 24, Ubuntu 24.04, install/typecheck/lint/unit/build/
  Chromium E2E/whitespace checks для PR і push у `develop`/`main`.

### Dependency decisions

- npm та committed `package-lock.json`; Node 24.x. Використовуйте `npm ci`.
- Next 16.3.5, React 19.3.0, Tailwind 4.3.3, next-intl 4.14.5, Zod 4.
- ESLint 10.10.0 з сумісними TypeScript/React/Hooks/Next/import-x plugins;
  без `--force`, `legacy-peer-deps` або peer overrides.
- Static rule coverage відрізняється від `eslint-config-next`; це описано
  в README. Axe доповнює перевірки, але не замінює manual accessibility QA.
- Vitest 5.0.1, Testing Library, Playwright 1.63.0, axe 4.13.0.
- Motion, React Hook Form і phone/integration libraries відкладено до
  відповідних фаз. Clean font builds потребують доступу до Google Fonts.

### Перевірки основного implementation

| Перевірка | Фактичний результат |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, без lint warnings |
| `npm test` | 10 passed, 3 test files |
| `npm run build` | Passed; `/uk` і `/en` prerendered |
| `npm run e2e` | 4 passed; axe UA/EN — 0 violations |
| `git diff --check` | Passed |
| Targeted lint smoke | Виявляються explicit any, conditional Hooks, async client component, unresolved import |
| GitHub PR CI | [Passed на b34c555](https://github.com/VladSidun/SOVA/actions/runs/35366998777) |
| GitHub develop CI | [Passed на f97bdb5](https://github.com/VladSidun/SOVA/actions/runs/35367188740) |

### Git delivery

Origin перевірено: `https://github.com/VladSidun/SOVA.git`.
Основа `main`/`develop`: `e645b78` — documentation/source-of-truth bootstrap.
Implementation branch: `feature/phase-0-foundation`, pushed.

- `4636cb0` — `chore: initialize SOVA web foundation`
- `7599eab` — `chore: configure quality and test tooling`
- `79ad9a0` — `docs: add repository instructions for Codex`
- `b0c8238` — `chore: update CI actions to Node 24 runtime`
- `b34c555` — `chore: upgrade ESLint to v10 and refresh lint plugins`
- `f97bdb5` — merge [PR #1](https://github.com/VladSidun/SOVA/pull/1)
  у `develop`, після CI й прямого дозволу користувача. `main` не змінено.

### Межі фази та наступні кроки

Для Phase 1 готові routing/helpers, fonts/tokens, конфігурації, типи й tooling.
Header/mobile menu/Footer/anchors/language switch UI та Hero/інші секції ще
не реалізовано. Немає форми, API lead delivery, Telegram/Turnstile runtime,
analytics, production SEO, privacy content, БД, Sova Hub чи deployment.
Сторінки мають `noindex, nofollow`. Favicon/OG image ще не створено.

Не блокують Phase 1: Telegram bot token/chat ID, Turnstile keys, domain/DNS/
hosting/HTTPS, analytics/pixel IDs, Search Console/Google Business доступи,
перевірені messenger links та реальні media/reviews/cases/teacher profiles.
Secrets вносити лише в локальне/hosting environment, не в цей журнал.

До публікації: підтвердити «8 років», правила перенесення за форматами,
public messenger links, privacy consent і дозволи на media. У майбутньому
приховувати Reviews navigation разом із секцією; узгодити English hero eyebrow
із правилом no mixed language та locale privacy routes.

### Що пішло не так

- ❌ GitHub account без write-доступу спричинив push 403 — виправлено:
  активний `VladSidun`, push і PR успішні.
- ❌ CI warnings старого Node 20 actions runtime/Ubuntu migration — виправлено
  оновленням actions та явним Ubuntu 24.04.
- ❌ Legacy plugins `eslint-config-next` несумісні з ESLint 10 — виправлено
  сумісними plugins; різниця rule coverage задокументована.
- ❌ Перший dependency install отримав `ERESOLVE` через старий dependency
  graph — виправлено clean install; CI `npm ci` теж пройшов.
- ❌ Import warning AxeBuilder — виправлено named import.
- ❌ Конфлікт `NO_COLOR`/`FORCE_COLOR` у локальному Playwright — на момент
  основного merge був non-blocking; виправлення перевіряється в доповненні нижче.
- ❌ Автоматична перевірка безпеки відхилила видалення резервної копії старих
  залежностей, без деталізації причини. `.git/eslint9-node_modules-backup` і
  `.git/package-lock-eslint9.json` залишені лише локально, не tracked і не
  використовуються збіркою; це не blocker Phase 1.

## Доповнення Phase 0 — звітування та test runner · 2026-09-18

**Статус:** доповнення реалізовано, усі локальні перевірки passed;
Git delivery ще не виконано на момент цього запису.
Гілка: `feature/phase-0-reporting` від актуального чистого `develop`.

- Створено цей журнал з повним звітом Phase 0 й перевіреними Git/CI фактами.
- Guide §38.1 перед переліком Phase 0–9 вимагає автоматично оновлювати журнал
  після кожної фази, зберігати історію, зазначати фактичні перевірки/Git status,
  не вигадувати успіхи й завершувати звіти списком `❌`.
- AGENTS.md посилається на це правило; README містить посилання на журнал
  і підтверджений статус merge основного PR.
- Playwright config очищає inherited `NO_COLOR` лише в test runner, оскільки
  Playwright примусово задає `FORCE_COLOR` workers/server. Host shell не змінено,
  warnings не приховуються через `NODE_NO_WARNINGS`.
- Без нових dependencies, UI або функцій Phase 1.

### Перевірки доповнення

- `npm run typecheck`, `npm run lint`, `npm test` (10/10), `npm run build` — passed.
- `npm run e2e` — 4/4 passed, axe UA/EN — 0 violations, без color warnings.
- `git diff --check` — passed. PR CI ще не запущено; push/PR/merge доповнення
  ще не виконано на момент запису. Git status буде доповнено після перевірки CI.

### Що пішло не так

- ❌ Playwright color environment warning — виправлено конфігурацією;
  підтверджено чистим E2E output (4/4 passed).
- ❌ Локальна резервна копія в `.git` залишається після попереднього відхилення
  cleanup; не впливає на runtime, CI або готовність до Phase 1.
