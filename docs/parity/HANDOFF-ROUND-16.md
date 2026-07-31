# Handoff to round 16 — written 2026-07-31 at the end of the launch round

Round 15 did the four things it was asked to, in the order it was asked to do them: server-rendered
`/search`, re-tested the site for security and bugs and design, closed the small open items, and
then went to the launch switches **last**.

**Where the launch actually stands: switch 1 is DONE and verified. Switch 2 is done on the Vercel
side and now needs two DNS records that only the owner can set. Switch 3 is deliberately NOT done.**
Details in §5 — that is the section to read first if you are picking this up.

---

## 1. State of play

| | |
| --- | --- |
| Branch | `main`, pushed, Vercel production READY (`prj_0envsZqHojmxmbjnVCqqeXhUFQIl`) |
| Gates | `npx tsc --noEmit` clean · `npm test` **538 passing** (was 526) · 0 horizontal overflow at 1440/390/320 · 0 dead links across 216 hrefs · 338 focus stops all with a visible indicator · 0 console errors across 48 routes × 3 widths |
| Dev server | ONE per repo, port 3100. `:3000` is wslrelay. Never `next build` while it runs |
| Shared repo | A second session owns the blog surfaces (`lib/blog/*`, `components/blog/*`, `content/blog/*`, `docs/services/*.png`). Never `git add -A` |
| Vercel CLI | **Logged in on this PC** as `levan-3774` (an older note said the token was expired — it is not). `vercel env ls production`, `vercel domains inspect`, `vercel redeploy <url>` all work |

---

## 2. `/search` renders its results on the server now

The headline job. It was a static shell containing **zero listings**; the browser had to parse HTML,
boot JS, hydrate, fetch `/api/idx/search` and only then paint.

**What it does now.** `app/search/page.tsx` reads `searchParams` (which is what makes the route
dynamic, and therefore what lets `useSearchParams` resolve during the server pass), runs the same
query the client would have run, and hands the result to `SearchClient` as its initial state. The
client skips exactly one fetch — the redundant one — and owns everything after it.

Both sides go through **one tested function**, `lib/idx/query#parseSearchRequest`, so the HTML and
the client's own fetch cannot ask the feed different questions (sort=mixed, page ≥ 1, 36 a page,
`quick=new` → a 7-day window). If they drifted, the visitor would see one set of homes in the HTML
and a different set a beat later.

**Measured on production** (`_scratch-r15-firstcard.mjs`, 4 reps each):

```
                       before (round 14)        after
/search                3224ms cold             571 / 622 / 646 / 1091ms warm   (cold 4300ms)
/search?county=orange   752ms warm             532 / 586 / 651 / 767ms warm
/ (home, reference)     389ms                  183 / 219 / 266 / 300ms
```

Read that honestly:

- **Warm is better** — roughly 650ms to first card against a ~750ms floor before, and the round trip
  it used to need is gone.
- **Cold is slightly worse** — 4.3s against 3.2s, and the wait is now a blank page rather than a
  rendered skeleton, because the serverless cold start (~2.5–3.5s here) blocks the HTML instead of
  blocking an API call behind a shell. Cold hits dominate today only because the site has no
  traffic; after launch they are the exception. If it ever matters, the lever is keeping the
  function warm (a pg_cron ping, the same mechanism that drives the sync) — **not** more caching:
  see §6.
- **The other wins are not timing at all**: 36 listings are in the raw HTML at every variant tried
  (default, `?county=`, `?page=2`, `?rental=1`, `?quick=new`, borough deep links), so `/search` has
  real content for a crawler for the first time; JavaScript-off gets homes instead of a dead end;
  and CLS is structurally fixed at **0.0100** rather than fixed by reserving 88vh.

**Two consequences of the route being dynamic, both handled.**

1. The URL sync uses `window.history.replaceState`, not `router.replace` — otherwise every chip and
   dropdown would re-run the server's DB query while the client was already fetching the same page.
   Measured after: **1 API call and 0 RSC requests per filter change**. Back still lands on the
   search you left with its filters and its results (708 Homes @ `?county=orange`, sampled every
   100ms for 3s — no flash of the unfiltered set).
2. `mixed` no longer counts the whole filtered set per request. It needs that number only to pick a
   day-seeded start offset and it moves on the hourly sync, so an instance remembers it for 10
   minutes. If a stale count ever pushes the rotation past the tail, `search()` drops the rotation
   rather than showing "no homes match".

---

## 3. What the re-test found

### 3.1 Security — measured, not assumed

