import type { MirrorDeps } from "./photo-mirror";
import { uploadPhoto, type StorageWriteConfig } from "./storage";

/** Real download (media host, token as User-Agent) + upload (Supabase Storage, service role).
 * Shared by the hourly sync and the daily reconciliation (round 69), which restores rows the
 * sync missed through the same mirror. */
export function mirrorDeps(cfg: StorageWriteConfig): MirrorDeps {
  return {
    async download(url) {
      try {
        // media.mlsgrid.com has a separate budget from the DATA API and does NOT go through the
        // mls-fetch guard. MLS Grid requires the OAuth token as User-Agent to download media.
        const r = await fetch(url, {
          headers: { "User-Agent": process.env.MLS_API_KEY ?? "" },
          signal: AbortSignal.timeout(20_000),
        });
        if (!r.ok) return { ok: false, status: r.status };
        const bytes = new Uint8Array(await r.arrayBuffer());
        return { ok: true, status: 200, bytes, contentType: r.headers.get("content-type") ?? "image/jpeg" };
      } catch {
        return { ok: false, status: 0 };
      }
    },
    upload: (path, bytes, ct) => uploadPhoto(cfg, path, bytes, ct),
  };
}
