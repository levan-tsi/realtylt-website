"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { unpackLights, type LightBox, type PackedLights } from "@/lib/idx/lights";
import { HUDSON_CENTRELINE, SHORELINES } from "@/lib/geo/hudson-water";

/** THE HOME HERO'S MAP OF LIGHTS (round 53).
 *
 * Every point is an active for-sale listing at its measured address (app/api/lights), so the
 * picture is the inventory: Poughkeepsie at the top, the river as the dark line between the
 * banks, the five boroughs burning at the bottom. It is the real-estate twin of the /ai galaxy,
 * where every star is also a real thing.
 *
 * Three behaviours, and only three:
 *  1. THE LIGHTS COME ON. Once, on arrival: the dusk sky fades to night while each window lights
 *     at its own moment, the evening moving down the river from north to south (~2.3s).
 *  2. A slow shimmer on a few lights, the way distant lights do. Nothing else moves by itself.
 *  3. THE LANTERN (mouse only). Lights near the pointer brighten, the nearest town is named with
 *     its count, and a click runs that town's search, the same URL as picking it from the box.
 *
 * Reduced motion gets the finished frame: no dusk, no shimmer, and the lantern answers without
 * easing. The canvas is decoration (aria-hidden); everything it offers a pointer, the search box
 * offers a keyboard. It pauses whenever it is off screen or the tab is hidden.
 */

const LAT_SCALE = Math.cos((41.3 * Math.PI) / 180); // the served region's middle latitude
const INTRO_S = 2.3;
const LANTERN_R = 88; // css px
const PICK_R = 22; // css px: how near a light must be for the lantern to name its town

type Geo = { dpr: number; W: number; H: number; ox: number; oy: number; w: number; h: number };

function fit(W: number, H: number, box: LightBox): Geo {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bw = (box.east - box.west) * LAT_SCALE;
  const bh = box.north - box.south;
  const pad = Math.min(W, H) * 0.04;
  const s = Math.min((W - 2 * pad) / bw, (H - 2 * pad) / bh);
  const w = bw * s;
  const h = bh * s;
  return { dpr, W, H, w, h, ox: (W - w) / 2, oy: (H - h) / 2 };
}

