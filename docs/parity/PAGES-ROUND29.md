# Round 29 — the eight pages, driven

HOME, BUYING, SELLING, TOP AREAS, FINANCING, HOME VALUE, WHO WE ARE, CONNECT. Driven at 1440,
390 and 320 with `**/api/media/**` blocked and `**/api/lead` stubbed. Written as the work
happened; per page: found / fixed / polished / left with a reason.

Not touched, by instruction: `/search` and the map, the hero video and search-instrument
mechanics (round 27), the chat launcher, `scripts/backfill*`, `lib/idx` sync, the CSP, the
launch switches.

## Baseline re-measured at round start

Round 28 closed on "tsc clean · 878 tests". Re-run on this tree before any edit, because a
carried baseline that was never reproduced is not a baseline:

```
npx tsc --noEmit   -> No errors found
npm test           -> 64 files / 878 tests passed   (foreground, 18.5s)
```

Both match. Broad sweep over 8 pages x 3 widths (`scripts/_scratch-r29-sweep.mjs`) found, before
any change:

- **No horizontal overflow** at 390 or 320 on any of the eight (`scrollWidth === innerWidth`).
- **No em dashes and no arrow glyphs** in any visible text node.
- **No gradient text and no gradient buttons.**
- **No 404s.** All 58 unique hrefs across the eight resolve; 29 internal destinations checked
  by status code, all 200, and the instrument was proven able to report 404 (`/top-areas/nowhere`
  and a bogus path both return a real 404 with the site's own "This address isn't on the map"
  page, not a streamed 200).
- One `<h1>` per page, every page.
- Console errors: only `net::ERR_FAILED` from the media route the probe itself aborts.

---

## The three carried work items

### C. The six unlicensed vendor photographs — ALREADY DONE (round 16), verified today

The brief carried this as open. It is not: `docs/parity/DESIGN-ROUND16.md` records the swap and
the tree agrees.

- `public/images/hero/hom.png` does not exist (`find public/images -type f`, 45 files, no `hom.png`).
- The three lifestyle photographs the brief names are present and licensed:
  `lifestyle/buying.jpg` (Wheaton, *rboed*, CC BY 2.0), `lifestyle/selling.jpg` (Round House in
  Rush Creek Village, dok1, CC BY 2.0), `lifestyle/financing.jpg` (Accounting Finance,
  Wilfred Iven, CC0 1.0). Every one of the 45 files under `public/images` appears in
  `ATTRIBUTIONS.md`, and `lib/images/attributions.test.ts` fails the build in both directions
  (file with no row, row with no file).
- The only surviving reference to the vendor CDN anywhere in `app/` or `components/` is a source
  COMMENT in `app/financing/page.tsx:67` recording where a replaced asset came from. Nothing is
  fetched from `images.brivityidx.com`.

**Still unresolved and still the owner's:** `public/images/hero/hero-vimeo-frame.jpg` is the
first frame of the ambient Vimeo clip the old vendor supplied, and neither the frame nor the clip
carries a licence record. `ATTRIBUTIONS.md` lists it as UNRESOLVED rather than quietly omitting
it. It is desktop-only; every phone and every reduced-motion visitor already gets the licensed
Hudson Highlands still. The decision is confirm the licence or drop the clip, and it belongs to
the hero video, which this round was told not to touch.

### B. Equal Housing Opportunity + REALTOR® — the marks were already shipped; the SIZING RULE was not met

