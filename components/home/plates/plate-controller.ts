/** THE PLATES BEHIND THE PAGE (round 58, docs/parity/DESIGN-ROUND58.md §3): the home page's ground
 * as seventeen pictures of our own night map, one per shot, with our lights drawn live on each by
 * the picture's own recorded camera (./plate-frame.ts). Imperative, owned by MlGround.tsx; no React.
 *
 * Two LAYERS (slots) hold the pictures: the one on screen and the one arriving. A section change is
 * a fade over with a settle (./plate-motion.ts): the arriving layer, its plate decoded first, is
 * laid on top and fades in while it settles from 1.04 to 1; the layer underneath holds and pushes
 * a little; then the roles swap and nothing moves. Each layer carries its own light canvas
 * (../g3d/light-layer.ts), planned once for its plate, so the lights fade with their picture.
 *
 * Nothing here fetches a tile or a library: a plate is one image (AVIF, WebP behind it), the next
 * and the previous on the ladder decoded ahead (`warm`), the first one server-rendered and
 * preloaded with the document (app/page.tsx). The click's fly-in is a push into the picture; a
 * featured card's focus shows its home on the closest plate that contains it.
 *
 * Round 59, THE FLIGHT AS A FILM (docs/parity/DESIGN-ROUND59.md §3): between two ADJACENT plates the
 * map moves again. Each such flight was recorded once from the live map (scripts/make-flights.mjs),
 * frame by frame, with the camera's matrix per frame; the clip plays in a third layer above the
 * plates, our lights drawn on every presented frame from that frame's matrix (exact, as on a
 * plate), plate B waiting under it. Its first frame dissolves in over plate A, its last dissolves out
 * onto plate B, both while still. The clips near the page are decoded ahead like the plates; the fade
 * over stays for any other jump, reduced motion, a clip not ready, and a browser that will not play. */
import { sampleHeight, type ElevationGrid } from "../night/elevation";
import type { ShotName } from "../night/shots";
import { budgetFor, densityGap, focusOf, isNarrow } from "../g3d/cameras";
import { LightLayer, type LayerCamera } from "../g3d/light-layer";
import { glowLevel, keyOrder, planDensity, representedCounts, type Projected } from "../g3d/light-plan";
import type { CameraFrame } from "../g3d/camera";
import type { FeaturedHome, Homes } from "../g3d/controller";
import { FLY_IN_MS } from "../g3d/interaction";
import { mercX, mercY } from "../ml/geo";
import type { MlStats } from "../ml/controller";
import type { GroundEngine } from "../ml/engine";
import { aspectFor, coverFit, filmDataSrc, filmFormat, filmOf, filmSrc, filmWidth, framePlate, plateProjector, plateRange, plateSrc, plateSrcSet, type CoverFit, type FilmClip, type FilmFormat, type FilmFrame, type FilmManifest, type Plate, type PlateAspect, type PlateFormat, type PlateManifest, type Projector } from "./plate-frame";
import { FADE_MS, FADE_REDUCED_MS, FILM_IN_MS, FILM_OUT_MS, PUSH_TO, SETTLE_FROM, filmHurry, finished, hurryRate, idle, request, useFilm, type Motion, type MotionState } from "./plate-motion";
import { frameAt } from "./flight-path";

/** One layer's elements: the picture (four sources: AVIF and WebP, the tall and the wide), its image,
 * and the canvas our lights are drawn on. `data-plate-src` on each source names its format and aspect. */
export interface PlateSlotEls {
  root: HTMLElement;
  picture: HTMLPictureElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
}

interface Slot {
  el: PlateSlotEls;
  layer: LightLayer;
  shot: ShotName | null;
  plate: Plate | null;
  fit: CoverFit;
  at: Projector | null;
  planned: number[];
  /** The glow step of each planned home (the film's lights take the same). */
  levels: Uint8Array;
}

/** ROUND 59, THE FILM LAYER: above the two plates, the playing clip and its own light canvas, whose
 * camera is the frame on screen (its recorded matrix: exact, as a plate's). */
export interface PlateFilmEls {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
}
interface FilmLayer {
  el: PlateFilmEls;
  layer: LightLayer;
  plate: Plate | null;
  fit: CoverFit;
  at: Projector | null;
}
/** A film decoded ahead: its clip (a video element in the film layer, hidden), its frames. */
interface FilmEntry {
  id: string;
  key: string;
  reverse: boolean;
  aspect: PlateAspect;
  clip: FilmClip;
  video: HTMLVideoElement;
  frames: FilmFrame[] | null;
  ready: boolean;
  failed: boolean;
}

/** The plates a featured home is looked for on, closest pictures first (the counties, the harbour,
 * the chapters, then the two high ones), so its light stands large in a place, not small in the
 * territory. */
const HOME_PLATES: readonly ShotName[] = ["ulster", "dutchess-county", "orange", "putnam", "rockland", "westchester-county", "bronx", "manhattan", "queens", "brooklyn", "staten-island", "harbour", "dutchess", "highlands", "westchester", "region", "hero"];

/** The settle's curve as CSS (plate-motion.ts settleScale is the same ease-out cubic). */
const SETTLE_EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
/** How far the click's fly-in pushes into the picture. */
const FLY_IN_SCALE = 1.6;
/** Films kept decoded at most, one video element each (the ones near the page, then the most
 * recently near). The phone keeps two: the fewest that still decode the next film ahead while the
 * one just played can be played back (a phone's browser holding many video elements is the crash
 * pattern the record §3 cites). */
const FILMS_KEPT = { wide: 4, tall: 2 } as const;

