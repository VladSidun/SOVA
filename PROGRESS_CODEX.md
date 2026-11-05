# SOVA — передача контексту Codex

Оновлено: 2026-11-05. Джерела: актуальне завдання → SPEC → GUIDE → код.
Перед змінами прочитайте AGENTS.md, цей файл і обидва source-of-truth документи.

## Поточний стан

- Phase 0–6 merged у develop. [PR #9](https://github.com/VladSidun/SOVA/pull/9)
  перевірено live: merged; integration commit `2aef9cd` містить Phase 6 tip
  `66a447b` (fetch та ancestry перевірено до змін).
- Окреме security maintenance у `fix/security-dependencies`, безпосередньо від
  актуального `origin/develop` `2aef9cd`; це не Phase 7.
  Checkout: `Sova_Project/SOVA-security-dependencies`.
- Dependency commit `5109ba4` запушено;
  [PR #10](https://github.com/VladSidun/SOVA/pull/10) відкрито у develop,
  без merge та auto-merge. Попередні чотири worktree і їхні локальні зміни
  збережено; `.env.local` та credentials не копіювалися.
- Quality CI dependency commit `5109ba4` успішний 2026-11-05:
  [run 41931736105](https://github.com/VladSidun/SOVA/actions/runs/41931736105).
  Linux повторив install, typecheck, lint, unit tests, build, 29 E2E і diff check.
  Наступний commit змінює лише ці звіти; latest head/CI звіряйте у PR #10.
- Це development preview. Phase 7–9, deployment, DB/Sova Hub, додаткові
  delivery channels, реальні media/reviews/cases/teachers не реалізовувалися.

## Що вже працює

| Частина | Реалізація та reusable точки входу |
| --- | --- |
| Phase 0–3 UI | Next 16.4.5, React 19.3.0, Node 24; UA/EN App Router shell, responsive Header/Footer і mobile focus trap, Hero, TrustStrip, Directions, GoalMatcher, FormatsPricing, TrialProcess, WhySova, Method, Location, FAQ. Дані й ціни централізовано; teachers/reviews/results/video та «8 років» hidden за flags. |
| Phase 4 форма | LeadGoalProvider зберігає typed goal у query; LeadForm має три кроки, Back/Next із збереженням даних, strict Zod/phone validation, контактну згоду, session attribution та explicit Turnstile widget. |
| Phase 5 API | src/app/api/leads/route.ts: server validation → Turnstile Siteverify → NormalizedLead → TelegramLeadDestination. Контрольовані 400/403/502/503, без raw upstream detail/PII/secrets; failure зберігає поля та показує прямі контакти. DB немає. |
| Phase 5 Telegram | src/lib/telegram.ts: HTML escaping, одна sendMessage спроба, token не йде destination; receivedAt UTC, відображення часу за Europe/Kyiv зі зміщенням winter/summer. Server secrets лишаються server-only. |
| Phase 6 metadata | src/config/seo.ts + src/lib/seo.ts: UA title/description з Guide 22, природна адаптація EN, privacy metadata. Canonical, uk/en/x-default і OG URL тільки з валідного NEXT_PUBLIC_SITE_URL. x-default веде на український відповідник. |
| Domain / indexing | NEXT_PUBLIC_SITE_URL optional без localhost default. HTTPS origin без credentials/path/query; local/reserved origin не генерує URL. SOVA_INDEXABLE=true + валідний origin потрібні для index/follow; VERCEL_ENV=preview завжди захищено. Зміна env потребує rebuild. |
| Structured data | src/lib/structured-data.ts та OrganizationJsonLd: EducationalOrganization + LocalBusiness, verified name/address/phone/hours/social/Maps/areaServed із business config і SPEC 26. Без rating/reviewCount/awards/accreditations/geo/postcode та вигаданого Sunday schedule. Serializer екранує <. |
| Crawler routes | src/app/sitemap.ts / robots.ts: лише чотири реальні locale routes; production sitemap має language alternates, robots виключає /api/. Preview sitemap порожній, robots disallow /. |
| Privacy | /uk/privacy і /en/privacy; /privacy → /uk/privacy через existing locale middleware. Описано contact purpose, Telegram/Turnstile, session attribution, analytics обмеження та contact-data requests. Consent короткий і обов’язковий; policy link у формі та footer. Header anchors зі сторінки privacy ведуть на головну потрібної мови. |
| Analytics boundary | src/lib/analytics.ts: track(event, params), strict whitelist і closed values. Весь event відхиляється при unknown key/unsafe value. Не передаються name/phone/comment/age/token/URLs/UTM/referrer/nested payload; input і raw errors не логуються. |
| Provider adapters | GA gtag(event + send_to), Meta trackSingleCustom для конкретного ID, TikTok instance(id).track. Flags + ID + окрема tracking consent + готовий runtime потрібні одночасно. Missing gate/SDK → no-op; provider throw не ламає форму. Самі SDK не завантажуються; pre-consent queue немає. |
| Events | AnalyticsEvents: explicit data attributes для CTA/phone/messenger/social/map, IntersectionObserver для price_view/trial_form_open, real video play тільки з data-analytics-video. Goal і form lifecycle instrumented без PII. Start тільки при першій зміні control; contact consent не вмикає tracking consent. |
| Later setup | docs/SEO_ANALYTICS_SETUP.md: domain/HTTPS/indexing, Search Console/GBP, IDs/flags, consent, вимкнення automatic matching/events і request-canary audit. Live accounts не налаштовано. |

## Security maintenance — 2026-11-05

Детальна таблиця версій, upstream sources, compatibility та reachability:
[docs/SECURITY_DEPENDENCIES.md](docs/SECURITY_DEPENDENCIES.md).

- Next/plugin 16.3.5 → 16.4.5; sharp 0.35.4 → 0.35.5;
  source-map-js 1.2.1 → 1.2.2; Zod 4.6.5 → 4.6.6.
  16.3.6 недостатньо для новіших Next advisories; обрано stable security release.
- Dev: Vitest/mocker 5.0.1 → 5.0.3, Vite 8.3.0 → 8.3.5,
  jsdom → Undici 7.29.1 → 7.30.1. Транзитивні пакети не стали прямими
  залежностями. Overrides, forks, forced fixes і downgrade не застосовано.
- Поточний baseline важливіший за історичні 7 findings Phase 6:

| Audit | До | Після |
| --- | --- | --- |
| Усі залежності | 32: 1 critical, 5 high, 26 moderate | 24 moderate; exit 1 |
| Production (`--omit=dev`) | 4: 1 critical, 3 high | 0; exit 0 |
| Лише dev | 28: 2 high, 26 moderate | 24 moderate |

24 залишкові package findings походять від одного advisory minimatch
GHSA-g3hv-75wg-m249. Patch 11.0.1 виходить за офіційні ranges поточних
ESLint/config-array, TypeScript ESLint та import-x, включно з їхніми latest
releases. Потенційний DoS вимагає недовіреного glob та optimizationLevel >= 2;
у SOVA це dev tooling із patterns у repository config, не public lead input.
Наступний крок — підтримуване оновлення consumers або backport у 10.x.

Release notes Next 16.4.5 та metadata окремих нових advisory cards ще
неузгоджені: npm не повертав сім оголошених 3 листопада fixes, а
GHSA-mfr8-8qww-v76h показує patched None. Це окремо описано у security report;
production audit 0 не означає перевірку exploit/fix усіх нових vendor cards.
У SOVA немає use cache/unstable_cache; повторно звірте metadata після синхронізації.

Ланцюжок Next ESLint plugin → fast-glob 3.3.1 → micromatch 4.0.8 → braces 3.0.3
збережено. GHSA-vfj7-8cjw-p6xm відкликано upstream 23 жовтня як практично
неексплуатований; patched braces release немає. Це не claim про встановлення
patch. ESLint rules/config та охоплення файлів не змінено.

Локально пройдено: два `npm ci` (lockfile SHA-256 незмінний), typecheck,
lint (0 warnings), 109 tests / 15 files, production build, усі 29 Chromium E2E,
обидва audit JSON, `npm ls` для оновлених пакетів/ланцюжків і diff check.
UA/EN, goal state, mocked form success/validation/fallback, privacy, JSON-LD,
preview metadata, sitemap/robots, favicon, Axe та responsive checks green.
Додатково пройдено EN форму до success з mocked API (один POST, 200),
перевірено raw HTML чотирьох locale pages і HTTP favicon SVG (200).
Mobile UA home та EN privacy screenshots перевірено візуально; console
errors і vendor requests відсутні. Live Telegram/Turnstile та analytics
providers не вмикалися; test preview server після QA зупинено.

На Windows npm 11.9.0 після обох `npm ci` показує optional
`@img/sharp-wasm32@0.35.5` і `@emnapi/runtime@1.11.3` як extraneous;
`npm ls` завершується з exit 0, required dependencies не missing/invalid.
Це відтворено й зафіксовано, node_modules вручну не змінювалися.
Audit dumps і QA artifacts не входять у Git.

## Історичні перевірки Phase 6

Локально на code/test implementation пройшли:

```text
npm ci             — passed, 350 packages; audit findings наведені нижче
npm run typecheck  — passed
npm run lint       — passed, 0 warnings
npm test           — passed, 109 tests / 15 files
npm run build      — passed, UA/EN landing + privacy, sitemap/robots, dynamic API
npm run e2e        — passed, 29 Chromium tests (24 попередні + 5 Phase 6)
git diff --check   — passed
```

Після фінального однорядкового text-width fix bc8c867 повторно пройшли lint,
build (включає TypeScript) та всі 5 SEO/privacy E2E. Full 29 E2E і 109 tests
вище виконано до цієї CSS-only правки. Quality CI для a79c574 повторив повний gate на Linux: install, typecheck, lint,
109 tests, build, 29 E2E та diff check — success. Подальший follow-up лише docs.

Перевірено raw generated HTML усіх чотирьох сторінок без domain env: noindex,
відсутні canonical/OG URL, JSON-LD без invented URL. Окремий build із synthetic
QA HTTPS origin + indexing flag підтвердив точні canonical/uk/en/x-default,
organization URL/@id, чотири sitemap loc та /api/ disallow. Тестовий origin
не є заявленим доменом SOVA; після перевірки повернуто preview build без env.

Browser/Axe: UA/EN privacy, locale switch, /privacy redirect, home anchors;
0 WCAG 2/2.1 A/AA violations, overflow checks на 360/768/1366. Попередні locale,
mobile nav, lead success/validation/fallback checks лишилися green; API E2E
мокають доставку. На сторінках preview немає GA/Meta/TikTok requests.

Візуально перевірено privacy screenshots на 360/768/1366 та consent step 3;
фінальна desktop privacy column має ширину 768 px, без переповнення. Артефакти
в ignored output/playwright/phase-6, не в Git. Це історичні Phase 6 QA
артефакти; наявність запущеного preview server тут не заявляється.

## Межі інтеграцій і відомі проблеми

- Search Console, Google Business Profile, GA4, Meta Pixel, TikTok Pixel не
  налаштовано через authenticated accounts. Підготовлено code/checklist;
  реальна доставка analytics не заявляється.
- SDK bootstrap і separate tracking consent manager потребують наступного
  авторизованого external setup. IDs самі по собі нічого не завантажують.
  Не вставляйте vendor snippet без перевірки automatic URL/DOM/form capture.
- Retention, processor details і live tracking policy школа має уточнити перед
  public launch. Ця сторінка — погоджений privacy minimum для preview.
- Real Telegram/Turnstile send не перевірявся у Phase 6; production hostname
  configuration та non-production destination test лишаються launch gate.
  Попередня Phase 5 нотатка про Cloudflare 110200 історична; не вважайте її
  live діагнозом нового checkout. Тут .env.local не копіювався.
- Історичний Phase 6 audit мав 7 findings. Поточні результати окремого
  dependency maintenance наведено вище: production 0, 24 moderate у dev.
  Повного усунення всіх dependency findings не заявлено.

## Компактна історія delivery

| Фаза | Підтверджений результат |
| --- | --- |
| 0 | PR #1–#3 merged; foundation/CI. |
| 1 | PR #4 merged як 24d3799; shell/navigation/accessibility. |
| 2 | PR #5 merged як ea2d16b; conversion і goal state. |
| 3 | PR #6 merged як 79d57f6; trust/method/FAQ/location. |
| 4 | PR #7 merged як 8aa65d9; form/schema/attribution/client boundary. |
| 5 | PR #8 merged як 6df575c, tip a7232a0; secure API/Telegram/fallback, LAN origin fix, Kyiv timestamps. Історичний gate: 52 tests і 24 E2E, real send не підтверджено. |
| 6 | 3fc9fe3 SEO/JSON-LD/privacy route; 9164763 privacy/events/adapters; e227e9e PII/interaction tests; bc8c867 text width. PR #9 merged як 2aef9cd, tip 66a447b. |
| Security maintenance | 5109ba4 dependency updates; PR #10 → develop, без merge/auto-merge. Production audit 4 → 0, full 32 → 24 moderate dev. |

## Наступний дозволений scope

Phase 7 не авторизовано. Перед наступною роботою дочекайтеся ручного merge
security PR #10, fetch origin та перевірте актуальний develop/ancestry/CI.
Сам звіт не дозволяє нову фазу, merge або deployment.
Motion/final polish не реалізовувалися. Усі нинішні CTA, event annotations,
формальні UA тексти, privacy links і disabled content flags потрібно зберегти.

## Результати

- ✅ Phase 6 merge перевірено live; security branch створено від актуального develop.
- ✅ Production findings усунено: 4 → 0; відтворювані npm ci та всі локальні quality checks пройдено.
- ✅ Phase 0–6 поведінка, ESLint rules, analytics PII/consent/no-op gates збережені; реальні заявки не надсилалися.
- ✅ Security branch запушено, PR #10 відкрито у develop без merge та auto-merge.
- ✅ GitHub Quality CI dependency commit 5109ba4 завершився success; усі кроки пройдено.
- ❌ 24 moderate dev findings minimatch залишаються до підтримуваного upstream оновлення; це не повна remediation всіх залежностей.
