# Source audit — every number, date and citation in the five flagships

**Done 2026-08-03.** Owner's question: *"are we telling the proper storys with proper and true data?"*

Every external citation in the five AI-service posts was opened in its **primary document** — the
statute, the paper, the vendor's own doc — and the operative sentence was read and compared word for
word against what the post prints. Not a summary, not an aggregator, not a page that cites a page.

**Answer: yes, with six corrections, one of which was a factual error visible to readers.**

This file exists so the next round does not repeat the work. Re-run the extractor with
`node scripts/_scratch-claims.mjs` (it reads the prose AND the scene payloads, because a statistic
inside a `StatBars` object never appears in the markdown and is exactly the kind of number that
stops being checked).

---

## What was wrong, and what changed

### 1. FACTUAL ERROR — the chat post's odds chart named the wrong sample

`RESPONSE_CURVE.sourceText` said the HBR study covered **"about 1.25 million leads across 29
companies"**. The article says:

> "a separate study, which involved 1.25 million sales leads received by **29 B2C and 13 B2B
> companies** in the U.S."

Twenty-nine and thirteen. Forty-two, not twenty-nine. Fixed.

This was only findable because the article is paywalled on hbr.org and somebody had to go get the
actual two-page text. **That is the whole reason the primary-document rule exists.**

### 2. The chart's middle bar is our arithmetic, and no reader could tell

The paper publishes **two** ratios, not three: contact within an hour is "nearly seven times" as
likely to qualify a lead as contact an hour later, and "more than 60 times" as likely as waiting a
day. Our middle bar, 8.6x, is 60 divided by 7. That is a legitimate reading, but it was written down
only in a source-file comment, where no reader could ever see it.

It now reads **"about 8.6x"** on the bar and the note says out loud that the paper publishes two
ratios and the middle bar is those two divided. The eye meets the approximation before the footnote
does.

Also worth carrying: **60x is a floor, not a point estimate.** The paper says "more than 60 times".
Indexing the 24-hour case at 1x and drawing 60 is the conservative reading.

### 3. Wrong attribution

The chart credited "Dr James Oldroyd's study". The separate lead study is the article's own — "a
phenomenon **we** explored in a separate study" — so it now carries all three authors, the same way
the voice post's chart already did.

### 4. The FCC date was the release date, presented as the decision date

The post said "On February 8, 2024 the Federal Communications Commission ruled". The document's own
cover page says **Adopted: February 2, 2024 / Released: February 8, 2024**. Both dates are now in the
sentence. Everything else about that claim survived: the ruling does confirm AI-generated voices are
"artificial or prerecorded" for TCPA purposes and that prior express consent is required.

### 5. "Among the ones that did" quietly dropped the audit's window

HBR's sentence is "The average response time, **among companies that responded within 30 days**, was
42 hours." The window is informative — it tells the reader the audit did not run forever — and it
costs four words to keep. Now reads "among the ones that answered inside the thirty day window".

### 6. Two NAR charts printed a BUYER sample size under a SELLER chart

The methodology page says the survey was mailed to 167,750 recent **buyers** and got 5,390 responses,
and then:

> "Information about sellers comes from those buyers who also sold a home."

So the seller sub-sample behind Exhibit 6-23 and Exhibit 7-1 is **smaller than 5,390**, and printing
the buyer figure alone overstates the base. Both source lines now say so. This is the sort of
citation that is accurate and still misleading, which is the hardest kind to catch.

Same pass restored a nuance in our favour: NAR's largest category is worded **"Referred by (or is) a
friend, neighbor or relative"**. The bar label drops the "(or is)" because it will not fit, but the
category counts the agent who WAS the friend, which is a stronger version of the reactivation post's
point, not a weaker one. It is now in the chart's basis line.

Also named Exhibit 1-16 for the buyer-timing figures, which was the only NAR citation in the set not
carrying its exhibit number.

---

## The full ledger — 19 citations, all read in the primary

