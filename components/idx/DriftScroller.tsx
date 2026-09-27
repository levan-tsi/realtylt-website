"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { driftAdvance, driftEase, driftSpeed, driftSplit, scrolledByHand } from "./drift";

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
 * JavaScript off, the same.
 *
 * SUB-PIXEL, SO IT GLIDES (round 64). The owner saw it lag. Measured frame by frame, Chrome keeps
 * scrollLeft in whole CSS pixels, so at ~50 px/s the rail sat still on 63% of frames and jumped a
 * pixel on the rest (three device pixels on a phone): a stutter, not a drift. Now the whole pixels
 * still go to scrollLeft and the remainder (under one pixel) is a transform on the track, which
 * wears `will-change: transform` so the compositor moves its tiles without repainting or
 * re-rastering them; the scroll position still decides what gets rastered. The speed also eases
 * to a stop under a pointer or focus and eases back up, instead of switching; a finger or a hand
 * scroll still stops it at once. */
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
    let vel = 0; // 0..1, the eased share of `speed` the rail is moving at
    let frac = 0; // the sub-pixel remainder the track's transform carries
    const track = el.firstElementChild instanceof HTMLElement ? el.firstElementChild : null;
    const place = (next: number) => {
      pos = next;
      const split = driftSplit(pos);
      if (split.scroll !== written) el.scrollLeft = written = split.scroll;
      frac = split.frac;
      if (track) track.style.transform = `translate3d(${-frac}px,0,0)`;
    };

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
      if (touching || now < holdUntil) vel = 0; // a hand on it: stop at once, never fight it
      else {
        const target = hovered || focused ? 0 : 1;
        vel = driftEase(vel, target, dt, target ? 0.6 : 0.18);
      }
      if (vel > 0 && speed > 0) place(driftAdvance(pos, speed * vel * dt, setWidth));
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf || !onScreen || !motion.matches) return;
      last = 0;
      written = el.scrollLeft;
      pos = written + frac;
      if (track) track.style.willChange = "transform";
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onScroll = () => {
      if (!scrolledByHand(el.scrollLeft, written)) return;
      // Someone else moved it: take that as the position and stay out of the way for a moment.
      written = el.scrollLeft;
      pos = written + frac;
      vel = 0;
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
    const onMotion = () => {
      if (motion.matches) return start();
      stop();
      // Reduced motion: a plain scroller again, with no transform left on the track.
      frac = 0;
      if (track) track.style.transform = track.style.willChange = "";
    };

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
