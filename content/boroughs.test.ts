import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

/** THE LISTING BREADCRUMB IS THE OTHER PLACE THAT BUILDS THIS URL.
 *
 * The header flyout was guarded above; the listing page was not, and it built its crumb straight
 * from the area slug — `/top-areas/${county.slug}`. For ten of the eleven areas that is the same
 * string. For the Bronx it is not: the page is /top-areas/the-bronx, so every Bronx listing
 * showed a crumb reading "THE BRONX" that led to a 404, and published the same dead URL in its
 * BreadcrumbList JSON-LD. Measured on the dev server 2026-08-26: 1,388 Active Bronx listings,
 * and `/top-areas/bronx` answered 404 while `/top-areas/the-bronx` answered 200.
 *
 * `boroughPath` is the mapping this module already owns, so the fix was to use it. These two
 * cases keep it used: one checks the resolution for every served area, the other checks that the
 * component still routes through the helper rather than re-deriving the path. */
describe("the listing page's county breadcrumb", () => {
  const PAGE_SLUGS = new Set([...COUNTIES.map((c) => c.slug), ...BOROUGH_CONTENT.map((b) => b.slug)]);
  /** Exactly what ListingDetail computes for `countyHref`. */
  const crumbHref = (areaSlug: string) => boroughPath(areaSlug) ?? `/top-areas/${areaSlug}`;

  it("lands on a real Top Areas page for every area we serve", () => {
    for (const area of [...COUNTIES.map((c) => c.slug), ...BOROUGHS.map((b) => b.slug)]) {
      const href = crumbHref(area);
      expect(PAGE_SLUGS.has(href.replace("/top-areas/", "")), `${area}: breadcrumb ${href} is not a Top Areas page`).toBe(true);
    }
  });

  it("sends a Bronx listing to the-bronx, never to the area slug", () => {
    expect(crumbHref("bronx")).toBe("/top-areas/the-bronx");
    expect(crumbHref("dutchess")).toBe("/top-areas/dutchess");
  });

  it("builds the crumb through boroughPath, not from the raw area slug", () => {
    const src = readFileSync(resolve(__dirname, "../components/listing/ListingDetail.tsx"), "utf8");
    expect(src).toContain("boroughPath(county.slug)");
    // The shape that WAS the bug. One occurrence is allowed: the non-borough fallback that sits
    // inside the same expression as the boroughPath call. A second one is a new raw-slug link.
    expect(src.match(/\/top-areas\/\$\{county\.slug\}/g) ?? []).toHaveLength(1);
  });
});
