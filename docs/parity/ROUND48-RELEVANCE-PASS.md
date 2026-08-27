# Round 48, 2026-08-27: the checker's round-47 list, then the last five topics

Two parts in one run, one agent, no subagents. Built on `bcdc3b7`.

- **Part 1** closes the fresh checker's list on round 47.
- **Part 2** is the FINAL batch of the owner's full-text relevance, story, truth and slop pass:
  the last five topics in `content/blog/posts.ts` order, both surfaces each, ten in total.

**All twenty-one topics are now done.** Beat B is closed.

---

## The law this round was run under, and the fact that it bit twice

Round 47 wrote the rule: *a retraction is not done until the SIBLINGS are swept*, because the same
claim tends to live in the topic's scene file, its service page and its `posts.ts` dek.

It bit this round in both directions, and both are worth recording.

**It caught things.** The revocation rule (topic 18), the first-to-contact-wins claim (topic 19),
the same-day condition on 25 min 26 sec (topic 20) and the chat post's own dek (topic 21) were all
found by sweeping siblings rather than by reading the surface that carried them.

**And it caught me.** Part 1 item 1 retracted "had already paid" from `booking-scenes.ts:399`, and
my sweep was keyed to the checker's phrasing (`already paid|had paid|paid for the appointment`).
Thirty lines above it, in the SAME FILE, `REMINDERS.note` said *"paid health check-ups, and a
population that had already chosen to spend money on the appointment"*, which is the same invented
fact stated more strongly. It survived because it used different words. It was found later, during
topic 19, by a grep for something else entirely.

**The lesson, sharpened:** sweep for the CLAIM, not for the sentence. A retraction keyed to the
phrasing of the sentence you are removing will miss the paraphrase, and the paraphrase is usually
in the file you already had open.

---

## Part 1: the checker's defect list

| # | severity | what it was | what it is now | commit |
| --- | --- | --- | --- | --- |
| 1 | HIGH | `booking-scenes.ts:399` said participants "had already paid" for a health check-up | "made a reservation for a routine health check-up", matching the post prose and the paper | `34e08fe` |
| 1b | HIGH | **a third sibling the checker did not list and Part 1 missed**: `booking-scenes.ts:143` | see above | `0670d88` |
| 2 | HIGH | `local-seo-scenes.ts:176` said a service area "is capped at roughly two hours" | carries the guideline's own exception | `34e08fe` |
| 3 | MEDIUM | `geo-pages-scenes.ts:44` summarised both fair-housing prohibitions without the nexus | nexus restored, verbatim per 24 CFR 100.70(c)(2) | `34e08fe` |
| 4 | LOW-MED | the MAST Figure 4 caption misquoted as "failure in MAD" in three files | "MAST-Data" in all three, with provenance | `34e08fe` |
| 5 | LOW | `crm-sync-scenes.ts:311` heading still read "one record that is true" | "one record both systems agree on" | `34e08fe` |
| 6 | INFO | ROUND47's BrightLocal note blamed the site for an empty response | corrected: it is this box's curl/schannel stack | `34e08fe` |
| 7 | INFO | `masft_bar.pdf` located as "the per-system chart in section 6" | Figure 4, page 8, included from `06_discussions.tex` | `34e08fe` |

### 1. The Hangzhou payment claim, and why it took two passes

`PMC2170466` contains **zero** instances of pay or paid. The single hit for `fee` is NCBI footer
chrome ("NCBI RSS feed"). What the paper actually says is that the participants *"were all
requested to provide both active mobile telephone numbers and telephone numbers when they made a
reservation"*.

Both scene surfaces now say that. The second one, item 1b, is written up in the section above
because the miss is more instructive than the fix.

### 3. The fair housing nexus

Re-read today on **eCFR and on Cornell**, which agree word for word. 24 CFR 100.70(c)(2):

> Discouraging the purchase or rental of a dwelling **because of race, color, religion, sex,
> handicap, familial status, or national origin**, by exaggerating drawbacks or failing to inform
> any person of desirable features of a dwelling or of a community, neighborhood, or development.

