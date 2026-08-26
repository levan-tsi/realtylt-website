# ROUND G — the two topics about somebody else's office

**Built 2026-08-25.** Scope: six new editorial plates, then `ai-scheduling` and
`invoicing-and-payments` written to the flagship standard, their service pages synced, and the
claims the research killed on the way. Six commits on `main`, **not pushed**: the orchestrator
verifies and pushes.

```
a2240fd  G0   six new editorial plates, every licence read in a BROWSER on its own photo page
b1f2e27  G1   topic 16, ai scheduling, argued as an agreement you do not have yet
1098e99  G2   topic 17, invoicing and payments, argued as an event you cannot see
7bc9cbc  G3   the two service pages synced, eight claims killed, and a hole in the guard itself
1cadd58  G4   defects found by LOOKING, and one of them was an invented key on a photograph
8c07a60  G5   the second pass, and both of its unchecked REASONS turned out to be wrong
         G6   this log
```

Rounds E and F both had to add a commit because the log's own commit list was written before the
last commits existed. This one was counted afterwards. G6 is the log itself and is the seventh.

**Two posts, ZERO new components.** Seventeen topics on the template now and sixteen in a row
that add none. The bespoke-component hatch was not opened and did not need the calculator-lesson
test.

**The two things a future round should read first are G3 and G5.** G3 found a hole in
`zombie-claims.test.ts` that had been there since the file was written, and it was found only
because the new entries were proved red rather than trusted. G5 found that BOTH of this round's
refusals rested on reasons nobody had checked, and following them changed both.

---

## THE HARDEST SIBLING PROBLEM IN THE ROLLOUT, and the seam I chose

`ai-scheduling` sits directly on top of `ai-appointment-booking`, which shipped in Round B. That
post was read in full, twice, before a word of this one was written, and the brief was right that
"book faster and they turn up" would have been the same article twice.

**The seam, stated as the brief asked: booking has two people in it and one calendar that has to
be true. Scheduling here has N people in it and you control one.**

Topic 7 owns everything between one person asking for your time and that person standing in a
house: lead time and the no-show curve (McMullen and Netland, 51,529 appointments), the
randomised reminder trial (Chen et al., 1,848 people), free and busy against full read access,
and what a booking is technically under RFC 5545. None of that appears in topic 16, and topic 16
never argues that shorter gaps or better reminders make people turn up, because that argument
already exists on this site with real evidence under it.

Topic 16's unit is **the agreement you do not have yet**. A showing on a listing you do not hold
needs the listing side, the occupant and a way in. A closing needs an attorney, a lender and a
title company. Your software can read and write exactly one of those calendars; everything else
is a message you sent and a reply you may not have. The expensive failure is not an empty porch,
which is topic 7's failure. It is telling a client a time was confirmed when nobody had confirmed
it.

That seam is enforced structurally rather than remembered:

| | topic 3, reactivation | topic 5, workflow | topic 7, booking | topic 16, scheduling | topic 17, invoicing |
|---|---|---|---|---|---|
| the unit | a lapsed contact | a step of WORK | one held appointment | one agreement you do not have | one chargeable event |
| the question | has permission expired | what does the manual version cost | will they turn up | who has actually agreed | did it happen, and is the money yours yet |
| the law/standard it owns | TCPA | none | RFC 5545, Google freebusy | **iTIP RFC 5546, CalDAV RFC 6638** | **RESPA, Regulation CC, NY GBL 518** |
| the held moment | 2023 | 25 minutes | 9 days | **1 of three** | **0 invoices** |
| the calculator's unit | money, once | hours a year | a COUNT of appointments kept | a COUNT of agreements never given | a COUNT of events heard about late |
| what it refuses | any rate of ours | the 25 min 26 sec | applying the reminder lift | any no-show rate, any decline rate, any money | any dollar per event, any unpaid share, any recovery rate, the commission |

**Topic 16's calculator carries no no-show rate and topic 17's carries no money at all.** Those
are the two structural guarantees that the two new posts cannot drift into their neighbours.

**Measured: sibling overlap 0 for both, and 0 across all seventeen posts.** It was **60** on
topic 16's first run against topic 7, which is the second worst first run in the cohort's
history, and every shared phrase was mine. See the section below.

### `invoicing-and-payments`: the trap, and what the article refuses in the open

The brief's warning was correct and it reorganised the whole piece. Commission does not flow like
a freelancer's invoice: it comes out of a closing another party runs, on a date the transaction
sets. Escrow is not the brokerage's money. A generic "chase your invoices" article would have
been wrong about the largest sum the business receives all year.

So **the post refuses that half on the page, in its own H2 heading**, rather than hedging it:
this article does not describe how a commission is documented, requested or disbursed, because it
varies by state, by whether there is an attorney at the table, by the closing agent and by the
brokerage agreement. The refusal carries its check rather than a plausible reason: the federal
statutes that govern a settlement are quoted on the same page, and what they cover is the
disclosure a buyer receives and the payments businesses may make to each other. None of them
describes how a brokerage gets paid its own commission.

What the article covers instead is the three things that ARE establishable and that the owner
controls: **who you may pay and be paid by** (RESPA), **when money that reached your bank becomes
money you can spend** (Regulation CC), and **what a rail costs and what you may pass on** (NY GBL
518 and Nacha). Plus the one control that stops a diverted payment, which is a telephone call.

The thesis that falls out is genuinely industry-specific and is the opposite of the generic
article: **the expensive failure is not the invoice nobody paid, it is the charge nobody raised,
because the event that creates it happened in an office you cannot see.**

**Money that is not yours is handled by refusing it too.** One grid card says that anything held
on behalf of somebody else is governed by state rules about separate accounts, that this page
does not summarise them because they are specific to your state and your licence, and that a
product enthusiastic about integrating with a client account is a question rather than a feature.
Nothing anywhere asserts how our builds handle funds.

---

## G0 — SIX NEW PLATES, and the licence rule tightened in one place

Four unspent plates came into this round. **Two were spent** (`clock-not-in-use.jpg` and
`register-keys.jpg`, the two the earlier rounds had suggested for exactly these topics), six new
ones were sourced, five of those shipped, and **three rows remain UNSPENT** for topics 18, 19 and
20.

### The licence rule, and where the brief and the committed script disagreed

The brief says a licence must be read on its own photo page **in a browser**, "never from a curl
of the page (a curl of a Flickr photo page returns a JS shell with no licence in it)". The
committed `scripts/check-plate-licence.mjs` reads it out of the served HTML, and Rounds E and F
both relied on it. Rather than argue about which is true, `scripts/_scratch-g-lic.mjs` opens each
candidate in Chromium, waits for the licence control to render, and prints the licence link, the
title and the photographer's display name.

**The photographer's name is the field that moved, and it is a finding worth carrying.**
Openverse's `creator` field is sometimes the account alias rather than the name the photo page
displays, and **four of this round's six differed**: kitmasterbloke is **Steve Knight**, M McBey
is **Mike McBey**, "Elsie esq." is **Les Chatfield**, kvanhorn is **Kyle Van Horn**. Four shipped
rows were re-checked the same way and were already correct (`mpclemens` and `upyernoz` really are
the names those pages display), so no existing ledger row is wrong. But the rule should now read:
**the photo page is the authority for the NAME as well as for the licence.**

