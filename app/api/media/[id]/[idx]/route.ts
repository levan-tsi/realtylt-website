import { getIdxClient } from "@/lib/idx";
import { MlsGridClient } from "@/lib/idx/mls-grid";

/** Same-origin CDN-cached proxy for MLS listing photos.
 *
 * media.mlsgrid.com URLs are SIGNED with a ~1h expiry and the account has a HARD media
 * request budget (their AWS API Gateway usage plan returns 429 "Request limit reached"
 * per-ACCOUNT, not per-IP — verified from three unrelated networks). So the design goal
 * is to spend that budget about once per photo per day:
 * - Listing.photos carry stable /api/media/{listingId}/{idx} paths (no token churn in
 *   HTML or caches);
 * - this route resolves the CURRENT signed URL from our own feed cache (never
 *   user-supplied — no SSRF surface) and streams the image;
 * - `s-maxage=86400, stale-while-revalidate` makes the Vercel CDN absorb all repeat
 *   traffic, so the MLS CDN sees roughly one fetch per photo per region per day.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; idx: string }> },
) {
  const { id, idx } = await params;
  const n = Number(idx);
  const client = getIdxClient();
  if (
    !(client instanceof MlsGridClient) || // fixture mode serves local /images/… directly
    !/^[A-Za-z0-9_-]{1,40}$/.test(id) ||
    !Number.isInteger(n) || n < 0 || n > 40
  ) {
    return new Response("Not found", { status: 404 });
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
