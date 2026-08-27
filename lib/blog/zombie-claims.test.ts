import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** A retracted claim must not keep talking in a scene.
 *
 * WHY THIS EXISTS, and it is a real defect that shipped and sat on production.
 *
 * The chat flagship spends its second section proving that "78% of leads close with whoever
 * responds first" has no published report, no stated sample and no methodology behind it, and
 * ends that section with "So this article does not use it." Three separate surfaces carried
 * the number anyway, and each was found on a different day by a different person:
 *
 *   1. the body prose            (rewritten first)
 *   2. the "In short" summary    (caught a day later)
 *   3. the ResponseGap scene     (caught 2026-08-03, in twenty point type on full-bleed black)
 *
 * The third one survived two audits because of WHERE its copy lives. Both the prose and the
 * scene PAYLOADS are covered by scripts/_scratch-claims.mjs; a bespoke component's copy is in
 * neither, because it is a string literal inside a .tsx file. The chat post is the only post
 * in the cohort with bespoke components, which is exactly why it is the only one where this
 * could happen.
 *
 * So this reads the source of every place scene copy can live and fails on the three figures
 * this repo has already killed. Each is allowed to APPEAR, because refusing a number out loud
 * is the honest thing to do and two of our surfaces deliberately name it; what is not allowed
 * is naming it without disowning it in the same breath.
 *
 * See docs/blog-flagship/SOURCE-AUDIT.md for where each figure came from and why it is dead.
 */

const ROOT = process.cwd();

