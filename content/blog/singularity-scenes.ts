/** Scene copy for the Singularity flagship post. TOPIC 21, and the first one written after the
 * twenty-topic rollout closed.
 *
 * REPOSITIONED 2026-08-27 (round 44), on the owner's reading of the live page. The first cut of
 * this post described a prompts-and-playbooks product and said, twice, that nothing in it
 * rewrites its own code. That was written as an honest-limits line and it is false about the
 * thing actually being sold, which is a coding agent with a file-based memory: it writes and
 * ships real software, it keeps what it learns in files it must read before starting, and every
 * correction it is given is written down once rather than repeated. The honesty bar did not
 * move, it moved sides. The safety claim is no longer "it cannot touch the software" but "a test
 * suite and a person stand between anything it writes and anybody seeing it", which is both true
 * and the stronger sentence. See memory `project-singularity-product-definition`.
 *
 * WHAT THIS POST IS ABOUT, and why it needed its own literature. The service page at
 * /services/the-singularity describes a system that runs the other agents, holds one memory,
 * writes and changes the software around them, and proposes one change at a time against a
 * grader that is a test suite for code and recorded history for anything an agent says.
 * The nearest sibling in the cohort is the agent workforce post, which already spends two cited
 * charts on MAST (arXiv:2503.13657) and tau-bench (arXiv:2406.12045). Neither is re-used here.
 * This post rests on a different question: not whether several agents can work together, but
 * whether anything can improve itself, and what has to be standing outside it before the word
 * means anything at all.
 *
 * THE CLAIMS THIS FILE DELIBERATELY DOES NOT MAKE, carried forward from the service page's own
 * header and enforced by lib/blog/zombie-claims.test.ts round K:
 *
 *   - "it improves faster than you can shop for a replacement" (COPY.singularity's closer): a
 *     comparative rate claim against every other product a business owns, with no measurement of
 *     this system or of any of them.
 *   - "remembers everything": an absolute the limits section contradicts. It knows what it was
 *     connected to.
 *   - "gets better with every deal": a rate nobody has measured.
 *
 * There is no dollar figure and no improvement rate anywhere in this file. The calculator
 * deliberately stops at a COUNT rather than converting it to money, and its note says why.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claim without a primary. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three answers, not three teasers. Line two carries the article's own headline measurement so
 * an assistant lifting this box lifts the honest version of the argument rather than the
 * marketing one. Every line is argued at length below it. */
export const IN_SHORT: string[] = [
  "One system stands behind every agent, holds the record they all read from, and writes and changes the software around them. It does write real code, and none of it reaches anybody until the tests pass and a person says yes.",
  "The improving does not come from having the model check itself. Asked to review its own answer twice, a leading model went from 95.5 percent correct on grade school arithmetic to 89.0.",
  "What it learns is kept in files rather than inside a model, one line per correction, read before the next piece of work starts. Every agent reads the same record, so a client explains their situation once.",
];

/** SCENE copy — self review makes it worse. CITED DATA GRAPHIC ONE.
 *
 * Jie Huang, Xinyun Chen, Swaroop Mishra, Huaixiu Steven Zheng, Adams Wei Yu, Xinying Song and
 * Denny Zhou (Google DeepMind; Jie Huang also University of Illinois Urbana-Champaign), "Large
 * Language Models Cannot Self-Correct Reasoning Yet", published as a conference paper at ICLR
 * 2024, arXiv:2310.01798v2, 14 March 2024. Read in the arXiv PDF with pdftotext on 2026-08-27.
 *
 * THE FOUR BARS COME FROM TWO TABLES AND THAT IS STATED ON SCREEN. Bars one to three are Table
 * 3, the INTRINSIC condition, GPT-4 on GSM8K: 95.5 at one call, 91.5 at three calls (round one),
 * 89.0 at five calls (round two). Bar four is Table 2, the ORACLE condition, same model, same
 * benchmark: 97.5.
 *
 * Mixing tables is the hazard the agent workforce post recorded when it kept all four tau-bench
 * bars inside one table rather than borrowing a baseline from another. It is safe here for a
 * reason that can be checked rather than asserted: the two tables print the SAME baseline for
 * this cell, 95.5 in both, so the fourth bar is measured against the identical starting point as
 * the other three. The basis line says so out loud.
 *
 * The method, quoted from the paper: "We prompt the models to undergo a maximum of two rounds of
 * self-correction"; the intrinsic prompt strategy is "1) prompt the model to perform an initial
 * generation... 2) prompt the model to review its previous generation and produce feedback; 3)
 * prompt the model to answer the original question again with the feedback"; and for the oracle
 * condition, "we use the correct label to determine when to stop the self-correction loop... If
 * the answer is already correct, no (further) self-correction will be performed."
 *
 * WHY GPT-4 ON GSM8K AND NOT THE WORST CELL IN THE TABLE. The same Table 3 has GPT-3.5 falling
 * from 75.8 to 38.1 on CommonSenseQA after one round, which is a far more dramatic picture and
 * would have been cherry picking: it is the older model on the benchmark where the failure mode
 * is strongest. The strongest model on the flagship reasoning benchmark is the conservative
 * reading, the drop there is small, and the note says both of those things. */
