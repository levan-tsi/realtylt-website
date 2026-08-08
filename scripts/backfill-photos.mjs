// RESUMABLE photo backfill: mirror the full Active inventory's photos into Supabase Storage.
//
// WHY (docs/mls-fix/PHOTO-MIRRORING.md): MLS Grid MediaURLs are SIGNED and expire ~1h after they
// are fetched, so the DB's stored URLs are dead. Photos must be downloaded WHILE FRESH and copied
// to the mls-photos bucket, which the /api/media route then serves permanently. The hourly sync
// mirrors the delta going forward; this script does the one-time bulk pass for the existing rows.
//
// Each slice: (1) pull a FRESH feed page from the DEPLOYED /api/cron/sync-mls endpoint (it owns all
// MLS Grid DATA pacing, strictly < 2 req/sec, key stays server-side) to get live signed URLs;
// (2) download each photo from media.mlsgrid.com (paced, small concurrency, 429 backoff) with the
// OAuth token as User-Agent; (3) upload the bytes to mls-photos/<id>/<idx>.jpg (service role);
// (4) record photosMirrored on the row via the secret-gated idx_sync_apply RPC. Resumable via a
// watermark file; interrupt any time and re-run.
//
// GATED: needs SUPABASE_SERVICE_ROLE_KEY (storage writes) + MLS_API_KEY (media download) + a Pro
// plan for the ~40GB of storage (free tier is 1GB). Do NOT run the FULL pass without the owner.
//
// Usage:
//   node scripts/backfill-photos.mjs [--dry-run] [--covers-only] [--cap N] [--max-pages N]
//                                    [--max-listings N] [--concurrency N] [--fresh] [base-url]
// --covers-only mirrors photo #0 only; --cap N mirrors the first N photos per listing
// (default MAX_PHOTOS=50). --covers-only wins if both are passed.
// Defaults are the SAFE VERIFY SLICE (2 feed pages, 50 listings). The full run passes large bounds
// explicitly, e.g. --max-pages 999 --max-listings 999999 (owner-gated).

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const EPOCH = "1970-01-01T00:00:00Z";
const MAX_PHOTOS = 50;

// ── args ──────────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const DRY = flag("--dry-run");
// Separate resume files so a dry run can never make a later LIVE run skip un-mirrored listings.
const RESUME_FILE = DRY ? "scripts/.photo-backfill-watermark.dry.local" : "scripts/.photo-backfill-watermark.local";
const CAP = flag("--covers-only") ? 1 : Math.max(1, Math.min(MAX_PHOTOS, Number(opt("--cap", MAX_PHOTOS)) || MAX_PHOTOS));
const MAX_PAGES = Number(opt("--max-pages", "2"));
const MAX_LISTINGS = Number(opt("--max-listings", "50"));
const CONCURRENCY = Math.max(1, Math.min(6, Number(opt("--concurrency", "4"))));
/** Requests per second against media.mlsgrid.com. Concurrency alone does not bound a rate: four
 * workers with no pacing fire as fast as the host answers, which measured well into double
 * figures per second. MLS Grid has suspended this key before for exactly that, and a suspension
 * freezes the whole inventory, so the default is deliberately timid. Raise it knowingly. */
const RPS = Math.max(0.25, Number(opt("--rps", "2")) || 2);
/** Stop the whole run once the host has said "slow down" this many times. Backing off per
 * request is not enough: the previous behaviour was to keep going, burn 4,017 rejected requests
 * in one slice, and report a number that looked like progress. */
const MAX_429 = Math.max(1, Number(opt("--max-429", "25")) || 25);
if (flag("--fresh")) rmSync(RESUME_FILE, { force: true });
const positional = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1]?.startsWith("--") !== true);
const base = (positional.find((a) => a.startsWith("http")) ?? "https://realtylt-website.vercel.app").replace(/\/+$/, "");

