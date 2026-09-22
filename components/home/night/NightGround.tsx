"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { NightScene } from "./NightScene";
import { countyOfShot, shotPosition, shotStops, veilAt, type ShotSection, type ShotStop } from "./driver";
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
 *  - The CANVAS fades in over it once the terrain and the lights are there.
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

export function NightGround({ poster, children }: { poster: string; children: ReactNode }) {
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
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState<AreaShot | null>(null);

  /** Read the sections' real boxes. Called on mount, on resize and whenever the page reflows. */
  const measure = useCallback(() => {
    const y = window.scrollY;
    // A phone's content covers the WHOLE frame where a laptop's covers a third of it, so a
    // section may name a second veil for a narrow window (`data-veil-phone`).
    const narrow = window.innerWidth < 1024;
    sections.current = [...document.querySelectorAll<HTMLElement>("[data-shot]")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        shots: (el.dataset.shot ?? "hero").split(",").filter(Boolean) as ShotName[],
        top: r.top + y,
        height: r.height,
        veil: Number((narrow ? el.dataset.veilPhone : undefined) ?? el.dataset.veil ?? 0),
      };
    });
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    stops.current = shotStops(sections.current, window.innerHeight, maxScroll);
    names.current = stops.current.map((s) => s.name);
  }, []);

  /** Where the page's words sit, in css pixels from the top left of the window (which is the
   * canvas): the two largest boxes on screen. */
  const quiet = useCallback((h: NightSceneHandle) => {
    const vh = window.innerHeight;
    const rects = [...document.querySelectorAll<HTMLElement>("[data-quiet]")]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < vh)
      .sort((a, b) => b.width * b.height - a.width * a.height)
      .slice(0, 2);
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
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    // Cards, rails and fonts change the page's height after first paint; the anchors follow.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [measure, schedule]);

  // The lantern, over the hero only.
  useEffect(() => {
    if (!ready) return;
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
  }, [ready]);

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
      {/* The first screen, before anything runs: a still of the same scene. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-0 h-[100svh] bg-cover bg-[position:58%_50%] bg-no-repeat"
        style={{ backgroundImage: `url(${poster})` }}
      />
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"}`}
      >
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
            setReady(true);
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </AreaChapterContext.Provider>
  );
}
