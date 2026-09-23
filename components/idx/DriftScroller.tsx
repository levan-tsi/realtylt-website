"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { driftAdvance, driftSpeed, scrolledByHand } from "./drift";

/** THE RAIL DRIFTS BY SCROLLING, NOT BY A TRANSFORM (round 55).
 *
 * Until this round the drift was one CSS animation translating a 5,760 px `will-change:
 * transform` track. Measured in the owner's Chrome on the real GPU, entering the rail cost 62 to
 * 132 ms frames: the compositor rastered the track's card chrome (rounded clips, gradient scrims,
 * backdrop blurs) for the run of the animation at once, in one Skia flush of 55 to 95 ms. A
 * scroll position is a different thing to the compositor: it rasters what is near the scrollport
 * and nothing else, and with `content-visibility: auto` on each card (globals.css) the cards out
 * of view paint nothing at all.
 *
 * So this component owns the rail's scrollLeft. A requestAnimationFrame loop advances it at the
 * speed the marquee had (./drift.ts), wraps it back by one set width once the first set has
 * passed (the second copy of the set is what makes that seamless), and stands aside whenever a
 * person is using the rail: a mouse over it, focus inside it, a finger on it, and for a moment
 * after any scroll that was not its own (a flick, a wheel). It runs only while the rail is on
 * screen. Under prefers-reduced-motion it does nothing and the rail is a plain scroller; with
 * JavaScript off, the same. */
export function DriftScroller({ className, secondsPerCard, children }: { className: string; secondsPerCard: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let raf = 0;
    let last = 0;
    let pos = 0;
    let written = 0;
    let holdUntil = 0;
    let hovered = false;
    let focused = false;
    let touching = false;
    let onScreen = false;
    let setWidth = 0;
    let speed = 0;

    // The set width is the distance from the first copy of the set to the second, measured (not
    // summed from card widths) so it is exact whatever the gaps and padding are, and fractional
    // where the layout is, so the wrap lands on the same sub-pixel.
    const measure = () => {
      const uls = el.querySelectorAll<HTMLElement>("ul");
      setWidth = uls.length > 1 ? uls[1].getBoundingClientRect().left - uls[0].getBoundingClientRect().left : 0;
      speed = driftSpeed(setWidth, uls[0]?.childElementCount ?? 0, secondsPerCard);
    };
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!hovered && !focused && !touching && now >= holdUntil && speed > 0) {
        pos = driftAdvance(pos, speed * dt, setWidth);
        written = pos;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf || !onScreen || !motion.matches) return;
      last = 0;
      pos = written = el.scrollLeft;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onScroll = () => {
      if (!scrolledByHand(el.scrollLeft, written)) return;
      // Someone else moved it: take that as the position and stay out of the way for a moment.
      pos = written = el.scrollLeft;
      holdUntil = performance.now() + 1500;
    };
    const onEnter = () => (hovered = true);
    const onLeave = () => (hovered = false);
    const onFocusIn = () => (focused = true);
    const onFocusOut = (e: FocusEvent) => (focused = e.relatedTarget instanceof Node && el.contains(e.relatedTarget));
    const onTouchStart = () => (touching = true);
    const onTouchEnd = () => {
      touching = false;
      holdUntil = performance.now() + 1500; // the fling that follows a finger
    };
    const onMotion = () => (motion.matches ? start() : stop());

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    motion.addEventListener("change", onMotion);
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      motion.removeEventListener("change", onMotion);
    };
  }, [secondsPerCard]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
