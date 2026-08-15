#!/usr/bin/env node
/**
 * COMMITTED GATE — can the hourly sync put a geocoded home back on its zip centroid?
 *
 * This is the rule the whole round rests on. idx_listings.lat/lng are GENERATED from
 * listing->>'lat'/'lng', and idx_sync_apply upserts with `set listing = excluded.listing` — a
 * full JSONB REPLACE. A geocode written into the JSONB alone survives exactly until that
 * listing's next feed touch and then reverts, silently, with nothing failing and no error
 * anywhere. 27,242 homes would drift back to zip centroids one sync at a time.
 *
 * The defence is the merge inside idx_sync_apply: it joins idx_geocodes and overwrites the
 * feed's synthetic coordinate before the row is written. This drives that path for real,
 * against the live database, with the actual RPC the cron calls.
 *
 * THE CONTROL IS THE POINT. "The coordinate did not move" is also what you get from an upsert
 * that never happened, so the same attack is run against a NOT-geocoded listing, which MUST
 * move. If the control does not move, the attack is not landing and the pass above means
 * nothing — the gate says so and exits non-zero either way.
 *
 * It also checks the ADDRESS-DRIFT guard: a geocode is an answer about an address, so a row
 * whose street name changed must fall back to the centroid rather than keep a precise-looking
 * pin measured for somewhere else.
 *
 *   node scripts/verify-geocode-durability.mjs
 */
import fs from "node:fs";
import { addrKey } from "../lib/idx/geocode.mjs";

const ENV = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = (n) => {
  const m = ENV.match(new RegExp("^" + n + "=(.*)$", "m"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};
const SB = env("SUPABASE_URL").replace(/\/+$/, "") + "/rest/v1";
const KEY = env("SUPABASE_ANON_KEY");
const SECRET = env("CRON_SECRET");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const rpc = async (fn, body) => {
  const r = await fetch(`${SB}/rpc/${fn}`, { method: "POST", headers: H, body: JSON.stringify(body) });
  const t = await r.text();
  if (!r.ok) throw new Error(`${fn} ${r.status}: ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
};
const one = async (query) => (await fetch(`${SB}/idx_listings?${query}`, { headers: H }).then((r) => r.json()))[0];
const readListing = async (id) => (await one(`id=eq.${encodeURIComponent(id)}&select=listing`))?.listing;

/** Upsert a listing exactly as the hourly sync does, with the coordinate the feed would send. */
const syncUpsert = (listing) => rpc("idx_sync_apply", { _secret: SECRET, _upserts: [listing] });

const fails = [];
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
  if (!ok) fails.push(label);
};

// ── 1. the control: an upsert really does move a listing that has no geocode ──────────────
console.log("\ncontrol — the same attack on a listing with no geocode MUST move it:");
const ctl = await one("is_active=eq.true&geocoded=is.null&lat=not.is.null&select=listing&limit=1");
if (!ctl) {
  check(false, "found a non-geocoded listing to use as a control");
} else {
  const base = ctl.listing;
  const moved = { ...base, lat: base.lat + 0.01, lng: base.lng + 0.01 };
  await syncUpsert(moved);
  const after = await readListing(base.id);
  check(
    Math.abs(after.lat - (base.lat + 0.01)) < 1e-9,
    "the upsert path actually writes coordinates",
    `${base.id} ${base.lat.toFixed(5)} -> ${after.lat.toFixed(5)}`,
  );
  await syncUpsert(base); // put it back
  const restored = await readListing(base.id);
  check(Math.abs(restored.lat - base.lat) < 1e-9, "control listing restored");
}

// ── 2. the rule: a geocoded listing cannot be moved by the feed's centroid ────────────────
console.log("\nthe rule — a geocoded listing must survive a sync carrying the feed's centroid:");
const sub = await one("is_active=eq.true&geocoded=is.true&select=listing&limit=1");
if (!sub) {
  check(false, "found a geocoded listing to attack");
} else {
  const live = sub.listing;
  const id = live.id;
  const truth = { lat: live.lat, lng: live.lng };

  // Exactly what coordsOf() would hand the sync: a zip centroid, ~700m away.
  const feedRow = { ...live, lat: live.lat + 0.006, lng: live.lng + 0.004 };
  delete feedRow.geocoded;
  await syncUpsert(feedRow);
  const after = await readListing(id);
  check(
    after.lat === truth.lat && after.lng === truth.lng && after.geocoded === true,
    "the sync could not move a geocoded pin",
    `${id} still at ${truth.lat.toFixed(6)}, ${truth.lng.toFixed(6)}`,
  );

  // ── 3. the address-drift guard ──────────────────────────────────────────────────────────
  console.log("\nthe guard — a geocode measured for another address must NOT be reused:");
  const drifted = { ...feedRow, address: `${live.address} (renamed)` };
  await syncUpsert(drifted);
  const d = await readListing(id);
  check(
    d.lat === feedRow.lat && !d.geocoded,
    "a renamed street falls back to the centroid instead of keeping a stale pin",
    `geocoded=${d.geocoded ?? "absent"}`,
  );

  // Restore the real address; the merge re-applies because the key matches again.
  await syncUpsert(feedRow);
  const back = await readListing(id);
  check(
    back.lat === truth.lat && back.geocoded === true,
    "restoring the address restores the geocode",
    `${back.address}`,
  );
}

// ── 4. the cross-language contract the merge depends on ──────────────────────────────────
console.log("\nthe contract — JS addrKey() and SQL idx_addr_key() must agree:");
const rows = await fetch(`${SB}/idx_listings?is_active=eq.true&select=id,address,zip,listing&limit=25`, { headers: H }).then((r) => r.json());
let mismatch = 0;
for (const r of rows) {
  const sql = await rpc("idx_addr_key", { _listing: r.listing });
  if (sql !== addrKey(r.address, r.zip)) {
    mismatch++;
    console.log(`    ${r.id}: sql=${JSON.stringify(sql)} js=${JSON.stringify(addrKey(r.address, r.zip))}`);
  }
}
check(mismatch === 0, `${rows.length} real rows key identically in JS and SQL`);

console.log(`\n${fails.length ? `FAIL (${fails.length}): ${fails.join("; ")}` : "PASS — geocodes are durable against the sync."}`);
process.exit(fails.length ? 1 : 0);
