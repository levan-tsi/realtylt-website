# ROUND F — the two topics about a value somebody else produced

**Built 2026-08-25.** Scope: seven new editorial plates, then `document-processing` and
`data-enrichment` written to the flagship standard, their service pages synced, and the claims
the research killed on the way. Eight commits on `main`, **not pushed**: the orchestrator verifies
and pushes.

```
cea03ad  F0   seven new editorial plates, every licence read on its own source page
e557649  F1   topic 14, document processing, argued as extraction from an unreliable original
38d6716  F2   topic 15, data enrichment, argued as a claim with an age rather than a lookup
6a332a9  F3   the two service pages synced, and eight claims that did not survive the research
ec0f3f9  F4   defects found by LOOKING, including a rule this repo had half right
e54fcfb  F5   the second pass, and the unchecked reason it caught was the article's spine
4b47352  F6   the round log, every source's operative sentence, and the corrected plate rule
         F6a  the log's own commit list was wrong: eight, not six
```

**F6a exists because Round E's log made the same mistake and had to be corrected the same way.** A
commit list written before the last commits are made will always be short by the commits that
carry it. Count them afterwards rather than predicting them.

**Two posts, ZERO new components.** Fifteen topics on the template now and fourteen in a row that
add none. The bespoke-component hatch was not opened and did not need the calculator-lesson test.

**The thing a future round should read first is F4.** The Plate primitive does not ship 21:9
everywhere, and Round E's rule for writing alt text was therefore half right. Measured below.

---

## THE RISK THIS ROUND WAS SET UP TO FAIL, and it was topic 15

`data-enrichment` sits directly beside `skip-tracing`, shipped one round earlier, and the two use
the same vendors and the same technology. `document-processing` sits beside `workflow-automation`.
All the neighbours were read in full before a word was written.

| | topic 5, workflow | topic 10, CRM sync | topic 12, skip tracing | topic 14, document processing | topic 15, data enrichment |
|---|---|---|---|---|---|
| the unit | a step of WORK | one FACT, in two places | one traced NUMBER | one FIELD read off a bad page | one APPENDED FIELD, and its age |
| the question | what does the manual version cost | are these two rows the same woman | where did it come from, legally | is what it read what the page says, and what does the value MEAN | is it still true, who says so, and what did it replace |
| the law it owns | none | none (RFCs) | DPPA, FCRA | Reg Z 1026.19 and 1026.2, ESIGN | CCPA right to correct, and a checked SHIELD absence |
| the held moment | 25 minutes | `2` records | `$2,500` | **`3` business days** | **`20` sources** |
| the calculator's unit | hours a year of typing | a COUNT of pairs to settle | a COUNT of records to account for | a COUNT of values nobody re-reads | a COUNT of fields being overwritten |
| what it refuses | the 25 min 26 sec | any duplicate rate | any match rate, any deal rate | any accuracy rate of ours, any HOURS SAVED row | any decay rate, any accuracy rate, any money at all |

**Topic 14 never argues that it saves you time, and its calculator carries no hours-saved row.**
That is the seam with topic 5, enforced structurally rather than remembered. Topic 15 hands the
whole acquisition question to topic 12 by name, in one paragraph and one FAQ, exactly as topic 12
hands consent to topic 3, and re-argues none of it.

**Measured: sibling overlap 0 for both, and 0 across all fifteen posts.** It was **7** and **37**
on the first runs and every shared phrase was mine. See the two sections below.

---

## F0 — SEVEN NEW PLATES, and five candidates rejected at the crop

Five unspent plates came into this round. **One was spent** (`office-stamps.jpg`, on document
processing) and **four were deliberately left**, so the surplus for topics 16 to 20 is now four
old plus whatever these two posts did not use.

`mailbox-mist.jpg` was NOT used on data-enrichment even though a rural mailbox fits the subject.
Three of the four photographs on the skip-tracing post are mailboxes. A fourth mailbox on the
article sitting directly beside it would have made the two posts look like one, and the whole
point of this round was keeping those two apart.

### The ledger

All seven verified with `scripts/check-plate-licence.mjs`, which fetches the photo page itself and
prints the licence id it finds there. Seven pages fetched: five CC BY 2.0, two CC0 1.0. Every row
is in `public/images/ATTRIBUTIONS.md` with the photographer as named on the source page.

| file | photographer | licence | where it went |
|---|---|---|---|
| `editorial/archive-stacks.jpg` | -JvL- | BY 2.0 | document processing, cold-open field |
| `editorial/signature-ink.jpg` | hierher | BY 2.0 | document processing, cover |
| `editorial/deed-1825.jpg` | museado | CC0 1.0 | document processing, plate two |
| `editorial/ghost-sign-foundry.jpg` | A Continuous Lean | BY 2.0 | data enrichment, plate one |
| `editorial/palimpsest-page.jpg` | Walters Art Museum Illuminated Manuscripts | CC0 1.0 | data enrichment, plate two |
| `editorial/ghost-signs-layered.jpg` | Jeffrey Zeldman | BY 2.0 | data enrichment, cover |
| `editorial/posters-peeled.jpg` | Michael Cory | BY 2.0 | data enrichment, cold-open field |
| `editorial/office-stamps.jpg` | mpclemens | BY 2.0 | SPENT this round: document processing, plate one |
| **`editorial/mailbox-mist.jpg`** | Michele Dorsey Walfred | BY 2.0 | **UNSPENT** |
| **`editorial/tool-wall.jpg`** | huw-ogilvie | BY 2.0 | **UNSPENT**, suggested: custom-automation |
| **`editorial/clock-not-in-use.jpg`** | Elliott Brown | BY 2.0 | **UNSPENT**, suggested: ai-scheduling |
| **`editorial/register-keys.jpg`** | Steve Snodgrass | BY 2.0 | **UNSPENT**, suggested: invoicing-and-payments |

### Five rejected, and the reasons are the useful part

