import { describe, it, expect } from "vitest";
import { fmtM, specParts } from "./format";

describe("fmtM", () => {
  it("renders median price shorthand", () => {
    expect(fmtM(480_000)).toBe("$480K");
    expect(fmtM(1_150_000)).toBe("$1150K");
  });
});

describe("specParts — drops feed zeros so a listing never shows '0 Bed'", () => {
  const units = { bed: "Bed", bath: "Bath", sqft: "Sq. Ft." };

  it("keeps all three when populated", () => {
    expect(specParts({ beds: 3, baths: 2, sqft: 2030 }, units)).toEqual([
      "3 Bed",
      "2 Bath",
      "2,030 Sq. Ft.",
    ]);
  });

  it("omits a zero sqft (multi-family with no LivingArea)", () => {
    expect(specParts({ beds: 5, baths: 4, sqft: 0 }, units)).toEqual(["5 Bed", "4 Bath"]);
  });

  it("returns [] when the feed gives nothing (land / 0-bed multi-family)", () => {
    expect(specParts({ beds: 0, baths: 0, sqft: 0 }, units)).toEqual([]);
  });

  it("honors caller units", () => {
    expect(specParts({ beds: 2, baths: 1, sqft: 1440 }, { bed: "bd", bath: "ba", sqft: "sqft" })).toEqual([
      "2 bd",
      "1 ba",
      "1,440 sqft",
    ]);
  });
});
