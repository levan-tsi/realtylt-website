# Round 36 — the orchestrator's lane

The design work is recorded in `DESIGN-ROUND36.md`. This file is everything else: the things I
measured rather than assumed, so the next round inherits measurements instead of impressions.

## 1. "The work is not on production" — resolved, and nothing was lost

The machine froze mid-round-35. The first job was to find out what died with it. Nothing did:

- Working tree clean of tracked changes, `HEAD == origin/main == cbcc549`, empty stash, no
  dangling reflog entry. Every commit round 35 made was already pushed.
- All eight Vercel deployments since the round began report `state: READY`, `target: production`.
  The newest is `cbcc549`.
- The two things the owner went looking for are both live: `/thank-you` returns 200 with its own
  hero, and the drifting Featured rail is in the production HTML (`drift-track`, `drift-duration`).

**He was looking at the right page on the wrong site.** `realtylt.com` and `www.realtylt.com` both
still return the OLD vendor site — 200, 90,673 bytes, `title: RealtyLT | Levan Tsiklauri | United
Real Estate`, Brivity/IDX markers in the markup. That is correct and deliberate: the apex has never
been pointed here, because pointing it is step two of the owner's three-step launch and it is his
switch to throw. **The new site lives at `https://realtylt-website.vercel.app` and nowhere else.**

Also worth writing down because it looks alarming and is not: the new site's HTML contains no
`<meta name="robots" content="noindex">`. The noindex is served as a HEADER —
`x-robots-tag: noindex, nofollow` on every response measured (`/`, `/robots.txt`, `/search`) —
alongside `robots.txt` returning `User-Agent: * / Disallow: /`. That is stronger than the meta tag,
not weaker. A future round grepping the HTML for "noindex" will find nothing and must not conclude
the gate is off.

## 2. The sold-photo loop

**The scheduler problem is fixed rather than re-diagnosed.** Round 34 lost it to a session-scoped
cron job, round 35 lost a completion report to restarting it mid-window, and this round a nohup'd
shell loop died within seconds because the harness takes its process group with it. It is now
`scripts/sold-loop.mjs`, started detached and confirmed alive:

    powershell -Command "Start-Process node -ArgumentList 'scripts/sold-loop.mjs' -WindowStyle Hidden"

It decides nothing. Every fifteen minutes it runs `scripts/sold-window.mjs` and appends the result
and exit code to `scripts/.sold-loop.log` (gitignored).

**State measured 2026-08-21 ~10:05 UTC:** trailing 201 in 1h, 36,420 in 24h. Daily door 80 against
a 3,000 floor, so `exit=3`, DOOR SHUT — correct. The 01:48 UTC penalty stamp is still on disk on
purpose, holding the rate at 1.4 for the cooling day.

**When it reopens, from the hour profile rather than a blind wait.** Photos landed per hour into
`storage.objects`, the three that matter:

| bucket | photos | ages out of the rolling 24h at |
|---|---|---|
| 08-20 10:00 | 6,079 | ~11:00 UTC 08-21 |
| 08-20 12:00 | 6,213 | ~13:00 UTC 08-21 |
| 08-20 20:00 | 6,361 | ~21:00 UTC 08-21 |

So the first door of the day should open around **11:00 UTC**, taking trailing-24h to roughly
30,400 and the daily door to about 6,100, which the hourly cap then trims to 6,000. The loop ticks
every fifteen minutes, so it catches that within a quarter hour of it happening. This is the
steady state the checkpoint describes: each window we run today creates tomorrow's window at the
same hour.

**Standing hazard while a window is live:** a Playwright probe that allows `**/api/media/**` spends
the same account budget the window is sized against. That is the leading hypothesis for the 01:48
429. `lib/probe-media-safety.test.ts` now fails the suite if a committed script allows the route.

## 3. Audit items re-measured — most are already closed

`PRELAUNCH-AUDIT.md` dates from 2026-07-27 and its open list has gone stale. Driven in a real
browser at 1440, media blocked:

| audit finding | audit measured | measured now | state |
|---|---|---|---|
| `/top-areas/*` breadcrumb "Top Areas" | 78x**15** | 78x24 (and a 73x38 sibling) | CLOSED |
| `/connect` phone + email in body | 97x**17**, 118x**17** | 183x47, 97x24, 118x24 | CLOSED |
| `/selling` "See all our Google reviews" | 163x**17** | 163x24 | CLOSED |
| `/services/*` phone in body | 97x**17** | 97x30 | CLOSED |

