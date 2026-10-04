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
 * An IntersectionObserver, not a scroll listener: it fires on the first observation too, so a page
 * restored mid-scroll shows the pill straight away. Server render and first paint: false, so the
 * pill is never in the first screen's HTML. */
export function usePastTitle(): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const marked = document.querySelectorAll<HTMLElement>("[data-toc-after]");
    const block = marked.length ? marked[marked.length - 1] : document.querySelector<HTMLElement>("h1");
    if (!block || typeof IntersectionObserver === "undefined") {
      setPast(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.bottom <= 0));
    io.observe(block);
    return () => io.disconnect();
  }, []);

  return past;
}
