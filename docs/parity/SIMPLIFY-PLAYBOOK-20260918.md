# The 10-year-old pass: playbook (final round, 2026-09-18)

Owner: service and blog pages read "on a high and complicated language." Rewrite so "a 10 year
old can understand everything", BUT "don't lose the idea and what we're trying to say and the
story and everything. Just make it simpler."

This file is the method. It was written AFTER the hardest page was done by hand, so every rule
below is something that worked: `/blog/invoicing-and-payments-real-estate-brokerage` went from
grade 9.5 to 6.1 on the body rewrite alone, with every link, number, quote and heading intact
and the length at x1.00. The before/after pair is the exemplar; read it before you write:

    git show 6eab055:content/blog/ai-posts.ts   # BEFORE (INVOICING_POST)
    content/blog/ai-posts.ts                    # AFTER  (INVOICING_POST)

## The bar (two committed scorers, both must pass per surface)

    MSYS_NO_PATHCONV=1 node scripts/readability-gate.mjs --only /blog/<slug>
    MSYS_NO_PATHCONV=1 node scripts/rewrite-invariants.mjs --only /blog/<slug>

1. **readability-gate**: Flesch-Kincaid grade <= 6 AND median sentence <= 15 words, measured on
   the rendered `<p>`/`<li>` prose. In practice: **average sentence about 11-12 words, and plain
   one and two syllable words.** Aim for grade 5.6-5.9 so the page has headroom.
2. **rewrite-invariants**: every link, every number, every quoted passage and every heading
   survives; zero em dashes; length stays within x0.85 to x1.25 of the original.

`--only` on the gate prints the five longest sentences left: that is your worklist. Run both
after every file you finish, not at the end. (`MSYS_NO_PATHCONV=1` matters in git-bash: without
it the leading-slash path is mangled and the gate checks nothing.)

## The laws (each one was paid for in an earlier round; none is negotiable)

1. **Quotes are sacred: verbatim or untouched.** Anything in quote marks, any `<blockquote>`,
   any pull-quote scene. ALSO anything that reproduces a statute, a regulation, a study, a
   report or a person's words WITHOUT quote marks. These pages quote law inline ("no person
   shall give and no person shall accept any fee, kickback, or thing of value pursuant to...").
   You can tell by the register: "shall", "pursuant to", "in excess of", "inclusive of". Leave
   those words exactly as they are. You MAY put the quotation in its own sentence with a short
   plain lead-in, and you MAY add one plain sentence after it ("In plain words, ..."), but only
   if the page already makes that plain claim somewhere, or it is the unarguable meaning.
   A long verbatim sentence is allowed to stay long; a page survives a handful of them.
2. **No invented facts, no lost facts.** Every number stays, with its source link and its
   derivation. Do not convert a spelled-out number to digits if that digit string is not already
   on the page (the invariants script reads it as an invented number), and never the reverse for
   a number that appears only once. Never round, never add "about".
3. **Hedges and honest limits are content, not clutter.** "probably", "may", "in most", "this
   article does not claim", "nothing here is legal advice", "we have not measured this": they
   stay. Making a sentence shorter must never make a claim stronger. If the original says a thing
   "can" happen, the rewrite does not say it "will".
4. **Zero em dashes. No arrow glyphs. No hype words** (the voice is a calm professional, never
   "game-changing", "supercharge", "unlock", "seamless").
5. **Structure does not move.** Same headings, same order, same `[[scene:...]]` markers, same
   links with the same hrefs (link text may be simplified if it still names the source), same
   list structure, same FAQ questions. `post-body.mjs inject` refuses a body that breaks this.
6. **Every idea survives.** Go paragraph by paragraph. Each point, example, caveat and turn in
   the argument must still be there. Simplify the LANGUAGE; do not summarise. If a paragraph
   carried five ideas, the rewrite carries five ideas in more, shorter sentences.
