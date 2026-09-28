import type { LeadDestination } from "@/lib/lead-destination";
import type { Audience, ContactMethod, LeadGoal, NormalizedLead, StudyMode } from "@/types/lead";

const audienceLabels: Record<Audience, string> = {
  child: "Дитина",
  school_student: "Школяр",
  university_student: "Студент",
  adult: "Дорослий",
};

const goalLabels: Record<LeadGoal, string> = {
  school: "Шкільна англійська",
  speaking: "Speaking",
  nmt: "НМТ",
  evi: "ЄВІ",
  ielts: "IELTS",
  fce: "FCE",
  toefl: "TOEFL",
  it: "IT English",
  business: "Business / робота",
  professional: "Professional English",
  study_abroad: "Навчання за кордоном",
  work_abroad: "Робота за кордоном",
  relocation: "Переїзд",
  other: "Інше",
};

const studyModeLabels: Record<StudyMode, string> = {
  offline: "Офлайн",
  online: "Онлайн",
  unsure: "Не визначено",
};

const contactMethodLabels: Record<ContactMethod, string> = {
  call: "Телефонний дзвінок",
  telegram: "Telegram",
  viber: "Viber",
  whatsapp: "WhatsApp",
};

export function escapeTelegramHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function field(value: string | undefined, maxLength = 500) {
  if (!value) return "—";
  const truncated = value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
  return escapeTelegramHtml(truncated);
}

export function formatTelegramLead(lead: NormalizedLead) {
  return [
    "🆕 <b>Нова заявка SOVA</b>",
    "",
    `👤 <b>Ім’я:</b> ${field(lead.name, 80)}`,
    `📞 <b>Телефон:</b> ${field(lead.phone, 40)}`,
    `🎓 <b>Хто:</b> ${field(audienceLabels[lead.audience])}`,
    `📚 <b>Вік / клас:</b> ${field(lead.ageOrGrade, 40)}`,
    `🎯 <b>Ціль:</b> ${field(lead.goals.map((goal) => goalLabels[goal]).join(", "), 500)}`,
    `📍 <b>Формат:</b> ${field(studyModeLabels[lead.studyMode])}`,
    `💬 <b>Зв’язок:</b> ${field(contactMethodLabels[lead.contactMethod])}`,
    `📝 <b>Коментар:</b> ${field(lead.comment, 500)}`,
    "",
    `🌐 <b>Locale:</b> ${field(lead.locale, 2)}`,
    `📣 <b>Source:</b> ${field(lead.attribution.source, 200)}`,
    `🔗 <b>Medium:</b> ${field(lead.attribution.medium, 200)}`,
    `🏷 <b>Campaign:</b> ${field(lead.attribution.campaign, 200)}`,
    `🧩 <b>Content:</b> ${field(lead.attribution.content, 200)}`,
    `🔎 <b>Term:</b> ${field(lead.attribution.term, 200)}`,
    `↩️ <b>Referrer:</b> ${field(lead.attribution.referrer, 300)}`,
    `🚪 <b>Landing:</b> ${field(lead.attribution.landingUrl, 500)}`,
    `🕒 <b>Time:</b> ${field(lead.receivedAt, 40)}`,
  ].join("\n");
}

type TelegramLeadDestinationOptions = {
  botToken: string;
  chatId: string;
  fetchImpl?: typeof fetch;
};

export class TelegramLeadDestination implements LeadDestination {
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ botToken, chatId, fetchImpl = fetch }: TelegramLeadDestinationOptions) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.fetchImpl = fetchImpl;
  }

  async send(lead: NormalizedLead) {
    try {
      const response = await this.fetchImpl(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            chat_id: this.chatId,
            text: formatTelegramLead(lead),
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        },
      );
      if (!response.ok) throw new Error("Telegram delivery failed");

      const result = (await response.json()) as { ok?: unknown };
      if (result.ok !== true) throw new Error("Telegram delivery failed");
    } catch {
      throw new Error("Telegram delivery failed");
    }
  }
}