/** The figures this repo has checked and refused. Adding one here is how a retraction sticks. */
const ZOMBIES: { name: string; pattern: RegExp; why: string }[] = [
  {
    name: "the unsourceable 78%",
    pattern: /(seventy[ -]eight percent|\b78\s?(%|percent))/i,
    why: "attributed on hundreds of pages to a survey with no published report, no stated sample and no methodology",
  },
  {
    name: "23 minutes 15 seconds",
    pattern: /\b23 minutes(,| and)? 15 seconds|\b23 min(utes)? 15 sec/i,
    why: "the real CHI 2005 figure is 25 minutes 26 seconds",
  },
  {
    name: "$16,000 per text",
    pattern: /\$\s?16,?000\s*(per|a)\s*(text|message)/i,
    why: "a real number from the FTC's civil penalties, not from the TCPA claim an individual can bring, which is $500",
  },
  // ── Round B, 2026-08-25. Four claims killed on the services surface, three of them dollar
  // or share claims with nothing under them and one a comparative price. Each was hunted for
  // a primary document first; none has one.
  {
    name: "the unsourced 73% who read reviews before booking",
    pattern: /(seventy[ -]three percent|\b73\s?(%|percent))/i,
    why: "no primary survey states it. BrightLocal's Local Consumer Review Survey 2026 (panel of 1,002 US adults) reports 97% who read reviews for local businesses, 41% who always do, and 74% who look for reviews from the last three months. 73 is not in it",
  },
  {
    name: "tens of thousands in unworked commission",
    pattern: /tens of thousands in unworked/i,
    why: "an unsourced dollar claim about a database nobody has measured, on the one topic whose own flagship post refuses to state a rate because no independent study of cold database response exists",
  },
  {
    name: "a fraction of vendor pricing",
    pattern: /fraction of vendor pricing/i,
    why: "a comparative price claim against prices we have not read in a published document. The standing rule is that such a number is refused out loud, not printed",
  },
  {
    name: "40% of the numbers are dead",
    pattern: /\b40\s?(%|percent) of the (phone )?numbers/i,
    why: "written as a measurement and never was one. Nobody publishes a dead-number rate for bought lists",
  },
  // ── Round D, 2026-08-25. Three claims killed on the services surface while writing the CRM
  // sync and agent workforce flagships. None of the three had a primary; two of them are the
  // same shape as figures this repo has already retracted.
  {
    name: "a fifth assistant costs a conversation, not a salary",
    pattern: /costs? a conversation,? not a salary/i,
    why: "the same comparative-salary claim Round B killed on the voice page ('a fraction of that [an ISA salary]'). The BLS Occupational Outlook Handbook puts the 2024 median for a secretary or administrative assistant at $47,460, and that wage buys accountability, judgement and somebody who notices the job has changed. The agent workforce flagship refuses the division out loud and this page may not make it sideways",
  },
  {
    name: "deals lost to a stale CRM",
    pattern: /deals? (are )?lost to a stale CRM/i,
    why: "asserts that deals are lost, as a fact, with nothing under it. The CRM sync flagship refuses to price a stale record because no arithmetic turning a misdirected message into commission can be shown",
  },
  {
    name: "a large share of admin hours",
    pattern: /large share of admin hours/i,
    why: "an unsourced quantity about where a business's hours go, on a page that has never measured anybody's hours",
  },
  // ── Round E, 2026-08-25. Four claims killed while writing the skip tracing and marketing
  // automation flagships. Two of them are flat legal or behavioural conclusions, which is the
  // shape this guard has not carried before: every earlier entry is a NUMBER. A wrong number is
  // easier to spot than a wrong assertion, and on the legally heaviest page in the set the
  // assertion is the more expensive of the two.
  {
    name: "skip tracing is legal and standard practice",
    pattern: /skip tracing[^.]{0,80}is legal and standard practice/i,
    why: "a flat legal conclusion with nothing under it, on the page with the most legal exposure on the site. The acquisition side is governed by 18 U.S.C. 2721 to 2725, which permits release of motor vehicle record information only for a listed set of purposes, and by 15 U.S.C. 1681b, which turns on the purpose the information is used for. Both attach to the person obtaining and using the data. The page now says what the two statutes are and what to ask a provider",
  },
  {
    name: "a listing that expired is a seller who still wants to sell",
    pattern: /expired is a seller who still wants to sell/i,
    why: "an absolute about a group of people. Plenty of households that took a listing off the market have decided to stay, and the same page's own limits say the service gives nobody a reason to sell",
  },
  {
    name: "the owners most likely to sell are the ones who do not live there",
    pattern: /owners most likely to sell/i,
    why: "a claim about who transacts, with nothing under it, on a page whose own flagship spends a section refusing to invent rates for this trade",
  },
  {
    name: "SMS is usually the channel that gets opened",
    pattern: /usually the channel that gets opened/i,
    why: "a comparative claim about channel performance with no published measurement behind it. The marketing automation flagship shows that an open is not even a reliable measurement within one channel, let alone across two",
  },
  // ── Round F, 2026-08-25. Six claims killed while writing the document processing and data
  // enrichment flagships. Two of them are the first FABRICATED SPECIFICS in this table: an
  // invented person with an invented telephone number, on the page whose own flagship argues
  // that an appended value is somebody else's claim. Round E found three fabricated street
  // addresses on the skip-tracing page and the same class was live one page over.
  {
    name: "one purchase agreement, thirty seconds",
    pattern: /one purchase agreement,?\s*thirty seconds/i,
    why: "a duration printed beside an illustration reads as a measurement, and nobody has timed this on these documents. The document processing flagship quotes what published research measured on real scanned forms and none of it is a stopwatch figure",
  },
  {
    name: "the deadline that slips is almost never the one somebody knew about",
    pattern: /deadline that slips is almost never/i,
    why: "an unsourced claim about which deadlines are missed, in a field where nobody has published a study of missed deadlines. The page now says what the illustration is actually showing, which is that an unresolvable value is held back rather than guessed at",
  },
  {
    name: "it reliably extracts structured facts",
    pattern: /reliably extracts structured facts/i,
    why: "'reliably' is doing work the published measurements do not support. On 199 real scanned forms at around 100 dpi, the FUNSD paper measured a commercial engine at 94.4 percent Levenshtein similarity when it was given the position of every word and 76.4 when it had to find them, and its entity-linking baseline scored 0.04. How well this works depends on the page far more than on the software",
  },
  {
    name: "a third of the numbers are dead",
    pattern: /a third of the (phone )?numbers are dead/i,
    why: "written as a measurement and never was one, and it is the same shape as the 40% this table already carries from Round B. There is no published dead-number rate for enriched or bought lists with a stated sample behind it",
  },
  {
    name: "enrichment lifts the connect rate",
    pattern: /lifting the connect rate/i,
    why: "an outcome claim with nothing under it, on the one page in the set whose own flagship argues that an appended value is a claim with an age rather than a fact. A hit rate and a connect rate are different quantities and neither has a published figure for this trade",
  },
  {
    name: "every record in your pipeline is actually reachable",
    pattern: /every record in your pipeline is (actually )?reachable/i,
    why: "an absolute the same page contradicts four fields later in its own limits: it does not guarantee a match. A promise a page disowns on itself is worse than no promise",
  },
  {
    name: "the cheapest optimisation available to any outbound effort",
    pattern: /cheapest optimisation available/i,
    why: "an unsourced superlative comparing this against every other thing a business could do to its outbound, with no measurement of any of them",
  },
  {
    name: "the invented contact on the enrichment page",
    pattern: /J\.\s?Kowalski|\(845\)\s?555[\s-]?0188/i,
    why: "a made-up surname and a made-up telephone number marked 'verified', attached to a first name from an open house, on the page about buying assertions concerning real people. STANDARD.md: a fabricated specific on a page whose argument is that the details are checkable destroys the argument. Same class as the three fabricated street addresses Round E removed from the skip-tracing page",
  },
  // ── Round G, 2026-08-25. Eight claims killed while writing the ai-scheduling and
  // invoicing-and-payments flagships. Three are ABSOLUTES a research source contradicts, four
  // are the same unsourced claim about a majority of late payments wearing four different
  // sentences, and one is an invented duration. The majority claim is the most interesting of
  // the eight, because it was true-sounding, sympathetic, load-bearing on four surfaces of one
  // page, and there is no measurement of it anywhere for any industry.
  {
    name: "the double-booking that cannot happen",
    /** WIDENED IN ROUND H, in the same commit as the rewrite it catches, which is the order round
     * G's log specified. Round G killed this absolute on `ai-scheduling` and then CHECKED rather
     * than assumed whether the entry also caught `ai-appointment-booking`, which carried the same
     * claim in three places. It did not: the committed pattern required "nothing double-books AND
     * nothing has to be undone" where the booking page said "rearranged", and required "can only
     * ever offer" where the booking page said "only ever offers". Run against that file it matched
     * zero lines. Widening it first would have turned the suite red on a page nobody was fixing,
     * and this repo does not carry red tests, so the widening waited for the fix. */
    pattern:
      /double[- ]booking that cannot happen|nothing double-?books|cannot double-book you|can only ever offer time that is genuinely free|only ever offers? (time|slots) that (is|are) genuinely (free|open)/i,
    why: "an absolute the scheduling flagship's own sources contradict. Reading a live calendar stops YOUR diary being offered twice and does nothing about the other party's, because no software has visibility of a co-broke office's calendar. RFC 6638 also resets every attendee to NEEDS-ACTION on a reschedule, so even an accepted slot stops being agreed the moment the time moves",
  },
  {
    name: "interested and on the calendar are ten minutes apart",
    pattern: /about ten minutes of enthusiasm/i,
    why: "an invented duration presented as a property of buyers. Nobody has measured how long an intent to view a property lasts, and a number printed under an illustration reads as a measurement. Same class as the 'thirty seconds' Round F removed from the document processing figure",
  },
  {
    name: "reminders remove the common reasons for a no-show",
    pattern: /remove the common reasons for one/i,
    why: "'remove' is an absolute the site's own evidence contradicts. The randomised trial the appointment booking flagship rests on moved attendance from 80.5 percent to 87.5 percent with one reminder, which is a real effect and is not removal",
  },
  {
    name: "most late payments are forgotten rather than refused",
    pattern: /most late (invoices|payments) are (forgotten|simple forgetfulness)|late invoices are forgotten, not refused/i,
    why: "the claim is about WHY a payment is late, and nothing published measures that. Followed in round G's second pass rather than assumed: figures for HOW MANY invoices are late do exist and the most prominent of them states a sample, the QuickBooks Small Business Late Payments Report describing itself as based on a 2025 survey of more than two thousand small businesses, published by a company that sells invoicing software. That is a count, not a reason, and none of it is about a brokerage. The claim was load-bearing on four surfaces of one page",
  },
  {
    name: "a reminder recovers the majority of late payments",
    pattern: /recovers the majority of them|a reminder is all they ever needed/i,
    why: "the same unmeasured majority claim as above, stated as a recovery rate. Nobody has published a recovery rate for a reminder sequence with a method under it",
  },
  {
    name: "chasing cuts the wait from weeks to days",
    pattern: /cut the wait from weeks to days/i,
    why: "a quantified outcome claim with nothing under it. This is /ai COPY and it was changed because the page cannot support it: no measurement of what automated chasing does to payment timing in this trade has been published",
  },
  {
    name: "deposits reduce no-shows because a person who has paid turns up",
    pattern: /deposits reduce no-shows|a person who has paid something turns up/i,
    why: "an unsourced causal claim, and the one topic on this site where a randomised trial does exist says something narrower: a reminder moved attendance seven points. Nobody has published what a deposit does to attendance at a property appointment",
  },
  {
    name: "the third nudge is the one that gets paid",
    pattern: /third nudge is the one that gets paid/i,
    why: "an unsourced claim about which reminder in a sequence produces payment. No published study of reminder sequences by position exists for this or any adjacent trade",
  },
  // ── Round H, 2026-08-26. Nine claims killed while writing the ai-clone, ai-audit and
  // custom-automation flagships, which close the twenty-topic rollout. Three of them are the
  // SAME claim (rank by payback) wearing three different sentences on two different pages, and
  // the reason it had to go is that the audit flagship's own evidence says the ranking rule is
  // wrong rather than merely unproven.
  {
    name: "a video is why the quiet lead answers",
    pattern: /which is why they answer it/i,
    why: "an outcome claim with nothing under it, on the one page whose own flagship refuses every response and reply figure for personalised video because each one that could be traced is published by a company selling video software and none states a sample",
  },
  {
    name: "a dozen videos in an afternoon",
    pattern: /a dozen individually addressed videos in an afternoon/i,
    why: "an invented duration presented as a property of the product. Nobody has timed this and the avatar pipeline is owner-held, so this page cannot state what it produces or how fast. Same class as the 'ten minutes of enthusiasm' round G removed and the 'thirty seconds' round F removed",
  },
  {
    name: "it looks and sounds like you rather than a generic presenter",
    pattern: /looks and sounds like you rather than a generic presenter/i,
    why: "a quality guarantee about a pipeline this repo does not own and has never measured. Films, HeyGen and the avatar are owner-held; a service page may say what the twin is built FROM and may not promise how convincing the result is",
  },
  {
    name: "ranked by payback",
    pattern: /ranked? by payback|by payback\. the step that costs the most hours/i,
    why: "the page promised a sort order its own linked article argues against, which is the SERVICES-CRITIQUE section 2 failure (a commercial page contradicted by the post it links to). The argument, stated as an argument rather than as a measurement: Budzier and Flyvbjerg measured 17 percent of 1,471 ICT projects in a fat right tail against 0.7 percent for a thin-tailed distribution, and the inference drawn from that shape on the flagship is that an expected value describes the middle rather than the exposure, so payback belongs third behind how contained the worst case is and whether the rule is settled. The measurement is theirs and the inference is ours, and the page now says the same thing the article does",
  },
  {
    name: "the list tells you what each fix is worth",
    pattern: /what each fix is worth before you pay/i,
    why: "a promise to quantify every candidate in advance, on the page whose own flagship refuses a payback period outright because it depends entirely on which candidate. The audit's output is an order with the reason for each position attached, not a price list",
  },
  {
    name: "the first win is usually",
    pattern: /the first win is usually/i,
    why: "a claim about what works first for small businesses in general, and the largest measurement available says no such general answer can exist yet: the 2018 Annual Business Survey, over 850,000 firms with response required by law, found 10.3 percent using any advanced business technology at all",
  },
  {
    name: "most owners know AI could help but freeze",
    pattern: /most owners know ai could help/i,
    why: "an unsourced claim about the mental state of a majority of business owners. This is /ai COPY and it was changed because the page cannot support it, and because the same sentence promised spending on the change with the biggest return, which is the payback ranking the audit flagship disproves",
  },
  {
    name: "once, then forever",
    pattern: /once,? then forever|built once,? then it just runs/i,
    why: "the absolute the custom-automation flagship exists to disprove. A build is a possession from the day it works: it stands on interfaces whose owners promise twelve to twenty four months of notice with carve-outs, and NIST's own estimate puts $38.3bn of the annual cost of software not working on the businesses using it against $21.2bn on the ones making it. This is /ai COPY",
  },
  {
    name: "if you can describe it, it can be built",
    pattern: /because if you can,? it can be built/i,
    why: "describability is presented as a sufficient test and it is only a necessary one. The custom-automation flagship names three further disqualifiers on its own page: the process is still being redesigned, nobody would notice it stopping, or a product already does it",
  },
  // ── Round J, 2026-08-27. The owner read the clone post and caught the first entry in this
  // table that is neither a number nor a hedge, but a flat statement about WHO OWNS WHAT:
  //
  //   "The video blog said the model is yours and not licensed. We use HeyGen for AI clone
  //    videos. It is HeyGen's model, you license/rent the platform from them."
  //
  // He is right, and the claim was live on three surfaces at once, which is the exact shape
  // the 78% taught this file to expect: the scene caption (CONSENT_PATH, "The model / Yours,
  // not licensed on"), the post's own FAQ ("the likeness and voice model are yours"), and the
  // service page FAQ, where "Who owns the avatar and the voice?" was answered "You do."
  //
  // What is actually true: the avatar renders on a HeyGen-class platform and the voice on an
  // ElevenLabs-class engine, both LICENSED from the vendors who built them. What a client owns
  // is the material at both ends, the likeness, the footage, the scripts and the finished
  // videos. All three surfaces now say that, and this entry is why they keep saying it.
  {
    name: "the client owns the avatar model",
    /** The bare "You do." that answered "Who owns the avatar and the voice?" on the service
     * page is not catchable on its own: two words with no claim in them, and the question it
     * answers is on a different line and a different object key. What IS catchable is the
     * sentence that always came with it, "the likeness and the voice are yours", so that form
     * is in here too. It cost one adjacent rewrite: the same page's `limits` entry used the
     * identical phrase to mean something narrower and true (it speaks as nobody else), and
     * that line now says so without borrowing the ownership words. */
    pattern:
      /yours,? not licensed|\b(likeness and )?(the )?(voice |avatar )?model (is|are) yours\b|\byou own the (model|avatar|voice)\b|\b(model|avatar) (that )?(is|stays|remains) yours\b|\bthe likeness and (the )?voice are yours\b|\byours rather than (borrowed|rented|licensed)\b/i,
    why: "the underlying avatar and voice models belong to the vendors whose platforms render them and are licensed, not owned. A client owns their likeness, the recording, the scripts and the finished videos, which is a real and sufficient answer; claiming the model itself is a claim this business cannot make about somebody else's software",
  },
  // ── Round K, 2026-08-27. Four claims killed while writing the Singularity flagship, topic 21.
  // Three of them are already dead on the WEBSITE and alive on the /ai page: `COPY.singularity`
  // in realtylt-ai-page/web/src/main.js still carries all three, and content/services/
  // the-singularity.ts documents at the top of the file that it declined to carry them across.
  // That is precisely the situation this table exists for. A divergence recorded in a comment is
  // a divergence that survives until somebody "fixes" the inconsistency in the wrong direction,
  // and the obvious way to fix it is to paste the panel's words onto the page that ranks.
  //
  // The fourth is the claim the post's own evidence refutes rather than merely fails to support,
  // which makes it the most expensive one to make on this particular topic.
  {
    name: "it improves faster than you can shop for a replacement",
    pattern: /improves faster than you can shop for a replacement|faster than you (can|could) (shop for|buy|find) a replacement/i,
    why: "a comparative rate claim against every other product a business owns, with no measurement of this system and none of any of them. It was the closing sentence of the /ai Singularity panel and the one line the service page deliberately did not carry across, which is recorded in the header of content/services/the-singularity.ts. Round 44 rewrote the panel copy for the repositioning, so the two sides now agree; this entry is what keeps the sentence from being pasted back in the day somebody wants a stronger closer",
  },
  {
    name: "it remembers everything",
    /** DELIBERATELY NARROW. The service page's own lede says the system "remembers every call,
     * every chat and every deal they touch", which is a BOUNDED claim about the material its
     * agents handle and is true. The absolute is the thing being killed, so the pattern matches
     * only the absolute. Checked against the whole of content/ before it was added: the bounded
     * form appears once and this does not match it. */
    pattern: /\bremembers everything\b/i,
    why: "an absolute that the same product's limits contradict four lines later. It knows what it was connected to and nothing else, and a deal that lived in a spreadsheet nobody wired in is a deal it has never heard of. It was a `specs` chip on the /ai panel until round 44 replaced it with `durable project memory`, and the flagship post spends a section on the literal version, which is that what persists is FILES: the record of the conversations, the written instructions, one file per area of the work, and a growing pile of tests. The bounded claim is strong enough on its own and this entry only kills the absolute",
  },
  {
    name: "it gets better with every deal",
    pattern: /gets better with every deal/i,
    why: "a rate nobody has measured, and the flagship post's own evidence says the opposite is the normal week. Kohavi, Crook and Longbotham, who built Microsoft's experimentation platform, report that of well designed experiments intended to improve a key metric, only about one third succeeded. A loop whose honest output most weeks is no change cannot also be getting better with every deal",
  },
  {
    name: "it improves without anybody approving it",
    pattern:
      /(improves?|gets better|learns)[^.]{0,50}\bwithout (a |any )?(human|person|approval|supervision)\b|\bno (human|person) (is )?(needed )?in the loop\b/i,
    why: "the one claim on this topic that published research refutes rather than merely leaves unsupported. Huang and co-authors (Google DeepMind, ICLR 2024) measured intrinsic self-correction, where a model reviews its own answer with nothing from outside itself, and GPT-4 fell from 95.5 percent on GSM8K to 89.0 after two rounds, while the same model given an outside signal about which answers were wrong rose to 97.5. The person approving is not a safety garnish on this product, it is the half that makes the other half work",
  },
  // ── Round L, 2026-08-27. THE FIRST ENTRY IN THIS TABLE THAT KILLS AN UNDER-CLAIM.
  // Every other row here is a number or a promise that was too large. This one was too small, and
  // it was ours: the Singularity post and service page both shipped "nothing in it rewrites its
  // own code", written in good faith as honest-limits copy for what was described as a
  // prompts-and-playbooks product. The owner read the live page and rejected it, because the
  // thing being sold is the system this business actually runs, which writes and ships real
  // software under a test suite and a human approval. A retraction table that only ever catches
  // exaggeration will happily let a business describe itself as less than it is, and a sentence
  // that gives away the main capability is exactly as expensive on a page an AI answer lifts from
  // as one that invents a capability.
  //
  // The safety claim did not disappear, it changed sides: it is now the gate rather than an
  // inability, and round K's "improves without anybody approving it" is what holds that end up.
  // The two entries are meant to be read together. Between them the true claim is pinned from
  // both directions: it DOES write code, and it NEVER ships without a person.
  {
    name: "the system cannot write or change code",
    /** Two forms. The first is the exact wording that shipped, which is the one that will come
     * back if somebody tidies this topic toward sounding modest. The second is the general shape
     * of the same under-claim with a different verb. Deliberately anchored on a subject pronoun
     * so that a sentence ABOUT the promise ("not a promise about what it will leave alone") does
     * not trip it, which is a real sentence in the post and was checked against the whole of
     * content/ and components/blog/scenes/ before this was added. */
    pattern:
      /rewrites? its own code|\b(it|the (system|loop|agent))\s+(does not|cannot|will not|never)\s+(rewrite|write|change|touch)s?\s+(its own |any |real |the )?(code|software|source)\b/i,
    why: "false about this offering. The Singularity is a coding agent with a file-based memory: it writes and ships real software, and what makes that safe is the test suite and the human approval standing between anything it writes and anybody seeing it, not an inability to write it. The post's own evidence points the same way, since Reflexion reports 91.0 percent on HumanEval precisely because the code is run against tests, which is the outside signal the intrinsic self-correction experiments never had. Saying the system cannot write code gives away the capability the offer is built on and replaces a checkable safety claim with a weaker false one",
  },
  {
    name: "an invented hours-per-week figure in a service figure",
    pattern: /~\s*\d+\s*hrs\/week/i,
    why: "a number printed inside an illustration of our own output reads as a measurement of somebody's business, and nobody measured these. Round F removed a 'thirty seconds' from the document-processing figure for exactly this and round G had to add an explicit illustration line to two more figures",
  },
];

