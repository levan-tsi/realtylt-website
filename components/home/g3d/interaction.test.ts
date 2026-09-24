import { describe, expect, it } from "vitest";
import { project } from "./camera";
import {
  EDGE,
  OFFSET,
  SCAN,
  SCAN_MAX,
  cameraShowing,
  clickAction,
  FLY_IN_DEPTH,
  flyInCamera,
  labelContent,
  openPoint,
  placeHoverLabel,
  tapNext,
  type TapState,
} from "./interaction";

const VP = { width: 1440, height: 900 };
const SIZE = { w: 150, h: 44 };
const LOGO = { x: 0, y: 900 - 54, w: 180, h: 54 };

const overlaps = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Round 57.3: the hover label's place, a pure function (the brief's placement maths). */
describe("where the hover label stands", () => {
  const k = 10; // the light's keep-out half-size

  it("stands above and to the right of the light, OFFSET px clear of it", () => {
    const p = placeHoverLabel({ x: 700, y: 500 }, SIZE, VP, { keep: k });
    expect(p.side).toBe("above-right");
    expect(p.x).toBe(700 + OFFSET);
    expect(p.y + SIZE.h).toBe(500 - k - OFFSET);
  });

  it("flips to the left near the right edge", () => {
    const p = placeHoverLabel({ x: 1440 - 60, y: 500 }, SIZE, VP, { keep: k });
    expect(p.side).toBe("above-left");
    expect(p.x + SIZE.w).toBe(1440 - 60 - OFFSET);
    expect(p.x + SIZE.w).toBeLessThanOrEqual(1440 - EDGE);
  });

  it("flips below near the top edge", () => {
    const p = placeHoverLabel({ x: 700, y: 40 }, SIZE, VP, { keep: k });
    expect(p.side).toBe("below-right");
    expect(p.y).toBe(40 + k + OFFSET);
  });

  it("flips both ways in the top right corner", () => {
    expect(placeHoverLabel({ x: 1420, y: 30 }, SIZE, VP, { keep: k }).side).toBe("below-left");
  });

  it("never stands on Google's logo corner", () => {
    for (let x = 4; x < 260; x += 6) {
      for (let y = 780; y < 900; y += 6) {
        const p = placeHoverLabel({ x, y }, SIZE, VP, { keep: k, avoid: [LOGO] });
        expect(overlaps({ x: p.x, y: p.y, w: SIZE.w, h: SIZE.h }, LOGO)).toBe(false);
      }
    }
  });

  it("never covers the light, anywhere on a laptop or a phone", () => {
    for (const vp of [VP, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
      const logo = { x: 0, y: vp.height - 54, w: 180, h: 54 };
      for (let x = 0; x <= vp.width; x += 13) {
        for (let y = 0; y <= vp.height; y += 17) {
          const p = placeHoverLabel({ x, y }, SIZE, vp, { keep: k, avoid: [logo] });
          expect(overlaps({ x: p.x, y: p.y, w: SIZE.w, h: SIZE.h }, { x: x - k, y: y - k, w: 2 * k, h: 2 * k })).toBe(false);
        }
      }
    }
  });

  it("stays inside the window at 320 px, even near the right edge", () => {
    const vp = { width: 320, height: 640 };
    for (const x of [8, 160, 300, 316]) {
      const p = placeHoverLabel({ x, y: 320 }, { w: 200, h: 60 }, vp, { keep: k });
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + 200).toBeLessThanOrEqual(320);
    }
  });

  it("stays on screen and off the phone's header for a light near the top right (round 57.3's overflow frame)", () => {
    const vp = { width: 390, height: 844 };
    const header = { x: 0, y: 0, w: 390, h: 120 };
    for (const light of [{ x: 384.7, y: 162 }, { x: 200, y: 140 }, { x: 10, y: 150 }]) {
      const size = { w: 192, h: 91 };
      const p = placeHoverLabel(light, size, vp, { keep: 11, avoid: [header] });
      const box = { x: p.x, y: p.y, w: size.w, h: size.h };
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y + size.h).toBeLessThanOrEqual(844);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + size.w).toBeLessThanOrEqual(390);
      expect(overlaps(box, header)).toBe(false);
      expect(overlaps(box, { x: light.x - 11, y: light.y - 11, w: 22, h: 22 })).toBe(false);
    }
  });

  /** Round 57.5 (defect A1, scripts/_scratch-r57/3/lights/phone/tap-1.png): the phone's tap label
   * stood on "Let's find". The hero's words at 390, by their lines, as the page lays them out. */
  const PHONE = { width: 390, height: 844 };
  const HEADER = { x: 0, y: 0, w: 390, h: 120 };
  const WORDS = [
    { x: 16, y: 150, w: 290, h: 22 }, // the eyebrow
    { x: 16, y: 180, w: 254, h: 66 }, // "Let's find"
    { x: 16, y: 246, w: 184, h: 66 }, // "home."
    { x: 16, y: 540, w: 350, h: 30 }, // the count, three lines
    { x: 16, y: 570, w: 300, h: 30 },
    { x: 16, y: 600, w: 340, h: 30 },
    { x: 16, y: 660, w: 358, h: 62 }, // the search form
    { x: 16, y: 752, w: 170, h: 26 }, // the two links
    { x: 214, y: 752, w: 96, h: 26 },
  ];
  const TAP = { w: 192, h: 95 };

  it("keeps off the hero's words on a phone wherever a light stands between them", () => {
    for (let x = 60; x <= 340; x += 10) {
      for (let y = 320; y <= 530; y += 7) {
        // 425 to 427: a 95 px label fits neither above (y - 116 >= 312) nor below (y + 116 <= 540)
        // in the 228 px gap, and 192 px is too wide beside a light mid-screen: the last resort.
        if (y >= 424 && y <= 428 && x > 150 && x < 240) continue;
        const p = placeHoverLabel({ x, y }, TAP, PHONE, { keep: 11, avoid: [HEADER, ...WORDS] });
        const box = { x: p.x, y: p.y, w: TAP.w, h: TAP.h };
        expect(WORDS.some((w) => overlaps(box, w)), `light ${x},${y} -> ${p.x},${p.y}`).toBe(false);
        expect(overlaps(box, { x: x - 11, y: y - 11, w: 22, h: 22 })).toBe(false);
      }
    }
  });

  it("goes further above or below when the near sides both land on words, never over the light", () => {
    const avoid = [HEADER, { x: 16, y: 200, w: 360, h: 100 }, { x: 16, y: 480, w: 360, h: 80 }];
    const light = { x: 200, y: 390 };
    const p = placeHoverLabel(light, TAP, PHONE, { keep: 11, avoid });
    const box = { x: p.x, y: p.y, w: TAP.w, h: TAP.h };
    expect(avoid.some((a) => overlaps(box, a))).toBe(false);
    expect(overlaps(box, { x: light.x - 11, y: light.y - 11, w: 22, h: 22 })).toBe(false);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y + TAP.h).toBeLessThanOrEqual(PHONE.height);
    // the nearest free place: just past the lower block of words
    expect(p.y).toBeGreaterThanOrEqual(560);
    expect(p.y).toBeLessThan(560 + SCAN);
  });

  it("never wanders far from its light to find a clear place (the featured rail's cards)", () => {
    // A light at the top left of the rail, cards from y 155 down to 700 (round 57.5's first frame:
    // the scan walked the label 700 px down to the gap under the cards).
    const cards = [{ x: 112, y: 155, w: 1200, h: 545 }];
    const light = { x: 40, y: 72 };
    const size = { w: 176, h: 58 };
    const p = placeHoverLabel(light, size, VP, { keep: 12, avoid: cards });
    const below = Math.ceil(light.y + 12 + OFFSET);
    expect(Math.abs(p.y - below)).toBeLessThanOrEqual(SCAN_MAX);
    expect(overlaps({ x: p.x, y: p.y, w: size.w, h: size.h }, { x: light.x - 12, y: light.y - 12, w: 24, h: 24 })).toBe(false);
  });

  it("rounds to whole pixels (the label's text stays crisp)", () => {
    const p = placeHoverLabel({ x: 700.4, y: 500.6 }, SIZE, VP, { keep: 9.5 });
    expect(Number.isInteger(p.x) && Number.isInteger(p.y)).toBe(true);
  });
});

