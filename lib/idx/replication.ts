/** Replication snapshot — the durable-store contract between the sync cron
 * (app/api/cron/sync-mls) and ReplicatedIdxClient.
 *
 * WHY (Round 2 root cause): calling MLS Grid inside the request path breaks on
 * serverless — every cold instance ran its own 2-request sync, concurrent bursts
 * exceeded the per-ACCOUNT 2 req/sec cap, and MLS Grid blocked the whole account
 * for the hour (429 → fixture fallback on the live site). So the feed is now
 * replicated ONCE by a scheduled job into Vercel Blob, and the site only ever
 * reads the snapshot. Photos are copied into Blob too (media.mlsgrid.com URLs are
 * ~1h-signed AND budget-capped per account) — budget spent once per photo EVER.
 */

import type { Listing } from "./types";

/** Blob pathnames (stable — `addRandomSuffix: false`). */
export const SNAPSHOT_PATHNAME = "mls/listings.json";
export const PHOTO_PREFIX = "mls/photos/";

export interface MlsSnapshot {
  /** ISO timestamp of the replication run — drives "Data last updated". */
  syncedAt: string;
  /** Working-set listings; photos are permanent public Blob URLs (cached ones only). */
  listings: Listing[];
}

export function photoPathname(id: string, idx: number): string {
  return `${PHOTO_PREFIX}${id}/${idx}.jpg`;
}

/** Validate a fetched snapshot just enough to never render garbage. */
export function parseSnapshot(raw: unknown): MlsSnapshot | null {
  if (typeof raw !== "object" || raw === null) return null;
  const s = raw as { syncedAt?: unknown; listings?: unknown };
  if (typeof s.syncedAt !== "string" || Number.isNaN(Date.parse(s.syncedAt))) return null;
  if (!Array.isArray(s.listings)) return null;
  const ok = s.listings.every(
    (l) =>
      typeof l === "object" && l !== null &&
      typeof (l as Listing).id === "string" &&
      typeof (l as Listing).price === "number" &&
      Array.isArray((l as Listing).photos),
  );
  return ok ? (raw as MlsSnapshot) : null;
}

/** Which photos the cron should download this run (budget-aware, incremental).
 *
 * Priority: photo 0 of EVERY listing first (search/carousel cards need exactly one),
 * then photo 1 of every listing, and so on — so partial coverage degrades to
 * "every card has a photo, some galleries are shallow" instead of "some listings
 * fully cached, the rest blank". Already-cached photos are skipped.
 */
export function planPhotoFetches(
  listings: readonly { id: string; photos: readonly string[] }[],
  cached: ReadonlySet<string>,
  budget: number,
): { pathname: string; url: string }[] {
  const plan: { pathname: string; url: string }[] = [];
  for (let idx = 0; plan.length < budget; idx++) {
    let anyAtDepth = false;
    for (const l of listings) {
      if (idx >= l.photos.length) continue;
      anyAtDepth = true;
      const pathname = photoPathname(l.id, idx);
      if (cached.has(pathname)) continue;
      plan.push({ pathname, url: l.photos[idx] });
      if (plan.length >= budget) break;
    }
    if (!anyAtDepth) break; // no listing has photos this deep — done
  }
  return plan;
}

/** Snapshot composition: swap each listing's source (signed) photo URLs for the durable
 * Blob URLs that exist so far, preserving order. Uncached photos are omitted — a listing
 * with no cached photos gets photos: [] and the UI renders its branded NoPhoto block. */
export function applyCachedPhotos(
  listings: readonly Listing[],
  cachedUrls: ReadonlyMap<string, string>,
): Listing[] {
  return listings.map((l) => ({
    ...l,
    photos: l.photos
      .map((_, i) => cachedUrls.get(photoPathname(l.id, i)))
      .filter((u): u is string => !!u),
  }));
}
