import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetMlsGridDataCallCount,
  mlsGridDataCallCount,
  mlsGridDataFetch,
  runInRefreshContext,
} from "./mls-fetch";

// A committed snapshot exists in tests (data/mls-snapshot.json), so the guard is armed.

beforeEach(() => {
  __resetMlsGridDataCallCount();
  vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
});
afterEach(() => vi.unstubAllGlobals());

describe("mlsGridDataFetch — the suspension guard", () => {
  it("THROWS when called from a request path (outside the refresh context)", async () => {
    // This is the exact class of call (per-view DATA-API lookup) that suspended the account.
    expect(() => mlsGridDataFetch("https://api.mlsgrid.com/v2/Property?$filter=...")).toThrow(
      /non-refresh \(request\) path/,
    );
    expect(mlsGridDataCallCount()).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("ALLOWS the call inside runInRefreshContext (the cron/export) and counts it", async () => {
    await runInRefreshContext(async () => {
      await mlsGridDataFetch("https://api.mlsgrid.com/v2/Property?$filter=...");
    });
    expect(mlsGridDataCallCount()).toBe(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("re-arms after the refresh context exits (no leakage to later request-path calls)", async () => {
    await runInRefreshContext(async () => {
      await mlsGridDataFetch("https://api.mlsgrid.com/v2/Property");
    });
    expect(() => mlsGridDataFetch("https://api.mlsgrid.com/v2/Property")).toThrow();
    expect(mlsGridDataCallCount()).toBe(1); // the thrown call was NOT counted
  });
});
