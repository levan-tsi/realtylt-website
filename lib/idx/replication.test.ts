import { describe, expect, it } from "vitest";
import { FIXTURE_LISTINGS } from "./fixture-data";
import {
  applyCachedPhotos,
  parseSnapshot,
  photoPathname,
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
