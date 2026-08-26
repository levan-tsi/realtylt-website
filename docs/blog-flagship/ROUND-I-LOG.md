# ROUND I — the repair round, written against CHECKER-REPORT.md

**Date:** 2026-08-26 · **Builder:** a single Opus 5 agent · **Brief:** close the defects the
fresh-eyes checker found. No new posts, no new topics. **Nothing pushed.**

Six commits: `c914e42` I1 plates · `197b404` I2 citations · `c7c471d` I3 the recommendation
block · `67e404b` I4 the slider · `c8a2a97` I5 the voice page · `d2afd19` I6 the second pass.

---

## WORST FINDING FIRST, and it is one the checker did not have

**The invoicing plate's caption argued from a paper roll the machine does not have.**

> *"Every key on this machine does one thing and does it visibly, and **the paper roll behind it**
> exists so that somebody can go back afterwards and see how a total was arrived at."*

Cropping the top third of `adding-machine.jpg` settles it: under the green cover are **two rows
of mechanical register windows numbered 1 to 18**, which is a non-printing calculating machine.
There is no paper and no printing mechanism anywhere in the file. The keyboard confirms it: a
`NON SHIFT` key, a `NEG ×` key, a division key and two carriage-shift arrows are a rotary
calculator's controls, not an adding machine's.

This is the identical class of defect as Round G's invented `CHARGE` key, on a page whose whole
argument is that a payments system must be able to show you what a figure is made of. The
checker read this plate and passed it. The caption now argues from the row of little numbered
windows that **is** in the shipped frame.

The second-worst is the one the checker did find, and it is fixed: the `no-solicitation` caption
said **"Two million people said the same thing to the Federal Trade Commission last year"** when
the Data Book counts **2,085,133 complaints** — which is the sum the statbars scene four screens
above renders bar by bar — and the article's own prose three paragraphs earlier refuses exactly
that conflation about the 254 million registrations: *"That is not a count of people."*

---

## I1 — ALL 36 PLATES, RE-READ AGAINST THE PHOTOGRAPH

**Method.** Every plate rendered at BOTH shipped crops with `sharp` (`fit: cover, position:
centre`), the geometry `Plate.tsx` ships: 21:9 for a 1440 viewport, 16:9 for a phone. The
superset premise was re-proved rather than inherited — all 36 sources measure ≤ 1.778 aspect, so
the 16:9 crop contains the 21:9 one and alt written from it covers both. Lettering that would not
resolve at the shipped crop was zoomed with a lanczos upscale and, where it still would not
resolve, was described as a kind of mark rather than guessed. Two colour claims were **measured**
rather than judged by eye.

**24 of the 36 carried at least one statement the photograph does not support.** All 24 rewritten.

### The unarguable

