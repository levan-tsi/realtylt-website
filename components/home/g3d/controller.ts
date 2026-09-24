/** The real map behind the page (round 56): Google's Map3DElement, driven one flight per section,
 * with our homes on it. Imperative, owned by G3dGround.tsx; no React in here.
 *
 * What the API does and does not do (maps JS 3.66, measured in Chrome with the site's key; the
 * experiments are scripts/_scratch-r56-api.mjs, -exp.mjs and -proj.mjs):
 *  - The steady event is `gmp-steadychange` with `isSteady` (the docs' `gmp-steadystate` never
 *    fires on this version). The first `isSteady: true` is when the map is drawn.
 *  - `mode: "HYBRID"`, `gestureHandling: "COOPERATIVE"` (upper case: lower case throws inside the
 *    element's async init with no console line), `defaultUIHidden: true` hides the compass and the
 *    fullscreen control and KEEPS the "Google Maps" logo and the legal link (the policy requires
 *    them; `googleLogoDisabled` exists and is never touched here). `fov` is vertical, settable,
 *    and animates inside `flyCameraTo`.
 *  - After a flight the element reports its camera as the EYE (center = eye, range 0); camera.ts
 *    treats both forms as one camera.
 *  - Markers (until round 57.5): Marker3DElement with an SVG in a <template>, ~0.35 ms each, 25 a
 *    frame, no hover, a glyph fixed once drawn. Round 57.6 draws the homes itself instead, on a
 *    canvas over the night grade (light-layer.ts), projected every frame of a flight from the
 *    camera the element reports: no marker is added at boot or on any flight.
 *  - Hover is our projection of the homes we drew, hit-tested against the pointer (G3dGround.tsx),
 *    the same positions the layer drew in its last frame. */
import { loadMaps } from "@/lib/idx/maps-loader";
import { sampleHeight, type ElevationGrid } from "../night/elevation";
import type { ShotName } from "../night/shots";
import { cameraFrame, flightMillis, projectWith, type MapCamera } from "./camera";
import { budgetFor, cameraFor, densityGap, focusOf, isNarrow, lightGap, type G3dCamera } from "./cameras";
import { FlightGate } from "./gate";
import { modeFor, type MapMode, type ModeChoice } from "./map-options";
import { FLY_IN_MS, flyInCamera } from "./interaction";
import { lightPins, planLights, type LightSet } from "./thinning";
import { LightLayer, type LayerCamera } from "./light-layer";
import { focalOf, glowLevel, homesEcef, keyOrder, planDensity, projectAll, projectHome, representedCounts } from "./light-plan";
import { backWaitMs, earlyScroll } from "./warm-plan";
import type { MapPin } from "@/lib/idx/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type El = HTMLElement & Record<string, any>;

export interface Homes extends LightSet {
  /** Each home's key for the planner's fixed order (light-plan.ts placeKeys): stable across syncs. */
  key: ArrayLike<number>;
  town: Uint16Array;
  towns: readonly string[];
}

export interface FeaturedHome {
  id: string;
  lat: number;
  lng: number;
  /** "$649,000, 18 Harrison Street, Poughkeepsie": what a screen reader and the tooltip say. */
  title: string;
  href: string;
  /** What its label says when its card has focus (round 57.3, interaction.ts labelContent). */
  price?: number;
  beds?: number;
  baths?: number;
  address?: string;
  city?: string;
}

export interface G3dStats {
  loads: number;
  /** The map's first finished frame (under the poster). */
  navToFirstSteady: number | null;
  /** How long the pre-warm walk took, and each step (null: no walk). */
  warmMs: number | null;
  warmSteps: { shot: string; ms: number; ok: boolean }[];
  navToSteady: number | null;
  navToFirstMarker: number | null;
  drawn: number;
  planned: number;
  lastPlanMs: number;
  lastAddMs: number;
  flights: number;
  flying: boolean;
  /** The map's last gmp-steadychange said it has finished drawing. */
  steady: boolean;
  /** Homes are still being added or taken away. */
  busy: boolean;
  shot: string | null;
  /** A flight waiting for the map to settle (its shot), and how long the last flights waited. */
  held: string | null;
  waits: number[];
  error: string | null;
  /** The element's mode now, and the glyph size the last plan drew with (round 57.2). */
  mode: string | null;
  /** The lights' core DIAMETER now, css px (glyph.ts, eased by range; round 57.6). */
  glyph: number;
  /** Our light layer's per-frame cost (light-layer.ts). */
  layer: { frames: number; maxMs: number; meanMs: number } | null;
}

interface FlightJob {
  cam: G3dCamera;
  /** The page's shot, or null for a camera of its own (a featured home). */
  shot: ShotName | null;
  ms?: number;
}

