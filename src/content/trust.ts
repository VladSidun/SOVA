import { business, unverifiedClaims } from "@/config/business";
import type { Locale } from "@/types/content";

export function getTrustStats(locale: Locale, showEightYearsStat: boolean) {
  if (locale === "uk") {
    return [
      showEightYearsStat
        ? `${unverifiedClaims.yearsOfExperience} років досвіду`
        : `Працюємо з ${business.foundedYear} року`,
      `${business.currentStudents} студентів зараз`,
      `${business.lifetimeStudents} студентів за весь час`,
      "Offline + Online",
    ] as const;
  }

  return [
    showEightYearsStat
      ? `${unverifiedClaims.yearsOfExperience} years of experience`
      : `Teaching since ${business.foundedYear}`,
    `${business.currentStudents} students learning now`,
    `${business.lifetimeStudents} students taught to date`,
    "Offline + Online",
  ] as const;
}
