# Design round 37 — /thank-you says thank you, and the scroll-motion verdict

The owner's brief, in his words: the thank-you page "was really bad it needs a lot a lot of
work and it should say thank you", his assistant "will call them to make sure they're a real
person and find out when is the best day for the appointment", an email "saying the similar
thing" — and, on motion, "maybe some transitions when you scroll down … but don't add just to
add it, we need real progress". Method: the `frontend-design` skill, the CLAUDE.md anti-slop
rules, and every claim below measured on the running site (shots in `docs/design-r37/shots/`).

## 1. What the rebuild is

- **The headline is the literal `Thank you`.** The old page's headline was "The lights are on"
  — a thesis round 36 admired and the owner read as a thank-you page that never says it. Both
  were right. The fact stays in the eyebrow (`Request received`), the thanks takes the
  headline, and the photograph goes on telling the lights-on story without a caption.
- **The page tells each visitor their own truth.** LeadForm now lands here with `?c=1|0` (the
  consent answer). `components/thank-you/ConsentCopy.tsx` reads it from
  `window.location.search` (never `useSearchParams`, which suspends the route into a JS-only
  stream — the /search blank-page bug) via `useSyncExternalStore`, so the SPA arrival paints
  the right sentence on the first frame, a hard load hydrates from the neutral sentence
  without mismatch, and no-JS simply gets the neutral page. Agreed hears what they said yes
  to; declined is never told their phone will ring.
- **Honesty is load-bearing and tested.** The assistant call and the thank-you email do not
  happen today (the n8n draft `rzI7WIQhRKfrhJxH` exists and is inactive). All promises live in
  `lib/thank-you-copy.ts` as two complete sets; ONE boolean in `app/thank-you/page.tsx`
  (`OUTBOUND_FOLLOW_UP_LIVE`, the contract in docs/LEAD-FOLLOW-UP.md) selects which renders.
  `lib/thank-you-copy.test.ts` holds BOTH sets to the rules (today-set may not mention the
  assistant or an email "on its way"; the declined branch may never promise a call or text in
  either set; the unknown branch may not lean on an answer it does not have; zero em dashes
  and exclamation marks). Both guards were watched failing on planted defects first. The flip
  was rehearsed: set true, all three branches rendered the live copy, set back.
- **The numbered cards are gone.** 01/02/03 in three identical bordered cards is the
  templated device by name, and the numerals said nothing. The replacement is a **time
  ledger**: one bordered document (radius 24), hairline rows, the left column answering the
  only question a fresh submitter has — WHEN. `Already done / Usually within the hour / When
  we talk / Always`. The consent-aware sentence sits inside the row it belongs to, with the
  number the call will come from, so a consented visitor recognises us on their screen.
- **A person, not a call center.** A sixth portrait surface (grayscale like the other five;
  `agent-portrait.test.ts` scans call sites dynamically and covers it unedited): who reads
  the request, with call/text and email rows. It also pre-answers the assistant-call future —
  the visitor has seen who calls and from what number before the phone rings.

## 2. The 390 hero, measured

Round 36 measured the phone hero as "a dark brown smear". The photograph was never the
problem — three scrims tuned at 1440 were stacking on a phone crop that contained none of the
photograph's subject. Three changes: crop to the lit shopfronts (`object-[26%_50%]` under
`md:`), wash `/55 → /30` on phones, desktop-only left vignette (at 390 it covered the whole
frame). Then the instrument: /thank-you had never been in `verify-hero-contrast`'s default
pages — the smear shipped because nothing looked. Added, and the first run FAILED 3 (eyebrow
2.50:1 at 320, 2.84:1 at 390; body 4.45:1 at 390). Fix: the mobile bottom gradient runs full
height with a /55 midpoint (the content block TOP sits mid-viewport on phones; a 78%-height
gradient left the eyebrow on nearly bare photograph) and the eyebrow is full-opacity white.
Result: PASS, 38 painted runs, 1440/390/320, windows still glowing. Hero CTAs stack
equal-width on phones (were 172px and 205px, ragged left).

## 3. Scroll transitions — the verdict

**The site already has the scroll-motion system the brief asks about, and it should not get
more.** Measured: 11 content routes carry 1–15 `<Reveal>` blocks each (65 total), the blog has
its own section-reveal system, heroes run the `rise` entrance, Featured drifts, and every
control presses (`PRESS`). The system is tuned (16px/0.5s after 26px/0.7s "read heavy"),
no-JS safe (`(scripting: none)` shows everything), reduced-motion safe, and absent by design
on utility surfaces (/search, /saved, legal) where scroll-gating content would be a cost.

What was actually missing was `/thank-you` — the one content page with zero motion. It now
runs the same system: ledger rows print in sequence (70ms stagger, the receipt printing
itself), the person card follows at 130ms. Probed both ways: motion-enabled, 6/6 hidden below
the fold then revealed at opacity 1 on scroll; reduced-motion, 10/10 rise/reveal elements
visible instantly. One composition rule found on the way: **an element on screen at load must
not wait for a reveal** — at 1440×900 the section heading sat 25px below the observer's
trigger line and rendered as an empty white band, so the heading is deliberately static and
only the rows move.

Parallax, scroll-linked (`animation-timeline`) effects and pinned sections were considered
and rejected: they move layout or paint during scroll, need JS/new-browser fallbacks this
site refuses to depend on, and fight the editorial stillness that rounds 31–36 built. That is
"adding just to add", which the owner explicitly declined in advance.

## 4. Carried forward

- The global footer asks a fresh submitter to fill another form two viewports below "Thank
  you". Suppressing site chrome per-route is not a surgical change (the footer renders in the
  root layout, which has no pathname); flagged for an owner/orchestrator call.
- At 320 the phone number in the consented ledger row wraps mid-number. The copy is a plain
  string (that is what makes it testable); a non-breaking hyphen risks font-fallback tofu in
  Lato. Left as-is, noted.
- On flip day, re-read `NEXT_STEPS_WHEN_LIVE` against what the workflow actually does
  ("usually within the hour", the calling number) before flipping the boolean.
