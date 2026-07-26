# PARITY — Listing detail page (round 9, 2026-07-26)

Work order for the ONE Opus subagent building this page. Orchestrator mapped live + ours at 1440
and 390 with Playwright on 2026-07-26.

**Head-to-head specimen:** 4918 Route 82, Salt Point (48 claimed photos, a *partial* mirror — the
worst case for the photo bug).
- LIVE: `https://realtylt.com/search/new-york/salt-point/misc/4918-route-82-bid-38-1030151`
- OURS: `/homes-for-sale/NY/salt-point/12578/4918-route-82/bid-38-KEY1030151`
  (prod: `https://realtylt-website.vercel.app/...`, local: `http://127.0.0.1:3100/...`)

Evidence captured this round lives in `docs/_audit/listing-round9/` (gitignored):
`live-1030151-{1440,390}.png`, `prod-1030151-{1440,390}.png`, `live2-photo-click.png` (live hero
band in full), `live-probe-make-offer.png` (live's offer modal), `live-dom.json`,
`live2-base.json`, `ours-geom-1440.json`, `prod-photo-render.json`.

---

## 0. THE #1 BUG — "Photo coming soon" beside real photos (owner-dictated, blocks page sign-off)

### What the owner sees
On our prod page for KEY1030151 the **main hero tile renders the branded moonlit "coming soon"
placeholder while the three thumbnails next to it show real photos**. Live shows 4 real photos.
Screenshot proof: `prod-1030151-1440.png` vs `live-1030151-1440.png`.

### The rule (verbatim intent, non-negotiable)
- **If the listing has ANY real photo, show ONLY real photos.** Never render a "coming soon" tile
  next to real ones. Render exactly the photos that exist/load; do not pad fixed slots; drop tiles
  whose media fails rather than showing the logo beside real pictures.
- **Only a listing with ZERO real photos shows the branded placeholder** (`lib/idx/placeholder.ts`).

### Measured root cause (do not re-derive — this is verified)
Census `scripts/_scratch-photo-mixed-census.mjs` over the 25 newest active listings, resolving every
claimed index through the media route to its final bytes:

```
{"FULL":13,"MIXED":8,"ZERO":3,"NOPHOTOS":1}      // 8/25 = 32% of new listings are MIXED
```

Three distinct failure shapes, all confirmed by serial probe (`scripts/_scratch-probe-tiles.mjs`,
storage HEAD vs route decision):

| shape | example | storage | route | what the user sees |
|---|---|---|---|---|
| **A. dead cover, live gallery** | KEY1030758, KEY1030151 (48 photos) | 0.jpg **missing**, 1..N missing too | idx 0 → `503 unavailable`; idx 1..N → `200 ok` (fresh signed URL still works) | placeholder in the **hero**, real photos in the thumbs |
| **B. covers-only mirror** | KEY1016835, KEY1029843, KEY1025214 | only 0.jpg present | idx 0 → `302 storage`; idx 1..N → `503` | 1 real photo + 9 placeholder tiles |
| **C. burst throttle** | any listing, first paint | n/a | **all 4 hero tiles returned `503 image/svg+xml` on first load**, then 1/2/3 recovered on `MlsImage`'s 2s/8s retry | placeholders flash, some never recover |

Shape C is measured in `prod-photo-render.json`: the four hero requests all came back
`503 image/svg+xml`; the visible result 4s later was 3 real + 1 placeholder. The `<details>` gallery
holds **44 more `<img>` tags** for this listing, so opening it fires a burst at the media host and
manufactures more 503s.

**Why a server-side "which photos exist" probe is NOT the answer:** for KEY1030151 storage returns
400 for every index yet indices 1..47 serve real bytes through the legacy signed-URL proxy. Storage
existence ≠ photo availability. The resolution must happen where the truth is known — at load time,
in the client.

### Prescribed fix (design is settled; implement it, don't redesign it)
1. **`MlsImage` stops being its own fallback.** Today `if (failed) return <NoPhoto />`
   (`components/idx/MlsImage.tsx:32`) — that single line is what paints a coming-soon tile beside
   real photos. Give it an `onUnavailable?: () => void` and, when a parent owns the set, render
   *nothing* on terminal failure so the parent can drop the tile.
2. **A client owner for the photo set.** The listing photo band + `<details>` grid must be driven by
   a client component holding `available: string[]` (starts as the claimed array). A tile that
   exhausts its retries is removed from that array. All counts derive from the surviving set:
   "View All (N Photos)", the lightbox `i / N`, the thumbnail rail.
3. **Hero promotion.** If index 0 dies but later photos live, the **first surviving photo becomes the
   hero** (that is shape A, the most visible case). Never leave the biggest tile as a placeholder
   while smaller tiles show photos.
4. **Placeholder only at zero.** When `available.length === 0`, render `<NoPhoto />` — that is the
   only legitimate coming-soon surface. Same rule for `ListingCard`: on cover failure try the next
   indices client-side before falling back to `NoPhoto`.
5. **Lightbox parity.** `components/idx/ListingGallery.tsx` uses raw `<img>` for the main photo,
   thumbnail rail and the neighbour preload — a 503 there renders the placeholder SVG *as if it were
   a photo* (it is served with `200` for `empty`). Those must respect the same surviving-set rule.
6. **Stop the burst.** Do not mount 44 `<img>` tags eagerly. The `<details>` grid should only load
   its tiles once opened (and/or throttle concurrency), so a 48-photo listing does not self-inflict
   429s. Keep the no-JS `<details>` fallback working.
7. **Route-side cover substitute for the upstream path** (`app/api/media/[id]/[idx]/route.ts:124`):
   today the substitute only probes *storage*. Extend it so that when idx 0's upstream fetch fails
   and the listing has more photos, it tries `photos[1..3]` upstream before giving up. Bounded, no
   MLS DATA calls (media host only). This fixes shape A server-side, which is better than fixing it
   in the client alone.

**Test across the shapes.** Known specimens (re-verify, they self-heal over time):
- ZERO photos → any row with `photos: []` (find one with the census script)
- shape A (dead cover) → `KEY1030151` (48), `KEY1030758` (9), `KEY1030714` (3)
- shape B (covers only) → `KEY1016835` (10), `KEY1029843` (11), `KEY1025214` (18)
- FULL → 13 of the 25 sampled; pick any from the census output.

Re-run `LIMIT=25 node scripts/_scratch-photo-mixed-census.mjs` when you are done: **MIXED must be 0
tiles-visible** (the census measures the route; your job is that the *UI* never paints a placeholder
beside a real photo — prove that with screenshots of all four shapes at 1440 and 390).

---

## 1. LIVE ANATOMY (1440) — section by section, with measured boxes

Page height 5232 (live) vs 5449 (ours). At 390: live 6806, ours **9414** (see §3, mobile accordions).

### 1.1 Sub-nav bar (y≈338)
- Left, sentence-case ~20px gray links: `Search · Overview · Payment · Market Insights · Schools`
- Right, three **black pill buttons**, ~36 tall, ~4px radius, white text + leading icon:
  `$ MAKE AN OFFER` (178w) · `⬆ SHARE` (113w) · `♡ SAVE` (98w)
- OURS: same 5 anchors but 12px/700 uppercase; `MAKE AN OFFER` 157×28, `SHARE` 93×30, and a bare
  36×36 heart with **no "SAVE" label**. Gaps: label the heart `SAVE`, match pill height (36),
  match live's icon+label pairing.

### 1.2 Photo band (y=424..917, height 493)
| element | live box | ours box |
|---|---|---|
| main photo | `[80,424 827×493]` | `[112,318 807×400]` |
| right tile 1 | `[923,424 437×243]` | `[112,318 403×129]` (stacked) |
| right tile 2 | `[923,682 211×235]` | `[112,453 403×129]` |
| right tile 3 | `[1149,682 211×235]` | `[112,588 403×129]` |
| gaps | 16px main↔column, 15px between tiles | 6px |

Overlays **inside** live's main photo:
- bottom-left: three dark rounded icon buttons — camera (Photos) `46×38`, map-pin (Street View)
  `42×38`, map (Map View) `42×38`, at y=855
- bottom-right: dark pill **`⛶ View All (48 Photos)`**
- centre-right: circular `›` carousel next arrow (`[843,650 40×40]`), `‹` at `[104,650 40×40]`

OURS: `SHOW ALL 48 PHOTOS` is a `<summary>` **below** the band at `[112,750 192×34]`; no view-mode
icons on the band (they exist only inside our lightbox); no carousel arrows on the band.

**Match-or-beat:** adopt live's 1-big + 1-wide + 2-half arrangement and its in-photo overlays
(View All pill bottom-right, the three view-mode icons bottom-left). Keep our lightbox (it is
better than live's). Keep the `<details>` no-JS fallback but hide its summary when JS is available
if the overlay pill replaces it — do not ship two competing "show all photos" controls.

### 1.3 Price / facts block
Live: address line, then `$5,250,000` with `Est. Payment: $27,462/mo` beneath it on the left; on the
right a horizontal `5 Bed | 4 Bath | 3,424 Sqft` row with hairline dividers. Below: a green dot
`Status: Active | Days on site: -7` and a **`Get Pre-Qualified`** link.
Ours: `4918 Route 82` h1 36px/600 left, `$5,250,000` right with `Est. $26,975/mo` link under it;
then a `BEDS BATHS SQFT STATUS ON SITE` label/value row.
Gaps: ours has **no `Get Pre-Qualified` link** (live points it at financing). Ours is otherwise
cleaner and shows honest `Coming Soon` status where live prints a nonsense `Days on site: -7` —
**do not copy live's bug**.

### 1.4 Right rail
Live: `Request a Tour | Request Info` tabs → 3-day picker (`Sun 26 Jul / Mon 27 / Tue 28`) with
`‹ ›` arrows → black `IN PERSON TOUR` button → agent card (portrait, `Levan Tsiklauri`,
`Investor & Realtor`, `View agent profile` link) → `✉ EMAIL` + `☎ CALL` buttons (193×40 each).
Ours: same tabs (205×44) + picker (106×75 ×3, arrows 32×44) + `IN PERSON TOUR` (409×44) +
**extra** `MAKE AN OFFER` (409×46) + agent + an inline `Your Name / Email Address / Phone Number /
interest select / REQUEST INFO / TOUR` form.
**Ours beats live here — keep it.** Only check vertical rhythm and that the rail's total height
does not push the fold. Add a `View agent profile` link if we have an agent page to point at.

### 1.5 Body
Live: two columns — `House Description` (with `Show more`) | `Highlights` (Listed by, Property
Type, Lot/Acreage, Year Built, County, School District, Listing ID); then `Interior Features` |
`Exterior Features`.
Ours: single flow — `About this home`, `Highlights` (richer table incl. price/sqft, garage, annual
taxes, listed date, MLS#), `Inside`, `Outside & utilities`, `Schools` (with real school names).
**Ours beats live.** Keep, but our description has no `Show more` clamp — live clamps at ~10 lines.
Consider clamping ours on mobile only (see §3).

### 1.6 Payment
Live: `PAYMENT CALCULATOR | PAYMENT BREAKDOWN` tabs (h2 16px at y=2428), donut with total in the
middle, `Principal Interest`/`Taxes` dotted rows, three editable pencil fields (201×50), a
disclaimer, then `Today's Rates` 30/20/15-year.
Ours: dark `ESTIMATE YOUR MONTHLY PAYMENT` panel with 7 inputs (262×33) + `RESET`, donut with
`Principal & Interest / Taxes / Insurance` percentages, `REPRESENTATIVE RATES` 30/20/15 rows.
**Ours beats live** (ours breaks out insurance and PMI). No change needed beyond checking the input
height (33px) reads deliberately, not cramped.

### 1.7 Never miss a property
Live: black band, `NEVER MISS A PROPERTY` h1 48px/700 at `[84,3391 576×48]`, copy right, white
`Sign Up` button. Ours: same band, `Never miss a property` 36px/600, `SIGN UP` 136×44 → `?saveSearch=1`.
Near-identical; ours is sentence case by design.

### 1.8 Market insights
Live: `MARKET INSIGHTS | SCHOOLS | NEIGHBORHOOD` tabs at y=3603, then three cards
(`Current Listings`, `Average Price`, `Average Days on Market`) each 411 wide — **all showing `N/A`**.
Ours: `The market around Salt Point, NY` with three real cards (7 / $1,165,972 / 61 days).
**Ours massively beats live.** Gap: live has a **NEIGHBORHOOD** tab we do not have; ours puts
Schools in its own body section instead of a tab. Leave the structure as ours; do not fake a
neighborhood tab with data we do not have.

### 1.9 Similar homes
Live: none. Ours: `Similar homes in Dutchess County` + `SEE ALL 28`.
**Ours beats live — but its three cards currently render with blank/gray photo areas** on prod
(`/api/media/KEY1028057/0` etc. never completed). Fold this into §0: the rail's `ListingCard`s must
show a real photo or nothing sensible, never a broken/blank frame.

---

## 2. LIVE POPUPS (exact contents — extracted read-only from the live DOM)

### 2.1 `Start an Offer` (id `start-offer-modal`) — the important one
Centered white modal ~628 wide. Title `Start an Offer`, `×` top-right.
Copy: *"By starting an offer, you're only submitting an initial request to start the process, so
there are no obligations. Tell us what you have in mind, and we will reach out to discuss details
and assess the strength of your offer before proceeding."*
Fields (2×2): `Your First and Last Name` | `Your Email Address` / `Your Phone Number` |
`Offer Amount` **prefilled with the list price** (`$ 5,250,000`).
Two radio groups side by side, both defaulting to `Yes`:
- **`Are you pre-approved with a lender?`** → `Yes` / `No` / `I'm buying with cash`
- **`Have you seen this home in person?`** → `Yes` / `No` / `I would like to go see it`
Then `Any Comments or Questions` textarea, black `START AN OFFER` + outlined `✕ NEVERMIND`, and a
TCPA consent paragraph.

OURS (`components/leads/ListingLeadCTAs.tsx` `OfferModal`): offer amount **already seeded with the
list price** ✓, name/email/phone/message ✓ — but **both qualifying radio groups are missing**.
**GAP → add them** and carry the answers into the existing `offerQualifier(...)` payload so they
reach `/api/lead` (no new lead path, no second POST).

### 2.2 Others (deliberately NOT copied — record the decision)
`force-virtual-registration`, `force-combine-registration`, `force-sold-registration` = Brivity's
**forced-registration walls** ("Sign Up to View This Property!", hiding price/photos behind a
signup). We show everything freely; do not copy. `force-oh-*`, `modal-landing-share-link`,
`force-share-link` = agent-side open-house/landing-page tooling, not consumer surface. `popupCTA` =
the buying/selling qualifier we already ship as `QualifyingWizard` on selling/financing/home-value.

---

## 3. MOBILE (390) — the biggest structural gap

Live 6806px vs **ours 9414px (+38%)**. Live collapses body sections into **accordions** on mobile:
`House Description` (Show more), `Highlights`, `Interior Features`, `Exterior Features` all render
as collapsed rows with a chevron; live also inserts a `Questions about this listing? → Contact Agent`
button and a `MESSAGE / EMAIL / CALL` trio on the agent card.
Ours renders every section fully expanded, so the visitor scrolls ~3,000px of specs before reaching
the calculator.

**Task:** collapse `Inside`, `Outside & utilities`, `Schools` (and clamp `About this home`) behind
accessible disclosure controls **at 390 only** — expanded on desktop, no JS required (`<details>`
is fine and matches our no-JS discipline). Target: our 390 height within ~10% of live's.

Also at 390: live shows a single photo (swipeable) with the `$ / share / heart` icon trio above it;
ours shows the single hero with no thumbnails — acceptable, but the View-All overlay pill and the
photo-count must be honest after §0's pruning.

---

## 4. NON-PHOTO DEFECTS FOUND THIS ROUND

1. **Duplicate SHARE button.** Ours renders `SHARE` twice: sub-nav `[1191,252 93×30]` and again at
   `[720,856 93×30]` above the price. Live has one. Remove the duplicate (keep the sub-nav one).
2. **Google Ads conversion pixel is CSP-blocked (site-wide, orchestrator will fix — do not touch
   `next.config.ts`).** `ad.doubleclick.net` is missing from `connect-src` and
   `googleads.g.doubleclick.net` from `script-src`, so `gtagSendEvent` conversions never leave the
   browser. Recorded here so it is not lost; **the orchestrator owns this fix.**
3. **`Get Pre-Qualified` link** missing from our status row (live links it to financing).
4. **`SAVE` label** missing next to our sub-nav heart icon.

---

## 5. RULES FOR THIS BUILD

- **Scope: the listing detail page only.** `app/listing/[id]/`, `app/homes-for-sale/**`,
  `components/listing/*`, `components/idx/{ListingGallery,MlsImage,ListingCard}.tsx`,
  `components/leads/ListingLeadCTAs.tsx`, `app/api/media/**`, and their tests. **Do not** touch
  `next.config.ts`, MLS sync code, other pages, or security controls; **never push**.
- **MLS is rate-limited.** No new MLS Grid DATA-API calls on any request path. The media host is
  already throttling us — your changes should *reduce* concurrent media requests, never increase them.
- Anti-AI-slop rules bind: no gradient text/buttons, no `#8b5cf6`-family purple as primary, no neon
  cyan, **zero em dashes in visitor copy**, no arrow-glyph CTAs, focus-visible ≥3:1, tap targets
  ≥24px, body ≥16px on mobile, no horizontal overflow at 390 **or 320**, reduced-motion clean.
  Design system "Hudson Twilight".
- Where live is wrong (`Days on site: -7`, `N/A` market cards, forced-registration walls,
  reCAPTCHA), **do not copy it**. Where ours is already better (calculator, insights, schools,
  similar homes, lightbox), **keep ours**.
- Verify every change in a real browser at **1440 and 390** with screenshots. `tsc` + `npm test`
  green, run in the **foreground**. Commit page-scoped as you go.
