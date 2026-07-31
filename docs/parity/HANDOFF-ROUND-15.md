# Handoff to round 15 — written 2026-07-30 at the end of the final pre-deploy check

Read this before `POLISH_CHECKPOINT.md`. The checkpoint says what happened; this says **what is
left, how to fix each thing, and what you can stop re-testing**.

The site is in good shape. Round 14 found and fixed eleven defects, every one by driving the real
site rather than reading code. Nothing below is a launch blocker unless the owner says so — the
launch is gated on three switches he controls (§6).

---

## 1. State of play

| | |
| --- | --- |
| Branch | `main`, pushed, Vercel production deploy READY |
| Gates | `npx tsc --noEmit` clean · `npm test` 526 passing · 0 horizontal overflow at 1440/390/320 across 48 routes · 0 dead links across 179 hrefs · 338 focus stops all with a visible indicator |
| Dev server | ONE per repo, port 3100. `:3000` is wslrelay. Never `next build` while it runs |
| Shared repo | A second session owns the blog surfaces (`lib/blog/*`, `components/blog/*`, `content/blog/*`, `docs/services/*.png`). Never `git add -A`; check `git status` before committing |

**The photo-count fix is live and self-maintaining.** `idx_listings.photos_servable` is refreshed
by pg_cron `idx-photos-servable-refresh` at :27 past every hour. Verified after four runs: all
**29,149** rows computed, **zero** never-computed (it absorbed 105 newly-synced listings on its
own), each run succeeding in 21–28s. Nothing to babysit.

---

## 2. Verified working — do NOT spend round 15 re-testing these

Everything here was driven in a real browser this round, with the numbers recorded.

**Photos.** Card counter, map-popup counter and listing page all print the same number for the
same listing (KEY1026300 claims 29 / serves 4: "1 / 4" everywhere, four real frames walked, wraps
correctly; KEY949886 claims 17 / serves 1: 1 everywhere). Confirmed on **production**, not just
dev. Gallery arrows walk 0→1→2→3. Lightbox focuses inside itself, ArrowRight advances, Escape
closes. `withPhotos=1` filters honestly (11,723 → 11,632).

**Leads.** All eleven surfaces POST with the right `source` and `interestReason` (/selling and
the home footer send "selling", the rest "buying", /home-value correctly preselects "selling").
Tour, offer and sidebar forms all send a qualifier naming the property. Empty submit is blocked
by native validation (0 posts, 3 invalid fields); a bad email is blocked; **the honeypot works —
a filled `rlt_hp` returns 200 and writes nothing** (verified against the live CRM table).

**Search.** County chips, beds, withPhotos, all four sorts, pagination (`?page=2`, `?page=4`),
FOR RENT (`?rental=1`, 1,586 rentals), grid/map toggle (36 chips), hearts (aria-pressed flips,
label changes, undo works), save-search including its success panel, and the zero-result state
("No homes match those filters"). No page errors.

**Listing page.** Sub-nav anchors land their target at exactly 64px under the sticky bar and are
in document order. Mortgage calculator recomputes on every input ($3,520.16 → $2,910.60 at 40%
down → $2,334.08 at 3% → $3,062.28 on a 15-year term → RESET restores). Rentals correctly hide
Payment and Market Insights and drop those sub-nav anchors. Commercial rows with beds/baths/sqft
all 0 drop those stats instead of printing "0".

**States.** JS-off keeps every page's h1, forms and links with 0 invisible reveals (/search
serves its noscript path). Reduced-motion on / mounts 0 animations, 0 iframes, 0 videos. Print on
a listing gives 5,648 chars with 0 fixed elements. 404 returns a real 404. Portal signed-out is
sane on all four routes. Mobile menu flips `aria-label`/`aria-expanded` and closes on Escape.
Home rails render 16 cards; the "Why" carousel has correct aria labels, `aria-current`, and dot
navigation works.

