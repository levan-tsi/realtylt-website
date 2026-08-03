import { describe, expect, it } from "vitest";
import { isSpecificAddress } from "./address-precision";

const comps = (...types: string[]) => ({ address_components: types.map((t) => ({ types: [t] })) });

describe("address precision — only a house counts as finding a home", () => {
  /** The real one, from the owner's own test query. */
  it("accepts a street number on a route", () => {
    expect(isSpecificAddress(comps("street_number", "route", "locality", "postal_code"))).toBe(true);
  });

  it("accepts a building result even without a separate street_number component", () => {
    expect(isSpecificAddress({ types: ["premise"], address_components: [{ types: ["route"] }] })).toBe(true);
    expect(isSpecificAddress({ types: ["subpremise"], address_components: [] })).toBe(true);
  });

  /** The failure that made this file exist: Google answers OK with "United States" for junk. */
  it("rejects the country-level fallback Google returns for an unplaceable query", () => {
    expect(isSpecificAddress({ types: ["country", "political"], ...comps("country") })).toBe(false);
  });

  /** A town, a ZIP or a county is a place. A home valuation needs the house. */
  it.each([
    ["a town", { types: ["locality", "political"], ...comps("locality", "administrative_area_level_1") }],
    ["a ZIP", { types: ["postal_code"], ...comps("postal_code", "locality") }],
    ["a county", { types: ["administrative_area_level_2"], ...comps("administrative_area_level_2") }],
    ["a state", { types: ["administrative_area_level_1"], ...comps("administrative_area_level_1") }],
    ["a street with no number", { types: ["route"], ...comps("route", "locality") }],
  ])("rejects %s", (_label, result) => {
    expect(isSpecificAddress(result)).toBe(false);
  });

  it.each([null, undefined, {}, { address_components: [] }])("rejects %j", (r) => {
    expect(isSpecificAddress(r)).toBe(false);
  });
});
