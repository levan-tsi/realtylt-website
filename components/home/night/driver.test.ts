import { describe, expect, it } from "vitest";
import { countyOfShot, shotPosition, shotStops, veilAt, withTail, type ShotSection } from "./driver";
import { AREA_FLIGHT } from "./shots";

const VH = 900;
/** A page like the real one: a full-window hero, three ordinary sections, and one that holds
 * eleven shots (the areas chapter). */
const page: ShotSection[] = [
  { shots: ["hero"], top: 0, height: 900, veil: 0 },
  { shots: ["dutchess"], top: 900, height: 1000, veil: 0.3 },
  { shots: ["highlands"], top: 1900, height: 1200, veil: 0.7 },
  { shots: AREA_FLIGHT, top: 3100, height: 2200, veil: 0.1 },
  { shots: ["harbour", "region"], top: 5300, height: 1600, veil: 0.6 },
];
const MAX = 6900 - VH;

describe("the anchors a section's shots sit on", () => {
  const stops = shotStops(page, VH, MAX);

  it("gives every shot of every section one anchor, in order", () => {
    expect(stops).toHaveLength(1 + 1 + 1 + 11 + 2);
    expect(stops.map((s) => s.name).slice(0, 3)).toEqual(["hero", "dutchess", "highlands"]);
    for (let i = 1; i < stops.length; i++) expect(stops[i].anchor).toBeGreaterThanOrEqual(stops[i - 1].anchor);
  });

  it("anchors a full-window hero at the very top of the page", () => {
    expect(stops[0].anchor).toBe(0);
  });

  it("anchors an ordinary section where it sits squarely in the window", () => {
    // Its middle (900 + 500) at the window's middle (scroll + 450).
    expect(stops[1].anchor).toBe(950);
  });

  it("spreads a many-shot section's anchors evenly across its own span", () => {
    const area = stops.slice(3, 14);
    expect(area.map((a) => a.name)).toEqual([...AREA_FLIGHT]);
    const steps = area.slice(1).map((a, i) => a.anchor - area[i].anchor);
    for (const step of steps) expect(step).toBeCloseTo(2200 / 11, 9);
  });

  it("never anchors past the end of the page, and never runs backwards there", () => {
    const short = shotStops(page, VH, 4000);
    expect(Math.max(...short.map((s) => s.anchor))).toBeLessThanOrEqual(4000);
    for (let i = 1; i < short.length; i++) expect(short[i].anchor).toBeGreaterThanOrEqual(short[i - 1].anchor);
  });

  it("survives a section of no height (an empty rail) without reversing", () => {
    const stops0 = shotStops([{ shots: ["hero"], top: 0, height: 0, veil: 0 }, ...page.slice(1)], VH, MAX);
    for (let i = 1; i < stops0.length; i++) expect(stops0[i].anchor).toBeGreaterThanOrEqual(stops0[i - 1].anchor);
  });
});

describe("the camera's position along the flight", () => {
  const stops = shotStops(page, VH, MAX);

  it("sits on the first shot at the top and on the last at the bottom", () => {
    expect(shotPosition(stops, 0)).toEqual({ s: 0, index: 0 });
    expect(shotPosition(stops, -400)).toEqual({ s: 0, index: 0 });
    expect(shotPosition(stops, MAX)).toEqual({ s: stops.length - 1, index: stops.length - 1 });
    expect(shotPosition(stops, 99999)).toEqual({ s: stops.length - 1, index: stops.length - 1 });
  });

  it("lands exactly on a shot at its own anchor", () => {
    stops.forEach((stop, i) => expect(shotPosition(stops, stop.anchor).s).toBeCloseTo(i, 9));
  });

  it("runs forward with the scroll and never jumps", () => {
    let last = -1;
    for (let y = 0; y <= MAX; y += 17) {
      const { s } = shotPosition(stops, y);
      expect(s).toBeGreaterThanOrEqual(last);
      expect(s - last).toBeLessThan(1.2);
      last = s;
    }
  });

  it("is halfway between two shots halfway between their anchors", () => {
    const mid = (stops[1].anchor + stops[2].anchor) / 2;
    expect(shotPosition(stops, mid).s).toBeCloseTo(1.5, 9);
    expect(shotPosition(stops, mid).index).toBe(2);
  });

  it("answers for a page with one shot, or none", () => {
    expect(shotPosition([{ name: "hero", anchor: 0 }], 500)).toEqual({ s: 0, index: 0 });
    expect(shotPosition([], 500)).toEqual({ s: 0, index: 0 });
  });
});

