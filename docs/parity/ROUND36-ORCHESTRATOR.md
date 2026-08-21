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
