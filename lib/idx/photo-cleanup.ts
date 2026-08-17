/** Off-market photo cleanup — give the storage back when a home leaves the market.
 *
 * WHY (owner, 2026-08-02): "we should add clean up job too. when its off market delete pictures.
 * if its back we will download again. other way we will carry dead weight."
 *
 * He is right on principle even though the bill does not force it: nothing in this codebase has
 * ever deleted a photo, so the bucket accumulates for ever. Measured before this existed: 28,251
 * listing folders, of which 2,570 belonged to listings that are no longer on the market.
 *
 * THE TRAP, and the reason this is not just a DELETE loop. Two different things track mirrored
 * photos and they are NOT the same field:
 *
 *   - `photos_servable` is computed FROM storage.objects by idx_refresh_photos_servable() on
 *     pg_cron. Delete the objects and it falls to 0 by itself. Nothing to do.
 *   - `listing.photosMirrored` / `photosMirroredCount` is the JSONB marker that getMirrorState
 *     reads and planRange resumes from. It is NOT derived from storage.
 *
 * So deleting the objects while leaving the marker at 30 tells the next sync "this listing is
 * already fully mirrored". If the home came back on the market it would resume from index 30,
 * download nothing, and show ZERO photos for ever — strictly worse than the dead weight we set
 * out to reclaim. Clearing the marker is what makes "if its back we will download again" true.
 *
 * Deliberately conservative: only ever touches rows the database already says are inactive, only
 * ever deletes under that listing's own prefix, and is bounded per run so a bad day cannot turn
 * into a mass deletion.
 *
 * A SALE IS NOT DEAD WEIGHT — THE ONE EXEMPTION (owner, 2026-08-17): "if they transfer we would
 * not download, they just move from active or pending to sold instead of deleting or downloading
 * again — new logic should be proper so we don't have any data loss."
 *
 * Closing is how a sale leaves the market, so the rule above was deleting exactly the photographs
 * the CMA's sold comparables need, and every one of them had already been paid for in MLS Grid
 * requests. Measured 2026-08-17: ZERO of the 49,311 sales closed in the last twelve months held a
 * single object in the bucket, in any cohort including the last thirty days — this job had removed
 * all of them. A closed listing now keeps its FULL mirrored set, untouched: no delete, no marker
 * clear, no re-download ever. The recent-sold cohort therefore grows rich (up to the active mirror
 * cap) by itself, at zero cost, while only the historical tail needs backfilling.
 *
 * The exemption deliberately does NOT extend to the other ways a home goes off market
 * (withdrawn / expired / cancelled). Those keep the existing rule — everything goes — because
 * nothing downstream reads them and the owner asked for that reclaim himself. */

export interface CleanupDeps {
  /** Rows that are off market but still hold photos. Already excludes closed sales — see
   * `idx_photo_cleanup_queue`. */
  findStale(limit: number): Promise<Array<{ id: string; servable: number }>>;
  /** Which of these ids the book records as a CLOSED SALE. The queue view already filters them
   * out; this is the second, unit-testable guard in front of the only destructive path in the
   * sync, because the cost of being wrong is permanent loss of photos we cannot re-download
   * without spending MLS Grid quota we do not have. */
  soldIds(ids: string[]): Promise<Set<string>>;
  /** Every object key under this listing's prefix. */
  listObjects(id: string): Promise<string[]>;
  /** Remove those objects. Returns how many actually went. */
  deleteObjects(keys: string[]): Promise<number>;
  /** Drop the mirror marker so a returning listing re-downloads from index 0. */
  clearMarker(id: string): Promise<boolean>;
}

export interface CleanupResult {
  listings: number;
  objects: number;
  markersCleared: number;
  failed: number;
  /** Closed sales seen and deliberately left whole. */
  soldExempt: number;
}

/** How many listings one run may clear. Small on purpose — this is the only destructive path in
 * the sync, and at ~2,500 stale listings a bounded pass still finishes the backlog in days
 * while never being able to empty the bucket by accident. */
export const CLEANUP_LISTING_BUDGET = 60;

export async function cleanupOffMarketPhotos(
  deps: CleanupDeps,
  budget = CLEANUP_LISTING_BUDGET,
): Promise<CleanupResult> {
  const out: CleanupResult = { listings: 0, objects: 0, markersCleared: 0, failed: 0, soldExempt: 0 };
  if (budget <= 0) return out;

  const stale = await deps.findStale(budget);
  if (!stale.length) return out;

  // ONE lookup for the whole batch, and it is deliberately OUTSIDE the per-row try. If we cannot
  // find out which of these are sales, we do not guess: the pass throws, the route logs it, and
  // nothing is deleted this tick. Cleanup is never urgent — it runs hourly and the only cost of
  // skipping is storage — whereas deleting a sale's photographs is not recoverable without
  // re-downloading media MLS Grid's guide forbids us fetching twice.
  const sold = await deps.soldIds(stale.map((r) => r.id));

  for (const row of stale) {
    if (sold.has(row.id)) {
      out.soldExempt++;
      continue;
    }
    try {
      const keys = await deps.listObjects(row.id);
      // No objects but a marker still set: still worth clearing, so a return re-mirrors.
      if (keys.length) out.objects += await deps.deleteObjects(keys);
      // ORDER MATTERS. Clear the marker only AFTER the objects are gone: if the delete fails
      // halfway we are left with photos and a marker that still describes them, which is the
      // safe direction. Clearing first would strand a listing with a mirror that claims nothing
      // and objects nobody counts.
      if (await deps.clearMarker(row.id)) out.markersCleared++;
      out.listings++;
    } catch {
      out.failed++; // one bad listing must never abort the pass
    }
  }
  return out;
}

/** Strip the mirror bookkeeping from a listing's JSONB. Pure so the key set is testable — a
 * missed key here is exactly the "already mirrored, downloads nothing" failure above. */
export function withoutMirrorMarker(listing: Record<string, unknown>): Record<string, unknown> {
  const next = { ...listing };
  delete next.photosMirrored;
  delete next.photosMirroredTs;
  delete next.photosMirroredCount;
  return next;
}