| plate | what it said | what the picture shows |
|---|---|---|
| `switch-box` (audit) | *"a **black** lever handle on its face"* | all three levers are **red**, the same paint as the boxes |
| `switch-box` | *"the middle one stencilled **ZIP-0** above the lever"* | the stencil reads **ZSP-2** and it is on the small separate enclosure **above the box**. Above the lever is a row of marks and the word **ZAP.**, on the left and middle boxes |
| `switch-box` | *"**R400/15A** below it"* | **R100/15A**, on the left box as well as the middle one. Read at a lanczos zoom |
| `dial-panel` (audit) | *"a Cyrillic label stencilled **on the panel**… two further along the bottom edge"* | all four are on the **black gauge bezels**: MASLO OTKACHKA above the centre glass, VAKUUM below it, the same on the two bezels cut by the frame |
| `dial-panel` caption | *"Three gauges, **four needles** between them"* | **five pointers**: a black needle on each gauge, plus a red index pointer on the centre gauge **and on the right one** |
| `deed-1825` (document) | *"filled with a looping **brown ink** hand"* | **measured**: every sampled pixel has a channel spread of exactly **0**. The scan is pure greyscale. There is no brown in the file |
| `office-stamps` (document) | *"a stamp standing in the middle **beside** a small red and white label reading AIR PARCEL POST FIRST CLASS MAIL"* | the red plate **is that stamp's body**, a rotary selector with a brass winged key, carrying **six** numbered settings. PAID, at the left of the same row, was missing from the alt entirely |
| `jacquard-cards` (custom) | *"**dark lacing tape** running between them"* | **pale cream cord** threaded through the edge of every card down both sides. What runs between the cards is the dark seam where two of them hinge |
| `jacquard-cards` caption | *"This is a program, and **it is two hundred years old**"* | the source title is "Punched cards from a Jacquard loom" and gives no date; the post's body never mentions Jacquard. An age a photograph cannot carry, resting on nothing |
| `tool-wall` (custom) | *"a saw and **shears** at the right"* | at the right: two hand saws, a hacksaw frame, a large steel try square, a second pair of goggles and two pairs of dividers. **No shears.** The goggles and the square were the two most prominent objects in that half of the frame and were not mentioned |
| `adding-machine` (invoicing) | *"several columns of round **cream** number keys"* | **ten** columns alternating in blocks of **cream and pale green**, about half of each |
| `adding-machine` caption | *"**the paper roll behind it**"* | no paper roll. Two rows of register windows numbered 1 to 18 (see above) |
| `register-keys` (invoicing) | *"numbered 90, 80, 70, 9 and 8 **in dark blue on white**"* | inverted for three of five: **90, 80 and 70 are white on dark blue enamel**; only the 9 and 8 are dark blue on cream |
| `index-drawers` (marketing) | *"**each** drawer… hand lettered with **a range of surnames**"* | the bottom tier reads **DISTRICT, blank, DISTRICT, HANSARD, HANSARD, HANSARD, HANSARD**. Counted at a zoom |
| `index-drawers` | *"brass **cup** handles"* | long brass **bail** pulls |
| `index-drawers` caption | *"**the reason** the ranges are uneven is that they were adjusted as the drawers filled"* | a reason nothing in the frame supports. The two filing schemes in one cabinet **are** visible and are a better fact |
| `lever-frame` (scheduling) | *"**most of them white** with red and yellow levers standing among them"* | **red is dominant** by a clear margin; white, yellow, blue and black-and-white chequered levers stand among the red. The alt inverted the frame |
| `departure-board` (scheduling) | *"**each** screen… carrying the operator name First ScotRail"* | **four of six.** Subsequent Departures and the screen cut off at "Informat" carry none, and only four are headed Departures |
| `financing` (workflow) | *"**one hand on the trackpad** and the other keying the same figures into a calculator"* | **both hands are at the calculator**, which lies across the laptop's own keyboard. The trackpad is visible and empty. This is the photograph the whole article rests on |
| `mailboxes-row` (skip-tracing) | *"a large hand painted 70 **on its side**"* | the 70 is on the box's **door**, under the embossed U.S. MAIL / APPROVED BY THE POSTMASTER-GENERAL |
| `no-solicitation` (skip-tracing) | *"a figure **in a broad hat** striding away"* | the hat is flying **off** the head with a motion line over it, which is the joke of the sign. The sign also carries **Thank You!** in script, which the alt omitted and the caption's last line turns on |
| `no-solicitation` caption | *"**Two million people** said the same thing… **last year**"* | **2,085,133 complaints** in the 2024 federal fiscal year (see above). "Last year" was a floating reference |
| `ledger-names` (skip-tracing) | *"An open page of an old **payroll journal**"* | a **single sheet**, torn away down its right edge, ruled into columns headed Names / Commencing / Ending. "Journal" followed the photographer's title, not the picture. The caption's *"in a book"* went with it |
| `house-08` (local-seo) | *"behind an **unmown** lawn"* | short, even and plainly mown. The chimney is an external stack against the **front** of the house, not "rising through the middle of the roof" |
| `house-10` (review) | *"one **grey** with a mansard roof and one red brick"* | **measured**: the left wall samples rgb(253,239,223) and rgb(228,220,209), a warm off-white. And **both** houses have shingled mansard roofs, which the phrasing denied to one of them |
| `house-13` (booking) | *"small-paned windows, **each** hung with a Christmas wreath"* | five wreaths, all on the **front** elevation; the four gable-end windows carry none. Counted at a zoom |
| `house-05` (booking) | *"**curtains in every window**… in bright daylight"* | curtains and blinds at most; the decorative gable opening has none. The sky is white overcast. And the phone crop carries **a white sign in red capitals** at the foot of the steps that the alt did not mention |
| `house-06` (geo) | *"a balcony strung with small **pennant** bunting"* | red, white and blue **fan** bunting, the semicircular kind |
| `house-17` (agent-workforce) | *"a handwritten list in **white** chalk"* | **measured**: the brightest strokes sample rgb(123,135,120). Pale green |
| `house-14` (agent-workforce) | *"a fern standing **in the white painted fireplace opening**… onto a **dim** room beyond"* | the fern is on the hearth in front of a **black** firebox whose surround is painted white; the room through the door has a window and a sofa plainly visible in it |
| `house-07` (crm-sync) | *"an oval plaque reading **1820**"* | it reads **c 1820**. On the one plate whose caption argues that the marking is the unambiguous thing about the house |
| `type-case` (clone) | *"small **printed paper labels** tucked between some of the blocks"* | there are none. Wood grain, ink and shadow |
| `victrola` (clone) caption | *"This was **the first machine** that let a voice arrive somewhere its owner had never been"* | a historical first the photograph cannot carry, and not true of the technology either: the telephone did it first. The **winding crank**, which is what makes "wind-up" a description rather than a guess, was not in the alt |
| `ghost-sign-foundry` (enrichment) | *"the letters at the top overlapping… **so that no word can be read**"* | the name runs **vertically**; only its upper letters are overpainted and the last of them read **TOR** |
| `flyer-kiosk` (marketing) | *"**one** carrying a row of tear off tabs"* | several do, and **bright blue** is one of the loudest colours on the board and was not in the list |
| `house-02` (local-seo) | *"…and a white lattice fence above clipped box hedges"* | **Round B's correction was right about the laptop and wrong about the phone.** It removed "two terracotta pots of red geraniums either side of the step" as outside the 21:9 crop. The phone ships **16:9, the taller frame**, and both pots are plainly in it. First time Round F's rule has REVERSED an earlier correction rather than added to one |

