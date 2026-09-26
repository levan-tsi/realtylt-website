import { describe, expect, it } from "vitest";
import { ORDER } from "./db";

describe("the mixed sort's order (round 62)", () => {
  it("is not alphabetical by address: a page of the ring is a contiguous block, and a block of the alphabet is one street number", () => {
    expect(ORDER.mixed).not.toMatch(/address/);
    expect(ORDER.mixed).toBe("id.asc");
  });

  it("leaves every explicit sort as it was", () => {
    expect(ORDER.newest).toBe("listed_at.desc,id.asc");
    expect(ORDER["price-asc"]).toBe("price.asc,id.asc");
  });
});
