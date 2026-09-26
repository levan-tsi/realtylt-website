import { describe, expect, it } from "vitest";
import { AREA_FLIGHT, FLIGHT, SHOTS, type ShotName } from "../night/shots";
import { CLOSE, HIGH, LADDER, MAX_RANGE_RATIO, MAX_TILT, MAX_TILT_STEP, SIGNATURE, TUNED, CITY_GAP, CLOSE_AT, CLOSE_BOOST, CLOSE_FROM, CLOSE_GAP, MAX_LIGHTS, budgetFor, closeBoost, cameraFor, densityGap, focusOf, lightGap, pxPerLight, rawCamera } from "./cameras";
import { project } from "./camera";

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

  it("tunes every shot: the territory and the tail high, every chapter and county close (round 57.11)", () => {
    expect(Object.keys(TUNED).sort()).toEqual([...ALL].sort());
    expect([...HIGH].sort()).toEqual(["hero", "region"]);
    expect([...CLOSE].sort()).toEqual(ALL.filter((n) => !HIGH.includes(n)).sort());
  });

  // The owner (record section 8): "buildings and blocks look like bad quality lines ... zoom closer
  // so it's not low quality pixelated lines". Google's imagery is a photograph only close in.
  it("brings every chapter and county down to 4 to 12 km at a tilt of 55 to 66, both shapes of window", () => {
    for (const name of CLOSE) {
      for (const aspect of [LAPTOP, PHONE, 1]) {
        const c = cameraFor(name, aspect);
        expect(c.range, name).toBeGreaterThanOrEqual(4_000);
        expect(c.range, name).toBeLessThanOrEqual(12_000);
        expect(c.tilt, name).toBeGreaterThanOrEqual(55);
        expect(c.tilt, name).toBeLessThanOrEqual(66);
      }
    }
  });

  it("keeps the territory shot as it was (145 km at 1440, 156 km on a phone)", () => {
    expect(cameraFor("hero", LAPTOP)).toEqual({ center: { lat: 41.0093, lng: -74.3582, altitude: 0 }, range: 145_000, tilt: 55, heading: 8, fov: 40 });
    expect(cameraFor("hero", PHONE).range).toBe(156_000);
  });

  it("frames each close shot on its signature place: in the window at both shapes, and right of the list of areas on a laptop", () => {
    for (const name of CLOSE) {
      const sig = SIGNATURE[name as keyof typeof SIGNATURE];
      for (const [aspect, vp] of [[LAPTOP, { width: 1440, height: 900 }], [PHONE, { width: 390, height: 844 }]] as const) {
        const c = cameraFor(name, aspect);
        const p = project(c, { ...vp, fov: c.fov }, sig.lat, sig.lng);
        expect(p, `${name} ${sig.place}`).not.toBeNull();
        expect(p!.x, `${name} ${sig.place} x`).toBeGreaterThan(0.08 * vp.width);
        expect(p!.x, `${name} ${sig.place} x`).toBeLessThan(0.95 * vp.width);
        expect(p!.y, `${name} ${sig.place} y`).toBeGreaterThan(0.1 * vp.height);
        expect(p!.y, `${name} ${sig.place} y`).toBeLessThan(0.95 * vp.height);
        if (aspect === LAPTOP && (AREA_FLIGHT as readonly string[]).includes(name)) expect(p!.x, `${name} right of the list`).toBeGreaterThan(740);
      }
    }
  });

  it("widens the lens for a portrait phone, as the night flight did", () => {
    for (const name of ALL) expect(cameraFor(name, PHONE).fov).toBeGreaterThan(cameraFor(name, LAPTOP).fov);
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
    it(`keeps close neighbours within ${MAX_RANGE_RATIO}x in range, and every neighbour within ${MAX_TILT_STEP} degrees in tilt (${label})`, () => {
      for (let i = 1; i < LADDER.length; i++) {
        const a = cameraFor(LADDER[i - 1], aspect), b = cameraFor(LADDER[i], aspect);
        const ratio = Math.max(a.range, b.range) / Math.min(a.range, b.range);
        // Round 57.11: the steps into and out of a HIGH shot (the territory down to the first chapter,
        // the harbour up to the tail) are altitude changes flown under the flight's veil.
        const altitude = HIGH.includes(LADDER[i - 1]) || HIGH.includes(LADDER[i]);
        if (!altitude) expect(ratio, `${LADDER[i - 1]} -> ${LADDER[i]}`).toBeLessThanOrEqual(MAX_RANGE_RATIO + 1e-3);
        expect(Math.abs(a.tilt - b.tilt), `${LADDER[i - 1]} -> ${LADDER[i]}`).toBeLessThanOrEqual(MAX_TILT_STEP);
      }
    });

    it(`never pulls a close shot back behind a high one, and changes nothing but range (${label})`, () => {
      for (const n of LADDER) {
        const raw = rawCamera(n, aspect), c = cameraFor(n, aspect);
        expect(c.range).toBeGreaterThanOrEqual(raw.range);
        expect({ ...c, range: 0 }).toEqual({ ...raw, range: 0 });
      }
      expect(cameraFor("dutchess", aspect).range).toBe(rawCamera("dutchess", aspect).range);
      expect(cameraFor("harbour", aspect).range).toBe(rawCamera("harbour", aspect).range);
    });
  }

  it("pulls back nothing on a laptop now that the close shots sit within 1.5x of each other", () => {
    expect(LADDER.filter((n) => cameraFor(n, LAPTOP).range > rawCamera(n, LAPTOP).range)).toEqual([]);
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

  it("never more than one light per pxPerLight(range) square pixels of window (times the close boost), nor more than the layer can draw", () => {
    for (const r of RANGES) {
      expect(budgetFor(r, DESK)).toBeLessThanOrEqual(Math.floor(((1440 * 900) / pxPerLight(r)) * closeBoost(r)));
      expect(budgetFor(r, MOBILE)).toBeLessThanOrEqual(Math.floor(((390 * 844) / pxPerLight(r, true)) * closeBoost(r)));
      expect(budgetFor(r, DESK)).toBeLessThanOrEqual(MAX_LIGHTS);
    }
  });

  it("keeps the mouse honest: a gap of 12 px at the territory, 14 at the chapters' heights, 9 at the close plates, 14 for a finger", () => {
    expect(densityGap(145_000)).toBe(12);
    expect(densityGap(300_000)).toBe(12);
    for (const r of [60_000, 48_000, 35_000, CLOSE_FROM]) expect(densityGap(r)).toBe(CITY_GAP);
    for (const r of [CLOSE_AT, 10_000, 9_000, 6_000, 3_000]) expect(densityGap(r)).toBe(CLOSE_GAP);
    expect(CITY_GAP).toBeGreaterThanOrEqual(14);
    expect(CITY_GAP).toBeLessThanOrEqual(20);
    // under the pointer's 14 px reach, never under the brief's floor
    expect(CLOSE_GAP).toBeGreaterThanOrEqual(8);
    expect(CLOSE_GAP).toBeLessThan(14);
    for (const r of RANGES) expect(densityGap(r, true)).toBe(14);
    // between, eased with the range (never a step of more than a pixel per 5 %), all the way down
    for (let r = 130_000; r > 3_000; r /= 1.05) expect(Math.abs(densityGap(r / 1.05) - densityGap(r))).toBeLessThanOrEqual(1);
  });

  // Round 61, the owner: "if it's going to overload it don't put them, but if we're zooming in at
  // least put whatever can fit".
  it("leaves the territory and the tail exactly as approved (round 57.8's count)", () => {
    const before = (r: number, vp: { width: number; height: number }) => Math.min(MAX_LIGHTS, Math.floor((vp.width * vp.height) / pxPerLight(r, vp.width < 640)));
    for (const vp of [DESK, MOBILE]) {
      for (const r of [cameraFor("hero", LAPTOP).range, cameraFor("hero", PHONE).range, cameraFor("region", LAPTOP).range, 300_000, CLOSE_FROM]) {
        expect(budgetFor(r, vp)).toBe(before(r, vp));
      }
    }
    expect(densityGap(cameraFor("hero", LAPTOP).range)).toBe(12);
    expect(densityGap(cameraFor("region", LAPTOP).range)).toBe(CITY_GAP);
  });

  it("gives the close plates (9 to 12 km) three times the count, under the layer's ceiling", () => {
    for (const r of [12_000, 10_000, 9_000]) {
      const old = Math.floor((1440 * 900) / pxPerLight(r));
      expect(budgetFor(r, DESK)).toBe(Math.min(MAX_LIGHTS, Math.floor(((1440 * 900) / pxPerLight(r)) * CLOSE_BOOST)));
      expect(budgetFor(r, DESK)).toBeGreaterThanOrEqual(2.9 * old);
      expect(budgetFor(r, DESK)).toBeLessThanOrEqual(MAX_LIGHTS);
    }
    // the ramp between: more as the camera comes down, a few percent per 2 % of range at most
    for (let r = CLOSE_FROM; r > CLOSE_AT; r /= 1.02) expect(closeBoost(r / 1.02) / closeBoost(r)).toBeLessThanOrEqual(1.035);
    expect(closeBoost(CLOSE_FROM)).toBe(1);
    expect(closeBoost(CLOSE_AT)).toBeCloseTo(CLOSE_BOOST, 6);
  });

  it("takes the page's comparison knobs: `?budget=` multiplies the count, `?gap=` sets one gap under 60 km", () => {
    const b = budgetFor(145_000, DESK);
    expect(Math.abs(budgetFor(145_000, DESK, 2) - 2 * b)).toBeLessThanOrEqual(1);
    expect(budgetFor(10_000, DESK, 0.5)).toBeLessThan(budgetFor(10_000, DESK));
    // nonsense is ignored
    for (const s of [0, -1, 9, Number.NaN]) expect(budgetFor(10_000, DESK, s)).toBe(budgetFor(10_000, DESK));
    // `?gap=14` is round 57.8's gap at every height
    for (const r of [60_000, 21_000, 10_000, 5_000]) expect(densityGap(r, false, 14)).toBe(14);
    expect(densityGap(145_000, false, 14)).toBe(12);
    expect(densityGap(10_000, false, 3)).toBe(CLOSE_GAP);
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
