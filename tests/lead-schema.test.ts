import { describe, expect, it } from "vitest";
import { createLeadPayloadSchema } from "@/lib/lead-schema";

const validLead = {
  audience: "adult",
  ageOrGrade: "",
  goals: ["speaking"],
  studyMode: "online",
  name: " Олена ",
  phone: "099 123 45 67",
  contactMethod: "telegram",
  comment: " Хочу покращити speaking. ",
  consent: true,
  locale: "uk",
  attribution: {
    source: "google",
    campaign: "autumn",
    landingUrl: "https://sova.example/uk?utm_source=google",
  },
  pageUrl: "https://sova.example/uk",
  turnstileToken: "client-token",
} as const;

describe("shared lead payload schema", () => {
  it("accepts a valid lead, sanitizes text and normalizes the phone to E.164", () => {
    const result = createLeadPayloadSchema("uk").parse(validLead);

    expect(result).toMatchObject({
      name: "Олена",
      phone: "+380991234567",
      comment: "Хочу покращити speaking.",
      consent: true,
    });
    expect(result.ageOrGrade).toBeUndefined();
  });

  it("rejects an invalid phone", () => {
    const result = createLeadPayloadSchema("uk").safeParse({ ...validLead, phone: "123" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "phone")).toBe(true);
  });

  it("requires at least one goal", () => {
    const result = createLeadPayloadSchema("uk").safeParse({ ...validLead, goals: [] });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "goals")).toBe(true);
  });

  it("requires a contact method", () => {
    const withoutContactMethod = Object.fromEntries(
      Object.entries(validLead).filter(([key]) => key !== "contactMethod"),
    );
    const result = createLeadPayloadSchema("uk").safeParse(withoutContactMethod);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "contactMethod")).toBe(true);
  });

  it("requires explicit consent", () => {
    const result = createLeadPayloadSchema("uk").safeParse({ ...validLead, consent: false });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "consent")).toBe(true);
  });
});
