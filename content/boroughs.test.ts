import { describe, expect, it } from "vitest";
import { BOROUGH_CONTENT, getBorough, boroughPath } from "./boroughs";
import { BOROUGHS } from "@/lib/site";

describe("borough Top Areas content + slug mapping", () => {
  it("covers all five NYC boroughs", () => {
    expect(BOROUGH_CONTENT).toHaveLength(5);
    const countySlugs = BOROUGH_CONTENT.map((b) => b.countySlug).sort();
    expect(countySlugs).toEqual([...BOROUGHS].map((b) => b.slug).sort());
  });

  it("maps the readable URL slug to the internal county slug (the-bronx → bronx)", () => {
    const bronx = getBorough("the-bronx");
    expect(bronx?.countySlug).toBe("bronx");
    expect(bronx?.name).toBe("The Bronx");
    // The other four use the same slug on both sides.
    for (const s of ["queens", "brooklyn", "manhattan", "staten-island"]) {
      expect(getBorough(s)?.countySlug).toBe(s);
    }
  });

  it("names come from lib/site BOROUGHS (single source of truth)", () => {
    for (const b of BOROUGH_CONTENT) {
      expect(b.name).toBe(BOROUGHS.find((x) => x.slug === b.countySlug)!.name);
    }
  });

  it("boroughPath builds the Top Areas URL from an internal slug, undefined for non-boroughs", () => {
    expect(boroughPath("bronx")).toBe("/top-areas/the-bronx");
    expect(boroughPath("queens")).toBe("/top-areas/queens");
    expect(boroughPath("dutchess")).toBeUndefined();
  });

  it("getBorough returns undefined for an unknown slug", () => {
    expect(getBorough("nassau")).toBeUndefined();
  });
});
