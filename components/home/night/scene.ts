/** THE NIGHT FLIGHT SCENE (round 54): renderer, camera, loop. Framework-free; the React wrapper
 * (./NightScene.tsx) imports this module dynamically, so three.js never blocks first paint, and the
 * clouds themselves are generated in a worker (./build.worker.ts).
 *
 * What it draws: the land as contours of silver dust (./dust.ts), every home for sale as a warm
 * light with the city's own glow over it (./lights.ts), black water and a black sky. What moves:
 * the camera between SHOTS (./shots.ts), the intro (the dust fades in, then the lights come on from
 * the harbour up the valley), and — where there is a mouse — the lantern, a small pointer parallax,
 * a slow drift and a few breathing windows. Reduced motion: everything simply on, and a flight cuts.
 *
 * It renders only while something moves, at half rate when only the drift and the twinkle do, never
 * while the tab is hidden or the canvas is off screen, and not at all on a phone at rest. An
 * adaptive governor steps the quality down if the frames it measures are slow. */
import * as THREE from "three";
import { loadLights } from "@/lib/idx/lights-client";
import { buildTerrainClouds, type DustCloud, type TerrainParams } from "./dust";
import { decodeElevation, loadElevationPixels, sampleHeight, type ElevationGrid, type ElevationMeta } from "./elevation";
import type { BuildReply, BuildRequest } from "./build.worker";
import { buildLightBundle, COUNTY_SLUGS, paintCounties, type CountyRaster, type CountySlugName, type TownMark } from "./lights";
import { DEPTH_FRAGMENT, DEPTH_VERTEX, DUST_FRAGMENT, DUST_VERTEX, HAZE_FRAGMENT, HAZE_VERTEX, LIGHT_FRAGMENT, LIGHT_VERTEX } from "./shaders";
import { AREA_COUNTY_OF, AREA_FLIGHT, areaShot, blendFramings, framingFor, sequenceFraming, SHOTS, type Framing, type Shot, type ShotName } from "./shots";
import { EXAGGERATION, worldToLngLat, type Vec3 } from "./world";

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
  /** The idle drift (default: on where there is a mouse and motion is allowed). */
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
  /** Brightness of the scattered fill, an ordinary contour, an index contour and the shoreline. */
  fillGain: number;
  contourGain: number;
  indexGain: number;
  shoreGain: number;
  /** THE LIGHT LEADS, THE LAND IS THE PAPER. What each kind (fill, contour, index, shore) keeps of
   * its brightness once the camera is CLOSE to its subject, where a contour would otherwise be a
   * white rope across the frame and the homes would be lost between the ropes. */
  kindLow: [number, number, number, number];
  /** Camera-to-subject distance (world km) at which "close" begins and "far" is reached: inside
   * `near` the land is at kindLow, beyond `far` it is at full strength. */
  lowNearKm: number;
  lowFarKm: number;
  /** Close in, what a home standing on its own gains, and what a home in a dense block keeps. */
  lowLightGain: number;
  lowCityGain: number;
  /** Contour grains are thinned where their lines crowd on screen: gone below `crowdMinPx` css
   * pixels apart, whole above `crowdFullPx`. (This is where the moire comb came from.) */
  crowdMinPx: number;
  crowdFullPx: number;
  /** Level of detail by kind (fill, contour, index contour, shore): how much longer each survives
   * with distance. */
  kindKeep: [number, number, number, number];
  /** How much crests brighten and hollows dim, -1..1 of local relief. */
  ridge: number;
  dustAlpha: number;
  /** World size of a grain's sheen, km; a phone's is finer (its frame holds the same land in a
   * quarter of the width, so desktop-sized grains read as white speckle there). */
  dustSize: number;
  dustSizePhone: number;
  /** Largest sheen, css px (fill rate). */
  dustMaxPx: number;
  /** Smallest grain, css px; a phone's is finer (its frame holds the same land in a quarter of the
   * width, so desktop-sized grains read as chunky white speckle there). */
  dustMinPx: number;
  dustMinPxPhone: number;
  /** Strength of a grain's spark and of its sheen. */
  dustCore: number;
  dustSheen: number;
  /** Target grains per device pixel squared, before the facing term. */
  dustDensity: number;
  shadeGamma: number;
  shadeFlat: number;
  /** Light that is not the moon's: the shadowed flanks keep this share of a lit one. */
  ambient: number;
  /** Share of grains that glint (brighter, larger). */
  glint: number;
  lightAlpha: number;
  lightSize: number;
  /** How far a lamp is allowed to differ from its neighbours in width, brightness and shade
   * (0 = one bead stamped everywhere, 1 = the full seeded spread). Energy-preserving: a city's
   * total light does not change with it, so the tone-mapping still holds. */
  lampVary: number;
  /** THE SPARSE COUNTIES. A chapter over Ulster holds a tenth of the lamps a chapter over Brooklyn
   * does, over a frame of the same contours, so it arrived as a contour drawing with a few sparks
   * in it. When a county is the subject its homes are lifted by (the densest county's homes per
   * square kilometre / its own) ^ areaGainPow, capped at areaGainMax. No light is ever added: only
   * how hard the ones that are there burn. */
  areaGainPow: number;
  areaGainMax: number;
  /** ...and in EVERY area chapter the land is paper: whichever county is the subject, its own
   * ground keeps this share of its brightness while the chapter holds. One number, not a function
   * of density — Dutchess at a fifth showed what the chapter wants to look like, and the Catskills
   * are loud because they are steep, which has nothing to do with how many homes stand on them. */
  areaLand: number;
  /** ...and how far the land OUTSIDE it falls while the chapter holds. */
  areaOut: number;
  /** A light's halo: strength, and width as a multiple of its core. */
  lightHalo: number;
  lightSpread: number;
  /** The street lights (lights.ts buildStreetLights): the same lamp shader, a smaller, dimmer,
   * tighter lamp, so the homes for sale stay the brighter points on top of the towns' carpet.
   * streetLowCity / streetLowGain are the carpet's own close-in range stretch (the homes'
   * lowCityGain / lowLightGain): from far away the carpet is many lamps summed, close in it is a
   * few lamps a pixel, so it has to burn harder there for a town to read as lit. */
  streetSize: number;
  streetAlpha: number;
  streetSpread: number;
  streetLowCity: number;
  streetLowGain: number;
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
  contourGain: 0.65,
  indexGain: 1.6,
  shoreGain: 0.55,
  kindLow: [0.2, 0.09, 0.16, 2.4],
  lowNearKm: 40,
  lowFarKm: 110,
  lowLightGain: 2.7,
  lowCityGain: 0.42,
  crowdMinPx: 2.5,
  crowdFullPx: 9,
  kindKeep: [0.4, 0.7, 2.5, 2.5],
  ridge: 0.5,
  dustAlpha: 2,
  dustSize: 0.2,
  dustSizePhone: 0.13,
  dustMaxPx: 14,
  dustMinPx: 2,
  dustMinPxPhone: 1.4,
  dustCore: 0.7,
  dustSheen: 0.1,
  dustDensity: 0.1,
  shadeGamma: 1.8,
  shadeFlat: 0.45,
  ambient: 0.22,
  glint: 0.008,
  lightAlpha: 2.8,
  lightSize: 0.06,
  lampVary: 1,
  areaGainPow: 0.3,
  areaGainMax: 2.3,
  areaLand: 0.14,
  areaOut: 0.012,
  lightHalo: 0.45,
  lightSpread: 5,
  // Measured in the lab (round 55, lab6c against round 54): the harbour's Manhattan strip 97 -> 132
  // mean, Brooklyn's foreground 36 -> 59, Poughkeepsie 52 -> 57, Kingston 46 -> 58, the hero's
  // valley +1.5 and its dark New Jersey corner unchanged (7.2 -> 8.0); the homes stay the larger,
  // brighter lamps. streetLowGain is the close-in factor for the DENSE lamps (the metro's carry
  // the highest gains): under 1, so a borough's carpet steps back as its homes do (lowCityGain)
  // and Queens does not become one flare; streetLowCity lifts the sparse ones, a valley town's.
  streetSize: 0.03,
  streetAlpha: 0.8,
  streetSpread: 2.4,
  streetLowCity: 6,
  streetLowGain: 0.6,
  // Half of round 54's weight: the towns' carpet now carries the glow, and the haze is only the
  // breath over the densest light (measured at the hero: at 0.06 it took the metro from 70 to 116
  // mean and painted Staten Island grey, 18 -> 45).
  haze: 0.045,
  hazeSize: 10,
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
  /** Where the page's words sit (up to FOUR boxes, css px from the canvas's top left; [] for
   * none): the scene dims beneath them and eases back over a long way, so no contour runs through
   * a letter and no edge of the easing can be read as a band. Call it again after a resize or a
   * reflow. Boxes past the fourth are ignored, so the caller passes the ones that matter first. */
  setQuiet(rects: readonly { left: number; top: number; right: number; bottom: number }[]): void;
  /** The "where we work" chapter: light one county's homes and let the rest fall back (null: all
   * equal). Eased; under reduced motion it switches. */
  setFocus(county: CountySlugName | null): void;
  /** The lantern, in css px from the canvas's top left. */
  setPointer(x: number, y: number): void;
  clearPointer(): void;
  hoveredTown(): TownHover | null;
  /** performance.now() at which the intro (the dust appearing, then the lights coming on from the
   * harbour up the valley) is over, so a page holding a still of this scene knows when the live
   * one is as bright as the still and can dissolve between them without a dip. `now` when there
   * is no intro (reduced motion, skipIntro); 0 while the lights have not been built. */
  introEndsAt(): number;
  setLook(l: Partial<Look>): void;
  stats(): {
    dust: number;
    lights: number;
    towns: number;
    frames: number;
    ready: boolean;
    gpu: string;
    buildMs: number;
    buildWhere: string;
    quality: number;
    dpr: number;
    /** What each county's chapter lifts its homes by (lights.ts countyAreaGains). Measured from
     * the listings themselves, so it is worth being able to read. */
    areaGains: Partial<Record<CountySlugName, number>>;
  };
  dispose(): void;
}

