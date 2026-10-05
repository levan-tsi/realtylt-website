import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HORIZON_HIT_MIN, LightLayer, horizonRamp, type LayerCamera, type LayerProjector } from "./light-layer";

// Round 67 (docs/parity/DESIGN-ROUND67.md §2 (5)): the phone's Highlands horizon band.
describe("the horizon band's ramp", () => {
  it("is 0 at the window's top edge and rises linearly to 1 at the band's bottom", () => {
    expect(horizonRamp(0, 135)).toBe(0);
    expect(horizonRamp(33.75, 135)).toBeCloseTo(0.25, 12);
    expect(horizonRamp(67.5, 135)).toBeCloseTo(0.5, 12);
    expect(horizonRamp(135, 135)).toBe(1);
  });
  it("is 1 past the band's bottom and 0 above the window", () => {
    expect(horizonRamp(136, 135)).toBe(1);
    expect(horizonRamp(800, 135)).toBe(1);
    expect(horizonRamp(-12, 135)).toBe(0);
  });
  it("is 1 everywhere without a band", () => {
    for (const y of [-12, 0, 40, 844]) {
      expect(horizonRamp(y, null)).toBe(1);
      expect(horizonRamp(y, 0)).toBe(1);
    }
  });
});

describe("the light layer under a horizon band", () => {
  const draws: { x: number; y: number; alpha: number }[] = [];
  beforeEach(() => {
    draws.length = 0;
    vi.stubGlobal("window", { devicePixelRatio: 1 });
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => {});
    // bake(): a canvas whose pixels are written and never read back here
    vi.stubGlobal("document", {
      createElement: () => ({ width: 0, height: 0, getContext: () => ({ createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData: () => {} }) }),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  const BAND = 135;
  /** A 390x844 layer whose home i stands at (195, ys[i]) on screen: the projector's places ARE the points. */
  const layerAt = (ys: number[], band: number | null) => {
    const ctx = {
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "low",
      setTransform() {},
      clearRect() {},
      drawImage(b: { width: number; height: number }, x: number, y: number) {
        draws.push({ x: x + b.width / 2, y: y + b.height / 2, alpha: this.globalAlpha });
      },
    };
    const canvas = { clientWidth: 390, clientHeight: 844, width: 0, height: 0, getContext: () => ctx } as unknown as HTMLCanvasElement;
    const cam: LayerCamera = { center: { lat: 41.426, lng: -73.9668, altitude: 0 }, range: 12_000, tilt: 60, heading: 190, fov: 58 };
    const proj: LayerProjector = {
      places: (x, y) => {
        const out = new Float64Array(x.length * 3);
        for (let i = 0; i < x.length; i++) [out[3 * i], out[3 * i + 1]] = [x[i], y[i]];
        return out;
      },
      frame: () => (pts, i, out) => {
        out.x = pts[3 * i];
        out.y = pts[3 * i + 1];
        out.z = 1;
        return true;
      },
    };
    const layer = new LightLayer(canvas, () => cam, () => true, proj);
    layer.horizonOf = () => band;
    layer.setHomes(ys.map(() => 195), ys, () => 0);
    layer.plan(ys.map((_, i) => i), true);
    return layer;
  };
  const alphaAt = (y: number) => draws.filter((d) => Math.abs(d.y - y) < 1).map((d) => d.alpha);

  it("multiplies each light's alpha by the ramp at its screen y; positions never change", () => {
    const layer = layerAt([10, 100, 400], BAND);
    draws.length = 0;
    layer.draw();
    expect(draws.map((d) => [Math.round(d.x), Math.round(d.y)])).toEqual([[195, 10], [195, 100], [195, 400]]);
    expect(alphaAt(10)[0]).toBeCloseTo(10 / BAND, 2);
    expect(alphaAt(100)[0]).toBeCloseTo(100 / BAND, 2);
    expect(alphaAt(400)[0]).toBe(1);
  });

  it("leaves a light the eye cannot see out of the hit test (under 0.2 of the ramp)", () => {
    expect(HORIZON_HIT_MIN).toBe(0.2);
    // 20 px is 0.148 of the band, 30 px 0.222
    const layer = layerAt([10, 20, 30, 100, 400], BAND);
    layer.draw();
    expect(layer.xyCount).toBe(3);
    expect([...layer.xyIndex.slice(0, layer.xyCount)]).toEqual([2, 3, 4]);
    expect([...layer.xy.slice(0, 2 * layer.xyCount)].map(Math.round)).toEqual([195, 30, 195, 100, 195, 400]);
  });

  it("without a band draws and hit-tests every light at full strength, as before", () => {
    const layer = layerAt([10, 20, 30, 100, 400], null);
    draws.length = 0;
    layer.draw();
    expect(layer.xyCount).toBe(5);
    expect(draws.every((d) => d.alpha === 1)).toBe(true);
  });

  it("fades the lit and the featured lights in the band too", () => {
    const layer = layerAt([27, 400], BAND);
    // through this projector a home's (lat, lng) is its (x, y): the featured light at (195, 54)
    layer.setFeatured([{ id: "f", lat: 195, lng: 54 }], () => 0);
    layer.light({ home: 0 });
    // the swell runs on the animation frame: two frames past LIT_MS light it fully
    const tick = (layer as unknown as { tick: (now: number) => void }).tick;
    tick(performance.now() + 100);
    tick(performance.now() + 200);
    draws.length = 0;
    layer.draw();
    expect(alphaAt(27)[0]).toBeCloseTo(27 / BAND, 2);
    expect(alphaAt(54)[0]).toBeCloseTo(54 / BAND, 2);
    expect(alphaAt(400)[0]).toBe(1);
  });
});
