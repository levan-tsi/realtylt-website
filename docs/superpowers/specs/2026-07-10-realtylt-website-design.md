# RealtyLT Website Rebuild — Design Spec

Date: 2026-07-10 · Status: approved (autonomous mode per mission prompt — decisions recorded, not asked)
Sources of truth: `docs/BRIEF.txt` (v2, authoritative) + `docs/reference/` (live-site screenshots at 1280/390, `sitemap-live.json`, `page-inventory.json`).

## 1. Subject, audience, job

Hudson Valley (Dutchess, Westchester, Putnam, Rockland, Ulster, Orange counties, NY) residential
real estate, one agent-led brand: Levan Tsiklauri | United Real Estate (RealtyLT). Audience:
buyers and sellers in the mid-Hudson region — NYC transplants moving up the Hudson line, local
families, homeowners weighing a fast cash offer vs a traditional listing. The site's single job:
get a visitor to search homes or request a home value, and convert them into a CRM lead.

## 2. Brief ↔ live-site reconciliation (Phase A findings)

Confirmed against live capture (docs/reference/page-inventory.json):

- All brief pages exist live EXCEPT **Reviews** — no /reviews page or link anywhere on the live
  site. Testimonials appear inline on Home (3 quotes) and Selling (3 Google review cards).
  → BUILD /reviews fresh per brief.
- **Top Areas county "pages" are query-param search views** (`/search?multi_search=Dutchess…&mlsId=280&propertyType=Residential|Multi-Family&price=10000:&status=1&q_sort=createdAt-`),
  exactly as the brief's structure note says. `/top_areas` itself is a nearly empty page (26KB screenshot).
- **Orange County, NY is a sixth serviced area** — it appears as the first county quick-filter chip
  on the live /search page and in the search page title, but is missing from the brief's Top Areas
  list. → Build 6 county pages including Orange.
- **Live footer bugs to NOT replicate**: social icons link to *Brivity's* accounts
  (facebook.com/Brivity, twitter.com/Brivity, …) and the email link is a broken
  `mailtolevan@realtylt.com` (missing colon). → Omit social icons until owner supplies real URLs;
  fix the mailto.
- Header links HOME VALUE → `/home_value` while footer uses `/homevalue` — both live. → One
  canonical route + redirects.
- **MLS compliance block** on search: "Information provided by One Key MLS, and is deemed reliable
  but not guaranteed accurate." + "Data last updated: <timestamp>" + "©<year> One Key MLS" +
  MLS GRID logo, and "Listed with <brokerage>" on every card. Feed = OneKey MLS via MLS Grid
  (mlsId=280). → The IDX layer (mock included) must render this attribution.
- Live nav has **Sign In** (Brivity account: favorites, saved searches, phone-as-password).
- Blog is live with ~10 real posts (titles captured in page-inventory.json). Brief says owner will
  supply updated posts from Drive.
- Financing page shows a worked calculator example (output "$3,198.20") — useful as a math check.
- Home hero photo on the live site is a low-quality dark image — brief explicitly asks for fresh
  hero imagery.

## 3. Information architecture (decided)

Routes (clean slugs; `next.config` redirects from legacy Brivity slugs shown in parens):

- `/` Home (`/index`)
- `/search` Search Listings — client search UI over the IDX layer; supports `?county=` prefilter
- `/listing/[id]` Single listing detail
- `/buying`, `/selling`, `/financing` (same slugs live)
- `/top-areas` (`/top_areas`) — REAL hub page: intro + the Valley Line river map with 6 county cards
- `/top-areas/orange|dutchess|westchester|putnam|rockland|ulster` — county pages: hero + original
  localized copy (market overview, lifestyle, commute, why-buy-here — SEO improvement per brief §8)
  + IDX results pre-filtered to the county + area CTA
- `/home-value` (`/homevalue`, `/home_value`) — valuation lead form
- `/who-we-are` (`/realestateagent/search`) — bio page; placeholder copy clearly marked until owner
  supplies Drive copy
- `/reviews` — NEW: testimonial aggregation + link to Google reviews
- `/blog`, `/blog/[slug]` — MDX content; seeded with the 10 live post titles as stubs
- `/connect` — contact page (form + REACH OUT)
- `/saved` — favorites + saved searches (localStorage)
- Legal: `/privacy-policy`, `/dmca-terms`, plus Fair Housing top-bar linking to the NYS Fair
  Housing PDF; `/sitemap.xml`, `/robots.txt` generated.

**Decision — Sign In:** replaced with a "Saved" heart (count badge) in the nav opening `/saved`.
Favorites and saved searches persist in localStorage ("saved on this device"); saving a search
offers an email-alert opt-in that posts to the lead webhook (interest captured today, alerts wired
when IDX goes live). Rationale: no user backend exists yet; shipping a fake login is worse than an
honest device-local save. Flagged as a deviation from brief nav in CHECKPOINT.md.

Header: Fair Housing Notice bar → logo → nav (Home, Search, Buying, Selling, Top Areas ▾(6),
Financing, Home Value, Who We Are, Blog, Connect) → Saved ♥ → phone. Mobile: sheet menu.
Footer (every page): nav per brief §7, full contact form with the 6-option interest-reason
dropdown, REACH OUT block (address / phone / fixed mailto), legal row.

