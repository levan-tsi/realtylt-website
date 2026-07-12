/** ReplicatedIdxClient — serves listings from the COMMITTED snapshot bundled with the
 * deploy (data/mls-snapshot.json via lib/idx/snapshot).
 *
 * Vercel Blob is gone from the read path ON PURPOSE: the free-tier store got PAUSED
 * after the photo backfill blew the plan's operation limit, a paused store 403s every
 * read, and the live site regressed to fixture data. A file inside the bundle cannot
 * be paused or rate-limited — requests never touch Blob OR api.mlsgrid.com (the Round-2
 * lesson: request-path MLS calls burst past the per-account 2 req/sec cap and blocked
 * the whole account). Freshness = re-export + commit + deploy (scripts/
 * export-snapshot.mjs); a durable auto-refresh store is a pending owner decision.
 * Fixture data remains the LAST resort only if the committed snapshot is unusable
 * (surfaces the on-page sample notice via isSampleData). */

import { FixtureIdxClient } from "./fixture";
import { FIXTURE_LISTINGS } from "./fixture-data";
import { getCommittedSnapshot } from "./snapshot";
import type { IdxClient, Listing, SearchParams, SearchResult } from "./types";

export class ReplicatedIdxClient implements IdxClient {
  private readonly listings: Listing[];
  /** Replication timestamp — the compliant "Data last updated" for IDX surfaces. */
  private readonly syncedAt: string;
  private readonly fixtureFallback: boolean;

  constructor() {
    const snap = getCommittedSnapshot();
    if (snap) {
      this.listings = snap.listings;
      this.syncedAt = snap.syncedAt;
      this.fixtureFallback = false;
    } else {
      console.error("[idx-replicated] no usable committed snapshot — serving fixture sample data");
      this.listings = [...FIXTURE_LISTINGS];
      this.syncedAt = "";
      this.fixtureFallback = true; // surfaces the on-page "sample data" notice (isSampleData)
    }
  }

  async search(params: SearchParams): Promise<SearchResult> {
    const result = await this.inner().search(params);
    return this.syncedAt ? { ...result, dataLastUpdated: this.syncedAt } : result;
  }

  /** Snapshot lookup only — ids outside the committed working set 404 (the /saved page
   * already surfaces rotated-out favorites as "no longer available"). No direct MLS
   * fallback: the request path must never touch api.mlsgrid.com. */
  async getListing(id: string): Promise<Listing | null> {
    return this.inner().getListing(id);
  }

  async getFeatured(limit = 8): Promise<Listing[]> {
    const inner = this.inner();
    // Own-office listings first (isFeatured set at map time), topped up with the freshest.
    const own = await inner.getFeatured(limit);
    if (own.length >= limit) return own;
    return [...own, ...(await inner.getNew(limit - own.length))];
  }

  async getNew(limit = 8): Promise<Listing[]> {
    // Newest actives excluding whatever getFeatured surfaces — home rails stay distinct.
    const featuredIds = new Set((await this.getFeatured()).map((l) => l.id));
    const fresh = await this.inner().getNew(limit + featuredIds.size);
    return fresh.filter((l) => !featuredIds.has(l.id)).slice(0, limit);
  }

  private inner(): FixtureIdxClient {
    return new FixtureIdxClient(this.listings);
  }

  /** True when the committed snapshot was unusable and fixture data is being served. */
  get servingFixture(): boolean {
    return this.fixtureFallback;
  }
}
