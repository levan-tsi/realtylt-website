"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loadLights } from "@/lib/idx/lights-client";
import { listingPath } from "@/lib/idx/listing-url";
import type { MapPin } from "@/lib/idx/types";
import { shotPosition, shotStops, withTail, type ShotSection, type ShotStop } from "../night/driver";
import { loadElevation } from "../night/elevation";
import { townSearchHref } from "../night/lights";
import { AREA_COUNTY_OF, type AreaShot, type ShotName } from "../night/shots";
import { boxUVToLngLat } from "../night/world";
import { G3dController, type FeaturedHome, type Homes } from "./controller";
import { placeKeys } from "./light-plan";
import { nearestLight } from "./thinning";
import { TERRITORY_LABELS, googleBoxes, labelItems, placeLabels, type Box } from "./labels";
import { TOWN_LABELS, townsOf } from "./towns";
import { focusOf, isNarrow } from "./cameras";
import { warmPlan } from "./warm-plan";
import type { MapCamera } from "./camera";
import { mapIdFrom, modeChoice, type ModeChoice } from "./map-options";
import { camOverrides, durOverrides } from "./lab-query";
import { featuredGlyph } from "./glyph";
import { nightGrade, type NightGrade } from "./night";
import { applyClaims, claims, type LightsState, type MapState } from "./claims";
import { cameraShowing, clickAction, labelContent, namesOverlap, openPoint, placeHoverLabel, tapNext, type LabelContent, type Rect, type TapState } from "./interaction";

/** The map's mode by default (map-options.ts). Round 57.2 chose `split` by frames (HYBRID at the
 * territory shot for Google's town names, SATELLITE below where HYBRID's coloured POI pins, route
 * shields and street names cluttered the chapters). The orchestrator's polish round (57.7) moved the
 * territory shot to SATELLITE too, by frames on the NIGHT grade (scripts/_scratch-r57/verify6/sat/
 * hero-1440.png against verify6/hero-1440.png): on the dark map Google's red and blue interstate
 * shields were the loudest thing in the frame, and since round 1 our own county and borough names
 * orient a stranger at that altitude, so Google's names are not needed there either. The photograph
 * at night, our lights and our names: one language at every stop. `?mode=hybrid|satellite|split`
 * compares. */
const MODE: ModeChoice = "satellite";

/** THE REAL MAP AS THE PAGE'S GROUND (round 56's /lab/g3d prototype; the home page's ground since
 * round 57, app/page.tsx and lib/home-map.ts).
 *
 * The owner, on round 55's valley: "find that Google Maps 3D API ... that we can get just that
 * area for our map and then add our dots ... interactive when the mouse is there, and smooth
 * transitions, and when we zoom out to the city it should show the area". So the ground is
 * Google's photorealistic 3D map in HYBRID mode (imagery, terrain, buildings, place names), fixed
 * behind the page the way the night flight's canvas is, and our homes for sale are lights on it.
 *
 *  - Every section says which shot it holds (`data-shot`), exactly as on the home page; the pure
 *    driver (../night/driver.ts, unchanged) turns the scroll position into the stop the page is
 *    on, and a change of stop is ONE `flyCameraTo` (1.6 to 2.6 s, Google's easing). The camera is
 *    never written per frame: the page scrolls as it always has and the map flies on its own.
 *  - The map takes no pointer events (its container is `pointer-events: none`), so it can never
 *    eat a wheel or a drag; `gestureHandling` is COOPERATIVE anyway.
 *  - Hover is ours: the homes drawn are projected with our own camera maths once the map lands,
 *    and the pointer is hit-tested against them (the API has no hover event and no screen
 *    position for a marker). A home under the pointer brightens and names its price and town;
 *    a click opens it.
 *  - Two looks to choose from (`?look=scrim` or `?look=veil`): the map at full brightness with a
 *    soft dark scrim under each block of words (the `data-quiet` boxes), or the whole map dimmed.
 *    Google's logo, bottom left, is never under either (a masked hole), by policy.
 *
 * The "where we work" list reads `useG3dArea()` to fly county by county on hover, focus or tap,
 * the same contract as the night flight's `useAreaChapter()`. */

interface AreaValue {
  current: AreaShot | null;
  point: (area: AreaShot | null) => void;
}
const AreaContext = createContext<AreaValue>({ current: null, point: () => {} });
export const useG3dArea = () => useContext(AreaContext);

const isArea = (n: ShotName): n is AreaShot => n in AREA_COUNTY_OF;

export type Look = "scrim" | "veil";

export interface G3dTail {
  shot: ShotName;
  /** How dark the map goes behind the site footer (round 57: the footer is transparent on the home
   * page, FooterShell.tsx, so the last shot fades out under its words instead of being cut). */
  veil?: number;
  veilPhone?: number;
}

/** Our names for the territory (labels.ts), drawn over the hero shot only. */
const LABEL_SHADOW = "0 0 1px rgba(0,0,0,1), 0 0 3px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.8)";
/** THE TOWN NAMES' OWN SHADE (round 57.5, defect A5). Measured on the real pixels at the eleven
 * chapters (scripts/_scratch-r57e-towns.mjs, halo kept): with the halo alone 20 of 25 names were
 * under 4.5:1 at p99 (Jamaica, Williamsburg, Carmel, Goshen down to 1.5:1: a white name over the
 * city's lights). A soft dark ellipse behind each name, solid to half its reach and gone at the
 * edge, the scrims' language at a name's size: 0 of 25 under 4.5:1 (lowest 4.59). The padding
 * carries the ellipse past the letters; the placement (towns.ts, labels.ts) reads the padded box, so
 * the name stays centred on its place and the shade keeps clear of the page's words too. */
const TOWN_SHADE = {
  background: "radial-gradient(closest-side, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
  padding: "8px 16px",
} as const;
/** Google's logo and legal link, bottom left: no name of ours goes there. */
const LOGO_CORNER = { w: 180, h: 54 };

/** The hole the looks leave for Google's logo and legal link, bottom left (policy: visible and
 * unobscured). Measured on the frames: the logo runs x 12..116, the (i) to x 150, y within 36 px
 * of the bottom. */
const LOGO_HOLE = "radial-gradient(210px 64px at 84px 100%, transparent 0, transparent 62%, #000 100%)";

/** THE PHONE'S FOOT (round 57.5, defect A7). The shade under the hero's search ran to 0.86 at the
 * window's foot and LOGO_HOLE left a patch of the ocean around Google's logo, which read as a blue-grey
 * glow in the corner (DESIGN-ROUND57.md §4, round 5). Tried live on the build, frames in
 * scripts/_scratch-r57/5/foot/ (a hole hugging the logo read as a blue box; the ellipse as a glow):
 * the shade now eases back to 0.15 below the links, so the whole foot of the frame shows the sea
 * faintly, and a wider, softer hole leaves the logo on that same sea. The links keep their shade
 * (0.86 from 66% to 72% of the band). */
const FOOT_SHADE = "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.86) 66%, rgba(0,0,0,0.86) 72%, rgba(0,0,0,0.15) 100%)";
const FOOT_HOLE_IMAGE = "radial-gradient(300px 92px at 84px 100%, transparent 0, transparent 42%, #000 100%)";
const FOOT_HOLE = { WebkitMaskImage: FOOT_HOLE_IMAGE, maskImage: FOOT_HOLE_IMAGE } as const;

/** THE SCRIMS (round 56 phase 1b): up to SCRIMS blocks of words at once, each shaded SCRIM_PAD px
 * past its box and fading to nothing over the next SCRIM_FEATHER px, so no edge reads as a
 * rectangle. Six, not four: at the Dutchess stop the hero's two blocks are still on screen with the
 * intake's, and "Start here" fell off the end of four (2.8:1 at p99). */
const SCRIMS = 6;
/** Round 57.2 (the owner's "the map is the picture"; round 57.1's frames showed the hero's scrim as
 * a dark column over New Jersey): less solid shade and a much longer fade, so a scrim reads as a
 * shadow the words cast, not a panel. Tuned on the real pixels with the contrast kit (0 texts under
 * 4.5:1 outside the logo corner at 1440 and 390); `?pad=` and `?feather=` are the tuning switches. */
const SCRIM_PAD = 20;
const SCRIM_FEATHER = 150;
/** A block marked `data-quiet="soft"` (large, bold words: the hero's headline) casts a lighter
 * shadow, this share of the full one (0.62 until round 57.5). */
const SOFT_SHARE = 0.4;
/** A block marked `data-quiet="lead"` (the hero's count, search and links at lg, whose words carry
 * their own text-shadow) casts this share. Round 57.5 (defect A6): the 1440 hero's shade read as a
 * dark column over New Jersey (mean brightness 21 against the map's 95 on the bare frame). The
 * small grey caption now casts its own full, small shadow (app/page.tsx), so the large block can go
 * lighter, and the headline lighter still; tuned with the contrast kit on the real pixels
 * (scripts/_scratch-r57/5/contrast/): lead 0.6 and headline 0.4 keep every hero text 4.3:1 or more
 * at p99 (large-text floor 3, small 4.5) and take the column to 33; 0.5 and 0.3 (38) left the count
 * at 3.4:1, too thin a margin over a map that changes. */