// ── env (never printed) ─────────────────────────────────────────────────────────────────────────
const env = readFileSync(".env.local", "utf8");
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const SECRET = grab("CRON_SECRET");
const SB_URL = grab("SUPABASE_URL").replace(/\/+$/, "");
const SB_ANON = grab("SUPABASE_ANON_KEY");
const SB_SERVICE = grab("SUPABASE_SERVICE_ROLE_KEY");
const MLS_TOKEN = grab("MLS_API_KEY");
if (!SECRET || !SB_URL || !SB_ANON) throw new Error("CRON_SECRET / SUPABASE_URL / SUPABASE_ANON_KEY missing — npx vercel env pull .env.local");
if (!DRY && !SB_SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing — required to upload to storage (or pass --dry-run)");
if (!DRY && !MLS_TOKEN) throw new Error("MLS_API_KEY missing — required as the media-download User-Agent (or pass --dry-run)");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const iso = (s) => { const t = Date.parse(s); return Number.isNaN(t) ? s : new Date(t).toISOString(); };

// ── storage upload (Storage REST API, service role) ─────────────────────────────────────────────
async function uploadPhoto(path, bytes, contentType) {
  // Cloudflare closes keep-alive sockets after ~125MB; a reused dead socket throws
  // UND_ERR_SOCKET mid-run — retry with backoff instead of crashing the whole chunk.
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${SB_URL}/storage/v1/object/mls-photos/${path}`, {
        method: "POST",
        // Cache-Control matches lib/idx/storage.ts. Without it Supabase stores "no-cache" and every
        // view of that photo re-transfers it from origin — the bucket is 114 GiB, so the omission
        // was pure egress money. The objects this script already wrote are repaired by the
        // metadata sweep in docs/parity/PHOTO-BACKFILL-STATUS.md.
        headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}`, "Content-Type": contentType, "x-upsert": "true", "Cache-Control": "public, max-age=31536000" },
        body: bytes,
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok || res.status === 409) return true;
      if (res.status === 429) { await sleep(Math.min(8000, 500 * 2 ** attempt)); continue; }
      return false;
    } catch {
      await sleep(500 * 2 ** attempt);
    }
  }
  return false;
}

/** Why a download failed, counted. The slice line reports `fetched` vs `downloaded`, and a gap
 * between them is the documented ABORT criterion — but it never said WHY, so the one signal the
 * operator is told to stop on carried no diagnosis. A 429 gap means we are being throttled and
 * the whole feed is at risk (that is what froze the inventory for seven days in round 16); a
 * 403/400 gap on a long slice is far more likely to be MLS Grid's signed media URLs expiring
 * mid-slice, which is a pacing problem and not a rate-limit one. Those two need opposite
 * responses, so the histogram is printed with every slice. */
const dlStatus = new Map();
const bump = (k) => dlStatus.set(k, (dlStatus.get(k) ?? 0) + 1);
export const downloadReport = () =>
  [...dlStatus.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(" ");

/** One shared gate in front of every media request, so CONCURRENCY controls how many downloads
 * are in flight and RPS controls how fast they start. Serialising the *starts* is what actually
 * bounds the rate; the workers still overlap the transfers. */
let nextSlot = 0;
async function pace() {
  const gap = 1000 / RPS;
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + gap;
  if (at > now) await sleep(at - now);
}

let seen429 = 0;
/** Thrown out of the worker pool to end the run — see MAX_429. */
class RateLimited extends Error {}

/** ONE request per URL, never a retry. MLS Grid's migrated media host issues SINGLE-USE signed
 * URLs (docs read raw in round 24c): the first request consumes the signature, so a retry of the
 * SAME url cannot succeed — it only burns rate-limit budget against a host that has already
 * suspended this key six times. A failure is therefore a SKIP, not an error: the contiguous-prefix
 * rule truncates that listing's mirrored count and the next slice re-fetches a FRESH url for it.
 * That is why the caller's `if (!dl) continue` is the whole recovery path. */
async function downloadPhoto(url) {
  await pace();
  try {
    const r = await fetch(url, { headers: { "User-Agent": MLS_TOKEN }, signal: AbortSignal.timeout(20000) });
    if (r.ok) { bump("ok"); return { bytes: Buffer.from(await r.arrayBuffer()), contentType: r.headers.get("content-type") ?? "image/jpeg" }; }
    bump(String(r.status));
    if (r.status === 429) {
      if (++seen429 >= MAX_429) {
        throw new RateLimited(`media.mlsgrid.com returned 429 ${seen429} times — stopping before the key is suspended`);
      }
      // Being told to slow down means the current rate is wrong, not that this request was
      // unlucky — so every FUTURE start is pushed back, escalating with the count of 429s seen.
      nextSlot = Math.max(nextSlot, Date.now() + Math.min(30000, 2000 * 2 ** Math.min(seen429 - 1, 4)));
    }
    return null;
  } catch (e) {
    if (e instanceof RateLimited) throw e;
    bump(e?.name === "TimeoutError" ? "timeout" : "neterr");
    return null;
  }
}

// Prior mirror state (contiguous count + the modificationTimestamp it was built for), anon-read
// straight from the publicly-readable idx_listings (same projection as lib/idx/db.ts getMirrorState).
// Chunked so the id=in.() URL stays short; unmirrored/missing ids simply do not appear in the map.
async function fetchMirrorState(ids) {
  const out = new Map();
  if (!SB_URL || !SB_ANON || !ids.length) return out;
  const CHUNK = 150;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK).map((id) => encodeURIComponent(id));
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/idx_listings?id=in.(${chunk.join(",")})&select=id,mirrored:listing->photosMirrored,ts:listing->photosMirroredTs`,
        { headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` } },
      );
      if (!res.ok) continue;
      for (const r of await res.json()) {
        out.set(r.id, { mirrored: typeof r.mirrored === "number" ? r.mirrored : 0, ts: typeof r.ts === "string" ? r.ts : undefined });
      }
    } catch { /* a lookup miss only costs a re-mirror from 0 — never wrong, just slower */ }
  }
  return out;
}

