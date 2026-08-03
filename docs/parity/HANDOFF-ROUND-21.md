# Handoff — round 21

Written 2026-08-03 at the end of round 20. **Everything below was checked on the real systems
this session unless it says otherwise.** Round 20's summary is the top block of
`POLISH_CHECKPOINT.md`; this is what round 21 should do.

---

## 0. First actions, in order

1. `node scripts/_scratch-r16-debt.mjs` — freshness. If "modified in last 24h" is 0, the feed is
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

**To continue** — it is resumable and it is worth continuing:

```bash
node scripts/backfill-photos.mjs --max-pages 999 --max-listings 999999
```

Watermark in `scripts/.photo-backfill-watermark.local`. **It is slow on purpose**: ~2 photos a
second, so a 7,000-photo slice takes about an hour. Let it run in the background across a whole
round. **Do not raise `--rps` to make it finish faster.** Coverage when round 20 ended is in the
checkpoint; re-measure with `scripts/_scratch-r16-debt.mjs`.

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
- **Square footage blocks the CMA**, and the home-value flow does not collect it. A visitor who
  came from "See what it's worth" lands on the generator and is stopped by *"Enter your home's
  approximate square footage."* It is a legitimate requirement (the estimate is $/sq ft), but
  either the address bar should ask for it, or the generator should estimate from the comps and
  let them correct it. Worth a design decision.
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

---

## 5. TRAPS THAT COST TIME IN ROUND 20

- **Next dev compiles a route on its first request.** The first measurement at each mount timed
  out and the two after it passed — that is a compile, not a defect. Warm every route before
  measuring anything.
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
