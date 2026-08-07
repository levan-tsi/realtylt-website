/** DbIdxClient — serves listings from the Supabase `idx_listings` replication store
 * (the "Brivity way": a real database kept fresh by the hourly MLS sync, instead of a
 * committed JSON file that goes stale between manual exports).
 *
 * Read path: PostgREST with the publishable anon key — RLS exposes ACTIVE rows only, so
 * delisted/sold listings vanish from every surface the moment the sync deactivates them.
 * The request path never touches api.mlsgrid.com (the suspension guard in mls-fetch.ts
 * still throws on any request-path DATA call); photos stay behind the same-origin
 * /api/media proxy fed by each listing's stored PERMANENT MediaURLs.
 *
 * Fallback: until the baseline pull marks `idx_sync_state.baseline_complete` (or if the
 * DB errors), every method delegates to ReplicatedIdxClient (the committed snapshot) so
 * the site never breaks mid-migration.
 *
 * Write path: `applyIdxSync` calls the SECURITY DEFINER `idx_sync_apply` RPC, gated by
 * CRON_SECRET (sha256 checked in-database) — no service-role key exists in this stack.
 */

import { unstable_cache } from "next/cache";
import { DEFAULT_PAGE_SIZE, HOME_TYPE_VALUES, PIN_CAP, type IdxClient, type Listing, type MapBounds, type MapPin, type PinsResult, type SearchParams, type SearchResult, type SortKey } from "./types";
import { inBounds } from "./query";
import { ReplicatedIdxClient } from "./replicated";
import { DEFAULT_COUNTY_SLUGS } from "@/lib/site";
import { MIN_CITY_ACTIVES, pickAreaInsights, type AreaInsights, type InsightRow } from "@/lib/reports/insights";
import { interleaveByBand, pickPriceSpread } from "./price-spread";

interface SyncState {
  watermark: string;
  baseline_complete: boolean;
  last_synced_at: string | null;
}

const STATE_TTL_MS = 60_000; // re-check DB readiness / "Data last updated" once a minute
const PIN_CHUNK = 1000; // PostgREST max-rows — page the full pin set in these chunks
const MAX_PINS = 15_000; // hard bound on map payload work

/** Rentals (property_type "Rental") are a SEPARATE For-Rent experience — they must NEVER pollute
 * for-sale counts, medians, home rails, area insights, county/borough aggregates, or the OneKey
 * parity totals. This PostgREST predicate excludes them; it is appended to every for-sale query
 * (search default, featured/newest rails, county-slim reports, area-insight rows). The For-Rent
 * search flips to `property_type=eq.Rental` instead (see searchFilters). */
const EXCLUDE_RENTALS = "property_type=neq.Rental";
/** Live realtylt.com floors SALE searches at $10k to drop placeholder/junk rows ($1 lots, $0
 * comps). Applied as the DEFAULT min only when the user set no priceMin, and never to rentals. */
const SALE_PRICE_FLOOR = 10_000;
/** What earns a slot in a home-page rail. A rail is a shop window, not a search result: it may
 * legitimately be choosier than /search, which still shows everything. Three conditions —
 *  - it has a photograph (photos_servable > 0). A grey placeholder sells nothing.
 *  - it is not Coming Soon. The owner: "all of them are coming soons with no pic, there should
 *    be new freshly listed listings".
 *  - it is actually on the market (listed_at <= now). Coming Soon rows carry a FUTURE
 *    OnMarketDate, which is exactly why they sorted to the top of a "newest" rail. */
const railWorthy = () =>
  `photos_servable=gt.0&status=neq.${encodeURIComponent("Coming Soon")}&listed_at=lte.${new Date().toISOString()}`;
/** Candidates to consider before curating down to the rail's size — wide enough to contain the
 * scarce high-end bands (only 1.2% of inventory is above $5M). */
const RAIL_POOL = 240;
/** A second, price-descending pool so the scarce high bands are actually represented. */
const RAIL_LUXURY_POOL = 24;

function restConfig(): { base: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { base: `${url.replace(/\/+$/, "")}/rest/v1`, key };
}

/** True when Supabase REST is configured — lets callers tell "DB failed" (retry-worthy) apart
 * from "no DB at all" (fixture/snapshot mode, where the snapshot is authoritative). */
export function isDbConfigured(): boolean {
  return restConfig() !== null;
}

