// Repair the Cache-Control on photos already in Supabase Storage.
//
// WHY THIS SCRIPT EXISTS IN THIS SHAPE (round 25, measured — do not "simplify" it back):
// The backfill runner uploaded ~409k objects WITHOUT a Cache-Control header, so Storage stored
// "no-cache" on them. Three cheaper repairs were tried against production and all three FAILED:
//   1. UPDATE storage.objects SET metadata->>'cacheControl'  — the DB row changes, the SERVED
//      header does not. The serving layer reads the object's own S3 metadata, not this jsonb.
//   2. POST /storage/v1/object/copy with `metadata`          — the copy INHERITS "no-cache";
//      the metadata argument is ignored.
//   3. The same copy onto the source key (self-copy)         — 409 KeyAlreadyExists.
// What DOES work is an S3 CopyObject onto the same key with `x-amz-metadata-directive: REPLACE`,
// which rewrites the object's metadata server-side with no byte egress. That is what this does.
//
// ALSO MEASURED, so the urgency is honest: "no-cache" is NOT "no-store". These objects carry an
// ETag and revalidate to 304 with ZERO bytes, so a returning browser is already cheap. The real
// cost is that the CDN never edge-caches them (CF-Cache-Status: MISS on every request), so every
// first view by every visitor pulls full bytes from origin. Worth fixing; not an emergency.
//
// CREDENTIALS — this is the ONLY reason the sweep has not run. It needs S3 access keys, which are
// minted by the owner in the Supabase dashboard (Project Settings -> Storage -> S3 access keys),
// NOT the service-role key. Put them in .env.local as:
//   SUPABASE_S3_ACCESS_KEY_ID=...
//   SUPABASE_S3_SECRET_ACCESS_KEY=...
//
// USAGE (start small, verify, then widen):
//   node scripts/fix-photo-cache-control.mjs --limit 5 --dry-run
//   node scripts/fix-photo-cache-control.mjs --limit 5        # then re-check a served header
//   node scripts/fix-photo-cache-control.mjs --limit 999999
import { readFileSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const DRY = flag("--dry-run");
const LIMIT = Number(opt("--limit", "5"));
const RPS = Math.max(0.5, Number(opt("--rps", "8")) || 8);
const CC = "public, max-age=31536000";
const BUCKET = "mls-photos";

const env = readFileSync(".env.local", "utf8");
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const SB_URL = grab("SUPABASE_URL").replace(/\/+$/, "");
const SB_SERVICE = grab("SUPABASE_SERVICE_ROLE_KEY");
const AK = grab("SUPABASE_S3_ACCESS_KEY_ID");
const SK = grab("SUPABASE_S3_SECRET_ACCESS_KEY");
if (!SB_URL || !SB_SERVICE) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
if (!DRY && (!AK || !SK)) {
  throw new Error(
    "SUPABASE_S3_ACCESS_KEY_ID / SUPABASE_S3_SECRET_ACCESS_KEY missing.\n" +
    "Mint them in Supabase: Project Settings -> Storage -> S3 access keys, then add both to .env.local.\n" +
    "(The service-role key CANNOT do this — see the header comment.)",
  );
}
const REGION = grab("SUPABASE_S3_REGION") || "us-east-1";
const HOST = new URL(SB_URL).host;
const ENDPOINT = `${SB_URL}/storage/v1/s3`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha256 = (x) => createHash("sha256").update(x).digest("hex");
const hmac = (k, x) => createHmac("sha256", k).update(x).digest();

/** Minimal SigV4 for a single CopyObject — one signed header set, no SDK dependency. */
function sign(method, path, headers, payloadHash) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const all = { ...headers, host: HOST, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate };
  const signedHeaders = Object.keys(all).map((h) => h.toLowerCase()).sort();
  const canonicalHeaders = signedHeaders.map((h) => {
    const key = Object.keys(all).find((k) => k.toLowerCase() === h);
    return `${h}:${String(all[key]).trim()}\n`;
  }).join("");
  const canonical = [method, path, "", canonicalHeaders, signedHeaders.join(";"), payloadHash].join("\n");
  const scope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  let k = hmac(`AWS4${SK}`, dateStamp);
  for (const part of [REGION, "s3", "aws4_request"]) k = hmac(k, part);
  const signature = createHmac("sha256", k).update(toSign).digest("hex");
  return {
    ...all,
    Authorization: `AWS4-HMAC-SHA256 Credential=${AK}/${scope}, SignedHeaders=${signedHeaders.join(";")}, Signature=${signature}`,
  };
}

