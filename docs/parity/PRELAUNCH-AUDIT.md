# Pre-launch audit — 2026-07-27

Owner asked for a full pre-launch check: what did we miss, how secure is everything, and fix the
design inconsistency where some CTAs and shapes are rounded while others are still square.

Everything below was **measured**, not assumed. Evidence: `docs/_audit/launch/audit.json`,
`scripts/_scratch-launch-audit.mjs`, `scripts/_scratch-security-probe.mjs`,
`scripts/_scratch-security-triage.mjs`.

---

## 1. WHAT IS ALREADY GOOD (verified, not assumed)

- **All 23 sampled routes return 200.** The only two 404s in the sweep were slugs I guessed wrong;
  the real ones exist.
- **Zero dead internal links** across 155 unique targets.
- **Zero horizontal overflow** at 1440, 390 **and 320** on every route.
- **Console is clean.** The 351 errors in the raw sweep were `net::ERR_FAILED` from my own aborted
  image/media requests. Real errors: 2, both from my wrong slugs.
- **No secrets in the browser bundle**: no service-role JWT, no MLS token, no cron/sync secret, no
  private keys. The only JWT shipped is the anon key, which is designed to be public.
- **All security headers present** on prod: CSP, HSTS (2y, preload), X-Content-Type-Options,
  X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, and X-Robots-Tag noindex (pre-launch).
- **Cron/admin routes reject anonymous callers**: `/api/cron/idx-sync`, `/api/cron/sync-mls`,
  `/api/cron/mls-probe` all 401; `/api/revalidate` 405 on GET.
- **RLS holds where it matters.** As an anonymous visitor with the public key I could NOT read
  `leads`, `chat_logs`, `n8n_chat_histories`, `contacts`, `market_reports`, `api_keys`,
  `organizations`, or the three `chatbot_transcript_*` views (permission denied).
- **Blog drafts are not exposed** — anon sees only `status='published'` (0 non-published visible).
- `sitemap.ts`, `robots.ts` and a custom `not-found.tsx` all exist.

---

## 2. SECURITY FINDINGS

### 2.1 HIGH — every published CMA is enumerable by anyone (needs a CRM change too)
`cma_reports` has policy `cma_reports_public_select` → `anon SELECT where status='published'`.
That permits **enumeration**: an anonymous caller can list *every* published CMA, not just the one
whose share link they hold. Each row carries `prepared_for` (a client's name), `subject`,
`contact_id`, `owner_id`, `criteria`, `stats`, and the suggested price range.

Today only **1** published row exists, so the present exposure is a single test report — but this
becomes a real client-data leak the moment the owner publishes real CMAs.

This is the same flaw class as the `market_reports` enumeration that was already fixed:
`market_reports` now has **no anon policy at all** and is served through the SECURITY DEFINER RPC
`get_active_market_report(report_id uuid)`.

**Fix (must ship as one change across two repos — NOT done here):**
1. add a `get_published_cma_report(report_id uuid)` SECURITY DEFINER function, mirroring
   `get_active_market_report`;
2. point the CRM's `apps/web/lib/data/cma-public.ts::getPublishedCmaReport` at that RPC (it
   currently does `.from('cma_reports').select('*').eq('id',id).eq('status','published')`);
3. only then `drop policy cma_reports_public_select on public.cma_reports`.
Dropping the policy first would break the CRM's public CMA page, which is why it was not touched
from this session.

### 2.2 HIGH (compliance) — raw MLS MediaURLs are publicly readable
`idx_listings` policy `site reads active listings` grants `anon SELECT` on active rows, and the
`listing` JSONB contains the **raw signed MLS Grid MediaURLs**
(`https://media.mlsgrid.com/token=…`). Confirmed by reading them with the public anon key.

Our own code never does this from the browser — `lib/idx/db.ts` is server-side — but the anon key
ships to visitors (`/api/auth/config` returns it for sign-in), so anyone can query PostgREST
directly and pull the URLs out.

MLS Grid's rule, quoted in our own media route: *"the raw MediaURL must not appear on the site."*
Publishing it through a public API endpoint is worse than rendering it. The account is already
rate-limited and at suspension risk.

Mitigating facts: the URLs expire ~1h after capture, so nearly all stored values are already dead.
This is a compliance and hygiene problem more than a live-data one.

