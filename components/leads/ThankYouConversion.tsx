"use client";

import { useEffect, useRef } from "react";

/** Fires the lead conversion exactly once, on arrival.
 *
 * Why a component and not a line in the page: app/thank-you/page.tsx stays a SERVER component
 * this way, so the page renders in full with JavaScript disabled. The measurement is the only
 * part that needs a browser, and it is the only part that is client-side.
 *
 * WHY NOT `useSearchParams`, which is the obvious way to read `?from=`: it suspends. A suspending
 * client component puts a Suspense boundary over this route, and Next then STREAMS the page into
 * `<div hidden id="S:0">` and reveals it with an inline `$RC(...)` call that never runs without
 * JavaScript. That is not a hypothetical — it is exactly the bug this round found and fixed on
 * /search (see app/search/loading.tsx), where 50 listings sat in the DOM and 0 were visible.
 * `window.location.search` is already client-only, needs no boundary, and cannot take the page
 * down with it.
 *
 * Why a ref rather than a plain effect body: React runs effects twice in development StrictMode.
 * Double-counting a conversion is worse than missing one, because an inflated number is believed
 * and then spent against.
 */
export function ThankYouConversion() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Which form this came from, so the conversion can be attributed without a second page.
    const from = new URLSearchParams(window.location.search).get("from") ?? "unknown";
    const g = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    try {
      g?.("event", "generate_lead", { event_category: "Lead", event_label: from });
    } catch {
      /* measurement must never break the page a visitor is standing on */
    }
  }, []);

  return null;
}