/** The element is created ONCE per page view, whatever React does (a re-render, a remount, dev's
 * double effects): each creation is a billed Immersive Maps load. */
let singleton: El | null = null;
let loads = 0;

/** What to add to our elevation (metres above sea level, USGS) to stand a home where Google draws
 * it. Until round 57.5 this was the geoid's -32 m (the ground at sea level lies ~32 m below the
 * ellipsoid). Measured by pixel at the featured rail (2.6 km, scripts/_scratch-r57e-calib.mjs
 * --featured=1): every featured light stood 8.7 px above our projection; Google's camera, once
 * landed, reports its centre at 185 m where our grid reads 187 m above sea level, so its altitudes
 * (and the camera's) are the same sea-level heights as ours, and the offset is 0. At the territory
 * shot 32 m is a third of a pixel either way. */
const GEOID = 0;
/** The element's camera events (maps 3.66): our lights redraw on them (light-layer.ts onCameraChange). */
const CAMERA_EVENTS = ["gmp-centerchange", "gmp-rangechange", "gmp-tiltchange", "gmp-headingchange"] as const;

export class G3dController {
  el: El | null = null;
  private lib: any = null;
  private cam: G3dCamera | null = null;
  private shot: ShotName | null = null;
  private flying = false;
  private flights = 0;
  private landTimer: ReturnType<typeof setTimeout> | undefined;
  private homes: Homes | null = null;
  private pins: MapPin[] = [];
  private elev: ElevationGrid | null = null;
  /** Our light layer (light-layer.ts), or null (no canvas: the lab's map-only look). */
  layer: LightLayer | null = null;
  /** The homes in the planner's fixed random order (light-plan.ts keyOrder, by each home's key). */
  private order = new Int32Array(0);
  private planned: number[] = [];
  private revealed = false;
  private steadyAt: number | null = null;
  private firstMarkerAt: number | null = null;
  private lastPlanMs = 0;
  private error: string | null = null;
  /** Where the drawn lights stood in the layer's last frame (the pointer's hit test). */
  get xy() {
    return this.layer?.xy ?? new Float32Array(0);
  }
  get xyIndex() {
    return this.layer?.xyIndex ?? new Int32Array(0);
  }
  get xyCount() {
    return this.layer?.xyCount ?? 0;
  }

  constructor(
    private opts: {
      key: string;
      reduced: boolean;
      /** Width / height of the window, read fresh each time. */
      viewport: () => { width: number; height: number };
      onReveal: () => void;
      onLand: () => void;
      onFlightStart: () => void;
      onError: (msg: string) => void;
      /** The shot the map should open on (the page may be reloaded mid-scroll). */
      initial: ShotName;
      description: string;
      /** THE PRE-WARM: the shots to visit under the poster before it dissolves, so the tiles the
       * page's flights need are already resident (empty: none). `jump` sets each camera and waits
       * for the map to be drawn there; `fly` flies there in 400 ms (the path's tiles too) and waits
       * the same way. The walk stops at `warmBudgetMs` wherever it is. */
      warm: readonly ShotName[];
      warmMode: "jump" | "fly" | "path";
      warmFlyMs?: number;
      /** The longest a walk step waits for the map to be drawn there (default 4 s). */
      warmSettleMs?: number;
      /** The longest the walk's return to the page's shot waits for it to be drawn (default 4 s). */
      warmBackMs?: number;
      /** Open the map at the walk's first shot instead of the page's (the walk then starts where
       * the map first drew, and the page's shot is drawn once, on the way back). */
      warmOpen?: boolean;
      warmBudgetMs: number;
      /** Hold section changes until the map is steady and not flying (gate.ts). Measured in phase 1b
       * (DESIGN-ROUND56.md §8): holding made the map trail the page by 1 to 2 s (up to 5 s) and did
       * not make any flight cleaner, so it is OFF by default; off, a new section redirects the
       * flight in the air, as in phase 1. The gate still tracks flying and steady for the markers. */
      holdFlights: boolean;
      /** The longest a held section change waits for a map that will not settle. */
      maxWaitMs: number;
      /** A section flight's shortest and longest duration (camera.ts flightMillis). */
      flightMs: readonly [number, number];
      /** Let the hero's first step exceed MAX_RANGE_RATIO (cameras.ts FIRST_STEP_RATIO; measured
       * worse on the phone in round 57, so off unless `?ladder=first`). */
      firstStep?: boolean;
      /** The owner's cloud style (map-options.ts mapIdFrom), or null: Google's unstyled map. */
      mapId?: string | null;
      /** HYBRID, SATELLITE, or HYBRID at the territory shot only (map-options.ts). */
      mode?: ModeChoice;
      /** Round 57.4's lab switches for the Westchester stall experiments (G3dGround reads them from
       * the query): a shot's camera changed in range / tilt / heading, a shot's flight duration,
       * and every section flight flown in two legs through the geometric-mean camera. */
      camOverride?: Partial<Record<ShotName, Partial<Pick<G3dCamera, "range" | "tilt" | "heading">>>>;
      durOverride?: Partial<Record<ShotName, number>>;
      legs?: number;
      /** Our lights' canvas (light-layer.ts). */
      canvas?: HTMLCanvasElement | null;
      /** How the homes are thinned: "density" (round 57.6, a uniform sample: denser where homes are
       * denser) or "lattice" (round 57.2's even screen gap), `?thin=` compares. */
      thin?: "density" | "lattice";
      /** Round 57.8's lab switches: the neighbourhood glow's strength (`?glow=0.08`, 0 for none)
       * and the chapters' gap in px (`?gap=14`, cameras.ts CITY_GAP). */
      glow?: number;
      cityGap?: number;
    },
  ) {
    this.gate = new FlightGate<FlightJob>(opts.maxWaitMs);
    if (opts.canvas) this.layer = new LightLayer(opts.canvas, () => this.liveCamera(), () => isNarrow(opts.viewport()));
    if (this.layer) this.layer.glowStrength = opts.glow;
  }