export class PlateController implements GroundEngine {
  private slots: Slot[] = [];
  private cur = 0;
  private motion: MotionState = idle();
  private anims: Animation[] = [];
  private beginId = 0;
  private revealed = false;
  private stopped = false;
  private error: string | null = null;
  private flights = 0;
  private startedAt = 0;
  private lastPlanMs = 0;
  private homes: Homes | null = null;
  private order = new Int32Array(0);
  private elev: ElevationGrid | null = null;
  private featured: readonly FeaturedHome[] = [];
  private litHome: number | null = null;
  private litFeatured: string | null = null;
  private flyInAnim: Animation | null = null;
  private avoid: { x: number; y: number; w: number; h: number } | null = null;
  /** Pictures decoded ahead, by shot (a detached picture keeps the bytes and the decode warm). */
  private warmed = new Map<ShotName, { pic: HTMLPictureElement; done: Promise<void> }>();
  private wantInitial: ShotName;
  private st = { createdAt: 0, firstPaintAt: null as number | null, stops: [] as MlStats["stops"] };
  /** Round 59, the films: the layer, the clips decoded ahead (by from>to>aspect), the format this
   * browser plays best, and what played. */
  private film: FilmLayer | null = null;
  private films = new Map<string, FilmEntry>();
  /** The clip formats this browser plays, best first (empty: every transition fades). */
  private formats: FilmFormat[] = [];
  private formatAsked = false;
  private playing: { entry: FilmEntry; inc: Slot; out: Slot; id: number; reached: number; drops: number; frames: number; ending: boolean; outAnim: Animation | null } | null = null;
  private fs = { played: 0, fades: 0, rejected: 0, last: null as { key: string; frames: number; reached: number; drops: number; rate: number } | null, log: [] as { key: string; kind: "film" | "fade"; at: number }[] };

  constructor(
    private opts: {
      reduced: boolean;
      viewport: () => { width: number; height: number };
      initial: ShotName;
      manifest: PlateManifest;
      slots: PlateSlotEls[];
      onReveal: () => void;
      onLand: () => void;
      onFlightStart: () => void;
      onError: (msg: string) => void;
      glow?: number;
      halo?: number;
      ha?: number;
      core?: readonly number[];
      cityGap?: number;
      /** Round 59: the recorded flights, the film layer's elements, and `?film=0` (films off). */
      films?: FilmManifest;
      film?: PlateFilmEls | null;
      filmOff?: boolean;
    },
  ) {
    this.wantInitial = opts.initial;
    for (const el of opts.slots) {
      const slot: Slot = { el, layer: null as unknown as LightLayer, shot: null, plate: null, fit: { s: 1, ox: 0, oy: 0 }, at: null, planned: [], levels: new Uint8Array(0) };
      slot.layer = this.lightsFor(el.canvas, slot);
      this.slots.push(slot);
    }
    if (opts.film && opts.films && !opts.reduced && !opts.filmOff) {
      const f: FilmLayer = { el: opts.film, layer: null as unknown as LightLayer, plate: null, fit: { s: 1, ox: 0, oy: 0 }, at: null };
      f.layer = this.lightsFor(opts.film.canvas, f);
      this.film = f;
    }
  }

  /** A light canvas projected by a picture's own camera (a plate's, or the film's frame on screen). */
  private lightsFor(canvas: HTMLCanvasElement, s: { plate: Plate | null; fit: CoverFit; at: Projector | null }): LightLayer {
    const layer = new LightLayer(
      canvas,
      () => this.cameraOfSlot(s),
      () => isNarrow(this.opts.viewport()),
      {
        places: (lat, lng, height) => {
          const n = lat.length;
          const out = new Float64Array(n * 3);
          for (let i = 0; i < n; i++) {
            out[3 * i] = mercX(lng[i]);
            out[3 * i + 1] = mercY(lat[i]);
            out[3 * i + 2] = height(lat[i], lng[i]);
          }
          return out;
        },
        frame: () => {
          const at = s.at, p = s.plate;
          if (!at || !p) return null;
          const ex = p.ex;
          return (pts, i, out) => at(pts[3 * i], pts[3 * i + 1], pts[3 * i + 2] * ex, out);
        },
      },
    );
    layer.glowStrength = this.opts.glow;
    layer.haloScale = this.opts.halo;
    layer.haloStrength = this.opts.ha;
    layer.coreRgb = this.opts.core;
    return layer;
  }

  /** Every light canvas: the two plates' and the film's. */
  private layers(): LightLayer[] {
    return this.film ? [...this.slots.map((s) => s.layer), this.film.layer] : this.slots.map((s) => s.layer);
  }

  // ---- the engine's surface --------------------------------------------------------------------

  get layer(): LightLayer | null {
    return this.slots[this.cur]?.layer ?? null;
  }
  get xy() {
    return this.layer?.xy ?? new Float32Array(0);
  }
  get xyIndex() {
    return this.layer?.xyIndex ?? new Int32Array(0);
  }
  get xyCount() {
    return this.layer?.xyCount ?? 0;
  }

  ready() {
    return this.revealed;
  }

  async start() {
    this.st.createdAt = Math.round(performance.now());
    if (this.slots.length < 2) return this.fail("the ground has no layers");
    const first = this.slots[0];
    const shot = this.wantInitial;
    try {
      // The server rendered the territory in the first layer (app/page.tsx): decoding it is all; any
      // other first shot (the page opened scrolled down) is set and decoded now.
      const img = first.el.img;
      if (img.dataset.shot !== shot) this.setSources(first.el.picture, img, shot);
      // Round 61: a picture already in (the usual case: the server's territory, its bytes preloaded
      // with the document and landed long before the script) is on screen at full strength, so there
      // is nothing to wait for. Awaiting `decode()` on it resolved only after the rest of the page
      // had hydrated (a task queued behind React's; measured: the engine up at ~500 ms, the reveal
      // and the lights at ~700), so the plate's lights waited ~200 ms on work that is not theirs.
      if (!(img.complete && img.naturalWidth > 0)) await this.decoded(img);
    } catch (e) {
      return this.fail(`the plate did not load: ${(e as Error).message}`);
    }
    if (this.stopped) return;
    this.adopt(first, shot);
    this.motion = idle(shot);
    this.revealed = true;
    this.st.firstPaintAt = Math.round(performance.now());
    performance.mark("ml:first-paint");
    performance.mark("ml:reveal");
    this.st.stops.push({ shot, startedAt: this.st.firstPaintAt, landedAt: this.st.firstPaintAt, idleMs: 0 });
    // The first plate's lights come up softly when the homes arrive (replan below); if they are
    // here already, now.
    this.replan(first, false, 600);
    this.opts.onReveal();
    // The one after it, decoded while the visitor reads.
    if (shot !== this.wantInitial) this.flyToShot(this.wantInitial);
  }

