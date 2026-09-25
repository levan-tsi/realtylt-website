"use client";

import "maplibre-gl/dist/maplibre-gl.css";
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
import type { FeaturedHome, Homes } from "../g3d/controller";
import { placeKeys } from "../g3d/light-plan";
import { nearestLight } from "../g3d/thinning";
import { TERRITORY_LABELS, placeLabels, type Box } from "../g3d/labels";
import { TOWN_LABELS, townsOf } from "../g3d/towns";
import { focusOf } from "../g3d/cameras";
import { featuredGlyph } from "../g3d/glyph";
import { applyClaims, claims, type LightsState, type MapState } from "../g3d/claims";
import { clickAction, labelContent, namesOverlap, openPoint, placeHoverLabel, tapNext, type LabelContent, type Rect, type TapState } from "../g3d/interaction";
import { MlController } from "./controller";
import type { GroundEngine } from "./engine";
import { ML_SHOTS } from "./shots";
import { projectedItems } from "./names";
import { slowConnection } from "./slow-line";
import { PlateController, type PlateSlotEls } from "../plates/plate-controller";
import { PLATES } from "../plates/plates.gen";
import { TALL_MEDIA, WIDE_MEDIA, plateSrc, plateSrcSet } from "../plates/plate-frame";
import { neighbours } from "../plates/plate-motion";

/** THE MAPLIBRE NIGHT MAP AS THE PAGE'S GROUND (round 57.12, /lab/ml). The Google map's ground
 * (../g3d/G3dGround.tsx, the home page's, untouched) with its engine changed and its design kept:
 * the same sections and `data-shot` driver (../night/driver.ts), one flight per section, the same
 * light layer with its counts, gap and glow, our territory and town names in our type, the hover
 * label, the click that flies in and opens the listing, the phone's tap, the featured cards as the
 * keyboard's path to their lights, the scrims under the words, the cover while the map loads.
 *
 * What went with Google: the night GRADE (a CSS filter over photographs; the style is the night
 * now, ./style.ts), the flight's veil (it hid photographic tiles streaming in; a vector tile is
 * drawn from its parent until it arrives, never grey), the pre-warm walk (it compiled Google's
 * shaders under the cover), the map modes and Google's own labels. Google's logo corner is now the
 * data's credit, bottom left (OpenStreetMap, OpenMapTiles and OpenFreeMap, as their terms ask),
 * and the same corner rules keep it clear. */

interface AreaValue {
  current: AreaShot | null;
  point: (area: AreaShot | null) => void;
}
const AreaContext = createContext<AreaValue>({ current: null, point: () => {} });
export const useMlArea = () => useContext(AreaContext);

const isArea = (n: ShotName): n is AreaShot => n in AREA_COUNTY_OF;

export interface MlTail {
  shot: ShotName;
  veil?: number;
  veilPhone?: number;
}

const LABEL_SHADOW = "0 0 1px rgba(0,0,0,1), 0 0 3px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.8)";
const TOWN_SHADE = {
  background: "radial-gradient(closest-side, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
  padding: "8px 16px",
} as const;
/** The data's credit, bottom left (the Google map's logo corner): no name, light or word of ours
 * goes there. */
const CREDIT_CORNER = { w: 180, h: 54 };
const CREDIT_HOLE = "radial-gradient(210px 64px at 84px 100%, transparent 0, transparent 62%, #000 100%)";
const FOOT_SHADE = "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.86) 66%, rgba(0,0,0,0.86) 72%, rgba(0,0,0,0.15) 100%)";
const FOOT_HOLE_IMAGE = "radial-gradient(300px 92px at 84px 100%, transparent 0, transparent 42%, #000 100%)";
const FOOT_HOLE = { WebkitMaskImage: FOOT_HOLE_IMAGE, maskImage: FOOT_HOLE_IMAGE } as const;

const SCRIMS = 6;
const SCRIM_PAD = 20;
const SCRIM_FEATHER = 150;
const SOFT_SHARE = 0.4;
const LEAD_SHARE = 0.6;
const ramp = (dir: string, f: number) => {
  const e = [0, 0.1, 0.36, 0.72, 1].map((a, k) => `rgba(0,0,0,${a}) ${Math.round((f * k) / 4)}px`);
  const back = [1, 0.72, 0.36, 0.1, 0].map((a, k) => `rgba(0,0,0,${a}) calc(100% - ${Math.round(f - (f * k) / 4)}px)`);
  return `linear-gradient(${dir}, ${e.join(", ")}, ${back.join(", ")})`;
};
const featherMask = (f: number) => `${ramp("to right", f)}, ${ramp("to bottom", f)}`;

