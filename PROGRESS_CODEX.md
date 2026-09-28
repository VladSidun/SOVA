# SOVA — передача контексту Codex

Оновлено: 2026-09-29. Мета: продовжити роботу в іншому чаті без пошуку
попередніх розмов. Це стан реалізації, не заміна ТЗ.

## 1. Поточний стан

- Перед змінами прочитайте `AGENTS.md`, цей файл, `SOVA_WEBSITE_SPEC_v2.md`
  і `SOVA_CODEX_IMPLEMENTATION_GUIDE_v2.md`. Пріоритет: актуальне завдання
  користувача → SPEC → GUIDE → код.
- Phase 0–4 merged у `develop`; merged Phase 4 commit — `8aa65d9` (PR #7).
- Phase 5 реалізовано у `feature/phase-5-lead-delivery`, створеній безпосередньо
  від `8aa65d9`. Commits: `4351f7c`, `da21475`, `aca6905`, `8bb26f5`.
- Push, PR у `develop` та remote CI ще не виконані на момент цього report commit;
  їх треба перевірити live після push. Auto-merge не вмикати.
- Це development preview з `noindex, nofollow`, не production MVP.

## 2. Що реалізовано

| Частина | Реалізація / точки входу |
| --- | --- |
| API | `src/app/api/leads/route.ts`: dynamic Node route `POST /api/leads`; fail-closed при відсутній server конфігурації; public відповіді містять лише контрольовані `ok/code`. |
| Server validation | `src/lib/lead-schema.ts`: повторний strict Zod parse, sanitized text/attribution, token 1–2048, URL limits, defensive phone length/validation та E.164 normalization. Invalid JSON/payload → 400 до Turnstile/delivery. |
| Turnstile | `src/components/lead/TurnstileWidget.tsx`: explicit SPA widget з public site key, expiry/error/reset handling. `src/lib/turnstile.ts`: server-only Siteverify request з timeout; тільки `valid/invalid/unavailable`, без raw Cloudflare body у public response. |
| Destination architecture | `src/lib/lead-destination.ts`: `LeadDestination.send(NormalizedLead)`. `WhatsAppLeadDestination`, `ViberLeadDestination`, `SovaHubLeadDestination` зарезервовані лише як майбутні extension names; не реалізовані. DB немає. |
| Telegram | `src/lib/telegram.ts`: `TelegramLeadDestination`, одна `sendMessage` спроба після валідного Turnstile, HTML structured message за Guide, escape `&<>`, bounded fields, UA admin labels та UTM/time. Turnstile token ніколи не передається destination. |
| Controlled errors | 400 `INVALID_REQUEST`, 403 `TURNSTILE_REJECTED`, 503 `VERIFICATION_UNAVAILABLE`/`SERVICE_UNAVAILABLE`, 502 `DELIVERY_FAILED`; Telegram/Turnstile detail, credentials і PII не повертаються. Production source не має `console.*` PII logging. |
| Form integration | Phase 4 state/payload збережені; default submit іде у real `/api/leads`. На failure дані не очищаються, Turnstile reset-иться для повторної спроби, показуються WhatsApp, Viber, phone/copy. Telegram з’являється тільки при `NEXT_PUBLIC_TELEGRAM_URL`. |
| Public fallback | `src/lib/contact-links.ts`: phone з verified business config, standard `wa.me` та Viber phone deep link; public env може перевизначити WhatsApp/Viber URL. Telegram URL не генерується з номера. |
| Security boundary | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET_KEY` читаються лише server-side через `src/lib/env.ts`; client отримує тільки `NEXT_PUBLIC_*`. `.env.local` ignored і не tracked. |

Phase 0–4 UI лишився без зміни scope: UA/EN shell, conversion/trust sections,
config-driven confirmed facts, hidden fake-free optional content, 3-step lead form,
attribution, accessible validation та PII-free analytics parameters.

## 3. Перевірки Phase 5

Фінальний локальний прогін 2026-09-29 на code/test tip `8bb26f5`:

```text
npm ci             — passed, 350 packages, 0 vulnerabilities
npm run typecheck  — passed
npm run lint       — passed, 0 warnings
npm test           — passed, 48 tests / 11 files
npm run build      — passed; /api/leads dynamic, /uk and /en generated
npm run e2e        — passed, 24 Chromium tests
git diff --check   — passed
```

API/unit coverage: valid request sends exactly once; invalid payload 400;
invalid/unavailable/throwing Turnstile; E.164 and oversized phone defense;
Telegram HTML escaping and one send; provider failure controlled; no token,
upstream detail or credentials in public body; all Phase 4 tests remain green.

Browser coverage: mobile/desktop success flow, failure fallback and state
preservation, UA/EN, keyboard flow, 360/390/768/1366/1920 overflow checks,
console/network smoke. Axe WCAG 2/2.1 A/AA: 0 violations for locale pages,
Step 3 and fallback state. Manual headed Chromium check at 360×800, 768×800
and 1366×900 confirmed responsive fallback and preserved fields. The only
console/network error in the deliberate no-credentials submit was the expected
controlled `POST /api/leads` 503.

Security evidence: built `.next/static` contains 0 hits for
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET_KEY`; production
`src` contains 0 `console.log/info/warn/error` calls; only `.env.example` is
tracked and `.env.local` matches `.gitignore`.

## 4. Credentials і real-send status

На час Phase 5 у process environment та worktree відсутні:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
TURNSTILE_SECRET_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

Тому real Telegram/Turnstile delivery **не перевірено**. Успішну реальну
відправку не заявлено; реалізацію перевірено deterministic mocks та controlled
no-credentials browser flow.

Для ручної non-production перевірки:

1. Створіть окремі Turnstile widget/site key + secret для preview hostname;
   додайте hostname у Cloudflare Turnstile.
2. Додайте Telegram bot у приватний admin channel/group із правом надсилання;
   отримайте numeric `TELEGRAM_CHAT_ID` без публікації private channel URL.
3. У локальному `.env.local` або secret store deployment задайте
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET_KEY`,
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Не комітьте `.env.local`.
4. За потреби задайте verified `NEXT_PUBLIC_WHATSAPP_URL`,
   `NEXT_PUBLIC_VIBER_URL`; `NEXT_PUBLIC_TELEGRAM_URL` задавайте лише для
   підтвердженого public username/link, ніколи для admin channel.
5. Виконайте `npm run build`, `npm run start`; на `/uk` надішліть одну заявку
   з явним ім’ям/коментарем `NON-PRODUCTION TEST` і підтвердьте рівно одне
   повідомлення у private admin channel.
6. Тимчасово використайте invalid Telegram chat/token у безпечному preview,
   перевірте controlled fallback, збережені поля та відсутність raw upstream
   detail у response. Після тесту відновіть/rotate test credentials.

Додатково вручну на реальних пристроях перевірити Viber deep link; WhatsApp
використовує офіційний `wa.me/<international-number>` формат. Telegram fallback
залишається hidden без verified public URL.

## 5. Наступний scope

Не починати Phase 6 без окремої прямої авторизації та ручного merge Phase 5 PR.
Phase 6: production SEO, canonical/hreflang, JSON-LD, sitemap/robots та реальна
analytics abstraction без PII. Phase 7–9, deployment, DB/Sova Hub, automated
WhatsApp/Viber, real media/reviews/cases/teachers залишаються поза Phase 5.

Production launch додатково вимагає real credential test, domain/deployment
env, privacy page, підтверджені public messenger links, device deep-link QA та
інші launch gates зі SPEC/GUIDE.

## 6. Компактна історія delivery

| Delivery | Commits / результат |
| --- | --- |
| Phase 0 | PR #1–#3 merged; foundation/CI/reporting завершені. |
| Phase 1 shell | PR #4 merged як `24d3799`; responsive shell, navigation, accessibility. |
| Phase 2 conversion | PR #5 merged як `ea2d16b`; conversion sections і typed goal state. |
| Phase 3 trust content | PR #6 merged як `79d57f6`; trust content, FAQ, location. |
| Phase 4 lead form | PR #7 merged як `8aa65d9`; form/schema/attribution/client boundary. |
| Phase 5 lead delivery | `4351f7c`, `da21475`, `aca6905`, `8bb26f5`; PR/CI pending після цього report commit. |

## 7. Результати / невирішені проблеми

- ✅ Phase 5 відгалужено від merged Phase 4 у актуальному `develop`.
- ✅ Secure API, strict server validation, E.164, Turnstile verification і replaceable destination architecture реалізовано без DB.
- ✅ Telegram formatter/destination безпечно екранує input; provider/upstream detail і secrets не потрапляють у public response/client bundle/logs.
- ✅ Failure fallback показує WhatsApp/Viber/phone, conditional Telegram і зберігає всі поля; Axe/overflow перевірки пройдено.
- ✅ 48 unit/API/component tests, 24 E2E, typecheck, lint, build і `git diff --check` пройдено; Phase 4 tests green.
- ✅ Real credentials unavailable; реальний send чесно позначено unverified, наведено точні env та manual verification steps.
- ✅ Не реалізовано unofficial WhatsApp/Viber automation, Sova Hub або DB; це свідомо поза scope.
- ✅ Невирішених проблем у межах Phase 5 немає.
