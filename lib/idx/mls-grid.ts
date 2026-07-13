/** MlsGridClient — real OneKey MLS feed via the MLS Grid API v2.
 *
 * MLS Grid hard constraints honored here (memory: mls-grid-api-constraints + the owner's
 * working n8n "RealtyLT MLS Search"/"MLS Detail" workflows):
 * - REPLICATION API, not a search proxy: `$filter` only allows MlgCanView,
 *   ModificationTimestamp, OriginatingSystemName, StandardStatus, ListingId, PropertyType,
 *   ListOfficeMlsId. City/price/beds/county are filtered CLIENT-SIDE over a cached working set.
 * - `$orderby` allows ModificationTimestamp only; paging via `$skip`; max `$top=500`.
 * - `Accept-Encoding: gzip` is mandatory (400 without it). `UnparsedAddress` does NOT exist
 *   on onekey2 — address is StreetNumber + StreetName + StreetSuffix.
 * - Rate limits: 2 req/sec, hourly+daily caps → sequential pages with a gap, 15-min in-memory
 *   cache (module singleton) + ISR (`revalidate`) so the feed is hit a few times/hour at most.
 * - Photos come from `$expand=Media` (Media[].MediaURL ordered by Media[].Order) — the one
 *   piece the n8n chatbot never fetched.
 * - Required attribution is rendered by the UI (MlsAttribution component) from
 *   `modificationTimestamp` + `listOfficeName` carried on every mapped listing.
 */

import { COUNTIES, type CountySlug } from "@/lib/site";
import { FixtureIdxClient } from "./fixture";
import { FIXTURE_LISTINGS } from "./fixture-data";
import ZIP_CENTROIDS from "./zip-centroids.json";
import type { IdxClient, Listing, SearchParams, SearchResult } from "./types";

/** RESO Web API property payload (subset we map). */
interface ResoProperty {
  ListingId?: string;
  ListingKey?: string;
  ListPrice?: number;
  StreetNumber?: string;
  StreetName?: string;
  StreetSuffix?: string;
  City?: string;
  StateOrProvince?: string;
  PostalCode?: string;
  CountyOrParish?: string;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  BathroomsHalf?: number;
  LivingArea?: number;
  LotSizeAcres?: number;
  YearBuilt?: number;
  DaysOnMarket?: number;
  PropertyType?: string;
  PropertySubType?: string;
  StandardStatus?: string;
  ListAgentFullName?: string;
  ListOfficeName?: string;
  PublicRemarks?: string;
  Latitude?: number;
  Longitude?: number;
  OriginatingSystemName?: string;
  ModificationTimestamp?: string;
  MlgCanView?: boolean;
  Media?: { MediaURL?: string; Order?: number; MediaCategory?: string }[];
}

/** Fields this subscription serves (verified against the live feed 2026-07-11 — it rejects
 * UnparsedAddress, OnMarketDate, and notably Latitude/Longitude; coordinates are derived
 * from zip centroids instead). fetchPage still self-heals if the subscription changes:
 * any $select field the API 400s on is dropped exactly as named and logged. */
const SELECT_FIELDS = [
  "ListingId", "StreetNumber", "StreetName", "StreetSuffix", "City", "StateOrProvince",
  "PostalCode", "CountyOrParish", "ListPrice", "BedroomsTotal", "BathroomsTotalInteger",
  "BathroomsHalf", "LivingArea", "LotSizeAcres", "YearBuilt", "DaysOnMarket",
  "StandardStatus", "PropertyType", "PropertySubType", "ListAgentFullName",
  "ListOfficeName", "PublicRemarks", "ModificationTimestamp",
];

/** Lowercased county slugs we serve — feed values like "Westchester County" normalize to these. */
const COUNTY_SLUGS = new Set<string>(COUNTIES.map((c) => c.slug));

