import { describe, expect, it } from "vitest";
import { STALL_PATH, warmPlan } from "./warm-plan";
import type { ShotName } from "../night/shots";

const pageShots: ShotName[] = ["dutchess", "highlands", "westchester", "ulster", "harbour", "region"];
const q = (s = "") => new URLSearchParams(s);

/** Round 57.4: the Westchester stall is a one-time GPU shader compile that only a FLIGHT through
 * that path triggers; a 400 ms flight along it under the poster removes it on a laptop. */
describe("the pre-warm plan", () => {
  it("on a wide window opening at the territory shot, flies the stall's path under the poster", () => {
    const p = warmPlan({ pageShots, initial: "hero", narrow: false, q: q() });
    expect(p.shots).toEqual([...STALL_PATH]);
    expect(p.mode).toBe("path");
    expect(p.flyMs).toBe(400);
    expect(p.settleMs).toBe(600);
    expect(p.backMs).toBe(2000);
    expect(p.budgetMs).toBeGreaterThan(5000);
  });

  it("keeps a phone on the one-shot jump (its flights never stalled)", () => {
    const p = warmPlan({ pageShots, initial: "hero", narrow: true, q: q() });
    expect(p).toMatchObject({ shots: pageShots, mode: "jump", budgetMs: 1500 });
    expect(p.flyMs).toBeUndefined();
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
