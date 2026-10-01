import type { NormalizedLead } from "@/types/lead";

export interface LeadDestination {
  send(lead: NormalizedLead): Promise<void>;
}

/**
 * Reserved extension points only. Automated delivery is intentionally absent
 * until official APIs and business credentials are approved.
 */
export type ReservedLeadDestinationName =
  | "WhatsAppLeadDestination"
  | "ViberLeadDestination"
  | "SovaHubLeadDestination";
