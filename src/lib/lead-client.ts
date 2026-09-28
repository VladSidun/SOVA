import type { LeadPayload } from "@/types/lead";

export type SubmitLead = (payload: LeadPayload) => Promise<void>;
export type GetTurnstileToken = () => Promise<string>;

export async function submitLeadToApi(payload: LeadPayload) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Lead API request failed");
  }
}

export async function getEmptyTurnstileToken() {
  // A real widget can inject its client token provider here. Verification is Phase 5.
  return "";
}
