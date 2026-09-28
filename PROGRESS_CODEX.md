# SOVA — передача контексту Codex

Оновлено: 2026-09-22. Мета: продовжити роботу в іншому чаті без пошуку
попередніх розмов. Це стан реалізації, не заміна ТЗ.

## 1. Поточний стан

- Перед змінами прочитайте `AGENTS.md`, цей файл, `SOVA_WEBSITE_SPEC_v2.md`
  і `SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md`. Пріоритет: актуальне завдання
  користувача → SPEC → GUIDE → код.
- Phase 0–3 merged у `develop`; merged Phase 3 commit — `79d57f6` (PR #6).
- Phase 4 реалізовано у `feature/phase-4-lead-form`, створеній безпосередньо
  від `79d57f6` після перевірки ancestry. Commits: `9ae7ad0`, `a607cca`.
- [PR #7](https://github.com/VladSidun/SOVA/pull/7) відкрито у `develop`, без
  auto-merge. Quality run `35724663642` для code/test tip пройшов; актуальний
  remote head/CI перевіряйте live після кожного push.
- Це development preview з `noindex, nofollow`, не production MVP.

## 2. Що реалізовано

| Частина | Реалізація / точки входу |
| --- | --- |
| Runtime / shell | Node 24, Next 16.3.5, React 19.3.0, TypeScript strict, Tailwind 4.3.3, next-intl 4.14.5. `/uk` і `/en`, `/` → `/uk`; responsive Header/Footer, language switch і mobile focus trap збережені. |
| Phase 2 conversion | `Hero`, `TrustStrip`, `Directions`, `GoalMatcher`, `FormatsPricing`; typed `LeadGoal` у query, config-driven facts/pricing. Direction/goal selection тепер веде до реального `#lead` і передає preselection у multi-select. |
| Phase 3 trust content | `TrialProcess`, `WhySova`, `Method`, `Location`, `FAQ`; hidden Teachers/Results/Reviews без fake content. Google Maps, адреса, графік і format-specific rescheduling збережені. |
| Lead UI | `LeadSection.tsx` + `LeadForm.tsx`: embedded mobile-first форма React Hook Form на 3 кроки, UA/EN, progress 1/3–3/3, Back/Next зі збереженням state, keyboard focus, inline accessible errors, без email. |
| Validation / payload | `lead-schema.ts`: спільні client/server-compatible Zod schemas, sanitization, required audience/goals/mode/name/phone/contact/consent, optional age/class/comment, comment ≤500. `libphonenumber-js` нормалізує валідний телефон у E.164. `LeadPayload` точно відповідає Guide. |
| Attribution | `attribution.ts`: перший UTM source/medium/campaign/content/term, referrer і landing URL фіксуються один раз та зберігаються у `sessionStorage`; порожня наступна навігація їх не перезаписує. |
| Boundaries | `lead-client.ts`: ін’єкційний/mockable `SubmitLead`, default `POST /api/leads`, async Turnstile client-token provider. `lead-analytics.ts` віддає лише locale/step/goal count/mode/contact method, без name/phone/comment/token. |
| Submit UX | Submit enabled до відправлення і disabled лише while pending. 2xx response очищає form state та замінює форму locked success-state; error зберігає всі введені дані. |

## 3. Перевірки Phase 4

Фінальний чистий локальний прогін 2026-09-22 на commit `a607cca`:

```text
npm ci             — passed, 350 packages, 0 vulnerabilities
npm run typecheck  — passed
npm run lint       — passed, 0 warnings
npm test           — passed, 35 tests / 8 files
npm run build      — passed, static /uk and /en
npm run e2e        — passed, 23 Chromium tests
git diff --check   — passed
```

Unit/component coverage: valid schema, invalid phone, required goal/contact/
consent, E.164, Back state, direction preselection, all UTM/referrer/landing
fields, first-touch persistence, exact payload, Turnstile token injection,
error state preservation, success duplicate lock і PII-free analytics params.

Browser coverage: mocked successful `POST /api/leads` на 360×800 і 1366×900,
inline error association, mobile/desktop full flow, payload inspection, no
horizontal overflow, UA/EN, keyboard-ready controls, console/network smoke.
Axe WCAG 2/2.1 A/AA: 0 violations для обох locale pages і Step 3 lead form.
Окремий headed Chromium QA на 360×800 та 1366×900 завершив форму успішно;
console errors — 0.

## 4. API boundary assumptions і наступний scope

Phase 4 навмисно не реалізує delivery. Default client викликає
`POST /api/leads`; до Phase 5 цей route відсутній, тому реальна непідмінена
відправка показує контрольовану помилку і зберігає дані. Component/E2E тести
ін’єктують submit function або mocked 2xx response.

Phase 5 має реалізувати:

1. `POST /api/leads` із повторною server-side Zod validation.
2. Server-side Turnstile verification; Phase 4 лише приймає client token через
   ін’єкційний async provider, default token порожній.
3. Replaceable destination interface і реальну Telegram delivery.
4. Controlled messenger/phone fallback при delivery failure.
5. Безпечне логування без повного lead payload або PII.

Не починати Phase 5 без окремої прямої авторизації та ручного merge PR #7.
SEO/real analytics залишаються Phase 6; motion/final polish — Phase 7.

Ще не реалізовано: `/api/leads`, Telegram/fallback, server Turnstile verification,
analytics vendor integrations, production SEO/JSON-LD/sitemap/robots, privacy
page, motion/final polish, deployment, DB/Sova Hub, real media/reviews/cases/
teachers.

До production лишаються зовнішні/бізнес рішення: Telegram/Turnstile/domain,
tracking IDs, messenger deep links, real content, підтвердження «8 років», точні
правила перенесення для кожного формату та media/privacy consent.

## 5. Компактна історія delivery

| Delivery | Commits / результат |
| --- | --- |
| Phase 0 | PR #1–#3 merged; foundation/CI/reporting завершені. |
| Phase 1 shell | PR #4 merged як `24d3799`; responsive shell, navigation, accessibility. |
| Phase 2 conversion | `8b4f273`, `0210373`, `4ed8a0b`, `58d61f8`; PR #5 merged як `ea2d16b`. |
| Phase 3 trust content | `e312347`, `d5f4001`, `73d8eac`, `afe2262`, `3d87d57`, `9749c9c`; PR #6 merged як `79d57f6`. |
| Phase 4 lead form | `9ae7ad0` form/schema/boundaries; `a607cca` tests. PR #7 open у `develop`, без auto-merge. |

## 6. Результати / невирішені проблеми

- ✅ Phase 4 відгалужено від merged Phase 3 у актуальному `develop`.
- ✅ Multi-step lead form, validation, E.164, attribution і Turnstile client boundary реалізовано у дозволеному scope.
- ✅ Phase 2 goal preselection доходить до form multi-select; Back/Next не втрачає state.
- ✅ Exact `LeadPayload` передається через mockable API client; analytics helper не отримує PII.
- ✅ 35 unit/component tests, 23 E2E, build, Axe і headed mobile/desktop QA пройдено.
- ✅ Telegram delivery, `/api/leads` і server Turnstile verification не реалізовано та явно відкладено до Phase 5.
- ✅ `feature/phase-4-lead-form` запушено; PR #7 відкрито в `develop`, auto-merge не ввімкнено.
- ✅ Невирішених проблем у межах Phase 4 немає.
