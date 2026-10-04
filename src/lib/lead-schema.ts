import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

const audienceValues = ["child", "school_student", "university_student", "adult"] as const;
const goalValues = [
  "school",
  "speaking",
  "nmt",
  "evi",
  "ielts",
  "fce",
  "toefl",
  "it",
  "business",
  "professional",
  "study_abroad",
  "work_abroad",
  "relocation",
  "other",
] as const;
const studyModeValues = ["offline", "online", "unsure"] as const;
const contactMethodValues = ["call", "telegram", "viber", "whatsapp"] as const;

type ValidationMessages = {
  audience: string;
  goals: string;
  studyMode: string;
  name: string;
  phone: string;
  contactMethod: string;
  consent: string;
  ageOrGrade: string;
  comment: string;
};

const validationMessages: Record<"uk" | "en", ValidationMessages> = {
  uk: {
    audience: "Оберіть, хто буде навчатися.",
    goals: "Оберіть принаймні одну ціль.",
    studyMode: "Оберіть формат навчання.",
    name: "Вкажіть ім’я: від 2 до 80 символів.",
    phone: "Вкажіть коректний номер телефону.",
    contactMethod: "Оберіть зручний спосіб зв’язку.",
    consent: "Підтвердьте згоду на обробку контактних даних.",
    ageOrGrade: "Вік або клас має містити не більше 40 символів.",
    comment: "Коментар має містити не більше 500 символів.",
  },
  en: {
    audience: "Choose who will be studying.",
    goals: "Choose at least one goal.",
    studyMode: "Choose a study mode.",
    name: "Enter a name between 2 and 80 characters.",
    phone: "Enter a valid phone number.",
    contactMethod: "Choose how you would like us to contact you.",
    consent: "Confirm that we may use your contact details.",
    ageOrGrade: "Age or school year must be no longer than 40 characters.",
    comment: "Comment must be no longer than 500 characters.",
  },
};

export function sanitizeLeadText(value: string) {
  return Array.from(value)
    .map((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127 ? " " : character;
    })
    .join("")
    .trim();
}

function optionalText(maxLength: number, message: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const sanitized = sanitizeLeadText(value);
      return sanitized === "" ? undefined : sanitized;
    },
    z.string().max(maxLength, message).optional(),
  );
}

function phoneSchema(message: string) {
  return z.preprocess(
    (value) => (typeof value === "string" ? sanitizeLeadText(value) : value),
    z
      .string()
      .min(7, message)
      .max(40, message)
      .refine((value) => parsePhoneNumberFromString(value, "UA")?.isValid() === true, message)
      .transform((value) => String(parsePhoneNumberFromString(value, "UA")!.number)),
  );
}

export function createLeadFormSchema(locale: "uk" | "en") {
  const messages = validationMessages[locale];

  return z.object({
    audience: z.enum(audienceValues, { error: messages.audience }),
    ageOrGrade: optionalText(40, messages.ageOrGrade),
    goals: z.array(z.enum(goalValues)).min(1, messages.goals),
    studyMode: z.enum(studyModeValues, { error: messages.studyMode }),
    name: z.preprocess(
      (value) => (typeof value === "string" ? sanitizeLeadText(value) : value),
      z.string().min(2, messages.name).max(80, messages.name),
    ),
    phone: phoneSchema(messages.phone),
    contactMethod: z.enum(contactMethodValues, { error: messages.contactMethod }),
    comment: optionalText(500, messages.comment),
    consent: z
      .boolean()
      .refine((value) => value, messages.consent)
      .transform(() => true as const),
  });
}

const optionalAttributionValue = z.preprocess(
  (value) => (typeof value === "string" ? sanitizeLeadText(value) : value),
  z.string().min(1).max(2048).optional(),
);

export const attributionSchema = z.object({
  source: optionalAttributionValue,
  medium: optionalAttributionValue,
  campaign: optionalAttributionValue,
  content: optionalAttributionValue,
  term: optionalAttributionValue,
  referrer: optionalAttributionValue,
  landingUrl: optionalAttributionValue,
}).strict();

export function createLeadPayloadSchema(locale: "uk" | "en") {
  return createLeadFormSchema(locale).extend({
    locale: z.enum(["uk", "en"]),
    attribution: attributionSchema,
    pageUrl: z.string().url().max(2048),
    turnstileToken: z.string().max(2048),
  });
}

export function createServerLeadPayloadSchema(locale: "uk" | "en") {
  return createLeadPayloadSchema(locale)
    .extend({ turnstileToken: z.string().trim().min(1).max(2048) })
    .strict();
}

export type LeadFormInput = z.input<ReturnType<typeof createLeadFormSchema>>;
export type LeadFormData = z.output<ReturnType<typeof createLeadFormSchema>>;
