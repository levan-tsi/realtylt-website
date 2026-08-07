import { describe, expect, it } from "vitest";
import { areaLinks, ceilingFor, MUST_HAVES, planFor, searchUrlFor } from "./plan-quiz";
import { parseFilterParams } from "./idx/query";
import { priceForMonthly } from "./mortgage";

describe("ceilingFor — the quiz's bridge is /financing's bridge", () => {
  it("matches priceForMonthly under the stated assumptions (the round-23 spot value holds)", () => {
    expect(ceilingFor(3200)).toBe(priceForMonthly(3200, { downPct: 20, ratePct: 6, termYears: 30 }));
    // The committed round-23 verification: $3,200/mo → $585,000.
    expect(ceilingFor(3200)).toBe(585_000);
  });
});

describe("searchUrlFor — only tokens the search actually obeys", () => {
  it("round-trips through parseFilterParams to the same filters", () => {
    const url = searchUrlFor({
      path: "buying",
      monthly: 3200,
      areas: ["dutchess"],
      homeType: "house",
      mustHaves: ["centralAir", "garage", "nearTransit"],
    });
    const parsed = parseFilterParams(new URLSearchParams(url.split("?")[1]));
    expect(parsed.county).toBe("dutchess");
    expect(parsed.homeType).toBe("house");
    expect(parsed.priceMax).toBe(585_000);
    expect(parsed.centralAir).toBe(true);
    expect(parsed.garageMin).toBe(1);
    expect(parsed.nearTransit).toBe(true);
  });

  it("several areas drop the county from the main URL — one URL speaks one county", () => {
    const url = searchUrlFor({ areas: ["dutchess", "queens"] });
    expect(url).toBe("/search");
    const links = areaLinks({ areas: ["dutchess", "queens"], mustHaves: ["basement"] });
    expect(links.map((l) => l.slug)).toEqual(["dutchess", "queens"]);
    for (const l of links) {
      const parsed = parseFilterParams(new URLSearchParams(l.url.split("?")[1]));
      expect(parsed.county).toBe(l.slug);
      expect(parsed.basement).toBe(true);
    }
  });

  it("every offered must-have parses back as an active filter — nothing offered is a ghost", () => {
    for (const mh of MUST_HAVES) {
      const url = searchUrlFor({ mustHaves: [mh.key] });
      const parsed = parseFilterParams(new URLSearchParams(url.split("?")[1]));
      const active = Object.values(parsed).some((v) => v === true || v === 1);
      expect(active, `${mh.key} must reach the query builder`).toBe(true);
    }
  });

  it("a zero-ceiling monthly never emits priceMax=0", () => {
    expect(searchUrlFor({ monthly: 1 })).toBe("/search");
  });
});

describe("planFor — every combination of skipped steps yields a usable plan", () => {
  it("pre-approved buyer is sent to the search; unapproved to financing; distant to watching", () => {
    expect(planFor({ path: "buying", preapproval: "yes" }).nextStage.href).toBe("/search");
    expect(planFor({ path: "buying", preapproval: "cash" }).nextStage.href).toBe("/search");
    expect(planFor({ path: "buying", preapproval: "not-yet", timeline: "now" }).nextStage.href).toBe("/financing");
    expect(planFor({ path: "buying", timeline: "later" }).nextStage.href).toBe("/search");
  });

  it("sellers get the valuation stage and no ceiling, even with a monthly set", () => {
    const p = planFor({ path: "selling", monthly: 3200, timeline: "now" });
    expect(p.nextStage.href).toBe("/home-value");
    expect(p.ceiling).toBeNull();
    expect(p.showHomeValue).toBe(true);
  });

  it("Both keeps the buyer plan and adds the valuation hand-off", () => {
    const p = planFor({ path: "both", monthly: 3200, preapproval: "yes" });
    expect(p.ceiling?.price).toBe(585_000);
    expect(p.showHomeValue).toBe(true);
  });

  it("the empty answer set still yields a plan (all steps skipped)", () => {
    const p = planFor({});
    expect(p.searchUrl).toBe("/search");
    expect(p.nextStage.title.length).toBeGreaterThan(0);
    expect(p.ceiling).toBeNull();
  });
});
