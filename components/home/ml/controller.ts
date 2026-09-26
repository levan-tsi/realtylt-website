/** THE MAPLIBRE NIGHT MAP BEHIND THE PAGE (round 57.12, the /lab/ml prototype): MapLibre GL with our
 * own night style (./style.ts) on OpenFreeMap's vector tiles and the AWS terrain, driven one flight
 * per section, with our homes lit on it by the same light layer as the Google map
 * (../g3d/light-layer.ts, its counts, gap and glow). Imperative, owned by MlGround.tsx; no React.
 *
 * Why this engine (docs/parity/DESIGN-ROUND57.md §9): Google's photorealistic map downloads an
 * 828 KB renderer and streams photographs on every first visit (5 to 15 s) and is coarse high up by
 * nature; a vector map is a few hundred KB of code and small tiles, sharp at every zoom.
 *
 * The library is loaded at run time from our own origin (public/maplibre/<version>/, the package's
 * own ES module files, copied unmodified), so the main thread and the tile worker share one copy of
 * its code (the worker imports the same `maplibre-gl-shared.mjs`), the site's bundle carries none
 * of it, and no page but this lab ever fetches it.
 *
 * The map takes no pointer (`interactive: false`, its box `pointer-events: none`): the page scrolls
 * as it always has, and hover, tap and click are ours, hit-tested against the lights we drew. */
// MapLibre's own stylesheet travels with this module (round 61): MlGround imports the controller
// only when the live map is the ground, so the plates page no longer blocks its first paint on it.
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MlMap, StyleSpecification } from "maplibre-gl";
import { sampleHeight, type ElevationGrid } from "../night/elevation";
import type { ShotName } from "../night/shots";
import { budgetFor, densityGap, focusOf, isNarrow } from "../g3d/cameras";
import { LightLayer, type LayerCamera } from "../g3d/light-layer";
import { glowLevel, keyOrder, planDensity, representedCounts, type Projected } from "../g3d/light-plan";
import type { CameraFrame } from "../g3d/camera";
import type { FeaturedHome, Homes } from "../g3d/controller";
import { FLY_IN_DEPTH, FLY_IN_MS } from "../g3d/interaction";
import { matrixFrame, mercX, mercY, mlFrame, projectMl, rangeForZoom, zoomForRange, type MlCamera, type MlFrame } from "./geo";
import { flightMs, lensFor, mlShot } from "./shots";
import { COARSE, EXAGGERATION, MAPLIBRE_URL, deepDemMaxzoom, nightStyle, type PlateOpt } from "./style";
import { FIRST_TILE_BUDGET_MS, slowFirstTile } from "./slow-line";
import type { GroundEngine } from "./engine";

export { MAPLIBRE_URL };


export interface MlStats {
  /** ms from navigation start: the library imported, the map created, its style loaded, the first
   * frame with a vector tile in it, and the first moment every tile of the opening shot was drawn. */
  importedAt: number | null;
  createdAt: number | null;
  loadAt: number | null;
  firstPaintAt: number | null;
  firstIdleAt: number | null;
  revealAt: number | null;
  /** Each landing: the shot, when its flight started, and how long from the landing until every
   * tile was drawn. */
  stops: { shot: string | null; startedAt: number; landedAt: number; idleMs: number | null }[];
  flights: number;
  flying: boolean;
  shot: string | null;
  drawn: number;
  planned: number;
  lastPlanMs: number;
  glyph: number;
  zoom: number | null;
  range: number | null;
  error: string | null;
  layer: { frames: number; maxMs: number; meanMs: number } | null;
  /** The slow line (./slow-line.ts): how it was known ("connection" before the map was made,
   * "first-tile" when the first vector tile was late), and when the first vector tile came. */
  slow: { by: "connection" | "first-tile" | null; firstTileAt: number | null };
  /** The plates engine (round 58): the plate on, the one arriving, the one queued, the ones
   * decoded ahead, and the aspect shown. */
  plates?: {
    at: string | null;
    to: string | null;
    next: string | null;
    warmed: string[];
    aspect: "wide" | "tall";
    /** Round 59, the films: the transitions that played as films and as fades, the films decoded
     * ahead, the clip format, the frame the last film reached and its dropped frames. */
    films?: { on: boolean; format: string | null; played: number; fades: number; rejected: number; ready: string[]; last: { key: string; frames: number; reached: number; drops: number; rate: number } | null; log: { key: string; kind: "film" | "fade"; at: number }[]; cost?: { frames: number; meanMs: number; maxMs: number } | null };
  };
}

