"use client";

import { useEffect, useRef } from "react";

/** The Valley Line — a single continuous path tracing the Hudson's course.
 * Signature motif (spec §4): section divider + eyebrow flourish; fully realized on /top-areas. */

function useDrawOnScroll() {
  const ref = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Wide divider between sections — a meandering river line with a porchlight confluence dot. */
export function ValleyDivider({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const ref = useDrawOnScroll();
  return (
    <div aria-hidden className={`overflow-hidden ${className}`}>
      <svg
        ref={ref}
        className="vl-draw mx-auto block h-10 w-full max-w-3xl"
        viewBox="0 0 720 40"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          className="vl-path"
          pathLength={1}
          d="M0 22 C 60 6, 110 34, 170 24 S 260 4, 330 18 S 430 38, 500 20 S 600 8, 680 22"
          stroke={dark ? "rgba(250,250,248,0.35)" : "rgba(16,24,32,0.28)"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="695" cy="22" r="3.5" fill="var(--color-porchlight)" />
      </svg>
    </div>
  );
}

/** Small flourish under section headings. */
export function ValleyUnderline({ className = "" }: { className?: string }) {
  const ref = useDrawOnScroll();
  return (
    <svg
      ref={ref}
      aria-hidden
      className={`vl-draw block h-3 w-24 ${className}`}
      viewBox="0 0 96 12"
      fill="none"
    >
      <path
        className="vl-path"
        pathLength={1}
        d="M2 8 C 16 2, 28 11, 44 7 S 70 2, 86 7"
        stroke="var(--color-porchlight)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="92" cy="7" r="2.5" fill="var(--color-porchlight)" />
    </svg>
  );
}
