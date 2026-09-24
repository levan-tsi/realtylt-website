import { describe, expect, it } from "vitest";
import { NIGHT, NIGHT_DEFAULT, filterMatrix, gradeChannel, gradeRgb, nightGrade, parseFilter, type NightKey } from "./night";

describe("the night grade (round 57.6)", () => {
  it("reads the query, and anything else is the default", () => {
    expect(nightGrade("deep").key).toBe("deep");
    expect(nightGrade(" Light ").key).toBe("light");
    expect(nightGrade("moon2").key).toBe("moon2");
    expect(nightGrade("0").grade).toBeNull();
    expect(nightGrade("purple").key).toBe(NIGHT_DEFAULT);
    expect(nightGrade(null).grade).toEqual(NIGHT[NIGHT_DEFAULT]);
  });

  it("takes the land's middle tones to night and keeps white near white (Google's names stay names)", () => {
    for (const k of ["light", "mid", "deep"] as const) {
      expect(gradeChannel(0.35, k)).toBeLessThan(0.22);
      expect(gradeChannel(1, k)).toBeGreaterThan(0.7);
    }
  });

  it("keeps the order of tones (water under land under the lit city), so the imagery still reads", () => {
    for (const k of ["light", "mid", "deep"] as const) {
      let prev = -1;
      for (let x = 0; x <= 1; x += 0.05) {
        const v = gradeChannel(x, k);
        expect(v).toBeGreaterThanOrEqual(prev);
        prev = v;
      }
    }
  });

  it("the three strengths are three strengths", () => {
    expect(gradeChannel(0.35, "light")).toBeGreaterThan(gradeChannel(0.35, "mid"));
    expect(gradeChannel(0.35, "mid")).toBeGreaterThan(gradeChannel(0.35, "deep"));
  });

  it("the tint lifts only the shadows", () => {
    expect(gradeChannel(0, "mid", 0.08)).toBeCloseTo(0.08);
    expect(gradeChannel(1, "light", 0.08) - gradeChannel(1, "light")).toBeLessThan(0.02);
  });
});

