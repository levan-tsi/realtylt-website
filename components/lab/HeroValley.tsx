"use client";

import { useEffect, useRef, useState } from "react";

export interface ValleyPoint {
  lat: number;
  lng: number;
  price: number;
  city: string;
}

/** VARIANT B — "THE VALLEY". The hero is made of the inventory itself.
 *
 * THE ARGUMENT FOR THIS ONE. /ai can be abstract because it sells a capability; an abstract
 * particle field on a page that sells HOMES is decoration, and decoration is what reads as
 * vibe-coded. So the signature here is built from the one thing no competitor can copy: every
 * active listing we hold, at its real coordinates. Eleven thousand points of light over the
 * Hudson Valley. It does not CLAIM coverage, it shows it.
 *
 * Canvas 2D, no Three.js, no dependency — a starfield of small points does not need a GPU
 * scene graph, and the restraint is the point. Deliberately monochrome: warm white lights on
 * near-black, one temperature. Colour-coding by price here would be the loudest thing on the
 * page and would turn a luxury hero into a dashboard.
 *
 * Interaction: the field parallaxes with the pointer, and the listing nearest the cursor
 * brightens and names itself. Nothing is clickable — this is the page's opening statement, not
 * a control. Reduced motion gets a still field, drawn once.
 */
export function HeroValley({ points, children }: { points: ValleyPoint[]; children: React.ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState<ValleyPoint | null>(null);

  useEffect(() => {
    const cvs = canvas.current;
    const box = wrap.current;
    if (!cvs || !box || !points.length) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Project lat/lng into the box once. The valley is small enough that a plate-carrée
    // projection is visually honest at this scale — this is a portrait of the inventory, not
    // a map you navigate.
    let W = 0, H = 0, dpr = 1;
    let proj: Array<{ x: number; y: number; r: number; tw: number; p: ValleyPoint }> = [];

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

    const layout = () => {
      const r = box.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cvs.width = Math.round(W * dpr);
      cvs.height = Math.round(H * dpr);
      cvs.style.width = `${W}px`;
      cvs.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Fit with generous margins — the field should breathe, not fill the frame.
      const padX = W * 0.1, padY = H * 0.16;
      proj = points.map((p, i) => ({
        x: padX + ((p.lng - minLng) / (maxLng - minLng || 1)) * (W - padX * 2),
        // y is inverted: north is up.
        y: padY + (1 - (p.lat - minLat) / (maxLat - minLat || 1)) * (H - padY * 2),
        r: 0.7 + (i % 5) * 0.16,
        tw: (i % 37) / 37, // a stable per-point phase, so the twinkle is not a uniform pulse
        p,
      }));
    };

    let px = 0, py = 0, cx2 = 0, cy2 = 0; // pointer target and eased position
    let hoverIdx = -1;
    let raf = 0;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      cx2 += (px - cx2) * 0.05;
      cy2 += (py - cy2) * 0.05;

      for (let i = 0; i < proj.length; i++) {
        const s = proj[i];
        // Parallax by depth: `r` doubles as distance, so bigger/nearer points travel further.
        const depth = s.r / 1.5;
        const x = s.x + cx2 * 16 * depth;
        const y = s.y + cy2 * 10 * depth;
        // A slow, per-point shimmer. Amplitude is tiny on purpose — a field that pulses
        // visibly reads as a screensaver.
        const shimmer = reduce ? 1 : 0.78 + 0.22 * Math.sin(t * 0.0012 + s.tw * Math.PI * 2);
        const isNear = i === hoverIdx;
        ctx.beginPath();
        ctx.arc(x, y, isNear ? s.r * 3.2 : s.r, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? "rgba(255,248,235,1)" : `rgba(255,246,232,${0.42 + 0.5 * shimmer})`;
        ctx.fill();
        if (isNear) {
          ctx.beginPath();
          ctx.arc(x, y, s.r * 9, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,240,214,.10)";
          ctx.fill();
        }
      }
      t += 16;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      px = (mx / r.width - 0.5) * 2;
      py = (my / r.height - 0.5) * 2;
      // Nearest point, but only within a small radius — otherwise something is always
      // "selected" and the effect loses its meaning.
      let best = -1, bestD = 44 * 44;
      for (let i = 0; i < proj.length; i++) {
        const dx = proj[i].x - mx, dy = proj[i].y - my;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best !== hoverIdx) {
        hoverIdx = best;
        setNear(best >= 0 ? proj[best].p : null);
      }
    };

    layout();
    draw();
    const ro = new ResizeObserver(() => { layout(); if (reduce) draw(); });
    ro.observe(box);
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [points]);

  return (
    <div ref={wrap} className="relative isolate h-full w-full overflow-hidden bg-[#07090c]">
      <canvas ref={canvas} aria-hidden className="absolute inset-0" />
      {/* A horizon wash so the field sits in a place rather than floating in the void. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 88%, rgba(120,150,190,.16), transparent 72%)," +
            "linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.35) 45%, transparent 85%)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
      {/* The readout. Fixed position and reserved height so a listing appearing under the
          cursor never nudges the layout — the count line's own lesson. */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-20 h-9 min-w-[210px] text-right">
        {near && (
          <p className="font-display text-lg leading-none text-paper/90">
            ${near.price.toLocaleString("en-US")}
            <span className="ml-2 text-xs uppercase tracking-[0.16em] text-paper/55">{near.city}</span>
          </p>
        )}
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-paper/35">
          {points.length.toLocaleString("en-US")} homes, live
        </p>
      </div>
    </div>
  );
}
