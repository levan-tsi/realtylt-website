# Round 18 — what I measured, what I changed, and what I deliberately did not

Single session, 2026-08-02. Three of the owner's four items shipped; the fourth is out of this
repo's hands. Every claim below was measured on the running site, and the numbers are here so
nobody has to re-derive them.

---

## 0. The health check, and the answer to "is the one-photo share falling?"

**No — and the fix is fine.** This looked like a failed fix and it is not.

| measure | round 17 | now |
|---|---|---|
| Pending rows serving exactly ONE photo | 8,402 of 10,043 (84%) | 8,400 of 10,045 (84%) |

The number did not move, so I split the two explanations apart by looking **only at rows the cron
has processed since the fix shipped**:

| rows touched | one-photo | 5+ photos |
|---|---|---|
| last 6h (488 rows) | 7% | 68% |
| last 24h (1,318 rows) | 6% | 69% |
| last 24h, Pending only (45 rows) | 13% | 80% |

So the change-detection fix **works**. The 84% is pure backlog: a listing only re-mirrors when the
feed touches it again, and that is ~1,300 rows a day against 27,605 active. Left alone it takes
about three weeks. Confirmed the fix is genuinely live, too — of the rows written since
2026-08-02 ~06:00 UTC essentially every one carries `photosMirroredCount` (250/253, 107/107, …),
the field round 17 added. The 7,705 rows written at 00:00 UTC predate the deploy and have none.

Sync itself is healthy: 1,319 rows modified in 24h, newest listing first seen 18:07 today.

### The backfill is the only lever that clears it, and it works right now

I ran a deliberately small live slice (1 feed page, 6 listings, cap 12, concurrency 2):

```
slice: kept 257, took 6, mirrored 72 photos (skipped 0, fetched 72, downloaded 72)
DONE (live) — 6 listings, 72 photos mirrored, 1 feed pages.
```

**72 of 72 downloaded, zero failures.** The media host is serving. The size of the full job:

| | |
|---|---|
| listings holding fewer photos than the feed has | **13,382** |
| photos missing | **271,141** |
| of those listings, Pending | 8,077 |
| average photos wanted per short listing | 21.4 |

At the hourly cron's own sustained rate (~1,200 photos per run) that is roughly half a day of
continuous downloading, and about 68 GB — which lands near the ~194 GB "every listing full"
ceiling the last round already priced at **$0/mo** overage. **The full pass is still owner-gated;
this round only proves the chain works and sizes the job.** Run it with
`node scripts/backfill-photos.mjs --max-pages 999 --max-listings 999999`.

---

## 1. The map popup admits a home is Pending  *(owner item 1 — shipped)*

The chips went hollow for Pending last round, so a visitor now *learns* the distinction from the
map, opens a popup, and it said nothing — while the listing card had carried a PENDING badge all
along. The popup now carries the same badge: solid ink, 8px radius, 10px bold uppercase.

It sits **bottom-left**, not the card's top-left, because both top corners of a popup are already
controls (heart, close). Pairing it with the photo counter on the bottom edge gives the frame two
deliberate corners instead of one crowded one.

Verified by hovering a real Pending chip (`$159K — 43 E Main Street`): badge reads "Pending",
radius 8px, background `rgb(0,0,0)`. An Active chip beside it renders no badge.

> **Two traps for anyone probing map popups.** Hovering leaves *stale* popup nodes in the DOM, so
> match the popup under test **by address**, not by "the last one". And price chips **overlap** —
> the pointer opens whichever chip is topmost, so check `document.elementFromPoint` at the chip's
> own centre before trusting that you hovered the one you picked. Both bit me, and both looked
> exactly like "the badge is not rendering".

---

## 2. The coming-soon panel  *(owner item 2 — shipped)*

The owner endorsed the direction (a typographic panel, not a fake house) and wanted the execution
better. I rendered the artwork at the crops it *actually* gets — `NoPhoto` uses `object-cover` —
before touching it, and three things were wrong:

- **The hairline frame was dying at card size.** The inset rectangle sat at x=40 of a 1200-wide
  drawing, and a near-square card scales by HEIGHT and throws the sides away. On every search
  card, home tile and square crop you saw only the top and bottom rules — two stray lines near
  the edges, which reads as a rendering fault rather than as a frame.
- **The aperture glyph** was the loudest thing on the panel at every size, and it is the most
  generic mark in software.
- **The type collapsed to ~10px** on a search card, so the one thing the panel exists to say was
  the hardest thing on it to read.

Frame and glyph are gone — **two elements removed, none added.** What replaces them is structural:

- **Square viewBox.** A 3:2 drawing cropped into a 3:4 tile loses a third of its width. Everything
  now sits inside a safe area (x 150–850, y 200–800) that survives every crop the site uses, from
  the 2:1 map popup to the 3:4 portrait tile.
- **Two lines.** Breaking the phrase lets each line be far larger inside the same safe width
  (66 against 52), so a 300px card renders ~19px of readable type instead of ~10px.

The captionless cut is now the wash and the wordmark alone: at a 252px popup or a 96px thumbnail a
sentence is unreadable and an icon is noise.

Evidence: `docs/design-r18/comingsoon-crops.png` (before) vs `comingsoon-after.png` (after), both
at 300×225 / 300×400 / 320×300 / 900×600 / 252×158 / 96×72, plus a real no-photo listing hero.

