import { describe, expect, it } from "vitest";
import { formatPrice, priceLabel } from "./ListingCard";

/** formatPrice / priceLabel are used by every card on the site (home rails, /search grid,
 * similar listings, /saved) and by the listing detail title and share title.
 *
 * Measured 2026-07-27: feeding the /search grid one row without a `price` threw
 * "Cannot read properties of undefined (reading 'toLocaleString')" and blanked the WHOLE
 * results grid, not just that card. Nothing in the 1,200 live rows sampled that day was
 * missing a price, so this is a guard against feed data we do not control (auction rows,
 * "call for price", a Coming Soon row that synced before pricing), not a fix for something
 * visitors were seeing.
 */
describe("formatPrice", () => {
  it("formats a normal price with thousands separators", () => {
    expect(formatPrice(450000)).toBe("$450,000");
    expect(formatPrice(1)).toBe("$1");
    expect(formatPrice(98765432100)).toBe("$98,765,432,100");
  });

  it("never throws on a price the feed did not send", () => {
    // The exact shapes PostgREST / MLS Grid can hand us.
    expect(formatPrice(undefined)).toBe("Price on request");
    expect(formatPrice(null)).toBe("Price on request");
    expect(() => formatPrice(undefined as unknown as number)).not.toThrow();
  });

  it("does not print a meaningless zero or a broken number", () => {
    expect(formatPrice(0)).toBe("Price on request");
    expect(formatPrice(-1)).toBe("Price on request");
    expect(formatPrice(NaN)).toBe("Price on request");
    expect(formatPrice(Infinity)).toBe("Price on request");
  });
});

describe("priceLabel", () => {
  it("marks a rental as monthly and leaves a sale alone", () => {
    expect(priceLabel({ price: 2400, propertyType: "Rental" })).toBe("$2,400/mo");
    expect(priceLabel({ price: 450000, propertyType: "Residential" })).toBe("$450,000");
    expect(priceLabel({ price: 450000 })).toBe("$450,000");
  });

  it("never produces 'Price on request/mo'", () => {
    expect(priceLabel({ price: null, propertyType: "Rental" })).toBe("Price on request");
    expect(priceLabel({ price: undefined, propertyType: "Rental" })).toBe("Price on request");
    expect(priceLabel({ price: 0, propertyType: "Rental" })).toBe("Price on request");
  });
});
