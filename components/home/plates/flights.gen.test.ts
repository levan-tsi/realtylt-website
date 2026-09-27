import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FLIGHTS } from "./flights.gen";
import { PLATES } from "./plates.gen";
import { coverFit, filmLadder, filmOf, filmSrc, filmWidth, framePlate, plateProjector, type FilmFrame, type PlateAspect } from "./plate-frame";
import { AREA_FLIGHT, FLIGHT, type ShotName } from "../night/shots";
import { flightMs } from "../ml/shots";
import { rangeForZoom } from "../ml/geo";

/** THE FILMS' MANIFEST (round 59): a recorded flight for every adjacent pair of the page's plates,
 * both aspects, both ways, its frames' matrices beside it, its first and last frames the plates'
 * own cameras, its length the live map's flight. */
const LADDER: ShotName[] = [...FLIGHT.slice(0, 4), ...AREA_FLIGHT, ...FLIGHT.slice(4)];
const PAIRS = LADDER.slice(0, -1).map((a, i) => [a, LADDER[i + 1]] as const);
const ASPECTS: PlateAspect[] = ["wide", "tall"];
const WINDOW = { wide: { width: 1440, height: 900 }, tall: { width: 390, height: 844 } };
const pub = (p: string) => path.join(process.cwd(), "public", p);
const framesOf = (key: string, a: PlateAspect): { fps: number; n: number; frames: FilmFrame[] } => JSON.parse(fs.readFileSync(pub(`flights/${key}-${a}.json`), "utf8"));
const rangeOf = (s: ShotName, a: PlateAspect) => {
  const p = PLATES[s][a];
  return { lat: p.cam.lat, lng: p.cam.lng, range: rangeForZoom(p.cam.zoom, p.cam.lat, p.h, p.cam.fov) };
};