All six rendered a licence link to `https://creativecommons.org/licenses/by/2.0/deed.en` with
"Some rights reserved" beside it. **One instrument quirk recorded rather than hidden:**
`_scratch-g-lic.mjs` prints `?? CHECK` on all of them, because the anchor's visible text is "Some
rights reserved" rather than "CC BY 2.0" and the script matches on the label. The licence is in
the href it also prints. The script would be better matching on the URL.

### The ledger

| file | photographer | licence | where it went |
|---|---|---|---|
| `editorial/lever-frame.jpg` | Steve Knight | BY 2.0 | scheduling, plate one |
| `editorial/switchboard.jpg` | Mike McBey | BY 2.0 | scheduling, cold-open field |
| `editorial/departure-board.jpg` | David Jones | BY 2.0 | scheduling, plate two |
| `editorial/adding-machine.jpg` | Les Chatfield | BY 2.0 | invoicing, plate one |
| `editorial/till-drawer.jpg` | Deborah Fitchett | BY 2.0 | invoicing, cold-open field |
| `editorial/clock-not-in-use.jpg` | Elliott Brown | BY 2.0 | SPENT this round: scheduling, cover |
| `editorial/register-keys.jpg` | Steve Snodgrass | BY 2.0 | SPENT this round: invoicing, plate two AND cover |
| **`editorial/type-case.jpg`** | Kyle Van Horn | BY 2.0 | **UNSPENT**, suggested: ai-clone |
| **`editorial/mailbox-mist.jpg`** | Michele Dorsey Walfred | BY 2.0 | **UNSPENT** |
| **`editorial/tool-wall.jpg`** | huw-ogilvie | BY 2.0 | **UNSPENT**, suggested: custom-automation |

**One judgement recorded rather than hidden: `register-keys.jpg` is both a plate and the cover on
the same post.** That is a first, and it is safe for a checkable reason rather than a hopeful one:
`app/blog/[slug]/page.tsx` renders `cover` only in the NON-flagship branch, so a flagship article
never shows it. It appears on the blog index card and in the OG image, which is continuity rather
than repetition. Verified in the file before it was relied on.

### Six candidates staged and rejected, and the reasons are the useful part

- **A drive-through bank window** with "Cambridge Trust Company" legible in the centre of the
  frame. Colour, well composed, works at both crops, and rejected for the reason Round E rejected
  a pegboard: a third-party trademark as the subject of a photograph on a commercial page.
- **An 1899 bank interior** with ornate iron collection and payment windows. The single most
  on-subject photograph found all round, and black and white against a colour plate set. Same
  call Round E made about a county courthouse.
- **A bank vault door** with two identifiable people in front of it, one facing the camera.
- **An abandoned teller booth.** At 21:9 it is an unreadable dark rectangle.
- **A hotel key rack.** At 21:9 it is a small dark grid on a large white wall with a chair.
- **A second lever frame**, from Liverpool Lime Street, behind museum glass with reflections
  across the labels. Redundant against the one that shipped and worse.

**One candidate rejected at the crop after passing the thumbnail** is the clearest example of why
the swatch exists: Penn Station's departures board, where the board is only in the 16:9 slice and
the 21:9 slice is four identifiable people, one of them a man's face at half frame height.

---

## G1 and G2 — the sources, each read in the primary document, none previously spent

### Topic 16: `/blog/ai-scheduling-real-estate-showing-confirmations`

*"You Said It Was Confirmed. One of the Three People Had Not Replied."* Fifteen scenes, zero
components, no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **iCalendar Transport-Independent Interoperability Protocol, RFC 5546, December 2009** | Read in the RFC text itself. **RFC 5545 is SPENT by topic 7 and is not used here.** Section 2.1.1, quoted in full because the article turns on it: *"The state of a particular 'Attendee' relative to an iCalendar object used for scheduling is defined by the 'PARTSTAT' parameter in the 'ATTENDEE' property for each 'Attendee'. When an 'Organizer' issues the initial iCalendar object, 'Attendee' status is typically unknown. The 'Organizer' specifies this by setting the 'PARTSTAT' parameter to 'NEEDS-ACTION'. Each 'Attendee' modifies their 'ATTENDEE' property 'PARTSTAT' parameter to an appropriate value as part of a 'REPLY' message sent back to the 'Organizer'."* The organiser's authority, from the same section: attendees *"can, however, use the 'COUNTER' method to suggest changes to the 'Organizer'. In any case, the 'Organizer' has complete control over the master iCalendar object."* And the methods table, quoted as printed for the two the article names: REPLY, *"A reply is used in response to a request to convey Attendee status to the Organizer"*; COUNTER, *"Used by an Attendee to negotiate a change in an iCalendar object. Examples include the request to change a proposed event time or change the due date for a task"*; DECLINECOUNTER, *"Used by the Organizer to decline the proposed counter proposal."* The abstract, for the scope claim the article makes: the protocol provides *"scheduling interoperability between different calendaring systems."* | rfc-editor.org |
| **Scheduling Extensions to CalDAV, RFC 6638, June 2012** | Read in the RFC text itself. Section 3.2.8, which is the post's pull quote and the strongest practical argument on the page: *"Servers MUST reset the 'PARTSTAT' property parameter value of all 'ATTENDEE' properties, except the one that corresponds to the 'Organizer', to 'NEEDS-ACTION' for each calendar component change that causes any instance to be rescheduled."* The same section's table applies it to DTSTART, DTEND, DURATION, DUE, RRULE, RDATE and EXDATE. Section 3.2.9 defines the delivery status carried in `SCHEDULE-STATUS`, and the eight codes are quoted as printed: 1.0 *"The scheduling message is pending"*; 1.1 *"The scheduling message has been successfully sent. However, the server does not have explicit information about whether the scheduling message was successfully delivered to the recipient. This state can occur with 'store and forward' style scheduling protocols such as iMIP"*; 1.2 *"The iTIP message has been sent and delivered"*; 3.7 *"not delivered because the server did not recognize the calendar user address as a valid calendar user"*; 3.8 *"not delivered due to insufficient privileges"*; 5.1 *"the server could not complete delivery of the message. This is likely due to a temporary failure"*; 5.2 *"the server was not able to find a way to deliver the message. This is likely a permanent failure"*; 5.3 *"rejected because scheduling with that recipient is not allowed."* | rfc-editor.org |
| **Cranshaw, Elwany, Newman, Kocielnik, Yu, Soni, Teevan and Monroy-Hernandez, "Calendar.help: Designing a Workflow-Based Scheduling Agent with Humans in the Loop", CHI 2017, arXiv:1703.08428v1** | Read in the arXiv PDF with `pdftotext`. Method, from Table 1 and the Evaluation section: Study 3b ran 5 April to 25 August 2016, open usage, no gratuity, **178 participants, 1,981 invitees, 1,626 meetings, 15,659 emails**. Table 3, the reasons a request escalated to a trained human, quoted as printed: *"Multiple or out of bound email responses from an attendee"* 32%, *"None of the proposed times were acceptable to everyone"* 27%, *"Timed-out while waiting for a response from an attendee"* 26%, *"Other / unknown / not instrumented"* 14%, *"Manual (worker) escalation in processing ballot response"* 8%, *"Cannot access organizer's calendar"* 7%, *"Manual (worker) escalation in proposing meeting times"* 7%, *"Manual (worker) escalation in determining attendees"* 2%. And the caveat that travels with the chart: *"Note, these are not mutually exclusive: multiple reasons can trigger macrotasks in parallel."* System efficiency: *"In Study 3b, 39% of the requests Calendar.help received were completed entirely within the microtasking workflows of Tiers 1 and 2, never escalating to a macrotask. The remaining 61% of requests were partially processed in Tiers 1 and 2, requiring some intervention by a macrotask worker."* The population, which is what makes the transfer honest: *"Participants used Calendar.help primarily to schedule two-person meetings (i.e. one-on-one), with this type of meeting accounting for 84% of all requests in Study 3b... However, 15% of meetings involved three or more attendees, up to a maximum of eleven attendees in one request."* And the trajectory, quoted because it is what stops 39% reading as a ceiling: *"by Study 3b, 39% of requests were handled entirely by structured microtasking workflows. Moving from 0% to 39% required continual observations of interaction patterns."* | arxiv.org PDF |
| **Microsoft Graph, `findMeetingTimes` and `meetingTimeSuggestion`** | Read in the served HTML of both reference pages, which is the check Round D's correction requires rather than an assumption about JavaScript. The call: *"Suggest meeting times and locations based on organizer and attendee availability, and time or location constraints specified as parameters."* The field the article is about, quoted with the typo it carries on the page: `confidence` is *"A percentage that represents the likelhood of all the attendees attending."* The matching input: `minimumAttendeePercentage` is *"The minimum required confidence for a time slot to be returned in the response. It is a % value ranging from 0 to 100."* And the vendor's own caveat, which is the sentence the article ends the section on: *"The algorithm used to suggest meeting times and locations undergoes fine-tuning from time to time. In scenarios like test environments where the input parameters and calendar data remain static, expect that the suggested results may differ over time."* | learn.microsoft.com, two pages |

