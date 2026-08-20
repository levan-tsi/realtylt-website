// ONE COMMAND for a sold-photo window: measure both doors, decide, and either launch or say
// exactly when to come back. Wraps the judgement that took a week (and two rate-limit trips)
// to get right, so a fresh session does not have to reconstruct it from the ledger.
//
//   node scripts/sold-window.mjs            → decide and LAUNCH if the doors allow
//   node scripts/sold-window.mjs --dry-run  → decide and print, launch nothing
//
// WHY THIS EXISTS: the rules are simple to state and easy to get wrong under time pressure.
// Both of the incidents in docs/parity/PHOTO-BACKFILL-STATUS.md came from a human-ish shortcut,
// not from the runner: sizing a window off the DAILY budget while the HOUR was spent, and
// relaunching 50 minutes after a 429 because the counters looked green. Both are encoded here.
//
// THE RULES (full law: docs/vendor/mlsgrid/README.md "ACTUAL ENFORCEMENT THRESHOLDS"):
//  · Their warning tier: 4 RPS · 7,200 req/hr · 3,072 MB/hr · 40,000 per ROLLING 24h.
//    We stay inside it: rps 2.0, runs <= 6,000 (~2.5 GB at ~415 KB/photo), daily target 38,000.
//  · BOTH doors must be open and the run is sized to the SMALLER.
//  · After ANY 429 the next attempt waits >= 4 HOURS — counters measure our spend, not the
//    host's penalty state.
//  · The rolling window drains in STEPS as each past hour ages out 24h later, and an hour
//    bucket drains CONTINUOUSLY across that hour — so the next good moment is a bucket's END.

import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");

const env = readFileSync(".env.local", "utf8");
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const SB = grab("SUPABASE_URL").replace(/\/+$/, "");
const KEY = grab("SUPABASE_SERVICE_ROLE_KEY") || grab("SUPABASE_ANON_KEY");
if (!SB || !KEY) throw new Error("SUPABASE_URL / key missing — npx vercel env pull .env.local");

const DAILY_TARGET = 38_000;   // inside their 40,000 warning tier
const DAILY_RESERVE = 1_500;   // headroom for the hourly sync's own media work
const HOURLY_CAP = 6_000;      // ~2.5 GB, inside the 3,072 MB/hr warning
const HOURLY_TARGET = 7_000;
const FLOOR = 3_000;           // below this a window is not worth the quota churn
const PENALTY_HOURS = 4;

/** Trailing spend, via the read-only public.media_spend() aggregate.
 *
 * PostgREST does not expose the `storage` schema (PGRST106), so the counts cannot be read
 * straight off storage.objects with an API key — which is why every measurement until now
 * came from a privileged console. media_spend() is a SECURITY DEFINER function returning
 * exactly two integers (migration media_spend_readonly_counter): no names, no paths, no
 * metadata, service-role only. It exists so this script can size its own window. */
async function spend() {
  const res = await fetch(`${SB}/rest/v1/rpc/media_spend`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) {
    throw new Error(
      `media_spend failed ${res.status}: ${(await res.text()).slice(0, 200)}\n` +
        "Needs the SERVICE ROLE key in .env.local (the anon key cannot execute it).",
    );
  }
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  const last1h = Number(row?.last_1h);
  const last24h = Number(row?.last_24h);
  if (!Number.isFinite(last1h) || !Number.isFinite(last24h)) {
    throw new Error(`media_spend returned an unreadable shape: ${JSON.stringify(rows).slice(0, 200)}`);
  }
  return { last1h, last24h };
}

const { last1h, last24h } = await spend();
const daily = Math.max(0, DAILY_TARGET - last24h - DAILY_RESERVE);
const hourly = Math.max(0, Math.min(HOURLY_CAP, HOURLY_TARGET - last1h));
const size = Math.min(daily, hourly);

console.log(`trailing: ${last1h.toLocaleString()} in 1h · ${last24h.toLocaleString()} in 24h`);
console.log(`doors   : daily ${daily.toLocaleString()} · hourly ${hourly.toLocaleString()} → size ${size.toLocaleString()}`);

if (size >= FLOOR) {
  const args = ["scripts/backfill-sold-photos.mjs", "--max-downloads", String(size), "--rps", "2.0"];
  if (DRY) { console.log(`WOULD LAUNCH: node ${args.join(" ")}`); process.exit(0); }
  console.log(`LAUNCHING: node ${args.join(" ")}`);
  const child = execFile(process.execPath, args, { maxBuffer: 1 << 26 }, (err) => {
    if (err) console.error(`runner exited: ${err.message.split("\n")[0]}`);
  });
  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);
} else {
  // Shut. Say WHEN to come back, from the hour profile — never "try again in a while".
  console.log(`\nDOOR SHUT (need ${FLOOR.toLocaleString()}). The next good moment is the END of the`);
  console.log(`next big bucket ageing out of the rolling 24h. Run this to see the profile:\n`);
  console.log(`  select date_trunc('hour', created_at) as hr, count(*) from storage.objects`);
  console.log(`  where bucket_id='mls-photos' and created_at > now() - interval '25 hours'`);
  console.log(`  group by 1 order by 1 limit 12;\n`);
  console.log(`The earliest rows are what rolls off next; a bucket of N frees ~N minus ~500/hr of`);
  console.log(`ongoing sync. Schedule for the bucket's END (its hour + 24h + 1h), not its start.`);
  console.log(`STEADY STATE: the door only really reopens when one of OUR past 5-6k windows ages`);
  console.log(`out, so each window run today creates tomorrow's window at the same hour.`);
  console.log(`\nAFTER A 429: wait >= ${PENALTY_HOURS} HOURS and drop to --rps 1.7. Not minutes.`);
  process.exit(3);
}
