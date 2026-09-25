import { describe, expect, it } from "vitest";
import { CORE_RGB, GLOW_ALPHA, HALO_ALPHA, HALO_ALPHA_NARROW, HALO_RGB, LIT_RGB, NARROW_ANCHORS, WIDE_ANCHORS, coreProfile, featuredGlyph, glowProfile, glyphAdd, glyphAt, haloProfile, litGlyph, reachOf } from "./glyph";
import { densityGap } from "./cameras";

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

  it("meets every anchor exactly and holds past the ends (the glow off: its radius 0)", () => {
    const w = (g: object) => ({ ...g, glow: 0, glowAlpha: 0 });
    for (const [r, g] of WIDE_ANCHORS) expect(glyphAt(r)).toEqual(w(g));
    for (const [r, g] of NARROW_ANCHORS) expect(glyphAt(r, { narrow: true })).toEqual(w(g));
    expect(glyphAt(1_000_000)).toEqual(w(WIDE_ANCHORS[WIDE_ANCHORS.length - 1][1]));
    expect(glyphAt(10)).toEqual(w(WIDE_ANCHORS[0][1]));
  });

  it("is a point at the territory's height (a scatter, never a glow) and the phone's is stronger", () => {
    const far = glyphAt(145_000), phone = glyphAt(156_000, { narrow: true });
    expect(far.core).toBeLessThanOrEqual(2);
    expect(far.halo).toBeLessThanOrEqual(9);
    expect(phone.core).toBeGreaterThan(far.core);
    expect(phone.haloAlpha).toBeGreaterThan(far.haloAlpha);
  });

  /** Round 58, the owner's fifth verdict: "a round yellow and the brightness around it is too big;
   * it should be half, or even less, if not nothing at all." The halo is half round 57.8's (which
   * was 6 to 8 px on a laptop) and the glow is gone by default: a light's whole reach is under
   * 4 px at every range, the core itself unchanged. */
  it("round 58: the halo is at most 4 px and the light reaches no further (the glow off)", () => {
    for (const narrow of [false, true]) {
      for (const r of RANGES) {
        const g = glyphAt(r, { narrow });
        expect(g.halo).toBeLessThanOrEqual(4);
        expect(g.halo).toBeGreaterThanOrEqual(3);
        expect(g.glow).toBe(0);
        expect(g.glowAlpha).toBe(0);
        expect(reachOf(g)).toBe(g.halo);
        expect(glyphAdd(g, g.halo + 0.01)).toEqual([0, 0, 0]);
      }
    }
    expect(GLOW_ALPHA).toBe(0);
  });

  it("`?halo=` scales the halo's radius alone (the comparison's knob)", () => {
    const g = glyphAt(40_000), h = glyphAt(40_000, { halo: 0.5 }), f = glyphAt(40_000, { halo: 2 });
    expect(h.halo).toBeCloseTo(g.halo / 2);
    expect(f.halo).toBeCloseTo(g.halo * 2);
    expect(h.core).toBe(g.core);
    expect(h.haloAlpha).toBe(g.haloAlpha);
    expect(glyphAt(40_000, { halo: 0 })).toEqual(g);
    expect(glyphAt(40_000, { halo: 1 })).toEqual(g);
  });
});

/** Round 59, the owner's sixth verdict: "make that yellow dots just yellow, like a light, but don't
 * give brightness around it, maybe just a little bit, like five, ten percent, nothing more." */
describe("round 59: a yellow light, a whisper of a halo", () => {
  const RANGES = [300_000, 156_000, 145_000, 72_500, 40_000, 21_000, 5_000, 1_500];

  it("the core is whitish-yellow: R full, G and B in the lamp's band, G above B (never grey, never saturated)", () => {
    const [r, g, b] = CORE_RGB;
    expect(r).toBe(255);
    expect(g).toBeGreaterThanOrEqual(200);
    expect(g).toBeLessThanOrEqual(235);
    expect(b).toBeGreaterThanOrEqual(135);
    expect(b).toBeLessThanOrEqual(195);
    expect(g).toBeGreaterThan(b + 20);
    // the halo is the same hue: its channels in the same order and ratio band
    expect(HALO_RGB[0]).toBe(255);
    expect(HALO_RGB[1]).toBeLessThanOrEqual(g);
    expect(HALO_RGB[2]).toBeLessThanOrEqual(b);
    const [cr, cg, cb] = glyphAdd(glyphAt(40_000), 0);
    expect(cg / cr).toBeGreaterThan(0.78);
    expect(cg / cr).toBeLessThan(0.93);
    expect(cb).toBeLessThan(cg);
  });

  it("the halo is at most 10 percent and reaches at most 2 core radii, at every range, both widths", () => {
    expect(HALO_ALPHA).toBeLessThanOrEqual(0.1);
    expect(HALO_ALPHA_NARROW).toBeLessThanOrEqual(0.1);
    for (const narrow of [false, true]) {
      for (const r of RANGES) {
        const g = glyphAt(r, { narrow });
        expect(g.haloAlpha).toBeGreaterThan(0);
        expect(g.haloAlpha).toBeLessThanOrEqual(0.1);
        expect(g.halo).toBeLessThanOrEqual(2 * g.core);
        expect(reachOf(g)).toBeLessThanOrEqual(2 * g.core);
      }
    }
  });

  it("`?ha=` sets the halo's strength; 0 is a bare dot whose reach is the core", () => {
    const g = glyphAt(40_000, { ha: 0.05 });
    expect(g.haloAlpha).toBeCloseTo(0.05);
    const bare = glyphAt(40_000, { ha: 0 });
    expect(bare.haloAlpha).toBe(0);
    expect(reachOf(bare)).toBe(bare.core);
    expect(glyphAdd(bare, bare.core + 0.01)).toEqual([0, 0, 0]);
    expect(glyphAt(40_000, { ha: -1 })).toEqual(glyphAt(40_000));
  });

  it("`?core=` reaches the glyph and its colour, through lit and featured; a bad value is ignored", () => {
    const c = [255, 200, 140] as const;
    const g = glyphAt(40_000, { core: c });
    expect(g.coreRgb).toEqual(c);
    expect(glyphAdd(g, 0)[1]).toBeCloseTo(200 + HALO_RGB[1] * g.haloAlpha);
    expect(litGlyph(g, 0.5).coreRgb).toEqual(c);
    expect(featuredGlyph(g).coreRgb).toEqual(c);
    expect(glyphAt(40_000).coreRgb).toBeUndefined();
    expect(glyphAt(40_000, { core: [255, 300, 0] }).coreRgb).toBeUndefined();
    expect(glyphAt(40_000, { core: [NaN, 1, 2] }).coreRgb).toBeUndefined();
    expect(glyphAt(40_000, { core: [255, 212] }).coreRgb).toBeUndefined();
  });

  it("a lit light is brighter than the resting one at its centre (white, among yellow) and larger", () => {
    const g = glyphAt(40_000), l = litGlyph(g, 1);
    // the layer's bake eases the core toward LIT_RGB with the lit amount; fully lit it is LIT_RGB
    const lit = glyphAdd(l, 0, 1, LIT_RGB);
    const rest = glyphAdd(g, 0);
    expect(lit[1] + lit[2]).toBeGreaterThan(rest[1] + rest[2] + 60);
    expect(reachOf(l)).toBeGreaterThan(reachOf(g));
  });

  it("a featured light's halo stays a whisper (a proportion up, no ring)", () => {
    for (const narrow of [false, true]) {
      const f = featuredGlyph(glyphAt(40_000, { narrow }));
      expect(f.haloAlpha).toBeLessThanOrEqual(0.13);
      expect(f.core).toBeGreaterThan(glyphAt(40_000, { narrow }).core);
      expect(reachOf(f)).toBeGreaterThanOrEqual(f.core);
    }
  });
});