`IN_SHORT[2]` is the first regulation statement a reader meets on that page and it carried neither
prohibition's nexus. It now closes: *"Both prohibitions hang on the same clause: because of race,
colour, religion, sex, handicap, familial status or national origin."* The article's argument
survives it in the stronger form the post already uses: an uneven set is the record a reason gets
read off, not the offence.

### 4 and 7. The MAST caption, settled against the PDF

`pdftotext -layout` on the v3 PDF, line 507:

> Figure 4: Distribution of failure in **MAST-Data** with MAST labels on total 210 traces.

The `\dataset{}` macro renders **MAST-Data**; "MAD" survives only inside macro names in the `.tex`
source, which is where three of this repo's records picked it up. Fixed in
`agent-workforce-scenes.ts`, `ROUND46-RELEVANCE-PASS.md` and `ROUND47-RELEVANCE-PASS.md`. The
figure is **Figure 4 on page 8**, included from `06_discussions.tex`, which is why it renders under
section 5's heading and why earlier notes called it "section 6".

### 6. The BrightLocal route note, corrected

Round 47 recorded that `brightlocal.com` "returns an empty response to a direct programmatic
request, with no status line at all" and blamed the site. **That was an instrument error.** Node's
built-in `fetch` returns a clean **HTTP 200**, `text/html; charset=utf-8`, 709,270 bytes. The empty
response is this box's `curl`/schannel stack with AVG in the middle of it. The next checker should
use node `fetch`, not curl and not a text-extraction proxy. Round 47's *reading* of the article was
correct; only its explanation of the route was wrong.

---

## Part 2: ten surfaces, four axes

The standard is the AI Chat Assistant post. **Every citation below was fetched from the primary
source during this run**, and the ones that needed an unusual route say which.

### Topic 17, lead qualification — commit `7b233f7`

**`ai-lead-qualification-real-estate-scoring` — FIXED.** Two claims.

1. TRUTH. *"The National Association of REALTORS asks recent sellers how urgent their sale was.
   Not how urgent it felt to their agent. How urgent it was."* The survey measures what sellers
   **said**, looking back at a sale that had already happened. The graphic three lines below is
   captioned *"How urgent recent sellers **said** their sale was"*, so the prose contradicted its
   own chart on the same screen. Now "How urgent they said it was."
2. TRUTH. *"Every scoring system in this business measures the same three things, because they are
   the three that predict."* A universal about a market nobody here has surveyed, plus an
   unsourced predictive claim. Same shape round 45 removed from `/services/custom-automation` and
   round 47 from `/services/local-seo`. The contrast the paragraph exists for is untouched.

Re-verified live, all correct: NAR 2025 Generational Trends, downloaded and read with `pdftotext`.
Exhibit 6-23 all sellers 15 / 42 / 43 with the three labels in that order; Exhibit 1-16 all buyers
43% *"It was just the right time, was ready to buy a home"* and 23% *"Did not have much choice, had
to purchase"* (the two 43s are a genuine coincidence across two different exhibits, checked
because it looks like an error); Exhibit 3-3 medians of 10 weeks searched, 2 weeks searched before
contacting an agent, 7 homes viewed; and the methodology paragraph in full, including *"Information
about sellers comes from those buyers who also sold a home"*. Also 42 U.S.C. 3604 (both quoted
clauses), Article 10 of the 2025 Code of Ethics word for word, and all three HUD FHEO quotes from
the April 29 2024 digital-advertising guidance, including that *"denying consumers information
about housing opportunities"* is the **first** item in its list.

**`/services/lead-qualification` — PASS, untouched.** The fair housing rule, the statute and the
Article 10 reading are all already correct on it, and `useCases[2]` names area routing as the
classic proxy without being asked to.

### Topic 18, database reactivation — commit `35ab5bd`

**`database-reactivation-old-real-estate-leads` — FIXED.** Three.

3. TRUTH. **The sixteen thousand dollar figure.** The post said *"That number is real but it
   belongs to a different statute, the Federal Trade Commission's civil penalties"*. Present tense,
   about a ceiling replaced a decade ago. The 2016-06-30 Federal Register adjustment (doc
   2016-15302) reads *"Section 5(m)(1)(A) of the FTC Act, 15 U.S.C. 45(m)(1)(A) (unfair or
   deceptive acts or practices)--Increase from $16,000 to $40,000"*, effective 1 August 2016, and
   **16 CFR 1.98** now puts it at **$53,088** for penalties assessed after 17 January 2025. So the
   post was using a stale number, three times too small, to make the TCPA's five hundred look like
   the bigger worry. Both citations are now in the sentence.
