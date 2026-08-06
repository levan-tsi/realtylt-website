/** Six /search facet filters (homeType, centralAir, basement, waterfront, firstFloorBed,
 * eatInKitchen) backed by generated columns in supabase/migrations/idx_search_facet_columns.sql.
 * The rule this project keeps re-learning: a filter test that only asserts "the count changed"
 * is worthless — every assertion here checks the RETURNED ROWS actually satisfy the filter,
 * that a known non-matching row is absent, and that a row which OMITS the source field entirely
 * is excluded (absent ≠ match). fixture-data.ts was enriched specifically so these are never
 * vacuous (0 in, 0 out, green). */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FixtureIdxClient } from "./fixture";
import { FIXTURE_LISTINGS } from "./fixture-data";
import { parseFilterParams } from "./query";
import { HOME_TYPE_VALUES, HOME_TYPES, REAL_BASEMENT, WATERFRONT_FEATURES } from "./types";

const client = new FixtureIdxClient();
const wide = { pageSize: 500 }; // wide enough for every fixture row within the default counties

describe("homeType filter", () => {
  it("house returns only Single Family Residence, never a multi-family subtype", async () => {
    const r = await client.search({ homeType: "house", ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.propertySubType === "Single Family Residence")).toBe(true);
  });

  it("multi-family returns Duplex/Triplex/Quadruplex/Multi Family and never Single Family Residence", async () => {
    const r = await client.search({ homeType: "multi-family", ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    const subtypes = new Set(r.listings.map((l) => l.propertySubType));
    for (const s of subtypes) expect(HOME_TYPE_VALUES["multi-family"]).toContain(s);
    expect(subtypes.has("Single Family Residence")).toBe(false);
    // fixture-data.ts deliberately cycles all four RESO values across the "multi" rows.
    expect([...subtypes].sort()).toEqual([...HOME_TYPE_VALUES["multi-family"]].sort());
  });

  it("a listing that omits propertySubType is excluded from EVERY homeType value", async () => {
    const omitted = FIXTURE_LISTINGS.find((l) => l.propertySubType === undefined);
    expect(omitted).toBeDefined();
    for (const type of HOME_TYPES) {
      const r = await client.search({ homeType: type, ...wide });
      expect(r.listings.some((l) => l.id === omitted!.id)).toBe(false);
    }
  });

  it("an invalid homeType in the URL is ignored (parseFilterParams falls back to no filter)", () => {
    const params = parseFilterParams(new URLSearchParams("homeType=not-a-real-type"));
    expect(params.homeType).toBeUndefined();
  });

  it("a valid homeType in the URL passes through parseFilterParams", () => {
    const params = parseFilterParams(new URLSearchParams("homeType=condo"));
    expect(params.homeType).toBe("condo");
  });
});

describe("centralAir filter", () => {
  const matchRow = FIXTURE_LISTINGS.find((l) => l.cooling?.includes("Central Air"));
  const nonMatchRow = FIXTURE_LISTINGS.find((l) => l.cooling && !l.cooling.includes("Central Air"));
  const omittedRow = FIXTURE_LISTINGS.find((l) => l.cooling === undefined);

  it("fixture data has a match, a non-match and an omitted row to test against", () => {
    expect(matchRow).toBeDefined();
    expect(nonMatchRow).toBeDefined();
    expect(omittedRow).toBeDefined();
  });

  it("every returned row genuinely has Central Air; non-matching and omitted rows are absent", async () => {
    const r = await client.search({ centralAir: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.cooling?.includes("Central Air"))).toBe(true);
    expect(r.listings.some((l) => l.id === nonMatchRow!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omittedRow!.id)).toBe(false);
  });
});

describe("basement filter", () => {
  const isRealBasement = (v: string) => (REAL_BASEMENT as readonly string[]).includes(v);
  const matchRow = FIXTURE_LISTINGS.find((l) => l.basement?.some(isRealBasement));
  const nonMatchRow = FIXTURE_LISTINGS.find((l) => l.basement && !l.basement.some(isRealBasement));
  const omittedRow = FIXTURE_LISTINGS.find((l) => l.basement === undefined);

  it("fixture data has a match, a non-match and an omitted row to test against", () => {
    expect(matchRow).toBeDefined();
    expect(nonMatchRow).toBeDefined();
    expect(omittedRow).toBeDefined();
  });

  it("every returned row genuinely has a REAL basement; non-matching and omitted rows are absent", async () => {
    const r = await client.search({ basement: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.basement?.some(isRealBasement))).toBe(true);
    expect(r.listings.some((l) => l.id === nonMatchRow!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omittedRow!.id)).toBe(false);
  });
});

describe("waterfront filter", () => {
  const isWaterfront = (v: string) => (WATERFRONT_FEATURES as readonly string[]).includes(v);
  const matchRow = FIXTURE_LISTINGS.find((l) => l.lotFeatures?.some(isWaterfront));
  const nonMatchRow = FIXTURE_LISTINGS.find((l) => l.lotFeatures && !l.lotFeatures.some(isWaterfront));
  const omittedRow = FIXTURE_LISTINGS.find((l) => l.lotFeatures === undefined);

  it("fixture data has a match, a non-match and an omitted row to test against", () => {
    expect(matchRow).toBeDefined();
    expect(nonMatchRow).toBeDefined();
    expect(omittedRow).toBeDefined();
  });

  it("every returned row genuinely is waterfront/water access; non-matching and omitted rows are absent", async () => {
    const r = await client.search({ waterfront: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.lotFeatures?.some(isWaterfront))).toBe(true);
    expect(r.listings.some((l) => l.id === nonMatchRow!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omittedRow!.id)).toBe(false);
  });
});

describe("firstFloorBed filter", () => {
  const matchRow = FIXTURE_LISTINGS.find((l) => l.interiorFeatures?.includes("First Floor Bedroom"));
  const nonMatchRow = FIXTURE_LISTINGS.find(
    (l) => l.interiorFeatures && !l.interiorFeatures.includes("First Floor Bedroom"),
  );
  const omittedRow = FIXTURE_LISTINGS.find((l) => l.interiorFeatures === undefined);

  it("fixture data has a match, a non-match and an omitted row to test against", () => {
    expect(matchRow).toBeDefined();
    expect(nonMatchRow).toBeDefined();
    expect(omittedRow).toBeDefined();
  });

  it("every returned row genuinely has a first-floor bedroom; non-matching and omitted rows are absent", async () => {
    const r = await client.search({ firstFloorBed: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.interiorFeatures?.includes("First Floor Bedroom"))).toBe(true);
    expect(r.listings.some((l) => l.id === nonMatchRow!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omittedRow!.id)).toBe(false);
  });
});

describe("eatInKitchen filter", () => {
  const matchRow = FIXTURE_LISTINGS.find((l) => l.interiorFeatures?.includes("Eat-in Kitchen"));
  const nonMatchRow = FIXTURE_LISTINGS.find(
    (l) => l.interiorFeatures && !l.interiorFeatures.includes("Eat-in Kitchen"),
  );
  const omittedRow = FIXTURE_LISTINGS.find((l) => l.interiorFeatures === undefined);

  it("fixture data has a match, a non-match and an omitted row to test against", () => {
    expect(matchRow).toBeDefined();
    expect(nonMatchRow).toBeDefined();
    expect(omittedRow).toBeDefined();
  });

  it("every returned row genuinely has an eat-in kitchen; non-matching and omitted rows are absent", async () => {
    const r = await client.search({ eatInKitchen: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.interiorFeatures?.includes("Eat-in Kitchen"))).toBe(true);
    expect(r.listings.some((l) => l.id === nonMatchRow!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omittedRow!.id)).toBe(false);
  });
});

/** REAL_BASEMENT and WATERFRONT_FEATURES (types.ts) are duplicated, unavoidably, in the
 * generated columns in supabase/migrations/idx_search_facet_columns.sql — SQL cannot import
 * TypeScript. This pins the two lists together so a future edit to one is caught here instead
 * of silently drifting: the DB path and the fixture path would otherwise answer the same
 * "does this listing have a basement / waterfront" question differently. */
describe("REAL_BASEMENT / WATERFRONT_FEATURES pinned against the SQL migration", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/idx_search_facet_columns.sql"),
    "utf8",
  );

  function arrayLiteralAfter(marker: string): string[] {
    const re = new RegExp(`${marker}[\\s\\S]*?array\\[([^\\]]*)\\]`);
    const m = sql.match(re);
    if (!m) throw new Error(`could not find an array[...] literal after "${marker}" in the migration SQL`);
    return m[1]
      .split(",")
      .map((s) => s.trim().replace(/^'|'$/g, ""))
      .filter(Boolean);
  }

  it("REAL_BASEMENT matches has_basement's array[...] in the migration", () => {
    const sqlValues = arrayLiteralAfter("has_basement").sort();
    expect(sqlValues).toEqual([...REAL_BASEMENT].sort());
  });

  it("WATERFRONT_FEATURES matches has_waterfront's array[...] in the migration", () => {
    const sqlValues = arrayLiteralAfter("has_waterfront").sort();
    expect(sqlValues).toEqual([...WATERFRONT_FEATURES].sort());
  });
});