describe("what the label says", () => {
  const pin = { price: 649000, beds: 3, baths: 2, address: "18 Harrison Street", city: "Poughkeepsie" };

  it("the town, the price, then beds and baths", () => {
    expect(labelContent("Poughkeepsie", pin)).toEqual({ town: "Poughkeepsie", price: "$649,000", facts: "3 bd, 2 ba", address: "18 Harrison Street" });
  });

  it("the town alone while the price is on its way", () => {
    expect(labelContent("Beacon", null)).toEqual({ town: "Beacon", price: null, facts: null, address: null });
  });

  it("beds and baths only when both are known", () => {
    expect(labelContent("Beacon", { ...pin, beds: 0 }).facts).toBeNull();
    expect(labelContent("Beacon", { ...pin, baths: 0 }).facts).toBeNull();
    expect(labelContent("Beacon", { ...pin, baths: 2.5 }).facts).toBe("3 bd, 2.5 ba");
  });

  it("no price that is not a price", () => {
    expect(labelContent("Beacon", { ...pin, price: 0 }).price).toBeNull();
  });

  it("falls back to the listing's city when the light has no town", () => {
    expect(labelContent("", pin).town).toBe("Poughkeepsie");
  });
});

describe("what a click on a light does", () => {
  const steady = { steady: true, flying: false, reduced: false };

  it("flies in first over a steady map", () => {
    expect(clickAction({ button: 0 }, steady)).toBe("fly");
  });

  it("routes at once mid-flight or before the map is steady", () => {
    expect(clickAction({ button: 0 }, { ...steady, flying: true })).toBe("route");
    expect(clickAction({ button: 0 }, { ...steady, steady: false })).toBe("route");
  });

  it("routes at once with reduced motion", () => {
    expect(clickAction({ button: 0 }, { ...steady, reduced: true })).toBe("route");
  });

  it("opens a new tab for ctrl, cmd, shift and the middle button, with no fly-in", () => {
    expect(clickAction({ button: 0, ctrlKey: true }, steady)).toBe("tab");
    expect(clickAction({ button: 0, metaKey: true }, steady)).toBe("tab");
    expect(clickAction({ button: 0, shiftKey: true }, steady)).toBe("tab");
    expect(clickAction({ button: 1 }, steady)).toBe("tab");
  });

  it("ignores the right button (the browser's menu)", () => {
    expect(clickAction({ button: 2 }, steady)).toBe("none");
  });
});

