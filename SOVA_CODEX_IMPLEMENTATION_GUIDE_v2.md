# SOVA — Codex Implementation Guide

**Version:** 2.0  
**Source of truth:** `SOVA_WEBSITE_SPEC_v2.md`

Build a production-ready bilingual one-page website for **Центр вивчення іноземних мов SOVA**.

This document is an implementation contract for Codex / Claude Code.

---

# 0. Current project state

Enough business information is available to begin development now.

Do not wait for:
- teacher profiles;
- final photos/videos;
- reviews;
- student cases.

Those features must be config-driven and safely hidden until real content is supplied.

Known content:
- official name;
- address;
- opening hours;
- pricing;
- formats;
- lesson duration;
- frequency;
- free trial flow;
- phone;
- Instagram;
- Facebook;
- Google Maps;
- lead routing requirement;
- UA/EN;
- tone of voice;
- SEO geography;
- key service directions.

---

# 1. Non-negotiable rules

1. No invented facts.
2. No fake teachers.
3. No fake reviews.
4. No fake exam results.
5. No stock student imagery in production.
6. No Telegram secret in client bundle.
7. All user input validated server-side.
8. Mobile-first.
9. Do not turn the page into a UI-kit template.
10. No scroll-jacking.
11. Support `prefers-reduced-motion`.
12. One primary conversion: free trial lead.
13. All visible CTA buttons must work.
14. No dead sections.
15. Hidden content sections controlled by config.
16. Do not build Sova Hub integration yet.
17. Keep lead transport replaceable.
18. Use formal Ukrainian address: **ви / ваш / заберіть / оберіть**.
19. Never publish `8 years` unless enabled after business confirmation.
20. Never publish a universal missed-lesson policy until confirmed per format.

---

# 2. Confirmed business data

```ts
export const business = {
  officialName: "Центр вивчення іноземних мов SOVA",
  brandName: "SOVA",
  city: "Мукачево",
  address: "площа Кирила і Мефодія, 26/11, Мукачево",
  phoneE164: "+380992671906",
  phoneDisplay: "+380 99 267 1906",
  foundedYear: 2019,
  currentStudents: "100+",
  lifetimeStudents: "1000+",
  schedule: {
    mondayToSaturday: "09:00–20:00",
    sunday: null
  },
  instagram: "https://www.instagram.com/sova.mukachevo/",
  facebook: "https://www.facebook.com/sova.mukachevo/",
  googleMaps: "https://www.google.com/maps/place/%D0%A1%D0%BE%D0%B2%D0%B0/data=!4m2!3m1!1s0x0:0x339a2e961f51ca4e?sa=X&ved=1t:2428&ictx=111",
  lessonMinutes: {
    min: 60,
    max: 75
  },
  frequencyPerWeek: {
    min: 2,
    max: 3
  },
  trialMinutes: 45
} as const;
```

Keep `8 years` separate:

```ts
export const unverifiedClaims = {
  yearsOfExperience: 8
} as const;
```

Do not render unless feature flag is enabled.

---

# 3. Pricing data

```ts
export const pricing = {
  group: {
    priceUAH: 1500,
    unit: "month",
    groupSizeMin: 3,
    groupSizeMax: 5
  },
  pair: {
    priceUAH: 350,
    unit: "lesson"
  },
  individual: {
    priceUAH: 500,
    unit: "lesson"
  }
} as const;
```

Exam prep:
- no separate exam surcharge;
- pricing depends on selected format.

Do not create separate fake exam prices.

---

# 4. Service taxonomy

Use goals, not a giant course catalog.

```ts
export type LeadGoal =
  | "school"
  | "speaking"
  | "nmt"
  | "evi"
  | "ielts"
  | "fce"
  | "toefl"
  | "it"
  | "business"
  | "professional"
  | "study_abroad"
  | "work_abroad"
  | "relocation"
  | "other";
```

