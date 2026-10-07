# SOVA — передача контексту Codex

Оновлено: 2026-10-07. Джерела: актуальне завдання → SPEC → GUIDE → код.
Перед змінами прочитайте AGENTS.md, цей файл і обидва source-of-truth документи.

## Поточний стан

- Phase 0–5 merged у develop. PR #8 merged 2026-10-04; integration commit
  6df575c містить Phase 5 tip a7232a0 (ancestry перевірено live).
- Реалізовано лише Phase 6 у feature/phase-6-seo-analytics, безпосередньо від
  6df575c. Checkout: Sova_Project/SOVA-phase-6. Попередні checkout не змінено.
- [PR #9](https://github.com/VladSidun/SOVA/pull/9) відкрито у develop;
  auto-merge вимкнено, merge лишається користувачу. Code tip bc8c867 запушено.
- Quality CI для bc8c867 запущено:
  [run 37684937735](https://github.com/VladSidun/SOVA/actions/runs/37684937735).
  На час запису виконується; final remote head/CI перевіряйте live.
- Це development preview. Phase 7–9, deployment, DB/Sova Hub, додаткові
  delivery channels, реальні media/reviews/cases/teachers не реалізовувалися.

## Що вже працює

| Частина | Реалізація та reusable точки входу |
| --- | --- |
| Phase 0–3 UI | UA/EN Next App Router shell, responsive Header/Footer і mobile focus trap, Hero, TrustStrip, Directions, GoalMatcher, FormatsPricing, TrialProcess, WhySova, Method, Location, FAQ. Дані й ціни централізовано; teachers/reviews/results/video та «8 років» hidden за flags. |
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

## Перевірки Phase 6

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
вище виконано до цієї CSS-only правки. Подальший handoff commit змінює лише docs.

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
в ignored output/playwright/phase-6, не в Git. Локальний preview:
http://127.0.0.1:3106/uk та http://127.0.0.1:3106/uk/privacy (поки server працює).

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
- npm audit під час npm ci: 7 inherited vulnerabilities (6 high, 1 critical).
  Critical advisory стосується pinned Next 16.3.5 / next/og ImageResponse;
  інші — sharp, source-map-js і ESLint glob chain. Package graph не змінено.
  Перед production потрібна окрема dependency remediation/verification.

## Компактна історія delivery

| Фаза | Підтверджений результат |
| --- | --- |
| 0 | PR #1–#3 merged; foundation/CI. |
| 1 | PR #4 merged як 24d3799; shell/navigation/accessibility. |
| 2 | PR #5 merged як ea2d16b; conversion і goal state. |
| 3 | PR #6 merged як 79d57f6; trust/method/FAQ/location. |
| 4 | PR #7 merged як 8aa65d9; form/schema/attribution/client boundary. |
| 5 | PR #8 merged як 6df575c, tip a7232a0; secure API/Telegram/fallback, LAN origin fix, Kyiv timestamps. Історичний gate: 52 tests і 24 E2E, real send не підтверджено. |
| 6 | 3fc9fe3 SEO/JSON-LD/privacy route; 9164763 privacy/events/adapters; e227e9e PII/interaction tests; bc8c867 text width. PR #9 open, no auto-merge. |

## Наступний дозволений scope

Phase 7 починати тільки після окремої прямої авторизації та ручного merge PR #9.
Перед новою гілкою fetch origin і перевірте актуальний develop/ancestry/CI.
Motion/final polish не реалізовувалися. Усі нинішні CTA, event annotations,
формальні UA тексти, privacy links і disabled content flags потрібно зберегти.

## Результати

- ✅ Phase 6 реалізовано від merged develop; гілку запушено і PR #9 відкрито без auto-merge.
- ✅ Locale SEO, verified JSON-LD, sitemap/robots, privacy і всі Guide events готові в дозволеному scope.
- ✅ PII restriction, consent gates та no-op providers покрито тестами; live integrations чесно позначено unconfigured.
- ✅ Typecheck, lint, 109 tests, build, 29 E2E, metadata/HTML, Axe/visual QA і diff check пройдено; targeted E2E після width fix також green.
- ❌ Успадковані 7 dependency audit findings не усунено в Phase 6; потрібне окреме оновлення перед public launch.
