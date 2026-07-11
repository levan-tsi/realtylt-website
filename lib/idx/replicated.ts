/** ReplicatedIdxClient — serves listings from the Vercel Blob snapshot written by the
 * sync cron (app/api/cron/sync-mls). The request path NEVER calls MLS Grid: reads are a
 * single small Blob fetch (per instance, 60s TTL), so pages are fast and the per-account
 * MLS rate/media budgets cannot be exhausted by traffic. See lib/idx/replication.ts for
 * the snapshot contract and the Round-2 root cause this architecture fixes.
 *
 * Freshness: a Vercel Cron refreshes the snapshot daily; on top of that, any request that
 * observes a snapshot older than REFRESH_AFTER_MS fires ONE background self-call to the
 * cron route (secret-gated, per-instance cool-down, waitUntil) so the data stays fresh
 * intraday on any Vercel plan. Fixture data remains the last-resort fallback (with the
 * on-page sample notice suppressed only in true live mode) when no snapshot exists yet.
 */

import { waitUntil } from "@vercel/functions";
import { FixtureIdxClient } from "./fixture";
import { FIXTURE_LISTINGS } from "./fixture-data";
import { parseSnapshot, SNAPSHOT_PATHNAME } from "./replication";
import type { IdxClient, Listing, SearchParams, SearchResult } from "./types";

const TTL_MS = 60_000; // per-instance snapshot cache
const RETRY_MS = 30_000; // cool-down after a failed load
const REFRESH_AFTER_MS = 4 * 3_600_000; // self-trigger a sync beyond this snapshot age
const SELF_TRIGGER_COOLDOWN_MS = 10 * 60_000;

export class ReplicatedIdxClient implements IdxClient {
  private listings: Listing[] = [];
  /** Replication timestamp — the compliant "Data last updated" for IDX surfaces. */
  private syncedAt = "";
  private loadedAt = 0;
  private loading: Promise<void> | null = null;
  private snapshotUrl: string | null = null;
  private lastSelfTrigger = 0;

  async search(params: SearchParams): Promise<SearchResult> {
    await this.ensureLoaded();
    const result = await this.inner().search(params);
    return this.syncedAt ? { ...result, dataLastUpdated: this.syncedAt } : result;
  }

  /** Snapshot lookup only — ids outside the replicated working set 404 (the /saved page
   * already surfaces rotated-out favorites as "no longer available"). No direct MLS
   * fallback: the request path must never touch api.mlsgrid.com. */
  async getListing(id: string): Promise<Listing | null> {
    await this.ensureLoaded();
    return this.inner().getListing(id);
  }

  async getFeatured(limit = 8): Promise<Listing[]> {
    await this.ensureLoaded();
    const inner = this.inner();
    // Own-office listings first (isFeatured set at map time), topped up with the freshest.
    const own = await inner.getFeatured(limit);
    if (own.length >= limit) return own;
    return [...own, ...(await inner.getNew(limit - own.length))];
  }

  async getNew(limit = 8): Promise<Listing[]> {
    await this.ensureLoaded();
    // Newest actives excluding whatever getFeatured surfaces — home rails stay distinct.
    const featuredIds = new Set((await this.getFeatured()).map((l) => l.id));
    const fresh = await this.inner().getNew(limit + featuredIds.size);
    return fresh.filter((l) => !featuredIds.has(l.id)).slice(0, limit);
  }

  private inner(): FixtureIdxClient {
    return new FixtureIdxClient(this.listings);
  }

  private async ensureLoaded(): Promise<void> {
    if (this.listings.length && Date.now() - this.loadedAt < TTL_MS) return;
    const inflight = (this.loading ??= this.load().finally(() => (this.loading = null)));
    try {
      await inflight;
    } catch (e) {
      console.error("[idx-replicated] snapshot load failed:", e);
      this.loadedAt = Date.now() - TTL_MS + RETRY_MS; // don't re-attempt for a bit
      if (!this.listings.length) {
        console.error("[idx-replicated] no snapshot yet — serving fixture sample data");
        this.listings = [...FIXTURE_LISTINGS];
        this.syncedAt = "";
      }
    }
    this.maybeTriggerSync();
  }

  private async load(): Promise<void> {
    if (!this.snapshotUrl) {
      const { list } = await import("@vercel/blob");
      const res = await list({ prefix: SNAPSHOT_PATHNAME, limit: 1 });
      this.snapshotUrl = res.blobs[0]?.url ?? null;
    }
    if (!this.snapshotUrl) throw new Error(`no ${SNAPSHOT_PATHNAME} in the Blob store (cron not run yet?)`);
    // Minute-granular cache-buster: Blob serves through a CDN; a changing query string
    // guarantees we see a fresh snapshot within a minute of the cron writing it.
    const res = await fetch(`${this.snapshotUrl}?v=${Math.floor(Date.now() / 60_000)}`);
    if (!res.ok) throw new Error(`snapshot fetch ${res.status}`);
    const snap = parseSnapshot(await res.json());
    if (!snap) throw new Error("snapshot failed validation");
    this.listings = snap.listings;
    this.syncedAt = snap.syncedAt;
    this.loadedAt = Date.now();
  }

  /** Fire ONE background sync when the snapshot is stale — plan-agnostic freshness
   * (Hobby crons only run daily). Never blocks or fails the request. */
  private maybeTriggerSync(): void {
    const secret = process.env.CRON_SECRET;
    if (!secret) return;
    const age = this.syncedAt ? Date.now() - Date.parse(this.syncedAt) : Infinity;
    if (age < REFRESH_AFTER_MS) return;
    if (Date.now() - this.lastSelfTrigger < SELF_TRIGGER_COOLDOWN_MS) return;
    this.lastSelfTrigger = Date.now();
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    if (!base) return;
    console.log("[idx-replicated] snapshot stale — triggering background sync");
    waitUntil(
      fetch(`${base.replace(/\/+$/, "")}/api/cron/sync-mls`, {
        headers: { authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(290_000),
      })
        .then((r) => console.log(`[idx-replicated] background sync → ${r.status}`))
        .catch((e) => console.error("[idx-replicated] background sync failed:", e)),
    );
  }
}