**Cited data graphics: two charts and one diagram.** Both charts are from Calendar.help and they
are two different findings rather than one split: *why* it escalated, and *how much* escalated.

**Chart one draws four of the eight published rows and the choice is the argument.** The three
largest are drawn because all three are the same category of failure in the paper's own wording,
and "Cannot access organizer's calendar" at 7% is drawn as the fourth because it is the only row
on the whole table about the organiser's own systems, which is the half every product in this
category is sold on. **The 7% bar is the lit one**, because the thing the software controls is
the thing that went wrong least. The four excluded rows are one uninstrumented bucket and three
internal worker escalations, none of which describes a party to the meeting, and the note says so.

**Chart two's honest reading is in its own basis line.** 39% is not "no human touched it": the
paper describes Tier 1 as software and Tier 2 as a non-expert person doing one small defined
task, and the number covers both. The "In short" summary said "without a person ever touching
them" on the first draft and was corrected in G4. See below.

**A THIRD CITED CHART WAS LOOKED FOR AND NOT FOUND, and the trail is recorded because the
absence is the finding.** The plan was a chart of the weeks each year when New York and London
are four hours apart rather than five, derived from 15 U.S.C. 260a and EU Directive 2000/84/EC.
15 U.S.C. 260a reads fine on law.cornell.edu. **EUR-Lex does not**: three separate URLs for CELEX
32000L0084, including the ELI permalink and the OJ PDF link, all return the same 13,692-byte
JavaScript landing page with none of the directive's text in it. **Nothing about EU summer time
is asserted anywhere in either post**, and the chart died with it. The DOT denied-boarding data
was the other candidate and was dropped deliberately: it is an analogy about capacity rather than
evidence about coordination, and a fourth graphic is not worth a detour.

**The calculator's headline is a COUNT OF AGREEMENTS NEVER GIVEN.** Chain: appointments a month,
times twelve, times the number of other parties whose agreement is needed, times the share where
no yes ever came back, times minutes chasing one, into hours. The headline is the fourth row
rather than the hours, and the hours row does deliberate work under it: at the resting settings
the chasing is thirteen hours a year, which any owner would shrug at, and the cost is not the
time. **It refuses a no-show rate** (topic 7's territory), **a decline rate** (see G5 for what
was actually checked), **any money**, and **any second column showing what it becomes with a
scheduling layer switched on.**

### Topic 17: `/blog/invoicing-and-payments-real-estate-brokerage`