  /** The camera the map element reports NOW (every frame of a flight, measured), or ours before it
   * exists. */
  liveCamera(): LayerCamera | null {
    const el = this.el;
    const c = el?.center;
    if (el && c && Number.isFinite(el.range)) {
      return { center: { lat: c.lat, lng: c.lng, altitude: c.altitude ?? 0 }, range: el.range, tilt: el.tilt ?? 0, heading: el.heading ?? 0, fov: el.fov ?? this.cam?.fov ?? 40 };
    }
    return this.cam;
  }

  private heightAt = (lat: number, lng: number) => (this.elev ? sampleHeight(this.elev, lng, lat) + GEOID : 0);

  private stopped = false;

  async start(host: HTMLElement) {
    try {
      await loadMaps(this.opts.key, ["maps3d"]);
      const g = (globalThis as any).google;
      this.lib = await g.maps.importLibrary("maps3d");
    } catch (e) {
      this.fail(`load: ${(e as Error).message}`);
      return;
    }
    if (this.stopped) return;
    // The map opens on the page's own shot, under our poster (G3dGround): there is no intro flight
    // any more, because under the poster nobody would see it and it was one more flight of tiles
    // streaming during motion. The poster dissolves when the map is drawn at this camera.
    let el = singleton;
    const reused = !!el;
    const openShot = !reused && this.opts.warmOpen && this.opts.warm.length ? this.opts.warm[0] : this.opts.initial;
    const open = this.cameraOf(openShot);
    if (!el) {
      el = new this.lib.Map3DElement({
        center: open.center,
        range: open.range,
        tilt: open.tilt,
        heading: open.heading,
        fov: open.fov,
        mode: this.modeOf(openShot),
        gestureHandling: "COOPERATIVE",
        defaultUIHidden: true,
        description: this.opts.description,
        ...(this.opts.mapId ? { mapId: this.opts.mapId } : {}),
      }) as El;
      loads++;
      singleton = el;
    }
    this.el = el;
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.display = "block";
    el.addEventListener("gmp-steadychange", this.onSteady as EventListener);
    el.addEventListener("gmp-animationend", this.onAnimationEnd);
    el.addEventListener("gmp-error", this.onMapError);
    if (this.layer) for (const k of CAMERA_EVENTS) el.addEventListener(k, this.layer.onCameraChange);
    host.append(el);
    this.shot = this.opts.initial;
    this.at = this.goingTo = this.opts.initial;
    this.cam = open;
    if (reused) {
      // The same element, handed to a new owner (a remount): it is already drawn (and warm).
      this.warmed = true;
      this.jump(open);
      this.onSteady(Object.assign(new Event("gmp-steadychange"), { isSteady: true }));
    }
  }

  stop() {
    this.stopped = true;
    this.layer?.stop();
    clearTimeout(this.landTimer);
    clearTimeout(this.pollTimer);
    const el = this.el;
    if (!el) return;
    el.removeEventListener("gmp-steadychange", this.onSteady as EventListener);
    el.removeEventListener("gmp-animationend", this.onAnimationEnd);
    el.removeEventListener("gmp-error", this.onMapError);
    if (this.layer) for (const k of CAMERA_EVENTS) el.removeEventListener(k, this.layer.onCameraChange);
  }

