import { describe, it, expect } from "vitest";
import { pageWindow } from "./pagination";

describe("pageWindow — live-style run of six consecutive pages", () => {
  it("starts at 1 on the first page (live shows 1 2 3 4 5 6)", () => {
    expect(pageWindow(1, 150)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("stays anchored at 1 until the current page needs room on the left", () => {
    expect(pageWindow(2, 150)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pageWindow(3, 150)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pageWindow(4, 150)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it("slides with the current page in the middle of a long set", () => {
    expect(pageWindow(75, 150)).toEqual([73, 74, 75, 76, 77, 78]);
    expect(pageWindow(100, 150)).toEqual([98, 99, 100, 101, 102, 103]);
  });

  it("clamps at the end — never runs past the last page", () => {
    expect(pageWindow(150, 150)).toEqual([145, 146, 147, 148, 149, 150]);
    expect(pageWindow(149, 150)).toEqual([145, 146, 147, 148, 149, 150]);
    expect(pageWindow(148, 150)).toEqual([145, 146, 147, 148, 149, 150]);
    expect(pageWindow(147, 150)).toEqual([145, 146, 147, 148, 149, 150]);
    expect(pageWindow(146, 150)).toEqual([144, 145, 146, 147, 148, 149]);
  });

  it("always returns exactly `size` pages when the set is long enough", () => {
    for (let p = 1; p <= 150; p++) {
      const w = pageWindow(p, 150);
      expect(w).toHaveLength(6);
      expect(w[0]).toBeGreaterThanOrEqual(1);
      expect(w[5]).toBeLessThanOrEqual(150);
      expect(w).toContain(p);
      // consecutive, ascending
      expect(w).toEqual([w[0], w[0] + 1, w[0] + 2, w[0] + 3, w[0] + 4, w[0] + 5]);
    }
  });

  it("shrinks to the number of pages that exist", () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(4, 4)).toEqual([1, 2, 3, 4]);
    expect(pageWindow(3, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("survives out-of-range and junk input (?page=0, ?page=9999, NaN)", () => {
    expect(pageWindow(0, 150)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pageWindow(-5, 150)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pageWindow(9999, 150)).toEqual([145, 146, 147, 148, 149, 150]);
    expect(pageWindow(Number.NaN, 150)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pageWindow(1, 0)).toEqual([1]);
    expect(pageWindow(1, Number.NaN)).toEqual([1]);
  });

  it("honours a custom window size", () => {
    expect(pageWindow(1, 150, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(50, 150, 3)).toEqual([49, 50, 51]);
    expect(pageWindow(150, 150, 3)).toEqual([148, 149, 150]);
  });
});