*"The Referral Closed in July. Nobody Here Raised an Invoice."* Fifteen scenes, zero components,
no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **RESPA, 12 U.S.C. 2607** | Read on law.cornell.edu. (a): *"No person shall give and no person shall accept any fee, kickback, or thing of value pursuant to any agreement or understanding, oral or otherwise, that business incident to or a part of a real estate settlement service involving a federally related mortgage loan shall be referred to any person."* (b), which is the post's pull quote and is quoted rather than paraphrased because every summary softens the last six words: *"No person shall give and no person shall accept any portion, split, or percentage of any charge made or received for the rendering of a real estate settlement service in connection with a transaction involving a federally related mortgage loan other than for services actually performed."* The exception that makes the article's opening story lawful, (c)(3): *"payments pursuant to cooperative brokerage and referral arrangements or agreements between real estate agents and brokers."* And (c)(2): *"the payment to any person of a bona fide salary or compensation or other payment for goods or facilities actually furnished or for services actually performed."* The teeth, (d)(1): *"shall be fined not more than $10,000 or imprisoned for not more than one year, or both."* (d)(2): *"jointly and severally liable to the person or persons charged for the settlement service involved in the violation in an amount equal to three times the amount of any charge paid for such settlement service."* | law.cornell.edu |
| **12 U.S.C. 2602, the scope** | Quoted because the prohibition above does not reach every transaction and the article says which. (1): a federally related mortgage loan *"includes any loan (other than temporary financing such as a construction loan) which (A) is secured by a first or subordinate lien on residential real property (including individual units of condominiums and cooperatives) designed principally for the occupancy of from one to four families"* and where the lender is federally insured or regulated, or the loan is federally assisted, or it *"is intended to be sold by the originating lender to the Federal National Mortgage Association, the Government National Mortgage Association, the Federal Home Loan Mortgage Corporation"*. | law.cornell.edu |
| **12 U.S.C. 2603, the uniform settlement statement** | (a), quoted for the one thing the article uses it for: *"Such forms shall conspicuously and clearly itemize all charges imposed upon the borrower and all charges imposed upon the seller in connection with the settlement."* The article says only that the charges get itemised on a form somebody else prepares. It does not claim which form applies to a given closing. | law.cornell.edu |
| **Regulation CC, 12 CFR 229.10, 229.12 and 229.13** | Read on law.cornell.edu, three sections. 229.10(b)(1): *"A bank shall make funds received for deposit in an account by an electronic payment available for withdrawal not later than the business day after the banking day on which the bank received the electronic payment."* And (b)(2), the definition the article says to read twice: *"An electronic payment is received when the bank receiving the payment has received both (i) Payment in actually and finally collected funds; and (ii) Information on the account and amount to be credited."* 229.12(b): a depositary bank shall make funds deposited by a local check available *"not later than the second business day following the banking day on which funds are deposited."* 229.13(b): *"Sections 229.10(c) and 229.12 do not apply to the aggregate amount of deposits by one or more checks to the extent that the aggregate amount is in excess of $6,725 on any one banking. day."* (The stray full stop is in the source.) 229.13(h)(4): *"a 'reasonable period' is an extension of up to one business day for checks described in 229.10(c)(1)(vi), five business days for checks described in 229.12(b)(1) through (4)."* | law.cornell.edu, three pages |
| **New York General Business Law 518, the version in force from 2024-02-16** | Read on nysenate.gov, full statutory text with the revision date shown on the page. (1): *"Any seller in any sales transaction imposing a surcharge on a customer who elects to use a credit card in lieu of payment by cash, check, or similar means shall clearly and conspicuously post the total price for using a credit card in such transaction, inclusive of surcharge, provided however, any such surcharge may not exceed the amount of the surcharge charged to the business by the credit card company for such credit card use. The final sales price of any such sales transaction, inclusive of such surcharge, shall not amount to a price greater than the posted price for such sales transaction."* The preserved arrangement: a two-tier pricing system means *"the tagging or posting of two different prices in which the credit card price, inclusive of any surcharge, is posted alongside the cash price."* (2): a violating seller *"shall be liable for a civil penalty... not to exceed five hundred dollars for each such violation."* | nysenate.gov |
| **Federal Bureau of Investigation, Internet Crime Complaint Center, 2024 Internet Crime Report** | Read in the Bureau's own PDF with `pdftotext`. Scale, from the report's own accessibility description of its headline figure: *"In 2024, complaints totaled 859,532, with losses of $16.6 billion, representing a 33 percent increase from 2023. 256,256 complaints reported an actual loss. For complaints, the average reported loss was $19,372."* Business email compromise, from the two crime-type tables: **21,442 complaints** and **$2,770,151,146**. The Financial Fraud Kill Chain, quoted: *"3,020 complaints attempted for $848.4 million. Domestic: 2,651 complaints, $469.1 million frozen; International: 369 complaints, $92.5 million frozen; 66% success rate."* And the definitional point the article makes, from the report's own glossary: *"Real Estate Fraud: Loss of funds from a real estate investment or fraud involving rental or timeshare property."* The report's worked example of a spoofed instruction to wire closing funds sits under business email compromise, not there. | ic3.gov PDF |
| **Nacha, Same Day ACH** | Read in the served HTML of Nacha's own page. Nacha writes the ACH operating rules, so this is the rule maker stating its own limit rather than a provider describing a market. From its network timeline: against 2020, *"Same Day ACH Dollar Limit per Transaction increased from $25,000 to $100,000"*; against 2022, *"Same Day ACH Dollar Limit per Transaction increased from $100,000 to $1 million."* The page also carries a banner announcing a rise *"to $10 million"*, which is stated as announced and is deliberately not drawn. | nacha.org |

**Cited data graphics: three charts and one diagram.**

- **Funds availability, three bars in business days, no axis maximum.** The third bar is the only
  derived value on either post and its derivation is stated on the page and in the basis line:
  229.12(b)'s second business day plus 229.13(h)(4)'s extension of up to five business days for
  exactly that class of cheque. The note's first sentence is the one that matters: **these are
  ceilings the regulation permits, not observations of any bank.** Same discipline as topic 14's
  DocVQA ceilings chart.
- **Same day ACH, two bars in dollars.** Three on the first draft. See G4.
- **The Financial Fraud Kill Chain, three bars in millions of dollars.** The two frozen figures
  are drawn separately rather than summed, because the Bureau publishes them separately and a
  summed bar would be a number of mine standing beside two of theirs.

**The calculator's headline is a COUNT OF CHARGEABLE EVENTS HEARD ABOUT LATE.** Chain: things you
could raise a charge for in a year, times the share that happen outside your office, times the
share where nobody tells you on the day, times minutes to reconstruct one, into hours. It refuses
**a dollar value per event**, **a share of invoices that go unpaid**, **a recovery rate for a
reminder sequence**, and **any row for the commission**, and after G5 the second of those refusals
carries a reason that was actually followed.

### Sources deliberately NOT used

- **RFC 5545 and the Google Calendar freebusy API.** Both spent by topic 7. Everything topic 16
  needs about participation status comes from RFC 5546 and RFC 6638 instead, which are different
  documents by different working-group outputs, and neither has appeared on this site before.
- **RFC 6047, iMIP.** Wanted for the point that most invitations travel by email, and left out
  because topic 17 in the same round is about a payment instruction that arrived by email.
  Two articles in one round both arguing that email says nothing about who sent it is the sibling
  bleed this project exists to prevent, so topic 16 makes the point once, narrowly, inside the
  quoted RFC 6638 status code, and does not build a section on it.
- **EU Directive 2000/84/EC.** Unreachable. See above. Nothing about it is asserted.
- **New York Real Property Law 442, splitting commissions.** Wanted as the New York layer under
  RESPA. `nysenate.gov` answered **403** to it. Nothing about NY licence law is asserted anywhere
  in either post.
- **19 NYCRR 175.1, the broker commingling rule.** Wanted for the money-that-is-not-yours section.
  `govt.westlaw.com/nycrr` answers **403** and three `dos.ny.gov` paths for the licence law
  booklet answer **404**. **Nothing about New York trust or escrow account rules is asserted**;
  the article says the rules are specific to your state and your licence and to ask your attorney.
- **The Federal Reserve Payments Study.** Its landing page serves navigation chrome only, and the
  figures live further in. Not pursued once the round had three cited charts on that post.
- **Sen and Durfee's formal study of distributed meeting scheduling, and Tang et al. on time-zone
  shifted collaboration.** Both cited by the Calendar.help paper, both plausible, and neither
  followed: one non-vendor study carrying its own limitations is worth more than three, and the
  round's budget was better spent on the second pass.

### A CORRECTION to what Rounds D and E concluded about nysenate.gov

Round E recorded that `nysenate.gov` answers 403 behind Cloudflare, and asserted nothing from it.
**That conclusion was true of the request Round E made and is false as a statement about the
site.** Measured this round, repeatedly:

- `curl` with its DEFAULT user agent: **200**, with the full statutory text of GBL 518 and its
  revision date in the response.
- `curl` with a browser-like Chrome user agent: **403**, Cloudflare interstitial.
- Headless Chromium: **403**, the same interstitial.

So the wall is real and it is pointed at things that look like browsers. GBL 518 was read in the
primary, and the link a reader clicks resolves for a person. **RPL 442 was tried three times
across the round and answered 403 every time**, which is why nothing from it is on the page.

---

