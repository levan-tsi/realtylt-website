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
 * featured card's focus shows its home on the closest plate that contains it. */
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
import { aspectFor, coverFit, plateProjector, plateRange, plateSrc, plateSrcSet, type CoverFit, type Plate, type PlateAspect, type PlateFormat, type PlateManifest, type Projector } from "./plate-frame";
import { FADE_MS, FADE_REDUCED_MS, PUSH_TO, SETTLE_FROM, finished, hurryRate, idle, request, type Motion, type MotionState } from "./plate-motion";

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
}

/** The plates a featured home is looked for on, closest pictures first (the counties, the harbour,
 * the chapters, then the two high ones), so its light stands large in a place, not small in the
 * territory. */
const HOME_PLATES: readonly ShotName[] = ["ulster", "dutchess-county", "orange", "putnam", "rockland", "westchester-county", "bronx", "manhattan", "queens", "brooklyn", "staten-island", "harbour", "dutchess", "highlands", "westchester", "region", "hero"];

/** The settle's curve as CSS (plate-motion.ts settleScale is the same ease-out cubic). */
const SETTLE_EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
/** How far the click's fly-in pushes into the picture. */
const FLY_IN_SCALE = 1.6;

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
    },
  ) {
    this.wantInitial = opts.initial;
    for (const el of opts.slots) {
      const slot: Slot = { el, layer: null as unknown as LightLayer, shot: null, plate: null, fit: { s: 1, ox: 0, oy: 0 }, at: null, planned: [] };
      slot.layer = new LightLayer(
        el.canvas,
        () => this.cameraOfSlot(slot),
        () => isNarrow(opts.viewport()),
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
            const at = slot.at, p = slot.plate;
            if (!at || !p) return null;
            const ex = p.ex;
            return (pts, i, out) => at(pts[3 * i], pts[3 * i + 1], pts[3 * i + 2] * ex, out);
          },
        },
      );
      slot.layer.glowStrength = opts.glow;
      slot.layer.haloScale = opts.halo;
      slot.layer.haloStrength = opts.ha;
      slot.layer.coreRgb = opts.core;
      this.slots.push(slot);
    }
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
      if (first.el.img.dataset.shot !== shot) this.setSources(first.el.picture, first.el.img, shot);
      await this.decoded(first.el.img);
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
    for (const s of this.slots) s.layer.stop();
    this.warmed.clear();
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
    const step = request(this.motion, name, now, this.fadeMs());
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
    for (const s of this.slots) s.layer.setHomes(h.lat, h.lng, this.heightAt);
    const now = this.slotNow();
    this.replan(now, false, 600);
    const inc = this.slotArriving();
    if (inc) this.replan(inc, true);
  }

  setElevation(g: ElevationGrid) {
    this.elev = g;
    const h = this.homes;
    if (h) for (const s of this.slots) s.layer.setHomes(h.lat, h.lng, this.heightAt);
    if (this.featured.length) this.setFeatured(this.featured);
    for (const s of this.slots) if (s.plate) this.replan(s, true);
  }

  setFeatured(list: readonly FeaturedHome[]) {
    this.featured = list;
    for (const s of this.slots) s.layer.setFeatured(list, this.heightAt);
  }

  lightHome(i: number | null) {
    if (i === this.litHome) return;
    this.litHome = i;
    if (i !== null) this.litFeatured = null;
    const key = i === null ? (this.litFeatured ? { featured: this.litFeatured } : null) : { home: i };
    for (const s of this.slots) s.layer.light(key);
  }
  lightFeatured(id: string | null) {
    if (id === this.litFeatured) return;
    this.litFeatured = id;
    if (id !== null) this.litHome = null;
    const key = id === null ? (this.litHome !== null ? { home: this.litHome } : null) : { featured: id };
    for (const s of this.slots) s.layer.light(key);
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
      plates: { at: this.motion.at, to: this.motion.motion?.to ?? null, next: this.motion.next, warmed: [...this.warmed.keys()], aspect: this.aspect() },
    };
  }

  camera(): LayerCamera | null {
    return this.cameraOfSlot(this.slotNow());
  }

  /** The pictures to have decoded now: the plate on, the next, the previous (plate-motion.ts
   * neighbours). Others decoded earlier are let go (the browser's cache keeps their bytes). */
  warm(names: readonly ShotName[]) {
    for (const n of names) void this.warmOne(n);
    const keep = new Set<ShotName>(names);
    for (const s of this.slots) if (s.shot) keep.add(s.shot);
    if (this.motion.motion) keep.add(this.motion.motion.to);
    if (this.motion.next) keep.add(this.motion.next);
    for (const k of [...this.warmed.keys()]) if (!keep.has(k)) this.warmed.delete(k);
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

  private cameraOfSlot(s: Slot): LayerCamera | null {
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
    const step = finished(this.motion, now, this.fadeMs());
    this.motion = step.state;
    this.opts.onLand();
    if (step.action === "start") void this.begin(step.state.motion!);
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
    s.layer.fadeMs = fadeMs;
    s.layer.plan(plan, instant || this.opts.reduced, levels);
  }
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
