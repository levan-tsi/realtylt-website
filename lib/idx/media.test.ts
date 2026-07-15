import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __seedSnapshotMediaForTests,
  getProxiedPhotoPaths,
  getSnapshotMediaUrls,
  resetMediaCacheForTests,
} from "./media";
import { __resetMlsGridDataCallCount, mlsGridDataCallCount } from "./mls-fetch";

beforeEach(() => {
  resetMediaCacheForTests();
  __resetMlsGridDataCallCount();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSnapshotMediaUrls — reads the committed snapshot, never MLS", () => {
  it("returns the listing's ordered permanent MediaURLs from the snapshot", () => {
    __seedSnapshotMediaForTests("L1", [
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
    ]);
    expect(getSnapshotMediaUrls("L1")).toEqual([
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
    ]);
  });

  it("returns [] for a listing with no stored photos or an unknown id", () => {
    expect(getSnapshotMediaUrls("UNKNOWNID")).toEqual([]);
  });

  it("rejects malformed ids", () => {
    expect(getSnapshotMediaUrls("../etc/passwd")).toEqual([]);
  });

  it("makes ZERO MLS Grid DATA-API calls (never fetches)", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    __seedSnapshotMediaForTests("L1", ["https://media.mlsgrid.com/a/0.jpg"]);
    getSnapshotMediaUrls("L1");
    getSnapshotMediaUrls("L1");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mlsGridDataCallCount()).toBe(0);
  });
});

describe("getProxiedPhotoPaths", () => {
  it("maps the snapshot's photo count to /api/media proxy paths", async () => {
    __seedSnapshotMediaForTests("L1", [
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
    ]);
    expect(await getProxiedPhotoPaths("L1")).toEqual(["/api/media/L1/0", "/api/media/L1/1"]);
  });

  it("falls back to the single primary path when the snapshot has no photos", async () => {
    expect(await getProxiedPhotoPaths("L1")).toEqual(["/api/media/L1/0"]);
  });
});