  private fail(msg: string) {
    this.error = msg;
    this.opts.onError(msg);
  }

  private onMapError = (e: Event) => {
    const d = (e as any).detail ?? (e as any).error ?? (this.el as any)?.error;
    this.fail(`gmp-error: ${d ? String(d.message ?? d) : "unknown"}`);
  };

  private steadyNow = false;

  private steadyWaiters = new Set<(steady: boolean) => void>();

  private onSteady = (e: Event & { isSteady?: boolean }) => {
    this.steadyNow = !!e.isSteady;
    for (const w of [...this.steadyWaiters]) w(this.steadyNow);
    const next = this.gate.setSteady(this.steadyNow, performance.now());
    if (next && this.revealed) this.go(next);
    else this.markNow();
    if (!e.isSteady || this.revealed || this.warming) return;
    if (this.firstSteadyAt === null) {
      this.firstSteadyAt = performance.now();
      performance.mark("g3d:first-steady");
    }
    // The walk (or, after an early scroll that stopped it, just the return to the visitor's shot,
    // drawn before it is shown: round 57.6).
    if (!this.warmed && (this.opts.warm.length || this.warmAbort)) {
      void this.prewarm();
      return;
    }
    this.reveal();
  };

  private reveal() {
    this.revealed = true;
    this.steadyAt = performance.now();
    performance.mark("g3d:steady");
    this.opts.onReveal();
    this.land();
  }

  // ---- the pre-warm (round 56 phase 1b) ----------------------------------------------------------
  //
  // Phase 1 measured Google's renderer stalling 50 to 100 ms while it streams tiles during a flight.
  // The experiment: before the poster dissolves, visit every camera the page will fly to, so the
  // tiles are resident when the reader scrolls. Nobody sees the walk (the poster is over it); it
  // is ordinary use of the map in this page, nothing is stored by us.

  private warming = false;
  private warmed = false;
  private warmAbort = false;
  private wake: (() => void) | null = null;
  private firstSteadyAt: number | null = null;
  private warmMs: number | null = null;
  private warmSteps: { shot: string; ms: number; ok: boolean }[] = [];

  /** The visitor scrolled during the walk: stop it, go to the page's shot, show the map. */
  abortWarm() {
    this.warmAbort = true;
    this.wake?.();
  }

  /** The visitor scrolled before the map was shown (round 57.6, warm-plan.ts earlyScroll): the
   * compile path goes on under the cover; any other walk stops. Either way the map is shown at the
   * visitor's own section, drawn (or after EARLY_BACK_MS). */
  private scrolled = false;
  scrolledEarly() {
    if (this.revealed || this.scrolled) return;
    this.scrolled = true;
    if (earlyScroll(this.opts.warmMode) === "abort") this.abortWarm();
  }

