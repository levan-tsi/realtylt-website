/** Photo URL resolver for the /api/media proxy — reads the COMMITTED SNAPSHOT ONLY.
 *
 * Suspension fix (docs/mls-fix/AUDIT.md): this module used to issue a live MLS Grid DATA-API
 * lookup (`ListingId eq '<id>' … $expand=Media`) per listing on the request path, so every
 * card/gallery image on every page view (and every crawler hit) cost a 2-req/s-capped DATA call
 * → account suspension. It no longer touches MLS at all.
 *
 * MediaURLs are PERMANENT (MLS Grid docs: "the media never updates and retains the original Media
 * URL"), so they are captured once at refresh time (scripts/export-snapshot.mjs) into
 * data/mls-snapshot.json and read from there. The proxy streams the image server-side behind an
 * immutable CDN cache, so MLS's media host is hit at most once per photo. A dead/rotated URL is
 * refreshed by the next scheduled export — never re-resolved per view.
 */

import { getCommittedSnapshot } from "./snapshot";

/** listing id → ordered permanent MediaURLs, built once from the committed snapshot. */
let index: Map<string, string[]> | null = null;
/** Test-only overrides (the committed snapshot has real KEY… ids, not test fixtures). */
const testSeed = new Map<string, string[]>();

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

/** Proxy paths for the detail-page gallery: /api/media/{id}/{0..n-1}. Falls back to the single
 * primary path when the snapshot has no photos for this listing — the proxy then serves the
 * branded placeholder and a later export heals it. ZERO MLS Grid contact. */
export async function getProxiedPhotoPaths(id: string): Promise<string[]> {
  const urls = getSnapshotMediaUrls(id);
  return urls.length ? urls.map((_, i) => `/api/media/${id}/${i}`) : [`/api/media/${id}/0`];
}

/** Test hook — clear the snapshot index + any seeded overrides. */
export function resetMediaCacheForTests(): void {
  index = null;
  testSeed.clear();
}

/** Test hook — seed permanent MediaURLs for a listing id (stands in for the committed snapshot). */
export function __seedSnapshotMediaForTests(id: string, urls: string[]): void {
  testSeed.set(id, urls);
}
