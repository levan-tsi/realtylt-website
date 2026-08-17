// SOLD-PHOTO MIRROR: give the CMA's closed comparables their photographs.
//
// WHY (owner, 2026-08-17): Brivity shows photos on sold comps and ours showed none. Measured the
// same day: ZERO of the 49,311 sales closed in the last twelve months held a single object in the
// mls-photos bucket — in ANY cohort, including sales closed last week. That was not a gap in the
// mirror, it was `cleanupOffMarketPhotos` doing its job: closing is how a sale leaves the market,
// so the cleanup deleted exactly the pictures the CMA needed. That policy is fixed separately
// (lib/idx/photo-cleanup.ts now exempts closed sales outright, so a sale keeps everything it
// already holds and nothing has to be fetched twice). THIS script is only for the historical tail:
// sales that closed before we ever mirrored them, which no policy change can recover.
//
// ── THE STORAGE KEY, AND WHY IT IS listing_key ────────────────────────────────────────────────
// Sold photos land at `mls-photos/<idx_sold.listing_key>/<i>.jpg` — NOT under `listing_id`, and
// NOT behind a `sold/` prefix. Four measurements decided it:
//
//  1. THE CMA ALREADY READS THAT EXACT PATH. `lib/data/sold-comps.ts` maps `listingKey:
//     row.listing_key`, `lib/cma/mls/sold-provider.ts` carries it through as `mlsNumber`, and the
//     report surfaces call `mirroredPhotoUrls(comp.mlsNumber, …)`, which builds
//     `mls-photos/<key>/<index>.jpg`. Writing anywhere else would need CRM code changes; writing
//     here needs none.
//  2. IT CANNOT COLLIDE. `idx_sold.listing_key` ∩ `idx_listings.id` = 0 across all 52,595 sold
//     rows, and ∩ the bucket's 27,644 existing folders = 0. The two identifiers are different
//     things — `listing_key` is the MLS ListingKey (KEY424858527), `listing_id` the ListingId
//     (KEY998053) — so a sold write can never overwrite a live listing's cover. Writing under
//     `listing_id` WOULD collide: 1,968 sold rows share one with an `idx_listings` row.
//  3. A `sold/` PREFIX IS UNSERVABLE. Both readers guard the key with
//     /^[A-Za-z0-9_-]{1,40}$/ — the CRM's `isMirroredKey` and this site's /api/media route. A
//     slash fails both, so a prefixed object could not be fetched by either without new code.
//  4. IT MATCHES THE FEED. MLS Grid's own media paths are /images/<ListingKey>/<file>.jpeg, so
//     the folder name and the source path segment agree.
//
// ── WHY THIS TALKS TO THE DATA API DIRECTLY ───────────────────────────────────────────────────
// scripts/backfill-photos.mjs routes its DATA reads through the deployed /api/cron/sync-mls, which
// walks the ACTIVE feed by watermark and therefore cannot see a closed listing at all. The other
// deployed reader, /api/cron/mls-probe?ids=…&media=1, DOES return closed rows with healthy media
// (verified 2026-08-17, two closed listings, /images/KEY…/ paths) but hard-codes `Media.slice(0,3)`
// — three photographs, where the owner asked for five. Raising that needs a deploy this round is
// not permitted to make. So the DATA read happens here, and the rule it exists to protect is kept
// exactly: the ban is on MLS calls from a PAGE OR REQUEST PATH (CLAUDE.md), and this is a manual
// CLI runner, the same place media.mlsgrid.com downloads have always come from. It is also
// STRICTLY safer on pacing — DATA and media requests share ONE pacer here, so the account's 2 RPS
// ceiling is enforced across both, where splitting them across two writers stacks two independent
// rates against one cap.
//
// ── COMPLIANCE (docs/vendor/mlsgrid/, Best Practices Guide) ───────────────────────────────────
// 2 RPS · 7,200 req/hr · 4 GB/hr · 40,000 req per ROLLING 24h · 60 GB/24h, all shared with the
// hourly sync. Every run needs an explicit --max-downloads. MediaURLs are single-use and expire
// ~1h: ONE request per URL, and ANY failure is a SKIP — never a retry of the same URL.
//
// ── RESUME ────────────────────────────────────────────────────────────────────────────────────
// The resume marker is a COLUMN, not a file: `idx_sold.photos_mirrored_at`. Each finished row is
// stamped, and every batch asks for the newest rows that are still unstamped, so an interrupted
// run resumes exactly where it stopped and can never re-download a row it has already paid for.
// (backfill-photos.mjs uses a watermark file because it walks a feed; here the work list is a
// table, and putting the cursor on the row removes the whole class of "the file said one thing and
// the book said another" bugs.) `photos_mirrored` doubles as the CMA's `photosServable` for a sold
// comp — the contiguous count that is actually in the bucket.
//
// Usage:
//   node scripts/backfill-sold-photos.mjs --max-downloads N [--rps 1.7] [--max-429 6]
//                                         [--months 12] [--cap 5] [--batch 20]
//                                         [--concurrency 4] [--dry-run]
// --max-downloads is REQUIRED and is a budget of MEDIA downloads for this run.