export const SELF_REVIEW = {
  eyebrow: "The evidence",
  caption: "What reviewing its own answer did to a model's score",
  bars: [
    { label: "Answered once", value: 95.5, display: "95.5%" },
    { label: "After reviewing itself", value: 91.5, display: "91.5%" },
    { label: "After reviewing itself twice", value: 89.0, display: "89.0%" },
    { label: "Told when it was wrong", value: 97.5, display: "97.5%" },
  ],
  max: 100,
  lit: 3,
  basis:
    "The share of grade school word problems one leading model answered correctly, at four settings. The first three are the intrinsic condition, in which the model is asked to look again at what it wrote and try again, with nothing from outside itself to go on. The fourth is the oracle condition from the same paper, in which the right answer is used to decide whether another attempt is needed at all. Both of the paper's tables print the same starting score of 95.5 for this model on this benchmark, which is what lets the fourth bar stand beside the other three.",
  sourceText:
    "Jie Huang, Xinyun Chen, Swaroop Mishra, Huaixiu Steven Zheng, Adams Wei Yu, Xinying Song and Denny Zhou (Google DeepMind and the University of Illinois Urbana-Champaign), Large Language Models Cannot Self-Correct Reasoning Yet, ICLR 2024, arXiv:2310.01798.",
  sourceHref: "https://arxiv.org/abs/2310.01798",
  note: "Arithmetic word problems, on models accessed in August 2023, and every absolute figure here would be different on this morning's models. The heights are also close together, which is itself the finding rather than a weakness of the chart: on this benchmark self review moved the score a few points in the wrong direction rather than off a cliff. It went off a cliff elsewhere in the same table. On a multiple choice commonsense set the older model fell from 75.8 to 38.1 after one round, because a model told to look for a problem in its own answer will find one whether or not there is one. The fourth bar is a laboratory instrument and not a product: it uses the correct answer to decide when to stop, which is precisely the thing nobody has while somebody is waiting for a reply.",
};

/** SCENE copy — the grader is not the truth either. CITED DATA GRAPHIC TWO.
 *
 * Alexandre Gilotte, Clement Calauzenes, Thomas Nedelec, Alexandre Abraham and Simon Dolle
 * (Criteo Research), "Offline A/B testing for Recommender Systems", WSDM 2018,
 * arXiv:1801.07030v1, 22 January 2018. Read in the arXiv PDF with pdftotext on 2026-08-27.
 *
 * WHY THIS PAPER IS IN A REAL ESTATE ARTICLE AT ALL. The product this post describes replays a
 * proposed change against conversations that already happened. That is offline evaluation, and
 * the honest question about offline evaluation is how often it disagrees with what happens live.
 * This is the only kind of study that answers it with a stated sample.
 *
 * The dataset, quoted: "We have access to a proprietary dataset of 39 online A/B tests,
 * representing a total of few hundreds of billions of recommendations."
 *
 * THE FOUR NUMBERS ARE TABLE 3's FALSE NEGATIVE RATE COLUMN: CIS 0.64, NCIS 0.33, PieceNCIS
 * 0.28, PointNCIS 0.16. pdftotext renders that table with the row labels floated into one block
 * above the data rows, so the mapping was confirmed against the paper's own prose rather than
 * against the layout: "the FNR goes from 0.64 (CIS) to 0.33 (NCIS)", and separately that CIS is
 * the estimator whose correlation "seems to be negative", which matches the -0.15 on the same
 * row. Two independent sentences, same mapping.
 *
 * The precision figures quoted in the note are the same table's precision column: 0.28, 0.47,
 * 0.53, 0.56. The bootstrapped intervals are the table's own, 0.08 to 0.11 wide on FNR.
 *
 * THE BAR LABELS ARE PLAIN ENGLISH ON PURPOSE. The paper's names (capped importance sampling,
 * normalised, piecewise, pointwise) name a family of estimators and would tell a brokerage owner
 * nothing. What varies between them is how locally each one corrects for the fact that the
 * recorded behaviour came from the system that was live rather than from the one being tested,
 * so the labels say that instead. The source line names the paper, which is where the real
 * names are. */
