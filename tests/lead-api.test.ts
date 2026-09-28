import { describe, expect, it, vi } from "vitest";
import { handleLeadRequest } from "@/lib/lead-api";
import type { LeadDestination } from "@/lib/lead-destination";

const validLead = {
  audience: "adult",
  goals: ["speaking"],
  studyMode: "online",
  name: " Олена ",
  phone: "099 123 45 67",
  contactMethod: "telegram",
  comment: " Після 18:00 ",
  consent: true,
  locale: "uk",
  attribution: { source: "google", campaign: "autumn" },
  pageUrl: "https://sova.example/uk",
  turnstileToken: "turnstile-client-token",
};

function leadRequest(payload: unknown = validLead) {
  return new Request("https://sova.example/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function mockDestination() {
  return { send: vi.fn<LeadDestination["send"]>().mockResolvedValue(undefined) };
}

describe("POST /api/leads handler", () => {
  it("validates, normalizes and sends a valid request exactly once", async () => {
    const destination = mockDestination();
    const verifyTurnstileToken = vi.fn().mockResolvedValue("valid");

    const response = await handleLeadRequest(leadRequest(), {
      destination,
      verifyTurnstileToken,
      now: () => new Date("2026-09-29T10:00:00.000Z"),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(verifyTurnstileToken).toHaveBeenCalledOnce();
    expect(verifyTurnstileToken).toHaveBeenCalledWith("turnstile-client-token");
    expect(destination.send).toHaveBeenCalledOnce();
    expect(destination.send).toHaveBeenCalledWith(expect.objectContaining({
      name: "Олена",
      phone: "+380991234567",
      comment: "Після 18:00",
      receivedAt: "2026-09-29T10:00:00.000Z",
    }));
    expect(destination.send.mock.calls[0][0]).not.toHaveProperty("turnstileToken");
  });

  it("returns 400 for an invalid payload without verifying or sending", async () => {
    const destination = mockDestination();
    const verifyTurnstileToken = vi.fn().mockResolvedValue("valid");

    const response = await handleLeadRequest(leadRequest({ ...validLead, phone: "123" }), {
      destination,
      verifyTurnstileToken,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "INVALID_REQUEST" });
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
    expect(destination.send).not.toHaveBeenCalled();
  });

  it("rejects an invalid Turnstile token without sending", async () => {
    const destination = mockDestination();

    const response = await handleLeadRequest(leadRequest(), {
      destination,
      verifyTurnstileToken: vi.fn().mockResolvedValue("invalid"),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, code: "TURNSTILE_REJECTED" });
    expect(destination.send).not.toHaveBeenCalled();
  });

  it("maps destination failure to a controlled fallback response", async () => {
    const privateUpstreamMessage = "Telegram said token=private-bot-token chat=-100000";
    const destination = {
      send: vi.fn<LeadDestination["send"]>().mockRejectedValue(new Error(privateUpstreamMessage)),
    };

    const response = await handleLeadRequest(leadRequest(), {
      destination,
      verifyTurnstileToken: vi.fn().mockResolvedValue("valid"),
    });
    const body = JSON.stringify(await response.json());

    expect(response.status).toBe(502);
    expect(body).toBe('{"ok":false,"code":"DELIVERY_FAILED"}');
    expect(body).not.toContain(privateUpstreamMessage);
    expect(body).not.toContain("private-bot-token");
    expect(body).not.toContain(validLead.turnstileToken);
  });

  it("returns a controlled response when Turnstile is unavailable", async () => {
    const destination = mockDestination();

    const response = await handleLeadRequest(leadRequest(), {
      destination,
      verifyTurnstileToken: vi.fn().mockResolvedValue("unavailable"),
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      code: "VERIFICATION_UNAVAILABLE",
    });
    expect(destination.send).not.toHaveBeenCalled();
  });

  it("maps an unexpected Turnstile exception to the same controlled response", async () => {
    const destination = mockDestination();

    const response = await handleLeadRequest(leadRequest(), {
      destination,
      verifyTurnstileToken: vi.fn().mockRejectedValue(new Error("private upstream detail")),
    });
    const body = JSON.stringify(await response.json());

    expect(response.status).toBe(503);
    expect(body).toBe('{"ok":false,"code":"VERIFICATION_UNAVAILABLE"}');
    expect(body).not.toContain("private upstream detail");
    expect(destination.send).not.toHaveBeenCalled();
  });
});
