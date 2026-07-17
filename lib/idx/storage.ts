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
