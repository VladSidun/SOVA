import { describe, expect, it, vi } from "vitest";
import { escapeTelegramHtml, formatTelegramLead, TelegramLeadDestination } from "@/lib/telegram";
import type { NormalizedLead } from "@/types/lead";

const lead: NormalizedLead = {
  audience: "adult",
  goals: ["speaking", "business"],
  studyMode: "online",
  name: "<Олена & Co>",
  phone: "+380991234567",
  contactMethod: "telegram",
  comment: "Хочу <b>швидко</b> & безпечно",
  consent: true,
  locale: "uk",
  attribution: {
    source: "social<script>",
    campaign: "autumn & winter",
  },
  pageUrl: "https://sova.example/uk",
  receivedAt: "2026-09-29T10:00:00.000Z",
};

describe("TelegramLeadDestination", () => {
  it.each([
    ["2026-01-15T10:00:00.000Z", "15.01.2026, 12:00"],
    ["2026-07-15T10:00:00.000Z", "15.07.2026, 13:00"],
    ["2026-10-01T21:30:00.000Z", "02.10.2026, 00:30"],
  ])("shows %s as Kyiv time", (receivedAt, expected) => {
    const message = formatTelegramLead({ ...lead, receivedAt });

    expect(message).toContain(`🕒 <b>Час (Київ):</b> ${expected}`);
    expect(message).not.toContain(receivedAt);
  });

  it("escapes every user-controlled HTML field in the structured message", () => {
    expect(escapeTelegramHtml("<&>")).toBe("&lt;&amp;&gt;");

    const message = formatTelegramLead(lead);
    expect(message).toContain("🆕 <b>Нова заявка SOVA</b>");
    expect(message).toContain("&lt;Олена &amp; Co&gt;");
    expect(message).toContain("Хочу &lt;b&gt;швидко&lt;/b&gt; &amp; безпечно");
    expect(message).toContain("social&lt;script&gt;");
    expect(message).not.toContain("<Олена");
    expect(message).not.toContain("Хочу <b>швидко</b>");
  });

  it("sends one HTML message without putting credentials in the body", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const destination = new TelegramLeadDestination({
      botToken: "private-bot-token",
      chatId: "-100123",
      fetchImpl,
    });

    await destination.send(lead);

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0];
    const body = String(init?.body);
    expect(url).toBe("https://api.telegram.org/botprivate-bot-token/sendMessage");
    expect(JSON.parse(body)).toMatchObject({
      chat_id: "-100123",
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    expect(body).not.toContain("private-bot-token");
  });
});
