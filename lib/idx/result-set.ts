/** THE RESULT SET A VISITOR IS BROWSING — the thing "next listing" has to mean.
 *
 * Owner's ask: "when you click listing you have to go back to search or map to find other —
 * what if we add next listing and clickable arrow next to address."
 *
 * THE HARD PART IS NOT THE ARROWS, IT IS "NEXT WITHIN WHAT". A listing page is reachable from a
 * filtered search, a map pin, a rail, a saved search, or a cold link out of Google, and an arrow
 * that walks some order the visitor never chose is worse than no arrow at all — it promises a
 * sequence and delivers a shuffle. So the set is written down at the only moment it is actually
 * known (while the visitor is looking at it, on /search) and the listing page only ever offers
 * arrows when the home it is showing IS IN that written-down set. A cold visitor sees nothing.
 *
 * WHY sessionStorage AND NOT THE URL: the listing route is ISR-cached (revalidate 600) and
 * shared/indexed. Carrying `?from=<query>` would fork the cache per search, put someone else's
 * filters inside a shared link, and add canonical work — for a convenience that is per-tab by
 * nature. sessionStorage is per-tab, dies with it, and costs the server nothing.
 *
 * NO TTL ON PURPOSE: arrows only appear when the current listing is a member of the stored set,
 * so a stale set cannot produce arrows anywhere except on a listing from that very set — where
 * they still mean exactly what they say. An expiry would only take the feature away mid-browse.
 */

export const RESULT_SET_KEY = "rlt:result-set:v1";

export interface ResultSetItem {
  id: string;
  /** Canonical listing path, computed where the full listing is in hand (the search page). */
  path: string;
  /** Street address — the pager names the home it is about to move to. */
  address: string;
}

export interface ResultSet {
  items: ResultSetItem[];
  /** 1-based page the set was taken from, and the total, so the pager can say why it stops. */
  page: number;
  totalPages: number;
  /** Where "back to these results" lives, e.g. `/search?county=orange&page=2`. */
  searchHref: string;
}

export interface Neighbours {
  /** 0-based position of the current listing within the set. */
  index: number;
  count: number;
  prev: ResultSetItem | null;
  next: ResultSetItem | null;
  page: number;
  totalPages: number;
  searchHref: string;
}

const isItem = (v: unknown): v is ResultSetItem =>
  !!v &&
  typeof v === "object" &&
  typeof (v as ResultSetItem).id === "string" &&
  typeof (v as ResultSetItem).path === "string" &&
  typeof (v as ResultSetItem).address === "string" &&
  (v as ResultSetItem).path.startsWith("/");

/** Parse whatever is in storage. Storage is writable by anything running in the tab, and `path`
 * ends up in an href — so every field is shape-checked and a path that is not site-relative is
 * dropped rather than trusted. Returns null on anything malformed. */
export function parseResultSet(raw: string | null): ResultSet | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Partial<ResultSet>;
  if (!Array.isArray(o.items)) return null;
  // `//evil.com` is a protocol-relative URL, not a site path — startsWith("/") alone lets it in.
  const items = o.items.filter(isItem).filter((i) => !i.path.startsWith("//"));
  if (items.length === 0) return null;
  return {
    items,
    page: Number.isFinite(o.page) ? Number(o.page) : 1,
    totalPages: Number.isFinite(o.totalPages) ? Number(o.totalPages) : 1,
    searchHref: typeof o.searchHref === "string" && o.searchHref.startsWith("/") && !o.searchHref.startsWith("//")
      ? o.searchHref
      : "/search",
  };
}

/** Where `id` sits in the set, and what is either side of it. Null when the listing is not a
 * member — which is the cold-visitor case, and the case that must render no arrows at all.
 * Ends are hard stops: the set is ONE page of results, and an arrow that silently jumped to the
 * next page would be doing something other than what it says. */
export function neighbours(set: ResultSet | null, id: string): Neighbours | null {
  if (!set) return null;
  const index = set.items.findIndex((i) => i.id === id);
  if (index < 0) return null;
  return {
    index,
    count: set.items.length,
    prev: index > 0 ? set.items[index - 1] : null,
    next: index < set.items.length - 1 ? set.items[index + 1] : null,
    page: set.page,
    totalPages: set.totalPages,
    searchHref: set.searchHref,
  };
}

/** Browser-only helpers. Both swallow storage failures: Safari private mode throws on write,
 * and a pager is never worth breaking a page over. */
export function saveResultSet(set: ResultSet): void {
  try {
    sessionStorage.setItem(RESULT_SET_KEY, JSON.stringify(set));
  } catch {
    /* storage unavailable — the pager simply does not appear */
  }
}

export function readResultSet(): ResultSet | null {
  try {
    return parseResultSet(sessionStorage.getItem(RESULT_SET_KEY));
  } catch {
    return null;
  }
}
