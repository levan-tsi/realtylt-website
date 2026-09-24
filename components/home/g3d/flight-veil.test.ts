import { describe, expect, it } from "vitest";
import { UNDRAWN_QUIET_MS, VEIL_HOLD_MS, VEIL_IN_MS, VEIL_OUT_MS, veilDepth, veilLift } from "./flight-veil";

/** Round 57.11: the flight IS the transition. The veil deepens as a flight starts, the lights carry
 * the picture across, and the photograph comes back only when the landed frame is sharp. */
describe("the flight's veil", () => {
  const base = { landedAt: 1000, lastTile: null as number | null, steady: false, drawn: false, watching: true };

  it("holds while the landed view's tiles are still arriving", () => {
    expect(veilLift({ ...base, now: 1900, lastTile: 1800 })).toBeNull();
  });

  it("lifts on quiet alone over a view the map has drawn before (its tiles resident)", () => {
    expect(veilLift({ ...base, now: 1300, drawn: true })).toBe("quiet");
    // never sooner than the quiet rule's own floor after the landing
    expect(veilLift({ ...base, now: 1200, drawn: true })).toBeNull();
  });

  it("on a view never drawn, quiet needs Google's steady beside it: a slow stream pauses", () => {
    expect(veilLift({ ...base, now: 1400 })).toBeNull();
    expect(veilLift({ ...base, now: 1400, steady: true })).toBe("steady");
    // Round 57.11, measured (landing desk1): a quiet of 300 ms after a 1.2 s floor fired during a pause
    // over the Westchester chapter at 0.09 of its settled sharpness, 210 tiles still to come.
    expect(veilLift({ ...base, now: 1000 + 2400, lastTile: 1000 + 2400 - UNDRAWN_QUIET_MS + 1 })).toBeNull();
    // ...but a long quiet does: no tile for UNDRAWN_QUIET_MS (0 false lifts in 16 cold landings,
    // against 4 at 300 ms and 1 at 500 ms: landing2 s1).
    expect(UNDRAWN_QUIET_MS).toBe(800);
    expect(veilLift({ ...base, now: 1000 + 2400, lastTile: 1000 + 2400 - UNDRAWN_QUIET_MS })).toBe("quiet");
    expect(veilLift({ ...base, now: 1000 + UNDRAWN_QUIET_MS - 1 })).toBeNull();
    // steady with the tiles still coming is not sharp
    expect(veilLift({ ...base, now: 1400, steady: true, lastTile: 1350 })).toBeNull();
  });

  it("lifts anyway at the hold's bound (2.5 s after the landing), whatever the tiles", () => {
    expect(VEIL_HOLD_MS).toBe(2500);
    expect(veilLift({ ...base, now: 1000 + VEIL_HOLD_MS - 1, lastTile: 1000 + VEIL_HOLD_MS - 2 })).toBeNull();
    expect(veilLift({ ...base, now: 1000 + VEIL_HOLD_MS, lastTile: 1000 + VEIL_HOLD_MS - 2 })).toBe("cap");
  });

  it("without a tile clock (no resource timing) waits for steady or the bound, never on quiet", () => {
    const blind = { ...base, watching: false };
    expect(veilLift({ ...blind, now: 2400, drawn: true })).toBeNull();
    expect(veilLift({ ...blind, now: 1500, steady: true })).toBe("steady");
    expect(veilLift({ ...blind, now: 1000 + VEIL_HOLD_MS })).toBe("cap");
  });

  it("deepens in 300 ms and lifts slower, and cuts with reduced motion", () => {
    expect(VEIL_IN_MS).toBe(300);
    expect(VEIL_OUT_MS).toBeGreaterThan(VEIL_IN_MS);
    expect(veilDepth({ flying: true })).toBeGreaterThanOrEqual(0.75);
    expect(veilDepth({ flying: true })).toBeLessThan(1);
    expect(veilDepth({ flying: false })).toBe(0);
    expect(veilDepth({ flying: true, depth: 0 })).toBe(0);
    expect(veilDepth({ flying: true, depth: 0.6 })).toBe(0.6);
    expect(veilDepth({ flying: true, depth: 7 })).toBeLessThan(1);
  });
});
