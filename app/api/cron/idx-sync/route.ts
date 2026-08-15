import { NextResponse } from "next/server";
import { applyGeocodes, applyIdxSync, getMirrorState, getSyncWatermark, listPendingGeocodes } from "@/lib/idx/db";
import { censusCsvRow, parseCensusBatch, withoutUnit, type GeocodeRow } from "@/lib/idx/geocode";
import { geocodePending } from "@/lib/idx/geocode-runner";
import { runInRefreshContext } from "@/lib/idx/mls-fetch";
import { MlsGridClient } from "@/lib/idx/mls-grid";
import { mirrorPhotos, preservedMarker, type MirrorDeps } from "@/lib/idx/photo-mirror";
import { cleanupOffMarketPhotos, withoutMirrorMarker, type CleanupDeps } from "@/lib/idx/photo-cleanup";
import { PHOTO_BUCKET, storageWriteConfig, uploadPhoto, type StorageWriteConfig } from "@/lib/idx/storage";

/** Hourly INCREMENTAL MLS sync into Supabase idx_listings (secret-gated).
 *
 * Triggered by a Supabase pg_cron job (see supabase/idx-sync-schedule.sql / the
 * idx_sync_schedule RPC) — the Vercel Hobby plan only allows daily vercel.json crons.
 * The trigger fire-and-forgets with a short client timeout; that is fine: the function
 * keeps running to completion server-side, and the run's outcome lands in
 * idx_sync_state.last_run either way.
 *
 * Each run asks MLS Grid for everything modified after the stored watermark —
 * DELIBERATELY UNFILTERED by status/MlgCanView (that is how delistings are seen; see
 * MlsGridClient.replicateDelta). Still-showable rows upsert; everything else modified
 * (status flip, MlgCanView false, type change) deactivates, which drops it from every
 * surface at once (RLS serves active rows only — the MLS Grid compliance requirement).
 * The watermark advances ONLY after all writes land, so a failed run just re-processes.
 *
 * Bounds: ≤ MAX_PAGES feed pages per run, sequential with PAGE_GAP_MS gaps — strictly
 * under the 2 req/sec per-account cap. A burst bigger than one run's budget resumes at
 * the next hourly tick via the watermark (responses report complete:false). A typical
 * hourly delta is 1-2 pages. This is the ONLY scheduled MLS Grid caller; page views make
 * ZERO DATA-API calls (the mls-fetch guard).
 *
 * Photos (docs/mls-fix/PHOTO-MIRRORING.md): each changed listing's signed MediaURLs are mirrored
 * to Supabase Storage during this run, while the URLs are still valid (they expire ~1h from now).
 * Bounded by MIRROR_PHOTO_BUDGET + a wall clock. Mirroring is BEST EFFORT and never blocks the
 * watermark (see the note at the write below — holding it froze the feed for seven days); photos
 * still owed are reported as `mirrorDebt` and picked up by change detection or
 * scripts/backfill-photos.mjs. No-op (data unaffected) until SUPABASE_SERVICE_ROLE_KEY is
 * configured server-side.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`. Params: ?maxPages=N (manual runs).
 * Skips (200) until the baseline pull has marked idx_sync_state.baseline_complete.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_PAGES = 8; // ~4k feed rows per run — plenty for an hourly delta
const PAGE_GAP_MS = 1100; // stay strictly under MLS Grid's 2 req/sec per-account cap
const TIME_BUDGET_MS = 240_000; // headroom under maxDuration for the DB writes
const UPSERT_BATCH = 200; // ~2-4KB per listing → well under PostgREST body comfort
const REMOVE_BATCH = 500;

// Photo mirroring bounds (docs/mls-fix/PHOTO-MIRRORING.md). A delta is small, so a normal run
// mirrors everything; these cap a rare burst so one invocation stays inside maxDuration. When a
// run cannot finish mirroring, the watermark does NOT advance, so the next tick re-fetches the
// same window (fresh signed URLs) and continues from each listing's already-mirrored prefix.
const MIRROR_PHOTO_CAP = Math.max(1, Math.min(50, Number(process.env.MIRROR_PHOTO_CAP) || 50));
// Raised from 600. The run is bounded by MIRROR_WALL_MS anyway, and 600 was well under what the
// wall clock affords (~400ms a photo at concurrency 4 fills roughly 2,700 in 270s), so the old
// number just left the budget unspent while galleries stayed shallow.
//
// STORAGE IS NOT A REASON TO CAP THIS, and an earlier version of this comment said it was —
// measured 2026-08-02: the plan includes 250GB at $0.03/GB after, the bucket holds ~120GB, and
// the ceiling if EVERY listing reaches full depth is ~194GB, because finished listings average
// 24.9 photos rather than the 50 cap. Overage at the ceiling is $0.00. Capping would only make
// galleries shallower. If anyone ever does lower MIRROR_PHOTO_CAP, read planRange first: a
// shorter cap makes it report a SHORTER prefix, which strips photos off listings that currently
// show them unless the objects above the cap are deleted too.
const MIRROR_PHOTO_BUDGET = Math.max(1, Number(process.env.MIRROR_PHOTO_BUDGET) || 1200);
const MIRROR_CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.MIRROR_CONCURRENCY) || 4));
const MIRROR_WALL_MS = 270_000; // mirror + DB writes must finish under maxDuration (300s)

// GEOCODING BOUNDS. A typical hour brings well under a hundred new listings, and the Census
// batch endpoint answers 1,000 addresses in about 7 seconds, so 300 is generous headroom that
// still cannot run away with the invocation after a long outage. The wall is what actually
// protects maxDuration; the count just keeps one payload small.
const GEOCODE_BUDGET = Math.max(0, Number(process.env.GEOCODE_BUDGET) || 300);
const GEOCODE_WALL_MS = 25_000;

/** The U.S. Census Bureau's batch geocoder: free, keyless, no account, and NOT MLS Grid — this
 * adds no load to the feed's rate limits. Unit numbers get one retry on the building. */
