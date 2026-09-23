"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { NightScene } from "./NightScene";
import { countyOfShot, shotPosition, shotStops, veilAt, withTail, type ShotSection, type ShotStop } from "./driver";
import { townSearchHref } from "./lights";
import type { NightSceneHandle, TownHover } from "./scene";
import { AREA_COUNTY_OF, type AreaShot, type ShotName } from "./shots";

/** THE SCENE AS THE PAGE'S GROUND (round 54).
 *
 * One canvas, fixed behind everything, and the page scrolling is the camera flying through it.
 * The page's own content is server-rendered and works with no JavaScript at all; this component
 * adds the scene behind it afterwards:
 *
 *  - The POSTER (a still of the establishing shot, rendered from this very scene by
 *    scripts/make-night-poster.mjs) covers the first screen from the first byte, so nobody ever
 *    meets a black rectangle — with no JavaScript, with no WebGL, or while three.js loads.
 *  - It DISSOLVES once the scene's own intro has finished underneath it, so the still and the
 *    live scene are equally bright when one becomes the other and the hero never blinks.
 *  - Every section says which shot it holds the camera on (`data-shot`) and how far it dims the
 *    scene (`data-veil`); ./driver.ts turns the scroll position into both. Nothing is pinned and
 *    nothing is hijacked: the page scrolls exactly as it would without this file.
 *  - Boxes marked `data-quiet` (the headline, the search instrument, the quote) tell the scene
 *    where the page's words sit, so no contour runs through a letter. Re-measured on scroll,
 *    on resize and when anything reflows.
 *  - The LANTERN: the canvas is behind the page and takes no pointer events, so the hero forwards
 *    its own (`data-lantern`), and a click there opens the named town's search. Only there, where
 *    there is nothing else to click.
 *
 * The "where we work" list reads `useAreaChapter()` to know which area the camera is on and to
 * send it somewhere else when a row is hovered or focused. */

interface AreaChapterValue {
  /** The area the scene is currently lighting, by its shot name. */
  current: AreaShot | null;
  /** Fly to an area now (hover, focus, a tap). `null` gives the scroll its job back. */
  point: (area: AreaShot | null) => void;
}

const AreaChapterContext = createContext<AreaChapterValue>({ current: null, point: () => {} });
export const useAreaChapter = () => useContext(AreaChapterContext);

const isArea = (n: ShotName): n is AreaShot => n in AREA_COUNTY_OF;

/** The flight below the page's last section, which is the footer: the shot it holds and how far
 * the scene is dimmed there. Without it the scene stops dead at the footer's top edge. */
export interface NightTail {
  shot: ShotName;
  veil: number;
  veilPhone: number;
}

