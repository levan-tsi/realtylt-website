import { describe, expect, it } from "vitest";
import { NARROW_ANCHORS, WIDE_ANCHORS, coreProfile, featuredGlyph, glyphAdd, glyphAt, haloProfile, litGlyph } from "./glyph";

/** Round 57.6: the light on our canvas, its size read continuously from the range (the tiers
 * eased), the same numbers the cover is drawn with. */
describe("the light's glyph by range", () => {
  const RANGES = [300_000, 156_000, 145_000, 110_000, 100_000, 72_500, 48_000, 40_000, 36_250, 21_000, 5_000, 1_500];

  it("grows, and its halo strengthens, only as the camera comes down", () => {
    for (const narrow of [false, true]) {
      const g = RANGES.map((r) => glyphAt(r, { narrow }));
      for (let i = 1; i < g.length; i++) {
        expect(g[i].core).toBeGreaterThanOrEqual(g[i - 1].core);
        expect(g[i].halo).toBeGreaterThanOrEqual(g[i - 1].halo);
      }
    }
  });

  it("is EASED: no step between two nearby ranges anywhere on the ladder (no pop between tiers)", () => {
    for (const narrow of [false, true]) {
      for (let r = 2_000; r < 200_000; r *= 1.02) {
        const a = glyphAt(r, { narrow }), b = glyphAt(r * 1.02, { narrow });
        expect(Math.abs(a.core - b.core)).toBeLessThan(0.05);
        expect(Math.abs(a.halo - b.halo)).toBeLessThan(0.25);
        expect(Math.abs(a.haloAlpha - b.haloAlpha)).toBeLessThan(0.01);
      }
    }
  });

  it("meets every anchor exactly and holds past the ends", () => {
    for (const [r, g] of WIDE_ANCHORS) expect(glyphAt(r)).toEqual(g);
    for (const [r, g] of NARROW_ANCHORS) expect(glyphAt(r, { narrow: true })).toEqual(g);
    expect(glyphAt(1_000_000)).toEqual(WIDE_ANCHORS[WIDE_ANCHORS.length - 1][1]);
    expect(glyphAt(10)).toEqual(WIDE_ANCHORS[0][1]);
  });

  it("is a point at the territory's height (a scatter, never a glow) and the phone's is stronger", () => {
    const far = glyphAt(145_000), phone = glyphAt(156_000, { narrow: true });
    expect(far.core).toBeLessThanOrEqual(2);
    expect(far.halo).toBeLessThanOrEqual(9);
    expect(phone.core).toBeGreaterThan(far.core);
    expect(phone.haloAlpha).toBeGreaterThan(far.haloAlpha);
  });
});

describe("the lit and featured lights", () => {
  const g = glyphAt(40_000);
  it("lit is larger and brighter, in place, and 0 is the light itself", () => {
    expect(litGlyph(g, 0)).toEqual(g);
    const l = litGlyph(g, 1);
    expect(l.core).toBeGreaterThan(g.core * 1.4);
    expect(l.halo).toBeGreaterThan(g.halo);
    expect(l.haloAlpha).toBeGreaterThan(g.haloAlpha);
    expect(l.haloAlpha).toBeLessThanOrEqual(0.95);
  });
  it("lighting is monotone in k (the ease never overshoots)", () => {
    let prev = litGlyph(g, 0);
    for (let k = 0.1; k <= 1.0001; k += 0.1) {
      const l = litGlyph(g, k);
      expect(l.core).toBeGreaterThanOrEqual(prev.core);
      prev = l;
    }
  });
  it("a featured light is a touch larger than the rest", () => {
    expect(featuredGlyph(g).core).toBeGreaterThan(g.core);
  });
});

describe("the profiles", () => {
  const g = glyphAt(40_000);
  it("the core is solid in its middle and gone at its radius", () => {
    expect(coreProfile(0)).toBe(1);
    expect(coreProfile(0.5)).toBe(1);
    expect(coreProfile(1)).toBe(0);
    expect(coreProfile(0.8)).toBeGreaterThan(0);
    expect(coreProfile(0.8)).toBeLessThan(1);
  });
  it("the halo falls smoothly to nothing", () => {
    expect(haloProfile(0)).toBe(1);
    expect(haloProfile(1)).toBe(0);
    for (let u = 0; u < 1; u += 0.05) expect(haloProfile(u + 0.05)).toBeLessThanOrEqual(haloProfile(u));
  });
  it("adds warm white at the centre and nothing past the halo", () => {
    const [r, gg, b] = glyphAdd(g, 0);
    expect(r).toBeGreaterThan(b);
    expect(gg).toBeGreaterThan(b);
    expect(glyphAdd(g, g.halo + 1)).toEqual([0, 0, 0]);
  });
});