type Job = { shot: ShotName | null; cam: MlCamera; ms?: number; offset?: [number, number] };

export class MlController implements GroundEngine {
  map: MlMap | null = null;
  layer: LightLayer | null = null;
  private homes: Homes | null = null;
  private order = new Int32Array(0);
  private planned: number[] = [];
  private elev: ElevationGrid | null = null;
  private revealed = false;
  private flying = false;
  private flights = 0;
  private flightId = 0;
  private at: ShotName | null = null;
  private goingTo: ShotName | null = null;
  private shot: ShotName | null = null;
  private target: MlCamera | null = null;
  private lastPlanMs = 0;
  private error: string | null = null;
  private stopped = false;
  private st: Omit<MlStats, "flights" | "flying" | "shot" | "drawn" | "planned" | "lastPlanMs" | "glyph" | "zoom" | "range" | "error" | "layer" | "slow"> = {
    importedAt: null,
    createdAt: null,
    loadAt: null,
    firstPaintAt: null,
    firstIdleAt: null,
    revealAt: null,
    stops: [],
  };
  /** The exaggeration the terrain is drawn with (0: no terrain), so our homes stand on it. Set to 0
   * when a slow line drops the terrain after the map was made. */
  exaggeration: number;
  private slowBy: "connection" | "first-tile" | null = null;
  private firstTileAt: number | null = null;

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
      reduced: boolean;
      viewport: () => { width: number; height: number };
      initial: ShotName;
      canvas: HTMLCanvasElement | null;
      onReveal: () => void;
      onLand: () => void;
      onFlightStart: () => void;
      onError: (msg: string) => void;
      /** When the cover lifts: at the opening shot's first full draw ("idle"), or at the first frame
       * with tiles ("paint"), bounded by `revealCapMs` from the map's creation. */
      revealOn: "idle" | "paint";
      revealCapMs: number;
      terrain: boolean;
      buildings: boolean;
      hillshade: boolean;
      exaggeration?: number;
      /** The terrain tiles' declared size and last zoom (style.ts DEM_TILE, DEM_MAXZOOM). */
      demTile?: number;
      demMaxzoom?: number;
      glow?: number;
      /** The halo's radius as a scale of glyph.ts's (`?halo=`, round 58). */
      halo?: number;
      /** Round 59: the halo's strength (`?ha=`) and the core's colour (`?core=r,g,b`). */
      ha?: number;
      core?: readonly number[];
      cityGap?: number;
      /** Round 61: `?budget=` multiplies the lights' count (cameras.ts budgetFor). */
      budgetScale?: number;
      /** The map's pixel ratio (`?pr=`, round 58: the plate renderer draws a phone plate at 3). The
       * page's own is the screen's, held to 2. */
      pixelRatio?: number;
      /** Round 59: the plate style (style.ts PlateOpt), for the plate renderer's pinned shot only. */
      plate?: PlateOpt | false;
      /** The camera centre's height, metres as drawn, held instead of clamped to the terrain
       * (`?elev=`, the deep plate render only). */
      centerElevation?: number;
      /** The line is slow, known before the map is made (./slow-line.ts slowConnection): the flat
       * night map with the coarse territory. Otherwise the map watches its first vector tile. */
      slow?: boolean;
      /** false: never judge the line by its first tile (`?slow=0`, the measurement's full arm). */
      watchFirstTile?: boolean;
    },
  ) {
    if (opts.slow) this.slowBy = "connection";
    this.exaggeration = opts.terrain && !opts.slow ? (opts.exaggeration ?? EXAGGERATION) : 0;
    if (opts.canvas) {
      this.layer = new LightLayer(opts.canvas, () => this.liveCamera(), () => isNarrow(opts.viewport()), {
        places: (lat, lng, height) => {
          const n = lat.length;
          const out = new Float64Array(n * 3);
          for (let i = 0; i < n; i++) {
            out[3 * i] = mercX(lng[i]);
            out[3 * i + 1] = mercY(lat[i]);
            out[3 * i + 2] = height(lat[i], lng[i]) * this.exaggeration;
          }
          return out;
        },
        frame: () => {
          const f = this.liveFrame();
          if (!f) return null;
          return (pts, i, out) => projectMl(f, pts[3 * i], pts[3 * i + 1], pts[3 * i + 2], out);
        },
      });
      this.layer.glowStrength = opts.glow;
      this.layer.haloScale = opts.halo;
      this.layer.haloStrength = opts.ha;
      this.layer.coreRgb = opts.core;
    }
  }

  private heightAt = (lat: number, lng: number) => (this.elev ? Math.max(0, sampleHeight(this.elev, lng, lat)) : 0);

  // ---- the map ----------------------------------------------------------------------------------

  async start(host: HTMLElement) {
    let lib: typeof import("maplibre-gl");
    try {
      lib = (await import(/* webpackIgnore: true */ MAPLIBRE_URL)) as typeof import("maplibre-gl");
    } catch (e) {
      return this.fail(`maplibre did not load: ${(e as Error).message}`);
    }
    if (this.stopped) return;
    this.st.importedAt = Math.round(performance.now());
    const vp = this.opts.viewport();
    const first = mlShot(this.opts.initial, vp, 0);
    this.shot = this.at = this.goingTo = this.opts.initial;
    this.target = first;
    let map: MlMap;
    try {
      map = new lib.Map({
        container: host,
        style: (this.opts.slow
          ? nightStyle({ terrain: false, hillshade: false, buildings: this.opts.buildings, coarse: COARSE })
          : nightStyle({ terrain: this.opts.terrain, buildings: this.opts.buildings, hillshade: this.opts.hillshade, exaggeration: this.exaggeration || undefined, demTile: this.opts.demTile, demMaxzoom: this.opts.plate && this.opts.plate.deep ? deepDemMaxzoom(first.zoom, this.opts.demMaxzoom) : this.opts.demMaxzoom, plate: this.opts.plate })) as StyleSpecification,
        center: [first.lng, first.lat],
        zoom: first.zoom,
        pitch: first.pitch,
        bearing: first.bearing,
        maxPitch: 75,
        interactive: false,
        attributionControl: false,
        // Tiles cross-fade in over 150 ms instead of 300: less time reading as unfinished.
        fadeDuration: 150,
        pixelRatio: this.opts.pixelRatio && this.opts.pixelRatio > 0 ? Math.min(4, this.opts.pixelRatio) : Math.min(2, window.devicePixelRatio || 1),
        canvasContextAttributes: { antialias: false, powerPreference: "high-performance" },
        // The page never shows the world twice over.
        renderWorldCopies: false,
      });
    } catch (e) {
      return this.fail(`map: ${(e as Error).message}`);
    }
    this.map = map;
    map.setVerticalFieldOfView(first.fov);
    // Round 59, the deep plate: its centre's height is the one the plain render reported (read by the
    // renderer in a plain pass first). The map sets it from whichever terrain level has arrived when
    // it clamps, which is not the same level one zoom deeper (measured 10 m apart at Newburgh: 0.9 px).
    if (this.opts.centerElevation != null) {
      map.setCenterClampedToGround(false);
      map.setCenterElevation(this.opts.centerElevation);
    }
    this.st.createdAt = Math.round(performance.now());
    // The cover's longest hold: past it the map is shown as far as it has drawn. If it has drawn
    // nothing yet (a slow line: round 57.13 measured the first tile at 18 s on Slow 4G), the cover,
    // a frame of this same map, holds until the opening shot is whole; it is not a failure.
    const cap = setTimeout(() => {
      if (!this.revealed && !this.error && this.st.firstPaintAt !== null) this.reveal();
    }, this.opts.revealCapMs);
    let sawTile = false;
    map.on("load", () => {
      this.st.loadAt = Math.round(performance.now());
      this.replan(this.target!, true);
    });
    map.on("data", (e) => {
      const d = e as { dataType?: string; tile?: unknown; sourceId?: string };
      if (d.dataType !== "source" || !d.tile) return;
      sawTile = true;
      if (this.firstTileAt === null && d.sourceId !== "dem") this.firstTileAt = Math.round(performance.now());
    });
    // The slow line found out (./slow-line.ts): no vector tile two seconds after the map was made.
    if (!this.opts.slow && this.opts.watchFirstTile !== false)
      setTimeout(() => {
        if (!this.stopped && slowFirstTile(this.firstTileAt, this.st.createdAt ?? 0, Math.round(performance.now()))) this.dropTerrain();
      }, FIRST_TILE_BUDGET_MS + 1);
    map.on("render", () => {
      if (sawTile && this.st.firstPaintAt === null) {
        this.st.firstPaintAt = Math.round(performance.now());
        performance.mark("ml:first-paint");
        if (this.opts.revealOn === "paint") this.reveal();
      }
      this.layer?.onCameraChange();
    });
    map.on("idle", () => {
      const now = Math.round(performance.now());
      if (this.st.firstIdleAt === null) {
        this.st.firstIdleAt = now;
        performance.mark("ml:first-idle");
        clearTimeout(cap);
        this.reveal();
      }
      const s = this.st.stops[this.st.stops.length - 1];
      if (s && s.idleMs === null && !this.flying) s.idleMs = now - s.landedAt;
    });
    map.on("error", (e) => {
      // A tile that fails is the map's own business (it retries, the parent tile stands in); only a
      // failure before anything is drawn leaves our cover.
      const msg = (e as unknown as { error?: { message?: string } }).error?.message ?? "error";
      if (this.st.firstPaintAt === null && /style|WebGL|context/i.test(msg)) this.fail(msg);
      else console.warn("[ml]", msg);
    });
    map.on("moveend", () => {
      if (this.flying && this.moveId === this.flightId) this.land();
    });
    const now = Math.round(performance.now());
    this.st.stops.push({ shot: this.opts.initial, startedAt: now, landedAt: now, idleMs: null });
  }

  private moveId = 0;
  private startedAt = 0;

  /** A slow line found out after the map was made: the terrain and the hillshade go (their PNGs
   * stop queueing in front of the vector tiles), and our homes come down onto the flat map. */
  private dropTerrain() {
    const m = this.map;
    if (!m || this.slowBy) return;
    this.slowBy = "first-tile";
    try {
      m.setTerrain(null);
      if (m.getLayer("relief")) m.removeLayer("relief");
      if (m.getSource("dem")) m.removeSource("dem");
    } catch (e) {
      console.warn("[ml] terrain", (e as Error).message);
    }
    this.exaggeration = 0;
    const h = this.homes;
    if (h) this.layer?.setHomes(h.lat, h.lng, this.heightAt);
    if (this.featured.length) this.setFeatured(this.featured);
    if (this.target) {
      this.target = { ...this.target, elevation: 0 };
      this.replan(this.target, true);
    }
  }

  stop() {
    this.stopped = true;
    this.layer?.stop();
    this.map?.remove();
    this.map = null;
  }

  private fail(msg: string) {
    if (this.error) return;
    this.error = msg;
    this.opts.onError(msg);
  }

  private reveal() {
    if (this.revealed || this.error) return;
    this.revealed = true;
    this.st.revealAt = Math.round(performance.now());
    performance.mark("ml:reveal");
    this.opts.onReveal();
  }

  // ---- the camera -------------------------------------------------------------------------------

  /** The map's camera now, in the form our light layer and names take (range in metres). */
  liveCamera(): LayerCamera | null {
    const m = this.map;
    if (!m) return null;
    const c = m.getCenter();
    const { height } = this.view();
    const fov = m.getVerticalFieldOfView();
    const elev = tf(m).elevation ?? 0;
    return { center: { lat: c.lat, lng: c.lng, altitude: elev }, range: rangeForZoom(m.getZoom(), c.lat, height, fov), tilt: m.getPitch(), heading: m.getBearing(), fov };
  }

  /** The map's own projection this frame (its transform's 3D pixel matrix), or ours rebuilt from its
   * camera if the matrix is not where maplibre-gl 6.11 keeps it. */
  liveFrame(): MlFrame | null {
    const m = this.map;
    if (!m) return null;
    const t = tf(m);
    if (t._pixelMatrix3D && t._pixelMatrix3D.length === 16 && t.worldSize) return matrixFrame(t._pixelMatrix3D, t.worldSize);
    const c = m.getCenter();
    return mlFrame({ lng: c.lng, lat: c.lat, zoom: m.getZoom(), pitch: m.getPitch(), bearing: m.getBearing(), fov: m.getVerticalFieldOfView(), elevation: t.elevation ?? 0 }, this.view());
  }

  /** The window the map draws into (its container's own size: no scrollbar). */
  view(): { width: number; height: number; fov: number } {
    const c = this.map?.getContainer();
    const { width, height } = c && c.clientWidth > 0 ? { width: c.clientWidth, height: c.clientHeight } : this.opts.viewport();
    return { width, height, fov: this.map?.getVerticalFieldOfView() ?? lensFor({ width, height }) };
  }

  /** A shot's camera for this window, its centre standing on our elevation. */
  cameraOf(name: ShotName): MlCamera {
    const vp = this.view();
    const c = mlShot(name, vp);
    return { ...c, elevation: this.heightAt(c.lat, c.lng) * this.exaggeration };
  }

  ready() {
    return !!this.map;
  }

  setAvoid(r: { x: number; y: number; w: number; h: number } | null) {
    if (this.layer) this.layer.avoid = r;
  }

  heldShot(): ShotName | null {
    return this.revealed && !this.flying ? this.at : null;
  }

  isFlying() {
    return this.flying || !this.revealed;
  }

  isSteadyStill() {
    return this.revealed && !this.flying;
  }

  /** The window changed size: the lens follows the aspect and the shot is re-framed at once. */
  resized() {
    const m = this.map;
    if (!m) return;
    m.resize();
    this.layer?.resize();
    const vp = this.view();
    m.setVerticalFieldOfView(lensFor(vp));
    if (!this.flying && this.at) this.jump(this.cameraOf(this.at));
  }

  flyToShot(name: ShotName) {
    this.shot = name;
    const cam = this.cameraOf(name);
    if (!this.revealed) {
      // Under the cover: go there directly (nothing to watch yet).
      if (name === this.at) return;
      this.at = this.goingTo = name;
      this.jump(cam);
      return;
    }
    if (name === this.goingTo && (this.flying || this.at === name)) return;
    this.go({ shot: name, cam });
  }

  /** Fly so a home stands at a point of the window (a featured card's focus: interaction.ts openPoint). */
  flyToHome(home: { lat: number; lng: number }, spot: { x: number; y: number } | null, ms = 1800) {
    if (!this.revealed) return;
    const vp = this.view();
    const range = 2600;
    const cam: MlCamera = {
      lat: home.lat,
      lng: home.lng,
      zoom: zoomForRange(range, home.lat, vp.height, vp.fov),
      pitch: 55,
      bearing: this.map?.getBearing() ?? 0,
      fov: vp.fov,
      elevation: this.heightAt(home.lat, home.lng) * this.exaggeration,
    };
    const offset: [number, number] | undefined = spot ? [spot.x - vp.width / 2, spot.y - vp.height / 2] : undefined;
    this.go({ shot: null, cam, ms, offset });
  }

  /** The fly-in before a listing opens: over the home, a sixth of the way down (never under 1.5 km). */
  flyIn(home: { lat: number; lng: number }): Promise<void> {
    const live = this.liveCamera();
    if (!live || !this.revealed) return Promise.resolve();
    const vp = this.view();
    const range = Math.max(1500, live.range / FLY_IN_DEPTH);
    const cam: MlCamera = { lat: home.lat, lng: home.lng, zoom: zoomForRange(range, home.lat, vp.height, vp.fov), pitch: 60, bearing: live.heading, fov: vp.fov, elevation: this.heightAt(home.lat, home.lng) * this.exaggeration };
    this.go({ shot: null, cam, ms: FLY_IN_MS });
    return new Promise((r) => setTimeout(r, FLY_IN_MS + 60));
  }

  private jump(c: MlCamera) {
    const m = this.map;
    this.target = c;
    if (m) m.jumpTo({ center: [c.lng, c.lat], zoom: c.zoom, pitch: c.pitch, bearing: c.bearing });
    this.replan(c, true);
  }

  private go(job: Job) {
    const m = this.map;
    if (!m) return;
    this.flights++;
    const id = ++this.flightId;
    this.startedAt = Math.round(performance.now());
    this.goingTo = job.shot;
    this.flying = true;
    this.opts.onFlightStart();
    const from = this.liveCamera();
    this.target = job.cam;
    if (this.opts.reduced) {
      // Reduced motion: a cut, drawn once.
      this.jump(job.cam);
      this.moveId = id;
      this.land();
      return;
    }
    const to = { lat: job.cam.lat, lng: job.cam.lng, range: rangeForZoom(job.cam.zoom, job.cam.lat, this.view().height, job.cam.fov) };
    const dur = job.ms ?? (from ? flightMs({ lat: from.center.lat, lng: from.center.lng, range: from.range }, to) : 1600);
    // The destination's homes planned now; the set cross-fades over most of the flight while every
    // light follows the camera frame by frame (the Google map's rule, round 57.6).
    this.replan(job.cam, false, Math.round(dur * 0.8));
    this.layer?.setFlying(true);
    this.moveId = id;
    m.flyTo({ center: [job.cam.lng, job.cam.lat], zoom: job.cam.zoom, pitch: job.cam.pitch, bearing: job.cam.bearing, duration: dur, essential: true, curve: 1.3, ...(job.offset ? { offset: job.offset } : {}) });
  }

  private land() {
    this.flying = false;
    this.at = this.goingTo;
    this.layer?.setFlying(false);
    this.st.stops.push({ shot: this.at, startedAt: this.startedAt, landedAt: Math.round(performance.now()), idleMs: null });
    if (this.st.stops.length > 60) this.st.stops.shift();
    this.opts.onLand();
  }

  // ---- homes ------------------------------------------------------------------------------------

  setHomes(h: Homes) {
    this.homes = h;
    this.order = keyOrder(h.key);
    this.layer?.setHomes(h.lat, h.lng, this.heightAt);
    if (this.target) this.replan(this.target, true);
  }

  setElevation(g: ElevationGrid) {
    this.elev = g;
    const h = this.homes;
    if (h) this.layer?.setHomes(h.lat, h.lng, this.heightAt);
    if (this.featured.length) this.setFeatured(this.featured);
    if (this.target) this.replan(this.target, true);
  }

  private featured: readonly FeaturedHome[] = [];
  setFeatured(list: readonly FeaturedHome[]) {
    this.featured = list;
    this.layer?.setFeatured(list, this.heightAt);
  }

  private litHome: number | null = null;
  private litFeatured: string | null = null;
  lightHome(i: number | null) {
    if (i === this.litHome) return;
    this.litHome = i;
    if (i !== null) this.litFeatured = null;
    this.layer?.light(i === null ? (this.litFeatured ? { featured: this.litFeatured } : null) : { home: i });
  }
  lightFeatured(id: string | null) {
    if (id === this.litFeatured) return;
    this.litFeatured = id;
    if (id !== null) this.litHome = null;
    this.layer?.light(id === null ? (this.litHome !== null ? { home: this.litHome } : null) : { featured: id });
  }
  lit() {
    return { home: this.litHome, featured: this.litFeatured };
  }

  townOf(i: number): string {
    const h = this.homes;
    return h ? h.towns[h.town[i]] ?? "" : "";
  }
  homeAt(i: number): { lat: number; lng: number } | null {
    const h = this.homes;
    return h ? { lat: h.lat[i], lng: h.lng[i] } : null;
  }

  /** A place on screen in the camera the map is at now (the featured homes' labels, our names). */
  screenOf(lat: number, lng: number, h?: number): { x: number; y: number } | null {
    const f = this.liveFrame();
    if (!f) return null;
    const p = { x: 0, y: 0, z: 0 };
    return projectMl(f, mercX(lng), mercY(lat), h ?? this.heightAt(lat, lng) * this.exaggeration, p) ? { x: p.x, y: p.y } : null;
  }

  /** THE PLAN (the Google map's, ../g3d/controller.ts replan): which homes a camera draws, by the
   * same count by range, gap and glow, projected with this map's projection for that camera. */
  private replan(cam: MlCamera, instant: boolean, fadeMs = 250) {
    const h = this.homes;
    const layer = this.layer;
    if (!h || !layer) return;
    const t0 = performance.now();
    const vp = this.view();
    const range = rangeForZoom(cam.zoom, cam.lat, vp.height, cam.fov);
    const name = this.goingTo ?? this.shot ?? "hero";
    const focus = focusOf(name);
    const budget = budgetFor(range, vp, this.opts.budgetScale);
    const gap = densityGap(range, isNarrow(vp), this.opts.cityGap);
    const f = mlFrame(cam, vp);
    const proj = projectAllMl(layer.homesEcef, f, vp, 8, h.county, focus);
    const vpc = { ...vp, fov: cam.fov };
    // The planner's `frame` is only read for homes the projection refused, and a plan holds none.
    const plan = planDensity({ ecef: layer.homesEcef, order: this.order, frame: NO_FRAME, viewport: vpc, budget, gap, county: h.county, focus, keep: layer.litIndices(), proj });
    const counts = representedCounts({ ecef: layer.homesEcef, frame: NO_FRAME, viewport: vpc, plan, reach: 1.5 * gap, county: h.county, focus, proj });
    const median = [...counts].sort((a, b) => a - b)[Math.floor(counts.length / 2)] ?? 1;
    const levels = new Uint8Array(plan.length);
    for (let k = 0; k < plan.length; k++) levels[k] = glowLevel(counts[k], median);
    this.lastPlanMs = Math.round((performance.now() - t0) * 10) / 10;
    this.planned = plan;
    layer.fadeMs = fadeMs;
    layer.plan(plan, instant || this.opts.reduced, levels);
  }

  stats(): MlStats {
    const m = this.map;
    const live = this.liveCamera();
    const L = this.layer;
    return {
      ...this.st,
      flights: this.flights,
      flying: this.flying,
      shot: this.goingTo ?? this.at,
      drawn: L?.drawnCount() ?? 0,
      planned: this.planned.length,
      lastPlanMs: this.lastPlanMs,
      glyph: L ? Math.round(L.glyph.core * 20) / 10 : 0,
      zoom: m ? Math.round(m.getZoom() * 100) / 100 : null,
      range: live ? Math.round(live.range) : null,
      error: this.error,
      layer: L ? { frames: L.cost.frames, maxMs: Math.round(L.cost.maxMs * 100) / 100, meanMs: L.cost.frames ? Math.round((L.cost.totalMs / L.cost.frames) * 1000) / 1000 : 0 } : null,
      slow: { by: this.slowBy, firstTileAt: this.firstTileAt },
    };
  }

  camera(): LayerCamera | null {
    return this.liveCamera();
  }
}

