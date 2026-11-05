# SOVA — Phase 8 release readiness

Дата: 2026-11-05, Europe/Kyiv. Рішення: **готово до локального preview та review;
публічний запуск заблокований зовнішніми launch gates нижче**.

Гілка `feature/phase-8-qa-preview` створена від `origin/develop` `fb2d5c7`
(merged Phase 7, PR #11; security PR #10 також входить у develop). Інші worktree
та їхні локальні зміни збережені. Нових бізнес-фіч, сторінок, media, delivery
channels або Sova Hub у цій фазі немає. Hosting preview **не створено**; preview
URL немає. Локальний loopback URL не є hosting deployment.

[PR #12](https://github.com/VladSidun/SOVA/pull/12) відкрито у `develop`, без
merge/auto-merge. Commits до цього report: `9f39db5` conversion fixes,
`9fdf3e9` release E2E/CI, `738726a` audit tooling, `5fbc198` corrected isolated
Lighthouse runner. Quality CI для report head перевіряється після push;
його актуальний результат доступний у PR.

## Відтворені та виправлені defects

Чотири нові E2E спершу впали на незміненому production build; після fix усі
пройшли. Runtime fix: `9f39db5`.

| Дефект | Результат |
| --- | --- |
| Після заповнення контактів і повернення на step 1 Enter у age/year відправляв збережену заявку | Submit обробляє тільки поточний крок; ранні кроки проходять свою validation і переходять далі без POST. |
| Після success submit button зникав, keyboard focus губився на body | Фокус переходить на confirmation heading. |
| Back залишався доступним під час запиту | Back і Submit заблоковані до результату; не можна повторно пройти кроки паралельно з pending request. |
| Будь-який HTTP 2xx, навіть HTML від gateway, показував success | Потрібна явна JSON-відповідь `{ "ok": true }`; некоректна відповідь відкриває наявний fallback зі збереженими даними. |

Додатково запит має timeout 25 s, більший за два server-side upstream timeout
по 8 s. Завислий transport більше не залишає форму в нескінченному pending.
Автоматичного повтору немає. Timeout означає невідомий результат доставки:
за втрати відповіді заявка могла дійти; persistent storage/deduplication не
додавалися. Повтор можливий лише явною дією користувача.

## Автоматизовані перевірки

Середовище: Windows, Node 24.14.0, npm 11.9.0, Next 16.4.5; production
`next build`, не dev server. API UI-success/failure сценарії мокають transport;
handler/server validation/Turnstile/destination contracts перевіряє unit suite.

| Команда / перевірка | Фактичний результат |
| --- | --- |
| `npm ci` | Пройдено; final lockfile перевірено окремим чистим install без зміни SHA-256. |
| `npm run typecheck` | Пройдено. |
| `npm run lint` | Пройдено, 0 warnings. |
| `npm test` | **120/120**, 17 files. |
| `npm run build` | Пройдено: UA/EN landing і privacy, sitemap, robots, dynamic `/api/leads`. |
| `npm run e2e` | **58/58 Chromium**, 0 skipped; два workers, production server на loopback. |
| `npm run qa:release` | Пройдено: tracked env/private key files, credential patterns, client bundle server-only integration strings, Lorem/TODO/FIXME/templates та informal UA. `.env.local` у QA worktree відсутній. |
| `npm run qa:seo -- --static` | Пройдено для фінального preview build: 4 HTML routes та crawler outputs. |
| `git diff --check` | Пройдено. |
| `npm audit --omit=dev` | **0 findings**, exit 0. |
| `npm audit` | **24 moderate dev findings**, exit 1; це відомий baseline, не clean audit. |

Сканер перевіряє поточний tracked tree і `.next/static`, не всю Git-історію.
No-fake-content додатково перевіряють typed-content/flags tests і rendered-page
E2E; Teachers/Results/Reviews порожні та hidden, їхніх nav links немає.
Нейтральний Hero media block лишається явно позначеним preview placeholder.
Phone input hint є прикладом формату; фактичні контакти беруться з business config.

E2E охоплюють mobile menu/focus trap/Escape/resize, skip link, anchors і locale
switch, goal preselection, повний UA flow на mobile/desktop, EN flow, усі form
validation groups і first-invalid focus, Back/Next preservation, normalized
phone/UTM, submit-once pending, success focus, 502 fallback, network abort і
усвідомлений retry, clipboard fallback, ціни 1500/350/500 та Google Maps href/
target/rel. Реальний unconfigured `/api/leads` повернув контрольований 503
`SERVICE_UNAVAILABLE` без credential/upstream details. Це **не** live Telegram
delivery verification.

Responsive matrix: **uk/en × 360, 390, 430, 768, 1024, 1366, 1920 px**.
Landing/pricing і всі три form steps перевірені на overflow; labels/buttons/
pricing cards не обрізаються по ширині. Heading order: один H1, без пропуску
рівня. Axe WCAG 2/2.1 A/AA та додаткові WCAG 2.2 AA checks: **0 violations** у
нових validation/responsive сценаріях; попередні landing/privacy/form/fallback
Axe checks теж green. Це автоматизована перевірка, не повна сертифікація WCAG.

Несподіваних page/console/requestfailed/HTTP errors у clean responsive runs
немає. Навмисні 502/503/network-abort у negative tests очікувані. GA/Meta/TikTok
SDK requests без consent/налаштувань відсутні. Реальні messenger apps на iOS/
Android і зовнішній Google Maps service не тестувалися; перевірено URL та CTA.

## Ручні перевірки

- Headed Chromium через Playwright CLI: mobile menu/backdrop, focus trap,
  Escape, scroll unlock, price anchor і подальший Tab до pricing CTA; чисті
  console/network logs.
- Візуально переглянуто Hero, goals step і contact error screenshots для обох
  мов на всіх семи ширинах; окремо mobile menu та детальні mobile/tablet/desktop
  screenshots. Перевірено перенос тексту, CTA, option labels і видимий focus.
- Зіставлено keyboard regression checks із UI: group/consent errors мають
  labels/descriptions, validation фокусує перше поле, success фокусує heading.
- Reduced motion перевірено при початковій preference і live зміні: reveal
  content видимий, transform відсутній, smooth scroll вимкнений, CTA працює.
- Контраст перевірений Axe на landing/privacy та form errors/fallback;
  візуально перевірені focus rings на світлих поверхнях. Нативний screen reader
  NVDA/VoiceOver і фізичні мобільні пристрої тут не перевірялися.

Артефакти: ignored `output/playwright/phase-8/` — E2E JSON, responsive PNG,
contact sheets, manual menu screenshot, audit JSON, Lighthouse HTML/JSON.
Quality CI зберігає E2E output і failure traces через upload-artifact.

## Performance / Lighthouse

Фінальний Lighthouse **13.6.0**, mobile 412×823 / DPR 1.75, simulated Slow 4G
(150 ms RTT, 1638.4 Kbps), CPU slowdown 4×; Chromium 153.0.8010.12. Три runs
для кожної мови, без паралельних build/tests. Raw warnings — порожні.

| Мова | Performance: усі runs → медіана | Accessibility / Best practices / SEO | LCP, усі runs | CLS |
| --- | --- | --- | --- | --- |
| UA | 82, 93, 90 → **90** | 100 / 100 / 63 | 0.932, 0.917, 0.918 s | 0 |
| EN | 93, 91, 91 → **91** | 100 / 100 / 63 | 0.915, 0.915, 0.917 s | 0 |

Медіани досягли mobile performance target, але один із шести runs має **82**
і TBT 755.5 ms; решта — 90–93. Цей результат не відкинуто. TBT решти runs
321–415 ms. Стабільний score ≥90 для кожного запуску **не підтверджений**;
main-thread/hydration variance потрібно повторно профілювати на hosting preview.
LCP <2.5 s, CLS <0.1 та accessibility ≥95 досягнуті в усіх шести runs.

Фінальні вимірювання та SHA-256 сирих JSON наведено в
[qa/phase-8-lighthouse.json](qa/phase-8-lighthouse.json). Сирі HTML/JSON доступні
локально в `output/playwright/phase-8/lighthouse/`; їх можна відтворити командами
нижче. Lighthouse 13.6.0 запускається через pinned `npm exec` у npm cache;
він не входить у dependencies/lockfile або bundle застосунку. Перший запуск
потребує npm registry access. Не змінювали throttling, categories або audits,
щоб штучно покращити score.

Порівняльний default audit 13.5.0 дав performance 81–85 і simulated LCP
3.51–3.54 s при observed LCP близько FCP. Це відповідає випадку text LCP в
одному кадрі з FCP, для якого 13.6 змінив dependency graph. Таке пояснення —
висновок зі trace і [офіційних release notes 13.6](https://github.com/GoogleChrome/lighthouse/releases/tag/v13.6.0),
а не новий runtime fix SOVA. Обидва результати збережені; оцінки 13.5 не
видаються за доказ фактичного slow rendering. Для основного evidence обрано
актуальний стабільний інструмент із виправленою симуляцією.

Навігаційний аудит не вимірює interaction INP; TBT не є INP. Достовірний
**INP <200 ms не підтверджено**. Потрібні окремий interaction trace на реальному
preview/пристрої та field дані після появи трафіку. Це узгоджується з
[офіційною документацією Lighthouse user flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md).

SEO preview нижчий за target 95 через навмисний `noindex, nofollow` і
`Disallow: /`; цей захист не вимикався для покращення score. У сирих звітах
єдина failing SEO audit — `is-crawlable`. Score індексованого live HTTPS сайту
не вимірювався і не заявляється. У локальному **окремому static build** із
synthetic fixture origin `https://language-school.org` перевірені точні
canonical/uk/en/x-default/OG URL, JSON-LD URL/@id, чотири sitemap loc з
alternates та `/api/` exclusion у robots. Origin використаний тільки як тестове
значення, не є заявленим доменом SOVA; запитів/deployment на нього не було.
Фінальний build знову без site origin, noindex і з порожнім sitemap.

Відтворення у двох терміналах після clean install і build:

```powershell
# Terminal 1
npm run start -- --hostname 127.0.0.1 --port 3100

# Terminal 2 (без паралельного build/tests, щоб не спотворити CPU timings)
npm run qa:seo
npm run qa:lighthouse
node scripts/lighthouse-evidence.mjs
```

## Credentials, інтеграції та реальні матеріали

| Що | Стан / наступна дія |
| --- | --- |
| Vercel / hosting | Немає session token, CLI auth або `.vercel/project.json`; GitHub deployments API повернув порожній список. Потрібні login і project link. |
| Telegram / Turnstile | У Phase 8 checkout ключів немає. Імена налаштованих ключів знайдено в старих локальних checkout; значення не виводилися/не копіювалися. Актуальність, дозволений preview hostname та non-production destination не підтверджені. |
| Domain / HTTPS | Фінальний origin не налаштований; canonical/hreflang для preview без нього навмисно відсутні. |
| Analytics / Ads | IDs/accounts/SDK bootstrap не налаштовані; flags false. Для preview не потрібні. Перед увімкненням — окрема tracking consent і PII audit. |
| Messengers | WhatsApp/Viber сформовані з verified phone; public Telegram URL не налаштований і прихований. Потрібна перевірка застосунків на реальних пристроях. |
| Media | Потрібні реальні school/student фото/відео, фінальний Hero, optimized media та дозволи школи на публікацію. |
| Trust content | Потрібні справжні reviews/cases і teacher profiles для майбутнього ввімкнення модулів. Fake records відсутні. |

## Точні кроки preview deployment

Підготовлено за [Vercel deploy docs](https://vercel.com/docs/cli/deploy) та
[environment docs](https://vercel.com/docs/environment-variables).

1. У цьому checkout на Node 24 виконати `npm ci`, typecheck, lint, tests, build,
   `qa:release`, static `qa:seo` та E2E з таблиці вище.
2. Виконати `npx vercel@latest login`, потім `npx vercel@latest link` і вибрати
   підтверджені account/project. Ці кроки тут не виконувалися через відсутність
   authenticated integration.
3. У **Preview** environment задати `SOVA_INDEXABLE=false`, усі три
   `NEXT_PUBLIC_ENABLE_*` flags false. `NEXT_PUBLIC_SITE_URL` залишити unset
   до підтвердження origin. Не переносити production secrets автоматично.
4. Якщо потрібен test lead, через захищені prompts `npx vercel@latest env add
   KEY_NAME preview` додати кожен із `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
   `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Використати узгоджену
   тестову destination та пару Turnstile keys із дозволеним preview hostname.
   Без них preview відкриється, а API коректно поверне 503/fallback.
5. Виконати **`npx vercel@latest deploy`**. CLI за замовчуванням створює preview;
   production deploy flag не використовувати. Дочекатися Ready та зберегти
   лише фактично повернений URL.
6. На цьому URL перевірити `/uk`, `/en`, обидві privacy pages, favicon,
   noindex/robots/empty sitemap, mobile nav, ціни/Maps та form fallback.
   Після окремого узгодження тестової destination пройти real Turnstile → API →
   Telegram і звірити одну доставку. Не трактувати mocked E2E як цю перевірку.
7. Повторити Lighthouse з `QA_BASE_URL`, заданим фактичним preview URL, і
   перевірити console/network/hostname-specific behavior. Auth/protection
   hosting preview може потребувати окремого доступу для audit.

## Відомі non-blocking issues та межі перевірки

- Успадковані 24 moderate dev findings minimatch; production audit 0.
  Деталі у [security report](SECURITY_DEPENDENCIES.md). Project lockfile та
  runtime versions незмінні; lockfile byte-identical до merged develop.
- Окремий зовнішній Lighthouse 13.6 має ще 4 moderate package findings у
  Sentry/bundler/glob chain, включно з
  [glob cancellation advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4).
  Це не усунена vulnerability: інструмент ізольований у npm cache, працює
  тільки з довіреним локальним build і не встановлюється/не виконується на
  hosting runtime. Root `npm audit` не охоплює цей зовнішній npm exec tool.
  Переперевірити його dependency chain перед аудитом недовірених джерел;
  overrides/forks/forced fixes не застосовано.
- Lighthouse показує runtime/polyfill та unused-JS opportunities; за відсутності
  фінальних media не змінювали MVP архітектуру заради вищого лабораторного score.
- Перевірено Chromium; Firefox/WebKit, assistive technology і physical-device
  messenger handoffs не охоплені. Real Turnstile і Telegram не перевірені.
- Privacy retention/processor details, умови перенесення за форматами та
  підтвердження статистики «8 років» потребують власника. Статистика hidden,
  універсальна rescheduling promise не публікується.

## Blockers для публічного launch

1. Hosting account/project, реальний домен/HTTPS та verified production env.
2. Підтверджений live Turnstile і real delivery в узгоджену destination; перевірка
   fallback/messengers на реальних пристроях і процедура роботи адміністрації.
3. Реальні фінальні media/content і дозволи на публікацію; виконати Phase 9
   після отримання матеріалів. Hidden modules не вмикати порожніми.
4. Погоджені бізнес/контент/privacy рішення вище.
5. Повторний audit фінального HTTPS build після media/integrations: SEO ≥95,
   performance ≥90, accessibility ≥95, LCP <2.5 s, CLS <0.1; окреме підтвердження
   responsiveness/INP. Поточні loopback scores не доводять якість CDN або live
   third-party integrations.

✅ Runtime defects виправлені, локальний preview build і QA gates пройдені.
❌ Public launch заблокований переліченими external/content gates; hosting
preview URL та live integration/INP verification відсутні.
