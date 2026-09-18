import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/public-env";
import { parseServerEnv } from "@/lib/env-schema";

describe("environment scaffolding", () => {
  it("starts locally without external credentials and accepts blank optional keys", () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_GA_ID: "" }).NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(parseServerEnv({ TELEGRAM_BOT_TOKEN: "", TELEGRAM_CHAT_ID: "", TURNSTILE_SECRET_KEY: "" })).toEqual({
      TELEGRAM_BOT_TOKEN: undefined, TELEGRAM_CHAT_ID: undefined, TURNSTILE_SECRET_KEY: undefined,
    });
  });

  it("rejects invalid site URLs", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" })).toThrow("NEXT_PUBLIC_SITE_URL");
  });

  it("never returns server credentials from the public parser", () => {
    const publicEnv = parsePublicEnv({ TELEGRAM_BOT_TOKEN: "test-token", TURNSTILE_SECRET_KEY: "test-secret" });
    expect(publicEnv).not.toHaveProperty("TELEGRAM_BOT_TOKEN");
    expect(publicEnv).not.toHaveProperty("TURNSTILE_SECRET_KEY");
  });

  it("rejects partial Telegram configuration without echoing its value", () => {
    expect(() => parseServerEnv({ TELEGRAM_BOT_TOKEN: "test-private-value" })).toThrow("TELEGRAM_BOT_TOKEN");
    expect(() => parseServerEnv({ TELEGRAM_BOT_TOKEN: "test-private-value" })).not.toThrow("test-private-value");
  });
});
