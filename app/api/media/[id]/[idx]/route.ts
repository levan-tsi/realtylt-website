import { getIdxClient } from "@/lib/idx";
import { MlsGridClient } from "@/lib/idx/mls-grid";
import { ReplicatedIdxClient } from "@/lib/idx/replicated";

/** Stable /api/media/{listingId}/{idx} photo URLs.
 *
 * In replicated mode (production) new pages carry durable Blob URLs directly, but
 * previously-cached HTML/ISR pages still reference these paths — so this route stays as
 * a thin resolver that NEVER touches MLS servers: it 302-redirects to the listing's Blob
 * photo when cached, else serves a small branded "photo coming soon" SVG (no broken
 * tiles, no 502s, no media-budget spend).
 *
 * In direct-live mode (local dev with MLS keys but no Blob store) it keeps the Round-1
 * behavior: resolve the CURRENT ~1h-signed media.mlsgrid.com URL from the feed cache
 * (never user-supplied — no SSRF) and stream it, CDN-cached.
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; idx: string }> },
) {
  const { id, idx } = await params;
  const n = Number(idx);
  const client = getIdxClient();
  if (
    !/^[A-Za-z0-9_-]{1,40}$/.test(id) ||
    !Number.isInteger(n) || n < 0 || n > 40
  ) {
    return new Response("Not found", { status: 404 });
  }

  if (client instanceof ReplicatedIdxClient) {
    const listing = await client.getListing(id);
    const url = listing?.photos[n];
    if (url?.startsWith("https://")) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: url,
          // Blob pathnames are immutable — safe for the CDN to remember the redirect.
          "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }
    // Known listing but photo not replicated yet (or unknown id from stale HTML):
    // branded placeholder, short-cached so it heals as the cron fills coverage.
    return new Response(PLACEHOLDER_SVG, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    });
  }

  if (!(client instanceof MlsGridClient)) {
    return new Response("Not found", { status: 404 }); // fixture mode serves /images/… directly
  }

  const url = await client.getMediaUrl(id, n);
  if (!url) return new Response("Not found", { status: 404 });

  const upstream = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!upstream.ok || !upstream.body) {
    // Never let the CDN cache an error (throttled window / expired token) — the next
    // request re-resolves a fresh signed URL and tries again.
    return new Response(`Upstream media unavailable (${upstream.status})`, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
