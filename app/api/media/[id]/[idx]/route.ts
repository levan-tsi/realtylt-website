import { getListingMedia } from "@/lib/idx/media";

/** /api/media/{listingId}/{idx} — the ON-DEMAND photo proxy (real-IDX model).
 *
 * On request: resolve the listing's Media from MLS Grid (ONE data call per listing,
 * short-TTL cached in lib/idx/media), pick photo `idx` (Order-sorted), stream it back
 * same-origin. The Vercel CDN caches the image for 50 min (< the ~1h signed-URL
 * validity), so MLS is hit at most ~once per photo per window regardless of viewers.
 * Photos are NEVER stored (no Blob, no bulk download) — owner requirement.
 *
 * Failure contract: any MLS/media error, throttle, or budget 429 returns the branded
 * "Photo coming soon" SVG with `no-store` (the next view retries) — NEVER a broken
 * tile or 502. A listing that genuinely lacks a photo at this index gets the same SVG
 * but CDN-cached like an image (a stable fact, no repeat lookups).
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

// 50 min at the CDN (< ~1h signing), SWR keeps tiles instant while revalidating.
const IMAGE_CACHE = "public, max-age=300, s-maxage=3000, stale-while-revalidate=86400";

function placeholder(cacheControl: string, status: "empty" | "unavailable"): Response {
  return new Response(PLACEHOLDER_SVG, {
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
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id) || !Number.isInteger(n) || n < 0 || n > 40) {
    return new Response("Not found", { status: 404 });
  }

  const urls = await getListingMedia(id);
  // MLS couldn't answer (no creds / throttled / error) — retryable, so never CDN-cache it.
  if (urls === null) return placeholder("no-store", "unavailable");
  const url = urls[n];
  // No photo at this index — a stable fact; cache the branded state like an image.
  if (!url?.startsWith("https://")) return placeholder("public, max-age=300, s-maxage=3000", "empty");

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!upstream.ok || !upstream.body) {
      // Budget 429 / expired token — placeholder, no-store: the next view retries.
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
