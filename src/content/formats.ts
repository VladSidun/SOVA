import type { FormatContent } from "@/types/content";

// Verified numeric facts remain in business/pricing config. This file controls
// only localized presentation and which fact rows each card renders.
export const formats: readonly FormatContent[] = [
  {
    id: "group",
    title: { uk: "Групове", en: "Group" },
    description: {
      uk: "Мала група для регулярної практики й взаємодії.",
      en: "A small group for regular practice and interaction.",
    },
    details: ["groupSize", "duration", "frequency", "modes"],
  },
  {
    id: "pair",
    title: { uk: "Парне", en: "Pair" },
    description: {
      uk: "Двоє студентів і достатньо часу для живого speaking.",
      en: "Two learners with plenty of room for active speaking.",
    },
    details: ["pairSize", "duration", "frequency", "modes"],
  },
  {
    id: "individual",
    title: { uk: "Індивідуальне", en: "Individual" },
    description: {
      uk: "Персональний темп і програма навколо вашої цілі.",
      en: "A personal pace and programme built around your goal.",
    },
    details: ["personalPlan", "duration", "modes"],
  },
] as const;
