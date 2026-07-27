# Pre-launch audit — 2026-07-27

Owner asked for a full pre-launch check: what did we miss, how secure is everything, and fix the
design inconsistency where some CTAs and shapes are rounded while others are still square.

Everything below was **measured**, not assumed. Evidence: `docs/_audit/launch/audit.json`,
`scripts/_scratch-launch-audit.mjs`, `scripts/_scratch-security-probe.mjs`,
`scripts/_scratch-security-triage.mjs`.

---

## 0. LAUNCH CHECKLIST — the switches that must flip, in this order

These are configuration, not code. Doing them out of order is the main way this launch can go wrong.

1. **Fix `NEXT_PUBLIC_SITE_URL` in the Vercel environment BEFORE removing the noindex.**
   Measured on prod today: every canonical, every JSON-LD `url`, `og:url`, and all **58 sitemap
   entries** emit `https://realtylt-website.vercel.app/...`, because that value is set in Vercel.
   ```
   canonical: https://realtylt-website.vercel.app/selling
   sitemap  : 58/58 entries on realtylt-website.vercel.app
   ```
   It is harmless right now because the whole site is `noindex`. The moment indexing is enabled
   with this value still set, the real domain will be telling Google its canonical lives on a
   different host — the worst possible first impression for a new site. `lib/site.ts` already
   falls back to `https://realtylt.com` when the variable is UNSET, so the fix is to remove or
   correct it in Vercel, then redeploy, then re-check a canonical.
2. **Point the realtylt.com apex at this deployment.** The `/ai` page's links into `/services/*`
   only resolve after the apex migration.
3. **Remove `PRELAUNCH=1`** from the Vercel environment. That single flag drives both
   `X-Robots-Tag: noindex, nofollow` and `robots.txt: Disallow: /`. Verify after deploy:
   `robots.txt` should switch to `Allow: /` with a `Disallow: /api/` and a sitemap line.
4. **Re-verify** (in this order): a canonical on the apex, `robots.txt`, `sitemap.xml` hosts, then
   submit the sitemap in Google Search Console.
5. **Enable Supabase Auth leaked-password protection** (dashboard toggle, see 2.3).

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

### 2.4 The public API surface holds up (reviewed, not just scanned)
- `POST /api/lead` is genuinely defended: per-IP sliding-window throttle runs FIRST, JSON
  content-type enforced (blocks simple-request/form-encoded shapes), body capped at 16KB by both
  declared and actual length, honeypot hits return a silent success, validation errors are 400, and
  failures never leak internals.
- `/api/idx/search` clamps `pageSize` to a maximum, `/api/idx/pins` caps at `PIN_CAP` (800), and
  `/api/reports/market` validates `county` against the `SERVED_AREAS` allowlist. No unbounded
  scrape of the 28k-row catalogue through our own endpoints.

### 2.3 LOW / housekeeping
- **Leaked-password protection is disabled** in Supabase Auth (HaveIBeenPwned check). One toggle in
  the dashboard; worth enabling before real accounts exist.
- ~~`public.lead_phone_digits` has a mutable `search_path` (advisory 0011).~~ **FIXED 2026-07-27**
  (migration `pin_lead_phone_digits_search_path`). Pinned to `pg_catalog, pg_temp`; the function is
  IMMUTABLE and only calls built-ins, so it is behaviour-preserving — verified after the change:
  `+1 (917) 905-7923` → `9179057923`, plain 10-digit unchanged, empty and null → null.
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

---

### 4b. DONE — what the scale actually collapsed to

