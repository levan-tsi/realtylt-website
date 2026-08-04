/** INVENTORY HEALTH — the gate every round opens with.
 *
 * Two handoffs in a row have said "first action: run the freshness check, and if it is zero the
 * feed is frozen and nothing else matters" — while pointing at `scripts/_scratch-r16-debt.mjs`,
 * which is covered by the `scripts/_scratch-*` gitignore rule and therefore exists on exactly one
 * machine. An instruction that opens every round should survive a fresh clone, so this is the
 * committed version of it.
 *
 * WHAT IT ADDS: the zero-photo count SPLIT BY AGE.
 *
 * The raw number moves with intake, so it goes UP while the backfill is working and reads like a
 * regression. Measured 2026-08-04: 1,705 rows with no servable photo, of which 1,250 were first
 * seen within the last SEVEN DAYS and only 455 were older. About 150 new listings arrive each day
 * carrying no mirrored photos yet, and the hourly sync picks them up on its own. So the headline
 * is mostly a queue, and the number worth watching is the last line — the rows that have been
 * sitting without a photo long enough that nothing is going to fix them by itself.
 *
 * Usage: node scripts/inventory-health.mjs
 */
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [
      l.slice(0, l.indexOf("=")).trim(),
      l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, ""),
    ]),
);
const SB = env.SUPABASE_URL.replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const cnt = async (q) => {
  const r = await fetch(`${SB}/rest/v1/idx_listings?${q}&select=id&limit=1`, {
    headers: { ...H, Prefer: "count=exact", Range: "0-0" },
  });
  return Number(r.headers.get("content-range")?.split("/")[1] ?? 0);
};
const ago = (days) => new Date(Date.now() - days * 864e5).toISOString();
/** `is_active` (not `status=eq.Active`) because it is what the SITE renders — pending homes are
 * still on the page. The two differ by roughly ten thousand rows, so mixing them silently
 * changes every ratio below. */
const LIVE = "is_active=eq.true";

console.log("=== what a visitor sees: photos_servable on rows the site renders ===");
console.log(`  live rows              : ${await cnt(LIVE)}`);
console.log(`  photos_servable = 0    : ${await cnt(`${LIVE}&photos_servable=eq.0`)}   (these show the coming-soon logo)`);
console.log(`  photos_servable >= 1   : ${await cnt(`${LIVE}&photos_servable=gte.1`)}`);
console.log(`  photos_servable >= 5   : ${await cnt(`${LIVE}&photos_servable=gte.5`)}`);
console.log(`  photos_servable >= 20  : ${await cnt(`${LIVE}&photos_servable=gte.20`)}`);

console.log("\n=== the zero-photo rows, BY AGE — the headline above is mostly a queue ===");
const zero = `${LIVE}&photos_servable=eq.0`;
const today = await cnt(`${zero}&first_seen_at=gte.${ago(1)}`);
const week = await cnt(`${zero}&first_seen_at=gte.${ago(7)}`);
const backlog = await cnt(`${zero}&first_seen_at=lt.${ago(7)}`);
console.log(`  first seen in last 24h : ${today}   (arrived with no photos yet — normal)`);
console.log(`  first seen in last 7d  : ${week}`);
console.log(`  OLDER THAN 7d          : ${backlog}   <-- THE REAL BACKLOG. Watch this one.`);

console.log("\n=== freshness of what we hold ===");
for (const [label, q] of [
  ["modified in last 24h", `modification_ts=gte.${ago(1)}`],
  ["modified in last 7d", `modification_ts=gte.${ago(7)}`],
  ["first seen in last 7d", `first_seen_at=gte.${ago(7)}`],
]) {
  console.log(`  ${label.padEnd(24)}: ${await cnt(`${LIVE}&${q}`)}`);
}

console.log("\n=== newest listings we hold (are we missing this week's homes?) ===");
const newest = await (
  await fetch(
    `${SB}/rest/v1/idx_listings?${LIVE}&select=id,address,city,first_seen_at,modification_ts&order=first_seen_at.desc&limit=5`,
    { headers: H },
  )
).json();
for (const r of newest) {
  console.log(
    `  ${r.id} ${String(r.address).slice(0, 34).padEnd(34)} ${String(r.city).padEnd(14)} first_seen=${r.first_seen_at} mod=${r.modification_ts}`,
  );
}