**What the anon key can actually read** (`_scratch-r15-anon-reach.mjs` asks PostgREST directly,
table by table, and prints counts only). The anon key reaches the browser via `/api/auth/config`,
so this is the real public surface:

- **Readable, correctly:** `idx_listings` (28,031 active), `idx_sync_state` (1 row of sync
  metadata), `blog_posts` (published only).
- **Readable, and this is the owner-gated item:** `cma_reports` (1 published), `cma_report_comps`
  (4), `mls_listings` (4 — only those inside a published CMA). Untouched, as instructed.
- **Not readable — 0 rows or a 401:** `leads`, `contacts`, `contact_channels`, `portal_clients`,
  `portal_favorites`, `portal_saved_searches`, `portal_activity`, `users`, `organizations`,
  `twilio_accounts`, `email_accounts`, `email_messages`, `phone_calls`, `phone_messages`,
  `chat_logs`, `n8n_chat_histories`, `idx_sync_config`, `api_keys`, `notifications`,
  `market_reports`. The `market_reports` enumeration that a past round fixed is still fixed.

**Every API route, hit the way a stranger would** (`_scratch-r15-api-auth.mjs`, safe by
construction — the cron routes are called with no auth header, the lead route with a wrong
content-type):

```
/api/cron/idx-sync   401   /api/cron/sync-mls  401   /api/cron/mls-probe  401
/api/revalidate      503 "Revalidation is not configured."   (fail-closed — see below)
/api/lead            415   (wrong content-type rejected before anything is written)
/api/idx/pins        400   (a viewport is required now — §3.2)
POST /api/idx/search 405
```

All three cron routes fail closed when `CRON_SECRET` is unset, which is the right shape.

