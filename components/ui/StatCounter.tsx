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
  // Server-render the FINAL value — no-JS visitors and crawlers must never see "0".
  // The effect resets to 0 and counts up only when motion is allowed.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // already showing the final value
    setDisplay(0);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
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
      {/* The number carries the display face at its lightest weight and the label drops to the
          eyebrow style. Four bold numerals over four grey captions is the most templated block
          on the web; the facts are true and worth keeping, so what round 11 changed is the
          setting, not the content. */}
      <p className="t-h1 text-ink">
        {prefix}
        {display.toLocaleString("en-US")}
        {suffix}
      </p>
      <p className="t-eyebrow mt-3 text-stone">{label}</p>
    </div>
  );
}