async function censusGeocode(rows: readonly GeocodeRow[], wallMs: number, streetOnly = false):
  Promise<{ hits: ReturnType<typeof parseCensusBatch>["hits"]; misses: GeocodeRow[] }> {
  const fd = new FormData();
  const lines = rows.map((r) => censusCsvRow(r, streetOnly ? withoutUnit(r.address) : r.address));
  fd.append("addressFile", new Blob([lines.join("\n") + "\n"], { type: "text/csv" }), "a.csv");
  fd.append("benchmark", "Public_AR_Current");
  const res = await fetch("https://geocoding.geo.census.gov/geocoder/locations/addressbatch", {
    method: "POST",
    body: fd,
    signal: AbortSignal.timeout(wallMs),
  });
  if (!res.ok) throw new Error(`census ${res.status}`);
  const { hits, misses } = parseCensusBatch(await res.text(), rows);
  if (!streetOnly && misses.length) {
    const retryable = misses.filter((r) => withoutUnit(r.address) && withoutUnit(r.address) !== r.address);
    if (retryable.length) {
      const second = await censusGeocode(retryable, wallMs, true).catch(() => ({ hits: [], misses: retryable }));
      const placed = new Set(second.hits.map((h) => h.id));
      return { hits: [...hits, ...second.hits], misses: misses.filter((m) => !placed.has(m.id)) };
    }
  }
  return { hits, misses };
}

/** Supabase-backed deps for the off-market photo cleanup. Service-role only, server-side only.
 * Every call is scoped to ONE listing's own prefix — there is no path here that can address the
 * bucket as a whole. */
