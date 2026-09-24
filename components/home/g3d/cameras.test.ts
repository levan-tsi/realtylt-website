import { describe, expect, it } from "vitest";
import { AREA_FLIGHT, FLIGHT, SHOTS, type ShotName } from "../night/shots";
import { FIRST_STEP_RATIO, LADDER, MAX_RANGE_RATIO, MAX_TILT, MAX_TILT_STEP, TUNED, CITY_GAP, MAX_LIGHTS, budgetFor, cameraFor, densityGap, derivedCamera, focusOf, lightGap, pxPerLight, rawCamera } from "./cameras";
import { project } from "./camera";
import { COUNTY_BOUNDS } from "@/components/idx/county-bounds";

const LAPTOP = 1440 / 900;
const PHONE = 390 / 844;
const ALL = Object.keys(SHOTS) as ShotName[];

describe("the shots as cameras", () => {
  it("gives every shot a camera the map accepts, at both shapes of window", () => {
    for (const name of ALL) {
      for (const aspect of [LAPTOP, PHONE, 1]) {
        const c = cameraFor(name, aspect);
        expect(c.tilt).toBeGreaterThanOrEqual(0);
        expect(c.tilt).toBeLessThanOrEqual(MAX_TILT);
        expect(c.heading).toBeGreaterThanOrEqual(0);
        expect(c.heading).toBeLessThan(360);
        expect(c.range).toBeGreaterThan(5_000);
        expect(c.range).toBeLessThan(260_000);
        expect(c.fov).toBeGreaterThanOrEqual(30);
        expect(c.fov).toBeLessThanOrEqual(64);
      }
    }
  });

  it("tunes the six chapters and leaves the eleven county shots as derived", () => {
    expect(Object.keys(TUNED).sort()).toEqual([...FLIGHT].sort());
    for (const a of AREA_FLIGHT) expect(rawCamera(a, LAPTOP)).toEqual({ ...derivedCamera(a, LAPTOP), tilt: Math.min(MAX_TILT, derivedCamera(a, LAPTOP).tilt) });
  });

  it("keeps each tuned chapter looking the way the night flight looked (heading within 15 degrees)", () => {
    for (const name of FLIGHT) {
      if (name === "region") continue; // the night region looked due north too; kept
      const d = derivedCamera(name, LAPTOP).heading, t = cameraFor(name, LAPTOP).heading;
      const delta = Math.abs(((((t - d) % 360) + 540) % 360) - 180);
      expect(delta).toBeLessThan(15);
    }
  });

  it("keeps the horizon out of every chapter on a laptop (tilt 55 or under; the night flight's 62 to 72 showed Montreal)", () => {
    for (const name of FLIGHT) expect(cameraFor(name, LAPTOP).tilt).toBeLessThanOrEqual(55);
  });

  it("widens the lens for a portrait phone, as the night flight did", () => {
    for (const name of ALL) expect(cameraFor(name, PHONE).fov).toBeGreaterThan(cameraFor(name, LAPTOP).fov);
  });

  it("frames each county on its own homes: the county's middle is in the window", () => {
    for (const a of AREA_FLIGHT) {
      const b = COUNTY_BOUNDS[focusOf(a) as keyof typeof COUNTY_BOUNDS];
      const c = cameraFor(a, LAPTOP);
      const p = project(c, { width: 1440, height: 900, fov: c.fov }, (b.south + b.north) / 2, (b.west + b.east) / 2)!;
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(1440);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(900);
    }
  });

  it("puts the hero's city and valley in the window, right of the words on a laptop", () => {
    const c = cameraFor("hero", LAPTOP);
    const vp = { width: 1440, height: 900, fov: c.fov };
    const manhattan = project(c, vp, 40.758, -73.9855)!; // Times Square
    const newburgh = project(c, vp, 41.5034, -74.0104)!;
    for (const p of [manhattan, newburgh]) {
      expect(p.x).toBeGreaterThan(660); // the hero's words end at ~660 px
      expect(p.x).toBeLessThan(1440);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(900);
    }
    expect(manhattan.y).toBeGreaterThan(newburgh.y); // the city in front, the valley beyond
  });
});

