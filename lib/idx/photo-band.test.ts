import { describe, expect, it } from "vitest";
import { bandShape, sideSources, survivingPhotos, viewAllLabel } from "./photo-band";

const claimed = ["/api/media/L/0", "/api/media/L/1", "/api/media/L/2", "/api/media/L/3"];

describe("survivingPhotos — the coming-soon contract", () => {
  it("keeps every photo when nothing failed", () => {
    expect(survivingPhotos(claimed, [])).toEqual(claimed);
  });

  it("drops a dead tile instead of padding the slot (never a placeholder beside a real photo)", () => {
    expect(survivingPhotos(claimed, ["/api/media/L/2"])).toEqual([
      "/api/media/L/0",
      "/api/media/L/1",
      "/api/media/L/3",
    ]);
  });

  it("promotes the next surviving photo to the hero when the cover dies (shape A)", () => {
    // The #1 reported bug: idx 0 503s while 1..N serve. The hero must become a REAL photo.
    const alive = survivingPhotos(claimed, ["/api/media/L/0"]);
    expect(alive[0]).toBe("/api/media/L/1");
  });

  it("collapses a covers-only mirror to its one servable photo (shape B, 54% of active rows)", () => {
    const alive = survivingPhotos(claimed, claimed.slice(1));
    expect(alive).toEqual(["/api/media/L/0"]);
  });

  it("returns an empty set when every photo failed — the only legitimate placeholder case", () => {
    expect(survivingPhotos(claimed, claimed)).toEqual([]);
  });
});

describe("bandShape — deliberate layout at every count, never an empty slot", () => {
  it("maps counts to the live 1-big + 1-wide + 2-half arrangement and its degradations", () => {
    expect(bandShape(0)).toBe("placeholder");
    expect(bandShape(1)).toBe("solo");
    expect(bandShape(2)).toBe("one-side");
    expect(bandShape(3)).toBe("two-side");
    expect(bandShape(4)).toBe("wide-plus-two");
    expect(bandShape(48)).toBe("wide-plus-two");
  });

  it("treats a negative/absent count as the placeholder case", () => {
    expect(bandShape(-1)).toBe("placeholder");
  });
});

describe("sideSources — a dead side tile empties its slot, it does not pull a new photo", () => {
  const many = Array.from({ length: 48 }, (_, i) => `/api/media/L/${i}`);

  it("fills three slots from the photos following the hero", () => {
    expect(sideSources(many, many[0], [])).toEqual([many[1], many[2], many[3]]);
  });

  it("wraps around the end so paging the hero keeps the column full", () => {
    expect(sideSources(many, many[46], [])).toEqual([many[47], many[0], many[1]]);
  });

  it("does NOT substitute a fresh photo for a dead slot (that is the request-burst trap)", () => {
    // Covers-only listing: 1 and 2 are gone. The column shows what is left of ITS OWN slots and
    // never reaches for photo 4 — walking the claimed set would cost 3 requests per photo, 48 deep.
    expect(sideSources(many, many[0], [many[1], many[2]])).toEqual([many[3]]);
    expect(sideSources(many, many[0], [many[1], many[2], many[3]])).toEqual([]);
  });

  it("has no side tiles for a one-photo gallery, and never repeats the hero", () => {
    expect(sideSources([many[0]], many[0], [])).toEqual([]);
    expect(sideSources([many[0], many[1]], many[1], [])).toEqual([many[0]]);
  });

  it("returns nothing when the hero is not in the claimed set", () => {
    expect(sideSources(many, "/api/media/OTHER/0", [])).toEqual([]);
  });
});

describe("viewAllLabel — never print a count the page cannot stand behind", () => {
  it("prints the exact figure once every photo is accounted for", () => {
    expect(viewAllLabel(48, true)).toBe("View all 48 photos");
    expect(viewAllLabel(4, true)).toBe("View all 4 photos");
  });

  it("stays silent about the number while it is still a claim", () => {
    // A covers-only listing claiming 48 but serving 1 must NOT advertise 48, and we will not fire
    // 48 probes to find out — so no number until the gallery has actually accounted for them.
    expect(viewAllLabel(48, false)).toBe("View all photos");
    expect(viewAllLabel(4, false)).toBe("View all photos");
  });

  it("handles the one-photo and no-photo galleries", () => {
    expect(viewAllLabel(1, false)).toBe("View photo");
    expect(viewAllLabel(1, true)).toBe("View photo");
    expect(viewAllLabel(0, true)).toBe("");
  });
});