**Headers, on production:** CSP, HSTS (`max-age=63072000; includeSubDomains; preload`),
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` — all six
present.

**Hostile input into the newly server-rendered `/search`** (13 crafted queries: SQL-ish strings in
`q` and `county`, a script tag, 500-char input, `page=999999999`, `page=-1`, `pageSize=100000`, a
PostgREST order-injection attempt in `sort`): every one returned 200 with a sane page, **no
reflected script, no leaked error text, no 500**, 215–480ms. `parseSearchRequest` whitelists the
county and the sort and clamps the numbers; a bad county falls back to the six-county default.

**Supabase advisors, triaged rather than pasted:** the `rls_enabled_no_policy` INFO entries
(`leads`, `chat_logs`, `idx_sync_config`, `n8n_chat_histories`) mean RLS is on with no policy —
that is deny-all, which is the safe state, and the table-by-table probe above confirms it. The
`SECURITY DEFINER` warnings are almost all CRM/chatbot objects; the two that are ours
(`idx_sync_apply`, `idx_sync_schedule`) are gated by a sha256-compared secret and have a pinned
`search_path`. `idx_refresh_photos_servable` is flagged for a mutable `search_path` but is
SECURITY **INVOKER** and executable only by `postgres`/`service_role`, so there is nothing to
escalate; left alone rather than running production DDL for a non-issue. **One real item for the
owner: Supabase Auth "leaked password protection" is disabled.** Enabling it is a dashboard toggle
and a genuine improvement, but it is shared with the CRM's own logins, so it is his call.

### 3.2 `/api/idx/pins` now requires a viewport

Nothing in the app calls it (SearchClient derives its pins from the listings it already has), it is
public and uncached, and its unbounded path paged the whole filtered set with an exact count — the
default query returned the route's own 502 after 4.6s and a single county cost ~7.5s and 340KB. It
answers **400** without a bbox now. Kept rather than deleted because it is a public contract and a
400 is reversible in one line. Its test asserted the unbounded shape in five places and now asserts
the new one, including that a partial or degenerate box is a 400 rather than an invitation to scan.

### 3.3 The launch-day 404s nobody had looked for

I crawled the LIVE realtylt.com's own footer and HTML sitemap. Of the 20 distinct paths it
publishes, **eight had no route here** — they would have started returning 404 the moment the apex
moved. All are redirected now (308, so the ranking signal carries), with a test that also walks
each destination and fails if its `page.tsx` disappears:

```
/privacy_policy -> /privacy-policy      /tos -> /dmca-terms
/myportal, /myportal/* -> /portal/*     /sitemap, /sitemap/* -> /top-areas
```

`/sitemap` is not four URLs, it is a tree: the old vendor publishes
`/sitemap/NY/<County>-County/City/<City>/Listings/Page/N` plus School-District, Neighborhood and
Postal-Code branches across 22 counties, most of which we do not serve. One catch-all covers it.
`/sitemap.xml` is a different path and still generates normally (asserted).

**Also learned from that crawl, and it matters for switch 2:** the live site's canonical host is
**www**.realtylt.com (the apex 301s to it). Our canonicals are the apex. That is fine — Vercel will
serve both and the apex is the one in the sitemap — but it is a host change Google will need to
digest, so expect a settling period rather than a straight swap.

### 3.4 SEO honesty, three small ones

- **Faceted `/search` is `noindex, follow`.** Every combination of county, beds, price, sort and
  page is its own URL over the same inventory. They stay crawlable on purpose — listing URLs are
  not in the sitemap because the live feed rotates, so those pages are how a crawler walks to the
  homes. Verified: bare `/search` has no robots meta; `?county=orange`, `?page=2` and
  `?sort=newest&bedsMin=3` all carry `noindex, follow`.
- **`/saved` declares noindex.** Someone else's saved list is an empty page by definition.
- **A listing with no servable photo no longer publishes an `image` to Google.** The gallery keeps
  one speculative path so a new listing gets the branded coming-soon still rather than a blank
  frame; publishing that path in the JSON-LD claimed a photograph that is actually our logo.
  Verified on two real listings: KEY1019242 (0 servable) has no `image[]`, KEY1030284 (2 servable)
  has both.

**The audit's "no robots meta on 19 of 21 pages" was a non-issue** and is now closed as such:
every route already carries `X-Robots-Tag: noindex, nofollow` while `PRELAUNCH=1` — all 21 checked
on production, including `/sitemap.xml`, `/robots.txt` and `/og.png`, which a meta tag cannot cover
at all. Adding the meta would have been a second switch to forget to turn off.

### 3.4b The two the owner found himself, after the round was "finished"

He wrote: *"when you bring mouse to select page nothing happens, people might think its frozen…
takes to 2end page but thats it."* Three separate causes, all real, all fixed.

1. **No button on the site had a hand cursor.** Tailwind v4's Preflight dropped the
   `cursor: pointer` that v3 put on buttons. Measured: **97 of 134** controls on `/search` and
   **34 of 35** on the home page were showing the ordinary arrow — SEARCH, SAVE SEARCH, the county
   chips, the pager, "Save this home", every form's submit. Only elements that happened to carry a
   `cursor-pointer` class behaved. One `@layer base` rule in `globals.css` restores it, excluding
   `:disabled` so a greyed-out chevron does not invite a click. After: 133 of 134, the exception
   being that disabled chevron. **If you upgrade a major Tailwind version, re-run
   `_scratch-r15-cursor.mjs`** — nothing else would have caught this.
2. **The pager's hover was `bg-white` on a `bg-mist` panel**, i.e. almost invisible, and the click
   had nothing to say for itself: the black pill keyed off `result.page`, so it only moved when the
   new results landed — measured at **972ms** on the dev server, with nothing on screen in between.
   It keys off the clicked page now: **141ms**, which is a React re-render rather than a network
   wait. Hover is a light wash of the same black, plus a pressed state.
3. **And underneath that was a genuine data bug: `mixed` broke paging.** It added a day-seeded ROW
   offset to every page (`offset = rotate + (p-1)*size`), and `rotate` can be nearly the whole set,
   so page 2 ran off the end. Measured on production, Orange county with 3+ beds — 1,720 listings,
   48 pages:

   ```
   page 1 -> 36 listings, total 1720, totalPages 48
   page 2 ->  4 listings, total 1720, totalPages 48
   page 3 -> 36 listings, total 1053, totalPages 30   <- a different total mid-walk
   ```

   That last line is PostgREST reporting the count for an offset past the end. The rotation now
   moves **whole pages around a ring** — page p is ring page `(r + p - 1) mod pages` — so every
   page is full, every listing appears once, and the offset can never exceed the set. Verified
   against the real feed, filtered and unfiltered: five consecutive full pages with zero repeats,
   one stable total, and the true last page (327 of 327, 48 of 48) full. Three tests cover it.
   **This predates this round** (the rotation shipped 2026-07-29) and round 14's pagination check
   passed only because that day's rotation happened to be small. A pass on one day's data is not a
   pass — `_scratch-r15-pagewalk.mjs` walks it properly.

### 3.5 Design

The one real defect was `/search`'s filter bar, and it was real at **every** width — measured by
reading the wrapped rows back out of the DOM rather than by eye. At 1440: a full row, then SAVE
SEARCH alone underneath. At 1280/1024: the two buttons stranded mid-row between dropdowns. At 390:
four ragged rows each starting at a different x. Now: the six dropdowns are a two-column grid on a
phone (`sm:contents` dissolves the wrapper above 640px, so the desktop row is unchanged), the three
actions travel as one right-aligned group, and SAVE SEARCH is the site's existing outline secondary
instead of a second identical black pill competing with SEARCH. Both buttons carry the same 2px
border so the boxes match to the pixel. Before/after crops in `docs/design-r15/`.

**Two things that looked like defects and were not** — both worth knowing, because both cost time:

- The `/top-areas` hero paragraph looks washed out in a downscaled 390 screenshot. At native
  resolution (`_scratch-r15-crop.mjs`) it is crisp white on a well-dimmed photo. **Judge type on a
  1:1 crop, never on a scaled page shot.**
- `/connect`'s appointment cards mix a colour video emoji with monochrome line icons. That is
  inside Google's own appointment-scheduling **iframe** (owner-directed embed), not our markup.
- And the black circle with an "N" in the bottom-left of every dev screenshot is the Next.js dev
  indicator. It is not on production.

---

## 3.9 The full click-everything pass, and what it found

The owner asked for one more complete test — page by page, every box, every CTA, and whether
property filtering really works. Four defects came out of it, all now fixed and pushed.

**1. The MORE panel was serving stale snapshot data (§3.1 of the fix, and the big one).** See the
commit and `supabase/migrations/idx_more_facts_columns.sql`. Year, lot, garage and tax were the
only filters still reading out of the fat `listing` jsonb; under PostgREST's exact count they blew
the anon statement timeout, `search()` caught it and quietly fell back to the committed snapshot.
"Built 2000+" answered **zero** against a feed holding 4,713 such homes. They are generated
columns now: 50–483ms with the exact count, where every one of them used to time out.

**2. `mixed` broke pagination** — page 2 of a 1,720-home filtered set returned four. Rotating by
whole pages around a ring fixed it (§3.4b).

**3. No button on the site had a hand cursor** (Tailwind v4's Preflight), and the pager was white
on white with no box (§3.4b).

**4. The Top Areas caret could only ever CLOSE the flyout, and on a touchscreen it did nothing.**
One boolean, set true by the wrapper's `onMouseEnter` and toggled by the caret's `onClick`, so the
pointer arriving opened it and the click closed it. On touch the same thing happened through
focus. Hover/focus are transient now and the click owns a separate PIN. **The rule that fixes this
class of bug: a toggle handler must never ask "is it open right now" when opening it is exactly
what the pointer or the focus just did.**

**How the filters are checked now.** `scripts/_scratch-r15-filters.mjs` does not ask whether a
filter fires — it asks whether every row that comes back obeys it. 46 checks: six counties, five
boroughs, five bed and four bath minimums, price floors/ceilings/bands, sqft both directions, four
property types, all seven MORE fields, rental mode both ways, the 7-day window, all four sorts
proven ordered, three combinations, and an impossible price band that correctly finds nothing.
**All 46 pass on production.** `-pagewalk` proves pages are full, non-overlapping and stably
counted; `-mobile` drives the phone journeys end to end (menu → nav, hero search → results →
filter chip → listing → lead form, with the lead route intercepted).

**A warning about the click-everything sweep itself** (`-ctas.mjs`): its change detector compares
URL, aria-expanded, dialog count and DOM/text length, and that is too coarse — it reported the
heart, the card photo arrows, the chat launcher and every empty form submit as "nothing changed"
when all four are correct. Treat its output as a list of things to look at, never as findings.
Every one of them was re-checked against the state the control actually owns (`-ctas2.mjs`).

## 3.10 Design — what was done, and what I would do next

**Done: the site draws two lines instead of seventeen.** A census of the site's own chrome found
59 distinct hard-coded colours, seventeen of them light greys doing one job (#dddddd, #e6e6e6,
#eeeeee, #e5e5e5, #d7dbe0, and in the illustrations pairs a single unit apart). Two tokens now:
`--color-line` (#dddddd) and `--color-line-strong` (#cccccc), used by 69 borders across the
header, footer, cards, forms, search, services and every page shell. Rendered census after: 458
and 312, the two dominant borders on the site. Nobody notices one grey; everybody feels all of
them.

**Note for anyone adding tokens:** `border-[--color-line]` is Tailwind v3 syntax and in v4 it
silently does nothing — measured, the border computed to black at 0px. Tokens declared in `@theme`
under `--color-*` generate real utilities, so write `border-line`.

**Not done, in the order I would do them.** These are proposals, not work:

1. **The hero is the site's thesis and it is currently a still.** The `hero-zoom` keyframe already
   exists in `globals.css`. A very slow drift on the photograph, plus the eyebrow, headline and
   search instrument arriving as a short sequence rather than together, would give the home page
   one orchestrated moment — the restrained equivalent of what /ai does with the galaxy. Cheap,
   reduced-motion safe, and it is the first thing every visitor sees.
2. **The listing card's photo arrival.** The cover currently pops in over the pulse placeholder.
   A soft cross-fade reads as craft on the object people touch most.
3. **The save-heart has no moment.** It flips instantly. A 200ms fill with a small scale is the
   kind of detail people remember.
4. **/search's count line is the page's headline and is set as body text.** "11,741 listings
   across the Hudson Valley" deserves the display face.
