import { unpackLights, type LightPoints, type PackedLights } from "./lights";

/** One fetch of the home page's lights for everything on the page that draws them (the hero map
 * and the area tiles), so the page asks /api/lights once. A failure is not remembered: the next
 * caller may try again. Resolves null when there is nothing to draw. */
let pending: Promise<LightPoints | null> | null = null;

/** THE EARLY FETCH (round 59). The home page starts the lights' fetch with the document, in an
 * inline script ahead of the page's own bundle (app/page.tsx, `EARLY_LIGHTS`), and leaves the
 * promise on the window; the first caller here takes it, so the page asks /api/lights ONCE.
 * Round 58 had asked for it with `<link rel="preload" as="fetch">`; measured on Chrome 2026-09-25,
 * that preload was never matched by the fetch below (two full downloads on every cold visit, the
 * response's `Vary` the likely reason), so the request now IS the fetch, not a hint about it. */
export const EARLY_LIGHTS_KEY = "__rltLights";

/** Round 61: the early script parses the answer too (`EARLY_LIGHTS_SCRIPT`), so the JSON is read
 * while the page is still waiting for its bundle, not after hydration; the window holds the parsed
 * lights (a failed or non-OK answer rejects, and the next caller fetches afresh). */
export const EARLY_LIGHTS_SCRIPT = `window.${EARLY_LIGHTS_KEY}=fetch("/api/lights").then(function(r){if(!r.ok)throw new Error("lights "+r.status);return r.json()});window.${EARLY_LIGHTS_KEY}.catch(function(){});`;

function takeEarly(): Promise<PackedLights> | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, Promise<PackedLights> | undefined>;
  const p = w[EARLY_LIGHTS_KEY];
  if (!p) return null;
  delete w[EARLY_LIGHTS_KEY];
  return p;
}

export function loadLights(): Promise<LightPoints | null> {
  pending ??= (takeEarly() ?? fetch("/api/lights").then((r) => r.json() as Promise<PackedLights>))
    .then((p) => {
      const pts = unpackLights(p);
      return pts.x.length ? pts : null;
    })
    .catch(() => {
      pending = null;
      return null;
    });
  return pending;
}