const LEAD_SHARE = 0.6;
/** An eased ramp (smoothstep through five stops), not a straight one: a linear fade leaves a
 * visible band where it meets the solid shade (seen on the first frames). */
const ramp = (dir: string, f: number) => {
  const e = [0, 0.1, 0.36, 0.72, 1].map((a, k) => `rgba(0,0,0,${a}) ${Math.round((f * k) / 4)}px`);
  const back = [1, 0.72, 0.36, 0.1, 0].map((a, k) => `rgba(0,0,0,${a}) calc(100% - ${Math.round(f - (f * k) / 4)}px)`);
  return `linear-gradient(${dir}, ${e.join(", ")}, ${back.join(", ")})`;
};
const featherMask = (f: number) => `${ramp("to right", f)}, ${ramp("to bottom", f)}`;

/** THE LOGO'S CORNER, CLEAR OF THE WORDS (policy: Google's logo and legal link visible and
 * unobscured). Measured on the frames: the logo runs x 12..116 and the (i) to x 150, within 36 px
 * of the bottom. The words scroll over the fixed map, so on a phone a row of text crossed the
 * corner at most stops. The words' layer is masked there: a soft quarter-ellipse whose solid part
 * holds the whole 180 x 48 px corner, pinned to the bottom left of the WINDOW by a mask position
 * that follows the scroll (`--g3d-hole-y`, set in placeScrims). Words crossing the corner fade out
 * there and come back past it; nothing of ours is ever over the logo. */
const HOLE_W = 320;
const HOLE_H = 88; // solid to 80%: 256 x 70 px, which contains (180, 48)
const HOLE = "radial-gradient(closest-side, #000 0, #000 80%, transparent 100%)"; // centred on the corner
const CLEAR_STYLE = {
  WebkitMaskImage: `${HOLE}, linear-gradient(#000, #000)`,
  maskImage: `${HOLE}, linear-gradient(#000, #000)`,
  WebkitMaskSize: `${HOLE_W * 2}px ${HOLE_H * 2}px, 100% 100%`,
  maskSize: `${HOLE_W * 2}px ${HOLE_H * 2}px, 100% 100%`,
  WebkitMaskPosition: `${-HOLE_W}px var(--g3d-hole-y, -9999px), 0 0`,
  maskPosition: `${-HOLE_W}px var(--g3d-hole-y, -9999px), 0 0`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
} as const;

/** How long the scroll must rest on a new stop before the map flies there: a fling across three
 * sections is one flight, not three. */
const SETTLE_MS = 110;
/** The cover's breath (round 57.10): the added copy's peak opacity and one breath's length, chosen by
 * frames (docs/parity/DESIGN-ROUND57.md §7, round 10). */
const BREATH_PEAK = 0.35;
const BREATH_MS = 4200;

export interface Cover {
  wide: string;
  tall: string;
}