5. **Photography grade.** Hero images are monochrome, county cards are full colour. Deliberate, but
   worth one deliberate decision rather than two conventions.

## 4. The standing regression gate (all four re-run this round, clean)

```bash
cd /c/Users/Levan/realtylt-website
export NODE_OPTIONS='--use-system-ca' MSYS_NO_PATHCONV=1
node scripts/_scratch-r14-sweep.mjs      # 48 routes × 1440/390/320
node scripts/_scratch-r15-sweepsum.mjs   # summarise the last sweep.json without re-running it
node scripts/_scratch-r14-overlap.mjs    # chat launcher over controls at 390
node scripts/_scratch-r14-focus.mjs      # 338 focus stops, visible indicator
node scripts/_scratch-r14-links.mjs      # every rendered href
```

Results this round: overflow **0**, console errors **0**, `h1 != 1` **0**, images without alt
**0**, nameless controls **0**, covered controls **0**, focus stops without an indicator **0**,
non-200 internal links **0** of 216.

**RUN THEM ONE AT A TIME** — concurrency manufactures defects that look exactly like regressions
(the round-14 handoff has the proof).

**The sweep's route list has four stale entries** that report 404 and are NOT site defects, so stop
re-investigating them: `/top-areas/sullivan` and `/top-areas/columbia` (counties we do not serve),
`/blog/ai-chat-assistant-for-real-estate` (the real slug is
`/blog/ai-chat-assistant-real-estate-website`), and `/homes-for-sale/dutchess-county-ny` (a URL
shape that exists on neither site — it is not in the live inventory either; I checked).