Visible landing categories:
1. School English
2. NMT / EVI
3. IELTS / FCE / TOEFL
4. IT & Professional English
5. Business / Career English
6. Study / Work / Relocation Abroad
7. Speaking & General English

---

# 5. Recommended stack

Use stable compatible versions at implementation time.

```text
Framework: Next.js, App Router
Language: TypeScript, strict
Styling: Tailwind CSS
Animation: Motion
Forms: React Hook Form
Validation: Zod
i18n: next-intl
Phone normalization: libphonenumber-js
Icons: Lucide or own SVG
Anti-spam: Cloudflare Turnstile
Lead notification: Telegram Bot API
Unit/component testing: Vitest + Testing Library
E2E: Playwright
```

Hosting provider must remain portable.

Do not depend on provider-specific APIs unless documented.

---

# 6. Repository

```text
sova-website/
├─ public/
│  ├─ brand/
│  │  ├─ logo.svg
│  │  ├─ favicon.svg
│  │  └─ og-default.jpg
│  ├─ images/
│  │  ├─ school/
│  │  ├─ students/
│  │  ├─ reviews/
│  │  └─ placeholders/
│  └─ video/
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ privacy/page.tsx
│  │  ├─ api/
│  │  │  └─ leads/route.ts
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ sections/
│  │  ├─ lead/
│  │  ├─ ui/
│  │  └─ analytics/
│  ├─ config/
│  │  ├─ business.ts
│  │  ├─ features.ts
│  │  ├─ pricing.ts
│  │  └─ social.ts
│  ├─ content/
│  │  ├─ directions.ts
│  │  ├─ formats.ts
│  │  ├─ teachers.ts
│  │  ├─ reviews.ts
│  │  ├─ cases.ts
│  │  └─ faq.ts
│  ├─ i18n/
│  │  └─ messages/
│  │     ├─ uk.json
│  │     └─ en.json
│  ├─ lib/
│  │  ├─ env.ts
│  │  ├─ lead-schema.ts
│  │  ├─ lead-destination.ts
│  │  ├─ telegram.ts
│  │  ├─ attribution.ts
│  │  ├─ analytics.ts
│  │  ├─ phone.ts
│  │  ├─ seo.ts
│  │  └─ turnstile.ts
│  ├─ styles/
│  └─ types/
├─ e2e/
├─ tests/
├─ .env.example
└─ README.md
```

---

# 7. Feature flags

Create:

```ts
export const features = {
  showTeachers: false,
  showReviews: false,
  showResults: false,
  showHeroVideo: false,
  showEightYearsStat: false,
  enableGA: false,
  enableMetaPixel: false,
  enableTikTokPixel: false
} as const;
```

Rules:
- hidden section must not leave empty gaps;
- hidden section must not appear in nav;
- enabling later must require content only, not architecture change.

---

# 8. Formal language

Ukrainian copy must consistently use formal address.

Correct:
- `Заберіть свій безкоштовний пробний урок`
- `Оберіть ціль`
- `Підберемо програму`
- `Як вам зручніше навчатися?`

Incorrect:
- `Забери`
- `Обери`
- `твоя`
- `тобі`

Create content QA test or grep list for accidental informal copy.

---

# 9. Hero

Working content:

```text
Eyebrow:
English School • Mukachevo • Offline + Online

H1:
Англійська під вашу ціль — від НМТ до роботи за кордоном.

Body:
Групові, парні та індивідуальні заняття для школярів,
студентів і дорослих. Офлайн у центрі Мукачева або онлайн.

Primary:
Заберіть свій безкоштовний пробний урок

Secondary:
Підберіть програму за 60 секунд

Microcopy:
45 хвилин • визначення рівня • знайомство • персональний план — безкоштовно.
```

Do not use fake hero photo.
Use a designed media placeholder until real assets are supplied.

---

# 10. Landing sections

Exact order:

