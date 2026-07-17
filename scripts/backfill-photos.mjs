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
  const res = await fetch(`${SB_URL}/storage/v1/object/mls-photos/${path}`, {
    method: "POST",
    headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}`, "Content-Type": contentType, "x-upsert": "true" },
    body: bytes,
  });
  if (!res.ok && res.status !== 409) return false;
  return true;
}

async function downloadPhoto(url) {
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": MLS_TOKEN }, signal: AbortSignal.timeout(20000) });
      if (r.ok) return { bytes: Buffer.from(await r.arrayBuffer()), contentType: r.headers.get("content-type") ?? "image/jpeg" };
      if (r.status === 404 || r.status === 403) return null;
      if (r.status === 429) await sleep(Math.min(8000, 500 * 2 ** attempt));
    } catch {
      await sleep(500 * 2 ** attempt);
    }
  }
  return null;
}

// Covers-first queue across a slice's listings, then mirror with a small worker pool.
async function mirrorSlice(listings) {
  const ranges = listings.map((l) => ({ id: l.id, end: Math.min((l.photos ?? []).length, CAP), photos: l.photos ?? [] }));
  const maxEnd = ranges.reduce((m, r) => Math.max(m, r.end), 0);
  const queue = [];
  for (let d = 0; d < maxEnd; d++) for (const r of ranges) if (d < r.end) queue.push({ id: r.id, idx: d, url: r.photos[d] });
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
  // Contiguous prefix per listing.
  return ranges.map((r) => {
    let n = 0;
    while (n < r.end && ok.has(`${r.id}:${n}`)) n++;
    return { id: r.id, photosMirrored: n };
  });
}

async function rpc(body) {
  const res = await fetch(`${SB_URL}/rest/v1/rpc/idx_sync_apply`, {
    method: "POST",
    headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify({ _secret: SECRET, ...body }),
  });
  if (!res.ok) throw new Error(`idx_sync_apply ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// ── main loop ─────────────────────────────────────────────────────────────────────────────────
let watermark = existsSync(RESUME_FILE) ? readFileSync(RESUME_FILE, "utf8").trim() : EPOCH;
if (watermark !== EPOCH) console.log(`resuming from ${watermark} (${RESUME_FILE})`);
console.log(`backfill-photos: ${DRY ? "DRY-RUN" : "LIVE"} cap=${CAP} maxPages=${MAX_PAGES} maxListings=${MAX_LISTINGS} concurrency=${CONCURRENCY} base=${base}`);

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

  const outcomes = await mirrorSlice(listings);
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

  console.log(`slice: kept ${slice.kept}, took ${listings.length}, mirrored ${listings.reduce((s, l) => s + l.photosMirrored, 0)} photos, watermark ${slice.watermark}${slice.complete ? " — FEED COMPLETE" : ""}`);

  if (slice.complete) { console.log("feed complete — full inventory scanned."); rmSync(RESUME_FILE, { force: true }); break; }
  if (slice.watermark === watermark) throw new Error("watermark did not advance — aborting");
  watermark = slice.watermark;
  writeFileSync(RESUME_FILE, watermark); // persisted in dry mode too (own file) so resume is testable
  await sleep(1500); // gentle between endpoint calls
}

console.log(`\nDONE (${DRY ? "dry-run" : "live"}) — ${listingsSeen} listings, ${photosMirrored} photos mirrored, ${pagesUsed} feed pages.`);
