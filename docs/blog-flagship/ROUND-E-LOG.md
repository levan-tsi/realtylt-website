# ROUND E — the photograph shortage, and the two topics about where a message came from

**Built 2026-08-25.** Scope: the editorial photography problem that was blocking topics 12 to 20,
then `skip-tracing-lead-generation` and `marketing-automation` written to the flagship standard,
their service pages synced, and the claims the research killed on the way. Five commits on `main`,
**not pushed**: the orchestrator verifies and pushes.

```
0e0b022  E0  eleven new editorial plates, every licence read on its own source page
abfb37f  E1  topic 12, skip tracing, argued as an acquisition rather than as a lookup
308dcb1  E2  topic 13, marketing automation, argued as distribution you do not control
5940b8d  E3  the two service pages synced, and eight claims that did not survive the research
0ad4b35  E4  the second pass, and a REASON that was wrong
```

**Two posts, ZERO new components.** Thirteen topics on the template now and twelve in a row that
add none. The bespoke-component hatch was not opened and did not need the calculator-lesson test.

---

## E0 — THE PHOTOGRAPH PROBLEM, and it is solved with a documented surplus

Round D closed with "the licensed photo set is effectively exhausted ... Topic 12 will have to
reuse or the owner will have to add images." Fourteen new photographs now sit in
`public/images/editorial/`, nine of them spent on this round's two posts and **five deliberately
unspent** for the rounds after it.

### The licence rails, and the one place the brief and the repo disagreed

The brief permitted CC BY-SA. **The repo does not, and the repo wins.**
`public/images/ATTRIBUTIONS.md` states "CC BY-SA is deliberately not used, its share-alike terms
are a question nobody should have to answer later", and `lib/images/attributions.test.ts` has a
committed test that fails on any BY-SA row. Everything below is CC BY 2.0.

**Every licence was read on the photo page itself**, not taken from a search index.
`scripts/_scratch-e-licverify.mjs` fetches each Flickr photo page and prints the licence id it
finds there, mapping the ids the project does not allow to an explicit `<< NOT ALLOWED` rather
than to silence. Fourteen pages fetched, fourteen came back CC BY 2.0.

### Two instrument errors, both of which look exactly like an empty catalogue

1. **`scripts/fetch-images.mjs` no longer works and does not say so usefully.** It calls the
   Openverse API with no credential and that endpoint now answers **401** to an anonymous
   request (measured: four queries, all 401). A throwaway application registers anonymously at
   `POST /v1/auth_tokens/register/` and exchanges for a bearer token at
   `POST /v1/auth_tokens/token/`. **The credential was never written into this repository**; it
   lived in a scratchpad file for the length of the round and `_scratch-e-photohunt.mjs` reads it
   from `OPENVERSE_TOKEN`.
2. **Flickr records in that catalogue carry NULL width and height.** The first version of the
   hunt filtered on `r.width`/`r.height` and reported "0 of 40 wide enough for a 21:9 plate" for
   every query. Checked directly on one record: `filesize`, `filetype`, `width` and `height` are
   all null in the search response; they live on the detail endpoint. **A filter reading a null
   as a zero rejects everything and is indistinguishable from a catalogue with nothing in it.**
   Geometry is now judged where it has to be judged anyway, on the downloaded file at the crop
   that ships.

Openverse's default mix answers mostly from Wikimedia, whose free-text index is poor at ordinary
subjects: four queries for storefronts, letterboxes and noticeboards returned nothing usable.
`source=flickr` is where the register of the existing plates lives (every shipped
`listings/house-*.jpg` is Flickr CC BY 2.0) and is what the hunt uses.

### The ledger

Encoding matches `scripts/compress-images.mjs`, which is the repo's convention: max width 1920,
JPEG quality 72, mozjpeg. The shipped `listings/house-*.jpg` run 90KB to 391KB and are mostly
1024px wide; these run 33KB to 395KB, so they are in family.

| file | photographer | where it went |
|---|---|---|
| `editorial/mailboxes-row.jpg` | _Imaji_ | skip tracing, plate one |
| `editorial/mailboxes-receding.jpg` | sf-dvs | skip tracing, cover |
| `editorial/mailbox-road.jpg` | Bob | skip tracing, cold-open field |
| `editorial/ledger-names.jpg` | peagreengirl | skip tracing, plate two |
| `editorial/no-solicitation.jpg` | upyernoz | skip tracing, plate three |
| `editorial/flyer-kiosk.jpg` | Richard Ha | marketing automation, plate one |
| `editorial/index-drawers.jpg` | waferboard | marketing automation, plate two |
| `editorial/notice-board.jpg` | Joel Kramer | marketing automation, cover |
| `editorial/post-office-boxes.jpg` | Robert Stinnett | marketing automation, cold-open field |
| **`editorial/mailbox-mist.jpg`** | Michele Dorsey Walfred | **UNSPENT** |
| **`editorial/tool-wall.jpg`** | huw-ogilvie | **UNSPENT**, suggested: custom-automation |
| **`editorial/clock-not-in-use.jpg`** | Elliott Brown | **UNSPENT**, suggested: ai-scheduling |
| **`editorial/office-stamps.jpg`** | mpclemens | **UNSPENT**, suggested: document-processing |
| **`editorial/register-keys.jpg`** | Steve Snodgrass | **UNSPENT**, suggested: invoicing-and-payments |