7. **The story stays a story.** The cold opens (the Tuesday in March, the rider that came in on
   a Sunday) keep their people, their times, their details and their order. Short sentences
   make them better, not worse. The AI Chat Assistant post is the story standard: change its
   language only, its 19/19 structure stays.
8. **Explain each technical term once, in one plain clause, at first use.** "a wire, which is a
   direct bank transfer". "To reconcile is to check what came in against what you asked for."
   The gloss must be plainly true. Do not define a legal term with anything you are not sure of.
9. **Keywords stay.** The `keywords` arrays are not yours to edit, and the phrases in them that
   appear in the prose ("AI voice agent", "skip tracing", "Google Business Profile") stay in the
   prose. The SEO lap after this pass depends on them.
10. **Provenance comments are law.** The `/** ... */` blocks in `content/services/*.ts` and
    `content/blog/*-scenes.ts` record what earlier truth passes decided and why. Never edit,
    move or delete a comment. Read the comment above a string before you touch the string: it
    often says exactly which words are load-bearing.
11. **Banned claims stay dead.** `lib/blog/zombie-claims.test.ts` lists claims that were
    retracted. A simplification must not bring one back in simpler words.

## How to make a sentence simple (what actually moved the grade)

- One idea per sentence. Split at "and", "because", "which", "but", at every semicolon and colon.
- Put the actor first and use a plain verb: "The bank holds the money" not "funds are held".
- Swap the long word for the short one a child knows: purchase/buy, approximately/about (only
  if "about" is already there), assistance/help, additional/more, require/need, obtain/get,
  demonstrate/show, sufficient/enough, utilise/use, commence/start, regarding/about,
  subsequently/then, individuals/people, numerous/many, transaction/deal, verify/check,
  genuinely/truly, ordinary/plain, attorney/lawyer, asymmetry/gap, contemplated/expected.
- Cut throat-clearing: "it is worth noting that", "the reason is worth being precise about".
- Lists of three fragments are fine ("A part payment. A payment with no reference.") but do not
  turn the whole page into fragments; it should read like a calm person talking.
- Keep "you". Keep the concrete nouns (the cheque, the form, the Tuesday). Concrete is simple.
- British spelling stays where the page has it (cheque, licence, finalise).

## Where the words live (a topic = four files, done together)

| Surface | File | How to edit |
|---|---|---|
| Post body | `content/blog/ai-posts.ts` export `X_POST` | `node scripts/post-body.mjs extract X_POST <tmp>.md`, write the new body to a NEW md file, `inject`. Never hand-edit the 500 KB file. |
| Post scenes | `content/blog/<topic>-scenes.ts` | Edit tool, string values only. |
| Service page | `content/services/<slug>.ts` | Edit tool, string values only. |
| Post card/dek | `content/blog/posts.ts` | `updated:` date only (see below). |

**Scenes and service files, what to touch:** prose string values (`body`, `lead` where it is a
sentence, `note`, `caption`, `basis`, `footnote`, `a` answers, `whatItIs`, `howItWorks[].body`,
`useCases[].body`, `limits`, `IN_SHORT` lines, figure `text`/`note`). **Never touch:** comments,
keys, numbers and `value`/`display` data, `sourceText`/`sourceHref`/`href`, image paths, `alt`
only if it is long prose, the pull-quote text itself, FAQ `q` questions (they are phrased the way
people type them and they are headings).

**Service page fields that are NOT yours:** `eyebrow`, `title`, `lede`, `specs`, `why`,
`keywords`, `seo`, `stat`. They are byte-siblings of the /ai panel COPY in another repo and
eight of them carry owner-decided wording. The orchestrator handles them in one joint pass.

**`updated` dates (rule D5):** when a post's body or scenes changed, set that post's `updated:`
in `content/blog/posts.ts` to `"2026-09-18"`. Nothing else in that file changes.

## Per-topic loop

1. Read the BEFORE: extract the body to md; read the scenes file and the service file in full.
2. Rewrite the body (new md file, inject). Gate + invariants on `/blog/<slug>`.
3. Rewrite the scenes strings. Gate + invariants again; work the `worst:` list until the page
   passes at <= 5.9 if you can, <= 6.0 at worst.