export const OFFLINE_ESTIMATE = {
  eyebrow: "The evidence",
  caption: "How often an offline estimate rejected a change that worked when it ran live",
  bars: [
    { label: "The plain estimate", value: 64, display: "64%" },
    { label: "Corrected across the board", value: 33, display: "33%" },
    { label: "Corrected in bands", value: 28, display: "28%" },
    { label: "Corrected case by case", value: 16, display: "16%" },
  ],
  max: 100,
  lit: 3,
  basis:
    "The false negative rate of four ways of estimating, from recorded history alone, what a change would do. A false negative here is a change the offline estimate turned down which the live test then showed was a genuine improvement. All four were checked against the same 39 real online experiments on a large commercial recommendation system, and they differ only in how carefully each one corrects for the fact that the recorded behaviour came from the system that was running at the time rather than from the one being judged. The paper's own bootstrapped intervals are roughly 8 to 11 points wide, so the ordering carries further than the exact heights do.",
  sourceText:
    "Alexandre Gilotte, Clement Calauzenes, Thomas Nedelec, Alexandre Abraham and Simon Dolle (Criteo Research), Offline A/B testing for Recommender Systems, WSDM 2018, arXiv:1801.07030.",
  sourceHref: "https://arxiv.org/abs/1801.07030",
  note: "Product recommendation rather than conversation, at a scale no brokerage will ever see, in 2018. It is here for one reason, which is that it is the only published measurement of the step this entire system rests on. Two numbers from it are worth carrying and neither of them flatters the method. Even the most careful estimator turned down roughly one real improvement in six. And of the changes it did approve, its precision was 0.56, so a little over half of what it waved through turned out to be an improvement when it actually ran. That is the honest reason a person approves the change, and the reason a change that shipped is watched afterwards rather than filed as settled.",
};

/** SCENE copy — the loop, as a spine.
 *
 * Six hops rather than the service page figure's four, and every label and note is written
 * fresh: the figure over there is a summary for somebody deciding whether to buy, and this is
 * the mechanism for somebody deciding whether to believe it. The two are not allowed to share
 * sentences, which is what the scene-echo guard in lib/blog/flagship.test.ts enforces against
 * this post's own body and what reading both pages side by side enforced against the other.
 *
 * SIX AND SHORT, BECAUSE THE PRIMITIVE DOES NOT WRAP. This first shipped as seven hops with
 * captions running to 44 characters, and the rendered 1440 screenshot showed the caption row
 * as an unreadable overlap: Diagram.tsx lays the SVG out on a 1080 unit viewBox, divides it by
 * the number of steps, and centres one unwrapped <text> per hop, so the character budget is
 * 1080/steps. Every one of the other eighteen diagrams in the cohort uses exactly six steps
 * with captions of 32 characters or fewer, which is the proven budget rather than a guess.
 *
 * RE-CUT 2026-08-27 (round 44) to the loop the product actually runs. The old six hops began at
 * "the week" and ended at a receipt, which described a weekly review of conversations and only
 * that. The system being sold also builds and changes software, so the spine now starts where
 * the work starts, at a written brief and the files the previous pass left behind, and the hop
 * that used to be "the replay" is "the gate", because for a code change the grader is a test
 * suite rather than an estimate. The last hop still produces no change of its own: it writes
 * down what happened, and when the thing that happened was a mistake, it leaves a test behind so
 * that mistake cannot come back. That hop is the one usually missing from anything sold under
 * this name. */
export const LOOP_STEPS: { label: string; connects: string; at?: string }[] = [
  { label: "The brief", connects: "One task, written down", at: "Start" },
  { label: "The memory", connects: "What the last pass wrote down" },
  { label: "The change", connects: "One thing, code included" },
  { label: "The gate", connects: "Tests, probes, the screen" },
  { label: "The approval", connects: "A person, holding the diff", at: "Ship" },
  { label: "The record", connects: "What changed, and a new test" },
];

