import { describe, expect, it } from "vitest";
import { LISTED_MAX_DAYS } from "@/lib/idx/query";
import { LISTED_DAY_OPTS, snapListedDays } from "@/components/search/listed-days";

describe("the Days-on-market ladder agrees with the parser", () => {
  it("tops out at LISTED_MAX_DAYS, so the deepest rung and the server cap are one number", () => {
    // Round-41b flagged this as an unguarded duplicate: the ladder said 365 and the parser
    // said 365 in two different files. The ladder now imports the cap, and this pins it so
    // a future cap change cannot leave a rung the server silently clamps.
    expect(LISTED_DAY_OPTS[LISTED_DAY_OPTS.length - 1]).toBe(LISTED_MAX_DAYS);
  });

  it("is strictly ascending, which nearest-rung snapping assumes", () => {
    for (let i = 1; i < LISTED_DAY_OPTS.length; i++) {
      expect(LISTED_DAY_OPTS[i]).toBeGreaterThan(LISTED_DAY_OPTS[i - 1]);
    }
  });
});

describe("snapListedDays — a hand-typed URL day count lands on the rung the select can show", () => {
  it("passes on-ladder values through unchanged", () => {
    for (const n of LISTED_DAY_OPTS) expect(snapListedDays(String(n))).toBe(String(n));
  });

  it("snaps an off-ladder value to the NEAREST rung instead of reading as no filter", () => {
    // Round-41b's divergence: ?listedDays=100 filtered to 100 days server-side (the parser
    // clamps, it does not drop) while the select showed "No max" — so the first touch of any
    // control silently repainted a broader result set. Nearest rung keeps the chip honest.
    expect(snapListedDays("100")).toBe("90");
    expect(snapListedDays("200")).toBe("180");
    expect(snapListedDays("300")).toBe("365");
    expect(snapListedDays("2")).toBe("1");
  });

  it("snaps past-the-cap values to the top rung, exactly what the server does", () => {
    expect(snapListedDays("500")).toBe(String(LISTED_MAX_DAYS));
    expect(snapListedDays("99999")).toBe(String(LISTED_MAX_DAYS));
  });

  it("treats garbage and non-positive values as no filter, mirroring listedBound", () => {
    expect(snapListedDays(null)).toBe("");
    expect(snapListedDays("")).toBe("");
    expect(snapListedDays("0")).toBe("");
    expect(snapListedDays("-5")).toBe("");
    expect(snapListedDays("abc")).toBe("");
  });
});
