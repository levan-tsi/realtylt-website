/** THE FLIGHT AS THE TRANSITION (round 57.11). The owner's third verdict (record section 8): "it
 * zooms in and it's not good in the beginning, then it loads, it's better". The close shots stream
 * new tiles on every flight, and a visitor watching them fill in sees exactly that. So the flight
 * itself hides it: as a flight starts the map's veil deepens (VEIL_IN_MS, eased out, a response)
 * until the streaming imagery is nearly invisible and our lights carry the picture across; the
 * camera lands; the photograph comes back (VEIL_OUT_MS, eased in-out, a reveal) only when the
 * landed frame is sharp, and at most VEIL_HOLD_MS after the landing whatever the tiles say.
 *
 * "Sharp" is round 10's tile clock (sharp-gate.ts tilesQuiet: no tile for 300 ms, at least 250 ms
 * after the landing), measured 0.94 to 0.99 of the settled frame where the tiles are resident. On
 * a view the map has not drawn yet a slow stream pauses, so there quiet needs Google's steady event
 * beside it, or a LONG quiet (UNDRAWN_QUIET_MS). Measured on 16 cold landings (the probe
 * scripts/_scratch-r57j-landing2.mjs: every tile's arrival and the map's sharpness every ~450 ms
 * after each landing): the first tiles of a new view often come 300 to 900 ms after the landing,
 * so a 300 ms quiet fired over maps at 0.05 to 0.6 of their settled sharpness 4 times in 16, 500 ms
 * once (0.22), 800 ms never. Google's steady did not come at all after the landings of one cold
 * run at 1440 and came for 11 of 16 on the phone, so it cannot be the only way. Reduced motion:
 * the flight is a cut, the veil goes on and off with no transition, by the same rule. */
import { tilesQuiet } from "./sharp-gate";

export const VEIL_IN_MS = 300;
export const VEIL_OUT_MS = 700;
/** The longest the veil holds after a landing. */
export const VEIL_HOLD_MS = 2500;
/** On a view never drawn: no tile for this long counts as sharp without Google's steady. */
export const UNDRAWN_QUIET_MS = 800;
/** How dark the veil goes over a flight (black at this opacity over the graded map). */
export const VEIL_DEPTH = 0.82;

export type LiftBy = "quiet" | "steady" | "cap";

export function veilLift(o: {
  now: number;
  landedAt: number;
  lastTile: number | null;
  /** Google's steady event has come since the flight started, and says steady now. */
  steady: boolean;
  /** The map has drawn this view sharp before (its tiles are resident). */
  drawn: boolean;
  /** The tile clock runs (resource timing seen); without it quiet means nothing. */
  watching: boolean;
}): LiftBy | null {
  const t = o.now - o.landedAt;
  if (t >= VEIL_HOLD_MS) return "cap";
  if (!o.watching) return o.steady ? "steady" : null;
  if (!tilesQuiet({ now: o.now, since: o.landedAt, lastTile: o.lastTile })) return null;
  if (o.drawn) return "quiet";
  if (o.steady) return "steady";
  return tilesQuiet({ now: o.now, since: o.landedAt, lastTile: o.lastTile, quietMs: UNDRAWN_QUIET_MS }) ? "quiet" : null;
}

/** The veil's opacity: `depth` over a flight (the lab's `?fveil=`, clamped below 1 so our lights'
 * ground is never a black card), none at rest. */
export function veilDepth(o: { flying: boolean; depth?: number }): number {
  if (!o.flying) return 0;
  const d = o.depth ?? VEIL_DEPTH;
  return Number.isFinite(d) ? Math.min(0.95, Math.max(0, d)) : VEIL_DEPTH;
}