- **An archive of boxes labelled REICHSKANZLEI, Diplomatische Akten.** From the same photographer
  and the same Vienna archive as the plate that shipped. Nazi-era German government records on a
  real estate marketing page. The one that did ship was checked at full size before it was kept:
  its labels read Reichstagsakten and Kurrheinische Kreisakten, which are Holy Roman Empire
  series, and nothing on it dates from the twentieth century.
- **A portable microfilm reader.** At 21:9 the photograph crops to a blank grey screen in a yellow
  bezel. This is the single clearest example of why the crop is judged rather than the thumbnail.
- **A library microtext room.** Handsome, architectural, and about a room rather than about
  documents. Also carries a blown highlight where a window is.
- **A torn TAX form.** The tear is a stock-photo gesture and "tax" is the wrong noun for an
  article about a purchase agreement.
- **A conservator holding a mounted manuscript leaf.** A named living person's face is the
  subject of the photograph.

**One judgement recorded rather than hidden:** `deed-1825.jpg` carries legible surnames of the
parties to the conveyance. It is an 1825 recorded deed, published under CC0 by a museum, and the
people named have been dead for the better part of two centuries. That is a different thing from
Round E's rejected mailbox, which carried a living person's name and street number. The alt text
deliberately does NOT transcribe the names, because a two hundred year old hand is exactly the
thing this article says gets misread and guessing at one in alt text would be the mistake it warns
about.

### One correction to Round E's published pipeline command

The log's usage line, `node scripts/plate-swatch.mjs out.png /_ecand/name.jpg`, does not work in
git-bash. MSYS rewrites a leading-slash argument into a Windows path, so every image comes back as
`http://localhost:3100C:/Program Files/Git/_ecand/name.jpg` and the probe prints "images that did
not load" for all of them. `export MSYS_NO_PATHCONV=1` first.

---

## F1 and F2 — the sources, each read in the primary document

### Topic 14: `/blog/document-processing-real-estate-contract-deadlines`

*"It Read the Date Correctly. The Date Was Not the Deadline."* Fourteen scenes, zero components,
no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **Jaume, Ekenel and Thiran, "FUNSD: A Dataset for Form Understanding in Noisy Scanned Documents", arXiv:1905.13538v2, 29 October 2019** | Read in the arXiv PDF with `pdftotext`. The corpus: *"The dataset comprises 199 real, fully annotated, scanned forms. The documents are noisy and vary widely in appearance."* Where they came from: the source collection is *"composed of 400,000 grayscale images of various documents from the 1980s-1990s"* which *"have a low resolution of around 100 dpi"* and *"are also of low quality with various types of noise added by successive scanning and printing procedures."* The sampling, quoted in full because two things were discarded together: *"we manually checked the 25,000 images from the form category. We discarded unreadable and similar forms, resulting in 3,200 eligible documents, out of which we randomly sampled 199 to annotate."* Table IV, OCR by Levenshtein similarity: Google Vision 94.4 for OCR and 76.4 for detection plus OCR; Tesseract 7.3 and 3.4. The explanation for that second engine, quoted so it is not drawn as a bar: *"The Tesseract OCR engine performs poorly on the FUNSD dataset, which can be explained by the fact that the minimum quality of 300 dpi needed by Tesseract is not met in the FUNSD dataset."* Table VI: entity labeling F1 0.57; entity linking precision 2.1, recall 99.2, F1 0.04. And the condition on both, which is what makes them damning: *"Note that we test the algorithms by assuming that we know the optimal word grouping, word location, and textual content. In this way, we only assess the specific task."* | arxiv.org PDF |
| **Mathew, Karatzas and Jawahar, "DocVQA: A Dataset for VQA on Document Images", arXiv:2007.00398v3, 5 January 2021** | Read in the arXiv PDF with `pdftotext`. The corpus: *"The DocVQA comprises 50,000 questions framed on 12,767 images"*, drawn from *"6,071 industry documents"*, *"from as early as 1900 to as recent as 2018"*, including *"typewritten, printed, handwritten and born-digital text"*. Test split: 5,188 questions on 1,287 images. Table 1, test column: Human accuracy **94.36**, OCR substring UB **87.00**, OCR subsequence UB **77.00**. The human method, quoted because it is a limitation: *"For measuring human performance, we collect answers for all questions in test split, with help a few volunteers from our institution."* The upper bounds defined: substring UB is *"the upper bound on predicting the correct answer provided the answer can be found as a substring in the sequence of OCR tokens"*, and the reason for the stricter one: *"the substring match in all cases need not be an actual answer match. For example if the answer is '2' ... it will match with a '2' in '2020' or a '2' in '2pac'."* | arxiv.org PDF |
| **12 CFR 1026.19, Regulation Z** | Read on law.cornell.edu. (f)(1)(ii)(A): *"the creditor shall ensure that the consumer receives the disclosures required under paragraph (f)(1)(i) of this section no later than three business days before consummation."* (a)(1)(i): deliver good faith estimates *"not later than the third business day after the creditor receives the consumer's written application."* (a)(2)(i): *"not later than the seventh business day before consummation of the transaction."* (a)(2)(ii): *"The consumer must receive the corrected disclosures no later than three business days before consummation."* | law.cornell.edu |
| **12 CFR 1026.2, the definitions the article turns on** | (a)(6), quoted in both halves because the whole point is that there are two: *"Business day means a day on which the creditor's offices are open to the public for carrying on substantially all of its business functions. However, for purposes of rescission under 1026.15 and 1026.23, and for purposes of 1026.19(a)(1)(ii), 1026.19(a)(2), 1026.19(e)(1)(iii)(B), 1026.19(e)(1)(iv), 1026.19(e)(2)(i)(A), 1026.19(e)(4)(ii), 1026.19(f)(1)(ii), 1026.19(f)(1)(iii), 1026.20(e)(5), 1026.31, and 1026.46(d)(4), the term means all calendar days except Sundays and the legal public holidays specified in 5 U.S.C. 6103(a)."* And (a)(13), which is the post's pull quote: *"Consummation means the time that a consumer becomes contractually obligated on a credit transaction."* | law.cornell.edu |
| **5 U.S.C. 6103(a)** | Read for the count and the list, because 1026.2(a)(6) points at it and the reader is being told which days do not count. Eleven days: *"New Year's Day, January 1. Birthday of Martin Luther King, Jr. ... Washington's Birthday ... Memorial Day ... Juneteenth National Independence Day, June 19. Independence Day, July 4. Labor Day ... Columbus Day ... Veterans Day, November 11. Thanksgiving Day ... Christmas Day, December 25."* | law.cornell.edu |
| **15 U.S.C. 7001, the ESIGN Act** | (a)(1): *"a signature, contract, or other record relating to such transaction may not be denied legal effect, validity, or enforceability solely because it is in electronic form."* And the half the article rests on, (d)(1): the retention requirement is met by keeping an electronic record that *"(A) accurately reflects the information set forth in the contract or other record; and (B) remains accessible to all persons who are entitled to access by statute, regulation, or rule of law, for the period required by such statute, regulation, or rule of law, in a form that is capable of being accurately reproduced for later reference, whether by transmission, printing, or otherwise."* | law.cornell.edu |