import { readFileSync } from "node:fs";

// ── args ──────────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const DRY = flag("--dry-run");
/** Photos per closed sale. The owner's number: enough for a comp card and a small gallery,
 * cheap enough that a year of sales is affordable inside the rolling-24h cap. */
const CAP = Math.max(1, Math.min(20, Number(opt("--cap", "5")) || 5));
const MONTHS = Math.max(1, Math.min(60, Number(opt("--months", "12")) || 12));
/** ListingIds per DATA request. The feed takes an `in (…)` list; 20 matches the deployed probe's
 * proven shape and keeps one response's $expand=Media payload sane. */
const BATCH = Math.max(1, Math.min(20, Number(opt("--batch", "20")) || 20));
const CONCURRENCY = Math.max(1, Math.min(6, Number(opt("--concurrency", "4")) || 4));
/** 1.7, not 2: two 429 trips on 2026-08-12 found the real ceiling below the published 2 RPS. */
const RPS = Math.max(0.25, Number(opt("--rps", "1.7")) || 1.7);
const MAX_429 = Math.max(1, Number(opt("--max-429", "6")) || 6);
const MAX_DOWNLOADS = Number(opt("--max-downloads", ""));
if (!DRY && !(MAX_DOWNLOADS > 0)) {
  throw new Error("--max-downloads N is REQUIRED — every run carries an explicit budget so backfill + the hourly sync stay under 40,000 requests per rolling 24h");
}
const BUDGET = MAX_DOWNLOADS > 0 ? MAX_DOWNLOADS : Infinity;

// ── env (never printed) ───────────────────────────────────────────────────────────────────────
const env = readFileSync(".env.local", "utf8");
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const SB_URL = grab("SUPABASE_URL").replace(/\/+$/, "");
const SB_SERVICE = grab("SUPABASE_SERVICE_ROLE_KEY");
const MLS_TOKEN = grab("MLS_API_KEY");
const MLS_ENDPOINT = grab("MLS_API_ENDPOINT").replace(/\/+$/, "");
const FEED = grab("MLS_FEED_ID") || "onekey2";
if (!SB_URL || !SB_SERVICE) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — npx vercel env pull .env.local");
if (!MLS_TOKEN || !MLS_ENDPOINT) throw new Error("MLS_API_KEY / MLS_API_ENDPOINT missing");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SB = { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}` };

// ── outcome histogram ─────────────────────────────────────────────────────────────────────────
const tally = new Map();
const bump = (k, n = 1) => tally.set(k, (tally.get(k) ?? 0) + n);
const report = () => [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(" ");

// ── ONE pacer in front of EVERY MLS request, data and media alike ─────────────────────────────
// Serialising the STARTS is what bounds the rate; transfers still overlap across workers.
let nextSlot = 0;
async function pace() {
  const gap = 1000 / RPS;
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + gap;
  if (at > now) await sleep(at - now);
}

let seen429 = 0;
class RateLimited extends Error {}
function note429() {
  if (++seen429 >= MAX_429) {
    throw new RateLimited(`MLS Grid returned 429 ${seen429} times — stopping this run before the key is suspended`);
  }
  // Being told to slow down means the RATE is wrong, not that one request was unlucky, so every
  // future start is pushed back — escalating with the number of strikes seen.
  nextSlot = Math.max(nextSlot, Date.now() + Math.min(30_000, 2000 * 2 ** Math.min(seen429 - 1, 4)));
}

// ── the work list: newest closed sales that have never been attempted ─────────────────────────
async function fetchPending(limit) {
  const since = new Date(Date.now() - MONTHS * 30.44 * 864e5).toISOString().slice(0, 10);
  const url =
    `${SB_URL}/rest/v1/idx_sold?photos_mirrored_at=is.null&close_date=gte.${since}` +
    `&photos_count=gt.0&select=listing_key,listing_id,close_date,photos_count` +
    `&order=close_date.desc&limit=${limit}`;
  const r = await fetch(url, { headers: SB, signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new Error(`idx_sold read ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

