"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { loadLights } from "@/lib/idx/lights-client";
import { listingPath } from "@/lib/idx/listing-url";
import type { MapPin } from "@/lib/idx/types";
import { shotPosition, shotStops, withTail, type ShotSection, type ShotStop } from "../night/driver";
import { loadElevation } from "../night/elevation";
import { townSearchHref } from "../night/lights";
import { AREA_COUNTY_OF, type AreaShot, type ShotName } from "../night/shots";
import { boxUVToLngLat } from "../night/world";
import { G3dController, type FeaturedHome, type Homes } from "./controller";
import { nearestLight } from "./thinning";

/** THE REAL MAP AS THE PAGE'S GROUND (round 56, the /lab/g3d prototype).
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
}

/** The hole the looks leave for Google's logo and legal link, bottom left (policy: visible and
 * unobscured). Measured on the frames: the logo runs x 12..116, the (i) to x 150, y within 36 px
 * of the bottom. */
const LOGO_HOLE = "radial-gradient(210px 64px at 84px 100%, transparent 0, transparent 62%, #000 100%)";

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
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    stops.current = shotStops(sections.current, window.innerHeight, maxScroll);
    names.current = stops.current.map((s) => s.name);
  }, []);

  /** The scrims follow the four largest blocks of words on screen, by transform only (their size
   * changes only when the set of boxes does, so the soft edge is rastered once, not per frame). */
  const placeScrims = useCallback(() => {
    // The header's words stand on the map's sky and labels: a shade under them that scrolls away
    // with the header (it is not sticky).
    if (topScrim.current) topScrim.current.style.transform = `translate3d(0, ${-Math.min(window.scrollY, 400)}px, 0)`;
    if (lookRef.current !== "scrim") return;
    const vh = window.innerHeight;
    const rects = [...document.querySelectorAll<HTMLElement>("[data-quiet]")]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 8 && r.height > 8 && r.bottom > -40 && r.top < vh + 40)
      .sort((a, b) => b.width * b.height - a.width * a.height)
      .slice(0, 4);
    for (let k = 0; k < 4; k++) {
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
        el.style.width = `${Math.round(r.width)}px`;
        el.style.height = `${Math.round(r.height)}px`;
      }
      el.style.transform = `translate3d(${Math.round(r.left)}px, ${Math.round(r.top)}px, 0)`;
      el.style.opacity = "1";
    }
  }, []);

  const flyTo = useCallback((name: ShotName) => {
    target.current = name;
    ctl.current?.flyToShot(name);
  }, []);

  const apply = useCallback(() => {
    placeScrims();
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
    if (!key) {
      setError("no key");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = new G3dController({
      key,
      reduced,
      viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
      initial,
      description: "Map of the Hudson Valley and New York City, with the homes for sale lit where they stand.",
      onReveal: () => {
        setRevealed(true);
        setPosterGone((g) => g || "dissolve");
      },
      onLand: () => {},
      onFlightStart: () => hideHover(),
      onError: (m) => {
        setError(m);
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
      schedule();
    };
    onResize();
    // The poster goes at once on the first real scroll, where a live map can take its place.
    let glOk = false;
    try {
      const c = document.createElement("canvas");
      glOk = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {}
    const onFirstScroll = () => {
      if (glOk && window.scrollY > 24) {
        setPosterGone((g) => g || "scroll");
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
            {[0, 1, 2, 3].map((k) => (
              <div
                key={k}
                ref={(el) => {
                  scrimEls.current[k] = el;
                }}
                className="absolute left-0 top-0 rounded-3xl"
                style={{
                  opacity: 0,
                  background: `rgba(0,0,0,${scrim})`,
                  boxShadow: `0 0 72px 44px rgba(0,0,0,${scrim})`,
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
          absolute to the page like the night flight's, with the same two scrims under the words
          (a still cannot be told where the words are). Its image is preloaded by the page. */}
      <div
        aria-hidden
        data-g3d-poster
        data-g3d-cover
        data-state={posterGone ? "gone" : "on"}
        data-drop={posterGone || undefined}
        {...{ elementtiming: "g3d-poster" }}
        className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-[100svh] bg-black bg-cover bg-[position:58%_50%] bg-no-repeat transition-opacity duration-[400ms] ease-out motion-reduce:transition-none ${posterGone ? "opacity-0" : "opacity-100"}`}
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
      <div className="relative z-10">{children}</div>
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
