"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { loadLights } from "@/lib/idx/lights-client";
import { listingPath } from "@/lib/idx/listing-url";
import type { MapPin } from "@/lib/idx/types";
import { shotPosition, shotStops, withTail, type ShotSection, type ShotStop } from "../night/driver";
import { loadElevation } from "../night/elevation";
import { townSearchHref } from "../night/lights";
import { AREA_COUNTY_OF, AREA_FLIGHT, type AreaShot, type ShotName } from "../night/shots";
import { boxUVToLngLat } from "../night/world";
import { G3dController, type FeaturedHome, type Homes } from "./controller";
import { nearestLight } from "./thinning";
import { GOOGLE_CITY_LABELS, TERRITORY_LABELS, labelItems, placeLabels, type Box } from "./labels";

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
/** Google's logo and legal link, bottom left: no name of ours goes there. */
const LOGO_CORNER = { w: 180, h: 54 };

/** The hole the looks leave for Google's logo and legal link, bottom left (policy: visible and
 * unobscured). Measured on the frames: the logo runs x 12..116, the (i) to x 150, y within 36 px
 * of the bottom. */
const LOGO_HOLE = "radial-gradient(210px 64px at 84px 100%, transparent 0, transparent 62%, #000 100%)";

/** THE SCRIMS (round 56 phase 1b): up to SCRIMS blocks of words at once, each shaded SCRIM_PAD px
 * past its box and fading to nothing over the next SCRIM_FEATHER px, so no edge reads as a
 * rectangle. Six, not four: at the Dutchess stop the hero's two blocks are still on screen with the
 * intake's, and "Start here" fell off the end of four (2.8:1 at p99). */
const SCRIMS = 6;
const SCRIM_PAD = 28;
const SCRIM_FEATHER = 80;
const SCRIM_REACH = SCRIM_PAD + SCRIM_FEATHER;
/** An eased ramp (smoothstep through five stops), not a straight one: a linear fade leaves a
 * visible band where it meets the solid shade (seen on the first frames). */
const ramp = (dir: string) => {
  const e = [0, 0.1, 0.36, 0.72, 1].map((a, k) => `rgba(0,0,0,${a}) ${Math.round((SCRIM_FEATHER * k) / 4)}px`);
  const back = [1, 0.72, 0.36, 0.1, 0].map((a, k) => `rgba(0,0,0,${a}) calc(100% - ${Math.round(SCRIM_FEATHER - (SCRIM_FEATHER * k) / 4)}px)`);
  return `linear-gradient(${dir}, ${e.join(", ")}, ${back.join(", ")})`;
};
const FEATHER = `${ramp("to right")}, ${ramp("to bottom")}`;

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

