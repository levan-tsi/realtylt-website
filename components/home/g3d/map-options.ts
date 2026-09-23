/** The real map's look, decided in one place (round 57.2).
 *
 * THE MAP ID. A cloud style that thins Google's points of interest is made only in the Cloud
 * console (there is no API): a map ID on the Map Management page (JavaScript), a style made as "2D
 * hybrid" (3D preview is unavailable), associated with the ID, published. The owner makes it; the
 * page takes `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` and sets it on the element. Absent, the map is Google's
 * unstyled map. A value that cannot be a map ID (pasted with its quotes, a URL) counts as absent, so
 * a slip in the env leaves the map as it is rather than asking Google for a style that is not there.
 *
 * THE MODE. HYBRID draws Google's names, roads and coloured POI pins over the imagery; SATELLITE the
 * imagery alone. `split` keeps HYBRID at the territory shot (the names orient a stranger there)
 * and SATELLITE everywhere else (our words, the county names in "Where we work" and the lights carry
 * the chapters). `mode` is settable at runtime on maps 3.66 (measured, docs/parity/DESIGN-ROUND57.md
 * §4 "Round 2"). The page's `?mode=hybrid|satellite|split` switches it for comparison. */
import type { ShotName } from "../night/shots";

export type MapMode = "HYBRID" | "SATELLITE";
export type ModeChoice = "hybrid" | "satellite" | "split";

export function mapIdFrom(value: string | undefined | null): string | null {
  const v = (value ?? "").trim();
  return /^[A-Za-z0-9_-]{4,64}$/.test(v) ? v : null;
}

export function modeChoice(q: string | null | undefined, fallback: ModeChoice): ModeChoice {
  const v = (q ?? "").trim().toLowerCase();
  return v === "hybrid" || v === "satellite" || v === "split" ? v : fallback;
}

/** The mode for the shot the map is at or flying to (null: a camera of its own, a featured home). */
export function modeFor(shot: ShotName | null, choice: ModeChoice): MapMode {
  if (choice === "hybrid") return "HYBRID";
  if (choice === "satellite") return "SATELLITE";
  return shot === "hero" ? "HYBRID" : "SATELLITE";
}
