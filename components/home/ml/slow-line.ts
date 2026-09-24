/** THE SLOW LINE (round 57.13). On Slow 4G the full night map took 26 s to draw the territory
 * (the record's round 12): the terrain and hillshade PNGs, the elevation grid for our lights'
 * heights, and 9 to 12 full-detail vector tiles (1.1 to 1.6 MB gzipped) all queue behind the page's
 * own bytes at ~180 KB/s. When the line is slow the map draws the flat night map instead (no
 * terrain, no hillshade, no elevation grid) and the territory from coarse tiles (style.ts
 * `coarse`): the lights and our names carry it. Two ways to know:
 *  - the browser says so up front: `navigator.connection.effectiveType` of 3g, 2g or slow-2g
 *    (Chromium; Safari and Firefox have no such API and are never judged slow by it);
 *  - the map finds out: its first vector tile has not arrived two seconds after it was created. By
 *    then the style is set, so only the terrain and the hillshade are dropped. */

export const SLOW_EFFECTIVE_TYPES: readonly string[] = ["slow-2g", "2g", "3g"];
export const FIRST_TILE_BUDGET_MS = 2000;

export function slowConnection(conn: { effectiveType?: string } | null | undefined): boolean {
  return !!conn?.effectiveType && SLOW_EFFECTIVE_TYPES.includes(conn.effectiveType);
}

/** `firstTileAt`: when the first vector tile arrived (null: not yet); `createdAt`: the map's
 * creation; `now`: the clock. All in the same ms. */
export function slowFirstTile(firstTileAt: number | null, createdAt: number, now: number): boolean {
  const waited = (firstTileAt ?? now) - createdAt;
  return waited > FIRST_TILE_BUDGET_MS;
}
