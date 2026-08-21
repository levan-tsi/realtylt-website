# Design round 36 — the assessment, and the ranked list it produced

Written before any CSS was touched, from screenshots of the running site at 1440 and 390
(`docs/design-r36/shots/`, sliced viewport by viewport so a 7,113px page did not have to be
squinted at as one thumbnail). Method and guardrails: the `frontend-design` skill, plus the
anti-slop rules in CLAUDE.md.

## 0. First, what the round brief got wrong

The `/website` brief still carries its round-11 text, and three of the four things it calls
"not optional" are already done. Checked, not assumed:

| Brief says | Actual state |
|---|---|
| Search input and SEARCH button butted together | Fixed in round 27. Measured 600x66 with an 8px gap; visible in `home-1440-s0.png`. |
| Home hero sits on a flat black background | It does not. Desktop carries `hero-vimeo-frame.jpg`, the phone carries a hillside photograph. There is a real problem with that desktop asset, but it is not blackness — see move 3. |
| Mobile footer order is links, form, contact | Already regrouped: form, then logo, then REACH OUT, then the link columns, then the legal marks. `home-390-s9.png`. |
| Carried work: listing alerts, Equal Housing + REALTOR marks, unlicensed stock photography | All three landed in earlier rounds. The alerts claim is restored and the hand-off is real (`portal_saved_searches.criteria` + `listing_alert_subscriptions`); the marks ship as `components/site/EqualHousingMark.tsx` with `legal-marks.test.ts` guarding them; every vendor stock photo has been replaced with recorded CC/CC0 work in `ATTRIBUTIONS.md`, and `hero/hom.png` is gone. |

One item from that list is genuinely still open, and it is move 3 below.

## 1. What already reads luxury

Worth naming, because the job is to protect these while changing things around them.

- **The grayscale editorial hero.** One photograph, desaturated, a serif headline sitting low
  and left with a letterspaced eyebrow above it. It is quiet and it is confident, and it is the
  opposite of the stacked-badge hero every IDX vendor ships.
- **The `/thank-you` page.** The one hero that keeps its colour, and it earns it: Millerton at
  dusk, warm windows on a deep blue ground, "The lights are on" answering a form the visitor
  just sent. That is a page with a thesis.
- **The Featured / New Listings asymmetry.** Round 31 gave the two rails deliberately different
  weight so a visitor can tell they are different sections. Round 35 protected it by letting only
  Featured drift. Do not collapse them back into one repeated shape.
- **Restraint in colour.** Effectively ink, paper, one blue in the logo. No accent soup.

## 2. What reads generic

- **The listing card is the IDX default.** Type burned onto the photograph, an address truncated
  with an ellipsis, a small black "View" pill on a card that is already a link, and a two-line
  italic broker credit that shifts every card's internals by a line. It is the most repeated
  object on the site.
- **The drifting rail is guillotined.** Cards are cut dead at the container edge, mid-address, on
  both sides. Motion without an edge treatment reads as broken layout, not as movement.
- **The stat row** is the template answer, exactly as the `frontend-design` skill names it: big
  number, small letterspaced caps label, four across.
- **The copy is still the old vendor's.** "So, you're ready to sell your home! Congratulations,
  you've come to the right place." / "we're the top choice for buyers and sellers." / "We have
  great confidence in our brand and you can, too." Superlatives with nothing behind them, and an
  exclamation mark. Copy makes a design feel templated as fast as the layout does.
- **Vertical rhythm is loose in the low-density blocks.** ~200px of dead space under TALK TO US,
  a seller column with 250px above its eyebrow and 280px below its last line, and the areas strip
  leaving ~360px of empty container to its right at 1440 (carried from round 35, still true).
- **The phone hero wastes its top half.** ~450px of empty sky, then eyebrow, headline, search
  field, two buttons and a scroll cue crammed into the bottom 280px.

## 3. The ranked list

Ranked by impact per unit of risk. Every one of these is a design decision, not a preference:
the reason is stated so a later round can disagree with the reason rather than guess at it.

1. **The listing card.** Highest leverage on the site because it is on the home page twice, on
   `/search`, on all eleven area pages and beside every listing detail. The address must never
   truncate. The scrim must be measured rather than hoped at (it is carrying AA contrast over
   photographs we do not control). "View" is redundant on a card that is already a link. The
   broker credit is a legal requirement and should read as a quiet caption, on one line, in a
   fixed position, so cards stop shifting relative to one another.
2. **Edge treatment on the drifting rail.** A mask fade at both container edges so cards leave
   the frame instead of being cut. Keep the existing reduced-motion and pause behaviour.
3. **The desktop home hero.** `hero-vimeo-frame.jpg` is the last asset on the site with no
   licence record, and it is a vintage convertible in front of a gate — the wrong subject for a
   Hudson Valley brokerage, and a different story from the hillside the phone shows. Replacing it
   with a licensed photograph closes the licence question and makes desktop and phone tell one
   story. Render two or three candidates on the real headline and leave the choice to the owner;
   do not delete the current file until he has chosen.
4. **The phone hero's composition.** Re-crop (object-position) so the subject carries the frame,
   and give the content block real rhythm instead of bottom-cramming it.
5. **The stat row.** Replace the template device with something that encodes what is true about
   this business. If a number stays, it should be a number a visitor can act on.
6. **The old vendor's copy**, everywhere it survives. Plain verbs, sentence case, specific
   claims, no superlatives, no exclamation marks, zero em dashes.
7. **Vertical rhythm** in the low-density blocks named in section 2.
8. **Type scale and pairing** — confirm the display/body relationship is a decision, with a
   stated scale, rather than whatever accumulated over 35 rounds.
9. **Micro-interaction quality** — hover, focus-visible, active, empty, loading and error on
   everything touched. The focus-paint gate already passes; keep it passing.
10. **`/thank-you` renders `Thanks | RealtyLT | RealtyLT`.** The root layout's
    `title.template` appends the brand, and this page's own title appends it a second time. Every
    other route follows the "Topic | phrase" convention. Confirmed live in production, not only
    in dev (the GA payload carries `dt=Thanks%20%7C%20RealtyLT%20%7C%20RealtyLT`).
11. **`public/images/levan-portrait.jpg` is 1.1 MB**, by an order of magnitude the heaviest
    asset in `public/`.
12. **The consent box is a bordered box inside a bordered panel** on every form.

## 4. Guardrails for this round

Unchanged, and none of them are negotiable: no gradient text or buttons, no purple primary, no
neon cyan, no arrow-glyph CTAs, zero em dashes in visitor copy. Radii stay on the site's scale
(8 / 12 / 16 / 24 / full) — no new values. Body >= 16px on mobile with controls floored at 16px,
tap targets >= 24px, focus-visible >= 3:1, no horizontal overflow at 390 or 320, reduced-motion
clean, and the site keeps working with JavaScript disabled. `next.config.ts` CSP, MLS sync code
and every security control are out of scope, as are the two open security items in the
prelaunch audit, which need an owner decision and a paired CRM change.

Playwright probes block `**/api/media/**` unless a screenshot genuinely needs listing
photographs, and those runs stay small. A sold-photo window may be live in the background.
