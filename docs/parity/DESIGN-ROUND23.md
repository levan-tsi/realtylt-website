# Design round 23 — the map becomes the instrument

Owner's brief, distilled: make the /search map behave like Zillow's, make the list agree with
the map, let the map take more of the page, and research (not copy) Zillow's side rail. This doc
carries the reasoning; the commits carry the diffs.

## 1. The marker language: price pills + dots, no count circles

**Measured today on production at 1440×900** (scripts/verify-map-markers.mjs): default frame
renders 14 price chips + 10 cluster bubbles; one wheel zoom in (the moment the viewport fetch
takes over) it becomes **6 chips against 96 count bubbles**. That is the owner's complaint,
reproduced: the map answers "how many" when the visitor asked "how much".

**What Zillow renders** (one light look before its human-check gate; behavior also described in
the owner's own words, which match): exactly **two marker kinds** —

- a **price pill** for as many listings as the screen has room for, and
- a **small dot** for every other listing it draws — an individual, clickable home, not a count.

There are **no count circles** in Zillow's default experience. Density is handled by *label
thinning*: which homes get a pill is re-decided per viewport (that is why "some disappear when
you zoom out and appear in different places"), and zooming in converts dots into pills as pixel
room frees up. His line "some show price some are dots and when you get close shows the price"
is a description of that behavior — it is what he wants ours to do.

**Decision: replace supercluster's count bubbles with screen-space label thinning.**

- Project every fetched pin to pixels (both engines already have a projection).
- Walk pins in a **stable priority order** — selected first, then saved (hearted), then Active
  before Pending, then a deterministic hash of the id (so the sample looks arbitrary the way
  Zillow's does, but never flickers between two draws of the same viewport).
- A pin whose pill rectangle (estimated from its own price text width) fits without touching an
  already-accepted pill becomes a **pill**; one that collides becomes a **dot**; a dot that
  would sit invisibly under an accepted pill, or within a few px of an accepted dot, is
  **dropped** — it is unclickable at that zoom anyway, and the existing "Showing N of M — zoom
  in for more" banner already tells the truth about what is drawn.
- Hard cap on rendered markers (DOM nodes rebuilt on every idle) — measured, not guessed; see
  the commit that lands the cap for the number and the draw timings behind it.
- Dots carry the same interaction contract as pills: hover previews, press pins, keyboard
  focus previews, Enter pins. Visual language mirrors the chips — solid ink dot = for sale,
  hollow = pending, red ring = saved — with a ≥24px hit target around a ~12px mark (tap-target
  gate).

Why not keep clusters below some zoom: a count circle answers a question nobody at that zoom is
asking, and two vocabularies (counts here, prices there) is exactly the "three unrelated
states" reading he reported. One vocabulary, one rule: **every marker is a home; a pill when
its price fits, a dot when it does not.**

## 2. "on the new it says NEW instead of price"

Audited every chip renderer (GoogleMapView, Leaflet MapView, both popup paths): the chip text
is `chipPrice(price)` in every path — there is **no code path that can print NEW on a map
marker**. The card badges ("New", "Open House", status) never replace a price either. Most
plausible reading: the sentence describes Zillow's own map (its pins can carry secondary flags)
or a misread of a cluster bubble's count. Action taken anyway: the new thinning module's tests
assert a pill's label is always the floored price for every pin fed to it — the invariant he
asked for, held by a test rather than a promise.

## 3. Evidence note

Zillow's map itself sat behind a press-and-hold bot check on the one scripted visit made for
this round (screenshot in scripts/_scratch-r23/zillow.png), and that check was not bypassed.
What the visit did confirm before the gate: the five-item side rail (Search / Updates /
Favorites / Plan / Inbox) this round researches for §1e, the searched-place boundary polygon on
its map, and its result-count header ("246 results"). Marker-language details above rest on the
owner's description plus prior knowledge of the product, and the numbers chosen here are
verified against OUR map with the ratio probe, before/after.

## 4. The list and the map answer one question now

The defect he caught: round 22 made the MAP viewport-scoped while the GRID kept paging 50 at a
time over the unbounded county scope — page 2 contradicted what the map showed. The fix gives
`/api/idx/search` the same `north/south/east/west` box `/api/idx/pins` takes (one clause
builder, `searchFilters`, so the two literally cannot drift), and the SearchClient scopes the
grid to the map's settled viewport in map view.

Decisions worth recording:

- **The viewport page size is 150** (`VIEWPORT_PAGE_SIZE`) — his sentence sets it: "if you
  zoomed and there is 150 show 150 on the list". Paging still exists above it (Zillow
  paginates too; what makes it feel seamless is the scoping, not the absence of pages), and
  the pager's fetch carries the same box, so page 2 of a viewport is page 2 OF THAT VIEWPORT.
- **The refit gate (fitKey).** The naive wiring loops forever: scoped refetch → new seed pins
  → map refits → new idle → new box → refetch. The map now refits ONLY when the PLACE
  (county | city | free text | rental) whose results are showing changes — a county click
  flies the map, a price tweak or the grid's own refetch never moves it. fitKey is set when a
  place's results LAND, so the flight uses the new place's pins, not the old ones.
- **A viewport box is tagged with the place it was captured over.** A box settled over
  Dutchess must not scope a brand-new Queens search (Queens ∩ Dutchess-viewport = nothing);
  a mismatched box simply goes unused until the map refits and reports a fresh one.
- **A moved viewport resets to page 1** — a new box is a new question. This also means a
  `?page=3` deep link resets once the map takes over in map view; that page number belonged
  to the place-scoped list the map view no longer shows. Grid view still honors it.
- **Grid view stays unscoped** (50/page over the place scope) — it has no map to agree with,
  and it is the JS-disabled and shared-URL rendering.
- The count line reads **"N homes in this map area"** when scoped — and N is verified equal to
  the API's own total for the identical box.

Verified with real mouse input on the dev server (scripts/verify-viewport-scope.mjs):
count line 5,360 = API total for the same box · 150 cards · 0 extra fetches in 6 idle seconds
(the loop is shut) · a 260px pan produced exactly 1 scoped refetch and the count changed ·
page-2's fetch carried the same box · the saved result set held all 150 viewport items, so
prev/next on a listing page walks exactly the homes he was looking at.

## 5. The boroughs join the default scope

His decision, made: all eleven served areas are the default (the boroughs' 13,545 on-market
listings were behind the expander; Queens alone outweighs the six counties' Active
inventory). The default frame is the whole served region, the count line says "across the
Hudson Valley and NYC", the county chips now narrow rather than gate, and a chosen county
still flies the map to its real extent. Label thinning + the viewport-scoped grid are what
make the doubled scope renderable and honest. Browser verification of the fly-to is deferred
until the shared Supabase project recovers from its IO-starved window (same signature as
yesterday: 20-30s queries, TimeoutErrors, drain rather than chase).

## 6. Cards give the map its width

Owner: "a lot of unused white... bring those closer... show picture more... make those boxes
10% less and make map bigger." Done by measurement at 1440×900, not feel:

| | before | after |
|---|---|---|
| cards column / map column | 690 / 690 px | 621 / 759 px |
| card | 334×282 | 300×240 |
| photo band / body | 166 / 114 px | 142 / 97 px |
| photo share of card | 59% | 59% |
| FULL rows visible in the panel | **2** | **3** |

The height came out of the body (p-3 → tighter lg paddings, price 20px → 18px with a tighter
leading, address 14px → 13px) and the band's aspect (2:1 → 21:10 from lg) in equal measure,
so the photo's share holds while the card sheds 15% of its height — denser without reading
cramped. Phones keep the roomier scale untouched (all trims are lg:). The grid split moves
from an even 50/50 to 45/55 at xl and 42.5/57.5 at 2xl; lg (small laptops) keeps the old
split because two 300px cards need the width more than the map does there. Verified: the
round-22 clamp invariant still HELD (injected 90-char address, price top 2301 → 2301) and
zero horizontal overflow at 390 and 320.

## 7. The side rail — research first, and what ours should be instead

### What Zillow's five tabs actually are (researched 2026-08-06)

Seen directly on Zillow's own page (scripts/_scratch-r23/zillow.png, captured before its bot
gate): a slim left rail — Search, Updates, Favorites, Plan, Inbox. What each is for, from
product coverage of the June 2026 "Homebuyer Hub" launch (Inman 2026-06-23, HousingWire,
zillow.com/learn/what-is-buyability) plus product knowledge:

- **Search** — the map+list surface itself; the rail's home state.
- **Updates** — a feed of changes to homes you've engaged with: price cuts, status changes,
  new saved-search matches. Needs an account and a sending pipeline to mean anything. Its
  weakness: the "99+" badge is noise engineered as urgency.
- **Favorites** — hearted homes, with status badges.
- **Plan** — the Homebuyer Hub: "BuyAbility" (a live-rate affordability number that doubles
  as a Zillow Home Loans pre-qualification funnel), local market stats (active inventory,
  median days to pending, price forecasts), and "your team" — an agent and loan officer from
  Zillow's marketplace. Staged budget → find → offer → close. Its weakness is its honesty:
  the planning tool exists to route you into Zillow's lender and Premier Agent programs, and
  the useful numbers sit behind an account and a data-entry wall.
- **Inbox** — messages with those marketplace agents.

### What ours can honestly answer today

The rule from the filters work binds here: **a tab that cannot answer is worse than no tab.**
Audit of what exists behind each candidate, on this codebase, today:

| Zillow tab | our honest equivalent today |
|---|---|
| Search | `/search` — the round's map+list, live |
| Favorites | hearts work signed-OUT (SavedProvider, localStorage) and `/saved` exists |
| Plan | `MortgageCalculator` on `/financing` · `/buying`'s process content · the CMA/home-value flow · a human who answers 7 days a week |
| Updates | NOTHING SENDS (alerts flag is stored; the CRM will send) — cannot answer |
| Inbox | no messaging system — cannot answer |

And the standing constraint: **nobody can create an account** (Supabase signup disabled), so
anything requiring sign-in is a dead end for every visitor until the owner flips it.

### Three shapes considered

1. **Clone the five tabs** — rejected outright: Updates and Inbox would be empty theatre.
2. **No rail; promote /saved and a plan page in the top nav** — honest but loses the thing he
   actually liked: persistent, one-click side navigation while the map is open.
3. **A three-item rail that only says true things** — Search / Saved / Plan, desktop /search
   (lg+, where the map lives; phones keep the nav). **Chosen.**

### The design (v1)

- **Rail:** slim fixed-width column on /search at lg+, icons + 11px labels, monochrome ink,
  active state = solid ink block (the site's existing pressed language). Items: Search
  (current surface), Saved (navigates /saved; live count badge from SavedProvider — it works
  signed-out), Plan (navigates /plan).
- **/plan — "make it better" means inverting Zillow's funnel.** Zillow asks for your data,
  then shows you homes through its lender. Ours answers immediately, asks for nothing:
  1. **Monthly budget → homes bridge.** Reuse the financing calculator's math INVERTED: a
     monthly number (with rate/taxes/insurance assumptions stated inline) becomes a price
     ceiling and one button — "See homes under $X/mo" → `/search?priceMax=N`. Zillow gates
     this behind pre-qualification; ours is one slider and no account.
  2. **The four stages, told straight** — budget → search → offer → close, each a short
     paragraph in the site's voice linking the real pages (/financing, /buying, /home-value),
     NY-specific where it matters (attorney closings, county transfer taxes).
  3. **The team, without a marketplace** — Zillow sells you a stranger; this site IS the
     agent. Call/text CTA, seven days, the existing consent-safe lead path.
- **Explicitly NOT shipped:** Updates and Inbox. When the CRM's alert sender goes live,
  Updates becomes buildable (the saved-search `alerts` flag already travels with leads);
  Inbox needs a real messaging decision. Both recorded here so the next round inherits the
  reasoning, not the temptation.

Build order note: the handoff ranks filters (§2) above the rail, so the rail/plan build took
the budget that survived them — and it did fit this round. What shipped, exactly as designed
above: `components/search/SearchRail.tsx` (three items, lg+ only, live Saved count from the
signed-out heart store), `/plan` with the budget → price bridge (`priceForMonthly` — a binary
search over `calcMortgage` itself, so the bridge can never drift from the /financing
calculator; 5 tests including a round-trip invariant: the answer's payment is the LAST $5k
step that fits the budget), the four NY-specific stages, and the call/text block. Verified at
1440 (screenshots in scripts/_scratch-r23/) and at 390 (rail hidden, zero overflow). Sanity:
$3,200/mo at 20% down, 6% answers $585,000 — P&I $2,806 + NY-estimate tax $373 = $3,179.

## 8. Filters: three more honest questions, and two that refused

Measured inside the Active for-sale surface first (the Apartment trap's lesson), then shipped
through the settled mechanism (generated STORED column → partial index → SearchParams →
parseFilterParams → searchFilters → fixture → UI):

- **Washer/dryer hookup** (2,585 of 16,826) and **Formal dining room** (3,264) —
  interiorFeatures checkboxes, same family as the five that exist.
- **Municipal water and sewer** — ONE toggle over TWO facts (`has_public_water` AND
  `has_public_sewer`), because "no well, no septic" is a single buyer decision in this
  market. Vocabularies verified clean on a 2,000-row sample (Public / Well / … and
  Public Sewer / Septic Tank / …). The columns stay separate facts so a future control can
  split them without another table rewrite.

**Refused, with reasons recorded in the migration header:** Max HOA — `AssociationFee` is
replicated (2,929 numeric, median $580) but `AssociationFeeFrequency` is NOT in
SELECT_FIELDS, so monthly cannot be told from annual and a "$500/mo max" filter would lie;
it joins pool and fireplace on the needs-a-sync-change list. School district — 79% filled,
135 internally-consistent values, but a hardcoded 135-option select would rot into dead
options as inventory shifts; it needs a small dynamic values source (the suggest-index
pattern) before it can ship honestly.

**Validated the way he asked** ("test it in every few random way to confirm the data is
correct compare to one key mls"): 8 seeded-random filter combos (county × 1-2 facets × price
band) through our live API, every returned row's raw OneKey jsonb re-checked against every
predicate independently — **328 row-predicate sets, zero violations**
(scripts/verify-facets-live.mjs, extending round 22's 365-row pass). External leg:
onekeymls.com's own portal shows **100** results for Beacon, NY; our all-on-market Beacon
count is **99** — one listing apart, accounted for by our $10k junk-price floor.
