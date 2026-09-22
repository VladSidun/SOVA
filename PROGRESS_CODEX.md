# SOVA — передача контексту Codex

Оновлено: 2026-09-22. Мета: продовжити роботу в іншому чаті без пошуку
попередніх розмов. Це стан реалізації, не заміна ТЗ.

## 1. Поточний стан

- Перед змінами прочитайте `AGENTS.md`, цей файл, `SOVA_WEBSITE_SPEC_v2.md`
  і `SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md`. Пріоритет: актуальне завдання
  користувача → SPEC → GUIDE → код.
- Phase 0–2 merged у `develop`; merged Phase 2 tip — `ea2d16b`.
- Phase 3 реалізовано у `feature/phase-3-trust-content`, відгалуженій від
  `ea2d16b` після перевірки ancestry. Code/test commits: `e312347`, `d5f4001`,
  `73d8eac`, `afe2262`, `3d87d57`.
- [PR #6](https://github.com/VladSidun/SOVA/pull/6) відкрито у `develop` без
  auto-merge. Гілку запушено; актуальний remote head/CI перевіряйте live.
- Це development preview з `noindex, nofollow`, не production MVP. Phase 4+
  не починати без окремої прямої авторизації та merged PR #6.

## 2. Що реалізовано

| Частина | Реалізація / точки входу |
| --- | --- |
| Runtime / shell | Node 24, Next 16.3.5, React 19.3.0, TypeScript strict, Tailwind 4.3.3, next-intl 4.14.5. `/uk` і `/en`, `/` → `/uk`; SVG logo, responsive Header/Footer, language switch і mobile focus trap збережені. |
| Phase 2 conversion | `Hero`, `TrustStrip`, `Directions`, `GoalMatcher`, `FormatsPricing`; typed `LeadGoal` у query, config-driven facts/pricing, без збору PII. |
| Trial process | `TrialProcess.tsx`: чотири етапи та повний зміст 45 хв — знайомство, тестування, рівень, діагностика, програма під ціль/рівень/deadline, графік і ціни. Окремо вказані potential teacher або administrator/head teacher, offline-екскурсія й матеріали. |
| Why SOVA | `WhySova.tsx`: шість різних proof-композицій замість 10 однакових cards; 1000+/100+, goal-based, speaking-first, CEFR/publishers, центр Мукачева + online/offline, групи 3–5 і free diagnostic. |
| Method | `Method.tsx`: CEFR, Cambridge/Oxford/Pearson, speaking, програма під ціль і дедлайн, interactive/games для молодших учнів. |
| Deferred content | `OptionalContentSections.tsx` + `features.ts` + порожні typed `teachers`/`cases`/`reviews`: Teachers, Results, Reviews не рендеряться й не лишають порожніх gaps; Reviews nav link відсутній. Реальний контент можна додати й увімкнути flags пізніше. |
| Location | `Location.tsx`: точна адреса, Пн–Сб 09:00–20:00, paid parking, online note, lightweight CSS map preview без Google JS SDK. Обидві CTA використовують `business.googleMaps`. `#contacts` тепер веде до секції локації; дубль ID у Footer прибрано. |
| FAQ | `FAQ.tsx` + `content/faq.ts`: native semantic `details/summary`, UA/EN, keyboard-ready. Rescheduling прямо описано як format-specific; універсального непідтвердженого правила немає. |
| Navigation / i18n | Реальний `#about` додано в nav. Teachers/Results/Reviews та їхні links hidden. Увесь Phase 3 content має адаптовані UA/EN словники; українська формальна. |

## 3. Перевірки Phase 3

Фінальний чистий прогін 2026-09-22 на commit `3d87d57` в ізольованому worktree:

```text
npm ci             — passed, 346 packages, 0 vulnerabilities
npm run typecheck  — passed
npm run lint       — passed, 0 warnings
npm test           — passed, 24 tests / 6 files
npm run build      — passed, static /uk and /en
npm run e2e        — passed, 20 Chromium tests
git diff --check   — passed
```

Покрито Google Maps URL, address/hours/parking, native FAQ keyboard behavior,
format-specific rescheduling copy, six proof blocks, full trial content,
hidden modules/nav links, UA/EN, mobile menu, console/network smoke та WCAG
2/2.1 A/AA Axe.

Responsive E2E пройдено на 360/390/768/1366/1920 px без horizontal overflow.
Full-page visual review виконано на 360/768/1366; Phase 3 section crops і
фінальний location map preview перевірено на 360/1366. Перший Axe прогін знайшов
три low-contrast підписи у red proof block; колір виправлено, фінальний Axe —
0 violations.

Локальний `npm ci` в основному checkout спершу блокувався Windows `EPERM`, бо
відкритий VS Code тримав native `@unrs` module. Чистий `npm ci` і весь фінальний
gate успішно виконані в окремому worktree на тому самому commit.

## 4. Наступний scope і відкладені рішення

Наступна фаза лише після прямої авторизації та ручного merge PR #6: Phase 4 —
lead form, client/server validation contract, attribution і Turnstile. Не
реалізовувати `/api/leads`/Telegram delivery до Phase 5; SEO/analytics до Phase
6; motion/final polish до Phase 7.

Початок наступної гілки:

1. Перевірити live, що PR #6 merged у `develop`; auto-merge не вмикати.
2. `git fetch --prune origin`, `git switch develop`, `git pull --ff-only`.
3. Перевірити, що tip Phase 3 є ancestor актуального `develop`.
4. Створити окрему feature branch лише для явно дозволеної фази.
5. Повторно використати `LeadGoalProvider`, `sectionIds`, business config і
   trial copy; не дублювати PII в analytics/logs.

Ще не реалізовано: lead form, Zod/phone validation, Turnstile, attribution,
`/api/leads`, Telegram/fallback, analytics, production SEO/JSON-LD/sitemap/
robots, privacy page, motion/final polish, deployment, DB/Sova Hub, реальні
media/reviews/cases/teachers.

До production лишаються зовнішні/бізнес рішення: Telegram/Turnstile/domain,
tracking IDs, messenger deep links, реальний контент, підтвердження «8 років»,
точні правила перенесення для кожного формату та media/privacy consent.

## 5. Компактна історія delivery

| Delivery | Commits / результат |
| --- | --- |
| Phase 0 | PR #1–#3 merged; foundation/CI/reporting завершені. |
| Phase 1 shell | PR #4 merged як `24d3799`; responsive shell, navigation, accessibility. |
| Phase 2 conversion | `8b4f273`, `0210373`, `4ed8a0b`, `58d61f8`; PR #5 merged як `ea2d16b`. |
| Phase 3 trust content | `e312347` trial/method; `d5f4001` proof/location; `73d8eac` FAQ/hidden modules; `afe2262` tests; `3d87d57` lightweight map fix. PR #6 open у `develop`, без auto-merge. |

## 6. Результати / невирішені проблеми

- ✅ Phase 3 відгалужено від актуального `develop` після merged Phase 2.
- ✅ TrialProcess, WhySova, Method, Location і FAQ відповідають дозволеному scope.
- ✅ Teachers, Results і Reviews структурно готові, але hidden без fake content і nav links.
- ✅ Google Maps CTA використовує verified config; адреса та графік точні.
- ✅ FAQ доступний з клавіатури та не обіцяє універсального перенесення.
- ✅ 24 unit/component tests, 20 E2E, build, Axe і responsive QA пройдено.
- ✅ `feature/phase-3-trust-content` запушено; PR #6 відкрито в `develop`, auto-merge не ввімкнено.
- ✅ Невирішених проблем у Phase 3 немає.
