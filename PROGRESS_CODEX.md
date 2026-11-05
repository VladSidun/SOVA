# SOVA — передача контексту Codex

Оновлено: 2026-11-05. Джерела: актуальне завдання → SPEC → GUIDE → код.
Перед змінами прочитайте AGENTS.md, цей файл і обидва source-of-truth документи.

## Поточний стан

- Phase 0–6 та security maintenance merged у `develop`. Перед Phase 7 виконано
  fetch і ancestry: tips `66a447b` / `0bb35c0` входять у integration commit
  `de190a8` (PR #9 та #10).
- Реалізовано ТІЛЬКИ Phase 7 у `feature/phase-7-motion-polish`, від `de190a8`.
  Checkout: `Sova_Project/SOVA-phase-7`; інші worktree і локальні зміни збережені.
  `.env.local`, credentials та external integrations сюди не копіювалися.
- Code commits: `5a158c3` motion; `a13add1` responsive/accessibility;
  `3293ad2` brand integration та scrollbar-aware overflow assertions.
- Гілку запушено; [PR #11](https://github.com/VladSidun/SOVA/pull/11) відкрито
  у `develop`, без merge та auto-merge.
- Quality CI на code head `3293ad2` — success 2026-11-05:
  [run 41996978261](https://github.com/VladSidun/SOVA/actions/runs/41996978261).
  Linux повторив npm ci, typecheck, lint, 112 tests, build, 33 E2E, diff check.
  Наступний commit змінює лише цей handoff; latest head/CI перевіряйте у PR.
- Це development preview. Phase 8–9, deployment, DB/Sova Hub, нові сторінки,
  додаткові бізнес-фічі та real media/reviews/cases/teachers не реалізовувалися.

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

## Phase 7 — motion, responsive та accessibility polish

- `src/lib/motion.ts`: shared `fadeUp`, `fadeIn`, `staggerContainer`,
  `staggerItem`, `subtleScale` і `getMotionVariants(reducedMotion)`.
  20 px translate, 0.6 s ease-out, stagger 0.08 s, scale 0.98 → 1, без bounce.
  Motion 14.9.1 додано як exact dependency; інші версії не оновлювалися.
- `components/motion/MotionProvider.tsx`: LazyMotion/domAnimation + lightweight
  m components, global reducedMotion=user. `useReducedMotion.ts` через
  useSyncExternalStore читає live OS preference, знімає listener і обирає
  no-motion під час SSR/hydration. Reduced variants миттєві, без transform,
  opacity hiding та child delays; CSS також вимикає transitions/smooth scroll.
- `Reveal.tsx`: once-on-intersection для editorial headings/intro і Hero media;
  SSR/offscreen content видимий до enhancement. Stagger тільки у чотирьох
  methodology badges. CTA, goal buttons, FAQ controls та форма не загорнуті
  у reveals, тому interaction не чекає завершення анімації.
- Header: плавна зміна background/shadow після 16 px scroll, opacity-only
  menu entrance, компактна навігація до 1280 px. Resize відкритого mobile menu
  відновлює body scroll і фокусує перше desktop-посилання. Fixed backdrop
  покриває viewport; backdrop-filter, який обмежував fixed descendants, прибрано.
- `styles/globals.css` та sections: balanced headings, 1.06/1.12 line height,
  line-length limit, mobile full-width CTA/actions, стабільний scrollbar gutter,
  узгоджені відступи, перенос ціни/unit і природна рівна висота pricing cards.
  Overflow E2E перевіряють scrollWidth <= clientWidth: reserved scrollbar space
  не є overflow; перевищення ширини так само спричиняє failure.
- Accessibility: native goal buttons підтримують Space/Enter, зберігають typed
  goal/query/analytics і переносять фокус до #lead. Section targets focusable;
  двокольоровий focus indicator, 44+ px label/button/link targets, 18 px
  non-shrinking native radio/checkbox, два contact columns замість чотирьох.
  Group/consent controls мають aria-invalid + конкретні error associations.
  Telegram fallback button має контрастний відтінок. Goal matcher copy не
  посилається на розташування «праворуч», яке не відповідає mobile layout.
- Бренд: точні `#D32F2F` / `#1A1A1A` повторно звірено зі stroke/fill у
  `public/brand/logo.svg`; hover red `#B52828` — похідний UI token.
  SVG artwork не змінювався. Той самий файл у Header/Hero/Footer/favicon;
  footer має білу підкладку, щоб чорна частина знака залишалася видимою.
  Pricing/reach surfaces нейтральні: red лишається акцентом. Branded media
  placeholder та hidden Teachers/Results/Reviews збережені без fake content.

### Перевірки Phase 7

```text
npm ci             — passed; final lockfile також перевірено Linux CI
npm run typecheck  — passed
npm run lint       — passed, 0 warnings
npm test           — passed, 112 tests / 16 files
npm run build      — passed, UA/EN landing + privacy, sitemap/robots, dynamic API
npm run e2e        — passed, 33 Chromium tests
GitHub Quality     — success на 3293ad2, run 41996978261
git diff --check   — passed
```

Нові behavioral regressions: instant reduced variants, live preference change
та unsubscribe; group/consent error association; Space → goal/query → focus;
mobile-to-desktop scroll unlock/focus; stagger повністю стає видимим; reduced
motion не блокує Hero CTA. Pixel snapshots відсутні.

Headed Chromium browser QA: обидві мови на 360/390/430/768/1024/1366/1920 px,
усі major sections візуально переглянуто на mobile/tablet/desktop
(360/768/1366). Окремо перевірено form steps 2–3 на тих самих семи ширинах,
inline error/focus states, menu overlay, Escape, keyboard flow, FAQ та anchors.
Немає horizontal overflow, обрізаного видимого UA/EN тексту, замалих
інтерактивних targets, page/console errors чи first-party HTTP errors.
Декоративні map roads навмисно обрізаються у media preview; sr-only progress
labels не є видимим clipping. Axe WCAG 2/2.1 A/AA: 0 violations для locale
pages, privacy, tested form/fallback flows і додатково form errors обох мов
на 360/768/1366. Element screenshots можуть включати sticky header у середині
довгого crop; viewport screenshot/DOM перевірка підтвердили, що unfocused
skip link знаходиться вище viewport, а menu backdrop покриває екран.

QA artifacts: ignored `output/playwright/phase-7/` (screenshots, section/form
contact sheets, metrics); вони не входять у Git. API success/failure E2E
мокають delivery; реальні Telegram/Turnstile/analytics не вмикалися.

Motion API звірено з офіційними [LazyMotion docs](https://motion.dev/docs/react-lazy-motion)
та [Motion accessibility docs](https://motion.dev/docs/react-motion-config).

## Security maintenance — 2026-11-05

Історичний security Quality CI на `5109ba4` — success:
[run 41931736105](https://github.com/VladSidun/SOVA/actions/runs/41931736105).

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
| Security maintenance | 5109ba4 dependency updates; PR #10 merged як de190a8, tip 0bb35c0. Production audit 4 → 0, full 32 → 24 moderate dev (історичний audit). |
| 7 | 5a158c3 motion; a13add1 responsive/a11y; 3293ad2 brand. PR #11 відкрито в develop; 112 tests / 33 E2E та Quality CI success, без merge/auto-merge. |

## Наступний scope — лише після окремої авторизації

Phase 7 завершено; Phase 8 не починати автоматично. Після review та ручного
merge PR #11 потрібно fetch origin і перевірити latest develop/ancestry/CI.
Майбутні Lighthouse/preview deployment та launch gates потребують нового
завдання; real media/teachers/reviews/results — реальних наданих матеріалів.
Інтеграційні обмеження Phase 5–6 та security advisory нижче не знімаються
візуальним polish. Зберігайте CTA/events, формальну UA мову, privacy links,
server validation/Turnstile та hidden feature flags.

## Результати

- ✅ Реалізовано лише Phase 7 від merged develop de190a8.
- ✅ Motion, responsive/a11y та brand integration завершено; SVG не редизайнено.
- ✅ 112 tests, 33 E2E, typecheck, lint, build, Axe, responsive/visual QA та diff check пройдено.
- ✅ Гілку запушено, PR #11 відкрито в develop; code Quality CI success, merge/auto-merge не виконано.
- ✅ Невирішених проблем у Phase 7 немає.
- ❌ Успадковані 24 moderate dev findings minimatch залишаються за security report; Phase 7 їх не усуває.