describe("the veil schedule", () => {
  it("is the section's own veil while that section fills the window", () => {
    expect(veilAt(page, 0, VH)).toBe(0);
    expect(veilAt(page, 2000, VH)).toBeCloseTo(0.7, 9);
  });

  it("crosses smoothly and monotonically between two sections", () => {
    // The hero (0) gives way to the intake (0.3) as the window slides from 0 to 900.
    let last = -1;
    for (let y = 0; y <= 900; y += 30) {
      const v = veilAt(page, y, VH);
      expect(v).toBeGreaterThanOrEqual(last - 1e-12);
      last = v;
    }
    expect(veilAt(page, 450, VH)).toBeCloseTo(0.15, 9);
  });

  it("lifts again when a veiled section leaves the window", () => {
    // Deep in the areas chapter (0.1), well past the veiled rail above it.
    expect(veilAt(page, 3600, VH)).toBeCloseTo(0.1, 9);
  });

  it("is zero when nothing is on screen", () => {
    expect(veilAt(page, 99999, VH)).toBe(0);
    expect(veilAt([], 0, VH)).toBe(0);
  });
});

describe("the last leg, below the page's last section (the footer)", () => {
  const DOC = 9000; // the page's sections end at 6900; the footer runs to 9000
  const tail = { shots: ["region"] as const, veil: 0.86 };

  it("carries the flight to the end of the document", () => {
    const withIt = withTail(page, DOC, tail);
    expect(withIt).toHaveLength(page.length + 1);
    const last = withIt[withIt.length - 1];
    expect(last.top).toBe(6900);
    expect(last.height).toBe(2100);
    expect(last.veil).toBe(0.86);
    expect(last.shots).toEqual(["region"]);
    // The page's own sections are untouched.
    expect(withIt.slice(0, -1)).toEqual(page);
  });

  it("veils the scene under the footer instead of leaving it at full strength", () => {
    // Deep in the footer, where no [data-shot] section reaches: without the tail the weighted
    // average has nothing to average and the scene comes back to full.
    expect(veilAt(page, 8000, VH)).toBe(0);
    expect(veilAt(withTail(page, DOC, tail), 8000, VH)).toBeCloseTo(0.86, 9);
  });

  it("keeps the flight monotone and anchors the last shot inside the page", () => {
    const stops = shotStops(withTail(page, DOC, tail), VH, DOC - VH);
    for (let i = 1; i < stops.length; i++) expect(stops[i].anchor).toBeGreaterThanOrEqual(stops[i - 1].anchor);
    expect(stops[stops.length - 1].name).toBe("region");
    expect(stops[stops.length - 1].anchor).toBeLessThanOrEqual(DOC - VH);
    // ...and it is reached by the time the page is scrolled to the bottom.
    expect(shotPosition(stops, DOC - VH).index).toBe(stops.length - 1);
  });

  it("leaves a page with no footer worth the name alone", () => {
    expect(withTail(page, 6930, tail)).toEqual(page);
    expect(withTail([], 9000, tail)).toEqual([]);
    expect(withTail(page, DOC, { shots: [], veil: 0.9 })).toEqual(page);
  });
});

describe("which county a shot lights", () => {
  it("names one for every area shot and none for a chapter", () => {
    expect(countyOfShot("ulster")).toBe("ulster");
    expect(countyOfShot("dutchess-county")).toBe("dutchess");
    expect(countyOfShot("staten-island")).toBe("staten-island");
    expect(countyOfShot("hero")).toBeNull();
    // "dutchess" is the CHAPTER over Poughkeepsie, not the county's own area shot.
    expect(countyOfShot("dutchess")).toBeNull();
  });
});
