/** IS THIS ACTUALLY A HOUSE?
 *
 * Google's geocoder does not fail the way you expect. Ask it to place
 * "zzzz qqqq not a real place 99999" with the country restricted to the US and it does not
 * return ZERO_RESULTS — it returns OK, with one result whose formatted_address is
 * "United States". Feed that straight into a confirmation step and the card says, in bold,
 *
 *     We've found your home.  For United States
 *
 * which is worse than not having a confirmation step at all: it is confidently wrong, and it
 * would send "United States" to the CRM as the address of a home to value.
 *
 * So a result only counts when it identifies a specific building. The test is the presence of
 * BOTH a street number and a route: that is what separates "150 Hooker Ave" from a town, a ZIP,
 * a county, a state or a country, all of which Google will happily hand back as a match for a
 * vague query. A home valuation needs the house.
 */

export interface GeocodeComponentLike {
  types?: string[];
}

export interface GeocodeResultLike {
  types?: string[];
  address_components?: GeocodeComponentLike[];
}

/** Types Google uses for a result that IS a specific building. `subpremise` is an apartment or
 * unit, which is exactly the case the unit field on the form exists for. */
const BUILDING_TYPES = new Set(["street_address", "premise", "subpremise"]);

export function isSpecificAddress(result: GeocodeResultLike | null | undefined): boolean {
  if (!result) return false;
  const has = (t: string) =>
    (result.address_components ?? []).some((c) => (c.types ?? []).includes(t));
  // A street number and the street it is on. Everything vaguer than that is a place, not a home.
  if (has("street_number") && has("route")) return true;
  // Some rooftop results (condos, named buildings) carry the building type without a separate
  // street_number component, and those are still a specific home.
  return (result.types ?? []).some((t) => BUILDING_TYPES.has(t));
}