All CC BY 2.0, all attributed in `public/images/ATTRIBUTIONS.md` with the photographer as named
on the source page and the source URL. **The suggestion is a suggestion, not a reservation**: a
plate has to earn its band in the article it lands in, and sourcing a new one is now a fifteen
minute job with the tooling in place.

### THE RULE FOR THE NEXT ROUND, and it is cheaper than it looks

**Two plates is enough.** Round D's posts carry two each and measure `bodyImages: 7`; the floor
is 6 and four images arrive free on every post (the author portrait plus the three "keep reading"
cards, plus the cold-open field). So a topic needs **two photographs of its own**, not six. Five
unspent covers two and a half more topics; after that, run the three scratch scripts in order:
`_scratch-e-photohunt.mjs` (search) then `_scratch-e-photoget.mjs` (download and re-encode, and
it stages into `public/_ecand/` rather than `public/images/`, because the licence test fails on
any unrecorded file under `public/images` and twenty candidates there turns the suite red for
the length of the round) then `_scratch-plateswatch.mjs` (judge at the real 21:9 crop).

### Five photographs rejected, and the reason is the interesting part

- **A green mailbox at a Lancaster farm road reading "Abram K Stoltzfus 547".** The single best
  photograph for this article: a name and a number on a box at the roadside, publicly displayed,
  which is exactly the argument. Rejected **because** it is exactly the argument. Publishing a
  legible real person's name and street number on an article about tracing people is the thing
  the article tells you not to do. It was also lomo-processed, which would have been reason
  enough on its own.
- **A hand-lettered "PLEASE GO AWAY" sign.** Very good picture. Its text runs "We know who we are
  voting for. We have found Jesus." Politics and religion on a real estate marketing page.
- **A storefront with a hand-written "CLOSED DUE TO CORONA VIRUS" notice.** Dates the picture to
  one specific event, on a page published in 2026.
- **A black-and-white county courthouse.** Off-register against a colour plate set.
- **A pegboard whose visual subjects are a Coca-Cola sign and a Shell thermometer.** Two
  third-party trademarks as the subject of a photograph on a commercial page.

**One judgement recorded rather than hidden:** the flyer kiosk carries, among forty overlapping
sheets, a printed advertising photograph of a person's face about thirty pixels across. It is a
photograph of a public noticeboard, the face is incidental and is not the subject, and the plate
was kept. Noted so somebody else can disagree with it knowingly.

---

## The risk this round was set up to fail, and how the seams were drawn

Topic 13 has **three** near neighbours, not one, and all three were read in full before a word was
written. Topic 12 has one, and it owns everything anybody normally writes about the subject.

| | topic 3, reactivation | topic 5, workflow | topic 6, review | topic 12, skip tracing | topic 13, marketing automation |
|---|---|---|---|---|---|
| the unit | a lapsed contact | a step of WORK | one moment | one traced NUMBER | a standing INSTRUCTION |
| the question | has the permission expired | what does the manual version cost | when to ask | where did it come from | who decides whether it arrives |
| the law it owns | TCPA, DNC windows, revocation | none | Google policy, FTC reviews rule | DPPA, FCRA | CAN-SPAM, the CFR opt-out rule |
| the held moment | 2023 | 25 minutes | 12 reviews | **$2,500** | **0.3 percent** |
| the calculator's unit | money, once | hours a year | hours a year | a COUNT of records to account for | a COUNT of complaints allowed |
| what it refuses | any rate of ours | the 25 min 26 sec | the unsourceable 73% | a match rate, and any deal rate | any open rate, and your own spam rate |

**The TCPA is deliberately not in topic 12.** Topic 3 already carries 47 CFR 64.1200(f)(5) and its
eighteen and three month windows, the autodialer rule, revocation, the $500 in 47 U.S.C. 227(b)(3)
and the $16,000 debunk. Topic 12 hands the reader there by name in one paragraph and one FAQ, and
spends its own length on the half topic 3 cannot reach: the situation where there was never any
permission at all, and the two statutes that govern the acquisition rather than the call.

**Nothing on this website had ever mentioned CAN-SPAM, deliverability, authentication, a spam rate
or an open rate.** Checked by grep across every post body before topic 13's scene file was written,
which is why that topic gets to be about them.

**Measured: sibling overlap 0 for both, and 0 across all thirteen posts.** It was **10 and 10** on
the first run and every shared phrase was mine. See E2's commit and the section below.

---

## E1 and E2 — the sources, each read in the primary document, none previously spent

### Topic 12: `/blog/skip-tracing-real-estate-legal-owner-phone-numbers`