New probes this round, same directory: `-ssr` (are listings in the HTML), `-searchdrive` (filters,
paging, back, API-call counts), `-nojs` (JS on/off × 1440/390/320), `-firstcard` (the timing table),
`-anon-reach`, `-api-auth`, `-hardening` (headers + hostile input), `-legacy-urls2` (what the live
site publishes), `-redirects`, `-noindex`, `-switch1`, `-barrows` (how the filter bar wraps),
`-crop`, `-shots`, `-sweepsum`.

---

## 5. THE LAUNCH SWITCHES — where they actually stand

### Switch 1 — clear `NEXT_PUBLIC_SITE_URL` — **DONE, VERIFIED**

Removed with `vercel env rm NEXT_PUBLIC_SITE_URL production`, then `vercel redeploy` so the build
dropped the inlined value. Verified on production: **7 of 7 canonicals** say `https://realtylt.com`,
**all 59 sitemap `<loc>` entries** say `realtylt.com`, and `/robots.txt` still says `Disallow: /`
(PRELAUNCH intact). `lib/site.ts` falls back to the apex, so there is nothing to add back — putting
the variable back is the way to undo it.

### Switch 2 — point the apex here — **HALF DONE. The owner has to do the other half.**

Done from Vercel: `realtylt.com` and `www.realtylt.com` are attached to the `realtylt-website`
project (`vercel domains add`). `app.realtylt.com` is untouched and still belongs to
`realtylt-crm-web`. Nothing is live yet, because DNS still points at the old host.

**The DNS is at Namecheap**, not Route 53 — the zone's nameservers are
`dns1.registrar-servers.com` / `dns2.registrar-servers.com`. The old site resolving to AWS is the
old *hosting*, not the DNS provider. I have no Namecheap credentials, so this is the hand-back.

**The exact records Vercel is asking for** (its own words, from `vercel domains inspect`):

