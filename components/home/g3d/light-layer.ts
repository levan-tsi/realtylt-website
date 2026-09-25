/** OUR LIGHTS ON THE NIGHT MAP (round 57.6): one canvas over the night grade and under the words,
 * owned by the controller. Every home the plan draws (light-plan.ts) is projected from the camera
 * the map element reports and drawn as the glyph (glyph.ts): on every animation frame while the map
 * flies or a fade runs, once when it is still, then the loop stops (no work on a still page).
 *
 * Measured before this was built (scripts/_scratch-r57f-camlive.mjs, maps 3.66, 1440): during a
 * `flyCameraTo` the element's `center`, `range`, `tilt` and `heading` change on every frame Google
 * draws (225 changes in a 2.4 s flight, the `gmp-*change` events as often), and reading all five
 * costs under 0.1 ms. So the lights follow the camera frame by frame; nothing is estimated.
 *
 * The same projection feeds the pointer: `xy` holds where each drawn light stood in the last frame,
 * so the hover's hit test, the tap and the label use exactly the positions that were drawn. */
import { cameraFrame, type MapCamera } from "./camera";
import { CORE_RGB, LIT_MS, LIT_RGB, featuredGlyph, glyphAdd, glyphAt, litGlyph, reachOf, type Glyph } from "./glyph";
import { GLOW_LEVELS, applyPlan, easeFade, focalOf, homesEcef, projectHome, stepFades, type Fade } from "./light-plan";

export interface LayerCamera extends MapCamera {
  fov: number;
}

/** ANOTHER MAP'S PROJECTION (round 57.12, the MapLibre lab): where the homes are in that map's own
 * space (`places`, three numbers a home) and, once a frame, how that space projects to the window
 * (`frame`: a function from a place to css px, or null with no camera). Without one the layer is the
 * Google map's, exactly as before: earth-centred places and camera.ts's projection. */
export interface LayerProjector {
  places(lat: ArrayLike<number>, lng: ArrayLike<number>, height: (lat: number, lng: number) => number): Float64Array<ArrayBuffer>;
  frame(): ((pts: Float64Array, i: number, out: { x: number; y: number; z: number }) => boolean) | null;
}

type Rect = { x: number; y: number; w: number; h: number };

/** ONE LIGHT, BAKED at its own device-pixel size (glyph.ts glyphAdd, the cover's own sum), core and
 * halo together, so a frame is one unscaled drawImage per light added with "lighter". Measured: the
 * first build drew two sprites a light scaled down from 64 px with "high" smoothing, 1.09 ms a
 * frame mean and 1.9 ms p95 over a cold scroll at 1440 (the county ceilings), and it doubled the
 * flights' frames over 34 ms (142 against 65 with `?homes=0`). The glyph eases continuously, so the
 * bakes are keyed by the glyph quantised finer than the eye can see (core 0.05 px, halo 0.25 px,
 * strength 0.02, lit 0.1): a flight bakes a few dozen, each ~0.05 ms.
 *
 * Round 57.8: the glow widens the bake to 20 to 32 css px of radius (to 4x the pixels) and the
 * glow steps make five bakes a frame, so the first build's per-pixel glyphAdd cost a 7 to 22 ms
 * frame whenever the eased glyph crossed a step mid-flight (the lag probe's layer max). The light
 * is round, so its profile is computed once per bake on radii an eighth of a device pixel apart
 * and every pixel reads it; and a frame bakes at most BAKES_PER_FRAME new sprites (the others keep
 * last frame's for a frame or two, a change finer than the eye can see). */