```text
Header
Hero
TrustStrip
Directions
GoalMatcher
FormatsPricing
TrialProcess
WhySova
Method
[Teachers - hidden]
[Results - hidden until content]
[Reviews - hidden until content]
Location
FAQ
LeadSection
Footer
```

When media/reviews arrive:
- enable without reordering the core funnel unless analytics suggests otherwise.

---

# 11. Trust stats

Render now:
- `з 2019 року`
- `100+ студентів зараз`
- `1000+ студентів за весь час`
- `offline + online`

`8 років` is behind a feature flag.

---

# 12. Format cards

## Group
```text
1500 грн / місяць
3–5 людей
60–75 хв
2–3 рази / тиждень
Offline / Online
```

## Pair
```text
350 грн / заняття
2 людини
60–75 хв
2–3 рази / тиждень
Offline / Online
```

## Individual
```text
500 грн / заняття
Персональна програма
60–75 хв
Offline / Online
```

Add small line:
`Підготовка до іспитів — за ціною обраного формату.`

---

# 13. Trial process

Show four visual steps.

```text
1. Залишаєте коротку заявку
2. Ми зв’язуємось так, як зручно вам
3. 45 хв: тестування + визначення рівня
4. Отримуєте програму, графік і рекомендацію формату
```

Offline bonus:
- tour;
- materials intro.

Do not imply that every trial is taught by one specific person.

Copy:
`Пробний урок проводить майбутній викладач або адміністратор / головний викладач.`

---

# 14. Lead form types

```ts
export type Audience =
  | "child"
  | "school_student"
  | "university_student"
  | "adult";

export type StudyMode =
  | "offline"
  | "online"
  | "unsure";

export type ContactMethod =
  | "call"
  | "telegram"
  | "viber"
  | "whatsapp";

export type LeadPayload = {
  audience: Audience;
  ageOrGrade?: string;
  goals: LeadGoal[];
  studyMode: StudyMode;
  name: string;
  phone: string;
  contactMethod: ContactMethod;
  comment?: string;
  consent: true;
  locale: "uk" | "en";
  attribution: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
    referrer?: string;
    landingUrl?: string;
  };
  pageUrl: string;
  turnstileToken: string;
};
```

---

# 15. Lead form flow

### Step 1
Question:
`Хто буде навчатися?`

Options:
- Дитина
- Школяр
- Студент
- Дорослий

Optional:
`Вік або клас`

### Step 2
Question:
`Яка ваша ціль?`

Multi-select goals.

Then:
`Як вам зручніше навчатися?`
- Офлайн
- Онлайн
- Не знаю — підкажіть

### Step 3
Fields:
- Ім’я
- Телефон

Question:
`Як з вами зв’язатися?`
- Подзвоніть
- Telegram
- Viber
- WhatsApp

Optional:
- comment.

Submit:
`Заберіть безкоштовний пробний урок`

---

# 16. Validation

Zod server schema.

Rules:
- audience required;
- >=1 goal;
- study mode required;
- name 2–80;
- valid phone;
- contact method required;
- consent true;
- comment max 500;
- verify Turnstile;
- normalize phone E.164;
- sanitize control characters.

Never trust client validation only.

---

# 17. Telegram lead delivery

Primary:
`TelegramLeadDestination`.

Environment:
```text
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Message:

```text
🆕 Нова заявка SOVA

👤 Ім’я: ...
📞 Телефон: ...
🎓 Хто: ...
🎯 Ціль: ...
📍 Формат: ...
💬 Зв’язок: ...
📝 Коментар: ...

