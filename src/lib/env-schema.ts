import { z } from "zod";
import { optionalEnvString } from "./public-env";

export const serverEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: optionalEnvString,
  TELEGRAM_CHAT_ID: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().regex(/^-?\d+$/).optional(),
  ),
  TURNSTILE_SECRET_KEY: optionalEnvString,
}).refine(
  (env) => Boolean(env.TELEGRAM_BOT_TOKEN) === Boolean(env.TELEGRAM_CHAT_ID),
  { message: "Configure both Telegram keys or neither", path: ["TELEGRAM_BOT_TOKEN"] },
);

export function parseServerEnv(raw: Record<string, unknown>) {
  const result = serverEnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid server environment keys: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  }
  return result.data;
}
