# Handoff — round 20

Written 2026-08-03 at the end of round 19. **Everything below was checked on the real systems
this session unless it says otherwise.** Round 19's own summary is the top block of
`POLISH_CHECKPOINT.md`; this is what round 20 should do.

---

## 0. First actions, in order

1. `node scripts/_scratch-r16-debt.mjs` — freshness. If "modified in last 24h" is 0, the feed is
   frozen and nothing else matters. It was **1,786** when this was written.
2. **Finish the photo backfill** (§1). It is the biggest visible quality gain available and it is
   already proven clean.
3. **Stress-test round 19's work** (§4). It is the largest section here on purpose: he asked for
   it explicitly, and two of the things round 19 shipped touch money-and-law paths.

---

## 1. THE PHOTO BACKFILL — half done, keep going

He said "yes, in chunks". Two slices ran during round 19 and the abort criteria never fired:

| | |
|---|---|
| listings | 631 |
| photos mirrored | **13,280** |
| fetched vs downloaded | **13,280 / 13,280** |
| failures | **0** |
| `Request limit reached` | **0** |

```bash
node scripts/backfill-photos.mjs --max-pages 999 --max-listings 999999
```

Resumable via `scripts/.photo-backfill-watermark.local` (currently `2026-07-27T22:39`).
**ABORT IF** `fetched > downloaded`, or any `Request limit reached` line appears. That is the
exact failure that froze the whole inventory for seven days in round 16.

Coverage when round 19 started: 27,643 active rows, **2,039 with zero photos**, only 12,636 at
5+. Re-measure after the pass and put the new numbers in the checkpoint.

---

## 2. GOOGLE PLACES ON THE HOME-VALUE BOX — his ask, and it needs his decision on cost

**What he reported:** typing `150 hooker ave poughkeepsie ny` finds nothing on our site, and on
his live site it does.

**What I found by driving his live site in a browser this session — this is the whole answer:**

| | live realtylt.com (Brivity) | ours today |
|---|---|---|
| hero "Search for Homes" | **no autocomplete at all** (verified: typed the address, nothing appeared) | suggests counties, cities, ZIPs **and now listing addresses** |
| /homevalue address box | **Google Places autocomplete** — pin icons, "150 Hooker Avenue, Poughkeepsie, NY, USA", "150 Hooker Avenue, Laurens, SC, USA" | plain text input |

So his "google fill" is on the **home-value box**, not the search box, and it is Google Places:
it suggests *every address on earth*, not listings. That is the right tool for that box, because
the whole point is valuing a home that is **not** for sale.

**150 Hooker Avenue is genuinely not in our inventory.** There are eight Hooker Ave/St listings
in `idx_listings` and no 150. No listing search can ever return it. Only Places can.

**The rest of his live flow, captured step by step:**

1. Places autocomplete → pick an address
2. **"We've found your home!"** — a **Street View thumbnail of the actual house**, the
   normalised address with ZIP ("150 Hooker Avenue / Poughkeepsie, NY, 12601"), and an *Edit*
   link
3. Two choices: **Get Home Value** ("View your free personalized report") and **Sell Your Home**
   ("Connect with us to explore your selling options")
4. Value branch → **"One more step to view your full report."** — *Claim with Google*, *Claim
   with Facebook*, OR Full Name + Email + **Mobile Number (used as password)** → CLAIM FREE
   REPORT
5. → `/myportal/report?market_report_id=…`

**Round 19 already shipped steps 2–3 in our own form** (the fork, with both branches wired). What
is missing is step 1 (Places), the Street View confirmation, and the address normalisation.

### WHAT IS ALREADY WIRED — he pushed back on this and he was right

He asked: *"don't we already use it in our map with street view and everything for all
propertys, isn't it already wired in, don't we need just enablement on those areas?"*

**Mostly yes.** Measured against the live key this session (`scripts/_scratch-r19-gapis.mjs`,
`scripts/_scratch-r19-places.mjs`):

