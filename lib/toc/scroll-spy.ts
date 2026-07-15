"use client";

import { useEffect, useState } from "react";

/** Shared scroll-spy for the two on-page tables of contents (blog article + service page).
 *
 * Deterministic at any resting position: the active section is the lowest tracked element
 * whose top has passed a reading line `line`px below the viewport top. An IntersectionObserver
 * wakes the recompute when a heading crosses the viewport, and an rAF-throttled scroll/resize
 * listener covers deep-links, jumps, and mid-section rests. The highlight holds (never blanks)
 * while you read between sections, and at the very bottom the last section wins.
 *
 * Returns a [activeId, setActiveId] tuple so a caller can also set the active row optimistically
 * on click (before the scroll settles) for snappy feedback.
 */
export function useScrollSpy(ids: string[], line = 140) {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const key = ids.join("|");

  useEffect(() => {
    const idList = key ? key.split("|") : [];
    if (!idList.length) return;

    let raf = 0;
    const recompute = () => {
      raf = 0;
      let current = idList[0];
      for (const id of idList) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - line <= 0) current = id;
      }
      // At the very bottom, the last tracked section wins even if its top sits above the line.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = idList[idList.length - 1];
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(recompute);
    };

    const io = new IntersectionObserver(schedule, { rootMargin: "0px 0px -60% 0px", threshold: 0 });
    idList.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    recompute();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [key, line]);

  return [activeId, setActiveId] as const;
}

/** Jump to an in-page section: smooth unless the reader prefers reduced motion, update the
 * hash without a history entry, and land keyboard focus in the target without a second jump. */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