4. Rewrite the service page strings. Gate + invariants on `/services/<slug>`.
5. Bump `updated`. Run `npx vitest run lib/blog lib/services content app/blog` in the FOREGROUND.
6. Log the topic in `docs/parity/SIMPLIFY-LOG-20260918.md`: before/after grade for both
   surfaces, anything you were unsure about (a quote you could not tell was verbatim, a hedge
   you nearly cut, a term you glossed), and any invariants violation you could not resolve
   honestly. An unresolved violation is REPORTED, never worked around: do not edit the BEFORE
   snapshot, do not add to the ALLOW file. Those are the orchestrator's calls.

## Lessons from batch 1 (added by the orchestrator while it ran)

- **Short sentences collide.** `lib/blog/flagship.test.ts` fails a topic when a scene payload
  repeats a body sentence ("the topic content contract"). Long sentences never matched by
  accident; six-word ones do ("It flags what is missing."). When the test names a scene, reword
  the SCENE's copy of the sentence, keep the body's.
- **`lede` and `why` on the service pages are already done.** They were taken byte for byte from
  the /ai panels, which went through this same pass in their own repo (grade <= 6, 21/21) and a
  truth sweep against this repo's retraction table. Still not yours to edit, and now you know
  why: a one-word change breaks the byte-sibling audit in the other repo.