## THE SIBLING BLEED, and every phrase was mine

**Topic 16 measured 60 against topic 7 on the first run.** The second worst first run in the
cohort's history, and exactly what the brief predicted. Ten sentences carried the whole of it and
every one was a habit rather than a fact:

- the entire cost section: the messaging-billed-per-text sentence, "every one of those is a
  question about your business rather than a setting in a piece of software", "the cost nobody
  puts on a quote is", and "will get exactly the reliability that implies";
- the definitional FAQ's "the AI part is only the conversation" and "ordinary software is the
  kind that runs at";
- the limits section's calendar-you-do-not-trust sentence, down to "wrong three times a week";
- and the close, "the whole of this article in your own handwriting" and "you do not need us".

All ten rewritten, then one more phrase surfaced against `ai-lead` as the rewrites landed, then
one more against `document-processing` after the second pass, both rewritten as they appeared.

**Topic 17 measured 4 against `crm-sync` and 3 against `document-processing`**, on "this is not
an edge case, it is a Tuesday", "the first question to ask about any product in this category",
and "the cost is in the reaching rather than in the logic", which was a phrase I had written into
topic 16 an hour earlier.

**Cohort back to 0 on every one of the seventeen. The bar was not touched.**

### An instrument note: a flaky page load makes `flagship-standard.mjs` report a confident lie

One mid-round run printed **"17 of 17 posts are below the standard"** with every single post
reporting `siblingOverlap` of exactly **54**, which is also the number of chrome phrases the same
run says it excluded. The chrome filter requires a phrase to be present in ALL posts; if one page
fails to load its paragraphs, nothing qualifies as chrome and every post's overlap becomes the
chrome count. The next run was clean and printed 0 across the board. **A uniform number equal to
the chrome count is the signature of this, not a real regression.** Worth knowing before somebody
spends an hour rewriting sentences that were fine.

---

## G3 — the two service pages, and eight claims that did not survive

| file | was | now |
|---|---|---|
| `ai-scheduling.useCases[1].title` | "The double-booking that **cannot happen**" | your own diary, offered once, and an explicit statement that what happens on the other side of a co-broke is not something any software can promise |
| `ai-scheduling.howItWorks[1]` | "so **nothing double-books** and nothing has to be undone the next morning" | it will not offer time your own calendar already holds, plus the access constraints that narrow it further |
| `ai-scheduling.faqs[0]` | "so it **can only ever** offer time that is genuinely free" | which half it can guarantee and which half it cannot, in the same answer |
| `ai-scheduling.figure.footnote` | "separated by about **ten minutes** of enthusiasm" | what the illustration is, and what changes when the appointment needs somebody outside your office |
| `ai-scheduling.limits[2]` | reminders "**remove** the common reasons" for a no-show | reminders and an easy reschedule are worth having, and some people still will not turn up |
| `ai-scheduling.why` | "Instant, **conflict-free** booking closes that gap" | the mechanism, which is holding the slot the moment it is taken. **This is /ai COPY** |
| `invoicing.why` | "Automated invoicing and gentle chasing **cut the wait from weeks to days**" | the mechanism, which is that both happen on the day they were supposed to. **This is /ai COPY** |
| `invoicing.figure.events[2]` + `howItWorks[2]` + `faqs[0]` + `useCases[1]` + `useCases[2]` | "**Most** late invoices are forgotten, not refused" · "a reminder is **all they ever needed**" · "recovers **the majority** of them" · "Deposits **reduce no-shows**" · "The **third nudge** is the one that gets paid" | what the sequence actually does and when, with the reasons and rates removed |

**The majority claim is the most interesting of the eight**, because it is not a number and it
does not look like a statistic. It is a claim about a *reason*: that late payments are forgotten
rather than refused. It was load-bearing on five surfaces of one page, it is sympathetic, and it
is the entire justification for a polite reminder sequence. Nothing measures it. See G5 for what
following it actually turned up.

**The invoicing page also had an audience problem the post fixed.** Written for a tradesman
finishing a job, it read as though a brokerage's main receivable were an invoice it sends. It now
separates the ordinary invoices from the charges that are never raised, and it says in its limits
and in an FAQ that it does not handle the commission and does not claim to.

Both pages gained a sourced `stat` (**61%** from Calendar.help; **$6,725** from 12 CFR
229.13(b)), a `howItWorks` step neither had (holding the slot as it is taken and tracking who has
actually agreed; asking whether the event happened, and reconciling against the bank), limits
lifted from their post (scheduling four to six, invoicing four to seven), and **relatedPosts both
ways** including scheduling now pointing at the booking article, which it did not before.

**No fabricated specifics were found on either page.** The brief asked for this first, after
Round E found three invented street addresses and Round F an invented person with an invented
"verified" number. Both of these pages use `timeline` figures rather than `records` figures, and
a timeline has no names, addresses or numbers on it. The nearest thing to the class was
`ai-scheduling`'s invented ten minutes, which is a duration rather than a person, and it is in
the table above. **Both figures now carry an explicit line saying the sequence is an illustration
rather than a recording**, and the invoicing one says no client, amount or reference on it belongs
to anybody.

### AND THE GUARD ITSELF HAD A HOLE, found only by proving red

All eight new `ZOMBIES` entries were proved RED against the real files before being trusted green
— and on the first attempt **three of them passed**, which is exactly what a false green looks
like.

The cause: `DISOWNED`, the heuristic that decides whether a nearby sentence is refusing a claim
rather than making it, carried the bare stem **`refus`**. The three injected claims were of the
form *"most late payments are forgotten, not refused"*. The word inside the claim satisfied the
heuristic and exempted the entire five-line window.

**A disowning heuristic that a claim can satisfy by containing the word "refused" is not a
heuristic. It exempts precisely the sentences most likely to be about refusal.** Narrowed to the
forms this repo actually uses when it disowns something ("refuses to", "a deliberate refusal",
"the paper explicitly refused", "standing refusals"), which leaves "not refused" outside it. All
eight re-proved red naming their lines and reasons, restored, green, **56 assertions passing**,
and the whole suite re-run to confirm nothing else had been passing on the loose stem.

**This hole had been in the file since it was written on 2026-08-03**, through five rounds of
entries. It was found because the round proved red, which is the discipline, rather than because
anybody suspected the regex.

---

## G4 — defects found by LOOKING

### AN INVENTED KEY, IN ALT TEXT, ON A PLATE

`register-keys.jpg`'s alt text and its entire caption were built around a **CHARGE** key sitting
beside the RECEIPT key, contrasting "money arrived" with "somebody owes you", with a century of
shop counters understanding the difference. **There is no CHARGE key in the photograph.** The alt
also described "the scrolled ironwork of the machine's frame", and the case is polished wood.

Both were written from the catalogue description plus invention, and only shooting the plate at
its shipped crop found it. This is the same class as Round E's three fabricated Hudson Valley
addresses and Round F's invented person with an invented telephone number, arriving this time in
alt text, on a photograph, on the article whose own argument is that a note in an email is not a
receipt. The caption now argues from what is visible: RECEIPT is a separate key from every amount
key, because entering a figure and producing evidence of it are two different actions.

