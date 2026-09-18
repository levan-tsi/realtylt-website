# SIMPLIFY CHECK — batch 4 (the last six topics)

Checker pass over `6eab055` (BEFORE) vs `379b7d1` (AFTER = working tree). Method: every post body
extracted at both commits and compared **paragraph against paragraph, in full** (the bodies keep
identical line counts, so paragraph N BEFORE pairs with paragraph N AFTER); every changed string in
each scenes file and each service file read in its `git diff 6eab055` form. The four orchestrator
fields (`lede`, `why`, `specs`, `seo`) were skipped by instruction; `keywords` were checked for
survival in the prose instead.

**Verdict for the batch: 0 HIGH, 6 MED, 11 LOW** (by topic: 0/0/5, 0/0/2, 0/0/2, 0/2/1, 0/2/1,
0/2/0). No statute, regulation, ruling, quoted passage,
citation, date, condition, modal or penalty moved. The 78% retraction is intact on every surface.
The six MED findings are all one family: a clause that was governed by something (an `if`, a
subject, a `not X but Y` contrast, an appositive) now stands on its own and says slightly more, or
points slightly elsewhere, than it did.

## Mechanical results (checked, not assumed)

| check | result |
|---|---|
| Quoted passages in the six bodies, byte-for-byte set comparison | 33 before, 33 after, **0 lost, 0 new** |
| ` because ` over body + scenes + service, per topic | 30→30, 20→**21**, 19→19, 20→20, 21→21, 21→21 (the one gain is `FRAGMENTED.basis` reopening a colon, correct) |
| ` may ` / ` must ` / ` should ` / ` can ` counts | no losses in any topic (`can` +1 booking, +4 chat) |
| Em dashes and arrow glyphs | unchanged per topic (8/7/9/8/7/7, all pre-existing in comments); **0 added lines contain one** |
| Hype words | none, before or after |
| Retired claims (`verified`, `callable`, 78%, 23m15s, $16,000/text, 73%) | booking's two `78%` hits are both inside provenance comments; chat's six are the retraction paragraph itself, unchanged |
| `keywords` phrases still present in topic prose | 5/5 on all six service pages |
| Provenance comment lines touched in the 11 batch-4 content files | **0** |
| FILM / `reel` caption lines in the four film scenes files | **0 diff lines touch them** |
| `content/blog/ai-chat-scenes.ts` | `git diff 6eab055` is **empty**. Confirmed untouched. |
| Visitor / transcript turns (`who:`, `turns:`, `figure.turns`) | exactly one line changed in the whole batch, and it is `who: "us"` |
| Paragraphs that shrank by more than 6% | one (booking L67, 73→67 words); read in full, all seven of its ideas survive |
| `updated:` on the six posts | all six = `"2026-09-18"` |

Out of scope but worth naming: `content/blog/posts.ts` carries more than `updated:` in this commit
(a new `seoTitle` field, `seoTitle` values, and rewritten `excerpt`/`seoDescription` strings on posts
from earlier batches). That is the orchestrator's SEO lap, not the builder's brief. Three "NO
`updated`" provenance comments were replaced with comments that record why the date was added; the
history is preserved rather than deleted, so law 10 is not broken, but the orchestrator should
confirm those replacements are its own.

---