🌐 Locale: ...
📣 Source: ...
🏷 Campaign: ...
🧩 Content: ...
🕒 Time: ...
```

Escape HTML/Markdown safely.

Do not log full lead payload to public logs.

---

# 18. LeadDestination architecture

```ts
export interface LeadDestination {
  send(lead: NormalizedLead): Promise<void>;
}
```

Implement:
```text
TelegramLeadDestination
```

Reserve:
```text
WhatsAppLeadDestination
ViberLeadDestination
SovaHubLeadDestination
```

Do not implement fake WhatsApp/Viber automation without official API credentials.

---

# 19. Delivery error fallback

If Telegram send fails:

UI:
> Не вдалося надіслати заявку автоматично. Напишіть нам у зручний месенджер або зателефонуйте.

Show:
- WhatsApp
- Viber
- phone
- Telegram if a verified deep link exists.

Preserve entered form state so user can copy data.

Optional future improvement:
- persistent lead storage before notification.

Do not add DB unless explicitly approved.

---

# 20. Messenger links

Phone:
```text
+380992671906
```

WhatsApp:
build standard phone URL from E.164.

Viber:
use tested deep link based on the number.

Telegram:
phone-based deep link may behave differently across clients.
Before production:
- verify public username if one exists;
- otherwise test phone link on iOS / Android / desktop.

Never expose private admin Telegram channel URL.

---

# 21. UTM / attribution

On first visit:
capture:
- utm_source
- utm_medium
- utm_campaign
- utm_content
- utm_term
- referrer
- landing URL

Persist for session.

Include in Telegram lead.

Do not overwrite non-empty values with empty later navigation.

---

# 22. SEO

## Ukrainian title

```text
SOVA — курси англійської в Мукачеві | Для школярів, студентів і дорослих
```

Description:

```text
Центр вивчення іноземних мов SOVA у Мукачеві. Групові, парні та індивідуальні заняття online/offline, НМТ, ЄВІ, IELTS, FCE, TOEFL, IT та Business English. Безкоштовний пробний урок і визначення рівня.
```

Do not overstuff keywords.

---

# 23. Local JSON-LD

Use `EducationalOrganization` and/or appropriate LocalBusiness subtype.

Include only verified:
- name;
- URL;
- phone;
- address;
- opening hours;
- social links;
- Google Maps location;
- languages offered;
- areaServed.

Do not invent:
- aggregateRating;
- reviewCount;
- awards;
- accreditations.

---

# 24. SEO geography

Primary:
- Mukachevo;
- Mukachevo district;
- nearby villages.

Secondary online:
- Zakarpattia;
- Ukraine;
- Ukrainians abroad.

One-page is enough for MVP.

Future SEO routes only when content exists:
```text
/nmt
/evi
/ielts
/kids
/it-english
```

---

# 25. i18n

Use:
```text
/uk
/en
```

Redirect `/` to `/uk` or use locale middleware.

Need:
- canonical;
- hreflang uk;
- hreflang en;
- x-default.

No mixed language.

English copy must be adapted, not machine-literal Ukrainian structure where it sounds unnatural.

---

# 26. Visual tokens

Read final red/black values from the provided SVG if available.

Fallback:

```css
:root {
  --brand-red: #D72D36;
  --brand-black: #232020;
  --brand-white: #FFFFFF;
  --surface-soft: #F7F7F7;
  --border-soft: #E7E7E7;
  --text-muted: #686868;
}
```

Main rule:
- white dominant;
- black strong text / occasional dark section;
- red accent, not background everywhere.

---

# 27. Fonts

Use:
- Manrope for headings;
- Inter for body.

Load with `next/font`.
Only needed weights.

---

# 28. Motion

Create shared variants:
- fadeUp;
- fadeIn;
- staggerContainer;
- staggerItem;
- subtleScale.

Default:
- 16–24px translate;
- 0.5–0.7s;
- low/no bounce.

Reduced motion:
- remove translate/scale;
- keep instant or opacity only.

---

# 29. Media placeholders

Until real media arrives:
- no stock photography;
- create branded placeholder shapes;
- preserve real intended aspect ratios.

Suggested:
- Hero 4:5 or 16:12;
- school wide media 16:9;
- review video 9:16;
- teacher portraits 4:5.

When real media arrives:
- AVIF/WebP;
- next/image;
- responsive sizes;
- lazy load below fold.

---

# 30. Teachers module

Build component and content schema, but do not render.

```ts
type Teacher = {
  id: string;
  name: string;
  photo: string;
  experience: LocalizedString;
  specialties: LocalizedString[];
  quote?: LocalizedString;
};
```

Feature:
```ts
showTeachers: false
```

When content arrives:
- populate;
- enable;
- add nav link if appropriate.

---

# 31. Reviews / results module

Same pattern.

Do not render until real data.

Feature:
```ts
showReviews: false,
showResults: false
```

No fake 5-star rating.

---

# 32. Location

Render:
- address;
- `Пн–Сб 09:00–20:00`;
- center-city note;
- nearby paid parking;
- route CTA;
- lightweight map/embed.

Do not load heavy Google Maps JS SDK.

---

# 33. Domain readiness

Code must not hardcode placeholder domain in canonical.

Use:
```text
NEXT_PUBLIC_SITE_URL=
```

When domain is purchased:
- set production URL;
- rebuild canonical / sitemap / OG.

Suggested names should not be assumed available.

---

# 34. Analytics abstraction

Create:
```ts
track(event, params)
```

Events:
```text
cta_click
goal_select
trial_form_open
trial_form_start
trial_form_step_complete
trial_form_submit
trial_form_success
trial_form_error
phone_click
telegram_click
viber_click
whatsapp_click
instagram_click
facebook_click
price_view
video_play
map_click
```

Never include:
- name;
- phone;
- comment.

---

# 35. Privacy minimum

Include:
- `/privacy`;
- one short consent checkbox;
- explain that details are used only to contact about learning;
- tracking consent can be added when ad pixels are enabled.

Do not block current development on a large legal package.

---

# 36. Environment

`.env.example`

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=

NEXT_PUBLIC_WHATSAPP_URL=
NEXT_PUBLIC_VIBER_URL=
NEXT_PUBLIC_TELEGRAM_URL=
```