### Judgement calls, and one refusal worth recording

- **`house-09`'s gable number is no longer quoted as 1734.** It does not resolve at the shipped
  crop, at a lanczos upscale or at a contrast stretch: four pale digit shapes are visible and the
  last two cannot be read. The photographer's title is "Green Roof" and settles nothing. The alt
  now says *"a four figure number picked out in paler stones"*, which is Round H's rule for
  exactly this case, and the caption's argument never needed the digits.
- **`ulster`, `dutchess`, `putnam`, `hudson-twilight`, `house-01`** were not wrong, only thin:
  they gave a screen reader the place name and none of the picture. Enriched from the 16:9 crop.
  `ulster` also lost *"seen from the cliffs above the water"*, which is not in the frame, and an
  `ariaLabel` that called a photograph of a lake "The ridge above Minnewaska".
- **`house-01`'s house number is legible on the porch beam and is deliberately not transcribed.**
  It is a real house, and the skip-tracing post on this site argues at length about publishing an
  address somebody did not publish themselves.
- **The skyline tower on the ridge behind `mailboxes-row` was left out** for the same reason as
  the gable digits: at the shipped phone width it is about one pixel.

### The ledger

Four `ATTRIBUTIONS.md` rows repeated a plate error and are corrected with the plates:
`index-drawers` ("ranges of surnames"), `no-solicitation` ("a figure in a hat"),
`departure-board` ("five screens"), `ghost-sign-foundry` ("the word above it no longer is").

---

## I2 — THE CITATION DEFECT, AND FOURTEEN MORE READ IN THE PRIMARY DOCUMENT

### The mis-citation

`content/blog/ai-posts.ts` quoted, for a claim about **telephone** recording:

> *"without the consent of at least one party thereto, by a person not present thereat"*

That is **§250.00(2)**, *"Mechanical overhearing of a conversation"*, which governs a conversation
in a room. Read today in the primary document (`nysenate.gov/legislation/laws/PEN/250.00`), the
definition that governs a telephone call is **§250.00(1)**:

> *"**"Wiretapping"** means the intentional overhearing or recording of a **telephonic or
> telegraphic communication** by a person other than a sender or receiver thereof, without the
> consent of either the sender or receiver, by means of any instrument, device or equipment."*

And §250.00 is only the definitions section. The offence is **§250.05**:

> *"A person is guilty of eavesdropping when he unlawfully engages in wiretapping, mechanical
> overhearing of a conversation, or intercepting or accessing of an electronic communication.
> Eavesdropping is a class E felony."*

The conclusion never moved and the right subdivision makes the paragraph shorter. Fixed in the one
place the claim is visitor-facing (there is none on any service page and none in any JSON-LD, which
I re-verified by sweeping `content/**`, `components/**`, `app/**`, `lib/**` and `public/**`), and in
`SOURCE-AUDIT.md` row 10 and `FLAGSHIP-HANDOFF.md`, both of which recorded it as verified.

**The user-agent inversion the checker documented is real and was re-proved before being relied on:**
`nysenate.gov` returns **403** with no UA header and **200** to `curl/8.0.1`.

### The fourteen

Weighted to the legally loaded, each operative sentence read in the primary document **and checked
for the SUBDIVISION rather than only for the words**, because a verbatim string match is exactly
what let the 250.00 error survive four rounds and a checker.

