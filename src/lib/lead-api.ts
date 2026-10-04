import type { LeadDestination } from "@/lib/lead-destination";
import { createServerLeadPayloadSchema } from "@/lib/lead-schema";
import type { TurnstileVerification } from "@/lib/turnstile";
import type { LeadPayload, NormalizedLead } from "@/types/lead";

export type PublicLeadErrorCode =
  | "INVALID_REQUEST"
  | "TURNSTILE_REJECTED"
  | "VERIFICATION_UNAVAILABLE"
  | "DELIVERY_FAILED"
  | "SERVICE_UNAVAILABLE";

type LeadApiDependencies = {
  destination: LeadDestination;
  verifyTurnstileToken: (token: string) => Promise<TurnstileVerification>;
  now?: () => Date;
};

function errorResponse(code: PublicLeadErrorCode, status: number) {
  return Response.json({ ok: false, code }, { status });
}

function payloadLocale(payload: unknown): LeadPayload["locale"] {
  if (typeof payload !== "object" || payload === null) return "uk";
  return Reflect.get(payload, "locale") === "en" ? "en" : "uk";
}

export async function handleLeadRequest(
  request: Request,
  { destination, verifyTurnstileToken, now = () => new Date() }: LeadApiDependencies,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", 400);
  }

  const parsed = createServerLeadPayloadSchema(payloadLocale(body)).safeParse(body);
  if (!parsed.success) return errorResponse("INVALID_REQUEST", 400);

  let verification: TurnstileVerification;
  try {
    verification = await verifyTurnstileToken(parsed.data.turnstileToken);
  } catch {
    return errorResponse("VERIFICATION_UNAVAILABLE", 503);
  }
  if (verification === "invalid") return errorResponse("TURNSTILE_REJECTED", 403);
  if (verification === "unavailable") return errorResponse("VERIFICATION_UNAVAILABLE", 503);

  const { turnstileToken, ...lead } = parsed.data;
  void turnstileToken;
  const normalizedLead: NormalizedLead = {
    ...lead,
    receivedAt: now().toISOString(),
  };

  try {
    await destination.send(normalizedLead);
  } catch {
    return errorResponse("DELIVERY_FAILED", 502);
  }

  return Response.json({ ok: true }, { status: 201 });
}

export function serviceUnavailableResponse() {
  return errorResponse("SERVICE_UNAVAILABLE", 503);
}
