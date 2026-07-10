"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { COUNTY_CONTENT } from "@/content/counties";

/** The Valley Line, fully realized (spec §4): an interactive map of the Hudson's course with
 * the six serviced counties in true geographic order — Westchester/Rockland south,
 * Ulster/Dutchess north. Hover lights a county; click opens its page. */

const fmtM = (n: number) => `$${Math.round(n / 1000)}K`;

export function ValleyMap() {
  const ref = useRef<HTMLDivElement>(null);

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
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="vl-draw relative mx-auto w-full max-w-md select-none"
      role="group"
      aria-label="Map of the Hudson River with our six counties, south to north"
    >
      {/* The river */}
      <svg viewBox="0 0 360 560" fill="none" className="block w-full" aria-hidden>
        {/* faint terrain contours */}
        <path d="M20 90 C 80 70, 120 110, 180 95 S 300 70, 345 88" stroke="rgba(250,250,248,0.06)" strokeWidth="1" />
        <path d="M15 250 C 90 230, 150 265, 210 250 S 320 230, 350 245" stroke="rgba(250,250,248,0.06)" strokeWidth="1" />
        <path d="M20 420 C 85 400, 140 435, 205 420 S 315 398, 348 415" stroke="rgba(250,250,248,0.06)" strokeWidth="1" />
        {/* river glow */}
        <path
          d="M150 8 C 143 60, 172 95, 163 135 S 138 205, 152 245 S 178 300, 167 340 S 149 400, 172 445 S 192 505, 180 556"
          stroke="rgba(43,108,176,0.35)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* the Valley Line itself — draw on scroll */}
        <path
          className="vl-path"
          pathLength={1}
          d="M150 8 C 143 60, 172 95, 163 135 S 138 205, 152 245 S 178 300, 167 340 S 149 400, 172 445 S 192 505, 180 556"
          stroke="var(--color-porchlight)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* compass + flow labels */}
        <text x="322" y="30" fill="rgba(250,250,248,0.5)" fontSize="12" fontFamily="var(--font-mono)">N ↑</text>
        <text x="122" y="24" fill="rgba(250,250,248,0.45)" fontSize="10" fontFamily="var(--font-mono)">CATSKILLS</text>
        <text x="196" y="548" fill="rgba(250,250,248,0.45)" fontSize="10" fontFamily="var(--font-mono)">→ NYC</text>
      </svg>

      {/* County markers (HTML overlay for real links + focus) */}
      {COUNTY_CONTENT.map((c) => (
        <Link
          key={c.slug}
          href={`/top-areas/${c.slug}`}
          className="group absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-porchlight"
          style={{ left: `${c.map.left}%`, top: `${c.map.top}%` }}
        >
          <span className="flex items-center gap-2.5">
            {c.map.side === "east" && <Dot />}
            <span
              className={`whitespace-nowrap ${c.map.side === "west" ? "text-right" : ""}`}
            >
              <span className="block font-display text-sm leading-tight text-paper transition-colors group-hover:text-porchlight sm:text-lg">
                {c.short}
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50 transition-colors group-hover:text-paper/80 sm:block">
                median {fmtM(c.medianPrice)} · explore →
              </span>
            </span>
            {c.map.side === "west" && <Dot />}
          </span>
        </Link>
      ))}
    </div>
  );
}

function Dot() {
  return (
    <span className="relative grid h-4 w-4 shrink-0 place-items-center" aria-hidden>
      <span className="absolute h-4 w-4 rounded-full bg-porchlight/25 transition-all duration-300 group-hover:scale-[1.8] group-hover:bg-porchlight/35" />
      <span className="h-2 w-2 rounded-full bg-porchlight shadow-[0_0_10px_2px_rgb(232_176_75/0.5)]" />
    </span>
  );
}