const SYNC_TTL_MS = 15 * 60 * 1000; // refresh replicated working set every 15 min
const RETRY_MS = 60 * 1000; // cool-down before retrying a failed sync
const PAGE_SIZE = 500; // MLS Grid max $top
const MAX_PAGES = 8; // hard bound per sync (≤ 8 requests, ~4000 rows scanned)
const TARGET_KEPT = 150; // stop paging once the six-county working set is this deep
const PAGE_GAP_MS = 1100; // stay STRICTLY under the 2 req/sec per-ACCOUNT cap
const MAX_PHOTOS = 16; // bound page weight + image-optimizer cost per listing

export class MlsGridClient implements IdxClient {
  private cache: Listing[] = [];
  private cachedAt = 0;
  private syncing: Promise<void> | null = null;
  /** Dropped once a 400 shows the feed rejects the PropertyType `in` clause. */
  private typeFilterSupported = true;
  /** Live view of which SELECT_FIELDS this subscription actually serves. */
  private readonly select = new Set(SELECT_FIELDS);
  private loggedKeys = false;
  /** listing id → current SIGNED media URLs. Listing.photos carry stable /api/media/…
   * proxy paths instead — media tokens expire in ~1h, far shorter than page caches. */
  private readonly mediaByListing = new Map<string, string[]>();

  constructor(
    private readonly endpoint = process.env.MLS_API_ENDPOINT ?? "",
    private readonly apiKey = process.env.MLS_API_KEY ?? "",
    private readonly feedId = process.env.MLS_FEED_ID || "onekey2",
  ) {}

  async search(params: SearchParams): Promise<SearchResult> {
    await this.ensureSynced();
    return new FixtureIdxClient(this.cache).search(params);
  }

  async getListing(id: string): Promise<Listing | null> {
    await this.ensureSynced();
    const cached = this.cache.find((l) => l.id === id);
    if (cached) return cached;
    // Not in the working-set window (older listing, saved favorite) — one direct lookup,
    // ListingId is an allowed $filter field. Result is served under the page's ISR cache.
    return this.fetchById(id);
  }

  /** Current SIGNED media URL for /api/media/[id]/[idx] (the proxy that hides token churn
   * from browsers + CDN). Never user-supplied — always resolved from our own feed data. */
  async getMediaUrl(id: string, idx: number): Promise<string | null> {
    await this.ensureSynced();
    if (!this.mediaByListing.has(id)) await this.fetchById(id); // populates the map
    return this.mediaByListing.get(id)?.[idx] ?? null;
  }

  async getFeatured(limit = 8): Promise<Listing[]> {
    await this.ensureSynced();
    const inner = new FixtureIdxClient(this.cache);
    // Own-office listings first (marked isFeatured during sync), topped up with the freshest.
    const own = await inner.getFeatured(limit);
    if (own.length >= limit) return own;
    return [...own, ...(await inner.getNew(limit - own.length))];
  }

  async getNew(limit = 8): Promise<Listing[]> {
    await this.ensureSynced();
    // Newest actives, excluding whatever getFeatured (default limit) surfaces,
    // so the home page's two rails stay distinct.
    const featuredIds = new Set((await this.getFeatured()).map((l) => l.id));
    const fresh = await new FixtureIdxClient(this.cache).getNew(limit + featuredIds.size);
    return fresh.filter((l) => !featuredIds.has(l.id)).slice(0, limit);
  }