describe("the recorded flights", () => {
  it("the ladder is the page's order of plates", () => {
    expect(LADDER[0]).toBe("hero");
    expect(LADDER[LADDER.length - 1]).toBe("region");
    expect(LADDER).toContain("dutchess-county");
    expect(new Set(LADDER).size).toBe(17);
  });

  it("every adjacent pair has a film both aspects, found either way", () => {
    for (const [a, b] of PAIRS) {
      for (const as of ASPECTS) expect(FLIGHTS[`${a}--${b}`]?.[as], `${a}--${b} ${as}`).toBeTruthy();
      expect(filmOf(FLIGHTS, a, b)).toEqual({ key: `${a}--${b}`, reverse: false });
      expect(filmOf(FLIGHTS, b, a)).toEqual({ key: `${a}--${b}`, reverse: true });
    }
    expect(filmOf(FLIGHTS, "hero", "queens")).toBeNull();
  });

  it("each clip is the live map's flight: its length by shots.ts flightMs, 30 frames a second", () => {
    for (const [a, b] of PAIRS)
      for (const as of ASPECTS) {
        const c = FLIGHTS[`${a}--${b}`][as];
        const ms = flightMs(rangeOf(a, as), rangeOf(b, as));
        expect(Math.abs(c.ms - ms), `${a}--${b} ${as}`).toBeLessThanOrEqual(1);
        expect(c.n).toBe(Math.round((c.ms * c.fps) / 1000));
        expect(c.ms).toBeGreaterThanOrEqual(1600);
        expect(c.ms).toBeLessThanOrEqual(2600);
      }
  });

  it("one codec an aspect: the laptop's VP9 in WebM at 1440 and its plate's 2880 (round 64), the phone's H.264 in MP4 at its own 1170 (round 62)", () => {
    for (const [a, b] of PAIRS) {
      const f = FLIGHTS[`${a}--${b}`];
      expect(f.wide.webm).toEqual([1440, 2880]);
      // a 2x laptop takes the 2880 clip, a 1x one the 1440 (plate-frame.ts filmWidth, the window's device width)
      expect(filmWidth(f.wide.webm, 2880)).toBe(2880);
      expect(filmWidth(f.wide.webm, 1440)).toBe(1440);
      for (const w of f.wide.webm) for (const [x, y] of [[a, b], [b, a]]) expect(fs.existsSync(pub(filmSrc(x, y, "wide", w, "webm"))), `${x}--${y} ${w}`).toBe(true);
      expect(f.wide.mp4).toEqual([]);
      expect(f.tall.webm).toEqual([]);
      expect(f.tall.mp4).toEqual([1170]);
      // and no file of the other codec is left to be referenced
      expect(fs.existsSync(pub(filmSrc(a, b, "wide", 1440, "mp4")))).toBe(false);
      expect(fs.existsSync(pub(filmSrc(a, b, "tall", 1170, "webm")))).toBe(false);
      // and the soft 780 clips are gone
      expect(fs.existsSync(pub(filmSrc(a, b, "tall", 780, "mp4")))).toBe(false);
    }
  });

  it("every clip file is there, both ways, every codec's widths", () => {
    for (const [a, b] of PAIRS)
      for (const as of ASPECTS) {
        const c = FLIGHTS[`${a}--${b}`][as];
        for (const [f, t] of [[a, b], [b, a]] as const) {
          for (const w of c.webm) expect(fs.existsSync(pub(filmSrc(f, t, as, w, "webm"))), filmSrc(f, t, as, w, "webm")).toBe(true);
          for (const w of c.mp4) expect(fs.existsSync(pub(filmSrc(f, t, as, w, "mp4"))), filmSrc(f, t, as, w, "mp4")).toBe(true);
        }
      }
  });

  it("n + 1 frames, 16 numbers a matrix; the first and last frames are the plates' cameras", () => {
    for (const [a, b] of PAIRS)
      for (const as of ASPECTS) {
        const c = FLIGHTS[`${a}--${b}`][as];
        const d = framesOf(`${a}--${b}`, as);
        expect(d.n).toBe(c.n);
        expect(d.frames.length).toBe(c.n + 1);
        for (const f of d.frames) expect(f.m.length).toBe(16);
        for (const [i, s] of [[0, a], [c.n, b]] as const) {
          const P = PLATES[s][as];
          const f = d.frames[i];
          const deep = (P.k ?? 1) === c.k;
          expect(f.cam.lng).toBeCloseTo(P.cam.lng, 6);
          expect(f.cam.lat).toBeCloseTo(P.cam.lat, 6);
          expect(f.cam.zoom).toBeCloseTo(P.cam.zoom + (deep ? 0 : 1), 6);
          expect(f.cam.elevation).toBeCloseTo(P.cam.elevation, 3);
          if (deep) {
            // the same geometry: the same matrix in its x, y and w rows (the z row, 2 6 10 14, is the
            // depth range, which the map sets from the terrain loaded at the moment; no pixel reads it)
            for (let j = 0; j < 16; j++) if (j % 4 !== 2) expect(Math.abs(f.m[j] - P.m[j]) / Math.max(1, Math.abs(P.m[j])), `${a}--${b} ${as} frame ${i} m[${j}]`).toBeLessThan(1e-6);
          }
          // any geometry: every place lands on the same window pixel as on the plate
          const vp = WINDOW[as];
          const onPlate = plateProjector(P, coverFit(P, vp));
          const fp = framePlate(c, d.frames, i, false, P.ex, P.cam.fov);
          const onFilm = plateProjector(fp, coverFit(fp, vp));
          const o1 = { x: 0, y: 0, z: 0 }, o2 = { x: 0, y: 0, z: 0 };
          const mx = (180 + P.cam.lng) / 360;
          const my = (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (P.cam.lat * Math.PI) / 360))) / 360;
          for (const [dx, dy] of [[0, 0], [0.00005, 0.00002], [-0.00004, 0.00005], [0.00002, -0.00001]]) {
            expect(onPlate(mx + dx, my + dy, 50, o1)).toBe(true);
            expect(onFilm(mx + dx, my + dy, 50, o2)).toBe(true);
            expect(Math.hypot(o1.x - o2.x, o1.y - o2.y), `${a}--${b} ${as} frame ${i}`).toBeLessThan(0.01);
          }
        }
      }
  });

  it("the back flight is the forward frames read backwards", () => {
    const c = FLIGHTS["hero--dutchess"].wide;
    const d = framesOf("hero--dutchess", "wide");
    expect(framePlate(c, d.frames, 0, true, 1.6, 40).m).toEqual(d.frames[c.n].m);
    expect(framePlate(c, d.frames, c.n, true, 1.6, 40).m).toEqual(d.frames[0].m);
    expect(framePlate(c, d.frames, 3, false, 1.6, 40).k).toBe(2);
  });
});

describe("the films' ladder (round 63)", () => {
  it("walks every plate in page order, each joined to the next by a film", () => {
    const ladder = filmLadder(FLIGHTS);
    expect(ladder.length).toBe(Object.keys(FLIGHTS).length + 1);
    expect(ladder.slice(0, 2)).toEqual(["hero", "dutchess"]);
    for (let i = 1; i < ladder.length; i++) expect(FLIGHTS[`${ladder[i - 1]}--${ladder[i]}`]).toBeDefined();
    expect(ladder.indexOf("orange") - ladder.indexOf("ulster")).toBe(2);
  });
});
