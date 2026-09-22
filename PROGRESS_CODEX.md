# SOVA — передача контексту Codex

Оновлено: 2026-09-21. Мета: продовжити роботу в іншому чаті без пошуку
попередніх розмов. Це стан реалізації, не заміна ТЗ.

## 1. Поточний стан

- Перед змінами прочитайте `AGENTS.md`, цей файл, `SOVA_WEBSITE_SPEC_v2.md`
  і `SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md`. Пріоритет: актуальне завдання
  користувача → SPEC → GUIDE → код.
- Phase 0 і Phase 1 merged у `develop`; merged Phase 1 tip — `24d3799`.
- Phase 2 реалізовано у `feature/phase-2-conversion`, відгалуженій від
  актуального `origin/develop` після перевірки, що повний Phase 1 є ancestor.
  Code commits: `8b4f273`, `0210373`, `4ed8a0b`.
- [PR #5](https://github.com/VladSidun/SOVA/pull/5) відкрито у `develop` без
  auto-merge. Гілку запушено; фінальний test/report commit і remote CI мають
  бути перевірені перед merge.
- Це development preview з `noindex, nofollow`, не production MVP. Phase 3+
  не починати без окремої прямої авторизації.

## 2. Що реалізовано

| Частина | Реалізація / точки входу |
| --- | --- |
| Runtime / shell | Node 24, Next 16.3.5, React 19.3.0, TypeScript strict, Tailwind 4.3.3, next-intl 4.14.5. `/uk` і `/en`, `/` → `/uk`; SVG logo, responsive Header/Footer, language switch та mobile focus trap з Phase 1 збережені. |
| Phase 2 composition | `src/app/[locale]/page.tsx` рендерить лише `Hero`, `TrustStrip`, `Directions`, `GoalMatcher`, `FormatsPricing` між Phase 1 Header/Footer. Trial process, About, reviews, results, FAQ та інші пізні секції не створені й не лишають порожніх блоків. |
| Hero | `src/components/sections/Hero.tsx`: точний UA H1/body/CTA зі SPEC, 45-хвилинний trial із `business.trialMinutes`, restrained primary/secondary CTA та branded 4:5 placeholder без stock imagery. Placeholder використовує наявний `/brand/logo.svg`; реальні media відкладені. |
| Trust | `TrustStrip.tsx` + `content/trust.ts`: з 2019 року, 100+ зараз, 1000+ за весь час, Offline + Online. Непідтверджені 8 років ізольовані в `unverifiedClaims` і не рендеряться при `showEightYearsStat=false`. |
| Directions | `content/directions.ts` містить 7 двомовних config-driven напрямів без фактів у JSX. `Directions.tsx` рендерить адаптивну сітку; кожна CTA має typed `leadGoal`. |
| Goal state | `LeadGoalProvider.tsx` + `lib/lead-goal.ts` — спільний API для Phase 4: `useLeadGoal()`, `isLeadGoal()`, `buildLeadGoalHref()`, query key `goal`. Вибір оновлює URL як `?goal=<LeadGoal>#lead`, зберігає наявні query/UTM, відновлюється з прямого URL і скролить до matcher-а з reduced-motion fallback. Контактні дані не збираються. |
| Goal matcher | `GoalMatcher.tsx` і `content/goals.ts`: усі значення `LeadGoal`, видимий selected state та чесний lead-area placeholder. Повної форми, валідації чи доставки немає — це scope Phase 4/5. |
| Formats / pricing | `FormatsPricing.tsx` + `content/formats.ts` рендерять cards із `config/pricing.ts` і `business.ts`: group 1500 грн/місяць, 3–5 людей, 60–75 хв, 2–3 рази/тиждень; pair 350 грн/заняття, 60–75 хв, 2–3 рази/тиждень; individual 500 грн/заняття, 60–75 хв. Exam prep використовує стандартну ціну обраного формату без окремої націнки. |
| Navigation / i18n | `renderedSectionIds` тепер містить тільки реальні `directions`, `formats`, `pricing`, `contacts`. Header CTA веде до `#lead`. UA формальна; EN адаптована окремо в messages. About/Reviews не потрапляють у nav. |

## 3. Перевірки Phase 2

Фінальний локальний прогін 2026-09-21 на `feature/phase-2-conversion`:

```text
npm run typecheck  — passed
npm run lint       — passed, 0 warnings
npm test           — passed, 18 tests / 5 files
npm run build      — passed, static /uk and /en
npm run e2e        — passed, 14 Chromium tests
git diff --check   — passed
```

Покрито exact pricing, 45 хв, відсутність `8 років`, direction → `LeadGoal`,
відновлення query selection, збереження існуючого UTM, CTA targets, hidden
sections, UA/EN, mobile menu, console/network smoke та WCAG 2/2.1 A/AA Axe.

Responsive перевірено реальним Chromium на 360, 390, 768, 1366 і 1920 px:
горизонтального overflow немає. Full-page preview оглянуто на 360/768/1366/
1920; Hero, trust grid, directions, matcher і pricing перебудовуються без
перекриття. Під час першого E2E Axe знайшов недостатню прозорість білого тексту
на червоній pricing-card; контраст виправлено, повторний Axe — 0 violations.

`npm run e2e` потребує актуального `npm run build`; runner піднімає production
server на `127.0.0.1:3100`.

## 4. Наступний scope і відкладені рішення

Наступна фаза лише після прямої авторизації: Phase 3 — trial process, Why SOVA,
method, location, FAQ. Не додавати форму раніше Phase 4 і API/delivery раніше
Phase 5.

Початок наступної гілки:

1. Дочекатися ручного merge PR #5 у `develop`; auto-merge не вмикати.
2. `git fetch --prune origin`, `git switch develop`, `git pull --ff-only`.
3. Перевірити, що tip Phase 2 є ancestor актуального `develop`.
4. Створити окрему feature branch для явно дозволеної фази.
5. Повторно використати `Section`, config facts, navigation registry та
   `LeadGoalProvider`; не дублювати pricing/business copy у JSX.

Ще не реалізовано: trial/why/method/location/FAQ, повна lead form, Zod/phone
validation, Turnstile, attribution storage, `/api/leads`, Telegram/fallback,
analytics, production SEO/JSON-LD/sitemap/robots, privacy page, motion/final
polish, deployment, DB/Sova Hub, реальні media/reviews/cases/teachers.

До production лишаються зовнішні/бізнес рішення: Telegram/Turnstile/domain,
tracking IDs, messenger deep links, реальний контент, підтвердження «8 років»,
правила перенесення занять і media/privacy consent.

## 5. Компактна історія delivery

| Delivery | Commits / результат |
| --- | --- |
| Bootstrap | `e645b78` — source-of-truth docs та ignore rules. |
| Phase 0 | `4636cb0`, `7599eab`, `79ad9a0`, `b0c8238`, `b34c555`; PR #1 merged як `f97bdb5`. Reporting/fixes PR #2 merged як `d754752`; handoff PR #3 merged як `ecb887a`. |
| Phase 1 shell · 2026-09-20/21 | `49455f0`, `3715068`, `1828e90`, `638afc4`; PR #4 merged у `develop` як `24d3799`. |
| Phase 2 conversion · 2026-09-21 | `8b4f273` — Hero/Trust; `0210373` — Directions/GoalMatcher/shared goal query; `4ed8a0b` — Formats/Pricing. PR #5 open у `develop`, без auto-merge. |

## 6. Результати / невирішені проблеми

- ✅ Phase 2 відгалужено від актуального `develop` після merged Phase 1.
- ✅ Hero, trust, directions, matcher і pricing відповідають дозволеному scope та SPEC.
- ✅ Pricing/trial/trust facts походять із config; «8 років» відсутні при flag=false.
- ✅ Direction/goal selection зберігає typed `LeadGoal` у query для Phase 4 без збору PII.
- ✅ UA/EN, formal UA, SVG logo, branded placeholder, accessibility і 44px+ targets перевірені.
- ✅ 18 unit/component tests, 14 E2E, build і responsive 360/390/768/1366/1920 пройдено.
- ✅ `feature/phase-2-conversion` запушено; PR #5 відкрито в `develop`, auto-merge не ввімкнено.
- ✅ Невирішених проблем у Phase 2 немає.
