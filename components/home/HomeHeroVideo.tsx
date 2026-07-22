"use client";

import { useEffect, useRef, useState } from "react";

// Live realtylt.com plays this exact Vimeo clip as an ambient desktop hero background
// (extracted from the live DOM: `.video-background > .video-foreground`, classes
// `hidden-sm hidden-xs` = desktop only). We mirror it as a muted, non-interactive
// background that fades in OVER the static poster ONLY once the player reports real
// playback — so there is never a black boot frame (live shows solid black until the
// video buffers; this beats that). `api=1&player_id` put the player in the legacy
// postMessage protocol so it emits `ready`/`play`/`timeupdate` we can gate on.
const VIMEO_SRC =
  "https://player.vimeo.com/video/398379426?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&api=1&player_id=herovid";

const VIMEO_ORIGIN = "https://player.vimeo.com";

/**
 * Desktop-only ambient hero video. Renders nothing on mobile, for reduced-motion users,
 * or with JS off — in every one of those cases the static poster image behind it is what
 * shows. The iframe mounts only after first paint (requestIdleCallback) so it never blocks
 * the LCP, and the wrapper is revealed EVENT-GATED: it stays fully transparent (poster
 * showing) until the Vimeo player posts a real `play`/`timeupdate` message. There is NO
 * timeout-based reveal — if the player never reports playback (blocked, offline, buffering
 * forever) the poster simply stays, which is the correct, black-free fallback.
 */
export function HomeHeroVideo() {
  const [mount, setMount] = useState(false);
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Listen for the player's postMessages and reveal only on genuine playback.
  useEffect(() => {
    if (!mount) return;

    const post = (method: string, value?: string) =>
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify(value !== undefined ? { method, value } : { method }),
        VIMEO_ORIGIN,
      );

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== VIMEO_ORIGIN) return;
      let data = e.data as unknown;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      const ev = (data as { event?: string; method?: string }).event
        ?? (data as { method?: string }).method;
      // Player finished booting -> subscribe to the events that prove real playback.
      if (ev === "ready") {
        post("addEventListener", "play");
        post("addEventListener", "timeupdate");
        return;
      }
      // First frame is actually rendering -> safe to cross-fade the video in over the poster.
      if (ev === "play" || ev === "playing" || ev === "timeupdate") {
        setPlaying(true);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mount]);

  // Belt-and-suspenders: also request the events on iframe load in case we miss `ready`.
  // Reveal is still gated on a real play/timeupdate arriving, so this never causes a flash.
  const onLoad = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({ method: "addEventListener", value: "play" }), VIMEO_ORIGIN);
    win.postMessage(
      JSON.stringify({ method: "addEventListener", value: "timeupdate" }),
      VIMEO_ORIGIN,
    );
  };

  if (!mount) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* A true 16:9 iframe sized to always exceed the hero band in both dimensions, then
          centre-cropped by the parent's overflow-hidden — a reliable "cover" without
          depending on Vimeo's internal fit. */}
      <iframe
        ref={iframeRef}
        src={VIMEO_SRC}
        title="Ambient background video of a modern home and its grounds"
        tabIndex={-1}
        allow="autoplay; fullscreen"
        onLoad={onLoad}
        className="absolute left-1/2 top-1/2 aspect-video w-[max(100vw,1200px)] -translate-x-1/2 -translate-y-1/2 border-0"
      />
    </div>
  );
}
