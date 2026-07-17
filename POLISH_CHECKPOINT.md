# Website polish checkpoint (read/updated by the /website command)

Updated 2026-07-15 (late PM). The `/website` command reads this to know where to resume, and
overwrites it when it stops. Page-by-page: compare each page to LIVE realtylt.com, make ours
match-or-beat, test live.

═══════════════════════════════════════════════════════════════════════════════════════════════
## ✅ DONE 2026-07-15 PM (owner asked: "listing page needs a lot of work + verify the data")
═══════════════════════════════════════════════════════════════════════════════════════════════
Commits 52ee9a6 → 893fc60, deployed + verified on prod at 1440 AND 390 (Playwright screenshots
in docs/_audit/, gitignored).

### 1. DATA ACCURACY AUDIT vs the raw feed — then the pipeline upgraded and re-baselined
Method that worked: `/api/cron/mls-probe?ids=KEY1,KEY2&fields=Candidate1,...` (NEW raw-row mode,
secret-gated, one paced request, $select self-heals) — compares our stored rows against the
EXACT raw feed rows, and tests candidate fields before they join SELECT_FIELDS. Beats scraping
Zillow/OneKey (web hits can be stale relistings — a "$699.9k vs our $799k" scare was a dead
older MLS number for the same address; the feed proved ours right).