/** Words that mean the sentence is refusing the number rather than resting on it.
 *
 * `refus` USED TO BE A BARE STEM, and round G proved that it was a hole. Three claims of the
 * form "most late payments are forgotten, not refused" were injected to prove the new guard
 * entries red, and three of them PASSED, because the word "refused" inside the claim itself
 * matched the stem and the whole five line window was treated as a retraction. A disowning
 * heuristic that a claim can satisfy by containing the word "refused" is not a heuristic, it is
 * a way of exempting exactly the sentences most likely to be about refusal.
 *
 * Narrowed to the forms this repo actually uses when it is disowning something ("refuses to",
 * "a deliberate refusal", "the paper explicitly refused", "standing refusals"), which leaves
 * "not refused" outside it. Re-proved red on all eight round G entries afterwards, and the
 * whole suite re-run to confirm no file was passing because of the loose stem. */
const DISOWNED =
  /unsourc|declines? to use|does not use|cannot be sourced|nobody can (check|source|produce)|no published|no stated sample|no methodology|slogan wearing|deliberately not|not built on|refuses\b|refusals?\b|refusing to|refused to|explicitly refused|deliberately refused|belongs to a different statute|is not the (TCPA|figure)|the real figure|wrong statute/i;

/** Every file where copy that a reader will SEE can live.
 *
 * content/services/** was added 2026-08-25, and it should have been here from the start. The
 * blog killed the 78% on 2026-08-02 and wrote this test on 2026-08-03; the chat SERVICE page
 * went on asserting it three times for another three weeks, in `why`, in `stat` and in an FAQ,
 * while linking to the post that debunks it (SERVICES-CRITIQUE.md §2a). A retraction that
 * covers the article and not the page selling the thing has retracted nothing: the commercial
 * surface is the one that ranks and the one an AI answer lifts from.
 *
 * Read from the directory rather than listed, so service number twenty-one is covered on the
 * day somebody writes it. */
