/** Lead-capture types — every form on the site funnels into this payload (brief §5B). */

import type { InterestReason } from "@/lib/site";
import type { ContactConsent } from "./consent";

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
  /** Structured name parts. Derived server-side: sent directly by the split-name forms, or
   * parsed from a single "Full Name" field (the /selling hero). Present only when known. */
  firstName?: string;
  lastName?: string;
  /** Structured address parts parsed server-side from `address` (home contact-3 + /selling
   * hero behavior spec). Each is best-effort and omitted when it can't be determined. */
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  /** Optional qualifying-wizard answers (the /selling post-submit popup). Free-form
   * short strings — also folded into `message` so they show in any plain CRM view. */
  qualifier?: Record<string, string>;
  /** Saved searches this person wants listing alerts for.
   *
   * A visitor with an account gets a real row in `portal_saved_searches` and the CRM picks it
   * up from the `listing_alert_subscriptions` view. A visitor WITHOUT an account keeps their
   * saved searches in localStorage, where the CRM can never see them — so when they ask for
   * alerts, the searches travel with the lead. Without this the site would be asking for an
   * email address to power something it had given the CRM no way to act on. */
  savedSearches?: SavedSearchRequest[];
  /** Permission to call or text this number, with the proof of it. Present on every lead that
   * carries a phone number, INCLUDING when it was declined — "they were asked and said no" is
   * a thing the CRM needs to know before someone presses dial, and an absent field cannot say
   * it. See lib/leads/consent.ts for what the law actually requires here. */
  consent?: ContactConsent;
}

export interface SavedSearchRequest {
  /** What the visitor named it. */
  label: string;
  /** The raw /search query string, so the CRM can link straight to the results. */
  query: string;
  /** The same structured criteria stored on an account's saved search (lib/idx/criteria). */
  criteria: Record<string, string | number | boolean>;
}

export interface LeadResult {
  ok: boolean;
  /** True when CRM_LEAD_WEBHOOK is not configured and the lead was logged locally instead. */
  stub?: boolean;
  error?: string;
}