- **Retired claim class: "verified" and "callable".** The owner retired both on 2026-08-27. We
  do not say a phone, email or owner name we return is "verified", and we do not call a list or
  pipeline "callable" (the enrichment page itself says enrichment "does not make a list callable
  in the legal sense"). Landed forms: "a phone and an email", "a list you can work". A sentence
  that is ABOUT the claim (explaining that nobody can promise it) stays.
- **What good looks like, measured:** invoicing post 9.5 -> 5.1, its service page 7.8 -> 5.5,
  clone post 9.4 -> 5.7, its service page 7.8 -> 5.4; invariants PASS on all four at length
  x1.01-1.02. Glosses that worked: "Treble damages means three times the charge." "a wire, which
  is a direct bank transfer." One short sentence, plainly true, right after the hard word.

## THE RULE BATCH 1 PAID FOR: never split a clause away from its governor

A fresh checker read batch 1 in full after both scorers had passed every page, and found four
HIGH meaning errors. Three were the same move: **a subordinate clause promoted to its own
sentence loses the word that governed it**, and the page then says something it never meant.

- A REPORTED BELIEF became the page's own claim. "Most people assume X, and that Y." was split
  into "Most people assume X. Y." The page now asserts Y, one sentence before refuting it.
  Keep the governor: "Most people assume X. They assume Y."
- TWO JOINT CONDITIONS became one. "The moment A, and B, the purpose changes." was split into
  "The moment A, that changes. Say B." Now A alone is enough. Keep "and" inside one sentence.
- A RECOMMENDATION became an order. "It is best to share the profile rather than start a
  competing one." became "...share the profile. Do not start a competing one."
- A COMPARISON flipped. "as surely as inventing it from nothing" became "inventing it from
  nothing is no more caught than that is", which reads as the reverse.

Before you split at "and that", "and", "which", "rather than", "unless", "if", "because",
"as ... as", ask: what word in the first half makes the second half true? If it is a reporting
verb (assume, say, report, claim, found), a condition (if, when, the moment, unless), a hedge
(may, often, probably) or a comparison, either keep one sentence or REPEAT the governor in the
second one. A grade of 6.2 with the meaning intact beats 5.8 with it bent.

The fourth HIGH was a gloss: "In plain words, nobody may pay for a referral" after a statute
whose exceptions the article relies on five paragraphs later. **A plain-words sentence after a
quotation must carry the quotation's limits too** ("...unless the law's own exceptions cover
it"). If you cannot say it plainly AND completely in one short sentence, do not add it.

Smaller, same family: a qualifier is content ("at some point", "completely", "specific",
"purchase", "among the practices"). An aside inside a reported finding keeps its reporter
("The organisers add that ..."). Do not swap a word that carries legal weight for a casual one
(legitimate is not "fair", innocuous is not "quite plain"). Do not add a fact to fill a rhythm
("The paragraph is short", "the monthly bill").

## What batch 2's checker added (0 HIGH, 6 MED: the governor rule works, one level up it still bit)

Batch 2 kept every reporting verb and every "and". Its six MED findings were the same idea
wearing three other coats. **Before you split at a COLON, a "THAT", or a MODAL, ask what the
first half was doing to the second half.**

- A COLON that introduces a list of GUESSES, claims or options: "a chain of at least two
  guesses: this record is about your person, and this number belongs to that record" was split
  into two flat assertions the next sentence then withdrew. Open each item with the word the
  colon was lending it: "The first is that ... The second is that ..."
- A "THAT" that makes a REQUIREMENT: "What matters is that your rule is written down, that it
  was chosen by somebody who understood ..., and that you can find it" became "Three things
  matter. Your rule is written down." The page now tells the reader their rule IS written down.
  Keep the "that": "Three things matter. That your rule is written down ..."
- A MODAL or a normative verb from a source: the statute's mechanism a recipient "CAN use"
  became "A recipient uses it"; the RFC that "REQUIRES that any change ... resets" became "has
  a rule about this". A law's "may/must/shall" and a standard's "requires" are content.
- A relative clause that lands on a new noun after the split: "the clerical review step in the
  model that the other article covers, which exists for exactly this reason" became "the other
  article covers that model, which exists ..." and the reason moved from the step to the model.
- "because" fell from 158 to 110 across five topics. Dropping "which" is the job. Dropping
  "because" silently turns a reason into a bare neighbour. When the second sentence was the
  REASON for the first, start it with "That is because ...".
- Do not add an evaluation to fill a rhythm ("And the whole argument is simple.").
- A swap is only safe if the new word names the SAME thing on this page: "the specification"
  became "the standard" where the nearest earlier "the standard" was a different document.

## What batch 3's checker added (0 HIGH, 14 MED)

- **Count `because` over ALL your files, not only the bodies.** Batch 3 kept it flat in the five
  bodies and still lost five in the scenes files, each one the load-bearing reason of its card.
  One count over the body + scenes + service file of a topic, before and after, catches them.
- A word that makes a NUMBER mean something is content: "independent annotators" (that is what
  makes 0.88 agreement a finding), restaurants "whose true average" sat either side of a
  threshold (that is the study's whole method). Do not swap or drop it.
- "The only mechanism is A and B" is ONE joint mechanism. "Only two things" makes it two
  switches. Same family: an example that is only true when three things hold TOGETHER must say
  "when three things are true together", not judge the first one alone.
- A "then" that closes an "if" is a governor too ("If that list does not exist, then nothing
  has been keeping receipts, AND THEN nothing can be undone").
- An answer to a "Why ...?" question starts with its reason ("Because ...").
- After a split, check what "They", "It", "One" and "That" now point at. "It was published by
  researchers ... They are drawn from" makes the researchers the thing drawn from.
- A three-item list is three fragments after "That is three things.", never "That is X. It is
  Y, and which Z."
- Disowning words ("unsourced", "does not use", "refuses", "no published") are load-bearing
  for the retraction TEST as well as for the reader: it allows a retired figure on a line only
  beside one of them.

## Do not

- Do not `git add`, commit or push. The orchestrator commits after verifying.
- Do not start, stop or restart the dev server (one runs on :3100). Do not run `next build`.
- Do not touch anything outside `content/blog/`, `content/services/` and your log file.
- Do not touch RLS, auth, env, `next.config.ts`, MLS code or any security control.
- Do not fetch realtylt.com (bot-challenged) and never call the MLS Grid API.
