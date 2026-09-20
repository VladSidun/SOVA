import type { Direction } from "@/types/content";

export const directions: readonly Direction[] = [
  {
    id: "school",
    title: { uk: "Школа та впевнена база", en: "School English and a strong foundation" },
    description: {
      uk: "База, speaking, успішність і підготовка до контрольних або вступу.",
      en: "Build core skills, speaking confidence, school performance and test readiness.",
    },
    goals: ["school"],
    leadGoal: "school",
  },
  {
    id: "entrance-exams",
    title: { uk: "НМТ / ЄВІ", en: "NMT / EVI entrance exams" },
    description: {
      uk: "План під ваш рівень, формат і термін до іспиту.",
      en: "A plan shaped around your level, study format and exam deadline.",
    },
    goals: ["nmt", "evi"],
    leadGoal: "nmt",
  },
  {
    id: "international-exams",
    title: { uk: "IELTS / FCE / TOEFL", en: "IELTS / FCE / TOEFL" },
    description: {
      uk: "Індивідуальна траєкторія під рівень і потрібний результат.",
      en: "A focused path based on your current level and target outcome.",
    },
    goals: ["ielts", "fce", "toefl"],
    leadGoal: "ielts",
  },
  {
    id: "professional",
    title: { uk: "IT & Professional English", en: "IT & Professional English" },
    description: {
      uk: "Англійська для IT, юриспруденції та інших професійних сфер.",
      en: "English for IT, law and other professional contexts.",
    },
    goals: ["it", "professional"],
    leadGoal: "it",
  },
  {
    id: "business",
    title: { uk: "Business & Career English", en: "Business & Career English" },
    description: {
      uk: "Робоче спілкування, співбесіди та наступний кар’єрний крок.",
      en: "Work communication, interviews and your next career step.",
    },
    goals: ["business"],
    leadGoal: "business",
  },
  {
    id: "abroad",
    title: {
      uk: "Навчання / робота / переїзд за кордон",
      en: "Study, work or relocation abroad",
    },
    description: {
      uk: "Мова для навчання, роботи та впевненого життя в новому середовищі.",
      en: "Practical English for studying, working and settling into a new country.",
    },
    goals: ["study_abroad", "work_abroad", "relocation"],
    leadGoal: "relocation",
  },
  {
    id: "speaking",
    title: { uk: "Speaking & English for life", en: "Speaking & English for life" },
    description: {
      uk: "Впевнене спілкування, словниковий запас, подорожі й щоденні ситуації.",
      en: "Confident communication, useful vocabulary, travel and everyday life.",
    },
    goals: ["speaking"],
    leadGoal: "speaking",
  },
] as const;
