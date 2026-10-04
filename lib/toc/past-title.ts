"use client";

import { useEffect, useState } from "react";

/** Whether the reader has scrolled past the page's title block (round 66).
 *
 * The floating "On this page" pill (FlagshipToc, ArticleToc, ServiceToc) sat on the first screen
 * from the first paint: at 320x568 over a flagship post's h1, at 390x844 over the standfirst or the
 * body text. A reader at the title does not need a table of contents yet, so the pill waits until
 * the title block, the h1 and the standfirst, has left the top of the viewport, and goes again if
 * the reader scrolls back up to it.
 *
 * The page marks its title block with `data-toc-after` (the h1 and the standfirst under it); the
 * LAST marked element is the one that has to clear the viewport. Without a mark the h1 is used, and
 * a page with neither shows the pill at once (the old behaviour) rather than never.
 *
 * A scroll listener read once a frame, not an IntersectionObserver: at 320x568 a flagship's
 * standfirst starts below the first screen, and a jump (an anchor, End, a fling) can carry it from
 * below the viewport to above it without ever intersecting, which an observer never reports
 * (measured: the pill stayed away 340px past the title). One getBoundingClientRect per frame while
 * scrolling, the same cost as the rail's band tone. Server render and first paint: false, so the
 * pill is never in the first screen's HTML. */
export function usePastTitle(): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const marked = document.querySelectorAll<HTMLElement>("[data-toc-after]");
    const block = marked.length ? marked[marked.length - 1] : document.querySelector<HTMLElement>("h1");
    if (!block) {
      setPast(true);
      return;
    }
    let raf = 0;
    const compute = () => {
      raf = 0;
      setPast(block.getBoundingClientRect().bottom <= 0);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    compute();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return past;
}
