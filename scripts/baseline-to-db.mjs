// One-time BASELINE pull: replicate the full served-area Active inventory into the
// Supabase idx_listings store (the DB the site now reads from — see lib/idx/db.ts).
//
// Drives the DEPLOYED export endpoint (/api/cron/sync-mls) in paged, rate-gapped slices
// — the endpoint owns all MLS Grid pacing (strictly < 2 req/sec) and the MLS key stays
// server-side — and writes each slice to the DB through the secret-gated idx_sync_apply
// RPC. The BOROUGH mapping must be DEPLOYED first or city rows get dropped server-side.
//
// Flip-during-baseline gap: the scan filters Active-only, so a listing that goes
// Pending/Closed mid-scan silently vanishes from later slices while an early slice
// already stored it. Fix: the final watermark is this script's START time, so the first
// hourly delta re-scans everything modified during the run and deactivates the flips.
//
// Usage: node scripts/baseline-to-db.mjs [base-url]   (default: the production deploy)
// Needs CRON_SECRET + SUPABASE_URL + SUPABASE_ANON_KEY in .env.local
// (refresh with: npx vercel env pull .env.local). Resumable: progress watermark is kept
// in scripts/.baseline-watermark.local; delete it (or pass --fresh) to start over.

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const RESUME_FILE = "scripts/.baseline-watermark.local";
const EPOCH = "1970-01-01T00:00:00Z";
// 50, not 200: full-gallery rows are ~3x heavier (50 MediaURLs + detail arrays) and a
// 200-row upsert statement hit the DB statement timeout (57014) on 2026-07-15.
const UPSERT_BATCH = 50;

const env = readFileSync(".env.local", "utf8");
const grab = (k) => new RegExp(`^${k}="?([^"\\r\\n]+?)"?$`, "m").exec(env)?.[1];
const SECRET = grab("CRON_SECRET");
const SB_URL = grab("SUPABASE_URL");
const SB_KEY = grab("SUPABASE_ANON_KEY");
if (!SECRET || !SB_URL || !SB_KEY) {
  throw new Error("CRON_SECRET / SUPABASE_URL / SUPABASE_ANON_KEY missing — npx vercel env pull .env.local");
}

const args = process.argv.slice(2).filter((a) => a !== "--fresh");
if (process.argv.includes("--fresh")) rmSync(RESUME_FILE, { force: true });
const base = (args[0] ?? "https://realtylt-website.vercel.app").replace(/\/+$/, "");

const startedIso = new Date().toISOString(); // the first delta rewinds to this — see header
let watermark = existsSync(RESUME_FILE) ? readFileSync(RESUME_FILE, "utf8").trim() : EPOCH;
if (watermark !== EPOCH) console.log(`resuming from ${watermark} (${RESUME_FILE})`);

const iso = (s) => {
  const t = Date.parse(s);
  return Number.isNaN(t) ? s : new Date(t).toISOString();
};

async function rpc(body) {
  const res = await fetch(`${SB_URL.replace(/\/+$/, "")}/rest/v1/rpc/idx_sync_apply`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ _secret: SECRET, ...body }),
  });
  if (!res.ok) throw new Error(`idx_sync_apply ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const counties = {};
let totalUpserted = 0;
let totalScanned = 0;
let calls = 0;

for (;;) {
  calls++;
  const url = `${base}/api/cron/sync-mls?watermark=${encodeURIComponent(watermark)}&maxPages=20`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SECRET}` } });
  if (!res.ok) throw new Error(`export endpoint ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const text = await res.text();
  // PERMANENT MediaURLs only — a presigned URL would die in ~1h and must not be stored.
  if (/[?&](X-Amz-Signature|X-Amz-Credential)=/.test(text)) {
    throw new Error("presigned media URLs detected — do not store; revisit docs/mls-fix/RESEARCH.md");
  }
  const slice = JSON.parse(text);
  if (!slice.ok) throw new Error(`export endpoint error: ${JSON.stringify(slice).slice(0, 300)}`);

  const listings = (slice.listings ?? []).map((l) => ({
    ...l,
    listedAt: iso(l.listedAt),
    modificationTimestamp: iso(l.modificationTimestamp),
  }));
  for (let i = 0; i < listings.length; i += UPSERT_BATCH) {
    const out = await rpc({ _upserts: listings.slice(i, i + UPSERT_BATCH) });
    totalUpserted += out.upserted;
  }
  for (const l of listings) counties[l.county] = (counties[l.county] ?? 0) + 1;
  totalScanned += slice.scanned;

  console.log(
    `slice ${calls}: scanned ${slice.scanned}, kept ${slice.kept}, pages ${slice.pages}, ` +
      `watermark ${slice.watermark}${slice.complete ? " — COMPLETE" : ""}`,
  );
  if (slice.complete) break;
  if (slice.watermark === watermark) throw new Error("watermark did not advance — aborting");
  watermark = slice.watermark;
  writeFileSync(RESUME_FILE, watermark);
  await new Promise((r) => setTimeout(r, 2000)); // keep the call seam gentle too
}

// Watermark = script start (NOT the scan max): lets the first hourly delta catch every
// flip that happened while this ran. Forward-only guard in the RPC makes this safe.
await rpc({ _watermark: startedIso, _baseline_complete: true });
rmSync(RESUME_FILE, { force: true });

console.log(
  `\nBASELINE COMPLETE — upserted ${totalUpserted} listings (${totalScanned} feed rows scanned, ` +
    `${calls} endpoint calls)\nper county: ${JSON.stringify(counties, null, 2)}\n` +
    `watermark set to ${startedIso}; baseline_complete = true — the hourly delta takes over.`,
);
