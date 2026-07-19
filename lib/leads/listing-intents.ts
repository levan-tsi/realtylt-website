/** Pure builders for the listing-detail "Schedule a tour" / "Make an offer" lead payloads.
 * Kept out of the React component so the CRM contract (the `qualifier` shape the webhook
 * receives) is unit-testable without a DOM. See components/leads/ListingLeadCTAs.tsx. */

export interface ListingIntent {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  mlsNumber: string;
}

/** Full one-line address stored on the lead (`address` field). */
export function fullAddress(l: Pick<ListingIntent, "address" | "city" | "state" | "zip">): string {
  return `${l.address}, ${l.city}, ${l.state} ${l.zip}`;
}

/** Digits-only string -> "$1,400,000" (empty when no amount). */
export function formatOffer(digits: string): string {
  const n = Number(digits) || 0;
  return n ? `$${n.toLocaleString("en-US")}` : "";
}

/** `qualifier` for a tour request — folded into the lead message by parseLead. */
export function tourQualifier(o: {
  mlsNumber: string;
  tourType: string;
  date: string;
  time: string;
}): Record<string, string> {
  return {
    intent: "Schedule a tour",
    listing: `MLS# ${o.mlsNumber}`,
    tourType: o.tourType,
    date: o.date,
    time: o.time,
  };
}

/** `qualifier` for an offer — `offerDisplay` already formatted ("$725,000"). */
export function offerQualifier(o: {
  mlsNumber: string;
  offerDisplay: string;
  listPrice: number;
}): Record<string, string> {
  return {
    intent: "Make an offer",
    listing: `MLS# ${o.mlsNumber}`,
    offer: o.offerDisplay || "Not specified",
    listPrice: `$${o.listPrice.toLocaleString("en-US")}`,
  };
}

/** Cyclic index for the lightbox next/prev (wrap-around at both ends). */
export function wrapIndex(index: number, delta: number, count: number): number {
  if (count <= 0) return 0;
  return (index + delta + count) % count;
}