export function G3dGround({
  poster,
  covers,
  tail,
  featured = [],
  children,
}: {
  poster: Cover;
  /** Every cover the page knows, so `?cover=dusk|day` can show the other for comparison. */
  covers?: Record<string, Cover>;
  tail?: G3dTail;
  featured?: readonly FeaturedHome[];
  children: ReactNode;
}) {
  const [cover, setCover] = useState(poster);
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("cover");
    if (c && covers?.[c]) setCover(covers[c]);
  }, [covers]);
  const featuredRef = useRef(featured);
  featuredRef.current = featured;
  const host = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const label = useRef<HTMLAnchorElement>(null);
  const labelTown = useRef<HTMLSpanElement>(null);
  const labelPrice = useRef<HTMLSpanElement>(null);
  const labelFacts = useRef<HTMLSpanElement>(null);
  const labelRow = useRef<HTMLSpanElement>(null);
  const labelAddr = useRef<HTMLSpanElement>(null);
  const labelAddrText = useRef<HTMLSpanElement>(null);
  const scrimEls = useRef<(HTMLDivElement | null)[]>([]);
  const scrimSizes = useRef<string[]>([]);
  const topScrim = useRef<HTMLDivElement>(null);
  /** The scrims (or the veil): they go with the words during a fly-in (round 57.5). */
  const scrimLayer = useRef<HTMLDivElement>(null);
  const footShade = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const holeY = useRef(-1);
  const ctl = useRef<G3dController | null>(null);
  const sections = useRef<ShotSection[]>([]);
  const stops = useRef<ShotStop[]>([]);
  const names = useRef<ShotName[]>([]);
  const override = useRef<AreaShot | null>(null);
  const target = useRef<ShotName | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef(0);
  const tailRef = useRef(tail);
  tailRef.current = tail;
  const [look, setLook] = useState<Look>("scrim");
  const [veil, setVeil] = useState(0.42);
  const [scrim, setScrim] = useState(0.8);
  const [shape, setShape] = useState({ pad: SCRIM_PAD, feather: SCRIM_FEATHER, soft: SOFT_SHARE, lead: LEAD_SHARE });
  const shapeRef = useRef(shape);
  shapeRef.current = shape;
  const lookRef = useRef<Look>("scrim");
  lookRef.current = look;
  const [revealed, setRevealed] = useState(false);
  /** OUR POSTER is the load cover (round 56 phase 1b), our artwork, in the first bytes of HTML,
   * until the map has drawn the page's first shot. A still of Google's map may never be stored or
   * shipped (policy), so the cover is ours. Since round 57.6 it is the night map's own first frame
   * (scripts/make-map-cover.mjs: our land in the night grade, our lights where the live layer draws
   * them), and it lifts only at the reveal, in COVER_MS, a change of nothing but detail. An early
   * scroll no longer lifts it (round 57.5 measured the freeze that followed): with JavaScript the
   * cover is pinned to the window while it holds, the map goes to the visitor's section under it,
   * and it lifts onto that section drawn (warm-plan.ts earlyScroll). It stays for good if the map
   * cannot load (no key, `gmp-error`), so a failure leaves our picture, not a black screen. */
  const [posterGone, setPosterGone] = useState(false);
  /** JavaScript runs: the cover may be pinned to the window (with JS off it is the hero's picture
   * and scrolls away with it). */
  const [pinned, setPinned] = useState(false);
  /** JavaScript has run (the scrims are placed by it; without it the cover shades its own words). */
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
  /** THE COVER BREATHES while it holds (round 57.10): the owner read the still as "maybe it just
   * froze". A copy of the cover added over itself (plus-lighter) at an opacity that swells and
   * falls. The copy carries `contrast(3)`, which sends everything under mid-grey (the land, the
   * water: all of the ground) to black, so only the lights and their glow are added: they swell by
   * up to BREATH_PEAK and the ground does not move (measured over the lit city at 1440: the mean
   * rises 29.7 -> 31.6 levels at the peak; without the filter 38.2, and the sea lifted with it). The
   * compositor animates one opacity (no main-thread work while the map boots); reduced motion: still.
   * It goes with the cover's own dissolve, then stops. */
  const breath = useRef<HTMLDivElement>(null);
  const breathAnim = useRef<Animation | null>(null);
  useEffect(() => {
    const el = breath.current;
    if (!el || typeof el.animate !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = el.animate([{ opacity: 0 }, { opacity: BREATH_PEAK }, { opacity: 0 }], { duration: BREATH_MS, iterations: Infinity, easing: "ease-in-out" });
    breathAnim.current = a;
    return () => a.cancel();
  }, [js]);
  useEffect(() => {
    if (!posterGone) return;
    const t = setTimeout(() => breathAnim.current?.cancel(), 900);
    return () => clearTimeout(t);
  }, [posterGone]);
  /** The night grade (night.ts) and the lights' thinning (`?thin=lattice` compares round 57.2's). */
  const [night, setNight] = useState<NightGrade | null>(nightGrade(null).grade);
  const lightCanvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<AreaShot | null>(null);
  /** The home the pointer (or a tap) is naming: its index, where its listing is (the town's search
   * until the price arrives), and the pin once it has. */
  const hovered = useRef<{ i: number; href: string; pin: MapPin | null; pending: Promise<MapPin | null> | null; touch: boolean } | null>(null);
  /** The featured home whose card has focus (the keyboard's path to the lights). */
  const focusHome = useRef<FeaturedHome | null>(null);
  const tap = useRef<TapState>({ shown: null });
  /** The click's clock, for the probe: when it came, what it did, when the route was asked for. */
  const clickLog = useRef<{ at: number; act: string; routedAt: number | null; href: string | null }[]>([]);
  const hoverCost = useRef<{ tests: number; totalMs: number; maxMs: number; frames?: number; frameMs?: number; frameMax?: number; samples?: number[] }>({ tests: 0, totalMs: 0, maxMs: 0 });
  const scheduleRef = useRef<() => void>(() => {});
  const tailVeil = useRef<HTMLDivElement>(null);
  const footerEl = useRef<HTMLElement | null>(null);
  /** The map failed (no key, no WebGL, the script blocked, gmp-error): our poster stays for good. */
  const failed = useRef(false);
  /** What stands behind the words, for what they may claim (claims.ts; round 57.5). */
  const mapState = useRef<MapState>("cover");
  const lightsState = useRef<LightsState>("pending");
  const syncClaims = () => applyClaims(claims(mapState.current, lightsState.current));

  // ---- THE TERRITORY'S NAMES (round 57, labels.ts) ------------------------------------------------
  // Drawn only while the page sits at its top and the map holds the hero shot still: they fade out
  // (250 ms) as soon as the reader scrolls or the camera leaves, and come back only when both are
  // true again. Placed from the camera the map is actually on, re-placed on every resize.
  const labelLayer = useRef<HTMLDivElement>(null);
  /** Where each of our names stands (territory and towns), so an open label can fade the ones
   * under it (round 57.6: the phone's tap label sat on "Rockland"). */
  const nameBoxes = useRef(new Map<HTMLSpanElement, Box>());
  const dimmed = useRef(new Set<HTMLSpanElement>());
  const dimNames = (r: { x: number; y: number; w: number; h: number } | null) => {
    const next = new Set<HTMLSpanElement>();
    if (r) for (const [e, b] of nameBoxes.current) if (namesOverlap(b, r, 6)) next.add(e);
    for (const e of dimmed.current) if (!next.has(e)) e.style.opacity = "";
    for (const e of next) e.style.opacity = "0";
    dimmed.current = next;
  };
  const labelEls = useRef(new Map<string, HTMLSpanElement>());
  const labelsPlaced = useRef(false);

  const placeTerritory = useCallback(() => {
    const c = ctl.current;
    const cam = c?.camera() as { fov?: number } | null | undefined;
    if (!c || !cam) return;
    const vp = { ...c.view(), fov: cam.fov ?? 40 };
    const els = labelEls.current;
    const byText = new Map([...els.values()].map((e) => [e.textContent ?? "", e]));
    const items = labelItems(c.camera()!, vp, (text) => {
      const e = byText.get(text);
      return { w: e ? Math.ceil(e.offsetWidth) : text.length * 9, h: e ? Math.ceil(e.offsetHeight) : 20 };
    });
    const avoid: Box[] = [];
    const push = (r: DOMRect | { left: number; top: number; width: number; height: number }) => {
      if (r.width > 0 && r.height > 0) avoid.push({ x: r.left, y: r.top, w: r.width, h: r.height });
    };
    document.querySelectorAll("header, [data-g3d-avoid], .rlt-bubble").forEach((e) => push(e.getBoundingClientRect()));
    // The hero's words by their LINES, not their column: a label may stand beside a short line.
    document.querySelectorAll<HTMLElement>('[data-shot="hero"] :is([data-quiet] :is(p, h1, form), p[data-quiet], h1[data-quiet])').forEach((e) => {
      if (e.tagName === "FORM") return push(e.getBoundingClientRect());
      const range = document.createRange();
      range.selectNodeContents(e);
      for (const r of range.getClientRects()) push(r);
    });
    push({ left: 0, top: vp.height - LOGO_CORNER.h, width: LOGO_CORNER.w, height: LOGO_CORNER.h });
    const placed = new Map(placeLabels(items, avoid, vp, { google: googleBoxes(c.camera()!, vp) }).map((p) => [p.id, p]));
    for (const [id, e] of els) {
      const p = placed.get(id);
      e.style.visibility = p ? "visible" : "hidden";
      if (p) e.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      if (p) nameBoxes.current.set(e, { x: p.x, y: p.y, w: p.w, h: p.h });
      else nameBoxes.current.delete(e);
    }
    labelsPlaced.current = true;
    const layer = labelLayer.current;
    if (layer) layer.dataset.placed = [...placed.keys()].join(",");
  }, []);

  const showTerritory = useCallback(() => {
    const layer = labelLayer.current;
    if (!layer) return;
    const on = !failed.current && ctl.current?.heldShot() === "hero" && window.scrollY <= 24;
    if (on && !labelsPlaced.current) placeTerritory();
    layer.style.opacity = on ? "1" : "0";
    layer.dataset.on = on ? "1" : "0";
  }, [placeTerritory]);
  const showTerritoryRef = useRef(showTerritory);
  showTerritoryRef.current = showTerritory;

  // ---- THE PLACES INSIDE A COUNTY (round 57.3, towns.ts; brief item 9) -----------------------------
  // At a county or borough chapter the map is SATELLITE and carries no names: two or three of ours,
  // in the territory names' style at 13 px, placed clear of the words, only while the map holds that
  // area's shot; gone the moment a flight starts. `?towns=0` hides them (the frames' comparison).
  const townLayer = useRef<HTMLDivElement>(null);
  const townEls = useRef(new Map<string, HTMLSpanElement>());
  const townsOff = useRef(false);
  const townSizes = useRef(new Map<string, { w: number; h: number }>());
  const showTowns = useCallback(() => {
    const layer = townLayer.current;
    const c = ctl.current;
    if (!layer) return;
    const shot = c?.heldShot() ?? null;
    const area = !failed.current && !townsOff.current && shot && isArea(shot) ? focusOf(shot) : null;
    const cam = c?.camera() as ({ fov?: number } & MapCamera) | null | undefined;
    if (!area || !cam) {
      layer.style.opacity = "0";
      layer.dataset.on = "0";
      return;
    }
    const vp = { ...c!.view(), fov: cam.fov ?? 40 };
    const els = townEls.current;
    // Each name's size is read once (a read after the transforms below would force a layout on
    // every scroll frame while the names are up).
    const sizes = townSizes.current;
    const items = labelItems(cam, vp, (text) => {
      let z = sizes.get(text);
      if (!z) {
        const e = [...els.values()].find((x) => x.textContent === text);
        z = { w: e ? Math.ceil(e.offsetWidth) : text.length * 8, h: e ? Math.ceil(e.offsetHeight) : 18 };
        if (e) sizes.set(text, z);
      }
      return z;
    }, townsOf(area));
    const avoid: Box[] = [];
    document.querySelectorAll("header, [data-quiet], [data-g3d-avoid], .rlt-bubble").forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vp.height) avoid.push({ x: r.left, y: r.top, w: r.width, h: r.height });
    });
    avoid.push({ x: 0, y: vp.height - LOGO_CORNER.h, w: LOGO_CORNER.w, h: LOGO_CORNER.h });
    const placed = new Map(placeLabels(items, avoid, vp, { pad: 12, gap: 10 }).map((p) => [p.id, p]));
    for (const [id, e] of els) {
      const p = placed.get(id);
      e.style.visibility = p ? "visible" : "hidden";
      if (p) e.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      if (p) nameBoxes.current.set(e, { x: p.x, y: p.y, w: p.w, h: p.h });
      else nameBoxes.current.delete(e);
    }
    layer.dataset.placed = [...placed.values()].map((p) => p.text).join(",");
    layer.style.opacity = placed.size ? "1" : "0";
    layer.dataset.on = placed.size ? "1" : "0";
  }, []);
  const showTownsRef = useRef(showTowns);
  showTownsRef.current = showTowns;

  // The look, from the query string (the lab's switch).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    townsOff.current = q.get("towns") === "0";
    if (q.get("night") !== null) setNight(nightGrade(q.get("night")).grade);
    if (q.get("look") === "veil") setLook("veil");
    if (q.get("veil")) setVeil(Number(q.get("veil")));
    if (q.get("scrim")) setScrim(Number(q.get("scrim")));
    if (q.get("pad") || q.get("feather") || q.get("soft") || q.get("lead"))
      setShape({ pad: Number(q.get("pad") ?? SCRIM_PAD), feather: Number(q.get("feather") ?? SCRIM_FEATHER), soft: Number(q.get("soft") ?? SOFT_SHARE), lead: Number(q.get("lead") ?? LEAD_SHARE) });
  }, []);

  const measure = useCallback(() => {
    const y = window.scrollY;
    const found: ShotSection[] = [...document.querySelectorAll<HTMLElement>("[data-shot]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { shots: (el.dataset.shot ?? "hero").split(",").filter(Boolean) as ShotName[], top: r.top + y, height: r.height, veil: 0 };
    });
    const t = tailRef.current;
    sections.current = t ? withTail(found, document.documentElement.scrollHeight, { shots: [t.shot], veil: 0 }) : found;
    footerEl.current = document.querySelector("footer");
    const hd = document.querySelector("header")?.getBoundingClientRect();
    headerRect.current = hd && hd.height > 0 ? { x: hd.left, y: hd.top + y, w: hd.width, h: hd.height } : null;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    stops.current = shotStops(sections.current, window.innerHeight, maxScroll);
    names.current = stops.current.map((s) => s.name);
  }, []);

  /** The scrims follow the largest blocks of words on screen (SCRIMS of them), by transform only
   * (their size changes only when the set of boxes does, so the soft edge is rastered once, not
   * per frame). Each is the words' box grown by SCRIM_PAD of solid shade and SCRIM_FEATHER of
   * fade, the fade drawn by a mask of two crossed ramps, so there is no rectangle to see. */
  const placeScrims = useCallback(() => {
    // The logo's corner: the words' layer is masked there (see LOGO_CLEAR); the hole follows the
    // window, the layer scrolls, so its position is the scroll.
    const content = contentRef.current;
    if (content) {
      const y = Math.round(window.scrollY + window.innerHeight - HOLE_H);
      if (y !== holeY.current) {
        holeY.current = y;
        content.style.setProperty("--g3d-hole-y", `${y}px`);
      }
    }
    // The header's words stand on the map's sky and labels: a shade under them that scrolls away
    // with the header (it is not sticky).
    if (topScrim.current) topScrim.current.style.transform = `translate3d(0, ${-Math.min(window.scrollY, 400)}px, 0)`;
    // The phone's territory shot ends in the ocean's pale haze under the search (round 57.2): a
    // shade at the window's foot while the hero is up, gone by the time the next section arrives.
    if (footShade.current) footShade.current.style.opacity = String(Math.max(0, 1 - window.scrollY / 320));
    // The tail: the map darkens as the footer comes up, fully once its top is half a window up.
    const t = tailRef.current;
    if (tailVeil.current && t?.veil) {
      const f = footerEl.current;
      const vh = window.innerHeight;
      const top = f ? f.getBoundingClientRect().top : Infinity;
      const k = Math.min(1, Math.max(0, (vh - top) / (vh * 0.5)));
      const max = window.innerWidth < 1024 ? (t.veilPhone ?? t.veil) : t.veil;
      tailVeil.current.style.opacity = String(Math.round(k * max * 1000) / 1000);
    }
    if (lookRef.current !== "scrim") return;
    const vh = window.innerHeight;
    const { pad, feather, soft, lead } = shapeRef.current;
    const reach = pad + feather;
    const wide = window.innerWidth >= 1024;
    const shareOf = (q: string | undefined) => (!wide ? 1 : q === "soft" ? soft : q === "lead" ? lead : 1);
    const blocks = [...document.querySelectorAll<HTMLElement>("[data-quiet]")]
      .map((el) => ({ r: el.getBoundingClientRect(), share: shareOf(el.dataset.quiet) }))
      .filter(({ share }) => share > 0)
      .filter(({ r }) => r.width > 8 && r.height > 8 && r.bottom > -reach && r.top < vh + reach)
      .sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)
      .slice(0, SCRIMS);
    for (let k = 0; k < SCRIMS; k++) {
      const el = scrimEls.current[k];
      if (!el) continue;
      const b = blocks[k];
      if (!b) {
        el.style.opacity = "0";
        continue;
      }
      const r = b.r;
      const size = `${Math.round(r.width)}x${Math.round(r.height)}`;
      if (scrimSizes.current[k] !== size) {
        scrimSizes.current[k] = size;
        el.style.width = `${Math.round(r.width) + 2 * reach}px`;
        el.style.height = `${Math.round(r.height) + 2 * reach}px`;
      }
      el.style.transform = `translate3d(${Math.round(r.left) - reach}px, ${Math.round(r.top) - reach}px, 0)`;
      el.style.opacity = String(b.share);
    }
  }, []);

  const flyTo = useCallback((name: ShotName) => {
    target.current = name;
    ctl.current?.flyToShot(name);
  }, []);

  const wordsTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const apply = useCallback(() => {
    wordBoxes.current = null;
    // Round 57.6: the words' line boxes are read once the scroll rests (the label needs them), not
    // inside the first pointer frame after it (measured: that frame cost 9.7 ms, every other one
    // under 1 ms, scripts/_scratch-r57f-hovercost.mjs).
    clearTimeout(wordsTimer.current);
    wordsTimer.current = setTimeout(() => {
      wordBoxes.current ??= readWordBoxes({ width: window.innerWidth, height: window.innerHeight });
    }, 180);
    placeScrims();
    showTerritoryRef.current();
    // The places move with the words only while they are shown (the phone's list scrolls over them).
    if (townLayer.current?.dataset.on === "1") showTownsRef.current();
    if (!stops.current.length || override.current) return;
    const { index } = shotPosition(stops.current, window.scrollY);
    const name = names.current[index];
    if (!name) return;
    setCurrent(isArea(name) ? name : null);
    if (name === target.current) {
      clearTimeout(settle.current);
      return;
    }
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      if (!override.current) flyTo(name);
    }, SETTLE_MS);
  }, [flyTo, placeScrims]);

  const schedule = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      apply();
    });
  }, [apply]);

  scheduleRef.current = schedule;

  // ---- THE HOVER LABEL (round 57.3, interaction.ts) ------------------------------------------------
  // One label, ours, fixed over the page: the town, then the price with beds and baths; on a phone
  // also the street address, the thing to tap. It is a real link (the listing's href), so "open in
  // new tab" is honest. Placed by transform only; its size is measured with the canvas's text
  // metrics, not the layout, so nothing in the pointer's path asks the page for a layout.
  const fontRef = useRef<string | null>(null);
  const measureCtx = useRef<CanvasRenderingContext2D | null>(null);
  const lastFont = useRef("");
  const widths = useRef(new Map<string, number>());
  const textW = (text: string, px: number, weight: number) => {
    const key = `${weight}/${px}/${text}`;
    const hit = widths.current.get(key);
    if (hit !== undefined) return hit;
    const width = measureText(text, px, weight);
    if (widths.current.size > 4000) widths.current.clear();
    widths.current.set(key, width);
    return width;
  };
  const measureText = (text: string, px: number, weight: number) => {
    let c = measureCtx.current;
    if (!c) c = measureCtx.current = document.createElement("canvas").getContext("2d");
    if (!c) return text.length * px * 0.55;
    if (fontRef.current === null) fontRef.current = label.current ? getComputedStyle(label.current).fontFamily : "sans-serif";
    const font = `${weight} ${px}px ${fontRef.current}`;
    if (lastFont.current !== font) c.font = lastFont.current = font;
    return c.measureText(text).width;
  };
  const headerRect = useRef<Rect | null>(null);
  const wordBoxes = useRef<Rect[] | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hideLabel = useCallback(() => {
    clearTimeout(hideTimer.current);
    const el = label.current;
    if (!el || el.dataset.open !== "1") return;
    el.dataset.open = "0";
    dimNames(null);
    el.style.transitionDuration = "160ms";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
  }, []);

  const showLabel = useCallback((at: { x: number; y: number }, keep: number, content: LabelContent, touch: boolean, href: string, fresh = true) => {
    const el = label.current;
    if (!el) return;
    // The label's box FIRST, from the text's metrics and the fixed line heights below, while the
    // document is still clean: a canvas font set after a DOM write forces a style recalc (the first
    // trace of round 57.3 caught 9.5 ms of it in the pointer's frame).
    const addr = touch ? content.address : null;
    const row = content.price ? textW(content.price, 14, 600) + (content.facts ? 8 + textW(content.facts, 13, 400) : 0) : 0;
    const addrW = addr ? textW(addr, 14, 500) + 12 + textW("View", 14, 600) : 0;
    const w = Math.ceil(Math.max(textW(content.town, 13, 500), row, addrW)) + 26;
    const h = 16 + 2 + 18 + (content.price ? 22 : 0) + (addr ? 37 : 0);
    const vp = { width: window.innerWidth, height: window.innerHeight };
    const avoid: Rect[] = [{ x: 0, y: vp.height - LOGO_CORNER.h, w: LOGO_CORNER.w, h: LOGO_CORNER.h }];
    const hr = headerRect.current;
    if (hr && hr.y + hr.h - window.scrollY > 0) avoid.push({ ...hr, y: hr.y - window.scrollY });
    // Round 57.5: the page's words too (the phone's tap label sat on "Let's find"): read once per
    // scroll position, while the document is clean, and dropped on the next scroll or resize.
    avoid.push(...(wordBoxes.current ??= readWordBoxes(vp)));
    const p = placeHoverLabel(at, { w, h }, vp, { keep, avoid });
    // Then the writes: text, which rows show, the place (a transform), the link; our names under the
    // label step aside (namesOverlap), and come back when it closes.
    dimNames({ x: p.x, y: p.y, w, h });
    const same = el.dataset.open === "1";
    if (labelTown.current) labelTown.current.textContent = content.town;
    if (labelPrice.current) labelPrice.current.textContent = content.price ?? "";
    if (labelFacts.current) labelFacts.current.textContent = content.facts ?? "";
    if (labelRow.current) labelRow.current.style.display = content.price ? "flex" : "none";
    if (labelFacts.current) labelFacts.current.style.display = content.facts ? "" : "none";
    if (labelAddrText.current) labelAddrText.current.textContent = addr ?? "";
    if (labelAddr.current) labelAddr.current.style.display = addr ? "flex" : "none";
    el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    el.dataset.side = p.side;
    el.dataset.touch = touch ? "1" : "0";
    el.setAttribute("href", href);
    if (fresh) el.dataset.shownAt = String(Math.round(performance.now()));
    if (!same) {
      el.dataset.open = "1";
      el.style.transitionDuration = "120ms";
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
    }
  }, []);

  /** The lit light's keep-out half-size: its lit core's radius (glyph.ts litGlyph, 1.6x) and 4 px of
   * slack; its argument is the core's DIAMETER, as the controller's stats report it. */
  const keepOf = (core: number) => (core / 2) * 1.6 + 4;

  const hideHover = useCallback(() => {
    clearTimeout(hideTimer.current);
    const had = hovered.current;
    hovered.current = null;
    tap.current = { shown: null };
    if (had) ctl.current?.lightHome(null);
    if (had || !focusHome.current) hideLabel();
    document.documentElement.style.cursor = "";
  }, [hideLabel]);
  // The map: created once, on mount.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const el = host.current;
    if (!el) return;
    measure();
    const initial = stops.current.length ? names.current[shotPosition(stops.current, window.scrollY).index] ?? "hero" : "hero";
    target.current = initial;
    // THE FALLBACK ORDER (round 57, the orchestrator's decision): no key, no WebGL, a blocked script
    // or gmp-error each leave OUR poster in place for good, a still of our own artwork. The night
    // scene is not loaded after the map failed (a second WebGL scene where the first could not run
    // is waste), and without WebGL the Maps script is not even fetched (it would be a billed load
    // that cannot draw).
    let glOk = false;
    try {
      const cv = document.createElement("canvas");
      glOk = !!(cv.getContext("webgl2") || cv.getContext("webgl"));
    } catch {}
    if (!key || !glOk) {
      failed.current = true;
      setError(!key ? "no key" : "no webgl");
      return;
    }
    setPinned(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // THE PRE-WARM WALK (controller.ts): the shots the page will fly to, in the page's order, under
    // the poster, until the budget runs out. Measured (docs/parity/DESIGN-ROUND56.md §8): the whole
    // walk takes 20 to 30 s even on a warm profile (each shot 1.4 to 2.1 s to draw) and leaves the
    // flights' hitches where they were; ONE shot, the first the reader flies to, takes 2 to 4 s and
    // removes the cold first flight's 300 ms stall. So the budget is 1.5 s: the walk visits the next
    // shot and stops. Round 57.4 (warm-plan.ts): on a wide window the walk instead flies the
    // Highlands-to-Westchester path once, which compiles the GPU shader behind that flight's 236 ms
    // stall; the phone keeps the one-shot jump. The lab's switches are listed in warm-plan.ts.
    const q = new URLSearchParams(window.location.search);
    const pageShots = [...new Set(names.current)].filter((n) => n !== initial);
    const plan = warmPlan({ pageShots, initial, narrow: isNarrow({ width: window.innerWidth }), q });
    const c = new G3dController({
      key,
      reduced,
      viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
      initial,
      warm: plan.shots,
      warmMode: plan.mode,
      warmFlyMs: plan.flyMs,
      warmSettleMs: plan.settleMs,
      warmBackMs: plan.backMs,
      warmOpen: plan.open,
      warmBudgetMs: plan.budgetMs,
      camOverride: camOverrides(q.get("cam")),
      durOverride: durOverrides(q.get("dur")),
      legs: Number(q.get("legs") ?? 1),
      holdFlights: q.get("gate") === "1",
      maxWaitMs: Number(q.get("maxWait") ?? 1200),
      flightMs: (q.get("flight") ?? "1600,2600").split(",").map(Number) as unknown as readonly [number, number],
      firstStep: q.get("ladder") === "first",
      mapId: mapIdFrom(process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID),
      mode: modeChoice(q.get("mode"), MODE),
      canvas: lightCanvas.current,
      thin: q.get("thin") === "lattice" ? "lattice" : "density",
      glow: q.has("glow") ? Number(q.get("glow")) : undefined,
      cityGap: q.has("gap") ? Number(q.get("gap")) : undefined,
      sharp: q.get("sharp") !== "0",
      description: "Map of the Hudson Valley and New York City, with the homes for sale lit where they stand.",
      onReveal: () => {
        setRevealed(true);
        mapState.current = "live";
        // The light sentences claim what our layer draws (claims.ts): homes loaded but none drawn
        // at the shot the map opens on would make "every light" an empty promise.
        if (lightsState.current === "some" && c.stats().planned === 0) lightsState.current = "none";
        syncClaims();
        setPosterGone(true);
        labelsPlaced.current = false;
        showTerritoryRef.current();
      },
      onLand: () => {
        labelsPlaced.current = false;
        showTerritoryRef.current();
        showTownsRef.current();
        showFocusRef.current();
      },
      onFlightStart: () => {
        hideHover();
        hideLabel();
        showTerritoryRef.current();
        showTownsRef.current();
      },
      onError: (m) => {
        // Once, whatever fails: the poster comes back (or never left) and stays.
        if (failed.current) return;
        failed.current = true;
        mapState.current = "failed";
        syncClaims();
        setError(m);
        setPosterGone(false);
        // Our lights stand on Google's map; without it they would float on black below the cover.
        c.layer?.stop();
        if (lightCanvas.current) lightCanvas.current.style.visibility = "hidden";
        showTerritoryRef.current();
        console.warn("[g3d]", m);
      },
    });
    ctl.current = c;
    if (c.layer) c.layer.avoid = { x: 0, y: window.innerHeight - LOGO_CORNER.h, w: LOGO_CORNER.w, h: LOGO_CORNER.h };
    (window as unknown as { __g3d?: unknown }).__g3d = {
      ctl: c,
      stats: () => c.stats(),
      hover: hoverCost.current,
      clicks: clickLog.current,
      lit: () => c.lit(),
      layer: () => c.layer,
      label: () => {
        const l = label.current;
        return l ? { open: l.dataset.open === "1", side: l.dataset.side ?? null, href: l.getAttribute("href"), text: l.innerText, shownAt: Number(l.dataset.shownAt ?? 0) } : null;
      },
      fly: (n: ShotName) => flyTo(n),
      hovered: () => hovered.current,
      stops: () => stops.current.map((x) => ({ name: x.name, anchor: Math.round(x.anchor) })),
      towns: () => ({ on: townLayer.current?.dataset.on === "1", placed: (townLayer.current?.dataset.placed ?? "").split(",").filter(Boolean) }),
      territory: () => ({ on: labelLayer.current?.dataset.on === "1", placed: (labelLayer.current?.dataset.placed ?? "").split(",").filter(Boolean) }),
    };
    void c.start(el);
    // Our homes, and the terrain the hover maths stands them on.
    // `?homes=0`: the map alone, for the frame-time probe to tell the map's cost from ours.
    const noHomes = new URLSearchParams(window.location.search).get("homes") === "0";
    void loadLights().then((pts) => {
      lightsState.current = !pts || noHomes ? "none" : "some";
      syncClaims();
      if (!pts || noHomes) return;
      const n = pts.x.length;
      const lat = new Float64Array(n), lng = new Float64Array(n);
      const county: string[] = new Array(n);
      for (let i = 0; i < n; i++) {
        const [a, b] = boxUVToLngLat(pts.x[i], pts.y[i], pts.box);
        lng[i] = a;
        lat[i] = b;
        county[i] = pts.townCounty[pts.town[i]] ?? "";
      }
      const homes: Homes = { lat, lng, county, key: placeKeys(pts.x, pts.y), town: pts.town, towns: pts.towns };
      c.setHomes(homes);
    });
    void loadElevation().then((g) => c.setElevation(g)).catch(() => {});
    return () => {
      c.stop();
      ctl.current = null;
    };
  }, [measure, flyTo, hideHover, hideLabel]);

  // Scroll, resize, reflow.
  useEffect(() => {
    const onResize = () => {
      measure();
      const layer = ctl.current?.layer;
      if (layer) {
        layer.resize();
        layer.avoid = { x: 0, y: window.innerHeight - LOGO_CORNER.h, w: LOGO_CORNER.w, h: LOGO_CORNER.h };
      }
      scrimSizes.current = [];
      wordBoxes.current = null;
      labelsPlaced.current = false;
      schedule();
    };
    onResize();
    // An early scroll (round 57.6): the cover holds and the map goes to the visitor's section under
    // it (controller scrolledEarly, warm-plan.ts earlyScroll); it lifts at the reveal, never before.
    const onFirstScroll = () => {
      if (failed.current) {
        window.removeEventListener("scroll", onFirstScroll);
        return;
      }
      if (window.scrollY > 24) {
        ctl.current?.scrolledEarly();
        window.removeEventListener("scroll", onFirstScroll);
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", onFirstScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", onFirstScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
      clearTimeout(settle.current);
    };
  }, [measure, schedule]);

  useEffect(() => {
    scrimSizes.current = [];
    placeScrims();
  }, [look, shape, placeScrims]);

  // THE FEATURED HOMES AND THE KEYBOARD (round 57.3). Google's markers cannot take focus (maps 3.66,
  // measured in round 56, scripts/_scratch-r56-tab.mjs: Tab stops once on the map element and
  // leaves it), so the featured homes' CARDS on the page are the keyboard's path to their lights:
  // a card's focus flies the map down to its home, lights the home's light, and once the map has
  // landed names it with the same label the pointer gets. Escape puts the label and the light away
  // (the focus stays on the card); focus leaving the cards gives the map back to the scroll.
  const showFocus = useCallback(() => {
    const h = focusHome.current;
    const c = ctl.current;
    if (!h || !c || c.isFlying()) return;
    const p = c.screenOf(h.lat, h.lng);
    if (!p) return;
    const pin = h.price ? { price: h.price, beds: h.beds ?? 0, baths: h.baths ?? 0, address: h.address ?? "", city: h.city ?? "" } : null;
    showLabel(p, keepOf(2 * featuredGlyph(ctl.current?.layer?.glyph ?? { core: 1.5, halo: 6, haloAlpha: 0.4, glow: 0, glowAlpha: 0 }).core), labelContent(h.city ?? "", pin), false, h.href);
  }, [showLabel]);
  const showFocusRef = useRef(showFocus);
  showFocusRef.current = showFocus;

  useEffect(() => {
    const c = ctl.current;
    if (!revealed || !c) return;
    c.setFeatured(featuredRef.current);
    const byId = new Map(featuredRef.current.map((h) => [h.id, h]));
    const homeOf = (t: EventTarget | null) => {
      const a = (t as Element | null)?.closest?.("a[href*=\"bid-38-\"]");
      if (!a || a.closest("[data-g3d-label]")) return null;
      const id = a.getAttribute("href")?.split("bid-38-")[1];
      return id ? byId.get(id) ?? null : null;
    };
    const onIn = (e: FocusEvent) => {
      const h = homeOf(e.target);
      if (!h || h === focusHome.current) return;
      hideHover();
      focusHome.current = h;
      override.current = "home" as AreaShot;
      // Put the home on OPEN map (interaction.ts openPoint): at the rail the cards cover the middle of
      // the window, and a home flown to the middle sat under a card with its label on the next one.
      const base = { center: { lat: h.lat, lng: h.lng, altitude: 0 }, range: 2600, tilt: 55, heading: 0, fov: 40 };
      const { width: vw, height: vh } = c.view();
      const vp = { width: vw, height: vh };
      const card = (e.target as Element).closest("a")?.getBoundingClientRect();
      const solids: Rect[] = [];
      document.querySelectorAll("header, a[href*=\"bid-38-\"], h1, h2, h3, p, button, [data-g3d-avoid], .rlt-bubble").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vp.height && r.right > 0 && r.left < vp.width) solids.push({ x: r.left, y: r.top, w: r.width, h: r.height });
      });
      const spot = openPoint(solids, vp, card ? { x: card.left + card.width / 2, y: card.top + card.height / 2 } : { x: vp.width / 2, y: vp.height / 2 }, {
        avoid: [{ x: 0, y: vp.height - LOGO_CORNER.h, w: LOGO_CORNER.w, h: LOGO_CORNER.h }],
      });
      const cam = spot ? cameraShowing({ lat: h.lat, lng: h.lng, alt: c.groundAlt(h.lat, h.lng) }, { x: spot.x, y: spot.y }, base, vp) : base;
      c.flyToCamera(cam, 1800);
      // After the flight has started (its start puts every light out), so this one stays lit.
      c.lightFeatured(h.id);
    };
    const onOut = (e: FocusEvent) => {
      if (!focusHome.current || homeOf(e.relatedTarget)) return;
      focusHome.current = null;
      c.lightFeatured(null);
      hideLabel();
      override.current = null;
      // Back to whatever the scroll says (the focus may have scrolled the page meanwhile).
      target.current = null;
      scheduleRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (focusHome.current) {
        c.lightFeatured(null);
        hideLabel();
      }
      if (hovered.current) hideHover();
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      document.removeEventListener("keydown", onKey);
    };
  }, [revealed, hideHover, hideLabel]);

  // THE CLICK (round 57.3, interaction.ts clickAction). Over a steady map a short fly-in, then the
  // listing; mid-flight, before the map is steady, or with reduced motion, the listing at once; a
  // modifier or the middle button, a new tab and no fly-in. The route is asked for within 1 s of the
  // click whatever the map or the price lookup does, and if it never happens (the listing fails to
  // load), the map goes back to the section's shot and the page stays usable.
  const reducedRef = useRef(false);
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const activate = useCallback(
    (e: { button: number; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => {
      const h = hovered.current;
      const c = ctl.current;
      if (!h || !c) return;
      const act = clickAction(e, { steady: c.isSteadyStill(), flying: c.isFlying(), reduced: reducedRef.current });
      if (act === "none") return;
      const at = performance.now();
      const log = { at: Math.round(at), act, routedAt: null as number | null, href: null as string | null };
      clickLog.current.push(log);
      if (clickLog.current.length > 40) clickLog.current.shift();
      if (act === "tab") {
        if (h.pin || !h.pending) {
          window.open(h.href, "_blank", "noopener");
          log.href = h.href;
        } else {
          // The listing is still being looked up: the tab opens now (a later open would be blocked
          // as a popup) and is sent on once it is known.
          const w = window.open("about:blank", "_blank");
          void h.pending.then((pin) => {
            if (!w) return;
            w.opener = null;
            w.location.href = pin ? listingPath(pin) : h.href;
          });
        }
        return;
      }
      const home = c.homeAt(h.i);
      const diving = act === "fly" && !!home;
      // Round 57.5: the page's words (and the shade under them) step aside over the dive's first
      // 200 ms, so the descent is the picture (they stood over the diving map, 3/lights/desk/flyin-sheet.png); back if the route
      // never comes. No fly-in with reduced motion, so no fade either.
      const words = [contentRef.current, scrimLayer.current];
      if (diving)
        for (const w of words) {
          if (!w) continue;
          w.style.transition = "opacity 200ms ease-out";
          w.style.opacity = "0";
        }
      const fly = diving ? c.flyIn(home) : Promise.resolve();
      const wait = (ms: number) => new Promise<null>((r) => setTimeout(() => r(null), ms));
      const pin = h.pin ? Promise.resolve(h.pin) : Promise.race([h.pending ?? Promise.resolve(null), wait(900)]);
      const fallback = h.href;
      void Promise.all([fly, pin]).then(([, p]) => {
        const href = p ? listingPath(p) : fallback;
        log.routedAt = Math.round(performance.now());
        log.href = href;
        router.push(href);
        // A route that never arrives (an error, a lost connection) must not strand the reader on a
        // map flown down to one house: the map goes back to the section's shot.
        setTimeout(() => {
          if (window.location.pathname !== "/" || !ctl.current) return;
          for (const w of words) if (w) w.style.opacity = "";
          hideHover();
          override.current = null;
          target.current = null;
          scheduleRef.current();
        }, 4000);
      });
    },
    [router, hideHover],
  );
  const activateRef = useRef(activate);
  activateRef.current = activate;

  /** The label is a link: a modifier click is the browser's own (a new tab); a plain click or a tap
   * goes the way a click on the light goes. */
  const onLabelClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (focusHome.current && !hovered.current) {
      router.push(focusHome.current.href);
      return;
    }
    activateRef.current({ button: 0 });
  };

  // HOVER: the pointer against the homes we drew, where the pointer is on the ground (not over
  // words, a card or a control). The pointer's path does one hit test and, only when the home under
  // it changes, writes the label and swaps one marker's glyph.
  useEffect(() => {
    if (!revealed) return;
    let raf = 0;
    let px = 0, py = 0;
    let over: Element | null = null;
    const blocked = (t: Element | null) => !!t?.closest("a,button,input,select,textarea,label,form,[role=dialog],[data-quiet],header,footer,iframe,[data-g3d-label]");
    const onLabel = (t: Element | null) => !!t?.closest("[data-g3d-label]");
    // Warm what the first label would otherwise pay for inside the pointer's frame: the canvas and
    // the page's font for the text metrics, and the number formatter.
    textW("$0 3 bd, 2 ba", 14, 600);
    labelContent("", { price: 1, beds: 1, baths: 1, address: "", city: "" });
    const show = (i: number, x: number, y: number, touch: boolean) => {
      const c = ctl.current!;
      clearTimeout(hideTimer.current);
      if (hovered.current?.i === i) return;
      focusHome.current = null;
      const town = c.townOf(i);
      const home = c.homeAt(i);
      // The lookup starts just after this frame (a fetch costs ~0.5 ms to start; the pointer's frame
      // has a 2 ms budget).
      const pending = home ? new Promise<MapPin | null>((r) => setTimeout(() => void priceNear(home.lat, home.lng).then(r), 0)) : null;
      const h = { i, href: townSearchHref(town), pin: null as MapPin | null, pending, touch };
      hovered.current = h;
      const keep = keepOf(c.stats().glyph);
      // The label before the glyph swap: the swap writes to the DOM, and the label measures first.
      showLabel({ x, y }, keep, labelContent(town, null), touch, h.href);
      c.lightHome(i);
      void pending?.then((pin) => {
        if (hovered.current !== h || !pin) return;
        h.pin = pin;
        h.href = listingPath(pin);
        showLabel({ x, y }, keep, labelContent(town, pin), touch, h.href, false);
        router.prefetch(h.href);
      });
      if (!touch) document.documentElement.style.cursor = "pointer";
    };
    const hideSoon = () => {
      if (!hovered.current || hideTimer.current) return;
      // A moment's grace, so the pointer can cross the 10 px from the light to its label.
      hideTimer.current = setTimeout(() => {
        hideTimer.current = undefined;
        hideHover();
      }, 120);
    };
    // The whole of the pointer's work per frame (the hit test, and the label and the glyph when the
    // home changes), timed for the probe: round 57.3's bar is under 2 ms at 1440.
    const test = () => {
      const t0 = performance.now();
      testInner();
      const ms = performance.now() - t0;
      const hc = hoverCost.current;
      hc.frames = (hc.frames ?? 0) + 1;
      hc.frameMs = (hc.frameMs ?? 0) + ms;
      hc.frameMax = Math.max(hc.frameMax ?? 0, ms);
      (hc.samples ??= []).push(Math.round(ms * 1000) / 1000);
      if (hc.samples.length > 2000) hc.samples.shift();
    };
    const testInner = () => {
      raf = 0;
      const c = ctl.current;
      if (onLabel(over)) {
        clearTimeout(hideTimer.current);
        hideTimer.current = undefined;
        return;
      }
      if (!c || c.isFlying() || blocked(over)) {
        if (hovered.current && !hovered.current.touch) hideHover();
        return;
      }
      const t0 = performance.now();
      const k = nearestLight(c.xy, c.xyCount, px, py, 14);
      const ms = performance.now() - t0;
      const hc = hoverCost.current;
      hc.tests++;
      hc.totalMs += ms;
      hc.maxMs = Math.max(hc.maxMs, ms);
      if (k < 0) {
        if (hovered.current && !hovered.current.touch) hideSoon();
        return;
      }
      clearTimeout(hideTimer.current);
      hideTimer.current = undefined;
      show(c.xyIndex[k], c.xy[2 * k], c.xy[2 * k + 1], false);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      over = e.target as Element | null;
      if (!raf) raf = requestAnimationFrame(test);
    };
    // A touch sends its own tap as a click too; the touch path below decides what a tap does
    // (the first names the home, the second opens it), so the window's click only acts for a mouse.
    let lastPointer = "mouse";
    const onClick = (e: MouseEvent) => {
      if (lastPointer !== "mouse" || !hovered.current || blocked(e.target as Element)) return;
      activateRef.current(e);
    };
    const onAux = (e: MouseEvent) => {
      if (e.button !== 1 || !hovered.current || blocked(e.target as Element)) return;
      e.preventDefault();
      activateRef.current(e);
    };
    // THE PHONE: tap, then open (interaction.ts tapNext); a tap within 22 px of a light counts
    // (a 44 px target, over the brief's 28).
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      lastPointer = e.pointerType;
      if (e.pointerType === "mouse") {
        // The middle button over a light opens a new tab, not the browser's autoscroll.
        if (e.button === 1 && hovered.current && !blocked(e.target as Element)) e.preventDefault();
        return;
      }
      down = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8;
      down = null;
      if (moved) return;
      const t = e.target as Element;
      if (onLabel(t)) return; // the label's own click decides
      const c = ctl.current;
      let ev: { kind: "light"; i: number } | { kind: "elsewhere" } = { kind: "elsewhere" };
      let k = -1;
      if (c && !c.isFlying() && !blocked(t)) {
        k = nearestLight(c.xy, c.xyCount, e.clientX, e.clientY, 22);
        if (k >= 0) ev = { kind: "light", i: c.xyIndex[k] };
      }
      const next = tapNext(tap.current, ev);
      tap.current = next.state;
      if (next.action === "hide") hideHover();
      else if (next.action === "show" && c && k >= 0) show(c.xyIndex[k], c.xy[2 * k], c.xy[2 * k + 1], true);
      else if (next.action === "open") activateRef.current({ button: 0 });
    };
    const onScroll = () => {
      if (hovered.current) hideHover();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("auxclick", onAux);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("auxclick", onAux);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [revealed, hideHover, showLabel, router]);


  const point = useCallback(
    (area: AreaShot | null) => {
      override.current = area;
      if (!area) {
        schedule();
        return;
      }
      clearTimeout(settle.current);
      setCurrent(area);
      flyTo(area);
    },
    [flyTo, schedule],
  );

  const mask = { WebkitMaskImage: LOGO_HOLE, maskImage: LOGO_HOLE } as const;

  return (
    <AreaContext.Provider value={{ current, point }}>
      <div className="pointer-events-none fixed inset-0 z-0" data-g3d-ground data-g3d-error={error ?? undefined}>
        {/* inert (round 57.5, the sweep's Tab walk): the map element and the controls inside its shadow
            took four Tab stops between the header and the hero's search, with no visible focus. The
            map takes no pointer and is not a control here; the featured cards are the keyboard's
            path to its lights. */}
        <div ref={host} className="absolute inset-0" inert style={night ? { filter: night.filter } : undefined} />
        {/* THE NIGHT'S FLOOR (night.ts): a deep blue-black screened into the graded map's shadows. */}
        {night ? <div aria-hidden className="absolute inset-0" style={{ background: night.tint, mixBlendMode: "screen" }} /> : null}
        {/* OUR LIGHTS (light-layer.ts): over the night, under the scrims and the words. */}
        <canvas ref={lightCanvas} aria-hidden data-g3d-lights className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "plus-lighter" }} />
      </div>
      {/* THE LOAD COVER: our still (see posterGone above), drawn from the map's own hero camera
          (scripts/make-map-cover.mjs): the wide one from the laptop's camera, the tall one from the
          phone's, each shown whole, so the dissolve keeps the composition at both widths. Round
          57.6: it stands OVER the map and our lights and UNDER the same shades the live map has
          (the scrims under the words, the header's shade, the phone's foot), so at the dissolve the
          words, their shades and the lights stay exactly where they are and only the ground gains
          its detail. With JavaScript off nothing places the scrims, so the cover carries its own
          two shades then (and only then). Its images are preloaded by the page, each for its own
          width. */}
      <div
        aria-hidden
        data-g3d-poster
        data-g3d-cover
        data-state={posterGone ? "gone" : "on"}
        data-drop={posterGone ? "dissolve" : undefined}
        {...{ elementtiming: "g3d-poster" }}
        className={`pointer-events-none ${pinned && !error ? "fixed" : "absolute"} inset-x-0 top-0 z-[1] h-[100svh] bg-black bg-cover bg-center bg-no-repeat bg-[image:var(--g3d-tall)] lg:bg-[image:var(--g3d-wide)] transition-opacity duration-[700ms] ease-in-out motion-reduce:transition-none ${posterGone ? "opacity-0" : "opacity-100"}`}
        style={{ "--g3d-tall": `url(${cover.tall})`, "--g3d-wide": `url(${cover.wide})` } as CSSProperties}
      >
        {js && !error ? (
          <div ref={breath} aria-hidden data-g3d-breath className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[image:var(--g3d-tall)] opacity-0 lg:bg-[image:var(--g3d-wide)]" style={{ mixBlendMode: "plus-lighter", filter: "contrast(3)" }} />
        ) : null}
        {js ? null : (
          <>
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,5,0.80) 0%, rgba(5,5,5,0.46) 14%, rgba(5,5,5,0.12) 30%, rgba(5,5,5,0.12) 46%, rgba(5,5,5,0.55) 60%, rgba(5,5,5,0.86) 72%, rgba(5,5,5,0.9) 100%)",
          }}
        />
        {/* The header's shade, as the map has it (topScrim): the cover sits above the map's own
            layers, and cover B's hazy daylight sky left the header's links on a light ground. */}
        <div
          className="absolute inset-x-0 top-0 h-[230px]"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)" }}
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "radial-gradient(66% 88% at 14% 74%, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.88) 30%, rgba(5,5,5,0.6) 56%, rgba(5,5,5,0.22) 80%, rgba(5,5,5,0) 100%)",
          }}
        />
          </>
        )}
      </div>
      {/* THE SHADES AND OUR NAMES: over the ground and the cover alike, under the words. */}
      <div className="pointer-events-none fixed inset-0 z-[2]" data-g3d-shades>
        {look === "veil" ? (
          <div ref={scrimLayer} aria-hidden className="absolute inset-0" style={{ background: `rgba(0,0,0,${veil})`, ...mask }} />
        ) : (
          <div ref={scrimLayer} aria-hidden className="absolute inset-0 overflow-hidden" style={mask}>
            {Array.from({ length: SCRIMS }, (_, k) => (
              <div
                key={k}
                ref={(el) => {
                  scrimEls.current[k] = el;
                }}
                className="absolute left-0 top-0"
                style={{
                  opacity: 0,
                  background: `rgba(0,0,0,${scrim})`,
                  WebkitMaskImage: featherMask(shape.feather),
                  maskImage: featherMask(shape.feather),
                  WebkitMaskComposite: "source-in",
                  maskComposite: "intersect",
                  willChange: "transform",
                }}
              />
            ))}
          </div>
        )}
        <div
          ref={topScrim}
          aria-hidden
          className="absolute inset-x-0 top-0 h-[230px]"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)", willChange: "transform" }}
        >
          {/* Round 57.5 (defect A8): on a phone the territory's top edge is far upstate, and Google's
              "Syracuse" read through the shade above the header's links as if it were a place we
              name. A touch more shade in the top 72 px there (0.86 to 0.94 at the edge). */}
          <div className="absolute inset-x-0 top-0 h-[72px] lg:hidden" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)" }} />
        </div>
        <div
          ref={footShade}
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[26svh] lg:hidden"
          style={{ background: FOOT_SHADE, ...FOOT_HOLE }}
        />
        {tail?.veil ? <div ref={tailVeil} aria-hidden className="absolute inset-0 bg-black" style={{ opacity: 0, ...mask }} /> : null}
        {/* The territory's names (labels.ts): over the map and its lights, under the words. Sentence
            case in the page's own grotesque, white on a soft black halo rather than a box, so they
            read over imagery without looking like Google's chips. Two tiers by SIZE only: the
            counties at 15px, the boroughs at 13px (five of them share the city and must not
            outshout the six that span the valley), both semibold in the full white; a softer white
            for the boroughs was tried and did not read over the city's lights. */}
        <div ref={labelLayer} aria-hidden data-g3d-territory className="absolute inset-0 transition-opacity duration-[250ms] ease-out motion-reduce:transition-none" style={{ opacity: 0 }}>
          {TERRITORY_LABELS.map((l) => (
            <span
              key={l.id}
              ref={(el) => {
                if (el) labelEls.current.set(l.id, el);
                else labelEls.current.delete(l.id);
              }}
              data-area={l.id}
              className={`absolute left-0 top-0 whitespace-nowrap leading-[1.3] ${l.tier === "county" ? "text-[15px] font-semibold tracking-[-0.005em] text-ink" : "text-[13px] font-semibold tracking-[0.005em] text-ink"}`}
              style={{ visibility: "hidden", textShadow: LABEL_SHADOW, transition: "opacity 140ms ease-out" }}
            >
              {l.text}
            </span>
          ))}
        </div>
        {/* The places inside the county the map is holding (towns.ts): the territory names' voice,
            smaller, sentence case, white on the same soft black halo. */}
        <div ref={townLayer} aria-hidden data-g3d-towns className="absolute inset-0 transition-opacity duration-[250ms] ease-out motion-reduce:transition-none" style={{ opacity: 0 }}>
          {TOWN_LABELS.map((t) => (
            <span
              key={t.id}
              ref={(el) => {
                if (el) townEls.current.set(t.id, el);
                else townEls.current.delete(t.id);
              }}
              className="absolute left-0 top-0 whitespace-nowrap text-[13px] font-medium leading-[1.3] tracking-[0.005em] text-ink"
              style={{ visibility: "hidden", textShadow: LABEL_SHADOW, ...TOWN_SHADE, transition: "opacity 140ms ease-out" }}
            >
              {t.text}
            </span>
          ))}
        </div>
      </div>
      {/* THE HOVER LABEL (round 57.3): the hovered or focused home's town, price, beds and baths, in
          our type on the site's black at the chip radius (8 px) with a low hairline; on a phone
          also its street address and "View", the thing to tap. A real link to the listing, so a
          modifier click or "open in new tab" does what it says; out of the tab order (the featured
          cards are the keyboard's path) and hidden from assistive tech (the cards name the homes).
          Positioned by transform only (G3dGround showLabel); 120 ms in, 160 ms out, no fade with
          reduced motion. */}
      <a
        ref={label}
        data-g3d-label
        data-open="0"
        href="/search"
        tabIndex={-1}
        aria-hidden
        onClick={onLabelClick}
        className="fixed left-0 top-0 z-[15] block whitespace-nowrap rounded-lg px-3 py-2 text-ink no-underline transition-opacity ease-out motion-reduce:transition-none [-webkit-tap-highlight-color:transparent]"
        style={{ opacity: 0, pointerEvents: "none", background: "rgba(8,8,8,0.94)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 6px 12px rgba(0,0,0,0.35)", transitionDuration: "120ms" }}
      >
        <span ref={labelTown} className="block text-[13px] font-medium leading-[18px] text-ink-soft" />
        <span ref={labelRow} className="mt-0.5 items-baseline gap-2" style={{ display: "none" }}>
          <span ref={labelPrice} className="text-[14px] font-semibold leading-[20px] tabular-nums text-ink" />
          <span ref={labelFacts} className="text-[13px] leading-[20px] text-ink-soft" />
        </span>
        <span ref={labelAddr} className="mt-1.5 min-h-[24px] items-center justify-between gap-3 border-t border-white/10 pt-1.5" style={{ display: "none" }}>
          <span ref={labelAddrText} className="text-[14px] font-medium leading-[20px] text-ink underline decoration-white/35 underline-offset-4" />
          <span className="text-[14px] font-semibold leading-[20px] text-ink">View</span>
        </span>
      </a>
      <div ref={contentRef} className="relative z-10" style={CLEAR_STYLE}>
        {children}
      </div>
    </AreaContext.Provider>
  );
}