**It took two passes to get right.** G4 fixed the CHARGE key and the ironwork; G5 found that the
corrected alt still missed a third red key and a small glass display window, and that the caption
had called the machine "a hundred year old register", which is a number nobody established.

Two more alts corrected against the crop rather than against the catalogue:

- the adding machine's right-hand block reads **STOP**, **NON SHIFT** and **NEG**, not "NON ADD"
  and "a multiplication sign", and it carries two arrow keys the alt did not mention;
- the departure board's first legible destination is **Wick**, which the alt omitted entirely,
  and the sixth screen is cut off reading "Informat".

### THE $25,000 BAR WAS A DOT

Drawn against $1 million it is 2.5 percent of the track and rendered as a round cap with a label
beside it, which reads as nothing at all. Round F kept a 0.04 bar as "a small round accent"
because the smallness WAS the finding there; here the finding is the 40x rise, and a dot for the
starting point undersells it while looking like an artefact. **The chart is two bars now and the
$25,000 is in the note with the reason it is not drawn.** Same discipline as topic 14 keeping
Tesseract out of a chart and in the prose.

### FOUR SCENES WERE RESTATING THE PROSE THEY STAGE

The class Round F caught six times, and no gate in this repo can see it: `flagship.test.ts`'s
echo test covers only `statement` scenes, and `siblingOverlap` deliberately excludes scene text.

- the **who-agrees** grid and the **delivery** grid were each enumerated, item for item, in the
  paragraph directly above them;
- the **four kinds of money** likewise;
- the **escalations** chart note and the body both said the three big bars are one finding written
  three ways, in nearly the same words;
- the **ceiling** chart note repeated both the tier explanation and the 84%/15% population point
  that the body carries either side of it;
- the **availability** note and the body both said the threshold is a routine amount in this
  business.

Fixed on whichever side owned the material. A chart note keeps a caveat, because a chart lifted
out of the page has to carry its own; the body keeps the quotes and the argument.

### THE "IN SHORT" OVERSTATED ITS OWN SOURCE

The worst kind of error in this project, because the summary is the part an AI answer lifts. It
said the assistant "finished 39% of its requests without a person ever touching them". The paper
is explicit that Tier 2 is a person doing one small defined task. Corrected on the post and on
the service page's `stat` label, which said "needed a person" and now says "needed a trained
person".

### THE COLD OPEN COUNTED ITS OWN PARTIES TWO DIFFERENT WAYS

It opened on "three people **who do not work for you**" and closed on "one of the three people
whose agreement it needed, and that one **was you**". Both cannot be true, and the hero moment is
"1 of three". The opening now counts you, the listing side and the occupant, and says two of the
three do not work for you.

### Smaller things

- First person singular in both articles ("the part that surprised **me** most while reading").
  An article bylined to the owner cannot report the writer's reading experience.
- A grammar slip introduced by a second-pass edit, "how a brokerage own commission reaches it",
  caught by reading the paragraph back rather than by any tool.

### Band rhythm, measured

`scripts/_scratch-e-bands.mjs`, unchanged.

| post | longest single-tone run | adjacent same-tone pairs |
|---|---|---|
| crm-sync (Round D, unchanged) | 4,176px (**14%**) | 8 |
| ai-scheduling | 3,725px (**12%**) | 10 |
| invoicing-and-payments | 3,529px (**12%**) | 10 |

**Reproducing Round D's published 4,176px exactly on an unchanged post is what validates the
instrument before it is trusted about a new one.** Both new posts are below the whole shipped
range (14% on Rounds C and D, 15-16% on Round E, 14-17% on Round F). **No scene-against-scene
same-tone pair on either post**: all ten adjacent pairs on each are a scene against prose, which
is the shipped pattern on every flagship, and prose is not a band primitive.

### The charts and the calculators were read at full size before they were kept

Every chart was shot at 390 DPR3 at real size and read. No bar label wraps at 390. The
availability chart's smallest bar is one seventh of the largest and renders as a short bar. The
same day chart's smaller bar is one tenth and renders as a stub, which is the geometry Round E
accepted at 9 percent and is why the 2.5 percent bar was removed rather than kept.

Both calculators driven to their maximum at 390 and 1440 with `_scratch-calc.mjs`: **`overflowX=0`
on all four runs**, both ladders reconcile with their headline at rest and at maximum, and neither
resting state shows anything alarming before the reader touches it (192 agreements never given;
16 events heard about late).

---

## G5 — the second pass, and BOTH of its unchecked REASONS were wrong

Rounds D, E and F each caught themselves asserting an unverified fact as the stated grounds for a
refusal. This pass hunted that class first. There were two refusals in this round that rested on
a reason, and **following them changed both**.

### 1. "Nobody has published how often a listing side declines"

I had looked for nothing. Followed: **the largest showing scheduling platform in the country sits
on exactly this data and publishes a monthly index off it**, and its own page describes that index
as *"A Leading Indicator of Current and Future Demand Trends in the Real Estate Industry"*. It
counts showings that happened. The share of requests refused, and how long the rest took to be
answered, is not in it, and it could not be found published anywhere else. **The refusal stands
and the reason is now true, narrower and more useful**, because it tells the reader where the data
exists and what is missing from it.

### 2. "The figures in circulation state no sample"

**False as written.** Figures for how many invoices are late do exist and the most prominent of
them states a sample: the **QuickBooks Small Business Late Payments Report**, which describes
itself as based on *"a 2025 survey of more than 2,000 small businesses"* and is published by a
company that sells invoicing software.

But that is a count, and the claim this round killed was a *reason*: that late payments are
forgotten rather than refused. **Nothing measures that**, and none of the counts is about a
brokerage. The corrected version says all three things, and it is in the calculator note, in the
guard's own `why` string, and in two docstrings, because a reason that lives in only one of those
places will be re-derived wrongly by whoever reads the other.

**Note what this did to the killed claim: it survived the correction.** The claim is still dead
and it is now dead for the right reason, which is the whole point of following rather than
asserting.

### Twenty six more assertions about the world, rewritten

The full list, because the pattern is the useful part: *"almost everything published about
scheduling software is written by the people selling it"*, *"the single best predictor of how hard
it will be"*, *"the standard that runs the world's calendars"*, *"the overwhelming majority of
what gets built on top of it"*, *"the most common thing that will ever happen to this system"*,
*"almost nothing in this market surfaces it"*, *"a vendor who has thought about scheduling for
more than a fortnight"*, *"which is most of a working week"*, *"most of them look identical from
your side"*, *"which in this industry is most of them"*, *"closings are usually run by an attorney
or a title company"*, *"almost every article about invoicing"*, *"usually filed under closing
disclosures and mostly ignored by the sales side"*, *"the two day schedule that most people
vaguely believe in"*, *"choosing between them is usually done by whoever pays"*, *"the arrangement
most businesses actually want"*, *"most of the value in this whole topic"*, *"the exception that
applies to this industry more than to almost any other"*, *"Six thousand seven hundred and twenty
five dollars is not an unusual amount in this business"* (now a question the reader answers from
their own deposits), *"Nobody at the other end is going to remember"*, *"every dashboard you will
ever be shown"*, *"far fewer of these messages in a month than it sends appointment reminders in a
week"*, *"that happens most weeks in a working business"*, *"a two person brokerage can easily
have a dozen referrals"*, and in the scene copy *"it never gets counted as a party"*, *"so does
every calendar you have ever used, and almost nobody uses it deliberately"* and *"it is usually
not a setting at all"*.