## 4. Design direction — "Hudson Twilight / the Valley Line"

Premium, dim-and-rich, editorial; NOT a Brivity clone, NOT navy+gold realty template, NOT the
cream+terracotta or black+acid-green AI defaults. Brand-consistent with app.realtylt.com and
realtylt.com/ai (the /ai page is the taste bar for polish and motion, not for literal aesthetics —
this is a consumer trust surface, not sci-fi).

Palette (tokens):
- `ink`        #101820 — blue-black slate-at-dusk; dominant dark-section bg + headings on light
- `paper`      #FAFAF8 — light base
- `mist`       #EDF0EF — alternate light section bg, cards
- `stone`      #6E7681 — secondary text (replaces Brivity #808080; AA on paper)
- `river`      #2B6CB0 — brand blue (logo family); links, trust elements, focus rings
- `porchlight` #E8B04B — THE accent: lit-windows-at-twilight amber; primary CTAs, Valley Line
  highlights, review stars. Used sparingly — one dominant hue per view (ink or paper), amber accents.

Type:
- Display: **Fraunces** (variable; warm optical sizing) — heroes + section headlines only.
- Body/UI: **Nunito** (brief's face, honored) — 400/600/700.
- Data: **Spline Sans Mono** — listing prices, stats, eyebrows/labels, calculator output. The mono
  gives prices a precision feel and ties to the RealtyLT tech brand (CRM, /ai).

Signature element (the one risk): **the Valley Line** — a single continuous SVG path tracing the
Hudson's course. It appears as: (a) the divider motif between light/ink sections (draw-on-scroll),
(b) underline flourish on section eyebrows, and (c) fully realized on /top-areas as an interactive
river map — the six counties placed along the river in true geographic order (Westchester/Rockland
south → Ulster/Dutchess north), each a hover-lit marker linking to its county page. Specific to
this subject (six counties along the Hudson), navigational, memorable.

Imagery: fresh, license-safe (Unsplash-license) Hudson Valley photography vendored into
`/public/images` with `ATTRIBUTIONS.md` — twilight/aerial river hero, per-county landscape, buying/
selling lifestyle; ~20 house photos reused across listing fixtures. Owner may swap in own
photography later. Hero headline stays "Let's Find Home" (their line) in Fraunces, "Home" in amber.

Motion (restrained, 60fps, `prefers-reduced-motion` respected): reveal-on-scroll fade/rise,
Valley Line stroke draw, card hover lift + slow photo scale, hero slow zoom, animated counters on
stats. No scroll-jacking. Hover/focus/empty/loading/error states specified for every interactive
surface; visible keyboard focus everywhere.

## 5. Technical architecture (summary — full detail in ARCHITECTURE.md)

Next.js 15 App Router + TypeScript + Tailwind v4 (`@theme` tokens). Static-first: all marketing
pages SSG; /search and county results are client components over route handlers backed by a typed
IDX layer. `lib/idx`: `IdxClient` interface with `FixtureIdxClient` (~60 realistic OneKey-style
listings across the 6 counties, real town names, compliance fields) and `MlsGridClient` skeleton
(env-driven, honors MLS Grid replication constraints); factory picks by env presence. `lib/leads`:
one `submitLead()` → POST `CRM_LEAD_WEBHOOK` (payload: name, email, phone, message, interestReason,
source, timestamp) with dev stub fallback; honeypot field like the live site. `lib/mortgage.ts`
pure function + unit tests (brief 5C: P&I amortization + tax/12 + HOA + insurance, % breakdown,
reset). Map: Leaflet + OpenStreetMap (no API key). Blog: MDX in `content/blog`. SEO: per-page
metadata, schema.org RealEstateAgent + listing structured data, sitemap/robots, OG images.
Secrets: `.env.example` with the exact labeled slots from brief §4; env read at runtime only.

## 6. Approaches considered (records)

- Design: (A) Hudson Twilight/Valley Line — CHOSEN; (B) brand-blue "blueprint" light theme —
  rejected: reads like every realty template; (C) /ai-adjacent dark space — rejected: wrong
  audience for consumer trust surface.
- County pages: (A) static routes with localized copy — CHOSEN (SEO per brief §8); (B) replicate
  live query-param views — rejected: no SEO value, thin pages.
- Map: (A) Leaflet/OSM — CHOSEN (no key, works in mock); (B) Google Maps — rejected: needs a key
  we don't have and adds an owner blocker.
- Auth: (A) Saved-on-device + alert opt-in — CHOSEN; (B) full auth backend — rejected: scope, no
  backend; (C) fake Sign In UI — rejected: dishonest surface.
- Scaffold: manual file scaffold — CHOSEN (create-next-app fights non-empty repos; full control).

## 7. Out of scope (deferred, listed in CHECKPOINT)

Real MLS feed + live lead webhook (owner keys), email listing alerts backend, user accounts,
final Who-We-Are copy + real blog posts (owner's Drive), analytics vendor choice, owner's real
social URLs, production hosting setup.
