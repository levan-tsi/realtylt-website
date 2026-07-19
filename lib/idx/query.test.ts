import { describe, expect, it } from "vitest";
import { inBounds, parseBounds, parseFilterParams } from "./query";

const q = (s: string) => new URLSearchParams(s);

describe("parseFilterParams — newDays (New Listings quick filter)", () => {
  it("parses a positive window", () => {
    expect(parseFilterParams(q("newDays=7")).newWithinDays).toBe(7);
  });
  it("clamps an absurd window to 90 days", () => {
    expect(parseFilterParams(q("newDays=99999")).newWithinDays).toBe(90);
  });
  it("ignores absent / zero / negative / non-numeric values", () => {
    expect(parseFilterParams(q("")).newWithinDays).toBeUndefined();
    expect(parseFilterParams(q("newDays=0")).newWithinDays).toBeUndefined();
    expect(parseFilterParams(q("newDays=-5")).newWithinDays).toBeUndefined();
    expect(parseFilterParams(q("newDays=abc")).newWithinDays).toBeUndefined();
  });
});

describe("parseBounds", () => {
  it("parses a full valid box", () => {
    expect(parseBounds(q("north=41&south=40&east=-73&west=-74"))).toEqual({
      north: 41, south: 40, east: -73, west: -74,
    });
  });

  it("rejects a partial box (all four are required)", () => {
    expect(parseBounds(q("north=41&south=40"))).toBeUndefined();
    expect(parseBounds(q(""))).toBeUndefined();
  });

  it("rejects NaN and degenerate boxes", () => {
    expect(parseBounds(q("north=x&south=40&east=-73&west=-74"))).toBeUndefined();
    expect(parseBounds(q("north=40&south=41&east=-73&west=-74"))).toBeUndefined(); // north<=south
    expect(parseBounds(q("north=41&south=40&east=-74&west=-73"))).toBeUndefined(); // east<=west
  });
});

describe("inBounds", () => {
  const b = { north: 41, south: 40, east: -73, west: -74 };
  it("includes points inside (edges inclusive)", () => {
    expect(inBounds({ lat: 40.5, lng: -73.5 }, b)).toBe(true);
    expect(inBounds({ lat: 41, lng: -74 }, b)).toBe(true);
  });
  it("excludes points outside", () => {
    expect(inBounds({ lat: 42, lng: -73.5 }, b)).toBe(false); // north of box
    expect(inBounds({ lat: 40.5, lng: -72 }, b)).toBe(false); // east of box
    expect(inBounds({ lat: 0, lng: 0 }, b)).toBe(false); // Null Island
  });
});