/** What the ACTIVE mirror already holds for these sales, keyed by listing_id.
 *
 * With the 2026-08-17 keep-on-transition policy a listing that sells keeps every photo it had, at
 * `<listing_id>/`. The CMA reads `<listing_key>/`. So for those rows the pictures already exist
 * and must be COPIED inside the bucket, never downloaded again — MLS Grid's guide is explicit
 * that there is never a reason to download the same media twice. Measured 2026-08-17 this matches
 * zero rows (the old cleanup had deleted them all); it starts paying as new sales close. */
async function fetchActiveCounts(listingIds) {
  const out = new Map();
  const CHUNK = 150;
  for (let i = 0; i < listingIds.length; i += CHUNK) {
    const chunk = listingIds.slice(i, i + CHUNK).filter((id) => /^[A-Za-z0-9_-]{1,40}$/.test(id));
    if (!chunk.length) continue;
    try {
      const r = await fetch(
        `${SB_URL}/rest/v1/idx_listings?id=in.(${chunk.join(",")})&select=id,photos_servable`,
        { headers: SB, signal: AbortSignal.timeout(20_000) },
      );
      if (!r.ok) continue;
      for (const row of await r.json()) {
        if ((row.photos_servable ?? 0) > 0) out.set(row.id, row.photos_servable);
      }
    } catch { /* a miss only costs a download we could have avoided — never a wrong write */ }
  }
  return out;
}

// ── MLS Grid DATA: fresh, signed media URLs for a batch of closed listings ────────────────────
async function fetchMedia(listingIds) {
  const filter =
    `OriginatingSystemName eq '${FEED}' and MlgCanView eq true and ` +
    `ListingId in (${listingIds.map((i) => `'${i}'`).join(",")})`;
  // ListingKey is LOAD-BEARING in $select: the feed builds every MediaURL at response time from
  // the PROJECTED document, so a $select without it yields the literal "undefined" in each photo
  // path (lib/idx/mls-grid.ts, proven by controlled A/B on 2026-08-08).
  const query = [
    `$filter=${encodeURIComponent(filter)}`,
    `$select=${["ListingId", "ListingKey", "StandardStatus", "ModificationTimestamp"].join(",")}`,
    "$expand=Media",
    `$top=${listingIds.length}`,
  ].join("&");
  await pace();
  const r = await fetch(`${MLS_ENDPOINT}/Property?${query}`, {
    headers: {
      Authorization: `Bearer ${MLS_TOKEN}`,
      Accept: "application/json",
      "Accept-Encoding": "gzip", // mandatory on this feed — 400 without it
    },
    signal: AbortSignal.timeout(60_000),
  });
  if (r.status === 429) { bump("data:429"); note429(); return null; }
  if (!r.ok) { bump(`data:${r.status}`); return null; }
  bump("data:ok");
  const rows = (await r.json()).value ?? [];
  const byId = new Map();
  for (const p of rows) {
    // Same projection the sync uses, so index 0 here is the same cover the site would show.
    const photos = (p.Media ?? [])
      .filter((m) => !!m.MediaURL && (!m.MediaCategory || m.MediaCategory === "Photo"))
      .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
      .slice(0, CAP)
      .map((m) => m.MediaURL);
    byId.set(p.ListingId, { listingKey: p.ListingKey, status: p.StandardStatus, photos });
  }
  return byId;
}

