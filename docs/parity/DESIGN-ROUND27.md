# Design round 27 — the assessment, and the plan

Written after driving every main surface at 1440 and 390 on the dev tree (media proxy blocked,
lead posts intercepted), before changing anything. The owner's brief for this round names three
defects and sets the bar: "I like what we have and it's great but I think we could do it better."
High-end, considered, calm; restraint is the luxury signal.

One diagnosis up front, because it reframes all three named defects: **realtylt.com in production
is still the old PHP site** (nginx + PHP 8.4, raw Vimeo embed, links-then-form-then-details
footer). On that site, in a Chrome profile where Vimeo will not autoplay, the hero genuinely is
flat black, the search button genuinely is welded to its input, and the footer genuinely runs in
the order the owner describes. The rebuild fixed versions of all three in round 11 — but looking
at the rebuild with fresh eyes, each of the three is still only half-fixed, and the owner's
instinct is right about this tree too. The specifics are below, with measurements.

## What already reads luxury

- The system holds: Newsreader for headlines only, Lato for everything else, greyscale
  photography, black/white/mist/stone plus the logo's navy and azure held back. Nothing added
  since round 25 has broken it.
- `/plan` is now the most confident composition on the site — the black payment-first band, the
  quiz row, and the big serif dollar figure earn their contrast.
- The `/home-value` hero instrument is the best-behaved control on the site: address field, unit
  field and FIND OUT share one white bar with visible seams and real air around the button. It
  is the geometry the home search control should have had.
- The selling hero is still the best hero, and the search surface still carries its density
  calmly.

## The ranked moves

1. **The home hero's lower third is a flat black slab.** (Owner's defect 2, this tree's version.)
   The photograph carries the top of the frame and dies at the midline: a `bg-black/20` wash
   plus a `from-black/88 via-black/50` gradient over the bottom 80% means everything below the
   headline — the search instrument, the two pills, the scroll cue — sits on near-black, in
   every state (video playing, poster, no-JS, reduced motion; all four were driven and shot).
   The owner asked for the hero to sit on the photo or the video "we already have"; it already
   does technically, and the scrim then buries it. Move: ease the gradient until the photograph
   reads through behind the control, and re-prove every text floor with the committed
   `scripts/verify-hero-contrast.mjs` gate (floors 3.0 display / 4.5 small). The section keeps
   `bg-ink` behind the picture as the fault fallback.
2. **The search instrument has zero breathing room.** (Owner's defect 1.) Measured at 1440: the
   input's right edge and the button's left edge touch at exactly 0px; the white button sits
   4.0-6.8px from the container's edges. Round 11's "breathing because of the 4px inset" never
   actually breathed. Move: the container takes the 16px panel radius with an 8px inset and an
   explicit 8px gap, the button keeps 8px — concentric (16 − 8 = 8) and on the site's radius
   scale, and the same visible-air geometry the `/home-value` instrument already proves out.
3. **The mobile footer's spacing contradicts its grouping.** (Owner's defect 3.) The order he
   asked for already exists — form first, then logo, REACH OUT details, page links — but at 390
   the seam INSIDE the reference group (details to links: 72px plus a hairline) is wider than
   the gap BETWEEN the form block and the reference group (56px). Proximity says the opposite of
   the structure: the links drift away from the details they are grouped with. Move: keep the
   round-11 order (form = the action, leads; reference block second), tighten the intra-group
   seam, and open the inter-block gap on mobile so the two-block reading is unmistakable.
4. **The map legend covers the Google attribution at 390.** Carried from round 25; their terms
   require the attribution unobscured. Small positional fix, taken this round.
5. **Three hero grammars across seven pages.** Home is left-aligned full-bleed; buying and
   home-value are centred full-height; who-we-are and connect are short centred banners; selling
   is the asymmetric one — the strongest, used once. Consolidating is a real design programme
   and it changes pages the owner looks at daily: HIS call. This round prepares the comparison,
   not the sweep.
6. **The search map's default frame is mostly not the market.** Albany to Philadelphia on
   arrival; the pins occupy about a quarter of the panel. The fix changes the headline count
   (viewport-scoped grid), so the number is the owner's to move. Analysis prepared, no patch.
7. **The Google review badge is the only full-colour mark on the site.** The white variant
   Google publishes for dark backgrounds would be permitted and calmer; recolouring a
   third-party mark is a brand-compliance call. Prepared, not shipped.
8. **The chat launcher is the loudest colour on every page.** A saturated azure disc with a
   bright green status dot, bottom-right on all surfaces — and the green "online" dot is a
   named tell in the house palette rules. It is the live site's own widget mirrored byte-exact
   (`public/rlt-chat.js`), and it belongs to the chatbot project — flagged here so the owner
   can decide where it gets calmed, not restyled unilaterally.
