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
import { CORE_RGB, LIT_MS, LIT_RGB, featuredGlyph, glyphAdd, glyphAt, litGlyph, type Glyph } from "./glyph";
import { applyPlan, easeFade, focalOf, homesEcef, projectHome, stepFades, type Fade } from "./light-plan";

export interface LayerCamera extends MapCamera {
  fov: number;
}

type Rect = { x: number; y: number; w: number; h: number };

/** ONE LIGHT, BAKED at its own device-pixel size (glyph.ts glyphAdd, the cover's own sum), core and
 * halo together, so a frame is one unscaled drawImage per light added with "lighter". Measured: the
 * first build drew two sprites a light scaled down from 64 px with "high" smoothing, 1.09 ms a
 * frame mean and 1.9 ms p95 over a cold scroll at 1440 (the county ceilings), and it doubled the
 * flights' frames over 34 ms (142 against 65 with `?homes=0`). The glyph eases continuously, so the
 * bakes are keyed by the glyph quantised finer than the eye can see (core 0.05 px, halo 0.25 px,
 * strength 0.02, lit 0.1): a flight bakes a few dozen, each ~0.05 ms. */
function bake(g: Glyph, lit: number, dpr: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const R = g.halo * dpr;
  const s = Math.ceil(R) * 2 + 2;
  c.width = c.height = s;
  const x = c.getContext("2d")!;
  const img = x.createImageData(s, s);
  const core = [0, 1, 2].map((k) => CORE_RGB[k] + (LIT_RGB[k] - CORE_RGB[k]) * lit);
  for (let j = 0; j < s; j++)
    for (let i = 0; i < s; i++) {
      const d = Math.hypot(i + 0.5 - s / 2, j + 0.5 - s / 2) / dpr;
      const [r, gg, b] = glyphAdd(g, d, 1, core);
      const o = (j * s + i) * 4;
      // The light's additive value stored as colour over alpha (alpha = its largest channel), so
      // the canvas keeps it premultiplied and is transparent wherever the light adds nothing (an
      // opaque bake made "lighter" paint black squares on the transparent canvas). The canvas is
      // then ADDED to the map by its CSS blend (G3dGround: plus-lighter), as the cover sums it.
      const R = Math.min(255, r), Gc = Math.min(255, gg), B = Math.min(255, b);
      const a = Math.max(R, Gc, B);
      if (a < 0.5) continue;
      img.data[o] = Math.round((R / a) * 255);
      img.data[o + 1] = Math.round((Gc / a) * 255);
      img.data[o + 2] = Math.round((B / a) * 255);
      img.data[o + 3] = Math.round(a);
    }
  x.putImageData(img, 0, 0);
  return c;
}

const quant = (g: Glyph, lit: number) => ({ core: Math.round(g.core * 20) / 20, halo: Math.max(0.5, Math.round(g.halo * 4) / 4), haloAlpha: Math.round(g.haloAlpha * 50) / 50, lit: Math.round(lit * 10) / 10 });

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

  constructor(
    private canvas: HTMLCanvasElement,
    private readCamera: () => LayerCamera | null,
    private narrow: () => boolean,
  ) {
    this.ctx = canvas.getContext("2d");
    this.resize();
  }

  /** The canvas to its box, at the screen's pixel density. */
  resize() {
    const c = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (dpr !== this.dpr) this.bakes.clear();
    this.dpr = dpr;
    this.w = c.clientWidth;
    this.h = c.clientHeight;
    c.width = Math.max(1, Math.round(this.w * this.dpr));
    c.height = Math.max(1, Math.round(this.h * this.dpr));
    this.draw();
  }

  /** The homes (their places, heights included). A new set clears what is drawn. */
  setHomes(lat: ArrayLike<number>, lng: ArrayLike<number>, height: (lat: number, lng: number) => number) {
    this.ecef = homesEcef(lat, lng, height);
    this.xy = new Float32Array(lat.length * 2);
    this.xyIndex = new Int32Array(lat.length);
  }

  get homesEcef() {
    return this.ecef;
  }

  setFeatured(list: readonly { id: string; lat: number; lng: number }[], height: (lat: number, lng: number) => number) {
    this.featEcef = homesEcef(list.map((h) => h.lat), list.map((h) => h.lng), height);
    this.featIds = list.map((h) => h.id);
    this.kick();
  }

  /** A new set of homes to draw; `instant` for a cut. */
  plan(indices: readonly number[], instant: boolean) {
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
    const g = glyphAt(range, { narrow: this.narrow() });
    this.glyph = g;
    const fr = cameraFrame(cam);
    const vp = { width: this.w, height: this.h, fov: cam.fov };
    const f = focalOf(vp);
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "low";
    const p = { x: 0, y: 0, z: 0 };
    const av = this.avoid;
    const reach = g.halo * 1.6;
    const blocked = (x: number, y: number, r: number) => !!av && x + r > av.x && x - r < av.x + av.w && y + r > av.y && y - r < av.y + av.h;
    // The frame's one bake for every unlit light (the lit ones, one or two, bake their own).
    const base = this.bakeOf(g, 0);
    const litHomes = new Map<number, number>();
    for (const [key, v] of this.litK) if (key.startsWith("h:")) litHomes.set(Number(key.slice(2)), v);
    let k = 0;
    for (const [i, fd] of this.fades) {
      if (!projectHome(fr, vp, f, this.ecef, i, p)) continue;
      if (p.x < -reach || p.y < -reach || p.x > this.w + reach || p.y > this.h + reach) continue;
      // Nothing in Google's logo corner: not drawn, and so not hoverable either.
      if (blocked(p.x, p.y, g.halo)) continue;
      if (fd.to === 1 && fd.a > 0.5) {
        this.xy[2 * k] = p.x;
        this.xy[2 * k + 1] = p.y;
        this.xyIndex[k] = i;
        k++;
      }
      const lk = litHomes.get(i) ?? 0;
      if (lk > 0) {
        const gl = litGlyph(g, easeFade(lk));
        this.stamp(ctx, p.x, p.y, this.bakeOf(gl, lk), easeFade(fd.a));
      } else this.stamp(ctx, p.x, p.y, base, easeFade(fd.a));
    }
    this.xyCount = k;
    const fg = featuredGlyph(g);
    for (let j = 0; j < this.featIds.length; j++) {
      if (!projectHome(fr, vp, f, this.featEcef, j, p)) continue;
      if (p.x < -reach || p.y < -reach || p.x > this.w + reach || p.y > this.h + reach) continue;
      const lk = this.litK.get(`f:${this.featIds[j]}`) ?? 0;
      const gl = lk > 0 ? litGlyph(fg, easeFade(lk)) : fg;
      if (blocked(p.x, p.y, gl.halo)) continue;
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

  /** A glyph's bake (made once, kept while the glyph is on screen). */
  private bakeOf(g: Glyph, lit: number): HTMLCanvasElement {
    const q = quant(g, lit);
    const key = `${q.core}/${q.halo}/${q.haloAlpha}/${q.lit}`;
    let b = this.bakes.get(key);
    if (!b) {
      if (this.bakes.size > 400) this.bakes.clear();
      b = bake(q, q.lit, this.dpr);
      this.bakes.set(key, b);
    }
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
    return projectHome(cameraFrame(cam), vp, focalOf(vp), ecef, i, p) ? { x: p.x, y: p.y } : null;
  }
}