/** GET a PostgREST path. With `count`, total comes from the content-range header. */
async function rest<T>(path: string, opts: { count?: boolean } = {}): Promise<{ rows: T[]; total: number }> {
  const cfg = restConfig();
  if (!cfg) throw new Error("Supabase is not configured");
  const res = await fetch(`${cfg.base}/${path}`, {
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      ...(opts.count ? { Prefer: "count=exact" } : {}),
    },
    // No explicit cache option (an explicit "no-store" throws inside ISR prerenders);
    // page-level ISR + the 60s state cache own the caching story.
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Supabase REST ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const rows = (await res.json()) as T[];
  const total = opts.count ? Number(res.headers.get("content-range")?.split("/")[1] ?? rows.length) : rows.length;
  return { rows, total };
}

/** SearchParams → PostgREST filter string over the generated columns. */
function searchFilters(p: SearchParams): string {
  const parts: string[] = [];
  // No explicit area picked → scope the whole /search experience (grid, count, map pins) to the
  // six Hudson Valley counties the map frame shows; NYC boroughs stay opt-in via ?county=slug.
  if (p.county) parts.push(`county=eq.${encodeURIComponent(p.county)}`);
  else parts.push(`county=in.(${DEFAULT_COUNTY_SLUGS.join(",")})`);
  // Sale/rent scope. For-rent shows ONLY rentals; the default for-sale search EXCLUDES rentals
  // (an explicit sale propertyType already excludes them, so it only needs its own eq. filter).
  if (p.rental) parts.push("property_type=eq.Rental");
  // The $10k SALE floor is a DEFAULT: any explicit priceMin (incl. below it) overrides it, and
  // rentals are exempt (a $2,000/mo lease must not be floored out).
  if (p.priceMin != null) parts.push(`price=gte.${p.priceMin}`);
  else if (!p.rental) parts.push(`price=gte.${SALE_PRICE_FLOOR}`);
  if (p.priceMax != null) parts.push(`price=lte.${p.priceMax}`);
  if (p.bedsMin != null) parts.push(`beds=gte.${p.bedsMin}`);
  if (p.bathsMin != null) parts.push(`baths=gte.${p.bathsMin}`);
  if (p.sqftMin != null) parts.push(`sqft=gte.${p.sqftMin}`);
  if (p.sqftMax != null) parts.push(`sqft=lte.${p.sqftMax}`);
  // "MORE" panel filters — real generated columns since supabase/migrations/
  // idx_more_facts_columns.sql, like every other fact on this table.
  //
  // They used to read out of the `listing` jsonb (`listing->yearBuilt=gte.2000`), and that
  // was serving STALE SNAPSHOT DATA without telling anyone: `listing` is a fat jsonb that
  // TOASTs, so the predicate had to detoast rows, and with PostgREST's exact count and the
  // ORDER BY on top it blew the anon role's statement timeout — measured, year>=2000 alone
  // was fine at 319ms and TIMED OUT at ~3.2s with the count. search() caught the error and
  // fell back to the committed snapshot, so "Built 2000+" answered ZERO while the feed held
  // 4,713 such homes. Expression indexes on the jsonb paths did not help; the bitmap heap
  // recheck detoasts anyway. A NULL still never satisfies gte/lte, so a row that does not
  // state its year is still honestly excluded from a year filter.
  if (p.garageMin != null) parts.push(`garage_spaces=gte.${p.garageMin}`);
  if (p.garageMax != null) parts.push(`garage_spaces=lte.${p.garageMax}`);
  if (p.lotMin != null) parts.push(`lot_acres=gte.${p.lotMin}`);
  if (p.lotMax != null) parts.push(`lot_acres=lte.${p.lotMax}`);
  if (p.yearMin != null) parts.push(`year_built=gte.${p.yearMin}`);
  if (p.yearMax != null) parts.push(`year_built=lte.${p.yearMax}`);
  if (p.taxMax != null) parts.push(`tax_annual=lte.${p.taxMax}`);
  // photos_servable, not the JSONB marker: the marker is wiped by the sync's full-JSONB upsert,
  // so filtering on it hid 9,186 active listings that DO have photos (measured 2026-07-30).
  if (p.withPhotosOnly) parts.push(`photos_servable=gt.0`);
  // Home type — RESO PropertySubType. One token covers several feed values (a buyer looking for
  // a two-family does not distinguish Duplex from Triplex), so this is `in.()`, not equality.
  // Values are quoted because they contain spaces, and encoded because they travel in a URL;
  // they come from our own whitelist, never from the visitor.
  if (p.homeType) {
    const vals = HOME_TYPE_VALUES[p.homeType].map((v) => `"${encodeURIComponent(v)}"`).join(",");
    parts.push(`property_sub_type=in.(${vals})`);
  }
  // Feature toggles — generated boolean columns, indexed partial on is_active. `is.true` and
  // not `eq.true`, so a NULL (the feed did not state it) is excluded rather than matched: a
  // listing that never says whether it has central air must not turn up under "Central air".
  if (p.centralAir) parts.push("has_central_air=is.true");
  if (p.basement) parts.push("has_basement=is.true");
  if (p.waterfront) parts.push("has_waterfront=is.true");
  if (p.firstFloorBed) parts.push("has_first_floor_bed=is.true");
  if (p.eatInKitchen) parts.push("has_eat_in_kitchen=is.true");
  // Sale property-type filter. In for-rent mode the eq.Rental scope above already owns
  // property_type; otherwise an explicit sale type filters to it, and no sale type at all
  // still excludes rentals so the for-sale grid/count never carries a rental.
  if (!p.rental) {
    if (p.propertyType) parts.push(`property_type=eq.${encodeURIComponent(p.propertyType)}`);
    else parts.push(EXCLUDE_RENTALS);
  }
  // "New Listings" quick filter — keep only rows listed within the last N days.
  if (p.newWithinDays != null && p.newWithinDays > 0) {
    const since = new Date(Date.now() - p.newWithinDays * 86_400_000).toISOString();
    parts.push(`listed_at=gte.${encodeURIComponent(since)}`);
  }
  // An EXACT city — what the visitor picked from the suggest dropdown. Equality, not a
  // substring, so "Beacon" cannot drag in Beacon Street in Middletown.
  if (p.city) parts.push(`city=eq.${encodeURIComponent(p.city)}`);
  // On-market status. RLS already limits the table to rows we may show at all, so this only
  // ever narrows within Active / Coming Soon / Pending / Under Contract.
  if (p.status) parts.push(`status=eq.${encodeURIComponent(p.status)}`);
  // Map-viewport box (round 23) — the same clause set /api/idx/pins always used, now shared,
  // so the grid and the map literally cannot ask different geographic questions. Rows with a
  // 0 coordinate are excluded automatically (a valid NY box never spans lat/lng 0).
  if (p.bounds) {
    parts.push(
      `lat=gte.${p.bounds.south}`,
      `lat=lte.${p.bounds.north}`,
      `lng=gte.${p.bounds.west}`,
      `lng=lte.${p.bounds.east}`,
    );
  }
  // search_hay = lower(address city zip county). Strip LIKE wildcards from user input;
  // PostgREST's * wildcard wraps the needle for the same substring semantics as fixture.
  const needle = p.q?.trim().toLowerCase().replace(/[%_]/g, " ").trim();
  if (needle) parts.push(`search_hay=ilike.${encodeURIComponent(`*${needle}*`)}`);
  return parts.join("&");
}

const ORDER: Record<SortKey, string> = {
  // Alphabetical-by-address is deliberately meaningless w.r.t. price and age — combined with
  // the daily-rotated window in search() it reads as a fresh high/low mix every day.
  mixed: "address.asc,id.asc",
  newest: "listed_at.desc,id.asc",
  oldest: "listed_at.asc,id.asc",
  // Own-office ("United Real Estate") listings first, then freshest — mirrors the home rails.
  featured: "is_featured.desc,listed_at.desc,id.asc",
  "price-asc": "price.asc,id.asc",
  "price-desc": "price.desc,id.asc",
};

/** Cards carry ONE stable same-origin cover path (raw MediaURLs must never reach the
 * browser); the detail page expands the gallery via getProxiedPhotoPaths (DB-backed).
 *
 * `servable` is the idx_listings.photos_servable COLUMN — how many of this listing's photos the
 * media proxy can actually serve (the contiguous mirrored prefix in Storage). It is the pager's
 * bound on every surface, so the card counter, the map popup counter and the listing page all
 * print the same number. The two numbers it replaces were both wrong: the photos ARRAY length is
 * the feed's CLAIM (12,905 of 27,986 active listings claim more than the mirror can serve — the
 * owner's "8 pics, one photo" bug), and listing->photosMirrored is wiped to 0 by the sync's
 * full-JSONB upsert. null/undefined = never computed for this row (a listing inserted since the
 * last refresh): fall back to the claim, which is the pre-2026-07-30 behaviour. */
function toCard(l: Listing, servable?: number | null): Listing {
  return {
    ...l,
    photoCount: typeof servable === "number" ? servable : l.photos.length,
    photos: [`/api/media/${l.id}/0`],
  };
}

/** Every card read pulls the listing JSONB plus the servable-photo column beside it. */
const CARD_SELECT = "select=listing,photos_servable";
interface CardRow {
  listing: Listing;
  photos_servable: number | null;
}

/** Every visitor-facing card read goes through this. Observed on the home page 2026-07-30
 * (~1 load in 3 under a parallel sweep): "[idx-db] getFeatured failed — serving the committed
 * snapshot". The fallback did its job, but the rail then showed shape-stale snapshot data
 * because of ONE dropped read, where search() — which has always been wrapped — would have
 * recovered in a beat of latency. getListing, getFeatured, newestNonFeatured and searchPins
 * are wrapped now too, so the whole read surface degrades on the same terms.
 *
 * Cold serverless instances routinely drop their FIRST PostgREST request; without a retry
 * that single blip degrades search to the shape-stale committed snapshot, which renders as
 * "0 listings found" for MORE-panel filters the snapshot predates. One immediate retry
 * turns that into a beat of extra latency instead (proven on prod: 0@4.6s then 755@1s). */
async function onceRetried<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch {
    return await op();
  }
}

