import type { FAQItem } from "@/types/content";

export const faq: readonly FAQItem[] = [
  {
    id: "trial",
    question: {
      uk: "Що відбувається на безкоштовному пробному?",
      en: "What happens during the free trial?",
    },
    answer: {
      uk: "За 45 хвилин ми знайомимось, тестуємо знання, визначаємо рівень і проводимо коротку мовну діагностику. Після цього підбираємо програму під вашу ціль, рівень і дедлайн, обговорюємо графік, формати та ціни. Для офлайн-формату також показуємо школу й матеріали.",
      en: "In 45 minutes, we meet, assess your knowledge, identify your level and complete a short language diagnosis. We then match a programme to your goal, level and deadline, and discuss the schedule, formats and pricing. In-person visitors also see the school and materials.",
    },
  },
  {
    id: "trial-host",
    question: {
      uk: "Хто проводить пробний урок?",
      en: "Who leads the trial lesson?",
    },
    answer: {
      uk: "Пробний проводить викладач, який потенційно буде з вами працювати, або адміністратор / головний викладач. Це залежить від вашої цілі, формату та розкладу.",
      en: "The session is led by a teacher who may work with you, or by an administrator / head teacher. It depends on your goal, format and schedule.",
    },
  },
  {
    id: "format",
    question: {
      uk: "Як обрати між груповим, парним та індивідуальним форматом?",
      en: "How do I choose between group, pair and individual lessons?",
    },
    answer: {
      uk: "Під час діагностики врахуємо ваш рівень, ціль, дедлайн, бажаний темп і бюджет. Після цього пояснимо різницю між форматами та порадимо доречний варіант — остаточне рішення залишається за вами.",
      en: "During the diagnosis, we consider your level, goal, deadline, preferred pace and budget. We then explain the differences and recommend a suitable format — the final choice remains yours.",
    },
  },
  {
    id: "schedule",
    question: {
      uk: "Як часто проходять заняття і скільки вони тривають?",
      en: "How often are lessons and how long do they last?",
    },
    answer: {
      uk: "Типове заняття триває 60–75 хвилин. Для групового та парного форматів звичайний ритм — 2–3 рази на тиждень; індивідуальний графік узгоджується окремо.",
      en: "A typical lesson lasts 60–75 minutes. Group and pair lessons usually run 2–3 times a week; individual schedules are agreed separately.",
    },
  },
  {
    id: "rescheduling",
    question: {
      uk: "Які правила перенесення занять?",
      en: "What is the lesson rescheduling policy?",
    },
    answer: {
      uk: "Умови залежать від формату навчання. Точні правила для групових, парних та індивідуальних занять адміністратор пояснить до початку навчання — ми не застосовуємо одне непідтверджене правило до всіх форматів.",
      en: "The terms depend on the study format. An administrator will explain the exact rules for group, pair and individual lessons before you begin; we do not present one unconfirmed rule as applying to every format.",
    },
  },
  {
    id: "location",
    question: {
      uk: "Де розташована SOVA і чи можна навчатися онлайн?",
      en: "Where is SOVA, and can I study online?",
    },
    answer: {
      uk: "Школа розташована в центрі Мукачева за адресою: площа Кирила і Мефодія, 26/11. Поруч є платна парковка. Усі основні формати також доступні онлайн.",
      en: "The school is at 26/11 Kyryla i Mefodiia Square in central Mukachevo, with paid parking nearby. All main study formats are also available online.",
    },
  },
];