| # | claim | primary | result |
|---|---|---|---|
| 1 | RESPA §8(a) referral fees | 12 USC 2607 | **exact**, and *"(b) Splitting charges"* confirms the post's split of (a) and (b) |
| 2 | integrated disclosure "shall conspicuously and clearly itemize all charges imposed upon the borrower and all charges imposed upon the seller" | 12 USC 2603 | **exact**, and "single, integrated disclosure" is in the section |
| 3 | *"a 'reasonable period' is an extension of up to one business day for checks described in §229.10(c)(1)(vi), **five business days for checks described in §229.12(b)(1) through (4)**"* | 12 CFR 229.13(h)(4) | **exact, and correctly attributed to (h)** |
| 4 | surcharge posting and the cap | NY GBS 518(1) | **exact**, and the page's "most recent revision" is **2024-02-16**, which is the post's "the version in force since the 2024 amendment" |
| 5 | *"may require that any recipient pay any fee, provide any information other than the recipient's electronic mail address and opt-out preferences…"* | 16 CFR 316.5 | **exact** |
| 6 | the mixed-message primary-purpose test | 16 CFR 316.3(b)(2)(i) and (ii) | **exact, both limbs, in the paragraph the post describes** |
| 7 | *"**'personal information'** means information that identifies an individual, including an individual's photograph, social security number, driver identification number, name, address (but not the 5-digit zip code), telephone number, and medical or disability information"* | 18 USC 2725**(3)** | **exact, and it really is paragraph (3)** |
| 8 | *"It shall be unlawful for any person knowingly to obtain or disclose personal information, from a motor vehicle record, for any use not permitted under section 2721(b) of this title."* | 18 USC 2722(a) | **exact** |
| 9 | *"bearing on a consumer's credit worthiness, credit standing, credit capacity, character, general reputation, personal characteristics, or mode of living…"* | 15 USC 1681a**(d)(1)** | **exact**, under the heading *"(d) Consumer Report.— (1) In general.—"* |
| 10 | the two definitions of "business day", *"However, for purposes of rescission…the term means all calendar days except Sundays and the legal public holidays specified in 5 U.S.C. 6103(a)"* | 12 CFR 1026.2**(a)(6)** | **exact, and it really is the same paragraph**, which is what the post claims |
| 11 | *"The prohibitions in this section shall apply to all written or oral notices or statements by a person engaged in the sale or rental of a dwelling"* and the list of documents | 24 CFR 100.75**(b)** | **exact**, and (b) really is "its second paragraph" |
| 12 | the two steering examples | 24 CFR 100.70**(c)(1)** and **(c)(2)** | **exact** |
| 13 | the right to correct, and *"shall use commercially reasonable efforts to correct the inaccurate personal information as directed by the consumer"* | Cal. Civ. 1798.106 | **exact** |
| 14 | the bot disclosure law and its escape hatch | Cal. B&P 17941(a) | **exact**, and B&P **17943** gives the operative date: *"This chapter shall become operative on July 1, 2019."* |

**The operative sentences the table above abbreviated, quoted in full as read:**

> **12 USC 2607(a)** — *"No person shall give and no person shall accept any fee, kickback, or
> thing of value pursuant to any agreement or understanding, oral or otherwise, that business
> incident to or a part of a real estate settlement service involving a federally related mortgage
> loan shall be referred to any person."* And **(b) Splitting charges** — *"No person shall give
> and no person shall accept any portion, split, or percentage of any charge made or received for
> the rendering of a real estate settlement service…"*
>
> **12 USC 2603** — *"…shall conspicuously and clearly itemize all charges imposed upon the
> borrower and all charges imposed upon the seller in connection with the settlement."*
>
> **12 CFR 229.13(h)** — *"(1) If an exception contained in paragraphs (b) through (f) of this
> section applies, the depositary bank may extend the time periods established under §§ 229.10(c)
> and 229.12 by a reasonable period of time."* And **(h)(4)** — *"For the purposes of this
> section, a 'reasonable period' is an extension of up to one business day for checks described in
> § 229.10(c)(1)(vi), five business days for checks described in § 229.12(b) (1) through (4), and
> six business days for checks described in § 229.12(c) (1) and (2) or § 229.12(f)."*
>
> **NY GBS 518(1)** — *"Any seller in any sales transaction imposing a surcharge on a customer who
> elects to use a credit card in lieu of payment by cash, check, or similar means shall clearly
> and conspicuously post the total price for using a credit card in such transaction, inclusive of
> surcharge, provided however, any such surcharge may not exceed the amount of the surcharge
> charged to the business by the credit card company for such credit card use."*
>
> **16 CFR 316.3(b)(2)** — *"If an electronic mail message contains both the commercial
> advertisement or promotion of a commercial product or service as well as transactional or
> relationship content as set forth in paragraph (c) of this section, then the 'primary purpose' of
> the message shall be deemed to be commercial if: (i) A recipient reasonably interpreting the
> subject line of the electronic mail message would likely conclude that the message contains the
> commercial advertisement or promotion of a commercial product or service…"*
>
> **24 CFR 100.70(c)** — *"Prohibited actions under paragraph (a) of this section, which are
> generally referred to as unlawful steering practices, include, but are not limited to: (1)
> Discouraging any person from inspecting, purchasing or renting a dwelling because of race,
> color, religion, sex, handicap, familial status, or national origin, or because of the race,
> color, religion, sex, handicap, familial status, or national origin of persons in a community,
> neighborhood or development. (2) Discouraging the purchase or rental of a dwelling because of
> race, color, religion, sex, handicap, familial status, or national origin, by exaggerating
> drawbacks or failing to inform any person of desirable features of a dwelling or of a community,
> neighborhood, or development."*
>
> **Cal. Civ. 1798.106** — *"…the right to request a business that maintains inaccurate personal
> information about the consumer to correct that inaccurate personal information, taking into
> account the nature of the personal information and the purposes of the processing…"* and *"shall
> use commercially reasonable efforts to correct the inaccurate personal information as directed by
> the consumer."*
>
> **Cal. B&P 17941(a)** — *"It shall be unlawful for any person to use a bot to communicate or
> interact with another person in California online, with the intent to mislead the other person
> about its artificial identity for the purpose of knowingly deceiving the person about the
> content of the communication in order to incentivize a purchase or sale of goods or services in
> a commercial transaction or to influence a vote in an election. A person using a bot shall not
> be liable under this section if the person discloses that it is a bot."* **The clause "for the
> purpose of knowingly deceiving the person about the content of the communication" is the one the
> post's unmarked ellipsis had dropped.**