/** How big is the filtered set? Only the "mixed" rotation asks, and only to pick a start
 * offset — it does not need to be exact to the row. The number moves on the hourly sync, not
 * per request, so an instance may remember it for a few minutes: that removes a second exact
 * COUNT over the whole default six-county set (~11.7k rows) from every default /search.
 * Measured before this: mixed 306-649ms vs newest 139-230ms on the same warm connection.
 * A stale count can only put the rotation slightly past the tail, and search() falls back to
 * an unrotated page if that ever empties page 1. */
const ROTATION_COUNT_TTL_MS = 10 * 60_000;
const rotationCounts = new Map<string, { at: number; total: number }>();

/** Test hook — the cache is deliberately process-wide, so a test that changes the size of the
 * set has to clear it or it inherits the previous test's ring. */
export function resetRotationCacheForTests(): void {
  rotationCounts.clear();
}

async function rotationTotal(filters: string): Promise<number> {
  const hit = rotationCounts.get(filters);
  if (hit && Date.now() - hit.at < ROTATION_COUNT_TTL_MS) return hit.total;
  const { total } = await onceRetried(() =>
    rest<{ id: string }>(`idx_listings?select=id&${filters ? `${filters}&` : ""}limit=1`, { count: true }),
  );
  if (rotationCounts.size > 50) rotationCounts.clear(); // a handful of filter shapes in practice
  rotationCounts.set(filters, { at: Date.now(), total });
  return total;
}

