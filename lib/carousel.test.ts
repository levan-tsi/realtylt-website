import { describe, expect, it } from "vitest";
import { wrapIndex } from "./carousel";

describe("wrapIndex", () => {
  it("leaves in-range indices untouched", () => {
    expect(wrapIndex(0, 5)).toBe(0);
    expect(wrapIndex(3, 5)).toBe(3);
    expect(wrapIndex(4, 5)).toBe(4);
  });

  it("wraps forward past the end back to the start", () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(6, 5)).toBe(1);
  });

  it("wraps backward below zero to the end", () => {
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(-6, 5)).toBe(4);
  });

  it("is safe for degenerate lengths", () => {
    expect(wrapIndex(3, 0)).toBe(0);
    expect(wrapIndex(-2, 1)).toBe(0);
  });
});
