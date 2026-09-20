import { sectionIds } from "@/config/navigation";
import type { LeadGoal } from "@/types/lead";

export const leadGoalQueryParam = "goal";
export const leadTargetId = sectionIds.lead;

const validLeadGoals = new Set<LeadGoal>([
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
]);

export function isLeadGoal(value: string | null): value is LeadGoal {
  return value !== null && validLeadGoals.has(value as LeadGoal);
}

export function buildLeadGoalHref(goal: LeadGoal): `?goal=${LeadGoal}#${typeof leadTargetId}` {
  return `?${leadGoalQueryParam}=${goal}#${leadTargetId}`;
}