describe("the fly-in", () => {
  const from = (range: number) => ({ center: { lat: 41, lng: -74, altitude: 0 }, range, tilt: 55, heading: 8, fov: 40 });

  it("comes down to 1.5 km from a close shot", () => {
    expect(flyInCamera({ lat: 41.7, lng: -73.93 }, from(8_000)).range).toBe(1500);
  });

  it("never dives more than FLY_IN_DEPTH times closer (tiles must keep up in 700 ms)", () => {
    expect(flyInCamera({ lat: 41.7, lng: -73.93 }, from(145_000)).range).toBe(Math.round(145_000 / FLY_IN_DEPTH));
    expect(flyInCamera({ lat: 41.7, lng: -73.93 }, from(48_000)).range).toBe(8000);
  });

  it("stands over the home at tilt 60, keeping the heading", () => {
    const c = flyInCamera({ lat: 41.7, lng: -73.93 }, from(145_000));
    expect(c.center).toEqual({ lat: 41.7, lng: -73.93, altitude: 0 });
    expect(c.tilt).toBe(60);
    expect(c.heading).toBe(8);
    expect(c.fov).toBe(40);
  });
});

describe("the phone's tap, then open", () => {
  const idle: TapState = { shown: null };

  it("the first tap on a light names it", () => {
    expect(tapNext(idle, { kind: "light", i: 7 })).toEqual({ state: { shown: 7 }, action: "show" });
  });

  it("a second tap on the same light, or on its label, opens it", () => {
    expect(tapNext({ shown: 7 }, { kind: "light", i: 7 }).action).toBe("open");
    expect(tapNext({ shown: 7 }, { kind: "label" }).action).toBe("open");
  });

  it("a tap on another light names that one instead", () => {
    expect(tapNext({ shown: 7 }, { kind: "light", i: 9 })).toEqual({ state: { shown: 9 }, action: "show" });
  });

  it("a tap elsewhere puts it away", () => {
    expect(tapNext({ shown: 7 }, { kind: "elsewhere" })).toEqual({ state: { shown: null }, action: "hide" });
    expect(tapNext(idle, { kind: "elsewhere" })).toEqual({ state: idle, action: "none" });
  });

  it("a label with nothing shown does nothing", () => {
    expect(tapNext(idle, { kind: "label" }).action).toBe("none");
  });
});

