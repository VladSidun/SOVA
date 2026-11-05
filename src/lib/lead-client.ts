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
    // Both upstream calls have an 8s server timeout; allow transport overhead,
    // then release the pending UI into the existing contact fallback. No retry.
    signal: AbortSignal.timeout(25_000),
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new LeadApiError();
  }
  const result = typeof body === "object" && body !== null ? body : {};
  if (!response.ok) {
    const code = "code" in result && typeof result.code === "string"
      ? result.code as PublicLeadErrorCode : undefined;
    throw new LeadApiError(code);
  }
  if (!("ok" in result) || result.ok !== true) {
    throw new LeadApiError();
  }
}

export async function getEmptyTurnstileToken() {
  return "";
}