/** CopyObject onto the SAME key, replacing metadata. No bytes leave the region. */
async function rewrite(name) {
  const path = `/storage/v1/s3/${BUCKET}/${name.split("/").map(encodeURIComponent).join("/")}`;
  const empty = sha256("");
  const headers = sign("PUT", path, {
    "x-amz-copy-source": `/${BUCKET}/${name}`,
    "x-amz-metadata-directive": "REPLACE",
    "cache-control": CC,
    "content-type": "image/jpeg",
  }, empty);
  const res = await fetch(`${ENDPOINT}/${name}`, { method: "PUT", headers });
  if (!res.ok) return { ok: false, status: res.status, body: (await res.text()).slice(0, 180) };
  return { ok: true };
}

// WORK QUEUE. PostgREST does not expose the `storage` schema (406 PGRST106), so the object names
// cannot be selected from storage.objects here. They do not need to be: the mirror writes exactly
// `{listingId}/{0..photos_servable-1}.jpg`, and idx_listings IS publicly readable — the same
// projection backfill-photos.mjs already reads. So the queue is derived, not queried.
//
// COVERAGE, stated rather than silently capped: this enumerates each listing's SERVABLE PREFIX.
// Objects sitting beyond that prefix (the ~8,933 rows that serve via the route's storage-probe
// branch with photosMirrored=0 in jsonb, and the 10 rows holding photos at idx>=1 with no cover)
// are NOT covered and keep their no-cache until they are re-mirrored. Re-writing an object that is
// already correct is harmless, so re-running this after a backfill is safe and idempotent.
async function listBad(limit) {
  const names = [];
  const PAGE = 1000;
  for (let from = 0; names.length < limit; from += PAGE) {
    const res = await fetch(
      `${SB_URL}/rest/v1/idx_listings?select=id,photos_servable&photos_servable=gt.0&order=id&offset=${from}&limit=${PAGE}`,
      { headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}` } },
    );
    if (!res.ok) throw new Error(`list failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    const rows = await res.json();
    if (!rows.length) break;
    for (const r of rows) {
      for (let n = 0; n < r.photos_servable && names.length < limit; n++) names.push(`${r.id}/${n}.jpg`);
    }
  }
  return names.slice(0, limit);
}

const names = await listBad(LIMIT);
console.log(`${names.length} objects still serving no-cache (limit ${LIMIT})${DRY ? " — DRY RUN, nothing written" : ""}`);
if (DRY) { console.log(names.slice(0, 10).join("\n")); process.exit(0); }

let done = 0, failed = 0;
const gap = 1000 / RPS;
for (const name of names) {
  const t0 = Date.now();
  const r = await rewrite(name);
  if (r.ok) done++;
  else { failed++; if (failed <= 5) console.log(`  FAIL ${name}: ${r.status} ${r.body}`); }
  if (failed > 20 && failed > done) throw new Error("failing more often than succeeding — stopping");
  if ((done + failed) % 500 === 0) console.log(`  ${done + failed}/${names.length} (${failed} failed)`);
  const wait = gap - (Date.now() - t0);
  if (wait > 0) await sleep(wait);
}
console.log(`\nDONE — ${done} rewritten, ${failed} failed.`);
console.log("VERIFY with a GET (not HEAD — Supabase's HEAD returns no-cache unconditionally and lied to this round's first probe):");
console.log(`  node -e "fetch('${SB_URL}/storage/v1/object/public/${BUCKET}/${names[0] ?? "KEY.../0.jpg"}').then(r=>console.log(r.headers.get('cache-control')))"`);
