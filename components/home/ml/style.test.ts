import { describe, expect, it } from "vitest";
import { ATTRIBUTION, BUILDINGS_MINZOOM, EXAGGERATION, ML_HOSTS, NIGHT, nightStyle } from "./style";

/** The colours a style value names (hex or rgba), as [r, g, b]. */
function rgbOf(v: string): [number, number, number] | null {
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((k) => parseInt(hex[1].slice(k, k + 2), 16)) as [number, number, number];
  const rgba = v.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return rgba ? [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])] : null;
}
function colours(x: unknown, out: string[] = []): string[] {
  if (typeof x === "string" && rgbOf(x)) out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => colours(y, out));
  else if (x && typeof x === "object") Object.values(x).forEach((y) => colours(y, out));
  return out;
}

describe("the night style's tokens", () => {
  it("are all night: nothing brighter than a moonlit hairline", () => {
    for (const [k, v] of Object.entries(NIGHT)) {
      const c = rgbOf(v)!;
      expect(c, k).not.toBeNull();
      const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
      // the ground tones sit near black; only the road hairline and the moon's highlight are lighter
      expect(lum, k).toBeLessThan(k === "road" || k === "moon" ? 0.7 : 0.12);
    }
  });
  it("carry no warmth: every colour is as blue as it is red (the listings' lights are the only warm thing)", () => {
    for (const v of colours(nightStyle())) {
      const [r, , b] = rgbOf(v)!;
      expect(b, v).toBeGreaterThanOrEqual(r);
    }
  });
  it("make the water darker and bluer than the land", () => {
    const land = rgbOf(NIGHT.land)!, water = rgbOf(NIGHT.water)!;
    expect(water[0] + water[1]).toBeLessThan(land[0] + land[1]);
    expect(water[2] - water[0]).toBeGreaterThan(land[2] - land[0]);
  });
});

describe("the night style", () => {
  const s = nightStyle();
  it("draws no labels, so it needs no glyphs and no sprite (our names are ours, in our type)", () => {
    expect(s.layers.some((l) => l.type === "symbol")).toBe(false);
    expect(s.glyphs).toBeUndefined();
    expect(s.sprite).toBeUndefined();
  });
  it("asks only the two keyless hosts, over https", () => {
    const urls = JSON.stringify(s.sources).match(/https?:\/\/[^/"]+/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(ML_HOSTS.map((h) => `https://${h}`)).toContain(u);
  });
  it("credits the data as its licences ask", () => {
    expect(ATTRIBUTION).toContain("OpenStreetMap contributors");
    expect(ATTRIBUTION).toContain("OpenMapTiles");
    expect(ATTRIBUTION).toContain("OpenFreeMap");
  });
  it("stands on real terrain, exaggerated as asked, with a hillshade from the same heights", () => {
    expect(s.terrain).toEqual({ source: "dem", exaggeration: EXAGGERATION });
    expect(nightStyle({ exaggeration: 2 }).terrain?.exaggeration).toBe(2);
    expect(nightStyle({ terrain: false }).terrain).toBeUndefined();
    const hs = s.layers.find((l) => l.type === "hillshade");
    expect(hs && "source" in hs && hs.source).toBe("dem");
  });
  it("raises buildings only close in, and can leave them out", () => {
    const b = s.layers.find((l) => l.type === "fill-extrusion")!;
    expect(b.minzoom).toBe(BUILDINGS_MINZOOM);
    expect(BUILDINGS_MINZOOM).toBeGreaterThanOrEqual(12);
    expect(nightStyle({ buildings: false }).layers.some((l) => l.type === "fill-extrusion")).toBe(false);
  });
  it("draws roads as hairlines (never wider than 1.6 px)", () => {
    for (const l of s.layers.filter((x) => x.type === "line" && x.id.startsWith("road"))) {
      const w = JSON.stringify((l as { paint?: Record<string, unknown> }).paint?.["line-width"]);
      const nums = (w.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      // [base, z1, w1, z2, w2]: the widths are the numbers at even places after the base
      const widths = nums.filter((_, k) => k >= 2 && k % 2 === 0);
      expect(widths.length, l.id).toBe(2);
      for (const x of widths) expect(x, l.id).toBeLessThanOrEqual(1.6);
    }
  });
  it("has a dark sky and a fog", () => {
    expect(s.sky?.["sky-color"]).toBe(NIGHT.sky);
    expect(s.sky?.["fog-color"]).toBe(NIGHT.fog);
  });
});