const SOURCES = [
  // content/blog was a hand-written list of six files until 2026-08-25, and it had already
  // rotted: Round B added review-scenes.ts and booking-scenes.ts and neither was on it, so two
  // whole flagships of scene copy were outside the guard. That is the same failure the services
  // comment below describes, and it has the same fix. Read from the directory instead.
  ...fs
    .readdirSync(path.join(ROOT, "content/blog"))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => `content/blog/${f}`),
  ...fs
    .readdirSync(path.join(ROOT, "components/blog/scenes"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `components/blog/scenes/${f}`),
  ...fs
    .readdirSync(path.join(ROOT, "components/blog/scenes/primitives"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `components/blog/scenes/primitives/${f}`),
  ...fs
    .readdirSync(path.join(ROOT, "content/services"))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts")
    .map((f) => `content/services/${f}`),
];

/** Comments are where the HISTORY of a killed number is written down, and that history is the
 * thing that stops it coming back. Strip them so a docstring explaining the retraction does
 * not read as the retraction being asserted. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

/** A percentage in CSS is a coordinate, not a claim.
 *
 * The first run of this test failed on `radial-gradient(60% 50% at 78% 8%, ...)` — the wash
 * behind a dark grid. Blank the inside of a colour function and any line that is plainly
 * geometry, so the check reads copy and only copy. Replaced with spaces rather than deleted,
 * so the reported line numbers still point at the real line.
 */
function blankStyles(src: string): string {
  const keep = (m: string) => " ".repeat(m.length);
  return src
    .replace(/(radial|linear|conic)-gradient\([^)]*\)/g, keep)
    .replace(/\b(viewBox|transform|translate|width|height|cx|cy|x1|x2|y1|y2)\s*=\s*"[^"]*"/g, keep)
    .replace(/^.*\b(background|backgroundImage|inset|clip-path|maskImage)\s*:.*$/gm, keep);
}

