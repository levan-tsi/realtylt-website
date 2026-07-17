/** Photo URL resolver for the /api/media proxy — DB first, committed snapshot fallback.
 *
 * Suspension fix (docs/mls-fix/AUDIT.md): this module used to issue a live MLS Grid DATA-API
 * lookup (`ListingId eq '<id>' … $expand=Media`) per listing on the request path, so every
 * card/gallery image on every page view (and every crawler hit) cost a 2-req/s-capped DATA call
 * → account suspension. It STILL never touches MLS: MediaURLs are PERMANENT (MLS Grid docs:
 * "the media never updates and retains the original Media URL"), captured at sync time into
 * Supabase idx_listings (hourly cron) with data/mls-snapshot.json as the fallback store. The
 * proxy streams the image server-side behind a long CDN cache, so both the DB and MLS's media
 * host are hit rarely; a dead/rotated URL is refreshed by the next sync — never per view.
 */

import { getDbListingMedia } from "./db";
import { getCommittedSnapshot } from "./snapshot";

/** listing id → ordered permanent MediaURLs, built once from the committed snapshot. */
let index: Map<string, string[]> | null = null;
/** Test-only overrides (the committed snapshot has real KEY… ids, not test fixtures). */
const testSeed = new Map<string, string[]>();
/** Test-only mirrored-count overrides (defaults to 0 → proxy path). */
const testMirroredSeed = new Map<string, number>();

function ensureIndex(): Map<string, string[]> {
  if (!index) {
    index = new Map();
    for (const l of getCommittedSnapshot()?.listings ?? []) {
      const photos = (l as { id: string; photos?: unknown }).photos;
      if (Array.isArray(photos) && photos.length) index.set(l.id, photos as string[]);
    }
  }
  return index;
}

/** Ordered permanent MediaURLs for a listing from the committed snapshot — [] when the listing
 * has no stored photos (or an unknown/malformed id). ZERO MLS Grid contact. */
export function getSnapshotMediaUrls(id: string): string[] {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return [];
  return testSeed.get(id) ?? ensureIndex().get(id) ?? [];
}

/** id → {at, urls, mirrored} — bounds repeat DB lookups from gallery bursts. The /api/media
 * route sits behind a long CDN cache, so this stays tiny; still capped as a safety valve. */
const dbCache = new Map<string, { at: number; urls: string[]; mirrored: number }>();
const DB_CACHE_TTL_MS = 10 * 60 * 1000;
const DB_CACHE_MAX = 2000;

export interface ListingMedia {
  /** Ordered source MediaURLs (signed, may be expired). */
  photos: string[];
  /** How many leading photos are permanently mirrored to Supabase Storage. */
  mirrored: number;
}

/** A listing's photos + mirrored count — Supabase idx_listings first (always current, active
 * rows only), committed snapshot as the fallback store. ZERO MLS Grid contact either way. The
 * snapshot fallback carries no mirror info (mirrored:0) — the route then proxies as before. */
export async function getListingMedia(id: string): Promise<ListingMedia> {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return { photos: [], mirrored: 0 };
  if (testSeed.has(id)) return { photos: testSeed.get(id)!, mirrored: testMirroredSeed.get(id) ?? 0 };
  const hit = dbCache.get(id);
  if (hit && Date.now() - hit.at < DB_CACHE_TTL_MS) return { photos: hit.urls, mirrored: hit.mirrored };
  const fromDb = await getDbListingMedia(id); // null = DB unavailable → snapshot fallback
  if (fromDb && (fromDb.photos.length || fromDb.mirrored)) {
    dbCache.set(id, { at: Date.now(), urls: fromDb.photos, mirrored: fromDb.mirrored });
    if (dbCache.size > DB_CACHE_MAX) dbCache.delete(dbCache.keys().next().value as string);
    return fromDb;
  }
  return { photos: ensureIndex().get(id) ?? [], mirrored: 0 };
}

/** Ordered permanent MediaURLs only (compat shim for getProxiedPhotoPaths). */
export async function getMediaUrls(id: string): Promise<string[]> {
  return (await getListingMedia(id)).photos;
}

/** Proxy paths for the detail-page gallery: /api/media/{id}/{0..n-1}. Falls back to the single
 * primary path when no store has photos for this listing — the proxy then serves the
 * branded placeholder and a later sync heals it. ZERO MLS Grid contact. */
export async function getProxiedPhotoPaths(id: string): Promise<string[]> {
  const urls = await getMediaUrls(id);
  return urls.length ? urls.map((_, i) => `/api/media/${id}/${i}`) : [`/api/media/${id}/0`];
}

/** Test hook — clear the snapshot index, DB cache, + any seeded overrides. */
export function resetMediaCacheForTests(): void {
  index = null;
  testSeed.clear();
  testMirroredSeed.clear();
  dbCache.clear();
}

/** Test hook — seed permanent MediaURLs for a listing id (stands in for the committed snapshot). */
export function __seedSnapshotMediaForTests(id: string, urls: string[]): void {
  testSeed.set(id, urls);
}

/** Test hook — seed how many of a listing's photos are mirrored to storage. */
export function __seedMirroredForTests(id: string, mirrored: number): void {
  testMirroredSeed.set(id, mirrored);
}