export class DbIdxClient implements IdxClient {
  private stateCache?: { at: number; state: SyncState | null };
  private fb?: ReplicatedIdxClient;

  private fallbackClient(): ReplicatedIdxClient {
    return (this.fb ??= new ReplicatedIdxClient());
  }

  /** True when a fallback engaged AND it had to serve fixture sample data. */
  get servingFixture(): boolean {
    return this.fb?.servingFixture ?? false;
  }

  private async state(): Promise<SyncState | null> {
    if (this.stateCache && Date.now() - this.stateCache.at < STATE_TTL_MS) return this.stateCache.state;
    let state: SyncState | null = null;
    try {
      const { rows } = await onceRetried(() =>
        rest<SyncState>("idx_sync_state?id=eq.1&select=watermark,baseline_complete,last_synced_at"),
      );
      state = rows[0] ?? null;
    } catch (e) {
      console.error("[idx-db] sync-state fetch failed — serving the committed snapshot:", e);
    }
    this.stateCache = { at: Date.now(), state };
    return state;
  }

  private async ready(): Promise<SyncState | null> {
    const state = await this.state();
    return state?.baseline_complete ? state : null;
  }

  /** When OUR COPY of the feed was last refreshed — the one "Data last updated" fact the
   * MLS attribution prints, read off the same 60s-cached state row the search path uses.
   * null while the DB is not yet the source (baseline pull unfinished, or a DB error), in
   * which case the caller keeps whatever the snapshot/fixture path knows. */
  async feedLastUpdated(): Promise<string | null> {
    return (await this.ready())?.last_synced_at ?? null;
  }