**Zero further mis-citations.** The checker's 6% sample rate implied roughly five more across the
other 89 links; on a 14-link sample weighted the same way, there are none. That does not prove
there are none in the remaining 75, and the honest reading is the checker's own: finding the next
one costs another full pass.

### Three softenings found on the way, all closed

1. **The HBR 7x was attached to the wrong outcome on three short surfaces.** The study says firms
   were nearly seven times as likely *"to qualify the lead (**which we defined as having a
   meaningful conversation with a key decision maker**)"*. The chat service page, the voice post's
   `IN_SHORT` and the voice calculator note all said *"reach a decision maker"*, which is a
   materially easier outcome, in the three places a skimmer sees it.
2. **Winkler's hedge, lost in our own research comment first.** Read in the Census PDF:
   *"Winkler (1990a) showed that even high quality files **might contain** 20+% error in first
   name pairs and 10+% error in last name pairs among pairs that are true matches."* The comment
   in `crm-sync.ts` dropped "might", the stat label under it then printed the figure as a property
   of every cleaned file, and the post's next sentence flattened it too. All three restored.
3. **Cal. B&P 17941 was quoted across an unmarked ellipsis** that dropped *"for the purpose of
   knowingly deceiving the person about the content of the communication"*, making the offence read
   broader than the statute.

And the last open hygiene item: `ai-chat-assistant` was **the only one of sixteen service `stat`
blocks with no `source`**. It has one. The argument for leaving it off was that hbr.org paywalls
the article; that is not a reason, because it is the same paywalled article its sibling scenes cite
by name, and a reader who cannot open it can still see whose study it is and how big the sample was.

---

## I3 — THE RECOMMENDATION BLOCK

**The defect, measured.** The block was one line over a date-sorted list, and fifteen of the twenty
flagships share a publication date, so "newest" was decided by array order and array order does not
move. Running the old rule over the real cohort produces **4 distinct blocks across 30 posts**, and
a consumer post about packing boxes was handed three B2B automation essays.

**Why not derive it from the posts' own links**, which would need no new metadata — measured
BEFORE choosing rather than after: **nine of the twenty flagships place no `/blog/` link in their
body at all**, and adding inbound links to outbound still leaves eight with no signal. Those eight
would have fallen straight through to the same three newest posts, which is the defect. A link
graph that sparse cannot carry the block.

**The rule**, in `lib/blog/related.ts`, taking the first three it finds: the post's own **cluster**,
then the rest of its own **cohort** in running order starting after this post and wrapping, then
anything left so the block is never empty. Never itself, at every step. `cluster` is one word on the
post: `answering`, `appointments`, `records`, `visibility`, `back-office`, `building` for the twenty,
`moving` and `owning` for the ten consumer stubs. Optional on the type, because a CRM-published post
arrives without one.

**Result, measured the same way: 27 distinct blocks across 30 posts.** Verified in a browser at 1440
on six pages: six distinct blocks, none recommending itself, packing now offers three moving posts.

`lib/blog/related.test.ts`, 9 tests, **proved against the known-bad before being believed** — the
same assertions run against the old one-liner fail three ways:

```
AssertionError: top-5-renovations-increase-home-value-ny: expected [ …(3) ] to deeply equal []
AssertionError: ai-clone-real-estate-agent-video-avatar: expected 'building' to be 'visibility'
AssertionError: expected 4 to be greater than or equal to 12
```

