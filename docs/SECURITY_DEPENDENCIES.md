# SOVA — аудит залежностей 2026-11-05

Окреме security maintenance від `origin/develop` `2aef9cd`, який містить
merged Phase 6 [PR #9](https://github.com/VladSidun/SOVA/pull/9).
Phase 7 не розпочато. Код застосунку, ESLint rules, тести, analytics flags
та зовнішні інтеграції не змінюються.

## Версії та рішення

| Пакет | Було в lockfile | Стало | Результат advisory / причина |
| --- | --- | --- | --- |
| `next` | 16.3.5 | 16.4.5 | Усі 11 Next advisories baseline, включно з GHSA-vcvr-r3jv-pc5j, більше не позначаються npm. 16.3.6 виправляє лише початковий ImageResponse advisory; 16.4.1 потрібен для жовтневих RCE/DoS, 16.4.5 — security release від 3 листопада. |
| `@next/eslint-plugin-next` | 16.3.5 | 16.4.5 | Узгоджено з Next; recommended/core-web-vitals rules та їхнє покриття збережено. |
| `sharp` | 0.35.4 | 0.35.5 | GHSA-wq5f-xc86-pv6w: patched; транзитивно через Next, разом із platform packages та `@img/sharp-libvips-*` 1.3.4. |
| `source-map-js` | 1.2.1 | 1.2.2 | GHSA-68fv-2mgg-jv7q: patched; транзитивно через PostCSS/Tailwind/css-tree. |
| `zod` | 4.6.5 | 4.6.6 | Новий GHSA-mrhx-c7xc-m3w5: patched; мінімальну версію прямої залежності піднято з `^4.0.0` до `^4.6.6`. |
| `vitest` / `@vitest/mocker` | 5.0.1 | 5.0.3 | GHSA-qxg6-89mg-rqv8, GHSA-xp26-3454-mjgp: patched у мінімальному stable patch; лише dev. |
| `vite` | 8.3.0 | 8.3.5 | Шість поточних advisories версій до 8.3.2 усунено; npm обрав stable patch у чинному peer range Vitest. Лише dev. |
| `undici` | 7.29.1 | 7.30.1 | Вісім поточних advisories до 7.30.1 усунено; транзитивно через jsdom, лише dev. |
| `braces` | 3.0.3 | 3.0.3 | GHSA-vfj7-8cjw-p6xm відкликано upstream 23 жовтня; це зміна статусу advisory, а не встановлення patch. |
| `minimatch` | 10.2.6 | 10.2.6 | GHSA-g3hv-75wg-m249 залишається: patched 11.0.1 поза підтримуваними діапазонами поточних ESLint consumers. Лише dev. |

Registry перевірено через `https://registry.npmjs.org/`. Node 24.14.0 та React
19.3.0 відповідають engines/peers Next 16.4.5; next-intl 4.14.5 підтримує Next 16.
Vitest 5.0.3 підтримує Node 24 та Vite 8. Оновлення транзитивних залежностей
виконано npm у дозволених parent ranges. `sharp`, `source-map-js`, `vite` та
`undici` не додано як прямі залежності. Overrides, forks, downgrade,
`--force` і `--legacy-peer-deps` не застосовувалися.

Lockfile також містить узгоджені Next SWC/env, sharp binaries, Vitest spy та
залежності Vite/Rolldown. npm доповнив optional WASM dependency graph; це не
новий функціонал сайту. Інші прямі залежності залишилися на попередніх версіях.

## Порівняння audit

Початкові команди виконано на незміненому lockfile актуального develop.
У новому worktree ще не було node_modules: початковий `npm ls` показав
очікувані missing dependencies; baseline graph додатково перевірено через
`npm ls --all --package-lock-only`. Фінальний `npm ls` перевіряє installed tree.

| Область | До | Після |
| --- | --- | --- |
| `npm audit --json`, усі залежності | 32: 1 critical, 5 high, 26 moderate | 24 moderate; exit 1 через minimatch |
| `npm audit --omit=dev --json` | 4: 1 critical, 3 high | 0; exit 0 |
| Лише dev, різниця множин package findings | 28: 2 high, 26 moderate | 24 moderate |

Це кількість package findings npm, включно з транзитивними позначеннями;
вона не дорівнює кількості незалежних advisories. Історичні сім записів
від 8 жовтня не є поточним baseline. Нуль npm audit також не гарантує
відсутності ще не імпортованих або майбутніх advisories.

Є неузгодженість upstream metadata: release notes 16.4.5 заявляють сім
security fixes від 3 листопада, яких npm bulk advisory endpoint під час
перевірки ще не повертав. Водночас картка
[GHSA-mfr8-8qww-v76h](https://github.com/vercel/next.js/security/advisories/GHSA-mfr8-8qww-v76h)
показує `Patched versions: None`. Тому їх не зараховано як сім findings,
«знятих» npm audit. Встановлено latest stable security release виробника;
окремої перевірки exploit/fix для цих семи advisories не виконано.
У SOVA немає `use cache`/`unstable_cache` і відповідного сценарію цієї картки.
Наступний крок — повторно звірити vendor cards та registry після їх синхронізації.

## ESLint → fast-glob → micromatch → braces

Фактичний ланцюжок:

```text
ESLint config → @next/eslint-plugin-next 16.4.5
  → fast-glob 3.3.1 → micromatch 4.0.8 → braces 3.0.3
```

`braces@3.0.3` досі latest у registry, офіційного patched release немає.
GitHub відкликав GHSA-vfj7-8cjw-p6xm як практично неексплуатований.
Тому поточний audit не позначає цей ланцюжок. Підміна на сторонній fork
або відкат plugin до 14.x не потрібні; lint config/rules не послаблено.
Потенційний stack exhaustion вимагав би передати глибоко вкладений
недовірений glob у braces. Тут це dev tooling; публічна lead API не приймає
glob patterns і не імпортує цей ланцюжок.

## Залишок: minimatch

[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)
описує CPU/memory DoS при attacker-controlled glob та `optimizationLevel >= 2`.
Усі встановлені `minimatch@10.2.6` — dev dependencies:

- `eslint → minimatch` і `eslint → @eslint/config-array → minimatch`;
- `typescript-eslint → @typescript-eslint/typescript-estree → minimatch`;
- `eslint-plugin-import-x → minimatch`; React lint plugins отримують
  транзитивні позначення через TypeScript ESLint utilities.

Навіть актуальні registry releases ESLint 10.14.0, TypeScript ESLint 8.72.1
та import-x 4.17.1 вимагають minimatch 10 або 9/10. Patch 11.0.1 не входить
у ці ranges. Major override без підтримки consumers не додано.
Ризик стосується процесів lint/аналізу, які приймають недовірений glob із
потрібними options; у SOVA glob patterns задані конфігурацією репозиторію,
дані форми до них не потрапляють. Це не доказ безпечності довільних patterns.

Наступний крок: оновити ESLint/config-array, TypeScript ESLint та import-x,
коли вони офіційно підтримають patched minimatch або буде backport у 10.x;
повторити full audit, lint та весь quality gate. Не застосовувати downgrade
чи приховування findings для отримання нульового лічильника.

## Перевірки

`npm ci`, `npm run typecheck`, `npm run lint` (0 warnings), `npm test`
(109 tests / 15 files), `npm run build` та `git diff --check` пройдено.
Обидва audit JSON і installed dependency chain перевірено; усі 24 залишкові
package findings походять від одного minimatch advisory. `npm run e2e`:
29 Chromium tests пройдено, включно з UA/EN, goal selection, mocked lead
success/validation/fallback, privacy, metadata/JSON-LD, sitemap/robots,
favicon link, Axe та responsive checks.

Додатково браузером пройдено EN форму з mocked API до success (один POST,
HTTP 200), без console errors. Перевірено raw HTML чотирьох locale pages:
noindex/nofollow, без вигаданих canonical/OG URL та vendor scripts.
HTTP `/brand/logo.svg` повертає 200 та SVG; preview robots забороняє indexing,
sitemap не містить invented host. Mobile UA home та EN privacy screenshots
перевірено візуально; QA artifacts лишилися в ignored `output/playwright/security`.

Два чисті `npm ci` пройдено; другий підтвердив незмінний SHA-256 lockfile.
На Windows npm 11.9.0 після обох встановлень `npm ls` (exit 0) показує
optional `@img/sharp-wasm32@0.35.5` та `@emnapi/runtime@1.11.3` як extraneous.
Це відтворювана особливість optional WASM graph, не missing/invalid required
dependency. Подібний ефект описано
[upstream](https://github.com/tailwindlabs/tailwindcss/issues/19136);
точну причину для npm 11.9.0 не встановлено. Node_modules не редагувався вручну.

Credentials та `.env.local` не копіювалися; реальні lead requests не надсилалися,
analytics providers у браузері не вмикалися. Audit JSON та тимчасові QA
матеріали залишаються поза tracked files.

GitHub Quality CI для dependency commit `5109ba4`:
[run 41931736105](https://github.com/VladSidun/SOVA/actions/runs/41931736105)
завершився success 2026-11-05. На Linux пройшли npm ci, typecheck, lint,
unit tests, build, Chromium E2E та diff check. Цей documentation follow-up
не змінює application code або lockfile; latest head/CI показано у
[PR #10](https://github.com/VladSidun/SOVA/pull/10), merge/auto-merge вимкнено.

## Upstream evidence

- Next: [16.3.6](https://github.com/vercel/next.js/releases/tag/v16.3.6),
  [16.4.1](https://github.com/vercel/next.js/releases/tag/v16.4.1),
  [16.4.5](https://github.com/vercel/next.js/releases/tag/v16.4.5).
- [sharp advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)
  та [0.35.5 release](https://github.com/lovell/sharp/releases/tag/v0.35.5).
- [source-map-js 1.2.2](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2),
  [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
- [Vitest 5.0.3](https://github.com/vitest-dev/vitest/releases/tag/v5.0.3),
  [Vite 8.3.3 fixes](https://github.com/vitejs/vite/releases/tag/v8.3.3),
  [Vite 8.3.5](https://github.com/vitejs/vite/releases/tag/v8.3.5),
  [Undici 7.30.1](https://github.com/nodejs/undici/releases/tag/v7.30.1).
- [Withdrawn braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
  та [upstream discussion](https://github.com/micromatch/braces/issues/73).