const BAKES_PER_FRAME = 2;
const LUT_STEP = 8;
function bake(g: Glyph, lit: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const R = reachOf(g) * dpr;
  const s = Math.ceil(R) * 2 + 2;
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  const img = x.createImageData(s, s);
  const core = [0, 1, 2].map((k) => CORE_RGB[k] + (LIT_RGB[k] - CORE_RGB[k]) * lit);
  // The light's additive value stored as colour over alpha (alpha = its largest channel), so the
  // canvas keeps it premultiplied and is transparent wherever the light adds nothing (an opaque
  // bake made "lighter" paint black squares on the transparent canvas). The canvas is then ADDED to
  // the map by its CSS blend (G3dGround: plus-lighter), as the cover sums it.
  const nL = Math.ceil((s / 2) * Math.SQRT2 * LUT_STEP) + 2;
  const lut = new Uint8ClampedArray(nL * 4);
  for (let k = 0; k < nL; k++) {
    const [r, gg, b] = glyphAdd(g, k / LUT_STEP / dpr, 1, core);
    const Rr = Math.min(255, r), Gc = Math.min(255, gg), B = Math.min(255, b);
    const a = Math.max(Rr, Gc, B);
    if (a < 0.5) continue;
    lut[4 * k] = Math.round((Rr / a) * 255);
    lut[4 * k + 1] = Math.round((Gc / a) * 255);
    lut[4 * k + 2] = Math.round((B / a) * 255);
    lut[4 * k + 3] = Math.round(a);
  }
  const data = img.data;
  const h = s / 2;
  for (let j = 0; j < s; j++) {
    const dy = j + 0.5 - h;
    for (let i = 0; i < s; i++) {
      const dx = i + 0.5 - h;
      const k = Math.round(Math.sqrt(dx * dx + dy * dy) * LUT_STEP) * 4;
      if (lut[k + 3] === 0) continue;
      const o = (j * s + i) * 4;
      data[o] = lut[k];
      data[o + 1] = lut[k + 1];
      data[o + 2] = lut[k + 2];
      data[o + 3] = lut[k + 3];
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

const quant = (g: Glyph, lit: number) => ({
  core: Math.round(g.core * 20) / 20,
  halo: Math.max(0.5, Math.round(g.halo * 4) / 4),
  haloAlpha: Math.round(g.haloAlpha * 50) / 50,
  // the glow is wide and faint: half a pixel and a hundredth are finer than the eye can see
  glow: Math.round(g.glow * 2) / 2,
  glowAlpha: Math.round(g.glowAlpha * 100) / 100,
  lit: Math.round(lit * 10) / 10,
});

export class LightLayer {
  private ctx: CanvasRenderingContext2D | null;
  private bakes = new Map<string, HTMLCanvasElement>();
  private dpr = 1;
  private w = 0;
  private h = 0;
  private ecef = new Float64Array(0);
  /** The drawn homes and where each is in its fade. */
  readonly fades = new Map<number, Fade>();
  private featEcef = new Float64Array(0);
  private featIds: string[] = [];
  /** How long a change of set takes: the flight's length during a flight, short at a landing. */
  fadeMs = 250;
  private flying = false;
  private raf = 0;
  private last = 0;
  /** Lit lights and how lit (0..1), by key ("h:12", "f:<id>"), and the one that should be. */
  private litK = new Map<string, number>();
  private litWant: string | null = null;
  /** Where each drawn light stood in the last frame (x, y pairs) and which home it is. */
  xy = new Float32Array(0);
  xyIndex = new Int32Array(0);
  xyCount = 0;
  /** The last frame's glyph and camera range (the label's keep-out, the probes). */
  glyph: Glyph = glyphAt(145_000);
  /** Per-frame cost of projecting and drawing, ms (the probes read it; the bar is 1.5 ms at 1440). */
  cost = { frames: 0, totalMs: 0, maxMs: 0, samples: [] as number[] };
  /** Draw no light here (Google's logo corner, policy: never covered). */
  avoid: Rect | null = null;
  /** The neighbourhood glow's strength (glyph.ts GLOW_ALPHA unless the page's `?glow=` says). */
  glowStrength: number | undefined = undefined;
  /** The halo's radius as a scale of glyph.ts's (1 unless the page's `?halo=` says; round 58). */
  haloScale: number | undefined = undefined;

  constructor(
    private canvas: HTMLCanvasElement,
    private readCamera: () => LayerCamera | null,
    private narrow: () => boolean,
    private projector?: LayerProjector,
  ) {
    this.ctx = canvas.getContext("2d");
    this.resize();
  }

  /** The canvas to its box, at the screen's pixel density. */
  resize() {
    const c = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (dpr !== this.dpr) {
      this.bakes.clear();
      this.lastBase = [];
    }
    this.dpr = dpr;
    this.w = c.clientWidth;
    this.h = c.clientHeight;
    c.width = Math.max(1, Math.round(this.w * this.dpr));
    c.height = Math.max(1, Math.round(this.h * this.dpr));
    this.draw();
  }

  /** The homes (their places, heights included). A new set clears what is drawn. */
  setHomes(lat: ArrayLike<number>, lng: ArrayLike<number>, height: (lat: number, lng: number) => number) {
    this.ecef = this.projector ? this.projector.places(lat, lng, height) : homesEcef(lat, lng, height);
    this.xy = new Float32Array(lat.length * 2);
    this.xyIndex = new Int32Array(lat.length);
    this.level = new Uint8Array(lat.length).fill(2);
  }

  /** Each home's glow step (light-plan.ts GLOW_LEVELS; 2 is the median light). */
  private level = new Uint8Array(0);

  get homesEcef() {
    return this.ecef;
  }

  setFeatured(list: readonly { id: string; lat: number; lng: number }[], height: (lat: number, lng: number) => number) {
    const lat = list.map((h) => h.lat), lng = list.map((h) => h.lng);
    this.featEcef = this.projector ? this.projector.places(lat, lng, height) : homesEcef(lat, lng, height);
    this.featIds = list.map((h) => h.id);
    this.kick();
  }

  /** A new set of homes to draw; `instant` for a cut. */
  plan(indices: readonly number[], instant: boolean, levels?: Uint8Array) {
    if (levels) for (let k = 0; k < indices.length; k++) this.level[indices[k]] = levels[k];
    applyPlan(this.fades, indices, instant);
    this.kick();
  }

  setFlying(on: boolean) {
    this.flying = on;
    this.kick();
  }

  /** Light one home (its index) or one featured home, or none. */
  light(key: { home: number } | { featured: string } | null) {
    this.litWant = key ? ("home" in key ? `h:${key.home}` : `f:${key.featured}`) : null;
    if (this.litWant && !this.litK.has(this.litWant)) this.litK.set(this.litWant, 0);
    this.kick();
  }

  /** Homes planned in (not on their way out). */
  drawnCount(): number {
    let n = 0;
    for (const f of this.fades.values()) if (f.to === 1) n++;
    return n;
  }

  /** The homes planned in now (the planner keeps them first: light-plan.ts planDensity `keep`). */
  *litIndices(): Generator<number> {
    for (const [i, f] of this.fades) if (f.to === 1) yield i;
  }

  /** Draw a frame now and keep going while anything moves. */
  kick() {
    this.dirty = true;
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Something other than the camera changed (a plan, a light, the size): the next frame draws. */
  private dirty = true;
  /** The camera the last frame was drawn for: Google draws at its own rate (often every other
   * frame of a 144 Hz screen), and a frame whose camera has not moved is not drawn again. */
  private lastSig = "";

  private tick = (now: number) => {
    this.raf = 0;
    const dt = Math.max(0, Math.min(100, now - this.last));
    this.last = now;
    let moving = stepFades(this.fades, dt, this.fadeMs);
    for (const [k, v] of this.litK) {
      const to = k === this.litWant ? 1 : 0;
      const nv = to ? Math.min(1, v + dt / LIT_MS) : Math.max(0, v - dt / LIT_MS);
      if (nv <= 0 && !to) this.litK.delete(k);
      else this.litK.set(k, nv);
      if (nv !== to) moving = true;
    }
    const sig = this.sig();
    if (moving || this.dirty || sig !== this.lastSig) {
      this.dirty = false;
      this.lastSig = sig;
      this.draw();
    }
    if (this.flying || moving) this.raf = requestAnimationFrame(this.tick);
  };

  private sig(): string {
    const cam = this.readCamera();
    return cam ? `${cam.center.lat}|${cam.center.lng}|${cam.range}|${cam.tilt}|${cam.heading}|${cam.fov}` : "";
  }

  /** IN STEP WITH GOOGLE'S FRAME. Measured (scripts/_scratch-r57f-calib.mjs, a red Google marker and
   * our green dot for the same home in one screenshot mid-flight): drawn from our own animation
   * frame alone, our lights trailed Google's drawing by up to 21 px, one frame of the flight's
   * motion (our callback ran before Google's in the frame and read the camera it had drawn LAST
   * frame). The element announces every camera change (`gmp-centerchange` and its kin) as it moves
   * the camera, before it draws; drawing then, once per change (a microtask gathers the four
   * events), puts our lights in the same frame as Google's. The animation frame still runs the
   * fades and skips a camera it has already drawn. */
  private micro = false;
  onCameraChange = () => {
    if (this.micro) return;
    this.micro = true;
    queueMicrotask(() => {
      this.micro = false;
      const sig = this.sig();
      if (sig === this.lastSig) return;
      this.lastSig = sig;
      // This frame's drawing is done (a cut's plan, set in the same task, is in it too): the
      // animation frame need not draw it again (reduced motion: one draw per cut).
      this.dirty = false;
      this.draw();
    });
  };

  /** One frame: every drawn home projected from the map's camera now. */
  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = performance.now();
    const cam = this.readCamera();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.xyCount = 0;
    if (!cam || this.w === 0) return;
    const range = cam.range > 1 ? cam.range : Math.max(500, cam.center.altitude / Math.max(0.2, Math.cos((cam.tilt * Math.PI) / 180)));
    const g = glyphAt(range, { narrow: this.narrow(), glow: this.glowStrength, halo: this.haloScale });
    this.glyph = g;
    const fr = cameraFrame(cam);
    const vp = { width: this.w, height: this.h, fov: cam.fov };
    const f = focalOf(vp);
    const other = this.projector ? this.projector.frame() : null;
    if (this.projector && !other) return;
    const at = (pts: Float64Array, i: number, out: { x: number; y: number; z: number }) => (other ? other(pts, i, out) : projectHome(fr, vp, f, pts, i, out));
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "low";
    const p = { x: 0, y: 0, z: 0 };
    const av = this.avoid;
    const r0 = reachOf(g);
    const reach = r0 * 1.6;
    const blocked = (x: number, y: number, r: number) => !!av && x + r > av.x && x - r < av.x + av.w && y + r > av.y && y - r < av.y + av.h;
    // The frame's bakes for the unlit lights, one per glow step (the lit ones bake their own).
    const stepped = GLOW_LEVELS.map((l) => ({ ...g, glowAlpha: g.glowAlpha * l }));
    this.bakeBudget = BAKES_PER_FRAME;
    const bases = stepped.map((gl, l) => this.bakeOf(gl, 0, l));
    const litHomes = new Map<number, number>();
    for (const [key, v] of this.litK) if (key.startsWith("h:")) litHomes.set(Number(key.slice(2)), v);
    let k = 0;
    for (const [i, fd] of this.fades) {
      if (!at(this.ecef, i, p)) continue;
      if (p.x < -reach || p.y < -reach || p.x > this.w + reach || p.y > this.h + reach) continue;
      // Nothing in Google's logo corner: not drawn, and so not hoverable either.
      if (av && blocked(p.x, p.y, r0)) continue;
      if (fd.to === 1 && fd.a > 0.5) {
        this.xy[2 * k] = p.x;
        this.xy[2 * k + 1] = p.y;
        this.xyIndex[k] = i;
        k++;
      }
      const lk = litHomes.size ? litHomes.get(i) ?? 0 : 0;
      if (lk > 0) {
        const gl = litGlyph(stepped[this.level[i]] ?? g, this.litEase(`h:${i}`, lk));
        this.stamp(ctx, p.x, p.y, this.bakeOf(gl, lk), easeFade(fd.a));
      } else this.stamp(ctx, p.x, p.y, bases[this.level[i]] ?? bases[2], fd.a === 1 ? 1 : easeFade(fd.a));
    }
    this.xyCount = k;
    const fg = featuredGlyph(g);
    for (let j = 0; j < this.featIds.length; j++) {
      if (!at(this.featEcef, j, p)) continue;
      if (p.x < -reach || p.y < -reach || p.x > this.w + reach || p.y > this.h + reach) continue;
      const lk = this.litK.get(`f:${this.featIds[j]}`) ?? 0;
      const gl = lk > 0 ? litGlyph(fg, this.litEase(`f:${this.featIds[j]}`, lk)) : fg;
      if (blocked(p.x, p.y, reachOf(gl))) continue;
      this.stamp(ctx, p.x, p.y, this.bakeOf(gl, lk), 1);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    const ms = performance.now() - t0;
    const c = this.cost;
    c.frames++;
    c.totalMs += ms;
    c.maxMs = Math.max(c.maxMs, ms);
    c.samples.push(Math.round(ms * 1000) / 1000);
    if (c.samples.length > 3000) c.samples.shift();
  }

  /** THE SWELL'S CURVE (round 57.8, the animate skill's rule: feedback to a pointer is ease-out,
   * fast at the moment the eye is on it): coming up, a cubic ease-out over LIT_MS (140 ms);
   * going down, the round-6 smoothstep, so the light settles back without a snap. */
  private litEase(key: string, k: number): number {
    return key === this.litWant ? 1 - (1 - k) * (1 - k) * (1 - k) : easeFade(k);
  }

  /** New bakes this frame may still make, and the last bake each glow step drew with. */
  private bakeBudget = BAKES_PER_FRAME;
  private lastBase: (HTMLCanvasElement | undefined)[] = [];

  /** A glyph's bake (made once, kept while the glyph is on screen). `slot`, a glow step's base:
   * past this frame's budget of new bakes it keeps last frame's sprite for that step. */
  private bakeOf(g: Glyph, lit: number, slot?: number): HTMLCanvasElement {
    const q = quant(g, lit);
    const key = `${q.core}/${q.halo}/${q.haloAlpha}/${q.glow}/${q.glowAlpha}/${q.lit}`;
    let b = this.bakes.get(key);
    if (!b && slot !== undefined && this.bakeBudget <= 0 && this.lastBase[slot]) return this.lastBase[slot]!;
    if (!b) {
      this.bakeBudget--;
      if (this.bakes.size > 400) this.bakes.clear();
      b = bake(q, q.lit, this.dpr);
      this.bakes.set(key, b);
    }
    if (slot !== undefined) this.lastBase[slot] = b;
    return b;
  }

  /** One light: its bake, unscaled, centred on the place (device pixels). */
  private stamp(ctx: CanvasRenderingContext2D, x: number, y: number, b: HTMLCanvasElement, alpha: number) {
    if (alpha <= 0.003) return;
    if (ctx.globalAlpha !== alpha) ctx.globalAlpha = alpha;
    ctx.drawImage(b, x * this.dpr - b.width / 2, y * this.dpr - b.height / 2);
  }

  /** Where a place is on screen in the camera the map reports now (the featured homes' labels). */
  screenOf(ecef: Float64Array, i: number): { x: number; y: number } | null {
    const cam = this.readCamera();
    if (!cam || this.w === 0) return null;
    const vp = { width: this.w, height: this.h, fov: cam.fov };
    const p = { x: 0, y: 0, z: 0 };
    if (this.projector) {
      const at = this.projector.frame();
      return at && at(ecef, i, p) ? { x: p.x, y: p.y } : null;
    }
    return projectHome(cameraFrame(cam), vp, focalOf(vp), ecef, i, p) ? { x: p.x, y: p.y } : null;
  }
}