  async search(params: SearchParams): Promise<SearchResult> {
    const state = await this.ready();
    if (!state) return this.fallbackClient().search(params);
    try {
      const { sort = "newest", page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;
      const size = Math.max(1, Math.min(pageSize, PIN_CHUNK));
      const filters = searchFilters(params);
      const base = `idx_listings?${CARD_SELECT}&${filters ? `${filters}&` : ""}order=${ORDER[sort]}`;

      // "mixed" rotates daily so the default page is never the same parade — but it rotates
      // by WHOLE PAGES around a RING, and that matters.
      //
      // It used to add a day-seeded ROW offset to every page: `offset = rotate + (p-1)*size`.
      // The comment claimed that kept pagination coherent. It did not. `rotate` can be almost
      // the whole set, so page 2 ran off the end: measured on production, Orange county with
      // 3+ beds is 1,720 listings across 48 pages and page 2 returned FOUR, while page 3 came
      // back with a different total entirely (PostgREST's count for an offset past the end).
      // The owner was looking at exactly this when he said paging "takes you to page 2 and
      // that's it".
      //
      // Rotating by whole pages on a ring fixes it: page p of the visitor's sequence is ring
      // page (r + p - 1) mod pages, so every page is a real full page, every listing appears
      // exactly once, and the set's genuinely short tail page simply lands somewhere other
      // than last. The offset can never exceed the set.
      let ringPages = 0;
      let rotatePages = 0;
      // No ring for a viewport-scoped query: the daily rotation exists so the DEFAULT page is
      // never the same parade, but a map viewport is ephemeral — rotating it would cost an
      // extra count per pan and grow rotationTotal's cache by one entry per box ever panned.
      if (sort === "mixed" && !params.bounds) {
        const t = await rotationTotal(filters);
        ringPages = Math.max(1, Math.ceil(t / size));
        if (ringPages > 1) rotatePages = (Math.floor(Date.now() / 86_400_000) * 53) % ringPages;
      }
      const fetchPage = (p: number) => {
        const index = rotatePages ? (rotatePages + p - 1) % ringPages : p - 1;
        return rest<CardRow>(`${base}&limit=${size}&offset=${index * size}`, { count: true });
      };

      let { rows, total } = await onceRetried(() => fetchPage(Math.max(1, page)));
      // The ring is sized from a cached count, so a shrinking set could still point a page
      // past the real tail. An empty page with matches in the set is never a truthful answer —
      // drop the rotation and serve the page straight.
      if (!rows.length && total > 0 && rotatePages > 0) {
        rotatePages = 0;
        ({ rows, total } = await onceRetried(() => fetchPage(Math.max(1, page))));
      }
      const totalPages = Math.max(1, Math.ceil(total / size));
      const safePage = Math.min(Math.max(1, page), totalPages);
      // Past-the-end page (stale link) — clamp like the fixture client and refetch.
      if (!rows.length && total > 0 && safePage !== page) ({ rows } = await fetchPage(safePage));

      // "Mixed" promises a mix, and until now it delivered alphabetical-by-address, which
      // correlates with nothing — so a page was whatever the alphabet handed over, and since
      // 78% of the inventory is under $1M that meant page after page of the same price. The
      // rows are only REORDERED here: same listings, same count, same pagination, same map
      // pins. Every other sort is an explicit instruction from the visitor and is left alone.
      const cards = rows.map((r) => toCard(r.listing, r.photos_servable));
      return {
        listings: sort === "mixed" ? interleaveByBand(cards) : cards,
        total,
        page: safePage,
        pageSize: size,
        totalPages,
        dataLastUpdated: state.last_synced_at ?? "",
      };
    } catch (e) {
      console.error("[idx-db] search failed — serving the committed snapshot:", e);
      return this.fallbackClient().search(params);
    }
  }

  async getListing(id: string): Promise<Listing | null> {
    if (!(await this.ready())) return this.fallbackClient().getListing(id);
    try {
      const { rows } = await onceRetried(() =>
        rest<CardRow>(`idx_listings?id=eq.${encodeURIComponent(id)}&${CARD_SELECT}`),
      );
      return rows[0] ? toCard(rows[0].listing, rows[0].photos_servable) : null;
    } catch (e) {
      console.error(`[idx-db] getListing(${id}) failed — serving the committed snapshot:`, e);
      return this.fallbackClient().getListing(id);
    }
  }

  async getFeatured(limit = 8): Promise<Listing[]> {
    if (!(await this.ready())) return this.fallbackClient().getFeatured(limit);
    try {
      const ownBase = `idx_listings?is_featured=eq.true&${EXCLUDE_RENTALS}&${railWorthy()}&${CARD_SELECT}`;
      const [ownNew, ownLux] = await Promise.all([
        onceRetried(() => rest<CardRow>(`${ownBase}&order=${ORDER.newest}&limit=${RAIL_POOL}`)),
        onceRetried(() => rest<CardRow>(`${ownBase}&order=${ORDER["price-desc"]}&limit=${RAIL_LUXURY_POOL}`)),
      ]);
      const ownSeen = new Set<string>();
      const own = {
        rows: [...ownNew.rows, ...ownLux.rows].filter((r) => !ownSeen.has(r.listing.id) && ownSeen.add(r.listing.id)),
      };
      const listings = interleaveByBand(
        pickPriceSpread(own.rows.map((r) => toCard(r.listing, r.photos_servable)), limit),
      );
      if (listings.length >= limit) return listings;
      // Top up with the freshest non-featured so the rail is never sparse.
      const fill = await this.newestNonFeatured(limit - listings.length, new Set());
      return [...listings, ...fill];
    } catch (e) {
      console.error("[idx-db] getFeatured failed — serving the committed snapshot:", e);
      return this.fallbackClient().getFeatured(limit);
    }
  }

  async getNew(limit = 8): Promise<Listing[]> {
    if (!(await this.ready())) return this.fallbackClient().getNew(limit);
    try {
      // Exclude whatever the Featured rail surfaces so the home rails stay distinct.
      const exclude = new Set((await this.getFeatured()).map((l) => l.id));
      return await this.newestNonFeatured(limit, exclude);
    } catch (e) {
      console.error("[idx-db] getNew failed — serving the committed snapshot:", e);
      return this.fallbackClient().getNew(limit);
    }
  }

  private async newestNonFeatured(limit: number, exclude: ReadonlySet<string>): Promise<Listing[]> {
    // Pull a WIDE pool, then curate it. The rail used to take the top `limit` by listed_at and
    // print whatever came back — which was 7 Coming Soon rows with NO photograph, because
    // Coming Soon listings carry a FUTURE OnMarketDate and therefore sort first under "newest".
    // A shop window made of grey placeholders for homes nobody can view yet is worse than no
    // shop window. RAIL_WORTHY is the fix; pickPriceSpread then chooses across price bands so
    // the rail is not eight variations on the same starter home.
    const base = `idx_listings?is_featured=eq.false&${EXCLUDE_RENTALS}&${railWorthy()}&${CARD_SELECT}`;
    // TWO pools, because the newest 240 almost never contains a $10M home — there are only 26
    // in the entire six-county inventory (0.2%), so "show a few high end" cannot be satisfied
    // by freshness alone. The second query guarantees the top bands have stock for
    // pickPriceSpread to draw on; without it the spread silently degrades to "whatever the
    // newest happened to include", which is the behaviour being fixed.
    const [pool, luxury] = await Promise.all([
      onceRetried(() => rest<CardRow>(`${base}&order=${ORDER.newest}&limit=${RAIL_POOL}`)),
      onceRetried(() => rest<CardRow>(`${base}&order=${ORDER["price-desc"]}&limit=${RAIL_LUXURY_POOL}`)),
    ]);
    const seen = new Set<string>();
    const candidates = [...pool.rows, ...luxury.rows].filter(
      (r) => !exclude.has(r.listing.id) && !seen.has(r.listing.id) && seen.add(r.listing.id),
    );
    // PICK across bands, then ORDER across them. Picking alone is not enough: the home page
    // asks for 24 and RailPager shows 8 at a time, so a spread that preserved newest-first order
    // put every high-end home on page 2 of the rail — selected, and invisible. The owner asked
    // for what the rail SHOWS to be balanced, which means the first screen.
    return interleaveByBand(
      pickPriceSpread(candidates.map((r) => toCard(r.listing, r.photos_servable)), limit),
    );
  }

  /** Map pins for the /search map. With `bounds` (the fast path the SearchClient always
   * uses), a SINGLE query returns only listings inside the viewport box, capped at
   * PIN_CAP and ordered newest-first so a truncated dense view keeps the freshest
   * listings; `total` is the true in-bounds count so the UI can flag truncation. Without
   * bounds, pages the whole filtered set in PIN_CHUNK slices (PostgREST caps a response
   * at 1000 rows) — the pre-viewport behavior, kept for any caller that needs every match. */
  async searchPins(params: SearchParams, bounds?: MapBounds): Promise<PinsResult> {
    if (!(await this.ready())) {
      const result = await this.fallbackClient().search({
        ...params,
        page: 1,
        pageSize: Number.MAX_SAFE_INTEGER,
      });
      let pins = result.listings.map(toPin).filter((p): p is MapPin => !!p);
      let total = result.total;
      if (bounds) {
        pins = pins.filter((p) => inBounds(p, bounds));
        total = pins.length; // true in-bounds count
        pins = pins.slice(0, PIN_CAP);
      }
      return { pins, total };
    }
    const filters = searchFilters(params);
    // photoCount rides photos_servable — exactly "how many photos /api/media serves from
    // storage", which is the popup pager's contract, and the SAME number the card and the
    // listing page print. It used to ride listing->photosMirrored, which the sync's full-JSONB
    // upsert wipes: 9,186 active listings therefore showed a popup with NO photo at all.
    const sel = "select=id,price,lat,lng,address,city,zip,beds,baths,status,office:listing->>listOfficeName,photoCount:photos_servable";

    if (bounds) {
      // One bbox builder: searchFilters owns the box clauses now (round 23 gave the grid the
      // same box), so the pins query and the grid query cannot drift.
      const boxed = searchFilters({ ...params, bounds });
      const base = `idx_listings?${sel}&${boxed ? `${boxed}&` : ""}order=listed_at.desc,id.asc`;
      // count=exact reports the FULL in-bounds match count (ignoring limit), so `total`
      // stays truthful even when the viewport is capped. Rows with a 0 coordinate are
      // excluded automatically (a valid NY box never spans lat/lng 0).
      //
      // PIN_CHUNK slices, like the unbounded path below: a single limit=PIN_CAP request is
      // silently CLAMPED by PostgREST's max-rows (1000), which shipped 1,000 pins while the
      // banner said "of 6,714" — seen live on the preview, not hypothesized. The first slice
      // answers alone in the common case; a dense viewport fans the rest out in parallel.
      const { rows, total } = await onceRetried(() =>
        rest<MapPin>(`${base}&limit=${PIN_CHUNK}`, { count: true }),
      );
      let all = rows;
      if (rows.length === PIN_CHUNK && total > PIN_CHUNK) {
        const more = await Promise.all(
          Array.from({ length: Math.ceil((Math.min(total, PIN_CAP) - PIN_CHUNK) / PIN_CHUNK) }, (_, i) =>
            onceRetried(() => rest<MapPin>(`${base}&limit=${PIN_CHUNK}&offset=${(i + 1) * PIN_CHUNK}`)).then((r) => r.rows),
          ),
        );
        all = rows.concat(...more).slice(0, PIN_CAP);
      }
      return { pins: all.filter((r) => r.lat && r.lng).map((r) => ({ ...r, photoCount: r.photoCount ?? 0 })), total };
    }

    const base = `idx_listings?${sel}&${filters ? `${filters}&` : ""}order=id.asc`;
    const pins: MapPin[] = [];
    let total = 0;
    for (let offset = 0; offset < MAX_PINS; offset += PIN_CHUNK) {
      const { rows, total: t } = await rest<MapPin>(`${base}&limit=${PIN_CHUNK}&offset=${offset}`, {
        count: offset === 0,
      });
      if (offset === 0) total = t;
      for (const r of rows) if (r.lat && r.lng) pins.push({ ...r, photoCount: r.photoCount ?? 0 });
      if (rows.length < PIN_CHUNK) break;
    }
    return { pins, total };
  }
}

function toPin(l: Listing): MapPin | null {
  if (!l.lat || !l.lng) return null;
  return {
    id: l.id, price: l.price, lat: l.lat, lng: l.lng, address: l.address,
    city: l.city, zip: l.zip, beds: l.beds, baths: l.baths, office: l.listOfficeName,
    status: l.status,
    // Carded listings carry ONE cover path, so photos.length is always 1 here — photoCount is
    // the real bound whenever the card set it (see toCard).
    photoCount: l.photoCount ?? l.photos.length,
  };
}

/** Slim projection of a county's whole ACTIVE set — what the reports APIs (comps +
 * market stats) compute over. Kept lean on purpose: a full-Listing pull for Queens
 * (4.6k rows with remarks + photo URLs) is megabytes; this is ~150 bytes/row. */
export interface CountyActiveRow {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: Listing["propertyType"];
  listOfficeName: string;
}

/** Every active listing in a county (slim rows, PIN_CHUNK-paged). null = DB
 * unconfigured/not ready/errored — the caller falls back to the committed snapshot. */
export async function getCountyActiveSlim(
  county: string,
): Promise<{ rows: CountyActiveRow[]; dataLastUpdated: string } | null> {
  if (!restConfig()) return null;
  try {
    const state = await rest<SyncState>(
      "idx_sync_state?id=eq.1&select=watermark,baseline_complete,last_synced_at",
    );
    if (!state.rows[0]?.baseline_complete) return null;
    const sel =
      "select=id,address,city,price,beds,baths,sqft,propertyType:property_type,listOfficeName:listing->>listOfficeName";
    const rows: CountyActiveRow[] = [];
    for (let offset = 0; offset < MAX_PINS; offset += PIN_CHUNK) {
      const page = await rest<CountyActiveRow>(
        `idx_listings?${sel}&county=eq.${encodeURIComponent(county)}&${EXCLUDE_RENTALS}&order=id.asc&limit=${PIN_CHUNK}&offset=${offset}`,
      );
      rows.push(...page.rows);
      if (page.rows.length < PIN_CHUNK) break;
    }
    return { rows, dataLastUpdated: state.rows[0].last_synced_at ?? "" };
  } catch (e) {
    console.error(`[idx-db] county active slim (${county}) failed:`, e);
    return null;
  }
}

/** Slim {price, listed_at} rows for an area filter (active rows via RLS), PIN_CHUNK-paged.
 * The listing detail page's Market Insights aggregates over these — a lean projection so a
 * dense city/borough pull stays cheap. Rentals are excluded so the area's for-sale numbers
 * (avg price / days on market) never mix in monthly rents. */
async function getInsightRows(filter: string): Promise<InsightRow[]> {
  const rows: InsightRow[] = [];
  for (let offset = 0; offset < MAX_PINS; offset += PIN_CHUNK) {
    const page = await rest<{ price: number; listedAt: string }>(
      `idx_listings?select=price,listedAt:listed_at&${filter}&${EXCLUDE_RENTALS}&order=id.asc&limit=${PIN_CHUNK}&offset=${offset}`,
    );
    rows.push(...page.rows);
    if (page.rows.length < PIN_CHUNK) break;
  }
  return rows;
}

/** Real market insights for a listing's city (BEAT live's N/A cards). Aggregates active
 * idx_listings for the city; if the city carries fewer than MIN_CITY_ACTIVES it falls back
 * to the whole county set (labeled). Cached for an hour (the numbers move slowly and the
 * page is already ISR). null = DB unconfigured/not ready/errored → caller shows a soft note. */
export const getAreaInsights = unstable_cache(
  async (city: string, county: string, countyName: string): Promise<AreaInsights | null> => {
    if (!restConfig()) return null;
    try {
      const state = await rest<SyncState>(
        "idx_sync_state?id=eq.1&select=watermark,baseline_complete,last_synced_at",
      );
      if (!state.rows[0]?.baseline_complete) return null;
      const dataLastUpdated = state.rows[0].last_synced_at ?? "";
      const countyFilter = `county=eq.${encodeURIComponent(county)}`;
      const cityRows = await getInsightRows(
        `city=eq.${encodeURIComponent(city)}&${countyFilter}`,
      );
      // Only pay for the county pull when the city can't stand on its own.
      const countyRows = cityRows.length >= MIN_CITY_ACTIVES ? [] : await getInsightRows(countyFilter);
      return pickAreaInsights({ city, countyName, cityRows, countyRows, dataLastUpdated });
    } catch (e) {
      console.error(`[idx-db] area insights (${city}/${county}) failed:`, e);
      return null;
    }
  },
  ["listing-area-insights-v1"],
  { revalidate: 3600 },
);

/** A listing's source MediaURLs + how many leading photos are mirrored to storage (RLS: active
 * rows only). null = DB unavailable/unconfigured (caller should fall back). */
export async function getDbListingMedia(
  id: string,
): Promise<{ photos: string[]; mirrored: number; servable: number | null } | null> {
  if (!restConfig()) return null;
  try {
    const { rows } = await rest<{ photos: unknown; mirrored: unknown; servable: unknown }>(
      `idx_listings?id=eq.${encodeURIComponent(id)}&select=photos:listing->photos,mirrored:listing->photosMirrored,servable:photos_servable`,
    );
    const photos = rows[0]?.photos;
    const mirrored = rows[0]?.mirrored;
    const servable = rows[0]?.servable;
    return {
      photos: Array.isArray(photos) ? (photos as string[]) : [],
      mirrored: typeof mirrored === "number" && mirrored > 0 ? mirrored : 0,
      servable: typeof servable === "number" ? servable : null,
    };
  } catch (e) {
    console.error(`[idx-db] media lookup (${id}) failed:`, e);
    return null;
  }
}

/** Ordered PERMANENT MediaURLs for a listing from the DB (RLS: active rows only).
 * null = DB unavailable/unconfigured (caller should fall back); [] = none stored. */
export async function getDbMediaUrls(id: string): Promise<string[] | null> {
  const media = await getDbListingMedia(id);
  return media ? media.photos : null;
}

/** Prior mirror state (contiguous count + the modificationTimestamp it was built for) for a set
 * of listing ids — the sync uses it to resume/skip already-mirrored prefixes. Chunked so the
 * `id=in.()` URL stays short; missing/never-mirrored ids simply do not appear in the result. */
export async function getMirrorState(
  ids: readonly string[],
): Promise<Map<string, { mirrored: number; ts?: string; count?: number }>> {
  const out = new Map<string, { mirrored: number; ts?: string; count?: number }>();
  if (!restConfig() || !ids.length) return out;
  const CHUNK = 150;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK).map((id) => encodeURIComponent(id));
    try {
      const { rows } = await rest<{ id: string; mirrored: unknown; ts: unknown; count: unknown }>(
        `idx_listings?id=in.(${slice.join(",")})&select=id,mirrored:listing->photosMirrored,ts:listing->photosMirroredTs,count:listing->photosMirroredCount`,
      );
      for (const r of rows) {
        out.set(r.id, {
          mirrored: typeof r.mirrored === "number" ? r.mirrored : 0,
          ts: typeof r.ts === "string" ? r.ts : undefined,
          // Absent on rows mirrored before photosMirroredCount existed — planRange treats an
          // unknown count as "fall back to the timestamp test" rather than as a match.
          count: typeof r.count === "number" ? r.count : undefined,
        });
      }
    } catch (e) {
      console.error("[idx-db] mirror-state lookup failed (continuing):", e);
    }
  }
  return out;
}