// ── media download: ONE request per URL, ever. A failure is a SKIP. ───────────────────────────
async function downloadPhoto(url) {
  await pace();
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": MLS_TOKEN }, // their June-2026 rule: the token is the User-Agent
      signal: AbortSignal.timeout(20_000),
    });
    if (r.ok) {
      bump("ok");
      return { bytes: Buffer.from(await r.arrayBuffer()), contentType: r.headers.get("content-type") ?? "image/jpeg" };
    }
    bump(String(r.status));
    if (r.status === 429) note429();
    return null; // the URL is spent — a fresh one comes from a later pass, never a retry here
  } catch (e) {
    if (e instanceof RateLimited) throw e;
    bump(e?.name === "TimeoutError" ? "timeout" : "neterr");
    return null;
  }
}

// ── storage ───────────────────────────────────────────────────────────────────────────────────
async function uploadPhoto(path, bytes, contentType) {
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${SB_URL}/storage/v1/object/mls-photos/${path}`, {
        method: "POST",
        // Cache-Control matches lib/idx/storage.ts — without it Supabase stores "no-cache" and
        // every view re-transfers the object from origin.
        headers: { ...SB, "Content-Type": contentType, "x-upsert": "true", "Cache-Control": "public, max-age=31536000" },
        body: bytes,
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok || res.status === 409) return true;
      if (res.status === 429) { await sleep(Math.min(8000, 500 * 2 ** attempt)); continue; }
      bump(`upload:${res.status}`);
      return false;
    } catch {
      await sleep(500 * 2 ** attempt);
    }
  }
  bump("upload:fail");
  return false;
}

/** Server-side copy inside the bucket. Costs zero MLS requests. */
async function copyObject(from, to) {
  try {
    const res = await fetch(`${SB_URL}/storage/v1/object/copy`, {
      method: "POST",
      headers: { ...SB, "Content-Type": "application/json" },
      body: JSON.stringify({ bucketId: "mls-photos", sourceKey: from, destinationKey: to }),
      signal: AbortSignal.timeout(30_000),
    });
    if (res.ok) { bump("copied"); return true; }
    bump(`copy:${res.status}`);
    return false;
  } catch {
    bump("copy:err");
    return false;
  }
}

/** Stamp the resume marker. Column-level PATCH, grouped by count so a batch costs a handful of
 * requests — NEVER a row replace: a wholesale write is what flattened deep markers on the active
 * side, and idx_sold is written by the CRM's own sold cron at the same time. */
async function markMirrored(results) {
  const byCount = new Map();
  for (const { listingKey, count } of results) {
    if (!byCount.has(count)) byCount.set(count, []);
    byCount.get(count).push(listingKey);
  }
  const at = new Date().toISOString();
  for (const [count, keys] of byCount) {
    const r = await fetch(`${SB_URL}/rest/v1/idx_sold?listing_key=in.(${keys.join(",")})`, {
      method: "PATCH",
      headers: { ...SB, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ photos_mirrored: count, photos_mirrored_at: at }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!r.ok) throw new Error(`mark ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
}

// ── main ──────────────────────────────────────────────────────────────────────────────────────
console.log(
  `backfill-sold-photos: ${DRY ? "DRY-RUN" : "LIVE"} cap=${CAP} months=${MONTHS} batch=${BATCH} ` +
  `concurrency=${CONCURRENCY} rps=${RPS} max429=${MAX_429} maxDownloads=${MAX_DOWNLOADS || "(dry)"}`,
);

let downloads = 0;
let listingsDone = 0;
let photosLanded = 0;
const started = Date.now();