  stop() {
    this.stopped = true;
    for (const a of this.anims) a.cancel();
    this.flyInAnim?.cancel();
    for (const l of this.layers()) l.stop();
    this.warmed.clear();
    for (const e of this.films.values()) this.dropFilm(e);
    this.films.clear();
  }

  /** THE BOX THE PICTURE IS FITTED TO: the layer's own (fixed, inset 0: the layout viewport, which
   * leaves out a scrollbar), never `window.innerWidth`, which counts the scrollbar in. Measured
   * before this was written (scripts/_scratch-r58-calib.mjs): fitted to innerWidth at 1440, every
   * light stood 7.5 px right of where the live map drew it, half the 15 px scrollbar. */
  private box(): { width: number; height: number } {
    const r = this.slots[0]?.el.root;
    if (r && r.clientWidth > 0 && r.clientHeight > 0) return { width: r.clientWidth, height: r.clientHeight };
    return this.opts.viewport();
  }

  view() {
    const { width, height } = this.box();
    return { width, height, fov: this.slotNow().plate?.cam.fov ?? 40 };
  }

  heldShot(): ShotName | null {
    return this.revealed && !this.motion.motion ? this.motion.at : null;
  }
  isFlying() {
    return !this.revealed || !!this.motion.motion;
  }
  isSteadyStill() {
    return this.revealed && !this.motion.motion;
  }

  resized() {
    for (const s of this.slots) {
      if (!s.plate || !s.shot) continue;
      // The aspect may have changed with the width (the picture's sources switch by media query on
      // their own; the plate's record follows).
      s.plate = this.plateOf(s.shot);
      s.fit = coverFit(s.plate, this.box());
      s.at = plateProjector(s.plate, s.fit);
      s.layer.resize();
      this.replan(s, true);
    }
    const f = this.film;
    if (f) {
      if (f.plate) {
        f.fit = coverFit(f.plate, this.box());
        f.at = plateProjector(f.plate, f.fit);
      }
      f.layer.resize();
    }
  }

  setAvoid(r: { x: number; y: number; w: number; h: number } | null) {
    this.avoid = r;
    for (const s of this.slots) s.layer.avoid = r;
  }

  flyToShot(name: ShotName) {
    if (!this.revealed) {
      this.wantInitial = name;
      return;
    }
    if (this.flyInAnim && name === this.motion.at) this.undoFlyIn();
    const now = performance.now();
    const step = request(this.motion, name, now, this.fadeMs(), this.filmMs);
    this.motion = step.state;
    if (step.action === "start") void this.begin(step.state.motion!);
    else if (step.action === "queue") this.hurry(now);
  }

  /** A featured card's focus: the closest plate the home stands on, with room round it; the open
   * spot the live map framed the home at has no meaning on a fixed picture. */
  flyToHome(home: { lat: number; lng: number }) {
    if (!this.revealed) return;
    const shot = this.plateContaining(home);
    if (shot) this.flyToShot(shot);
  }

