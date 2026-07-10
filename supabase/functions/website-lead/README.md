# `website-lead` edge function — version-controlled copy + proposed hardening

**Not the deployed source of truth.** The live function
(`https://wpfmhmnceflfruhssqqb.supabase.co/functions/v1/website-lead`, project
`wpfmhmnceflfruhssqqb`, `verify_jwt=false`) is authoritative. `index.ts` here was
**reconstructed from the live function's observed behavior** so the logic lives in git,
and adds hardening for review. **Do not `supabase functions deploy` without Levan's
approval** — it would replace the live lead intake.

## Observed live behavior (reject paths probed 2026-07-10 — no insert performed)

| Request | Live response |
|---|---|
| `OPTIONS` | `204`, `Access-Control-Allow-Origin: https://realtylt.com` |
| `GET` (non-POST) | `405 {"ok":false,"error":"method_not_allowed"}` |
| `POST` malformed JSON | `400 {"ok":false,"error":"invalid_json"}` |
| `POST` honeypot `rlt_hp` set | `200 {"ok":true}` (silent drop, no insert) |
| `POST` missing name/contact | `422 {"ok":false,"error":"missing_contact"}` |

CORS returns a fixed/allowlisted `Access-Control-Allow-Origin` (not reflected), so a
cross-origin browser attacker can't read responses. The real lead flow is **server-to-server**
from the website's `/api/lead` route, which CORS does not gate.

## Proposed hardening (blocks marked `HARDENING:` in `index.ts`)

1. **Explicit origin allowlist, default-deny** — regex allowlist for `realtylt.com`,
   `www.realtylt.com`, and `*.vercel.app`; anything else falls back to the primary origin.
2. **Best-effort per-IP rate limit** (`8 / 60s` → `429`). Edge isolates are short-lived and
   per-region, so this only throttles bursts on a warm isolate — a durable store (a Supabase
   table / Upstash KV) or the platform WAF is the real defense. Documented as such.
3. **Optional shared-secret header** — if `WEBSITE_LEAD_SECRET` is set in the function env,
   the request must send a matching `x-rlt-secret` header, else `401`. **Inert** while unset,
   so it can be rolled out in two safe steps: (a) deploy with the check present but env unset,
   (b) set the env var here **and** add `CRM_LEAD_WEBHOOK_SECRET` on the website so
   `/api/lead` forwards the header. This locks the endpoint to the website.

## To deploy (only with approval)

```
supabase functions deploy website-lead --project-ref wpfmhmnceflfruhssqqb
# then, for the shared secret (optional, step b):
supabase secrets set WEBSITE_LEAD_SECRET=<random> --project-ref wpfmhmnceflfruhssqqb
```

The website side would set `CRM_LEAD_WEBHOOK_SECRET` and send it as `x-rlt-secret`
(a small change to `lib/leads/submitLead`, staged only when the secret is provisioned).
