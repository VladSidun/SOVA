const turnstileSiteverifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerification = "valid" | "invalid" | "unavailable";

type VerifyTurnstileOptions = {
  secretKey: string;
  token: string;
  fetchImpl?: typeof fetch;
};

type TurnstileResponse = {
  success?: unknown;
};

export async function verifyTurnstile({
  secretKey,
  token,
  fetchImpl = fetch,
}: VerifyTurnstileOptions): Promise<TurnstileVerification> {
  if (token.length === 0 || token.length > 2048) return "invalid";

  const body = new FormData();
  body.set("secret", secretKey);
  body.set("response", token);

  try {
    const response = await fetchImpl(turnstileSiteverifyUrl, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return "unavailable";

    const result = (await response.json()) as TurnstileResponse;
    return result.success === true ? "valid" : "invalid";
  } catch {
    return "unavailable";
  }
}
