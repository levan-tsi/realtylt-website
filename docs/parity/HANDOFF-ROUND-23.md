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
2. **Boroughs into the default scope**, with the copy and framing consequences.
3. **Filters** — add what matters, then validate against OneKey in several random ways.
4. **Re-test everything two or three more times**, comparing against Zillow as you go.
5. **Then, and only if there is budget left, polish the design.**

His instruction if you do not finish: *"if it did not finish everything, polish map and everything
one more time and then check if everything works properly compare to zillow too, and if still have
not reached 700k tokens then work on polishing designs."* And if you run out of budget, **stop and
write the next handoff** with full state — what is done, what is left, what is unverified, and the
exact next steps. He would rather have an honest handoff than an unfinished silent stop.

**Before you stop, whatever happens:** overwrite the top block of `POLISH_CHECKPOINT.md` with what
you did, what you verified **with numbers**, what is still open and why, and the next round's
brief. Save anything reusable to `~/realtylt-claude-config/memory/` and sync that repo.