## 1. AI APPOINTMENT BOOKING

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 1.1 | LOW | `content/blog/ai-posts.ts` `AI_APPOINTMENT_BOOKING_POST`, FAQ "Will it actually reduce no-shows" | "and shorter gaps are associated with far better attendance in the clinic study above" | `And shorter gaps go with far better attendance in the clinic study above.` | "associated with" is the word that marks the clinic study as observational, in the one paragraph that is explicitly weighing evidence strength ("The reminder is the part with real evidence"). "go with" carries the same non-causal sense in plain English, so this is a shade, not a meaning change — and the service page already said "go with" before the pass, so it is not a new claim. Flagged only so the orchestrator can decide. | `And shorter gaps go together with far better attendance in the clinic study above.` (or restore "are associated with") |
| 1.2 | LOW | `content/blog/booking-scenes.ts` `FAILURE_MODES[0]` | "Booking is a volume amplifier and it does not read intent." | `Booking turns up the volume, and it does not read intent.` | "a volume amplifier" says the thing multiplies whatever arrives. "turns up the volume" is the same idea but the plain reading of "volume" for a ten year old is loudness, and nothing nearby anchors it to the number of appointments. The rest of the card (three houses on a Saturday) recovers it. | `Booking brings you more of whatever is already coming, and it does not read intent.` |
| 1.3 | LOW | `content/blog/booking-scenes.ts` funnel `note` (the calculator) | "would be the most flattering arithmetic on this website and it would be arithmetic nobody has done" | `would be the most flattering sums on this website, and they would be sums nobody has done` | The arithmetic→sums swap is right everywhere else in the batch, but "the most flattering sums" puts a superlative on a plural that reads as a stumble. Meaning intact. | `would be the most flattering sum on this website, and it is a sum nobody has done` |
| 1.4 | LOW | `content/blog/ai-posts.ts` `AI_APPOINTMENT_BOOKING_POST`, "A calendar invitation is not a text message" lead-in | "Here is a distinction that sounds pedantic and is the difference between an appointment that happens and one that does not." | `Here is a difference that sounds fussy. It is also the difference between an appointment that happens and one that does not.` | distinction→difference is a good swap, but it now collides with "the difference" in the next clause, so the sentence names the same word twice for two different jobs. Nothing is lost. | `Here is a small point that sounds fussy. It is also the difference between an appointment that happens and one that does not.` |
| 1.5 | LOW | `content/blog/booking-scenes.ts` `WHY_THEY_DROP[0]` | "None of that is about you and none of it is recoverable." | `None of that is about you, and none of it can be won back.` | "recoverable" is about a loss that cannot be undone. "won back" adds a contest with somebody, which is not what the card is about (an offer accepted elsewhere, a mortgage conversation going badly, a job changing). | `None of that is about you, and none of it can be got back.` |

**Verdict:** clean. The four counts I checked all match their lists (two things a business tracks,
four decisions, four things the software does, two things that change), the RFC 5545 and Google
Calendar API reproductions are byte-identical, `THE_BOOKING`'s visitor turns are untouched and the
one assistant turn promises exactly what it promised. Nothing here is worth blocking on.
**Compared: 49 changed body paragraphs (of 87 prose paragraphs), 20 changed scene strings, 10
changed service strings (3 orchestrator fields skipped).**

---

## 2. WORKFLOW AUTOMATION

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 2.1 | LOW | `content/blog/ai-posts.ts` `WORKFLOW_AUTOMATION_POST`, "It does not fix a bad process" | "Wiring makes a process consistent, and consistency is only an improvement when the process was right." | `Wiring makes a process the same every time, and that is only an improvement when the process was right.` | The builder logged this as its one noun-dropping swap. It survives: "that" lands on "makes a process the same every time", which is the right antecedent, and the sentence after it is untouched. Recorded because it is the only place in the batch where a repeated noun became a pronoun. | no change needed; if the orchestrator wants the noun back: `Wiring makes a process the same every time, and being the same every time is only an improvement when the process was right.` |
| 2.2 | LOW | `content/blog/ai-posts.ts` `WORKFLOW_AUTOMATION_POST`, the ranking paragraph | "it is worth more than the impressive-sounding thing at the bottom that happens twice a month and needs somebody to think" | `And it is worth more than the impressive-sounding thing at the bottom, which happens twice a month and needs somebody to think.` | The restrictive "that" became a non-restrictive "which", so the twice-a-month clause stops identifying the item and becomes an aside about it. "at the bottom" already identifies it, so nothing is actually lost. | `And it is worth more than the impressive-sounding thing at the bottom that happens twice a month and needs somebody to think.` |

