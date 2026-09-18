import { z } from "zod";

export const optionalEnvString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional(),
);

const httpUrl = z.url().refine((value) => /^https?:\/\//.test(value), {
  message: "Expected an HTTP(S) URL",
});

const optionalContactUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().refine((value) => /^(https?:|viber:|tg:)/.test(value), {
    message: "Expected an HTTP(S), Viber or Telegram URL",
  }).optional(),
);

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    httpUrl.default("http://localhost:3000"),
  ),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalEnvString,
  NEXT_PUBLIC_GA_ID: optionalEnvString,
  NEXT_PUBLIC_META_PIXEL_ID: optionalEnvString,
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: optionalEnvString,
  NEXT_PUBLIC_WHATSAPP_URL: optionalContactUrl,
  NEXT_PUBLIC_VIBER_URL: optionalContactUrl,
  NEXT_PUBLIC_TELEGRAM_URL: optionalContactUrl,
});

export function parsePublicEnv(raw: Record<string, unknown>) {
  const result = publicEnvSchema.safeParse(raw);
  if (!result.success) {
    // Do not serialize raw values, including accidental sensitive input.
    throw new Error(`Invalid public environment keys: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  }
  return result.data;
}

// Explicit references allow Next.js to inline only these public values.
export function getPublicEnv() {
  return parsePublicEnv({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    NEXT_PUBLIC_WHATSAPP_URL: process.env.NEXT_PUBLIC_WHATSAPP_URL,
    NEXT_PUBLIC_VIBER_URL: process.env.NEXT_PUBLIC_VIBER_URL,
    NEXT_PUBLIC_TELEGRAM_URL: process.env.NEXT_PUBLIC_TELEGRAM_URL,
  });
}