| Google API | state on our existing key | already used by |
|---|---|---|
| Maps JavaScript | **enabled** | `GoogleMapView`, the listing gallery |
| **Geocoding** | **enabled** — resolved his exact query to `150 Hooker Ave, Poughkeepsie, NY 12601, USA` | `ListingGallery` geocodes each listing on open |
| **Street View** | **enabled** — `getPanorama` returned `OK`, and a panorama EXISTS for 150 Hooker Ave | the listing gallery's Street View tab |
| **Places** | **REQUEST_DENIED** | nothing yet |

So billing is live on the project, the singleton loader exists (`lib/idx/maps-loader.ts`), and
Street View + Geocoding already work on the very address he tested. **Places is the only piece
not switched on**, and Google's own error names the fix: the legacy `AutocompleteService` is
"not available to new customers" as of 2025-03-01, so it has to be **Places API (New)** with
`AutocompleteSuggestion`.

### This changes the options, and the cheap one is genuinely good

**(a) Geocoding + Street View only — NO new API, works today, costs nothing new.**
Type the full address, press Find Out, geocode it, then show his live site's confirmation step:
*"We've found your home!"* with the **Street View thumbnail** and the **normalised address with
ZIP**, plus an Edit link. That is steps 2–3 of his live flow, built entirely on APIs that are
already enabled and already paid for. What it does NOT give is the type-ahead dropdown while
typing — the visitor types the whole address themselves. **Do this one first regardless**, it is
most of the perceived value.

**(b) Add Places API (New) for the type-ahead.** One Cloud console toggle plus `&libraries=places`
on the loader and the new `AutocompleteSuggestion` API. Small code change, real recurring bill
(per-session pricing — check Google's current rates before quoting him, do not assert them from
this document). Restrict to `country: "us"`, bias to Hudson Valley bounds, use session tokens so
a whole typed query bills once, and store the returned `place_id` + components on the lead so
the CRM gets a clean address instead of free text.

**(c) Places on the listing search too.** Still not recommended: suggesting an address we have no
listing for is a dead end, and our own address suggestions (round 19) already beat live there.

**Recommendation: (a) now, (b) as his call.** The earlier version of this handoff framed Places
as the only route and overstated the integration — that was wrong, and (a) was the option it
missed.

---

## 3. CONSENT — does "automated and recorded" cover AI calls?

**His question, and it deserves a straight answer: yes, for the disclosure. No, as blanket
permission to do anything.**

The wording now shipping is:

> Yes, you can call or text me about my request. Includes automated and recorded calls and
> texts. Optional, and never required to buy or sell a home. Reply STOP any time. Message and
> data rates may apply.

- The federal requirement (prior express written consent, 47 CFR 64.1200(f)(9)) is that the
  agreement disclose calls placed with an **autodialer or an artificial or prerecorded voice**.
  An AI voice agent is an *artificial voice*. "Automated and recorded calls" discloses that in
  plain language. The regulation does not require the words "AI", "robocall", "autodialer" or
  "prerecorded" — it requires the person to understand what they are agreeing to.
- **So we do not have to say "AI" to place AI calls.** What we cannot do is remove the automated
  and recorded reference entirely — that clause is the thing that makes this consent cover the
  Vapi calls at all. Without it the box is friendlier and protects him less than no box.
- **Two caveats a round-20 session should not skip.** (i) This is my reading, not a lawyer's, and
  it should get ten minutes from whoever handles compliance at United Real Estate before launch.
  (ii) If the AI ever starts calling people for something *other* than their own request —
  prospecting, circle-dialling, a purchased list — that is a different consent and this wording
  does not cover it.
- The stored record (`lib/leads/consent.ts`, contract in `LEAD-CONSENT-CONTRACT.md`) keeps the
  exact wording per lead, so if the wording changes later, old leads still prove what *they* saw.

---

## 4. STRESS-TEST ROUND 19 — he asked for this explicitly

