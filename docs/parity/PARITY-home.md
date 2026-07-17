# PARITY MAP — / (Home) vs live realtylt.com

Written 2026-07-17 by the orchestrator (Playwright deep-map + full-page visual compare, AFTER
the photo backfill — cards now show real photos). Work order for the NEXT page agent (dispatch
AFTER the search/photos/polish agent lands — ListingCard is shared, coordinate with its work).
Evidence (gitignored): docs/_audit/home-parity/{live,ours}-{1440,390}.png + .json.

## Current state: ours is CLOSE and largely beats live
Matching already: grayscale hero w/ "Let's Find Home" + search bar + SEARCH / SELL YOUR HOME /
SEE HOME VALUE buttons; "Find Your Home Value" + "Tell Us About Your Home" 2-col form section;
Featured + New Listings rails with LIVE-STYLE CARDS (price overlaid on photo, dark caption band,
beds/baths/sqft, "Listed With ..." line, View button) — now with REAL photos; footer band.
Ours deliberately better (KEEP): curated rails (live's show feed junk — "TEST LISTING
$999,999,999", $90M feed-wide listings irrelevant to a HV/NYC agency); testimonial band
("We found a home we love."); the 11-area chips strip; Why Work With Us as honest value cards +
stats (11 / 24h / 100+ / 7) instead of live's laptop-carousel; StatCounter SSR values.

## GAP LIST
HM1. RAIL PAGINATION (the owner's "missing signs") — live shows ‹ › arrows + "1 / 125" under
     BOTH rails; ours is a static 8 + SEE MORE LISTINGS. Add carousel paging to Featured and
     New rails: prev/next arrow buttons (chevron ICONS, not text glyphs — carousel controls are
     the sanctioned exception) + a "page N / M" indicator, paging through more than 8 (e.g.
     pull 24-32 per rail from the existing getFeatured/getNew with a higher limit, page by 4 or
     8 per view). Keyboard accessible, ≥24px targets, reduced-motion = instant swap. Keep
     SEE MORE LISTINGS.
HM2. HERO SCROLL CUE — live has a chevron-down affordance under the hero buttons; ours lacks
     it. Add a subtle scroll cue (icon button, scrolls to the value section). Minor.
HM3. WHY-CAROUSEL — OWNER DECISION, do not build unilaterally: live's "Why Work With Us?" is a
     laptop-frame screenshot carousel w/ arrows+dots; ours is value cards + stats (checkpoint
     precedent: ours judged better/honest, kept twice). If the owner wants live's look, build
     a laptop-frame carousel of OUR OWN page screenshots. Flag, don't do without a yes.
HM4. Any drift the orchestrator's adversarial verify of the search/photos agent finds on the
     home rails (card hover states, photo loading behavior with the new mirrored covers).

## Constraints
ListingCard + rails are SHARED with /search — reconcile with the search-polish agent's Mission
C card work (read its commits first; do not undo them). MLS: rails read the DB only (getFeatured
/getNew) — never add feed calls; raising a rail limit is a DB query change only. Anti-slop rules
as always (arrows ONLY as icon carousel controls). Verify at 1440+390, tsc + vitest green,
commit page-scoped, never push.
