import { describe, expect, it } from "vitest";
import { FEATURED_GLYPH, glyphFor, glyphKey, lightSvg, litSvg } from "./glyph";

/** Round 57.2: the light's size and halo follow the range, so at altitude the lights stay points
 * and never merge into a glow. */
describe("the light's glyph by range", () => {
  const RANGES = [300_000, 156_000, 145_000, 110_000, 100_000, 72_500, 48_000, 40_000, 36_250, 21_000, 5_000];

  it("grows, and its halo strengthens, only as the camera comes down", () => {
    const g = RANGES.map((r) => glyphFor(r));
    for (let i = 1; i < g.length; i++) {
      expect(g[i].size).toBeGreaterThanOrEqual(g[i - 1].size);
      expect(g[i].halo).toBeGreaterThanOrEqual(g[i - 1].halo);
    }
  });

  it("is small with a faint halo at the territory shot and full size close in", () => {
    expect(glyphFor(145_000).size).toBeLessThanOrEqual(12);
    expect(glyphFor(145_000).halo).toBeLessThanOrEqual(0.3);
    expect(glyphFor(21_000).size).toBe(18);
  });

  it("comes in a few tiers only, so a flight between two county shots re-adds no marker", () => {
    expect(new Set(RANGES.map((r) => glyphFor(r).tier)).size).toBeLessThanOrEqual(3);
    expect(glyphFor(77_000).tier).toBe(glyphFor(56_000).tier);
  });

  it("draws an SVG of its own size, the halo at its own strength", () => {
    const g = glyphFor(145_000);
    const svg = lightSvg(g.size, g.halo);
    expect(svg).toContain(`width="${g.size}" height="${g.size}"`);
    expect(svg).toContain(`stop-opacity="${g.halo}"`);
  });

  it("keeps the featured homes a touch larger than the county lights", () => {
    expect(FEATURED_GLYPH).toBeGreaterThan(glyphFor(72_500).size);
  });

  it("draws the phone's far lights stronger, and only the phone's (round 57.3)", () => {
    const desk = glyphFor(156_000), phone = glyphFor(156_000, { narrow: true });
    expect(phone.size).toBeGreaterThan(desk.size);
    expect(phone.halo).toBeGreaterThan(desk.halo);
    expect(phone.core / phone.size).toBeGreaterThanOrEqual(desk.core / desk.size);
    expect(phone.size).toBeLessThanOrEqual(14);
    expect(glyphFor(60_000, { narrow: true })).toEqual(glyphFor(60_000));
    expect(glyphKey(phone)).not.toBe(glyphKey(glyphFor(60_000)));
  });
});

describe("the light, lit (round 57.3)", () => {
  it("keeps its size and anchor, goes to a white core and a 1.6x halo", () => {
    const g = glyphFor(60_000);
    const svg = litSvg(g.size, g.halo, g.core);
    expect(svg).toContain(`width="${g.size}" height="${g.size}"`);
    expect(svg).toContain(`stop-opacity="${Math.round(g.halo * 1.6 * 100) / 100}"`);
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain(`r="${Math.min(5.6, Math.round((g.core + 1.6) * 10) / 10)}"`);
  });

  it("never pushes the halo past nearly opaque", () => {
    expect(litSvg(18, 0.9)).toContain('stop-opacity="0.95"');
  });
});
