"use client";

import { useEffect, useState } from "react";

// Live realtylt.com plays this exact Vimeo clip as an ambient desktop hero background
// (extracted from the live DOM: `.video-background > .video-foreground`, classes
// `hidden-sm hidden-xs` = desktop only). We mirror it as a muted, non-interactive
// background that fades in OVER the static poster so there is never a black flash
// (live shows black until the video arrives — this beats that).
const VIMEO_SRC =
  "https://player.vimeo.com/video/398379426?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0";

/**
 * Desktop-only ambient hero video. Renders nothing on mobile, for reduced-motion users,
 * or with JS off — in every one of those cases the static poster image behind it is what
 * shows. The iframe mounts only after first paint (requestIdleCallback) so it never blocks
 * the LCP, and cross-fades in on load so the poster covers the black player boot frame.
 */
export function HomeHeroVideo() {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Match live: desktop widths only, and never for reduced-motion users.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!desktop.matches || reduce.matches) return;

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const start = () => setMount(true);
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  if (!mount) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* A true 16:9 iframe sized to always exceed the hero band in both dimensions, then
          centre-cropped by the parent's overflow-hidden — a reliable "cover" without
          depending on Vimeo's internal fit. */}
      <iframe
        src={VIMEO_SRC}
        title="Ambient background video of a scenic countryside drive"
        tabIndex={-1}
        allow="autoplay; fullscreen"
        onLoad={() => setReady(true)}
        className="absolute left-1/2 top-1/2 aspect-video w-[max(100vw,1200px)] -translate-x-1/2 -translate-y-1/2 border-0"
      />
    </div>
  );
}