  /** After a camera change: resolves true when the map has redrawn and is steady again, false at
   * `maxMs` (or on an abort). A camera whose tiles are all resident may never report unsteady, so a
   * steady map with no change in 300 ms counts as drawn. */
  private settle(maxMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      let sawUnsteady = false;
      const done = (ok: boolean) => {
        clearTimeout(grace);
        clearTimeout(cap);
        this.steadyWaiters.delete(onChange);
        this.wake = null;
        resolve(ok);
      };
      const onChange = (steady: boolean) => {
        if (!steady) sawUnsteady = true;
        else if (sawUnsteady) done(true);
      };
      this.steadyWaiters.add(onChange);
      this.wake = () => done(false);
      const grace = setTimeout(() => !sawUnsteady && this.steadyNow && done(true), 300);
      const cap = setTimeout(() => done(false), maxMs);
    });
  }

  private landed(maxMs = 1200): Promise<void> {
    return new Promise((resolve) => {
      const el = this.el!;
      const done = () => {
        clearTimeout(cap);
        el.removeEventListener("gmp-animationend", done);
        this.wake = null;
        resolve();
      };
      el.addEventListener("gmp-animationend", done);
      this.wake = done;
      const cap = setTimeout(done, maxMs);
    });
  }

  private async prewarm() {
    this.warming = true;
    const t0 = performance.now();
    performance.mark("g3d:warm-start");
    for (const [k, name] of this.opts.warm.entries()) {
      if (this.warmAbort || this.stopped || performance.now() - t0 > this.opts.warmBudgetMs) break;
      const s0 = performance.now();
      const c = this.cameraOf(name);
      // `path`: the first shot is set, each next one FLOWN as the page flies it (its own duration,
      // or `warmFlyMs`), so the walk takes the page's own paths (round 57.4, experiment d).
      const path = this.opts.warmMode === "path" && k > 0;
      if (this.opts.warmMode === "path") this.setMode(name);
      if (this.opts.warmMode === "fly" || path) {
        const dur = path ? (this.opts.warmFlyMs ?? flightMillis(this.cam ?? c, c, this.opts.flightMs[0], this.opts.flightMs[1])) : 400;
        this.el!.flyCameraTo({ endCamera: { center: c.center, range: c.range, tilt: c.tilt, heading: c.heading, fov: c.fov }, durationMillis: dur });
        this.cam = c;
        await this.landed(dur + 800);
      } else {
        this.jump(c);
      }
      const ok = this.warmAbort ? false : await this.settle(this.opts.warmSettleMs ?? 4000);
      this.warmSteps.push({ shot: name, ms: Math.round(performance.now() - s0), ok });
    }
    if (this.stopped) return;
    // Back to the page's own shot (the reader may have scrolled meanwhile), drawn, then shown.
    this.at = this.goingTo = this.shot ?? this.opts.initial;
    this.setMode(this.at);
    const back = this.cameraOf(this.at);
    const moved = !sameCamera(this.cam, back);
    this.jump(back);
    if (moved || !this.warmAbort) await this.settle(backWaitMs({ scrolled: this.scrolled, backMs: this.opts.warmBackMs }));
    this.warmMs = Math.round(performance.now() - t0);
    performance.mark("g3d:warm-end");
    this.warming = false;
    this.warmed = true;
    if (!this.stopped) this.reveal();
  }

  private onAnimationEnd = () => {
    const leg = this.nextLeg;
    if (leg && this.flying && this.el) {
      this.nextLeg = null;
      this.el.flyCameraTo(leg);
      return;
    }
    if (this.flying) this.land();
  };

  cameraOf(name: ShotName): G3dCamera {
    const { width, height } = this.opts.viewport();
    const c = cameraFor(name, width / Math.max(1, height), { firstStep: this.opts.firstStep });
    const o = this.opts.camOverride?.[name];
    return o ? { ...c, ...o } : c;
  }

  /** The page's shot the map is holding still at, or null (flying, not shown yet, or at a camera of
   * its own such as a featured home). The hero's area names are drawn only while this is "hero". */
  heldShot(): ShotName | null {
    return this.revealed && !this.flying && !this.warming ? this.at : null;
  }

  /** Fly to a shot. A flight to where the map already is, or is going, does nothing. */
  flyToShot(name: ShotName) {
    const target = this.cameraOf(name);
    if (!this.revealed) {
      // Before the map is shown there is nothing to see (our poster covers it): go there directly,
      // or, during the pre-warm, once the walk is over.
      const move = name !== this.shot && !this.warming;
      this.shot = name;
      this.flown = name;
      this.at = this.goingTo = name;
      if (move) {
        this.setMode(name);
        this.jump(target);
      }
      return;
    }
    this.shot = name;
    this.request({ cam: target, shot: name });
  }

  /** Fly to any camera (a home, for the keyboard): the shot stays what the page is on. */
  flyToCamera(target: G3dCamera, ms?: number) {
    if (!this.revealed) return;
    this.request({ cam: target, shot: null, ms });
  }

  // ---- flight discipline (round 56 phase 1b, gate.ts) ---------------------------------------------
  // A flight starts only over a steady map that is not already flying; a section change that comes
  // meanwhile waits (the latest one only), at most `maxWaitMs` for a map that will not settle.

  private gate: FlightGate<FlightJob>;
  private pollTimer: ReturnType<typeof setTimeout> | undefined;
  private requestedAt = 0;
  private waits: number[] = [];
  /** The shot the camera is at or flying to (`shot` is the one the page asked for last). */
  private flown: ShotName | null = null;
  /** The shot the camera is AT once landed (null: a camera of its own), and the one a flight in
   * the air is taking it to. */
  private at: ShotName | null = null;
  private goingTo: ShotName | null = null;

  private request(job: FlightJob) {
    if (sameCamera(this.cam, job.cam)) {
      // Already there, or on the way: whatever was waiting is no longer wanted.
      this.gate.clear();
      return;
    }
    const now = performance.now();
    if (!this.opts.holdFlights) {
      this.requestedAt = now;
      return this.go(job);
    }
    if (this.gate.held() === null) this.requestedAt = now;
    const go = this.gate.request(job, now);
    if (go) return this.go(go);
    clearTimeout(this.pollTimer);
    this.pollTimer = setTimeout(() => this.pump(), this.gate.maxWaitMs + 20);
  }

  /** A held flight may be free to go (a landing, a steady map, the time limit). */
  private pump(job: FlightJob | null = this.gate.poll(performance.now())) {
    if (job) this.go(job);
    else if (this.gate.held() !== null) {
      clearTimeout(this.pollTimer);
      this.pollTimer = setTimeout(() => this.pump(), 120);
    }
  }

  private go(job: FlightJob) {
    clearTimeout(this.pollTimer);
    this.waits.push(Math.round(performance.now() - this.requestedAt));
    if (this.waits.length > 24) this.waits.shift();
    if (job.shot) this.flown = job.shot;
    this.goingTo = job.shot;
    this.setMode(job.shot);
    const over = job.shot ? this.opts.durOverride?.[job.shot] : undefined;
    this.fly(job.cam, job.ms ?? over, !!job.shot && (this.opts.legs ?? 1) > 1);
  }

  private modeOf(shot: ShotName | null): MapMode {
    return modeFor(shot, this.opts.mode ?? "hybrid");
  }

  /** The mode for where the map is going, set as the flight starts (a no-op when unchanged). */
  private setMode(shot: ShotName | null) {
    const el = this.el;
    const m = this.modeOf(shot);
    if (el && el.mode !== m) el.mode = m;
  }

  private jump(c: G3dCamera) {
    const el = this.el;
    this.cam = c;
    if (el) {
      el.center = c.center;
      el.range = c.range;
      el.tilt = c.tilt;
      el.heading = c.heading;
      el.fov = c.fov;
    }
    // A cut (reduced motion, the walk under the cover, a shot set before the reveal): the lights for
    // that camera at once, drawn once.
    this.replan(c, true);
  }

  /** The second leg of a two-leg flight, flown when the first lands (the `legs` lab switch). */
  private nextLeg: { endCamera: object; durationMillis: number } | null = null;

  private fly(target: G3dCamera, ms?: number, twoLegs = false) {
    const el = this.el;
    if (!el) return;
    const from = this.cam ?? target;
    this.nextLeg = null;
    this.flights++;
    this.flying = true;
    this.gate.started();
    this.opts.onFlightStart();
    clearTimeout(this.landTimer);
    if (this.opts.reduced) {
      // Reduced motion: a cut, not a flight; the layer redraws once, for the new camera.
      this.jump(target);
      this.land();
      return;
    }
    this.cam = target;
    const dur = ms ?? flightMillis(from, target, this.opts.flightMs[0], this.opts.flightMs[1]);
    // THE LIGHTS OVER THE FLIGHT (round 57.6): the destination's homes planned now, and the set
    // cross-fades over most of the flight (the homes both shots draw stay lit), while every light
    // is projected frame by frame from the camera the map reports and its glyph eases with the
    // range. Nothing pops at the start or at the landing.
    this.replan(target, false, Math.round(dur * 0.8));
    this.layer?.setFlying(true);
    const end = { center: target.center, range: target.range, tilt: target.tilt, heading: target.heading, fov: target.fov };
    if (twoLegs) {
      const m = midCamera(from, target);
      const half = Math.round(dur / 2);
      this.nextLeg = { endCamera: end, durationMillis: dur - half };
      el.flyCameraTo({ endCamera: { center: m.center, range: m.range, tilt: m.tilt, heading: m.heading, fov: m.fov }, durationMillis: half });
    } else el.flyCameraTo({ endCamera: end, durationMillis: dur });
    // gmp-animationend is the landing; this is the net under it (an interrupted flight may not
    // report one).
    this.landTimer = setTimeout(() => this.flying && this.land(), dur + 500);
  }

  private land() {
    clearTimeout(this.landTimer);
    this.flying = false;
    this.at = this.goingTo;
    this.layer?.setFlying(false);
    this.opts.onLand();
    const next = this.gate.landed(performance.now());
    if (next) return this.go(next);
    this.pump();
  }

  /** The gate's hook (it asks for marker work once the map is still): the layer needs none. */
  private markNow() {}

  isFlying() {
    return this.flying || !this.revealed;
  }

  // ---- homes ------------------------------------------------------------------------------------

  setHomes(h: Homes) {
    this.homes = h;
    this.pins = lightPins(h);
    this.order = keyOrder(h.key);
    this.layer?.setHomes(h.lat, h.lng, this.heightAt);
    if (this.cam) this.replan(this.cam, true);
  }

  setElevation(g: ElevationGrid) {
    this.elev = g;
    const h = this.homes;
    if (h) this.layer?.setHomes(h.lat, h.lng, this.heightAt);
    if (this.featured.length) this.setFeatured(this.featured);
    this.layer?.kick();
  }

  private featured: readonly FeaturedHome[] = [];

  /** The featured homes, drawn a little larger than the rest whatever the shot (glyph.ts
   * featuredGlyph). The map takes no pointer and markers could never take focus (maps 3.66, round
   * 56), so the keyboard reaches the featured homes through their cards on the page (G3dGround). */
  setFeatured(list: readonly FeaturedHome[]) {
    this.featured = list;
    this.layer?.setFeatured(list, this.heightAt);
  }

  // ---- the light answers (round 57.3; on our canvas since 57.6) ------------------------------------
  // One light lit at a time: the hovered home's, or the featured home whose card has focus. The
  // layer eases it up (and the last one down) over LIT_MS.

  private litHome: number | null = null;
  private litFeatured: string | null = null;

  /** Light one drawn home (its index in the homes), or put the lit home out. */
  lightHome(i: number | null) {
    if (i === this.litHome) return;
    this.litHome = i;
    if (i !== null) this.litFeatured = null;
    this.layer?.light(i === null ? (this.litFeatured ? { featured: this.litFeatured } : null) : { home: i });
  }

  /** Light one featured home (its listing id), or put the lit featured home out. */
  lightFeatured(id: string | null) {
    if (id === this.litFeatured) return;
    this.litFeatured = id;
    if (id !== null) this.litHome = null;
    this.layer?.light(id === null ? (this.litHome !== null ? { home: this.litHome } : null) : { featured: id });
  }

  /** Which light is lit (the probes read it). */
  lit(): { home: number | null; featured: string | null } {
    return { home: this.litHome, featured: this.litFeatured };
  }

  /** The map is shown, drawn, still and not about to move: a click may fly in first. */
  isSteadyStill(): boolean {
    return this.revealed && !this.flying && !this.warming && this.steadyNow;
  }

  /** THE FLY-IN (round 57.3): a short descent over a home before its listing opens. Resolves when
   * the map lands, or at the fly-in's length plus a margin whatever the map says, so the route
   * change that follows is never held by a map that does not report its landing. */
  flyIn(home: { lat: number; lng: number }): Promise<void> {
    const cam = this.cam;
    if (!cam || !this.revealed) return Promise.resolve();
    this.request({ cam: flyInCamera(home, cam), shot: null, ms: FLY_IN_MS });
    const el = this.el;
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(cap);
        el?.removeEventListener("gmp-animationend", done);
        resolve();
      };
      el?.addEventListener("gmp-animationend", done);
      const cap = setTimeout(done, FLY_IN_MS + 120);
    });
  }

  townOf(i: number): string {
    const h = this.homes;
    return h ? h.towns[h.town[i]] ?? "" : "";
  }

  homeAt(i: number): { lat: number; lng: number } | null {
    const h = this.homes;
    return h ? { lat: h.lat[i], lng: h.lng[i] } : null;
  }

  /** THE MAP'S OWN SIZE, the viewport every projection uses (round 57.5). Measured by pixel
   * (scripts/_scratch-r57e-calib.mjs: each light swapped for a red dot, its centroid found): at
   * 1440 every drawn light stood 8.6 px LEFT of our projection at every stop, the same at the
   * territory and at a borough, whatever the glyph's size. A constant screen offset is not the
   * projection's maths, it is the window: `innerWidth` counts the page's 17 px scrollbar, the map
   * element does not, so our centre sat half a scrollbar right of Google's. The element's own
   * client size is the truth (a phone's overlay scrollbar makes the two equal). */
  view(): { width: number; height: number; fov: number } {
    const el = this.el;
    const { width, height } = el && el.clientWidth > 0 ? { width: el.clientWidth, height: el.clientHeight } : this.opts.viewport();
    return { width, height, fov: this.cam?.fov ?? 35 };
  }

  /** THE PLAN: which homes a camera draws (light-plan.ts planDensity, or round 57.2's lattice with
   * `?thin=lattice`), handed to the layer to fade to over `fadeMs` (or at once). */
  private replan(cam: G3dCamera, instant: boolean, fadeMs = 250) {
    const h = this.homes;
    const layer = this.layer;
    if (!h || !layer) return;
    const t0 = performance.now();
    const name = this.goingTo ?? this.flown ?? this.shot ?? "hero";
    // A camera of its own (a featured home) has no range of the page's; its eye distance stands in.
    const range = cam.range > 0 ? cam.range : 25_000;
    const vp = this.view();
    const vpc = { ...vp, fov: cam.fov };
    const focus = focusOf(name);
    const budget = budgetFor(range, vp);
    const gap = densityGap(range, isNarrow(vp), this.opts.cityGap);
    const frame = cameraFrame(cam);
    const proj = projectAll(layer.homesEcef, frame, vpc, 8, h.county, focus);
    const plan =
      this.opts.thin === "lattice"
        ? planLights({ lights: h, pins: this.pins, camera: cam, viewport: vpc, budget, gap: lightGap(range), focus })
        : planDensity({ ecef: layer.homesEcef, order: this.order, frame, viewport: vpc, budget, gap, county: h.county, focus, keep: layer.litIndices(), proj });
    // Round 57.8: each light's glow by the homes it stands for (light-plan.ts representedCounts),
    // so the glow keeps the true density where the gap has made the points even.
    const counts = representedCounts({ ecef: layer.homesEcef, frame, viewport: vpc, plan, reach: 1.5 * gap, county: h.county, focus, proj });
    const median = [...counts].sort((a, b) => a - b)[Math.floor(counts.length / 2)] ?? 1;
    const levels = new Uint8Array(plan.length);
    for (let k = 0; k < plan.length; k++) levels[k] = glowLevel(counts[k], median);
    this.lastPlanMs = Math.round((performance.now() - t0) * 10) / 10;
    this.planned = plan;
    layer.fadeMs = fadeMs;
    layer.plan(plan, instant || !!this.opts.reduced, levels);
    if (this.firstMarkerAt === null && plan.length) {
      this.firstMarkerAt = performance.now();
      performance.mark("g3d:first-marker");
    }
  }

  /** The ground's height at a place, in the altitudes the camera maths uses. */
  groundAlt(lat: number, lng: number): number {
    return this.heightAt(lat, lng);
  }

  /** The screen position of a featured home for the camera the map reports now (its light's
   * centre: the layer draws it centred on the home). */
  screenOf(lat: number, lng: number): { x: number; y: number } | null {
    const cam = this.liveCamera();
    if (!cam) return null;
    const e = homesEcef([lat], [lng], this.heightAt);
    const vp = { ...this.view(), fov: cam.fov };
    const p = { x: 0, y: 0, z: 0 };
    return projectHome(cameraFrame(cam), vp, focalOf(vp), e, 0, p) ? { x: p.x, y: p.y } : null;
  }

  stats(): G3dStats {
    return {
      loads,
      navToFirstSteady: this.firstSteadyAt === null ? null : Math.round(this.firstSteadyAt),
      warmMs: this.warmMs,
      warmSteps: this.warmSteps,
      navToSteady: this.steadyAt === null ? null : Math.round(this.steadyAt),
      navToFirstMarker: this.firstMarkerAt === null ? null : Math.round(this.firstMarkerAt),
      drawn: this.layer?.drawnCount() ?? 0,
      planned: this.planned.length,
      lastPlanMs: this.lastPlanMs,
      lastAddMs: 0,
      flights: this.flights,
      flying: this.flying,
      steady: this.steadyNow,
      busy: false,
      shot: this.flown ?? this.shot,
      held: this.gate.held()?.shot ?? null,
      waits: this.waits,
      error: this.error,
      mode: this.el?.mode ?? null,
      glyph: this.layer ? Math.round(this.layer.glyph.core * 20) / 10 : 0,
      layer: this.layer ? { frames: this.layer.cost.frames, maxMs: Math.round(this.layer.cost.maxMs * 100) / 100, meanMs: this.layer.cost.frames ? Math.round((this.layer.cost.totalMs / this.layer.cost.frames) * 1000) / 1000 : 0 } : null,
    };
  }

  camera(): MapCamera | null {
    return this.cam;
  }
}

/** Halfway between two cameras: the centre's midpoint, the geometric mean of the ranges, the mean
 * tilt, fov and (the short way round) heading. */
export function midCamera(a: G3dCamera, b: G3dCamera): G3dCamera {
  const dh = ((((b.heading - a.heading) % 360) + 540) % 360) - 180;
  return {
    center: { lat: (a.center.lat + b.center.lat) / 2, lng: (a.center.lng + b.center.lng) / 2, altitude: 0 },
    range: Math.round(Math.sqrt(Math.max(1, a.range) * Math.max(1, b.range))),
    tilt: (a.tilt + b.tilt) / 2,
    heading: (((a.heading + dh / 2) % 360) + 360) % 360,
    fov: (a.fov + b.fov) / 2,
  };
}

export function sameCamera(a: MapCamera | null, b: MapCamera): boolean {
  if (!a) return false;
  return (
    Math.abs(a.center.lat - b.center.lat) < 1e-6 &&
    Math.abs(a.center.lng - b.center.lng) < 1e-6 &&
    Math.abs(a.range - b.range) < 1 &&
    Math.abs(a.tilt - b.tilt) < 0.01 &&
    Math.abs(a.heading - b.heading) < 0.01
  );
}