describe("the neighbourhood glow (round 57.8; off since round 58, kept for `?glow=`)", () => {
  const RANGES = [300_000, 145_000, 100_000, 72_500, 48_000, 35_000, 21_000, 5_000];
  const ON = { glow: 0.12 };

  it("is a wide, soft, faint warm halo, its radius by the range, eased", () => {
    for (const narrow of [false, true]) {
      const g = RANGES.map((r) => glyphAt(r, { narrow, ...ON }));
      for (let i = 1; i < g.length; i++) expect(g[i].glow).toBeGreaterThanOrEqual(g[i - 1].glow);
      for (let r = 2_000; r < 200_000; r *= 1.02) expect(Math.abs(glyphAt(r, { narrow, ...ON }).glow - glyphAt(r * 1.02, { narrow, ...ON }).glow)).toBeLessThan(0.6);
    }
    for (const r of RANGES) {
      const g = glyphAt(r, ON);
      expect(g.glowAlpha).toBeGreaterThanOrEqual(0.08);
      expect(g.glowAlpha).toBeLessThanOrEqual(0.18);
      expect(g.glow).toBeGreaterThan(2.5 * g.halo);
    }
  });

  it("reaches past the gap, so the glows of neighbours overlap into one warm ground", () => {
    for (const r of RANGES) {
      expect(glyphAt(r, ON).glow).toBeGreaterThanOrEqual(1.5 * densityGap(r));
      expect(glyphAt(r, { narrow: true, ...ON }).glow).toBeGreaterThanOrEqual(1.5 * densityGap(r, true));
    }
  });

  it("takes a strength (the lab's three), held to 0.08..0.18; 0 and the default are none", () => {
    expect(glyphAt(40_000, { glow: 0.18 }).glowAlpha).toBeCloseTo(0.18);
    expect(glyphAt(40_000, { glow: 0.5 }).glowAlpha).toBeCloseTo(0.18);
    expect(glyphAt(40_000, { glow: 0.02 }).glowAlpha).toBeCloseTo(0.08);
    expect(glyphAt(40_000, { glow: 0 }).glowAlpha).toBe(0);
    expect(glyphAt(40_000, { glow: 0 }).glow).toBe(0);
    expect(glyphAt(40_000).glowAlpha).toBe(0);
  });

  it("adds a little warmth between the halo and the glow's edge, never more than its strength", () => {
    const g = glyphAt(40_000, ON);
    const [r, gg, b] = glyphAdd(g, (g.halo + g.glow) / 2);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThanOrEqual(255 * g.glowAlpha);
    expect(r).toBeGreaterThan(b);
    expect(gg).toBeGreaterThan(b);
    expect(glowProfile(0)).toBe(1);
    expect(glowProfile(1)).toBe(0);
  });

  it("swells when the light is lit, in place", () => {
    const g = glyphAt(40_000, ON), l = litGlyph(g, 1);
    expect(l.glow).toBeGreaterThanOrEqual(1.4 * g.glow);
    expect(l.glowAlpha).toBeGreaterThan(g.glowAlpha);
    expect(litGlyph(g, 0)).toEqual(g);
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
  it("adds the lamp's warmth at the centre and nothing past the halo", () => {
    const [r, gg, b] = glyphAdd(g, 0);
    expect(r).toBeGreaterThan(b);
    expect(gg).toBeGreaterThan(b);
    expect(glyphAdd(g, reachOf(g) + 1)).toEqual([0, 0, 0]);
  });
});
