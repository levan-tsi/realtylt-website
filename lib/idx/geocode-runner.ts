/** The incremental half of the geocoding story.
 *
 * scripts/backfill-geocodes.mjs placed the ~27k homes that were already in the table. New
 * listings arrive every hour, and a home that arrives after the backfill would sit on its zip
 * centroid forever unless something keeps asking — so the hourly sync runs this at the end of
 * every tick.
 *
 * Bounded on purpose. The cron has a 300s ceiling shared with the MLS pull, photo mirroring and
 * the off-market cleanup, so this takes a small slice at the back and leaves the rest for the
 * next tick. A typical hour brings well under a hundred new listings; the cap only matters
 * after an outage.
 *
 * The quality gate is the SAME one the backfill uses (lib/idx/geocode.mjs#rejectReason) —
 * shared rather than reimplemented, because a backfill and a cron that disagree about which
 * coordinates are believable is exactly how a map ends up with a house in the wrong county.
 */
import ZIP_CENTROIDS from "./zip-centroids.json";
import { addrKey, rejectReason, type GeocodeHit, type GeocodeRow } from "./geocode";

export interface GeocodeDeps {
  /** Active listings still standing on a zip centroid that nothing has tried yet. */
  listPending(limit: number): Promise<GeocodeRow[]>;
  /** Ask the geocoder. Rows it cannot place come back as misses. */
  geocode(rows: readonly GeocodeRow[]): Promise<{ hits: GeocodeHit[]; misses: GeocodeRow[] }>;
  /** Store + project, via the secret-gated idx_geocode_apply RPC. */
  apply(
    hits: readonly GeocodeHit[],
    misses: ReadonlyArray<{ id: string; addrKey: string }>,
  ): Promise<{ saved: number; applied: number; missed: number }>;
}

export interface GeocodeRunResult {
  considered: number;
  placed: number;
  unplaced: number;
  rejected: number;
}

const centroidOf = (zip: string | undefined): number[] | null =>
  (ZIP_CENTROIDS as Record<string, number[]>)[zip ?? ""] ?? null;

/** Geocode up to `limit` pending listings. Never throws into the caller's happy path:
 * the sync must not fail because a free geocoder had a bad minute. */
export async function geocodePending(deps: GeocodeDeps, limit: number): Promise<GeocodeRunResult> {
  const empty: GeocodeRunResult = { considered: 0, placed: 0, unplaced: 0, rejected: 0 };
  if (limit <= 0) return empty;

  const pending = await deps.listPending(limit);
  if (!pending.length) return empty;

  const { hits, misses } = await deps.geocode(pending);

  const accepted: GeocodeHit[] = [];
  let rejected = 0;
  for (const h of hits) {
    const row = pending.find((r) => r.id === h.id);
    if (rejectReason(h, centroidOf(row?.zip))) {
      rejected++;
      continue;
    }
    accepted.push(h);
  }

  // A hit the gate threw out is not placed, so it counts as unplaceable too — otherwise the
  // next tick asks the same question and gets the same rejected answer, forever.
  const placedIds = new Set(accepted.map((h) => h.id));
  const unplaced = pending
    .filter((r) => !placedIds.has(r.id))
    .map((r) => ({ id: r.id, addrKey: addrKey(r.address, r.zip) }));

  await deps.apply(accepted, unplaced);
  return { considered: pending.length, placed: accepted.length, unplaced: unplaced.length, rejected };
}