/** The map's transform, the parts this reads (maplibre-gl 6.11 keeps them there; `transform` is not
 * in its public types; the map keeps it on its camera). */
type Tf = { _pixelMatrix3D?: ArrayLike<number>; worldSize?: number; elevation?: number };
const tf = (m: MlMap): Tf => {
  const x = m as unknown as { transform?: Tf; _camera?: { transform?: Tf } };
  return x.transform ?? x._camera?.transform ?? {};
};

/** A frame no home is projected with (see replan). */
const NO_FRAME: CameraFrame = { eye: [0, 0, 0], right: [1, 0, 0], up: [0, 1, 0], forward: [0, 0, 1] };

/** Every home on screen for a camera (in the focus county), in css px, by this map's projection:
 * light-plan.ts projectAll's twin. */
export function projectAllMl(pts: Float64Array, f: MlFrame, vp: { width: number; height: number }, margin = 8, county?: readonly string[], focus?: string | null): Projected {
  const n = pts.length / 3;
  const x = new Float32Array(n), y = new Float32Array(n), ok = new Uint8Array(n);
  const p = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < n; i++) {
    if (focus && county && county[i] !== focus) continue;
    if (!projectMl(f, pts[3 * i], pts[3 * i + 1], pts[3 * i + 2], p)) continue;
    if (p.x < -margin || p.y < -margin || p.x > vp.width + margin || p.y > vp.height + margin) continue;
    x[i] = p.x;
    y[i] = p.y;
    ok[i] = 1;
  }
  return { x, y, ok };
}