4. TRUTH. **The revocation rule.** *"If somebody replies with different words, you have to treat
   that as an opt-out too."* Full stop. The regulation conditions it: the caller must treat it as
   valid *"if a reasonable person would understand those words to have conveyed a request to revoke
   consent"*. `reactivation-scenes.ts:149` already carried the condition (*"and so is anything else
   a person reasonably says"*), so this was drift between two siblings.
5. TRUTH. *"Three hundred conversations to find four people whose life has changed."* That is a
   conversion rate on a cold database, and two screens later the same post says *"Anybody quoting
   you a conversion rate on a cold database before they have seen the database is quoting you a
   number they made up."* Now "hundreds ... to find the handful", on both surfaces.

Everything else verified live and correct: NAR Exhibit 7-1 (38 / 28 / 4 / 4 / 4, the remaining
options all 3 or less, and NAR's own wording *"Referred by (or is) a friend, neighbor or
relative"*); 47 CFR 64.1200 read on eCFR, with (f)(5)'s eighteen-and-three-month clause, (a)(2)'s
*"an automatic telephone dialing system or an artificial or prerecorded voice"*, the whole
prior-express-written-consent definition including the not-a-condition-of-purchase disclosure and
the electronic signature, (a)(10)'s *"by using any reasonable method"*, the seven keywords as a
*"reasonable means per se"*, the exclusive-means prohibition, and *"must be honored within a
reasonable time not to exceed ten business days from receipt"*, all verbatim; 47 U.S.C. 227(b)(3)'s
*"or to receive $500 in damages for each such violation, whichever is greater"* and the trebling
for a *"willfully or knowingly"* violation; and Twilio's health-score page, *"A rate under 1% is
considered healthy; over 3% may lead to carrier filtering"*, word for word.

**`/services/database-reactivation` — FIXED.** Four.

6. The same unqualified revocation rule in `faqs[3]` (*"in whatever words the person used"*).
7. TRUTH. The figure footnote promised *"Reactivation is the cheapest appointment you will book
   this month"*, an unmeasured superlative about the reader's month, on the page whose `why` was
   rewritten in round B precisely to stop making that comparison. Now says what the page can
   support: the cost is the asking rather than the acquisition.
8. `useCases[2]` said reactivation *"fills a calendar"*, which `limits[0]` denies.
9. The three-hundred-to-four rate in `whatItIs[2]`.

### Topic 19, AI voice agents — commit `0670d88`

**`ai-voice-agent-missed-calls-real-estate` — FIXED.** Two, both about how a claim is framed rather
than about a number.

10. TRUTH. The turn-gap note said the paper *"found that people answer faster when the person
    asking is looking at them"*. PNAS reports it in **nine of ten** languages, reaching
    significance in **five**. The note exists to limit this page's own chart, which is exactly why
    it should not overstate.
11. *"Nobody has published a study of how fast real estate agents answer their phones"* is a
    universal negative about a whole literature, and the round-47 memory says a search that cannot
    find a thing has not shown it is absent. Now a statement about our own search, which is the
    form this repo already uses at *"Nobody has published an honest decay rate, and we went and
    looked"*.

Every figure verified in the primary and every one held:

- **HBR, "The Short Life of Online Sales Leads" (2011)**, Oldroyd, McElheran and Elkington. hbr.org
  now serves a wall, so this was read from a **2018 Wayback capture** of the article itself:
  *"We audited 2,241 U.S. companies"*, 37 / 16 / 24 / 23, *"The average response time, among
  companies that responded within 30 days, was 42 hours"*, *"1.25 million sales leads received by
  29 B2C and 13 B2B companies"*, and *"nearly seven times as likely to qualify the lead (which we
  defined as having a meaningful conversation with a key decision maker) ... and more than 60 times
  as likely as companies that waited 24 hours or longer"*.
- **Stivers et al, PNAS 2009.** PMC, pnas.org and Europe PMC all block a programmatic fetch; the
  PDF came from the **Max Planck repository** via unpaywall (`pure.mpg.de` item 66202). Mean
  response offset **+208 ms** for the full dataset, cross-linguistic median **+100 ms**, Danish
  **+469 ms**, Japanese **+7 ms**, per-language mode between 0 and +200 with an overall mode of 0,
  *"10 languages from 5 continents"*, *"each with 2-6 consenting participants"*, 67% of questions
  polar, and *"Speakers become hypersensitive to perturbations in timing of responses, measured in
  100 ms or less"*. All quoted correctly.
- **FCC 24-17**, Adopted February 2 2024, Released February 8 2024 (the post's "six days later"),
  *"we confirm that the TCPA's restrictions on the use of 'artificial or prerecorded voice'
  encompass current AI technologies"*.
- **NY Penal Law 250.05 and 250.00**, both quotes verbatim (250.00 confirmed on nysenate.gov and
  both on a second source, because nysenate 403s on 250.05).
- **California Penal Code 632(a)** *"without the consent of all parties to a confidential
  communication"*, and **AB 2905**, chapter 316, approved and filed **September 20 2024**, whose
  digest is *"This bill would require the announcement to also inform the person called if the
  prerecorded message uses an artificial voice, as defined"* and whose definition is *"a voice that
  is generated or significantly altered using artificial intelligence"*.

**`/services/ai-voice-agents` — FIXED.** One claim in two places.

12. TRUTH. `howItWorks[1]` said *"the person who reaches the lead first usually gets the
    appointment"* and `useCases[1]` said *"The appointment goes to whoever got there first"*. That
    is **"Most jobs go to whoever books first"**, which round C removed from
    `/services/ai-appointment-booking`; the retraction never reached this page. It also overshoots
    the study this page leans on, which measures reaching a real conversation rather than winning
    the job.

### Topic 20, workflow automation — commit `1b5e823`

**`workflow-automation-real-estate-business` — FIXED.** Three.

13. TRUTH. **The 25 min 26 sec figure is conditional.** The paper says *"When people did resume
    work on the same day, it took an average length of time of 25 min. 26 sec"*, and only 77.2% of
    interrupted work was resumed the same day. Four visitor surfaces stated it unconditionally: the
    post prose, `IN_SHORT[0]`, the chart's `basis` line and `/services/workflow-automation`. The
    scene docstring had the condition right the whole time, which is what made it findable.
14. TRUTH. The "it only takes a minute" card said a minute forty times a month *"is an afternoon,
    which is a listing appointment you did not go on"*. Forty minutes is not an afternoon, and a
    reader who multiplies gets that in one step. It now calls forty minutes the floor and escalates
    with the interruption cost, which is what the paragraph always meant. The site's committed
    "an afternoon a month" claim lives in `limits` on both surfaces and is untouched, because it is
    a claim about the total saving rather than an arithmetic step.
15. *"still the clearest measurement anybody has published"* is a superlative about an unsurveyed
    literature. Now about our own search, matching the voice post's fix this round.

Everything else verified in the primary, and two figures that looked wrong turned out to be the
paper's own words. **Mark, Gonzalez and Harris, CHI 2005**, read from `ics.uci.edu/~gmark/CHI2005.pdf`:

- *"Over 700 formal hours of observation were done"* is the paper's sentence, even though 24 people
  at 25 h 42 min each is about 617. Recorded because the arithmetic invites a "correction" that
  would be wrong.
- *"Each informant was then formally observed and timed for a period of three and a half days. The
  first half-day was general observation"*, with the 25 h 42 min average stated of the three days
  of formal timing.
- 7 managers, 9 analysts, 8 developers; *"11 min. 4 sec."* before switching; *"57% of their working
  spheres are interrupted"*; 25 min 26 sec; *"61 min. 37 sec."* externally resumed against
  *"21 min. 28 sec."* self-resumed; 90.1 / 9.9; 77.2 percent same day.

Zapier's two help pages and n8n's error-handling docs were re-read on the live pages and both
quotes are verbatim, including *"automatically pauses a Zap if it hits an error 95% or more percent
of the times that it has run in the last 7 days"* and *"it will automatically turn off"*.

**`/services/workflow-automation` — FIXED.** One, the same-day condition in `whatItIs[2]`. Nothing
else on that page needed touching; its `limits` are among the most honest on the services surface.

### Topic 21, the AI Chat Assistant — commit `600d71f`

The declared standard, judged at full text with the bar for touching it set high. **It held.**
Three changes, none of them to its argument, and its score did not move.

16. SLOP, and it is the one that matters most. **`with akeyboard`.** A rendered typo in a bold
    section lead, serving in the HTML today, on the post that is the standard for the other twenty.
17. TRUTH. The `posts.ts` **excerpt** opened *"Most home searching happens at night, on a phone,
    and most real estate websites answer the next morning."* Two magnitude claims the article never
    makes and cannot support, in the dek of the post whose second section exists to argue that a
    number nobody can check is a slogan wearing a percentage sign. Replaced with the article's own
    opening. **This is the sibling-sweep law working exactly as round 47 wrote it:** the 78% was
    cleared from body, scenes and service page and the dek's own unsourced pair was never looked
    at, because it made a *different* claim.
18. The same pair swept off `/services/ai-chat-assistant`: `useCases[0]` asserted *"Most home
    searching happens at night on a phone"*, and the response-speed FAQ ended by asserting *"Most
    real estate websites answer in hours or never"* one sentence after correctly warning that the
    study behind it is cross-industry and only its shape carries.

Every citation re-fetched and verbatim: **BPC 17941** (the whole prohibition, the one-sentence safe
harbour *"A person using a bot shall not be liable under this section if the person discloses that
it is a bot"*, and *"clear, conspicuous, and reasonably designed to inform"*); **BPC 17940**'s
definitions of bot, online and online platform, including the 10,000,000 unique monthly United
States visitors that the post correctly notes attaches to *platform* and not to the 17941
prohibition; **BPC 17943**'s July 1 2019 operative date; both **Core Web Vitals** thresholds from
web.dev word for word, including Google's own *"pages should have a INP of 200 milliseconds or
less"* with its grammar preserved; and **WCAG 2.2 No Keyboard Trap** at level A, *"then focus can
be moved away from that component using only a keyboard interface"*, read from the **W3C's own
source repository** because w3.org now serves a Cloudflare wall.

`RESPONSE_CURVE` also re-checked: 60x / about 8.6x / 1x, with the note already saying on screen
that the middle bar is the paper's two ratios divided rather than a third figure they measured.
That is the right disclosure and it stays.

---

## For the owner: one more /ai COPY line, flagged rather than rewritten

`/services/ai-voice-agents`'s `why` opens *"A missed call is a lost commission."* Its own flagship's
fourth paragraph says *"it is not really a lost lead. It is a lost conversation."* The post is
making a finer point about the accounting rather than denying that business is lost, so this is
weaker than round 47's `/services/local-seo` flag, but it is the same class: a promise in `/ai`
COPY that the article underneath declines to make.

Escalated rather than rewritten, alongside the invoicing, scheduling, agent-workforce and local-SEO
ledes rounds 45 to 47 raised. Rounds 45, 46 and 47 all escalated `/ai` COPY rather than diverging
it, and round 48 keeps that discipline.

## Tried and reverted

- **Softening the chat post's `SELF_CHECKS` line** *"on a phone rather than on your desktop,
  because that is where your traffic is"*. It generalises about the reader's traffic, but it is in
  the advice register the flagship is written in, and round 47 already declined the same class of
  change on `/services/review-automation`'s `useCases[3]` for the same reason. The brief also set a
  high bar for touching this post. Noted rather than changed.
- **Rewriting `/services/database-reactivation`'s "close to free compared with every other source
  in your budget" and "the cheapest pipeline is the one you already own".** Both are statements
  about a cost basis the page can defend (a list you already own costs nothing to own), unlike the
  footnote's per-appointment superlative, which was changed. Restraint here rather than a page-wide
  restyle.
- **Bracketing the lowercase "it" in the qualification post's Exhibit 1-16 quote.** NAR prints *"It
  was just the right time"*; the post lowercases the first letter mid-sentence, which is standard
  quoting practice and not a misquote of substance. Left.
- **"Correcting" the CHI 2005 "over 700 hours" figure**, which 24 x 25h42m does not produce. It is
  the paper's own sentence. Verified rather than assumed, and recorded above so the next checker
  does not spend the same twenty minutes.

## Gates

| gate | baseline | this round |
| --- | --- | --- |
| `npx tsc --noEmit` | clean | **clean**, run after every topic |
| `npm test` (foreground) | 99 files / 1384 tests | **99 files / 1384 tests, 0 failures** |
| `scripts/toc-align-probe.mjs` | 21/21 | **21/21 posts centred and clear of the launcher** |
| `scripts/score-flagship.mjs` | 19/19 on the standard-bearer | **19/19 on all five Part-2 posts. 18/19 on the four Part-1 posts, C3 only (no film); crm-sync moved 17 to 18 because it now carries `updated`. The AI Chat Assistant standard-bearer measured at 19/19 after being touched.** |
| `updated` dates | n/a | **9/9 changed posts carry the visible `Updated August 27, 2026` line, `"dateModified":"2026-08-27"` in the JSON-LD, and `article:modified_time` in the meta** |
| em dashes in visitor copy | 0 | **0** across all fourteen changed `.ts` files with comments stripped, and **0** in the served text of all fourteen changed pages. Arrow glyphs also 0 |
| served-string check | n/a | **46 string assertions across 14 URLs, 0 failures.** Every corrected string present, every retracted form absent |
| renders at 1440 and 390 | n/a | fourteen surfaces, both widths; `scripts/_scratch-r48-shots.mjs` (gitignored), shots in `docs/design-r48/` and `docs/design-r48b/`. Six read by eye: `p1d-geo-inshort-390`, `p1b-booking-calcnote-1440`, `p1-localseo-grid-390-el`, `p2-react-ftc-390-el`, `p2-chat-kbd-1440`, `p2-svc-chat-390`. Layout unbroken, pill centred, no overflow |

### The scorer's default base is PRODUCTION, and it nearly cost this round its numbers

`scripts/score-flagship.mjs:25` reads `const base = process.argv[3] || "https://realtylt-website.vercel.app"`.
Run without a third argument it measures the **deployed site**, not the disk. The first pass this
round reported 17/19 on the four Part-1 posts and 19/19 on the five Part-2 ones, and both numbers
were about production, where none of round 47's or round 48's work exists because neither has been
pushed. Re-run as `node scripts/score-flagship.mjs <slug> http://localhost:3100`, the real figures
are 18/19 and 19/19.

This is the memory's *"gates certify the DISK, the deploy builds the PUSH"* with a sharper edge:
**a gate with a remote default certifies somebody else's disk unless you tell it otherwise.** Any
score-flagship number in a round log without the base argument beside it should be treated as
unmeasured.

### The render instrument lied again, in the way rounds 45, 46 and 47 all recorded

Service pages reported `NO H1` under Playwright: `/services/database-reactivation` at 1440 in one
pass, `/services/ai-voice-agents` at 390 in another. **The failures moved between passes**, which a
page defect cannot do. Settled by direct fetch, three consecutive passes over all four service
pages: 12 of 12 return 200 with exactly one `<h1>`. Across the two render passes every one of the
fourteen surfaces also rendered cleanly at both widths with its corrected string found in the DOM.

**Instrument errors this round: three** (the scorer's remote default, the Playwright compile race,
and my own arithmetic suspicion about the CHI 2005 "over 700 hours"). **Product errors found: fifteen.**
That is a far better ratio than the 6:1 the memory records, and the reason is worth naming: almost
every product error this round was found by comparing two of the site's own surfaces against each
other rather than by pointing an instrument at one of them.

## Findings outside this round's scope, carried forward

- **`content/blog/posts.ts:623` carries an en dash** in the visible title of a local guide post:
  *"Moving to the Hudson Valley: Rental vs. Buying – What Makes the Most Sense?"*. Round 47 flagged
  it; it is still there, still outside the twenty-one flagships, and confirmed this round as **not
  introduced by round 48**.
- **`/blog` serves one em dash that no repo grep can reach.** It is in the excerpt of "Hudson Valley
  Market Check-In", and the string does not exist anywhere in `content/`, `lib/` or `app/`: the
  excerpt is DB-backed. This confirms round 46's finding precisely and tells the next round where
  to look, which is the database rather than the repo.