Round 11 researched both marks, wrote the rules into `docs/parity/DESIGN-ROUND11.md` §3, and
shipped them: a self-hosted SVG traced from HUD's own `fheo400.gif` (`components/site/
EqualHousingMark.tsx`, never the vendor's `Equal-Housing-Realtor_gray50.png`), plus the REALTOR®
word mark set in our own type. So the artwork half of this item was done.

**What was NOT done is the sizing rule round 11 itself wrote down.** Re-read from the sources
today:

| Rule | Source |
|---|---|
| "If other logotypes are used in the advertisement, then the Equal Housing Opportunity logo should be of a size at least equal to the largest of the other logotypes." | HUD fair-housing advertising guidance (24 CFR Part 109 as published; rescinded as a regulation in 1996 but still the advertising manual's standard) |
| The logo is uncopyrighted, free to use, no permission or licence required. | HUD |
| "Only NAR, its members, and its Member Boards may use the MARKS." | [NAR Membership Marks Manual — Limitations](https://www.nar.realtor/membership-marks-manual/limitations-on-license-to-use-the-marks) |
| Form of use: "(1) the use of capital letters ... (2) the use of separating punctuation where appropriate; and (3) the use of the federal registration symbol '®' adjacent to each of the terms." Preferred form is all capitals with the ®. All-lowercase is prohibited outside a domain name or email address. | same |
| Contextual use: the term needs a membership reference — the association's name qualifies. | same |
| The REALTOR® **logo** (the block R artwork) may be used only with the member's name or firm name and address. We do not ship it: we ship the word mark, which is the preferred form and has no artwork rules to break. | [NAR — trademark/logo use with member's name](https://www.nar.realtor/logos-and-trademark-rules/trademark/logo-use-with-members-name) |

Measured with `scripts/_scratch-r29-marks.mjs` (8 pages x 6 widths, 48 runs) before the fix: the
Equal Housing mark rendered **32px** tall on every page at every width, and the largest other
logotype on the same page — the header RealtyLT wordmark — rendered **43.0px** between 640 and
1279px, 40.5px above that, 36.4px below. **48 of 48 runs failed the rule.** The mark HUD asks to
be the largest was the smallest logotype on the page.

Fixed (`components/site/Footer.tsx`): mark to `h-11` (44px), which clears the tallest case at
every breakpoint with no responsive fork, and the legal row's type steps 12 -> 13px so a 44px
house is labelling words of its own weight instead of towering over fine print. Re-measured:
**48 of 48 pass.** One instrument fault caught on the way — the first probe matched
`/images/mls/coming-soon.svg` as a "logotype" and reported home's 447px placeholder TILE as the
page's largest logo; the filter now names the three real marks.

New committed gate `components/site/legal-marks.test.ts` does the same arithmetic from source,
so the ratio cannot rot when somebody grows the header logo months from now. **Proven able to
fail:** reverted to `h-8` it reports "The mark renders at 32px; the tallest RealtyLT wordmark
renders at 43.0px". Its computed heights (36.4 / 43.0 / 40.5 / 36.1) match the browser
measurements to a tenth of a pixel.

Also fixed in the same row: at 1440 the copyright line was capped at `max-w-md` (448px) for a
~560px sentence, so it broke one word from the end and left "operated." alone on a right-aligned
line with ~300px of empty row beside it. `max-w-xl` lets it set on one line where there is room.

**Two things for the owner, neither of them a patch:**

1. **The REALTOR® line is a membership claim.** Only NAR members may display the marks, and a
   member's licence to use them "terminates automatically" if membership lapses. The site says
   "Member of the National Association of REALTORS®" on every page. Nothing in this repo can
   verify that membership. If it is current, nothing to do; if it ever is not, the line comes off.
2. **New York: the standardized operating procedures are missing, and it is a statutory
   requirement.** Under RPL §442-h every New York broker must post standardized operating
   procedures (whether prospective clients must show identification, whether an exclusive broker
   agreement is required, whether mortgage pre-approval is required) on any publicly available
   website they maintain — and, in the words of the requirement, "each publicly available website
   and mobile device application operated by an associated agent or 'team' of such broker must
   have posted their broker's standardized operating procedures or a direct link to such
   information on their broker's website." realtylt.com is an associated agent's website. It
   carries the NY Fair Housing Notice on every page (header bar, `dos.ny.gov/fair-housing-notice`)
   but no SOP and no link to United Real Estate's. The old PHP site at realtylt.com has neither
   either — it was fetched and checked today; it carries the Fair Housing Notice PDF and nothing
   else, and no Equal Housing or REALTOR® mark at all. **This needs the brokerage's own SOP URL
   or document.** Writing one here would be inventing a legal disclosure on the broker's behalf,
   so it is flagged, not patched. When the URL exists it is one line beside the Fair Housing
   Notice in the header bar and the footer.

### A. Listing-alerts honesty — driven end to end; the home page's claim is TRUE and stays

The brief carried this as "saved searches store an alerts flag but nothing sends yet". Both
halves of that are true of the ACCOUNT path and neither is the path a real visitor is on.

**Measured facts, not assumptions.**

- `/auth/v1/settings` on the site's Supabase project, read today: `disable_signup: true`,
  `mailer_autoconfirm: false`, `external.google: false`. **No visitor can create an account.**
  Password, magic link and Google are the only three doors and all three are shut, as they have
  been since at least round 20.
- `portal_saved_searches` and the `listing_alert_subscriptions` view both exist and both hold
  **zero rows** — consistent with the above.
- `SavedProvider.setSearchAlerts` returns immediately unless `signedIn`, so the alerts checkbox
  on `/portal/searches` is unreachable by anyone. It is also the one that stores a flag nothing
  acts on. `/portal` is not one of this round's pages and is unreachable anyway; recorded here so
  the next round does not rediscover it.

**The path that actually works, driven as an anonymous visitor** (`scripts/_scratch-r29-alerts.mjs`,
`**/api/lead` intercepted and never forwarded): save a search on `/search` -> it lands in
`localStorage` under `rlt:saved-searches` -> `/saved` offers the alert opt-in only when there is
something to alert on -> submitting it posts a lead carrying the searches. The exact body that
would have reached the CRM:

```json
"savedSearches": [{
  "label": "Dutchess County, NY · 3+ bd · $400K+ · waterfront or water access",
  "query": "county=dutchess&priceMin=400000&bedsMin=3&waterfront=1",
  "criteria": { "county": "dutchess", "priceMin": 400000, "bedsMin": 3, "waterfront": true }
}]
```

Every filter survives, including the boolean, because `searchCriteria` runs the SAME validated
`parseFilterParams` the live search runs — a saved search can never describe something the search
would not do. Server-side, `lib/leads/index.ts` also folds a readable `[Listing alerts requested]`
summary into the message so the request is actionable in a plain CRM view that shows only the
note field, and `parseSavedSearches` bounds the count, the string lengths and the value types.

So the intent IS properly captured and readable, and the home page's claim — the `WhyCarousel`
caption **"Save a search and get new matches by email"** — is true end to end: a human on the CRM
side sets the alerts up, which is what the caption says and all it says. **Kept, unchanged.**

**Instrument fault worth recording:** the first run of this probe reported that saving
`?county=dutchess&minPrice=400000&beds=3` dropped the price and the beds — which reads exactly
like the honesty defect the brief describes. It was the probe: the real parameters are
`priceMin` / `bedsMin`, so `/search` correctly ignored two parameters that do not exist and saved
what was actually applied. Check the accepted names before believing a filter was lost.

**One finding, left deliberately:** the save dialog's signed-out footer offers
"SIGN IN TO SYNC + GET ALERTS" as its primary action and "View saved searches" as the quiet one,
so the anonymous visitor is steered first at the door that is shut and second at the path that
works. `lib/auth/error-message.ts` already catches the landing ("New accounts aren't open yet.
Call or text ..."), so it is not a dead end without explanation, and `SaveSearchDialog` belongs to
`/search`, which this round was told not to touch. Recorded for whoever opens sign-up.