Every one clears the WCAG 2.5.8 24px floor. The audit's own table should be read as history.

The meta-description finding has inverted rather than closed. It said `/privacy-policy` was 59
characters and `/dmca-terms` 56, against a 80-170 target. Measured now across every
`app/**/page.tsx`, only two sit outside that window and neither is the one reported:
`/privacy-policy` is **183** (long) and `/thank-you` is **72** (short). Both marginal; recorded
rather than churned, and left for whoever next opens those files.

## 4. The listing-alerts claim is honest end to end — verified against the live database

The home carousel says "Save a search and get new matches by email". Round 11 restored that claim
on the strength of a hand-off to the CRM. A claim is worth exactly as much as the thing behind it,
so the thing behind it was checked in production Postgres, not in the doc that describes it:

- `public.listing_alert_subscriptions` exists as a view, and its definition joins
  `portal_saved_searches` to `portal_clients` for contact details, filtered `WHERE s.alerts IS TRUE`.
- `service_role` holds SELECT on it, so the CRM can read it.
- `portal_saved_searches.criteria` exists, which is the structured, parser-validated description of
  the search — the column that made the claim honest in the first place.
- 0 saved searches in production, 0 with alerts on, and therefore **0 subscriptions carrying a null
  `criteria`**, which is the corruption the doc warns about.


And one thing nobody had checked, which is the reason to look at all: the view carries
`security_invoker=true`, and RLS is enabled on BOTH underlying tables (`portal_clients` has 3
policies). Without that option a view runs with its owner's rights and `authenticated:SELECT` would
have exposed every subscriber's name, email and phone to any signed-in visitor. It does not. This
is a clean bill of health, not a repair.

## 5. THE HOME PAGE'S CANONICAL POINTS AT A REDIRECT — and only production can see it

Found while checking a different claim, which is usually how these turn up.

**The launch checklist in the `/website` brief is wrong about switch 1.** It says "every canonical
and all 58 sitemap entries currently point at the temp vercel.app host". Measured on production
just now: **61 sitemap entries, all 61 on `https://realtylt.com`**, and every page's canonical on
the apex too. `NEXT_PUBLIC_SITE_URL` was cleared from Vercel back on 2026-07-31 and the site was
redeployed. Switch 1 is DONE. The remaining launch work is the apex DNS and then `PRELAUNCH=1`.

**But the home page's canonical is `https://realtylt.com/index`, and `/index` 308-redirects to
`/`.** Every other route is correct (`/search`, `/buying`, `/selling`, `/connect`, `/who-we-are`,
`/thank-you`, `/top-areas/dutchess`, `/blog` all measured). The sitemap lists the home page as
`https://realtylt.com/`. So the two strongest signals we send about the most important page on the
site disagree, and the canonical is the one pointing at a redirect.

Cause: `app/layout.tsx` sets `alternates: { canonical: "./" }`, which Next resolves per route
against `metadataBase`. For the root route in a PRODUCTION build the prerender pathname is
`/index` (the static output is `index.html`), so `"./"` resolves to `/index`.

**Dev cannot see this.** Measured on `:3100` the same moment: dev home canonical is
`https://realtylt-website.vercel.app` with no `/index`. This is round 35's lesson wearing a
different hat — dev always streams, dev does not prerender, and only a production build answers a
production question. Any fix must be verified with `next build` output or on the deployed site,
never on the dev server.

**Held, not fixed, and deliberately so:** the fix belongs in `app/page.tsx`, which the design agent
is editing this round. Editing the same file from two sessions is how work gets lost
(`infra-shared-repo-two-sessions`). It is queued for after the agent reports, together with a guard
test that reads the BUILT html rather than the dev server's.

`og:url` is absent site-wide for the same underlying reason worth noting here: the root
`openGraph` block sets no `url`, so Next emits none. Mirroring the canonical there would inherit
the same `/index` bug, so it waits for the same fix.

## 6. Three whole-site sweeps, run against PRODUCTION, all clean

Run against the deployed site rather than `:3100` on purpose. `**/api/media/**` blocked absolutely
in the browser sweep, because a sold-photo window was due to open while these ran.

