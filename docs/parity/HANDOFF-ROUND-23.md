# Handoff — round 23

**SINGLE AGENT. Fable. No subagents** — the round-22 fleet was a one-session grant and the owner
ended it explicitly: *"the multy agent thing is just for this session keep single agent after that
if not directed."*

Work to roughly **700k tokens**. Do not stop early, do not ask permission mid-goal.

---

## 0. First actions, in order

1. `export NODE_OPTIONS='--use-system-ca'` in git-bash before ANY node/npm. Add
   `MSYS_NO_PATHCONV=1` whenever you pass a leading-slash path as an argument, or `/search`
   becomes `C:/Program Files/Git/search`.
2. **ONE dev server per repo.** `netstat -ano | grep :3100` first and reuse it. Never start a
   second. If it starts throwing `SyntaxError: Invalid or unexpected token` or serving blank
   pages, that is the dev server degrading, not your code — `taskkill //PID <pid> //F`,
   `rm -rf .next node_modules/.cache`, start exactly one.
3. Read **this file**, then the top block of `POLISH_CHECKPOINT.md`.
   **The `/website` slash command is STALE** — its named defects were fixed in round 11, its
   carried list is done, and its "476 tests" baseline is 345 short. Ignore its §1a and §2.
4. **MLS is suspension-sensitive.** NEVER add an MLS Grid DATA-API call to a page or request
   path. Block `**/api/media/**` in probes unless a shot genuinely needs photos. His key has been
   suspended six times in four days.

---

## 1. THE MAP IS THE ROUND. His words, and what each one means

> "we have a lot of circles that show how many are there instead of showing until we get exactly
> there. compare zillow's actual page, it does not do that. it shows listings prices and some
> disappear when you zoom out and appear in different places on the map"

**This is the headline and it is measured.** On production `/search` at default zoom:
**85 cluster bubbles against 5 price chips.** Zillow is the opposite — it shows mostly PRICES and
only clusters where density genuinely forbids individual pins. Our supercluster settings
(`radius 60, maxZoom 17` in `components/idx/clustering.ts`) are far too eager.

What Zillow actually does, and what to match:
- **Prices are the default rendering.** A cluster bubble is the exception, not the rule.
- At low zoom it shows a **sample of individual prices**, not only counts — which is why "some
  disappear when you zoom out and appear in different places": it re-picks which listings get a
  visible pin per viewport, rather than collapsing everything into counts.
- Density is handled by **thinning** (drop overlapping pins) at least as much as by clustering.
- Go and look at Zillow before choosing numbers. Do not guess a radius.

> "we did not get pop up it just goes to page from the map"

