"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

/** How far from the viewport's left edge the page's text actually starts.
 *
 * WHY THIS IS MEASURED RATHER THAN COMPUTED. Both floating rails used to derive their safe
 * edge from an assumed container width — `calc(max((100vw - 72rem) / 2, 0px) + 2rem)` on the
 * blog, and nothing at all on the service page. That assumption is a guess about the layout,
 * and it has now been wrong twice: the owner caught the expanded card standing on a scene
 * heading on 2026-07-29, and caught it again on the service pages on 2026-08-02. Measured at
 * 1512 the blog's narrowest text starts at 163px while the 72rem formula assumed 212px, so
 * even the "fixed" rail still covered the lead form by 17px.
 *
 * A container width is a proxy. The thing the rail must not cover is TEXT, so measure text.
 * Any band that changes its padding, any new full-bleed section, any future layout — this
 * keeps working, because it asks the DOM instead of predicting it.
 *
 * Deliberately ignores the rail's own labels, hidden elements, and short strings (chips,
 * eyebrows, dates), and takes the MINIMUM across the whole page: the rail is `position:
 * fixed`, so it floats over every section and must clear the narrowest one, not whichever
 * happens to be on screen.
 */
export function useTocSafeEdge(): number | null {
  const [edge, setEdge] = useState<number | null>(null);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const nodes = document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,p,li,blockquote,figcaption");
      let min = Infinity;
      for (const el of nodes) {
        if (el.closest("nav[data-toc]")) continue; // the rail's own labels
        if (!el.offsetParent) continue; // display:none, or a collapsed mobile sheet
        if ((el.textContent?.trim().length ?? 0) < 30) continue; // not a reading column
        const r = el.getBoundingClientRect();
        if (r.width < 120 || r.height === 0) continue;
        if (r.left < min) min = r.left;
      }
      setEdge(Number.isFinite(min) ? min : null);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Measuring ONCE on mount is not enough and the failure is silent: on the service pages the
    // first pass ran before the bands had laid out, matched nothing, and the rail then never
    // appeared at all (caught at 1920 on 2026-08-02 — the rail was simply absent, while the same
    // page at 1440 happened to win the race). So: measure now, again next frame, once more when
    // the fonts settle, and on any subsequent layout change.
    measure();
    schedule();
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule).catch(() => {});
    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, []);

  return edge;
}

/** Chrome around the label inside the expanded card: the card's left inset (16), the tick
 *  cell (24), the gap before the label (8) and the card's right inset (16). */
const CARD_CHROME = 64;
/** Never let the card sit flush against the first character of the text. */
const CLEARANCE = 16;
/** The rail floors here when the gutter cannot hold a fully expanded card. */
const GUTTER_MIN = 24;

/** Below this the labels are too short to read, so the rail is not worth showing at all. */
const LABEL_MIN_USEFUL = 96;

/** Where a floating left rail can sit without ever covering the text — or `null` if it cannot.
 *
 * `maxCardWidth` is the width of a fully expanded card measured from the nav's own left edge.
 * The rail slides left so that card ends before the measured text edge; where the gutter is
 * too tight it floors at `GUTTER_MIN` and `--toc-label-max` shrinks the label to fit.
 *
 * Returns `null` in two cases, and the caller should fall back to the pill + bottom sheet:
 *   - the edge has not been measured yet (first paint), so the rail would flash in the wrong
 *     place;
 *   - there is no room for a readable label. Clamping to 8px, which is what the service pages
 *     produce at 1440, technically satisfies "never overlaps" while leaving a row of ticks
 *     nobody can use. A working bottom sheet beats a rail that is only theoretically correct.
 */
export function tocRailStyle(edge: number | null, maxCardWidth: number): CSSProperties | null {
  if (edge === null) return null;
  const left = Math.max(GUTTER_MIN, edge - CLEARANCE - maxCardWidth);
  const labelMax = Math.max(0, edge - CLEARANCE - left - CARD_CHROME);
  if (labelMax < LABEL_MIN_USEFUL) return null;
  return {
    ["--toc-label-max" as string]: `${Math.round(labelMax)}px`,
    left: `${Math.round(left)}px`,
  };
}
