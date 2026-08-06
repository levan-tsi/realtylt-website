import { describe, expect, it, vi } from "vitest";
import { boundsOfPins, chipPrice, createPinFetcher, popupPlacement, spreadPins } from "./map-shared";
import type { MapPin } from "@/lib/idx/types";

const pin = (over: Partial<MapPin>): MapPin => ({
  id: "X",
  price: 500_000,
  lat: 41.5,
  lng: -74,
  address: "1 Main St",
  city: "Beacon",
  zip: "12508",
  photoCount: 0,
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

describe("popupPlacement — flips above/below so the popup never runs off the fold", () => {
  it("opens above by default when there is room (the chip's existing look)", () => {
    expect(popupPlacement({ top: 400, bottom: 426 }, 800)).toBe("above");
  });

  it("flips below when the anchor is near the top of the viewport", () => {
    // Only 40px above (a 300px popup can't fit); plenty below.
    expect(popupPlacement({ top: 40, bottom: 66 }, 800)).toBe("below");
  });

  it("stays above when neither side fully fits but above still has more room", () => {
    expect(popupPlacement({ top: 250, bottom: 276 }, 400)).toBe("above");
  });

  it("flips below when below has more room even if above is short", () => {
    expect(popupPlacement({ top: 60, bottom: 86 }, 900)).toBe("below");
  });
});

describe("createPinFetcher — debounced, race-safe /api/idx/pins fetches", () => {
  const bounds = { north: 41, south: 40, east: -73, west: -74 };

  it("debounces rapid requests into a single fetch", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ pins: [], total: 0 }) }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.stubGlobal("fetch", fetchMock as any);
    const onData = vi.fn();
    const { request } = createPinFetcher({ filtersQuery: "", onData, debounceMs: 100 });
    request(bounds);
    request(bounds);
    request(bounds);
    expect(fetchMock).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith([], 0);
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("drops a stale response — only the newest request's data reaches onData", async () => {
    vi.useFakeTimers();
    let call = 0;
    const fetchMock = vi.fn(async () => {
      call += 1;
      const mine = call;
      // The FIRST call resolves slower than the second, simulating an in-flight request for
      // bounds the visitor has already panned away from.
      const delayMs = mine === 1 ? 50 : 10;
      await new Promise((r) => setTimeout(r, delayMs));
      return { ok: true, json: async () => ({ pins: [], total: mine }) };
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.stubGlobal("fetch", fetchMock as any);
    const onData = vi.fn();
    const { request } = createPinFetcher({ filtersQuery: "", onData, debounceMs: 10 });
    request(bounds);
    await vi.advanceTimersByTimeAsync(10); // first debounce fires, first fetch starts
    request({ ...bounds, north: 42 });
    await vi.advanceTimersByTimeAsync(10); // second debounce fires, second fetch starts
    await vi.advanceTimersByTimeAsync(60); // both fetches settle
    expect(onData).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith([], 2); // the SECOND (newer) request's data, not the first
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
});
