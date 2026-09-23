import { describe, expect, it } from "vitest";
import { COUNTY_BOUNDS } from "@/components/idx/county-bounds";
import { BOROUGHS, COUNTIES } from "@/lib/site";
import { cameraFor } from "./cameras";
import { TERRITORY_LABELS, googleBoxes, labelItems, placeLabels, type Box } from "./labels";

const overlap = (a: Box, b: Box, gap = 0) => a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

/** The hero's words, header and fixed corners as the page lays them out (measured on the running
 * page at 1440x900 and 390x844, round 57, scripts/_scratch-r57-boxes.mjs; each block's lines as
 * one box, which is stricter than the page, where a name may stand beside a short line). */
const WORDS_1440: Box[] = [
  { x: 0, y: 0, w: 1440, h: 115 }, // the header
  { x: 127, y: 210, w: 233, h: 18 }, // eyebrow
  { x: 127, y: 235, w: 348, h: 218 }, // headline
  { x: 127, y: 481, w: 449, h: 98 }, // the count
  { x: 127, y: 611, w: 544, h: 72 }, // the search
  { x: 127, y: 702, w: 282, h: 26 }, // the two links
  { x: 127, y: 768, w: 411, h: 34 }, // the note
  { x: 0, y: 852, w: 1440, h: 36 }, // the scroll cue's row
  { x: 0, y: 846, w: 180, h: 54 }, // Google's logo corner
  { x: 1356, y: 816, w: 60, h: 60 }, // the chat launcher
];
const WORDS_390: Box[] = [
  { x: 0, y: 0, w: 390, h: 113 },
  { x: 16, y: 129, w: 233, h: 18 },
  { x: 16, y: 159, w: 210, h: 123 },
  { x: 16, y: 519, w: 345, h: 82 },
  { x: 16, y: 632, w: 358, h: 70 },
  { x: 16, y: 722, w: 282, h: 26 },
  { x: 0, y: 790, w: 180, h: 54 },
  { x: 317, y: 781, w: 54, h: 54 },
];

/** Label widths as the site's grotesque sets them (~0.56 em a character), heights one line. */
const measure = (text: string, tier: "county" | "borough") => {
  const px = tier === "county" ? 15 : 13;
  return { w: Math.ceil(text.length * px * 0.56) + 4, h: Math.ceil(px * 1.3) };
};

function placeAt(width: number, height: number, obstacles: Box[]) {
  const cam = cameraFor("hero", width / height);
  const items = labelItems(cam, { width, height, fov: cam.fov }, measure);
  const google = googleBoxes(cam, { width, height, fov: cam.fov });
  const placed = placeLabels(items, obstacles, { width, height }, { google });
  return { items, placed, google };
}

