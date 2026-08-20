import { describe, expect, it, vi } from "vitest";
import { geocodePending, geocodeSoldPending, type GeocodeDeps, type SoldGeocodeDeps } from "./geocode-runner";
import type { SoldGeocodeRecord } from "./db";
import type { GeocodeHit, GeocodeRow } from "./geocode";

const row = (id: string, zip = "12601"): GeocodeRow => ({
  id,
  address: `${id} Ferris Lane`,
  city: "Poughkeepsie",
  state: "NY",
  zip,
});

const hit = (id: string, lat: number, lng: number, precision = "Exact"): GeocodeHit => ({
  id,
  lat,
  lng,
  precision,
  source: "census",
  matchedAddress: null,
  addrKey: `${id.toLowerCase()} ferris lane|12601`,
});

/** Poughkeepsie 12601 sits at roughly 41.6946, -73.9164. */
const GOOD = { lat: 41.6885, lng: -73.9171 };
/** ~60km north — the "same street name in another county" failure this gate exists for. */
const FAR = { lat: 42.25, lng: -73.9 };

function deps(over: Partial<GeocodeDeps> = {}): GeocodeDeps & { applied: { hits: readonly GeocodeHit[]; misses: ReadonlyArray<{ id: string; addrKey: string }> }[] } {
  const applied: { hits: readonly GeocodeHit[]; misses: ReadonlyArray<{ id: string; addrKey: string }> }[] = [];
  return {
    applied,
    listPending: async () => [row("A")],
    geocode: async () => ({ hits: [hit("A", GOOD.lat, GOOD.lng)], misses: [] }),
    apply: async (hits, misses) => {
      applied.push({ hits, misses });
      return { saved: hits.length, applied: hits.length, missed: misses.length };
    },
    ...over,
  };
}

describe("geocodePending", () => {
  it("places a believable coordinate", async () => {
    const d = deps();
    await expect(geocodePending(d, 10)).resolves.toEqual({ considered: 1, placed: 1, unplaced: 0, rejected: 0 });
    expect(d.applied[0].hits.map((h) => h.id)).toEqual(["A"]);
  });

  it("does not write a coordinate the quality gate rejects", async () => {
    const d = deps({ geocode: async () => ({ hits: [hit("A", FAR.lat, FAR.lng, "Non_Exact")], misses: [] }) });
    const out = await geocodePending(d, 10);
    expect(out).toEqual({ considered: 1, placed: 0, unplaced: 1, rejected: 1 });
    expect(d.applied[0].hits).toHaveLength(0);
  });

  it("marks a rejected hit unplaceable, or the next tick asks the same question forever", async () => {
    const d = deps({ geocode: async () => ({ hits: [hit("A", FAR.lat, FAR.lng, "Non_Exact")], misses: [] }) });
    await geocodePending(d, 10);
    expect(d.applied[0].misses).toEqual([{ id: "A", addrKey: "a ferris lane|12601" }]);
  });

  it("marks the geocoder's own misses unplaceable", async () => {
    const d = deps({ geocode: async () => ({ hits: [], misses: [row("A")] }) });
    const out = await geocodePending(d, 10);
    expect(out.unplaced).toBe(1);
    expect(d.applied[0].misses.map((m) => m.id)).toEqual(["A"]);
  });

  it("splits a mixed batch instead of failing the whole thing", async () => {
    const d = deps({
      listPending: async () => [row("A"), row("B"), row("C")],
      geocode: async () => ({
        hits: [hit("A", GOOD.lat, GOOD.lng), hit("B", FAR.lat, FAR.lng, "Non_Exact")],
        misses: [row("C")],
      }),
    });
    const out = await geocodePending(d, 10);
    expect(out).toEqual({ considered: 3, placed: 1, unplaced: 2, rejected: 1 });
    expect(d.applied[0].hits.map((h) => h.id)).toEqual(["A"]);
    expect(d.applied[0].misses.map((m) => m.id).sort()).toEqual(["B", "C"]);
  });

  it("asks for nothing and writes nothing when the budget is zero", async () => {
    const listPending = vi.fn();
    await expect(geocodePending(deps({ listPending }), 0)).resolves.toEqual({
      considered: 0, placed: 0, unplaced: 0, rejected: 0,
    });
    expect(listPending).not.toHaveBeenCalled();
  });

  it("does not call the geocoder when nothing is pending", async () => {
    const geocode = vi.fn();
    await geocodePending(deps({ listPending: async () => [], geocode }), 10);
    expect(geocode).not.toHaveBeenCalled();
  });

  it("places a zip-less row on a building-grade answer — those had no coordinate at all", async () => {
    const d = deps({
      listPending: async () => [{ ...row("A"), zip: "" }],
      geocode: async () => ({
        hits: [{ ...hit("A", GOOD.lat, GOOD.lng, "ROOFTOP"), source: "google", addrKey: "a ferris lane|" }],
        misses: [],
      }),
    });
    expect((await geocodePending(d, 10)).placed).toBe(1);
  });

  it("still refuses a street-level guess for a zip-less row", async () => {
    const d = deps({
      listPending: async () => [{ ...row("A"), zip: "" }],
      geocode: async () => ({ hits: [hit("A", GOOD.lat, GOOD.lng, "Non_Exact")], misses: [] }),
    });
    expect((await geocodePending(d, 10)).placed).toBe(0);
  });
});

function soldDeps(over: Partial<SoldGeocodeDeps> = {}): SoldGeocodeDeps & { written: SoldGeocodeRecord[] } {
  const written: SoldGeocodeRecord[] = [];
  return {
    written,
    listPending: async () => [row("KEY1")],
    geocode: async () => ({ hits: [hit("KEY1", GOOD.lat, GOOD.lng)], misses: [] }),
    apply: async (records) => {
      written.push(...records);
      return records.length;
    },
    ...over,
  };
}

describe("geocodeSoldPending", () => {
  it("writes a believable coordinate with the CRM's source_address shape", async () => {
    const d = soldDeps();
    const out = await geocodeSoldPending(d, 10);
    expect(out).toEqual({ considered: 1, placed: 1, unplaced: 0, rejected: 0 });
    expect(d.written).toEqual([
      {
        listing_key: "KEY1",
        lat: GOOD.lat,
        lng: GOOD.lng,
        source: "census",
        precision: "Exact",
        matched_address: null,
        source_address: "KEY1 Ferris Lane, Poughkeepsie, NY 12601",
      },
    ]);
  });

  it("does not write a coordinate the quality gate rejects", async () => {
    const d = soldDeps({ geocode: async () => ({ hits: [hit("KEY1", FAR.lat, FAR.lng, "Non_Exact")], misses: [] }) });
    const out = await geocodeSoldPending(d, 10);
    expect(out).toEqual({ considered: 1, placed: 0, unplaced: 1, rejected: 1 });
    expect(d.written).toHaveLength(0);
  });

  it("records NO misses — an unplaceable sale is retried next tick, never marked", async () => {
    const d = soldDeps({ geocode: async () => ({ hits: [], misses: [row("KEY1")] }) });
    const out = await geocodeSoldPending(d, 10);
    expect(out).toEqual({ considered: 1, placed: 0, unplaced: 1, rejected: 0 });
    expect(d.written).toHaveLength(0);
  });

  it("asks for nothing and writes nothing when the budget is zero", async () => {
    const listPending = vi.fn();
    await expect(geocodeSoldPending(soldDeps({ listPending }), 0)).resolves.toEqual({
      considered: 0, placed: 0, unplaced: 0, rejected: 0,
    });
    expect(listPending).not.toHaveBeenCalled();
  });
});