// Covers-first queue across a slice's listings, then mirror with a small worker pool.
// Skips each listing's already-mirrored contiguous prefix when its photo list is unchanged (the
// stored photosMirroredTs still matches the live modificationTimestamp) — otherwise re-mirrors from
// 0. Same change-detection lib/idx/photo-mirror.ts planRange() uses for the hourly sync; the stored
// ts is normalized through iso() so the match holds regardless of which writer last stamped the row.
async function mirrorSlice(listings) {
  const prior = await fetchMirrorState(listings.map((l) => l.id));
  const ranges = listings.map((l) => {
    const photos = l.photos ?? [];
    const end = Math.min(photos.length, CAP);
    const p = prior.get(l.id);
    const start = p && p.ts && iso(p.ts) === l.modificationTimestamp ? Math.min(p.mirrored, end) : 0;
    return { id: l.id, start, end, photos };
  });
  const maxEnd = ranges.reduce((m, r) => Math.max(m, r.end), 0);
  const queue = [];
  for (let d = 0; d < maxEnd; d++) for (const r of ranges) if (d >= r.start && d < r.end) queue.push({ id: r.id, idx: d, url: r.photos[d] });
  const ok = new Set();
  let cursor = 0;
  let downloaded = 0;
  const worker = async () => {
    for (;;) {
      const i = cursor++;
      if (i >= queue.length) return;
      const it = queue[i];
      if (DRY) { ok.add(`${it.id}:${it.idx}`); continue; }
      const dl = await downloadPhoto(it.url);
      if (!dl) continue;
      downloaded++;
      if (await uploadPhoto(`${it.id}/${it.idx}.jpg`, dl.bytes, dl.contentType)) ok.add(`${it.id}:${it.idx}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  // Contiguous prefix per listing — starts at the skipped prefix (already confirmed in storage).
  const outcomes = ranges.map((r) => {
    let n = r.start;
    while (n < r.end && ok.has(`${r.id}:${n}`)) n++;
    return { id: r.id, photosMirrored: n };
  });
  const skipped = ranges.reduce((s, r) => s + r.start, 0);
  return { outcomes, fetched: queue.length, skipped, downloaded };
}

/** Apply a chunk of upserts.
 *
 * This backfill is not the only writer on idx_listings — the hourly pg_cron sync is writing the
 * same rows at the same time, and round 20 lost a whole slice to the collision:
 *
 *   idx_sync_apply 500: {"code":"40P01","details":"Process A waits for ShareLock on
 *   transaction X; blocked by process B. Process B waits for ShareLock on ... blocked by A."}
 *
 * A deadlock is not a bug to report, it is Postgres picking a victim so the other transaction
 * can finish — and the documented response is to retry the victim. Throwing instead killed the
 * run after an hour of paced downloading (the watermark saved the earlier slices, but the slice
 * in flight was discarded). So: retry 40P01 and serialisation failures with backoff and a little
 * jitter, so the retry does not land on the sync's next write in lockstep. Anything else still
 * throws, because anything else is a real failure.
 */
const RETRYABLE_PG = /40P01|40001|deadlock detected|could not serialize/i;

async function rpc(body) {
  for (let attempt = 0; attempt <= 4; attempt++) {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/idx_sync_apply`, {
      method: "POST",
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`, "Content-Type": "application/json" },
      body: JSON.stringify({ _secret: SECRET, ...body }),
    });
    if (res.ok) return res.json();
    const text = (await res.text()).slice(0, 200);
    if (attempt < 4 && RETRYABLE_PG.test(text)) {
      const wait = Math.round(1000 * 2 ** attempt + Math.random() * 750);
      console.log(`  idx_sync_apply deadlocked with the hourly sync — retrying in ${wait}ms (attempt ${attempt + 1}/4)`);
      await sleep(wait);
      continue;
    }
    throw new Error(`idx_sync_apply ${res.status}: ${text}`);
  }
  throw new Error("idx_sync_apply: unreachable");
}

// ── main loop ─────────────────────────────────────────────────────────────────────────────────
let watermark = existsSync(RESUME_FILE) ? readFileSync(RESUME_FILE, "utf8").trim() : EPOCH;
if (watermark !== EPOCH) console.log(`resuming from ${watermark} (${RESUME_FILE})`);
console.log(`backfill-photos: ${DRY ? "DRY-RUN" : "LIVE"} cap=${CAP} maxPages=${MAX_PAGES} maxListings=${MAX_LISTINGS} concurrency=${CONCURRENCY} rps=${RPS} max429=${MAX_429} base=${base}`);

let pagesUsed = 0;
let listingsSeen = 0;
let photosMirrored = 0;

for (;;) {
  if (pagesUsed >= MAX_PAGES || listingsSeen >= MAX_LISTINGS) { console.log(`bound reached (pages ${pagesUsed}/${MAX_PAGES}, listings ${listingsSeen}/${MAX_LISTINGS}) — stopping.`); break; }
  const url = `${base}/api/cron/sync-mls?watermark=${encodeURIComponent(watermark)}&maxPages=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SECRET}` } });
  if (!res.ok) throw new Error(`sync-mls ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const slice = await res.json();
  pagesUsed += slice.pages ?? 1;

  let listings = (slice.listings ?? []).map((l) => ({ ...l, listedAt: iso(l.listedAt), modificationTimestamp: iso(l.modificationTimestamp) }));
  if (listingsSeen + listings.length > MAX_LISTINGS) listings = listings.slice(0, MAX_LISTINGS - listingsSeen);
  listingsSeen += listings.length;

  const { outcomes, fetched, skipped, downloaded } = await mirrorSlice(listings);
  const byId = new Map(outcomes.map((o) => [o.id, o]));
  for (const l of listings) {
    const o = byId.get(l.id);
    l.photosMirrored = o?.photosMirrored ?? 0;
    l.photosMirroredTs = l.modificationTimestamp;
    photosMirrored += l.photosMirrored;
  }

  if (!DRY) {
    for (let i = 0; i < listings.length; i += 50) await rpc({ _upserts: listings.slice(i, i + 50) });
  }

  console.log(`slice: kept ${slice.kept}, took ${listings.length}, mirrored ${listings.reduce((s, l) => s + l.photosMirrored, 0)} photos (skipped ${skipped} already-mirrored, fetched ${fetched}, downloaded ${downloaded}), watermark ${slice.watermark}${slice.complete ? " — FEED COMPLETE" : ""}`);
  // The diagnosis behind the abort criterion (see downloadPhoto).
  if (fetched > downloaded) console.log(`  download failures by status: ${downloadReport()}`);

  if (slice.complete) { console.log("feed complete — full inventory scanned."); rmSync(RESUME_FILE, { force: true }); break; }
  if (slice.watermark === watermark) throw new Error("watermark did not advance — aborting");
  watermark = slice.watermark;
  writeFileSync(RESUME_FILE, watermark); // persisted in dry mode too (own file) so resume is testable
  await sleep(1500); // gentle between endpoint calls
}

console.log(`\nDONE (${DRY ? "dry-run" : "live"}) — ${listingsSeen} listings, ${photosMirrored} photos mirrored, ${pagesUsed} feed pages.`);
