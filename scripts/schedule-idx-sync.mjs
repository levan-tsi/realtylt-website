// Install (or move) the HOURLY trigger for /api/cron/idx-sync as a Supabase pg_cron job
// via the secret-gated idx_sync_schedule RPC. The Vercel plan only allows daily crons,
// so the database fires the sync instead: net.http_get with a short client timeout —
// the Vercel function runs to completion server-side regardless.
//
// Usage: node scripts/schedule-idx-sync.mjs [base-url]  (default: the production deploy)
// Needs CRON_SECRET + SUPABASE_URL + SUPABASE_ANON_KEY in .env.local.

import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const grab = (k) => new RegExp(`^${k}="?([^"\\r\\n]+?)"?$`, "m").exec(env)?.[1];
const SECRET = grab("CRON_SECRET");
const SB_URL = grab("SUPABASE_URL");
const SB_KEY = grab("SUPABASE_ANON_KEY");
if (!SECRET || !SB_URL || !SB_KEY) {
  throw new Error("CRON_SECRET / SUPABASE_URL / SUPABASE_ANON_KEY missing — npx vercel env pull .env.local");
}

const base = (process.argv[2] ?? "https://realtylt-website.vercel.app").replace(/\/+$/, "");
const res = await fetch(`${SB_URL.replace(/\/+$/, "")}/rest/v1/rpc/idx_sync_schedule`, {
  method: "POST",
  headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ _secret: SECRET, _url: `${base}/api/cron/idx-sync` }),
});
if (!res.ok) throw new Error(`idx_sync_schedule ${res.status}: ${(await res.text()).slice(0, 300)}`);
console.log(await res.json());