Instagram, Facebook and phone can be content config.

---

# 37. Tests

## Unit / component

At minimum:

1. valid lead passes;
2. invalid phone rejected;
3. goal required;
4. contact method required;
5. consent required;
6. form back preserves data;
7. direction card preselects goal;
8. pricing values render correctly;
9. hidden teacher section is absent;
10. hidden review section is absent;
11. Telegram formatter escapes input;
12. analytics does not receive PII;
13. formal CTA copy exists;
14. eight-year stat not rendered when flag false.

## API

15. valid lead sends once;
16. invalid payload 400;
17. invalid Turnstile rejected;
18. Telegram failure returns controlled error;
19. secret not leaked.

## E2E

20. mobile nav;
21. anchor scroll;
22. full lead flow;
23. form validation;
24. UK locale;
25. EN locale;
26. price section;
27. Google Maps CTA;
28. delivery error fallback.

---

# 38. Development phases

## 38.1. Mandatory phase reporting

After successfully completing each authorized phase, Codex must automatically
create or update `PROGRESS_CODEX.md` in the repository root before the final
response. Do not ask for separate permission to write this report.

- Read the existing log first. Preserve earlier phase reports; append a new
  dated phase entry or a dated follow-up for corrections to a completed phase.
- Write reports in Ukrainian. Include phase number/name, date, scope and status,
  delivered files/behavior, dependency decisions, actual verification commands
  and results, branch, available commit hashes/messages, PR/CI links and their
  verified status, limitations, external setup, and readiness for the next phase.
- End every phase entry and final phase response with a list of problems,
  each starting with `❌`. Distinguish fixed issues from remaining blockers and
  non-blocking limitations. If none occurred, explicitly state that no problems
  were found rather than inventing an error.
- Never include secrets, private administration links, lead payloads or PII.
  Never claim an unrun test passed or an unperformed push/merge succeeded.
- Mark a phase successful only after its authorized scope and required checks
  pass. If blocked, record partial progress and the exact blocker; do not mark
  the phase complete. A completed phase does not mean the entire MVP is ready.