const HOLE_W = 320;
const HOLE_H = 88;
const HOLE = "radial-gradient(closest-side, #000 0, #000 80%, transparent 100%)";
const CLEAR_STYLE = {
  WebkitMaskImage: `${HOLE}, linear-gradient(#000, #000)`,
  maskImage: `${HOLE}, linear-gradient(#000, #000)`,
  WebkitMaskSize: `${HOLE_W * 2}px ${HOLE_H * 2}px, 100% 100%`,
  maskSize: `${HOLE_W * 2}px ${HOLE_H * 2}px, 100% 100%`,
  WebkitMaskPosition: `${-HOLE_W}px -9999px, 0 0`,
  maskPosition: `${-HOLE_W}px -9999px, 0 0`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
} as const;

const SETTLE_MS = 110;
const BREATH_PEAK = 0.35;
const BREATH_MS = 4200;
/** The cover's longest hold: past this the map is shown as far as it has drawn (measured: the
 * opening shot's tiles are all drawn in about 2 s on a fast line and 5 s on Slow 4G; the record's
 * round 12). */
const REVEAL_CAP_MS = 8000;

export interface Cover {
  wide: string;
  tall: string;
}

/** Round 58: the ground has two engines behind the same words, names, hover, tap and click
 * (./engine.ts): the plates (the default: seventeen pictures of the map, our lights live on each,
 * ../plates/) and the live MapLibre map ("ml": the plates' renderer and the comparison). The
 * renderer asks for the live map on a plates page with `?ground=ml`. */
export type GroundEngineName = "ml" | "plates";