**Copy + design system.** ONE visitor-visible em dash across 23 routes (see §3.6). No arrow-glyph
CTAs. Corner-radius census: every off-scale radius is inside a device/browser **illustration** (a
phone frame needs a phone's radius) — no drift in the site's own chrome.

---

## 3. Open items — what and how

Ordered by my view of value. None is required for launch.

### 3.1 `/api/idx/pins` is an unused public endpoint that is slow and 502s — MEDIUM

**Evidence.** Nothing in the app calls it: `SearchClient` derives map pins client-side from the
loaded listings (`mapPins` memo), and a network capture of a full /search session shows only
`/api/idx/search`. Measured on the route itself:

```
/api/idx/pins                      -> 502 "Pins are temporarily unavailable." (4.6s)
/api/idx/pins?county=dutchess      -> 200, 340,563 bytes, ~7.5s
/api/idx/pins?q=<no matches>       -> 200 in ~160ms (a cold plan makes the first one ~7s)
```

The unbounded path pages the whole filtered set in `PIN_CHUNK` slices with an exact count, so the
default (six counties, ~11.7k listings) exceeds its budget and the route's own catch returns 502.

**Why it matters.** It is public, uncached, and hits Supabase hard on every request. A crawler or
a bot walking it costs real database time for a feature no visitor uses.

**How to fix (pick one).**
- *Cheapest and safest:* require a bbox — return 400 when `parseBounds` yields nothing. One
  guard clause at the top of `app/api/idx/pins/route.ts`. Update `route.test.ts`, which currently
  asserts the unbounded shape in five places.
- *Cleanest:* delete the route and its test. Check `lib/idx/types.ts` and `docs/` references
  first; `PIN_CAP`/`MapPin` are still used by `SearchClient` and must stay.
- *Do NOT* just add caching — that hides the cost rather than removing it.

**Risk:** low either way, but it is a public contract change, so it is worth one line to the owner
before deleting.

### 3.1b /search is slow to show its first card, and it is NOT the pins route — MEDIUM

The owner noticed this. Measured on **production** (dev numbers are meaningless here — a cold
`next dev` compile made the same page look like 18s):

```
/search           TTFB 194ms · HTML parsed 584ms · API sent 830ms · API back 2803ms · FIRST CARD 3224ms
/search?county=orange  TTFB  87ms · HTML parsed 304ms · API sent 431ms · API back  618ms · FIRST CARD  752ms
/ (home)          TTFB  97ms                                          · FIRST CARD  389ms
```

Three separate contributions, in order of size:

1. **/search renders entirely on the client.** `SearchClient` reads `useSearchParams`, so Next
   serves the Suspense fallback for the whole server pass and the HTML contains **zero
   listings** — the browser must parse HTML, load and execute JS, hydrate, fetch
   `/api/idx/search`, then paint. That is the ~750ms floor even when everything is warm. The
   home page paints its first card in 389ms because its rails are server-rendered.
2. **Cold serverless start** adds ~1.5–2s on the first hit after idle or a new deploy (the
   2803ms API response above vs ~300ms warm).
3. **The `mixed` default sort costs roughly double a plain sort** — measured warm, unfiltered:
   `mixed` 306–649ms vs `newest` 139–230ms. It runs an extra exact-count query over the whole
   default six-county set (~11.7k rows) and then pages with a day-seeded OFFSET that can reach
   ~11,000, which Postgres must scan through. Narrowing first (`?county=orange`) makes it cheap.

**How to fix, biggest win first.** Server-render the first page of results and hand it to
`SearchClient` as initial data, letting the client take over for subsequent filtering — this
removes the hydrate-then-fetch round trip entirely and gives crawlers real content. It is the
one architectural change worth making on this page, and it is not small: the `useSearchParams`
dependency is what forces client rendering today. Cheaper partial wins: cache `mixed`'s daily
total instead of recounting per request, and/or seed the rotation from a cached count.

**Do not** blame `/api/idx/pins` (§3.1) — a network capture of a full `/search` session shows
only `/api/idx/search`. The two are unrelated.

### 3.2 Zero-photo listings still publish one image URL to Google — LOW

`getProxiedPhotoPaths` deliberately keeps one speculative path when `photos_servable` is 0, so a
brand-new listing is not blank while the mirror catches up. That path also ends up in the
`RealEstateListing` JSON-LD `image[]`, where it resolves to the branded coming-soon still.

**How to fix:** in the JSON-LD builder only (not the gallery), drop `image` when
`photos_servable === 0`. Keep the page behaviour as-is. Find it by searching for
`RealEstateListing` in `components/listing/`.

**Risk:** very low. Structured data honesty, no visual change.

### 3.3 No `<meta name="robots">` on 19 of 21 public pages — LOW, but decide before launch

Only `/portal` and listing pages emit a robots meta. Crawling is currently blocked by
`robots.txt` (`User-Agent: * / Disallow: /`, driven by `PRELAUNCH=1`), which is a legitimate
mechanism — but `Disallow` prevents *crawling*, not *indexing* of a URL discovered elsewhere.

**How to fix (only if the owner wants belt and braces while pre-launch):** add
`robots: { index: false, follow: false }` to the root `metadata` in `app/layout.tsx` behind the
same `PRELAUNCH` flag that drives robots.txt, so both come off together. **Do not remove the
noindex mechanism yourself** — that is the owner's switch (§6).

### 3.4 Canonicals and all 59 sitemap entries point at `realtylt-website.vercel.app` — OWNER

This is item #1 on the owner's launch checklist, not a code defect: `lib/site.ts` already falls
back to `https://realtylt.com` when `NEXT_PUBLIC_SITE_URL` is unset. It must be cleared in Vercel
**before** indexing is enabled. Re-verify one canonical and one `<loc>` after he does it.

### 3.5 The listing header at 320 only — DEFERRED ON PURPOSE

At 320 the price block wraps under the address and its "Est. $X/mo" right-aligns inside a narrow
box, which reads slightly odd. Left alone deliberately: 390 is correct and handsome, and fixing
320 means re-opening the alignment the owner set in round 13. If he ever asks, the fix is
`text-left sm:text-right` on the price `<div>` in `components/listing/ListingDetail.tsx` — but
check 390 after, because it is below the `sm` breakpoint.

### 3.6 Blog surfaces — REPORT ONLY, the second session owns these

- One visitor-visible em dash, in a post excerpt rendered on `/blog` ("Inventory is tight, but it
  is not tight everywhere…"). Their content, their call.
- The flagship post's real slug is `/blog/ai-chat-assistant-real-estate-website`. An older probe
  list carried `-for-real-estate`, which 404s — that is a stale list, **not** a site defect. Do
  not "fix" it.

### 3.7 `/search`'s sort `<select>` is 12px on a phone — DELIBERATE

The one control below the 16px floor, a documented `rlt-compact-control` exception (the floor
would turn the scrolling filter strip into a wall). Selects open a native picker on iOS rather
than zooming, so it stands unless the owner wants it changed.

### 3.8 Two security items — OWNER DECISION + a paired CRM change

Published-CMA enumeration and raw MLS MediaURLs, both in `docs/parity/PRELAUNCH-AUDIT.md` §2.
Untouched by round 14, as instructed. Do not patch either from the website side alone.

---

## 4. The standing regression gate

Four untracked probes now cover, between them, overflow / status / console / launcher obstruction
/ focus indicators / dead links across every route at three widths. Run all four at the start of
round 15 — they take a few minutes and will tell you immediately if anything regressed.

```bash
cd /c/Users/Levan/realtylt-website
export NODE_OPTIONS='--use-system-ca' MSYS_NO_PATHCONV=1

node scripts/_scratch-r14-sweep.mjs       # 48 routes x 1440/390/320: status, overflow (+the
                                          # element that overflows), console, h1 count, alt,
                                          # nameless controls, sub-16px controls, meta lengths
node scripts/_scratch-r14-overlap.mjs     # does the fixed chat launcher cover any control at 390
node scripts/_scratch-r14-focus.mjs       # tab 26 stops on 13 pages, assert a visible indicator
node scripts/_scratch-r14-links.mjs       # crawl every rendered href, fetch each, report non-200
```

Expected clean output: `overflow 0 | bad-status 0 | console 0` (except the deliberate
`/search` 12px select), `0 covered controls`, `TOTAL ... 0`, `non-200 internal links: 0`.

**RUN THEM ONE AT A TIME.** Not just for speed — concurrency MANUFACTURES DEFECTS that look
exactly like regressions. Running the sweep alongside two other Playwright probes against the
single `next dev` server produced, in one pass: three `500`s, fourteen
`SyntaxError: Invalid or unexpected token` page errors, two `Unexpected end of JSON input`, five
pages reporting `h1 x0`, and `[idx-db] search failed` / `[blog] Supabase responded 500` fallback
warnings. Every one was the dev server serving truncated chunks under load. A sequential
re-check of all thirteen flagged route/width pairs — two loads each, 26 loads — came back
**200, one h1, zero overflow, zero errors, on every single one**
(`scripts/_scratch-r14-recheck.mjs` does exactly this, and is the right first move whenever a
sweep looks alarming). Truncated-payload signatures — `SyntaxError: Invalid or unexpected
token`, `Unexpected end of JSON input`, an `h1` count of 0 on a page that has one — are the
tell. Re-check before you debug.

Other probes worth knowing about, same directory: `-photocount` (the card/popup/page agreement
test), `-leads2` and `-leadpayload` (lead payloads, **safely intercepted**), `-states2` (empty
states, validation, honeypot, menu, save-search, rentals), `-edge` (rental / 0-bed / 0-photo
listings), `-seo` (canonical, robots, JSON-LD, sitemap), `-copy` (rendered em dash / arrow scan),
`-cls` (layout-shift attribution), `-320` and `-mincontent` (who overflows and why).

---

## 5. Traps — each of these cost real time

**Testing lead forms will hit the live CRM.** `CRM_LEAD_WEBHOOK` is SET in `.env.local`. I sent
ten QA leads into the owner's production CRM before checking. Either intercept in the browser —
`page.route("**/api/lead", r => r.fulfill({status:200, body:'{"ok":true}'}))` — or set
`LEAD_TEST_MODE=1`. An empty `.leads-dev.jsonl` after a submit means it went to production.

**Probes lie in both directions.** In one round: a "0 overflow at 320" pass that was a **build
error page** (a JSX comment between `) : (` and its element); `innerText` reading `""` for links
inside a collapsed dropdown, flagged as "nameless controls"; a locator found by accessible name
silently resolving to a different element after the name changed on click (the heart looked
broken and was not); a rect-overlap check that ignored `opacity: 0`; a 120-char text slice that
cut off the number being measured (the mortgage calculator looked frozen and was not); and four
404s that were stale entries in my own route list. **Always look at the screenshot, and always
ask what would make the probe wrong before touching source.**

**Nine parallel Playwright contexts against one `next dev` server times everything out.** Run
route sweeps sequentially. Transient single 500s / `SyntaxError`s right after an edit are the dev
server rebuilding — re-run before believing them (both cleared on 4–6 repeats this round).

**Other standing ones.** `photosMirrored` is wiped by the sync's full-JSONB upsert — read
`photos_servable`. Search cards carry ONE cover URL, so `l.photos.length` is always 1 there. The
unlayered global `:focus-visible` ring beats every utility (`globals.css` ~line 139); composed
controls need the `.search-instrument :has()` rule. On a listing page "Request a Tour" is a TAB —
the CTA is "In Person Tour". Dev runs the GOOGLE map engine and markers are
`button.rlt-price-chip` (an OverlayView), not `gmp-advanced-marker`. `rtk` mangles grep
alternations (use the Grep tool) and strips git-diff removals. In git-bash use
`MSYS_NO_PATHCONV=1` when passing a leading-slash path as an argument. MLS remarks are the
agent's own words — never rewrite them to satisfy a copy rule.

---

## 6. Launch is owner-gated — do not trip it

The site is `noindex` **on purpose**. His order, unchanged:

1. Clear `NEXT_PUBLIC_SITE_URL` in Vercel (fixes every canonical and all 59 sitemap entries).
2. Point the `realtylt.com` apex at this deployment.
3. Remove `PRELAUNCH=1`.

Never remove the noindex from a session. After any push, confirm the Vercel deployment builds
READY (project `prj_0envsZqHojmxmbjnVCqqeXhUFQIl`, team `team_LxVTdG0G7zPU5WSoNnZOpf8p`).

Still waiting on him, unchanged: the unlicensed Vimeo hero clip (recommendation stands — drop it,
everyone gets the licensed still), the REALTOR® block-R artwork (must come from NAR's brand
centre), and the two security items in §3.8.