- Include the report in the phase PR. A report commit cannot include its own
  hash or a future merge hash: label pending Git/CI actions accurately and use
  a dated follow-up when recording later verified results. Do not fabricate
  identifiers or create an endless chain of commits solely to record hashes.
- Reporting never authorizes the next phase, release, push or merge by itself;
  follow the current user's Git authorization and repository workflow.

## Phase 0
- initialize repo;
- TS strict;
- lint;
- Tailwind;
- fonts;
- i18n;
- env;
- tests;
- business/pricing config;
- feature flags.

## Phase 1
- Header;
- mobile menu;
- footer;
- container;
- anchors;
- language switch.

## Phase 2
- Hero;
- trust strip;
- directions;
- goal matcher;
- formats/pricing.

## Phase 3
- trial process;
- why SOVA;
- method;
- location;
- FAQ.

## Phase 4
- lead form;
- validation;
- attribution;
- Turnstile.

## Phase 5
- `/api/leads`;
- Telegram destination;
- failure fallback.

## Phase 6
- SEO;
- JSON-LD;
- sitemap;
- robots;
- analytics abstraction.

## Phase 7
- motion;
- final responsive polish;
- brand SVG.

## Phase 8
- QA;
- E2E;
- Lighthouse;
- preview deployment.

## Phase 9 — when materials arrive
- real hero media;
- school gallery;
- reviews;
- cases;
- teachers;
- enable feature flags.

---

# 39. Git

Branches:
```text
main
develop
feature/foundation
feature/shell
feature/conversion-sections
feature/trial-form
feature/lead-delivery
feature/seo-i18n
feature/motion
feature/media-content
```

Conventional commits.

Do not make one giant commit.

---

# 40. CI

On PR:
- install;
- typecheck;
- lint;
- unit tests;
- build;
- optional Playwright;
- content checks.

Add content checks:
- no `Lorem ipsum`;
- no fake teacher data;
- no placeholder phone;
- no unresolved critical `{{...}}`;
- no informal CTA if Ukrainian copy requires formal tone.

---

# 41. Deployment

Preview deployment can happen before domain purchase.

Production only after:
- domain;
- HTTPS;
- production env;
- Telegram channel tested;
- Turnstile;
- real logo SVG;
- privacy page;
- no fake content.

---

# 42. Performance

Targets:
- Lighthouse performance mobile >= 90;
- accessibility >= 95;
- SEO >= 95;
- LCP <2.5s;
- CLS <0.1;
- INP <200ms.

No autoplay heavy video before real optimized asset.

---

# 43. Accessibility

- semantic HTML;
- one H1;
- focus;
- keyboard nav;
- form labels;
- error associations;
- contrast;
- 44px touch targets;
- reduced motion;
- alt text.

---

# 44. Future channels

The user wants to add more lead channels later.

Current architecture must make this easy:

```text
Lead API
  └─ LeadDestination[]
      ├─ Telegram
      ├─ WhatsApp   (future)
      ├─ Viber      (future)
      └─ Sova Hub   (future)
```

Do not tightly couple `/api/leads` to Telegram formatting.

---

# 45. Future Sova Hub

Do not implement.

Prepare interface so later:
- lead stored in Sova Hub;
- admin sees source;
- contact status;
- trial status;
- conversion to student.

Website UI should not depend on Sova Hub availability.

---

# 46. Definition of Done

A feature is done when:
- responsive;
- accessible;
- typed;
- localized;
- no duplicated business constants;
- tests added where logic exists;
- no console errors;
- no secret leaks;
- mobile checked;
- feature flag behavior correct;
- build passes.

---

# 47. Agent completion rule

Do not stop after generating visual sections.

The MVP is complete only when:
- lead flow works end-to-end;
- Telegram receives test lead;
- fallback UX exists;
- prices are correct;
- UA/EN work;
- SEO metadata exists;
- mobile is polished;
- tests/build pass.

When missing real media, ship a **preview/development build**, not a fake production page.