Two more on the service pages: *"which covers most showings on somebody else's listing"* and
*"the step most invoicing tools do not have"*.

### One judgement kept rather than changed, recorded so a checker can disagree knowingly

The scheduling post's comparison **"Answering in four seconds with a time looks better on a screen
recording than answering in four seconds with a request"** keeps its four seconds. It is the same
figure on both sides of a comparison, so it is a device rather than a measurement, and removing it
makes the sentence worse without making it truer.

---

## Verification

All gates FOREGROUND, on the disk as committed, against the single existing `:3100` dev server.
No second server was started. The Vercel build is authoritative and this builder cannot push.

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npm test
 Test Files  93 passed (93)
      Tests  1271 passed (1271)
   Duration  13.04s

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
ai-scheduling                   6242            24             5             8             7             3  ...   0
invoicing-and                   6151            23             9             8             7             4  ...   0
required                        3587            19             4             5             6             2  ...   2
available                       5725            22             5             8             7             3   <- --ratchet

all 17 posts meet the standard.

$ node scripts/check-svg-crop.mjs http://localhost:3100
PASS  ai-scheduling-real-estate-showing-confirmations 24 text nodes in role="img" graphics
PASS  invoicing-and-payments-real-estate-brokerage   28 text nodes in role="img" graphics

402 text node(s) checked, 0 cropped.
```

The fifteen shipped posts were re-proven green by the SVG guard in the same run before it was
trusted about the two new ones.

Test baseline: **93 files / 1251 tests** at the end of Round F, **93 / 1271** after this one. Up,
never sideways. The 20 new tests are the two topics joining the table-driven content contract in
`lib/blog/flagship.test.ts` (ten checks each). The eight new `ZOMBIES` entries add no test of
their own by design: each is checked against every file the guard already reads.

**Three tests failed on the way and every one of them was right.** `flagship.test.ts`'s
"has no payload the body never places" caught a `plate` scene on topic 17 with no marker staging
it, which is the class Round E caught on skip-tracing and Round D caught three of.
`index.test.ts`'s meta-description band caught both new `seoDescription` strings at 243 and 225
characters against a 170 ceiling. And the zombie guard failed the red proof for the right reason,
described in G3.

### score-flagship: 17/19 for BOTH, and both reds are true

```
$ node scripts/score-flagship.mjs ai-scheduling-real-estate-showing-confirmations http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs invoicing-and-payments-real-estate-brokerage http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.
```

Same two honest reds as Rounds B to F, for the same two reasons. Films are owner-held. `updated`
is deliberately absent with a comment in `content/blog/posts.ts` saying so, because a post written
and shipped inside one day has not been revised. **Nothing was faked and no baseline was moved.**
Both slugs report `visible=false`, so D5's repaired diagnostic (which now reads the rendered
`time[datetime]` rather than the word "updated" in prose) is failing on the dates, which is the
true reason.

### Rendered and read, at 1440 and 390 DPR3

Every scene of both posts, both service pages and the blog index, with every `.reveal` asserted at
opacity 1 before the shutter, plus a full-page strip of each post at both widths.

```
scrollWidth == viewport width at 320, 390 AND 1440:
  /blog/ai-scheduling-real-estate-showing-confirmations
  /blog/invoicing-and-payments-real-estate-brokerage
  /services/ai-scheduling   /services/invoicing-and-payments   /blog
0 page errors on every one of them.
```

Every plate was judged at BOTH shipped crops before it was chosen and again after it shipped,
which is how the invented CHARGE key was found. Every alt text is written from the 16:9 crop, the
one a phone ships, which is the vertical superset Round F measured.

Every external link was fetched and checked: **13 of 14 returned 200**. The fourteenth is
`nysenate.gov`, whose behaviour is measured and recorded above; it returns 200 to a default user
agent and 403 to anything that looks like a browser, and the statute was read in full from it.

Probe rails held. `**/api/lead` was aborted in every browser run. Rather than assert the media
rail held, it was measured: all five pages were loaded again at 1440 with a request listener
counting anything matching `api/media`, `mlsgrid` or `DATA-API`, each scrolled to the bottom, and
the count came back **0 across all five**. No film, avatar or HeyGen work. Nothing touched in
`next.config.ts`, the CSP, security controls or `lib/idx`.

**Two known probe limitations, recorded rather than papered over.**
`_scratch-e-overflow.mjs` skips a wide node only if it has an ancestor with `overflow-x: auto` or
`scroll` and does not check `hidden`, so it lists the service pages' hero wash as one "offending"
node at 320 and 390 even though the document does not scroll. The authoritative line is
`scrollWidth`, which is 0px over everywhere. And **`export MSYS_NO_PATHCONV=1` is required before
any probe taking a leading-slash path**, not only for `/images/...` arguments: without it
`_scratch-e-overflow.mjs /blog/...` navigates to
`http://localhost:3100C:/Program Files/Git/blog/...`. Round F recorded this for the plate swatch;
it applies to every probe in the namespace.

---

## THE RATCHET WAS NOT RUN, and this is the fifth round to decline for the same reason

`available` measures **proseWords 5,725, sections 22, citations 5, faqQuestions 8, bodyImages 7,
dataGraphics 3**. Ratcheting would raise `proseWords` to 5,725, `sections` to 22, `citations` to
5, `faqQuestions` to 8 and `dataGraphics` to 3, which puts **six of the fifteen older posts below
the bar by construction**: ai-chat (3,597), ai-voice (3,587), database-reactivation (3,675),
ai-lead (3,653), workflow-automation (3,667) and ai-appointment (4,674) are all under 5,725, five
carry 2 data graphics rather than 3, and six carry fewer than 8 FAQ questions.

The gap has grown again. Round F measured `available` proseWords at 5,503; it is 5,725 now, and
`sections` has gone from 21 to 22, because every long post that ships raises the median.

Closing it honestly is still a six-post writing job rather than a flag flip. Rounds C, D, E and F
measured it and declined for exactly this reason; the brief for this round says explicitly not to
ratchet. **So the bar was measured, reported and left where it is, and both new posts were built
well clear of it** (6,242 and 6,151 prose words, 24 and 23 sections, 5 and 9 citations, 8 FAQ
entries each, 3 and 4 data graphics) so the next ratchet is not made harder by them.

**Recommendation for the orchestrator, unchanged from Rounds C to F and now five rounds old:** it
is six posts, it grows with every round, and it is a deliberate writing round.

---

## Deliberately NOT done, and why

