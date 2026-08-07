# Handoff — round 24

**SINGLE AGENT, one long session (~700k tokens), no subagents** — his instruction verbatim:
"prepare handoff for new session and it will be single agent working on all of those
improvment and design and everythign." Full autonomy, do not stop to ask mid-goal.

His message, 2026-08-07, verbatim — this IS the round:

> "what else have we fix just map looks gret at the momend go stress test check we still dont
> have pop up or moving to the next property fromthe page maybe where ever is szoomed in and
> shows on the map and you click next or prveous property it moves trou them also drop down
> filters are still less and needs adding more check zillow and my live page for examples .
> and plan and those on the left should be more interaqtive maybe when you click on things
> poup quiz with shapes that u can choose to help you plan your journy more and for us to get
> more info"

## 0. First actions, in order

1. Orient per the /website command §0 (TLS export, one dev server on :3100, shared repo —
   explicit pathspec commits, MLS safety: block `**/api/media/**` in probes).
2. **Re-measure the gates at round start** ([[verify-carried-baseline-was-never-reproduced]]):
   `npx tsc --noEmit` and `npx vitest run` in the FOREGROUND. Round-23 close: tsc clean,
   **840 passing**. If the tree disagrees, fix before building.
3. A long-lived dev server can serve STALE route code (caught in round 23: it returned 3,798
   uncapped pins vs production's correct 3,000). Compare one dev API answer against
   production before trusting it; kill by PORT and restart if they disagree.
4. Read `docs/parity/DESIGN-ROUND23.md` (what shipped and why) and run the four committed
   regression probes against production BEFORE touching anything, so you know the map still
   holds: `scripts/verify-map-markers.mjs`, `verify-map-popup.mjs`,
   `verify-viewport-scope.mjs`, `verify-facets-live.mjs` (all take `BASE=`).

## 1. "map looks gret at the momend" — protect it

The map is the thing he now likes. Every change this round re-runs the four probes above.
Round-23 production baselines: popup contract 10/10 on BOTH marker kinds, zero count circles,
count line = API total for the identical box (15,148 = 15,148), 0 extra fetches in 6 idle
seconds, 1 scoped fetch per pan.

## 2. THE PREV/NEXT GAP — characterized, root-caused, ready to fix

His words: "moving to the next property fromthe page maybe where ever is szoomed in and shows
on the map and you click next or prveous property it moves trou them."

**Measured on production 2026-08-07** (scripts/_scratch-r24-pager2.mjs, machine-local —
promote your real fix's probe):

- The POPUP opened first try and its View Listing link navigated. The "still dont have pop
  up" half did NOT reproduce — but one earlier attempt after a wheel-zoom failed to open, so
  stress the popup with REPETITION at several zooms/densities before calling it closed.
- The real gap: the popup's home (`60-locust-avenue-604a`, New Rochelle) was **NOT in the
  saved result set** (`inSavedSet: false`, savedCount 150). `ListingPager` renders ONLY when
  the current listing is a member of the stored set (`neighbours()` returns null otherwise),
  so the listing page had **no prev/next homes walk at all**.
- **Root cause:** the grid saves its own 150 rows; the MAP draws from the 3,000-pin viewport
  fetch. Any pin beyond the grid's 150 lands on a pager-less page. This also means clicking
  such a pin cannot highlight a card (focusCard finds nothing).

**The fix he is asking for:** the walk should be THE HOMES THE MAP IS SHOWING, wherever he
zoomed. Directions to weigh (decide, state it, build one):
- Save the VIEWPORT PIN ORDER (capped — the drawn markers, or the fetched pins up to some
  measured cap) as the result set when in map view, so every clickable pin is a member and
  prev/next walks the map's own homes. `lib/idx/result-set.ts` items are `{id, path,
  address}` — pins carry id + address and `listingPath` can build the path.
- Or fetch-on-miss: the listing page falls back to a viewport-set lookup. (More moving
  parts; probably worse.)

**Instrument warning:** a naive prev/next detector on the listing page matches the PHOTO
arrows ("Previous photo") — a false positive that burned round 23's first probe. The homes
pager's labels contain "listing" ("Previous listing" / "Next listing", aria-label on links
in a group labelled via ListingPager). Assert on THOSE, and assert membership (the pager
existing for a pin-opened home) not just presence.

## 3. FILTERS — "still less", compare Zillow AND his live page

Round 22+23 took the MORE panel to 19 questions (10 selects + 9 checkboxes). He wants more,
with two named references:

1. **Go read live realtylt.com's search filters** (his old Brivity site — read-only, the
   [[crm-live-platform-read-only]] pattern). Enumerate every dropdown and option it offers.
2. **Zillow's More panel** (bot-gated to scripts; use knowledge + any reachable rendering):
   HOA max, parking, stories, senior living ("55+"), views, days on Zillow, keywords,
   basement, must-haves.

Then map each onto honest availability, in three buckets:
- **Buildable now from replicated data** (the settled mechanism: generated STORED column →
  partial index → SearchParams → parseFilterParams → searchFilters → fixture → UI → an
  OBEDIENCE test): `heating`, `appliances` values, `parkingFeatures`, `exteriorFeatures`
  values, more `interiorFeatures` values (Open Floorplan 1,138 · Granite Counters 948 ·
  Walk-In Closet 912 measured), **Days on market** (listed_at exists — ranges are honest),
  stories?/senior? (CHECK fill first — count INSIDE the surface, the Apartment trap).
- **Needs a dynamic values source**: School district (79% fill, 135 clean values; a
  hardcoded select rots into dead options — suggest-index pattern).
- **Sync-gated** (SELECT_FIELDS additions — ONE careful probe when he approves; MLS
  suspension history says never burst): PoolPrivateYN/PoolFeatures (pool),
  FireplaceYN/FireplacesTotal (fireplace), AssociationFeeFrequency (unlocks Max HOA — the
  fee itself is already replicated, 2,929 numeric, median $580).

Validate the way round 23 did: seeded-random combos through the live API, every returned
row's raw jsonb re-checked per predicate (`scripts/verify-facets-live.mjs` — extend it), and
at least one external count against onekeymls.com (Beacon was 100 vs our 99, gap = the $10k
junk floor).

## 4. THE QUIZ — Plan and the rail become interactive (the round's DESIGN centerpiece)

His words: "plan and those on the left should be more interaqtive maybe when you click on
things poup quiz with shapes that u can choose to help you plan your journy more and for us
to get more info."

Two goals in one feature: help the visitor plan, AND capture qualified-lead info for him.

- **Shape of it:** a step-by-step visual quiz — large clickable ILLUSTRATED option cards
  ("shapes", not radio buttons): buying or selling? · timeline (now / 3-6mo / next year) ·
  budget or monthly comfort (bridge math already exists — priceForMonthly) · pre-approval
  status · areas (the 11 served) · home type · must-haves (the honest facet set). Each
  answer refines a visible, building plan; the END is a tailored plan page (their monthly →
  price ceiling, their areas' live counts, their next stage from /plan's four) plus a
  consent-safe hand-off ("want us to send this + matching homes?").
- **REUSE, do not reinvent:** `components/leads/QualifyingWizard.tsx` (an existing wizard),
  `priceForMonthly` (lib/mortgage), the lead pipeline + `docs/parity/LEAD-CONSENT-CONTRACT.md`.
  **CONSENT IS STRICT** (FCC one-to-one + NY GBL 399-z, closed in a prior round): the quiz
  must use the existing consent-checkbox pattern before ANY contact info is sent; answers
  without contact info can still tailor the on-page plan (no data leaves the page).
  The saved-search `alerts` criteria already travel with leads — quiz answers should ride
  the same lead payload shape so the CRM can read them.
- **Design bar:** invoke the `frontend-design` skill; the site's calm monochrome system with
  the display face; "shapes" = simple editorial line-drawn cards in the site's language, NOT
  clip-art or emoji; anti-slop rules bind (no gradient text/buttons, no purple, no arrow
  CTAs, zero em dashes in visitor copy); corners 8/12/16/24; motion restrained,
  reduced-motion clean. Entry points: the Plan rail item and /plan itself ("popup quiz" —
  a full-screen takeover or a panel; design call, make it and state it).
- **Where it can also live later:** the rail's Saved could deepen (saved searches inline?)
  — only if it stays honest; nothing that needs the disabled sign-up.

## 5. Verification traps, carried + new

- Photo-arrow false positive (above §2). Assert the pager by its "listing" labels.
- A probe must assert the popup is OPEN before asserting anything closes.
- Google Maps ignores synthetic events — real p.mouse at real coordinates.
- Dev server staleness (§0.3) · Supabase IO starvation (drain, never chase; it hit twice) ·
  MCP apply_migration times out on table rewrites and ROLLS BACK CLEAN — verify
  information_schema + pg_stat_activity, then split ALTER from indexes.
- Measure jsonb fill rates on a LIMIT sample subquery, never a full-table `?|` scan.
- Judge focus rings by clipped-screenshot PIXELS; computed outlineColor lies.
- `grep -c` on minified CSS counts lines, not matches.
- Playwright probes: block `**/api/media/**` unless the shot needs photos; keep photo runs
  to a single page view (self-inflicted 429 history).

## 6. Standing facts

- Repo `C:\Users\Levan\realtylt-website`, branch `main`, remote levan-tsi/realtylt-website.
  Never `git add -A` (shared repo); check `git status` before committing.
- Gates: tsc + vitest FOREGROUND, baseline **840 passing**, design-system test binds
  (radii 8/12/16/24/full, no ad-hoc greys/shadows), tap targets ≥24px, no overflow at
  390/320, JS-disabled must still work, `scripts/_scratch-*` is gitignored — promote real
  gates to committed `scripts/verify-*.mjs` names.
- Default scope = all ELEVEN areas (15,170 Active at close), count copy "across the Hudson
  Valley and NYC", VIEWPORT_PAGE_SIZE=150, PIN_CAP=3000, MARKER_CAP=600.
- The site is noindex pre-launch; launch switches are HIS, in order (clear
  NEXT_PUBLIC_SITE_URL, point apex, remove PRELAUNCH=1).

## 7. Still open, mostly HIS

1. Account wall: Supabase disable_signup=true — blocks portal/saved-account/launch.
2. Mobile map does not render at 390 (pre-existing, twice documented). His call.
3. Photo backfill: ~384 stale zero-photo rows; probe 12 first; ANY 429 = stop for the day.
4. Home-value copy in his voice; the hero (he rejected four).
5. Published-CMA enumeration + raw MediaURLs (owner decision + paired CRM change).
6. Updates tab unlocks when the CRM alert sender is live.

## 8. Order of work

1. Gates + regression probes (§0) — know the floor.
2. The prev/next viewport walk (§2) — a live, characterized defect; smallest honest fix.
3. Popup stress test with repetition (§2) — close or reproduce his "no popup".
4. Filters (§3) — research live + Zillow first, then build the honest bucket, validate.
5. The quiz (§4) — design doc committed BEFORE code, then build to the design bar.
6. Re-run everything against production; polish passes; overwrite the checkpoint top block;
   save lessons to `~/realtylt-claude-config/memory/` and push the brain repo.

If budget runs short: finish §2 and §3 fully verified rather than half of everything; the
quiz design doc alone (committed) is an acceptable §4 deliverable, the build carrying to
round 25. Stop with an honest handoff, never a silent stall.