*"check your work what u did every way possible and needed stresstest it and fix if anything
found bugged."* Round 19 shipped six things. Here is what to attack, and what is already proven
so you do not re-prove it.

### 4a. Consent (highest stakes — this is a legal record)

- [ ] Submit from **every** surface that takes a phone and confirm a `consent` object arrives:
      home footer, /selling hero, /financing, /home-value both branches, /connect, a listing
      "Schedule a tour", a listing "Make an offer", /services/*, the saved-search alert opt-in.
      **Intercept `**/api/lead` — `CRM_LEAD_WEBHOOK` is LIVE.** Proven so far: home footer
      (ticked and declined) and the listing forms via source assertion only.
- [ ] Ticked vs unticked vs ticked-then-unticked. Unticked must still submit.
- [ ] A lead with **no phone number** must carry no `consent` at all (absent ≠ declined).
- [ ] Try to forge it: POST `consent: {granted:true, at:"1999-…", ip:"1.1.1.1"}` directly to
      `/api/lead` and confirm the server overwrites every field but `granted`. There is a unit
      test; do it over HTTP too.
- [ ] Keyboard only: can you reach and toggle the box, and is the focus ring visible on both the
      light and dark variants?
- [ ] Screen reader: the label and the fine print must both be announced with the checkbox.
- [ ] 320px: the fine print must not overflow.

### 4b. The home-value fork

- [ ] Back button and browser refresh at each step. The fork is component state, so a refresh
      drops it — decide whether that is acceptable or whether it should live in the URL.
- [ ] "Use a different address" and "Back" from both branches.
- [ ] An address with a comma, an apostrophe (`123 O'Brien St`), a unit, and a 200-character
      paste. Check what reaches `?address=` and what `ReportGenerator` splits out of it.
- [ ] **The one genuinely unproven path:** sign in for real and generate a CMA end to end. Round
      19 verified the link carries `?address=`, that the portal gates on auth, and that the
      generator reads the param — but never completed a signed-in generation. Do that first.
- [ ] Empty address, whitespace-only address.

### 4c. Address search

- [ ] The tokenised matcher: unit numbers (`#L2`), hyphenated house numbers (`136-35`), street
      names that are also town names ("Beacon"), a query that is only noise words ("ave ny"),
      and a 200-character paste.
- [ ] SQL/PostgREST injection: `*`, `(`, `)`, `,`, `.`, `%`, backslash, and a quote. The filter
      is built by string concatenation — **prove the stripping holds**.
- [ ] Latency: the address lookup is a live DB call on the keystroke path. Measure p95 on
      production and confirm the 2.5s timeout degrades to area-only rather than hanging.
- [ ] Confirm addresses stay **Active-only** (a suggestion that 404s or shows a sold home is
      worse than no suggestion).

### 4d. The dropdown portal — regression-test this hard, it is new and it is global

Round 19 found the home-page dropdown had **never been clickable** and fixed it by portalling
the list to `<body>`. That fix touches every search box on the site.