export function NightGround({ poster, tail, children }: { poster: string; tail?: NightTail; children: ReactNode }) {
  const tailRef = useRef(tail);
  tailRef.current = tail;
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const handle = useRef<NightSceneHandle | null>(null);
  const sections = useRef<ShotSection[]>([]);
  const stops = useRef<ShotStop[]>([]);
  const names = useRef<ShotName[]>([]);
  const override = useRef<AreaShot | null>(null);
  const focused = useRef<string | null>(null);
  const hovered = useRef<TownHover | null>(null);
  const frame = useRef(0);
  const posterTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [live, setLive] = useState(false);
  const [posterGone, setPosterGone] = useState(false);
  /** The poster leaves QUICKLY (400 ms, not the intro's 1,100 ms luminance-matched dissolve) when
   * the visitor scrolls before the intro is over. Round 55, the owner: "when I scroll down, that
   * first page kind of freezes in the middle, and after a few seconds it disappears". Measured:
   * the still is absolute to the page, so a scroll at 1.5 s left it as a frozen strip across the
   * top third of the window, with a hard seam, until the intro's end at ~5.5 s. A visitor who
   * scrolls has stopped waiting for the intro, so the still goes at once and the live scene (or,
   * for a moment, its dark ground while the clouds are still building) is what moves. Only where
   * WebGL exists: without it the still IS the hero, and it stays. */
  const [posterQuick, setPosterQuick] = useState(false);
  const glOk = useRef(false);
  const [current, setCurrent] = useState<AreaShot | null>(null);

  const dropPosterNow = useCallback(() => {
    clearTimeout(posterTimer.current);
    setPosterQuick(true);
    setPosterGone(true);
  }, []);

  /** Read the sections' real boxes. Called on mount, on resize and whenever the page reflows. */
  const measure = useCallback(() => {
    const y = window.scrollY;
    // A phone's content covers the WHOLE frame where a laptop's covers a third of it, so a
    // section may name a second veil for a narrow window (`data-veil-phone`).
    const narrow = window.innerWidth < 1024;
    const found: ShotSection[] = [...document.querySelectorAll<HTMLElement>("[data-shot]")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        shots: (el.dataset.shot ?? "hero").split(",").filter(Boolean) as ShotName[],
        top: r.top + y,
        height: r.height,
        veil: Number((narrow ? el.dataset.veilPhone : undefined) ?? el.dataset.veil ?? 0),
      };
    });
    const t = tailRef.current;
    sections.current = t
      ? withTail(found, document.documentElement.scrollHeight, { shots: [t.shot], veil: narrow ? t.veilPhone : t.veil })
      : found;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    stops.current = shotStops(sections.current, window.innerHeight, maxScroll);
    names.current = stops.current.map((s) => s.name);
  }, []);

  /** Where the page's words sit, in css pixels from the top left of the window (which is the
   * canvas): the four largest boxes on screen. Four, because a window straddling two sections
   * holds a heading, a lede, an index and a quote at once, and with two slots the heading lost —
   * "Why work with us?" was sitting on the harbour at 1.1:1 (round 54, builder 3). */
  const quiet = useCallback((h: NightSceneHandle) => {
    const vh = window.innerHeight;
    const rects = [...document.querySelectorAll<HTMLElement>("[data-quiet]")]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < vh)
      .sort((a, b) => b.width * b.height - a.width * a.height)
      .slice(0, 4);
    h.setQuiet(rects);
  }, []);

  const apply = useCallback(() => {
    const h = handle.current;
    if (!h || !stops.current.length) return;
    const y = window.scrollY;
    h.setVeil(veilAt(sections.current, y, window.innerHeight));
    if (!override.current) {
      const { s, index } = shotPosition(stops.current, y);
      h.setSequence(names.current, s);
      const name = names.current[index];
      const county = countyOfShot(name);
      if (county !== focused.current) {
        focused.current = county;
        h.setFocus(county);
      }
      setCurrent(name && isArea(name) ? name : null);
    }
    quiet(h);
  }, [quiet]);

  const schedule = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      apply();
    });
  }, [apply]);

  // Scroll, resize and reflow.
  useEffect(() => {
    const onResize = () => {
      measure();
      schedule();
    };
    onResize();
    // Can this browser draw the scene at all? Decided once; a scroll only drops the still where
    // something live will take its place.
    try {
      const c = document.createElement("canvas");
      glOk.current = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      glOk.current = false;
    }
    const onScroll = () => {
      schedule();
      if (glOk.current && window.scrollY > 24) {
        dropPosterNow();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Cards, rails and fonts change the page's height after first paint; the anchors follow.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [measure, schedule, dropPosterNow]);

  // The lantern, over the hero only.
  useEffect(() => {
    if (!live) return;
    const el = document.querySelector<HTMLElement>("[data-lantern]");
    const h = handle.current;
    if (!el || !h) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      h.setPointer(e.clientX, e.clientY);
    };
    const onLeave = () => h.clearPointer();
    const onClick = () => {
      if (hovered.current) routerRef.current.push(townSearchHref(hovered.current.name));
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick);
    };
  }, [live]);

  useEffect(() => () => clearTimeout(posterTimer.current), []);

  const point = useCallback((area: AreaShot | null) => {
    override.current = area;
    const h = handle.current;
    if (!h) return;
    if (!area) {
      schedule();
      return;
    }
    setCurrent(area);
    focused.current = AREA_COUNTY_OF[area];
    h.setFocus(AREA_COUNTY_OF[area]);
    void h.flyTo(area, 1100);
  }, [schedule]);

  return (
    <AreaChapterContext.Provider value={{ current, point }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <NightScene
          className="absolute inset-0"
          onTownHover={(t) => {
            hovered.current = t;
            const el = document.querySelector<HTMLElement>("[data-lantern]");
            if (el) el.style.cursor = t ? "pointer" : "";
          }}
          onReady={(h) => {
            handle.current = h;
            measure();
            apply();
            setLive(true);
            // Hold the poster until the live scene is as bright as it is (see below) — and if the
            // scene came up with NO LIGHTS (the packed listings did not answer, or the terrain
            // image did not), never dissolve it at all. The scene reports ready either way, and
            // without this the still faded out into an empty canvas: the hero went black on a
            // failure whose whole point was that the page should not notice it.
            if (!h.stats().lights) return;
            // Already scrolled while the clouds were building: the still goes now, not at the
            // intro's end.
            if (window.scrollY > 24) {
              dropPosterNow();
              return;
            }
            posterTimer.current = setTimeout(() => setPosterGone(true), Math.max(0, h.introEndsAt() - performance.now()));
          }}
        />
      </div>
      {/* THE FIRST SCREEN, BEFORE ANYTHING RUNS: a still of this very scene's establishing shot,
          over the canvas rather than under it. It is there in the first bytes of HTML, so nobody
          meets a black rectangle with JavaScript off, without WebGL, or while three.js loads; it
          covers the first screen only and scrolls away with the hero.
          It dissolves only once the scene's own intro is over (the dust settling, then the lights
          coming on from the harbour up the valley), so the two pictures are equally bright when
          one becomes the other and the hero never dips. Measured frame by frame: fading the canvas
          IN on ready took the hero's mean luminance from 17 to 10 and back, a visible blink. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-[100svh] bg-cover bg-[position:58%_50%] bg-no-repeat transition-opacity ease-out motion-reduce:transition-none ${posterQuick ? "duration-[400ms]" : "duration-[1100ms]"} ${posterGone ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundImage: `url(${poster})` }}
      >
        {/* THE POSTER'S OWN QUIET (round 54, builder 3). The live scene is told where the words
            are and settles under them; a still cannot be told anything, so with JavaScript off —
            and for the first moment of every cold visit — the count sentence sat straight on the
            brightest part of the city and could not be read (measured: 1.3:1 at 390). These two
            scrims are the still's answer, and they follow the words, not the picture: on a phone
            the page puts the headline high and the count and the search box low, so the scrim is
            vertical; on a laptop every word is in the bottom left, over New Jersey, so it is one
            soft ellipse there and the harbour is untouched. They are children of the poster, so
            they dissolve with it in the same 1100 ms and leave nothing behind. */}
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
      <div className="relative z-10">{children}</div>
    </AreaChapterContext.Provider>
  );
}
