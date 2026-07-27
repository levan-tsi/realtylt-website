import { describe, expect, it } from "vitest";
import { BOROUGH_CONTENT, getBorough, boroughPath } from "./boroughs";
import { BOROUGHS, COUNTIES, TOP_AREA_GROUPS } from "@/lib/site";

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

/** The header flyout hard-codes the readable borough slug (lib/site BOROUGH_PAGE_SLUG) because
 * lib/site cannot import content/boroughs without a cycle. That copy is the drift risk these
 * tests exist to kill: a nav link pointing at a slug generateStaticParams never emits is a 404
 * the type checker cannot see. */
describe("the Top Areas menu only links to pages that exist", () => {
  const [hudson, nyc] = TOP_AREA_GROUPS;

  it("groups the six counties and the five boroughs, and nothing else", () => {
    expect(TOP_AREA_GROUPS).toHaveLength(2);
    expect(hudson.items).toHaveLength(6);
    expect(nyc.items).toHaveLength(5);
  });

  it("every borough link uses the readable page slug from BOROUGH_CONTENT", () => {
    expect([...nyc.items].map((i) => i.href).sort()).toEqual(
      BOROUGH_CONTENT.map((b) => `/top-areas/${b.slug}`).sort(),
    );
    // The one that would break silently.
    expect([...nyc.items].map((i) => i.href)).toContain("/top-areas/the-bronx");
    expect([...nyc.items].map((i) => i.href)).not.toContain("/top-areas/bronx");
  });

  it("every county link uses its COUNTIES slug", () => {
    expect([...hudson.items].map((i) => i.href).sort()).toEqual(
      [...COUNTIES].map((c) => `/top-areas/${c.slug}`).sort(),
    );
  });

  it("labels the boroughs as their own group so they read as distinct from the counties", () => {
    expect(nyc.label).toBe("New York City");
    expect(hudson.label).toBe("Hudson Valley");
    expect([...nyc.items].map((i) => i.label)).toContain("THE BRONX");
  });
});