export function MlGround({ poster, tail, featured = [], engine: engineProp = "ml", children }: { poster: Cover; tail?: MlTail; featured?: readonly FeaturedHome[]; engine?: GroundEngineName; children: ReactNode }) {
  const [engine, setEngine] = useState<GroundEngineName>(engineProp);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("ground") === "ml") setEngine("ml");
  }, []);
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
  const scrimLayer = useRef<HTMLDivElement>(null);
  const footShade = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const holeY = useRef(-1);
  const ctl = useRef<GroundEngine | null>(null);
  const lastIndex = useRef(-1);
  const sections = useRef<ShotSection[]>([]);
  const stops = useRef<ShotStop[]>([]);
  const names = useRef<ShotName[]>([]);
  const override = useRef<AreaShot | null>(null);
  const target = useRef<ShotName | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef(0);
  const tailRef = useRef(tail);
  tailRef.current = tail;
  const [revealed, setRevealed] = useState(false);
  /** The cover (since round 57.13 a frame of this very map at its territory camera, rendered by
   * scripts/make-ml-cover.mjs): over the map until the opening shot is drawn. `?cover=0` shows no cover (the map draws on black
   * as it loads), the measurement's other arm. */
  const [posterGone, setPosterGone] = useState(false);
  const [noCover, setNoCover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
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
  const lightCanvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<AreaShot | null>(null);
  const hovered = useRef<{ i: number; href: string; pin: MapPin | null; pending: Promise<MapPin | null> | null; touch: boolean } | null>(null);
  const focusHome = useRef<FeaturedHome | null>(null);
  const tap = useRef<TapState>({ shown: null });
  const clickLog = useRef<{ at: number; act: string; routedAt: number | null; href: string | null }[]>([]);
  const hoverCost = useRef<{ tests: number; totalMs: number; maxMs: number }>({ tests: 0, totalMs: 0, maxMs: 0 });
  const scheduleRef = useRef<() => void>(() => {});
  const tailVeil = useRef<HTMLDivElement>(null);
  const footerEl = useRef<HTMLElement | null>(null);
  const failed = useRef(false);
  const mapState = useRef<MapState>("cover");
  const lightsState = useRef<LightsState>("pending");
  const syncClaims = () => applyClaims(claims(mapState.current, lightsState.current));

  // ---- OUR NAMES (labels.ts, towns.ts), placed from the map's own projection --------------------
  const labelLayer = useRef<HTMLDivElement>(null);
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

  const screenOf = useCallback((lat: number, lng: number) => ctl.current?.screenOf(lat, lng) ?? null, []);

  const placeTerritory = useCallback(() => {
    const c = ctl.current;
    if (!c?.ready()) return;
    const vp = c.view();
    const els = labelEls.current;
    const byText = new Map([...els.values()].map((e) => [e.textContent ?? "", e]));
    const items = projectedItems(screenOf, vp, (text) => {
      const e = byText.get(text);
      return { w: e ? Math.ceil(e.offsetWidth) : text.length * 9, h: e ? Math.ceil(e.offsetHeight) : 20 };
    }, TERRITORY_LABELS);
    const avoid: Box[] = [];
    const push = (r: DOMRect | { left: number; top: number; width: number; height: number }) => {
      if (r.width > 0 && r.height > 0) avoid.push({ x: r.left, y: r.top, w: r.width, h: r.height });
    };
    document.querySelectorAll("header, [data-g3d-avoid], .rlt-bubble").forEach((e) => push(e.getBoundingClientRect()));
    document.querySelectorAll<HTMLElement>('[data-shot="hero"] :is([data-quiet] :is(p, h1, form), p[data-quiet], h1[data-quiet])').forEach((e) => {
      if (e.tagName === "FORM") return push(e.getBoundingClientRect());
      const range = document.createRange();
      range.selectNodeContents(e);
      for (const r of range.getClientRects()) push(r);
    });
    push({ left: 0, top: vp.height - CREDIT_CORNER.h, width: CREDIT_CORNER.w, height: CREDIT_CORNER.h });
    const placed = new Map(placeLabels(items, avoid, vp).map((p) => [p.id, p]));
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
  }, [screenOf]);

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
    if (!area || !c?.ready()) {
      layer.style.opacity = "0";
      layer.dataset.on = "0";
      return;
    }
    const vp = c.view();
    const els = townEls.current;
    const sizes = townSizes.current;
    const items = projectedItems(screenOf, vp, (text) => {
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
    avoid.push({ x: 0, y: vp.height - CREDIT_CORNER.h, w: CREDIT_CORNER.w, h: CREDIT_CORNER.h });
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
  }, [screenOf]);
  const showTownsRef = useRef(showTowns);
  showTownsRef.current = showTowns;

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    townsOff.current = q.get("towns") === "0";
    if (q.get("cover") === "0") setNoCover(true);
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

  // Round 57.13 (the page's own scroll cost, measured with the map blocked): every scroll frame here
  // cost 10 to 20 ms of forced style and layout, because it WROTE first (a custom property on the
  // element holding the whole page, which every descendant inherits, so the whole page's style was
  // recalculated) and then READ rectangles. Now it reads everything first, then writes, and the
  // credit corner's hole moves by the element's own mask-position (nothing inherits it).
  const placeScrims = useCallback(() => {
    const vh = window.innerHeight;
    const reach = SCRIM_PAD + SCRIM_FEATHER;
    const wide = window.innerWidth >= 1024;
    const shareOf = (q: string | undefined) => (!wide ? 1 : q === "soft" ? SOFT_SHARE : q === "lead" ? LEAD_SHARE : 1);
    const blocks = [...document.querySelectorAll<HTMLElement>("[data-quiet]")]
      .map((el) => ({ r: el.getBoundingClientRect(), share: shareOf(el.dataset.quiet) }))
      .filter(({ r }) => r.width > 8 && r.height > 8 && r.bottom > -reach && r.top < vh + reach)
      .sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)
      .slice(0, SCRIMS);
    const t = tailRef.current;
    const footTop = tailVeil.current && t?.veil && footerEl.current ? footerEl.current.getBoundingClientRect().top : Infinity;
    // ---- writes only from here ----
    const content = contentRef.current;
    if (content) {
      const y = Math.round(window.scrollY + vh - HOLE_H);
      if (y !== holeY.current) {
        holeY.current = y;
        const pos = `${-HOLE_W}px ${y}px, 0 0`;
        content.style.maskPosition = pos;
        content.style.webkitMaskPosition = pos;
      }
    }
    if (topScrim.current) topScrim.current.style.transform = `translate3d(0, ${-Math.min(window.scrollY, 400)}px, 0)`;
    if (footShade.current) footShade.current.style.opacity = String(Math.max(0, 1 - window.scrollY / 320));
    if (tailVeil.current && t?.veil) {
      const k = Math.min(1, Math.max(0, (vh - footTop) / (vh * 0.5)));
      const max = window.innerWidth < 1024 ? (t.veilPhone ?? t.veil) : t.veil;
      tailVeil.current.style.opacity = String(Math.round(k * max * 1000) / 1000);
    }
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
    clearTimeout(wordsTimer.current);
    wordsTimer.current = setTimeout(() => {
      wordBoxes.current ??= readWordBoxes({ width: window.innerWidth, height: window.innerHeight });
    }, 180);
    placeScrims();
    showTerritoryRef.current();
    if (townLayer.current?.dataset.on === "1") showTownsRef.current();
    if (!stops.current.length || override.current) return;
    const { index } = shotPosition(stops.current, window.scrollY);
    const name = names.current[index];
    if (!name) return;
    // Round 58: the plates on either side of where the page is, decoded ahead of the scroll.
    if (index !== lastIndex.current) {
      lastIndex.current = index;
      ctl.current?.warm?.(neighbours(names.current, index));
    }
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

  // ---- THE HOVER LABEL (the Google map's, round 57.3) --------------------------------------------
  const fontRef = useRef<string | null>(null);
  const measureCtx = useRef<CanvasRenderingContext2D | null>(null);
  const lastFont = useRef("");
  const widths = useRef(new Map<string, number>());
  const textW = (text: string, px: number, weight: number) => {
    const key = `${weight}/${px}/${text}`;
    const hit = widths.current.get(key);
    if (hit !== undefined) return hit;
    let c = measureCtx.current;
    if (!c) c = measureCtx.current = document.createElement("canvas").getContext("2d");
    if (!c) return text.length * px * 0.55;
    if (fontRef.current === null) fontRef.current = label.current ? getComputedStyle(label.current).fontFamily : "sans-serif";
    const font = `${weight} ${px}px ${fontRef.current}`;
    if (lastFont.current !== font) c.font = lastFont.current = font;
    const width = c.measureText(text).width;
    if (widths.current.size > 4000) widths.current.clear();
    widths.current.set(key, width);
    return width;
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
    const addr = touch ? content.address : null;
    const row = content.price ? textW(content.price, 14, 600) + (content.facts ? 8 + textW(content.facts, 13, 400) : 0) : 0;
    const addrW = addr ? textW(addr, 14, 500) + 12 + textW("View", 14, 600) : 0;
    const w = Math.ceil(Math.max(textW(content.town, 13, 500), row, addrW)) + 26;
    const h = 16 + 2 + 18 + (content.price ? 22 : 0) + (addr ? 37 : 0);
    const vp = { width: window.innerWidth, height: window.innerHeight };
    const avoid: Rect[] = [{ x: 0, y: vp.height - CREDIT_CORNER.h, w: CREDIT_CORNER.w, h: CREDIT_CORNER.h }];
    const hr = headerRect.current;
    if (hr && hr.y + hr.h - window.scrollY > 0) avoid.push({ ...hr, y: hr.y - window.scrollY });
    avoid.push(...(wordBoxes.current ??= readWordBoxes(vp)));
    const p = placeHoverLabel(at, { w, h }, vp, { keep, avoid });
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
    const el = host.current;
    if (!el) return;
    measure();
    // Round 58: `?plate=<shot>` pins the map on one shot whatever the scroll (the plate renderer,
    // scripts/make-plates.mjs, photographs each shot this way).
    const pinned = new URLSearchParams(window.location.search).get("plate");
    const pin = pinned && pinned in ML_SHOTS ? (pinned as ShotName) : null;
    const initial = pin ?? (stops.current.length ? names.current[shotPosition(stops.current, window.scrollY).index] ?? "hero" : "hero");
    target.current = initial;
    if (pin) override.current = pin as AreaShot;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = new URLSearchParams(window.location.search);
    const num = (k: string) => (q.has(k) && Number.isFinite(Number(q.get(k))) ? Number(q.get(k)) : undefined);
    const shared = {
      reduced,
      viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
      initial,
      glow: num("glow"),
      halo: num("halo"),
      cityGap: num("gap"),
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
    };
    const install = (c: GroundEngine) => {
      ctl.current = c;
      c.setAvoid({ x: 0, y: window.innerHeight - CREDIT_CORNER.h, w: CREDIT_CORNER.w, h: CREDIT_CORNER.h });
      (window as unknown as { __ml?: unknown }).__ml = {
        ctl: c,
        engine,
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
    };
    if (engine === "plates") {
      // THE PLATES (round 58, ../plates/plate-controller.ts): two layers, each a picture with its
      // own light canvas; the first holds the territory the server rendered. No WebGL is needed.
      const slots: PlateSlotEls[] = [...el.querySelectorAll<HTMLElement>("[data-plate-slot]")].map((root) => ({
        root,
        picture: root.querySelector("picture")!,
        img: root.querySelector("img")!,
        canvas: root.querySelector("canvas")!,
      }));
      const c = new PlateController({
        ...shared,
        manifest: PLATES,
        slots,
        onReveal: () => {
          setRevealed(true);
          mapState.current = "live";
          if (lightsState.current === "some" && c.stats().planned === 0) lightsState.current = "none";
          syncClaims();
          setPosterGone(true);
          labelsPlaced.current = false;
          showTerritoryRef.current();
          if (stops.current.length) c.warm(neighbours(names.current, shotPosition(stops.current, window.scrollY).index));
        },
        onError: (m) => {
          if (failed.current) return;
          failed.current = true;
          mapState.current = "failed";
          syncClaims();
          setError(m);
          showTerritoryRef.current();
          console.warn("[plates]", m);
        },
      });
      install(c);
      void c.start();
      const noHomes = q.get("homes") === "0";
      void loadLights().then((pts) => {
        lightsState.current = !pts || noHomes ? "none" : "some";
        syncClaims();
        if (!pts || noHomes) return;
        c.setHomes(homesOf(pts));
      });
      void loadElevation().then((g) => c.setElevation(g)).catch(() => {});
      return () => {
        c.stop();
        ctl.current = null;
      };
    }
    let glOk = false;
    try {
      const cv = document.createElement("canvas");
      glOk = !!cv.getContext("webgl2");
    } catch {}
    if (!glOk) {
      failed.current = true;
      setError("no webgl2");
      return;
    }
    setPinned(true);
    // The slow line (./slow-line.ts), known up front from the browser; `?slow=1` and `?slow=0` force
    // either arm for a measurement.
    const slow = q.get("slow") === "1" || (q.get("slow") !== "0" && slowConnection((navigator as Navigator & { connection?: { effectiveType?: string } }).connection));
    const c = new MlController({
      ...shared,
      slow,
      watchFirstTile: q.get("slow") !== "0",
      canvas: lightCanvas.current,
      revealOn: q.get("cover") === "0" ? "paint" : "idle",
      revealCapMs: num("cap") ?? REVEAL_CAP_MS,
      terrain: q.get("terrain") !== "0",
      buildings: q.get("buildings") !== "0",
      hillshade: q.get("hillshade") !== "0",
      exaggeration: num("exag"),
      demTile: q.get("dem") ? Number(q.get("dem")!.split(":")[0]) || undefined : undefined,
      demMaxzoom: q.get("dem") ? Number(q.get("dem")!.split(":")[1]) || undefined : undefined,
      pixelRatio: num("pr"),
      onReveal: () => {
        setRevealed(true);
        mapState.current = "live";
        if (lightsState.current === "some" && c.stats().planned === 0) lightsState.current = "none";
        syncClaims();
        setPosterGone(true);
        labelsPlaced.current = false;
        showTerritoryRef.current();
      },
      onError: (m) => {
        if (failed.current) return;
        failed.current = true;
        mapState.current = "failed";
        syncClaims();
        setError(m);
        setPosterGone(false);
        c.layer?.stop();
        if (lightCanvas.current) lightCanvas.current.style.visibility = "hidden";
        showTerritoryRef.current();
        console.warn("[ml]", m);
      },
    });
    install(c);
    const mapEl = el.querySelector<HTMLElement>("[data-ml-map]");
    if (!mapEl) return;
    void c.start(mapEl);
    const noHomes = q.get("homes") === "0";
    void loadLights().then((pts) => {
      lightsState.current = !pts || noHomes ? "none" : "some";
      syncClaims();
      if (!pts || noHomes) return;
      c.setHomes(homesOf(pts));
    });
    // Our homes' heights on the terrain (367 KB); the flat map of a slow line needs none.
    if (!slow) void loadElevation().then((g) => c.setElevation(g)).catch(() => {});
    return () => {
      c.stop();
      ctl.current = null;
    };
  }, [engine, measure, flyTo, hideHover, hideLabel]);

  useEffect(() => {
    const onResize = () => {
      measure();
      const c = ctl.current;
      if (c) {
        c.resized();
        c.setAvoid({ x: 0, y: window.innerHeight - CREDIT_CORNER.h, w: CREDIT_CORNER.w, h: CREDIT_CORNER.h });
      }
      scrimSizes.current = [];
      wordBoxes.current = null;
      labelsPlaced.current = false;
      schedule();
    };
    onResize();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => {
      measure();
      schedule();
    });
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
      clearTimeout(settle.current);
    };
  }, [measure, schedule]);

  // THE FEATURED HOMES AND THE KEYBOARD (the Google map's rule, round 57.3).
  const showFocus = useCallback(() => {
    const h = focusHome.current;
    const c = ctl.current;
    if (!h || !c || c.isFlying()) return;
    const p = c.screenOf(h.lat, h.lng);
    if (!p) return;
    const pin = h.price ? { price: h.price, beds: h.beds ?? 0, baths: h.baths ?? 0, address: h.address ?? "", city: h.city ?? "" } : null;
    showLabel(p, keepOf(2 * featuredGlyph(c.layer?.glyph ?? { core: 1.5, halo: 6, haloAlpha: 0.4, glow: 0, glowAlpha: 0 }).core), labelContent(h.city ?? "", pin), false, h.href);
  }, [showLabel]);
  const showFocusRef = useRef(showFocus);
  showFocusRef.current = showFocus;

  useEffect(() => {
    const c = ctl.current;
    if (!revealed || !c) return;
    c.setFeatured(featuredRef.current);
    const byId = new Map(featuredRef.current.map((h) => [h.id, h]));
    const homeOf = (t: EventTarget | null) => {
      const a = (t as Element | null)?.closest?.('a[href*="bid-38-"]');
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
      const { width: vw, height: vh } = c.view();
      const vp = { width: vw, height: vh };
      const card = (e.target as Element).closest("a")?.getBoundingClientRect();
      const solids: Rect[] = [];
      document.querySelectorAll('header, a[href*="bid-38-"], h1, h2, h3, p, button, [data-g3d-avoid], .rlt-bubble').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vp.height && r.right > 0 && r.left < vp.width) solids.push({ x: r.left, y: r.top, w: r.width, h: r.height });
      });
      const spot = openPoint(solids, vp, card ? { x: card.left + card.width / 2, y: card.top + card.height / 2 } : { x: vp.width / 2, y: vp.height / 2 }, {
        avoid: [{ x: 0, y: vp.height - CREDIT_CORNER.h, w: CREDIT_CORNER.w, h: CREDIT_CORNER.h }],
      });
      c.flyToHome(h, spot, 1800);
      c.lightFeatured(h.id);
    };
    const onOut = (e: FocusEvent) => {
      if (!focusHome.current || homeOf(e.relatedTarget)) return;
      focusHome.current = null;
      c.lightFeatured(null);
      hideLabel();
      override.current = null;
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

  // THE CLICK (the Google map's, round 57.3): over a still map a short fly-in, then the listing.
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
      const log = { at: Math.round(performance.now()), act, routedAt: null as number | null, href: null as string | null };
      clickLog.current.push(log);
      if (clickLog.current.length > 40) clickLog.current.shift();
      if (act === "tab") {
        if (h.pin || !h.pending) {
          window.open(h.href, "_blank", "noopener");
          log.href = h.href;
        } else {
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
      const here = window.location.pathname;
      void Promise.all([fly, pin]).then(([, p]) => {
        const href = p ? listingPath(p) : fallback;
        log.routedAt = Math.round(performance.now());
        log.href = href;
        router.push(href);
        setTimeout(() => {
          if (window.location.pathname !== here || !ctl.current) return;
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

  const onLabelClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (focusHome.current && !hovered.current) {
      router.push(focusHome.current.href);
      return;
    }
    activateRef.current({ button: 0 });
  };

  // HOVER and TAP (the Google map's, rounds 57.3 and 57.5).
  useEffect(() => {
    if (!revealed) return;
    let raf = 0;
    let px = 0, py = 0;
    let over: Element | null = null;
    const blocked = (t: Element | null) => !!t?.closest("a,button,input,select,textarea,label,form,[role=dialog],[data-quiet],header,footer,iframe,[data-g3d-label],[data-ml-credit]");
    const onLabel = (t: Element | null) => !!t?.closest("[data-g3d-label]");
    textW("$0 3 bd, 2 ba", 14, 600);
    labelContent("", { price: 1, beds: 1, baths: 1, address: "", city: "" });
    const show = (i: number, x: number, y: number, touch: boolean) => {
      const c = ctl.current!;
      clearTimeout(hideTimer.current);
      if (hovered.current?.i === i) return;
      focusHome.current = null;
      const town = c.townOf(i);
      const home = c.homeAt(i);
      const pending = home ? new Promise<MapPin | null>((r) => setTimeout(() => void priceNear(home.lat, home.lng).then(r), 0)) : null;
      const h = { i, href: townSearchHref(town), pin: null as MapPin | null, pending, touch };
      hovered.current = h;
      const keep = keepOf(c.stats().glyph);
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
      hideTimer.current = setTimeout(() => {
        hideTimer.current = undefined;
        hideHover();
      }, 120);
    };
    const test = () => {
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
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      lastPointer = e.pointerType;
      if (e.pointerType === "mouse") {
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
      if (onLabel(t)) return;
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

  const mask = { WebkitMaskImage: CREDIT_HOLE, maskImage: CREDIT_HOLE } as const;
  const coverOn = engine === "ml" && !noCover;
  const plates = engine === "plates";

  return (
    <AreaContext.Provider value={{ current, point }}>
      <div ref={host} className="pointer-events-none fixed inset-0 z-0 bg-black" data-ml-ground data-plates={plates ? "1" : undefined} data-ml-error={error ?? undefined}>
        {plates ? (
          // THE PLATES (round 58): two layers, each a picture of the map and the canvas our lights are
          // drawn on (plus-lighter, within the layer, so the lights fade with their picture). The first
          // layer is server-rendered with the territory: AVIF then WebP, the tall or the wide picture
          // by the page's own breakpoint, the browser taking the width its screen needs. The second
          // layer waits empty (no srcset, no src: nothing loads) for the first transition.
          [0, 1].map((k) => (
            <div key={k} data-plate-slot={k} data-shot={k === 0 ? "hero" : undefined} className="absolute inset-0 will-change-[transform,opacity]" style={{ opacity: k === 0 ? 1 : 0, zIndex: k === 0 ? 2 : 1 }}>
              <picture>
                {(["avif", "webp"] as const).map((f) =>
                  (["tall", "wide"] as const).map((a) => (
                    <source key={`${f}-${a}`} type={`image/${f}`} media={a === "tall" ? TALL_MEDIA : WIDE_MEDIA} data-plate-src={`${f}-${a}`} srcSet={k === 0 ? plateSrcSet("hero", a, PLATES.hero[a], f) : undefined} sizes={k === 0 ? "100vw" : undefined} />
                  )),
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" decoding="async" fetchPriority={k === 0 ? "high" : undefined} data-shot={k === 0 ? "hero" : undefined} src={k === 0 ? plateSrc("hero", "wide", PLATES.hero.wide.widths[PLATES.hero.wide.widths.length - 1], "webp") : undefined} className="absolute inset-0 h-full w-full object-cover" />
              </picture>
              <canvas aria-hidden data-g3d-lights className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "plus-lighter" }} />
            </div>
          ))
        ) : (
          <>
            {/* The map: inert (it takes no pointer and no focus; the featured cards are the keyboard's path). */}
            {/* Inline position: maplibre-gl.css makes its container `position: relative`, which would take the
                class's `absolute` and leave the map 0 px tall. */}
            <div inert data-ml-map style={{ position: "absolute", inset: 0 }} />
            {/* OUR LIGHTS (../g3d/light-layer.ts): over the map, under the scrims and the words. */}
            <canvas ref={lightCanvas} aria-hidden data-g3d-lights className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "plus-lighter" }} />
          </>
        )}
      </div>
      {plates && !js ? (
        // With JavaScript off (and for the moment before it runs) the plate stands under the words
        // with the same shade the cover carried: the lights and the scrims are the script's.
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[100svh]">
          <div
            className="absolute inset-0 lg:hidden"
            style={{ background: "linear-gradient(to bottom, rgba(5,5,5,0.80) 0%, rgba(5,5,5,0.46) 14%, rgba(5,5,5,0.12) 30%, rgba(5,5,5,0.12) 46%, rgba(5,5,5,0.55) 60%, rgba(5,5,5,0.86) 72%, rgba(5,5,5,0.9) 100%)" }}
          />
          <div className="absolute inset-x-0 top-0 h-[230px]" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)" }} />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{ background: "radial-gradient(66% 88% at 14% 74%, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.88) 30%, rgba(5,5,5,0.6) 56%, rgba(5,5,5,0.22) 80%, rgba(5,5,5,0) 100%)" }}
          />
        </div>
      ) : null}
      {plates ? (
        // No script, no lights on the plate: the words say nothing about lights (../g3d/claims.ts).
        <noscript>
          <style>{`[data-lights-claim]{display:none}`}</style>
        </noscript>
      ) : null}
      {coverOn ? (
        <div
          aria-hidden
          data-g3d-poster
          data-g3d-cover
          data-state={posterGone ? "gone" : "on"}
          className={`pointer-events-none ${pinned && !error ? "fixed" : "absolute"} inset-x-0 top-0 z-[1] h-[100svh] bg-black bg-cover bg-center bg-no-repeat bg-[image:var(--g3d-tall)] lg:bg-[image:var(--g3d-wide)] transition-opacity duration-[700ms] ease-in-out motion-reduce:transition-none ${posterGone ? "opacity-0" : "opacity-100"}`}
          style={{ "--g3d-tall": `url(${poster.tall})`, "--g3d-wide": `url(${poster.wide})` } as CSSProperties}
        >
          {js && !error ? (
            <div ref={breath} aria-hidden data-g3d-breath className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[image:var(--g3d-tall)] opacity-0 lg:bg-[image:var(--g3d-wide)]" style={{ mixBlendMode: "plus-lighter", filter: "contrast(3)" }} />
          ) : null}
          {js ? null : (
            <>
              <div
                className="absolute inset-0 lg:hidden"
                style={{ background: "linear-gradient(to bottom, rgba(5,5,5,0.80) 0%, rgba(5,5,5,0.46) 14%, rgba(5,5,5,0.12) 30%, rgba(5,5,5,0.12) 46%, rgba(5,5,5,0.55) 60%, rgba(5,5,5,0.86) 72%, rgba(5,5,5,0.9) 100%)" }}
              />
              <div className="absolute inset-x-0 top-0 h-[230px]" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)" }} />
              <div
                className="absolute inset-0 hidden lg:block"
                style={{ background: "radial-gradient(66% 88% at 14% 74%, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.88) 30%, rgba(5,5,5,0.6) 56%, rgba(5,5,5,0.22) 80%, rgba(5,5,5,0) 100%)" }}
              />
            </>
          )}
        </div>
      ) : null}
      <div className="pointer-events-none fixed inset-0 z-[2]" data-g3d-shades>
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
                background: "rgba(0,0,0,0.8)",
                WebkitMaskImage: featherMask(SCRIM_FEATHER),
                maskImage: featherMask(SCRIM_FEATHER),
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
                willChange: "transform",
              }}
            />
          ))}
        </div>
        <div
          ref={topScrim}
          aria-hidden
          className="absolute inset-x-0 top-0 h-[230px]"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)", willChange: "transform" }}
        >
          <div className="absolute inset-x-0 top-0 h-[72px] lg:hidden" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)" }} />
        </div>
        <div ref={footShade} aria-hidden className="absolute inset-x-0 bottom-0 h-[26svh] lg:hidden" style={{ background: FOOT_SHADE, ...FOOT_HOLE }} />
        {tail?.veil ? <div ref={tailVeil} aria-hidden className="absolute inset-0 bg-black" style={{ opacity: 0, ...mask }} /> : null}
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
      {/* THE DATA'S CREDIT (./style.ts ATTRIBUTION, as OpenFreeMap's and OpenStreetMap's terms ask):
          bottom left, where the Google map kept its logo, over everything, never under a word of ours. */}
      <p
        data-ml-credit
        className="pointer-events-auto fixed bottom-2 left-3 z-[12] m-0 max-w-[176px] text-[11px] leading-[15px] text-white/60 [&_a]:underline-offset-2 hover:[&_a]:underline"
        style={{ textShadow: "0 0 4px rgba(0,0,0,0.9)" }}
      >
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          © OpenStreetMap contributors
        </a>
        <br />
        <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">
          © OpenMapTiles
        </a>{" "}
        ·{" "}
        <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">
          OpenFreeMap
        </a>
      </p>
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

