"use client";

import { useEffect, useRef } from "react";

/** VARIANT A — "DEPTH". The photograph stops being flat.
 *
 * The cheapest of the three and the least risky: no new data, no canvas, no dependency. The
 * hero photograph, an atmospheric haze layer and the type sit on three planes that answer the
 * pointer at different rates, so moving the mouse produces real parallax instead of a flat
 * image with a caption on it.
 *
 * Everything is a `transform`, which the compositor handles on its own thread — the photograph
 * is never re-laid-out, never faded, and never re-decoded, so the LCP element is untouched.
 * That constraint is not incidental: LCP on this page IS the hero image (measured), so any
 * effect that delays its paint is a performance regression dressed as design.
 *
 * Reduced motion: the effect never arms, and the hero renders exactly as it does today. */
export function HeroDepth({ src, children }: { src: string; children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const haze = useRef<HTMLDivElement>(null);
  const type = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // a phone has no pointer to follow

    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // -1..1 from the centre of the hero.
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    const tick = () => {
      // Ease toward the pointer rather than tracking it exactly. Instant tracking feels
      // twitchy and cheap; the lag is what makes it read as weight.
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      // The furthest plane moves LEAST. Inverted against the pointer, which is what the eye
      // reads as "behind".
      if (photo.current) photo.current.style.transform = `scale(1.06) translate3d(${-cx * 14}px, ${-cy * 10}px, 0)`;
      if (haze.current) haze.current.style.transform = `translate3d(${-cx * 30}px, ${-cy * 18}px, 0)`;
      if (type.current) type.current.style.transform = `translate3d(${cx * 7}px, ${cy * 4}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrap} className="relative isolate h-full w-full overflow-hidden bg-ink">
      {/* scale(1.06) is the parallax budget: the photograph is oversized so it can travel
          without ever exposing an edge. */}
      <div
        ref={photo}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(1)",
          transform: "scale(1.06)",
        }}
      />
      {/* Atmospheric haze on its own plane. Valley light, not a colour wash — it is what sells
          the depth, because real distance is hazy. */}
      <div
        ref={haze}
        aria-hidden
        className="pointer-events-none absolute -inset-24 will-change-transform"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 62%, rgba(255,255,255,.16), transparent 70%)," +
            "linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.45) 38%, transparent 78%)",
        }}
      />
      <div ref={type} className="relative z-10 h-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
