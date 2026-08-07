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
import { BASEMENT_FINISHED_VALUE, BASEMENT_WALKOUT_VALUE, HEATING_VALUES, HOME_TYPE_VALUES, HOME_TYPES, NEAR_TRANSIT_VALUE, PARKING_VALUES, REAL_BASEMENT, WATERFRONT_FEATURES } from "./types";

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

describe("washerDryer filter (round 23)", () => {
  const matchRow = FIXTURE_LISTINGS.find((l) => l.interiorFeatures?.includes("Washer/Dryer Hookup"));
  const nonMatchRow = FIXTURE_LISTINGS.find(
    (l) => l.interiorFeatures && !l.interiorFeatures.includes("Washer/Dryer Hookup"),
  );
  const omittedRow = FIXTURE_LISTINGS.find((l) => l.interiorFeatures === undefined);

  it("fixture data has a match, a non-match and an omitted row to test against", () => {
    expect(matchRow).toBeDefined();
    expect(nonMatchRow).toBeDefined();
    expect(omittedRow).toBeDefined();
  });

  it("every returned row genuinely has a washer/dryer hookup; non-matching and omitted rows are absent", async () => {
    const r = await client.search({ washerDryer: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.interiorFeatures?.includes("Washer/Dryer Hookup"))).toBe(true);
    expect(r.listings.some((l) => l.id === nonMatchRow!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omittedRow!.id)).toBe(false);
  });
});

describe("formalDining filter (round 23)", () => {
  const matchRow = FIXTURE_LISTINGS.find((l) => l.interiorFeatures?.includes("Formal Dining"));
  const nonMatchRow = FIXTURE_LISTINGS.find(
    (l) => l.interiorFeatures && !l.interiorFeatures.includes("Formal Dining"),
  );

  it("fixture data has a match and a non-match to test against", () => {
    expect(matchRow).toBeDefined();
    expect(nonMatchRow).toBeDefined();
  });

  it("every returned row genuinely has a formal dining room; non-matching rows are absent", async () => {
    const r = await client.search({ formalDining: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.interiorFeatures?.includes("Formal Dining"))).toBe(true);
    expect(r.listings.some((l) => l.id === nonMatchRow!.id)).toBe(false);
  });
});

