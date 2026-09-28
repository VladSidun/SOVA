import type { LeadPayload } from "@/types/lead";

export type LeadAnalyticsEvent =
  | "trial_form_start"
  | "trial_form_step_complete"
  | "trial_form_submit"
  | "trial_form_success"
  | "trial_form_error";

export type LeadAnalyticsParams = {
  locale: LeadPayload["locale"];
  step?: 1 | 2 | 3;
  goalCount?: number;
  studyMode?: LeadPayload["studyMode"];
  contactMethod?: LeadPayload["contactMethod"];
};

export type TrackLeadEvent = (event: LeadAnalyticsEvent, params: LeadAnalyticsParams) => void;

export function toLeadAnalyticsParams(payload: LeadPayload): LeadAnalyticsParams {
  return {
    locale: payload.locale,
    goalCount: payload.goals.length,
    studyMode: payload.studyMode,
    contactMethod: payload.contactMethod,
  };
}

export const noopTrackLeadEvent: TrackLeadEvent = () => undefined;
