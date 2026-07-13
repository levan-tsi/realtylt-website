import { NextResponse } from "next/server";
import { leadRateLimited, parseLead, submitLead } from "@/lib/leads";

// A lead is a handful of short text fields — cap the accepted body well below any
// legitimate submission so oversized/garbage payloads are rejected before parsing.
const MAX_BODY_BYTES = 16 * 1024;

/** Client IP for throttling: first hop of x-forwarded-for (Vercel sets it), then
 * x-real-ip, else a shared constant — worst case unproxied traffic shares one window. */
function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  try {
    // Best-effort per-IP throttle (in-memory sliding window — per instance, resets on
    // cold start; Vercel WAF is the durable layer). Runs first so throttled traffic
    // costs nothing further.
    if (leadRateLimited(clientIp(req))) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    // Enforce JSON content-type (the only thing the client sends) — blocks form-encoded
    // and other simple-request shapes that don't belong here.
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 415 });
    }

    // Reject oversized bodies — first cheaply by the declared length, then by the
    // actual bytes read (a lying/absent Content-Length can't slip a huge body through).
    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Request too large." }, { status: 413 });
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Request too large." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const source =
      typeof (body as Record<string, unknown>)?.source === "string"
        ? ((body as Record<string, unknown>).source as string)
        : "/";

    const parsed = parseLead(body, source);

    // Honeypot hits are dropped silently — bots see success.
    if (parsed.kind === "spam") return NextResponse.json({ ok: true });

    if (parsed.kind === "invalid") {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const result = await submitLead(parsed.lead);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (e) {
    // Never return a non-JSON 500 — the client always calls res.json().
    console.error("[api/lead]", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong on our end. Please call or text instead." },
      { status: 502 },
    );
  }
}