try {
  for (;;) {
    if (downloads >= BUDGET) { console.log(`budget reached (${downloads}/${BUDGET}) — stopping.`); break; }

    const pending = await fetchPending(BATCH);
    if (!pending.length) { console.log("no pending sold rows left in the window — COMPLETE."); break; }

    const active = await fetchActiveCounts(pending.map((p) => p.listing_id));

    // Rows whose pictures we already own get copied, never fetched.
    const toCopy = pending.filter((p) => active.has(p.listing_id));
    const toFetch = pending.filter((p) => !active.has(p.listing_id));
    const results = [];

    for (const row of toCopy) {
      const have = Math.min(active.get(row.listing_id), CAP);
      let n = 0;
      if (!DRY) {
        while (n < have && (await copyObject(`${row.listing_id}/${n}.jpg`, `${row.listing_key}/${n}.jpg`))) n++;
      } else { n = have; bump("would-copy", have); }
      results.push({ listingKey: row.listing_key, count: n });
      photosLanded += n;
      listingsDone++;
    }

    if (toFetch.length) {
      const media = await fetchMedia(toFetch.map((r) => r.listing_id));
      if (media === null) {
        // The DATA read failed. Mark NOTHING — these rows stay pending for a later run rather
        // than being burned as "attempted with nothing to show".
        console.log(`  DATA read failed for a batch of ${toFetch.length} — leaving them pending. ${report()}`);
        if (seen429) throw new RateLimited("stopping after a 429 on the DATA read");
        break;
      }

      // The queue is grouped BY LISTING, deliberately — the opposite of backfill-photos.mjs,
      // which interleaves by photo index across its slice. The difference matters because a row
      // here is STAMPED DONE with whatever contiguous prefix landed: interleaving would spend a
      // truncating budget on one photo each for twenty listings and then stamp all twenty at 1,
      // permanently. Grouped, the budget completes listings in order and the ones it never
      // reached stay unstamped and pending for the next run.
      const plan = [];
      for (const row of toFetch) {
        const m = media.get(row.listing_id);
        if (!m) { results.push({ listingKey: row.listing_key, count: 0 }); bump("feed:missing"); listingsDone++; continue; }
        // The stored key must agree with the feed's own ListingKey, or the folder name would be a
        // guess. Right shape, wrong kind is the classic way a mirror lands under the wrong id.
        if (m.listingKey !== row.listing_key) { results.push({ listingKey: row.listing_key, count: 0 }); bump("key:mismatch"); listingsDone++; continue; }
        if (!m.photos.length) { results.push({ listingKey: row.listing_key, count: 0 }); bump("feed:nophotos"); listingsDone++; continue; }
        m.photos.forEach((url, idx) => plan.push({ key: row.listing_key, idx, url }));
      }

      const remaining = BUDGET - downloads;
      const queue = plan.slice(0, Math.max(0, remaining));
      const landed = new Set();
      let cursor = 0;
      const worker = async () => {
        for (;;) {
          const i = cursor++;
          if (i >= queue.length) return;
          const it = queue[i];
          if (DRY) { landed.add(`${it.key}:${it.idx}`); bump("would-download"); continue; }
          const dl = await downloadPhoto(it.url);
          downloads++;
          if (!dl) continue;
          if (await uploadPhoto(`${it.key}/${it.idx}.jpg`, dl.bytes, dl.contentType)) landed.add(`${it.key}:${it.idx}`);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));

      // Contiguous prefix from 0 — that is what photos_mirrored MEANS to the CMA, which stops
      // asking at the count. A hole at index 2 makes 3 and 4 unreachable, so they do not count.
      const attempted = new Set(queue.map((q) => q.key));
      for (const row of toFetch) {
        if (!attempted.has(row.listing_key)) continue; // budget cut it off — leave it pending
        let n = 0;
        while (landed.has(`${row.listing_key}:${n}`)) n++;
        // Zero landed after real attempts reads as transient (a 429 wave, a dead token). Leave it
        // pending rather than stamping it done and losing the listing for ever.
        if (n === 0) { bump("all-failed-left-pending"); continue; }
        results.push({ listingKey: row.listing_key, count: n });
        photosLanded += n;
        listingsDone++;
      }
    }

    if (!DRY && results.length) await markMirrored(results);
    if (!results.length) { console.log("a whole batch produced no marks — stopping rather than looping."); break; }

    const mins = ((Date.now() - started) / 60000).toFixed(1);
    console.log(`  ${listingsDone} listings · ${photosLanded} photos · ${downloads} downloads · ${mins}m · ${report()}`);
    if (DRY) { console.log("dry run: one batch only."); break; }
  }
} catch (e) {
  if (e instanceof RateLimited) console.error(`STOPPED: ${e.message}`);
  else throw e;
}

console.log(
  `\nDONE ${DRY ? "(dry)" : ""} listings=${listingsDone} photos=${photosLanded} downloads=${downloads}` +
  ` minutes=${((Date.now() - started) / 60000).toFixed(1)}\noutcomes: ${report()}`,
);