*"You Have Her Number. She Never Gave It to You."* Thirteen scenes, zero components, no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **Driver's Privacy Protection Act, 18 U.S.C. 2721 to 2725** | The definition, 2725(3): *"'personal information' means information that identifies an individual, including an individual's photograph, social security number, driver identification number, name, address (but not the 5-digit zip code), telephone number, and medical or disability information."* The consequence, 2722(a): *"It shall be unlawful for any person knowingly to obtain or disclose personal information, from a motor vehicle record, for any use not permitted under section 2721(b) of this title."* The clause the trade leans on, 2721(b)(8): *"For use by any licensed private investigative agency or licensed security service **for any purpose permitted under this subsection**."* The two that look like they fit and do not, 2721(b)(3): *"...but only (A) to verify the accuracy of personal information submitted by the individual to the business ... and (B) if such information as so submitted is not correct ... to obtain the correct information, but only for the purposes of preventing fraud by, pursuing legal remedies against, or recovering on a debt or security interest against, the individual"*; and 2721(b)(12): *"For bulk distribution for surveys, marketing or solicitations if the State has obtained the express consent of the person to whom such personal information pertains"*, with express consent separately defined at 2725(5) as *"consent in writing"*. The auditability, 2721(c): a reseller *"must keep for a period of 5 years records identifying each person or entity that receives information and the permitted purpose for which the information will be used."* And the teeth, 2724: *"shall be liable to the individual to whom the information pertains"*, and the court may award *"actual damages, but not less than liquidated damages in the amount of $2,500."* | law.cornell.edu |
| **Fair Credit Reporting Act, 15 U.S.C. 1681a and 1681b** | The definition that turns on purpose rather than on content, 1681a(d)(1): a consumer report is any communication *"bearing on a consumer's credit worthiness, credit standing, credit capacity, character, general reputation, personal characteristics, or mode of living **which is used or expected to be used** or collected in whole or in part for the purpose of serving as a factor in establishing the consumer's eligibility for"* credit, employment, or any purpose authorised by 1681b. The prohibition, 1681b(f): *"A person shall not use or obtain a consumer report for any purpose unless (1) the consumer report is obtained for a purpose for which the consumer report is authorized to be furnished under this section; and (2) the purpose is certified in accordance with section 1681e."* And the one a business would reach for, 1681b(a)(3)(F)(i): a legitimate business need *"in connection with a business transaction that is initiated by the consumer."* | law.cornell.edu |
| **U.S. Census Bureau, CPS ASEC Table A-1, "Annual Geographic Mobility Rates, By Type of Movement: 1948-2023"** | Read in the Bureau's own `hst_mig_a_1.xlsx`: the workbook was unzipped and the 2023 row read out of the sheet XML rather than out of anybody's summary. In thousands: total movers 25,624; same county 13,851; different county same state 5,987; different state 4,493; from abroad 1,294. The method, from the workbook's own notes: *"One-year geographic mobility is measured as living in a different residence exactly one year prior to completing the survey."* And *"Estimates may not sum to totals due to rounding."* **This is a different survey and a different publication from the Census surname data Round D spent.** | census.gov xlsx |
| **Federal Trade Commission, National Do Not Call Registry Data Book 2024** | Read in the Commission's own PDF with `pdftotext`. The size: *"Since its inception in 2003, the Registry has continued to grow. As of September 30, 2024, there were 254 million active registrations."* Why that is not a headcount: *"For the purposes of this report, 'active registrations' are those registrations consumers have placed on the Registry that have not been subsequently deleted ... The FTC removes numbers that have been disconnected and reassigned. Numbers that have been disconnected but not reassigned remain on the registry."* The honesty: *"Statistical data on complaints is based on unverified complaints reported by consumers, not on a consumer survey."* FY2024 by call type: Robocall 1,099,223, Live Caller 763,970, Call Type Not Reported 221,940, which sum to the 2,085,133 the same document gives as the year's total. | ftc.gov PDF |
| **FCC Second Report and Order, Reassigned Numbers Database, FCC 18-177, December 2018** | Read in the Commission's own PDF with `pdftotext`. The mechanism: *"Once a consumer disconnects a number, he or she might not update all parties who have called in the past. When the old number is eventually reassigned, callers may inadvertently reach the new consumer who now has the reassigned number."* The scale: *"Approximately 35 million numbers are disconnected and made available for reassignment to new consumers each year"*, and footnote 17, which is the reason this stays in the prose: *"See North American Numbering Plan Administrator Number Resource Utilization/Forecast Reports (average of aggregate numbers for the period January 1, 2013 through December 31, 2016). While a number of parties have cited this figure, we note that at least one party has questioned whether the figure accurately reflects the volume of number reassignments. In the Reassigned Numbers NOI we sought comment on whether this number accurately reflects the volume of number reassignments, but received no other credible estimate."* | docs.fcc.gov PDF |
| **47 CFR 52.21(m)** | Added in the SECOND PASS, to correct a reason the article had asserted. *"The term number portability means the ability of users of telecommunications services to retain, **at the same location**, existing telecommunications numbers without impairment of quality, reliability, or convenience when switching from one telecommunications carrier to another."* | law.cornell.edu |

**Cited data graphics:** Census movers by destination (four bars, **no axis maximum** because these
are counts, the smallest is 9 percent of the largest and renders as a short bar rather than a
hairline, the same-county bar lit because it is the finding) and the FTC complaints by call type
(three bars, **no axis maximum**, and the **live caller** bar lit, because the whole public
conversation about unwanted calls is about robots and three quarters of a million of these
complaints were about a human being dialling).

**The 35 million stays in the PROSE with the Commission's own footnote quoted underneath it.** A
figure the publishing body records as challenged, with no better estimate offered, is not a
measurement, and drawing a bar for it would turn a caveat into a fact. Same judgement the local
SEO post made about a negative ROI and the agent post made about `pass^8`.

