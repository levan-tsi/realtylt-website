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

import { DEFAULT_PAGE_SIZE, PIN_CAP, type IdxClient, type Listing, type MapBounds, type MapPin, type PinsResult, type SearchParams, type SearchResult, type SortKey } from "./types";
import { inBounds } from "./query";
import { ReplicatedIdxClient } from "./replicated";

interface SyncState {
  watermark: string;
  baseline_complete: boolean;
  last_synced_at: string | null;
}

const STATE_TTL_MS = 60_000; // re-check DB readiness / "Data last updated" once a minute
const PIN_CHUNK = 1000; // PostgREST max-rows — page the full pin set in these chunks
const MAX_PINS = 15_000; // hard bound on map payload work

function restConfig(): { base: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { base: `${url.replace(/\/+$/, "")}/rest/v1`, key };
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
  if (p.county) parts.push(`county=eq.${encodeURIComponent(p.county)}`);
  if (p.priceMin != null) parts.push(`price=gte.${p.priceMin}`);
  if (p.priceMax != null) parts.push(`price=lte.${p.priceMax}`);
  if (p.bedsMin != null) parts.push(`beds=gte.${p.bedsMin}`);
  if (p.bathsMin != null) parts.push(`baths=gte.${p.bathsMin}`);
  if (p.sqftMin != null) parts.push(`sqft=gte.${p.sqftMin}`);
  if (p.propertyType) parts.push(`property_type=eq.${encodeURIComponent(p.propertyType)}`);
  // search_hay = lower(address city zip county). Strip LIKE wildcards from user input;
  // PostgREST's * wildcard wraps the needle for the same substring semantics as fixture.
  const needle = p.q?.trim().toLowerCase().replace(/[%_]/g, " ").trim();
  if (needle) parts.push(`search_hay=ilike.${encodeURIComponent(`*${needle}*`)}`);
  return parts.join("&");
}

const ORDER: Record<SortKey, string> = {
  newest: "listed_at.desc,id.asc",
  oldest: "listed_at.asc,id.asc",
  // Own-office ("United Real Estate") listings first, then freshest — mirrors the home rails.
  featured: "is_featured.desc,listed_at.desc,id.asc",
  "price-asc": "price.asc,id.asc",
  "price-desc": "price.desc,id.asc",
};

/** Cards carry ONE stable same-origin cover path (raw MediaURLs must never reach the
 * browser); the detail page expands the gallery via getProxiedPhotoPaths (DB-backed). */
