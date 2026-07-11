import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { MlsGridClient } from "@/lib/idx/mls-grid";
import {
  applyCachedPhotos,
  mergeListings,
  newPassState,
  parsePassState,
  parseSnapshot,
  PASS_STATE_PATHNAME,
  PHOTO_PREFIX,
  planPhotoFetches,
  SNAPSHOT_PATHNAME,
  SYNC_STATE_PATHNAME,
  type PassState,
} from "@/lib/idx/replication";

/** Scheduled MLS replication (Vercel Cron + stale-triggered self-calls; see vercel.json
 * and ReplicatedIdxClient.maybeTriggerSync). Each run:
 *   1. advances a rolling FULL-INVENTORY pass over the six-county Active feed (MLS Grid's
 *      documented replication model: ModificationTimestamp-ascending pages via
 *      @odata.nextLink, resumed across runs with `gt <watermark>` from mls/pass-state.json
 *      — the ONLY place api.mlsgrid.com is ever called, sequential + rate-gapped). Newly
 *      scanned listings merge into the live snapshot immediately; when a pass completes,
 *      its kept-set REPLACES the snapshot (drops listings that left Active) and the next
 *      run starts a new pass — so coverage deepens run over run and stays complete.
 *   2. incrementally copies listing photos into Vercel Blob, budget- and time-bounded
 *      (media.mlsgrid.com has a hard per-ACCOUNT request budget — never mass-fetch;
 *      photo 0 of every listing first, so partial coverage still gives every card an
 *      image; stops cleanly on 429 and resumes next run).
 *   3. publishes mls/listings.json with durable Blob photo URLs for the site to read.
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`; manual triggers must
 * send the same header. Optional query params: ?force=1 (skip freshness guard),
 * ?photoBudget=N (override the per-run photo budget — use small values when probing).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEFAULT_PHOTO_BUDGET = 150;
const PHOTO_GAP_MS = 250; // pace media CDN requests
const TIME_BUDGET_MS = 240_000; // leave headroom under maxDuration for the final put
const DATA_TIME_BUDGET_MS = 130_000; // data pass stops here so photos still get a window
const DATA_MAX_PAGES = 25; // ≤25 sequential feed requests per run (~12.5k rows scanned)
const MAX_SNAPSHOT_LISTINGS = 8000; // sanity cap — keep the newest-modified beyond this
const MIN_SYNC_GAP_MS = 5 * 60_000; // overlapping triggers must not double-hit MLS Grid
const ATTEMPT_GAP_MS = 10 * 60_000; // global gap between MLS attempts, success OR failure

async function readJsonBlob(prefix: string): Promise<unknown> {
  const res = await list({ prefix, limit: 1 });
  const url = res.blobs[0]?.url;
  if (!url) return null;
  const fetched = await fetch(`${url}?v=${Date.now()}`); // bust the Blob CDN
  if (!fetched.ok) return null;
  return fetched.json();
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "No Blob store configured" }, { status: 503 });
  }
  if (!process.env.MLS_API_KEY || !process.env.MLS_API_ENDPOINT) {
    return NextResponse.json({ error: "No MLS credentials configured" }, { status: 503 });
  }

  const started = Date.now();
  const q = new URL(req.url).searchParams;
  const photoBudget = Math.min(
    500,
    Math.max(0, Number(q.get("photoBudget") ?? process.env.MLS_PHOTO_BUDGET ?? DEFAULT_PHOTO_BUDGET) || 0),
  );

  const force = q.get("force") === "1"; // manual operator override — NEVER script in a loop
  // Guard 1 — snapshot freshness (cheap: blob metadata only).
  const existing = await list({ prefix: SNAPSHOT_PATHNAME, limit: 1 });
  const prevUploadedAt = existing.blobs[0]?.uploadedAt;
  if (!force && prevUploadedAt && Date.now() - +new Date(prevUploadedAt) < MIN_SYNC_GAP_MS) {
    return NextResponse.json({ skipped: "snapshot is fresh", uploadedAt: prevUploadedAt });
  }
  // Guard 2 — GLOBAL attempt claim, shared by every serverless instance via Blob. MLS Grid
  // blocks the whole ACCOUNT when concurrent syncs push past 2 req/sec (and touching the
  // API while blocked re-arms the block), so at most one attempt — success OR failure —
  // is allowed per ATTEMPT_GAP_MS cluster-wide. The claim is written BEFORE replicating.
  const claim = await list({ prefix: SYNC_STATE_PATHNAME, limit: 1 });
  const lastAttempt = claim.blobs[0]?.uploadedAt;
  if (!force && lastAttempt && Date.now() - +new Date(lastAttempt) < ATTEMPT_GAP_MS) {
    return NextResponse.json({ skipped: "a sync was attempted recently", lastAttempt }, { status: 202 });
  }
  await put(SYNC_STATE_PATHNAME, JSON.stringify({ attemptAt: new Date().toISOString() }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });

  // 1. Resume (or start) the rolling full-inventory pass and advance it a bounded slice.
  //    On failure the previous snapshot and pass state stay in place untouched.
  const pass: PassState =
    parsePassState(await readJsonBlob(PASS_STATE_PATHNAME).catch(() => null)) ?? newPassState();
  let deep;
  try {
    deep = await new MlsGridClient().replicateDeep({
      watermark: pass.watermark,
      maxPages: DATA_MAX_PAGES,
      deadline: started + DATA_TIME_BUDGET_MS,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sync-mls] replication failed — previous snapshot kept:", msg);
    return NextResponse.json({ error: `MLS replication failed: ${msg}` }, { status: 502 });
  }

  // Fold this run's slice into the pass (signed photo URLs expire in ~1h — never persist
  // them; durable photo URLs are re-derived from the Blob cache at publish time).
  pass.watermark = deep.watermark;
  pass.scanned += deep.scanned;
  pass.listings = mergeListings(
    pass.listings,
    deep.listings.map((l) => ({ ...l, photos: [] })),
  );

  // Snapshot base: a COMPLETED pass is the whole six-county Active inventory and replaces
  // the snapshot (dropping listings that left Active since the last pass). Mid-pass, new
  // finds merge into the previous snapshot so coverage only ever grows between passes.
  let baseListings = pass.listings;
  let nextPass = pass;
  if (deep.complete) {
    nextPass = {
      ...newPassState(),
      lastPass: {
        completedAt: new Date().toISOString(),
        feedActiveScanned: pass.scanned,
        kept: pass.listings.length,
      },
    };
  } else {
    const prev = parseSnapshot(await readJsonBlob(SNAPSHOT_PATHNAME).catch(() => null));
    baseListings = mergeListings(prev?.listings ?? [], pass.listings);
  }
  if (baseListings.length > MAX_SNAPSHOT_LISTINGS) {
    baseListings = [...baseListings]
      .sort((a, b) => Date.parse(b.modificationTimestamp) - Date.parse(a.modificationTimestamp))
      .slice(0, MAX_SNAPSHOT_LISTINGS);
  }

  // 2. Ground truth of already-cached photos (list is paginated).
  const cachedUrls = new Map<string, string>();
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PHOTO_PREFIX, cursor, limit: 1000 });
    for (const b of page.blobs) cachedUrls.set(b.pathname, b.url);
    cursor = page.cursor;
  } while (cursor);

  // 3. Incremental photo top-up — planned from THIS run's freshly scanned listings only
  //    (their signed media URLs are the live ones; rows from earlier runs re-enter the
  //    plan when the rolling pass re-scans them with fresh URLs).
  const plan = planPhotoFetches(deep.listings, new Set(cachedUrls.keys()), photoBudget);
  let uploaded = 0;
  let failed = 0;
  let budgetExhausted = false;
  for (const { pathname, url } of plan) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (res.status === 429) {
        budgetExhausted = true; // media budget window exhausted — resume next run
        break;
      }
      if (!res.ok) {
        failed++;
      } else {
        const blob = await put(pathname, await res.arrayBuffer(), {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: res.headers.get("content-type") ?? "image/jpeg",
          cacheControlMaxAge: 31_536_000, // photos are immutable at their pathname
        });
        cachedUrls.set(pathname, blob.url);
        uploaded++;
      }
    } catch (e) {
      failed++;
      console.error(`[sync-mls] photo ${pathname}:`, e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, PHOTO_GAP_MS));
  }

  // 4. Publish the snapshot — only durable Blob photo URLs ever reach the site —
  //    then persist the pass cursor so the next run resumes (or starts fresh).
  const listings = applyCachedPhotos(baseListings, cachedUrls);
  const syncedAt = new Date().toISOString();
  await put(SNAPSHOT_PATHNAME, JSON.stringify({ syncedAt, listings }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 300,
  });
  await put(PASS_STATE_PATHNAME, JSON.stringify(nextPass), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });

  const summary = {
    ok: true,
    syncedAt,
    listings: listings.length,
    withPhotos: listings.filter((l) => l.photos.length).length,
    pass: {
      complete: deep.complete,
      pagesThisRun: deep.pages,
      scannedThisRun: deep.scanned,
      keptThisRun: deep.listings.length,
      scannedThisPass: pass.scanned,
      keptThisPass: pass.listings.length,
      watermark: pass.watermark,
      startedAt: pass.startedAt,
    },
    lastCompletedPass: nextPass.lastPass ?? pass.lastPass ?? null,
    photosCachedTotal: cachedUrls.size,
    photosUploaded: uploaded,
    photosFailed: failed,
    photosPlanned: plan.length,
    budgetExhausted,
    ms: Date.now() - started,
  };
  console.log("[sync-mls]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
