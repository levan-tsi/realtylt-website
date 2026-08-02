import { describe, expect, it } from "vitest";
import { bandShape, heroAt, sideSources, survivingPhotos, viewAllLabel } from "./photo-band";

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


// ── The owner's carousel bug, 2026-08-02 ────────────────────────────────────────────────────
// "standing on the listing and clicking to move pictures — it only moves once and does not do
// anything, or going back". Measured before the fix on a 31-photo listing: hero 0 → 0 → 0 → 0,
// with the side column going 1,2,3 then 2,3,4 and then never moving again. Back oscillated
// between two states. These tests walk the band exactly as the component does, so the arrows can
// never silently stop again.
describe("heroAt — the band's hero follows the ANCHOR, not the leftovers", () => {
  const deep = Array.from({ length: 8 }, (_, i) => `/api/media/L/${i}`);

  it("is the photo at the anchor when that photo is alive", () => {
    for (let a = 0; a < deep.length; a++) expect(heroAt(deep, a, deep)).toBe(deep[a]);
  });

  it("promotes past dead photos at or after the anchor", () => {
    const pool = deep.filter((p) => p !== deep[2] && p !== deep[3]);
    expect(heroAt(deep, 2, pool)).toBe(deep[4]);
    expect(heroAt(deep, 3, pool)).toBe(deep[4]);
    expect(heroAt(deep, 1, pool)).toBe(deep[1]);
  });

  it("wraps rather than giving up at the end of the array", () => {
    const pool = [deep[0], deep[1]];
    expect(heroAt(deep, 5, pool)).toBe(deep[0]);
  });

  it("returns nothing when there is nothing alive, and survives a silly anchor", () => {
    expect(heroAt(deep, 0, [])).toBeUndefined();
    expect(heroAt([], 0, [])).toBeUndefined();
    expect(heroAt(deep, -5, deep)).toBe(deep[0]);
    expect(heroAt(deep, 99, deep)).toBe(deep[7]);
    expect(heroAt(deep, Number.NaN, deep)).toBe(deep[0]);
  });
});

describe("the arrows actually walk the band (the regression itself)", () => {
  /** Exactly what ListingPhotos does: hero from the anchor, and `go` moving the anchor to the
   * next/previous SURVIVING photo. If these two ever disagree the carousel freezes. */
  const walk = (claimedPhotos: string[], dead: string[], presses: number[]) => {
    const available = survivingPhotos(claimedPhotos, dead);
    let anchor = 0;
    const seen: (string | undefined)[] = [heroAt(claimedPhotos, anchor, available)];
    for (const delta of presses) {
      const hero = heroAt(claimedPhotos, anchor, available);
      const cur = available.indexOf(hero ?? available[0]);
      const next = available[(cur + delta + available.length) % available.length];
      anchor = Math.max(0, claimedPhotos.indexOf(next));
      seen.push(heroAt(claimedPhotos, anchor, available));
    }
    return seen.map((s) => (s ? Number(s.split("/").pop()) : null));
  };
  const deep = Array.from({ length: 8 }, (_, i) => `/api/media/L/${i}`);

  it("NEXT keeps advancing — it must never stop after one press", () => {
    expect(walk(deep, [], [1, 1, 1, 1])).toEqual([0, 1, 2, 3, 4]);
  });

  it("PREVIOUS walks back, and wraps to the end from the first photo", () => {
    expect(walk(deep, [], [-1, -1])).toEqual([0, 7, 6]);
  });

  it("forward then back returns to where it started", () => {
    expect(walk(deep, [], [1, 1, -1, -1])).toEqual([0, 1, 2, 1, 0]);
  });

  it("steps over dead photos in both directions instead of stalling on them", () => {
    expect(walk(deep, [deep[1], deep[2]], [1, 1])).toEqual([0, 3, 4]);
    expect(walk(deep, [deep[7]], [-1])).toEqual([0, 6]);
  });

  it("a one-photo gallery stays put instead of flickering", () => {
    expect(walk([deep[0]], [], [1, -1, 1])).toEqual([0, 0, 0, 0]);
  });

  it("the side column follows the HERO, so the band moves as one", () => {
    // Anchor 3 -> hero 3 -> sides 4,5,6. Before the fix the sides advanced while the hero sat
    // on photo 0, which is precisely what the owner saw.
    const hero = heroAt(deep, 3, deep)!;
    expect(hero).toBe(deep[3]);
    expect(sideSources(deep, hero, [])).toEqual([deep[4], deep[5], deep[6]]);
  });
});