// Round 57.9: the whole chain, as the browser draws it (checked against Chrome's own pixels:
// scripts/_scratch-r57h-model.mjs, the raw map against the graded map at two stops, mean error 0.2
// to 0.3 levels of 255).
const lum = (c: readonly number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const MOONS = ["moon1", "moon2", "moon3"] as const satisfies readonly NightKey[];
/** Tones measured on the ungraded satellite frames (scripts/_scratch-r57/9/model/raw/, box means). */
const LAND = [72, 84, 64], FOREST = [68, 90, 71], CITY = [124, 122, 105], SEA = [78, 102, 147], WHITE = [255, 255, 255];

describe("the grade's colour matrices (Filter Effects Level 1)", () => {
  it("reads a filter's functions in order, with % and deg", () => {
    expect(parseFilter("brightness(0.5) contrast(150%) hue-rotate(-186deg)")).toEqual([
      { fn: "brightness", a: 0.5 },
      { fn: "contrast", a: 1.5 },
      { fn: "hue-rotate", a: -186 },
    ]);
  });

  it("brightness scales, contrast pivots on the middle grey, saturate(0) is the luminance", () => {
    expect(gradeRgb([200, 100, 50], { filter: "brightness(0.5)", tint: "rgb(0, 0, 0)" }).map(Math.round)).toEqual([100, 50, 25]);
    const c = gradeRgb([50, 128, 255], { filter: "contrast(2)", tint: "rgb(0,0,0)" });
    expect(c[0]).toBe(0);
    expect(c[1]).toBeCloseTo(128.5, 0);
    expect(c[2]).toBe(255);
    const g = gradeRgb([255, 0, 0], { filter: "saturate(0)", tint: "rgb(0,0,0)" });
    for (const v of g) expect(v).toBeCloseTo(0.213 * 255, 1);
  });

  it("zero amounts are the identity; hue-rotate there and back is the identity", () => {
    const id = (f: string) => gradeRgb([90, 140, 200], { filter: f, tint: "rgb(0,0,0)" });
    for (const f of ["sepia(0)", "hue-rotate(0deg)", "saturate(1)", "brightness(1) contrast(1)", "hue-rotate(-186deg) hue-rotate(186deg)"]) {
      const v = id(f);
      expect(v[0]).toBeCloseTo(90, 0);
      expect(v[1]).toBeCloseTo(140, 0);
      expect(v[2]).toBeCloseTo(200, 0);
    }
    expect(filterMatrix("blur", 2)).toBeNull();
  });

  it("the screen tint is the floor: black comes out as the tint, white stays white", () => {
    expect(gradeRgb([0, 0, 0], { filter: "brightness(1)", tint: "rgb(3, 6, 16)" }).map(Math.round)).toEqual([3, 6, 16]);
    expect(gradeRgb([255, 255, 255], { filter: "brightness(1)", tint: "rgb(3, 6, 16)" }).map(Math.round)).toEqual([255, 255, 255]);
  });

  it("the old grades read the same through the whole chain as through round 6's channel model", () => {
    for (const k of ["light", "mid", "deep"] as const)
      for (const x of [0, 0.2, 0.35, 0.6, 1]) {
        const v = gradeRgb([255 * x, 255 * x, 255 * x], { ...NIGHT[k]!, tint: "rgb(0,0,0)" });
        expect(v[1] / 255).toBeCloseTo(gradeChannel(x, k), 2);
      }
  });
});

describe("moonlight (round 57.9)", () => {
  it("the page's default is moonlight (moon2, chosen by frames); `?night=deep` still shows round 6's", () => {
    expect(NIGHT_DEFAULT).toBe("moon2");
    expect(nightGrade(null).grade).toBe(NIGHT.moon2);
    expect(nightGrade("deep").grade).toBe(NIGHT.deep);
  });

  it("darker than round 6's deep on the land, forest and city", () => {
    for (const k of MOONS)
      for (const c of [LAND, FOREST, CITY]) expect(lum(gradeRgb(c, NIGHT[k]))).toBeLessThan(lum(gradeRgb(c, NIGHT.deep)));
  });

  it("the three strengths are three strengths", () => {
    expect(lum(gradeRgb(LAND, NIGHT.moon1))).toBeGreaterThan(lum(gradeRgb(LAND, NIGHT.moon2)));
    expect(lum(gradeRgb(LAND, NIGHT.moon2))).toBeGreaterThan(lum(gradeRgb(LAND, NIGHT.moon3)));
  });

  it("cool everywhere: shadows blue-black, the land, the city's highlights and white silver-blue (blue over red)", () => {
    for (const k of MOONS)
      for (const c of [[0, 0, 0], LAND, FOREST, CITY, SEA, WHITE]) {
        const v = gradeRgb(c, NIGHT[k]);
        expect(v[2]).toBeGreaterThan(v[0] + 4);
      }
  });

  it("no warmth left in the map, so our lights are the only warm thing (the sea stays blue, never brown)", () => {
    for (const k of MOONS)
      for (const c of [LAND, FOREST, CITY, SEA, [200, 190, 160], [120, 80, 50]]) {
        const v = gradeRgb(c, NIGHT[k]);
        expect(v[0]).toBeLessThanOrEqual(v[2]);
      }
  });

  it("the land still reads as terrain: forest and fields apart, the city well over the land, the water's sheen over the land", () => {
    for (const k of MOONS) {
      const g = NIGHT[k];
      expect(lum(gradeRgb(CITY, g)) - lum(gradeRgb(LAND, g))).toBeGreaterThan(20);
      expect(lum(gradeRgb(SEA, g))).toBeGreaterThan(lum(gradeRgb(LAND, g)));
      // a lit ridge face (the raw frame's 90th percentile) against its shaded side (10th): 36 levels in, at least 15 out
      expect(lum(gradeRgb([103, 103, 103], g)) - lum(gradeRgb([67, 67, 67], g))).toBeGreaterThan(15);
    }
  });

  it("Google's white (its logo) stays over 0.55 of white, so the attribution reads", () => {
    for (const k of MOONS) expect(lum(gradeRgb(WHITE, NIGHT[k]))).toBeGreaterThan(0.55 * 255);
  });

  it("the order of tones is kept (greys in, greys out rising)", () => {
    for (const k of MOONS) {
      let prev = -1;
      for (let x = 0; x <= 255; x += 5) {
        const v = lum(gradeRgb([x, x, x], NIGHT[k]));
        expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = v;
      }
    }
  });
});
