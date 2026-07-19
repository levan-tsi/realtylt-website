import { describe, expect, it } from "vitest";
import { formatOffer, fullAddress, offerQualifier, tourQualifier, wrapIndex } from "./listing-intents";

const listing = {
  id: "KEY123",
  address: "148 Lincoln Avenue",
  city: "New Rochelle",
  state: "NY",
  zip: "10801",
  price: 950_000,
  mlsNumber: "123",
};

describe("fullAddress", () => {
  it("builds one honest address line", () => {
    expect(fullAddress(listing)).toBe("148 Lincoln Avenue, New Rochelle, NY 10801");
  });
});

describe("formatOffer", () => {
  it("formats a digit string with $ and commas", () => {
    expect(formatOffer("725000")).toBe("$725,000");
    expect(formatOffer("1400000")).toBe("$1,400,000");
  });
  it("returns empty for no/zero amount", () => {
    expect(formatOffer("")).toBe("");
    expect(formatOffer("0")).toBe("");
    expect(formatOffer("abc")).toBe("");
  });
});

describe("tourQualifier", () => {
  it("carries the tour intent + MLS + selections", () => {
    expect(
      tourQualifier({ mlsNumber: "123", tourType: "Video chat", date: "Tue Jul 21", time: "Evening" }),
    ).toEqual({
      intent: "Schedule a tour",
      listing: "MLS# 123",
      tourType: "Video chat",
      date: "Tue Jul 21",
      time: "Evening",
    });
  });
});

describe("offerQualifier", () => {
  it("carries the offer intent, amount, MLS and list price", () => {
    expect(offerQualifier({ mlsNumber: "123", offerDisplay: "$725,000", listPrice: 950_000 })).toEqual({
      intent: "Make an offer",
      listing: "MLS# 123",
      offer: "$725,000",
      listPrice: "$950,000",
    });
  });
  it("falls back to 'Not specified' when no amount was entered", () => {
    expect(offerQualifier({ mlsNumber: "123", offerDisplay: "", listPrice: 950_000 }).offer).toBe("Not specified");
  });
});

describe("wrapIndex — lightbox next/prev", () => {
  it("wraps around both ends", () => {
    expect(wrapIndex(0, -1, 5)).toBe(4); // prev from first -> last
    expect(wrapIndex(4, 1, 5)).toBe(0); // next from last -> first
    expect(wrapIndex(2, 1, 5)).toBe(3);
  });
  it("is safe for a single photo or empty gallery", () => {
    expect(wrapIndex(0, 1, 1)).toBe(0);
    expect(wrapIndex(0, -1, 1)).toBe(0);
    expect(wrapIndex(0, 1, 0)).toBe(0);
  });
});