/** SCENE copy — one memory, staged across two channels and two days.
 *
 * THE POINT OF STAGING IT THIS WAY. Every other conversation scene in the cohort stages one
 * exchange and shows what fired underneath it. This one stages the SECOND exchange, on a
 * different channel, forty eight hours after the first, because the thing being demonstrated is
 * not what an agent can do inside a conversation. It is what the next agent knows before the
 * conversation starts.
 *
 * Nothing in it is invented beyond what the site already claims: a call written to a record, a
 * website that reads the same record, matches sent by text. The closing turn is deliberately a
 * statement about the boundary of what it knows rather than a promise about deletion, because
 * deletion is a contract question this business asks vendors about and does not answer for them.
 * The service page FAQ puts it as three lines worth insisting on in writing. */
export const MEMORY_TURNS: { who: "them" | "us"; at: string; text: string }[] = [
  {
    who: "them",
    at: "Thu 8:12 pm",
    text: "Hi. I spoke to someone on Tuesday about the place on the corner.",
  },
  {
    who: "us",
    at: "Thu 8:12 pm",
    text: "You did. You are looking in the low two hundreds, you need somewhere to put the van, and you cannot move before the school year finishes in June. Has any of that changed since Tuesday?",
  },
  { who: "them", at: "Thu 8:13 pm", text: "No, that is all still right. Has anything come up?" },
  {
    who: "us",
    at: "Thu 8:13 pm",
    text: "Three since then that clear all of it. I will text them rather than list them here, because you said on the call that you do not open email.",
  },
  { who: "them", at: "Thu 8:13 pm", text: "Yes, text is better." },
  {
    who: "us",
    at: "Thu 8:14 pm",
    text: "Sent. Everything I just used came from what you said on Tuesday and from what is on the market tonight. There is nothing else in here about you.",
  },
];

export const MEMORY_EVENTS: { at: string; label: string; detail: string }[] = [
  {
    at: "Tue 2:40 pm",
    label: "Said once, on the phone",
    detail: "The price band, the van, the June date. To a person, in passing, not into a form.",
  },
  {
    at: "Tue 2:52 pm",
    label: "Written to the record",
    detail: "The one record every agent reads from, rather than into a phone system nobody else opens.",
  },
  {
    at: "Thu 8:12 pm",
    label: "Recognised on a different channel",
    detail: "No second round of qualifying questions, because the answers were already given.",
  },
  {
    at: "Thu 8:13 pm",
    label: "Filtered against Tuesday",
    detail: "New listings measured against her three constraints rather than against nothing.",
  },
  {
    at: "Thu 8:13 pm",
    label: "Channel taken from the call",
    detail: "Text, because that is the thing she said out loud two days earlier.",
  },
  {
    at: "Thu 8:14 pm",
    label: "Thursday joins Tuesday",
    detail: "So Friday's callback starts from both, and so does whatever agent is added next year.",
  },
];

/** SCENE copy — three ways a correctly built loop produces nothing.
 *
 * Not the limits section, which is what the service cannot do. These are the ways a competent
 * build quietly stops being worth anything, and all three are about how the business runs it
 * rather than about the software. The first is the one nobody expects, because it looks like
 * diligence. */