describe("the ladder (phase 1b: fewer new tiles per flight)", () => {
  it("holds every shot the page flies, in the page's order", () => {
    expect(new Set(LADDER)).toEqual(new Set(ALL));
    expect(LADDER.slice(0, 4)).toEqual(["hero", "dutchess", "highlands", "westchester"]);
    expect(LADDER.slice(4, 15)).toEqual([...AREA_FLIGHT]);
    expect(LADDER.slice(-2)).toEqual(["harbour", "region"]);
  });

  for (const [label, aspect] of [["laptop", LAPTOP], ["phone", PHONE], ["square", 1]] as const) {
    it(`keeps neighbours within ${MAX_RANGE_RATIO}x in range and ${MAX_TILT_STEP} degrees in tilt (${label})`, () => {
      for (let i = 1; i < LADDER.length; i++) {
        const a = cameraFor(LADDER[i - 1], aspect), b = cameraFor(LADDER[i], aspect);
        const ratio = Math.max(a.range, b.range) / Math.min(a.range, b.range);
        expect(ratio, `${LADDER[i - 1]} -> ${LADDER[i]}`).toBeLessThanOrEqual(MAX_RANGE_RATIO + 1e-3);
        expect(Math.abs(a.tilt - b.tilt), `${LADDER[i - 1]} -> ${LADDER[i]}`).toBeLessThanOrEqual(MAX_TILT_STEP);
      }
    });

    it(`with the first-step exception, lets only hero -> dutchess reach ${FIRST_STEP_RATIO}x (${label})`, () => {
      for (let i = 1; i < LADDER.length; i++) {
        const a = cameraFor(LADDER[i - 1], aspect, { firstStep: true }), b = cameraFor(LADDER[i], aspect, { firstStep: true });
        const ratio = Math.max(a.range, b.range) / Math.min(a.range, b.range);
        expect(ratio, `${LADDER[i - 1]} -> ${LADDER[i]}`).toBeLessThanOrEqual((i === 1 ? FIRST_STEP_RATIO : MAX_RANGE_RATIO) + 1e-3);
      }
    });

    it(`only ever pulls a shot back, never closer, and changes nothing but its range (${label})`, () => {
      for (const n of LADDER) {
        const raw = rawCamera(n, aspect), c = cameraFor(n, aspect);
        expect(c.range).toBeGreaterThanOrEqual(raw.range);
        expect({ ...c, range: 0 }).toEqual({ ...raw, range: 0 });
      }
    });
  }

  it("pulls back only the shots that needed it on a laptop (Dutchess and the Highlands behind the round-57 hero, Putnam after Orange, the Bronx after Westchester County)", () => {
    const moved = LADDER.filter((n) => cameraFor(n, LAPTOP).range > rawCamera(n, LAPTOP).range);
    expect(moved).toEqual(["dutchess", "highlands", "putnam", "bronx"]);
    expect(cameraFor("dutchess", LAPTOP).range).toBe(72_500);
    expect(cameraFor("highlands", LAPTOP).range).toBe(36_250);
  });

  it("with the first-step exception, leaves Dutchess at its own 60 km (round 57, measured and not chosen)", () => {
    const hero = cameraFor("hero", LAPTOP, { firstStep: true }), dutchess = cameraFor("dutchess", LAPTOP, { firstStep: true });
    expect(hero.range / dutchess.range).toBeGreaterThan(MAX_RANGE_RATIO);
    expect(dutchess.range).toBe(rawCamera("dutchess", LAPTOP).range);
  });
});

