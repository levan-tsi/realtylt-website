import { describe, expect, it } from "vitest";
import { buildClusterIndex, clusterExpansionZoom, getClusterEntries } from "./clustering";
import type { MapPin } from "@/lib/idx/types";

const makePin = (i: number, lat: number, lng: number): MapPin => ({
  id: `p${i}`,
  price: 500_000,
  lat,
  lng,
  address: `${i} Main St`,
  city: "Queens",
  zip: "11101",
  beds: 3,
  baths: 2,
  office: "Test Realty",
  photoCount: 1,
});

/** Queens' rough bounding box (task brief: "Queens alone is 9,740" — the dense-borough case
 * clustering exists for). Deterministic PRNG so a failing seed is reproducible. */
function densePins(n: number, seed = 1): MapPin[] {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const pins: MapPin[] = [];
  for (let i = 0; i < n; i++) {
    const lat = 40.54 + rand() * 0.26;
    const lng = -73.96 + rand() * 0.26;
    pins.push(makePin(i, lat, lng));
  }
  return pins;
}

const QUEENS_BOUNDS = { north: 40.9, south: 40.4, east: -73.6, west: -74.1 };

describe("clustering — count correctness (the map's core promise)", () => {
  it("sums to exactly the number of pins in view, at every zoom from borough to street level", () => {
    const pins = densePins(4000);
    const index = buildClusterIndex(pins);
    const byId = new Map(pins.map((p) => [p.id, p]));
    for (const zoom of [0, 4, 8, 10, 12, 14, 17, 20]) {
      const entries = getClusterEntries(index, byId, QUEENS_BOUNDS, zoom);
      const sum = entries.reduce((s, e) => s + (e.kind === "cluster" ? e.count : 1), 0);
      expect(sum, `zoom ${zoom}`).toBe(pins.length);
    }
  });

  it("never orphans or duplicates a pin across a full zoom-out sweep", () => {
    const pins = densePins(1200, 7);
    const index = buildClusterIndex(pins);
    const byId = new Map(pins.map((p) => [p.id, p]));
    const bounds = { north: 41.0, south: 40.0, east: -73.0, west: -75.0 };
    for (let z = 20; z >= 0; z--) {
      const entries = getClusterEntries(index, byId, bounds, z);
      const sum = entries.reduce((s, e) => s + (e.kind === "cluster" ? e.count : 1), 0);
      expect(sum, `zoom ${z}`).toBe(pins.length);
      // No feature should ever double-count or vanish a specific pin id either.
      const seenIds = new Set<string>();
      for (const e of entries) {
        if (e.kind !== "pin") continue;
        expect(seenIds.has(e.pin.id), `duplicate ${e.pin.id} at zoom ${z}`).toBe(false);
        seenIds.add(e.pin.id);
      }
    }
  });

  it("at the index's max zoom, every entry is an individual, unclustered pin", () => {
    const pins = densePins(500, 3);
    const index = buildClusterIndex(pins);
    const byId = new Map(pins.map((p) => [p.id, p]));
    const entries = getClusterEntries(index, byId, QUEENS_BOUNDS, 20);
    expect(entries.every((e) => e.kind === "pin")).toBe(true);
    expect(entries.length).toBe(pins.length);
  });

  it("a sparse, spread-out set never clusters at a close zoom", () => {
    const pins = [makePin(1, 41.5, -74.0), makePin(2, 41.9, -73.4), makePin(3, 40.9, -74.5)];
    const index = buildClusterIndex(pins);
    const byId = new Map(pins.map((p) => [p.id, p]));
    const entries = getClusterEntries(index, byId, { north: 42, south: 40.5, east: -73, west: -75 }, 14);
    expect(entries.filter((e) => e.kind === "pin")).toHaveLength(3);
  });

  it("clusterExpansionZoom always increases toward street level (a click zooms IN)", () => {
    const pins = densePins(2000, 11);
    const index = buildClusterIndex(pins);
    const byId = new Map(pins.map((p) => [p.id, p]));
    const entries = getClusterEntries(index, byId, QUEENS_BOUNDS, 8);
    const cluster = entries.find((e) => e.kind === "cluster");
    expect(cluster).toBeDefined();
    if (cluster && cluster.kind === "cluster") {
      const target = clusterExpansionZoom(index, cluster.id);
      expect(target).toBeGreaterThan(8);
    }
  });

  it("bounds outside every pin return nothing (an empty viewport clusters to nothing)", () => {
    const pins = densePins(200, 5);
    const index = buildClusterIndex(pins);
    const byId = new Map(pins.map((p) => [p.id, p]));
    const entries = getClusterEntries(index, byId, { north: 1, south: 0, east: 1, west: 0 }, 10);
    expect(entries).toHaveLength(0);
  });
});
