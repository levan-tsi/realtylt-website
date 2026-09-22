/** THE NIGHT FLIGHT SCENE (round 54): renderer, camera, loop. Framework-free; the React wrapper
 * (./NightScene.tsx) imports this module dynamically, so three.js never blocks first paint.
 *
 * What it draws: the land as silver dust (./dust.ts), every home for sale as a warm light
 * (./lights.ts), black water and a black sky. What moves: the camera between SHOTS (./shots.ts),
 * a very slow drift and a small pointer parallax (off under reduced motion), the intro (dust fades
 * in, then the lights come on from the harbour up the valley), and the lantern under a mouse.
 *
 * It renders only while something moves (intro, a flight, the drift, the lantern) and never while
 * the tab is hidden or the canvas is off screen. */
import * as THREE from "three";
import { loadLights } from "@/lib/idx/lights-client";
import { buildContourDust, buildDepthMesh, buildDust, type DustCloud } from "./dust";
import { loadElevation, sampleHeight, type ElevationGrid } from "./elevation";
import { buildHaze, buildLights, townCentroids, type TownMark } from "./lights";
import { DEPTH_FRAGMENT, DEPTH_VERTEX, DUST_FRAGMENT, DUST_VERTEX, HAZE_FRAGMENT, HAZE_VERTEX, LIGHT_FRAGMENT, LIGHT_VERTEX } from "./shaders";
import { blendFramings, framingFor, sequenceFraming, SHOTS, type Framing, type ShotName } from "./shots";
import { EXAGGERATION, lngLatToWorld, worldToLngLat, type Vec3 } from "./world";

export interface TownHover {
  name: string;
  count: number;
  /** The pointer, css px from the canvas's top left. */
  x: number;
  y: number;
}

export interface NightSceneOptions {
  canvas: HTMLCanvasElement;
  reducedMotion?: boolean;
  /** A fine pointer with hover: the lantern, the parallax and the twinkle live only there. */
  hover?: boolean;
  /** Dust grains; defaults by screen size. */
  dustCount?: number;
  initialShot?: ShotName;
  /** Everything on at once (for stills); reduced motion implies it. */
  skipIntro?: boolean;
  /** The idle drift (default: on unless reduced motion). */
  drift?: boolean;
  onTownHover?: (t: TownHover | null) => void;
  onReady?: () => void;
  elevationBase?: string;
  /** Look knobs, for the lab. */
  look?: Partial<Look>;
}

export interface Look {
  /** Vertical exaggeration of the terrain (a uniform: no rebuild). */
  exaggeration: number;
  /** Extra dust on steep ground (rebuilds the dust). */
  reliefBias: number;
  /** How the land is drawn (rebuilds): scattered grains, contour lines of grains, or both. */
  dustMode: "stipple" | "contour" | "mix";
  contourInterval: number;
  contourSpacing: number;
  /** Blur passes on the heights the contours follow (rebuilds). */
  contourSmooth: number;
  /** Brightness of the scattered fill, an index contour and the shoreline, relative to a contour. */
  fillGain: number;
  indexGain: number;
  shoreGain: number;
  /** Level of detail by kind (fill, contour, index contour, shore): how much longer each survives
   * with distance. */
  kindKeep: [number, number, number, number];
  /** How much crests brighten and hollows dim, -1..1 of local relief. */
  ridge: number;
  dustAlpha: number;
  /** World size of a grain's sheen, km. */
  dustSize: number;
  /** Largest sheen, css px (fill rate). */
  dustMaxPx: number;
  /** Strength of a grain's spark and of its sheen. */
  dustCore: number;
  dustSheen: number;
  /** Target grains per device pixel squared, before the facing term. */
  dustDensity: number;
  shadeGamma: number;
  shadeFlat: number;
  /** Light that is not the moon's: the shadowed flanks keep this share of a lit one. */
  ambient: number;
  lightAlpha: number;
  lightSize: number;
  /** A light's halo: strength, and width as a multiple of its core. */
  lightHalo: number;
  lightSpread: number;
  /** The city's glow: strength and world size (km) of each patch. */
  haze: number;
  hazeSize: number;
  fogNear: number;
  fogFar: number;
  /** Grains closer than this share of the shot's distance fade out (a soft foreground). */
  nearFade: number;
  occlude: boolean;
}

