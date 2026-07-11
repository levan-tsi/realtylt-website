"use client";

import { useEffect, useRef, useState } from "react";

/** Animated count-up stat (mono). Counts when scrolled into view; instant under reduced motion. */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  durationMs = 1400,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (reduced) {
          setDisplay(value);
          return;
        }
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / durationMs);
          const eased = 1 - (1 - p) ** 3;
          setDisplay(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, durationMs]);

  return (
    <div ref={ref}>
      <p className="text-3xl font-light tracking-tight text-ink md:text-4xl">
        {prefix}
        {display.toLocaleString("en-US")}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-stone">{label}</p>
    </div>
  );
}