**Options (owner's call, none applied here):**
- (a) store proxy paths (`/api/media/<id>/<n>`) in `listing.photos` and keep raw URLs only in
  transit during the sync — cleanest, but touches the rate-sensitive MLS sync path;
- (b) give the server its own Postgres role/key and narrow `anon` to non-`listing` columns —
  architectural, the read path currently states "no service-role key exists in this stack";
- (c) accept it, documented, on the grounds that the URLs are expired.
Recommendation: (a), scheduled deliberately as its own piece of work, not bolted on before launch.

### 2.3 LOW / housekeeping
- **Leaked-password protection is disabled** in Supabase Auth (HaveIBeenPwned check). One toggle in
  the dashboard; worth enabling before real accounts exist.
- `public.lead_phone_digits` has a mutable `search_path` (advisory 0011).
- `pg_net` is installed in the `public` schema (advisory 0014).
- Several SECURITY DEFINER functions are anon-executable. The website's own
  (`idx_sync_apply`, `idx_sync_schedule`) are **secret-gated inside the function body**, so this is
  acceptable; the rest (`dialer_*`, `verify_api_key`, `backfill_contact_from_lead`) belong to the
  CRM and should be reviewed there.

---

## 3. ACCESSIBILITY / QUALITY FINDINGS

Real defects (the `1x1` "Skip to content" links are the standard visually-hidden skip pattern and
are fine; the two `1x1` inputs on the listing page are lead honeypots and are fine):

| where | what | measured |
|---|---|---|
| `/top-areas/*` | breadcrumb "Top Areas" link | 78x**15** px |
| `/connect` | phone + email links in body | 97x**17**, 118x**17** |
| `/selling` | "See all our Google reviews" | 163x**17** |
| `/services/*`, blog article | "(917) 905-7923" | 97x**17** |

WCAG 2.5.8 wants 24px minimum. The footer versions of these were fixed in an earlier round; the
in-body ones were missed. Same one-line `inline-flex min-h-6` treatment applies.

Meta: `/privacy-policy` description is 59 chars and `/dmca-terms` 56 (want ~80-170).
`/listing/*` titles run 64 chars (previously judged intentional — price aids click-through).

---

## 4. DESIGN: the radius inconsistency the owner reported

Measured from **rendered** pages, not source. The site currently ships **eight** different button
radii and three input radii:

```
BUTTON   16px:69   4px:51   0px:48   50%:47   3px:40   12px:32   2px:11
INPUT    12px:161  0px:53   20px:23
CARD     0px:114   16px:6
```

Worst offenders by route: `/search` (15 square buttons, 9 square inputs, 36 square cards),
`/listing/*` (8 / 9 / 3), `/financing` (5 / 9), and the card grids on home (16), blog (13),
services (13), top-areas (11).

**Root cause:** two design eras coexist. The shared design system is already round —
`components/ui/Button.tsx` and `components/ui/Field.tsx` both use `rounded-xl` (12px), and the
newer services/blog work uses `rounded-2xl` / `rounded-3xl` / `rounded-[10px]` / `rounded-[14px]`.
But many older pages hand-roll their own buttons and inputs with `rounded-[2px]`, `rounded-[3px]`,
`rounded-[4px]`, `rounded-[6px]`, `rounded-sm` instead of using the shared components. That is
exactly the "some CTAs are rounded, some still have rough 90 degree angles" the owner sees.

### The scale to standardise on (anchored on what the design system ALREADY uses)
| token | value | applies to |
|---|---|---|
| `rounded-lg` | **8px** | small overlay controls, badges, status chips, tags |
| `rounded-xl` | **12px** | **all** buttons/CTAs, inputs, selects, textareas, filter chips |
| `rounded-2xl` | **16px** | cards, panels, media tiles, photo tiles, modals/sheets |
| `rounded-3xl` | **24px** | large feature panels and showcase surfaces |
| `rounded-full` | pill | icon buttons, avatars, pagination dots, pills |

Deliberately NOT changed: device-mockup bezels (`rounded-[30px]`, `rounded-[34px]`,
`rounded-[22px]`, `rounded-[14px]` inside laptop/phone frames) — those are drawn hardware, and the
`50%` / `rounded-full` circles.

Also unify **the media corners with their container**: a `rounded-2xl` card holding a `0px` image
reads as a mistake, which is part of what makes the current grids look unfinished.