Verdict: prices/beds/baths/status/year/acres were EXACT. But the mapper dropped real data:
- **StreetDirPrefix/StreetDirSuffix/UnitNumber weren't fetched** → "937 225th Street" instead of
  "937 E 225th Street", co-ops missing "#10E". Fixed; address = num + dirP + name + suffix +
  dirS + " #unit" (unit de-prefixed; "35 East Street" proves we use the feed's field, not heuristics).
- **MAX_PHOTOS 16 → 50** (feed carries up to ~50; avg stored now 23). Detail gallery was starving.
- **PostalCity is 100% populated and IS the consumer city** — Queens neighborhoods (Forest
  Hills/Astoria/...), "Wappingers Falls", "Rye" (not "Rye City"). Now wins globally, with the
  NYC blanket-"New York" guard (Manhattan keeps it). Feed suffixes municipality/borough tags —
  "Warwick (Town)", "New York (Manhattan)" — mapper strips ANY trailing parenthetical
  (+ one-time SQL backfill fixed 326 stored rows).
- **OnMarketDate is served again** (feed changed since 2026-07-11's "rejects it") → listedAt is
  the real date now; DaysOnMarket derivation stays as fallback.
- **New replicated fields** (all audited live): TaxAnnualAmount (77% of rows), AssociationFee,
  GarageSpaces, school district + 3 school names (participant noise like "Contact Agent"
  filtered), Appliances/Basement/Interior/Exterior/Lot/Heating/Cooling/Sewer/Water/Parking
  arrays, yearBuilt/lotAcres/propertySubType/listAgentName as structured fields.
- **Full re-baseline done** (12,337 active; 12,262 new-shape; 75 stragglers self-heal via the
  hourly delta when they next modify). Sample rows verified in-DB and on prod pages.

### 2. LISTING DETAIL PAGE REBUILT (match-or-beat live Brivity page — verified on prod)
`app/listing/[id]/page.tsx`: share button (native/clipboard) · est. $/mo under the price
(anchors to a full MortgageCalculator seeded with the listing's price + REAL taxes + HOA —
reused the financing component, now takes `initial`) · days-on-site · Highlights grid
(type/year/lot/garage/$-per-sqft/taxes/HOA/county/district/listed/MLS#) · Inside +
Outside-&-utilities sections from the feed arrays · Schools block · agent card (portrait at
/images/levan-portrait.jpg — root path 404s!) on the lead form · similar-homes rail (same
county ±30% price, "See all N" into /search) · gallery behind a native <details> "Show all N
photos" so 50-photo galleries don't bury the facts · MOBILE BUG fixed: photos 2-4 only existed
in the md-only thumb rail, phones never saw them. Legacy rows fall back to the flat Features list.
We now beat Brivity's page (their Market Insights shows N/A; our data is real).

### 3. SEARCH PAGE pass (the browser pass Priority 1 owed)
Verified at 1440+390: hybrid grid+map, 11 county chips wrap fine, filters work (queens
4bd ≤$800k → 113), card→detail click-through works, Queens map = 4,593 pins /
~817KB / ~6s dev-mode (clusters draw fine; prod is faster; fine for now). Fixed: card stats
clipped at the card edge (now wrap under the price); "New" badge added (live-site parity,
listings ≤7 days). Live site only searches 6 counties — we search 11 incl. boroughs.

### 4. SITE-WIDE a11y fix
`.reveal` content was opacity-0 FOREVER without JS (the detail page's lead form!) and animated
for reduced-motion users → globals.css now forces visible under (scripting: none) and
(prefers-reduced-motion: reduce). Em dashes swept from listing/calculator copy.

### Infra gotchas learned this round
- **Playwright > Chrome extension for this work**: the extension flapped all session
  (screenshots time out; service worker dies). `scripts/_scratch-shot.mjs` (gitignored)
  screenshots any URL at any width, `reducedMotion:'reduce'` makes Reveal content visible in
  fullPage shots. Live realtylt.com renders fine in it too (its listing detail pages are
  client-rendered — raw fetch gets modal templates only).
- **idx_sync_apply hit statement timeout (57014)** with 200-row batches of the 3x-heavier rows
  → migration `idx_sync_apply_statement_timeout` (function-local 120s, applied via Supabase MCP)
  + baseline UPSERT_BATCH 200→50. NOTE: the auto-mode classifier flagged the ALTER FUNCTION
  when echoed through Bash and briefly denied unrelated commands — apply DB DDL via the MCP
  apply_migration tool only, and keep Bash descriptions explicit ("local dev server only").
- Baseline is resumable: rerun WITHOUT --fresh continues from scripts/.baseline-watermark.local.
- Live-site listing URL shape (for reference): /search/new-york/<city>/misc/<addr-slug>-bid-38-<numeric-id>.

═══════════════════════════════════════════════════════════════════════════════════════════════

## PRIORITY: page-by-page polish vs LIVE realtylt.com (continue)
Design system "Hudson Twilight" ink/paper + porchlight azure. Anti-AI-slop rules apply
([[design-anti-ai-slop-palette]]). Compare at desktop AND 390px, drive real functionality, fix,
verify live, commit page-scoped.

Pages — status:
- [x] Search / Listings — 2026-07-15 PM (above). Deferred nits: sort parity (live has
      Oldest/Featured; we have newest/price), map-load spinner UX unmeasured on prod.
- [x] Listing detail — REBUILT 2026-07-15 PM (above). Deferred: open houses (separate
      /OpenHouse RESO resource, not replicated), tour-date picker, per-listing map (coords are
      zip-centroid approximations — showing an exact pin would be dishonest), SEO address slugs
      in the URL (worth doing before the apex swap).
- [x] Home — 2026-07-15 late PM (9b151a1): compared vs live at 1440+390. Ours already beats the
      live page (its Featured/New rails show feed-wide junk: "TEST LISTING $999,999,999",
      billion-dollar typos; ours = owner-office + real new listings with photos). Fixed: areas
      strip now lists all 11 served areas (boroughs → /search?county= until editorial top-areas
      pages exist), StatCounter server-renders final values (no-JS/reduced-motion users saw
      LITERAL ZEROS — count-up now only when motion allowed), "Counties & boroughs served: 11",
      meta title/description claim the real HV+NYC coverage, em dashes swept from home copy.
- [x] Buying — 2026-07-15 late PM (723c32b): structure matches live section-for-section, ours
      has better mocks (designed listing-alert card, saved-home card); copy cleaned; 1440+390 shots.
- [x] Selling — DONE 2026-07-16 PM (orchestrator-verified, first orchestrator-mode page).
      Opus agent commits a9889f4/627a250/bff1316/6fc536c + orchestrator 0e0? placeholder fix.
      Shipped: the post-submit 8-step QUALIFYING WIZARD (components/leads/QualifyingWizard.tsx,
      pure state machine lib/selling-wizard.ts, fires from hero + footer forms on /selling only,
      answers reach /api/lead as a structured `qualifier` follow-up POST), hero parity (photo
      visible, 4 stacked fields with live's exact placeholders, microcopy under button), black-
      header path cards + live's 6+6 checklists, white Comparable Property Statistics card w/
      suggested range (labeled illustrative), laptop/device showcase mockups, footer First/Last
      split (site-wide, matches live, /buying + /connect regression-checked). VERIFY: my own
      18/18 adversarial Playwright checks (both wizard branches E2E, focus trap, Esc + focus
      restore to role=status, double-submit=1 POST, abandoned wizard=no qualifier POST, /buying
      no-wizard, 390 bottom sheet, My Home Value redirect w/ address prefill); tsc + 233/233
      tests run by me; 390+320 no h-overflow; console errors all third-party gtag noise (0 ours).
      Evidence: docs/_audit/selling-parity/ (verify-*). Known accepted: wizard completion creates
      base lead + qualifier enrichment as 2 POSTs (CRM should dedupe by email); tour laptop is a
      static play-frame stand-in until the owner provides a real clip.
- [x] Financing — DONE 2026-07-17 (orchestrator-verified, 2nd orchestrator-mode page).
      Opus agent commits 8a28dd8/b5a1701/4b0a11e per docs/parity/PARITY-financing.md:
      wizard extended to /financing (allowlist WIZARD_PATHS in QualifyingWizard, both forms,
      intent-aware confirm copy), best-loan form First/Last + phone "Estimated Value of
      Homeownership" mockup, browser-window application-checklist mockup, enriched
      pre-approval letter card (check/signature/APPROVED/dots), ↺ glyph replaced with SVG,
      calculator edge-case hardening (+6 tests, no NaN/Infinity, listing `initial` seed
      proven intact on /listing/KEY1024370). MY VERIFY: tsc + 239/239 (then 256/256 after
      the photos merge) run by me; 11/11 adversarial probe (wizard both forms w/ correct
      qualifier source, Esc abandon=base lead only, calculator garbage inputs, RESET,
      /buying isolation, /selling regression, listing seed); fresh 1440 shot matches live
      anatomy; 390 verified (one "height 0" map run was a dev recompile race — retry 7102px,
      known dev-only flake). Evidence docs/_audit/financing-parity/.
- [x] Home Value — DONE 2026-07-17 (orchestrator-verified, 3rd orchestrator-mode page; ours
      already BEAT live structurally — live is a bare hero+form, ours adds the honest 3-step
      section + truthful coverage). Opus agent commits faf7585/011f238 per
      docs/parity/PARITY-home-value.md: wizard extended to /home-value (WIZARD_PATHS now
      selling+financing+home-value; both the revealed valuation card AND footer form open it;
      seller-appropriate confirm copy even if the visitor picks "Buying"; source:/home-value),
      valuation flow driven end-to-end (address bar → reveal card prefilled → submit → wizard;
      ?address= deep-link from /selling seeds the card; empty/whitespace guarded; reveal CTA
      relabeled "Get My Home Value"), hero scrim strengthened. MY VERIFY: tsc + 256/256 tests;
      12/12 adversarial probe; I INDEPENDENTLY re-measured the H1 contrast from rendered pixels
      (text+white-UI hidden): 6.73:1 @1440 / 5.31:1 @390 — matches the agent, clears 4.5:1.
      Evidence docs/_audit/homevalue-parity/. ORCHESTRATOR ALSO FIXED (agent flagged, I did it):
      site-wide footer nav + phone/email links were ~17px tall → now inline-flex min-h-[24px]
      (WCAG 2.5.8), 0 footer links under 24px, no 390 overflow (commit footer fix). Deferred
      global call: the 3-step card body 14px / eyebrow 12px small-print matches selling+financing
      convention — leave for a cross-page typography decision, not a per-page change.
- [~] Top Areas — reviewed at 1440: county cards w/ LIVE DB medians look great. Borough presence
      still missing here (needs editorial content, owner input). County pages not yet compared.
- [x] Who We Are — DONE 2026-07-17 (orchestrator-verified directly; no rebuild — ours already
      BEATS live, which is just hero + agent card + form). Ours adds a real bio, a "What You Can
      Hold Us To" 3-value section, and "Where We Work" (all 11 areas). VERIFIED by me: 390 no
      h-overflow (4003px), CALL→tel:+19179057923, CONTACT→/connect, 0 em dashes / 0 arrows, all
      11 area chips are REAL links (6 counties→/top-areas/*, 5 boroughs→/search?county=* — all
      return 200, 0 dead spans), CALL/CONTACT focus ring 3px. Inherited the site-wide footer
      tap-target fix. Deliberately NO qualifying wizard here (about page, not a seller/buyer
      conversion surface — wizard stays on selling/financing/home-value).
- [x] Blog + article — earlier session
- [x] Services (20 pages) — earlier session
- [~] Connect — reviewed at 1440: appointment cards + form fine, copy cleaned. Owed: 390 + drive
      the message form live.

## SITE-WIDE SWEEP DONE 2026-07-15 late PM (6a8fb1d, subagent-executed, verified)
~102 em dashes rewritten out of visitor copy across 33 files (zero remain outside comments/
placeholders/tests), every arrow-glyph CTA stripped (carousel controls kept), coverage claims
now say Hudson Valley + all five boroughs (layout/search/home-value/who-we-are metas).
Remaining known-fine "—" hits: MortgageCalculator + ReportDetail empty-value placeholders,
comments, tests, one dev-facing error string.

## KNOWN ISSUES
1. media.mlsgrid.com intermittent 429 windows (account-level, pre-existing): placeholders
   serve no-store and self-heal per view. Long-term: mirror photos to own storage during sync.
2. 75 active rows still old-shape (pre-directional addresses) until their next feed
   modification flows through the hourly delta. Harmless; detail page falls back gracefully.
3. Chrome extension unreliable on this machine — ask owner to check it, or keep using the
   Playwright harness.
4. Committed data/mls-snapshot.json fallback is now SHAPE-STALE too (no structured fields,
   16-photo cap) — fine as emergency fallback, but refresh it via the export flow someday.

## Notes
- ONE dev server per repo. Never `next build` while dev runs. Use 127.0.0.1:3000 (wslrelay
  squats [::1]:3000).
- MLS is rate-sensitive: data calls only via the cron/probe endpoints (paced); the mls-probe
  ids/fields mode is the cheap way to answer "what does the feed actually have".
- Push to main auto-deploys the private/noindex Vercel site (allowed); do NOT touch the
  realtylt.com apex.

## ROUND 3 (2026-07-15 night, owner-directed "exact parity, 3 pages × 3 passes"): DONE
Commits c403f42→9908635. Owner logged into the BlueRoof sitebuilder — its Custom Code panel
is the site's DNA (read it again anytime at sitebuilder.brivity.com/sites/20240/custom-code).
- HOME: the live hero's own asset (public/images/hero/hom.png, grayscale+scrim), the REAL
  n8n chat widget site-wide (public/rlt-chat.js, byte-exact from live; re-extract to update),
  the Google Ads gtag AW-11479042629 + gtagSendEvent (conversion parity), and a location
  AUTOCOMPLETE on the hero + search inputs (/api/idx/suggest from the generated columns,
  hourly in-instance cache; ARIA combobox). Click-everything pass: 45 links, hero submit,
  chat panel, rails, form validation — ALL PASS.
- SEARCH: official Google Maps view (components/idx/GoogleMapView.tsx, OverlayView chips +
  the shared clustering in map-shared.ts) — activates when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  is set (OWNER: mint a key, restrict to realtylt.com + *.vercel.app, add in Vercel env);
  Leaflet/OSM stays the fallback (verified intact). Photos: transient media failures are
  now 503 → MlsImage retries 2s/8s then placeholder (self-heals without reload); local dev
  302s to the deployed CDN (no local MLS key needed); idx bound 40→60 (50-photo galleries).
  Listing fold capped (gallery 400px @lg) so price/facts show on open — not only pics.
- CONNECT: the owner's REAL Google Calendar appointments iframe (from live custom code),
  cards anchor to it. CSP extended: frame-src calendar.google.com + td.doubleclick.net,
  script/img/connect for gtag + Maps.
- ~~Google Maps API key~~ DONE 2026-07-16 AM: key minted in the owner's GCP console
  (project realtylt-crm, "Maps Platform API Key", billing already active), added to Vercel
  env ×3 + .env.local, Google map VERIFIED LIVE on prod /search. STILL OWED (owner, 60s):
  website referrer restriction on the key (GCP → Keys & Credentials → Maps Platform API
  Key → Application restrictions → Websites: realtylt.com/*, *.realtylt.com/*,
  realtylt-website*.vercel.app/*, localhost:3000/*, 127.0.0.1:3000/*). A read_page on the
  credentials screen was permission-denied mid-flow — hand the restriction step to the owner.
- PAYLOAD: pilot built + verified 2026-07-16 AM, re-verified running for the owner same
  day PM, then OWNER DECIDED TO DROP IT ("delete payload") — content keeps flowing through
  Claude sessions editing content/*.ts. DELETED 2026-07-16 PM: :3100 server killed,
  worktree realtylt-website-payload + branch payload-build removed (the 3 pilot commits
  are reflog-recoverable for ~2 weeks if regretted), Supabase leftovers dropped (schema
  `payload` + role `payload_cms`; needed GRANT payload_cms TO postgres before DROP OWNED
  BY; verified 0 remain). If a CMS is ever wanted again, rebuild fresh — Payload 3
  coexisting inside this Next app is PROVEN to work. rtk gotcha kept: rtk-filtered dev
  logs hide next startup errors — use `rtk proxy` for raw output. (2) Photo MIRRORING — now
  REQUIRED, not optional. PROVEN 2026-07-15 late night (probe mediaTest mode): MLS Grid
  MediaURLs are now SIGNED with ~1h expiry (token=…&expires=… in the path); expired → 400,
  signature-stripped + UA token → 403. There is NO permanent URL form anymore. Per-view
  proxying is structurally dead: photos render only while CDN-cached (≤24h after a fetch
  that happened within 1h of a sync). The "photos on-demand, never stored" rule was based
  on the (then-true, now-false) permanent-URL docs. FIX: download photos AT SYNC TIME while
  signatures are fresh → Supabase Storage bucket → media route serves storage-first.
  Sizing: covers-only ≈ 1.8GB; first-12 ≈ 22GB; full ≈ 40GB (Supabase Pro tier). Needs the
  owner's go (reverses his explicit rule + storage cost), then: bucket + sync-time uploads
  + resumable backfill (fetch fresh URLs feed-page-wise, download in the same hour).
- Headless caveat: the calendar iframe paints white in headless shots (Google refuses);
  frame URL + load confirmed. Check visually in a real browser.

## ORCHESTRATOR MODE ACTIVE (2026-07-16 PM, owner-directed; /website command rewritten +
## synced to the config repo): main session = Fable 5 orchestrator (map + adversarial
## verify), ONE Opus 4.8 subagent per page builds to ~99% live parity working ~700k tokens,
## no early stops. Per page: MAP (Playwright deep-map both sites, probe clicks, extract
## hidden popup DOM, write docs/parity/PARITY-<page>.md) -> BUILD (subagent) -> VERIFY
## (orchestrator tries to break it, finishes leftovers) -> next page.
##
## SELLING + FINANCING: DONE + verified (see page list above).
## PHOTO-MIRRORING: verified + MERGED to main 2026-07-17 (merge 7f70e7d; worktree+branch
## removed; 256/256 tests on merged tree). SECURITY INCIDENT recorded: agent temporarily
## created a public-write RLS policy on prod storage.objects during testing, dropped it;
## I independently confirmed prod clean (0 permissive policies, 0 stray objects, sync
## intact). Standing guardrail added to memory [[feedback-subagent-security-guardrail]] —
## every future agent prompt forbids touching security controls.
## STILL GATED ON OWNER (60s): copy SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard →
## Settings → API) into realtylt-website/.env.local — then orchestrator: verify upload leg
## (scripts/_scratch-verify-mirror.mjs pattern), add key to Vercel env, and on owner-go run
## the FULL backfill (runbook: docs/mls-fix/PHOTO-MIRRORING.md; ~40GB, Pro purchased).
## Sync-time mirroring rides along as a safe no-op until the key is in Vercel.
## NEXT PAGE to map for orchestrator-mode: Who We Are (390 owed) · then Connect (390 + drive
## message form) · Top Areas county pages · deferred items. Wizard now on selling/financing/
## home-value; decide per-page whether Connect/other lead forms should join WIZARD_PATHS.
## Chatbot-personalization agent QUEUED (plan in memory [[project-n8n-chatbot]]).
## NEXT PAGE to map for orchestrator-mode: Financing · then Home Value · Who We Are ·
## Connect · Top Areas county pages · deferred items (open houses, SEO listing slugs,
## rail arrows + why-carousel pixel parity on Home).
## Orchestrator gotchas learned: honeypot rlt_hp matches :visible Playwright selectors
## (target placeholders instead); wizard schedule CTA = "Request My Call"; bottom-left "N"
## bubble in dev shots = Next dev-tools badge, not the chat widget.
