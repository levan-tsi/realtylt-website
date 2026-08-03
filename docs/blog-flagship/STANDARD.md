# The flagship standard

**Owner's brief, 2026-08-02:** *"bring all to same standards, and from here this should be minimum
standard, and learn from each other and make self improving. this will be for business owners, it
should show how it would make them money and answer all the questions they might have and sell them
with storytelling."*

This file is the half a script cannot check. The measurable half lives in `standard.json` and is
enforced by `node scripts/flagship-standard.mjs`.

---

## 1. Who it is for

**A business owner, not a technologist.** Someone who runs a brokerage or a small team, is busy,
has been sold to before, and is deciding whether to spend money. They are not looking for an
explanation of how large language models work. They are asking, in this order:

1. Is this a real problem I have?
2. What does it cost me right now to not fix it?
3. What would fixing it cost, and how long would it take?
4. What will it not do — where does this break?
5. Why should I believe you specifically?

A post that does not answer all five is not finished, whatever it scores.

## 2. It has to show them the money

**Every post carries an explicit money case, and the reader has to be able to argue with it.** Not
"saves time", not "improves conversion" — a number with its arithmetic visible.

Three things, all now required (`hasMoneyMath`, `hasCalculator`, `hasCostSection`):

- **A number they can check.** A four-figure sum built from stated assumptions. The chat post's
  $6,000 is the model: it is the LeadsCalculator's own default commission, so it is arguable rather
  than asserted. If a number cannot be sourced or derived on the page, it does not go on the page.
- **An interactive calculator**, so it becomes THEIR number rather than ours. `LeadsCalculator`
  already exists and is used by two posts; the other three owe one.
- **What it costs and how long it takes.** Refusing to publish a vendor's price because their
  pricing page renders in JavaScript is honest (topic 3 and 5 do this); refusing to discuss cost at
  all is not. Say what drives the cost even where a figure cannot be quoted.

## 3. It has to answer every question they might have

The FAQ is not objection-handling. **Objections are what WE are worried about; questions are what
THEY typed into a search box.** The chat post's three entries — *"Will it annoy my visitors?"*, *"My
leads want a human"*, *"I already have a chatbot"* — are all defensive. Workflow's six are the model
because they include the definitional and comparative ones:

> *What is workflow automation, in plain terms? · What is the difference between n8n, Make and
> Zapier? · Do I have to replace the software I already use? · What happens when it breaks? · How
> long does it take? · Is it worth it for a one-person business?*

Every post needs both kinds, and FAQPage schema is the single highest-impact structure for being
cited by an AI answer. Minimum five, and the definitional question ("what IS this, in plain terms")
is mandatory — it is the one an engine lifts.

## 4. It has to sell with storytelling

The architecture already supports this and it is under-used. The rule:

- **Open on one real moment, not a thesis.** A $6,000 lead messaging at 11:40pm. A phone ringing
  in an empty office. One person, one night, one specific thing that happened.
- **Carry that person through.** The strongest posts return to the opening moment at the close, so
  the reader sees the same night play out differently. That is the sale — not a feature list.
- **The graphics are beats in the story, not decoration.** A scene REPLACES the prose it stages
  (see FLAGSHIP-HANDOFF.md); it never repeats it.
- **Never invent the story.** Composite and anonymised is fine and must be labelled as staged —
  `Conversation` requires a `note` for exactly this reason. A fabricated address on a page whose
  argument is that the details are checkable destroys the argument. This has already happened once
  in a HeyGen cut ("123 Maple Street, Austin") and must never reach a post.

## 5. Meet them at their level

Plain conversational words. No jargon without an immediate plain-English gloss. No em dashes as a
tic, no arrow glyphs, no AI-flowery register. If a sentence would not survive being said out loud to
an agent over coffee, rewrite it.

---

## How the measurable floor works, and why it rises

`scripts/flagship-standard.mjs` measures every AI-service post on eleven facts and derives the floor
from the cohort itself:

- **Numbers floor at the MEDIAN**, not the maximum. A max floor makes the whole set chase one
  outlier and rewards padding; the median pulls the laggard up, and as it rises the median rises
  with it, so the set converges upward on its own.
- **Booleans floor at ANY.** The moment one post proves a thing is worth doing, every post owes it.
  This is the "learn from each other" rule, and it is the one that cannot be gamed.
- **`--ratchet` never lowers a bar.** The standard is a high-water mark in `standard.json`, so a
  weak round cannot quietly relax it.

Why this replaces the old floors: `score-flagship.mjs` asks for one citation, two images and 1,200
words. Every post cleared it while drifting a long way apart — measured 2026-08-02, chat carried
1,030 words of prose and 1 citation against ~2,900 and 4-5 for its four successors, and all five
scored 19/19. **A floor nobody is near has stopped being a standard.** Keep that gate for the
absolute must-haves; this one keeps the set honest against itself.

**The honest weakness:** word count is padding-gameable, and no script can tell a good paragraph
from a long one. It is measured because a post a third the length of its siblings is a real signal,
not because long is good. Read the writing.

## The opening gap (2026-08-02)

All five posts were below the standard the moment it was derived, which is the point — no single
post had everything.

| post | owes |
|---|---|
| **chat** | prose 1,030 → 2,906 · sections 14 → 17 · citations 1 → 4 · FAQ 3 → 5 · images 5 → 6 |
| voice | money math · calculator |
| reactivation | money math · calculator |
| qualification | prose 2,641 → 2,906 · citations 3 → 4 · cost section · money math · calculator |
| workflow | money math · calculator |

**Four of the five have no money case at all** — the single clearest confirmation that the owner's
brief was pointing at something real.