---

## I4 — THE SLIDER, PROVED BY DRAGGING

**Before**, at 390 DPR3 with touch, on two posts:

```
390 DPR3 touch  skip-tracing-real-estate-legal-owner-phone-numbers
  input box 266x4    padding 0px / 0px   box-sizing border-box   touch-action auto
  drag at dy=   0px : 50 -> 4350   GRABBED
  drag at dy=  -8px : 50 -> 4350   GRABBED
  drag at dy= -10px : 50 ->   50   MISSED
  drag at dy= -12px : 50 ->   50   MISSED
  drag at dy=   8px : 50 ->   50   MISSED
  drag at dy=  10px : 50 ->   50   MISSED
  drag at dy=  12px : 50 ->   50   MISSED
  keyboard: 2550 -Right-> 2600 -Left x2-> 2500   STEPS
```

**After**, same probe, same posts, plus four more:

```
390 DPR3 touch  ai-chat-assistant-real-estate-website
  input box 250x44   padding 0px / 0px   box-sizing border-box   touch-action auto
  drag at dy=   0px : 5 -> 175   GRABBED
  drag at dy=  -8px : 5 -> 175   GRABBED
  drag at dy= -10px : 5 -> 175   GRABBED
  drag at dy= -12px : 5 -> 175   GRABBED
  drag at dy=   8px : 5 -> 175   GRABBED
  drag at dy=  10px : 5 -> 175   GRABBED
  drag at dy=  12px : 5 -> 175   GRABBED
  keyboard: 105 -Right-> 110 -Left x2-> 100   STEPS

1440 mouse  skip-tracing-real-estate-legal-owner-phone-numbers
  input box 420x44   padding 0px / 0px   box-sizing border-box   touch-action auto
  drag at dy=   0px : 50 -> 4350   GRABBED
  drag at dy=  -8px : 50 -> 4350   GRABBED
  drag at dy=   8px : 50 -> 4350   GRABBED
  keyboard: 2550 -Right-> 2600 -Left x2-> 2500   STEPS

0 failure(s).
```

Six posts, both widths, mouse and touch, arrow keys stepping before and after.

**THE FIRST FIX WAS WRONG AND ONLY THE PIXELS SAID SO.** `box-content h-1 py-5 bg-clip-content`
does produce a 44px box painted 4px, and it was built and shot first. Clipping a background to a
content box inset 20px vertically reduces only the **vertical** corner radius, so `rounded-full`
leaves 22px horizontally: the round end caps become long elliptical tapers. Measured on the
rendered page, the bar's height near the right end fell to 10px and then 6px where the old track
was a uniform 12.

So the ink and the target are separate elements: an `aria-hidden` span carries the 4px track and
the input sits transparent, 44px tall, centred on it. **Proof that the design did not move: a pixel
diff of the 80px band around the control returns ZERO differing subpixels at 390 DPR3 and ZERO at
1440 DPR2.** The focus ring drops from `offset-4` to `offset-0`, because at offset-4 around a 44px
box it drew a large rectangle around a hairline; it now hugs the target, which is the honest thing
to show a keyboard user.

`components/blog/calculator-tap-target.test.ts` reads the source rather than rendering, because
jsdom has no layout and would report the same box for `h-1` and `h-11`. **Proved against the
known-bad:** restore the old class list and all three assertions fail, the first with
*"range input is 4px tall, below the 24px tap-target floor: expected 4 to be greater than or equal
to 24"*.

---

## I5 — THE VOICE PAGE, AND A CONTRADICTION IT UNCOVERED

SERVICES-CRITIQUE §5, raised 2026-08-03, the last survivor of the ten. The page said *"it logs
every call so the record is there"* and never said whether the thing logged is audio.

**What was written:** the RULE the build has to satisfy whichever way the owner's answer goes. One
`limits` entry and one FAQ. The caller's state governs, not yours; New York is one-party (the
offence is 250.05 and the definition reaching a telephone call is 250.00); California is all-party
under §632; an inbound line taking out-of-state calls has to be built for the stricter rule; and
whether a given build keeps audio or only the transcript is a setup decision to make on purpose.
**Nothing asserts which our build does.** Verified in a browser at 390 and 1440 with the eight FAQ
disclosures expanded: 9/9 assertions including *"no claim about our own retention"*, and the new
question is present in the page's FAQPage JSON-LD.

**And a finding the checker did not have.** The flagship post has been answering this question
since before the rollout began. `ai-posts.ts` states as OUR POSITION that *"the agent says that it
is an assistant and **that the call is recorded**, at the start of the call rather than in a rushed
sentence at the end"*, and `voice-agent-scenes.ts`'s illustrated transcript has the agent saying
*"**I record calls** so nothing gets lost between now and the morning."* So the site already tells
a reader the product records audio, on the article this page links to first, while OWNER-QUESTIONS
§1.3 records the same fact as unknown. Round A's rule — unknown product facts are REPORTED, never
written — was written for the services surface and never swept the five ORIGINAL posts.

