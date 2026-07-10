# CHECKPOINT — RealtyLT Website

## ⚠️ OWNER KEYS STILL NEEDED (the one external blocker — everything else proceeds)

Paste into the secrets store (`.env`, from `.env.example`) when ready:

1. `MLS_API_KEY` — MLS/IDX API key (OneKey MLS via MLS Grid; TEST key first, swap PRODUCTION at launch)
2. `MLS_API_ENDPOINT` — MLS Grid feed base URL
3. `MLS_FEED_ID` — board/feed identifier (live site uses mlsId=280)
4. `CRM_LEAD_WEBHOOK` — app.realtylt.com lead-intake endpoint
5. `CRM_API_TOKEN` — CRM auth token (if required)

Until supplied: IDX runs on the realistic fixture mock (60 listings, 6 counties, "sample data"
notice shown); lead forms run in stub mode (logged to `.leads-dev.jsonl`, not delivered). Also
pending from owner (non-blocking): Who-We-Are final bio + portrait, real blog articles (Drive),
real social URLs, Google reviews URL confirmation (placeholder is a Maps search link in
`content/testimonials.ts`).

## Status — updated 2026-07-10 (Phase B COMPLETE, Builder agent, branch `feat/build`)

| Phase | State |
|---|---|
| A — understand/plan/scaffold | ✅ DONE (merged to develop) |
| B — Builder (whole site) | ✅ DONE on `feat/build` — all pages built + verified; tests green; build green |
| C — QA | not started |

### Phase B — everything built (per PLAN.md)

**B0 foundation** ✅
- `lib/mortgage.ts` (TDD, 6 tests — reproduces live worked example $3,198.20)
- `lib/leads` (TDD, 10 tests — parseLead validation, honeypot `website` field, webhook POST w/
  bearer, stub fallback to `.leads-dev.jsonl`) + `/api/lead` (spam→silent ok, invalid→400)
- `lib/idx` (TDD, 17 tests) — `FixtureIdxClient` (60 OneKey-shaped listings, real towns + per-county
  price bands, filters/sort/pagination, compliance fields), `MlsGridClient` skeleton (replication
  model: allowed-field `$filter`, `@odata.nextLink` paging, local filtering, PENDING keys),
  `getIdxClient()` env factory + `isFixtureMode()`
- UI kit: Button/Input/Select/Textarea (dark+light, error states), SectionHeading, Reveal,
  Stars, StatCounter, TestimonialCard; ValleyLine motif (divider + underline, draw-on-scroll)
- LeadForm (single component, all variants: dark/compact/withAddress/defaultReason; honeypot;
  loading/success/error states) — in footer on EVERY page
- IDX components: ListingCard ("Listed with …", heart), ListingCarousel, MlsAttribution (always
  near IDX content; fixture-mode sample notice), FavoriteButton, MapView (Leaflet/OSM price pins)
- `lib/saved.ts` — localStorage favorites + saved searches + `rlt:saved-change` event → header badge
- Imagery: 29 CC0/CC-BY photos via Openverse (hero ×2, 6 counties, 3 lifestyle, 18 houses) →
  `public/images` + `ATTRIBUTIONS.md`; all visually reviewed via contact sheet (3 rounds of
  replacements for wrong subjects); scripts: fetch-images/fix-images/contact-sheet

**B1 conversion pages** ✅ Home (hero search→/search, home-value split+form, Featured/New
carousels + attribution, county chips, testimonials, why-us + stat counters), Selling (full dual-path
per brief §6 + reference: 60-sec form card, trust row, path 01/02 cards, no-pressure banner,
3 Google reviews, 5/5/5 comp board, listing shine, 92% marketing, stay-in-loop timeline),
Home Value (hero+form, 3-step how-it-works), Connect (contact block, form, 3× 30-min meeting
cards), Financing (pre-approval letter card, LIVE calculator defaulting to $3,198.20 with
% breakdown + Reset, lender-connect form, application/closing cards)