/** The page's words on screen, by their LINES (a label may stand beside a short line), plus the
 * search form's whole box: what the hover label must not stand on (interaction.ts placeHoverLabel's
 * `avoid`). Only the blocks of words over the map (`data-quiet`), and only those on screen. */
function readWordBoxes(vp: { width: number; height: number }): Rect[] {
  const out: Rect[] = [];
  const onScreen = (r: DOMRect) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vp.height && r.right > 0 && r.left < vp.width;
  document.querySelectorAll<HTMLElement>("[data-quiet] :is(p, h1, h2, h3, li, form), p[data-quiet], h1[data-quiet]").forEach((e) => {
    const b = e.getBoundingClientRect();
    if (!onScreen(b)) return;
    if (e.tagName === "FORM") {
      out.push({ x: b.left, y: b.top, w: b.width, h: b.height });
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(e);
    for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) out.push({ x: r.left, y: r.top, w: r.width, h: r.height });
  });
  return out;
}

// ---- the hovered home's price ---------------------------------------------------------------------

/** The lights carry a position and a town, not a price (6 bytes a home, lib/idx/lights.ts). The
 * price and the listing come from the same bounded pins route /search's map uses (the database,
 * cached by the CDN, never MLS Grid), for a small box around the home, once per box. */
const pinCache = new Map<string, Promise<MapPin[]>>();

