import type { GoalOption } from "@/types/content";

export const goalOptions: readonly GoalOption[] = [
  { id: "school", label: { uk: "Шкільна англійська", en: "School English" } },
  { id: "speaking", label: { uk: "Speaking", en: "Speaking" } },
  { id: "nmt", label: { uk: "НМТ", en: "NMT" } },
  { id: "evi", label: { uk: "ЄВІ", en: "EVI" } },
  { id: "ielts", label: { uk: "IELTS", en: "IELTS" } },
  { id: "fce", label: { uk: "FCE", en: "FCE" } },
  { id: "toefl", label: { uk: "TOEFL", en: "TOEFL" } },
  { id: "it", label: { uk: "IT English", en: "IT English" } },
  { id: "business", label: { uk: "Business / робота", en: "Business / career" } },
  { id: "professional", label: { uk: "Професійна англійська", en: "Professional English" } },
  { id: "study_abroad", label: { uk: "Навчання за кордоном", en: "Study abroad" } },
  { id: "work_abroad", label: { uk: "Робота за кордоном", en: "Work abroad" } },
  { id: "relocation", label: { uk: "Переїзд", en: "Relocation" } },
  { id: "other", label: { uk: "Інша ціль", en: "Another goal" } },
] as const;
