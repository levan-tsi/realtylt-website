import { describe, expect, it } from "vitest";
import { AREA_FLIGHT, FLIGHT, SHOTS, type ShotName } from "../night/shots";
import { FIRST_STEP_RATIO, LADDER, MAX_RANGE_RATIO, MAX_TILT, MAX_TILT_STEP, PX_PER_LIGHT, TUNED, budgetFor, cameraFor, derivedCamera, focusOf, rawCamera } from "./cameras";
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

describe("how many homes a shot draws", () => {
  it("draws a few hundred for the whole region and more when close", () => {
    expect(budgetFor("hero", 120_000)).toBe(350);
    expect(budgetFor("region", 200_000)).toBe(350);
    expect(budgetFor("putnam", 42_000)).toBe(1500);
    expect(budgetFor("bronx", 21_000)).toBe(2500);
  });

  it("never more than one light per PX_PER_LIGHT square pixels of window", () => {
    expect(budgetFor("bronx", 21_000, { width: 1440, height: 900 })).toBe(Math.floor((1440 * 900) / PX_PER_LIGHT));
    expect(budgetFor("hero", 120_000, { width: 390, height: 844 })).toBe(Math.floor((390 * 844) / PX_PER_LIGHT));
    expect(budgetFor("hero", 120_000, { width: 1440, height: 900 })).toBe(350);
  });

  it("keeps a county shot to that county's homes", () => {
    expect(focusOf("putnam")).toBe("putnam");
    expect(focusOf("dutchess-county")).toBe("dutchess");
    expect(focusOf("hero")).toBeNull();
  });
});