**The calculator's headline is a COUNT OF RECORDS, not hours.** Chain: properties in the area,
times the share where a number comes back, times the share you would actually dial, times minutes
per attempt, into hours. The headline is the **second** row, because each resolved number is a
thing somebody could ask you about and the answer has to be the same for the first as for the
last. It refuses a match rate (checked, see E4) and refuses any row turning calls into
appointments or commission.

### Topic 13: `/blog/marketing-automation-real-estate-email-deliverability`

*"You Sent It to Fourteen Hundred People. Five Pressed One Button."* Twelve scenes, zero
components, no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **CAN-SPAM, 15 U.S.C. 7704** | The finding that reorganises the topic: there is no consent requirement anywhere in it. What there is, at (a)(3)(A): a *"functioning return electronic mail address or other Internet-based mechanism, clearly and conspicuously displayed"* which *"remains capable of receiving such messages or communications for no less than 30 days after the transmission of the original message."* The deadline, (a)(4)(A)(i): unlawful *"for the sender to initiate the transmission to the recipient, more than 10 business days after the receipt of such request."* And (a)(5)(A): *"clear and conspicuous identification that the message is an advertisement or solicitation"*, notice of the opt-out, and *"a valid physical postal address of the sender."* | law.cornell.edu |
| **16 CFR 316.5 and 316.3, the FTC's CAN-SPAM Rule** | 316.5, which is more practical than the statute: *"Neither a sender nor any person acting on behalf of a sender may require that any recipient pay any fee, provide any information other than the recipient's electronic mail address and opt-out preferences, or take any other steps except sending a reply electronic mail message or visiting a single Internet Web page."* And 316.3(a)(2)(i), the test that decides whether a market note is legally an advertisement: the primary purpose is commercial if *"a recipient reasonably interpreting the subject line of the electronic mail message would likely conclude that the message contains the commercial advertisement or promotion of a commercial product or service"*, or if the relationship content *"does not appear, in whole or in substantial part, at the beginning of the body of the message."* | law.cornell.edu |
| **Google, Email sender guidelines** | The split nobody reports correctly. *"Requirements for all senders"* contains SPF **or** DKIM, valid forward and reverse DNS, TLS, RFC 5322 formatting, and *"Keep spam rates reported in Postmaster Tools below 0.3%."* The separate bulk list applies to *"senders who send more than 5,000 messages per day"* and adds SPF **and** DKIM, a DMARC policy, From-header alignment and *"Marketing messages and subscribed messages must support one-click unsubscribe."* **The 0.3 percent is in the all-senders list.** Also worth its own sentence, from Google: *"Consider unsubscribing recipients who don't open or read your messages."* **And a checked absence: the page carries no figure followed by "day" or "business day" anywhere on it**, which is why the deadlines chart has two bars and not three. | support.google.com |
| **Yahoo, Sender Best Practices** | *"Keep your spam rate below 0.3%."* *"Honor unsubscribes within 2 days."* *"Provide an obvious and visible unsubscribe process that doesn't require users to log in."* And the caveat almost nobody quotes, which is the reason the calculator computes a ceiling rather than a rate: *"Spam rate is calculated in our system based on mail delivered to the inbox, keep this in mind when referencing."* | senders.yahooinc.com |
| **RFC 7208 (SPF), RFC 6376 (DKIM), RFC 7489 (DMARC)** | Each quoted from its own abstract. SPF: a domain owner *"can explicitly authorize the hosts that are allowed to use their domain names, and a receiving host can check such authorization."* DKIM *"permits a person, role, or organization that owns the signing domain to claim some responsibility for a message by associating the domain with the message."* And DMARC, which the whole deliverability trade sells the opposite of: **"DMARC does not produce or encourage elevated delivery privilege of authenticated email."** | rfc-editor.org |
| **RFC 8058, one-click unsubscribe** | The technical problem: anti-spam software *"often fetches all resources in mail header fields automatically"*, so senders added confirmation pages, *"and that makes the unsubscription process more complex than a single click."* Then the business case, written into an internet standard on the sender's behalf: *"Hence, the mailers want to make it as easy as possible for recipients to unsubscribe; if an unsubscription process is too difficult, the recipient's alternative is to report mail from the sender as junk until the mail no longer arrives."* And the dependency, section 4: *"senders MUST apply at least one valid DKIM signature"*, and without it *"the mail receiver SHOULD NOT offer a one-click unsubscribe for that message."* | rfc-editor.org |
| **Englehardt, Han and Narasimhan (Princeton), "I never signed up for this! Privacy implications of email tracking", PoPETs 2018(1)** | The non-vendor study with a published method, read in the PDF with `pdftotext`. Method: *"Our crawler visited 15,700 sites and attempted to sign up for emails on each of these. The resulting corpus contains 12,618 emails from 902 distinct senders."* Findings: *"85% of emails in our corpus contain embedded third-party content, and 70% contain resources categorized as trackers"*; *"about 29% of emails leak the user's email address to at least one third party ... The majority of these leaks (62%) are intentional."* Their own limit, quoted in the chart's caveat: *"our corpus of emails is not intended to be representative, and we are unable to draw conclusions about the extent of tracking in the typical user's mailbox."* And their open question, which is this article's thesis handed to it by the primary: *"When a sender sets up a marketing campaign with a mailing list manager, is the tracking disclosed to the sender?"* | petsymposium.org PDF |

