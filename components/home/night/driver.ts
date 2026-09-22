/** THE SCROLL DRIVER, as pure arithmetic (round 54). The home page is one scene and scrolling is
 * the camera; this module turns "where the page is scrolled to" into "where the camera is" and
 * "how far the scene is dimmed", with no DOM and no three.js, so both are testable.
 *
 * Two independent answers, because they answer different questions:
 *
 *  - WHERE THE CAMERA IS. Every section declares the shot (or shots) it holds the camera on. Each
 *    shot gets one ANCHOR: the scroll position at which its section sits squarely in the window. A
 *    section with several shots (the eleven areas) spreads its anchors evenly across its own scroll
 *    span, so scrolling that section flies county by county. Between two anchors the position `s`
 *    runs linearly, and the scene eases the flight itself (shots.ts blendFramings), so the camera
 *    is never yanked and the page's own scrolling is never touched.
 *  - HOW FAR THE SCENE IS DIMMED. Not from `s`: a veil must be full BEFORE its cards are on screen,
 *    and the camera's position lags by design. It is the average of the visible sections' veils,
 *    weighted by how much of the WINDOW each one covers, so the scene dims as the cards arrive and
 *    lifts again as they leave. */
import { AREA_COUNTY_OF, type ShotName } from "./shots";
import type { CountySlugName } from "./lights";

export interface ShotSection {
  /** One or more shots; the section's scroll span is shared evenly among them. */
  shots: readonly ShotName[];
  /** The section's box in DOCUMENT coordinates (top = distance from the top of the page). */
  top: number;
  height: number;
  /** 0 = the scene at full strength, 1 = dimmed as far as it goes, while this section holds
   * the window. */
  veil: number;
}

export interface ShotStop {
  name: ShotName;
  /** Scroll position at which the camera sits exactly on this shot. */
  anchor: number;
}

/** Where each shot's anchor falls. A section's span runs from "its top reaches the middle of the
 * window" to "its bottom does"; anchors sit at the middle of each shot's share of that span. Every
 * anchor is kept inside the page (0 .. maxScroll) and forced not to run backwards, so a section
 * taller or shorter than expected can never reverse the flight. */
export function shotStops(sections: readonly ShotSection[], viewportH: number, maxScroll: number): ShotStop[] {
  const out: ShotStop[] = [];
  const top = Math.max(0, maxScroll);
  let last = 0;
  for (const sec of sections) {
    const enter = sec.top - viewportH / 2;
    const span = sec.height;
    sec.shots.forEach((name, j) => {
      const raw = enter + ((j + 0.5) / sec.shots.length) * span;
      last = Math.min(top, Math.max(last, raw));
      out.push({ name, anchor: last });
    });
  }
  return out;
}

export interface ShotPosition {
  /** 0 .. stops.length - 1, the argument NightSceneHandle.setSequence takes. */
  s: number;
  /** The stop the camera is nearest: the one the page is "on". */
  index: number;
}

/** The camera's position along the stops for a scroll offset. */
export function shotPosition(stops: readonly ShotStop[], scrollY: number): ShotPosition {
  if (stops.length === 0) return { s: 0, index: 0 };
  if (stops.length === 1 || scrollY <= stops[0].anchor) return { s: 0, index: 0 };
  const last = stops.length - 1;
  if (scrollY >= stops[last].anchor) return { s: last, index: last };
  let i = 0;
  while (i < last - 1 && scrollY >= stops[i + 1].anchor) i++;
  const a = stops[i].anchor, b = stops[i + 1].anchor;
  const t = b > a ? (scrollY - a) / (b - a) : 1;
  const s = i + t;
  return { s, index: Math.round(s) };
}

/** How far the scene is dimmed: the visible sections' veils, weighted by how much of the window
 * each one covers. */
export function veilAt(sections: readonly ShotSection[], scrollY: number, viewportH: number): number {
  let sum = 0, weight = 0;
  for (const sec of sections) {
    const overlap = Math.min(sec.top + sec.height, scrollY + viewportH) - Math.max(sec.top, scrollY);
    if (overlap <= 0) continue;
    sum += sec.veil * overlap;
    weight += overlap;
  }
  return weight > 0 ? sum / weight : 0;
}

/** The county a shot lights, or null for the chapters that light none. */
export function countyOfShot(name: ShotName): CountySlugName | null {
  return (AREA_COUNTY_OF as Partial<Record<ShotName, CountySlugName>>)[name] ?? null;
}