export function G3dGround({ poster, tail, featured = [], children }: { poster: string; tail?: G3dTail; featured?: readonly FeaturedHome[]; children: ReactNode }) {
  const featuredRef = useRef(featured);
  featuredRef.current = featured;
  const host = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const scrimEls = useRef<(HTMLDivElement | null)[]>([]);
  const scrimSizes = useRef<string[]>([]);
  const topScrim = useRef<HTMLDivElement>(null);
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
  const lookRef = useRef<Look>("scrim");
  lookRef.current = look;
  const [revealed, setRevealed] = useState(false);
  /** OUR POSTER is the load cover (round 56 phase 1b): the night flight's own still, our artwork,
   * in the first bytes of HTML, until the map has drawn the page's first shot. A still of Google's
   * map may never be stored or shipped (policy), so the cover is ours. It dissolves in 400 ms once
   * the map is drawn; it goes AT ONCE when the visitor scrolls past 24 px (the round-55 rule of
   * the night flight, components/home/night/NightGround.tsx: a still that stays while the page
   * moves reads as a freeze); and it stays for good if the map cannot load (no key, `gmp-error`),
   * so a failure leaves our picture, not a black screen. */
  const [posterGone, setPosterGone] = useState<false | "dissolve" | "scroll">(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<AreaShot | null>(null);
  const hovered = useRef<{ i: number; href: string } | null>(null);
  const hoverCost = useRef({ tests: 0, totalMs: 0, maxMs: 0 });
  const scheduleRef = useRef<() => void>(() => {});
  const tailVeil = useRef<HTMLDivElement>(null);
  const footerEl = useRef<HTMLElement | null>(null);
  /** The map failed (no key, no WebGL, the script blocked, gmp-error): our poster stays for good. */
  const failed = useRef(false);

  // ---- THE TERRITORY'S NAMES (round 57, labels.ts) ------------------------------------------------
  // Drawn only while the page sits at its top and the map holds the hero shot still: they fade out
  // (250 ms) as soon as the reader scrolls or the camera leaves, and come back only when both are
  // true again. Placed from the camera the map is actually on, re-placed on every resize.
  const labelLayer = useRef<HTMLDivElement>(null);
  const labelEls = useRef(new Map<string, HTMLSpanElement>());
  const labelsPlaced = useRef(false);

  const placeTerritory = useCallback(() => {
    const c = ctl.current;
    const cam = c?.camera() as { fov?: number } | null | undefined;
    if (!c || !cam) return;
    const vp = { width: window.innerWidth, height: window.innerHeight, fov: cam.fov ?? 40 };
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
    document.querySelectorAll<HTMLElement>('[data-shot="hero"] [data-quiet] :is(p, h1, form)').forEach((e) => {
      if (e.tagName === "FORM") return push(e.getBoundingClientRect());
      const range = document.createRange();
      range.selectNodeContents(e);
      for (const r of range.getClientRects()) push(r);
    });
    push({ left: 0, top: vp.height - LOGO_CORNER.h, width: LOGO_CORNER.w, height: LOGO_CORNER.h });
    for (const g of labelItems(c.camera()!, vp, (t) => ({ w: t.length * 12 + 12, h: 30 }), GOOGLE_CITY_LABELS)) {
      avoid.push({ x: g.x - g.w / 2, y: g.y - g.h / 2, w: g.w, h: g.h });
    }
    const placed = new Map(placeLabels(items, avoid, vp).map((p) => [p.id, p]));
    for (const [id, e] of els) {
      const p = placed.get(id);
      e.style.visibility = p ? "visible" : "hidden";
      if (p) e.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
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

  // The look, from the query string (the lab's switch).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("look") === "veil") setLook("veil");
    if (q.get("veil")) setVeil(Number(q.get("veil")));
    if (q.get("scrim")) setScrim(Number(q.get("scrim")));
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
    const rects = [...document.querySelectorAll<HTMLElement>("[data-quiet]")]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 8 && r.height > 8 && r.bottom > -SCRIM_REACH && r.top < vh + SCRIM_REACH)
      .sort((a, b) => b.width * b.height - a.width * a.height)
      .slice(0, SCRIMS);
    for (let k = 0; k < SCRIMS; k++) {
      const el = scrimEls.current[k];
      if (!el) continue;
      const r = rects[k];
      if (!r) {
        el.style.opacity = "0";
        continue;
      }
      const size = `${Math.round(r.width)}x${Math.round(r.height)}`;
      if (scrimSizes.current[k] !== size) {
        scrimSizes.current[k] = size;
        el.style.width = `${Math.round(r.width) + 2 * SCRIM_REACH}px`;
        el.style.height = `${Math.round(r.height) + 2 * SCRIM_REACH}px`;
      }
      el.style.transform = `translate3d(${Math.round(r.left) - SCRIM_REACH}px, ${Math.round(r.top) - SCRIM_REACH}px, 0)`;
      el.style.opacity = "1";
    }
  }, []);

  const flyTo = useCallback((name: ShotName) => {
    target.current = name;
    ctl.current?.flyToShot(name);
  }, []);

  const apply = useCallback(() => {
    placeScrims();
    showTerritoryRef.current();
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

  const hideHover = useCallback(() => {
    hovered.current = null;
    if (halo.current) halo.current.style.opacity = "0";
    if (label.current) label.current.style.opacity = "0";
    document.documentElement.style.cursor = "";
  }, []);
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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // THE PRE-WARM WALK (controller.ts): the shots the page will fly to, in the page's order, under
    // the poster, until the budget runs out. Measured (docs/parity/DESIGN-ROUND56.md §8): the whole
    // walk takes 20 to 30 s even on a warm profile (each shot 1.4 to 2.1 s to draw) and leaves the
    // flights' hitches where they were; ONE shot, the first the reader flies to, takes 2 to 4 s and
    // removes the cold first flight's 300 ms stall. So the budget is 1.5 s: the walk visits the next
    // shot and stops. `?warm=0|lite|full|fly` and `?warmBudget=` are the lab's switches (lite: the
    // six chapters and the first two counties; fly: flown in 400 ms instead of set).
    const q = new URLSearchParams(window.location.search);
    const warmQ = q.get("warm") ?? "full";
    const pageShots = [...new Set(names.current)].filter((n) => n !== initial);
    const warm = warmQ === "0" ? [] : warmQ === "lite" ? pageShots.filter((n) => !isArea(n) || AREA_FLIGHT.indexOf(n) < 2) : pageShots;
    const c = new G3dController({
      key,
      reduced,
      viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
      initial,
      warm,
      warmMode: warmQ === "fly" ? "fly" : "jump",
      warmBudgetMs: Number(q.get("warmBudget") ?? 1500),
      holdFlights: q.get("gate") === "1",
      maxWaitMs: Number(q.get("maxWait") ?? 1200),
      flightMs: (q.get("flight") ?? "1600,2600").split(",").map(Number) as unknown as readonly [number, number],
      firstStep: q.get("ladder") === "first",
      description: "Map of the Hudson Valley and New York City, with the homes for sale lit where they stand.",
      onReveal: () => {
        setRevealed(true);
        setPosterGone((g) => g || "dissolve");
        labelsPlaced.current = false;
        showTerritoryRef.current();
      },
      onLand: () => {
        labelsPlaced.current = false;
        showTerritoryRef.current();
      },
      onFlightStart: () => {
        hideHover();
        showTerritoryRef.current();
      },
      onError: (m) => {
        // Once, whatever fails: the poster comes back (or never left) and stays.
        if (failed.current) return;
        failed.current = true;
        setError(m);
        setPosterGone(false);
        showTerritoryRef.current();
        console.warn("[g3d]", m);
      },
    });
    ctl.current = c;
    (window as unknown as { __g3d?: unknown }).__g3d = {
      ctl: c,
      stats: () => c.stats(),
      hover: hoverCost.current,
      fly: (n: ShotName) => flyTo(n),
      hovered: () => hovered.current,
      stops: () => stops.current.map((x) => ({ name: x.name, anchor: Math.round(x.anchor) })),
      territory: () => ({ on: labelLayer.current?.dataset.on === "1", placed: (labelLayer.current?.dataset.placed ?? "").split(",").filter(Boolean) }),
    };
    void c.start(el);
    // Our homes, and the terrain the hover maths stands them on.
    // `?homes=0`: the map alone, for the frame-time probe to tell the map's cost from ours.
    const noHomes = new URLSearchParams(window.location.search).get("homes") === "0";
    void loadLights().then((pts) => {
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
      const homes: Homes = { lat, lng, county, town: pts.town, towns: pts.towns };
      c.setHomes(homes);
    });
    void loadElevation().then((g) => c.setElevation(g)).catch(() => {});
    return () => {
      c.stop();
      ctl.current = null;
    };
  }, [measure, flyTo, hideHover]);

  // Scroll, resize, reflow.
  useEffect(() => {
    const onResize = () => {
      measure();
      scrimSizes.current = [];
      labelsPlaced.current = false;
      schedule();
    };
    onResize();
    // The poster goes at once on the first real scroll, where a live map can take its place (never
    // when the map has failed: then the poster is the picture).
    const onFirstScroll = () => {
      if (failed.current) {
        window.removeEventListener("scroll", onFirstScroll);
        return;
      }
      if (window.scrollY > 24) {
        setPosterGone((g) => g || "scroll");
        ctl.current?.abortWarm();
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
    placeScrims();
  }, [look, placeScrims]);

  // HOVER: the pointer against the homes we drew, where the pointer is on the ground (not over
  // words, a card or a control).
  // THE FEATURED HOMES AND THE KEYBOARD. Their cards are on the page (the featured rail); when one
  // takes focus the map flies down to that home and names it, and when focus leaves the map goes back
  // to the section's shot. The map's own markers cannot be reached by Tab (controller.ts setFeatured).
  useEffect(() => {
    const c = ctl.current;
    if (!revealed || !c) return;
    c.setFeatured(featuredRef.current);
    const byId = new Map(featuredRef.current.map((h) => [h.id, h]));
    const homeOf = (t: EventTarget | null) => {
      const a = (t as Element | null)?.closest?.("a[href*=\"bid-38-\"]");
      const id = a?.getAttribute("href")?.split("bid-38-")[1];
      return id ? byId.get(id) ?? null : null;
    };
    let on: FeaturedHome | null = null;
    const onIn = (e: FocusEvent) => {
      const h = homeOf(e.target);
      if (!h || h === on) return;
      on = h;
      override.current = "home" as AreaShot;
      c.flyToCamera({ center: { lat: h.lat, lng: h.lng, altitude: 0 }, range: 2600, tilt: 55, heading: 0, fov: 40 }, 1800);
      // No label here: the focused card on the page already names the home, and a label over the
      // rail would cover the cards (seen on the first frame).
    };
    const onOut = (e: FocusEvent) => {
      if (!on || homeOf(e.relatedTarget) ) return;
      on = null;
      override.current = null;
      // Back to whatever the scroll says (the focus may have scrolled the page meanwhile).
      target.current = null;
      scheduleRef.current();
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, [revealed]);

  useEffect(() => {
    if (!revealed) return;
    let raf = 0;
    let px = 0, py = 0;
    let over: Element | null = null;
    const blocked = (t: Element | null) => !!t?.closest("a,button,input,select,textarea,label,form,[role=dialog],[data-quiet],header,footer,iframe,[data-g3d-label]");
    const show = (i: number, x: number, y: number) => {
      const c = ctl.current!;
      const town = c.townOf(i);
      const same = hovered.current?.i === i;
      if (!same) hovered.current = { i, href: townSearchHref(town) };
      if (halo.current) {
        halo.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        halo.current.style.opacity = "1";
      }
      const el = label.current;
      if (el && !same) {
        el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y - 12)}px, 0) translate(-50%, -100%)`;
        el.textContent = town;
        el.style.opacity = "1";
        const home = c.homeAt(i);
        if (home) {
          void priceNear(home.lat, home.lng).then((pin) => {
            if (hovered.current?.i !== i || !pin) return;
            hovered.current = { i, href: listingPath(pin) };
            el.textContent = `${money(pin.price)} · ${town}`;
          });
        }
      }
      document.documentElement.style.cursor = "pointer";
    };
    const test = () => {
      raf = 0;
      const c = ctl.current;
      if (!c || c.isFlying() || blocked(over)) {
        if (hovered.current) hideHover();
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
        if (hovered.current) hideHover();
        return;
      }
      show(c.xyIndex[k], c.xy[2 * k], c.xy[2 * k + 1]);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      over = e.target as Element | null;
      if (!raf) raf = requestAnimationFrame(test);
    };
    // A touch sends its own tap as a click too; the touch path below decides what a tap does
    // (the first names the home, the second opens it), so the click only acts for a mouse.
    let lastPointer = "mouse";
    const onClick = (e: MouseEvent) => {
      if (lastPointer !== "mouse" || !hovered.current || blocked(e.target as Element)) return;
      window.location.assign(hovered.current.href);
    };
    // A touch: the tap names the home; a second tap on the same home opens it.
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      lastPointer = e.pointerType;
      if (e.pointerType !== "mouse") down = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8;
      down = null;
      if (moved) return;
      const c = ctl.current;
      if (!c || c.isFlying() || blocked(e.target as Element)) return;
      const k = nearestLight(c.xy, c.xyCount, e.clientX, e.clientY, 22);
      if (k < 0) return hideHover();
      const i = c.xyIndex[k];
      if (hovered.current?.i === i) window.location.assign(hovered.current.href);
      else show(i, c.xy[2 * k], c.xy[2 * k + 1]);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", hideHover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", hideHover);
      cancelAnimationFrame(raf);
    };
  }, [revealed, hideHover]);

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
        <div ref={host} className="absolute inset-0" />
        {look === "veil" ? (
          <div aria-hidden className="absolute inset-0" style={{ background: `rgba(0,0,0,${veil})`, ...mask }} />
        ) : (
          <div aria-hidden className="absolute inset-0 overflow-hidden" style={mask}>
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
                  WebkitMaskImage: FEATHER,
                  maskImage: FEATHER,
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
              style={{ visibility: "hidden", textShadow: LABEL_SHADOW }}
            >
              {l.text}
            </span>
          ))}
        </div>
        {/* The hovered home, brightened: a larger warm light over the marker. */}
        <div
          ref={halo}
          aria-hidden
          className="absolute left-0 top-0 transition-opacity duration-150 motion-reduce:transition-none"
          style={{ opacity: 0, width: 0, height: 0 }}
        >
          <span
            className="absolute block rounded-full"
            style={{
              left: -13,
              top: -13,
              width: 26,
              height: 26,
              background: "radial-gradient(circle, #fffdf7 0 18%, rgba(255,232,190,0.85) 30%, rgba(255,216,160,0.35) 58%, rgba(255,216,160,0) 72%)",
              boxShadow: "0 0 0 1px rgba(18,12,4,0.55) inset",
            }}
          />
        </div>
      </div>
      {/* THE LOAD COVER: our poster (see posterGone above), over the map and under the words,
          shot from the map's own hero camera (round 57, scripts/make-night-poster.mjs). A phone
          sees a crop of it; 78% puts the city and Westchester in that crop, where the phone's
          own camera has them, so the dissolve keeps the city where it was.
          absolute to the page like the night flight's, with the same two scrims under the words
          (a still cannot be told where the words are). Its image is preloaded by the page. */}
      <div
        aria-hidden
        data-g3d-poster
        data-g3d-cover
        data-state={posterGone ? "gone" : "on"}
        data-drop={posterGone || undefined}
        {...{ elementtiming: "g3d-poster" }}
        className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-[100svh] bg-black bg-cover bg-[position:78%_50%] bg-no-repeat lg:bg-[position:58%_50%] transition-opacity duration-[400ms] ease-out motion-reduce:transition-none ${posterGone ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundImage: `url(${poster})` }}
      >
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,5,0.80) 0%, rgba(5,5,5,0.46) 14%, rgba(5,5,5,0.12) 30%, rgba(5,5,5,0.12) 46%, rgba(5,5,5,0.55) 60%, rgba(5,5,5,0.86) 72%, rgba(5,5,5,0.9) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "radial-gradient(66% 88% at 14% 74%, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.88) 30%, rgba(5,5,5,0.6) 56%, rgba(5,5,5,0.22) 80%, rgba(5,5,5,0) 100%)",
          }}
        />
      </div>
      {/* The hovered home's price and town: our own words, above the page, never taking the pointer. */}
      <div
        ref={label}
        data-g3d-label
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[15] whitespace-nowrap rounded-lg px-3 py-1.5 text-[16px] font-medium leading-tight text-ink transition-opacity duration-150 motion-reduce:transition-none"
        style={{ opacity: 0, background: "rgba(8,8,8,0.86)", border: "1px solid rgba(255,255,255,0.18)", marginTop: 0 }}
      />
      <div ref={contentRef} className="relative z-10" style={CLEAR_STYLE}>
        {children}
      </div>
    </AreaContext.Provider>
  );
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