- [ ] Hit-test (`document.elementFromPoint` at each option's centre) on: home hero, /search,
      and any other `LocationSuggest` mount. `scripts/_scratch-r19-zorder.mjs` does this.
- [ ] **Scroll while the dropdown is open**, and resize the window. It is `position: fixed` and
      re-measured on scroll/resize; confirm it tracks and does not detach.
- [ ] Mobile 390 and 320: does the fixed popup fit, and does it go off-screen near the right
      edge? (It is positioned from the anchor's left + width — a narrow viewport is the risk.)
- [ ] Keyboard: arrow keys, Enter, Escape, and Tab away. Escape must close it.
- [ ] Open the dropdown then click the page behind it — it must close, and the click must land.
- [ ] Two search boxes on one page (/search has the header one plus its own) — opening one must
      not leave the other's list orphaned.
- [ ] JS off: the plain form must still submit `?q=`.

### 4e. The box vocabulary + device mockups

- [ ] The gate itself: add a deliberate `border-[#abc123]`, an ad-hoc `shadow-[...]`, and a
      `rounded-[7px]` and confirm `components/design-system.test.ts` fails on each. **A gate
      nobody has watched fail is not a gate.**
- [ ] Confirm the `@design-artwork` and `@design-allow` escapes still work after that.
- [ ] Look at buying / selling / financing at 390 and 320 — the phones now compute geometry from
      a width prop and only 1440 was photographed closely.

### 4f. Cross-cutting

- [ ] `npx tsc --noEmit` and `npm test` in the FOREGROUND. Baseline **670**.
- [ ] `node scripts/_scratch-r19-sweep.mjs` — 10 pages x 1440/390/320. Round 19 ended at
      overflow 0, alt 0, nameless 0, stuck reveals 0, page errors 0, small taps 0.
- [ ] **Re-run the sweep against PRODUCTION**, not just the dev server. Round 19 twice mistook a
      dev-server artifact for a site defect.

---

## 5. Compare ours against live — his other ask

He asked for a like-for-like on "logins, home values, and those details". Round 19 covered the
home-value comparison (§2). Still to do, and each needs a real account on both sides:

- **Sign in / claim.** Live offers Google, Facebook, or name+email+**mobile-as-password**. Ours
  is Supabase auth. Compare what a first-time visitor actually has to do, and how many steps
  stand between "I typed my address" and "I can see a number".
- **The report itself.** His example is `/myportal/report?market_report_id=…`. Ours is
  `/portal/reports/[id]`. Put them side by side: what live shows that we do not, and whether our
  self-serve CMA (15 comps from our own snapshot) reads as credible next to theirs.
- **Listing detail.** Not compared this round.

---

## 6. Carried, unchanged, still his call or another repo

- **Published-CMA enumeration** and **57 raw `media.mlsgrid.com` URLs** — both need his decision
  and a paired CRM change.
- **The hero.** He rejected all four candidates ("keep looking"). Nothing has shipped;
  `app/page.tsx` still plays the Vimeo clip. Do not re-pitch A/B/C/D.
- **The chat rebuild** belongs to the CRM session. Write the message contract first.
- **The retired coming-soon artwork** — keep or delete.

---

## 7. Traps that cost time in rounds 18–19 — do not pay for them twice

- **A `fullPage` screenshot never scroll-triggers an `IntersectionObserver`.** Every `.reveal`
  below the fold photographs at `opacity: 0`; the home page looked like it had a 710px hole and
  the stat counters read `0 / 0h / 0+ / 0`. Walk the page a viewport at a time first.
- **`display:none` can never reveal.** Excluding it is the difference between a clean sweep and
  a phantom failure.
- **Naive tap-target rules cry wolf.** A skip link is meant to be clipped until focused, a
  honeypot is meant to be 1px, a checkbox's target is its `<label>`, and "Keyboard shortcuts" /
  "Terms" are Google's map chrome.
- **A gate that reads English prose gets switched off.** Strip comments before scanning; check
  escape markers against the RAW line.
- **The dev server lies.** An intermittent `Invalid or unexpected token` and a 500 on /buying
  were both the shared dev server; production was clean on all four pages
  (`scripts/_scratch-r19-prod.mjs`). Check production before clearing a `.next` another session
  owns.
- **`/api/idx/suggest` has a lazy index.** The first call after a cold start returns counties
  only. Warm it before concluding cities or ZIPs are broken.
- **The repo is shared.** Never `git add -A`; commit with an explicit pathspec.
- **Windows `python` hangs on this box** — use node or `wsl -e bash -lc 'python3 …'`.

---

## 8. Launch: unchanged, still gated

The site is `noindex` on purpose. In this order, and only when he says: clear
`NEXT_PUBLIC_SITE_URL` in Vercel (every canonical and all 58 sitemap entries point at the temp
vercel.app host), point the realtylt.com apex here (two A records **at Namecheap** →
`76.76.21.21`), then remove `PRELAUNCH=1`. Do not remove the noindex yourself.
