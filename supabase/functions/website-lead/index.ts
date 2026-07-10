// website-lead — public Supabase Edge Function that receives lead submissions from the
// marketing site's /api/lead route and inserts them into the CRM `leads` table with the
// service-role key (held only inside Supabase; never shipped to the browser).
//
// ────────────────────────────────────────────────────────────────────────────────────
// STATUS: version-controlled copy + PROPOSED HARDENING. NOT the deployed source of truth.
// The deployed function is authoritative; this file was reconstructed from its observed
// behavior (see README.md) and adds the hardening blocks marked `HARDENING:` below.
// Do NOT `supabase functions deploy` this without Levan's review — deploying replaces the
// live lead intake. The hardening is written to be backward-compatible: the shared-secret
// check is INERT unless WEBSITE_LEAD_SECRET is set in the function's env.
// ────────────────────────────────────────────────────────────────────────────────────
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CURRENT: CORS is allowlisted to the marketing origins. The live function returns a
// fixed Access-Control-Allow-Origin; HARDENING makes the allowlist explicit + default-deny
// and echoes only an allowed origin. (CORS only matters for direct browser calls — the
// real lead flow is server-to-server from /api/lead, which CORS does not gate.)
const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?realtylt\.com$/, /^https:\/\/[a-z0-9-]+\.vercel\.app$/];
const PRIMARY_ORIGIN = "https://realtylt.com";

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.some((re) => re.test(origin)) ? origin : PRIMARY_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-rlt-secret",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });
}

// HARDENING: best-effort per-IP rate limit. Edge isolates are short-lived and not shared
// across regions, so this only throttles bursts hitting the same warm isolate — a durable
// store (Supabase table / Upstash KV) or the platform WAF is the real defense. Kept cheap
// and self-contained so it can't break the happy path.
const RATE = { windowMs: 60_000, max: 8 };
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // bound memory
  return arr.length > RATE.max;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
// CURRENT: field length caps (reject absurd values before they reach the DB).
const CAPS = { name: 100, email: 200, phone: 40, message: 2000, address: 200, interestReason: 120, source: 200 };

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  // CURRENT: preflight.
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

  // CURRENT: only POST.
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, origin);

  // HARDENING: optional shared secret. Set WEBSITE_LEAD_SECRET in the function env AND send
  // the same value from /api/lead as `x-rlt-secret` to lock the endpoint to the website.
  // Inert (skipped) while the env var is unset, so this is safe to deploy incrementally.
  const secret = Deno.env.get("WEBSITE_LEAD_SECRET");
  if (secret && req.headers.get("x-rlt-secret") !== secret) {
    return json({ ok: false, error: "unauthorized" }, 401, origin);
  }

  // HARDENING: rate limit per client IP.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429, origin);

  // CURRENT: parse JSON.
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, origin);
  }

  // CURRENT: honeypot — a filled `rlt_hp` is a bot; ack success and drop (no insert).
  if (str(body?.rlt_hp) !== "") return json({ ok: true }, 200, origin);

  // CURRENT: validation — name required, at least one of email/phone, email format, length caps.
  const name = str(body?.name);
  const email = str(body?.email);
  const phone = str(body?.phone);
  if (!name) return json({ ok: false, error: "missing_name" }, 422, origin);
  if (!email && !phone) return json({ ok: false, error: "missing_contact" }, 422, origin);
  if (email && !EMAIL_RE.test(email)) return json({ ok: false, error: "invalid_email" }, 422, origin);

  const lead = {
    name,
    email,
    phone,
    message: str(body?.message),
    address: str(body?.address),
    interest_reason: str(body?.interestReason),
    source: str(body?.source) || "/",
    created_at: new Date().toISOString(),
  };
  for (const [k, cap] of Object.entries(CAPS)) {
    const key = k === "interestReason" ? "interest_reason" : k;
    if ((lead as any)[key] && (lead as any)[key].length > cap) {
      return json({ ok: false, error: "field_too_long" }, 422, origin);
    }
  }

  // CURRENT: insert with the service role (key is a function secret, never client-exposed).
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await supabase.from("leads").insert(lead);
    if (error) {
      console.error("[website-lead] insert failed:", error.message);
      return json({ ok: false, error: "server_error" }, 500, origin);
    }
  } catch (e) {
    console.error("[website-lead]", e instanceof Error ? e.message : String(e));
    return json({ ok: false, error: "server_error" }, 500, origin);
  }

  return json({ ok: true }, 200, origin);
});
