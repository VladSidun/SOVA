import type { Locale } from "./content";

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

export type Audience = "child" | "school_student" | "university_student" | "adult";
export type StudyMode = "offline" | "online" | "unsure";
export type ContactMethod = "call" | "telegram" | "viber" | "whatsapp";

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
  locale: Locale;
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