**JavaScript disabled, 18 routes.** Every one returns 200 with exactly one `<h1>` and real visible
text (2,165 to 7,269 characters of it), and 60+ working links. Only `/search` degrades, and it
degrades ON PURPOSE and well: 8,285 characters sit stranded inside five hidden streaming shells
(`<div hidden id="S:n">`), and what a no-JS visitor actually reads instead is

> Search needs JavaScript. The filters, the map and saved searches all run in the browser. Every
> area we cover has its own page that works without them, with homes listed on it.

followed by all twelve area links and the phone number. That is the documented round-35 trade,
now quantified rather than described. Nothing new was found.

**Every sitemap URL: 61 checked, 61 return 200.**

**Internal links: 149 distinct targets harvested from 19 seed pages, 149 return 200.** No
redirects, no 404s. This matters because the last launch note records that eight of the OLD site's
twenty published paths had no route here; the new site's own graph is whole.

The one thing these sweeps DID surface is in section 5 — the home page's canonical, which is the
only URL on the site that points somewhere other than itself.

## 7. A measured BEFORE baseline, from the committed rubric

`scripts/score-page.mjs` is the R32 twelve-dimension instrument (60 points, media blocked by
default, `--break` negative control). It was run against PRODUCTION, which is the state before
this round's design work, so the after-comparison is like for like.

**The instrument was proved able to fail first.** `--break` on the home page collapses it from
53.5 to **20.5 / 60** across nineteen injected penalties. A score from an instrument that has never
failed is not evidence.

**Before baseline, 8 pages, mean 53.81 / 60:**

| page | score |
|---|---|
| /thank-you | 57.5 |
| /connect | 56.8 |
| /who-we-are | 55.3 |
| /home-value | 54.0 |
| / | 53.5 |
| /selling | 51.5 |
| /buying | 51.0 |
| /financing | 51.0 |

**Penalties pooled across all eight pages, ranked.** This is where the points actually are, and it
independently confirms the assessment's ranking rather than restating it:

| pool | penalty | where |
|---|---|---|
| D2 off-scale heading sizes | 8.0 | 6 pages |
| D9 body copy under 16px on mobile | 8.0 | all 8 pages |
| D3 more than 4 distinct text left edges | 5.0 | 5 pages |
| D6 controls that ignore a press | 4.5 | /financing, /home-value, /who-we-are |
| D6 focus ring under 3:1 | 4.0 | 7 pages |
| D1 heading-to-body ratio under 1.35 | 3.0 | /buying, /financing |
| D1 more than 90 words above the fold | 3.0 | /buying, /financing, /selling |
| D4 lazy image above the fold | 3.0 | /connect, /selling, /who-we-are |
| D5 radii outside the scale | 2.5 | /buying, /financing, /selling |
| D4 unsized images (CLS risk) | 2.0 | /, /buying |
| D2 more than 4 distinct body sizes | 2.0 | /buying, /selling |

### The sub-16px finding, verified by hand rather than taken from the scorer

Computed font sizes measured on real text nodes at 390 on production. Two of these are not
judgement calls:

- **10px** — the broker attribution on the LISTING CARD (`p.min-w-0.line-clamp-2.min-h-[2lh]`),
  "Listed With United RE Hudson Valley Edge". Ten pixels, on a phone, on **required IDX
  attribution**. Legibility and compliance at once.
- **11px** — the consent disclosure under every form: "Includes automated and recorded calls and
  texts. Optional, and never required to buy or sell a home. Reply STOP any time." Eleven pixels on
  a legal disclosure the visitor is being asked to agree to.

The tail is judgement and should stay judgement: an 11px MLS disclaimer, 12px microcopy, a 14px
consent label, a 15px testimonial. A disclaimer is conventionally smaller than body copy, and
blanket-16px would be its own kind of wrong.

### Two instruments that look like they disagree, and do not

`verify-focus-paint.mjs` passes 182/182 while the rubric's D6 penalises "focus ring under 3:1" on
seven pages. They ask different questions: does a ring PAINT at all, versus is it 3:1 against its
surround. Same shape for `verify-hero-contrast.mjs` (hero text over photographs) against D10 (all
text). Complementary scopes, both owed. Recorded here because a future round WILL read these two
outputs side by side and think one of them is lying.