**Cited data graphics: three, and they are split by UNIT rather than by topic.** Levenshtein
similarity and F1 are not the same quantity, so drawing 94.4 beside 0.57 in one track would put
two units on one axis. Chart one is the two Levenshtein numbers (axis 100, the end-to-end bar
lit). Chart two is the two F1 scores, drawn as the scores times a hundred with the basis line
saying that F1 runs from 0 to 1 (axis 100, the linking bar lit). Chart three is DocVQA's human
figure and two ceilings (axis 100, the human bar lit).

**Chart three contains no model score on purpose.** DocVQA's own baselines are from 2020 and a
stale model number would be the one thing on the page that says something false. A human figure
and two ceilings imposed by the reading step are properties of the corpus, not of a model, so
they do not go off.

**Tesseract is not a third bar on chart one**, for the reason the paper itself gives: it was run
below its own published minimum resolution. It is in the prose with that explanation attached.

**The calculator's headline is a COUNT OF UNCHECKED VALUES.** Chain: transactions a year, times
documents per file, times values pulled from each, times the share that goes through without the
page being opened, times minutes to check one, into hours. The headline is the fourth row rather
than the hours, and the hours row is doing deliberate work underneath it: at the resting settings
it comes to 19, which is a couple of days a year, which is affordable and is not what happens.
It refuses an accuracy rate of ours, an hours-saved row, and a dollar figure for a missed
deadline, each with a stated reason.

### Topic 15: `/blog/data-enrichment-real-estate-stale-contact-records`

*"The Empty Fields Got Filled. So Did the Ones That Were Already Right."* Fourteen scenes, zero
components, no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **Federal Trade Commission, "Data Brokers: A Call for Transparency and Accountability", May 2014** | Read in the Commission's own PDF with `pdftotext`. The method, and the reason a twelve year old report is still the primary: *"in December 2012, the Commission initiated a study of data broker practices. It issued identical Orders to File Special Reports ('Orders') under section 6(b) of the Federal Trade Commission Act to nine data brokers"*, covering *"practices starting January 1, 2010"*, with all nine named in the report. Provenance: *"The nine data brokers studied obtain most of their data from other data brokers rather than directly from an original source"*, and *"one of the data brokers in this study obtains consumers' contact information from twenty different sources."* The consequence, which is the post's pull quote: *"it would be virtually impossible for a consumer to determine how a data broker obtained his or her data; the consumer would have to retrace the path of data through a series of data brokers."* The three counts drawn as chart one: *"All but one of the data brokers in this study purchase information about individuals from wide-ranging commercial sources"* (8), *"Seven of the nine data brokers in the Commission's study provide data to each other"* (7), *"All but three of the nine data brokers obtain information directly from federal government sources"* (6). The three drawn as chart two: five sell marketing products (from *"four of the five data brokers that sell marketing products"*), *"Four of the data brokers studied sell risk mitigation products"*, *"Three of the data brokers studied provide 'people search' websites"*. Observed against inferred: the brokers use *"not only the raw data they obtain from these sources, such as a person's name, address, home ownership status, or age, but also certain derived data, which they infer about consumers"*, with the report's own examples, that a broker *"might infer that an individual with a boating license has an interest in boating, that a consumer has a technology interest based on the purchase of a 'Wired' magazine subscription, or that a consumer who has bought two Ford cars has loyalty to that brand."* And on correction: *"Only two of the data brokers allow consumers to correct their personal information for marketing purposes."* | ftc.gov PDF |
| **California Civil Code 1798.106, the CCPA right to correct** | Read on leginfo. (a): *"A consumer shall have the right to request a business that maintains inaccurate personal information about the consumer to correct that inaccurate personal information, taking into account the nature of the personal information and the purposes of the processing of the personal information."* (c): a business receiving a verifiable request *"shall use commercially reasonable efforts to correct the inaccurate personal information as directed by the consumer."* Amended by Stats. 2024, Ch. 121, effective 1 January 2025. | leginfo.legislature.ca.gov |
| **California Civil Code 1798.140, the thresholds** | Quoted because the honest half of the paragraph above is that it probably does not cover the reader: a covered business is one doing business in California that also *"(A) As of January 1 of the calendar year, had annual gross revenues in excess of twenty-five million dollars ($25,000,000) in the preceding calendar year ... (B) Alone or in combination, annually buys, sells, or shares the personal information of 100,000 or more consumers or households. (C) Derives 50 percent or more of its annual revenues from selling or sharing consumers' personal information."* | leginfo.legislature.ca.gov |
| **U.S. Bureau of Labor Statistics, "Employee Tenure in 2024", USDL-24-1971, released 26 September 2024** | The news release and Table 1, read on the Bureau's own pages. The method: *"Since 1996, these surveys have been conducted biennially in January as a supplement to the Current Population Survey (CPS). The CPS is a monthly sample survey of about 60,000 households."* The definition, quoted because half of what is written about data decay depends on people not knowing it: median tenure is *"the point at which half of all workers had more tenure and half had less tenure."* The headline: *"The median number of years that wage and salary workers had been with their current employer was 3.9 years in January 2024, down from 4.1 years in January 2022 and the lowest since January 2002."* Table 1, January 2024, total, by age: 25 to 34 years 2.7 · 35 to 44 years 4.6 · 45 to 54 years 7.0 · 55 to 64 years 9.6. | bls.gov, two pages |
| **New York Attorney General, SHIELD Act** | Used for a CHECKED ABSENCE rather than for a duty. The AG's own description of the law it enforces: the Act requires *"any person or business that maintains private information to adopt administrative, technical, and physical safeguards"*, and it defines private information as personal information combined with a Social Security number, a driver's licence number, or an account number with its security code, extended by the Act to *"biometric information, username or email address, and password credentials."* A telephone number, a mailing address and a bare email address are not on that list, which is why the post says the statute people reach for here mostly does not cover the fields enrichment appends. | ag.ny.gov |
| **HubSpot, "Import objects, records, or activities"** | Added in the SECOND PASS, to replace an unchecked reason. See F5. The advanced option: *"Prevent property overwrite: if you're updating existing records, prevent the import from overwriting records' existing property values for the row."* And what selecting it does: *"the import will update the property for new records and existing records that have never had a value for the property. It won't update the property for existing records that have a value or had a value in the past, even if currently empty."* | knowledge.hubspot.com |

