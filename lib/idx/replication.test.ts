import { describe, expect, it } from "vitest";
import { FIXTURE_LISTINGS } from "./fixture-data";
import {
  applyCachedPhotos,
  EPOCH_TS,
  mergeListings,
  newPassState,
  parsePassState,
  parseSnapshot,
  photoPathname,
  photosByListing,
  planPhotoFetches,
} from "./replication";

const L = (id: string, photos: string[]) => ({ id, photos });

describe("planPhotoFetches", () => {
  it("prioritizes photo 0 of every listing before any deeper photo", () => {
    const plan = planPhotoFetches(
      [L("A", ["a0", "a1", "a2"]), L("B", ["b0", "b1"]), L("C", ["c0"])],
      new Set(),
      4,
    );
    expect(plan.map((p) => p.pathname)).toEqual([
      "mls/photos/A/0.jpg",
      "mls/photos/B/0.jpg",
      "mls/photos/C/0.jpg",
      "mls/photos/A/1.jpg",
    ]);
    expect(plan[0].url).toBe("a0");
  });

  it("skips already-cached photos and respects the budget", () => {
    const cached = new Set([photoPathname("A", 0), photoPathname("B", 0)]);
    const plan = planPhotoFetches(
      [L("A", ["a0", "a1"]), L("B", ["b0", "b1"])],
      cached,
      1,
    );
    expect(plan).toEqual([{ pathname: "mls/photos/A/1.jpg", url: "a1" }]);
  });

  it("returns everything missing when the budget exceeds the need, then stops", () => {
    const plan = planPhotoFetches([L("A", ["a0"]), L("B", [])], new Set(), 99);
    expect(plan).toEqual([{ pathname: "mls/photos/A/0.jpg", url: "a0" }]);
  });

  it("handles a zero budget and empty input", () => {
    expect(planPhotoFetches([L("A", ["a0"])], new Set(), 0)).toEqual([]);
    expect(planPhotoFetches([], new Set(), 10)).toEqual([]);
  });
});

describe("applyCachedPhotos", () => {
  it("swaps source URLs for Blob URLs in order and drops uncached ones", () => {
    const base = { ...FIXTURE_LISTINGS[0], id: "X", photos: ["s0", "s1", "s2"] };
    const cached = new Map([
      [photoPathname("X", 0), "https://blob/X0"],
      [photoPathname("X", 2), "https://blob/X2"],
    ]);
    const [out] = applyCachedPhotos([base], cached);
    expect(out.photos).toEqual(["https://blob/X0", "https://blob/X2"]);
  });

  it("yields photos: [] (NoPhoto placeholder path) when nothing is cached yet", () => {
    const base = { ...FIXTURE_LISTINGS[0], id: "Y", photos: ["s0", "s1"] };
    const [out] = applyCachedPhotos([base], new Map());
    expect(out.photos).toEqual([]);
    expect(out.id).toBe("Y"); // rest of the listing untouched
  });

  it("restores cached photos for accumulated listings whose own photo array is stripped", () => {
    // Pass-state listings persist with photos: [] (signed URLs expire) — the durable
    // Blob cache is the ground truth at publish time.
    const base = { ...FIXTURE_LISTINGS[0], id: "Z", photos: [] as string[] };
    const cached = new Map([[photoPathname("Z", 1), "https://blob/Z1"]]);
    const [out] = applyCachedPhotos([base], cached);
    expect(out.photos).toEqual(["https://blob/Z1"]);
  });
});

describe("photosByListing", () => {
  it("groups the Blob cache by listing id, ordered by photo index", () => {
    const cache = new Map([
      [photoPathname("A", 2), "a2"],
      [photoPathname("B", 0), "b0"],
      [photoPathname("A", 0), "a0"],
      [photoPathname("A", 10), "a10"],
      ["mls/other/junk.txt", "nope"], // foreign pathnames ignored
    ]);
    const grouped = photosByListing(cache);
    expect(grouped.get("A")).toEqual(["a0", "a2", "a10"]); // numeric, not lexicographic
    expect(grouped.get("B")).toEqual(["b0"]);
    expect(grouped.size).toBe(2);
  });
});

describe("mergeListings", () => {
  const A = { ...FIXTURE_LISTINGS[0], id: "A", price: 100 };
  const B = { ...FIXTURE_LISTINGS[0], id: "B", price: 200 };

  it("updates win by id and new ids append", () => {
    const merged = mergeListings([A, B], [{ ...A, price: 111 }, { ...B, id: "C" }]);
    expect(merged).toHaveLength(3);
    expect(merged.find((l) => l.id === "A")?.price).toBe(111);
    expect(merged.map((l) => l.id)).toEqual(["A", "B", "C"]);
  });

  it("handles empty sides", () => {
    expect(mergeListings([], [A])).toEqual([A]);
    expect(mergeListings([A], [])).toEqual([A]);
  });
});

describe("parsePassState", () => {
  it("round-trips a fresh pass state", () => {
    const state = newPassState();
    expect(state.watermark).toBe(EPOCH_TS);
    expect(parsePassState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it("preserves accumulated listings and lastPass stats", () => {
    const state = {
      ...newPassState(),
      listings: FIXTURE_LISTINGS.slice(0, 2),
      lastPass: { completedAt: new Date().toISOString(), feedActiveScanned: 5000, kept: 900 },
    };
    expect(parsePassState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it("rejects malformed payloads (never resume from garbage)", () => {
    expect(parsePassState(null)).toBeNull();
    expect(parsePassState("nope")).toBeNull();
    expect(parsePassState({ watermark: EPOCH_TS })).toBeNull();
    expect(parsePassState({ startedAt: "x", watermark: "not-a-date", scanned: 0, listings: [] })).toBeNull();
    expect(parsePassState({ startedAt: "x", watermark: EPOCH_TS, scanned: "1", listings: [] })).toBeNull();
    expect(parsePassState({ startedAt: "x", watermark: EPOCH_TS, scanned: 0, listings: "no" })).toBeNull();
  });
});

describe("parseSnapshot", () => {
  it("round-trips a valid snapshot", () => {
    const snap = {
      syncedAt: new Date().toISOString(),
      listings: FIXTURE_LISTINGS.slice(0, 3),
    };
    expect(parseSnapshot(JSON.parse(JSON.stringify(snap)))).toEqual(snap);
  });

  it("rejects malformed payloads", () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot("nope")).toBeNull();
    expect(parseSnapshot({ listings: [] })).toBeNull(); // no syncedAt
    expect(parseSnapshot({ syncedAt: "not-a-date", listings: [] })).toBeNull();
    expect(parseSnapshot({ syncedAt: new Date().toISOString(), listings: [{ id: 1 }] })).toBeNull();
  });
});