> **Worth knowing before anyone edits these:** an SVG loaded through `<img>` is its own document
> and gets **no `@font-face` from the page**, so `Newsreader` never renders here. The Georgia
> fallback is what ships, and the panel is set to Georgia's metrics.

---

## 3. Previous / next home  *(owner item 3 — shipped)*

The hard part was never the arrows, it was **"next within what"**. A listing page is reachable from
a filtered search, a map pin, a rail, or a cold Google link, and an arrow that walks an order the
visitor never chose is worse than no arrow — it promises a sequence and delivers a shuffle.

**The design:** the result set is written down at the only moment it is genuinely known (on
`/search`, by `SearchClient`), and the listing page offers arrows **only when the home on screen is
a member of it**. A cold visitor sees nothing at all.

**Why sessionStorage and not the URL:** the listing route is ISR-cached (`revalidate 600`) and
shared. `?from=<query>` would fork that cache per search, put someone else's filters inside a
shared link, and add canonical work — for a convenience that is per-tab by nature. Storage is
untrusted input, so every field is shape-checked and a `path` that is not site-relative is dropped
(`//evil.example` passes `startsWith("/")`, which is why that has its own test).

**Where it sits — measured, not guessed.** The owner offered two homes ("next to address … maybe
next to search overview"). I built the sticky sub-nav version first and it does not survive a
phone: its Offer/Share/Save group is **281px of a 320px screen**, so the pager pushed the document
**88px past the viewport at 320 and 18px at 390** (the same page cold measures 0, so it was the
pager). It lives on the **breadcrumb row** instead, opposite `Search / <County>` — full width at
every size, already the line that says where this listing came from, and at 1440 it lands directly
above the price so the row mirrors the address/price row beneath it. **0 overflow at 1440/390/320.**
Losing stickiness costs little: ← / → work anywhere on the page.

**The keyboard guard is the part most likely to break later.** The photo lightbox uses the same two
keys, so the handler bails on an open `aria-modal`, on a typed-in field, on any modifier chord
(Alt+← is BACK), and on an already-defaulted event. Proven both ways: arrows flip PHOTOS while the
gallery is open and the URL does not move, and they move HOMES again once it closes.

Walked as a visitor, one tab: page 2 of results → a listing reads `1/36` and stores
`page 2/69`; tightening filters to `bedsMin=4&priceMin=800000` gives `2/31`; a listing from the
superseded set correctly shows **no arrows**; browser Back restores the 36 cards and the set.

**Known limit, and it is the right trade:** open a listing in a NEW TAB and there are no arrows —
sessionStorage is per-tab. `localStorage` would fix that and would also hand someone arrows from a
search they ran days ago, which is worse.

---

## 4. What the sweep turned up that nobody had reported

**/search pushed the document 22px sideways at 320.** Round 17 grew the quick-filter group from two
answers to four ("All Listings / Active / New Listings / Pending") and the row could not wrap.
Fixed with `flex-wrap` — the four are peers and a phone may stack them. Pre-existing: my own change
to that file added no DOM at all, which I checked before blaming it.

The sweep now names the widest offending element rather than just reporting a number, which is what
pointed straight at the group. Clean afterwards: **0 overflow across home, search, buying, selling,
connect, financing, top-areas and a listing page, at 1440 / 390 / 320**, no JS errors, no 4xx/5xx.

---

## 5. Two things I chased and deliberately did NOT change

**A "dark circle covering the quick filter" at 320** was `NEXTJS-PORTAL` — the dev-mode indicator.
It does not exist in production. The real chat launcher sits bottom-right (1356,816 at 1440;
247,781 at 320) and covers **no** interactive element's centre at any of the three widths.

**Page 1 of a `mixed` search shows 31 cards where every other page shows 36** — and this is
correct behaviour, not a bug. I verified independently that all 283 listings are served across the
8 pages with **zero duplicates and zero missing** versus a `sort=newest` reference. The daily ring
rotation moves whole pages around a ring, so the set's genuinely short tail page lands somewhere
other than last; today that is page 1.

I considered pinning the tail to always-last and rejected it: rotation moves whole pages, so a
listing's page-mates are fixed and rotation only decides *which page number* that group is shown
as. Pinning the tail would mean those ~31 listings **never** get a front-page turn, permanently, to
avoid a ragged final row on page 1 roughly one day in eight. That is a wash, and this is the exact
code that once served four results on page 2 — so it stays as it is. Flagged here so the next round
does not "discover" it again.

---

## Still open, and why

- **The published-CMA enumeration** (owner item 4). Anon can still enumerate `cma_reports`,
  `cma_report_comps` and `mls_listings`. The fix is three ordered steps that straddle a CRM deploy
  and a repo another session owns — it cannot be patched from here, and dropping the policy first
  would break his live CMA page. Unchanged from the round 17 write-up.
- **57 raw `media.mlsgrid.com` URLs** anon-readable (all already expired). Website-side fix, but it
  touches the rate-sensitive sync path and wants its own round.
- **The hero lab** (`git checkout hero-lab` → `/lab/hero`) is still waiting on the owner's eyes.
  Untouched this round, deliberately — he asked to judge the three variants before anything ships.