/** The lights' homes as the engines take them (lib/idx/lights.ts unpacked: the box's 0..1 grid
 * turned into degrees, each home's county and town, and its place key for the planner's order). */
function homesOf(pts: NonNullable<Awaited<ReturnType<typeof loadLights>>>): Homes {
  const n = pts.x.length;
  const lat = new Float64Array(n), lng = new Float64Array(n);
  const county: string[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const [a, b] = boxUVToLngLat(pts.x[i], pts.y[i], pts.box);
    lng[i] = a;
    lat[i] = b;
    county[i] = pts.townCounty[pts.town[i]] ?? "";
  }
  return { lat, lng, county, key: placeKeys(pts.x, pts.y), town: pts.town, towns: pts.towns };
}

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

/** The hovered home's price: the bounded pins route /search's map uses (our database, cached by
 * the CDN, never MLS Grid), a small box around the home, once per box (the Google map's). */
const pinCache = new Map<string, Promise<MapPin[]>>();
function pinsAround(lat: number, lng: number): Promise<MapPin[]> {
  const cy = Math.floor(lat * 100), cx = Math.floor(lng * 100);
  const key = `${cy}:${cx}`;
  let p = pinCache.get(key);
  if (!p) {
    const pad = 0.002;
    const q = new URLSearchParams({ south: (cy / 100 - pad).toFixed(4), north: ((cy + 1) / 100 + pad).toFixed(4), west: (cx / 100 - pad).toFixed(4), east: ((cx + 1) / 100 + pad).toFixed(4) });
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
  let bd = 80;
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
