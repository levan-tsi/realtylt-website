import { getMediaUrls } from "@/lib/idx/media";

/** /api/media/{listingId}/{idx} — same-origin photo proxy (the ONLY compliant way to show MLS
 * photos: the raw MediaURL must not appear on the site, and MLS's media host requires the OAuth
 * token as User-Agent, so a browser cannot load it directly).
 *
 * Suspension fix (docs/mls-fix/AUDIT.md): this route no longer calls the MLS Grid DATA API. It
 * reads the listing's PERMANENT MediaURLs from the committed snapshot (zero DATA-API calls),
 * fetches the chosen photo server-side with `User-Agent: <token>`, and streams it back with an
 * IMMUTABLE long cache, so MLS's media host is hit at most once per photo per edge regardless of
 * viewers or crawlers. A dead/rotated URL is refreshed by the next scheduled export
 * (scripts/export-snapshot.mjs) — NEVER re-resolved per view.
 *
 * Failure contract: any media error/throttle returns the branded "Photo coming soon" SVG with
 * `no-store` (the next view retries) — never a broken tile or 502. A listing with no photo at
 * this index gets the same SVG but CDN-cached (a stable fact, no repeat work).
 */

// Matches components/idx/ListingCard.tsx NoPhoto — logo-navy line house + lit azure
// "porch light", RealtyLT wordmark, on the site's mist gray. One consistent branded state.
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#f3f5f8"/>
<g fill="none" stroke="#102c54" stroke-opacity="0.32" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
<path d="M310 268 L400 196 L490 268"/><path d="M337 259 V358 H463 V259"/><path d="M382 358 V304 H418 V358"/></g>
<circle cx="400" cy="281" r="11" fill="#28a8e0"/>
<text x="400" y="416" text-anchor="middle" font-family="Lato, Helvetica, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="6" fill="#102c54" fill-opacity="0.7">REALTYLT</text>
<text x="400" y="452" text-anchor="middle" font-family="Lato, Helvetica, Arial, sans-serif" font-size="22" fill="#767676">Photo coming soon</text>
</svg>`;

// Aggressive CDN cache so repeat views never re-hit the media host: fresh at the edge for a day,
// then served stale for a week while it revalidates in the background → the media host is hit
// ~once per photo per day per edge, and ZERO DATA-API calls ever. Not `immutable`: the proxy path
// is stable but a listing's photo can be REPLACED (MLS issues a new MediaURL, captured by the next
// export), so an immutable year-long pin would freeze a stale cover — SWR self-heals instead.
const IMAGE_CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
// "No photo at this index" is a stable fact too — CDN-cache it like an image (no repeat work).
const EMPTY_CACHE = "public, max-age=300, s-maxage=3000";

function placeholder(cacheControl: string, status: "empty" | "unavailable"): Response {
  return new Response(PLACEHOLDER_SVG, {
    // "unavailable" is a TRANSIENT failure → 503 so <img onError> fires and the client
    // can retry (MlsImage self-heals without a manual reload). "empty" is a stable fact
    // → 200, render the placeholder and never retry.
    status: status === "unavailable" ? 503 : 200,
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

  // Local dev has no MLS_API_KEY (the media host rejects tokenless fetches) — serve the
  // photo through the DEPLOYED proxy's CDN cache instead of a wall of placeholders.
  if (!process.env.MLS_API_KEY && !process.env.VERCEL) {
    return Response.redirect(`https://realtylt-website.vercel.app/api/media/${id}/${n}`, 302);
  }

  // Permanent MediaURLs from the DB (snapshot fallback) — ZERO MLS Grid DATA-API calls.
  const url = (await getMediaUrls(id))[n];
  // No photo at this index (snapshot has none yet, or a photo-less listing) — stable, cacheable.
  if (!url?.startsWith("https://")) return placeholder(EMPTY_CACHE, "empty");

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
      // Dead/rotated URL or media-host throttle — placeholder, no-store: the next view retries,
      // and the URL is refreshed by the next scheduled export (never re-resolved here per view).
      console.error(`[media] upstream photo ${id}/${n} failed: ${upstream.status}`);
      return placeholder("no-store", "unavailable");
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": IMAGE_CACHE,
        "X-Media-Status": "ok",
      },
    });
  } catch (e) {
    console.error(`[media] upstream photo ${id}/${n} errored:`, e);
    return placeholder("no-store", "unavailable");
  }
}
