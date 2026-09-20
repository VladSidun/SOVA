import type { routing } from "@/i18n/routing";

export type Locale = (typeof routing.locales)[number];
export type LocalizedString = Readonly<Record<Locale, string>>;
export type FormatId = "group" | "pair" | "individual";

export type Direction = {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  goals: readonly import("./lead").LeadGoal[];
  leadGoal: import("./lead").LeadGoal;
};

export type FormatDetail =
  | "groupSize"
  | "pairSize"
  | "personalPlan"
  | "frequency"
  | "duration"
  | "modes";

export type FormatContent = {
  id: FormatId;
  title: LocalizedString;
  description: LocalizedString;
  details: readonly FormatDetail[];
};

export type GoalOption = {
  id: import("./lead").LeadGoal;
  label: LocalizedString;
};

export type Teacher = {
  id: string;
  name: string;
  photo: string;
  experience: LocalizedString;
  specialties: readonly LocalizedString[];
  quote?: LocalizedString;
};

export type Review = {
  id: string;
  author: string;
  text: LocalizedString;
};

export type StudentCase = {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
};

export type FAQItem = {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
};
