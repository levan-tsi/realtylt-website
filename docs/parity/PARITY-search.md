# PARITY — Search / Listings page (round 2026-07-19, owner-directed)

Owner's words: live shows ~30-50 per page with the map showing that page's listings; page 2 swaps
both. Our 12/page + viewport-cluster map doesn't feel like his real site. Also: listing design
gaps and photos that load sometimes. Evidence: `docs/_audit/search-parity/` (live-1440-p1/p2,
live-390-p1, ours-1440, ours-390, live-card.html).

## LIVE anatomy (measured 2026-07-19, Playwright)

- URL defaults: `/search?price=10000:&multi_search=<6 HV counties>&propertyType=Residential|Multi-Family&status=1&view=hybrid_view`.
- Filter bar: Find a Place · BED · BATH · PRICE · MORE · black SAVE SEARCH. County chips row under it.
- Count line: **"4770 listings found"** · "All Listings ˅" quick filter (**All Listings / Open
  Houses / New Listings / Price Reduced**) · right: "Sort By Newest ˅" + 3 view icons (grid/map/split).
- Results: LEFT scrollable panel, **2-column** cards, **35-36 per page** (page 2 measured 36).
- Card (live-card.html + rendered): landscape photo (457×250 req) with black status chip top-left
  ("COMING SOON"/"NEW"/"OPEN HOUSE" — two chips stack side by side); WHITE body: bold price left +
  "12 Bed • 7 Bath • 9552 Sq. Ft." right on the same line; italic street; italic "City, NY zip";
  "Listed with <agent> of <office>" small + OneKey MLS logo img; heart (outline) bottom-right.
  DOM also carries `MLS# <id>` (small, hidden in rendered view). No-photo fallback = a MAP
  THUMBNAIL of the address (we will NOT copy that — our coords are zip-centroid approximations).
- Pagination: `ul.pagination.bootpag` — **« 1 2 3 4 5 6 »** windowed, active page dark chip,
  ~136 pages at 35/page. jQuery-driven (no URL change). Page change scrolls panel to top.
- MAP (right half): the loaded page's listings as **black rounded PRICE CHIPS** ("$875K",
  "$1.30m" — price FLOORED to 3 sig figs, K under $1M, m over). Page 1: every chip ∈ page-1
  prices. After paging: chips ACCUMULATE (p1+p2 mix measured, 45 chips). Zoom/pan does NOT
  refetch a capped viewport set — the map only ever shows fetched-page listings.
- Mobile 390: same single-column flow, filters collapse, map behind the view toggle.

## OURS today (files)

- `components/search/SearchClient.tsx` — hybrid grid+map, filters, sorts (5), county chips +
  NYC-boroughs expander, `?page=` URL state, 12/page (`DEFAULT_PAGE_SIZE` in `lib/idx/types.ts`),
  windowed pagination « 1 2 3 … 449 ».
- `components/idx/MapView.tsx` (Leaflet fallback) + `GoogleMapView.tsx` + `map-shared.ts`
  (clustering) — fed by `/api/idx/pins` bbox fetch, PIN_CAP 800, debounced pan refetch.
  On localhost the GOOGLE map is degraded (referrer-restricted key: `idle` never fires) — verify
  map logic on the LEAFLET path locally (unset NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in the env for a
  run) and Google visually after deploy.
- `components/idx/ListingCard.tsx` `variant="plain"` — close to live already.
- APIs: `/api/idx/search` (paged), `/api/idx/pins` (bbox, also used elsewhere — do NOT delete).

## GAP LIST (priority order)

1. **Page size 12 → 36** (live 35-36; 36 = clean 2-col grid). `DEFAULT_PAGE_SIZE` drives other
   surfaces — scope the change to the search page (explicit pageSize param), don't inflate
   portal/rails. Pagination stays windowed; page change scrolls results to top; `?page=` keeps
   round-tripping; totals text stays honest.
