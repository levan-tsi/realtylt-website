import { describe, expect, it } from "vitest";
import { classifyProbe, parseReconcileState, planTick, RECONCILE, sanityOk, type ReconcileState } from "./reconcile";

const T0 = Date.parse("2026-10-20T09:05:00Z");
const h = (n: number) => n * 3600_000;
const base: ReconcileState = { startedAt: new Date(T0 - h(1)).toISOString(), nextLink: null, pages: 94, scanned: 46614 };

describe("planTick", () => {
  it("starts a run when nothing has ever run", () => {
    expect(planTick(null, T0)).toBe("start");
  });

  it("resumes a fresh run whose walk still has a nextLink", () => {
    expect(planTick({ ...base, nextLink: "https://api.example/next" }, T0)).toBe("resume");
  });

  it("finishes a fresh run whose walk is done but not yet judged (also after a dry run)", () => {
    expect(planTick(base, T0)).toBe("finish");
    expect(planTick({ ...base, dryAt: new Date(T0 - h(0.5)).toISOString() }, T0)).toBe("finish");
  });

  it("abandons a run that has not completed inside the stale window and starts over", () => {
    const old = new Date(T0 - h(RECONCILE.staleRunHours + 1)).toISOString();
    expect(planTick({ ...base, startedAt: old, nextLink: "https://api.example/next" }, T0)).toBe("start");
    expect(planTick({ ...base, startedAt: old }, T0)).toBe("start");
  });

  it("is quiet for the rest of the day after a completed run, then starts the next one", () => {
    const done = { ...base, completedAt: new Date(T0 - h(2)).toISOString() };
    expect(planTick(done, T0)).toBe("noop");
    expect(planTick(done, T0 + h(RECONCILE.minHoursBetweenRuns))).toBe("start");
  });

  it("force restarts a completed run but continues one in progress", () => {
    const done = { ...base, completedAt: new Date(T0 - h(2)).toISOString() };
    expect(planTick(done, T0, true)).toBe("start");
    expect(planTick({ ...base, nextLink: "https://api.example/next" }, T0, true)).toBe("resume");
    expect(planTick(base, T0, true)).toBe("finish");
  });
});

describe("classifyProbe", () => {
  type Row = { ListingId?: string; ListingKey?: string; StandardStatus?: string };
  const showable = (r: Row) => r.StandardStatus === "Active";

  it("sorts ids into still-on-market, off-market, and absent from the feed", () => {
    const rows: Row[] = [
      { ListingId: "A", StandardStatus: "Active" },
      { ListingId: "B", StandardStatus: "Closed" },
      { ListingKey: "C", StandardStatus: "Hold" },
    ];
    expect(classifyProbe(["A", "B", "C", "D"], rows, showable)).toEqual({
      onMarket: ["A"],
      offMarket: ["B", "C"],
      absent: ["D"],
    });
  });

  it("treats a row the feed returns but we did not ask about as noise", () => {
    expect(classifyProbe(["A"], [{ ListingId: "Z", StandardStatus: "Active" }], showable)).toEqual({
      onMarket: [],
      offMarket: [],
      absent: ["A"],
    });
  });
});

describe("sanityOk", () => {
  it("accepts a walk at least half the size of what we serve and rejects a plainly broken one", () => {
    expect(sanityOk(46614, 27507)).toBe(true);
    expect(sanityOk(13754, 27507)).toBe(true);
    expect(sanityOk(13000, 27507)).toBe(false);
    expect(sanityOk(0, 0)).toBe(false);
  });
});

describe("parseReconcileState", () => {
  it("accepts the stored shape and rejects garbage", () => {
    expect(parseReconcileState(base)).toEqual(base);
    expect(parseReconcileState({ ...base, nextLink: "https://x" })).not.toBeNull();
    expect(parseReconcileState(null)).toBeNull();
    expect(parseReconcileState({ startedAt: "not a date", nextLink: null, pages: 0, scanned: 0 })).toBeNull();
    expect(parseReconcileState({ startedAt: base.startedAt, nextLink: 5, pages: 0, scanned: 0 })).toBeNull();
    expect(parseReconcileState({ startedAt: base.startedAt, nextLink: null })).toBeNull();
  });
});