  /** The click's fly-in: a push into the picture about the home, then the listing opens. Reduced
   * motion: none. */
  flyIn(home: { lat: number; lng: number }): Promise<void> {
    if (!this.revealed || this.opts.reduced) return Promise.resolve();
    const slot = this.slotNow();
    const p = this.screenOf(home.lat, home.lng);
    if (!p) return Promise.resolve();
    const root = slot.el.root;
    root.style.transformOrigin = `${p.x}px ${p.y}px`;
    this.flyInAnim = root.animate([{ transform: "scale(1)" }, { transform: `scale(${FLY_IN_SCALE})` }], { duration: FLY_IN_MS, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" });
    return new Promise((r) => setTimeout(r, FLY_IN_MS + 60));
  }

  private undoFlyIn() {
    const slot = this.slotNow();
    this.flyInAnim?.cancel();
    this.flyInAnim = null;
    slot.el.root.style.transformOrigin = "";
    slot.el.root.style.transform = "";
  }

  setHomes(h: Homes) {
    this.homes = h;
    this.order = keyOrder(h.key);
    for (const l of this.layers()) l.setHomes(h.lat, h.lng, this.heightAt);
    const now = this.slotNow();
    this.replan(now, false, 600);
    const inc = this.slotArriving();
    if (inc) this.replan(inc, true);
  }

  setElevation(g: ElevationGrid) {
    this.elev = g;
    const h = this.homes;
    if (h) for (const l of this.layers()) l.setHomes(h.lat, h.lng, this.heightAt);
    if (this.featured.length) this.setFeatured(this.featured);
    for (const s of this.slots) if (s.plate) this.replan(s, true);
  }

  setFeatured(list: readonly FeaturedHome[]) {
    this.featured = list;
    for (const l of this.layers()) l.setFeatured(list, this.heightAt);
  }

  lightHome(i: number | null) {
    if (i === this.litHome) return;
    this.litHome = i;
    if (i !== null) this.litFeatured = null;
    const key = i === null ? (this.litFeatured ? { featured: this.litFeatured } : null) : { home: i };
    for (const l of this.layers()) l.light(key);
  }
  lightFeatured(id: string | null) {
    if (id === this.litFeatured) return;
    this.litFeatured = id;
    if (id !== null) this.litHome = null;
    const key = id === null ? (this.litHome !== null ? { home: this.litHome } : null) : { featured: id };
    for (const l of this.layers()) l.light(key);
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

  /** A place on the plate the page is on (the arriving one during a transition), in window px. */
  screenOf(lat: number, lng: number, h?: number): { x: number; y: number } | null {
    const s = this.slotArriving() ?? this.slotNow();
    if (!s.at || !s.plate) return null;
    const p = { x: 0, y: 0, z: 0 };
    return s.at(mercX(lng), mercY(lat), (h ?? this.heightAt(lat, lng)) * s.plate.ex, p) ? { x: p.x, y: p.y } : null;
  }

  stats(): MlStats {
    const s = this.slotNow();
    const L = s.layer;
    const t = this.st.firstPaintAt;
    return {
      importedAt: this.st.createdAt,
      createdAt: this.st.createdAt,
      loadAt: t,
      firstPaintAt: t,
      firstIdleAt: t,
      revealAt: t,
      stops: this.st.stops,
      flights: this.flights,
      flying: this.isFlying(),
      shot: this.motion.motion?.to ?? this.motion.at,
      drawn: L.drawnCount(),
      planned: s.planned.length,
      lastPlanMs: this.lastPlanMs,
      glyph: Math.round(L.glyph.core * 20) / 10,
      zoom: s.plate ? Math.round(s.plate.cam.zoom * 100) / 100 : null,
      range: s.plate ? Math.round(plateRange(s.plate, s.fit)) : null,
      error: this.error,
      layer: { frames: L.cost.frames, maxMs: Math.round(L.cost.maxMs * 100) / 100, meanMs: L.cost.frames ? Math.round((L.cost.totalMs / L.cost.frames) * 1000) / 1000 : 0 },
      slow: { by: null, firstTileAt: null },
      plates: {
        at: this.motion.at,
        to: this.motion.motion?.to ?? null,
        next: this.motion.next,
        warmed: [...this.warmed.keys()],
        aspect: this.aspect(),
        films: { on: !!this.film, format: this.formats.join(",") || null, played: this.fs.played, fades: this.fs.fades, rejected: this.fs.rejected, ready: [...this.films.values()].filter((e) => e.ready).map((e) => e.id), last: this.fs.last, log: this.fs.log },
      },
    };
  }

  camera(): LayerCamera | null {
    return this.cameraOfSlot(this.slotNow());
  }

  /** The pictures to have decoded now: the plate on, the next, the previous (plate-motion.ts
   * neighbours). Others decoded earlier are let go (the browser's cache keeps their bytes). */
  warm(names: readonly ShotName[], films: readonly ShotName[] = names) {
    for (const n of names) void this.warmOne(n);
    const keep = new Set<ShotName>(names);
    for (const s of this.slots) if (s.shot) keep.add(s.shot);
    if (this.motion.motion) keep.add(this.motion.motion.to);
    if (this.motion.next) keep.add(this.motion.next);
    for (const k of [...this.warmed.keys()]) if (!keep.has(k)) this.warmed.delete(k);
    this.warmFilms(films);
  }

  // ---- the films (round 59) ---------------------------------------------------------------------

  /** The film from the plate the page is on (`names[0]`) to each neighbour, decoded ahead the way the
   * neighbours' plates are; any other decoded film is let go (the one playing stays). Nothing is
   * fetched for a film until the page is within one stop of it. */
  private warmFilms(names: readonly ShotName[]) {
    const f = this.film, M = this.opts.films;
    // A browser that refused to play one (a phone in low-power mode) gets the fade over from then on,
    // and no more clips are fetched for it.
    if (!f || !M || !this.revealed || this.fs.rejected > 0) return;
    this.lastNames = names;
    if (!this.filmsOpen) return this.openFilms();
    const from = names[0];
    const aspect = this.aspect();
    const want = new Set<string>();
    // Ahead always; behind only once the visitor has moved back up the page (a reader goes down: the
    // back films would double what a read fetches).
    if (from)
      for (const to of names.slice(1)) {
        const w = to !== from ? filmOf(M, from, to) : null;
        if (w && (!w.reverse || this.backward)) want.add(`${from}>${to}>${aspect}`);
      }
    // The flight about to start: from the plate on screen to where the page now is (the scroll moves
    // the page's position a moment before the flight is asked for).
    const at = this.motion.motion?.to ?? this.motion.at;
    if (at && from && at !== from && filmOf(M, at, from)) want.add(`${at}>${from}>${aspect}`);
    if (this.playing) want.add(this.playing.entry.id);
    // Loading a clip (a decoder made) or letting one go (a decoder torn down) while a film starts
    // cost that film a 50 to 110 ms frame (measured: scripts/_scratch-r59-hitch.mjs). So the work
    // waits for the page to be still: after the landing, or a moment with no transition asked for.
    const job = () => {
      // Films no longer near are let go only past FILMS_KEPT, oldest first (a decoder torn down is
      // the other half of that cost; the page may also come back to them).
      for (const id of want) {
        const e = this.films.get(id);
        if (e) {
          this.films.delete(id);
          this.films.set(id, e);
        }
      }
      for (const [id, e] of this.films) {
        if (this.films.size + [...want].filter((w) => !this.films.has(w)).length <= FILMS_KEPT[aspect]) break;
        if (want.has(id) || this.playing?.entry === e) continue;
        this.dropFilm(e);
        this.films.delete(id);
      }
      if (!want.size) return;
      void this.pickFormat().then(() => {
        if (this.stopped || !this.formats.length) return;
        // The plates first: a clip is asked for once the plate it lands on is in (on a slow line the
        // clip's bytes must not delay the picture the fade would need).
        for (const id of want)
          if (!this.films.has(id))
            void this.warmOne(id.split(">")[1] as ShotName).then(() => {
              if (!this.stopped && !this.films.has(id)) this.loadFilm(id);
            });
      });
    };
    // The first films (the page just opened, nothing moving yet) at once.
    if (!this.films.size && !this.motion.motion) job();
    else this.calm(job);
  }

  private calmJob: (() => void) | null = null;
  private calmTimer: ReturnType<typeof setTimeout> | undefined;
  /** Run `job` (the latest one asked) once no transition runs and none has been asked for in 350 ms. */
  private calm(job: () => void) {
    this.calmJob = job;
    clearTimeout(this.calmTimer);
    this.calmTimer = setTimeout(() => this.flushCalm(), 350);
  }
  private flushCalm() {
    if (!this.calmJob || this.stopped) return;
    if (this.motion.motion) return; // land() flushes it
    const j = this.calmJob;
    this.calmJob = null;
    j();
  }

  private lastNames: readonly ShotName[] = [];
  /** The last move went back up the ladder (the films behind are then warmed too). */
  private backward = false;
  private filmsOpen = false;
  private opening = false;
  /** THE FIRST SCREEN FIRST: no clip is asked for until the page has loaded, its lights have arrived
   * (or three seconds have passed) and the browser is idle; then the films near the page are. */
  private openFilms() {
    if (this.opening) return;
    this.opening = true;
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    const lights = new Promise<void>((r) => {
      const t0 = performance.now();
      const tick = () => (this.homes || performance.now() - t0 > 3000 ? r() : setTimeout(tick, 100));
      tick();
    });
    void Promise.all([loaded, lights]).then(() => {
      const go = () => {
        if (this.stopped) return;
        this.filmsOpen = true;
        this.warmFilms(this.lastNames);
      };
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(go, { timeout: 600 });
      else setTimeout(go, 200);
    });
  }

  /** The clip formats this browser plays, best first: VP9 when its decoder is power-efficient (a
   * hardware one), else H.264 when that one is, else whichever it can play at all (mediaCapabilities,
   * or canPlayType where that is missing). A clip is played in the first of them it was encoded in
   * (the laptop's in VP9 only, the phone's in both: plate-frame.ts filmFormat); none, the fade. */
  private async pickFormat() {
    if (this.formatAsked) return;
    this.formatAsked = true;
    const types: Record<FilmFormat, string> = { webm: 'video/webm; codecs="vp09.00.40.08"', mp4: 'video/mp4; codecs="avc1.640028"' };
    const probe = document.createElement("video");
    const info: Record<FilmFormat, { ok: boolean; eff: boolean }> = { webm: { ok: false, eff: false }, mp4: { ok: false, eff: false } };
    for (const fmt of ["webm", "mp4"] as const) {
      info[fmt].ok = probe.canPlayType(types[fmt]) === "probably";
      try {
        const mc = navigator.mediaCapabilities;
        if (mc) {
          const r = await mc.decodingInfo({ type: "file", video: { contentType: types[fmt], width: 1440, height: 900, bitrate: 2_500_000, framerate: 30 } });
          info[fmt] = { ok: info[fmt].ok && r.supported, eff: r.supported && r.powerEfficient };
        }
      } catch {}
    }
    const rank = (f: FilmFormat) => (info[f].ok ? (info[f].eff ? 0 : 1) : 9);
    this.formats = (["webm", "mp4"] as const).filter((f) => info[f].ok).sort((a, b) => rank(a) - rank(b));
  }

  /** One film decoded ahead: its frames' matrices (a few KB) and its clip in a hidden video element
   * of the film layer, ready when every byte is buffered and the first frame is decoded. */
  private loadFilm(id: string) {
    const f = this.film, M = this.opts.films;
    if (!f || !M) return;
    const [from, to, aspect] = id.split(">") as [ShotName, ShotName, PlateAspect];
    const which = filmOf(M, from, to);
    if (!which) return;
    const clip = M[which.key][aspect];
    // Never a source that does not exist: no format this browser plays was encoded, no film.
    const fmt = filmFormat(clip, this.formats);
    if (!fmt) return;
    const v = document.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("aria-hidden", "true");
    v.disablePictureInPicture = true;
    v.preload = "auto";
    v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0";
    const e: FilmEntry = { id, key: which.key, reverse: which.reverse, aspect, clip, video: v, frames: null, ready: false, failed: false };
    this.films.set(id, e);
    f.el.root.insertBefore(v, f.el.canvas);
    const dw = Math.round(this.box().width * Math.min(2, window.devicePixelRatio || 1));
    v.src = filmSrc(from, to, aspect, filmWidth(clip[fmt], dw), fmt);
    const check = () => {
      if (e.ready || e.failed || !e.frames) return;
      const b = v.buffered;
      const whole = b.length > 0 && b.end(b.length - 1) >= v.duration - 0.05 && b.start(0) <= 0.05;
      if (v.readyState >= 4 && whole) e.ready = true;
    };
    v.addEventListener("canplaythrough", check);
    v.addEventListener("progress", check);
    v.addEventListener("loadeddata", check);
    v.addEventListener("error", () => (e.failed = true));
    void fetch(filmDataSrc(which.key, aspect))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { n: number; frames: FilmFrame[] }) => {
        if (d.n !== clip.n || d.frames.length !== clip.n + 1) throw new Error("frames");
        e.frames = d.frames;
        check();
      })
      .catch(() => (e.failed = true));
  }

  private dropFilm(e: FilmEntry) {
    const v = e.video;
    v.pause();
    v.removeAttribute("src");
    v.load();
    v.remove();
  }

  /** The film's length if the flight from -> to plays as a film now (plate-motion.ts useFilm). */
  private filmMs = (from: ShotName, to: ShotName): number | null => {
    const e = this.films.get(`${from}>${to}>${this.aspect()}`);
    const ready = !!e && e.ready && !e.failed && !!e.frames && e.video.readyState >= 3 && !e.video.seeking && e.video.currentTime === 0;
    const ok = useFilm({ recorded: !!(this.film && this.opts.films && filmOf(this.opts.films, from, to)), ready, reduced: this.opts.reduced, off: !!this.opts.filmOff || this.fs.rejected > 0 });
    return ok && e ? e.clip.ms : null;
  };

  /** The film layer showing frame i of the playing film: its picture is the video's; its lights are
   * projected by that frame's own matrix. */
  private showFrame(e: FilmEntry, i: number) {
    const f = this.film;
    if (!f || !e.frames) return;
    const ex = this.slots[this.cur].plate?.ex ?? 1.6;
    const fov = this.slots[this.cur].plate?.cam.fov ?? 40;
    f.plate = framePlate(e.clip, e.frames, i, e.reverse, ex, fov);
    f.fit = coverFit(f.plate, this.box());
    f.at = plateProjector(f.plate, f.fit);
    f.layer.kick();
  }

  /** THE FILM: the flight recorded between the two plates plays over plate A (its first frame IS
   * plate A), our lights ride it frame by frame, plate B waits underneath, and at the end the film
   * fades out onto plate B (the same picture: the last frames are still). */
  private async beginFilm(m: Motion, id: number, inc: Slot, out: Slot) {
    const f = this.film!;
    const e = this.films.get(`${m.from}>${m.to}>${this.aspect()}`);
    if (!e || !e.ready || !e.frames) return this.runFade(m, id, inc, out);
    const v = e.video;
    this.replan(inc, true);
    for (const a of inc.el.root.getAnimations()) a.cancel();
    for (const a of out.el.root.getAnimations()) a.cancel();
    for (const a of f.el.root.getAnimations()) a.cancel();
    this.flyInAnim = null;
    inc.el.root.style.transformOrigin = out.el.root.style.transformOrigin = "";
    inc.el.root.style.transform = out.el.root.style.transform = "";
    // The film's lights: plate A's set at once, plate B's coming in over most of the flight (the live
    // map's rule, ../ml/controller.ts go), every one on its street in every frame.
    f.layer.fadeMs = 0;
    f.layer.plan(out.planned, true, out.levels);
    f.layer.fadeMs = Math.round(e.clip.ms * 0.8);
    f.layer.plan(inc.planned, false, inc.levels);
    this.showFrame(e, 0);
    // Drawn now, in the same frame the film is shown: plate A's lights are covered by it this frame.
    f.layer.draw();
    f.layer.setFlying(true);
    for (const x of this.films.values()) x.video.style.opacity = x === e ? "1" : "0";
    v.playbackRate = 1;
    // In as it goes out: the film's first frame (plate A's picture through the codec) dissolves in
    // over plate A while both are still, then it plays; a cut there showed the codec's few levels on
    // the dense city plates (the record §3).
    const inAnim = f.el.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FILM_IN_MS, easing: "ease-out", fill: "forwards" });
    const run = { entry: e, inc, out, id, reached: 0, drops: 0, frames: 0, ending: false, outAnim: null as Animation | null };
    this.playing = run;
    this.motion = { ...this.motion, motion: { ...m, startedAt: performance.now() } };
    const onFrame = (i: number) => {
      if (this.playing !== run) return;
      if (i > run.reached + 1 && v.playbackRate === 1) run.drops += i - run.reached - 1;
      if (i !== run.reached || run.frames === 0) {
        run.frames++;
        run.reached = Math.max(run.reached, i);
        this.showFrame(e, i);
      }
    };
    const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number }).requestVideoFrameCallback?.bind(v);
    if (rvfc) {
      const cb = (_now: number, meta: { mediaTime: number }) => {
        if (this.playing !== run) return;
        onFrame(frameAt(meta.mediaTime, e.clip.fps, e.clip.n));
        if (!run.ending) rvfc(cb);
      };
      rvfc(cb);
    } else {
      const loop = () => {
        if (this.playing !== run || run.ending) return;
        onFrame(frameAt(v.currentTime, e.clip.fps, e.clip.n));
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
    v.addEventListener("ended", () => this.endFilm(run), { once: true });
    if (this.motion.next) inAnim.playbackRate = 3;
    await inAnim.finished.catch(() => {});
    f.el.root.style.opacity = "1";
    inAnim.cancel();
    if (this.playing !== run) return;
    try {
      await v.play();
    } catch (err) {
      // A phone in low-power mode (or any refusal): the fade over, from plate A, which is still under.
      if (this.playing !== run) return;
      console.warn("[plates] film refused:", (err as Error).message);
      this.fs.rejected++;
      this.stopFilm(run);
      if (id !== this.beginId || this.stopped) return;
      return this.runFade(m, id, inc, out, true);
    }
    this.fs.played++;
    this.logKind(e.key + (e.reverse ? " back" : ""), "film");
  }

  /** The film's end: plate B on under it, the film fades out onto it, then the stop lands. */
  private endFilm(run: NonNullable<PlateController["playing"]>, cut = false) {
    if (this.playing !== run || run.ending) return;
    run.ending = true;
    const f = this.film!;
    const { inc, out } = run;
    this.showFrame(run.entry, run.entry.clip.n);
    run.reached = run.entry.clip.n;
    inc.el.root.style.opacity = "1";
    inc.el.root.style.zIndex = "2";
    out.el.root.style.opacity = "0";
    out.el.root.style.zIndex = "1";
    const finish = () => {
      if (this.playing !== run) return;
      this.stopFilm(run);
      if (run.id !== this.beginId || this.stopped) return;
      this.land(inc, out);
    };
    if (cut) return finish();
    run.outAnim = f.el.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FILM_OUT_MS, easing: "ease-out", fill: "forwards" });
    if (this.motion.next) run.outAnim.playbackRate = 2;
    run.outAnim.finished.then(finish, () => {});
  }

  /** The film layer emptied and hidden, the clip rewound for the next time (still decoded). */
  private stopFilm(run: NonNullable<PlateController["playing"]>) {
    const f = this.film!;
    const e = run.entry;
    this.fs.last = { key: e.key + (e.reverse ? " back" : ""), frames: run.frames, reached: run.reached, drops: run.drops, rate: e.video.playbackRate };
    this.playing = null;
    run.outAnim?.cancel();
    f.el.root.style.opacity = "0";
    e.video.pause();
    e.video.style.opacity = "0";
    e.video.playbackRate = 1;
    try {
      e.video.currentTime = 0;
    } catch {}
    f.layer.setFlying(false);
    f.layer.plan([], true);
  }

  private logKind(key: string, kind: "film" | "fade") {
    this.fs.log.push({ key, kind, at: Math.round(performance.now()) });
    if (this.fs.log.length > 80) this.fs.log.shift();
  }

  // ---- inside -----------------------------------------------------------------------------------

  private fail(msg: string) {
    if (this.error) return;
    this.error = msg;
    this.opts.onError(msg);
  }

  private fadeMs() {
    return this.opts.reduced ? FADE_REDUCED_MS : FADE_MS;
  }

  /** The aspect by the WINDOW's width (the media query the picture's sources use counts the
   * scrollbar in, as `window.innerWidth` does; the fit below uses the box). */
  private aspect(): PlateAspect {
    return aspectFor(this.opts.viewport().width);
  }

  private plateOf(shot: ShotName): Plate {
    return this.opts.manifest[shot][this.aspect()];
  }

  private slotNow(): Slot {
    return this.slots[this.cur];
  }
  private slotArriving(): Slot | null {
    const m = this.motion.motion;
    if (!m) return null;
    const s = this.slots[1 - this.cur];
    return s.shot === m.to ? s : null;
  }

  private heightAt = (lat: number, lng: number) => (this.elev ? Math.max(0, sampleHeight(this.elev, lng, lat)) : 0);

  private cameraOfSlot(s: { plate: Plate | null; fit: CoverFit }): LayerCamera | null {
    const p = s.plate;
    if (!p) return null;
    return { center: { lat: p.cam.lat, lng: p.cam.lng, altitude: p.cam.elevation }, range: plateRange(p, s.fit), tilt: p.cam.pitch, heading: p.cam.bearing, fov: p.cam.fov };
  }

  /** A slot holds this shot's plate from now on (its picture already set and decoded). */
  private adopt(s: Slot, shot: ShotName) {
    s.shot = shot;
    s.plate = this.plateOf(shot);
    s.fit = coverFit(s.plate, this.box());
    s.at = plateProjector(s.plate, s.fit);
    s.el.img.dataset.shot = shot;
    s.el.root.dataset.shot = shot;
  }

  /** The four sources and the image for a shot (the browser picks the format and the aspect by its
   * own rules: the same rules the server-rendered first plate used). */
  private setSources(pic: HTMLPictureElement, img: HTMLImageElement, shot: ShotName) {
    const M = this.opts.manifest[shot];
    pic.querySelectorAll<HTMLSourceElement>("source[data-plate-src]").forEach((src) => {
      const [f, a] = (src.dataset.plateSrc ?? "").split("-") as [PlateFormat, PlateAspect];
      if (!M[a]) return;
      src.setAttribute("srcset", plateSrcSet(shot, a, M[a], f));
      src.setAttribute("sizes", "100vw");
    });
    const w = M.wide.widths[M.wide.widths.length - 1];
    img.setAttribute("src", plateSrc(shot, "wide", w, "webp"));
    img.dataset.shot = shot;
  }

  /** The image drawn and decoded (the picture's chosen candidate). */
  private async decoded(img: HTMLImageElement) {
    try {
      await img.decode();
    } catch (e) {
      if (!(img.complete && img.naturalWidth > 0)) throw e;
    }
  }

  private warmOne(shot: ShotName): Promise<void> {
    const hit = this.warmed.get(shot);
    if (hit) return hit.done;
    const pic = document.createElement("picture");
    for (const f of ["avif", "webp"] as const)
      for (const a of ["tall", "wide"] as const) {
        const src = document.createElement("source");
        src.type = `image/${f}`;
        src.media = a === "tall" ? "(max-width: 1023px)" : "(min-width: 1024px)";
        src.dataset.plateSrc = `${f}-${a}`;
        pic.append(src);
      }
    const img = document.createElement("img");
    img.decoding = "async";
    pic.append(img);
    this.setSources(pic, img, shot);
    const done = this.decoded(img).catch(() => {});
    this.warmed.set(shot, { pic, done });
    return done;
  }

  /** A slot's picture set to a shot and decoded (warm first, so the bytes are in). */
  private async load(s: Slot, shot: ShotName) {
    await this.warmOne(shot);
    this.setSources(s.el.picture, s.el.img, shot);
    await this.decoded(s.el.img);
    this.adopt(s, shot);
  }

  private async begin(m: Motion) {
    const id = ++this.beginId;
    const dir = this.opts.films && m.from ? filmOf(this.opts.films, m.from, m.to) : null;
    if (dir && dir.reverse !== this.backward) {
      this.backward = dir.reverse;
      // The way the visitor goes changed: the films behind are wanted now (or no longer).
      if (this.lastNames.length) this.warmFilms(this.lastNames);
    }
    const inc = this.slots[1 - this.cur], out = this.slots[this.cur];
    this.flights++;
    this.startedAt = Math.round(performance.now());
    this.opts.onFlightStart();
    try {
      await this.load(inc, m.to);
    } catch (e) {
      console.warn("[plates]", m.to, (e as Error).message);
      if (id !== this.beginId || this.stopped) return;
      // The picture would not load: stay where we are; a queued plate gets its turn.
      const next = this.motion.next;
      this.motion = idle(this.motion.at);
      if (next && next !== this.motion.at) this.flyToShot(next);
      return;
    }
    if (id !== this.beginId || this.stopped) return;
    // A plate asked for while this one decoded: nothing of this one is on screen yet, so it is
    // simply not shown and the later one goes.
    const queued = this.motion.next;
    if (queued && queued !== m.to) {
      this.motion = idle(this.motion.at);
      this.flyToShot(queued);
      return;
    }
    if (m.film && this.film) return this.beginFilm(m, id, inc, out);
    this.runFade(m, id, inc, out);
  }

  /** THE FADE OVER (round 58): the arriving plate laid on top, fading in while it settles; the one
   * under it holds and pushes a little. Also every film's fallback. */
  private runFade(m0: Motion, id: number, inc: Slot, out: Slot, refused = false) {
    const m: Motion = m0.film ? { from: m0.from, to: m0.to, startedAt: m0.startedAt, ms: this.fadeMs() } : m0;
    this.fs.fades++;
    this.logKind(`${m.from}--${m.to}${refused ? " refused" : ""}`, "fade");
    this.replan(inc, true);
    const R = inc.el.root, O = out.el.root;
    for (const a of R.getAnimations()) a.cancel();
    for (const a of O.getAnimations()) a.cancel();
    this.flyInAnim = null;
    R.style.transformOrigin = "";
    O.style.transformOrigin = "";
    R.style.opacity = "0";
    R.style.zIndex = "2";
    O.style.zIndex = "1";
    O.style.opacity = "1";
    const ms = m.ms;
    const fade = R.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: "ease-in-out", fill: "forwards" });
    const anims = [fade];
    if (!this.opts.reduced) {
      anims.push(R.animate([{ transform: `scale(${SETTLE_FROM})` }, { transform: "scale(1)" }], { duration: ms, easing: SETTLE_EASE, fill: "forwards" }));
      anims.push(O.animate([{ transform: "scale(1)" }, { transform: `scale(${PUSH_TO})` }], { duration: ms, easing: "ease-in", fill: "forwards" }));
    }
    this.anims = anims;
    // The fade starts now, after the decode: the clock the hurry reads.
    this.motion = { ...this.motion, motion: { ...m, startedAt: performance.now() } };
    fade.finished.then(
      () => {
        if (id !== this.beginId || this.stopped) return;
        this.land(inc, out);
      },
      () => {},
    );
  }

  private hurry(now: number) {
    const m = this.motion.motion;
    const run = this.playing;
    if (m?.film && run) {
      // A request during a film: played faster so it ends within HURRY_MS (at most FILM_MAX_RATE),
      // or, were that not enough, plate B (the film's own last picture) at once; then the queued one.
      if (run.ending) {
        if (run.outAnim) run.outAnim.playbackRate = 3;
        return;
      }
      const v = run.entry.video;
      const left = Math.max(0, (v.duration - v.currentTime) * 1000);
      const h = filmHurry(left);
      if (h === "cut") this.endFilm(run, true);
      else v.playbackRate = Math.max(v.playbackRate, h.rate);
      return;
    }
    if (!m || !this.anims.length) return;
    const rate = hurryRate(m, now);
    for (const a of this.anims) a.playbackRate = rate;
  }

  private land(inc: Slot, out: Slot) {
    for (const a of this.anims) a.cancel();
    this.anims = [];
    inc.el.root.style.opacity = "1";
    inc.el.root.style.transform = "";
    inc.el.root.style.zIndex = "2";
    out.el.root.style.opacity = "0";
    out.el.root.style.transform = "";
    out.el.root.style.zIndex = "1";
    out.layer.plan([], true);
    out.planned = [];
    this.cur = this.slots.indexOf(inc);
    const now = Math.round(performance.now());
    this.st.stops.push({ shot: inc.shot, startedAt: this.startedAt, landedAt: now, idleMs: 0 });
    if (this.st.stops.length > 60) this.st.stops.shift();
    const step = finished(this.motion, now, this.fadeMs(), this.filmMs);
    this.motion = step.state;
    this.opts.onLand();
    if (step.action === "start") void this.begin(step.state.motion!);
    else if (this.calmJob) {
      clearTimeout(this.calmTimer);
      this.calmTimer = setTimeout(() => this.flushCalm(), 120);
    }
  }

  /** The closest plate the home stands on with room round it, or null. */
  private plateContaining(home: { lat: number; lng: number }): ShotName | null {
    const vp = this.box();
    const aspect = this.aspect();
    const mx = mercX(home.lng), my = mercY(home.lat), h0 = this.heightAt(home.lat, home.lng);
    const margin = 48;
    let best: { shot: ShotName; range: number } | null = null;
    const p = { x: 0, y: 0, z: 0 };
    for (const shot of HOME_PLATES) {
      const plate = this.opts.manifest[shot]?.[aspect];
      if (!plate) continue;
      const fit = coverFit(plate, vp);
      if (!plateProjector(plate, fit)(mx, my, h0 * plate.ex, p)) continue;
      if (p.x < margin || p.y < margin + 80 || p.x > vp.width - margin || p.y > vp.height - margin) continue;
      const range = plateRange(plate, fit);
      if (!best || range < best.range) best = { shot, range };
    }
    return best?.shot ?? null;
  }

  /** THE PLAN (the live map's, ../ml/controller.ts replan): which homes a plate draws, by the same
   * count by range, gap and glow, projected by the plate's own camera. */
  private replan(s: Slot, instant: boolean, fadeMs = 250) {
    const h = this.homes;
    const plate = s.plate, at = s.at, name = s.shot;
    if (!h || !plate || !at || !name) return;
    const t0 = performance.now();
    const vp = this.box();
    const range = plateRange(plate, s.fit);
    const focus = focusOf(name);
    const budget = budgetFor(range, vp);
    const gap = densityGap(range, isNarrow(vp), this.opts.cityGap);
    const proj = projectAllPlate(s.layer.homesEcef, at, plate.ex, vp, 8, h.county, focus, this.avoid);
    const vpc = { ...vp, fov: plate.cam.fov };
    const plan = planDensity({ ecef: s.layer.homesEcef, order: this.order, frame: NO_FRAME, viewport: vpc, budget, gap, county: h.county, focus, keep: s.layer.litIndices(), proj });
    const counts = representedCounts({ ecef: s.layer.homesEcef, frame: NO_FRAME, viewport: vpc, plan, reach: 1.5 * gap, county: h.county, focus, proj });
    const median = [...counts].sort((a, b) => a - b)[Math.floor(counts.length / 2)] ?? 1;
    const levels = new Uint8Array(plan.length);
    for (let k = 0; k < plan.length; k++) levels[k] = glowLevel(counts[k], median);
    this.lastPlanMs = Math.round((performance.now() - t0) * 10) / 10;
    s.planned = plan;
    s.levels = levels;
    s.layer.fadeMs = fadeMs;
    s.layer.plan(plan, instant || this.opts.reduced, levels);
    // Round 61: the moment the first lights are on their way in, on the navigation's clock (the
    // boot probes read it; polling for it was late by up to a frame and a task).
    if (plan.length && !this.lightsMarked) {
      this.lightsMarked = true;
      performance.mark("ml:lights");
    }
  }
  private lightsMarked = false;
}