**B2 IDX experience** ✅ /search (location/price/beds/baths/sqft/type filters, 6 county chips
(Orange first, like live), grid + map split view (Leaflet price pins, popups), sort, numbered
pagination, save-search, URL-synced state, loading skeletons/empty/error states, attribution),
/listing/[id] (gallery, facts, features, sticky ask-form, RealEstateListing JSON-LD, breadcrumbs,
63 SSG pages), /saved (favorites via API hydration, saved searches run/remove, email-alert opt-in
→ lead), /top-areas (the VALLEY LINE: interactive Hudson SVG map, 6 counties true geographic
order S→N, hover-lit markers, county cards), 6 county pages (original localized copy in
`content/counties.ts` — market/lifestyle/commute/why-buy/towns, pre-filtered listings + CTA)

**B3 content/trust** ✅ Buying (4-step process per reference), Who We Are (bio layout, copy +
photo CLEARLY marked placeholder), Reviews (NEW page: 5.0 hero, testimonial cards, Google links,
leave-a-review CTA), Blog (10 stubs seeded from live titles in `content/blog/posts.ts`, index
featured+grid, [slug] pages with draft-stub notice + BlogPosting JSON-LD), /privacy-policy +
/dmca-terms (real usable text incl. DMCA agent block + fair housing)

**B4 site-wide** ✅ per-page metadata, RealEstateAgent JSON-LD in layout, branded OG image
(public/og.png via scripts/make-og.mjs), sitemap.ts (listings only in fixture mode) + robots.ts,
skip-link, focus-visible ring, landmarks/labels everywhere, prefers-reduced-motion kills
reveal/draw/zoom, branded 404, legacy redirects already in next.config.ts

### Verification evidence (docs/verify/)
- Every page shot at 1280+390 (`scripts/shot.mjs` — now scrolls first so reveal-on-scroll content
  is visible; MSYS gotcha: prefix `MSYS_NO_PATHCONV=1` when passing /paths on Git Bash)
- Console-error sweep clean on all routes (only the intentional /404 logs a 404)
- Flows driven in real browser: heart→badge→/saved, save-search→/saved, alert opt-in submit
  (`scripts/verify-saved-flow.mjs`), mobile menu + calculator recompute/reset
  (`scripts/verify-calc-menu.mjs`), lead API valid/honeypot/invalid via HTTP
- `npm test` 33/33 green · `npm run build` green (34 static routes + 63 listing SSG)

### Known gaps / for QA (Phase C)
- OSM tiles render grey in headless screenshots (pins/attribution fine) — check in a real browser
- MlsGridClient is typed + built but UNTESTED against a live feed (needs owner keys) — feed-dependent
- Email listing alerts: opt-in captured as lead; actual alert sending needs live feed + CRM wiring
- Live-site Brivity footer socials intentionally omitted; mailto fixed vs live's broken one
- lifestyle/buying.jpg is B&W (used with sepia treatment on /buying hero) — swap if owner prefers

## Decisions log (why)

- 6 county pages incl. Orange — live search proves Orange is serviced; static pages + localized copy for SEO (brief §8)
- Sign In → "Saved" (localStorage favorites/saved-searches + alert opt-in lead) — no user backend; honest > fake login
- Leaflet/OSM map — no API key, works in mock mode, removes an owner blocker
- Fixture IDX = OneKey-shaped data incl. compliance fields; attribution block always rendered
- Fonts: Fraunces display + Nunito body (brief) + Spline Sans Mono data; accent `porchlight #E8B04B`
- Manual scaffold (no create-next-app) — non-empty repo
- Blog = typed TS content collection (`content/blog/posts.ts`), not MDX — zero deps, PLAN allowed
  "MDX or simple content collection"; swap-in of owner articles is a copy-paste per post
- Imagery via Openverse API (Unsplash napi is bot-blocked) — CC0/CC-BY only, attribution recorded
- Calculator defaults = live site's exact worked example (500k/20%/6%/30y/6k tax/100 HOA/200 ins → $3,198.20)
- County chip order on /search mirrors live (Orange first); Valley Line map order is geographic
- Sitemap excludes listing URLs when the live feed is connected (rotating inventory)

## Next steps (successor / Phase C QA)
1. Merge `feat/build` → `develop` (main agent reconciles)
2. QA per PLAN.md Phase C: drive every flow (forms incl. footer form on every page, calculator,
   filters, favorites, save-search, mobile menu) at 1280+390; diff vs docs/reference; a11y + SEO audit
3. When owner keys arrive: fill `.env`, exercise MlsGridClient against test feed, confirm leads
   land in CRM, re-enable listing alerts story