describe("municipalUtilities filter (round 23) — one toggle, BOTH facts", () => {
  const bothRow = FIXTURE_LISTINGS.find(
    (l) => l.sewer?.includes("Public Sewer") && l.waterSource?.includes("Public"),
  );
  const mixedRow = FIXTURE_LISTINGS.find(
    (l) => l.sewer?.includes("Public Sewer") && l.waterSource && !l.waterSource.includes("Public"),
  );
  const omittedRow = FIXTURE_LISTINGS.find((l) => l.sewer === undefined && l.waterSource === undefined);

  it("fixture data has a both-municipal, a mixed, and an omitted row to test against", () => {
    expect(bothRow).toBeDefined();
    expect(mixedRow).toBeDefined();
    expect(omittedRow).toBeDefined();
  });

  it("every returned row has BOTH municipal water and sewer; a public-sewer-with-well row is absent", async () => {
    const r = await client.search({ municipalUtilities: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(
      r.listings.every((l) => l.sewer?.includes("Public Sewer") && l.waterSource?.includes("Public")),
    ).toBe(true);
    expect(r.listings.some((l) => l.id === mixedRow!.id)).toBe(false);
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

describe("heating filter (round 24) — one token, one exact Heating value", () => {
  it("every returned row genuinely heats with the asked fuel; a delivery-only row is absent", async () => {
    for (const token of ["natural-gas", "oil", "electric", "propane", "heat-pump"] as const) {
      const value = HEATING_VALUES[token];
      const r = await client.search({ heating: token, ...wide });
      expect(r.listings.length, `${token} must answer with real fixture inventory`).toBeGreaterThan(0);
      expect(r.listings.every((l) => l.heating?.includes(value))).toBe(true);
    }
    // A row that states heating but names no fuel (Baseboard/Hot Water) matches NO fuel token.
    const deliveryOnly = FIXTURE_LISTINGS.find(
      (l) => l.heating && !Object.values(HEATING_VALUES).some((v) => l.heating!.includes(v)),
    );
    expect(deliveryOnly).toBeDefined();
    const r = await client.search({ heating: "natural-gas", ...wide });
    expect(r.listings.some((l) => l.id === deliveryOnly!.id)).toBe(false);
    // And a row that omits heating entirely is absent too (absent ≠ match).
    const omitted = FIXTURE_LISTINGS.find((l) => l.heating === undefined);
    expect(omitted).toBeDefined();
    expect(r.listings.some((l) => l.id === omitted!.id)).toBe(false);
  });

  it("an invalid heating token in the URL is ignored", () => {
    expect(parseFilterParams(new URLSearchParams("heating=coal")).heating).toBeUndefined();
    expect(parseFilterParams(new URLSearchParams("heating=oil")).heating).toBe("oil");
  });
});

describe("parking filter (round 24)", () => {
  it("every returned row genuinely offers the asked parking kind; a garage-only row is absent", async () => {
    for (const token of ["attached", "detached", "driveway", "assigned"] as const) {
      const value = PARKING_VALUES[token];
      const r = await client.search({ parking: token, ...wide });
      expect(r.listings.length, `${token} must answer with real fixture inventory`).toBeGreaterThan(0);
      expect(r.listings.every((l) => l.parkingFeatures?.includes(value))).toBe(true);
    }
    // "Garage" without Attached/Detached states a garage but not the kind — matches neither.
    const kindless = FIXTURE_LISTINGS.find(
      (l) => l.parkingFeatures?.includes("Garage") && !l.parkingFeatures.includes("Attached") && !l.parkingFeatures.includes("Detached"),
    );
    expect(kindless).toBeDefined();
    const r = await client.search({ parking: "attached", ...wide });
    expect(r.listings.some((l) => l.id === kindless!.id)).toBe(false);
    const omitted = FIXTURE_LISTINGS.find((l) => l.parkingFeatures === undefined);
    expect(omitted).toBeDefined();
    expect(r.listings.some((l) => l.id === omitted!.id)).toBe(false);
  });

  it("an invalid parking token in the URL is ignored", () => {
    expect(parseFilterParams(new URLSearchParams("parking=valet")).parking).toBeUndefined();
    expect(parseFilterParams(new URLSearchParams("parking=driveway")).parking).toBe("driveway");
  });
});

describe("basement depth filters (round 24) — Finished / Walk-out beyond the yes/no flag", () => {
  it("basementFinished returns only rows whose basement array says Finished, exactly", async () => {
    const r = await client.search({ basementFinished: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.basement?.includes(BASEMENT_FINISHED_VALUE))).toBe(true);
    // A Full-only basement is a real basement but NOT a finished one.
    const fullOnly = FIXTURE_LISTINGS.find((l) => l.basement?.includes("Full") && !l.basement.includes("Finished"));
    expect(fullOnly).toBeDefined();
    expect(r.listings.some((l) => l.id === fullOnly!.id)).toBe(false);
  });

  it("basementWalkout returns only Walk-Out Access rows", async () => {
    const r = await client.search({ basementWalkout: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.basement?.includes(BASEMENT_WALKOUT_VALUE))).toBe(true);
  });
});

describe("nearTransit filter (round 24)", () => {
  it("every returned row's lotFeatures says Near Public Transit; others and omitted are absent", async () => {
    const r = await client.search({ nearTransit: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.lotFeatures?.includes(NEAR_TRANSIT_VALUE))).toBe(true);
    const without = FIXTURE_LISTINGS.find((l) => l.lotFeatures && !l.lotFeatures.includes(NEAR_TRANSIT_VALUE));
    const omitted = FIXTURE_LISTINGS.find((l) => l.lotFeatures === undefined);
    expect(without).toBeDefined();
    expect(omitted).toBeDefined();
    expect(r.listings.some((l) => l.id === without!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omitted!.id)).toBe(false);
  });
});

/** Same duplication contract as REAL_BASEMENT above: the round-24 migration repeats the
 * token → value literals in its generated columns, and this pins the SQL against the TS maps
 * so the DB path and the fixture path can never answer the same question differently. */
describe("round-24 token maps pinned against idx_round24_facet_columns.sql", () => {
  const sql24 = readFileSync(join(process.cwd(), "supabase/migrations/idx_round24_facet_columns.sql"), "utf8");
  const literalAfter = (column: string): string => {
    const at = sql24.indexOf(column);
    if (at < 0) throw new Error(`column "${column}" not found in the round-24 migration`);
    const m = sql24.slice(at).match(/'\["([^"]+)"\]'::jsonb/);
    if (!m) throw new Error(`no '["..."]'::jsonb literal after "${column}" in the round-24 migration`);
    return m[1];
  };

  it("every heating column's literal matches HEATING_VALUES", () => {
    expect(literalAfter("has_heat_natural_gas")).toBe(HEATING_VALUES["natural-gas"]);
    expect(literalAfter("has_heat_oil")).toBe(HEATING_VALUES.oil);
    expect(literalAfter("has_heat_electric")).toBe(HEATING_VALUES.electric);
    expect(literalAfter("has_heat_propane")).toBe(HEATING_VALUES.propane);
    expect(literalAfter("has_heat_pump")).toBe(HEATING_VALUES["heat-pump"]);
  });

  it("basement, parking and transit literals match their TS constants", () => {
    expect(literalAfter("has_basement_finished")).toBe(BASEMENT_FINISHED_VALUE);
    expect(literalAfter("has_basement_walkout")).toBe(BASEMENT_WALKOUT_VALUE);
    expect(literalAfter("has_park_attached")).toBe(PARKING_VALUES.attached);
    expect(literalAfter("has_park_detached")).toBe(PARKING_VALUES.detached);
    expect(literalAfter("has_park_driveway")).toBe(PARKING_VALUES.driveway);
    expect(literalAfter("has_park_assigned")).toBe(PARKING_VALUES.assigned);
    expect(literalAfter("has_near_transit")).toBe(NEAR_TRANSIT_VALUE);
  });
});

describe("views filter (round 24b)", () => {
  it("every returned row's lotFeatures says Views; others and omitted are absent", async () => {
    const r = await client.search({ views: true, ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.lotFeatures?.includes("Views"))).toBe(true);
    const without = FIXTURE_LISTINGS.find((l) => l.lotFeatures && !l.lotFeatures.includes("Views"));
    const omitted = FIXTURE_LISTINGS.find((l) => l.lotFeatures === undefined);
    expect(without).toBeDefined();
    expect(omitted).toBeDefined();
    expect(r.listings.some((l) => l.id === without!.id)).toBe(false);
    expect(r.listings.some((l) => l.id === omitted!.id)).toBe(false);
  });
});

describe("keywords filter (round 24b) — Zillow's Keywords box over the remarks", () => {
  it("every returned row's description says the word; rows that do not are absent", async () => {
    const r = await client.search({ keywords: "fireplace", ...wide });
    expect(r.listings.length).toBeGreaterThan(0);
    expect(r.listings.every((l) => /fireplace/i.test(l.description))).toBe(true);
    const without = FIXTURE_LISTINGS.find((l) => !/fireplace/i.test(l.description));
    expect(without).toBeDefined();
    expect(r.listings.some((l) => l.id === without!.id)).toBe(false);
  });

  it("two words mean BOTH must appear", async () => {
    const both = await client.search({ keywords: "fireplace deck", ...wide });
    expect(both.listings.every((l) => /fireplace/i.test(l.description) && /deck/i.test(l.description))).toBe(true);
  });

  it("parseFilterParams bounds and strips the value — PostgREST syntax cannot ride in", () => {
    expect(parseFilterParams(new URLSearchParams("keywords=pool")).keywords).toBe("pool");
    expect(parseFilterParams(new URLSearchParams("keywords=" + encodeURIComponent("pool,remarks_tsv=is.null&x"))).keywords).toBe("poolremarkstsvisnullx");
    expect(parseFilterParams(new URLSearchParams("keywords=" + "x".repeat(200))).keywords).toHaveLength(80);
    expect(parseFilterParams(new URLSearchParams("keywords=")).keywords).toBeUndefined();
  });

  it("the migration's tsvector reads the same jsonb key the fixture reads", () => {
    const sql24b = readFileSync(join(process.cwd(), "supabase/migrations/idx_round24b_keywords_views.sql"), "utf8");
    expect(sql24b).toContain("listing ->> 'description'");
    expect(sql24b).toMatch(/has_views[\s\S]*?'\["Views"\]'::jsonb/);
  });
});
