"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** One article section that rises into view as you scroll to it (the house spring).
 *
 * Readable without JS by design: the section renders visible, and the hide-then-reveal is
 * only armed after mount, and only for sections still well below the fold — so no-JS
 * readers, reduced-motion readers, and everything above the fold get a clean static read
 * with no flash. Sections below the fold are hidden while off-screen, then eased in.
 */
export function ArticleSection({
  children,
  id,
  labelledBy,
}: {
  children: ReactNode;
  id?: string;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Anything already in (or near) the viewport stays put — hiding it would flash.
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.85) return;

    el.classList.add("will-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} aria-labelledby={labelledBy || undefined}>
      {children}
    </section>
  );
}