  /** Bounded slice of a full-inventory replication pass, for the sync cron
   * (app/api/cron/sync-mls). MLS Grid's documented replication model: responses are
   * ordered by ModificationTimestamp (ascending, the default — no $orderby sent), paged
   * via @odata.nextLink within a run, and resumed across runs with
   * `ModificationTimestamp gt <watermark>`. Scans up to maxPages sequential pages
   * (PAGE_GAP_MS apart — strictly < 2 req/sec) or until `deadline`, keeps the six-county
   * rows WITH their original signed media URLs (so the cron can copy photos into Blob),
   * and reports the new watermark + whether the feed window is exhausted (pass complete). */
  async replicateDeep(opts: { watermark: string; maxPages: number; deadline: number }): Promise<{
    listings: Listing[];
    watermark: string;
    complete: boolean;
    scanned: number;
    pages: number;
  }> {
    const kept: Listing[] = [];
    let watermark = opts.watermark;
    let scanned = 0;
    let pages = 0;
    let complete = false;
    let nextLink: string | null = null;

    for (let page = 0; page < opts.maxPages; page++) {
      if (page > 0) {
        if (Date.now() >= opts.deadline) break;
        await new Promise((r) => setTimeout(r, PAGE_GAP_MS));
      }
      const result: { rows: ResoProperty[]; nextLink: string | null } = nextLink
        ? await this.fetchNextLink(nextLink)
        : await this.fetchRows(() => this.buildDeepQuery(watermark));
      pages++;
      scanned += result.rows.length;
      for (const p of result.rows) {
        const ts = p.ModificationTimestamp;
        if (ts && Date.parse(ts) > Date.parse(watermark)) watermark = ts;
        const mapped = mapProperty(p);
        if (mapped) kept.push(mapped); // photos stay as SIGNED source URLs on purpose
      }
      if (!result.nextLink) {
        complete = true;
        break;
      }
      nextLink = result.nextLink;
    }
    return { listings: kept, watermark, complete, scanned, pages };
  }

  private buildDeepQuery(watermark: string): string {
    // OData datetime literals are unquoted (docs: `ModificationTimestamp gt 2020-12-12T…Z`).
    const filter = `${this.buildFilter()} and ModificationTimestamp gt ${watermark}`;
    return [
      `$filter=${encodeURIComponent(filter)}`,
      `$select=${[...this.select].join(",")}`,
      "$expand=Media",
      `$top=${PAGE_SIZE}`,
    ].join("&");
  }

  /** Newest-modified six-county rows WITH live signed media URLs — the sync cron's
   * PRIORITY photo set (the default /search sort and the home rails surface these rows
   * first, so their photos should fill before the long tail). Uses the one allowed
   * $orderby (ModificationTimestamp desc) + $skip paging. Gaps BEFORE every request —
   * including the first — because the cron calls this right after replicateDeep's last
   * request and the account must stay strictly under 2 req/sec across that seam. */
  async replicateNewest(opts: { maxPages: number; deadline: number }): Promise<Listing[]> {
    const kept: Listing[] = [];
    for (let page = 0; page < opts.maxPages; page++) {
      if (Date.now() >= opts.deadline) break;
      await new Promise((r) => setTimeout(r, PAGE_GAP_MS));
      const rows = await this.fetchPage(page * PAGE_SIZE);
      for (const p of rows) {
        const mapped = mapProperty(p);
        if (mapped) kept.push(mapped); // photos stay as SIGNED source URLs on purpose
      }
      if (rows.length < PAGE_SIZE) break; // feed window exhausted
    }
    return kept;
  }

  /** Serve fresh cache; stale cache revalidates in the background; only the very first
   * request (empty cache) waits — and falls back to fixture data instead of crashing. */
  private async ensureSynced(): Promise<void> {
    if (this.cache.length && Date.now() - this.cachedAt < SYNC_TTL_MS) return;
    const inflight = (this.syncing ??= this.sync().finally(() => (this.syncing = null)));
    if (this.cache.length) {
      inflight.catch((e) => {
        console.error("[mls-grid] background refresh failed — serving previous data:", e);
        this.cachedAt = Date.now() - SYNC_TTL_MS + RETRY_MS; // don't re-attempt for a minute
      });
      return;
    }
    try {
      await inflight;
    } catch (e) {
      console.error("[mls-grid] sync failed — serving fixture sample data until retry:", e);
      this.cache = [...FIXTURE_LISTINGS];
      this.cachedAt = Date.now() - SYNC_TTL_MS + RETRY_MS;
    }
  }

