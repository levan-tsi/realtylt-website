/** Supabase Storage helpers for the mirrored-photo bucket (`mls-photos`).
 *
 * WHY (docs/mls-fix/PHOTO-MIRRORING.md): MLS Grid MediaURLs are SIGNED and expire ~1h after the
 * sync captures them (proven 2026-07-15: expired → 400, signature stripped → 403; there is no
 * permanent URL form). Serving those URLs per view is therefore structurally dead. Instead the
 * sync downloads each photo WHILE ITS URL IS FRESH and uploads the bytes here; the /api/media
 * route serves them from this bucket forever (storage objects never expire).
 *
 * Object path is deterministic — `<ListingId>/<idx>.jpg` — so a re-mirror overwrites in place.
 *
 * READS are public (the bucket is public; the /object/public/ path needs no key), so the request
 * path never holds a Supabase secret. WRITES need elevated auth — SUPABASE_SERVICE_ROLE_KEY,
 * used server-side only by the sync cron and the backfill script. When that key is absent,
 * `storageWriteConfig()` returns null and mirroring is a safe no-op (the route keeps proxying).
 */

export const PHOTO_BUCKET = "mls-photos";

/** Deterministic object path for a listing photo. */
export function photoObjectPath(id: string, idx: number): string {
  return `${id}/${idx}.jpg`;
}

/** Public URL for a mirrored photo, or null when SUPABASE_URL is unset. No key required. */
export function publicPhotoUrl(id: string, idx: number): string | null {
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${PHOTO_BUCKET}/${photoObjectPath(id, idx)}`;
}

export interface StorageWriteConfig {
  base: string; // `${SUPABASE_URL}/storage/v1`
  key: string; // service-role key
}

/** Storage write endpoint + service-role key, or null when the key is not configured. */
export function storageWriteConfig(): StorageWriteConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { base: `${url.replace(/\/+$/, "")}/storage/v1`, key };
}

// Cached existence check for a mirrored storage object (public HEAD — no key, never MLS). Lets the
// media route heal a listing whose mirror marker was WIPED by the JSONB-replace upsert while the
// storage objects still exist. Bounded by the caller (low indices of marker-absent listings only)
// and by this cache (both hit AND miss are cached, so repeat views never re-HEAD).
const objectExistsCache = new Map<string, { at: number; exists: boolean }>();
const OBJECT_EXISTS_TTL_MS = 30 * 60 * 1000;
const OBJECT_EXISTS_MAX = 5000;

/** True when mls-photos/<id>/<idx>.jpg exists in the public bucket. Cached; false when SUPABASE_URL
 * is unset or the object is missing. A cheap HEAD against public Storage — zero MLS Grid contact. */
export async function storageObjectExists(id: string, idx: number): Promise<boolean> {
  const url = publicPhotoUrl(id, idx);
  if (!url) return false;
  const cacheKey = `${id}/${idx}`;
  const hit = objectExistsCache.get(cacheKey);
  if (hit && Date.now() - hit.at < OBJECT_EXISTS_TTL_MS) return hit.exists;
  let exists = false;
  try {
    const r = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(6000) });
    exists = r.ok;
  } catch {
    exists = false;
  }
  objectExistsCache.set(cacheKey, { at: Date.now(), exists });
  if (objectExistsCache.size > OBJECT_EXISTS_MAX) {
    objectExistsCache.delete(objectExistsCache.keys().next().value as string);
  }
  return exists;
}

/** Test hook — clear the storage-existence probe cache. */
export function __resetStorageProbeCacheForTests(): void {
  objectExistsCache.clear();
}

/** Upload (upsert) one photo's bytes to the deterministic path. Returns true on success.
 * Uses the Storage REST API directly (same call @supabase/supabase-js makes) so it stays
 * dependency-light and easy to unit-test with an injected fetch. */
export async function uploadPhoto(
  cfg: StorageWriteConfig,
  path: string,
  bytes: Uint8Array | ArrayBuffer,
  contentType: string,
): Promise<boolean> {
  const res = await fetch(`${cfg.base}/object/${PHOTO_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": contentType,
      "x-upsert": "true",
      "Cache-Control": "public, max-age=31536000",
    },
    body: bytes as BodyInit,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    console.error(`[storage] upload ${path} failed: ${res.status}`);
    return false;
  }
  return true;
}