function toCard(l: Listing): Listing {
  return { ...l, photos: [`/api/media/${l.id}/0`] };
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
      const { rows } = await rest<SyncState>(
        "idx_sync_state?id=eq.1&select=watermark,baseline_complete,last_synced_at",
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

  async search(params: SearchParams): Promise<SearchResult> {
    const state = await this.ready();
    if (!state) return this.fallbackClient().search(params);
    try {
      const { sort = "newest", page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;
      const size = Math.max(1, Math.min(pageSize, PIN_CHUNK));
      const filters = searchFilters(params);
      const base = `idx_listings?select=listing&${filters ? `${filters}&` : ""}order=${ORDER[sort]}`;

      const fetchPage = (p: number) =>
        rest<{ listing: Listing }>(`${base}&limit=${size}&offset=${(p - 1) * size}`, { count: true });

      let { rows, total } = await fetchPage(Math.max(1, page));
      const totalPages = Math.max(1, Math.ceil(total / size));
      const safePage = Math.min(Math.max(1, page), totalPages);
      // Past-the-end page (stale link) — clamp like the fixture client and refetch.
      if (!rows.length && total > 0 && safePage !== page) ({ rows } = await fetchPage(safePage));

      return {
        listings: rows.map((r) => toCard(r.listing)),
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
      const { rows } = await rest<{ listing: Listing }>(
        `idx_listings?id=eq.${encodeURIComponent(id)}&select=listing`,
      );
      return rows[0] ? toCard(rows[0].listing) : null;
    } catch (e) {
      console.error(`[idx-db] getListing(${id}) failed — serving the committed snapshot:`, e);
      return this.fallbackClient().getListing(id);
    }
  }

  async getFeatured(limit = 8): Promise<Listing[]> {
    if (!(await this.ready())) return this.fallbackClient().getFeatured(limit);
    try {
      const own = await rest<{ listing: Listing }>(
        `idx_listings?is_featured=eq.true&select=listing&order=${ORDER.newest}&limit=${limit}`,
      );
      const listings = own.rows.map((r) => toCard(r.listing));
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
    const { rows } = await rest<{ listing: Listing }>(
      `idx_listings?is_featured=eq.false&select=listing&order=${ORDER.newest}&limit=${limit + exclude.size}`,
    );
    return rows
      .map((r) => r.listing)
      .filter((l) => !exclude.has(l.id))
      .slice(0, limit)
      .map(toCard);
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
    const sel = "select=id,price,lat,lng,address,city,zip,beds,baths,office:listing->>listOfficeName";

    if (bounds) {
      const bbox =
        `lat=gte.${bounds.south}&lat=lte.${bounds.north}` +
        `&lng=gte.${bounds.west}&lng=lte.${bounds.east}`;
      // count=exact reports the FULL in-bounds match count (ignoring limit), so `total`
      // stays truthful even when the viewport is capped. Rows with a 0 coordinate are
      // excluded automatically (a valid NY box never spans lat/lng 0).
      const { rows, total } = await rest<MapPin>(
        `idx_listings?${sel}&${filters ? `${filters}&` : ""}${bbox}&order=listed_at.desc,id.asc&limit=${PIN_CAP}`,
        { count: true },
      );
      return { pins: rows.filter((r) => r.lat && r.lng), total };
    }

    const base = `idx_listings?${sel}&${filters ? `${filters}&` : ""}order=id.asc`;
    const pins: MapPin[] = [];
    let total = 0;
    for (let offset = 0; offset < MAX_PINS; offset += PIN_CHUNK) {
      const { rows, total: t } = await rest<MapPin>(`${base}&limit=${PIN_CHUNK}&offset=${offset}`, {
        count: offset === 0,
      });
      if (offset === 0) total = t;
      for (const r of rows) if (r.lat && r.lng) pins.push(r);
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
        `idx_listings?${sel}&county=eq.${encodeURIComponent(county)}&order=id.asc&limit=${PIN_CHUNK}&offset=${offset}`,
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

/** A listing's source MediaURLs + how many leading photos are mirrored to storage (RLS: active
 * rows only). null = DB unavailable/unconfigured (caller should fall back). */
export async function getDbListingMedia(id: string): Promise<{ photos: string[]; mirrored: number } | null> {
  if (!restConfig()) return null;
  try {
    const { rows } = await rest<{ photos: unknown; mirrored: unknown }>(
      `idx_listings?id=eq.${encodeURIComponent(id)}&select=photos:listing->photos,mirrored:listing->photosMirrored`,
    );
    const photos = rows[0]?.photos;
    const mirrored = rows[0]?.mirrored;
    return {
      photos: Array.isArray(photos) ? (photos as string[]) : [],
      mirrored: typeof mirrored === "number" && mirrored > 0 ? mirrored : 0,
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
): Promise<Map<string, { mirrored: number; ts?: string }>> {
  const out = new Map<string, { mirrored: number; ts?: string }>();
  if (!restConfig() || !ids.length) return out;
  const CHUNK = 150;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK).map((id) => encodeURIComponent(id));
    try {
      const { rows } = await rest<{ id: string; mirrored: unknown; ts: unknown }>(
        `idx_listings?id=in.(${slice.join(",")})&select=id,mirrored:listing->photosMirrored,ts:listing->photosMirroredTs`,
      );
      for (const r of rows) {
        out.set(r.id, {
          mirrored: typeof r.mirrored === "number" ? r.mirrored : 0,
          ts: typeof r.ts === "string" ? r.ts : undefined,
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