describe("retracted claims stay retracted", () => {
  it("names at least one file to check", () => {
    // A probe that finds no targets reports a beautiful pass.
    expect(SOURCES.length).toBeGreaterThan(10);
    for (const f of SOURCES) expect(fs.existsSync(path.join(ROOT, f)), f).toBe(true);
    // And it is actually pointed at the commercial surface, not only at the blog. A glob that
    // silently matches nothing is the same beautiful pass wearing a directory read.
    // 21 since 2026-08-27, when /services/the-singularity landed. This number is deliberately a
    // literal and not SERVICES.length: the point of the assertion is that a directory read is
    // really finding the commercial surface, and comparing one derived count against another
    // derived count would pass just as happily on an empty glob.
    expect(SOURCES.filter((f) => f.startsWith("content/services/")).length).toBe(21);
    // And every scene file, which is where a retracted number can keep talking in twenty point
    // type. Nine flagships, nine scene files, plus posts.ts and ai-posts.ts.
    expect(SOURCES.filter((f) => f.startsWith("content/blog/")).length).toBeGreaterThanOrEqual(11);
  });

  for (const file of SOURCES) {
    it(`${file} does not assert a figure this repo has refused`, () => {
      const src = blankStyles(stripComments(fs.readFileSync(path.join(ROOT, file), "utf8")));
      const lines = src.split("\n");
      const offences: string[] = [];
      for (const z of ZOMBIES) {
        lines.forEach((line, i) => {
          if (!z.pattern.test(line)) return;
          // The whole statement, not just the line: our refusals run long and wrap.
          const window = lines.slice(Math.max(0, i - 2), i + 3).join(" ");
          if (DISOWNED.test(window)) return;
          offences.push(
            `line ${i + 1}: ${z.name} (${z.why})\n      ${line.trim().slice(0, 140)}`,
          );
        });
      }
      expect(offences, offences.join("\n    ")).toEqual([]);
    });
  }
});
