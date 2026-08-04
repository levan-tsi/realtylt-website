# Handoff — round 21

Written 2026-08-03 at the end of round 20. **Everything below was checked on the real systems
this session unless it says otherwise.** Round 20's summary is the top block of
`POLISH_CHECKPOINT.md`; this is what round 21 should do.

---

## 0. First actions, in order

1. `node scripts/inventory-health.mjs` — freshness. If "modified in last 24h" is 0, the feed is
   frozen and nothing else matters. It was **1,572** at the start of round 20.
2. **§1 below, the account wall.** It is one dashboard toggle and it is currently the single
   biggest thing standing between a visitor and everything the portal does.
3. **Keep the photo backfill going** (§2). It is safe now, and it is slow on purpose.

---

## 1. NOBODY CAN CREATE AN ACCOUNT — his decision, and it blocks launch

**Measured, not assumed.** The Supabase project has `disable_signup = true`:

```
POST /auth/v1/signup   -> 422 {"error_code":"signup_disabled"}
POST /auth/v1/otp      -> 422 {"error_code":"signup_disabled"}   (magic link, new email)
GET  /auth/v1/settings -> external.google = false,  mailer_autoconfirm = false
```

Password sign-up, magic link and Google are the only three doors on the modal, and **all three
are shut**. So every one of these dead-ends today:

- the home-value fork's "See what it's worth" branch (round 19's headline feature),
- saved-search email alerts, which need an account to be worth anything,
- the whole `/portal` — saved homes, saved searches, reports, profile.

**What round 20 did about it:** the site no longer shows Supabase's own sentence. It used to
print *"Signups not allowed for this instance"* in a red alert; it now reads *"New accounts
aren't open yet. Call or text (917) 905-7923 and we'll set one up for you."*
(`lib/auth/error-message.ts`, 17 tests.)

**What it did NOT do:** flip the setting. Enabling public sign-up is a security decision and the
standing rule is never to loosen a control unilaterally. It is his call, in the Supabase
dashboard, Authentication → Sign In / Providers → "Allow new users to sign up".

**Two things to settle with him at the same time**, because they change the answer:

- `mailer_autoconfirm = false`, so even once sign-up is on, a new account needs a confirmation
  email — and SMTP is unproven here. `[[infra-realtylt-email-deliverability]]` measured that
  realtylt.com has no SPF and no DMARC, so a confirmation mail may land in spam and the account
  never completes. **Turn sign-up on and then actually create an account from a real inbox
  before believing it works.**
- Live offers Google and Facebook. Ours has a Google button that returns
  "That sign-in option isn't switched on yet" because the provider is disabled. Either enable it
  or hide the button; an offer that cannot be taken is worse than no offer.

**A round can still test the signed-in half without any of that**, and round 20 did: create a
user with the service-role admin API (`POST /auth/v1/admin/users` with `email_confirm: true`),
drive the flow, then `DELETE /auth/v1/admin/users/<id>` and delete its `portal_reports` rows.
Do not leave the account behind.

---

## 2. THE PHOTO BACKFILL — it was rate-limited, and now it is paced

The round-19 abort criterion (`fetched > downloaded`) fired on the first slice of round 20:
**fetched 7,114, downloaded 3,097**. The run was killed. The criterion could not say *why*, so
`downloadPhoto` now counts outcomes by status and the slice line prints them. A 20-listing probe
answered it immediately:

```
fetched 513, downloaded 493   ->   ok:493 429:20
```

**429. Rate limiting**, on a run a fifth the size of the one that failed — and MLS Grid has
suspended this key for exactly that before (`[[infra-mlsgrid-account-facts]]`).

Worse: that run mirrored **zero** photos despite 493 successful downloads. The queue is
covers-first (photo 0 of every listing, then photo 1 of every listing), so the opening burst is
all covers, and a listing's mirrored count is its **contiguous prefix** — losing photo 0 discards
everything after it.

Fixed: a shared pacer in front of every media request (`--rps`, default 2), a 429 now pushes the
next slot out by up to 30s rather than sleeping one request, and `--max-429` (default 25) ends
the run. Re-verified on the same slice size:

```
fetched 464, downloaded 464, mirrored 464   (no 429 at all)
```

### THE ABORT RULE HAS CHANGED — do not stop on `fetched > downloaded` alone

The first healthy slice after the fix proved the inherited rule is too blunt. It read:

```
slice: kept 316, took 316, mirrored 7194 photos (fetched 7645, downloaded 7194)
  download failures by status: ok:7194 400:451
```