/** One warm light, drawn once and stamped 15,000 times: a hot core that falls off to nothing. */
function makeSprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255,246,228,1)");
  grad.addColorStop(0.16, "rgba(252,221,160,0.95)");
  grad.addColorStop(0.42, "rgba(246,199,129,0.28)");
  grad.addColorStop(1, "rgba(246,199,129,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

function rand(i: number): number {
  // Deterministic per light, so a resize does not reshuffle which windows shimmer.
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function HeroLights({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(false);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const canvas = canvasRef.current;
    const label = labelRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !label) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const sprite = makeSprite();

    let disposed = false;
    let raf = 0;
    let onScreen = true;
    let introStart = 0;
    let geo: Geo | null = null;
    let box: LightBox | null = null;
    // Positions as fractions of the box, kept so a resize can re-project without re-fetching.
    let xs: Float32Array = new Float32Array(0);
    let ys: Float32Array = new Float32Array(0);
    let px = new Float32Array(0); // css px
    let py = new Float32Array(0);
    let alpha = new Float32Array(0);
    let delay = new Float32Array(0);
    let town: Uint16Array = new Uint16Array(0);
    let towns: string[] = [];
    let counts: number[] = [];
    let shimmer: number[] = []; // indices of the lights that shimmer
    let grid = new Map<number, number[]>();
    const CELL = 32;
    let base: HTMLCanvasElement | null = null; // the finished frame, minus the shimmering lights
    let pointer: { x: number; y: number } | null = null;
    let hover = -1; // town index under the lantern

    const toX = (lng: number) => geo!.ox + ((lng - box!.west) / (box!.east - box!.west)) * geo!.w;
    const toY = (lat: number) => geo!.oy + ((box!.north - lat) / (box!.north - box!.south)) * geo!.h;

    function drawWater(g: CanvasRenderingContext2D) {
      g.save();
      g.lineJoin = "round";
      g.lineCap = "round";
      g.strokeStyle = "rgba(147,163,184,0.2)";
      g.lineWidth = 1;
      for (const line of SHORELINES) {
        g.beginPath();
        line.forEach(([lng, lat], i) => (i ? g.lineTo(toX(lng), toY(lat)) : g.moveTo(toX(lng), toY(lat))));
        g.stroke();
      }
      // The river itself carries a little more of the moon than the shore does.
      g.strokeStyle = "rgba(170,190,214,0.26)";
      g.lineWidth = 1.4;
      for (const line of HUDSON_CENTRELINE) {
        g.beginPath();
        line.forEach(([lng, lat], i) => (i ? g.lineTo(toX(lng), toY(lat)) : g.moveTo(toX(lng), toY(lat))));
        g.stroke();
      }
      g.restore();
    }

    const SIZE = 5.2; // css px: the sprite's full width; the hot core is about a pixel
    function stamp(g: CanvasRenderingContext2D, i: number, a: number, scale = 1) {
      if (a <= 0.003) return;
      const s = SIZE * scale;
      g.globalAlpha = a > 1 ? 1 : a;
      g.drawImage(sprite, px[i] - s / 2, py[i] - s / 2, s, s);
    }

    /** t = seconds since the lights began; Infinity = the finished frame. */
    function drawLights(g: CanvasRenderingContext2D, t: number, skipShimmer: boolean) {
      g.globalCompositeOperation = "lighter";
      const skip = skipShimmer ? new Set(shimmer) : null;
      for (let i = 0; i < px.length; i++) {
        if (skip?.has(i)) continue;
        const k = t === Infinity ? 1 : Math.min(1, Math.max(0, (t - delay[i]) / 0.45));
        stamp(g, i, alpha[i] * k * k);
      }
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
    }

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      if (!box || rect.width < 2 || rect.height < 2) return;
      geo = fit(rect.width, rect.height, box);
      canvas!.width = Math.round(rect.width * geo.dpr);
      canvas!.height = Math.round(rect.height * geo.dpr);
      for (let i = 0; i < px.length; i++) {
        px[i] = geo.ox + xs[i] * geo.w;
        py[i] = geo.oy + ys[i] * geo.h;
      }
      // Dense places would burn to a white blob: a light's own brightness falls with how many
      // share its few pixels, so Manhattan reads as a city of windows, not a flare.
      const dense = new Map<number, number>();
      const key = (i: number) => Math.floor(px[i] / 3) * 100000 + Math.floor(py[i] / 3);
      for (let i = 0; i < px.length; i++) dense.set(key(i), (dense.get(key(i)) ?? 0) + 1);
      for (let i = 0; i < px.length; i++) alpha[i] = (0.5 + 0.5 * rand(i)) / Math.sqrt(dense.get(key(i))!);
      grid = new Map();
      for (let i = 0; i < px.length; i++) {
        const k = Math.floor(px[i] / CELL) * 10000 + Math.floor(py[i] / CELL);
        const b = grid.get(k);
        if (b) b.push(i);
        else grid.set(k, [i]);
      }
      // Cache the finished frame once; afterwards a frame is one drawImage plus a few hundred.
      base = document.createElement("canvas");
      base.width = canvas!.width;
      base.height = canvas!.height;
      const bg = base.getContext("2d")!;
      bg.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0);
      drawWater(bg);
      drawLights(bg, Infinity, !reduce);
    }

    function near(x: number, y: number, r: number, visit: (i: number, d: number) => void) {
      const c0 = Math.floor((x - r) / CELL), c1 = Math.floor((x + r) / CELL);
      const r0 = Math.floor((y - r) / CELL), r1 = Math.floor((y + r) / CELL);
      for (let cx = c0; cx <= c1; cx++)
        for (let cy = r0; cy <= r1; cy++) {
          const b = grid.get(cx * 10000 + cy);
          if (!b) continue;
          for (const i of b) {
            const d = Math.hypot(px[i] - x, py[i] - y);
            if (d < r) visit(i, d);
          }
        }
    }

    let lastDraw = 0;
    function frame(now: number) {
      raf = 0;
      if (disposed || !geo || !base) return;
      const t = reduce ? Infinity : (now - introStart) / 1000;
      // A shimmer does not need 60 frames a second; ~24 is indistinguishable and half the work.
      // The intro and the lantern answer at the display's own rate.
      if (t > INTRO_S + 0.5 && !pointer && now - lastDraw < 40) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0);
      const intro = t < INTRO_S + 0.5;
      if (intro) {
        drawWater(ctx!);
        drawLights(ctx!, t, false);
      } else {
        ctx!.setTransform(1, 0, 0, 1, 0, 0);
        ctx!.drawImage(base, 0, 0);
        ctx!.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0);
        ctx!.globalCompositeOperation = "lighter";
        if (!reduce) {
          // The shimmer: a slow dip in brightness, each light on its own clock.
          const s = now / 1000;
          for (const i of shimmer) {
            const p = 3 + rand(i + 7) * 5;
            const dip = 0.5 + 0.5 * Math.cos((s / p + rand(i + 3)) * Math.PI * 2);
            stamp(ctx!, i, alpha[i] * (0.45 + 0.55 * dip));
          }
        }
        if (pointer) {
          // The lantern's own light: faint and warm, so it reads as something you are holding
          // over the map even where the homes are sparse. Its source is the pointer.
          const g = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, LANTERN_R * 1.3);
          g.addColorStop(0, "rgba(246,199,129,0.075)");
          g.addColorStop(1, "rgba(246,199,129,0)");
          ctx!.globalAlpha = 1;
          ctx!.fillStyle = g;
          ctx!.fillRect(pointer.x - LANTERN_R * 1.3, pointer.y - LANTERN_R * 1.3, LANTERN_R * 2.6, LANTERN_R * 2.6);
          near(pointer.x, pointer.y, LANTERN_R, (i, d) => {
            const f = 1 - d / LANTERN_R;
            stamp(ctx!, i, f * 1.1, 1 + f);
          });
        }
        ctx!.globalCompositeOperation = "source-over";
        ctx!.globalAlpha = 1;
      }
      // Keep drawing while there is something alive to draw: the intro, the shimmer, a lantern.
      if (onScreen && !document.hidden && (intro || !reduce || pointer)) raf = requestAnimationFrame(frame);
    }

    const kick = () => {
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    };

    function showLabel() {
      if (!pointer || hover < 0) {
        label!.style.opacity = "0";
        canvas!.style.cursor = "";
        return;
      }
      const n = counts[hover] ?? 0;
      label!.firstElementChild!.textContent = towns[hover];
      label!.lastElementChild!.textContent = `${n.toLocaleString("en-US")} ${n === 1 ? "home" : "homes"} for sale`;
      const flip = pointer.x > geo!.W - 220;
      label!.style.transform = `translate(${Math.round(pointer.x + (flip ? -16 : 16))}px, ${Math.round(pointer.y - 18)}px) translate(${flip ? "-100%" : "0"}, -100%)`;
      label!.style.opacity = "1";
      canvas!.style.cursor = "pointer";
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !geo) return;
      const r = canvas!.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      let best = -1;
      let bestD = PICK_R;
      near(pointer.x, pointer.y, PICK_R, (i, d) => {
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      hover = best >= 0 ? town[best] : -1;
      showLabel();
      kick();
    };
    const onLeave = () => {
      pointer = null;
      hover = -1;
      showLabel();
      kick();
    };
    const onClick = () => {
      if (hover >= 0) routerRef.current.push(`/search?q=${encodeURIComponent(towns[hover])}`);
    };

    const ro = new ResizeObserver(() => {
      layout();
      kick();
    });
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      kick();
    });
    const onVis = () => kick();

    const load = async () => {
      try {
        const res = await fetch("/api/lights");
        const packed = (await res.json()) as PackedLights;
        if (disposed) return;
        const pts = unpackLights(packed);
        if (!pts.x.length) throw new Error("no lights");
        box = packed.box;
        xs = pts.x;
        ys = pts.y;
        town = pts.town;
        towns = pts.towns;
        counts = pts.counts;
        const n = xs.length;
        px = new Float32Array(n);
        py = new Float32Array(n);
        alpha = new Float32Array(n);
        delay = new Float32Array(n);
        // North lights first, then down the river: y is 0 at Poughkeepsie and 1 at the harbour.
        for (let i = 0; i < n; i++) delay[i] = 0.15 + ys[i] * 1.2 + rand(i + 1) * 0.5;
        shimmer = [];
        for (let i = 0; i < n; i++) if (rand(i + 11) < 0.04) shimmer.push(i);
        layout();
        introStart = performance.now();
        setLit(true);
        ro.observe(canvas!);
        io.observe(canvas!);
        document.addEventListener("visibilitychange", onVis);
        if (mouse) {
          canvas!.addEventListener("pointermove", onMove);
          canvas!.addEventListener("pointerleave", onLeave);
          canvas!.addEventListener("click", onClick);
        }
        kick();
      } catch {
        // No lights: the night and the river still stand, and the search box is untouched.
        if (!disposed) setLit(true);
      }
    };

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 1200 }) : window.setTimeout(load, 300);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      if (typeof idle === "number" && !w.requestIdleCallback) clearTimeout(idle);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className={className} aria-hidden>
      {/* Dusk: the sky before the lights, the last of the light after sunset. It fades to night
          as they come on, so the arrival is one event. Its source is the sun below the horizon. */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2400ms] ease-out motion-reduce:transition-none ${lit ? "opacity-0" : "opacity-100"}`}
        style={{ background: "linear-gradient(to bottom, #1c3658 0%, #14294a 45%, rgba(11,26,46,0) 100%)" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 rounded-xl border border-line-strong bg-night-deep/85 px-3.5 py-2 opacity-0 backdrop-blur-sm transition-opacity duration-150 motion-reduce:transition-none"
      >
        <p className="text-[15px] font-semibold leading-tight text-ink" />
        <p className="text-[13px] leading-tight text-stone" />
      </div>
    </div>
  );
}
