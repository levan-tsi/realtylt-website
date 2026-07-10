/** Lead-capture types — every form on the site funnels into this payload (brief §5B). */

import type { InterestReason } from "@/lib/site";

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  interestReason: InterestReason;
  /** Page path the lead came from, e.g. "/selling". */
  source: string;
  /** ISO timestamp, set server-side. */
  timestamp: string;
  /** Optional property address (home-value / cash-offer forms). */
  address?: string;
}

export interface LeadResult {
  ok: boolean;
  /** True when CRM_LEAD_WEBHOOK is not configured and the lead was logged locally instead. */
  stub?: boolean;
  error?: string;
}