**A judgement recorded rather than hidden.** Round D spent `developers.hubspot.com` on the
contacts API. This is a different document on a different subdomain about a different subject, and
it is used for one narrow factual point about one named platform rather than as an authority on
the market. It is here because the alternative was leaving an unchecked assertion standing, which
is worse than reusing a vendor.

**Cited data graphics: three.** Two are from the FTC report and they are two different findings,
not one finding split: where the data comes from, and what it gets sold as. Both are drawn with
the axis pinned to **9**, because these are counts out of a known, tiny population rather than
shares of anything, and an unpinned axis would make "8" read as "almost all data brokers" when it
means "eight of the nine companies the FTC ordered". The third is BLS tenure by age, four bars,
**no axis maximum** because they are counts of years and the smallest is 28 percent of the
largest, checked on the shipped chart at 390 and 1440.

**The correction finding is quoted in prose rather than drawn**, because the report's sentence
does not make its denominator explicit and a bar needs one.

**The calculator's headline is a COUNT OF DISAGREEMENTS.** Chain: records in the pass, times the
share whose field is not empty, times the share where an outside file says something else, times
minutes to settle one, into hours. It refuses any decay rate, any figure for how often the
appended value is right, and **any money at all**, which is the first calculator in the cohort
with no currency anywhere in it.

### Sources deliberately NOT used

- **The NY SHIELD Act statute text at GBS 899-bb.** `nysenate.gov` answers 403 to a programmatic
  request, the same wall Rounds D and E hit. **Nothing in either post is asserted from the statute
  itself**, only from the Attorney General's published description of it, and the post says so on
  the page rather than only here.
- **Census geographic mobility.** The obvious decay source and it is SPENT: Round E used CPS ASEC
  Table A-1 on the skip-tracing post. Reusing the same publication family twice in four topics
  would be the reuse this project's source rule exists to prevent.
- **A USPS change-of-address figure.** Wanted, because a forwarding record has a hard retention
  window and that would have been an elegant decay fact. `postalpro.usps.com` answered 404 and
  `about.usps.com` answered 403 to programmatic requests. **Nothing about USPS is asserted
  anywhere in either post.**
- **The FTC's more recent 6(b) work.** The 2014 data broker report is the only 6(b) study of this
  specific industry with named respondents, so it is used with its age stated in the chart note
  rather than swapped for something newer about a different subject.

---

## THE TWO SIBLING BLEEDS, and every phrase was mine

