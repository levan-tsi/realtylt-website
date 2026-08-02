"use client";

import { useEffect, useRef, useState } from "react";

export interface TraverseHome {
  id: string;
  photo: string;
  address: string;
  city: string;
  price: number;
}

/** VARIANT C — "TRAVERSE". The owner's own idea: one house, and the mouse changes it.
 *
 * The hero is a single real home. Moving the pointer across the frame travels through the
 * inventory — each home cross-fading into the next, with its address and price. It is the most
 * literal of the three and the most obviously "ours": every frame is a house we are actually
 * selling, photographed by the listing agent.
 *
 * THE RISK, stated honestly because it decides whether this ships: it burns photo requests.
 * Each home is one /api/media fetch, and this account has been rate-limited into the ground
 * once already. Mitigated here by preloading a SMALL fixed set (8) once, never on pointer move,
 * and by only ever showing homes whose photos are already mirrored into our own Storage — so
 * the media host is never touched at view time. If this variant is chosen, that constraint is
 * not negotiable.
 *
 * Reduced motion / touch: the first home is shown as a still, with no traversal. */
export function HeroTraverse({ homes, children }: { homes: TraverseHome[]; children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!homes.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    // Preload ONCE, up front. Never in the move handler — that is how a hover effect turns
    // into a few hundred image requests a minute.
    for (const h of homes) {
      const img = new Image();
      img.src = h.photo;
    }
    setArmed(true);

    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    let pending = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(0.9999, Math.max(0, (e.clientX - r.left) / r.width));
      pending = Math.floor(p * homes.length);
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; setIdx(pending); });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [homes]);

  const current = homes[idx] ?? homes[0];

  return (
    <div ref={wrap} className="relative isolate h-full w-full overflow-hidden bg-ink">
      {/* Every frame is mounted and cross-faded by opacity. Swapping one <img> src would show
          a decode flash on each move; opacity between preloaded layers is free. */}
      {homes.map((h, i) => (
        <div
          key={h.id}
          aria-hidden
          className="absolute inset-0 transition-opacity duration-[450ms] ease-out"
          style={{
            backgroundImage: `url(${h.photo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(1)",
            opacity: i === idx ? 1 : 0,
          }}
        />
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,.42) 42%, transparent 80%)" }}
      />
      <div className="relative z-10 h-full">{children}</div>

      {/* Which home you are looking at. Reserved height so traversal never nudges the layout. */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-20 h-10 min-w-[240px] text-right">
        {current && (
          <>
            <p className="font-display text-lg leading-none text-paper/90">
              ${current.price.toLocaleString("en-US")}
            </p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-paper/50">
              {current.address}, {current.city}
            </p>
          </>
        )}
      </div>
      {/* A quiet progress rule — without it there is no hint that moving does anything. */}
      {armed && (
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-20 h-px w-full bg-paper/15">
          <div
            className="h-px bg-paper/70 transition-[width] duration-[450ms] ease-out"
            style={{ width: `${((idx + 1) / homes.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