// ── Write path (sync cron + baseline script) ────────────────────────────────────────────

export interface IdxSyncApplyArgs {
  secret: string;
  upserts?: Listing[];
  deactivateIds?: string[];
  watermark?: string;
  baselineComplete?: boolean;
}

/** Normalize timestamps through toISOString so the DB's ISO-UTC text columns sort
 * chronologically regardless of the feed's millisecond formatting. */
export function normalizeForDb(l: Listing): Listing {
  return {
    ...l,
    listedAt: toIso(l.listedAt),
    modificationTimestamp: toIso(l.modificationTimestamp),
  };
}

function toIso(s: string): string {
  const t = Date.parse(s);
  return Number.isNaN(t) ? s : new Date(t).toISOString();
}

/** Apply one sync batch atomically via the secret-gated idx_sync_apply RPC. */
export async function applyIdxSync(args: IdxSyncApplyArgs): Promise<{ upserted: number; deactivated: number }> {
  const cfg = restConfig();
  if (!cfg) throw new Error("Supabase is not configured");
  const res = await fetch(`${cfg.base}/rpc/idx_sync_apply`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      _secret: args.secret,
      _upserts: (args.upserts ?? []).map(normalizeForDb),
      _deactivate_ids: args.deactivateIds ?? [],
      _watermark: args.watermark ?? null,
      _baseline_complete: args.baselineComplete ?? null,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`idx_sync_apply ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as { upserted: number; deactivated: number };
}

/** Current sync watermark (for the cron's delta query). */
export async function getSyncWatermark(): Promise<{ watermark: string; baselineComplete: boolean }> {
  const { rows } = await rest<SyncState>("idx_sync_state?id=eq.1&select=watermark,baseline_complete,last_synced_at");
  if (!rows[0]) throw new Error("idx_sync_state row missing");
  return { watermark: rows[0].watermark, baselineComplete: rows[0].baseline_complete };
}
