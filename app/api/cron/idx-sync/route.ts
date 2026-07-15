import { NextResponse } from "next/server";
import { applyIdxSync, getSyncWatermark } from "@/lib/idx/db";
import { runInRefreshContext } from "@/lib/idx/mls-fetch";
import { MlsGridClient } from "@/lib/idx/mls-grid";

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
    await applyIdxSync({ secret, watermark: delta.watermark });

    const summary = {
      ok: true,
      scanned: delta.scanned,
      pages: delta.pages,
      upserted,
      removalsSeen: delta.removeIds.length, // ids never stored no-op at the DB
      deactivated,
      watermark: delta.watermark,
      complete: delta.complete, // false = burst bigger than this run; next tick resumes
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
