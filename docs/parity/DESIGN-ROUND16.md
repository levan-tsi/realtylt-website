# Design round 16 — written 2026-08-02

The brief for this round asked for a fresh-eyes design assessment before building. Doing that
first turned up something more important than any of the design work, so this document leads with
it and then covers the design.

---

## 0. Read this first: most of the named design brief was already done

The `/website` command's own text lists three "named defects the owner reported" and three carried
work items. **Five of the six were already shipped in rounds 11–15.** Verified in a browser, not
assumed from the code:

| Item in the brief | Actual state |
| --- | --- |
| Hero search input and SEARCH button "stuck together" | **Fixed.** They share one container with a 4px inset — the third reading after the owner rejected both butted-together and gapped |
| Hero sits on flat black | **Fixed.** It sits on the photograph; the black shelf is gone |
| Mobile footer order | **Fixed**, and in the order the brief itself suggested: form first as the action, then contact details and page links together as the reference block |
| Equal Housing Opportunity + REALTOR® marks | **Present** in the footer, with the EHO artwork self-hosted |
| Six unlicensed vendor photographs | **Replaced** with CC0 / CC-BY images, each recorded in `ATTRIBUTIONS.md`, with `lib/images/attributions.test.ts` failing the build if the table ever falls behind again. `hero/hom.png` is gone too |
| Listing alerts | Capture is wired — the saved searches travel with the lead as `[Listing alerts requested]` |

**One genuinely open item remains, and it is the owner's to decide** — see §3.

The lesson for the next round: the slash-command text is a snapshot and drifts. `POLISH_CHECKPOINT.md`'s
top block is the live brief. Check the rendered page before believing either.

---

## 1. What already reads luxury

- **The type system.** Newsreader at 200–300 weight over Lato, with the emphasised half of a
  headline stepping up one weight in the *same* face rather than reaching for a second colour or
  family. That restraint is the single most expensive-looking decision on the site.
- **The hero's willingness to be quiet.** A monochrome photograph, an eyebrow, four words, one
  instrument. No badge row, no stat strip, no gradient.
- **Two greys, not seventeen.** Round 15's line-token census. Nobody notices one grey; everybody
  feels all of them.
- **The search instrument.** Input and button sharing a body with a 4px inset reads as one
  machined object instead of two controls that happen to touch.
- **Vertical rhythm is systematic** — I measured it expecting to find drift and did not. The gaps
  between sections (112 / 226 / 176 / 258px of real ink-to-ink whitespace at 1440) are not ad hoc:
  they are exactly the sums of the `.sec` scale's edges where two sections meet. Left alone.

## 2. What still reads generic, ranked by leverage

1. **The no-photo placeholder is the loudest thing on the site.** A gothic mansion at night under
   storm cloud with "Coming Soon" in gold script — dramatic, ornate, and the exact opposite of the
   calm monochrome everything else commits to. It is currently on **6–14% of the cards on every
   search surface** (measured per surface, below), so it is not a rare edge case. This is the
   highest-leverage single asset on the site. Not changed here because it is a branded asset and
   may be the owner's own choice.
2. **The hero photograph is a vintage convertible in front of a gate.** It is the first frame of
   the old vendor's Vimeo clip. It is not a home, not the Hudson Valley, and not licensed to us.
   See §3 — this is the open decision, and the alternative is already sitting in the repo.
3. ~~The hero is a still.~~ **Done this round.**
4. ~~The `/search` count line is the page's headline set as body text.~~ **Done this round.**
5. ~~The save-heart has no moment.~~ **Done this round.**
6. ~~The listing card's photo pops in.~~ Already shipped — `MlsImage` cross-fades over its
   placeholder in 300ms.
7. **A row of listing cards did not share a baseline.** Fixed this round; see §4.

---

## 3. The one real decision left: the hero photograph

`public/images/hero/hero-vimeo-frame.jpg` is the first frame of Vimeo 398379426, the old IDX
vendor's ambient clip. `ATTRIBUTIONS.md` has carried it as **UNRESOLVED** for several rounds:
there is no licence record for the clip or the frame, and it is also a third-party iframe sitting
on the LCP path of the most important page on the site.

Every phone and every reduced-motion visitor already gets the alternative, and **we hold a licence
for it**: Breakneck Ridge (Jeff Pang, CC BY 2.0). Two screenshots, same viewport, same everything
else:

- `docs/design-r16/hero-vimeo-frame-1440.png` — what desktop visitors see today
- `docs/design-r16/hero-licensed-still-1440.png` — what everyone else already sees

**The recommendation is unchanged from the audit, and looking at them side by side makes it
stronger: drop the clip and give everyone the still.** It removes an unlicensed asset, removes a
third-party iframe from the LCP path, deletes a component, and — the part that actually matters —
puts the Hudson Highlands behind "Let's Find Home" instead of a sports car. The photograph says
where this business works. A car says nothing.

It is left undone because it is a licensing question about content the owner may hold rights to,
and `ATTRIBUTIONS.md` is explicit that it "needs an owner decision, not a patch". **One yes and it
is a ten-minute change.**

---

## 4. What was built this round

| Move | What it does | How it was verified |
| --- | --- | --- |
| Hero arrival | Photograph settles 1.08 → 1 over 8s while eyebrow, headline and instrument arrive in reading order, on the existing `.rise` ladder | LCP median 1592ms → 1504ms over 5 reps, same `<IMG>` element — the image is only scaled, never faded. Reduced motion: all three at opacity 1 within 150ms |
| `/search` count line | The number set in Newsreader at 24px so the one piece of content on a row of instruments stops looking like another control | Computed font family read off the DOM (`Newsreader` vs `Lato` on body). Strip 44 → 54px, so it does not cost a row of cards |
| Save heart | 260ms pop, tied to the act of saving — never on mount, never on removal | — |
| Card baselines | Cards whose feed row carries no beds/baths dropped that line and pushed the price 20px down | Spread across 8 cards measured 20px → **0px** |

### Photo coverage, measured per surface

How many of the 36 cards on the first screen would show the placeholder:

```
/search default        4/36 (11%)      /search Orange county   5/36 (14%)
/search newest first   4/36 (11%)      /search Newburgh        2/36  (6%)
/search new listings   4/36 (11%)      /search featured        2/36  (6%)
```

This is **temporarily worse than usual and it will heal on its own.** The sync spent seven days
frozen (see `HANDOFF-ROUND-16.md`), and catching it up brought in ~1,500 listings faster than their
photos could mirror. The media host is refusing every download right now — 22 of 22 sampled
requests answered `429 Request limit reached` — which is itself a consequence of the stuck sync
re-downloading the same photos hourly for a week. **No backfill was run on purpose:** adding load
to an account already at suspension risk is the wrong move. Once the window clears, the hourly sync
mirrors changed listings and `scripts/backfill-photos.mjs` sweeps the rest.

---

## 5. Not changed, and why

- **Vertical rhythm.** Measured, found systematic, left alone. Two adjacent `.sec` sections
  legitimately stack their padding into 224px of white; generous space is the luxury signal the
  brief asks for, not a defect.
- **The no-photo placeholder.** Named above as the highest-leverage item, but it is branding.
- **The hero clip.** Owner decision, §3.
- **`/search` sort `<select>` at 12px on a phone.** The one documented exception to the 16px floor:
  iOS opens a native picker for a `<select>` rather than zooming, so it does not trigger the zoom
  the floor exists to prevent. Stands unless the owner asks.
