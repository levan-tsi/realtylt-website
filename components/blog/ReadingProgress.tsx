"use client";

import { useEffect, useRef, useState } from "react";

/** A hairline progress bar fixed to the top of the viewport that fills as you read through
 * the article region (not the whole page — the hero and footer do not count as reading).
 * rAF-throttled scroll math, no layout thrash. Purely a position readout, so reduced-motion
 * needs nothing special; the fill is not animated frame-to-frame. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const compute = () => {
      raf.current = 0;
      const el = document.getElementById(targetId);
      if (!el) return;
      const start = el.offsetTop;
      const span = el.offsetHeight - window.innerHeight;
      if (span <= 0) {
        setProgress(window.scrollY > start ? 1 : 0);
        return;
      }
      const p = (window.scrollY - start) / span;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
      // Progress is exposed to AT via the ToC's aria-current, so this purely visual bar is
      // hidden from the accessibility tree.
    >
      <div
        className="h-full origin-left bg-porchlight"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
