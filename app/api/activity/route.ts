import { NextResponse } from "next/server";
import { buildRpcBody, parseBeacon } from "@/lib/activity/contract";

/** THE ONLY CALLER OF THE CRM'S record_site_visit DOOR (round 51, D12).
 *
 * The browser posts a beacon here (lib/activity/beacon.ts — only ever after a real lead
 * submit stamped an identity); this route attaches SITE_ACTIVITY_SECRET server-side and calls
 * the secret-gated RPC. The secret NEVER reaches a browser, which is the whole point of the
 * hop. Per the door's contract: matched:false means "no such contact yet" and is a no-op —
 * never retried, never an error.
 *
 * Degrades to a silent no-op (still 200) when the env is not configured, so the site never
 * breaks over tracking; the health watch and the checkpoint carry the arming state. */

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const beacon = parseBeacon(body);
  if (!beacon) return NextResponse.json({ ok: false, error: "bad beacon" }, { status: 400 });

  const secret = process.env.SITE_ACTIVITY_SECRET;
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!secret || !url || !anon) return NextResponse.json({ ok: true, skipped: "not-configured" });

  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/record_site_visit`, {
      method: "POST",
      headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildRpcBody(beacon, secret)),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return NextResponse.json({ ok: true, skipped: `rpc ${res.status}` });
    const out = (await res.json()) as { matched?: boolean };
    return NextResponse.json({ ok: true, matched: out.matched === true });
  } catch {
    return NextResponse.json({ ok: true, skipped: "rpc unreachable" });
  }
}
