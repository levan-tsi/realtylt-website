import type { Listing } from "./types";

/** THE CARD'S LISTING (round 61). A listing handed from a server page to a client card is written
 * into the page's RSC payload whole: on the home page the two rails' 32 cards carried their
 * descriptions, schools, appliances and the rest (about 110 KB of the payload's 175 KB), none of
 * which a card shows. These are the fields no card reads (components/idx/ListingCard.tsx and what
 * it imports; card-listing.test.ts reads those files and fails if one of them starts to), dropped
 * before the listing crosses to the client. The two required ones are emptied rather than dropped
 * so the type still holds. */
export const CARD_UNUSED = [
  "appliances",
  "basement",
  "cooling",
  "elementarySchool",
  "exteriorFeatures",
  "garageSpaces",
  "heating",
  "highSchool",
  "hoaFee",
  "interiorFeatures",
  "listAgentName",
  "lotFeatures",
  "middleSchool",
  "parkingFeatures",
  "photosMirroredCount",
  "photosMirroredTs",
  "propertySubType",
  "schoolDistrict",
  "sewer",
  "taxAnnual",
  "waterSource",
  "yearBuilt",
] as const satisfies readonly (keyof Listing)[];

export function forCard(l: Listing): Listing {
  const out: Partial<Listing> = { ...l, description: "", features: [] };
  for (const k of CARD_UNUSED) delete out[k];
  // Rows from the database carry a few columns the type does not name (geocoding bookkeeping).
  for (const k of ["geocoded", "geocodeTried"]) delete (out as Record<string, unknown>)[k];
  return out as Listing;
}