**Cited data graphics:** the tracking corpus (three bars, **axis pinned to 100** because they are
shares of a whole, the address-leak bar lit) and the two deadlines (two bars, **no axis maximum**,
the 2 lit).

**THREE bars, not four, and the reason is the denominator.** The same paper reports that *"11% of
links contain embedded content requests that leak the email address"*. That is a share of LINKS,
not of emails, so putting it beside three shares of emails would draw four bars against two
different denominators. It is in the prose. Same discipline topic 11 applied to two disagreeing
tables in one paper.

**The deadlines chart states its own unit problem in its note**: ten business days and two days
are not the same unit, and the difference runs in the safe direction, because ten business days
covers a longer stretch of calendar than ten days and so the drawn gap is smaller than the real
one rather than larger.

**The calculator refuses three numbers, each for a checked reason.** It will not compute the
reader's actual spam rate, and cannot: Yahoo states the denominator is mail delivered to the
inbox in their system, which no sender can see, so what it produces is a ceiling in the reader's
own units. It carries no open or click rate anywhere in the chain, because the section above it
shows what an open actually counts. And there is no row for what a damaged sending reputation
costs in money, because nobody has published one with a method under it.

### Sources deliberately NOT used

- **New York's private investigator licensing, GBL Article 7.** Wanted, because 2721(b)(8) turns
  on a licence and it would have been good to say what one is in this state. `nysenate.gov` and
  `dos.ny.gov` both answer **403** behind Cloudflare to a programmatic request, the same wall
  Round D hit on nysenate. **Nothing about New York PI licensing is asserted anywhere in either
  post.**
- **Lewis and Rao on the economics of measuring advertising returns.** A good fit for topic 13's
  honesty spine and left out because the Englehardt paper is closer to what the product actually
  does, and one non-vendor study carrying its own limitations section is worth more than two.
- **The FTC's inflation-adjusted CAN-SPAM civil penalty.** Real, and a per-email dollar figure is
  the exact shape of the $16,000-per-text number Round B killed on the reactivation page. Left
  out rather than repeated in a different statute's clothing.

---

## E2's sibling bleed, and all twenty phrases were my own two posts talking to each other

`flagship-standard.mjs` put both new posts at **10** against a ceiling of 2 on the first run, and
dragged `ai-chat` to 3 and `automated-google` to 4 as their nearest sibling changed. Every shared
phrase was mine:

- one sentence shingled seven ways: *"it costs nothing, and it will tell you which of those two
  situations you are in"*, written into both cost sections;
- both cost sections opening *"The bill has three parts. There is..."*;
- both limits sections opening *"Everything in this article is about reaching..."*;
- and against the shipped posts: *"there is no price on this page"* (which `ai-chat` also has) and
  *"...assembled at some point in the past and..."*, plus `automated-google`'s *"that is not a
  defect in the..."* and *"it does not need to be"*.

Nine sentences rewritten. Cohort back to **0 on every one of the thirteen**. The bar was not
touched.

**One instrument fixed on the way.** `_scratch-overlap.mjs` carried its own hardcoded copy of the
cohort list and answered **0 for every post, naming no nearest sibling**, because neither new slug
was on it. A diagnostic that silently reports "nothing is wrong" about posts it cannot see is
worse than no diagnostic. It now parses the list out of `flagship-standard.mjs`, which is the same
fix the zombie guard got when its hardcoded list was replaced with a directory read. It PARSES
rather than imports, because that module runs its whole playwright measurement at import time and
`import { POSTS }` executed the entire gate as a side effect.

---

## E3 — the two service pages, and eight claims that did not survive

| file | was | now |
|---|---|---|
| `skip-tracing.faqs` "Is skip tracing legal?" | "Skip tracing from public records and licensed data providers **is legal and standard practice**" | what the two statutes say, that both attach to the person obtaining the data, that this is not legal advice, and the two questions to put to a provider in writing |
| `skip-tracing.figure.rows` | **three invented owner names at three real Hudson Valley street-and-town combinations** | the KIND of property and the KIND of result. See below |
| `skip-tracing.useCases[1]` | "The owners most likely to sell are often the ones who do not live there" | why an absentee record is the one most likely to be stale, and that it says nothing about intent |
| `skip-tracing.useCases[2]` | "A listing that expired **is** a seller who still wants to sell" | a household that was recently willing to have the conversation, and that whether they still want to move is the first thing to find out |
| `skip-tracing.whatItIs[1]` | "nobody else is calling the same rows on the same morning" | gone. A claim about what every other agent in the county is doing this week |
| `skip-tracing.howItWorks[1]` | "Absentee owners, trusts, and out-of-state owners **all resolve the same way**" | what a trust actually resolves to, which the same page's `limits` already contradicted |
| `marketing.why` | "Most leads aren't ready today. They're ready in six months, and **they buy from whoever stayed top of mind**" | the mechanism. Two unsourced claims in one sentence, the second the same shape Round B killed on the voice page, and contradicted by this page's own first limit. **This is /ai COPY** |
| `marketing.faqs[3]` | SMS "is usually the channel that gets opened" | gone. A comparative channel claim with nothing under it |
| `marketing.howItWorks[1]` | "Relevance is what stops the unsubscribe" | relevance is not about keeping people subscribed, it is about not being reported. An unsubscribe costs nothing and the button beside it costs the rest of the list |