**Not changed, deliberately.** Deleting a claim that may simply be true is as much an owner
decision as writing one, and one answer settles both surfaces at once. Written up in
OWNER-QUESTIONS §1.3 with both file references so it can be closed in a sentence.

---

## I6 — THE SECOND PASS

**My own I1 rewrites re-read against the pictures first**, which is where two of these came from.
Every countable claim re-verified at a zoom: ten key columns in blocks of cream and pale green;
DISTRICT twice, HANSARD four times, one blank card; five wreaths on the front elevation and none on
the gable end; the pale cliff along the ridge behind the mailboxes. All held.

**The narrowed check the checker recommended and did not build.** Figures asserted in a NARRATIVE
scene field (plate caption, grid card, statement) that the post's own body never states, with chart
fields excluded on purpose because carrying a figure the prose does not repeat is a chart's whole
job. **14 hits out of 382 narrative strings** — a usable rate. The checker measured the unnarrowed
version at 150 and was right that it should not be built. Twelve of the fourteen are chart captions
naming a sample size and are correct. Two were not:

- `custom-scenes.ts` claimed a step that happens forty times a month in your business *"happens
  forty times a month in **about two hundred businesses nationally**"*. The forty is a hypothetical
  about the reader and reads as one; two hundred businesses nationally was a claim about the world
  with nothing behind it, in a field with no `source` and no `basis`. Removed.
- the booking chart's `basis` said *"1,848 randomly assigned **appointments**"* while the same
  post's `IN_SHORT` said *"1,848 **people**"* and the body said "appointments". The paper
  randomised **people**, 1,859 of them, and analysed 1,848. One study, two units, three surfaces:
  checker finding 3b's defect class, second instance. All three now say what the paper counted.

**Three `ariaLabel`s contradicted alt text I had just corrected — a defect I created in I1.** The
skip-tracing plate still said *"a page of names in a ledger"* of a torn single sheet; the invoicing
plate still said *"adding machine"* of a machine whose registers show it does not print. The custom
plate's *"on the head of a Jacquard loom"* asserted a placement the photograph does not show; it
now matches the source title.

**ROLLOUT-PLAN.md's board section was three rounds stale**, as the checker said. Re-**measured**
rather than re-asserted before correcting: the sitemap serves 66 URLs, 21 blog and 20 services,
with **0** of the ten consumer stubs in it, and `/blog/packing-101-pro-tips-organized-move` returns
`robots: noindex, follow`. It also still described the ratchet as Round I's brief; that is now
recorded as the next round's.

---

## TWO CLEAN BILLS, so nobody re-runs them

- **All 36 plate `credit` lines match `ATTRIBUTIONS.md` on BOTH photographer and licence**, checked
  by parsing the ledger rather than by reading it.
- **No editorial photograph renders twice on any one page.** Nine `<img>` per flagship page, eight
  distinct, and the repeat is the site logo in the header and the footer. Cover images are unique
  across the twenty posts; where a cover shares a file with a plate it is deliberate and the ledger
  says so ("SPENT: plate two **and cover** of…").

---

## GATES, verbatim

```
$ npx tsc --noEmit
TypeScript: No errors found
exit=0

$ npm test
 Test Files  95 passed (95)
      Tests  1333 passed (1333)
   Duration  14.48s
npm test exit=0            (baseline was 1321; +12, and it only goes up)

$ node scripts/flagship-standard.mjs http://localhost:3100
all 20 posts meet the standard.
exit=0                     (standard.json NOT ratcheted, per the recorded decision)

$ node scripts/check-svg-crop.mjs http://localhost:3100
468 text node(s) checked, 0 cropped.
exit=0

$ node scripts/_scratch-i-slider.mjs http://localhost:3100
0 failure(s).
exit=0

$ node scripts/_scratch-i-verify.mjs http://localhost:3100
(no failures)
48 assertions, 0 failed.
exit=0
```

`score-flagship.mjs` on everything touched: **the only two red checks anywhere are C3 (a film,
owner-held) and D5 (a revision date later than the publish date, which cannot be true on the day a
post ships)**. Both are the recorded, never-faked reds. `ai-chat` and `ai-voice` print
"Mechanically ready"; the rest print "NOT READY: 2 mechanical check(s) failed" with those two named.

