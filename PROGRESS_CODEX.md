# SOVA — передача контексту Codex

Оновлено: 2026-09-21. Мета: продовжити роботу в іншому чаті без пошуку
попередніх розмов. Це стан реалізації, не заміна ТЗ.

## 1. Почніть звідси

- Прочитайте `AGENTS.md`, цей файл і обидва source-of-truth документи перед
  змінами: user instruction → `SOVA_WEBSITE_SPEC_v2.md` (бізнес/UX) →
  `SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md` (техніка) → код.
- Phase 0 виконано й merged у `develop`. Phase 1 реалізовано у
  `feature/phase-1-shell`; Hero і Phase 2 не розпочато. Не переходьте до
  наступної фази без прямого завдання користувача.
- Origin: `https://github.com/VladSidun/SOVA.git`; integration: `develop`;
  release: `main`. Перевірений стартовий commit Phase 1: `ecb887a` у `develop`
  (містить merged PR #1–#3). Phase 1 code commits: `49455f0`, `3715068`,
  `1828e90`.
  Гілку запушено; [PR #4](https://github.com/VladSidun/SOVA/pull/4) відкрито
  у `develop`, merge state clean, фінальний CI passed, auto-merge не ввімкнено.
- Це development preview з `noindex, nofollow`, не production MVP.

## 2. Що реалізовано і як використовувати

| Частина | Реалізація / точки входу |
| --- | --- |
| Runtime | Node 24.x, npm, Next 16.3.5, React 19.3.0, TS strict, Tailwind 4.3.3, next-intl 4.14.5. Dependency graph зафіксований у `package-lock.json`; setup `npm ci`. |
| Маршрути | `src/app/[locale]/layout.tsx` збирає локалізований shell для `/uk` і `/en`; `/` → `/uk`, unsupported locale → 404. `page.tsx` усе ще мінімальний launch-status content, не Hero. Metadata використовує перевірений `/brand/logo.svg` як SVG favicon. |
| Layout primitives | `src/components/layout/Container.tsx` — responsive max-width/padding; `Section.tsx` — базовий section wrapper. `globals.css` задає sticky-anchor offset, smooth scroll і reduced-motion fallback. |
| Header | `Header.tsx`: sticky logo/header, desktop nav, formal CTA, UA/EN switch, mobile burger. CTA використовує підтверджений `business.phoneE164`; 44px+ targets, skip link, `aria-expanded/controls`, Escape, focus-on-open, focus trap і focus return. |
| Navigation registry | `src/config/navigation.ts`: один реєстр anchor IDs/labels. `getNavigationItems()` одночасно перевіряє, що target реально rendered, і feature flag. У Phase 1 доступний лише `#contacts`; Directions/Formats/About/Pricing з’являться зі своїми секціями, Reviews лишається hidden при `showReviews=false`. |
| Language switch | Використовує `src/i18n/navigation.ts`, зберігає поточний pathname і змінює locale prefix. `Navigation`/`Footer` мають повні окремі UA/EN dictionaries без змішування copy. |
| Footer / contacts | `Footer.tsx`, anchor `#contacts`: телефон, Instagram, Facebook, Google Maps, адреса та Пн–Сб 09:00–20:00. Дані беруться з `business.ts`/`social.ts`; англійська адреса зберігається поруч як локалізоване представлення того самого факту. Fake email/messenger/review/media немає. |
| Phase 0 config | Підтверджені business/pricing constants, disabled content/analytics flags, empty typed teachers/reviews/cases, public/private env boundary збережено без змін бізнес-фактів. `8 років` не рендериться. |
| Tests | 13 Vitest tests / 4 files. `navigation.test.tsx` покриває open/close, Escape, focus trap/return та hidden nav. 7 Chromium E2E: Phase 0 routing/a11y плюс anchors, locale switch, favicon, console/first-party HTTP errors і 360/768 overflow/menu smoke. |

## 3. Перевірки та результати

Локальна перевірка Phase 1 (2026-09-21, branch `feature/phase-1-shell`):

```text
npm run typecheck  — passed
npm run lint       — passed, 0 warnings
npm test           — passed, 13 tests / 4 files
npm run build      — passed, static /uk and /en
npm run e2e        — passed, 7 Chromium tests
git diff --check   — passed
```

Browser preview через реальний Chromium перевірено на 360×800, 768×800 і
1366×768. UA та EN оглянуті, mobile menu і desktop CTA/anchor працездатні;
`scrollWidth === clientWidth` на 360 і 1366, E2E окремо перевіряє 360/768.
WCAG 2/2.1 A/AA Axe smoke для UA/EN — 0 violations. Console — 0 errors /
0 warnings; first-party requests, включно з favicon, повертають 200.

`npm run e2e` потребує попереднього `npm run build`; runner сам запускає
production server на `127.0.0.1:3100`.

## 4. Наступний scope та відкладені рішення

Наступна фаза лише після прямої авторизації: Phase 2 — Hero, trust strip,
directions, goal matcher, formats/pricing. Коли секція реально рендериться,
додайте її ID до `renderedSectionIds`; не створюйте dead nav links.

Старт у новому чаті:

1. Перевірити, що [PR #4](https://github.com/VladSidun/SOVA/pull/4) вручну
   merged у `develop`; не створювати Phase 2 branch від неповного `develop`.
2. Виконати `git fetch --prune origin`, `git switch develop` і
   `git pull --ff-only origin develop`.
3. Переконатися, що tip `origin/feature/phase-1-shell` є ancestor актуального
   `develop`; це підтверджує повний merge Phase 1 разом із handoff.
4. Створити окрему feature branch для Phase 2 від оновленого `develop`.
5. Ще раз прочитати `AGENTS.md`, цей handoff, SPEC і GUIDE; реалізовувати лише
   Phase 2, повторно використовуючи shell, navigation registry, config та tests.

Ще не реалізовано: trial/why/method/location/FAQ, form/server validation,
API/Telegram/Turnstile, attribution, analytics, production SEO/JSON-LD/
sitemap/robots, privacy content, motion/final polish, deployment, DB/Sova Hub,
реальні media/reviews/cases/teachers. Motion/RHF/phone libraries не встановлені.

До production залишаються зовнішні/бізнес рішення: Telegram/Turnstile/domain,
tracking IDs, messenger deep links, реальний контент, «8 років», правила
перенесення занять і media/privacy consent. Не вигадуйте ці дані.

## 5. Компактна історія delivery

| Delivery | Commits / результат |
| --- | --- |
| Bootstrap | `e645b78` — source-of-truth docs та ignore rules, основа main/develop. |
| Phase 0 foundation | `4636cb0`, `7599eab`, `79ad9a0`, `b0c8238`, `b34c555`; PR #1 merged як `f97bdb5`. |
| Phase 0 reporting/fixes | `a04dbb3`, `26c6f57`, `a33905d`; PR #2 merged як `d754752`; CI passed. |
| Phase 0 handoff | `7352a63`, `10d3be8`; PR #3 merged як `ecb887a`. |
| Phase 1 shell · 2026-09-20/21 | `49455f0` — responsive localized shell; `3715068` — component/E2E coverage; `1828e90` — favicon/console/HTTP regression fix; `638afc4` — error-resolution report. [PR #4](https://github.com/VladSidun/SOVA/pull/4) open у `develop`, [CI run 35540252412](https://github.com/VladSidun/SOVA/actions/runs/35540252412) passed, merge state clean, без auto-merge. |

## 6. Результати / невирішені проблеми

- ✅ Phase 0 підтверджено merged у актуальний `develop`; Phase 1 відгалужено від `ecb887a`.
- ✅ Phase 1 scope реалізовано без Hero/Phase 2, fake content або зміни підтверджених бізнес-фактів.
- ✅ Обов’язкові checks, 7 E2E і responsive preview 360/768/1366 пройдено.
- ✅ UA/EN, formal Ukrainian CTA, keyboard/focus behavior і hidden-section nav policy покриті тестами.
- ✅ Favicon 404 усунуто через metadata на verified logo; console/network regression checks додано.
- ✅ `feature/phase-1-shell` запушено; PR #4 open у `develop`, final remote CI passed, merge state clean; merge не виконувався.
- ✅ Handoff містить точний порядок переходу до Phase 2 після ручного merge PR #4.
- ✅ Невирішених проблем у Phase 1 немає.
