/** THE SHARP GATE (round 57.10): when the map under our cover is drawn sharp enough to be shown.
 *
 * Measured (docs/parity/DESIGN-ROUND57.md §7, round 10; scripts/_scratch-r57i-see.mjs: the map alone,
 * a frame every 250 ms, the Laplacian's variance against the settled frame): cold at 1440 the
 * territory is 0.96 sharp at 6.0 s and 1.0 at 6.5 s, the moment its tiles stop arriving, but Google's
 * `gmp-steadychange` says steady only at 6.8 s; after the walk the territory is back at 0.95 in 250
 * ms (its tiles resident) and quiet by 300 ms, yet steady never came inside the 2 s the cover waited.
 * So the cover waited 1.7 s on an event, over a map already sharp. (The first draw keeps Google's
 * event: the tiles' quiet was tried for it and, on a slower line, fired during a pause of the stream
 * over a map still blurred.)
 *
 * The page cannot read Google's pixels (the map's canvas is out of reach), but it sees every tile
 * arrive (resource timing: `rt/earth` BulkMetadata and NodeData), so "sharp" is: no tile has arrived
 * for QUIET_MS. The pure rules are here, tested; the controller keeps the clock. */

/** No tile for this long after the last one (or after the camera was set, if none came). */
export const QUIET_MS = 300;
/** Never sooner than this after a camera was set: its first requests take ~100 ms to go out. */
export const QUIET_MIN_MS = 250;
/** The cover never holds past this, from navigation, once the map has drawn. */
export const COVER_CAP_MS = 14_000;
/** What the walk under the cover needs to finish (its steps, then the return): measured 1.7 s of
 * steps at 1440 and the return's quiet; the phone's jump walk about 2.6 s. */
export const WALK_ROOM_MS = 2_600;

/** The camera set at `since` is drawn: nothing has arrived for QUIET_MS (tiles before `since` do not
 * count), and at least QUIET_MIN_MS have gone by. */
export function tilesQuiet(o: { now: number; since: number; lastTile: number | null; quietMs?: number; minMs?: number }): boolean {
  const quiet = o.quietMs ?? QUIET_MS;
  const min = o.minMs ?? QUIET_MIN_MS;
  if (o.now - o.since < min) return false;
  const from = o.lastTile === null ? o.since : Math.max(o.since, o.lastTile);
  return o.now - from >= quiet;
}

/** May the return to shot `back` be called drawn by quiet? Only when it is the shot the map already
 * drew once (Google's steady): its tiles are resident, so a pause means done. A shot the map has not
 * drawn yet (the visitor scrolled under the cover) streams its tiles, and a slow stream pauses: there
 * the quiet fired over a map still blurred (measured, 0.01 of its settled sharpness), so it waits for
 * Google's steady. */
export function quietBack(o: { back: string | null; drawn: string | null }): boolean {
  return o.drawn !== null && o.back === o.drawn;
}

/** Is there room for the walk before the cover's cap? */
export function walkFits(now: number, capMs = COVER_CAP_MS, roomMs = WALK_ROOM_MS): boolean {
  return now + roomMs <= capMs;
}

/** How long a wait under the cover may still take: `want`, cut at the cap, never below QUIET_MIN_MS. */
export function holdLeft(now: number, want: number, capMs = COVER_CAP_MS): number {
  return Math.max(QUIET_MIN_MS, Math.min(want, capMs - now));
}
