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
 *      image; stops cleanly on 429 and resumes next run). A small newest-modified head
 *      refetch (replicateNewest) front-loads the plan with the listings users actually
 *      see first: Featured/own-office rows, then the default-sort first pages.
 *   3. publishes mls/listings.json with durable Blob photo URLs for the site to read.
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`; manual triggers must
 * send the same header. Optional query params: ?force=1 (skip freshness guard),
 * ?photoBudget=N (override the per-run photo budget — use small values when probing).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEFAULT_PHOTO_BUDGET = 1000; // per-run cap; the media CDN's own per-window budget is the real limit (stop-on-429)
const PHOTO_CONCURRENCY = 3; // parallel downloaders — media.mlsgrid.com only, NEVER api.mlsgrid.com
const PHOTO_GAP_MS = 150; // per-worker pacing → ~4-5 req/s aggregate against the media CDN
const TIME_BUDGET_MS = 240_000; // leave headroom under maxDuration for the final put
const DATA_TIME_BUDGET_MS = 130_000; // data pass stops here so photos still get a window
const DATA_MAX_PAGES = 25; // ≤25 sequential feed requests per run (~12.5k rows scanned)
const PRIORITY_PAGES = 2; // newest-modified head refetch (~1k rows) — the priority photo set
// Hobby Blob stores hard-cap at 1GB and an over-quota store fails EVERY put (even the
// attempt claim — full pipeline outage). Photos are sharp-compressed on ingest
// (~960px/q68 ≈ 100KB vs ~500KB source) and downloads stop at this soft cap so the
// store can never cross the plan limit again. Remaining headroom goes to gallery depth.
const STORE_BYTE_CAP = 920_000_000;
const PHOTO_MAX_WIDTH = 960;
const PHOTO_JPEG_QUALITY = 68;
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
    2000,
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
  try {
    await put(SYNC_STATE_PATHNAME, JSON.stringify({ attemptAt: new Date().toISOString() }), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
  } catch (e) {
    // Typically "Storage quota exceeded" — nothing this run could publish would stick.
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sync-mls] cannot write attempt claim — aborting cleanly:", msg);
    return NextResponse.json({ error: `Blob write failed: ${msg}` }, { status: 507 });
  }

  // 1. Resume (or start) the rolling full-inventory pass and advance it a bounded slice.
  //    On failure the previous snapshot and pass state stay in place untouched.
  const pass: PassState =
    parsePassState(await readJsonBlob(PASS_STATE_PATHNAME).catch(() => null)) ?? newPassState();
  const mls = new MlsGridClient();
  let deep;
  try {
    deep = await mls.replicateDeep({
      watermark: pass.watermark,
      maxPages: DATA_MAX_PAGES,
      deadline: started + DATA_TIME_BUDGET_MS,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sync-mls] replication failed — previous snapshot kept:", msg);
    return NextResponse.json({ error: `MLS replication failed: ${msg}` }, { status: 502 });
  }

  // 1b. PRIORITY photo set — the rows users actually see first. The rolling pass walks
  //     the feed oldest-modified → newest, so the newest rows (default /search sort,
  //     home rails) would otherwise be photographed LAST. Refetch the head fresh (live
  //     signed URLs) and put it at the FRONT of the photo plan: Featured (own-office)
  //     rows first, then newest-listed. Best-effort — photos must still flow without it.
  let priority: Awaited<ReturnType<MlsGridClient["replicateNewest"]>> = [];
  try {
    priority = await mls.replicateNewest({
      maxPages: PRIORITY_PAGES,
      deadline: started + DATA_TIME_BUDGET_MS + 15_000,
    });
    priority.sort(
      (a, b) =>
        Number(!!b.isFeatured) - Number(!!a.isFeatured) ||
        Date.parse(b.listedAt) - Date.parse(a.listedAt),
    );
  } catch (e) {
    console.error("[sync-mls] priority head fetch failed — continuing with the pass slice:", e);
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

  // 2. Ground truth of already-cached photos (list is paginated) + current store usage
  //    for the byte-cap guard.
  const cachedUrls = new Map<string, string>();
  let storeBytes = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PHOTO_PREFIX, cursor, limit: 1000 });
    for (const b of page.blobs) {
      cachedUrls.set(b.pathname, b.url);
      storeBytes += b.size;
    }
    cursor = page.cursor;
  } while (cursor);

  // 3. Incremental photo top-up — priority head first, then THIS run's freshly scanned
  //    slice newest-first (only fresh rows carry live signed URLs; rows from earlier
  //    runs re-enter the plan when the rolling pass re-scans them). mergeListings
  //    dedupes by id with the priority rows keeping their front position, and
  //    planPhotoFetches keeps photo-0-first across the whole ordered set.
  const photoSource = mergeListings(
    priority,
    [...deep.listings].sort(
      (a, b) => Date.parse(b.modificationTimestamp) - Date.parse(a.modificationTimestamp),
    ),
  );
  const plan = planPhotoFetches(photoSource, new Set(cachedUrls.keys()), photoBudget);
  // Compress on ingest (Hobby Blob = 1GB hard cap; ~500KB source → ~100KB stored keeps
  // full photo-0 coverage well under it). Fallback to original bytes if sharp is missing.
  let compress: ((buf: ArrayBuffer) => Promise<Buffer>) | null = null;
  try {
    const sharp = (await import("sharp")).default;
    compress = (buf) =>
      sharp(Buffer.from(buf), { failOn: "none" })
        .rotate()
        .resize({ width: PHOTO_MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: PHOTO_JPEG_QUALITY, mozjpeg: true, progressive: true })
        .toBuffer();
  } catch {
    console.warn("[sync-mls] sharp unavailable — storing original photo bytes");
  }
  let uploaded = 0;
  let failed = 0;
  let budgetExhausted = false;
  let storeFull = storeBytes >= STORE_BYTE_CAP;
  let planCursor = 0;
  // Small paced worker pool against the media CDN (its limit is a per-window request
  // BUDGET, not the data API's 2 req/s). First 429 stops ALL workers — resume next run.
  const downloadWorker = async () => {
    while (!budgetExhausted && !storeFull && Date.now() - started < TIME_BUDGET_MS) {
      const next = plan[planCursor++]; // single-threaded event loop — no race
      if (!next) return;
      try {
        const res = await fetch(next.url, { signal: AbortSignal.timeout(15_000) });
        if (res.status === 429) {
          budgetExhausted = true; // media budget window exhausted — resume next run
          return;
        }
        if (!res.ok) {
          failed++;
        } else {
          const raw = await res.arrayBuffer();
          let body: ArrayBuffer | Buffer = raw;
          let contentType = res.headers.get("content-type") ?? "image/jpeg";
          if (compress) {
            try {
              body = await compress(raw);
              contentType = "image/jpeg";
            } catch {
              /* keep original bytes — a stored photo beats a skipped one */
            }
          }
          const blob = await put(next.pathname, body, {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType,
            cacheControlMaxAge: 31_536_000, // photos are immutable at their pathname
          });
          cachedUrls.set(next.pathname, blob.url);
          uploaded++;
          storeBytes += body.byteLength;
          if (storeBytes >= STORE_BYTE_CAP) storeFull = true; // never cross the plan limit
        }
      } catch (e) {
        failed++;
        console.error(`[sync-mls] photo ${next.pathname}:`, e instanceof Error ? e.message : e);
      }
      await new Promise((r) => setTimeout(r, PHOTO_GAP_MS));
    }
  };
  await Promise.all(Array.from({ length: PHOTO_CONCURRENCY }, downloadWorker));

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
    priorityListings: priority.length,
    budgetExhausted,
    storeFull,
    storeMB: Math.round(storeBytes / 1e6),
    ms: Date.now() - started,
  };
  console.log("[sync-mls]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
