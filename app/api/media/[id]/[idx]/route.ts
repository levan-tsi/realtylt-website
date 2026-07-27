import { getListingMedia } from "@/lib/idx/media";
import { PLACEHOLDER_SVG } from "@/lib/idx/placeholder";
import { publicPhotoUrl, storageObjectExists } from "@/lib/idx/storage";

/** /api/media/{listingId}/{idx} — same-origin photo proxy (the ONLY compliant way to show MLS
 * photos: the raw MediaURL must not appear on the site, and MLS's media host requires the OAuth
 * token as User-Agent, so a browser cannot load it directly).
 *
 * Suspension fix (docs/mls-fix/AUDIT.md): this route no longer calls the MLS Grid DATA API.
 *
 * STORAGE-FIRST (docs/mls-fix/PHOTO-MIRRORING.md): MLS Grid MediaURLs are SIGNED and expire ~1h
 * after the sync captures them, so they cannot be served per view. The sync mirrors each photo's
 * bytes into Supabase Storage while the URL is fresh; this route redirects the first
 * `photosMirrored` photos to the permanent public bucket object (zero MLS contact, never expires).
 * Photos not yet mirrored fall back to the legacy proxy: fetch the (still-fresh, just-synced)
 * source URL server-side with `User-Agent: <token>` behind a long CDN cache, else the branded
 * placeholder that self-heals on the next sync.
 *
 * Failure contract — CHANGED 2026-07-26, this was the #1 owner-reported bug:
 *  • TRANSIENT failure (media host 429/timeout, dead signed URL) → `503` with a tiny `text/plain`
 *    body and `no-store`. It must NOT be a decodable image. Measured in Chromium: a 503 whose body
 *    is a valid SVG is DECODED AND DISPLAYED — `<img>` fires `load`, not `error` (naturalWidth 200,
 *    naturalHeight 150, the placeholder's intrinsic size). So while this route answered failures
 *    with the branded SVG, every throttled tile silently painted "Photo coming soon" as though it
 *    were a photo of the house, MlsImage's self-healing retry ladder never ran, and the client had
 *    no way to tell a real photo from a placeholder. Now the browser errors, the tile retries, and
 *    if it never recovers the gallery DROPS it (components/idx/ListingPhotos.tsx).
 *  • STABLE "this listing has no photo at this index" → the branded SVG at `200`, CDN-cached. That
 *    is the one legitimate placeholder: nothing real can ever appear in that slot.
 */

// The branded "photo coming soon" artwork is shared with components/idx/ListingCard.tsx NoPhoto
// via lib/idx/placeholder.ts so both surfaces render the identical scene (see that file).

// Aggressive CDN cache so repeat views never re-hit the media host: fresh at the edge for a day,
// then served stale for a week while it revalidates in the background → the media host is hit
// ~once per photo per day per edge, and ZERO DATA-API calls ever. Not `immutable`: the proxy path
// is stable but a listing's photo can be REPLACED (MLS issues a new MediaURL, captured by the next
// export), so an immutable year-long pin would freeze a stale cover — SWR self-heals instead.
const IMAGE_CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
// "No photo at this index" is a stable fact too — CDN-cache it like an image (no repeat work).
const EMPTY_CACHE = "public, max-age=300, s-maxage=3000";

// How many leading indices to storage-probe when the mirror marker is absent (the wiped-marker
// self-heal above). Matches MAX_PHOTOS (50) so a fully-wiped gallery heals end to end; each probe
// is a cheap cached HEAD against public Storage.
const STORAGE_PROBE_MAX = 50;

// Cover-substitute probe depth (round-7 cover-photo bug): when a card's cover (idx 0) object is
// missing but LATER photos mirrored, look this many indices ahead for a real photo to stand in as
// the cover. Measured 2026-07-25: every affected listing's first present index was 1 or 2, so 3
// covers them all with headroom. A tiny bounded, cached set of HEADs.
const COVER_SUBSTITUTE_MAX = 3;