1. **The ratchet.** See above. Measured, reported, left where it is.
2. **Films.** Owner-held, out of scope by instruction. C3 stays honestly red on both.
3. **`_scratch-echo.mjs` promoted to a committed test.** Rounds C, D and E recommended it and
   found it printed only false positives; Round F found the class by eye on six scenes and wrote
   a specification for what a real test would need (compare a scene's NOTE against the paragraphs
   adjacent to its MARKER, not a grep for shared strings anywhere). **This round found the class
   by eye on four more scenes**, which makes it ten across two rounds and the strongest standing
   argument in this file for building it. Still a piece of design rather than a side effect of a
   build round. **Recommended, with Round F's specification unchanged.**
4. **`stat.source` made REQUIRED.** Twelve of twenty pages now carry one, up from ten. Still the
   right call and still a dedicated pass.
5. **`ai-appointment-booking.ts`'s own double-booking absolutes.** See below. Out of scope by
   instruction and flagged rather than fixed.
6. **Tier reassignment**, still an owner call. `ai-scheduling` is `tier: "more"` and now carries a
   6,242-word flagship.
7. **New York licence law and the broker escrow rules.** Unreachable. Nothing asserted.

## Defects found and NOT fixed

- **`content/services/ai-appointment-booking.ts` carries the same absolute this round killed on
  the scheduling page, in three places.** Line 54: "Read live from your calendar, so nothing
  double-books." Line 76: "Live availability, so nothing double-books and nothing has to be
  rearranged the next morning." Line 114: "it only ever offers slots that are genuinely open and
  it **cannot double-book you**." All three are true of your own diary and false of the other
  party's, and the new scheduling flagship says so in as many words on a page that page links to.
  **Not fixed because it is not one of this round's two service pages**, and a builder editing a
  neighbouring page without its post in front of it is how drift starts.
  **AND THE GUARD DOES NOT CATCH IT, which was checked rather than assumed.** The first draft of
  this log claimed the new `double-booking that cannot happen` entry would fail on those three
  lines. It does not: the committed pattern requires `nothing double-books and nothing has to be
  undone` and the booking page says `rearranged`, and it requires `can only ever offer` where the
  booking page says `only ever offers`. Run against that file today the pattern matches **0**
  lines. Whoever fixes the page should widen the entry to `nothing double-?books|cannot
  double-book you|only ever offers? (time|slots) that (is|are) genuinely (free|open)` **in the
  same commit as the rewrite**, because widening it first turns the suite red on a page nobody is
  fixing, and this repo does not carry red tests.
- **The `/ai` COPY drift is now NINE keys wide.** `ai-scheduling.why` and
  `invoicing-and-payments.why` no longer match the COPY object in `~/realtylt-ai-page`, joining
  `data-enrichment.why`, `data-enrichment.lede`, `marketing-automation.why`, `crm-sync.why`,
  `local-seo.why` and Round B's two. Both were changed because both were contradicted or
  unsupported: "conflict-free booking" is the absolute the whole scheduling post disproves, and
  "cut the wait from weeks to days" is a quantified outcome with nothing under it. Reconciling
  nine keys is an owner decision.
- **`invoicing-and-payments.ts` `title` still says "Get paid faster, chase invoices never"** and
  the `lede` still promises follow-up "until the money is in your account". Both are /ai COPY
  seeded verbatim. "Never" is an absolute on a page whose own new limits say the product does not
  collect a debt, and "until the money is in your account" promises an outcome the page elsewhere
  says depends on the debtor. **Flagged for the owner rather than changed**, because changing an
  H1 and a lede widens the drift above from nine keys to eleven.
- **The `lede` also states our own cadence, "a friendly nudge at 3 days, 7, then 14".** That is a
  product fact about our own build rather than a claim about the world, so it stays, but the page
  now says in `howItWorks` that the timings are yours to set, which is either a contradiction or a
  default. Which one is an owner question, below.
- **`scripts/_scratch-g-lic.mjs` prints `?? CHECK` on correctly licensed photographs**, because it
  matches on the anchor's visible text ("Some rights reserved") rather than on the href it also
  prints. Harmless, and it should match the URL.
- **The floating rail sits over the calculator note** at one scroll position on both posts at
  1440. Standing rail behaving as designed on every flagship, not a Round G regression, noted only
  because it appears in the shot.

## Unknown product facts, for the owner, not writable

1. **When a showing needs another office's approval, does our build tell the client a TIME or a
   REQUEST?** This is the single most important product fact in topic 16 and the whole article
   turns on it. The service page now says a client is told a request has gone in rather than told
   a time. If the build sends a time, the page is over-claiming on exactly the point the article
   says is the expensive one.
2. **Does the build release a held slot when the proposal dies?** The page says it holds the slot
   the moment it is taken. Holding without releasing is the failure the post names, and it is a
   one-line behaviour that nobody notices for a month.
3. **What does the build do with a counter?** A reply saying "not eleven, maybe two" is neither a
   yes nor a no and the paper says some version of it is the biggest single reason a real agent
   had to call a person. Does it have a state for it, or does it round it to one of the other two?
4. **How many chases does it send before a person is told, and who is told?** The page says it
   chases once and then hands over. If it chases indefinitely, the queue grows and the client
   hears nothing, which the post names as the worst outcome.
5. **Does the build re-ask for confirmation when an appointment moves?** RFC 6638 requires a
   server to clear every attendee's status on a reschedule, and the page now says a moved time is
   re-confirmed rather than assumed. Whether ours does is a fact about the product.
6. **Does anything in the invoicing build actually ASK whether an outside event happened?** This
   is the half topic 17 says is worth paying for, and the service page now describes it as the
   first `howItWorks` step. If it does not exist, that step is aspiration.
7. **How does the build decide a payment was received?** The post says a message from the person
   who owes you is not a receipt, and the page's fifth step says it reconciles against the bank.
   Whether that is a bank feed or an email is the difference between a ledger and a fiction.
8. **Is the 3, 7 and 14 day cadence a default or a fixed sequence?** The /ai copy states it as a
   fact about the product and the new `howItWorks` says the timings are yours. One of those is
   wrong.
9. **Does anything we build ever touch a client or escrow account?** The post and the page both
   say it does not. That needs to be true rather than assumed, and it is the one claim on either
   page with a licence attached to being wrong.
10. Rounds A to F's remain open: whether the voice agent records audio, whether review automation
    as built sends the Google link to everybody, the review widget's selection rule, whether the
    booking layer sends a real calendar invitation and what calendar access it requests, whether
    RealtyLT manages the Google Business Profile or advises on it, whether area pages ship with a
    human editing step, whether the CRM sync has a review queue, the default conflict rule,
    whether agent-workforce builds draft or send by default, whether there is a readable run log,
    whether skip-tracing builds record a source and a date, what permitted purpose the enrichment
    account is established under, whether the pipeline scrubs the do-not-call registry, whether
    marketing builds set up SPF, DKIM and DMARC, whether Google Postmaster Tools is set up,
    whether document-processing builds abstain or always return a value, where a flagged value
    goes and who works that queue, whether the source document and page number are stored, the
    default overwrite behaviour on an enrichment pass, whether enrichment writes a source and a
    date, and whether the BatchData response carries an age.
