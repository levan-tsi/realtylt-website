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

import { getDbListingMedia, isDbConfigured } from "./db";
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

/** id → {at, urls, mirrored, servable} — bounds repeat DB lookups from gallery bursts. The
 * /api/media route sits behind a long CDN cache, so this stays tiny; still capped as a safety valve. */
const dbCache = new Map<string, { at: number; urls: string[]; mirrored: number; servable: number | null }>();
const DB_CACHE_TTL_MS = 10 * 60 * 1000;
const DB_CACHE_MAX = 2000;

export interface ListingMedia {
  /** Ordered source MediaURLs (signed, may be expired). */
  photos: string[];
  /** How many leading photos are permanently mirrored to Supabase Storage. */
  mirrored: number;
  /** idx_listings.photos_servable — the contiguous mirrored prefix actually present in Storage,
   * recomputed hourly from storage.objects (idx_refresh_photos_servable). Unlike `mirrored` this
   * survives the sync's full-JSONB upsert, so it is the number every surface prints. null = not
   * computed for this row yet (inserted since the last refresh). */
  servable: number | null;
  /** False when the DB never answered (transient failure) — mirrored/photos are then only the
   * snapshot's guess, NOT authoritative. The route must not cache verdicts built on this. */
  dbOk: boolean;
}

/** A listing's photos + mirrored count — Supabase idx_listings first (always current, active
 * rows only), committed snapshot as the fallback store. ZERO MLS Grid contact either way. The
 * snapshot fallback carries no mirror info (mirrored:0) — the route then proxies as before. */
export async function getListingMedia(id: string): Promise<ListingMedia> {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return { photos: [], mirrored: 0, servable: null, dbOk: true };
  if (testSeed.has(id)) {
    return { photos: testSeed.get(id)!, mirrored: testMirroredSeed.get(id) ?? 0, servable: null, dbOk: true };
  }
  const hit = dbCache.get(id);
  if (hit && Date.now() - hit.at < DB_CACHE_TTL_MS) {
    return { photos: hit.urls, mirrored: hit.mirrored, servable: hit.servable, dbOk: true };
  }
  // A 36-tile page bursts this route; a fraction of PostgREST reads drop under contention.
  // One retry recovers most of those instead of demoting the tile to the mirror-less snapshot.
  let fromDb = await getDbListingMedia(id); // null = DB unavailable
  if (fromDb === null && isDbConfigured()) fromDb = await getDbListingMedia(id);
  if (fromDb && (fromDb.photos.length || fromDb.mirrored)) {
    dbCache.set(id, { at: Date.now(), urls: fromDb.photos, mirrored: fromDb.mirrored, servable: fromDb.servable });
    if (dbCache.size > DB_CACHE_MAX) dbCache.delete(dbCache.keys().next().value as string);
    return { ...fromDb, dbOk: true };
  }
  // No DB configured at all = fixture/snapshot mode: the snapshot IS the authority (dbOk true).
  // DB configured but unreachable = transient: dbOk false, verdicts must not be cached.
  return {
    photos: ensureIndex().get(id) ?? [],
    mirrored: 0,
    servable: null,
    dbOk: fromDb !== null || !isDbConfigured(),
  };
}

/** Ordered permanent MediaURLs only (compat shim for getProxiedPhotoPaths). */
export async function getMediaUrls(id: string): Promise<string[]> {
  return (await getListingMedia(id)).photos;
}

export interface GalleryPhotos {
  /** /api/media proxy paths in feed order. EMPTY when the listing genuinely has no photos — the
   * page then renders the branded placeholder as MARKUP instead of claiming an image URL that can
   * only ever serve that placeholder (and instead of listing it among the page's JSON-LD images). */
  paths: string[];
  /** How many leading paths are permanently mirrored into Supabase Storage, i.e. servable without
   * touching the rate-limited MLS media host. When this equals `paths.length` the photo count is a
   * FACT the page may print; below it the feed's count is only a claim (a 2026-07-26 census found
   * 72% of active listings claim more photos than the mirror can serve). */
  mirrored: number;
}

/** Photos for the detail-page gallery: /api/media/{id}/{0..n-1}. ZERO MLS Grid contact.
 *
 * TRUNCATED TO WHAT IS SERVABLE (2026-07-30): when photos_servable is known, the gallery is the
 * first `servable` paths and nothing more. Before this, the page rendered every CLAIMED photo and
 * let each doomed tile 503 its way out of the band — which is why a listing could advertise 8
 * pictures on the card and show 1 on its own page. Truncating makes the page's count a fact, makes
 * it agree with the card and the map popup, and stops ~9 hopeless media requests per view on the
 * 46% of listings that over-claim. servable === null (a row inserted since the last refresh) keeps
 * the old claim-everything behaviour, so a brand-new listing never renders an empty gallery. */
export async function getProxiedPhotoPaths(id: string): Promise<GalleryPhotos> {
  const { photos, mirrored, servable, dbOk } = await getListingMedia(id);
  if (photos.length) {
    // servable 0 with photos claimed is a real state (nothing mirrored yet): keep one path so the
    // page still asks, and let the route answer with a cover substitute or the branded still.
    const n = servable === null ? photos.length : Math.max(1, Math.min(servable, photos.length));
    return {
      paths: photos.slice(0, n).map((_, i) => `/api/media/${id}/${i}`),
      mirrored: servable === null ? Math.max(0, Math.min(mirrored, photos.length)) : Math.min(servable, n),
    };
  }
  // No photos in any store. If the DB actually answered, that is a fact. If the read failed it is
  // only the snapshot's guess, so keep the single primary path and let the browser find out.
  return { paths: dbOk ? [] : [`/api/media/${id}/0`], mirrored: 0 };
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
