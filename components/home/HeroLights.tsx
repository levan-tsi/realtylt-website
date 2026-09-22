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
    // The shimmer runs only where there is a mouse, which is where the lantern lives too. On a
    // phone the map comes on and then holds still: nothing runs on its battery after the intro.
    const shimmerOn = !reduce && mouse;

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

    /** Every light at full strength, for the cached finished frame. */
    function drawAllLights(g: CanvasRenderingContext2D, skipShimmer: boolean) {
      g.globalCompositeOperation = "lighter";
      const skip = skipShimmer ? new Set(shimmer) : null;
      for (let i = 0; i < px.length; i++) if (!skip?.has(i)) stamp(g, i, alpha[i]);
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = 1;
    }

    // THE INTRO ACCUMULATES instead of redrawing. Redrawing all ~15,000 lights every frame
    // measured p95 67ms a frame on this PC and 133ms (worst 750ms) on a 4x-throttled phone.
    // Because the lights blend with "lighter", which ADDS, a light drawn four times at a quarter
    // of its strength is the same pixels as one drawn once at full strength. So each frame only
    // stamps the lights whose ramp crossed a step since the last one (a few hundred), onto a
    // canvas that is never cleared until the intro ends. The ramp stays eased: the step sizes
    // follow k squared, so every light still comes on slow-then-fast.
    const STEPS = 4;
    const stepFrac = Array.from({ length: STEPS + 1 }, (_, j) => (j / STEPS) ** 2);
    let drawn = new Uint8Array(0);
    let introFresh = true; // the next intro frame starts from a clean canvas

    function accumulate(g: CanvasRenderingContext2D, t: number) {
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < px.length; i++) {
        const k = Math.min(1, Math.max(0, (t - delay[i]) / 0.45));
        const target = Math.floor(k * STEPS + 1e-6);
        if (target <= drawn[i]) continue;
        stamp(g, i, alpha[i] * (stepFrac[target] - stepFrac[drawn[i]]));
        drawn[i] = target;
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
      // share its few pixels, so Manhattan reads as a city of windows, not a flare. A flat
      // typed grid, 3px a cell, rather than a Map: this runs on every resize.
      const gw = Math.ceil(rect.width / 3) + 1;
      const dense = new Uint16Array(gw * (Math.ceil(rect.height / 3) + 1));
      const cell = new Int32Array(px.length);
      for (let i = 0; i < px.length; i++) {
        cell[i] = Math.max(0, Math.floor(py[i] / 3)) * gw + Math.max(0, Math.floor(px[i] / 3));
        dense[cell[i]]++;
      }
      for (let i = 0; i < px.length; i++) alpha[i] = (0.5 + 0.5 * rand(i)) / Math.sqrt(dense[cell[i]]);
      // The lantern's lookup grid, only where there is a lantern.
      grid = new Map();
      if (mouse) {
        for (let i = 0; i < px.length; i++) {
          const k = Math.floor(px[i] / CELL) * 10000 + Math.floor(py[i] / CELL);
          const b = grid.get(k);
          if (b) b.push(i);
          else grid.set(k, [i]);
        }
      }
      // The cached finished frame is built when it is first needed (ensureBase), not here: at
      // the start of the intro it would cost 15,000 draws in the very frame the lights begin.
      base = null;
      // A resize empties the canvas: an intro in progress starts its accumulation over (the next
      // frame catches every light up to where it should be), and a finished map repaints once.
      drawn = new Uint8Array(px.length);
      introFresh = true;
      staticDrawn = false;
      introDone = false;
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

    /** The finished frame, cached. Without a shimmer it is exactly what the intro has just
     * accumulated on screen, so it is one copy of the canvas rather than 15,000 draws; with a
     * shimmer (desktop) it must leave the shimmering lights out, so it is drawn. */
    function ensureBase(accumulatedOnScreen: boolean) {
      if (base) return base;
      base = document.createElement("canvas");
      base.width = canvas!.width;
      base.height = canvas!.height;
      const bg = base.getContext("2d")!;
      if (accumulatedOnScreen && !shimmerOn) {
        bg.drawImage(canvas!, 0, 0);
      } else {
        bg.setTransform(geo!.dpr, 0, 0, geo!.dpr, 0, 0);
        drawWater(bg);
        drawAllLights(bg, shimmerOn);
      }
      return base;
    }

    let lastDraw = 0;
    let staticDrawn = false; // the finished map is on the canvas and nothing is moving
    let introDone = false; // the intro ran to its end on this canvas (so the canvas IS the frame)
    function frame(now: number) {
      raf = 0;
      if (disposed || !geo) return;
      const t = reduce ? Infinity : (now - introStart) / 1000;
      const live = onScreen && !document.hidden;
      if (t < INTRO_S + 0.5) {
        ctx!.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0);
        if (introFresh) {
          ctx!.clearRect(0, 0, geo.W, geo.H);
          drawWater(ctx!);
          introFresh = false;
        }
        accumulate(ctx!, t);
        staticDrawn = false;
        introDone = false;
        if (live) raf = requestAnimationFrame(frame);
        return;
      }
      // The first frame after the intro: finish any light a hidden tab or a stalled frame left
      // short, so the canvas is exactly the finished map before it is cached or cleared.
      if (!introDone && !reduce && !introFresh) {
        ctx!.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0);
        accumulate(ctx!, Infinity);
        introDone = true;
      }
      const cached = ensureBase(introDone && !introFresh);
      // Nothing alive (no shimmer on this device, no lantern): paint the finished map once, stop.
      if (!shimmerOn && !pointer) {
        if (!staticDrawn) {
          ctx!.setTransform(1, 0, 0, 1, 0, 0);
          ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
          ctx!.drawImage(cached, 0, 0);
          staticDrawn = true;
        }
        return;
      }
      // A shimmer does not need 60 frames a second; ~24 is indistinguishable and half the work.
      // The lantern answers at the display's own rate.
      if (!pointer && now - lastDraw < 40) {
        if (live) raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;
      staticDrawn = false;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.drawImage(cached, 0, 0);
      ctx!.setTransform(geo.dpr, 0, 0, geo.dpr, 0, 0);
      ctx!.globalCompositeOperation = "lighter";
      if (shimmerOn) {
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
      if (live && (shimmerOn || pointer)) raf = requestAnimationFrame(frame);
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
        data-js-only
        className={`absolute inset-0 transition-opacity duration-[2400ms] ease-out motion-reduce:transition-none ${lit ? "opacity-0" : "opacity-100"}`}
        style={{ background: "linear-gradient(to bottom, #1c3658 0%, #14294a 45%, rgba(11,26,46,0) 100%)" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Without JavaScript there is no canvas to light, so the picture of it stands in: the same
          map rendered by scripts/make-lights-poster.mjs, contained in the same box the canvas
          fits it to. Only a browser with scripting off ever loads it. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- noscript-only still */}
        <img src="/images/hero/lights-poster.webp" alt="" className="absolute inset-[4%] h-[92%] w-[92%] object-contain" />
      </noscript>
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