**The fabricated addresses are the worst of the nine and they had been live since the page was
written.** The `records` figure carried "412 Verplanck Ave, Beacon NY" with an owner name and a
phone number, and two more like it. `STANDARD.md` says it in as many words: *"A fabricated address
on a page whose argument is that the details are checkable destroys the argument."* On the one
page in the set about finding out who lives at an address, a mocked-up record naming an owner at a
specific local address is the worst possible illustration, whatever the 555 numbers say. The
footnote now says out loud that it is an illustration and that no address or number on it belongs
to anybody.

Both pages gained a sourced `stat` ($2,500 from 18 U.S.C. 2724(b); 0.3% from Google and Yahoo),
new `limits` lifted from their post, and a `howItWorks` step neither had: recording where each
number came from, and setting the sending domain up so mail can arrive.

**Four of the killed claims are guarded in `lib/blog/zombie-claims.test.ts`, PROVED RED before
being trusted green** against the real files rather than a synthetic string: restoring all four
failed the test naming lines 102, 106, 130 and 139 with a reason for each. Restored, green.

**Two of the four are the guard's first NON-NUMERIC entries.** Every previous entry is a figure.
A wrong number is easy to spot; a flat legal conclusion is not, and on the page with the most
legal exposure in the set it is the more expensive of the two.

---

## E4 — the second pass, and a REASON that was wrong

Round D's worst defect was asserting unchecked facts that were themselves the stated grounds for
refusing a figure. This pass hunted that class first and found three.

**1. The portability reason was wrong.** The article said a move does not break a phone number
*"because numbers have been portable between carriers for years"*. Checked: **47 CFR 52.21(m)**
defines number portability as retaining a number **"at the same location"** when switching
carrier. It is not about moving house at all. The conclusion was right and the reason was not.
The article now gives the true one, which is that a mobile number was never attached to a
building, and quotes the regulation on what portability actually means. The chart note carried the
same wrong reason and was fixed with it.

**2. The match-rate refusal had no check under it.** The limits section said *"every published
figure we tried to follow led back to a company selling the service quoting its own results"*. I
had followed none of them. Followed this round: the circulating figures are **bands of roughly 70
to 90 percent**; every page carrying one is a skip-tracing vendor or a page ranking them,
**including one vendor publishing a ranking of its own category with itself in it**; one credits
a trade association study by name and links to no report; none states a sample. The refusal
stands and the reason is now true. It also turned up a better fact, off a vendor's own page: a
**phone hit rate and a connect rate are different quantities**, the second much lower, and the
two get quoted interchangeably. That is now in the post, in the calculator note and in the
service page FAQ.

**3. A sentence contradicted by its own source.** The article said of email trackers that *"the
sender did not add most of them"*. The paper it rests on reports **62 percent of the address leaks
it found as intentional on the sender's part.** The passage now says what the researchers actually
left open and quotes the 62 against itself.

**Ten more assertions about the world I had not checked**, all rewritten into statements about a
mechanism or into something the reader can measure: *"most articles on this subject get
backwards"*, *"almost every article you will read treats the whole page as a bulk sender rule"*,
*"most vendor descriptions of skip tracing have four steps"* (now: our own page did, and it has a
fifth now, which is a checkable fact and a better sentence), *"most providers charge for attempts
rather than for successes"*, *"Google or Yahoo for most addresses"*, *"most people are surprised
by this number"*, *"the one almost nobody looks at"*, *"almost nobody in the industry has read
it"*, *"the single most common mistake in this entire category"*, and *"most of them almost
certainly did not [come from a motor vehicle record]"*, which was a guess about provenance inside
an article arguing that nobody outside the compilers knows it.

**Four invented quantities gone:** "six years ago", "a hundred thousand rows", "survives for two
years", and "in the same fortnight".

**Four more in the SCENE copy**, which is the class that keeps talking after the prose is fixed:
*"almost every campaign that embarrasses somebody is an audience problem"*, *"the right delay ...
is almost never made deliberately"*, *"it is usually thrown away by the time the list arrives"*,
and, inside a calculator input hint, *"between them they carry most consumer addresses"*, which is
the same market-share claim that had just been removed from the body.

---

## Defects found by LOOKING, that no gate could see

**Horizontal overflow on both posts, from the same cause.** The skip-tracing article scrolled
sideways **66px at 390** and the marketing article **32px at 320**. A calculator chain `unit`
renders inside a `shrink-0` cell and cannot wrap: *"numbers whose source you would have to be able
to name"* is 302px of text. `scripts/_scratch-e-overflow.mjs` named the exact span rather than
leaving it to be guessed at, and both are now 0px at 320, 390 and 1440. **The long phrasing
survives where it belongs, in `resultLabel` above the big number, which wraps.**

**A source line that cited the wrong document.** The deadlines chart's `sourceText` read "15
U.S.C. 7704(a)(4) and Yahoo Sender Best Practices. Google's sender guidelines state no deadline in
days." Rendered, the whole string is one hyperlink to Yahoo, so a sentence making a claim about
Google's page was underlined and pointing somewhere else. Only visible in the shipped chart.

**A scene payload with no marker placing it.** `plate-two` on the skip-tracing post existed and was
never staged: twelve scene sections rendered against thirteen payloads. Caught by the structure
probe on the first render, which is the same class Round D caught three of.