2. **MAP = PAGE coupling (the owner's core ask).** The hybrid search map shows the CURRENT
   PAGE's 36 listings as price-chip markers (floored format: $875K / $1.3M), auto-fit bounds on
   results change, chips REPLACED on page/filter/sort change (live accumulates; replace is
   cleaner and matches the owner's mental model — note the divergence in the PR/commit).
   Clicking a chip highlights/scrolls to its card (beat live: they don't). Same-zip listings
   share centroid coords — apply small deterministic offsets (index-seeded spiral) so chips
   don't stack invisibly; KEEP the "Locations approximate" badge. Implement for BOTH MapView
   (Leaflet) and GoogleMapView. The 800-pin viewport-bbox fetch leaves the hybrid view (no more
   "Showing 800 of…" note there); `/api/idx/pins` API itself stays (other callers/tests).
   Listings already carry lat/lng in search results — if not, extend `/api/idx/search` payload,
   NOT a second fetch.
3. **Card polish to live**: price + stats on ONE line consistently (stats right-aligned, wrap
   under only when needed); "Listed with **<agent>** of **<office>**" using our stored
   `listAgentName` (fallback: office only); heart moves to live's spot (bottom-right of body,
   outline style, still ≥24px tap target); status chips can stack (Status + Open House side by
   side like live); OneKey MLS logo per card IF a locally-hosted asset is compliant-available
   (we already show MlsAttribution site-wide; do not hotlink brivity/blueroof S3).
4. **"All Listings" quick filter** next to the count line: All Listings / Open Houses / New
   Listings (listedAt ≤7d). "Price Reduced" needs feed fields we don't replicate — SKIP it and
   note why in the parity file (NO MLS schema/sync changes this round).
5. **Photo reliability on cards**: keep the branded placeholder (honest) but make the
   503-retry path invisible (no flash of broken state; skeleton shimmer until first byte is
   fine). Do NOT touch MLS sync, the media route's budget logic, or backfill scripts — the
   fresh-listing photo gap is data-side (orchestrator handles backfill; owner owes the Vercel
   key).
6. **Listing detail Mission A (never built — owed from 2026-07-18 PM round)** on
   `app/listing/[id]/page.tsx`:
   - **Photo LIGHTBOX**: click any gallery photo → full-screen overlay gallery (arrows, counter,
     Esc closes, focus trap, restores focus, swipe on touch, preloads neighbors, no layout shift).
   - **Schedule a Tour**: CTA near the price/agent card → modal with date chips (next 7 days) +
     time preference + contact fields → POST /api/lead with a `tour` intent payload (address +
     MLS id included). Probe live's listing page read-only for their wizard anatomy
     (technique: docs/parity/PARITY-selling.md — NEVER submit on live).
   - **Make an Offer**: CTA → modal (offer amount prefilled with list price, contact fields,
     message) → POST /api/lead with an `offer` intent payload.
   - All three: 390-friendly (bottom-sheet pattern like QualifyingWizard), no console errors,
     tested.
7. **Mobile 390**: with 36/page the list gets LONG — keep grid/map toggle, pagination tap
   targets ≥24px, no horizontal overflow at 390 AND 320, lazy photos below the fold.

## Match-or-beat rules

- Where ours already beats live (real data in cards, honest placeholder, borough coverage,
  chip→card highlight), KEEP ours. Everything else matches live's structure.
- Anti-AI-slop binds: no gradient text/buttons, no purple, no neon cyan, zero em dashes in
  visitor copy, no arrow-glyph CTAs, focus-visible ≥3:1, tap targets ≥24px, body ≥16px mobile,
  reduced-motion clean. Hudson Twilight palette.
- Hard guardrails: NO MLS Grid data calls from request paths; do not touch sync/cron/backfill
  code or any security control (RLS, policies, headers); never push; ONE dev server on
  127.0.0.1:3000; foreground verification only; tsc + npm test green before every commit;
  commits page-scoped.

════════════════════════════════════════════════════════════════════════════════════════════
# ROUND 2 (2026-07-19 late, owner-directed "check + fix + polish again, full budget")

Round 1 shipped + prod-verified (36/page, page-coupled chips 34/34 + swap 30/30, lightbox/
tour/offer E2E). Round-2 mapping evidence: live-more-panel.png, live-save-search.png,
ours-save-search.png in docs/_audit/search-parity/.

## Gap list (priority order)

1. **MORE filters panel** (live has it, we don't). Live fields measured: Garage min/max,
   Square Footage min/max, Lot Size min/max, Year Built min/max, Stories, "Include
   Properties Without Photos". We replicate garageSpaces, lotAcres, yearBuilt, sqft as
   structured data (2026-07-15 pipeline) — build a MORE panel with those + sqft MAX (we
   only expose min today) + the without-photos toggle (exclude listings with no mirrored
   cover). SKIP Stories (field not replicated — document). Wire through /api/idx/search +
   lib/idx query + URL round-trip; counts stay honest; empty-result state clean. Watch
   query perf (JSONB path filters are fine at ~13k rows, but measure).
2. **Save Search v2.** Live: sign-up modal (Google/FB/Apple/Email) then saved search +
   alerts. Ours today: instant unnamed device-save toast. Upgrade: name-the-search flow
   prefilled from active filters ("Queens · 4+ bd · under $800K"), saved searches listed
   on the saved page with re-run links, keep the no-account device path (we BEAT live
   there). INVESTIGATE components/auth (SignInModal/SavedProvider): if real account
   plumbing exists, offer sign-in to sync; if it's device-only, do NOT build auth — polish
   the device story and document.
3. **Chip interaction polish**: hover/focus raises a chip above overlapping neighbors
   (z-index + subtle scale, reduced-motion safe); the active (clicked) chip stays raised;
   keyboard focus can reach chips. Look must stay live-parity black bubbles.
4. **A11y/harden pass** across round-1 surfaces: aria-live count updates, pagination
   aria-current, quick-filter aria-pressed, chips->cards keyboard round-trip, lightbox/
   tour/offer focus-order + labels, no-JS, slow network, 320px.
5. **Visual polish passes** vs the live reference shots at 1440+390 — count-line/quick-
   filter row spacing, card paddings, pagination hit areas, map corners. Multiple passes;
   screenshot-compare each.
6. **Photo first-paint**: no gray flash before skeleton/photo (fade-in on load; skeleton
   from the first frame).

## Already better than live — KEEP, do not "fix" toward live
Sort options (5 vs their buried select), view-toggle aria-pressed (their icons have NO
labels), device-save without account, honest placeholder (no fake map thumbs), chip→card
highlight.

────────────────────────────────────────────────────────────────────────────────────────────
## ROUND 2 — SHIPPED (2026-07-19, all local-verified; commits on `main`)

1. **MORE panel** — 0cd43af (query layer) + bff5634 (UI). Garage / Square Footage / Lot Size /
   Year Built min→max, **Max Annual Tax** (added — taxAnnual is replicated, 76% coverage; closes a
   visible live field beyond the measured list), and a photos toggle. Verified end-to-end against
   SQL ground truth (garage≥2→583, lot≥1→434, year≥2000→369, sqft≤2000→671, withPhotos→1247).
   - Filter mechanism: garage/lot/year/tax are NOT generated columns, so they filter through the
     `listing` jsonb via the **single arrow** `listing->field=gte./lte.N` (jsonb → NUMERIC compare;
     verified `->` gives 583 while text `->>` mis-sorts "10"<"2"). sqft-max uses the `sqft` generated
     column; without-photos uses `listing->photosMirrored=gt.0`. No schema migration. Warm perf
     120–800ms over ~13k rows (dev→remote Supabase; prod faster).
   - **Divergences (intentional):** panel is IN-FLOW (expands under the bar) not live's overlay —
     keyboard/overflow-safe at 320/390/1440, and filters apply LIVE (no "apply" step; we beat live's
     required VIEW RESULTS click, but the button is kept and shows the live count). Property Type stays
     in the main bar (live duplicates it in MORE) — not re-added, no dupe. **STORIES skipped** (field
     not replicated in the feed). Without-photos is phrased "Only show homes with photos" (single
     negative, clearer than live's "Include Properties Without Photos"); default OFF = include all
     (incl. the ~570 placeholder rows).
2. **Save Search v2** — e248a41. Investigation: REAL account plumbing exists (AuthProvider + Supabase
   `portal_saved_searches` + device→account migrate; /saved already listed searches w/ Run+Remove).
   Built a name-the-search dialog prefilled from the active filters (incl. MORE), saves to account when
   signed in else to device, and offers "Sign in to sync + get alerts" (device saves migrate on later
   sign-in). Keeps the no-account path AND beats live's sign-up wall. Focus trap / Esc / restore /
   bottom-sheet on mobile.
3. **Chip interaction** — 0a878e6 + ab33b82. Hover/keyboard-focus lifts a chip above overlapping
   neighbours (scale 1.12 + z-index + high-contrast ring), active stays raised, 36 chips keyboard-
   reachable; look stays a live-parity black bubble now with a **teardrop pointer tail** (`--chip-bg`
   drives tail colour, black/azure). Both Google + Leaflet. Reduced-motion neutralises the raise.
4. **A11y / harden** — 53d3a7f. Chip→card now MOVES keyboard focus into the matching card (round-trip
   complete); count line reads "N found" whenever any filter narrows (honest) in its role=status live
   region; `<noscript>` fallback on /search (no-JS gets a message + phone, returns 200). Lightbox +
   tour/offer already had focus trap + labels (round 1) — verified, no change. Verified 320/390 no
   horizontal overflow; empty-result + Clear-All resets MORE too.
5. **Visual polish** — teardrop chips (above). Screenshot-compared 1440/390 vs live refs; card/count/
   pagination spacing already at parity from round 1.
6. **Photo first-paint** — no change needed: MlsImage (round 1) already paints the mist skeleton from
   the first frame with images opacity-0→fade-in; verified under throttled /api/media (36 skeletons,
   all imgs hidden until load) — no gray/broken flash.

Regression-checked after shared-code edits (query layer + globals.css + map engines): home rails,
/top-areas/[county], /search round-1 (page-2 chip swap 36/36, New-Listings quick filter, view toggle),
listing lightbox + tour + offer — all green, 306 tests + tsc clean, zero non-third-party console errors.