**I could not reproduce navigation.** Measured on production: clicking a price chip opens a popup
(252x272) and the URL does NOT change. His experience is almost certainly the 85:5 ratio above —
he is clicking CIRCLES, which zoom, and rarely reaching a price chip at all. **Fix the ratio and
this complaint probably dissolves.** Verify it does; if a genuine click-navigates path exists,
find it (candidates: the popup's own "VIEW LISTING" link, and the mobile path).

> "on the new it says NEW instead of price"

A map chip for a new listing renders the badge text where the price should be. Prices must always
show; "new" is a secondary signal at most.

> "some show price some are dots and when you get close shows the price"

Three different pin renderings (price pill / dot / cluster bubble) read as three unrelated states.
Zillow has essentially two: a price pill and a cluster. Collapse ours toward that.

> "since we are showing all on the map lets show ny 5 boroughs too, set as default to show all
> active listings on the map"

**A real scope change, and it is his decision made.** `DEFAULT_COUNTY_SLUGS` in `lib/site.ts:57`
is the six Hudson Valley counties only. He wants the **five NYC boroughs in the default too**.

Numbers you need before touching it — on-market, measured 2026-08-06, total **27,779**:
Queens 9,740 · Westchester 4,859 · Orange 2,844 · Bronx 2,451 · Dutchess 1,973 · Brooklyn 1,758 ·
Rockland 1,737 · Ulster 1,067 · Putnam 668 · Manhattan 520 · Staten Island 162.
Default six-county scope today = 11,611 on-market / **6,729 Active**. Adding the boroughs roughly
**doubles** it. `lib/site.ts:54` still claims "~7k borough listings" — that comment is **stale**,
it is 13,545. Fix the comment while you are there.

Watch the consequences: the count line copy ("across the Hudson Valley" becomes wrong), the map's
initial frame (must fit HV + NYC), `county-bounds.ts`, and the pin cap.

**Also pre-existing and worth his decision: the map does not render at 390 at all.** Controlled
against production both before and after clustering — `@390 gm=false`, `@1440 gm=true`, identical.
The MAP toggle reports pressed and you get the card grid anyway. Not a regression; nobody has ever
shipped a mobile map here.

---

## 1b. THE LIST AND THE MAP ANSWER DIFFERENT QUESTIONS — this is a real bug

> "on the page it still shows 50 listings to go forward or back and its not correct anymore with
> logic, because I was looking at map and could zoom and go through all the listings and we still
> have pages below which are 50 on each, and when I moved on 2nd page listings reduced and only
> showed those 50"

**He is right and this is a genuine defect, not a preference.** Round 22 made the MAP
viewport-scoped (`/api/idx/pins`, bbox + cluster) but left the GRID paging through
`/api/idx/search` with `pageSize=50` over the *unbounded* county scope. The two now answer
different questions, so the list contradicts the map in front of the visitor.

> "zillow shows in the listing count how much ever it can fit on the zoomed in area, so instead of
> pages is not that better for the customer? and if you zoomed and there is 150 show 150 on the
> list on the left, and if you click any it saves those 150 and lets you go back and forth. is
> that hard to do?"

**Answer: the hardest-sounding part is ALREADY BUILT.** `lib/idx/result-set.ts` already persists a
result set and computes prev/next `neighbours()`; `components/listing/ListingPager.tsx` already
reads it on the detail page; `SearchClient.tsx:458` already calls `saveResultSet`. It is currently
fed the paginated 50. **Feed it the viewport set and his "go back and forth through those 150"
works with no new mechanism.**

**One correction so nobody builds the wrong thing: Zillow DOES still paginate.** It shows
"1–40 of N" — what makes it feel seamless is that the list is SCOPED TO THE MAP VIEWPORT, not that
pages were removed. So the target is:

1. **Scope the grid to the map bounds.** Give `/api/idx/search` the same bbox `/api/idx/pins`
   takes (`parseBounds` already exists and is shared), and refetch the grid on map settle with the
   same debounce/race guard the pin fetcher uses.
2. **Show the viewport's TRUE total** in the count line — "150 homes in this area", which is what
   he is asking for.
3. **Keep paging only above a render-safe cap.** 3,000 cards cannot render; measure and pick the
   cap rather than guessing. Zillow caps too.
4. **Feed `saveResultSet` the viewport set** so prev/next on a listing page walks the homes he was
   actually looking at.

Do NOT skip step 3 on the strength of "he asked for no pages" — his real ask is that the list and
the map agree and that the count reflects what he can see. State the cap you chose and why.

## 1c. CLICKING A COUNTY SHOULD FRAME THE MAP, Zillow-style

> "when you click the county it kind of lines as the zillow and shows active listings or whatever
> is selected on the map those listings. if you click other it will bring to other and line like
> that. add that too"

Clicking a county chip should **fly the map to that county's bounds** and show its listings;
clicking a different county reframes to that one. `components/idx/county-bounds.ts` already holds
real per-county extents and Fable wired it in during round 22 — this is mostly connecting the
county chips to it, plus the viewport-scoped list above so the count follows.

Interaction with §1: once the boroughs join the default scope, the initial frame has to hold
Hudson Valley **and** NYC, and "click a county to zoom to it" becomes the primary way to get back
to a sane zoom. These two features support each other — build them together.

## 1d. THE RESULT CARDS ARE INEFFICIENT, AND THE MAP SHOULD TAKE THE SPACE

> "on the left where listings are, i think those boxes of listings could be better in design and
> more efficient. it has a lot of unused white, we could bring those closer and reduce white part
> and show picture more. also maybe make those boxes 10% less and make map bigger to fill that
> space, since we are adding map zoom in zoom out all listing feature"

Two linked asks, and the second follows from §1b: **once the list is scoped to what the map is
showing, the map becomes the primary instrument and deserves the width.**

- **Reduce the white.** The `/search` card (the COMPACT variant in `components/idx/ListingCard.tsx`,
  the one with `p-3` and the bottom `mt-auto` row — NOT the portrait rail card) carries a lot of
  padding relative to its photo. Tighten the text block, pull the metadata closer, and give the
  photograph more of the card. **The photography is the best asset on this site and the card
  under-uses it.**
- **~10% narrower cards, wider map.** The grid/map split lives in `SearchClient.tsx`. Measure the
  current split before changing it and state the new ratio.
- Do NOT break what round 22 fixed: the rail card's address and attribution are **clamped and
  reserved at two lines** so every price in a row shares a baseline. Whatever you do to the
  compact card, re-run `scripts/_scratch-r22-clamp.mjs` and keep the invariant.
- Density is a real constraint, not a taste call: the owner's stated target elsewhere was "three
  full rows of cards beside the map". Measure how many rows fit before and after.

## 1e. A ZILLOW-STYLE SIDE RAIL — RESEARCH AND IMPROVE ON IT, DO NOT COPY IT

> "I was looking at zillow and they have this Search / 99+ Updates / Favorites / Plan / Inbox next
> to map and its helpful, so lets put that in queue too but make it little different and better.
> for example check everything on Plan and see how we can help similarly to my clients and make it
> better, more interactive and easy to understand and really helpful for whoever's looking. so do
> research and brainstorming on those and improve and make mine better"

**This is a research-and-design task, not an implementation ticket.** He is explicit: study what
Zillow actually offers under each of those, then design something better for HIS clients.

1. **Go look at Zillow's real product** — Search, Updates, Favorites, Plan, Inbox. Understand what
   each one is FOR and where it is weak. Pay particular attention to **Plan** (affordability,
   readiness, next steps), which is the one he singled out.
2. **Brainstorm before building.** Invoke the `brainstorming` skill. Write the thinking into
   `docs/parity/DESIGN-ROUND23.md` and commit it BEFORE the code, so the reasoning survives.
3. **Map it onto what this site can honestly serve today.** Much of it already exists in pieces —
   `/saved` (favorites), `portal_saved_searches` with an `alerts` flag, the CMA/home-value flow,
   the lead + consent pipeline. A rail that surfaces those coherently is worth far more than five
   new empty tabs.
4. **Do not ship a tab that cannot answer.** The same rule that keeps Pool off the filter panel
   applies here: an "Updates" badge that never counts anything, or an "Inbox" with no messages
   behind it, is worse than not having it. **The account wall (§5.1) blocks anything that needs a
   signed-in user — check that before designing around it.**
5. Restraint still governs the look: this is a quiet, considered site, not a dashboard.

## 2. FILTERS — expand, then PROVE against OneKey

> "there is bunch of drop downs in more section on our page and zillow. work on filters, add
> more whatever is important to be able to filter and then test it in every few random way to
> confirm the data is correct compare to one key mls"

Round 22 took the MORE panel from 5 questions to 16: Home type (RESO PropertySubType) plus Central
air / Basement / First-floor bedroom / Eat-in kitchen / Waterfront, on top of the existing sqft /
garage / lot / year / tax ranges.

**How to add one — the mechanism is settled, do not reinvent it:**
1. Confirm the field exists in the `listing` jsonb **with a real fill rate**, and count it *within
   the surface that will offer it* (see the Apartment trap below).
2. Add a **generated STORED column + partial index** in a migration, like
   `supabase/migrations/idx_search_facet_columns.sql`. **Never filter on the jsonb directly** —
   it TOASTs, detoasts every candidate row, blows the anon statement timeout, and `search()` then
   silently serves a stale snapshot. That bug made "Built 2000+" answer ZERO against a true 4,713.
3. Wire `SearchParams` → `parseFilterParams` → `searchFilters` → `fixture.ts` → UI.
4. Test that the filter **OBEYS** — every returned row genuinely has the feature, and a row
   missing the source field is EXCLUDED, not matched. A test that only asserts "the count changed"
   is worthless.

**Fields already replicated and still unexposed:** `heating`, `appliances`, `parkingFeatures`,
`sewer`, `waterSource`, `schoolDistrict`, `hoaFee`, `exteriorFeatures`, plus more values inside
`interiorFeatures` (Eat-in Kitchen 2,137 · First Floor Bedroom 1,958 · Formal Dining 1,469 ·
Open Floorplan 1,138 · Washer/Dryer Hookup 1,131 · Granite Counters 948 · Walk-In Closet 912).

**POOL AND FIREPLACE REMAIN IMPOSSIBLE.** "pool" appears in 659 of 4,000 sampled active rows and
**650 are in the free-text `description`; zero in any structured field**. `SELECT_FIELDS` in
`lib/idx/mls-grid.ts` never requests RESO `PoolPrivateYN`/`PoolFeatures`, and "Fireplace" appears
0 times in `interiorFeatures`. To ship either you must **add the field to SELECT_FIELDS and
confirm OneKey actually populates it** — that is a sync change, so probe carefully and once.

**THE APARTMENT TRAP — I shipped this bug, do not repeat it.** "Apartment" is 1,162 Rental and
exactly **1** Residential. Offered on the for-sale search (which excludes rentals) it returned
zero, always. Two lessons: count the facet *inside the surface*, and **hiding a dead option is not
the fix** — `?homeType=apartment` stays typeable and becomes a ghost filter narrowing the query
while the select reads "Any home type". The rule lives in `RENTAL_ONLY_HOME_TYPES` and is enforced
in `parseFilterParams`, which BOTH the server render and the client refetch go through.

**Validating against OneKey.** He wants filter results cross-checked against the real MLS. Two
honest routes: compare counts against **onekeymls.com**'s own public consumer search for the same
town + criteria, and cross-check our API rows against the raw `listing` jsonb in Supabase (the
round-22 pass did 365 rows across six facets with zero violations — extend that, do not redo it).
Sample **several random towns and criteria**, not one.

---

## 3. VERIFICATION TRAPS — every one of these cost real time in round 22

- **Google Maps ignores SYNTHETIC events.** `dispatchEvent(new MouseEvent(...))` and synthetic
  `wheel` do nothing at all. Use `p.mouse.click(x, y)` and `p.mouse.wheel()` at real coordinates.
  A probe using synthetic events reported "popup never opened" on a working popup.
- **Assert OPEN before asserting closed.** A probe that reports "Escape closed it" when nothing
  ever opened is a probe that cannot fail. And **poll after closing** — the original popup bug was
  that it closed and then REOPENED itself.
- **A fullPage screenshot scroll-triggers no IntersectionObserver.** Walk the page a viewport at a
  time first or every `.reveal` photographs at opacity 0.
- **Programmatic `el.focus()` does not trigger `:focus-visible`.** Tab with real key presses, or
  you will report "no focus ring" on four controls that all ring fine.
- **`aspect-ratio` + `max-height` derives the WIDTH from the capped height.** That put a 933px
  photo in a 1216px column with 395px of black on one side.
- **The map mounts BELOW THE FOLD on a phone** — scroll to it before asserting it is missing.
- **Vercel preview URLs are SSO-protected.** Mint a share link with the Vercel MCP
  `get_access_to_vercel_url` against the **exact URL you want**, and put the `_vercel_share` token
  **on the target URL itself** — the cookie does not survive a second navigation, and a stale
  token silently serves a Vercel login page your probe will happily measure as "no clusters".
- **Measure on production, not dev.** On dev every listing card photographs as a grey placeholder
  and `/services` rendered blank; production was clean both times. Also: `/api/media` answering
  **302 with `X-Media-Status: storage` is the SUCCESS path**, not a placeholder — do not misread
  a redirect as a failure the way I did.
- **Check a "defect" against a control before calling it a regression.** The mobile map turned out
  to behave identically on production without clustering.

---

## 3b. FIXED AT THE VERY END OF ROUND 22 — do not re-diagnose it

**"Search Listings does nothing when I click"** — he reported the top-nav link as dead. It was
not. It navigates, slowly and silently: measured on production from `/buying`, the URL committed
after **590ms, 599ms, 1,604ms and 6,890ms** across four runs. Every OTHER nav link was fine; only
`/search` stalls, because it is the one route whose server component fetches a page of results
before it can emit anything.

`app/search/loading.tsx` now exists and fixes it (verified: pending state shown, URL committed
1,093ms). The lesson worth keeping: **the page's existing `<Suspense>` boundary claimed in a
comment that it covered client-side navigation into `/search`, and it cannot** — on a client
navigation Next holds the entire RSC response until the route's server component produces output,
so the boundary has nothing to fall back FROM. `loading.tsx` is the only thing Next renders the
instant a transition starts. **If you add another slow route, it needs its own `loading.tsx`;
there are no others in `app/` today.**

## 4. STANDING FACTS

- **Repo** `C:\Users\Levan\realtylt-website`, branch `main`, remote `levan-tsi/realtylt-website`.
  Never `git add -A` — other sessions share this repo. Commit with an explicit pathspec, and note
  `git commit` still picks up anything already staged, so check `git status` first.
- **Gates:** `npx tsc --noEmit` and `npm test` in the **FOREGROUND** (background runs lie).
  Baseline **821 passing** — never below. Add tests for logic you touch.
- **Design gate:** `components/design-system.test.ts` FAILS the build on a hardcoded grey, an
  ad-hoc shadow, or an off-scale radius. Radii are 8 (badges) / 12 (buttons, inputs) / 16 (cards,
  media) / 24 (large panels) / `rounded-full`. Two escape hatches, both needing a written reason:
  `@design-artwork` and `@design-allow`.
- **Anti-slop, binding everywhere:** no gradient text or buttons, no `#8b5cf6`-family purple as a
  primary, no neon cyan, zero em dashes in visitor copy, no arrow-glyph CTAs.
- **Other gates:** focus-visible ≥3:1, tap targets ≥24px, body ≥16px on mobile, no horizontal
  overflow at 390 **or** 320, reduced-motion clean, works with JavaScript disabled.
- **Supabase can go IO-starved.** In round 22 a plain count over `idx_listings` (171 MB, 31,536
  rows) took 75s+ while catalog reads returned instantly, and the project still read
  `ACTIVE_HEALTHY`. It recovered to 341ms later. If queries crawl, **drain load, do not chase
  queries**, and do not run the photo backfill into it.
- The `.rlt-compact-control` selects on `/search` are 12px on mobile by a **documented deliberate
  opt-out**; the text input beside them IS floored at 16px. Forcing 16px adds no overflow but
  visibly fattens the bar. Left alone — confirm on a real iPhone before changing it.

---

## 5. STILL OPEN, and most of it needs HIM

1. **NOBODY CAN CREATE AN ACCOUNT — this blocks launch.** Supabase `disable_signup=true`, so
   password sign-up and magic link both 422 and Google OAuth is off. One dashboard toggle, but
   loosening an auth control is not a builder's call. Settle two things with it:
   `mailer_autoconfirm` is false so a confirmation email must actually arrive (realtylt.com still
   has **no SPF/DMARC**), and the Google button currently offers a disabled provider.
2. **Photo backfill.** Watermark `2026-08-05T09:01:39` did not advance in round 22 — the DB was
   starved. Probe 12 listings first and read the histogram; **any 429 means stop for the day**.
   The forward walk is done, so the ~384 stale zero-photo rows need the `--fresh` re-walk.
3. **The home-value copy is the old vendor's boilerplate** ("We demand excellence throughout the
   home-selling process") and it is the SECOND thing a visitor sees. Round 11 recorded it as his
   words, verbatim, not ours to rewrite. **Ask him** for four sentences in his own voice.
4. **The hero has no answer** — he rejected four candidates. Separately,
   `public/images/hero/hero-vimeo-frame.jpg` is the old IDX vendor's clip's first frame and
   carries **no licence record**; the licensed Hudson Highlands photo that phones already get is
   both safer and better. His call.
5. Carried: published-CMA enumeration + 57 raw MediaURLs (his decision plus a paired CRM change),
   Places API (New) for the type-ahead, sold comps (an MLS licence question, not a coding one).

---

## 6. ORDER OF WORK, and what to do if you run long

1. **The map**, matching Zillow — pin/cluster ratio first, then the NEW-instead-of-price bug, then
   the three-renderings problem, then the popup once the ratio is fixed.
2. **The list/map disagreement (§1b)** — this is a live defect a visitor can see today, so it
   ranks above new work. Viewport-scope the grid, show the viewport's true count, feed
   `saveResultSet` the viewport set, keep a measured render cap.
3. **County click frames the map (§1c)** and **boroughs into the default scope (§1)** — build
   these together, they support each other.
4. **Card efficiency + wider map (§1d)** — do this AFTER §1b, because the list being
   viewport-scoped is the reason the map earns the width.
5. **Filters (§2)** — add what matters, then validate against OneKey in several random ways.
6. **The side rail (§1e)** — research and brainstorm FIRST, commit the thinking, then build.
7. **Re-test everything two or three more times**, comparing against Zillow as you go.
8. **Then, and only if there is budget left, polish the design.**

His instruction if you do not finish: *"if it did not finish everything, polish map and everything
one more time and then check if everything works properly compare to zillow too, and if still have
not reached 700k tokens then work on polishing designs."* And if you run out of budget, **stop and
write the next handoff** with full state — what is done, what is left, what is unverified, and the
exact next steps. He would rather have an honest handoff than an unfinished silent stop.

**Before you stop, whatever happens:** overwrite the top block of `POLISH_CHECKPOINT.md` with what
you did, what you verified **with numbers**, what is still open and why, and the next round's
brief. Save anything reusable to `~/realtylt-claude-config/memory/` and sync that repo.