**Two adjacent light bands.** The calculator and the offer sat directly against each other with
nothing between them, both fixed-light primitives, producing a 4,958px single-tone run at 15
percent. Moving the offer to the far side of the `wasted` grid brought it to 14 percent.

**A 22 percent single-tone run on the marketing post**, from a light chart sitting between a light
calculator and light prose. Flipping the chart to dark brought it to 16 percent.

### Band rhythm, measured

`scripts/_scratch-e-bands.mjs`, rebuilt this round from its description in ROUND-D-LOG.md because
the original was gitignored and on one machine only.

| post | article height | longest single-tone run |
|---|---|---|
| crm-sync (Round D, unchanged) | 29,874px | 4,176px (**14%**) |
| ai-agent-workforce (Round D, unchanged) | — | 3,934px (**14%**) |
| skip-tracing | 32,110px | 4,881px (**15%**) |
| marketing-automation | — | 4,831px (**16%**) |

**Reproducing Round D's published numbers exactly on the two shipped posts is what validates the
rebuilt instrument.** Against 15% on Round C's two, 16-17% on Round B's, and 24% on the worst
shipped post before that. The first version of this probe walked `art.children` and reported
"3 bands, 97%" on a thirty-thousand pixel article, because the scenes are nested inside layout
wrappers that paint nothing. Reading a structural wrapper as a band is the same class of error as
reading `rgba(0,0,0,0)` as black: a confident number about the wrong object.

### The charts and the calculators were read at full width before they were kept

Both Census bars and both FTC bars have no axis maximum because they are counts; the smallest
Census bar is 9 percent of the largest and renders short rather than as a hairline, which was
checked on the shipped chart rather than predicted. Both marketing charts were read at 390 DPR3.
Both calculators were driven to their maximum at both widths with `_scratch-calc.mjs`: every
ladder reconciles with its headline at rest and at maximum, and neither resting state shows
anything alarming before the reader touches it (240 records to account for; 3.4 complaints).

---

## Verification

All gates FOREGROUND, on the disk as committed, against the single existing `:3100` dev server.
No second server was started. The Vercel build is authoritative and this builder cannot push.

```
$ npx tsc --noEmit
(no output)

$ npm test
 Test Files  93 passed (93)
      Tests  1231 passed (1231)

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
required                        3587            19             4             5             6             2  ...   2
available                       5488            21             4             7             7             3   <- --ratchet

all 13 posts meet the standard.

$ node scripts/check-svg-crop.mjs http://localhost:3100
PASS  skip-tracing-real-estate-legal-owner-phone-numbers 26 text nodes in role="img" graphics
PASS  marketing-automation-real-estate-email-deliverability 22 text nodes in role="img" graphics

292 text node(s) checked, 0 cropped.
```

The eleven shipped posts were re-proven green by the SVG guard in the same run before it was
trusted about the two new ones.

Test baseline: **93 files / 1211 tests** at the end of Round D, **93 / 1231** after this one. Up,
never sideways. The 20 new tests are the two topics joining the table-driven content contract in
`lib/blog/flagship.test.ts` (nine checks each) and the two new `content/blog` scene files the
zombie-claims guard reads from the directory. The four new `ZOMBIES` entries add no test of their
own by design: each is checked against every file the guard already reads.

### score-flagship: 17/19 for BOTH, and both reds are true

```
$ node scripts/score-flagship.mjs skip-tracing-real-estate-legal-owner-phone-numbers http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs marketing-automation-real-estate-email-deliverability http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.
```

Same two honest reds as Rounds B, C and D, for the same two reasons. Films are owner-held.
`updated` is deliberately absent with a comment in `content/blog/posts.ts` saying so, because a
post written and shipped inside one day has not been revised. **Nothing was faked and no baseline
was moved.** Both slugs report `visible=false`, so neither inherits the instrument quirk Round D
recorded on the CRM post.

### Rendered and read, at 1440 and 390 DPR3

Every scene of both posts, both service pages and the blog index, with every `.reveal` asserted at
opacity 1 before the shutter.

```
scrollWidth == viewport width at 320, 390 AND 1440:
  /blog/skip-tracing-real-estate-legal-owner-phone-numbers
  /blog/marketing-automation-real-estate-email-deliverability
  /services/skip-tracing-lead-generation   /services/marketing-automation   /blog
0 page errors on every one of them.
```

Both calculators driven at both widths, every range to its maximum: `overflowX=0` on all four
runs, and both ladders reconcile with their headline at rest and at maximum.

Every external link was fetched and returned 200 before it shipped: all twenty across the two
posts, checked twice, once before E1/E2 and once after the second pass added 47 CFR 52.21 and
RFC 8058.

Probe rails held: `**/api/lead` and `**/api/media/**` aborted in every browser run. No MLS or
DATA-API call on any page or probe path. No film, avatar or HeyGen work. Nothing touched in
`next.config.ts`, the CSP, security controls or `lib/idx`.

**One known probe limitation, recorded rather than papered over.**
`_scratch-e-overflow.mjs` skips a wide node only if it has an ancestor with `overflow-x: auto` or
`scroll`; it does not check `hidden`. So it still lists the decorative cold-open glow and the
service pages' hero wash as "offending" nodes even though the document does not scroll. The
authoritative line is `scrollWidth`, which is 0px over at every width on every page.

---