Applied in `589256c` (search / listing / financing), `cb04648` (card grids, marketing pages,
portal) and `8509eaf` (surfaces a rendered sweep can't see). Re-measured with
`scripts/_scratch-radius-inventory.mjs` on the same 23 routes at 1440.

**RAW — every element the selector matches, before → after** (same script logic both runs):

```
BUTTON  before  16px:66  4px:49  0px:47  50%:44  12px:32  2px:10  full:6  3px:4
        after    8px:82 16px:69 12px:58  50%:47  0px:41  full:6   2px:1
INPUT   before  12px:161 0px:53 20px:22
        after   12px:163 0px:51 full:23
CARD    before   0px:78  16px:6
        after   16px:105 0px:15
```

Every hand-rolled `rounded-[2px]/[3px]/[4px]/[6px]` is gone from the app (`2px:1` is Google
Maps' own fullscreen control, which we do not own). Cards inverted: 78 square / 6 round became
105 round / 15 raw-square.

**RAW over-counts.** It counts elements that have no corner to see, and those can never reach
zero:

* the header "Sign In" / "More" / "All Listings" text buttons — no background, no border;
* the `#lead-hp` honeypot input, parked at `-9999px` on every page;
* segmented-control children (FOR SALE/FOR RENT, GRID/MAP) — 0px each, but the group around
  them is `overflow-hidden rounded-xl`, so they render round;
* an `<img>` inside a rounded `overflow-hidden` card keeps `border-radius: 0` in computed style
  while rendering with rounded corners, so the IMAGE row measures nothing useful.

So the inventory also reports a **VISIBLE-BOX** tally: on screen, actually paints a box
(background / border / shadow), and not already clipped round by an ancestor.

```
BUTTON  12px:48  8px:36  50%:24  full:6  ||  0px:2  2px:1
INPUT   12px:163                         ||  0px:15
CARD    16px:105                         ||  0px:0
```

Everything right of the `||` is deliberate and enumerated:

| left square | why |
|---|---|
| `/financing` + `/listing` calculator fields (14) | underline fields (`border-b` only). They have no box; a radius would bend the underline. |
| `/home-value` unit field + "Find Out" (2) | middle and right cap of one joined control. Only the group's outer corners round — `rounded-l-xl` on the address field, `rounded-l-none rounded-r-xl` on the button. |
| `/listing` "Request a Tour" tab (1) | `border-b-2` underline tab, not a box. |
| `gm-fullscreen-control` (1) | Google Maps' own UI. |

Also left alone on purpose: device-mockup bezels **and their miniature internals** on
`/buying` and `/selling` (a 3px corner inside a 200px-wide mock phone is at mockup scale — the
real-scale mock listing card and its date chips on `/buying` were rounded); chat-bubble tails
(`ServiceFigure`, the chat widget's 4px `border-bottom-left-radius`); inline `<code>` in
`lib/blog/markdown.tsx`; full-bleed hero photographs, the RealtyLT logo and partner logos.

`components/blog/**` needed no change — its article page measures 12px inputs, 12px buttons,
no square cards, and its only square painted boxes are full-bleed sections.

Two size-proportional sub-rules were used inside the scale, and are worth keeping:
media ≥ ~120px gets `rounded-2xl`, thumbnails/strips get `rounded-lg`; and an inner block
flush to a bordered card's edge takes the outer radius minus the border width
(`rounded-2xl` card with `border-2` → `rounded-t-[14px]` header, which is why the /selling
option cards have no white slivers at the top corners).

### 4c. ORCHESTRATOR VERIFICATION — and one class the sweep missed

Re-checked independently: `npx tsc --noEmit` clean and `npm test` **447/447**, both run in the
foreground by me; home at 390 and `/search` at 1440 eyeballed (cards, controls, inputs, area
chips and in-card photos all read as one system now).

**Found a gap the radius pass missed, because the inventory keyed on button/input/card selectors
and status badges are `<span>`s.** A separate probe over filled small shapes
(`scripts/_scratch-badge-radius.mjs`) found **61 square badges**, including the `New` and
`Coming Soon` chips on every `/search` card. `ListingCard` renders those chips **twice** — the
default variant had been given `rounded-lg`, the `plain` variant used by the search grid had
not. So the identical chip was 8px on the home rail and 0px on the search grid, which is
precisely the inconsistency the owner reported.

Fixed in `476f1b4`. Re-measured across 10 routes: **square badges 61 → 3**, and the 3 survivors
are placeholder tiles inside the `/buying` device mockups, i.e. mockup internals, correctly left
alone. The `4px` price chips on `/selling` are likewise inside a `LaptopFrame`.

Lesson for the next design sweep: **an inventory keyed on element type will miss whole classes.**
Measure by what a shape *looks* like (has a fill, has a box, is small) as well as by what tag it
is.

### 5. HARDENING PASS — real defects found by driving the states nobody looks at

Commits `19f0d3c`, `78e1cc6`, `7089a45`, `2e20f00`, `d93bd74`, `23fcab1`, `bf285da`.
Sweeps went wider than the audit's named items in every case (47 route/width combinations for
tap targets, all 60 routes for meta), which is why several of these were not in section 3.

| defect | why it mattered |
|---|---|
| **Every text control was 14px** | iOS Safari zooms in on focus below 16px and never zooms back, so *any* form on an iPhone stranded the visitor on a horizontally-scrolling page. Controls now floor at 16px below `md`; the `/search` filter strip opts out deliberately. |
| **`/api/lead` leaked its plumbing** | On a CRM failure the visitor's error banner read *"CRM webhook responded 500"*. The route now logs the internal reason and returns a human line; the form shows server text for 4xx (real validation) and its own wording plus the phone number for 5xx. |
| **One priceless feed row blanked the whole search grid** | `undefined.toLocaleString()` inside a card unmounts the entire list. Degrades to "Price on request" now. Honest scope: 1,200 live rows sampled, zero null prices — this is a guard against data we do not control, where the blast radius is a whole page. |
| **Sign-in modal and the `/services/*` ToC sheet were not really modal** | Tab reached the page behind (12 and 8 presses), the page scrolled underneath, and Esc left focus on `<body>`. Worth knowing for next time: capturing `document.activeElement` inside the modal's own effect does **not** work — `autoFocus` has already moved focus, or the trigger has unmounted. The capture has to happen in the click handler. |
| **`/saved` was a dead end without JS** | Showed "Loading your saved items…" forever, no explanation, no way out. |
| **No print stylesheet** | The chat launcher printed on top of every page; sticky sub-nav and ToC rails floated over the content. |
| Long addresses / 24px targets on the 404 and `/portal` | A 75-char address rendered a 530px card in a 390px viewport. |

Tests went 447 → **459**. The agent's own browser probes finished at 472 assertions, 0 failures.

Two disclosures from that pass worth keeping, both to its credit: it nearly filed a "pagination is
broken" bug that was only dev-server compile latency, and an "XSS in listing data" bug that was its
own probe substring-matching `innerHTML` — which still contains `onerror=alert` precisely *because*
React escaped it. Both probes were corrected rather than the findings shipped.

**Left for others, deliberately:** `components/blog/ArticleToc.tsx` and `FlagshipToc.tsx` have the
same `aria-modal` gap that was fixed in `ServiceToc` (blog session owns those files); 10 service and
11 blog titles exceed 65 chars once ` | RealtyLT` is appended (descriptions were the brief, titles
are a separate call); `/portal/reports/<unknown-uuid>` stays HTTP 200 on purpose, because a 404
would tell an anonymous caller which report ids exist.

### 4d. Unrelated defect found during this pass — the chat widget shipped mojibake

`public/rlt-chat.js` had been double-encoded at some point (UTF-8 bytes read as Latin-1 and
re-encoded), so the widget served literal mojibake to every visitor on every page:

```
header : RealtyLT Â· RealtorÂ® in NY Â· Live MLS
footer : RealtyLT Â· Levan Tsiklauri, RealtorÂ®
close  : âœ•                (instead of ✕)
reply  : "Hmm, I didn't catch that â€” try again?"
```

Fixed in `665fc9e` and verified in the browser. Note this is **deliberate drift** from the pasted
BlueRoof source: live ships the same broken glyphs, and the standing rule is that we do not copy
live's bugs. The chat fallback reply was rewritten without an em dash rather than having one
restored, since it is visitor copy.
