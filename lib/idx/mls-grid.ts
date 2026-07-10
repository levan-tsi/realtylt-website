/** MlsGridClient — real OneKey MLS feed via the MLS Grid API v2 (skeleton; feed-dependent
 * behavior is PENDING owner keys — see CHECKPOINT.md).
 *
 * MLS Grid hard constraints honored here (mls-grid-api-constraints):
 * - REPLICATION-style access: OData `$filter` is limited to allowed fields
 *   (ModificationTimestamp, OriginatingSystemName, MlgCanView, StandardStatus, MlsStatus,
 *   PropertyType). Consumer-facing filters (price/beds/county/text) are NOT filterable
 *   server-side — we replicate into memory and filter locally.
 * - Follow `@odata.nextLink` for paging; respect rate limits (sequential fetch, no fan-out).
 * - Required attribution is rendered by the UI (MlsAttribution component) from
 *   `modificationTimestamp` + `listOfficeName` carried on every mapped listing.
 */

import { COUNTIES, type CountySlug } from "@/lib/site";
import { FixtureIdxClient } from "./fixture";
import type { IdxClient, Listing, SearchParams, SearchResult } from "./types";

/** RESO Web API property payload (subset we map). */
interface ResoProperty {
  ListingId?: string;
  ListingKey?: string;
  ListPrice?: number;
  UnparsedAddress?: string;
  StreetNumber?: string;
  StreetName?: string;
  City?: string;
  StateOrProvince?: string;
  PostalCode?: string;
  CountyOrParish?: string;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  BathroomsFull?: number;
  BathroomsHalf?: number;
  LivingArea?: number;
  PropertyType?: string;
  StandardStatus?: string;
  PublicRemarks?: string;
  Latitude?: number;
  Longitude?: number;
  ListOfficeName?: string;
  OriginatingSystemName?: string;
  ModificationTimestamp?: string;
  OnMarketDate?: string;
  MlgCanView?: boolean;
  Media?: { MediaURL?: string; Order?: number }[];
  InteriorFeatures?: string[];
  ExteriorFeatures?: string[];
}

/** Lowercased CountyOrParish values we serve — derived from the site's county list. */
const COUNTY_SLUGS = new Set<string>(COUNTIES.map((c) => c.slug));

const SYNC_TTL_MS = 15 * 60 * 1000; // refresh replicated cache every 15 min

export class MlsGridClient implements IdxClient {
  private cache: Listing[] = [];
  private cachedAt = 0;
  private syncing: Promise<void> | null = null;

  constructor(
    private readonly endpoint = process.env.MLS_API_ENDPOINT ?? "",
    private readonly apiKey = process.env.MLS_API_KEY ?? "",
    private readonly feedId = process.env.MLS_FEED_ID ?? "",
  ) {}

  async search(params: SearchParams): Promise<SearchResult> {
    await this.ensureSynced();
    return new FixtureIdxClient(this.cache).search(params);
  }

  async getListing(id: string): Promise<Listing | null> {
    await this.ensureSynced();
    return new FixtureIdxClient(this.cache).getListing(id);
  }

  async getFeatured(limit?: number): Promise<Listing[]> {
    await this.ensureSynced();
    // No "featured" concept in the feed — surface the freshest actives.
    return new FixtureIdxClient(this.cache).getNew(limit);
  }

  async getNew(limit = 8): Promise<Listing[]> {
    await this.ensureSynced();
    // Newest by listedAt, excluding whatever getFeatured (default limit) surfaces,
    // so the home page's two rails stay distinct.
    const featuredIds = new Set((await this.getFeatured()).map((l) => l.id));
    const fresh = await new FixtureIdxClient(this.cache).getNew(limit + featuredIds.size);
    return fresh.filter((l) => !featuredIds.has(l.id)).slice(0, limit);
  }

  /** Replicate the feed into memory (allowed-field $filter only), then filter locally. */
  private async ensureSynced(): Promise<void> {
    if (Date.now() - this.cachedAt < SYNC_TTL_MS && this.cache.length) return;
    this.syncing ??= this.sync().finally(() => (this.syncing = null));
    await this.syncing;
  }

  private async sync(): Promise<void> {
    // PENDING owner keys: exercised end-to-end once MLS_API_KEY/MLS_API_ENDPOINT are supplied.
    const filter = [
      `OriginatingSystemName eq '${this.feedId || "onekey2"}'`,
      "MlgCanView eq true",
      "StandardStatus eq 'Active'",
    ].join(" and ");
    let url: string | null =
      `${this.endpoint.replace(/\/$/, "")}/Property?$filter=${encodeURIComponent(filter)}&$expand=Media&$top=1000`;

    const collected: Listing[] = [];
    while (url) {
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`MLS Grid responded ${res.status}`);
      const data = (await res.json()) as { value?: ResoProperty[]; "@odata.nextLink"?: string };
      for (const p of data.value ?? []) {
        const mapped = mapProperty(p);
        if (mapped) collected.push(mapped);
      }
      url = data["@odata.nextLink"] ?? null;
    }

    this.cache = collected;
    this.cachedAt = Date.now();
  }
}

/** Map a RESO property to our Listing; drop rows we can't display compliantly. */
export function mapProperty(p: ResoProperty): Listing | null {
  if (p.MlgCanView === false) return null;
  // Only the two types we present — Land/Commercial/Lease etc. are dropped, not
  // mislabeled "Residential". PropertyType is not in MLS Grid's allowed $filter
  // fields, so this stays a local filter (sync $filter untouched).
  if (p.PropertyType !== "Residential" && p.PropertyType !== "Residential Income") return null;
  const rawCounty = (p.CountyOrParish ?? "").trim().toLowerCase();
  const county = COUNTY_SLUGS.has(rawCounty) ? (rawCounty as CountySlug) : undefined;
  const id = p.ListingId ?? p.ListingKey;
  if (!county || !id || p.ListPrice == null) return null;

  const baths = p.BathroomsFull != null
    ? p.BathroomsFull + (p.BathroomsHalf ?? 0) * 0.5
    : (p.BathroomsTotalInteger ?? 0);

  return {
    id,
    price: p.ListPrice,
    address: p.UnparsedAddress ?? [p.StreetNumber, p.StreetName].filter(Boolean).join(" "),
    city: p.City ?? "",
    state: p.StateOrProvince ?? "NY",
    zip: p.PostalCode ?? "",
    county,
    beds: p.BedroomsTotal ?? 0,
    baths,
    sqft: p.LivingArea ?? 0,
    propertyType: p.PropertyType === "Residential Income" ? "Multi-Family" : "Residential",
    status: p.StandardStatus === "Pending" ? "Pending" : p.StandardStatus === "Coming Soon" ? "Coming Soon" : "Active",
    description: p.PublicRemarks ?? "",
    features: [...(p.InteriorFeatures ?? []), ...(p.ExteriorFeatures ?? [])].slice(0, 8),
    photos: (p.Media ?? [])
      .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
      .map((m) => m.MediaURL)
      .filter((u): u is string => !!u),
    lat: p.Latitude ?? 0,
    lng: p.Longitude ?? 0,
    listOfficeName: p.ListOfficeName ?? "",
    originatingSystem: p.OriginatingSystemName ?? "OneKey MLS",
    modificationTimestamp: p.ModificationTimestamp ?? new Date(0).toISOString(),
    listedAt: p.OnMarketDate ?? p.ModificationTimestamp ?? new Date(0).toISOString(),
  };
}
