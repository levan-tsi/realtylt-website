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
/** Cluster-wide sync-attempt claim marker (its Blob uploadedAt = last attempt time). */
export const SYNC_STATE_PATHNAME = "mls/sync-state.json";
/** Rolling full-inventory pass cursor + accumulation (see PassState). */
export const PASS_STATE_PATHNAME = "mls/pass-state.json";

/** Watermark for a brand-new pass — scans the whole Active window from the beginning. */
export const EPOCH_TS = "1970-01-01T00:00:00Z";

export interface MlsSnapshot {
  /** ISO timestamp of the replication run — drives "Data last updated". */
  syncedAt: string;
  /** Working-set listings; photos are permanent public Blob URLs (cached ones only). */
  listings: Listing[];
}

/** Rolling-pass cursor — how the cron captures the FULL six-county Active inventory
 * across multiple runs without ever exceeding MLS Grid's rate limits.
 *
 * MLS Grid orders Property responses by ModificationTimestamp (ascending) by default and
 * documents resuming an interrupted import with `ModificationTimestamp gt <last received>`
 * — so a pass walks the whole Active window oldest-modified → newest across as many cron
 * runs as it takes, persisting the watermark between runs. When a pass completes (a page
 * comes back without @odata.nextLink) its kept-set IS the complete six-county Active
 * inventory at that moment: it replaces the snapshot wholesale (which also drops listings
 * that went Pending/Closed since the previous pass), and the next run starts a new pass.
 * Listings found mid-pass are merged into the live snapshot immediately — coverage only
 * ever deepens between pass completions. */
export interface PassState {
  /** When this pass started scanning from EPOCH_TS. */
  startedAt: string;
  /** Greatest ModificationTimestamp received so far — the next run resumes with `gt` this. */
  watermark: string;
  /** Feed rows scanned so far this pass (all counties — the "real feed total" measure). */
  scanned: number;
  /** Six-county kept-set accumulated so far this pass (photos stripped — signed URLs
   * expire in ~1h, so durable photo URLs are always re-derived from the Blob cache). */
  listings: Listing[];
  /** Stats of the last COMPLETED pass — the honest "feed total vs captured" numbers. */
  lastPass?: { completedAt: string; feedActiveScanned: number; kept: number };
}

export function newPassState(): PassState {
  return { startedAt: new Date().toISOString(), watermark: EPOCH_TS, scanned: 0, listings: [] };
}

/** Validate a fetched pass state just enough to never resume from garbage. */
export function parsePassState(raw: unknown): PassState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const s = raw as PassState;
  if (typeof s.startedAt !== "string" || typeof s.watermark !== "string") return null;
  if (Number.isNaN(Date.parse(s.watermark))) return null;
  if (typeof s.scanned !== "number" || !Array.isArray(s.listings)) return null;
  return s;
}

/** Merge `updates` over `base` by listing id — updates win, new ids append. */
export function mergeListings(base: readonly Listing[], updates: readonly Listing[]): Listing[] {
  const byId = new Map(base.map((l) => [l.id, l]));
  for (const u of updates) byId.set(u.id, u);
  return [...byId.values()];
}

export function photoPathname(id: string, idx: number): string {
  return `${PHOTO_PREFIX}${id}/${idx}.jpg`;
}

/** Group the Blob photo cache (pathname → url) by listing id, ordered by photo index —
 * the ground truth of which durable photos each listing has. Unlike mapping through a
 * listing's own (possibly stale or stripped) photo array, this stays correct for
 * listings accumulated in earlier runs whose signed source URLs are long expired. */
export function photosByListing(
  cachedUrls: ReadonlyMap<string, string>,
): Map<string, string[]> {
  const entries = new Map<string, { idx: number; url: string }[]>();
  for (const [pathname, url] of cachedUrls) {
    const m = /^mls\/photos\/(.+)\/(\d+)\.jpg$/.exec(pathname);
    if (!m) continue;
    const list = entries.get(m[1]) ?? [];
    list.push({ idx: Number(m[2]), url });
    entries.set(m[1], list);
  }
  const out = new Map<string, string[]>();
  for (const [id, list] of entries)
    out.set(id, list.sort((a, b) => a.idx - b.idx).map((e) => e.url));
  return out;
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

/** Snapshot composition: each listing's photos become the durable Blob URLs cached so
 * far (ground truth from `photosByListing`). A listing with no cached photos gets
 * photos: [] and the UI renders its branded NoPhoto block. */
export function applyCachedPhotos(
  listings: readonly Listing[],
  cachedUrls: ReadonlyMap<string, string>,
): Listing[] {
  const byListing = photosByListing(cachedUrls);
  return listings.map((l) => ({ ...l, photos: byListing.get(l.id) ?? [] }));
}
