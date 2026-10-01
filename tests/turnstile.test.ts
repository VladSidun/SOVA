import { describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

describe("Turnstile server verification", () => {
  it("posts the secret and token to Siteverify and accepts success only", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    await expect(verifyTurnstile({
      secretKey: "private-secret",
      token: "client-token",
      fetchImpl,
    })).resolves.toBe("valid");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("secret")).toBe("private-secret");
    expect((init?.body as FormData).get("response")).toBe("client-token");
  });

  it("rejects an unsuccessful verification response", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), {
        status: 200,
      }),
    );

    await expect(verifyTurnstile({
      secretKey: "private-secret",
      token: "invalid-token",
      fetchImpl,
    })).resolves.toBe("invalid");
  });

  it("reports upstream failures as unavailable without throwing raw data", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new Error("secret upstream detail"));

    await expect(verifyTurnstile({
      secretKey: "private-secret",
      token: "client-token",
      fetchImpl,
    })).resolves.toBe("unavailable");
  });
});
