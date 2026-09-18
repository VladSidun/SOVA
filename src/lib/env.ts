import "server-only";
import { parseServerEnv } from "./env-schema";

// Lazy by design: Phase 0 works without credentials for later integrations.
export function getServerEnv() {
  return parseServerEnv({
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  });
}