export const WHERE_IT_STALLS: GridItem[] = [
  {
    lead: "A loop that is not allowed to report no change",
    body: "Some weeks the honest output is that nothing went wrong badly enough to be worth touching. A loop under pressure to justify itself will find something anyway, and a change made because a slot in the calendar demanded one is a change nobody can defend afterwards. The health of this thing is measured by whether it is comfortable saying nothing this week.",
  },
  {
    lead: "A grader pointed at the wrong thing",
    body: "Every loop gets good at whatever it is scored on and finds routes to that score nobody intended. The failure is quiet rather than loud: the figures improve month after month while the thing they were standing in for gets worse. Write down what a good conversation actually looks like before anything is graded against it, then read that description again every quarter, because it is the only part of the arrangement that stops the machine being right about the wrong question.",
  },
  {
    lead: "Receipts nobody has ever opened",
    body: "Every change is supposed to leave a record of what it replaced and what it beat, and that record is worth exactly as much as the number of times somebody has read one. If nobody could tell you what changed last month, you do not have a system that learns. You have one that drifts, with excellent paperwork.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * No `film`: this topic has none, and lib/blog/flagship.test.ts fails a film scene without one.
 * No `component` scenes: every scene here is a primitive, which is what the template was
 * generalised for and what topic 21 is the first to do without a single exception. */
export const SINGULARITY_FLAGSHIP: FlagshipContent = {
  hero: {
    moment: "7",
    suffix: "months",
    /** NOT the plate. The plate is a test model on trestles; this is punched paper tape with
     * QUALITY TESTED printed along it, which is texture behind type rather than a subject. */
    photo: "/images/editorial/punched-tape.jpg",
    signature: "porchlight",
  },
  scenes: {
    "in-short": {
      kind: "summary",
      band: "light",
      ariaLabel: "In short",
      eyebrow: "In short",
      claims: IN_SHORT,
    },
    "self-review": {
      kind: "statbars",
      band: "dark",
      label: "The evidence",
      eyebrow: SELF_REVIEW.eyebrow,
      caption: SELF_REVIEW.caption,
      bars: SELF_REVIEW.bars,
      max: SELF_REVIEW.max,
      lit: SELF_REVIEW.lit,
      basis: SELF_REVIEW.basis,
      sourceText: SELF_REVIEW.sourceText,
      sourceHref: SELF_REVIEW.sourceHref,
      note: SELF_REVIEW.note,
    },
    loop: {
      kind: "diagram",
      band: "dark",
      label: "The loop",
      eyebrow: "The system",
      heading: "Six steps, and the last three are the ones usually missing.",
      lede: "Drawn as the order it has to happen in. Most of what is sold under this name is the first two boxes, which are a briefing and a reporting tool with a good vocabulary. The fourth is the one that turns an opinion into something checkable, the fifth is the ten minutes that makes the rest of it safe to run, and the sixth is what lets a bad decision be found later by somebody who was not in the room when it was taken.",
      steps: LOOP_STEPS,
      altPrefix:
        "The loop, from a written brief and the files the previous pass left behind, to one change with code included, a gate of tests and probes that can refuse it, a person reading the change and approving it, and a written record that leaves a new test behind",
    },
    "offline-estimate": {
      kind: "statbars",
      band: "light",
      label: "The grader",
      eyebrow: OFFLINE_ESTIMATE.eyebrow,
      caption: OFFLINE_ESTIMATE.caption,
      bars: OFFLINE_ESTIMATE.bars,
      max: OFFLINE_ESTIMATE.max,
      lit: OFFLINE_ESTIMATE.lit,
      basis: OFFLINE_ESTIMATE.basis,
      sourceText: OFFLINE_ESTIMATE.sourceText,
      sourceHref: OFFLINE_ESTIMATE.sourceHref,
      note: OFFLINE_ESTIMATE.note,
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/wind-tunnel-model.jpg",
      alt: "A yellow full scale aircraft model standing on trestles at the open mouth of a wind tunnel, its short wings held by a straight brace across them, exposed machinery under the fuselage and a rounded metal fairing resting on the deck beneath, with the dark curved throat of the tunnel behind it",
      caption:
        "A machine built to be blown at. Nobody flew this one and nobody was meant to: it exists so that a question about the real aircraft could be answered before anybody sat in it. That is the whole idea a weekly improvement loop is borrowing, and it is worth saying plainly that a model in a tunnel is not the sky. The measurements were still useful, and the aircraft still had to fly before anyone knew.",
      credit: "Photograph: NASA Ames, 1961, via rawpixel, CC BY 2.0.",
      ariaLabel: "A test model at the mouth of a wind tunnel",
    },
    memory: {
      kind: "conversation",
      band: "light",
      layout: "bubbles",
      label: "One memory",
      eyebrow: "The other half",
      heading: "The second conversation is where you find out whether there is one memory.",
      note: "The pattern, not a recording. The person is invented and so are the timings.",
      themLabel: "The buyer",
      usLabel: "The website",
      turnsHeading: "Thursday evening, on the website",
      eventsHeading: "What was already known, and where it came from",
      turns: MEMORY_TURNS,
      events: MEMORY_EVENTS,
    },
    "reading-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How big is the pile nobody has read?",
      ariaLabel: "How many conversations a year nobody reads",
      inputs: [
        {
          kind: "range",
          id: "conversations",
          label: "Exchanges your systems handle in a month",
          hint: "Chats, calls, texts, replies to a form. Anything that ends up written down somewhere, whether or not it went anywhere.",
          min: 20,
          max: 2000,
          step: 20,
          initial: 300,
          format: "count",
          width: "w-[6.5rem]",
        },
        {
          kind: "choice",
          id: "unread",
          label: "How many of them does a person actually read?",
          hint: "Answer for a normal month rather than for the month you intended to have.",
          initial: 2,
          options: [
            {
              value: 0,
              label: "All of them",
              sub: "Somebody opens every one",
              display: "none of them",
            },
            {
              value: 0.8,
              label: "A sample",
              sub: "The ones that obviously went wrong",
              display: "80% of them",
            },
            { value: 1, label: "None", sub: "Nobody has the hours", display: "all of them" },
          ],
        },
      ],
      chain: [
        {
          label: "Exchanges your systems handle",
          by: { from: "input", id: "conversations" },
          format: "count",
          unit: "a month",
        },
        {
          label: "Over a year",
          by: { from: "rate", value: 12, display: "12 months" },
          format: "count",
          unit: "a year",
        },
        {
          label: "That nobody ever opens",
          by: { from: "input", id: "unread" },
          format: "count",
          unit: "a year",
        },
      ],
      headline: 2,
      resultLabel: "Conversations a year nobody reads",
      note: "There is no money on the end of this one and that is deliberate. Turning an unread transcript into a lost commission needs a rate for how often a poor answer costs a deal, nobody has published one for this trade, and inventing it would mean the most important number in the sum was the one nobody could check. So the arithmetic stops at the size of the pile. Two of the three rows are your own numbers and the third is twelve. The one judgement in it is that reading a sample means reading about one in five, which is not a measurement of anything and is printed in the arithmetic on the right so that you can disagree with it. What comes out is not a loss, it is the material a weekly loop would have to read, and the only claim being made about it is that it exists. If your honest answer to the second question is that somebody reads all of them, you do not need this and that is a real answer rather than a polite one.",
      action: { label: "See how it is built", href: "/services/the-singularity" },
      secondary: { label: "Talk it through", href: "/connect" },
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "Or have us read one",
      text: "Send us a week of your own chat or call transcripts with the names taken out, and we will read every one of them and send back the three questions that got the worst answers, quoted line for line.",
      reassure: "No charge, and nobody calls you unless you ask us to.",
      action: { label: "Send us a week", href: "/connect" },
      ariaLabel: "Have us read a week of your own transcripts",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "The clever part was never the model. It is that a correction gets written down where the next piece of work has to read it, and that nothing ships until something outside the thing says yes.",
    },
    "where-it-stalls": {
      kind: "grid",
      band: "dark",
      label: "Where it stalls",
      eyebrow: "Three ways it produces nothing",
      heading: "None of these is a bug, and all three are common.",
      columns: 3,
      glow: true,
      items: WHERE_IT_STALLS,
    },
    /** The primary action is the panel on the /ai journey rather than a form, because the whole
     * argument of the piece is that the thing is a system you can go and prod rather than a
     * promise. This scene also suppresses the template's generic closing band, so the page ends
     * once. */
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "The answer that has been wrong since March is not going to find itself. It is sitting in your transcripts with a date on it, and it will still be there next March unless something reads them.",
      actions: [
        { label: "See the system", href: "/ai#singularity", variant: "light" },
        {
          label: "How it is built",
          href: "/services/the-singularity",
          variant: "outline-light",
        },
      ],
      footnote:
        "Or start with one week of your own. The reading is the free half of this and nobody has to sell you anything for it.",
    },
  },

  /** Short rail labels for the prose headings. Ids and order are derived from the document, so a
   * key that matches no heading fails scripts/_scratch-toc.mjs and lib/blog/flagship.test.ts
   * rather than leaving a rail row pointing nowhere. */
  headingLabels: {
    "what-the-name-is-claiming-and-what-it-is-not": "The name",
    "seven-months-is-not-unusual-it-is-the-default": "Seven months",
    "the-obvious-fix-is-to-let-it-check-its-own-work": "Checking itself",
    "what-changed-between-those-two-numbers-was-not-the-model": "The oracle",
    "so-the-whole-question-is-what-plays-the-part-of-the-compiler": "The grader",
    "one-change-at-a-time-and-the-reason-is-not-modesty": "One change",
    "most-of-the-changes-will-not-work-and-that-is-the-normal-result": "Most fail",
    "the-grader-is-not-the-truth-either": "Not the truth",
    "who-has-to-be-in-the-loop-and-what-they-actually-do": "Who approves",
    "the-other-half-which-is-the-one-memory": "One memory",
    "what-actually-persists-and-what-does-not": "What persists",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "how-to-test-one-before-you-buy-it": "How to test one",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
