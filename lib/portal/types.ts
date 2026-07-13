/** Shared types for the website client portal. Mirrors the `portal_*` tables
 * (docs/CLIENT-ACCOUNTS.md). */

export interface PortalProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  contactId: string | null;
  createdAt: string;
}

export type ActivityType =
  | "view_listing"
  | "save_listing"
  | "unsave_listing"
  | "save_search"
  | "remove_search"
  | "view_search"
  | "open_photos"
  | "generate_report"
  | "view_report"
  | "recalc_report"
  | "raise_hand";

export interface PortalActivityRow {
  id: string;
  type: ActivityType | string;
  listingId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}
