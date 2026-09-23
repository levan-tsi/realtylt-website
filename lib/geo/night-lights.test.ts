import { describe, expect, it } from "vitest";
import { encodeGlow, EXTENT_KM, EXTENT_POW, FLOOR, gaussianBlur, resampleBilinear, SHAPE_KM } from "../../scripts/build-nightlights.mjs";

/** The pure steps of scripts/build-nightlights.mjs, which drapes the Black Marble tile onto the
 * terrain grid as the blue channel of public/geo/valley-elevation.webp. */
describe("night lights: resample", () => {
  const src = Float32Array.from([0, 10, 20, 30]); // 2 x 2: row 0 = 0, 10; row 1 = 20, 30

  it("returns the source exactly on the identity mapping", () => {
    const out = resampleBilinear(src, 2, 2, 2, 2, (c: number, r: number) => [c, r]);
    expect([...out]).toEqual([0, 10, 20, 30]);
  });

  it("is bilinear between pixel centres", () => {
    const out = resampleBilinear(src, 2, 2, 1, 1, () => [0.5, 0.5]);
    expect(out[0]).toBeCloseTo(15, 6);
    const half = resampleBilinear(src, 2, 2, 1, 1, () => [0.5, 0]);
    expect(half[0]).toBeCloseTo(5, 6);
  });

  it("clamps outside the source to its edge", () => {
    const out = resampleBilinear(src, 2, 2, 2, 1, (c: number) => [c === 0 ? -3 : 9, 7]);
    expect([...out]).toEqual([20, 30]);
  });
});

describe("night lights: blur", () => {
  it("leaves a constant field constant, edges included (the kernel is renormalised)", () => {
    const f = new Float32Array(9 * 5).fill(7);
    const out = gaussianBlur(f, 9, 5, 1.5);
    for (const v of out) expect(v).toBeCloseTo(7, 5);
  });

  it("spreads one bright cell symmetrically and keeps its mass in the interior", () => {
    const w = 21, h = 21;
    const f = new Float32Array(w * h);
    f[10 * w + 10] = 100;
    const out = gaussianBlur(f, w, h, 1.5);
    expect(out[10 * w + 10]).toBeGreaterThan(out[10 * w + 11]);
    expect(out[10 * w + 11]).toBeCloseTo(out[10 * w + 9], 6);
    expect(out[10 * w + 11]).toBeCloseTo(out[11 * w + 10], 6);
    let mass = 0;
    for (const v of out) mass += v;
    expect(mass).toBeCloseTo(100, 3);
  });

  it("ranks by extent: a wide lit plateau keeps a higher peak than a narrow one of the same brightness", () => {
    const w = 80, h = 9;
    const f = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 10; x < 13; x++) f[y * w + x] = 255; // a 3-cell town
      for (let x = 40; x < 60; x++) f[y * w + x] = 255; // a 20-cell city
    }
    const out = gaussianBlur(f, w, h, 3);
    const town = out[4 * w + 11], city = out[4 * w + 50];
    expect(city).toBeGreaterThan(town * 2);
    expect(city).toBeGreaterThan(240);
  });

  it("returns a copy for sigma 0", () => {
    const f = Float32Array.from([1, 2, 3, 4]);
    const out = gaussianBlur(f, 2, 2, 0);
    expect([...out]).toEqual([1, 2, 3, 4]);
    expect(out).not.toBe(f);
  });
});

describe("night lights: encode", () => {
  it("puts the maximum at 255 and darkness at 0, monotone between", () => {
    expect(encodeGlow(100, 50, 100, 50)).toBe(255);
    expect(encodeGlow(0, 0, 100, 50)).toBe(0);
    expect(encodeGlow(0, 50, 100, 50)).toBe(0);
    let prev = -1;
    for (let s = 0; s <= 100; s += 5) {
      const v = encodeGlow(s, 50, 100, 50);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it("scales a town's shape by the square root of its extent: a quarter of the extent is half the light", () => {
    expect(encodeGlow(80, 12.5, 100, 50)).toBe(Math.round(255 * 0.8 * 0.5));
    expect(encodeGlow(80, 50, 100, 50)).toBe(Math.round(255 * 0.8));
  });

  it("is safe on an empty field", () => {
    expect(encodeGlow(5, 5, 0, 0)).toBe(0);
  });

  it("documents the constants the asset was built with", () => {
    expect(FLOOR).toBe(20);
    expect(SHAPE_KM).toBe(1.75);
    expect(EXTENT_KM).toBe(6);
    expect(EXTENT_POW).toBe(0.5);
  });
});
