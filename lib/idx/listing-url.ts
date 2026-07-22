// Canonical listing URL shape, mirroring live realtylt.com's Brivity URLs:
//   /homes-for-sale/<STATE>/<city-slug>/<zip>/<address-slug>/bid-38-<id>
// The address/city/zip come from our structured fields (address is already normalized with
// dir prefixes + unit, e.g. "937 E 225th Street", "215 Central Avenue #10E").

type ListingUrlFields = {
  id: string;
  address: string;
  city: string;
  zip: string;
  state?: string;
};

/** URL-safe slug: lowercase, non-alphanumerics -> single hyphens, trimmed. */
export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The address portion of the canonical slug (e.g. "937-e-225th-street", "215-central-avenue-10e"). */
export function listingSlug(l: Pick<ListingUrlFields, "address">): string {
  return slugify(l.address) || "home";
}

/**
 * Canonical listing path. We embed our FULL listing KEY after `bid-38-` (not the bare numeric
 * MLS id). Documented choice per the round-4 spec ("else use our KEY"): our data layer resolves
 * listings only by their exact KEY (idx_listings.id), and the KEY prefix varies across sources
 * ("KEY…" live, "H6…" fixtures) with no numeric-only lookup — so carrying the whole KEY is what
 * guarantees a stable, forever-resolving URL. Live's Brivity URLs use a Brivity-internal numeric
 * id we simply don't have. Middle segments (state/city/zip/address) are cosmetic SEO keywords;
 * resolution depends only on the trailing `bid-38-<id>`, so field fallbacks are safe.
 */
export function listingPath(l: ListingUrlFields): string {
  const state = ((l.state || "NY").trim().toUpperCase() || "NY").replace(/[^A-Z]/g, "") || "NY";
  const city = slugify(l.city) || "ny";
  const zip = ((l.zip || "").trim().replace(/[^0-9]/g, "").slice(0, 5)) || "00000";
  const address = listingSlug(l);
  return `/homes-for-sale/${state}/${city}/${zip}/${address}/bid-38-${l.id}`;
}

/**
 * Recover the listing id from the catch-all `[...slug]` segments of a /homes-for-sale URL.
 * The last segment is always `bid-38-<id>`; everything after `bid-38-` is our KEY. Returns
 * null for a malformed path (no bid segment) so the route can notFound().
 */
export function listingIdFromSlug(segments: string[] | undefined): string | null {
  if (!segments || segments.length === 0) return null;
  const last = segments[segments.length - 1];
  const m = /^bid-38-(.+)$/.exec(last);
  return m ? m[1] : null;
}