function pinsAround(lat: number, lng: number): Promise<MapPin[]> {
  const cy = Math.floor(lat * 100), cx = Math.floor(lng * 100);
  const key = `${cy}:${cx}`;
  let p = pinCache.get(key);
  if (!p) {
    const pad = 0.002;
    const q = new URLSearchParams({
      south: (cy / 100 - pad).toFixed(4),
      north: ((cy + 1) / 100 + pad).toFixed(4),
      west: (cx / 100 - pad).toFixed(4),
      east: ((cx + 1) / 100 + pad).toFixed(4),
    });
    p = fetch(`/api/idx/pins?${q}`)
      .then((r) => (r.ok ? r.json() : { pins: [] }))
      .then((j: { pins?: MapPin[] }) => j.pins ?? [])
      .catch(() => {
        pinCache.delete(key);
        return [];
      });
    pinCache.set(key, p);
  }
  return p;
}

async function priceNear(lat: number, lng: number): Promise<MapPin | null> {
  const pins = await pinsAround(lat, lng);
  let best: MapPin | null = null;
  let bd = 80; // metres
  const k = Math.cos((lat * Math.PI) / 180);
  for (const p of pins) {
    const d = Math.hypot((p.lat - lat) * 111_132, (p.lng - lng) * 111_320 * k);
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return best;
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