```
A   realtylt.com       76.76.21.21
A   www.realtylt.com   76.76.21.21
```

(A `CNAME www.realtylt.com -> cname.vercel-dns.com` works equally well and is friendlier to future
IP changes. The alternative Vercel offers — moving the whole zone to `ns1/ns2.vercel-dns.com` —
would also move `app.realtylt.com` and anything else in the zone, so **do not** take that option
without checking what else lives there.)

**Verify after he sets them:** `nslookup realtylt.com` resolves to Vercel, `https://realtylt.com`
serves this site with a valid certificate, `https://www.realtylt.com` reaches it too, and
`vercel domains inspect realtylt.com` no longer warns.

**One thing to tell him while he is in that zone:** `app.realtylt.com` currently resolves to
`34.210.134.29` (AWS) and does not answer HTTPS, even though Vercel has it assigned to the CRM
project. That is pre-existing — I changed nothing about it — but if the CRM is meant to live there
it needs a record too. CRM-side call, not this repo's.

### Switch 3 — remove `PRELAUNCH=1` — **NOT DONE, deliberately**

Two reasons, and both were the plan going in: it is gated on switch 2 (an un-pointed domain plus a
removed noindex is the worst of both worlds), and the owner should look at the site on the real
domain before it becomes indexable.

When it is time: `vercel env rm PRELAUNCH production`, redeploy, then verify `/robots.txt` no
longer says `Disallow: /` and no page carries a noindex (`_scratch-r15-noindex.mjs` checks all 21
routes, header and meta). Then submit the sitemap in Search Console.

**Sanity gate before it:** the four probes clean, `tsc` clean, `npm test` green, switch 1 verified,
switch 2 resolving.

---

## 6. Open items

1. **The two security items in `PRELAUNCH-AUDIT.md` §2** (published-CMA enumeration, raw MLS
   MediaURLs) — owner decision plus a paired CRM change. Untouched.
2. **`BLOG_REVALIDATE_SECRET` is not set in production**, so `POST /api/revalidate` answers 503
   "Revalidation is not configured." Fail-closed, so it is not a hole — but it means the CRM's
   "publish updates the site immediately" hook is inert and a published post waits out the ISR
   window instead. Fixing it needs the same secret set on both sides, which is his call plus a CRM
   change.
3. **Supabase Auth leaked-password protection is off** (§3.1). A toggle, shared with the CRM.
4. **The ambient Vimeo hero clip** — vendor's, no licence record, third-party iframe on the LCP
   path. Recommendation unchanged: drop it, everyone gets the licensed still.
5. **REALTOR® block-R artwork** must come from NAR's brand centre if he wants the marks added.
6. **`/search`'s sort `<select>` is 12px on a phone** — the one documented exception to the 16px
   floor. Selects open a native picker on iOS rather than zooming, so it stands unless he asks.
7. **The listing header at 320 only** — the price block wraps under the address. Deferred on
   purpose since round 14; 390 is correct and fixing 320 re-opens the alignment he set in round 13.

## 7. Traps — the ones this round paid for

- **Do NOT try to set `Cache-Control` for `/search` in `next.config.ts`.** I tried; now that the
  page renders on the server it is a dynamic route and Next overwrites the header with
  `private, no-cache, no-store` whatever the config says. Measured on production: the rule changed
  nothing. There is a comment in the file saying so.
- **A probe that counts `href="/listing/…"` finds nothing here** — listing URLs are
  `/homes-for-sale/NY/<city>/<zip>/<address>/bid-38-<id>`. My first SSR probe reported "0 listings"
  on a page that had 36 of them. Count `<article`, or count the real prefix.
- **`display: contents` hides children from a naive DOM probe.** A layout probe that walks
  `element.children` and skips zero-width boxes will silently drop everything inside a
  `sm:contents` wrapper and tell you the controls vanished. Walk through them.
- **A grouped flex row that cannot shrink overflows at 320.** The first cut of the filter-bar
  actions was `flex-nowrap` with a `shrink-0` secondary button: exactly 66px too wide at 320, which
  the sweep would have caught but the 390 screenshot would not have.
- **`vercel env rm` alone does nothing to a `NEXT_PUBLIC_*` value** — it is inlined at build time.
  Redeploy, then verify, before believing the switch took.
- Everything in the round-14 handoff's trap list still applies, in particular: lead forms hit the
  LIVE CRM unless you intercept `**/api/lead`, `photosMirrored` is wiped by the sync (read
  `photos_servable`), and the global unlayered `:focus-visible` ring beats every utility.