  /** Replicate a bounded working set (newest-modified actives) into memory. */
  private async sync(): Promise<void> {
    const started = Date.now();
    const kept: Listing[] = [];
    const dropped = { county: 0, type: 0, invalid: 0 };
    const countyTally: Record<string, number> = {};
    const mediaHosts = new Set<string>();
    let scanned = 0;
    let pages = 0;

    for (let page = 0; page < MAX_PAGES && kept.length < TARGET_KEPT; page++) {
      if (page > 0) await new Promise((r) => setTimeout(r, PAGE_GAP_MS));
      const rows = await this.fetchPage(page * PAGE_SIZE);
      pages++;
      scanned += rows.length;
      for (const p of rows) {
        const mapped = mapProperty(p);
        if (mapped) {
          kept.push(this.proxyPhotos(mapped));
          countyTally[mapped.county] = (countyTally[mapped.county] ?? 0) + 1;
        } else if (!isServedCounty(p.CountyOrParish)) dropped.county++;
        else if (!isServedType(p.PropertyType)) dropped.type++;
        else dropped.invalid++;
      }
      for (const urls of this.mediaByListing.values())
        if (urls[0]) mediaHosts.add(new URL(urls[0]).host);
      if (rows.length < PAGE_SIZE) break; // feed window exhausted
    }

    // Prune media entries for listings that left the working set (getMediaUrl re-fetches
    // on demand for saved/older ids) so a long-lived instance doesn't grow unboundedly.
    const keptIds = new Set(kept.map((l) => l.id));
    for (const id of this.mediaByListing.keys()) if (!keptIds.has(id)) this.mediaByListing.delete(id);

    this.cache = kept;
    this.cachedAt = Date.now();
    console.log(
      `[mls-grid] sync: ${pages} page(s), scanned ${scanned}, kept ${kept.length} ` +
        `(dropped county:${dropped.county} type:${dropped.type} invalid:${dropped.invalid}) ` +
        `counties ${JSON.stringify(countyTally)} mediaHosts ${JSON.stringify([...mediaHosts])} ` +
        `in ${((Date.now() - started) / 1000).toFixed(1)}s`,
    );
  }

  private async fetchPage(skip: number): Promise<ResoProperty[]> {
    const query = () =>
      [
        `$filter=${encodeURIComponent(this.buildFilter())}`,
        `$select=${[...this.select].join(",")}`,
        "$expand=Media",
        `$orderby=${encodeURIComponent("ModificationTimestamp desc")}`,
        `$top=${PAGE_SIZE}`,
        `$skip=${skip}`,
      ].join("&");
    return (await this.fetchRows(query)).rows;
  }