Zero horizontal overflow and zero console or page errors at **320, 390 and 1440** on four posts
scrolled to the foot, plus the 48-assertion probe at 1440 DPR1 and 390 DPR3 on six surfaces.
`**/api/lead` intercepted in every context; `**/api/media/**` and `media.mlsgrid.com` aborted in
every context; no MLS or media call made from any probe.

**Every instrument was proved against a known-bad before it was believed:**

| instrument | known-good | known-bad |
|---|---|---|
| the 48-assertion browser probe | 48/0 on the fixed site | inject one false assertion: **FAIL, exit 1** |
| `related.test.ts` | 9 pass | run against the old one-liner: **3 fail** |
| `calculator-tap-target.test.ts` | 3 pass | restore the old class list: **3 fail** |
| the slider drag probe | GRABBED at every offset after | MISSED at ±10px before |
| the 16:9 superset premise | all 36 sources measured ≤1.778 | (re-derived, not inherited) |

---

## ONE THING I COULD NOT CLOSE

**A single page error, once, in ten observations.** The gate capture run reported
`PAGEERROR SyntaxError: Invalid or unexpected token` on `/services/ai-chat-assistant` at 1440. It
did not recur in nine subsequent loads (four full probe runs and three direct loads with the stack
captured). I did not leave it at "flaky":

- every inline `<script>` on that page and on two others was fetched from the dev server and
  **parsed** with `vm.Script` — 105, 115 and 189 blocks, **0 parse failures**;
- all four `application/ld+json` blocks per page parse as **JSON**;
- every same-origin external script fetches 200 and parses.

So it is not in our bytes. The page loads Google Tag Manager and the chat launcher from outside,
and the run in question happened seconds after a batch of file writes while the dev server was
recompiling — the corrupt-chunk failure CLAUDE.md warns about. **Recorded rather than dismissed:
the Vercel build is authoritative and the orchestrator should watch for it there.**

---

## WHAT I DELIBERATELY DID NOT DO

- **The `/ai` surface (checker finding 1, its worst).** Out of scope by instruction and by repo:
  `realtylt-ai-page` is another session's, the fix has been written since Round A, and what is owed
  here is the owner's deploy decision. The checker's third option — widening
  `zombie-claims.test.ts` to fetch `${AI_PAGE_URL}/` and `/llms.txt` — is the one I would take if
  it were mine, and it would have caught this. **It is still the biggest thing between this domain
  and launch.**
- **`ai-clone`'s vendor comparison** ("A HeyGen-class video avatar plus an ElevenLabs-class voice
  clone"). Round H declined it, the checker raised the stakes, and I agree with both: it is a
  comparative advertising claim about a competitor's product quality made without a measurement.
  Owner's call, because the avatar is his.
- **`standard.json`.** Not ratcheted. The decision is recorded in ROLLOUT-PLAN.md and `proseWords`
  must never be raised. The other four are a separate, deliberate round and I wrote that down where
  the stale text used to claim it was this one's job.
- **The voice post's "the call is recorded".** Reported in OWNER-QUESTIONS §1.3, not edited.
- **`SERVICES-CRITIQUE.md`.** Left as the snapshot it says it is ("Read, not edited"); closure is
  recorded here and in ROLLOUT-PLAN.md.
- **The `14 Willow Street` hypothetical** the checker suggested softening. It is explicitly framed
  as something an assistant cannot answer, not as a listing, and changing it would be taste rather
  than accuracy.
- **The `text-[10px]` speaker labels** on the service transcript figure. The checker itself said
  "worth a look rather than a fix", and it is chrome rather than body copy.
- **The house-voice question the checker raised against its own verdict** — whether twenty posts in
  one voice is a strength or the reason nobody finishes the second one. That is a reading job, not
  a repair job, and it is the most interesting thing left in the report.

---

## FOR WHOEVER TAKES THE NEXT ROUND

1. **The `/ai` deploy.** Owner decision, and it is item zero.
2. **The ratchet**, on `citations`, `faqQuestions`, `dataGraphics` and `bodyImages` only, at the
   START of the round that closes them. Never `proseWords`.
3. **`ai-clone`'s vendor comparison.** Owner decision.
4. **OWNER-QUESTIONS §1.3.** One answer closes the voice service page and settles whether two
   sentences on the flagship post are true.
5. **The narrowed narrative-figure check is worth committing** as a gate. It runs in six lines over
   the scene files, returns 14 of 382 on the shipped cohort, and 2 of the 14 were real defects that
   three rounds and a checker had missed. The unnarrowed version returns 150 and must not be built.
6. **A tap-target sweep beyond the slider.** Nothing else in the flagship template is dragged, but
   nobody has measured the rest of the site the way I2 measured this one, and the lesson generalises:
   `check-svg-crop` reads text inside SVG and `score-flagship` asks whether a thing is present. The
   defect class both are blind to is **whether a present thing is usable**.
