"use client";

import type { Touch } from "./attribution";

/** The browser's half of lib/leads/attribution.ts: remember how this device arrived.
 *
 * localStorage, not a cookie, for the same reason PostHog here is cookieless: the site has no
 * cookie banner and keeps it that way. Nothing leaves the device until the visitor sends a form.
 * Every access is wrapped: a private window or blocked storage must never break a page. */

const KEY = "rlt_src";
const FIRST_TOUCH_DAYS = 90;
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

interface Stored {
  first?: Touch;
  last?: Touch;
}

function read(): Stored {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as Stored) : {};
  } catch {
    return {};
  }
}

/** Called once per page load (components/site/AttributionCapture.tsx). */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const touch: Touch = { landing: window.location.pathname.slice(0, 200), at: new Date().toISOString() };
    let outside = false;
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.host !== window.location.host) {
        touch.referrer = `${ref.host}${ref.pathname}`.slice(0, 200);
        outside = true;
      }
    }
    for (const key of UTM) {
      const v = params.get(key)?.trim().slice(0, 200);
      if (v) {
        touch[key] = v;
        outside = true;
      }
    }
    const click = params.has("gclid") || params.has("gbraid") || params.has("wbraid") ? "google" : params.has("msclkid") ? "microsoft" : params.has("fbclid") ? "meta" : undefined;
    if (click) {
      touch.click = click;
      outside = true;
    }

    const stored = read();
    const firstAt = stored.first?.at ? Date.parse(stored.first.at) : NaN;
    const stale = !Number.isFinite(firstAt) || Date.now() - firstAt > FIRST_TOUCH_DAYS * 86_400_000;
    if (stale) {
      window.localStorage.setItem(KEY, JSON.stringify({ first: touch }));
    } else if (outside) {
      window.localStorage.setItem(KEY, JSON.stringify({ first: stored.first, last: touch }));
    }
  } catch {
    /* storage or URL parsing unavailable: the lead simply carries no source */
  }
}

/** What a form attaches to its lead. Undefined when nothing is known. */
export function readAttribution(): { first?: Touch; last?: Touch; tz?: string } | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = read();
  let tz: string | undefined;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    tz = undefined;
  }
  if (!stored.first && !stored.last && !tz) return undefined;
  return { first: stored.first, last: stored.last, tz };
}