export const DEFAULT_LOOK: Look = {
  exaggeration: EXAGGERATION,
  reliefBias: 3,
  dustMode: "mix",
  contourInterval: 20,
  contourSpacing: 0.03,
  contourSmooth: 2,
  fillGain: 0.25,
  indexGain: 1.6,
  shoreGain: 0.85,
  kindKeep: [0.4, 0.7, 4, 4],
  ridge: 0.5,
  dustAlpha: 1,
  dustSize: 0.2,
  dustMaxPx: 14,
  dustCore: 0.7,
  dustSheen: 0.1,
  dustDensity: 0.1,
  shadeGamma: 1.4,
  shadeFlat: 0.45,
  ambient: 0.22,
  lightAlpha: 2.2,
  lightSize: 0.045,
  lightHalo: 0.45,
  lightSpread: 5,
  haze: 0.07,
  hazeSize: 6,
  fogNear: 0.9,
  fogFar: 2.6,
  nearFade: 0.14,
  occlude: true,
};

export interface NightSceneHandle {
  /** Go to a named shot: a cut (immediate) or an eased approach. */
  setShot(name: ShotName, opts?: { immediate?: boolean }): void;
  /** Fly the arc to a named shot. Under reduced motion it cuts. */
  flyTo(name: ShotName, ms?: number): Promise<void>;
  /** Scrub a flight: s runs 0..names.length - 1. */
  setSequence(names: readonly ShotName[], s: number, opts?: { immediate?: boolean }): void;
  setFraming(f: Framing, opts?: { immediate?: boolean }): void;
  /** 0 = the full scene, 1 = dimmed under page content. Eased. */
  setVeil(v: number, opts?: { immediate?: boolean }): void;
  /** The lantern, in css px from the canvas's top left. */
  setPointer(x: number, y: number): void;
  clearPointer(): void;
  hoveredTown(): TownHover | null;
  setLook(l: Partial<Look>): void;
  stats(): { dust: number; lights: number; towns: number; frames: number; ready: boolean; gpu: string; buildMs: number };
  dispose(): void;
}

const copyF = (f: Framing): Framing => ({ pos: [...f.pos] as Vec3, target: [...f.target] as Vec3, fov: f.fov, moon: [f.moon[0], f.moon[1]] });

function joinClouds(parts: DustCloud[]): DustCloud {
  if (parts.length === 1) return parts[0];
  const n = parts.reduce((a, p) => a + p.count, 0);
  const out: DustCloud = { count: n, positions: new Float32Array(n * 3), slopes: new Float32Array(n * 2), ridges: new Float32Array(n), seeds: new Float32Array(n), kinds: new Float32Array(n) };
  let o = 0;
  for (const p of parts) {
    out.positions.set(p.positions, o * 3);
    out.slopes.set(p.slopes, o * 2);
    out.ridges.set(p.ridges, o);
    out.seeds.set(p.seeds, o);
    out.kinds.set(p.kinds, o);
    o += p.count;
  }
  return out;
}

const isPhone = () => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700;