| # | post | claim as printed | primary document | verdict |
|---|---|---|---|---|
| 1 | chat | INP "200 milliseconds or less", LCP "within 2.5 seconds" | web.dev/articles/vitals | **exact**, both quotes verbatim |
| 2 | chat | Cal. Bus. & Prof. Code 17941, four quoted fragments | leginfo, BPC 17941 | **exact**, all four |
| 3 | chat | the 10,000,000-visitor threshold belongs to "online platform" in 17940(c), a term 17941 does not use | leginfo, BPC 17940 + 17941 | **correct** — 17941 says "online", never "online platform" |
| 4 | chat | SB 1001, Stats. 2018 Ch. 892, in force since 2019 | statute footer | **exact** (effective Jan 1 2019, operative Jul 1 2019) |
| 5 | chat | WCAG "No Keyboard Trap", Level A, quoted fragment | w3.org/TR/WCAG22 | **exact** — SC 2.1.2, Level A |
| 6 | chat | audit of 2,241 US companies, 42 hours | HBR (full text) | **correct**, window clarified — see 5 above |
| 7 | chat | 60x / 8.6x / 1x, 1.25m leads | HBR (full text) | **two faults fixed** — see 1, 2, 3 |
| 8 | voice | 37% / 16% / 24% / 23% of 2,241 | HBR (full text) | **exact**, all four |
| 9 | voice | FCC ruling, AI voices are "artificial" under the TCPA | FCC-24-17A1.pdf | **correct**, date fixed |
| 10 | voice | NY Penal Law 250.00, "without the consent of at least one party thereto, by a person not present thereat" | nysenate.gov | **exact** |
| 11 | voice | Cal. Penal Code 632, all-party consent for a confidential communication | leginfo | **exact** |
| 12 | voice | AB 2905, chaptered September 2024, "artificial voice" defined | leginfo bill text | **exact** — chaptered 09/23/2024; "(3) Inform the person called if the prerecorded message uses an artificial voice"; "generated or significantly altered using artificial intelligence" |
| 13 | reactivation | 47 CFR 64.1200(f)(5), the eighteen-month / three-month EBR quote | **eCFR**, current text | **exact, including the paragraph number** — and the quote really does say "telephone call", not "telephone solicitation" |
| 14 | reactivation | 47 U.S.C. 227(b)(3), "$500 in damages for each such violation, whichever is greater" | law.cornell.edu | **exact, and it is the right one of two** — 227(c)(5) says "up to $500"; (b)(3) does not |
| 15 | reactivation | Twilio, "under 1% is considered healthy; over 3% may lead to carrier filtering" | Twilio docs | **exact** |
| 16 | reactivation | NAR Exhibit 7-1: 38 / 28 / 4 / 4 / 4, remainder 3 or less | NAR PDF p.118 | **exact**, basis corrected |
| 17 | qualification | NAR Exhibit 6-23: 15 / 42 / 43 | NAR PDF p.114 | **exact**, basis corrected |
| 18 | qualification | 42 U.S.C. 3604, two quoted fragments; Article 10 covers two classes the statute does not | law.cornell.edu + nar.realtor | **exact, and the comparison is right** — 3604 lists race, color, religion, sex, handicap, familial status, national origin; Article 10 adds sexual orientation and gender identity |
| 19 | qualification | HUD FHEO, "Monitor outcomes of advertising campaigns for housing-related ads, to the extent possible, to identify and mitigate discriminatory outcomes" | archives.hud.gov PDF | **exact**, dated April 29 2024, and the post says "April 2024" |
| 20 | workflow | Mark, Gonzalez, Harris CHI 2005: 11 min 4 sec, 25 min 26 sec, 57%, 77.2%, 700 hours, 24 workers | ics.uci.edu CHI2005.pdf | **exact, every one** |
| 21 | workflow | Zapier pauses a Zap at "an error 95% or more percent of the times that it has run in the last 7 days" | Zapier help | **exact** |
| 22 | workflow | a repeatedly-erroring Zap "will automatically turn off" | Zapier run-status ref | **exact** |
| 23 | workflow | n8n's error workflow starts with an Error Trigger, one setting per chain | docs.n8n.io | **exact** |

(Twenty-three rows against nineteen distinct URLs: several documents carry more than one checked
claim.)

### The workflow paper's setting, for the record

CHI 2005 was run at "ITS", an **outsourcing company providing information technology and accounting
services for major financial bond management companies** — 7 managers, 9 analysts, 8 developers,
observed over a thirteen-month period in two phases. Our note calls it "one technology company",
which is a fair gloss and not a precise one. Left as is; the note already does the important work by
saying not one of them sold a house. The paper's own limitation is worth knowing: "As we observed
only one organization, we can only generalize our results to companies with similar characteristics."

---

## Link liveness

All 19 URLs checked with a real user agent. **18 return 200.**

**`nysenate.gov` returns 403 intermittently** — measured 200 / 403 / 200 on three consecutive
retries, and a headless Chrome gets Cloudflare's "Just a moment..." interstitial every time. The page
is live and carries the exact statutory text; this is bot protection, not rot. **Do not "fix" it by
swapping in FindLaw or a law-blog summary** — nysenate.gov is the official source and the standard is
primary documents. If an automated link checker ever fails on it, this is why.

---

## The numbers that are OURS, and are labelled as ours

Not every number on these pages is sourced, and that is fine as long as the page says so. These are
the ones we assert, each already labelled on screen:

- **The chat calculator's reply curve** (an immediate reply wins ~9 conversations in 10, a few hours
  about half, next day about a fifth). The note says it is "a judgement and not a measurement",
  shaped by the research rather than derived from it, and explicitly not from the 78%.
- **The 5% close rate**, in both the chat and voice calculators. Labelled as ours and deliberately
  low.
- **The reactivation calculator refuses to assert any rate at all**, because no independent study of
  cold database SMS exists. Every multiplier there is the reader's own guess and is labelled as one.

## The zombie stat, still refused — and it was still on the page when this was written

**"78% of leads close with whoever responds first."** No published report, no stated sample, no
methodology; every citation leads to another article citing a third. The chat post says so in the
prose and the calculator's note names it as the figure the model is deliberately NOT built on. Do not
let it back in.

**It had not actually left.** Found 2026-08-03, live on production, in the `response-gap` scene:
a full-bleed black band about nine hundred pixels below the section that proves the figure cannot be
sourced, printing *"Roughly 78% of leads close with whoever responds first"* in twenty point type.
The retraction had reached three surfaces on three different days and missed the fourth.

**Why it survived two audits, which is worth more than the fix.** `scripts/_scratch-claims.mjs`
reads the prose AND the scene payloads, because a statistic inside a `StatBars` object never appears
in the markdown. A bespoke component's copy is in *neither*: it is a string literal inside a `.tsx`
file. The chat post is the only post in the cohort with bespoke components, which is exactly why it
is the only one where a retracted claim could keep talking. The component's own docstring said "the
scene invents no performance claim", which had been true when it was written.

`lib/blog/zombie-claims.test.ts` now guards it. It reads every file where visible scene copy can
live — the five content files and every `.tsx` under `components/blog/scenes` — and fails on any of
the three figures below unless the same passage disowns them. It was proved red by putting the old
line back before it was trusted green.

Two others this repo has already killed and should not relearn: **"23 minutes 15 seconds"** (the real
CHI 2005 figure is 25 min 26 sec) and **"$16,000 per text"** (a real number, from the FTC's civil
penalties, not from the TCPA claim an individual can bring — the TCPA number is $500).