**Verdict:** clean, and the hardest calls here were made correctly. The Zapier quotations
("automatically pauses a Zap if it hits an error 95% or more percent of the times that it has run in
the last 7 days", "will automatically turn off") are byte-identical; the CHI 2005 paragraph repeats
"They found that" on the second finding instead of dropping it; the three judgment-call questions
kept their colon; "asymmetry" and "knowledge work" were correctly left alone; every count matches
its list (three things nobody can guess, two sort keys, one of three things, two things in the
footnote). `WORKFLOW_FILM` and the `reel` caption are untouched; the `plate` caption is prose and
was fair game. **Compared: 35 changed body paragraphs (of 83), 10 changed scene strings, 6 changed
service strings (3 orchestrator fields skipped).**

---

## 3. AI VOICE AGENTS

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 3.1 | LOW | `content/blog/voice-agent-scenes.ts` `FAILURE_MODES` ("no boundaries" card) | "Give an agent no boundary on price, condition or anything legal and it will fill the silence, fluently, and you will hear about it from the client rather than from the log." | `Give an agent no boundary on price, condition or anything legal, and it will fill the silence, fluently. You will hear about it from the client rather than from the log.` | Both consequences were inside one imperative condition. The second is now a standalone prediction. "it" still points back to the agent filling the silence in the sentence before, so the conditional force survives by proximity, but this is the batch-1 governor pattern one step short of biting. | `Give an agent no boundary on price, condition or anything legal, and it will fill the silence, fluently. And then you will hear about it from the client rather than from the log.` |
| 3.2 | LOW | `content/blog/ai-posts.ts` `AI_VOICE_AGENTS_POST`, the silence paragraph | "Callers resolve that ambiguity in well under a second, and they resolve it badly." | `Callers settle that question in well under a second, and they settle it badly.` | "that ambiguity" named the three-way uncertainty the sentence before had just listed. "that question" works only because the three readings are still right there as three fragments; it is a slightly looser handle on the same thing. No meaning change. | no change needed |

**Verdict:** the hardest legal ground in the batch and it held. NY Penal Law 250.05 and 250.00,
Cal. Penal Code 632, the FCC's February 2024 ruling that an AI voice is "artificial", the HBR
comparison and the one-party/all-party distinction are all word-for-word where they were; "may
record", "makes it an offense", "without the consent of all parties" and "unless" are intact; the
outbound-rules list keeps a modal on each of its three items on both the post and the service page;
the two protected quote-spans the builder reverted are back at BEFORE wording. `VOICE_FILM`,
`CALL_TURNS`, `CALL_EVENTS`, `IN_SHORT[1]` and the `reel` caption are untouched.
**Compared: 28 changed body paragraphs (of 77), 14 changed scene strings, 18 changed service
strings (2 orchestrator fields skipped).**

---

## 4. LEAD QUALIFICATION

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 4.1 | MED | `content/blog/ai-posts.ts` `LEAD_QUALIFICATION_POST`, the HUD paragraph | "In April 2024 the Office of Fair Housing and Equal Opportunity published [guidance on how the Fair Housing Act applies to housing advertising delivered through digital platforms](…), and specifically to the case where an algorithm rather than a person decides who gets shown what." | `It applies specifically to the case where an algorithm rather than a person decides who gets shown what.` | Two changes at once, both from the same split. (a) The subject of "applies" was **the Fair Housing Act**, inside the link text; after the split "It" lands on the nearest noun, which is the guidance. (b) "and specifically to" was additive (the guidance covers digital ad delivery, and within that, algorithmic delivery); "applies specifically to" reads as restrictive, so the page now states a narrower scope for a HUD document. Under the second available reading of "It" the sentence says the **Act** applies specifically to algorithmic decisions, which would be a false statement about a federal statute's scope. The disowning paragraph two paragraphs down ("it is guidance about advertising … not authority for anything in this article") is byte-identical and still does its job, which is why this is MED and not HIGH. | `The guidance covers how the Act applies when an algorithm rather than a person decides who gets shown what.` |
| 4.2 | MED | `content/blog/qualify-scenes.ts` `FAILURE_MODES[1]` ("never checked against outcomes") | "If the ranking had no relationship to the outcome, you do not have a scoring system, you have a horoscope with a confidence percentage on it." | `If the ranking had no relationship to the outcome, then you do not have a scoring system. You have a horoscope with a confidence percentage on it.` | The second half of a `not X, Y` pair was promoted out of the "if". The page now tells every reader, flatly, that what they have is a horoscope. The "then" on the first half makes the split more visible, not less: the condition closes at the full stop. | `If the ranking had no relationship to the outcome, then what you have is not a scoring system. It is a horoscope with a confidence percentage on it.` |
| 4.3 | LOW | `content/blog/ai-posts.ts` `LEAD_QUALIFICATION_POST`, the assumption paragraph | "arbitrary is expensive when the underlying population is as spread out as this one" | `It is just arbitrary, and arbitrary is expensive when the group of people is as spread out as this one.` | "the underlying population" is the set of leads under the CRM's uniform surface, and "spread out" is a word about how that set is distributed. "the group of people" keeps "spread out" meaningful and loses only "underlying". Acceptable; noted because the log singled it out. | no change needed |

**Verdict:** the statutory ground is untouched — 42 U.S.C. 3604's 51-word sentence, Article 10's
quoted list of nine characteristics, the HUD quotations ("can happen without the advertiser's
direction or knowledge…", "denying consumers information about housing opportunities", "Monitor
outcomes of advertising campaigns…") and the whole HUD-limits disowning paragraph are byte for
byte where they were, and the ranking-your-time-versus-rationing-access sentence kept its three
alternatives inside its one condition. Both "that"s survive on the reported assumption. The two MED
findings are the paragraph that frames the HUD document and one scene card.
**Compared: 32 changed body paragraphs (of 77), 14 changed scene strings, 5 changed service strings
(2 orchestrator fields skipped).**

---

## 5. DATABASE REACTIVATION

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 5.1 | MED | `content/blog/ai-posts.ts` `DATABASE_REACTIVATION_POST`, the TCPA damages paragraph | "and a court that finds the violation was willful or knowing may treble it. Per message." | `and a court that finds the violation was willful or knowing may treble it. To treble a sum is to make it three times as big. Per message.` | The gloss itself is correct: plainly true, adds no claim, leaves "may" alone, spells "three" out. But it was inserted **between** the damages sentence and the fragment that scopes it. "Per message." attached to "$500 … for each such violation … may treble it"; it now sits after a definition of the verb "treble", so the fragment reads as if it modifies the gloss. That is the one thing on the page that makes the $500 frightening, and it has been decoupled from the number it scopes. | Move the gloss one sentence later: `…may treble it. Per message. To treble a sum is to make it three times as big. There is a whole plaintiff's bar that does nothing else.` |
| 5.2 | MED | `content/blog/ai-posts.ts` `DATABASE_REACTIVATION_POST`, the cold open | "It is that following up with a person who said not right now, three years later, in the one month it stopped being not right now, is not a thing a human being is built to do." | `It is that a person who said not right now needs following up three years later, in the one month it stopped being not right now. That is not a thing a human being is built to do.` | The rebuild is the right call (BEFORE had 40 words between subject and verb) and the builder correctly refused the version that said following up in general is impossible. But after the split, "That" points at the whole proposition of the first sentence, which is **the person needing following up** — so the sentence now says what a human is not built to do is the *needing*, not the *following up*. The subject of the original sentence was "following up … three years later". This is the batch-3 pronoun-after-split rule, in the cold open of the story. | `It is that a person who said not right now needs following up three years later, in the one month it stopped being not right now. Following up like that is not a thing a human being is built to do.` |
| 5.3 | LOW | `content/blog/ai-posts.ts` `DATABASE_REACTIVATION_POST`, close of the legal section | "the rest is arithmetic, and it is arithmetic nobody can do for you" | `Once you know how much of that list you are actually allowed to contact, the rest is sums. And they are sums nobody can do for you.` | Same arithmetic→sums swap as elsewhere, and it lands awkwardly twice in two short sentences ("the rest is sums. And they are sums…"). Meaning intact. | `Once you know how much of that list you are actually allowed to contact, the rest is sums. And they are sums nobody can do for you.` → `…the rest is a sum. And it is a sum nobody can do for you.` |

**Verdict:** the TCPA ground survived exactly. 47 CFR 64.1200(f)(5) is reproduced whole with both
date windows inside one quotation; the (a)(2) prohibition keeps its "unless you have the prior
express written consent"; the three-part written-consent definition is one sentence; "by using any
reasonable method", "a reasonable person would understand those words to have conveyed a request to
revoke consent", "must be honored within a reasonable time not to exceed ten business days from
receipt", "or to receive $500 in damages for each such violation, whichever is greater" and the
Twilio threshold are all byte-identical; the eighteen-month and three-month windows, the $53,088
and the June 2016 adjustment are all in place; "may not solicit" and "may treble" both kept their
modal. Both MED findings are placement and reference, not law. `REACTIVATION_FILM`, `REVIVAL_TURNS`,
`REVIVAL_EVENTS`, the service page's `figure.turns` and the `reel` caption are untouched.
**Compared: 30 changed body paragraphs (of 72), 12 changed scene strings, 8 changed service strings
(2 orchestrator fields skipped).**

---

## 6. AI CHAT ASSISTANT (the story standard)

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 6.1 | MED | `content/blog/ai-posts.ts` `AI_CHAT_ASSISTANT_POST`, FAQ "Do people not just want to talk to a person" | "What people object to is not being helped by software, it is being trapped by it, and those are different products." | `What people object to is not being helped by software. It is being trapped by it, and those are different products.` | Splitting a `not X, it is Y` contrast at the comma leaves a sentence whose most literal reading is the opposite of the point: "what people object to is [not being helped by software]", i.e. they object to going unhelped. The next sentence repairs it, but the garden path is in the paragraph that exists to say people do not mind software. | `People do not object to being helped by software. They object to being trapped by it, and those are different products.` |
| 6.2 | MED | `content/blog/ai-posts.ts` `AI_CHAT_ASSISTANT_POST`, "Ask it something it cannot know" | "If it produces a number, you have just watched it invent one, and it will do that to a client on a Tuesday." | `If it produces a number, then you have just watched it invent one. And it will do that to a client on a Tuesday.` | Both halves were consequences of the same "if". The prediction is now unconditional: as written, the page says the assistant will invent numbers for clients whatever the test showed. "it" is still anchored by the sentence before, so this is one step short of a false claim, but it is the same move batch 1 paid for. | `If it produces a number, then you have just watched it invent one, and it will do that to a client on a Tuesday.` |

**Verdict:** the story standard held. Structure, order, headings and `[[scene:…]]` markers are
identical (163 lines before, 163 after); the cold open's first three paragraphs — the 11:40pm, the
person, the times — are byte-identical; `content/blog/ai-chat-scenes.ts` is untouched, which the
diff confirms, so `FILM`, `RESPONSE_CURVE`, `IN_SHORT`, `TEARDOWN_TURNS`, the leads-calculator note
and the plate caption are all exactly where they were. **The honesty spine is intact**: the 78%
sentence is byte-identical, "There is not one that anybody can produce", "no published report, no
stated sample, and no methodology", "nobody quoting it knows whether it is right", "a number nobody
can check is a slogan wearing a percentage sign" and "So this article does not use it" are all
unchanged, and the only edit in that paragraph is one sentence boundary. The HBR finding is not
restated more strongly anywhere: the body's statement of it is unchanged, and the service page's
FAQ moved the researchers' definition into its own sentence with "The researchers defined
qualifying the lead as a real conversation with somebody who could decide", which keeps the
comparison ("nearly seven times likelier … than firms that waited one more hour") and the
cross-industry caveat word for word.
**Compared: 26 changed body paragraphs (of 81), 0 scene strings (file untouched), 20 changed
service strings (3 orchestrator fields skipped).**

---

## What I could not check

- **Rendered output.** No dev server was started and no build was run, per the brief. Everything
  above is the source text. The two committed scorers already certify the rendered grade, links,
  digits, quotations and headings.
- **The orchestrator's four fields** (`lede`, `why`, `specs`, `seo`) on the six service pages, and
  `posts.ts`'s `seoTitle` / `seoDescription` / `excerpt` rewrites, by instruction. I did verify
  that every `keywords` phrase still appears somewhere in its topic's prose.
- **Whether the batch-4 topics' `excerpt` strings** in `posts.ts` were meant to change. Three of
  them did (review automation, marketing automation, skip tracing — all earlier batches). None of
  the six batch-4 excerpts changed except through the SEO lap. That is the orchestrator's call, not
  a finding.