/** A frame no home is projected with (the planner reads `proj`). */
const NO_FRAME: CameraFrame = { eye: [0, 0, 0], right: [1, 0, 0], up: [0, 1, 0], forward: [0, 0, 1] };

/** Every home on the plate's window (in the focus county), in css px, by the plate's projector:
 * light-plan.ts projectAll's twin for a plate. A home in the credit's corner is left out. */
export function projectAllPlate(pts: Float64Array, at: Projector, ex: number, vp: { width: number; height: number }, margin = 8, county?: readonly string[], focus?: string | null, avoid?: { x: number; y: number; w: number; h: number } | null): Projected {
  const n = pts.length / 3;
  const x = new Float32Array(n), y = new Float32Array(n), ok = new Uint8Array(n);
  const p = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < n; i++) {
    if (focus && county && county[i] !== focus) continue;
    if (!at(pts[3 * i], pts[3 * i + 1], pts[3 * i + 2] * ex, p)) continue;
    if (p.x < -margin || p.y < -margin || p.x > vp.width + margin || p.y > vp.height + margin) continue;
    if (avoid && p.x > avoid.x && p.x < avoid.x + avoid.w && p.y > avoid.y && p.y < avoid.y + avoid.h) continue;
    x[i] = p.x;
    y[i] = p.y;
    ok[i] = 1;
  }
  return { x, y, ok };
}