const copyF = (f: Framing): Framing => ({ pos: [...f.pos] as Vec3, target: [...f.target] as Vec3, fov: f.fov, moon: [f.moon[0], f.moon[1]] });
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

const isPhone = () => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700;

/** THE DUST GOES TO THE GPU IN PIECES. A million grains carry 36 bytes each, and three.js uploads
 * a geometry's every attribute in the first frame that draws it: one 43 ms `bufferData` burst
 * (measured, round 55), on top of everything else that frame did. The cloud is held as several
 * Points sharing one material, each this many grains (~5.8 MB), and one is added per frame. The
 * grains are in seed order (dust.ts shuffleBySeed), so a contiguous slice is a uniform sample of
 * the land and the governor's thinning works chunk by chunk exactly as it did on the whole. */
const DUST_CHUNK = 160_000;

/** How far a quiet box is grown before it reaches the shader, in css px: half the widest sprite
 * the lights are allowed to draw, so a lamp centred just outside a box cannot paint into it. */
const QUIET_PAD_PX = 18;

export async function createNightScene(opts: NightSceneOptions): Promise<NightSceneHandle> {
  const { canvas } = opts;
  const reduce = !!opts.reducedMotion;
  const hover = !!opts.hover;
  const phone = isPhone();
  const look: Look = { ...DEFAULT_LOOK, ...opts.look };

  performance.mark("night:start");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance", stencil: false });
  renderer.setClearColor(0x000000, 1);
  renderer.sortObjects = false;
  const gl = renderer.getContext();
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "unknown";
  const dprCap = phone ? 2 : 1.5;
  let qualityScale = 1; // adaptive quality (govern, below)
  let qualityDensity = 1;
  let qualityLevel = 0;
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
    uQuietA: { value: new THREE.Vector4(0, 0, 0, 0) },
    uQuietB: { value: new THREE.Vector4(0, 0, 0, 0) },
    uQuietC: { value: new THREE.Vector4(0, 0, 0, 0) },
    uQuietD: { value: new THREE.Vector4(0, 0, 0, 0) },
    // How far the quiet eases back to the open scene, in NDC: across, and DOWN. The vertical
    // number is the one that matters — a short ramp above a 1,100 px quote draws a line across the
    // page (round 54, builder 3), so it runs a quarter of the window's height and the horizontal
    // ramp is shorter, where a page's own column edge is expected anyway.
    uQuietSoft: { value: new THREE.Vector2(0.3, 0.56) },
  };
  // Each cloud decides how dark its own quiet goes, and the three are far apart on purpose: under
  // a sentence the LAND stays (a contour behind a letter is paper, and the page keeps its ground)
  // while the WINDOWS step aside almost entirely.
  //
  // The lights' number looks brutal and is not. They are drawn additively with no tone mapping
  // above 1, so a borough's core is many times over white before it is clamped: measured behind
  // the areas index, a pixel that reads as white there is carrying about fourteen times the
  // brightness the screen can show. Multiplying it by a twentieth still leaves it bright enough to
  // read a 14 px number against, which is exactly what the first pass got wrong (round 54, builder
  // 3: "369 homes" at 1.7:1 with the quiet already on). A hundredth puts it away.
  const quietFloor = { dust: { value: 0.1 }, light: { value: 0.012 }, haze: { value: 0.02 } };
  const dustU = {
    ...shared,
    uIntro: { value: 0 },
    uLodK: { value: 1e4 },
    uAlpha: { value: look.dustAlpha },
    uSize: { value: phone ? look.dustSizePhone : look.dustSize },
    uShadeGamma: { value: look.shadeGamma },
    uShadeFlat: { value: look.shadeFlat },
    uRidge: { value: look.ridge },
    uAmbient: { value: look.ambient },
    uGlint: { value: look.glint },
    uMaxPx: { value: phone ? Math.min(look.dustMaxPx, 16) : look.dustMaxPx },
    uMinPx: { value: phone ? look.dustMinPxPhone : look.dustMinPx },
    uCore: { value: look.dustCore },
    uSheen: { value: look.dustSheen },
    uKindGain: { value: new THREE.Vector4(look.fillGain, look.contourGain, look.indexGain, look.shoreGain) },
    uKindKeep: { value: new THREE.Vector4(...look.kindKeep) },
    uKindLow: { value: new THREE.Vector4(...look.kindLow) },
    uLowAlt: { value: 0 },
    uContourKm: { value: look.contourInterval / 1000 },
    uCrowd: { value: new THREE.Vector2(look.crowdMinPx, look.crowdFullPx) },
    uFocus: { value: 0 },
    uFocusMix: { value: 0 },
    uAreaLand: { value: look.areaLand },
    uAreaOut: { value: look.areaOut },
    uQuietFloor: quietFloor.dust,
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
    uFocus: dustU.uFocus,
    uFocusMix: dustU.uFocusMix,
    uLowAlt: dustU.uLowAlt,
    uLowGain: { value: look.lowLightGain },
    uLowCity: { value: look.lowCityGain },
    uAreaGain: { value: 1 },
    uLampVary: { value: look.lampVary },
    uQuietFloor: quietFloor.light,
  };
  const hazeU = {
    ...shared,
    uIntro: lightU.uIntro,
    uHaze: { value: look.haze },
    uHazeSize: { value: look.hazeSize },
    uHazeLow: { value: 7 },
    uHazeHigh: { value: 26 },
    uFocusMix: dustU.uFocusMix,
    uQuietFloor: quietFloor.haze,
  };
  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendEquation: THREE.AddEquation,
  } as const;
  // The streets share every uniform OBJECT with the homes (intro, veil, quiet, focus, lantern) and
  // own only their lamp: size, alpha, spread, and no twinkle or close-in range stretch.
  const streetU = {
    ...lightU,
    uSize: { value: look.streetSize },
    uAlpha: { value: look.streetAlpha },
    uSpread: { value: look.streetSpread },
    uTwinkle: { value: 0 },
    uLowGain: { value: look.streetLowGain },
    uLowCity: { value: look.streetLowCity },
  };
  const dustMat = new THREE.ShaderMaterial({ uniforms: dustU, vertexShader: DUST_VERTEX, fragmentShader: DUST_FRAGMENT, depthTest: look.occlude, ...additive });
  const lightMat = new THREE.ShaderMaterial({ uniforms: lightU, vertexShader: LIGHT_VERTEX, fragmentShader: LIGHT_FRAGMENT, depthTest: look.occlude, ...additive });
  const streetMat = new THREE.ShaderMaterial({ uniforms: streetU, vertexShader: LIGHT_VERTEX, fragmentShader: LIGHT_FRAGMENT, depthTest: look.occlude, ...additive });
  const hazeMat = new THREE.ShaderMaterial({ uniforms: hazeU, vertexShader: HAZE_VERTEX, fragmentShader: HAZE_FRAGMENT, depthTest: look.occlude, ...additive });
  const depthMat = new THREE.ShaderMaterial({
    uniforms: { uExag: shared.uExag, uSink: { value: 0.04 } },
    vertexShader: DEPTH_VERTEX,
    fragmentShader: DEPTH_FRAGMENT,
    colorWrite: false,
    depthWrite: true,
  });

  // ---- the programs, compiled before there is anything to draw ---------------------------------
  // The first render with a material LINKS its program, and three.js blocks on that link
  // (`getUniforms -> getProgramParameter(LINK_STATUS)`). Measured in the owner's Chrome on the
  // real GPU (round 55): one 199 to 227 ms frame the moment the clouds arrived, mid-intro, the
  // stutter he saw "right after the page loads". So the four programs are compiled NOW, against
  // one-vertex stand-in geometries in a scene of their own, through `compileAsync`, which links
  // on the GPU process's own threads (KHR_parallel_shader_compile) and polls instead of blocking.
  // The clouds wait for it before they are added (the worker takes longer to build them than the
  // link takes, so in practice they never wait), and the poster covers the whole time. A browser
  // without the extension resolves at once and stalls on first use exactly as before.
  const programsReady = (async () => {
    const warm = new THREE.Scene();
    const stub = () => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
      return g;
    };
    const objects = [new THREE.Points(stub(), dustMat), new THREE.Points(stub(), lightMat), new THREE.Points(stub(), streetMat), new THREE.Points(stub(), hazeMat), new THREE.Mesh(stub(), depthMat)];
    for (const o of objects) warm.add(o);
    try {
      // A driver that never reports the link complete must not hold the clouds forever.
      await Promise.race([renderer.compileAsync(warm, camera), new Promise((r) => setTimeout(r, 3000))]);
      // ...and the uniform and attribute locations are fetched now as well. three does that on a
      // program's first use, one synchronous GL query per uniform (measured: ~14 ms for the four
      // programs), which would otherwise land in the first frame that draws the clouds.
      for (const m of [dustMat, lightMat, streetMat, hazeMat, depthMat]) {
        (renderer.properties.get(m) as { currentProgram?: { getUniforms(): unknown } } | undefined)?.currentProgram?.getUniforms();
      }
    } catch {
      // A lost context: the first render links, as it always did.
    }
    for (const o of objects) o.geometry.dispose();
    performance.mark("night:programs");
  })();

  // ---- state ---------------------------------------------------------------------------------
  let grid: ElevationGrid | null = null;
  let towns: TownMark[] = [];
  let townWorld: Float32Array = new Float32Array(0);
  /** The dust, as DUST_CHUNK-sized Points (see the constant), all sharing dustMat. */
  let dustChunks: THREE.Points[] = [];
  /** The whole cloud's positions, and 1 + county per grain: every chunk's aCounty attribute is a
   * view into the latter, so painting it once paints them all. */
  let dustPositions: Float32Array = new Float32Array(0);
  let dustCounty: Float32Array = new Float32Array(0);
  let dustBuild = 0;
  let lightPoints: THREE.Points | null = null;
  let hazePoints: THREE.Points | null = null;
  let streetPoints: THREE.Points | null = null;
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
  let counties: CountyRaster | null = null;
  /** Each grain learns its county from the homes around it (for the area focus): from the array
   * the worker painted when there is one, otherwise painted here (no worker, or a rebuild). */
  function paintDustCounties(painted?: Float32Array | null) {
    if (!dustCounty.length) return;
    if (painted && painted.length === dustCounty.length) dustCounty.set(painted);
    else if (counties) paintCounties(dustPositions, dustCounty.length, counties, dustCounty);
    else return;
    for (const c of dustChunks) (c.geometry.getAttribute("aCounty") as THREE.BufferAttribute).needsUpdate = true;
  }
  let buildMs = 0;

  // The area shots are re-framed on the homes themselves once the lights have loaded (a county's
  // bounding box holds mountains where nothing is for sale); until then they stand on the box.
  const areaFrames: Partial<Record<ShotName, Shot>> = {};
  const shotOf = (n: ShotName): Shot => areaFrames[n] ?? SHOTS[n];

  let aspect = 1;
  let goal: Framing = framingFor(shotOf(opts.initialShot ?? "hero"), aspect);
  let goalName: ShotName | null = opts.initialShot ?? "hero";
  let cur: Framing = copyF(goal);
  let flight: { from: Framing; to: ShotName; t0: number; ms: number; done: () => void } | null = null;
  let veilGoal = 0;
  let focusGoal = 0;
  let focusNext = 0;
  let areaGains: Partial<Record<CountySlugName, number>> = {};
  let areaNext = 1;
  let pointer: { x: number; y: number } | null = null;
  const par = { x: 0, y: 0 }; // damped parallax, -1..1
  let hovered: TownHover | null = null;
  // The idle drift (and the twinkle) run only where there is a mouse: a phone gets the intro, the
  // flights its page asks for, and otherwise a still frame, so nothing runs on its battery at rest.
  const drift = opts.drift ?? (!reduce && hover);

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
    dpr = Math.min(window.devicePixelRatio || 1, dprCap) * qualityScale;
    renderer.setPixelRatio(dpr);
    renderer.setSize(cssW, cssH, false);
    aspect = cssW / cssH;
    shared.uPixelRatio.value = dpr;
    shared.uAspect.value = aspect;
    if (goalName && !flight) goal = framingFor(shotOf(goalName), aspect);
    // Before the first frame the camera simply stands at its shot (no approach from a guess).
    if (frames === 0) cur = copyF(goal);
    kick();
  }

  // ---- building the clouds -----------------------------------------------------------------------
  let pixels: { rgba: Uint8ClampedArray; meta: ElevationMeta } | null = null;
  async function buildTerrain() {
    try {
      pixels = await loadElevationPixels(opts.elevationBase);
      performance.mark("night:pixels");
      grid = decodeElevation(pixels.rgba, pixels.meta, 4);
      performance.mark("night:grid");
    } catch {
      grid = null; // no terrain: the lights still stand, on a flat sea level
      return;
    }
    if (disposed) return;
    // The land's area, for the level-of-detail uniform.
    let land = 0;
    for (let i = 0; i < grid.water.length; i++) if (!grid.water[i]) land++;
    landKm2 = (land * grid.cellM.x * grid.cellM.y) / 1e6;
    await buildDustCloud();
    dustStart = performance.now();
  }

  let builtKey = "";
  let buildWhere = "";
  const dustKey = () => [look.reliefBias, look.dustMode, look.contourInterval, look.contourSpacing, look.contourSmooth].join("|");
  const terrainParams = (): TerrainParams => ({
    budget: opts.dustCount ?? (phone ? 400_000 : 1_000_000),
    dustMode: look.dustMode,
    contourInterval: look.contourInterval,
    contourSpacing: look.contourSpacing,
    contourSmooth: look.contourSmooth,
    reliefBias: look.reliefBias,
    meshStride: phone ? 2 : 1,
  });

  // ---- the worker --------------------------------------------------------------------------------
  // One worker for the boot (the terrain, then the lights), released once both are in; a rebuild
  // from the lab starts another. Replies come back in request order. `null` means do not try
  // again: after any failure the rest is built here, because the lights must stand on the terrain
  // the page actually drew, and after an error the worker holds no terrain at all.
  let link: { w: Worker; waiting: ((r: BuildReply | null) => void)[] } | null | undefined;
  function ask(msg: BuildRequest, transfer: Transferable[] = []): Promise<BuildReply | null> {
    if (link === undefined) {
      try {
        const l = { w: new Worker(new URL("./build.worker.ts", import.meta.url)), waiting: [] as ((r: BuildReply | null) => void)[] };
        l.w.onmessage = (e: MessageEvent<BuildReply>) => l.waiting.shift()?.(e.data);
        l.w.onerror = () => dropLink();
        link = l;
      } catch {
        link = null;
      }
    }
    if (!link) return Promise.resolve(null);
    const l = link;
    return new Promise((resolve) => {
      l.waiting.push((r) => {
        if (!r || "error" in r) {
          dropLink();
          resolve(null);
        } else resolve(r);
      });
      l.w.postMessage(msg, transfer);
    });
  }
  function dropLink() {
    const l = link;
    link = null;
    if (!l) return;
    l.w.terminate();
    for (const r of l.waiting.splice(0)) r(null);
  }
  function releaseLink() {
    link?.w.terminate();
    link = undefined;
  }

  type Built = { dust: DustCloud; mesh: { positions: Float32Array; index: Uint32Array }; ms: number; where: string };
  /** The build runs in the worker; if none can start (or it fails), on the main thread. */
  async function runBuild(params: TerrainParams): Promise<Built> {
    // A copy goes to the worker; the page keeps its own for the next rebuild.
    const rgba = pixels!.rgba.slice();
    const r = await ask({ kind: "terrain", rgba, meta: pixels!.meta, params }, [rgba.buffer]);
    if (r && r.kind === "terrain" && !("error" in r)) {
      return {
        dust: { count: r.count, positions: r.positions, slopes: r.slopes, ridges: r.ridges, seeds: r.seeds, kinds: r.kinds },
        mesh: { positions: r.meshPositions, index: r.meshIndex },
        ms: r.ms,
        where: "worker",
      };
    }
    const t0 = performance.now();
    const { dust, mesh } = buildTerrainClouds(grid!, params);
    return { dust, mesh, ms: performance.now() - t0, where: "main thread" };
  }

  async function buildDustCloud() {
    if (!grid || !pixels) return;
    const key = dustKey();
    const build = ++dustBuild;
    const built = await runBuild(terrainParams());
    if (ready) releaseLink(); // a rebuild after the boot: nothing else is coming
    await programsReady; // never add a cloud its program cannot draw without a stall
    if (disposed || build !== dustBuild) return; // a newer look asked for another build
    buildMs = built.ms;
    buildWhere = built.where;
    builtKey = key;
    const { dust, mesh } = built;
    for (const c of dustChunks) {
      scene.remove(c);
      c.geometry.dispose();
    }
    dustChunks = [];
    dustPositions = dust.positions;
    dustCounty = new Float32Array(dust.count);
    dustCount = dust.count;
    // A rebuild after the lights: the counties are known, so they are painted before the upload.
    if (counties) paintCounties(dustPositions, dust.count, counties, dustCounty);
    if (!depthMesh) {
      const mg = new THREE.BufferGeometry();
      mg.setAttribute("position", new THREE.BufferAttribute(mesh.positions, 3));
      mg.setIndex(new THREE.BufferAttribute(mesh.index, 1));
      depthMesh = new THREE.Mesh(mg, depthMat);
      depthMesh.frustumCulled = false;
      depthMesh.renderOrder = 0;
      depthMesh.visible = look.occlude;
      scene.add(depthMesh);
    }
    const chunks: THREE.Points[] = [];
    for (let s = 0; s < dust.count; s += DUST_CHUNK) {
      const e = Math.min(dust.count, s + DUST_CHUNK);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(dust.positions.subarray(s * 3, e * 3), 3));
      g.setAttribute("aSlope", new THREE.BufferAttribute(dust.slopes.subarray(s * 2, e * 2), 2));
      g.setAttribute("aRidge", new THREE.BufferAttribute(dust.ridges.subarray(s, e), 1));
      g.setAttribute("aSeed", new THREE.BufferAttribute(dust.seeds.subarray(s, e), 1));
      g.setAttribute("aKind", new THREE.BufferAttribute(dust.kinds.subarray(s, e), 1));
      g.setAttribute("aCounty", new THREE.BufferAttribute(dustCounty.subarray(s, e), 1));
      g.setDrawRange(0, Math.floor((e - s) * qualityDensity));
      const p = new THREE.Points(g, dustMat);
      p.frustumCulled = false;
      p.renderOrder = 1;
      chunks.push(p);
    }
    // The first piece now, so the land is there and the intro can begin; the rest one per frame
    // behind it (DUST_CHUNK), while the worker goes on to the lights.
    const add = (c: THREE.Points) => {
      scene.add(c);
      dustChunks.push(c);
      kick();
    };
    add(chunks[0]);
    void (async () => {
      for (const c of chunks.slice(1)) {
        await nextFrame();
        if (disposed || build !== dustBuild) {
          for (const rest of chunks) if (!dustChunks.includes(rest)) rest.geometry.dispose();
          return;
        }
        add(c);
      }
    })();
  }

  async function buildLightCloud() {
    const pts = await loadLights();
    if (!pts || disposed) return;
    performance.mark("night:lights-data");
    await programsReady; // (the lights can be the first thing drawn when the terrain failed)
    if (disposed) return;
    // Everything the lights need comes back from the worker in one bundle (lights.ts
    // buildLightBundle), or is built here when there is no worker to ask.
    const areaGain = { pow: look.areaGainPow, max: look.areaGainMax };
    const r = await ask({ kind: "lights", pts, areaGain });
    if (disposed) return;
    const b = r && r.kind === "lights" && !("error" in r) ? r.bundle : buildLightBundle(pts, grid, dustCount ? { positions: dustPositions, count: dustCount } : null, areaGain);
    const { cloud, haze } = b;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cloud.positions, 3));
    g.setAttribute("aDelay", new THREE.BufferAttribute(cloud.delays, 1));
    g.setAttribute("aGain", new THREE.BufferAttribute(cloud.gains, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(cloud.seeds, 1));
    g.setAttribute("aCounty", new THREE.BufferAttribute(cloud.counties, 1));
    lightPoints = new THREE.Points(g, lightMat);
    lightPoints.frustumCulled = false;
    lightPoints.renderOrder = 3;
    scene.add(lightPoints);
    const hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.BufferAttribute(haze.positions, 3));
    hg.setAttribute("aStrength", new THREE.BufferAttribute(haze.strengths, 1));
    hazePoints = new THREE.Points(hg, hazeMat);
    hazePoints.frustumCulled = false;
    hazePoints.renderOrder = 2;
    scene.add(hazePoints);
    if (b.streets.count) {
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.BufferAttribute(b.streets.positions, 3));
      sg.setAttribute("aDelay", new THREE.BufferAttribute(b.streets.delays, 1));
      sg.setAttribute("aGain", new THREE.BufferAttribute(b.streets.gains, 1));
      sg.setAttribute("aSeed", new THREE.BufferAttribute(b.streets.seeds, 1));
      sg.setAttribute("aCounty", new THREE.BufferAttribute(b.streets.counties, 1));
      streetPoints = new THREE.Points(sg, streetMat);
      streetPoints.frustumCulled = false;
      streetPoints.renderOrder = 3;
      scene.add(streetPoints);
    }
    counties = b.raster;
    paintDustCounties(b.dustCounties);
    // Re-frame the area chapter on the homes themselves, now that we know where they stand, and
    // take how hard each county's homes have to burn to carry a frame of that size.
    areaGains = b.areaGains;
    for (const a of AREA_FLIGHT) {
      const box = b.boxes[AREA_COUNTY_OF[a]];
      if (box) areaFrames[a] = areaShot(box);
    }
    if (goalName && areaFrames[goalName]) {
      goal = framingFor(shotOf(goalName), aspect);
      if (frames === 0 || reduce) cur = copyF(goal);
    }
    towns = b.towns;
    townWorld = b.townWorld;
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
    // How CLOSE this shot stands to its subject, 1 (a county, a chapter) to 0 (the establishing
    // shots). The land's contours fall back as it rises and the lights come forward: the hero's
    // balance, held at every altitude.
    const lowT = (dist - look.lowNearKm) / Math.max(1e-3, look.lowFarKm - look.lowNearKm);
    const lowE = lowT <= 0 ? 0 : lowT >= 1 ? 1 : lowT * lowT * (3 - 2 * lowT);
    // The area chapter is always a CLOSE shot by intent, however high the camera has to stand to
    // hold a county: there the land is the paper and the county's homes are the whole picture.
    dustU.uLowAlt.value = Math.max(1 - lowE, dustU.uFocusMix.value);
    const rho = dustCount / Math.max(1, landKm2);
    // Grains per CSS pixel, not per device pixel: a grain's smallest size is a fixed number of CSS
    // pixels, so counting device pixels put four times the grains (and four times the light) into
    // the same patch of a 2x phone screen as a desktop's (looked at: the phone frames read white).
    const focalCss = focal / dpr;
    dustU.uLodK.value = (look.dustDensity * focalCss * focalCss) / Math.max(1e-3, rho);
  }

  const approach = (a: number, b: number, k: number) => a + (b - a) * k;
  function step(now: number, dt: number): boolean {
    let moving = false;
    if (flight) {
      const t = Math.min(1, (now - flight.t0) / flight.ms);
      goal = blendFramings(flight.from, framingFor(shotOf(flight.to), aspect), t, grid ? ground : undefined);
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
    // Area focus: ease out, swap the county when it is dimmest, ease back in.
    if (lightU.uFocus.value !== focusNext && focusNext && lightU.uFocusMix.value > 0.02) {
      lightU.uFocusMix.value = approach(lightU.uFocusMix.value, 0, 1 - Math.exp(-dt / 0.12));
      moving = true;
    } else {
      if (focusNext) {
        lightU.uFocus.value = focusNext;
        // The county's own lift changes at the same instant its identity does, which is the
        // dimmest moment of the ease, so no frame shows one county lit at another's gain.
        lightU.uAreaGain.value = areaNext;
      }
      const kf = 1 - Math.exp(-dt / 0.3);
      lightU.uFocusMix.value = approach(lightU.uFocusMix.value, focusGoal, kf);
      if (Math.abs(lightU.uFocusMix.value - focusGoal) > 0.003) moving = true;
      else lightU.uFocusMix.value = focusGoal;
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

  // ---- adaptive quality ------------------------------------------------------------------------
  // Measured, not assumed: once the scene is ready, while frames run back to back (a flight, the
  // drift), if the median of 30 is slower than ~40 fps, render fewer pixels (x0.8) and fewer grains
  // (x0.65), one step at a time, at most three.
  // (Measured: a desktop GPU and a 4x-throttled phone hold vsync; software GL does not.)
  const samples: number[] = [];
  function govern(dtMs: number, chained: boolean) {
    if (!chained || !ready || qualityLevel >= 3) return;
    samples.push(dtMs);
    if (samples.length < 30) return;
    const med = [...samples].sort((a, b) => a - b)[15];
    samples.length = 0;
    if (med <= 25) return;
    qualityLevel++;
    qualityScale *= 0.8;
    qualityDensity *= 0.65;
    // The grains are in seed order (dust.ts shuffleBySeed), so a shorter draw range is a uniform
    // thinning, and it saves the vertex work too.
    for (const c of dustChunks) c.geometry.setDrawRange(0, Math.floor(c.geometry.getAttribute("position").count * qualityDensity));
    resize();
  }

  // ---- loop ------------------------------------------------------------------------------------
  let visible = true;
  let chained = false; // this frame follows the previous one directly (not the first after a pause)
  let restFrame = false; // nothing but the drift and the twinkle moved last frame
  let skipToggle = false;
  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    // At rest on a desktop only the drift and the twinkle move, both far slower than a frame: they
    // are drawn at half rate (the loop stays alive, every other frame is skipped).
    if (restFrame && chained && (skipToggle = !skipToggle)) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(0.1, (now - last) / 1000);
    govern(now - last, chained && !restFrame);
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
    restFrame = !moving && !introRunning && !pointer;
    chained = alive && visible && !document.hidden;
    if (chained) raf = requestAnimationFrame(frame);
  }
  function kick() {
    restFrame = false; // something asked for a frame: the next one is drawn
    if (!raf && !disposed && visible && !document.hidden) {
      last = performance.now();
      chained = false;
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
  performance.mark("night:terrain");
  await buildLightCloud();
  performance.mark("night:lights");
  releaseLink();
  ready = true;
  opts.onReady?.();
  kick();

  function setShot(name: ShotName, o?: { immediate?: boolean }) {
    flight?.done();
    flight = null;
    goalName = name;
    goal = framingFor(shotOf(name), aspect);
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
      const frames = names.map((n) => framingFor(shotOf(n), aspect));
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
    setQuiet(rects) {
      // GROWN BY A SPRITE'S RADIUS. The quiet is decided per point, at the point's own position,
      // but a near lamp is drawn as a disc up to ~34 px across: a window whose CENTRE is just
      // outside the box still paints into it, which is how "369 homes" ended up with a lamp
      // through it at the right edge of the areas index (round 54, builder 3, measured at 1.7:1).
      // Growing the box by that radius puts those centres inside the quiet as well.
      const pad = QUIET_PAD_PX;
      const toNdc = (r: { left: number; top: number; right: number; bottom: number }, v: THREE.Vector4) =>
        v.set(((r.left - pad) / cssW) * 2 - 1, 1 - ((r.bottom + pad) / cssH) * 2, ((r.right + pad) / cssW) * 2 - 1, 1 - ((r.top - pad) / cssH) * 2);
      const slots = [shared.uQuietA, shared.uQuietB, shared.uQuietC, shared.uQuietD];
      slots.forEach((slot, i) => {
        if (rects[i]) toNdc(rects[i], slot.value);
        else slot.value.set(0, 0, 0, 0);
      });
      kick();
    },
    setFocus(county) {
      const idx = county ? COUNTY_SLUGS.indexOf(county) + 1 : 0;
      if (idx && county) {
        // A new county while one is lit: the switch happens at the dimmest moment of the ease.
        focusNext = idx;
        focusGoal = 1;
        areaNext = areaGains[county] ?? 1;
        if (!lightU.uFocus.value || reduce) {
          lightU.uFocus.value = idx;
          lightU.uAreaGain.value = areaNext;
        }
      } else focusGoal = 0;
      if (reduce) lightU.uFocusMix.value = focusGoal;
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
    // 850 ms for the dust to settle before the lights begin (buildLightCloud), then the wave from
    // the harbour to the north edge plus each window's own moment (lights.ts buildLights).
    introEndsAt: () => (reduce || opts.skipIntro ? performance.now() : lightsStart < 0 ? 0 : lightsStart + 2600),
    setLook(l) {
      Object.assign(look, l);
      dustU.uAlpha.value = look.dustAlpha;
      dustU.uAmbient.value = look.ambient;
      dustU.uGlint.value = look.glint;
      dustU.uSize.value = phone ? look.dustSizePhone : look.dustSize;
      dustU.uShadeGamma.value = look.shadeGamma;
      dustU.uShadeFlat.value = look.shadeFlat;
      dustU.uRidge.value = look.ridge;
      dustU.uMaxPx.value = phone ? Math.min(look.dustMaxPx, 16) : look.dustMaxPx;
      dustU.uMinPx.value = phone ? look.dustMinPxPhone : look.dustMinPx;
      dustU.uCore.value = look.dustCore;
      dustU.uSheen.value = look.dustSheen;
      shared.uExag.value = look.exaggeration;
      dustU.uKindGain.value.set(look.fillGain, look.contourGain, look.indexGain, look.shoreGain);
      dustU.uKindKeep.value.set(...look.kindKeep);
      dustU.uKindLow.value.set(...look.kindLow);
      dustU.uContourKm.value = look.contourInterval / 1000;
      dustU.uCrowd.value.set(look.crowdMinPx, look.crowdFullPx);
      lightU.uLowGain.value = look.lowLightGain;
      lightU.uLowCity.value = look.lowCityGain;
      if (grid && dustKey() !== builtKey) void buildDustCloud();
      lightU.uAlpha.value = look.lightAlpha;
      lightU.uSize.value = look.lightSize;
      lightU.uLampVary.value = look.lampVary;
      dustU.uAreaLand.value = look.areaLand;
      dustU.uAreaOut.value = look.areaOut;
      lightU.uHalo.value = look.lightHalo;
      lightU.uSpread.value = look.lightSpread;
      streetU.uSize.value = look.streetSize;
      streetU.uAlpha.value = look.streetAlpha;
      streetU.uSpread.value = look.streetSpread;
      streetU.uLowGain.value = look.streetLowGain;
      streetU.uLowCity.value = look.streetLowCity;
      hazeU.uHaze.value = look.haze;
      hazeU.uHazeSize.value = look.hazeSize;
      dustMat.depthTest = look.occlude;
      lightMat.depthTest = look.occlude;
      streetMat.depthTest = look.occlude;
      hazeMat.depthTest = look.occlude;
      if (depthMesh) depthMesh.visible = look.occlude;
      kick();
    },
    stats: () => ({
      quality: qualityLevel,
      dpr,
      buildMs,
      buildWhere,
      dust: dustCount,
      lights: lightPoints ? (lightPoints.geometry.getAttribute("position").count as number) : 0,
      streets: streetPoints ? (streetPoints.geometry.getAttribute("position").count as number) : 0,
      haze: hazePoints ? (hazePoints.geometry.getAttribute("position").count as number) : 0,
      towns: towns.length,
      frames,
      ready,
      gpu,
      areaGains,
    }),
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      flight?.done();
      dropLink();
      for (const o of [...dustChunks, lightPoints, streetPoints, hazePoints, depthMesh]) o?.geometry.dispose();
      dustMat.dispose();
      lightMat.dispose();
      streetMat.dispose();
      hazeMat.dispose();
      depthMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
