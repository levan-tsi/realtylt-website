"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

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
 */
const POSTHOG_KEY = "phc_qZwzHefJot7V88DgPgDjZsihQn7LYVELki2M8kHhaow9";

export function PostHogInit() {
  useEffect(() => {
    if (posthog.__loaded) return;
    posthog.init(POSTHOG_KEY, {
      api_host: "/relay-ph",
      ui_host: "https://us.posthog.com",
      persistence: "localStorage",
      // SPA-aware pageviews: fire on history changes, not only the first load.
      capture_pageview: "history_change",
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,
      },
    });
  }, []);
  return null;
}