describe("the territory labels", () => {
  it("name the eleven areas we serve, as lib/site names them", () => {
    const names = TERRITORY_LABELS.map((l) => l.text).sort();
    const want = [...COUNTIES.map((c) => c.name.replace(/ County$/, "")), ...BOROUGHS.map((b) => b.name)].sort();
    expect(names).toEqual(want);
    expect(TERRITORY_LABELS.filter((l) => l.tier === "borough").map((l) => l.id).sort()).toEqual(BOROUGHS.map((b) => b.slug).sort());
  });

  it("stand each on its own area (the anchor inside the area's listing box)", () => {
    for (const l of TERRITORY_LABELS) {
      const b = COUNTY_BOUNDS[l.id as keyof typeof COUNTY_BOUNDS];
      expect(b, l.id).toBeTruthy();
      expect(l.lat, l.id).toBeGreaterThan(b.south);
      expect(l.lat, l.id).toBeLessThan(b.north);
      expect(l.lng, l.id).toBeGreaterThan(b.west);
      expect(l.lng, l.id).toBeLessThan(b.east);
    }
  });

  for (const [w, h, words, floor] of [
    [1440, 900, WORDS_1440, 11],
    [390, 844, WORDS_390, 7],
  ] as const) {
    describe(`at ${w}x${h}, from the hero camera`, () => {
      const { items, placed, google } = placeAt(w, h, [...words]);

      it("projects every area into the window", () => {
        for (const it of items) {
          expect(it.x, it.id).toBeGreaterThan(0);
          expect(it.x, it.id).toBeLessThan(w);
          expect(it.y, it.id).toBeGreaterThan(0);
          expect(it.y, it.id).toBeLessThan(h);
        }
      });

      it(`places at least ${floor} of the eleven, Westchester and Dutchess always`, () => {
        expect(placed.length).toBeGreaterThanOrEqual(floor);
        expect(placed.map((p) => p.id)).toEqual(expect.arrayContaining(["westchester", "dutchess"]));
        // On the phone Google's own "New York" sits on lower Manhattan and carries it; on a laptop
        // there is room for both.
        if (w >= 1024) expect(placed.map((p) => p.id)).toContain("manhattan");
      });

      it("never lets two labels touch", () => {
        for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) expect(overlap(placed[i], placed[j]), `${placed[i].id} / ${placed[j].id}`).toBe(false);
      });

      it("never puts a label on the words, the header or the corners", () => {
        for (const p of placed) for (const o of words) expect(overlap(p, o), `${p.id}`).toBe(false);
      });

      it("never puts a label on one of Google's own city or town names", () => {
        expect(google.length).toBeGreaterThan(5);
        for (const p of placed) for (const o of google) expect(overlap(p, o), `${p.id}`).toBe(false);
      });

      it("keeps every label inside the window and near its own area", () => {
        for (const p of placed) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.x + p.w).toBeLessThanOrEqual(w);
          expect(p.y + p.h).toBeLessThanOrEqual(h);
          const it = items.find((i) => i.id === p.id)!;
          // The anchor stays under the word: a name never slides off its area sideways.
          expect(Math.abs(p.x + p.w / 2 - it.x)).toBeLessThanOrEqual(p.w * 0.35 + 1);
          expect(Math.abs(p.y + p.h / 2 - it.y)).toBeLessThanOrEqual(p.h * 2.5);
        }
      });
    });
  }
});

describe("placeLabels", () => {
  const vp = { width: 400, height: 300 };

  it("drops a label whose every position is taken", () => {
    const out = placeLabels([{ id: "a", text: "A", tier: "county", x: 200, y: 150, w: 60, h: 18 }], [{ x: 0, y: 0, w: 400, h: 300 }], vp);
    expect(out).toEqual([]);
  });

  it("puts a label centred on its area when it can", () => {
    const [p] = placeLabels([{ id: "a", text: "A", tier: "county", x: 200, y: 150, w: 60, h: 18 }], [], vp);
    expect(p).toMatchObject({ id: "a", x: 170, y: 141, w: 60, h: 18 });
  });

  it("moves the later of two crowded labels aside rather than onto the first, and keeps order as priority", () => {
    const out = placeLabels(
      [
        { id: "a", text: "A", tier: "borough", x: 200, y: 150, w: 60, h: 18 },
        { id: "b", text: "B", tier: "borough", x: 210, y: 152, w: 60, h: 18 },
      ],
      [],
      vp,
    );
    expect(out.map((o) => o.id)).toEqual(["a", "b"]);
    expect(overlap(out[0], out[1])).toBe(false);
  });

  it("holds under a crowd: whatever it keeps never overlaps (fuzz)", () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let run = 0; run < 40; run++) {
      const items = Array.from({ length: 14 }, (_, i) => ({ id: String(i), text: "x", tier: "county" as const, x: rnd() * 400, y: rnd() * 300, w: 40 + rnd() * 60, h: 18 }));
      const obs = Array.from({ length: 3 }, () => ({ x: rnd() * 300, y: rnd() * 200, w: 80, h: 60 }));
      const out = placeLabels(items, obs, vp);
      for (let i = 0; i < out.length; i++) {
        for (let j = i + 1; j < out.length; j++) expect(overlap(out[i], out[j])).toBe(false);
        for (const o of obs) expect(overlap(out[i], o)).toBe(false);
      }
    }
  });

  it("skips an area that projects behind the eye or off the window", () => {
    const cam = cameraFor("hero", 1.6);
    const items = labelItems(cam, { width: 1440, height: 900, fov: cam.fov }, measure, [
      { id: "far", text: "Far", tier: "county", lat: 45, lng: -60 },
    ]);
    expect(items).toEqual([]);
  });
});
