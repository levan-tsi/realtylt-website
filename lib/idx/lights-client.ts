import { unpackLights, type LightPoints, type PackedLights } from "./lights";

/** One fetch of the home page's lights for everything on the page that draws them (the hero map
 * and the area tiles), so the page asks /api/lights once. A failure is not remembered: the next
 * caller may try again. Resolves null when there is nothing to draw. */
let pending: Promise<LightPoints | null> | null = null;

export function loadLights(): Promise<LightPoints | null> {
  pending ??= fetch("/api/lights")
    .then((r) => r.json() as Promise<PackedLights>)
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
