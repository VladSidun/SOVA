import { afterEach, describe, expect, it, vi } from "vitest";
import { LeadApiError, submitLeadToApi } from "@/lib/lead-client";
import type { LeadPayload } from "@/types/lead";

const payload: LeadPayload = {
  audience: "adult", goals: ["speaking"], studyMode: "online",
  name: "QA Preview", phone: "+380991234567", contactMethod: "call",
  consent: true, locale: "en", attribution: {},
  pageUrl: "https://sova.example/en", turnstileToken: "test-token",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("lead delivery acknowledgement", () => {
  it("accepts an explicit API acknowledgement", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(submitLeadToApi(payload)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([{}, { ok: false }, { ok: "true" }, null])("rejects a false acknowledgement: %j", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
    await expect(submitLeadToApi(payload)).rejects.toBeInstanceOf(LeadApiError);
  });

  it("rejects a gateway HTML page without displaying its body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<h1>private upstream detail</h1>")));
    await expect(submitLeadToApi(payload)).rejects.toThrow("Lead API request failed");
  });

  it("preserves the controlled API error code", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: false, code: "DELIVERY_FAILED" }, { status: 502 })));
    await expect(submitLeadToApi(payload)).rejects.toMatchObject({ code: "DELIVERY_FAILED" });
  });

  it("bounds a stalled request and does not automatically retry", async () => {
    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Timed out", "TimeoutError")), { once: true });
    }));
    vi.stubGlobal("fetch", fetchMock);
    const request = submitLeadToApi(payload);
    const rejected = expect(request).rejects.toThrow("Timed out");
    controller.abort();
    await rejected;
    expect(timeout).toHaveBeenCalledWith(25_000);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
