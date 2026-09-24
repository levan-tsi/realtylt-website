import { describe, expect, it } from "vitest";
import { NIGHT, NIGHT_DEFAULT, gradeChannel, nightGrade } from "./night";

describe("the night grade (round 57.6)", () => {
  it("reads the query, and anything else is the default", () => {
    expect(nightGrade("deep").key).toBe("deep");
    expect(nightGrade(" Light ").key).toBe("light");
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