`fetched > downloaded` by 451, which the old rule says abort — but **zero 429s**, and every
single photo that downloaded was mirrored (7,194 of 7,194, against 2,490 of 3,097 before the
fix). The 451 are HTTP **400**: MLS Grid signed media URLs that were already dead or expired when
the feed handed them to us. Nothing is wrong and nothing is at risk.

**So: judge the histogram, not the gap.**

| line | meaning | do |
|---|---|---|
| `429:` anything | MLS Grid is throttling us | **STOP.** The key can be suspended; that froze the inventory for 7 days in round 16. The script now self-aborts at 25. |
| `400:` / `403:` / `404:` | dead or expired media links in the feed | carry on, this is normal |
| `timeout:` / `neterr:` in bulk | network or host trouble | stop and look |

### DO NOT JUST RESUME IT. Two things ended the run, and neither was the pacing

**1. A deadlock with the hourly sync.** `idx_sync_apply` returned 500 with Postgres `40P01`: this
backfill is not the only writer on `idx_listings`, and the hourly `pg_cron` sync writes the same
rows. A deadlock is Postgres picking a victim so the other transaction can finish, and the
answer is to retry the victim — which `rpc()` now does (40P01 / 40001, backoff plus jitter so the
retry does not land on the sync's next write in lockstep). The live feed was never at risk:
Postgres killed OUR transaction and the sync survived.

**2. MLS Grid started throttling at 2 req/s, mid-session.** The same rate ran a 7,645-request
slice with **zero** 429s, and roughly an hour later a **12-listing** slice tripped the 25-strike
abort. The host's tolerance changed underneath us — most likely a longer-window quota — so
**"resume at `--rps 2`" is no longer safe advice.**

**Before running any long slice, probe:**

```bash
node scripts/backfill-photos.mjs --max-pages 1 --max-listings 12    # ~250 photos
```

Read the histogram on the slice line. **Any `429:` at all means stop for the day** — do not lower
`--rps` and try again, do not "pace around it". His key has been suspended six times in four days
for exactly this and a suspension freezes the entire inventory
(`[[infra-mlsgrid-account-facts]]`). If the probe is clean (`ok:` only, or `ok:` plus `400/403/404`),
then it is reasonable to run:

```bash
node scripts/backfill-photos.mjs --max-pages 999 --max-listings 999999
```

Watermark in `scripts/.photo-backfill-watermark.local`. **It is slow on purpose**: ~2 photos a
second, so a 7,000-photo slice takes about an hour. Let it run in the background across a whole
round. **Do not raise `--rps` to make it finish faster.** Coverage when round 20 ended is in the
checkpoint; re-measure with `scripts/inventory-health.mjs`.

### READ THE ZERO-PHOTO NUMBER BY AGE, or it will look like a regression

The headline count goes **UP** while the backfill is working, because roughly 150-220 new
listings arrive every day carrying no mirrored photos yet. Measured 2026-08-04 on 27,681 live
rows:

```
photos_servable = 0    : 1705
  first seen in last 24h : 223    (arrived with no photos — normal, the sync collects them)
  first seen in last 7d  : 1245
  OLDER THAN 7d          : 460    <-- the real backlog, and the only number worth watching
```

So the persistent problem is ~460 listings, not 1,705. `scripts/inventory-health.mjs` prints
this split (it is the committed replacement for the old `_scratch-r16-debt.mjs`, which was
covered by the `scripts/_scratch-*` gitignore rule and therefore existed on one machine only,
despite two handoffs opening with "first action: run it").

### FINISHING THE FORWARD WALK WILL NOT CLEAR THE BACKLOG

Measured after a perfect slice (6,917 fetched / 6,917 downloaded / 6,917 mirrored, no 429s, no
gap at all): the headline fell 1,705 → 1,610, but **the older-than-7d backlog moved 460 → 457.**
All the gain was in the recent cohort. The walk is helping new arrivals and not touching the old
ones, because it goes forward by modification timestamp and has already passed them.

And they are not empty listings. Sampling 40 of them: **40 out of 40 carry photos in the feed**
(10, 11, 3 …). They are listings whose mirroring did not complete — most plausibly the covers
that died in the pre-fix rate-limited slices, where the watermark advanced past them anyway and
stranded them at a contiguous prefix of zero.

**The fix needs no new code, and specifically must NOT be an MLS lookup by id** — `sync-mls` is
watermark-only by design and adding a DATA-API call for specific listings is the thing that gets
this key suspended. Instead **re-walk the feed from the beginning** once the forward pass is
done:

```bash
node scripts/backfill-photos.mjs --fresh --max-pages 999 --max-listings 999999
```

`--fresh` deletes the watermark file and restarts at the epoch. That is cheap rather than
wasteful, because `mirrorSlice` skips a listing's already-mirrored prefix whenever its stored
`photosMirroredTs` still matches the live `modificationTimestamp` — so everything already done
downloads nothing and only the stranded rows are retried. Expect the `skipped N already-mirrored`
figure on each slice line to be large; if it is 0 on a re-walk, the skip logic is not matching
and something is wrong.

*(Reasoned from the code, not measured — testing it means deleting the watermark file, and the
forward pass was still running. Verify the skip count on the first re-walk slice before letting
it run long.)*

One consequence of the 400s worth knowing: a listing whose photo 0 is a dead link keeps a
mirrored count of 0 forever, because the count is a contiguous prefix from the first photo. If
the zero-photo number stops falling while slices keep reporting `400:` in the hundreds, that is
why — and the fix is a feed question (are those listings' media re-published?), not a pacing one.

---

## 3. WHAT ROUND 20 PROVED, so round 21 does not re-prove it

- **Consent.** 18 new tests drive the real route over a real socket with `CRM_LEAD_WEBHOOK`
  pointed at a local capture server. Forged `at`/`ip`/`text`/`version`/`seller`/`source`/`phone`
  are all overwritten; only `granted` is the client's, and only `true`/`on`/boolean read as yes.
  No phone means no consent record at all. 415/413/400/429 on the front door.
  In a browser, **all 11 surfaces** that take a phone send the field, unticked, not required,
  keyboard-reachable, 21:1 focus ring on dark, no overflow at 320.
  `/connect` has no form at all — it is a booking embed with `tel:`/`mailto:` links, so the
  handoff's list of nine surfaces was over-inclusive by one.
- **The dropdown portal.** Hit-tested at 1440/390/320 on both mounts, tracks its anchor on
  scroll and resize to within 1px, arrows/Escape/outside-click all correct, JS off still submits
  `?q=`. **Two** real defects found and fixed:
  - **Tab away left the list open**, floating over the control focus had just moved to.
  - **Picking a suggestion re-opened the list over the results**, and this one is worth reading
    twice because it is a lesson about where to measure. It reproduced ONLY on production
    (closed at 200ms, back with 5 options at 600ms, still there at 4.6s); the dev server said
    clean, because its suggest index happened to return nothing for the picked term. It also had
    TWO triggers, and fixing the obvious one only moved the reappearance from 600ms to 2.6s:
    `pick` writes the chosen label into the input (looks like typing), **and** the URL rewrite
    remounts the component with that label as its `defaultValue` (looks like typing to a fresh
    instance). The rule that covers both: **never open on mount** — an initial value comes from
    the URL, never from a keystroke.
- **The address filter.** `encodeURIComponent` is NOT what protects it — PostgREST decodes
  before it parses, so `%2C` becomes a separator. The character strip is the protection, and it
  holds; 23 tests assert clause STRUCTURE rather than substrings, and were watched failing with
  the comma and dot removed. Active-only proven with a real case: 2 Alyssa Lane renders on
  /search but returns no suggestion because it is Pending. Latency p95 480ms on production.
- **The signed-in CMA**, end to end, which round 19 could not complete: $410,000 for
  150 Hooker Ave from 24 active comps at a median $228/sq ft, comps linking to real listings via
  `/listing/<KEY>` 308s. It works.
- **The design gate.** Watched failing on a planted hex border, ad-hoc shadow, Tailwind
  `shadow-md` and `rounded-[7px]`; both escape hatches still work, and `@design-artwork`
  correctly does NOT waive the shadow rule.

---

## 4. STILL OPEN

- **Places API (New)** for the type-ahead on the home-value box. Round 20 shipped everything
  around it — geocoding, the Street View confirmation, and the normalised address with ZIP going
  to the CRM — on APIs already enabled and already billed. Places adds only the dropdown while
  you type, and it is the only part that bills. **His call.** Check Google's current per-session
  pricing before quoting him; do not assert it from memory.
- ~~Square footage blocks the CMA~~ — **done.** The box is seeded with the median of every active
  home in the visitor's town, labelled "Typical for homes near you", and only ever into an empty
  field. Watch the trap if you touch it: asking the comps route for a median *without* a subject
  size returns the town's CHEAPEST two dozen listings, because that is how it ranks with no size
  to sort by — "typical for Yonkers" came out as 600 sq ft of co-op. The median has to come from
  every active row in the town (`/api/reports/county`).
- **Refresh at the fork drops the step.** It is component state, not a URL param. Deliberate for
  now — putting it in the URL makes a half-finished valuation linkable, which is a design call.
- **Sold comps.** The report says, honestly, "from comparable homes currently **for sale**". Live
  has sold data. That is an MLS licence question, not a coding one
  (`[[reports-data-path-decision]]`, `[[infra-mlsgrid-account-facts]]` — VOW/BBO are self-service
  buttons in his MLS Grid admin).
- **Published-CMA enumeration** and **57 raw `media.mlsgrid.com` URLs** — still his decision plus
  a paired CRM change.
- **The hero.** He rejected all four candidates ("keep looking"). `app/page.tsx` still plays the
  Vimeo clip; the candidates are on branch `hero-lab` at `/lab/hero`. Do not re-pitch A/B/C/D.
- **The chat rebuild** belongs to the CRM session.
- **Listing alerts are DONE on the website side** — checked in a browser this round, so do not
  rebuild them. Signed out, `/saved` offers a lead form whose POST really carries the search
  (`savedSearches[0] = {label, query, criteria:{city:"Poughkeepsie"}}`) with consent attached.
  Signed in, toggling alerts writes `alerts` plus the structured criteria to
  `portal_saved_searches`. The save dialog is honest to anonymous visitors and there is no fake
  toggle. What remains is the CRM sending, plus the account wall for the signed-in path.
- **Small polish, not a defect:** the portal sub-nav scrolls horizontally on a phone (5 tabs,
  626px of content in a 358px strip) and has no visual affordance that it does. Verified
  reachable — scrolling works and Profile navigates — so this is a "would be nicer with a fade",
  not a bug.

---

## 5. TRAPS THAT COST TIME IN ROUND 20

- **Next dev compiles a route on its first request.** The first measurement at each mount timed
  out and the two after it passed — that is a compile, not a defect. Warm every route before
  measuring anything.
- **`document.elementFromPoint` returns null for anything OFF the viewport**, so a hit-test on an
  element that has simply scrolled out of view reports "unreachable". That nearly filed the
  portal sub-nav as a broken mobile nav; it scrolls perfectly well and Profile navigates. Scroll
  the container first, THEN hit-test. And check you grabbed the right container — the first pass
  matched the site header's "Saved" link and measured the wrong `<nav>` entirely.
- **`textContent` is not the accessible name.** The consent label looked like it ran two
  sentences together ("my request.Includes automated"); the real accname separates block
  elements, and Playwright's role-name matching proves it. Nearly filed a defect that was not one.
- **A contrast probe reading `getComputedStyle` gets `oklab(... / 0.6)` and produces nonsense.**
  The footer is `bg-paper`, not dark, so the river ring there is correct — check what the surface
  actually is before computing anything. `scripts/focus.mjs <baseUrl>` takes the base as
  **argv[2]**, not `BASE=`, and it skips header/footer.
- **A listing page has THREE forms that take a phone.** "Schedule a Tour" is an inline panel and
  "Make an Offer" is a dialog; scoping both the same way makes one fail every time.
- **`/homes-for-sale` bare is a 404.** That path shape is the listing DETAIL url
  (`/homes-for-sale/<ST>/<city>/<zip>/<slug>/bid-38-<id>`). The index is `/search`, and it
  renders client-side — allow ~9s before concluding there are no listings.
- **Google's geocoder does not return ZERO_RESULTS for junk.** With the country restricted it
  answers OK with `formatted_address: "United States"`. Anything built on a geocode needs a
  precision test (`lib/geo/address-precision.ts`).
- **`/connect` never reaches `networkidle`, reliably.** Its third-party booking embed holds the
  network open: measured 20.6s on one load and a hard timeout on the very next, while the page
  itself renders correctly both times (h1 "Contact Us Anytime", no overflow at any width). Any
  probe that waits for `networkidle` on `/connect` will flake and look like a page defect. Use
  `domcontentloaded` plus a settle there.
- **`/api/idx/suggest` has a lazy index** — the first request after a cold instance answers
  counties only for ~350ms.
- **The repo is shared.** Never `git add -A`; commit with an explicit pathspec. Another session
  moved the test baseline from 670 to 722 mid-round.
- **`git commit -- <files> -m "msg"` is wrong** — `--` must come after `-m`, or git reads the
  message as a pathspec.

---

## 6. Launch: unchanged, still gated

The site is `noindex` on purpose. In this order, and only when he says: clear
`NEXT_PUBLIC_SITE_URL` in Vercel (every canonical and all 58 sitemap entries point at the temp
vercel.app host), point the realtylt.com apex here (two A records **at Namecheap** →
`76.76.21.21`), then remove `PRELAUNCH=1`. Do not remove the noindex yourself.

**Add to that list:** turn on sign-up (§1), or the portal ships closed.
