import { NextResponse } from "next/server";
import { facts, judge, shouldAlert, type ProbeResult, type WatchInput } from "@/lib/watch/checks";
import { composeAlert, composeDigest } from "@/lib/watch/email";
import { sendWatchMail } from "@/lib/watch/send";

/** THE PLATFORM HEALTH WATCH (round 51, owner-directed 2026-09-17: the watching moves off n8n,
 * "our page should handle that", and it covers the CRM and the website, not just the listing
 * data - weekly all-clear, IMMEDIATELY when something is serious, attacked or anomalous).
 *
 * Fired by Supabase pg_cron (the same mechanism as the hourly MLS sync - Vercel Hobby crons
 * are daily-only): hourly at :23 plain, Mondays 11:23 UTC with ?mode=digest. Auth:
 * `Authorization: Bearer ${CRON_SECRET}` exactly like /api/cron/idx-sync.
 *
 * WHAT RUNS HERE: probes of realtylt.com, the search API and app.realtylt.com from the public
 * edge; the listing store's idx_health_snapshot(); site_watch_counts() for the flood signals.
 * The judge and its thresholds live in lib/watch/checks.ts (unit-tested); the state that makes
 * swings and re-alert throttling possible lives in site_watch_state (id=1, jsonb). Alerts go
 * through lib/watch/send.ts (Resend; "no-transport" until the key exists - the n8n watcher
 * keeps guard until then, see the send.ts note).
 *
 * The route never throws for a failed probe - a down site is a REPORT, not an exception; only
 * a bad secret or a broken store answers non-200. */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE = "https://realtylt.com";
const CRM = "https://app.realtylt.com";

function restConfig(): { base: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { base: `${url.replace(/\/+$/, "")}/rest/v1`, key };
}

async function probe(url: string, init?: RequestInit): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { ...init, redirect: "follow", signal: AbortSignal.timeout(12_000), cache: "no-store" });
    // Read a little so a hung body counts as slow rather than as instantly "up".
    await res.arrayBuffer().catch(() => undefined);
    return { ok: res.ok, status: res.status, ms: Date.now() - t0 };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - t0 };
  }
}

async function rpc<T>(cfg: { base: string; key: string }, fn: string): Promise<T | null> {
  try {
    const res = await fetch(`${cfg.base}/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface WatchState {
  prev?: { active_total?: number; active_no_photo_older_7d?: number } | null;
  lastAlertKey?: string | null;
  lastAlertAt?: number | null;
  lastReport?: unknown;
}

async function readState(cfg: { base: string; key: string }): Promise<WatchState> {
  try {
    const res = await fetch(`${cfg.base}/site_watch_state?id=eq.1&select=state`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return {};
    const rows = (await res.json()) as { state: WatchState }[];
    return rows[0]?.state ?? {};
  } catch {
    return {};
  }
}

async function writeState(cfg: { base: string; key: string }, state: WatchState): Promise<void> {
  try {
    await fetch(`${cfg.base}/site_watch_state`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([{ id: 1, state, updated_at: new Date().toISOString() }]),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    /* state is a convenience; the next run recomputes */
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const cfg = restConfig();
  if (!cfg) return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 });

  const mode = new URL(req.url).searchParams.get("mode") === "digest" ? "digest" : "check";

  const [site, search, crm, snap, counts, state] = await Promise.all([
    probe(`${SITE}/`),
    probe(`${SITE}/api/idx/search?limit=1`),
    probe(`${CRM}/`),
    rpc<WatchInput["snap"]>(cfg, "idx_health_snapshot"),
    rpc<WatchInput["counts"]>(cfg, "site_watch_counts"),
    readState(cfg),
  ]);

  const input: WatchInput = { snap, counts, site, search, crm, prev: state.prev ?? null };
  const verdict = judge(input);
  const now = Date.now();

  let mail: string = "not-needed";
  if (mode === "digest") {
    const m = composeDigest(verdict.problems, verdict.facts);
    mail = await sendWatchMail(m.subject, m.html);
  } else if (shouldAlert(verdict.problems, state, now)) {
    const m = composeAlert(verdict.problems, verdict.facts, verdict.critical);
    mail = await sendWatchMail(m.subject, m.html);
    if (mail === "sent") {
      state.lastAlertKey = verdict.problems.join("|");
      state.lastAlertAt = now;
    }
  } else if (verdict.problems.length === 0) {
    state.lastAlertKey = null;
    state.lastAlertAt = null;
  }

  const report = {
    ok: true,
    mode,
    at: new Date(now).toISOString(),
    problems: verdict.problems,
    critical: verdict.critical,
    mail,
    facts: Object.fromEntries(facts(input)),
  };
  state.prev = {
    active_total: snap?.active_total,
    active_no_photo_older_7d: snap?.active_no_photo_older_7d,
  };
  state.lastReport = report;
  await writeState(cfg, state);

  return NextResponse.json(report);
}