describe("a featured home shown where the page leaves the map open (the keyboard's focus)", () => {
  const vp = { width: 1440, height: 900 };
  // The featured section at 1440: the heading, a row of four cards, the credit line, the button.
  const solids = [
    { x: 505, y: 60, w: 420, h: 60 },
    { x: 112, y: 156, w: 126, h: 545 },
    { x: 255, y: 156, w: 340, h: 545 },
    { x: 615, y: 156, w: 340, h: 545 },
    { x: 975, y: 156, w: 340, h: 545 },
    { x: 120, y: 738, w: 945, h: 16 },
    { x: 630, y: 795, w: 165, h: 48 },
  ];

  it("finds open map, clear of every card and word, near the focused card", () => {
    const p = openPoint(solids, vp, { x: 175, y: 430 }, { avoid: [{ x: 0, y: 846, w: 180, h: 54 }] })!;
    expect(p).not.toBeNull();
    for (const r of solids) {
      const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.w)), dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.h));
      expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(24);
    }
    expect(p.x).toBeGreaterThanOrEqual(24);
    expect(p.x).toBeLessThanOrEqual(1440 - 24);
  });

  it("says so when there is no open map at all", () => {
    expect(openPoint([{ x: 0, y: 0, w: 1440, h: 900 }], vp, { x: 700, y: 400 })).toBeNull();
  });

  it("solves the camera that puts the home on that point", () => {
    const home = { lat: 41.68, lng: -73.84 };
    const base = { center: { ...home, altitude: 0 }, range: 2600, tilt: 55, heading: 0, fov: 40 };
    for (const target of [{ x: 60, y: 450 }, { x: 900, y: 780 }, { x: 1380, y: 120 }]) {
      const cam = cameraShowing(home, target, base, vp);
      const p = project(cam, { ...vp, fov: 40 }, home.lat, home.lng)!;
      expect(Math.hypot(p.x - target.x, p.y - target.y)).toBeLessThan(2);
      expect(cam.range).toBe(2600);
      expect(cam.tilt).toBe(55);
    }
  });
});

describe("our names under an open label (round 57.6)", () => {
  it("fades a name the label covers, and one within the pad, and not one clear of it", async () => {
    const { namesOverlap } = await import("./interaction");
    const label = { x: 100, y: 100, w: 180, h: 60 };
    expect(namesOverlap({ x: 150, y: 120, w: 70, h: 20 }, label)).toBe(true);
    expect(namesOverlap({ x: 284, y: 120, w: 70, h: 20 }, label, 6)).toBe(true);
    expect(namesOverlap({ x: 290, y: 120, w: 70, h: 20 }, label, 6)).toBe(false);
    expect(namesOverlap({ x: 100, y: 40, w: 70, h: 20 }, label, 6)).toBe(false);
  });
});
