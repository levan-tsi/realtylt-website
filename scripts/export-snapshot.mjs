// Rebuild data/mls-snapshot.json from the deployed export endpoint (/api/cron/sync-mls).
// The endpoint replicates the six-county Active feed from the MLS Grid DATA API in paged,
// rate-gapped slices, each listing carrying its PERMANENT MediaURLs; this driver merges the
// slices by listing id and writes the committed snapshot the site serves from. The /api/media
// proxy serves those URLs (no per-view DATA-API calls — the suspension fix, docs/mls-fix/).
//
// Usage: node scripts/export-snapshot.mjs [base-url]   (default: the production deploy)
// Needs CRON_SECRET in .env.local — refresh it with: npx vercel env pull .env.local
// After a successful run: review the tallies, commit data/mls-snapshot.json, deploy.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const base = (process.argv[2] ?? "https://realtylt-website.vercel.app").replace(/\/+$/, "");
const secret = /^CRON_SECRET="?([^"\r\n]+?)"?$/m.exec(readFileSync(".env.local", "utf8"))?.[1];
if (!secret) {
  throw new Error("CRON_SECRET not found in .env.local — run: npx vercel env pull .env.local");
}

const byId = new Map();
let watermark = "1970-01-01T00:00:00Z";
let calls = 0;
let scanned = 0;

for (;;) {
  calls++;
  if (calls > 30) throw new Error("more than 30 calls — feed larger than expected, aborting");
  const res = await fetch(`${base}/api/cron/sync-mls?watermark=${encodeURIComponent(watermark)}`, {
    headers: { authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(295_000),
  });
  if (!res.ok) {
    throw new Error(`call ${calls} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const slice = await res.json();
  scanned += slice.scanned;
  for (const l of slice.listings) byId.set(l.id, l); // keep each listing's PERMANENT MediaURLs
  console.log(
    `call ${calls}: pages=${slice.pages} scanned=${slice.scanned} kept=${slice.kept} ` +
      `merged=${byId.size} complete=${slice.complete} watermark=${slice.watermark}`,
  );
  if (slice.complete) break;
  if (slice.watermark === watermark) throw new Error("watermark did not advance — aborting");
  watermark = slice.watermark;
  await new Promise((r) => setTimeout(r, 2000)); // keep the call seam under 2 req/sec too
}

const listings = [...byId.values()];
const counties = {};
let withPhotos = 0;
let photoUrls = 0;
for (const l of listings) {
  counties[l.county] = (counties[l.county] ?? 0) + 1;
  if (Array.isArray(l.photos) && l.photos.length) {
    withPhotos++;
    photoUrls += l.photos.length;
  }
}
const json = JSON.stringify({ syncedAt: new Date().toISOString(), listings });
// Self-validating: PERMANENT MediaURLs are safe to commit, but a PRESIGNED (expiring) URL must
// NEVER be committed — it would 404 before anyone views it. If this feed ever returns presigned
// URLs (X-Amz-* signature params), the "store URLs in the snapshot" approach doesn't apply and
// the photo strategy must be revisited (see docs/mls-fix/RESEARCH.md).
if (/[?&](X-Amz-Signature|X-Amz-Credential|Expires)=/.test(json)) {
  throw new Error(
    "presigned/expiring media URLs detected — these must not be committed. This feed is not on " +
      "MLS Grid's permanent-MediaURL model; revisit the photo approach (docs/mls-fix/RESEARCH.md).",
  );
}
mkdirSync("data", { recursive: true });
writeFileSync("data/mls-snapshot.json", json);
console.log(
  `WROTE data/mls-snapshot.json — ${listings.length} listings, ` +
    `${(json.length / 1e6).toFixed(1)} MB, scanned ${scanned} feed rows, ` +
    `${withPhotos} with photos (${photoUrls} URLs), counties ${JSON.stringify(counties)}`,
);
