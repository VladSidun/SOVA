import { getServerEnv } from "@/lib/env";
import { handleLeadRequest, serviceUnavailableResponse } from "@/lib/lead-api";
import { TelegramLeadDestination } from "@/lib/telegram";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let env: ReturnType<typeof getServerEnv>;
  try {
    env = getServerEnv();
  } catch {
    return serviceUnavailableResponse();
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TURNSTILE_SECRET_KEY } = env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !TURNSTILE_SECRET_KEY) {
    return serviceUnavailableResponse();
  }

  return handleLeadRequest(request, {
    destination: new TelegramLeadDestination({
      botToken: TELEGRAM_BOT_TOKEN,
      chatId: TELEGRAM_CHAT_ID,
    }),
    verifyTurnstileToken: (token) =>
      verifyTurnstile({ secretKey: TURNSTILE_SECRET_KEY, token }),
  });
}