describe("how many homes a shot draws (round 57.2: the count follows the range)", () => {
  const DESK = { width: 1440, height: 900 };
  const MOBILE = { width: 390, height: 844 };
  const RANGES = [300_000, 156_000, 145_000, 120_000, 90_000, 72_500, 60_000, 48_000, 36_250, 30_000, 25_000, 21_000, 12_000, 5_000];

  // Round 57.8, the owner: "the map has way less lights than there are listings ... on zoom in zoom
  // out it should balance it out how much it shows ... don't put them too close so people can move
  // the mouse". The count is a smooth function of the range; the gap keeps the mouse honest.
  it("draws several times round 57.7's lights at the territory shot (130 at 1440, 72 at 390)", () => {
    const desk = budgetFor(cameraFor("hero", LAPTOP).range, DESK);
    const phone = budgetFor(cameraFor("hero", PHONE).range, MOBILE);
    expect(desk).toBeGreaterThanOrEqual(3 * 130);
    expect(desk).toBeLessThanOrEqual(6 * 130);
    expect(phone).toBeGreaterThanOrEqual(3 * 72);
    expect(phone).toBeLessThanOrEqual(6 * 72);
  });

  it("follows the range as a smooth function: no tier, no jump anywhere on the way down", () => {
    for (const vp of [DESK, MOBILE]) {
      let prev = budgetFor(400_000, vp);
      for (let r = 400_000; r > 3_000; r /= 1.02) {
        const b = budgetFor(r / 1.02, vp);
        // never fewer as the camera comes down, and never more than a few percent more per 2 %
        expect(b).toBeGreaterThanOrEqual(prev);
        expect(b).toBeLessThanOrEqual(Math.ceil(prev * 1.04) + 1);
        prev = b;
      }
    }
  });

  it("grows as the camera comes down, gently: the lights' density on screen stays balanced", () => {
    for (const vp of [DESK, MOBILE]) {
      const b = RANGES.map((r) => budgetFor(r, vp));
      for (let i = 1; i < b.length; i++) expect(b[i]).toBeGreaterThanOrEqual(b[i - 1]);
      expect(budgetFor(35_000, vp)).toBeGreaterThanOrEqual(1.25 * budgetFor(145_000, vp));
      expect(budgetFor(35_000, vp)).toBeLessThanOrEqual(2 * budgetFor(145_000, vp));
    }
  });

  it("never more than one light per pxPerLight(range) square pixels of window, nor more than the layer can draw", () => {
    for (const r of RANGES) {
      expect(budgetFor(r, DESK)).toBeLessThanOrEqual(Math.floor((1440 * 900) / pxPerLight(r)));
      expect(budgetFor(r, MOBILE)).toBeLessThanOrEqual(Math.floor((390 * 844) / pxPerLight(r, true)));
      expect(budgetFor(r, DESK)).toBeLessThanOrEqual(MAX_LIGHTS);
    }
  });

  it("keeps the mouse honest: a gap of 12 px at the territory, 14 to 20 at the chapters and cities, 14 for a finger", () => {
    expect(densityGap(145_000)).toBe(12);
    expect(densityGap(300_000)).toBe(12);
    for (const r of [60_000, 48_000, 35_000, 21_000, 5_000]) expect(densityGap(r)).toBe(CITY_GAP);
    expect(CITY_GAP).toBeGreaterThanOrEqual(14);
    expect(CITY_GAP).toBeLessThanOrEqual(20);
    for (const r of RANGES) expect(densityGap(r, true)).toBe(14);
    // between, eased with the range (never a step of more than a pixel per 5 %)
    for (let r = 130_000; r > 55_000; r /= 1.05) expect(Math.abs(densityGap(r / 1.05) - densityGap(r))).toBeLessThanOrEqual(1);
  });

  it("keeps lights further apart on screen the higher the camera", () => {
    const g = RANGES.map((r) => lightGap(r));
    for (let i = 1; i < g.length; i++) expect(g[i]).toBeLessThanOrEqual(g[i - 1]);
    expect(lightGap(145_000)).toBeGreaterThanOrEqual(24);
    expect(lightGap(10_000)).toBeGreaterThanOrEqual(10);
  });

  it("keeps a county shot to that county's homes", () => {
    expect(focusOf("putnam")).toBe("putnam");
    expect(focusOf("dutchess-county")).toBe("dutchess");
    expect(focusOf("hero")).toBeNull();
  });
});