function placeholder(cacheControl: string, status: "empty" | "unavailable"): Response {
  // "unavailable" is a TRANSIENT failure. The body must be UNDECODABLE so <img onError> actually
  // fires: Chromium happily renders an SVG body served with 503, which is exactly how a throttled
  // tile used to masquerade as a "Photo coming soon" photo (see the header note). text/plain makes
  // the failure legible to the client, which retries and then drops the tile.
  if (status === "unavailable") {
    return new Response("photo unavailable", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": cacheControl,
        "X-Media-Status": status,
      },
    });
  }
  // "empty" is a stable fact — there is no photo at this index and never will be for this sync.
  // The branded artwork is the honest answer and can be cached like an image.
  return new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": cacheControl,
      "X-Media-Status": status,
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; idx: string }> },
) {
  const { id, idx } = await params;
  const n = Number(idx);
  // Bound matches MAX_PHOTOS (50) with headroom — galleries store up to 50 URLs now.
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id) || !Number.isInteger(n) || n < 0 || n > 60) {
    return new Response("Not found", { status: 404 });
  }

  // Photos + mirror state from the DB (snapshot fallback) — ZERO MLS Grid DATA-API calls.
  const { photos, mirrored, dbOk } = await getListingMedia(id);

  // STORAGE-FIRST: the first `mirrored` photos live PERMANENTLY in Supabase Storage. MLS Grid
  // MediaURLs are signed and expire ~1h after the sync captures them, so this is the only stable
  // source. Redirect to the public bucket object — works in prod AND local dev, never touches
  // MLS, and keeps serving long after the source URL has died. (The bucket is OUR copy, so no
  // MLS "don't put MediaURLs on your site" concern applies.)
  if (n < mirrored) {
    const storageUrl = publicPhotoUrl(id, n);
    if (storageUrl) {
      return new Response(null, {
        status: 302,
        headers: { Location: storageUrl, "Cache-Control": IMAGE_CACHE, "X-Media-Status": "storage" },
      });
    }
  }

  // ROUTE-SIDE RESILIENCE (docs/mls-fix/PHOTO-MIRRORING.md): the mirror marker can be WIPED even though
  // the storage objects still exist — the hourly sync upserts with a full-JSONB replace (idx_sync_apply
  // `set listing = excluded.listing`), so a run without a storage-write key (prod until
  // SUPABASE_SERVICE_ROLE_KEY is added) drops photosMirrored on every re-synced listing. The signed
  // source URL is long dead by then, so the tile would blank ("first photos disappear on refresh").
  // When the marker under-counts what's actually in Storage, probe the permanent public object
  // directly (cheap, cached HEAD; never MLS) and serve it if present. Self-heals without a re-mirror.
  // Fires for any index BEYOND the mirrored prefix (n >= mirrored, already handled above when
  // n < mirrored) in three cases:
  //  • mirrored === 0 — the classic wiped-marker case;
  //  • !dbOk — the DB read failed, so `mirrored` is only the snapshot's mirror-less guess;
  //  • n < photos.length — the listing CLAIMS a photo here but the marker stops short. This is the
  //    round-7 regression: the re-baseline's full-JSONB upsert reset photosMirrored to the cover
  //    count (often 1) even though the FULL gallery objects survive in Storage from earlier mirroring.
  //    Without this, gallery photos 1..N 503'd into placeholders even though 1.jpg..N.jpg exist.
  // Bounded to STORAGE_PROBE_MAX; a genuinely-unmirrored index just gets a cached 404 HEAD and falls through.
  if (n >= mirrored && n < STORAGE_PROBE_MAX && (mirrored === 0 || !dbOk || n < photos.length) && (await storageObjectExists(id, n))) {
    const storageUrl = publicPhotoUrl(id, n);
    if (storageUrl) {
      return new Response(null, {
        status: 302,
        headers: { Location: storageUrl, "Cache-Control": IMAGE_CACHE, "X-Media-Status": "storage-probe" },
      });
    }
  }

  // COVER SUBSTITUTE (round-7 cover-photo bug): `photosMirrored` is a CONTIGUOUS prefix from
  // index 0, so a listing whose cover (idx 0) download failed while later photos uploaded ends up
  // with photosMirrored=0 and NO 0.jpg object — the DETAIL gallery still renders idx 1..n via the
  // storage-probe above, but the CARD (which always asks idx 0) would 503 → gray placeholder. When
  // idx 0 is the missing cover and the listing DOES have photos, probe the next few indices and
  // 302 to the first real one: a genuine photo beats a placeholder, and the swap self-corrects once
  // a covers-repair re-mirrors 0.jpg (photosMirrored bumps → the n<mirrored branch serves 0.jpg).
  // Bounded + cached exactly like the probe above; skipped for genuinely photo-less rows.
  if (n === 0 && (photos.length > 0 || !dbOk)) {
    for (let sub = 1; sub <= COVER_SUBSTITUTE_MAX; sub++) {
      if (await storageObjectExists(id, sub)) {
        const storageUrl = publicPhotoUrl(id, sub);
        if (storageUrl) {
          return new Response(null, {
            status: 302,
            headers: { Location: storageUrl, "Cache-Control": IMAGE_CACHE, "X-Media-Status": "storage-cover-sub" },
          });
        }
      }
    }
  }

  // Local dev has no MLS_API_KEY (the media host rejects tokenless fetches) — serve unmirrored
  // photos through the DEPLOYED proxy's CDN cache instead of a wall of placeholders.
  if (!process.env.MLS_API_KEY && !process.env.VERCEL) {
    return Response.redirect(`https://realtylt-website.vercel.app/api/media/${id}/${n}`, 302);
  }

  const url = photos[n];
  // No photo at this index — a stable, cacheable fact ONLY when the DB actually answered.
  // On a failed DB read the photo list is just the snapshot's guess: caching "empty" at the
  // CDN would pin a gray tile for real photos for EMPTY_CACHE's lifetime. 503 no-store instead
  // so the next view retries against a healthy DB.
  if (!url?.startsWith("https://")) {
    return dbOk ? placeholder(EMPTY_CACHE, "empty") : placeholder("no-store", "unavailable");
  }

  const primary = await proxyUpstream(url, id, n);
  if (primary) return primary;

  // UPSTREAM COVER SUBSTITUTE: the storage probe above only rescues a dead cover when a LATER
  // photo was mirrored. When nothing is mirrored yet (a brand-new listing) but the signed URLs are
  // still fresh, a card asking for idx 0 would fall back to the placeholder even though photos 1..3
  // download fine. Try them — a genuine photo always beats "coming soon", and the winner is
  // CDN-cached for a day so the extra reach happens once, not per view. Media host only; bounded;
  // never the DATA API.
  if (n === 0) {
    for (let sub = 1; sub <= COVER_SUBSTITUTE_MAX && sub < photos.length; sub++) {
      const alt = photos[sub];
      if (!alt?.startsWith("https://")) continue;
      const res = await proxyUpstream(alt, id, sub, "ok-cover-sub");
      if (res) return res;
    }
  }
  return placeholder("no-store", "unavailable");
}

/** Stream one MediaURL through the proxy. Returns null on any failure so the caller can decide
 * whether to substitute — the media host is rate-limited, so every call here is deliberate. */
async function proxyUpstream(
  url: string,
  id: string,
  n: number,
  status = "ok",
): Promise<Response | null> {
  try {
    const upstream = await fetch(url, {
      headers: {
        // MLS Grid REQUIRES the OAuth token as User-Agent to download media (enforced since
        // 2026-06-01). Harmless if a given feed's URL is otherwise self-authorizing.
        "User-Agent": process.env.MLS_API_KEY ?? "",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok || !upstream.body) {
      // Dead/rotated URL or media-host throttle. The URL is refreshed by the next scheduled
      // export — never re-resolved here per view.
      console.error(`[media] upstream photo ${id}/${n} failed: ${upstream.status}`);
      return null;
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": IMAGE_CACHE,
        "X-Media-Status": status,
      },
    });
  } catch (e) {
    console.error(`[media] upstream photo ${id}/${n} errored:`, e);
    return null;
  }
}