function cleanupDeps(cfg: StorageWriteConfig, restBase: string): CleanupDeps {
  const h = { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" };
  return {
    async findStale(limit) {
      // is_active=false is the database's own verdict that this home is off the market, and
      // photos_servable is computed FROM storage.objects, so >0 means the files really exist.
      const r = await fetch(
        `${restBase}/idx_listings?is_active=eq.false&photos_servable=gt.0&select=id,photos_servable&order=updated_at.asc&limit=${limit}`,
        { headers: h, signal: AbortSignal.timeout(15_000) },
      );
      if (!r.ok) return [];
      return ((await r.json()) as Array<{ id: string; photos_servable: number }>).map((x) => ({
        id: x.id,
        servable: x.photos_servable,
      }));
    },
    async listObjects(id) {
      const r = await fetch(`${cfg.base}/object/list/${PHOTO_BUCKET}`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ prefix: id, limit: 100, offset: 0 }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!r.ok) throw new Error(`list ${id}: ${r.status}`);
      return ((await r.json()) as Array<{ name: string }>).map((o) => `${id}/${o.name}`);
    },
    async deleteObjects(keys) {
      if (!keys.length) return 0;
      const r = await fetch(`${cfg.base}/object/${PHOTO_BUCKET}`, {
        method: "DELETE",
        headers: h,
        body: JSON.stringify({ prefixes: keys }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!r.ok) throw new Error(`delete: ${r.status} ${(await r.text()).slice(0, 120)}`);
      return keys.length;
    },
    async clearMarker(id) {
      // Read-modify-write the JSONB: PostgREST cannot drop a key in place, and the marker is
      // what decides whether a returning listing downloads anything at all.
      const g = await fetch(`${restBase}/idx_listings?id=eq.${encodeURIComponent(id)}&select=listing`, {
        headers: h,
        signal: AbortSignal.timeout(15_000),
      });
      if (!g.ok) return false;
      const [row] = (await g.json()) as Array<{ listing: Record<string, unknown> }>;
      if (!row?.listing) return false;
      const p = await fetch(`${restBase}/idx_listings?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { ...h, Prefer: "return=minimal" },
        body: JSON.stringify({ listing: withoutMirrorMarker(row.listing) }),
        signal: AbortSignal.timeout(15_000),
      });
      return p.ok;
    },
  };
}

/** Real download (media host, token as User-Agent) + upload (Supabase Storage, service role). */
function mirrorDeps(cfg: StorageWriteConfig): MirrorDeps {
  return {
    async download(url) {
      try {
        // media.mlsgrid.com has a separate budget from the DATA API and does NOT go through the
        // mls-fetch guard. MLS Grid requires the OAuth token as User-Agent to download media.
        const r = await fetch(url, {
          headers: { "User-Agent": process.env.MLS_API_KEY ?? "" },
          signal: AbortSignal.timeout(20_000),
        });
        if (!r.ok) return { ok: false, status: r.status };
        const bytes = new Uint8Array(await r.arrayBuffer());
        return { ok: true, status: 200, bytes, contentType: r.headers.get("content-type") ?? "image/jpeg" };
      } catch {
        return { ok: false, status: 0 };
      }
    },
    upload: (path, bytes, ct) => uploadPhoto(cfg, path, bytes, ct),
  };
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.MLS_API_KEY || !process.env.MLS_API_ENDPOINT) {
    return NextResponse.json({ error: "No MLS credentials configured" }, { status: 503 });
  }

  const started = Date.now();
  const q = new URL(req.url).searchParams;
  const maxPages = Math.min(20, Math.max(1, Number(q.get("maxPages")) || MAX_PAGES));

  try {
    const { watermark, baselineComplete } = await getSyncWatermark();
    if (!baselineComplete) {
      // Nothing to increment from yet — the baseline pull (scripts/baseline-to-db.mjs)
      // must land first. 200 so the scheduler does not alarm.
      return NextResponse.json({ ok: true, skipped: "baseline not complete", watermark });
    }

    const mls = new MlsGridClient();
    // runInRefreshContext authorizes the DATA-API calls (mlsGridDataFetch throws on any
    // request-path call in production — the suspension guard, lib/idx/mls-fetch.ts).
    const delta = await runInRefreshContext(() =>
      mls.replicateDelta({ watermark, maxPages, deadline: started + TIME_BUDGET_MS }),
    );

    if (!delta.upserts.length && !delta.removeIds.length && delta.watermark === watermark) {
      return NextResponse.json({ ok: true, quiet: true, scanned: delta.scanned, watermark });
    }

    // PHOTO MIRRORING — download each changed listing's photos and upload the bytes to Supabase
    // Storage WHILE THE SIGNED URLS ARE FRESH (they expire ~1h from now). Disabled as a safe
    // no-op when SUPABASE_SERVICE_ROLE_KEY is absent: `mirrorFully` stays true so the watermark
    // advances normally and the data sync is unaffected.
    let mirrorFully = true;
    let mirroredPhotos = 0;
    const cfg = storageWriteConfig();
    // Prior mirror markers for every upserted id — needed in BOTH paths. The idx_sync_apply RPC
    // upserts with `set listing = excluded.listing` (a full JSONB REPLACE), so any upsert that
    // omits photosMirrored wipes the marker; we must carry it forward regardless of whether we can
    // mirror this run.
    const prior = delta.upserts.length
      ? await getMirrorState(delta.upserts.map((l) => l.id))
      : new Map<string, { mirrored: number; ts?: string; count?: number }>();
    if (cfg && delta.upserts.length) {
      const outcomes = await mirrorPhotos(
        delta.upserts.map((l) => ({
          id: l.id,
          photos: l.photos,
          modificationTimestamp: l.modificationTimestamp,
          priorMirrored: prior.get(l.id)?.mirrored,
          priorMirroredTs: prior.get(l.id)?.ts,
          priorPhotoCount: prior.get(l.id)?.count,
        })),
        mirrorDeps(cfg),
        {
          cap: MIRROR_PHOTO_CAP,
          photoBudget: MIRROR_PHOTO_BUDGET,
          timeBudgetMs: Math.max(0, started + MIRROR_WALL_MS - Date.now()),
          concurrency: MIRROR_CONCURRENCY,
          // A sustained 429 window used to eat the whole invocation proving the same point a few
          // hundred times, which starved the data writes that run after it. Give up quickly when
          // nothing is getting through; the debt is picked up next tick or by the backfill.
          failFastAfter: 24,
        },
      );
      const byId = new Map(outcomes.map((o) => [o.id, o]));
      for (const l of delta.upserts) {
        const o = byId.get(l.id);
        if (!o) continue;
        l.photosMirrored = o.photosMirrored;
        l.photosMirroredTs = o.photosMirroredTs;
        l.photosMirroredCount = o.photosMirroredCount;
        mirroredPhotos += o.uploaded;
        if (!o.fully) mirrorFully = false;
      }
    } else {
      // MIRRORING UNAVAILABLE (no SUPABASE_SERVICE_ROLE_KEY server-side). Do NOT regress existing
      // mirror markers to null: the storage objects a prior run mirrored are PERMANENT and outlive
      // the ~1h signed-URL expiry, so preserving the marker keeps those photos serving from storage
      // instead of blanking on the next view. See preservedMarker (photo-mirror.ts).
      for (const l of delta.upserts) {
        const kept = preservedMarker(l.photos.length, prior.get(l.id));
        if (!kept) continue;
        l.photosMirrored = kept.photosMirrored;
        if (kept.photosMirroredTs) l.photosMirroredTs = kept.photosMirroredTs;
      }
    }

    // Writes first, watermark LAST — a crash mid-run re-processes instead of skipping.
    let upserted = 0;
    let deactivated = 0;
    for (let i = 0; i < delta.upserts.length; i += UPSERT_BATCH) {
      const out = await applyIdxSync({ secret, upserts: delta.upserts.slice(i, i + UPSERT_BATCH) });
      upserted += out.upserted;
    }
    for (let i = 0; i < delta.removeIds.length; i += REMOVE_BATCH) {
      const out = await applyIdxSync({ secret, deactivateIds: delta.removeIds.slice(i, i + REMOVE_BATCH) });
      deactivated += out.deactivated;
    }
    // THE WATERMARK TRACKS DATA, NOT PHOTOS. It used to be held until every photo in the window
    // had mirrored, on the theory that the next tick would re-fetch fresh URLs and finish the job.
    // That theory fails closed in the worst way: if mirroring cannot succeed at all — the media
    // host rate-limiting, a payload Storage refuses — `fully` never goes true, the watermark never
    // moves, and the ENTIRE inventory freezes behind it while the cron re-scans the same window
    // every hour (which is itself what sustains the rate limiting). Measured 2026-08-01: the feed
    // had not advanced past 2026-07-25, seven days, with 15,628 rows waiting.
    //
    // Photo mirroring has its own durable resume state — `photosMirrored`/`photosMirroredTs` per
    // listing, honoured by planRange — so an unmirrored listing is recoverable later (change
    // detection re-mirrors it when it next changes; scripts/backfill-photos.mjs sweeps the rest).
    // Stale listing data is not recoverable at all: it is simply wrong until the watermark moves.
    // So data freshness wins, and unfinished mirroring is reported as debt instead of a stop.
    const mirrorDebt = delta.upserts.length - delta.upserts.filter((l) => (l.photosMirrored ?? 0) >= Math.min(l.photos.length, MIRROR_PHOTO_CAP)).length;
    await applyIdxSync({ secret, watermark: delta.watermark });

    // OFF-MARKET PHOTO CLEANUP (owner's ask: "when its off market delete pictures. if its back we
    // will download again. other way we will carry dead weight"). Nothing in this codebase had
    // ever deleted a photo, so the bucket only grew: 2,570 of its 28,251 listing folders belonged
    // to homes no longer on the market.
    //
    // Runs LAST, after the watermark is safely written, and inside its own try — this is the only
    // destructive path in the route and it must never be able to cost us a sync. Bounded per run.
    let cleanup = { listings: 0, objects: 0, markersCleared: 0, failed: 0 };
    const restBase = `${process.env.SUPABASE_URL?.trim().replace(/\/+$/, "")}/rest/v1`;
    if (cfg) {
      try {
        cleanup = await cleanupOffMarketPhotos(cleanupDeps(cfg, restBase));
      } catch (e) {
        console.error("[idx-sync] photo cleanup failed (data sync unaffected):", e);
      }
    }

    // GEOCODING for listings that arrived since the last tick. The feed serves no coordinates,
    // so a new home lands on its zip centroid; this gives it its own street address instead.
    // Runs LAST, after the watermark, inside its own try — same rule as the cleanup below: a
    // free geocoder having a bad minute must never be able to cost us a sync.
    let geocoded = { considered: 0, placed: 0, unplaced: 0, rejected: 0 };
    try {
      geocoded = await geocodePending(
        {
          listPending: (n) => listPendingGeocodes(n),
          geocode: (rows) => censusGeocode(rows, GEOCODE_WALL_MS),
          apply: (hits, misses) => applyGeocodes(secret, hits, misses),
        },
        GEOCODE_BUDGET,
      );
    } catch (e) {
      console.error("[idx-sync] geocoding failed (data sync unaffected):", e);
    }

    const summary = {
      ok: true,
      geocoded,
      scanned: delta.scanned,
      pages: delta.pages,
      upserted,
      removalsSeen: delta.removeIds.length, // ids never stored no-op at the DB
      deactivated,
      mirroredPhotos,
      mirrorFully, // false = some photos still owed; the watermark advances anyway (see above)
      mirrorDebt, // listings upserted this run whose photo prefix is still short
      cleanup, // off-market photos reclaimed this run
      watermark: delta.watermark,
      complete: delta.complete, // false = more feed pages pending; next tick resumes from the watermark
      ms: Date.now() - started,
    };
    console.log("[idx-sync]", JSON.stringify(summary));
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[idx-sync] failed:", msg);
    return NextResponse.json({ error: `Incremental sync failed: ${msg}` }, { status: 502 });
  }
}
