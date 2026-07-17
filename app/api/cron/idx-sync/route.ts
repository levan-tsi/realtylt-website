import { NextResponse } from "next/server";
import { applyIdxSync, getMirrorState, getSyncWatermark } from "@/lib/idx/db";
import { runInRefreshContext } from "@/lib/idx/mls-fetch";
import { MlsGridClient } from "@/lib/idx/mls-grid";
import { mirrorPhotos, type MirrorDeps } from "@/lib/idx/photo-mirror";
import { storageWriteConfig, uploadPhoto, type StorageWriteConfig } from "@/lib/idx/storage";

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
 * Bounded by MIRROR_PHOTO_BUDGET + a wall clock; a burst that cannot finish mirroring HOLDS the
 * watermark so the next tick re-fetches fresh URLs and completes. No-op (data unaffected) until
 * SUPABASE_SERVICE_ROLE_KEY is configured server-side.
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
const MIRROR_PHOTO_BUDGET = Math.max(1, Number(process.env.MIRROR_PHOTO_BUDGET) || 600);
const MIRROR_CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.MIRROR_CONCURRENCY) || 4));
const MIRROR_WALL_MS = 270_000; // mirror + DB writes must finish under maxDuration (300s)

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
    if (cfg && delta.upserts.length) {
      const prior = await getMirrorState(delta.upserts.map((l) => l.id));
      const outcomes = await mirrorPhotos(
        delta.upserts.map((l) => ({
          id: l.id,
          photos: l.photos,
          modificationTimestamp: l.modificationTimestamp,
          priorMirrored: prior.get(l.id)?.mirrored,
          priorMirroredTs: prior.get(l.id)?.ts,
        })),
        mirrorDeps(cfg),
        {
          cap: MIRROR_PHOTO_CAP,
          photoBudget: MIRROR_PHOTO_BUDGET,
          timeBudgetMs: Math.max(0, started + MIRROR_WALL_MS - Date.now()),
          concurrency: MIRROR_CONCURRENCY,
        },
      );
      const byId = new Map(outcomes.map((o) => [o.id, o]));
      for (const l of delta.upserts) {
        const o = byId.get(l.id);
        if (!o) continue;
        l.photosMirrored = o.photosMirrored;
        l.photosMirroredTs = o.photosMirroredTs;
        mirroredPhotos += o.uploaded;
        if (!o.fully) mirrorFully = false;
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
    // Do NOT pass a listing until its photos are mirrored: keep the watermark when a burst could
    // not finish mirroring, so the next tick re-fetches fresh URLs and completes the prefix.
    const nextWatermark = mirrorFully ? delta.watermark : watermark;
    await applyIdxSync({ secret, watermark: nextWatermark });

    const summary = {
      ok: true,
      scanned: delta.scanned,
      pages: delta.pages,
      upserted,
      removalsSeen: delta.removeIds.length, // ids never stored no-op at the DB
      deactivated,
      mirroredPhotos,
      mirrorFully, // false = burst bigger than the photo budget; watermark held for next tick
      watermark: nextWatermark,
      complete: delta.complete && mirrorFully, // false = next tick resumes (data and/or photos)
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