**Topic 14 measured 7 against workflow automation** on the first run, and dragged three shipped
posts off zero as their nearest sibling changed. The shared phrases were my own cost section
(*"and it is not the interesting part"*, *"claim than the one usually made for this"*), my own
closing links paragraph (*"the wiring on the realtylt ai page and what gets"*, which is the
workflow post's own close), *"and it is not the one most"* against the review post, *"not the
number of pages it is"* against the geo post, and four against skip tracing including *"is a
different proposition from one that"* and *"which is a real cost and is"*. Nine sentences
rewritten.

**Topic 15 measured 37 against skip tracing**, which is by a distance the worst first run in the
cohort's history and is exactly what the brief predicted. Ten sentences carried it, and they were
the ones two articles about the same suppliers will always converge on: the per-record pricing
sentence, the attempts-versus-successes question, the "system that has never met either party"
description of a match, the hand-off link to the CRM sync article, *"both attach to the person
obtaining and using the data"*, *"none of that is difficult and none of it is expensive"*, *"what
happens on your side when somebody asks not to be contacted"*, the whole skip-tracing-versus-
enrichment FAQ answer, and the resolve-rate measurement sentence. All ten rewritten.

Three more single phrases surfaced during the second pass as rewrites introduced them (*"how much
public record sits behind a property and"*, *"the shape of that rather than the"*, *"and it is
worth knowing which one"*) and were rewritten as they appeared.

**Cohort back to 0 on every one of the fifteen. The bar was not touched.**

---

## F3 — the two service pages, and eight claims that did not survive

| file | was | now |
|---|---|---|
| `document-processing.figure.caption` | "One purchase agreement, **thirty seconds**" | what the reader does to a file, illustrated. Nobody has timed that on these documents, and a duration printed beside an illustration reads as a measurement |
| `document-processing.figure.rows` | three mocked-up dates (03/14, 02/19, 02/28) | the KIND of original and the KIND of result, with the third row carrying the article's finding |
| `document-processing.figure.footnote` | "The deadline that slips is **almost never** the one somebody knew about" | the illustration disclaimer, and what the third row is showing |
| `document-processing.faqs[0]` | "Yes. It **reliably** extracts structured facts" | what actually varies, which is the page rather than the software, with the measured shape behind it |
| `data-enrichment.figure.rows` | **an invented surname and an invented telephone number marked "verified"**, plus a specific town and a purchase year, attached to a first name from an open house | the KIND of gap and the KIND of result |
| `data-enrichment.howItWorks[1]` | "A list where **a third of the numbers are dead**" | the cost of dialling numbers that do not connect, without a rate nobody has measured |
| `data-enrichment.why` | "**lifting the connect rate** on lists you already own" | the mechanism, and what the row records about itself. **This is /ai COPY** |
| `data-enrichment.lede` | "so **every record** in your pipeline is actually reachable" | what came back, marked as what came back. An absolute the same page contradicts four fields later. **This is /ai COPY** |
| `data-enrichment.useCases[2]` | "the **cheapest optimisation available to any outbound effort**" | checking on a sample before checking on everything |

**The invented contact is the worst of the nine and it had been live since the page was written.**
Round E found three fabricated Hudson Valley street addresses on the skip-tracing page. The same
class was sitting one page over, on the article about buying assertions concerning real people:
a made-up surname, a made-up telephone number labelled "verified", a real Hudson Valley town and a
purchase year, all hanging off a first name from a sign-in sheet. `STANDARD.md` says it in as many
words. Both figures now carry an explicit line saying no client, address or number on them belongs
to anybody.

Both pages gained a sourced `stat` (94.36% from DocVQA Table 1; 20 sources from the FTC report), a
`howItWorks` step neither had (the counting rules written down; source, date and the disagreement
rule), and limits lifted from their post: document processing went from four to six, data
enrichment from four to six.

**All eight new entries in `lib/blog/zombie-claims.test.ts` were PROVED RED before being trusted
green**, against the real files rather than a synthetic string. Restoring all eight failed the
test naming lines 12, 14, 43, 48, 63, 79, 103 and 119 with a reason for each. Restored, green,
54 assertions passing.

**Two of the eight are the guard's first FABRICATED SPECIFICS.** Every previous entry is a number
or a flat claim. A pattern that catches an invented person is a different instrument from one that
catches an invented statistic, and Round E's finding says the class is live in more than one place.

---

## F4 — defects found by LOOKING, and one of them corrects a standing rule

### THE PLATE IS NOT 21:9 EVERYWHERE, so Round E's alt-text rule was half right

Measured on the rendered page rather than assumed from the class name:

| viewport | rendered plate | ratio |
|---|---|---|
| 1440 | 1088 x 466 | 2.33, which is 21:9 |
| 390 | 358 x 201 | 1.78, which is 16:9 |

Both frames fill the container width, so **the phone crop is a vertical superset of the desktop
crop**: a reader on a phone sees a taller slice of the same photograph. Round E's rule was "write
the alt text from the shipped 21:9 crop", and the shipped 21:9 crop is the SMALLER of the two, so
alt written from it is accurate and incomplete.

`scripts/plate-swatch.mjs` now renders both crops side by side and labels which one to write from.
Four alt texts were rewritten against the taller crop, and the change was not cosmetic on two of
them: **ORIGINAL is only legible in the 16:9 crop of the stamp rack**, and it is the most useful
word on that rack for an article about which copy is authoritative, so the plate's caption changed
too. The 1825 deed's taller crop carries a closing dower clause and an attestation that the
desktop crop cuts off.

**This does not invalidate Round E's plates**, which were judged at the desktop crop and are
correct as far as they go. It does mean their alt text describes less than a phone shows.

### SIX SCENES WERE RESTATING THE PROSE THEY STAGE

Caught by reading the shipped charts at 390 rather than by any gate, and nothing in this repo can
see this class: `flagship.test.ts`'s echo test covers only `statement` scenes, and `siblingOverlap`
deliberately excludes scene text because a chart's source line is apparatus rather than writing.

- both FUNSD chart notes restated the paragraphs beneath them, including the Tesseract explanation
  word for word;
- the DocVQA note and the body both explained that the lower two bars are ceilings, in the same
  order, with the same numbers;
- the BLS note and the body both said there is no equivalent public measurement, in nearly the
  same sentence;
- the FTC sources note repeated the two facts the body quotes verbatim from the primary;
- the FTC product-lines note carried the body's entire hand-off to the skip-tracing article;
- two `what-a-field-asserts` cards restated FTC facts the body quotes two sections later, and two
  `unreliable-original` cards restated the cold open image for image.

Fixed on whichever side owned the material. A chart note keeps the caveat, because a chart lifted
out of the page has to carry its own; the body keeps the quotes, because quoting the primary is
what a body is for.

### Two invented counts for the same quantity

The entity-linking chart note said the system had "found forty other things and called them your
closing date"; the body two paragraphs later said "thirty". Neither came from anywhere. The note
now derives it from the published precision instead: at 2.1 percent, roughly one claimed link in
fifty is a real one.

### Smaller things, all found in a screenshot

- The service page stat label ended on a dangling "from", which put the word alone on its own line
  in the narrow column.
- `data-enrichment.why` used "records" as a noun and then as a verb in the same clause.
- A figure chip read "every date printed in a fixed field", an absolute on the page whose standing
  instruction is that it carries none.
- A figure chip read "the date it counts from not on the page", which is not a sentence.

### Band rhythm, measured

`scripts/_scratch-e-bands.mjs`, unchanged from Round E.

| post | article height | longest single-tone run | adjacent same-tone pairs |
|---|---|---|---|
| crm-sync (Round D, unchanged) | 29,874px | 4,176px (**14%**) | 8 |
| document-processing | 31,095px | 5,137px (**17%**) | 5 |
| data-enrichment | 31,905px | 4,516px (**14%**) | 5 |

**Reproducing Round D's published 4,176px exactly on an unchanged post is what validates the
instrument before it is trusted about a new one.** Both new posts sit inside the shipped range
(14% on Round C's and D's, 15-16% on Round E's, 16-17% on Round B's, against 24% on the worst
shipped post before any of this).

**No two adjacent SCENE bands share a tone on either post.** All five adjacent same-tone pairs on
each are a scene against prose, which is the shipped pattern on every flagship including crm-sync,
and prose is not a band primitive. The defect Round E fixed was a light calculator directly
against a light offer, which is two primitives, and neither post has one.

Document processing at 17% was measured, considered and left. The run is the offer band plus the
how-to, FAQ and closing prose, and every rearrangement tried moved the problem rather than solving
it: moving `wasted` later merges the limits and how-to sections into a longer run, and moving the
plate later orphans a caption whose argument belongs beside the ESIGN section.

### The charts and the calculators were read at full size before they were kept

Every one of the six charts was screenshotted at 390 DPR3 at real size and read. The two-bar F1
chart draws 0.04 as a small round accent rather than a hairline, which is legible and is the
finding, the same judgement Round D made about the 200-clerks sliver. The smallest BLS bar is 28
percent of the largest and renders short rather than as a thread. No bar label wraps at 390.

Both calculators driven to their maximum at 390 and 1440 with `_scratch-calc.mjs`: `overflowX=0`
on all four runs, both ladders reconcile with their headline at rest and at maximum, and neither
resting state shows anything alarming before the reader touches it (576 unchecked values a year;
200 disagreements).

---

## F5 — the second pass, and the unchecked REASON was the article's spine

Round D's and Round E's worst defect was asserting an unverified fact as the stated grounds for a
refusal. This pass hunted that class first and found one that was worse: an unverified fact used
as the stated grounds for the whole argument.

**Four surfaces said that overwriting an existing value is the common default in enrichment
tooling.** The post's cold open, the "what to do when two sources disagree" section, the FAQ, the
calculator note and the service page's limits all rested on it, and the article's entire thesis is
that the overwrite is the expensive half. I had checked nothing.

Checked this round, in the primary: **HubSpot's own import documentation describes protecting a
value you already hold as an advanced option you switch on, per property, at import time.** The
option is called Prevent property overwrite and the page explains what selecting it does. So the
true statement is narrow and checkable: on one named platform, keeping your own value is a
checkbox rather than the resting state. The article now says exactly that, says it is one platform
and not a survey, and the claim about what every default does is gone from all four places.

**Twenty two more assertions about the world**, all rewritten into statements about a mechanism or
into something the reader can measure. The full list, because the pattern is the useful part:
*"the half of the same paper that almost nobody quotes"*, *"almost every conversation about
automating paperwork"*, *"the comparison everybody makes silently"*, *"it runs the opposite way to
most people's instinct"*, *"most products are tuned the other way"*, *"the half everybody already
knows"*, *"the part almost nobody budgets for"*, *"usually much lower than the raw wrong count"*,
*"it is never zero"*, *"the one nobody counts as part of the job"*, *"counting rules that everybody
uses and nobody has written down"*, *"those two numbers are usually very different"*, *"almost
nothing written about it addresses"*, *"every build picks one, usually without anybody being
asked"*, *"the honest answer for most businesses"*, *"verification, in this industry, usually
means"*, *"the one most commonly absent from the response"*, *"for most brokerages the answer is
no"*, *"most databases contain a large majority of rows"*, *"for most people it is much smaller"*,
*"that is what every default does"*, and in the scene files *"the opposite of what most people
assume"*, *"most people guess low on this one"*, *"at the settings most people arrive at"*,
*"almost nobody spends it"*, *"a queue nobody will work"*, *"a third outcome that most builds
skip"*, *"in most builds it does not"*, *"the number this whole category is usually sold on"*,
*"neither is usually discussed before a build starts"*, *"usually a tenth of the size of the one
people buy"*, and *"nobody has published one"* narrowed to what was actually searched for.

**Three invented quantities gone.** "The difference between them is four days", in the document
post's cold open, describing a gap between two readings of a deadline that I made up. "Two thirds
of the rows", repeated out of the enrichment cold open into a scene card, which is both an
invented quantity and the scene-echo class. And "thirty to forty percent" in the list of
circulating decay figures, which came out of a search result summary rather than off a page
anybody opened; the list now carries only the four figures read on pages actually fetched.

**One absolute softened**: "This is what a real estate contract has always been" became "has had
this shape for two hundred years", which is what the 1825 date supports.

**A judgement kept rather than changed:** the sentence *"'Closing date' is a label and 'March 14'
is a value"* keeps its date. It is an illustration of the FORM of a label and a value inside a
definition, not a mocked-up record presented as output, which is the thing the fabricated-specifics
rule is about. Recorded so a checker can disagree knowingly.

### What the decay-rate refusal is actually built on

The refusal is stated in the article and it was earned by following, not by assuming. The trail,
as it was actually walked:

- the most prominent recent version of the 30 percent claim is a press release from a company that
  sells contact data, carried on a newspaper site under a notice stating it is *"press release
  content distributed by XPR Media"* and that the paper's editorial staff *"were not involved in
  the creation of this content"*. No sample, no method, no population;
- below that, vendor blog posts from data quality and enrichment companies, each stating a rate,
  none stating what was measured or on how many records. The most useful thing on any of them is
  not a statistic: one recommends taking a random sample of 100 to 200 of your own oldest contacts
  and verifying them by hand, which is the correct answer and is the one nobody charges for;
- below those, aggregator pages citing each other and eventually citing a benchmark attributed to
  a marketing research publisher whose original study is not linked from any of them.

And the spread is the finding: on the pages actually opened, the same claim is quoted at 30
percent, at 22.5 percent, at 20 to 30 percent, and at up to 70 percent for email addresses.

---

## Verification

All gates FOREGROUND, on the disk as committed, against the single existing `:3100` dev server.
No second server was started. The Vercel build is authoritative and this builder cannot push.

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npm test
 Test Files  93 passed (93)
      Tests  1251 passed (1251)
   Duration  13.71s

$ node scripts/flagship-standard.mjs http://localhost:3100
COHORT
post                      proseWords      sections     citations  faqQuestions    bodyImages  dataGraphics ... siblingOverlap
ai-chat                         3597            19             4             7             6             2  ...   0
ai-voice                        3587            21             6             5             6             3  ...   0
database-reactivation           3675            19             4             5             6             2  ...   0
ai-lead                         3653            21             4             5             6             2  ...   0
workflow-automation             3667            19             4             6             7             2  ...   0
automated-google                5503            22             4             7             6             2  ...   0
ai-appointment                  4674            21             4             7             7             3  ...   0
local-seo                       5847            21             4             8             7             2  ...   0
geo-landing                     5783            21             6             8             7             3  ...   0
crm-sync                        6413            24             7             8             7             3  ...   0
ai-agent                        5488            23             5             8             7             3  ...   0
skip-tracing                    6710            22            10             8             8             3  ...   0
marketing-automation            5725            23            10             8             7             3  ...   0
document-processing             6156            23             6             8             7             4  ...   0
data-enrichment                 6441            24             7             8             7             4  ...   0
required                        3587            19             4             5             6             2  ...   2
available                       5503            21             5             8             7             3   <- --ratchet

all 15 posts meet the standard.

$ node scripts/check-svg-crop.mjs http://localhost:3100
PASS  document-processing-real-estate-contract-deadlines 26 text nodes in role="img" graphics
PASS  data-enrichment-real-estate-stale-contact-records 32 text nodes in role="img" graphics

350 text node(s) checked, 0 cropped.
```

The thirteen shipped posts were re-proven green by the SVG guard in the same run before it was
trusted about the two new ones.

Test baseline: **93 files / 1231 tests** at the end of Round E, **93 / 1251** after this one. Up,
never sideways. The 20 new tests are the two topics joining the table-driven content contract in
`lib/blog/flagship.test.ts` (nine checks each) and the two new `content/blog` scene files the
zombie-claims guard reads from the directory. The eight new `ZOMBIES` entries add no test of their
own by design: each is checked against every file the guard already reads.

**One test failed and it was the right one.** `flagship.test.ts`'s statement-echo guard failed on
the first run of topic 14, naming the funnel scene, because the closing prose section opened with
the same sentence the funnel carries. That guard was written in Round B for exactly this and it
had never fired on a new topic before. The prose was rewritten, not the scene.

### score-flagship: 17/19 for BOTH, and both reds are true

```
$ node scripts/score-flagship.mjs document-processing-real-estate-contract-deadlines http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs data-enrichment-real-estate-stale-contact-records http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.
```

Same two honest reds as Rounds B to E, for the same two reasons. Films are owner-held. `updated`
is deliberately absent with a comment in `content/blog/posts.ts` saying so, because a post written
and shipped inside one day has not been revised. **Nothing was faked and no baseline was moved.**
Both slugs report `visible=false`, so neither inherits the instrument quirk Round D recorded.

### Rendered and read, at 1440 and 390 DPR3

Every scene of both posts, both service pages and the blog index, with every `.reveal` asserted at
opacity 1 before the shutter.

```
scrollWidth == viewport width at 320, 390 AND 1440:
  /blog/document-processing-real-estate-contract-deadlines
  /blog/data-enrichment-real-estate-stale-contact-records
  /services/document-processing   /services/data-enrichment   /blog
0 page errors on every one of them.
```

Every external link was fetched and returned 200 before it shipped: twelve across the two posts on
the first check, plus the HubSpot import page the second pass added.

Probe rails held: `**/api/lead` aborted in every browser run, and `**/api/media/**` aborted in
every run of the committed and reused probes. **Two ad-hoc one-liners this round aborted
`/api/lead` but not `/api/media/**`**, so rather than assert the rail held on those, it was
measured: every one of the five pages driven this round was loaded again with a request listener
counting anything matching `api/media`, `mlsgrid` or `DATA-API`, scrolled to the bottom, and the
count came back **0 on all five**. Neither a blog article nor a service page requests a photograph
through the media route. No film, avatar or HeyGen work. Nothing touched in `next.config.ts`, the
CSP, security controls or `lib/idx`.

**Two new scratch probes, both in the gitignored `_scratch-*` namespace**, recorded here so they
can be recreated. `_scratch-f-scene.mjs` shoots ONE scene or heading section at its real size by
clipping between its anchor and the next one, which is what found the six echoing chart notes: the
strip probes scale a forty thousand pixel page into eight columns and a bar label cannot be read in
one. Its first version called `closest("section")` on the anchor and produced a 114,000px
"scene", because a scene anchor is a zero-height marker whose nearest section is the article root.
`_scratch-f-svc.mjs` does the same for a service page, section by section, because
`_scratch-e-pageshot.mjs` renders one at 41,000px in a single column.

**The same known probe limitation Round E recorded still applies.**
`_scratch-e-overflow.mjs` skips a wide node only if it has an ancestor with `overflow-x: auto` or
`scroll` and does not check `hidden`, so it still lists the decorative cold-open glow and the
service pages' hero wash as "offending" nodes even though the document does not scroll. The
authoritative line is `scrollWidth`, which is 0px over at every width on every page.

---

## THE RATCHET WAS NOT RUN, and this is the fourth round to decline for the same reason

`available` measures **proseWords 5,503, sections 21, citations 5, faqQuestions 8, bodyImages 7,
dataGraphics 3**. Ratcheting would raise `proseWords` to 5,503, `faqQuestions` to 8, `citations`
to 5 and `dataGraphics` to 3, which puts **six of the thirteen older posts below the bar by
construction**: ai-chat (3,597), ai-voice (3,587), database-reactivation (3,675), ai-lead (3,653),
workflow-automation (3,667) and ai-appointment (4,674) are all under 5,503, five carry 2 data
graphics rather than 3, and six carry fewer than 8 FAQ questions.

Closing that honestly means adding two thousand words, a cited chart and FAQ entries to six
articles that are not this round's topics. The repo's discipline is "ratchet at the START of a
round"; Rounds C, D and E measured and declined for exactly this reason; the brief for this round
says explicitly not to ratchet. **So the bar was measured, reported and left where it is, and the
two new posts were built well clear of it** (6,156 and 6,441 prose words, 23 and 24 sections, 6
and 7 citations, 8 FAQ entries each, 4 data graphics each) so the next ratchet is not made harder
by them.

**Recommendation for the orchestrator, unchanged from Rounds C, D and E and now four rounds old:**
the gap is six posts, it grows with every long post that ships, and it is a deliberate writing
round rather than a flag flip.

---

## Deliberately NOT done, and why

1. **The ratchet.** See above. Measured, reported, left where it is.
2. **Films.** Owner-held, out of scope by instruction. C3 stays honestly red on both.
3. **`_scratch-echo.mjs` promoted to a committed test.** Rounds C, D and E all recommended it and
   all found it printed only false positives. **This round found the class it was pointed at,
   by eye, on six scenes**, which is a stronger argument for a real echo test than three
   measurements of a false-positive rate. What it needs is a test that compares a scene's NOTE
   against the paragraphs adjacent to its marker, not one that greps for shared strings anywhere.
   That is a piece of design rather than a side effect of a build round. **Recommended, with a
   specification this time.**
4. **`stat.source` made REQUIRED.** Ten of twenty pages now carry one, up from eight. Still the
   right call and still a dedicated pass.
5. **Two service-page absolutes that are /ai COPY.** See below.
6. **Tier reassignment**, still an owner call. Both pages are `tier: "more"` and now carry
   6,000-word flagships, which is the tier mismatch `SERVICES-CRITIQUE.md` records.

## Defects found and NOT fixed

- **The `/ai` COPY drift is now seven keys wide.** `data-enrichment.why` and
  `data-enrichment.lede` no longer match the COPY object in `~/realtylt-ai-page`, joining
  `marketing-automation.why`, `crm-sync.why`, `local-seo.why` and Round B's two. Both were changed
  because both were contradicted by their own page: the `why` claimed a lifted connect rate with
  nothing under it, and the `lede` promised that every record becomes reachable four fields above
  a limit saying a match is not guaranteed. The journey and the services surface now disagree in
  seven places and reconciling them is an owner decision.
- **`content/services/data-enrichment.ts` `title` still says "Half a name becomes a full
  profile"** and `specs` still says "phone + email verification". Both are /ai COPY seeded
  verbatim. The H1 is a promise the page's own first limit qualifies, and "verified" means well
  formed, in service and not a duplicate rather than reaching that person, which the limits and
  the FAQ now say. **Flagged for the owner rather than changed**, because changing an H1 widens
  the drift above from seven keys to eight.
- **`content/services/document-processing.ts` `seo.description` still says "parsed in seconds"**
  while the figure caption's "thirty seconds" was removed as an unmeasured duration. The
  distinction is real and thin: a parse genuinely takes seconds, and a specific figure printed
  beside a fourteen page agreement reads as a measurement of that agreement. Recorded so somebody
  can disagree.
- **The floating rail sits over the calculator note** at one scroll position on both posts at
  1440. Standing rail behaving as designed on every flagship, not a Round F regression, noted only
  because it appears in the shot.
- **`public/_ecand/` is not gitignored.** `fetch-plates.mjs` stages candidates there and the
  licence test does not read it, but nothing stops a future round committing twenty candidate
  photographs by accident. This round removed the directory by hand. A `.gitignore` line would be
  a one-line fix and is left for whoever owns that file.

## Unknown product facts, for the owner, not writable

1. **Do our document-processing builds abstain, or do they always return a value with a
   confidence?** The post's central argument, the service page's first limit and its second FAQ
   all say that anything the system is not confident about is flagged for a person rather than
   filed. That is what a correct build does. Whether the builds we ship behave that way today, and
   what the threshold is, is a fact about the product that neither surface states.
2. **Where does a flagged value actually go, and who works that queue?** The post says a queue
   nobody works is worse than no queue. If our builds put low-confidence values somewhere a person
   sees them, saying where would be a genuine differentiator.
3. **Do we store the source document and page number with every extracted value?** The page's new
   fourth `howItWorks` step says we do. It is a five minute decision at build time and it is the
   difference between a ninety second disagreement and an afternoon.
4. **What is our default overwrite behaviour on an enrichment pass?** The post lays out four
   possible behaviours and tells the reader to choose deliberately. The service page's new fourth
   step says the rule is agreed with the client at the start. If there is a house default we begin
   from, saying so would answer the most important question in that article about ourselves.
5. **Do our enrichment builds write a source and a date onto every appended value?** The whole
   article rests on those two columns and the service page now says they exist. Same question
   Round E asked about skip tracing, one product over, and still unanswered.
6. **Does the BatchData response carry an age or a freshness field, and do we pass it through?**
   The post calls freshness the most useful attribute an appended field could carry. Whether it is
   available to us at all is a fact somebody here can establish in one afternoon.
7. Rounds A to E's remain open: whether the voice agent records audio, whether review automation
   as built sends the Google link to everybody, the review widget's selection rule, whether the
   booking layer sends a real calendar invitation and what calendar access it requests, whether
   RealtyLT manages the Google Business Profile or advises on it, whether area pages ship with a
   human editing step, whether the CRM sync has a review queue, the default conflict rule, whether
   agent-workforce builds draft or send by default, whether there is a readable run log, whether
   skip-tracing builds record a source and a date, what permitted purpose our own enrichment
   account is established under, whether the pipeline scrubs the do-not-call registry, whether
   marketing builds set up SPF, DKIM and DMARC, and whether Google Postmaster Tools is set up.
