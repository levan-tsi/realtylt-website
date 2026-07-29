# Design round 12 — the hero instrument, then the details

Written 2026-07-29, BEFORE any code. Round 11 gave the site its typeface, one photographic
grade, and closed the owner's three named defects. This round the owner came back on ONE of
those fixes with a sharper brief, plus "check the whole main page again, make it even more
luxurious." Single agent, no subagents.

## Part 1 — what the owner said, decoded

His voice-to-text, faithfully decoded:

1. **The hero search group.** Round 11 separated the input from the SEARCH button (they had
   been butted together). His verdict: separated is not what he wanted either — they were
   never *properly connected*. He wants them **combined into one control, done properly**.
2. **Sell Your Home / See Home Value** should move **up next to the search, small** — "a
   small little one" — so the control group stops "taking the whole thing from the video
   behind it." The video/photo is the luxury asset; the controls are covering it.
3. Then: sweep the main page one more time for anything missed, and raise the luxury feel.

Reading 1+2 together: the current hero bottom is **four floating boxes** (input, SEARCH,
SELL YOUR HOME, SEE HOME VALUE) in two rows. Four boxes is a control panel. He wants **one
instrument and two quiet paths**, letting the photograph carry the section.

## Part 2 — the hero redesign (the build)

**One composed search bar.** A single glass container — `rounded-xl` (12px, the input
radius on the site scale), `border-paper/30`, `bg-black/35`, 2px backdrop blur — with a
6px inner inset (`p-1.5`). Inside it: the location input, transparent, borderless,
flex-1; and the Search button nested at the right, solid white, `rounded-lg` (8px — outer
radius 12 = inner 8 + inset 4, both on scale, so the corners stay optically concentric).
One border, one surface, one control. Connected because they share a body, breathing
because of the inset — this is the "properly connected" he is asking for.

- Focus: `focus-within` brightens the container border to `paper/70` and deepens the fill.
  The bar is the control; the bar shows the state. Input keeps `outline-none` (the border
  change is the visible focus indicator, same mechanism round 11 shipped and the audit
  counted).
- The suggestion dropdown anchors to the input box inside the bar; verify its offset
  clears the container border (the dropdown is `top-full mt-1` inside a 6px-padded parent).

**Two quiet paths beside it.** "Sell Your Home" and "See Home Value" become small uppercase
text links — 12px/700, `tracking-[0.14em]`, `text-paper/85` — sitting on the same row as
the bar at desktop, in the same utility voice as the eyebrow above the headline (the voice
already on the page, not a new one). Underline appears on hover; ≥40px tap height via
padding. No boxes, no borders: the boxes were the coverage problem.

**Footprint.** Desktop: one ~58px row instead of two rows totalling ~130px. Mobile: bar
full-width, the two links share one small row beneath it — three stacked boxes become one
box and one line of text. The photograph gets the difference.

**The scrim follows the content.** The bottom gradient was raised to 85%/black-92 in round
11 *because* the control stack was tall. With the stack halved, re-tune (lower/lighter) —
but only as far as the contrast probe allows. Re-measure with the round-11 probe; floors
are 3.0:1 large text, 4.5:1 for the small links and placeholder.

Rejected alternatives, so the next round doesn't relitigate:
- *Input + attached square button, zero gap (classic IDX bar):* connected but cheap — the
  exact vendor-template look the site left behind.
- *Keeping the two CTAs as smaller outlined pills:* still boxes, still a panel; the count
  is the problem, not the size.
- *A hairline vertical rule between bar and links:* considered as a "composed" signal;
  decide on the render — if the spacing alone reads composed, the rule is an accessory to
  remove (it survived the render as ONE 24px hairline: it turns "bar plus stray links"
  into one instrument row; at mobile it disappears because the links wrap under).

## Part 3 — fresh-eyes findings on the main page (1440 + 390, this morning)

1. **[Fixed this round — the build above]** The hero four-box pile, both widths.
2. **[Cleared]** At 390 the "Find Your Home Value" h2 looked clipped at the left viewport
   edge in the full-page capture. Measured in a real viewport: `left:16, width:358,
   scrollWidth == clientWidth == 390` — no overflow, no clipping. The reveal only ever
   translates vertically (`translate: 0 16px`) and reduced-motion zeroes it, so a
   horizontal mid-flight state is impossible. Another entry for the fullPage-stitching
   artifact list in [[verify-probe-measures-best-case]]: a downscaled fullPage capture
   can shear a heading at a section boundary and read as a layout bug.
3. **[Tune]** Hero scrim after the compaction (Part 2).
4. **[Check in passes]** Listing-card meta line (beds/baths/sqft) type at close zoom.
5. **[Check in passes]** Scroll-cue clearance once the group is one row.
6. The rest of the page held up to fresh eyes at overview zoom: the value split, the
   testimonial band, the counties strip, the laptop carousel, the stats, the ink footer
   are one system now. The remaining luxury is in close-zoom details, which is what the
   three passes are for — not in inventing another big move. Round 11's refusal note
   stands: no new signature elements on top of a page that just got its voice.

## Part 4 — what shipped (updated at close)

- (filled in at the end of the round)
