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
 * WHERE A GONE LISTING SENDS ITS VISITOR (2026-09-26). A home that sold, expired or was withdrawn
 * leaves our table, and its old address (bookmarks, Google, the CRM's emails) used to answer "not
 * found". Now it goes to the search for its own town, read from the address itself: the city
 * segment (`forest_hills`, `new-rochelle`, old or new form), else the ZIP, else the whole search.
 * Only letters, spaces, dots, apostrophes and hyphens pass, so nothing odd reaches the query.
 */
export function goneListingSearch(segments: string[] | undefined): string {
  const seg = segments ?? [];
  const safe = (s: string | undefined) => {
    try {
      return decodeURIComponent(s ?? "");
    } catch {
      return "";
    }
  };
  const city = safe(seg[1]).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (city.length >= 2 && city.length <= 40 && /^[a-z .']+$/i.test(city) && city.toLowerCase() !== "ny") {
    const name = city.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
    return `/search?q=${encodeURIComponent(name)}`;
  }
  const zip = safe(seg[2]);
  if (/^\d{5}$/.test(zip) && zip !== "00000") return `/search?q=${zip}`;
  return "/search";
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
