import { describe, expect, it } from "vitest";
import { boundsOfPins, chipPrice, spreadPins } from "./map-shared";
import type { MapPin } from "@/lib/idx/types";

const pin = (over: Partial<MapPin>): MapPin => ({
  id: "X",
  price: 500_000,
  lat: 41.5,
  lng: -74,
  address: "1 Main St",
  city: "Beacon",
  zip: "12508",
  beds: 3,
  baths: 2,
  office: "Test Realty",
  ...over,
});

describe("chipPrice — floored, live-style", () => {
  it("floors thousands under $1M (never rounds up)", () => {
    expect(chipPrice(875_000)).toBe("$875K");
    expect(chipPrice(879_900)).toBe("$879K"); // NOT $880K
    expect(chipPrice(999_999)).toBe("$999K");
    expect(chipPrice(499_500)).toBe("$499K");
  });

  it("formats millions to 3 significant figures, trailing zeros trimmed", () => {
    expect(chipPrice(1_000_000)).toBe("$1M");
    expect(chipPrice(1_300_000)).toBe("$1.3M");
    expect(chipPrice(1_250_000)).toBe("$1.25M");
    expect(chipPrice(1_800_000)).toBe("$1.8M");
    expect(chipPrice(2_250_000)).toBe("$2.25M");
    expect(chipPrice(4_790_000)).toBe("$4.79M");
  });

  it("floors millions down (3 sig figs, no rounding up)", () => {
    expect(chipPrice(1_299_000)).toBe("$1.29M");
    expect(chipPrice(1_059_000)).toBe("$1.05M");
  });

  it("guards non-finite / non-positive input", () => {
    expect(chipPrice(0)).toBe("$0");
    expect(chipPrice(Number.NaN)).toBe("$0");
    expect(chipPrice(-100)).toBe("$0");
  });
});

describe("spreadPins — deterministic same-zip fan-out", () => {
  it("leaves distinct coordinates untouched", () => {
    const a = pin({ id: "A", lat: 41.5, lng: -74.0 });
    const b = pin({ id: "B", lat: 41.6, lng: -73.9 });
    const out = spreadPins([a, b]);
    expect(out.find((p) => p.id === "A")).toMatchObject({ lat: 41.5, lng: -74.0 });
    expect(out.find((p) => p.id === "B")).toMatchObject({ lat: 41.6, lng: -73.9 });
  });

  it("fans out listings sharing a centroid into distinct, clickable coordinates", () => {
    const shared = [1, 2, 3, 4, 5].map((n) => pin({ id: `S${n}`, lat: 41.5, lng: -74.0 }));
    const out = spreadPins(shared);
    expect(out).toHaveLength(5);
    const coords = new Set(out.map((p) => `${p.lat.toFixed(6)}:${p.lng.toFixed(6)}`));
    expect(coords.size).toBe(5); // no two chips overlap
    // Stays near the shared centroid (still honest — coords were approximate anyway).
    for (const p of out) {
      expect(Math.abs(p.lat - 41.5)).toBeLessThan(0.01);
      expect(Math.abs(p.lng - -74.0)).toBeLessThan(0.02);
    }
  });

  it("is deterministic across renders (id-seeded, order-independent)", () => {
    const g = () => [3, 1, 2].map((n) => pin({ id: `S${n}`, lat: 41.5, lng: -74.0 }));
    const first = spreadPins(g());
    const second = spreadPins([...g()].reverse());
    const key = (ps: MapPin[]) =>
      ps
        .map((p) => `${p.id}:${p.lat.toFixed(8)}:${p.lng.toFixed(8)}`)
        .sort()
        .join("|");
    expect(key(first)).toBe(key(second));
  });
});

describe("boundsOfPins", () => {
  it("returns null with nothing to frame", () => {
    expect(boundsOfPins([])).toBeNull();
    expect(boundsOfPins([pin({ lat: 0, lng: 0 })])).toBeNull(); // Null Island excluded
  });

  it("computes the tight box over located pins", () => {
    const b = boundsOfPins([
      pin({ id: "A", lat: 41.2, lng: -74.3 }),
      pin({ id: "B", lat: 41.8, lng: -73.7 }),
    ]);
    expect(b).toEqual({ north: 41.8, south: 41.2, east: -73.7, west: -74.3 });
  });
});
