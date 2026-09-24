import { describe, expect, it } from "vitest";
import { PHONE_SETTLE_MS, PHONE_WARM_SHOTS, STALL_PATH, warmPlan } from "./warm-plan";
import type { ShotName } from "../night/shots";

const pageShots: ShotName[] = ["dutchess", "highlands", "westchester", "ulster", "harbour", "region"];
const q = (s = "") => new URLSearchParams(s);

/** Round 57.4: the Westchester stall is a one-time GPU shader compile that only a FLIGHT through
 * that path triggers; a 400 ms flight along it under the poster removes it on a laptop. */
describe("the pre-warm plan", () => {
  it("on a wide window opening at the territory shot, flies the stall's path under the poster", () => {
    const p = warmPlan({ pageShots, initial: "hero", narrow: false, q: q() });
    expect(p.shots).toEqual([...STALL_PATH]);
    // Round 57.11: at the close cameras the one-time stall (236 to 299 ms, the first flight into the
    // counties) is compiled by the long close flight Westchester -> Ulster, not by Highlands ->
    // Westchester alone (lag g1..g3: without it 298 / 236 ms, with it 55 / 56 / 97).
    expect(STALL_PATH).toEqual(["highlands", "westchester", "ulster"]);
    expect(p.mode).toBe("path");
    expect(p.flyMs).toBe(400);
    expect(p.settleMs).toBe(600);
    expect(p.backMs).toBe(2000);
    expect(p.budgetMs).toBeGreaterThan(5000);
  });

  it("round 57.10: on a phone at the territory shot, jumps to the first TWO shots whatever they take", () => {
    // Measured cold at 390: with both steps the first flight's worst frame is 90 ms; with none, or
    // with only Dutchess (a slower line made step one outlast the old 1.5 s budget), one 271 to
    // 292 ms frame at that flight's landing, 4 runs of 4. The cover's 14 s cap bounds the walk.
    const p = warmPlan({ pageShots, initial: "hero", narrow: true, q: q() });
    expect(p).toMatchObject({ shots: ["dutchess", "highlands"], mode: "jump" });
    expect(p.shots).toHaveLength(PHONE_WARM_SHOTS);
    expect(p.budgetMs).toBeGreaterThanOrEqual(14_000);
    expect(p.flyMs).toBeUndefined();
    // Round 57.11: at the close cameras a step waited up to its 4 s for tiles that stream for 3 to
    // 6 s; each step now waits at most PHONE_SETTLE_MS: the cover's hold after the first draw 2.95 /
    // 2.90 s against 5.33 / 3.42, the flights' frames the same (90 ms, lag p1..p2).
    expect(p.settleMs).toBe(PHONE_SETTLE_MS);
    expect(PHONE_SETTLE_MS).toBe(1200);
  });

  it("keeps the one-shot jump when the page opens mid-scroll (not at the territory shot)", () => {
    const p = warmPlan({ pageShots, initial: "harbour", narrow: false, q: q() });
    expect(p).toMatchObject({ shots: pageShots, mode: "jump", budgetMs: 1500 });
  });

  it("obeys the lab switches: none, the old walk, and every path setting", () => {
    expect(warmPlan({ pageShots, initial: "hero", narrow: false, q: q("warm=0") }).shots).toEqual([]);
    expect(warmPlan({ pageShots, initial: "hero", narrow: false, q: q("warm=full") })).toMatchObject({ shots: pageShots, mode: "jump", budgetMs: 1500 });
    expect(warmPlan({ pageShots, initial: "hero", narrow: false, q: q("warm=fly") })).toMatchObject({ shots: pageShots, mode: "fly" });
    const lite = warmPlan({ pageShots, initial: "hero", narrow: false, q: q("warm=lite") });
    expect(lite.mode).toBe("jump");
    expect(lite.shots).toEqual(expect.arrayContaining(["dutchess", "highlands", "westchester", "harbour", "region"]));
    const p = warmPlan({ pageShots, initial: "hero", narrow: true, q: q("warm=path&warmShots=highlands,westchester&warmFly=800&warmSettle=900&warmBack=3000&warmBudget=9000&warmOpen=1") });
    expect(p).toMatchObject({ shots: ["highlands", "westchester"], mode: "path", flyMs: 800, settleMs: 900, backMs: 3000, budgetMs: 9000, open: true });
  });

  it("drops shots the page does not have from ?warmShots=", () => {
    expect(warmPlan({ pageShots, initial: "hero", narrow: false, q: q("warm=path&warmShots=highlands,nowhere,westchester") }).shots).toEqual(["highlands", "westchester"]);
  });
});

describe("the cover's hold on an early scroll (round 57.6)", () => {
  it("holds the compile path under the cover and stops any other walk", async () => {
    const { earlyScroll } = await import("./warm-plan");
    expect(earlyScroll("path")).toBe("hold");
    expect(earlyScroll("jump")).toBe("abort");
    expect(earlyScroll("fly")).toBe("abort");
  });
  it("waits at most 2 s for the visitor's section after a scroll, the plan's own wait otherwise", async () => {
    const { backWaitMs, EARLY_BACK_MS } = await import("./warm-plan");
    expect(EARLY_BACK_MS).toBe(2000);
    expect(backWaitMs({ scrolled: true, backMs: 2000 })).toBe(2000);
    expect(backWaitMs({ scrolled: true })).toBe(2000);
    expect(backWaitMs({ scrolled: false })).toBe(4000);
    expect(backWaitMs({ scrolled: false, backMs: 2000 })).toBe(2000);
  });
  it("the whole hold after the map is first drawn is bounded: the path's steps plus the wait", async () => {
    const { backWaitMs, PATH_SETTLE_MS, PATH_FLY_MS } = await import("./warm-plan");
    const path = PATH_SETTLE_MS + PATH_FLY_MS + PATH_SETTLE_MS;
    expect(path).toBe(1600);
    expect(path + backWaitMs({ scrolled: true, backMs: 2000 })).toBeLessThanOrEqual(3600);
  });
});
