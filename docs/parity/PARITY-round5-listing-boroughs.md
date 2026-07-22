# Parity round 5 (2026-07-22 PM): Listing-page live sections + Top Areas boroughs

Orchestrator map. References: docs/_audit/sweep-0722/listing-live.png (live anatomy),
docs/_audit/round4/final-listing.png (ours today). Verified page states: home/buying/selling/
financing/connect/blog/search/home-value all at-or-above parity after round 4b; blog ARTICLE
template ours-beats-live (article-live.png vs article-ours.png — no rebuild). Live is PUBLIC;
extract read-only; NEVER submit live forms.

## 1. LISTING PAGE — the four live sections ours lacks
Applies to the shared components/listing/ListingDetail.tsx (slug + legacy routes render it).

### L1. Sub-nav anchor bar (live's, under the header)
Live: a slim bar with anchor links [Search | Overview | Payment | Market Insights | Schools]
left, and [$ MAKE AN OFFER] [SHARE] [SAVE] buttons right. Build ours: sticky-top anchor bar
on desktop (scroll-spy optional), Search -> back to /search (county-preserving if referrer
params exist, else plain /search), Overview/Payment/Market Insights/Schools -> in-page
anchors; MAKE AN OFFER opens the existing offer modal, SHARE = existing share button, SAVE =
existing FavoriteButton. 390: bar collapses gracefully (horizontal scroll allowed INSIDE the
bar only, or hide anchors and keep actions). Tap targets >= 24px.

### L2. Payment section parity
Live: "PAYMENT CALCULATOR" tab-bar look + DONUT chart ($/mo total in the middle), editable
Home Price / Loan Details (years + rate) / Down Payment fields, breakdown rows, and a
"Today's Rates" 30/20/15-year strip. Ours: black panel + linear bar + rows (functional,
different look). Order: add a DONUT visualization (SVG, brand-neutral ink/azure, no
gradients) reflecting the same breakdown the calculator already computes, and a rates strip
for 30/20/15-year terms. HONESTY RULE: we have no live rate feed — label the strip
"Representative rates" with the calculator's editable rate as source of truth (clicking a
term seeds the calculator's term+rate). Do NOT claim "Today's". Keep every existing
calculator behavior + tests green; extend tests for the term-seeding.

### L3. "NEVER MISS A PROPERTY" band
Live: black full-width band, big headline, "Be the first to know when a property hits the
market." + Sign Up button. Ours: none. Build it between the calculator and Similar homes,
CTA -> the existing save-search flow (/search with the save-search dialog opencue, e.g.
?saveSearch=1 handled by SearchClient, prefilled from the listing's county) — reuse, do not
build a new lead path.

### L4. Market Insights — BEAT live's N/A
Live shows three N/A cards (Current Listings last 30 days / Average Price / Average Days on
Market) for the listing's city. Ours: compute REAL values server-side from idx_listings for
the listing's city (active rows; count last-30-days-listed, median/avg price, avg
daysOnMarket), cached (unstable_cache or route-level revalidate 3600). NO MLS calls — DB
only, same pattern as the county-page medians. Cards match live's 3-up layout, with an
honest caption ("computed from OneKey MLS data for <city>"). If the city has <5 actives,
show the county aggregate instead (labeled).

## 2. TOP AREAS — the 5 borough editorial pages (closes the last [~] page)
We serve 11 areas; /top-areas has 6 county pages; boroughs only exist as /search?county=
deep links. Build /top-areas/queens|brooklyn|the-bronx|manhattan|staten-island using the
EXISTING county-page template (app/top-areas/[county]/ or wherever the 6 live — reuse, do
not fork the template) with real DB medians/aggregates + a real listing grid per borough
(all data exists; boroughs are already searchable). Add the 5 cards to the /top-areas index
grid and update the home areas strip links to point at the new pages (they currently point
at /search?county=). Keep each page's copy SHORT and factual (no invented neighborhood
prose; template + numbers + grid is enough; the owner can add editorial later). Metas per
borough. This makes Top Areas [x].

## 3. HOME-VALUE hero headline font
Live's "How Much Is Your Home Really Worth?" renders in a SERIF face; ours is Lato sans.
Extract live's computed font-family from the live DOM first (scripts/_scratch probe), match
with the closest system/next-font serif (no new webfont download unless live uses a Google
font we can self-host cheaply), and re-verify the hero contrast + 390 wrap after the swap.

## 4. Hardening (after 1-3 verified)
Probes for: anchor bar (each anchor scrolls, actions fire, 390 behavior), donut values ==
breakdown rows, term-strip seeds calculator, insights cards == SQL ground truth (compare
against a direct query), borough pages (5x: 200, real medians differ per borough, grid
renders, links from index + home strip), home-value font+contrast. Then: tsc + npm test,
search parity scorer regression (node scripts/parity-score.mjs — expect >= 97), rails check
(scripts/_scratch-rail-check.mjs), keyboard/reduced-motion/320px on changed surfaces.

## Binding rules
Anti-AI-slop set (no gradients/purple/neon-cyan/em-dashes/arrow glyphs; focus >= 3:1; tap
targets >= 24px; body >= 16px mobile; no h-overflow 390/320; reduced-motion clean). ONE dev
server (127.0.0.1:3000, reuse). NODE_OPTIONS='--use-system-ca'. Probes in scripts/,
foreground, LOOK at shots. Commit page-scoped, never push. No MLS request-path calls, no
security/Supabase/auth/.env changes. Intercept /api/lead in probes.