9. **The buying hero's tracked uppercase subhead outshouts its own headline.** "GET A FREE
   CONSULTATION WITH OUR BUYER SPECIALISTS" runs nearly the full measure at eyebrow weight but
   body size. Part of the hero-grammar decision (5), not patched piecemeal.
10. **The mobile MAP/GRID arrival default** stays as round 25 left it — the owner's call,
    unchanged this round.

Moves 1-4 are executed this round; 5-8 are prepared for the owner; 9-10 fold into his calls.
Every changed surface gets driven at 1440, 390 and 320, states checked, and the two committed
gates re-run (`npx tsc --noEmit`, `npm test`, baseline 874).

---

## The record, written after the work

**Move 1 (hero) — done, with one addition the gate demanded.** Scrim eased 88->68 / 50->38 /
80%->68%. The first gate run caught the cost: the 11px eyebrow at 2.61:1 against bright photo
patches the mid-gradient no longer covered. The fix that did not rebuild the slab is a left-edge
vignette under the type column (`from-black/40` over the left 62%) plus the eyebrow at paper/85.
Direct pixel measurement behind the glyphs: p95 luminance 0.061 with the vignette, 0.098
without; white/85 reads about 8:1. Gate PASS at 1440 (all 8 pages, 172 runs) and at 390.

**The instrument found lying, and re-aimed.** The gate's home verdict depended on which frame
of the ambient Vimeo loop sat under the glyphs at screenshot time: p95 0.061 on the poster vs
0.238 on a bright frame, minutes apart on the same tree. It now hides the video layer and
scores the static poster (the visitor contract for reduced-motion, no-JS, phones, and
blocked-autoplay profiles). Its BREAK_CSS self-test was re-proven after the change: an injected
grey eyebrow reports 2.87:1. Lesson filed: a single-frame screenshot of a moving background is
a lottery ticket, not a measurement.

**Move 2 (instrument) — done at both call sites.** Home hero and `/home-value` now share:
16px container, 8px inset, 8px gap, 8px button. Measured after: inset 9-10.8px, gap 8px, radii
16/8. Real-Tab focus ring verified on the container and on the nested button; input font 16px.
`components/search-instrument.test.ts` pins the two call sites to one geometry (874 -> 876
tests), because their drifting apart is what happened between rounds 11 and 27.

**Move 3 (footer) — done.** Intervals measured after at 390: block gap 64px > intra-reference
seam 57px > logo step 36px. Order unchanged on purpose: form leads as the action, reference
follows, DOM order = visual order. Before/after at `docs/design-r27/footer-390-*.png`.

**Move 4 (map cards) — done, and it was bigger than carried.** At 1440 the legend covered the
Google wordmark by 1,071px² and the count banner covered the Map data/Terms line by 605px².
Legend docks top-left with a phone-width cap (the one-line card reached under the fullscreen
control: 1,600px² measured, then zero); banner at bottom-9 every width, its phone-only fork
retired. All intersections re-measured at 1440 and 390: zero.

**Prepared for the owner, not decided** (visuals in `docs/design-r27/`):
- `badge-1440-current.png` vs `badge-1440-white-mock.png` — the review badge as shipped and a
  filter-approximated white-variant mock (Google publishes an official white wordmark; the mock
  exists only to make the call, the real asset would be used if taken).
- `map-frame-1440-current.png` — the arrival frame, Albany to Philadelphia, pins in about a
  quarter of the panel. The candidate is a fit to roughly lat 40.49-42.09 / lng -74.47 to
  -73.35 (the actual corridor); it was not rendered because the Maps API flapped in the probe
  browser during capture, and because the decision is not visual anyway: a tighter frame
  changes the viewport-scoped headline count, and that number is his.
- Hero grammar and the mobile MAP/GRID arrival default: unchanged, as briefed; the grammar
  comparison lives in the shots from this round's sweep and round 25's item 11.
- Named, not touched: the chat launcher (`public/rlt-chat.js`, mirrored byte-exact from the
  live site) is the loudest colour on every page and carries a green status dot the house
  palette rules call a tell — it belongs to the chatbot project's owner call.

**Gates at close:** tsc clean · 876 tests / 64 files, foreground (baseline 874 + 2 new) ·
hero-contrast PASS 8 pages at 1440 + home at 390, self-test proven able to fail · no
horizontal overflow at 390 or 320 on the changed pages · no-JS and reduced-motion drives
show the photograph carrying the hero in both.
