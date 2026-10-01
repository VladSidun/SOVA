import type { LeadPayload } from "@/types/lead";
import type { PublicLeadErrorCode } from "@/lib/lead-api";

export type SubmitLead = (payload: LeadPayload) => Promise<void>;
export type GetTurnstileToken = () => Promise<string>;

export class LeadApiError extends Error {
  readonly code?: PublicLeadErrorCode;

  constructor(code?: PublicLeadErrorCode) {
    super("Lead API request failed");
    this.name = "LeadApiError";
    this.code = code;
  }
}

export async function submitLeadToApi(payload: LeadPayload) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let code: PublicLeadErrorCode | undefined;
    try {
      const body = (await response.json()) as { code?: unknown };
      if (typeof body.code === "string") code = body.code as PublicLeadErrorCode;
    } catch {
      // The UI deliberately treats malformed or network-layer errors generically.
    }
    throw new LeadApiError(code);
  }
}

export async function getEmptyTurnstileToken() {
  return "";
}