export async function createNightScene(opts: NightSceneOptions): Promise<NightSceneHandle> {
  const { canvas } = opts;
  const reduce = !!opts.reducedMotion;
  const hover = !!opts.hover;
  const phone = isPhone();
  const look: Look = { ...DEFAULT_LOOK, ...opts.look };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance", stencil: false });
  renderer.setClearColor(0x000000, 1);
  renderer.sortObjects = false;
  const gl = renderer.getContext();
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "unknown";
  const dprCap = phone ? 2 : 1.5;
  let dpr = Math.min(window.devicePixelRatio || 1, dprCap);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 600);

  // ---- uniforms ------------------------------------------------------------------------------
  const moonDir = new THREE.Vector3();
  const setMoon = (m: [number, number]) => {
    const az = (m[0] * Math.PI) / 180, alt = (m[1] * Math.PI) / 180;
    // Azimuth clockwise from north; world z runs south.
    moonDir.set(Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt)).normalize();
  };
  const shared = {
    uExag: { value: look.exaggeration },
    uPixelRatio: { value: dpr },
    uFocal: { value: 1000 },
    uVeil: { value: 0 },
    uPointer: { value: new THREE.Vector2(9, 9) },
    uPointerOn: { value: 0 },
    uAspect: { value: 1 },
    uFog: { value: new THREE.Vector2(80, 220) },
    uNear: { value: 1 },
  };
  const dustU = {
    ...shared,
    uIntro: { value: 0 },
    uLodK: { value: 1e4 },
    uAlpha: { value: look.dustAlpha },
    uSize: { value: look.dustSize },
    uShadeGamma: { value: look.shadeGamma },
    uShadeFlat: { value: look.shadeFlat },
    uRidge: { value: look.ridge },
    uAmbient: { value: look.ambient },
    uMaxPx: { value: phone ? Math.min(look.dustMaxPx, 16) : look.dustMaxPx },
    uCore: { value: look.dustCore },
    uSheen: { value: look.dustSheen },
    uKindGain: { value: new THREE.Vector4(look.fillGain, 1, look.indexGain, look.shoreGain) },
    uKindKeep: { value: new THREE.Vector4(...look.kindKeep) },
    uMoon: { value: moonDir },
  };
  const lightU = {
    ...shared,
    uIntro: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: look.lightSize },
    uAlpha: { value: look.lightAlpha },
    uTwinkle: { value: hover && !reduce ? 1 : 0 },
    uHalo: { value: look.lightHalo },
    uSpread: { value: look.lightSpread },
  };
  const hazeU = {
    ...shared,
    uIntro: lightU.uIntro,
    uHaze: { value: look.haze },
    uHazeSize: { value: look.hazeSize },
  };
  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendEquation: THREE.AddEquation,
  } as const;
  const dustMat = new THREE.ShaderMaterial({ uniforms: dustU, vertexShader: DUST_VERTEX, fragmentShader: DUST_FRAGMENT, depthTest: look.occlude, ...additive });
  const lightMat = new THREE.ShaderMaterial({ uniforms: lightU, vertexShader: LIGHT_VERTEX, fragmentShader: LIGHT_FRAGMENT, depthTest: look.occlude, ...additive });
  const hazeMat = new THREE.ShaderMaterial({ uniforms: hazeU, vertexShader: HAZE_VERTEX, fragmentShader: HAZE_FRAGMENT, depthTest: look.occlude, ...additive });
  const depthMat = new THREE.ShaderMaterial({
    uniforms: { uExag: shared.uExag, uSink: { value: 0.04 } },
    vertexShader: DEPTH_VERTEX,
    fragmentShader: DEPTH_FRAGMENT,
    colorWrite: false,
    depthWrite: true,
  });

  // ---- state ---------------------------------------------------------------------------------
  let grid: ElevationGrid | null = null;
  let towns: TownMark[] = [];
  let townWorld = new Float32Array(0);
  let dustPoints: THREE.Points | null = null;
  let lightPoints: THREE.Points | null = null;
  let hazePoints: THREE.Points | null = null;
  let depthMesh: THREE.Mesh | null = null;
  let dustStart = -1;
  let lightsStart = -1;
  let disposed = false;
  let raf = 0;
  let frames = 0;
  let last = performance.now();
  let ready = false;
  let landKm2 = 17000;
  let dustCount = 0;
  let buildMs = 0;

  let aspect = 1;
  let goal: Framing = framingFor(SHOTS[opts.initialShot ?? "hero"], aspect);
  let goalName: ShotName | null = opts.initialShot ?? "hero";
  let cur: Framing = copyF(goal);
  let flight: { from: Framing; to: ShotName; t0: number; ms: number; done: () => void } | null = null;
  let veilGoal = 0;
  let pointer: { x: number; y: number } | null = null;
  const par = { x: 0, y: 0 }; // damped parallax, -1..1
  let hovered: TownHover | null = null;
  const drift = opts.drift ?? !reduce;

  const ground = (x: number, z: number) => {
    if (!grid) return 0;
    const [lng, lat] = worldToLngLat(x, z);
    return (sampleHeight(grid, lng, lat) / 1000) * look.exaggeration;
  };

  // ---- sizing ----------------------------------------------------------------------------------
  let cssW = 1, cssH = 1;
  function resize() {
    const r = canvas.getBoundingClientRect();
    cssW = Math.max(1, r.width);
    cssH = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setPixelRatio(dpr);
    renderer.setSize(cssW, cssH, false);
    aspect = cssW / cssH;
    shared.uPixelRatio.value = dpr;
    shared.uAspect.value = aspect;
    if (goalName && !flight) goal = framingFor(SHOTS[goalName], aspect);
    // Before the first frame the camera simply stands at its shot (no approach from a guess).
    if (frames === 0) cur = copyF(goal);
    kick();
  }

  // ---- building the clouds -----------------------------------------------------------------------
  async function buildTerrain() {
    try {
      grid = await loadElevation(opts.elevationBase);
    } catch {
      grid = null; // lights still stand on a flat sea level
      return;
    }
    if (disposed) return;
    buildDustCloud();
    // The land's area, for the level-of-detail uniform.
    let land = 0;
    for (let i = 0; i < grid.water.length; i++) if (!grid.water[i]) land++;
    landKm2 = (land * grid.cellM.x * grid.cellM.y) / 1e6;
    const mesh = buildDepthMesh(grid, phone ? 2 : 1);
    const mg = new THREE.BufferGeometry();
    mg.setAttribute("position", new THREE.BufferAttribute(mesh.positions, 3));
    mg.setIndex(new THREE.BufferAttribute(mesh.index, 1));
    depthMesh = new THREE.Mesh(mg, depthMat);
    depthMesh.frustumCulled = false;
    depthMesh.renderOrder = 0;
    depthMesh.visible = look.occlude;
    scene.add(depthMesh);
    dustStart = performance.now();
  }

  let builtKey = "";
  const dustKey = () => [look.reliefBias, look.dustMode, look.contourInterval, look.contourSpacing, look.contourSmooth].join("|");
  function buildDustCloud() {
    if (!grid) return;
    if (dustPoints) {
      scene.remove(dustPoints);
      dustPoints.geometry.dispose();
    }
    const t0 = performance.now();
    const budget = opts.dustCount ?? (phone ? 300_000 : 700_000);
    const parts: DustCloud[] = [];
    if (look.dustMode !== "stipple")
      parts.push(
        buildContourDust(grid, {
          intervalM: look.contourInterval,
          spacingKm: look.contourSpacing,
          shoreDensity: 1.6,
          jitterKm: 0.012,
          smoothPasses: look.contourSmooth,
          maxPoints: look.dustMode === "mix" ? Math.round(budget * 0.75) : budget,
        }),
      );
    const used = parts.reduce((n, p) => n + p.count, 0);
    const fill = look.dustMode === "stipple" ? budget : look.dustMode === "mix" ? Math.max(0, budget - used) : 0;
    if (fill > 0) parts.push(buildDust(grid, { count: fill, reliefBias: look.reliefBias }));
    const dust = joinClouds(parts);
    buildMs = performance.now() - t0;
    builtKey = dustKey();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(dust.positions, 3));
    g.setAttribute("aSlope", new THREE.BufferAttribute(dust.slopes, 2));
    g.setAttribute("aRidge", new THREE.BufferAttribute(dust.ridges, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(dust.seeds, 1));
    g.setAttribute("aKind", new THREE.BufferAttribute(dust.kinds, 1));
    dustPoints = new THREE.Points(g, dustMat);
    dustPoints.frustumCulled = false;
    dustPoints.renderOrder = 1;
    scene.add(dustPoints);
    dustCount = dust.count;
  }

  async function buildLightCloud() {
    const pts = await loadLights();
    if (!pts || disposed) return;
    const cloud = buildLights(pts, grid);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cloud.positions, 3));
    g.setAttribute("aDelay", new THREE.BufferAttribute(cloud.delays, 1));
    g.setAttribute("aGain", new THREE.BufferAttribute(cloud.gains, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(cloud.seeds, 1));
    lightPoints = new THREE.Points(g, lightMat);
    lightPoints.frustumCulled = false;
    lightPoints.renderOrder = 3;
    scene.add(lightPoints);
    const haze = buildHaze(cloud);
    const hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.BufferAttribute(haze.positions, 3));
    hg.setAttribute("aStrength", new THREE.BufferAttribute(haze.strengths, 1));
    hazePoints = new THREE.Points(hg, hazeMat);
    hazePoints.frustumCulled = false;
    hazePoints.renderOrder = 2;
    scene.add(hazePoints);
    towns = townCentroids(pts);
    townWorld = new Float32Array(towns.length * 3);
    towns.forEach((t, i) => {
      const h = grid ? sampleHeight(grid, t.lng, t.lat) : 0;
      const [x, , z] = lngLatToWorld(t.lng, t.lat);
      townWorld.set([x, h / 1000, z], i * 3);
    });
    // The lights follow the dust: they begin once the land has had most of a second to appear.
    const now = performance.now();
    lightsStart = Math.max(now, (dustStart < 0 ? now : dustStart) + 850);
  }

  // ---- camera ----------------------------------------------------------------------------------
  const tmpV = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const right = new THREE.Vector3();
  const upV = new THREE.Vector3();
  function applyCamera(t: number) {
    const [px, py, pz] = cur.pos;
    const [tx, ty, tz] = cur.target;
    const dist = Math.hypot(px - tx, py - ty, pz - tz);
    fwd.set(tx - px, ty - py, tz - pz).normalize();
    right.crossVectors(fwd, THREE.Object3D.DEFAULT_UP).normalize();
    upV.crossVectors(right, fwd).normalize();
    let ox = 0, oy = 0;
    if (drift) {
      // A very slow drift, as if the camera were hung from something breathing: well under a
      // degree of view, periods of half a minute and more.
      ox += Math.sin(t * 0.021) * 0.012 + Math.sin(t * 0.047 + 1.7) * 0.004;
      oy += Math.sin(t * 0.033 + 0.6) * 0.006;
    }
    if (hover && !reduce) {
      ox += par.x * 0.018;
      oy += -par.y * 0.01;
    }
    camera.position.set(px, py, pz).addScaledVector(right, ox * dist).addScaledVector(upV, oy * dist);
    camera.up.set(0, 1, 0);
    camera.lookAt(tmpV.set(tx, ty, tz));
    camera.fov = cur.fov;
    setMoon(cur.moon);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    // Derived per frame: focal length in device pixels, fog by how far the shot looks, and the
    // level of detail (grains per device pixel squared -> keep fraction numerator).
    const focal = (0.5 * cssH * dpr) / Math.tan((cur.fov * Math.PI) / 360);
    shared.uFocal.value = focal;
    shared.uFog.value.set(dist * look.fogNear, Math.min(560, dist * look.fogFar + 20));
    shared.uNear.value = dist * look.nearFade;
    const rho = dustCount / Math.max(1, landKm2);
    dustU.uLodK.value = (look.dustDensity * focal * focal) / Math.max(1e-3, rho);
  }

  const approach = (a: number, b: number, k: number) => a + (b - a) * k;
  function step(now: number, dt: number): boolean {
    let moving = false;
    if (flight) {
      const t = Math.min(1, (now - flight.t0) / flight.ms);
      goal = blendFramings(flight.from, framingFor(SHOTS[flight.to], aspect), t, grid ? ground : undefined);
      cur = copyF(goal);
      moving = true;
      if (t >= 1) {
        const done = flight.done;
        flight = null;
        done();
      }
    } else {
      // Critically damped approach to the goal (scroll scrubs set the goal every frame).
      const k = 1 - Math.exp(-dt / 0.16);
      let err = 0;
      for (let i = 0; i < 3; i++) {
        err += Math.abs(goal.pos[i] - cur.pos[i]) + Math.abs(goal.target[i] - cur.target[i]);
        cur.pos[i] = approach(cur.pos[i], goal.pos[i], k);
        cur.target[i] = approach(cur.target[i], goal.target[i], k);
      }
      err += Math.abs(goal.fov - cur.fov) * 0.1;
      cur.fov = approach(cur.fov, goal.fov, k);
      const dAz = ((((goal.moon[0] - cur.moon[0]) % 360) + 540) % 360) - 180;
      cur.moon = [(cur.moon[0] + dAz * k + 360) % 360, approach(cur.moon[1], goal.moon[1], k)];
      err += (Math.abs(dAz) + Math.abs(goal.moon[1] - cur.moon[1])) * 0.001;
      if (err > 0.002) moving = true;
      else cur = copyF(goal);
    }
    // Veil and lantern fade.
    const kv = 1 - Math.exp(-dt / 0.25);
    shared.uVeil.value = approach(shared.uVeil.value, veilGoal, kv);
    if (Math.abs(shared.uVeil.value - veilGoal) > 0.002) moving = true;
    else shared.uVeil.value = veilGoal;
    const onGoal = pointer ? 1 : 0;
    shared.uPointerOn.value = approach(shared.uPointerOn.value, onGoal, 1 - Math.exp(-dt / 0.12));
    if (Math.abs(shared.uPointerOn.value - onGoal) > 0.003) moving = true;
    if (hover && !reduce) {
      const gx = pointer ? (pointer.x / cssW) * 2 - 1 : 0;
      const gy = pointer ? (pointer.y / cssH) * 2 - 1 : 0;
      const kp = 1 - Math.exp(-dt / 0.6);
      par.x = approach(par.x, gx, kp);
      par.y = approach(par.y, gy, kp);
      if (Math.abs(par.x - gx) + Math.abs(par.y - gy) > 0.002) moving = true;
    }
    return moving;
  }

  // ---- the lantern -------------------------------------------------------------------------------
  const PICK_R = 46; // css px
  function pickTown() {
    if (!pointer || !towns.length) return setHovered(null);
    const m = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const e = m.elements;
    let best = -1;
    let bestD = PICK_R * PICK_R;
    const fogFar = shared.uFog.value.y;
    for (let i = 0; i < towns.length; i++) {
      const x = townWorld[i * 3], y = townWorld[i * 3 + 1] * look.exaggeration, z = townWorld[i * 3 + 2];
      const w = e[3] * x + e[7] * y + e[11] * z + e[15];
      if (w <= 0.05 || w > fogFar * 0.8) continue;
      const sx = ((e[0] * x + e[4] * y + e[8] * z + e[12]) / w + 1) * 0.5 * cssW;
      const sy = (1 - (e[1] * x + e[5] * y + e[9] * z + e[13]) / w) * 0.5 * cssH;
      const d = (sx - pointer.x) ** 2 + (sy - pointer.y) ** 2;
      // Bigger towns win close calls: a village beside a city should not steal its label.
      const bias = d / (1 + 0.08 * Math.log1p(towns[i].lit));
      if (bias < bestD) {
        bestD = bias;
        best = i;
      }
    }
    setHovered(best < 0 ? null : { name: towns[best].name, count: towns[best].count, x: pointer.x, y: pointer.y });
  }
  function setHovered(h: TownHover | null) {
    const changed = (h?.name ?? null) !== (hovered?.name ?? null) || (h && hovered && (h.x !== hovered.x || h.y !== hovered.y));
    hovered = h;
    if (changed) opts.onTownHover?.(h);
  }

  // ---- loop ------------------------------------------------------------------------------------
  let visible = true;
  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const moving = step(now, dt);
    const t = now / 1000;
    applyCamera(t);
    const introDust = reduce || opts.skipIntro ? 1e4 : dustStart < 0 ? 0 : (now - dustStart) / 1000;
    const introLights = reduce || opts.skipIntro ? 1e4 : lightsStart < 0 ? 0 : (now - lightsStart) / 1000;
    dustU.uIntro.value = introDust;
    lightU.uIntro.value = introLights;
    lightU.uTime.value = t;
    if (pointer) {
      shared.uPointer.value.set((pointer.x / cssW) * 2 - 1, 1 - (pointer.y / cssH) * 2);
      pickTown();
    }
    renderer.render(scene, camera);
    frames++;
    const introRunning = (!reduce && !opts.skipIntro && ((dustStart >= 0 && introDust < 2) || (lightsStart >= 0 && introLights < 3.2))) || (lightsStart < 0 && !reduce);
    const alive = moving || introRunning || drift || !!pointer || lightU.uTwinkle.value > 0;
    if (alive && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (!raf && !disposed && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  });
  io.observe(canvas);
  const onVis = () => kick();
  document.addEventListener("visibilitychange", onVis);
  resize();
  kick();

  await buildTerrain();
  await buildLightCloud();
  ready = true;
  opts.onReady?.();
  kick();

  function setShot(name: ShotName, o?: { immediate?: boolean }) {
    flight?.done();
    flight = null;
    goalName = name;
    goal = framingFor(SHOTS[name], aspect);
    if (o?.immediate || reduce) cur = copyF(goal);
    kick();
  }

  return {
    setShot,
    flyTo(name, ms = 2600) {
      if (reduce) {
        setShot(name, { immediate: true });
        return Promise.resolve();
      }
      goalName = name;
      return new Promise<void>((resolve) => {
        flight?.done();
        flight = { from: copyF(cur), to: name, t0: performance.now(), ms, done: resolve };
        kick();
      });
    },
    setSequence(names, s, o) {
      flight?.done();
      flight = null;
      goalName = null;
      const frames = names.map((n) => framingFor(SHOTS[n], aspect));
      // Reduced motion never scrubs through the air: the sequence cuts to its nearest shot.
      goal = reduce ? frames[Math.round(Math.min(frames.length - 1, Math.max(0, s)))] : sequenceFraming(frames, s, grid ? ground : undefined);
      if (o?.immediate || reduce) cur = copyF(goal);
      kick();
    },
    setFraming(f, o) {
      flight?.done();
      flight = null;
      goalName = null;
      goal = f;
      if (o?.immediate || reduce) cur = copyF(f);
      kick();
    },
    setVeil(v, o) {
      veilGoal = Math.min(1, Math.max(0, v));
      if (o?.immediate || reduce) shared.uVeil.value = veilGoal;
      kick();
    },
    setPointer(x, y) {
      pointer = { x, y };
      kick();
    },
    clearPointer() {
      pointer = null;
      setHovered(null);
      kick();
    },
    hoveredTown: () => hovered,
    setLook(l) {
      Object.assign(look, l);
      dustU.uAlpha.value = look.dustAlpha;
      dustU.uAmbient.value = look.ambient;
      dustU.uSize.value = look.dustSize;
      dustU.uShadeGamma.value = look.shadeGamma;
      dustU.uShadeFlat.value = look.shadeFlat;
      dustU.uRidge.value = look.ridge;
      dustU.uMaxPx.value = phone ? Math.min(look.dustMaxPx, 16) : look.dustMaxPx;
      dustU.uCore.value = look.dustCore;
      dustU.uSheen.value = look.dustSheen;
      shared.uExag.value = look.exaggeration;
      dustU.uKindGain.value.set(look.fillGain, 1, look.indexGain, look.shoreGain);
      dustU.uKindKeep.value.set(...look.kindKeep);
      if (grid && dustKey() !== builtKey) buildDustCloud();
      lightU.uAlpha.value = look.lightAlpha;
      lightU.uSize.value = look.lightSize;
      lightU.uHalo.value = look.lightHalo;
      lightU.uSpread.value = look.lightSpread;
      hazeU.uHaze.value = look.haze;
      hazeU.uHazeSize.value = look.hazeSize;
      dustMat.depthTest = look.occlude;
      lightMat.depthTest = look.occlude;
      hazeMat.depthTest = look.occlude;
      if (depthMesh) depthMesh.visible = look.occlude;
      kick();
    },
    stats: () => ({ buildMs, dust: dustCount, lights: lightPoints ? (lightPoints.geometry.getAttribute("position").count as number) : 0, towns: towns.length, frames, ready, gpu }),
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      flight?.done();
      for (const o of [dustPoints, lightPoints, hazePoints, depthMesh]) o?.geometry.dispose();
      dustMat.dispose();
      lightMat.dispose();
      hazeMat.dispose();
      depthMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