## THE RATCHET WAS NOT RUN, and this is the third round to decline for the same reason

`available` measures **proseWords 5,488, sections 21, faqQuestions 7, bodyImages 7,
dataGraphics 3**. Ratcheting would raise `proseWords` to 5,488 and `dataGraphics` to 3, which puts
**six of the eleven shipped posts below the bar by construction**: ai-chat (3,597), ai-voice
(3,587), database-reactivation (3,675), ai-lead (3,653), workflow-automation (3,667) and
ai-appointment (4,674) all sit under 5,488, and five posts carry 2 data graphics rather than 3.

Closing that honestly means adding two thousand words and a cited chart to six articles that are
not this round's topics. The repo's discipline is "ratchet at the START of a round"; Rounds C and
D measured and declined for exactly this reason; the brief for this round states the bar as a
given and says explicitly not to ratchet. **So the bar was measured, reported and left where it
is, and the two new posts were built well clear of it** (6,710 and 5,725 prose words, 22 and 23
sections, 10 citations each, 8 FAQ entries each) so the next ratchet is not made harder by them.

**Recommendation for the orchestrator, unchanged from Rounds C and D and now more expensive than
either of them said:** the gap is six posts, not five, and it grows with every round that ships a
long post. It is a deliberate writing round, not a flag flip, and the longer it is left the larger
it gets.

---

## Deliberately NOT done, and why

1. **The ratchet.** See above. Measured, reported, left where it is.
2. **Films.** Owner-held, out of scope by instruction. C3 stays honestly red on both.
3. **`_scratch-echo.mjs` promoted to a committed test.** Rounds C and D both recommended it and
   both found it printed only false positives (heading ids and source URLs). Not extended to
   these two topics, because the recommendation is now two data points old and what it needs is a
   decision about the false-positive class rather than a third measurement. **Still recommended.**
4. **`stat.source` made REQUIRED.** Eight of twenty pages now carry one, up from six. Still the
   right call and still a dedicated pass.
5. **New York private investigator licensing.** Wanted for topic 12 and unreachable behind
   Cloudflare. Nothing about it is asserted anywhere.
6. **Tier reassignment**, still an owner call. `marketing-automation` is `tier: "core"` and now
   carries a 5,700-word flagship, which is the tier mismatch `SERVICES-CRITIQUE.md` records.

## Defects found and NOT fixed

- **The `/ai` COPY drift is now five keys wide.** `marketing-automation.why` no longer matches the
  COPY object in `~/realtylt-ai-page`, joining `crm-sync.why`, `local-seo.why` and Round B's two.
  The claim it carried ("they buy from whoever stayed top of mind") is unsourced and is
  contradicted by its own page's first limit, so it had to go; the journey and the services
  surface now disagree in five places and that is an owner decision to reconcile.
- **`content/services/skip-tracing-lead-generation.ts` `lede` and `specs` still say "verified
  phone and email".** "Verified" is doing work the page's own `limits` and the new flagship both
  qualify heavily: what is verified is that a number is well-formed and not a duplicate, not that
  it reaches that person. Both are `/ai` COPY, seeded verbatim. **Flagged for the owner rather
  than changed**, because changing them widens the drift above.
- **`content/services/marketing-automation.ts` `figure` still describes a six-month behavioural
  sequence with no mention of whether any of it arrives**, which is the whole subject of its own
  new flagship. It is COPY and it is not wrong, only incomplete. Flagged.
- **The floating rail sits over the calculator note** at one scroll position on both posts at
  1440. Standing rail behaving as designed on every flagship, not a Round E regression, noted only
  because it appears in the shot.

## Unknown product facts, for the owner, not writable

1. **Do our skip-tracing builds actually record a source and a date on every enriched row?** The
   post's central argument and the service page's new third `howItWorks` step both say they do.
   That is what a correct build does and it is what the two statutes make answerable. Whether the
   builds we ship carry those fields today is a fact about the product that neither surface
   states.
2. **What permitted purpose is our own BatchData account established under?** The post tells the
   reader to ask their provider this in writing, and the service page now says it is agreed once
   at the start. We should be able to answer it about ourselves, in one sentence, before either
   page goes live.
3. **Does the pipeline check the national do-not-call registry before handing a list to anything
   that dials?** The new fourth `howItWorks` step says the list is scrubbed. If that is aspiration
   rather than description, the page is over-claiming on the one point in this topic that carries
   a private right of action.
4. **Do our marketing-automation builds set up SPF, DKIM and DMARC on the client's sending domain
   as part of the work, or do we assume the client already has them?** The service page's new
   fifth `howItWorks` step says we do. That is a scope question with a real cost attached.
5. **Is Google Postmaster Tools set up for the clients we send for?** The post calls it the most
   concretely useful thing available and the only reputation measurement a small sender has. If we
   do that as standard it is a genuine differentiator and it is currently unwritten.
6. Rounds A to D's remain open: whether the voice agent records audio, whether review automation
   as built sends the Google link to everybody, the review widget's selection rule, whether the
   booking layer sends a real calendar invitation and what calendar access it requests, whether
   RealtyLT manages the Google Business Profile or advises on it, whether area pages ship with a
   human editing step, whether the CRM sync has a review queue, what the default conflict rule is,
   whether agent-workforce builds draft or send by default, and whether there is a readable run
   log.
