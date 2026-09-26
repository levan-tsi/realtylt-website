"use client";

import { useEffect } from "react";

/**
 * PostHog product analytics (round 39, owner-approved 2026-08-24).
 *
 * THE SHAPE, and why each choice is what it is:
 *  - COOKIELESS: `persistence: "localStorage"` sets no cookie, which is what lets this site
 *    keep having no cookie banner. The distinct id survives reloads in this browser and
 *    that is all we ask of it.
 *  - PROXIED: `api_host` is our own /relay-ph path, rewritten server-side to PostHog's US
 *    cloud (next.config.ts). Nothing loads from or posts to a posthog.com origin in the
 *    browser, so the guarded CSP needed ZERO changes — script/connect/worker already allow
 *    'self'. lib/posthog-proxy.test.ts holds this file and the rewrites together.
 *  - REPLAY, MASKED: session recording is on with every input masked. The recorder script
 *    lazy-loads from the same proxy path.
 *  - GA STAYS: gtag feeds the owner's Ads conversions (app/layout.tsx). Two tools, two
 *    jobs; nothing here touches it.
 *
 * The phc_ token is the PUBLIC project token (it ships in page JavaScript on every PostHog
 * install by design) — hardcoded in the gtag idiom one component over.
 *
 * LOADED AFTER THE PAGE (round 61): the library is 254 KB of script (82 KB over the wire), and
 * imported statically it sat in the layout's first bundle, so every page downloaded and parsed it
 * before it could hydrate (the home page's lights waited on it). It is now its own chunk, asked for
 * once the browser is idle after hydration (at most 2 s later); the init and its options are
 * unchanged, and the preset's initial $pageview is sent at init as before.
 */
const POSTHOG_KEY = "phc_qZwzHefJot7V88DgPgDjZsihQn7LYVELki2M8kHhaow9";

export function PostHogInit() {
  useEffect(() => {
    let off = false;
    const go = () => void import("posthog-js").then(({ default: posthog }) => !off && init(posthog), () => {});
    // Safari before 16.4 has no requestIdleCallback: a timer there.
    const idle = typeof window.requestIdleCallback === "function";
    const id = idle ? window.requestIdleCallback(go, { timeout: 2000 }) : window.setTimeout(go, 1);
    return () => {
      off = true;
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);
  return null;
}

function init(posthog: typeof import("posthog-js").default) {
  if (posthog.__loaded) return;
  posthog.init(POSTHOG_KEY, {
    api_host: "/relay-ph",
    ui_host: "https://us.posthog.com",
    // PostHog's own recommended baseline (their Next.js guide). MEASURED before this:
    // hand-setting capture_pageview: "history_change" on 1.418 sent $pageleave but never
    // an initial-load $pageview — the Activity feed showed leaves with no views. The
    // dated preset carries the corrected pageview semantics.
    defaults: "2025-05-24",
    persistence: "localStorage",
    // Honour Do Not Track (and Global Privacy Control, which posthog-js reads the same way):
    // no capture at all for a visitor who asked not to be tracked (owner's privacy check 2026-09-24).
    respect_dnt: true,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
      // Round 61, measured: the project's remote config asks the recorder to capture <canvas> at
      // 3 fps, and it serialised the home page's 2880 x 1800 light canvases with toDataURL(): one
      // main-thread task of 1.7 s about 1.3 s after every load (scripts/_scratch-r61-longtask.mjs).
      // The local option is read before the remote one, so replays keep everything but canvases.
      captureCanvas: { recordCanvas: false },
    },
  });
}