  /** GET /Property with a self-built query. Retry loop self-heals per-subscription 400s:
   * rejected $select fields are dropped one by one (the API names them), and the
   * PropertyType `in` clause is dropped if the error targets the $filter — the query is
   * rebuilt via `buildQuery` after each heal. Everything else throws. */
  private async fetchRows(
    buildQuery: () => string,
  ): Promise<{ rows: ResoProperty[]; nextLink: string | null }> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const res = await this.request(`${this.endpoint.replace(/\/$/, "")}/Property?${buildQuery()}`);
      if (res.ok) return this.parseRows(res);
      const body = await res.text();
      if (res.status === 400) {
        const badField = /The field '(\w+)'/.exec(body)?.[1];
        if (badField && body.includes("$select") && this.select.has(badField)) {
          this.select.delete(badField);
          console.warn(`[mls-grid] feed rejects $select field '${badField}' — dropped`);
          continue;
        }
        if (this.typeFilterSupported && /\$filter|PropertyType/i.test(body)) {
          this.typeFilterSupported = false;
          console.warn("[mls-grid] feed rejects the PropertyType filter — retrying without it");
          continue;
        }
      }
      throw new Error(`MLS Grid ${res.status}: ${body.slice(0, 300)}`);
    }
    throw new Error("MLS Grid: request kept failing after removing rejected fields");
  }

  /** Follow an @odata.nextLink verbatim (it embeds the whole query) — one shot, no heal. */
  private async fetchNextLink(url: string): Promise<{ rows: ResoProperty[]; nextLink: string | null }> {
    const res = await this.request(url);
    if (!res.ok) throw new Error(`MLS Grid ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return this.parseRows(res);
  }

  private async parseRows(res: Response): Promise<{ rows: ResoProperty[]; nextLink: string | null }> {
    const data = (await res.json()) as { value?: ResoProperty[]; "@odata.nextLink"?: string };
    const rows = data.value ?? [];
    if (!this.loggedKeys && rows[0]) {
      this.loggedKeys = true;
      console.log(`[mls-grid] row fields: ${Object.keys(rows[0]).filter((k) => k !== "Media").join(",")}`);
    }
    return { rows, nextLink: data["@odata.nextLink"] ?? null };
  }

  /** Single-listing lookup for ids outside the cached window (allowed: ListingId filter). */
  private async fetchById(id: string): Promise<Listing | null> {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return null; // also keeps the $filter uninjectable
    const filter = `OriginatingSystemName eq '${this.feedId}' and MlgCanView eq true and ListingId eq '${id}'`;
    const query = `$filter=${encodeURIComponent(filter)}&$select=${[...this.select].join(",")}&$expand=Media`;
    try {
      const res = await this.request(`${this.endpoint.replace(/\/$/, "")}/Property?${query}`);
      if (!res.ok) throw new Error(`MLS Grid ${res.status}`);
      const data = (await res.json()) as { value?: ResoProperty[] };
      const mapped = data.value?.[0] ? mapProperty(data.value[0]) : null;
      return mapped && this.proxyPhotos(mapped);
    } catch (e) {
      console.error(`[mls-grid] getListing(${id}) lookup failed:`, e);
      return null;
    }
  }

  /** Stash the signed URLs and hand the UI stable same-origin proxy paths — browsers and
   * the image optimizer only ever see /api/media/…, which the Vercel CDN caches, so the
   * ~1h token expiry and media.mlsgrid.com's per-IP rate limits never reach visitors. */
  private proxyPhotos(l: Listing): Listing {
    this.mediaByListing.set(l.id, l.photos);
    return { ...l, photos: l.photos.map((_, i) => `/api/media/${l.id}/${i}`) };
  }

  private buildFilter(): string {
    const parts = [
      `OriginatingSystemName eq '${this.feedId}'`,
      "MlgCanView eq true",
      "StandardStatus eq 'Active'",
    ];
    if (this.typeFilterSupported) {
      parts.push("PropertyType in ('Residential','Residential Income')");
    }
    return parts.join(" and ");
  }

  private request(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        "Accept-Encoding": "gzip", // mandatory — MLS Grid 400s without it
      },
      // No explicit cache option: Next 15's default leaves the response uncached WITHOUT
      // forcing dynamic rendering (an explicit "no-store" throws DynamicServerError inside
      // ISR prerenders). Our module-level cache + ISR own the caching story.
      signal: AbortSignal.timeout(30_000),
    });
  }
}

function isServedCounty(raw: string | undefined): boolean {
  return COUNTY_SLUGS.has(normalizeCounty(raw));
}

function isServedType(t: string | undefined): boolean {
  return t === "Residential" || t === "Residential Income";
}

/** "Westchester County" / "DUTCHESS" / " putnam " → slug form. */
function normalizeCounty(raw: string | undefined): string {
  return (raw ?? "").trim().toLowerCase().replace(/\s+county$/, "");
}

/** Deterministic per-listing offset in [-1, 1] (FNV-1a) — spreads same-zip pins so the
 * zip-centroid fallback doesn't stack every listing on one point. */
function jitter(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

/** Feed coords when present; else zip centroid + ~1km jitter (map says "approximate"). */
function coordsOf(p: ResoProperty, id: string): { lat: number; lng: number } {
  if (p.Latitude != null && p.Longitude != null) return { lat: p.Latitude, lng: p.Longitude };
  const c = (ZIP_CENTROIDS as Record<string, number[]>)[p.PostalCode ?? ""];
  if (!c) return { lat: 0, lng: 0 }; // MapView drops un-located rows
  return { lat: c[0] + jitter(id, 1) * 0.008, lng: c[1] + jitter(id, 2) * 0.011 };
}

/** Map a RESO property to our Listing; drop rows we can't display compliantly. */
export function mapProperty(p: ResoProperty): Listing | null {
  if (p.MlgCanView === false) return null;
  // Only the two types the site presents — Land/Commercial/Lease are dropped, not mislabeled.
  if (!isServedType(p.PropertyType)) return null;
  const county = normalizeCounty(p.CountyOrParish);
  const id = p.ListingId ?? p.ListingKey;
  if (!COUNTY_SLUGS.has(county) || !id || p.ListPrice == null) return null;

  // BathroomsTotalInteger counts halves as whole rooms; show halves as .5.
  const half = p.BathroomsHalf ?? 0;
  const totalBaths = p.BathroomsTotalInteger ?? 0;
  const baths = totalBaths > half ? totalBaths - half + half * 0.5 : totalBaths;

  const photos = (p.Media ?? [])
    .filter((m) => !!m.MediaURL && (!m.MediaCategory || m.MediaCategory === "Photo"))
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    .slice(0, MAX_PHOTOS)
    .map((m) => m.MediaURL as string);

  const features = [
    p.PropertySubType,
    p.YearBuilt ? `Built ${p.YearBuilt}` : undefined,
    p.LotSizeAcres ? `${p.LotSizeAcres} acre${p.LotSizeAcres === 1 ? "" : "s"}` : undefined,
    p.ListAgentFullName ? `Listed by ${p.ListAgentFullName}` : undefined,
  ].filter((f): f is string => !!f);

  const modified = p.ModificationTimestamp ?? new Date(0).toISOString();

  return {
    id,
    price: p.ListPrice,
    address: [p.StreetNumber, p.StreetName, p.StreetSuffix].filter(Boolean).join(" "),
    city: p.City ?? "",
    state: p.StateOrProvince ?? "NY",
    zip: p.PostalCode ?? "",
    county: county as CountySlug,
    beds: p.BedroomsTotal ?? 0,
    baths,
    sqft: p.LivingArea ?? 0,
    propertyType: p.PropertyType === "Residential Income" ? "Multi-Family" : "Residential",
    status:
      p.StandardStatus === "Pending" ? "Pending"
      : p.StandardStatus === "Coming Soon" ? "Coming Soon"
      : "Active",
    description: p.PublicRemarks ?? "",
    features,
    photos,
    ...coordsOf(p, id),
    listOfficeName: p.ListOfficeName ?? "",
    originatingSystem: "OneKey MLS",
    modificationTimestamp: modified,
    // Feed has no OnMarketDate; derive from DaysOnMarket so "New Listings" sorts honestly.
    listedAt:
      p.DaysOnMarket != null
        ? new Date(Date.now() - p.DaysOnMarket * 86_400_000).toISOString()
        : modified,
    // The owner's own inventory headlines the Featured rail. OneKey abbreviates the
    // office to "United RE Hudson Valley Edge", so match the abbreviated form too —
    // but not "United Realty …" / "KW … United" (verified vs the snapshot's 609 offices).
    isFeatured: /united re(al estate)?\b/i.test(p.ListOfficeName ?? ""),
  };
}
