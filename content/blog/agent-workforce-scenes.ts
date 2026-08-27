/** Scene copy for the AI agent workforce flagship post (topic 11).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Eleventh topic on the flagship template and the TENTH IN A ROW that adds no component
 * of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 10. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/ai-agent-workforce.ts. Nothing
 * here claims a capability that page does not claim, and one claim that page used to make has
 * been removed BECAUSE of this research rather than in spite of it.
 *
 * THE DELIBERATE DISTANCE FROM ITS TWO NEAREST SIBLINGS.
 *
 *   TOPIC 5, workflow automation, owns busywork: the manual step, what an interruption costs,
 *   and the chain that fires by itself. Its whole argument is that four of the six hops in a
 *   good automation have no cleverness in them at all. Nothing in this post is about a step that
 *   a person repeats, and none of the interruption research appears here.
 *
 *   TOPIC 10, CRM sync, written in the same round, owns the record: whether two rows are the
 *   same person and what a sync silently does to a field. Nothing in this post is about
 *   identity, matching or field mapping.
 *
 *   THIS post is about MANY agents doing DIFFERENT jobs, and about what supervising them costs.
 *   Reliability across repeated attempts rather than on one attempt. Where multi-agent failures
 *   actually originate. Handover between agents as a named category of failure. What running
 *   several costs and which half of the cost is the instructions. And who is accountable, which
 *   in this industry is answered by a statute rather than by a preference.
 *
 * Not one source, chart, statute or number is shared with any earlier topic.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, ConversationEvent, ConversationTurn, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. Reliability, origin of
 * failure, accountability, which is the order the article itself runs in. */
export const IN_SHORT: string[] = [
  "An assistant that is right most mornings is not an assistant that is right every morning, and the gap between those two is much larger than it feels. The benchmark that measures it found a leading agent solving over 60 percent of tasks on one attempt and under 25 percent when all eight attempts had to be right.",
  "Most multi-agent failures are not the model being stupid. In 1,642 annotated runs across seven frameworks, 44.2 percent of what went wrong came from how the system and the instructions were specified, and the single commonest mode was an agent repeating a step it had already completed.",
  "Nothing you delegate to an assistant changes who is accountable for it. New York's licensing law lists the parties that may hold a real estate licence and they are all people and companies, and the provision on a broker's responsibility turns on what the broker knew and what the broker kept.",
];

/** SCENE copy — the tenth morning, staged.
 *
 * STAGED, and the `note` says so on screen, which is why the Conversation primitive requires
 * one. There is no real client here, no real address and no real transcript. What the scene
 * carries is the SHAPE of the failure the article opens on: a correct-looking piece of work
 * produced from a source of truth that was correct an hour ago.
 *
 * IT REPLACES PROSE RATHER THAN REPEATING IT. The body says the draft went out and was wrong.
 * This scene says what the assistant actually read, in what order, and shows that at no point
 * did anything report a problem, which the body deliberately does not spell out. */
export const TENTH_TURNS: ConversationTurn[] = [
  { who: "them", at: "Wed 5:12pm", text: "Confirming we are on for the walkthrough. What time works Thursday?" },
  { who: "us", at: "Wed 9:40pm", text: "You, by text, from the car: Thursday is out, let us do Friday morning instead." },
  { who: "them", at: "Thu 6:31am", text: "Just checking, are we all set? My clients are driving up." },
  { who: "us", at: "Thu 6:40am", text: "Sent in your name: Confirmed for today at 11. Looking forward to meeting them." },
];

export const TENTH_EVENTS: ConversationEvent[] = [
  // FOUND BY READING THE RENDERED SCENE: the first version said "Four messages, none of which
  // mention Friday", and the panel beside it shows four turns of which one is the text about
  // Friday and one is the assistant's own reply. Two of them are the thread. The count was
  // wrong and the sentence contradicted the turn directly above it.
  { at: "6:38am", label: "Read the thread", detail: "The two emails in the thread, and neither of them mentions Friday. The change was made by text, in another app, and it never arrived here." },
  { at: "6:39am", label: "Read the calendar", detail: "One event, Thursday at 11, unchanged. The message from the car never reached it either." },
  { at: "6:39am", label: "Checked the brief", detail: "Confirm known appointments. Escalate anything ambiguous. Nothing here looked ambiguous." },
  { at: "6:40am", label: "Reported success", detail: "One reply sent, one thread closed, no warnings and no flags. The run log is green and it is accurate." },
];

/** SCENE copy — what it is, and the half the pitch leaves out.
 *
 * FOUR cards in two columns. The first two are the product as the service page describes it,
 * because a scene that only argues against the thing is not honest either. The second two are
 * what that description leaves out, and both of them say something the body does not. */
export const NOT_A_CHATBOT: GridItem[] = [
  {
    lead: "One assistant, one job, already briefed",
    body: "The difference from a general chat window is not intelligence, it is standing context. An assistant configured for one recurring task holds the description of that task, the tools it needs and the standard you want, so you are not re-explaining your business every morning. That part of the pitch is true and it is worth having on its own.",
  },
  {
    lead: "Several at once, on a trigger",
    body: "You can only do one thing at a time. Assistants have no such limit, they do not stop at five o'clock, and they start because something happened rather than because somebody remembered. Adding another is a configuration change. That part is true as well, and it is the half every page in this category leads with.",
  },
  {
    lead: "What you actually removed was the producing",
    body: "The work did not disappear, it changed category. Drafting became reading. Building became checking. That is very often a good trade, because reading is faster than writing and it can be done in one sitting instead of scattered through a day. It is a trade rather than a saving, and a page that describes it as a saving is describing half of it.",
  },
  {
    lead: "And reviewing four streams is a job",
    body: "One assistant is a habit. Four is a morning routine with real hours in it, done by the one person who can tell whether the output is right. Nobody costs that in, which is why the calculator further down this page works out the reviewing rather than the saving. It is the only number in this subject that is entirely yours.",
  },
];

/** SCENE copy — where multi-agent systems actually fail. Cited data graphic ONE.
 *
 * Mert Cemri, Melissa Z. Pan, Shuyi Yang, Lakshya A Agrawal, Bhavya Chopra, Rishabh Tiwari, Kurt
 * Keutzer, Aditya Parameswaran, Dan Klein, Kannan Ramchandran, Matei Zaharia, Joseph E. Gonzalez
 * and Ion Stoica (UC Berkeley; Shuyi Yang at Intesa Sanpaolo), "Why Do Multi-Agent LLM Systems
 * Fail?", arXiv:2503.13657v3, 26 October 2025. Read in the arXiv PDF with pdftotext.
 *
 * Method, quoted from the paper: "we collect 150 traces from five MAS frameworks, which are
 * closely examined by six human experts"; the taxonomy is then validated "through
 * Inter-Annotator Agreement (IAA) studies" reported at 0.88; and the full dataset is "a
 * comprehensive, high-quality collection of 1642 annotated execution traces" from seven
 * frameworks.
 *
 * THE THREE BAR VALUES ARE PRINTED IN FIGURE 1. This note has now been wrong twice about that,
 * so it carries the receipt. Round 45 said they were "read off Figure 1" without one; round 46
 * could not find them, concluded they were "not printed anywhere in the paper", and rewrote this
 * paragraph to present them as sums. Round 47 downloaded the published v3 PDF and read it:
 * `pdftotext` returns 44.2%, 32.3% and 23.5% on three consecutive lines, in -layout, plain and
 * -raw alike. In the arXiv source package they live in figures/taxonomy_neurips_final_10_23_25.pdf,
 * which 02_introduction.tex includes as Figure 1. They are QUOTED, not derived. What is true is
 * that the search comes back empty in v1 and v2, which carry an older taxonomy figure reading
 * 37.17 / 31.41 / 31.41, and empty against the .tex sources in every revision, because the
 * numbers are drawn inside the figure rather than typed in the prose.
 *
 * Figure 1's caption names the sample and says the figure prints these: "The percentages shown
 * represent the prevalence of each failure mode and category as observed in our analysis of 1642
 * MAS execution traces."
 *
 * The v3 prose corroborates all three, mode by mode, and every term is quoted in the paper:
 *
 *   FC1, system design issues: 11.8 + 1.50 + 15.7 + 2.80 + 12.4 = 44.20
 *   FC2, inter-agent misalignment: 2.20 + 6.80 + 7.40 + 0.85 + 1.90 + 13.2 = 32.35
 *   FC3, task verification: 6.20 + 8.20 + 9.10 = 23.50
 *
 * FC2 sums to 32.35 rather than 32.30 because the prose gives FM-2.4, information withholding,
 * as 0.85% where Figure 1 prints 0.80%. On the figure's own numbers the three categories total
 * exactly 100.
 *
 * THE TRAP, and it is the reason this note is this long. The same paper prints a SECOND category
 * split, in the legend of the per-system bar chart in section 6: System Design Issues 41.8%,
 * Inter-Agent Misalignment 36.9%, Task Verification 21.3%. The paper is not disagreeing with
 * itself. That figure states a different corpus in its own caption: "Distribution of failure in
 * MAD with MAST labels on total 210 traces. This plot visualizes the failure distributions of
 * the first 30 traces for each system." 210 traces against Figure 1's 1,642. A checker who finds
 * 41.8/36.9/21.3 and "corrects" these bars would be swapping a 210-trace sample into a chart
 * whose caption names the 1,642-trace one. Do not make the edit.
 *
 * The individual modes quoted in the body are the v3 prose figures: step repetition 15.7%
 * (FM-1.3), reasoning-action mismatch 13.2% (FM-2.6), unaware of termination conditions 12.4%
 * (FM-1.5), disobey task specification 11.8% (FM-1.1). */
export const WHERE_FAIL = {
  eyebrow: "The evidence",
  caption: "Where the failures came from, in 1,642 annotated multi-agent runs",
  bars: [
    { label: "System design and specification", value: 44.2, display: "44.2%" },
    { label: "Agents misaligned with each other", value: 32.3, display: "32.3%" },
    { label: "Verification of the result", value: 23.5, display: "23.5%" },
  ],
  max: 100,
  lit: 0,
  basis:
    "The share of classified failures falling into each of the three categories, across 1,642 annotated execution traces drawn from seven multi-agent frameworks running coding, mathematics and general agent tasks. The taxonomy underneath it was built by six human experts reading 150 traces closely and then tested for consistency between independent annotators, which is the step that separates a taxonomy from an opinion.",
  sourceText:
    "Mert Cemri and twelve co-authors, UC Berkeley, Why Do Multi-Agent LLM Systems Fail?, arXiv:2503.13657, 2025.",
  sourceHref: "https://arxiv.org/abs/2503.13657",
  note: "These are research frameworks running research tasks, mostly programming and mathematics, and not four assistants in a brokerage. Two limits matter. The bars are shares of the failures that happened, not a probability that anything will fail, so a system with very few failures and a system with very many can produce the same chart. And the taxonomy was applied at scale by a language model calibrated against the human annotations rather than by the humans themselves, which the authors state plainly. What transfers is the ranking rather than the percentages: the largest category is how the system and its instructions were specified, which is the half a buyer controls and the half nobody quotes on.",
};

/** SCENE copy — what happens when the written rules are taken away. Cited data graphic TWO.
 *
 * Shunyu Yao, Noah Shinn, Pedram Razavi and Karthik Narasimhan, "tau-bench: A Benchmark for
 * Tool-Agent-User Interaction in Real-World Domains", arXiv:2406.12045, 17 June 2024. Read in
 * the arXiv PDF with pdftotext. THE AUTHOR BLOCK NAMES ONE AFFILIATION, Sierra, and the first
 * draft of the body said "a team at Sierra and Princeton". Princeton is not on the paper.
 *
 * The ablation, quoted from the paper: "we perform an ablation study by removing the domain
 * policy from the FC agent system prompt... in tau-retail where rules are simpler and closer to
 * commonsense, gpt-4o and gpt-3.5-turbo agents only degrade 4.4% and 5.5%... In tau-airline
 * where rules are more complex and ad-hoc... removing the policy hurts gpt-4o significantly
 * (-22.4%)".
 *
 * THE FOUR NUMBERS ARE TABLE 3's OWN, NOT TABLE 2's, and the difference is worth recording.
 * Table 2 reports gpt-4o at 61.2 in retail and 35.2 in airline. Table 3, the ablation, reports
 * 61.2 and 56.8 for retail and 33.2 and 10.8 for airline. The airline baselines differ by two
 * points between the two tables. Mixing them would have produced a chart whose arithmetic did
 * not match either table, so all four bars come from Table 3 and the basis line says so.
 *
 * WHY THIS IS THE SECOND CHART RATHER THAN pass^k. The consistency finding is the article's
 * spine and it stays in the PROSE, because the paper states it as "pass^8 drops to < 25%" and a
 * bound is not a value. Drawing a bar at 25 for a figure the authors wrote as "under 25" would
 * be inventing a measurement, which is the exact thing this cohort exists to avoid. */
export const RULES_REMOVED = {
  eyebrow: "The evidence",
  caption: "What the same agent scored with its written rules taken away",
  bars: [
    { label: "Simple task set, rules provided", value: 61.2, display: "61.2%" },
    { label: "Simple task set, rules removed", value: 56.8, display: "56.8%" },
    { label: "Complex task set, rules provided", value: 33.2, display: "33.2%" },
    { label: "Complex task set, rules removed", value: 10.8, display: "10.8%" },
  ],
  max: 100,
  lit: 3,
  basis:
    "The share of tasks completed correctly on a single attempt by one leading model, measured by comparing the state of the database at the end of each conversation against the one correct outcome. All four figures come from the paper's ablation table, in which the written policy is removed from the agent's instructions. The simple task set is a retail domain of 115 tasks; the complex one is an airline domain of 50 tasks with rules that vary by membership tier and cabin class.",
  sourceText:
    "Shunyu Yao, Noah Shinn, Pedram Razavi and Karthik Narasimhan, tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains, arXiv:2406.12045, 2024.",
  sourceHref: "https://arxiv.org/abs/2406.12045",
  note: "This was measured in June 2024 on models that have all been replaced, and every absolute number here would be different today. Read the pairs rather than the heights. Two more limits are worth knowing: the customer on the other side of every conversation is another language model rather than a person, which makes the conversations tidier than real ones, and the domains are simplified versions of real businesses rather than real ones. What survives all of that is the comparison the ablation was built to make, which is how much of an agent's usable ability is coming from a document somebody wrote rather than from the model underneath it.",
};

/** SCENE copy — three ways a good set of assistants produces nothing.
 *
 * Deliberately not any sibling's three, and not a restatement of the limits section: the limits
 * are what the service cannot do, and these are the ways a competent build ends up worthless
 * anyway. All three are about the reader's own habits rather than about the software. */
export const WASTED: GridItem[] = [
  {
    lead: "The review that stopped happening in week two",
    body: "It does not stop because anybody decided to stop. It stops because nine good mornings in a row teach you that the tenth will be fine, which is exactly the lesson a system with a high single-attempt success rate is built to teach. The control that matters is not a decision to be careful, it is a slot in a diary that survives a busy fortnight.",
  },
  {
    lead: "A brief nobody has reopened since the build",
    body: "The document is the thing that makes the assistant useful and it is the only part of the setup that goes stale, because your business moves and the brief does not. A year-old brief produces a year-old standard with total consistency, and nothing in the output looks old, which is why nobody notices until a client mentions it.",
  },
  {
    lead: "Assistants wired to each other for no reason",
    body: "Chaining one assistant's output into the next feels like progress and it buys a whole category of failure that independent assistants do not have: information held and not passed on, an assumption carried forward instead of questioned, a task quietly drifting. Unless there is a reason for the handover, two separate assistants and a person in the middle is the cheaper machine.",
  },
];

/** SCENE copy — one assistant, drawn as hops.
 *
 * The service page's own three step flow plus the three hops that page does not name, and all
 * three of the additions are the article: the brief written before any software, access scoped
 * to the job, and a review step that belongs to a person on a fixed day.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing
 * is clipped by the container edge at 390px. 33 characters lost a letter on the reactivation
 * post; "Written down first" is 18. */
export const AGENT_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The job", connects: "Written down first" },
  { label: "The brief", connects: "Rules and exceptions" },
  { label: "The access", connects: "Only what it needs" },
  { label: "The run", connects: "On a trigger, alone" },
  { label: "The draft", connects: "Made, never sent" },
  { label: "The read", connects: "A person, on a fixed day" },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. */
export const AGENT_WORKFORCE_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments so far have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12
   * reviews, 9 days, 3 results, 1 word and 2 records. Ten mornings is a run of days rather than
   * a single moment, and that is the point: nothing at all happens on the first nine, and the
   * first nine are what make the tenth possible. */
  hero: {
    moment: "10",
    suffix: "mornings",
    photo: "/images/lifestyle/buying.jpg",
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
    "tenth-morning": {
      kind: "conversation",
      band: "dark",
      layout: "bubbles",
      label: "The tenth morning",
      eyebrow: "The run that reported success",
      heading: "Everything it read was true an hour earlier.",
      note: "Staged for illustration. No real client, no real address and no real transcript: this is the shape of the failure, written out so the two tracks can be read side by side.",
      themLabel: "The buyer's agent",
      usLabel: "Your side",
      // NOT "The thread". Found by looking: the column carries four bubbles and one of them is
      // the text message from the car, which is the whole point of the scene precisely because
      // it was NOT in the thread. Calling the column the thread contradicted the event beside it.
      turnsHeading: "The morning, in order",
      eventsHeading: "What the assistant did",
      turns: TENTH_TURNS,
      events: TENTH_EVENTS,
    },
    "not-a-chatbot": {
      kind: "grid",
      band: "dark",
      eyebrow: "What you are actually buying",
      heading: "Two halves, and the pitch only contains the first one.",
      columns: 2,
      glow: true,
      items: NOT_A_CHATBOT,
      label: "What it is",
    },
    "where-fail": {
      kind: "statbars",
      /** DARK, and the second chart on this post is LIGHT. Topic 8 carried two dark charts,
       * topic 9 two light ones, and topic 10 one of each in the other order. Deciding it per
       * post keeps the recent run from settling into a rhythm. */
      band: "dark",
      label: "Where it fails",
      ...WHERE_FAIL,
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-17.jpg",
      // RE-CHECKED IN ROUND I AT THE 16:9 CROP, which is the one a phone ships. The chalkboard
      // list, the beams, the orange bar front and the stools are all inside it, and the six items
      // are read off the board rather than assumed.
      //
      // One correction: the chalk is not white. Sampling the brightest strokes returns
      // rgb(123,135,120), a pale green, and it reads green at the zoom as well. Small, but it is
      // the same class as the "brown ink" on a greyscale scan two posts over.
      alt: "An open plan room with exposed timber ceiling beams, a long polished wooden dining table on the left and an orange fronted kitchen island with metal stools on the right, and in the centre a white cabinet whose front is a dark chalkboard panel carrying a handwritten list in pale green chalk reading milk, dog food, coffee, bread, cheese and soap",
      caption:
        "Six lines on a board and anybody in this house can do the shopping without asking a question. That is what a brief is, and it is the entire difference between an assistant that is useful and one that is fast and plausible and slightly wrong. Nobody can write yours except you.",
      credit: "Photograph by Jeremy Levine Design, CC BY 2.0.",
      ariaLabel: "The list on the board",
    },
    "rules-removed": {
      kind: "statbars",
      band: "light",
      label: "The brief",
      ...RULES_REMOVED,
    },
    "agent-path": {
      kind: "diagram",
      band: "dark",
      label: "One assistant",
      eyebrow: "The system",
      heading: "Six hops, and two of them are not software at all.",
      lede: "The first and the last hop are the ones that decide whether this works, and neither of them is anything you buy. Writing the job down is where most of the assistant's usable ability comes from, and the read at the end is the only control in the whole diagram, because nothing else in it can tell you that the output was wrong.",
      steps: AGENT_PATH,
      altPrefix: "The path from a job written down to a draft that a person reads before anybody sees it",
    },
    "agent-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many hours a year would you spend reading their work?",
      ariaLabel: "How many hours a year reviewing what the assistants produce",
      inputs: [
        {
          kind: "range",
          id: "agents",
          label: "Assistants you would run",
          hint: "One per recurring job. Count the jobs you could describe to a new starter on their first day without stopping to think.",
          min: 1,
          max: 12,
          step: 1,
          initial: 3,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "outputs",
          label: "Pieces of work each one produces a week",
          hint: "A draft, a summary, a deck, a chase. Count things somebody would have to look at, not steps the assistant takes.",
          min: 1,
          max: 40,
          step: 1,
          initial: 10,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "read",
          label: "Share you would read before it reaches anybody",
          hint: "Be honest about the number you would still be hitting in week six rather than the one you intend in week one.",
          min: 5,
          max: 100,
          step: 5,
          initial: 60,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes to read one properly",
          hint: "Properly means against the brief rather than for tone. Skimming for tone is what stops catching anything by week two.",
          min: 1,
          max: 20,
          step: 1,
          initial: 3,
          format: "count",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "Assistants running", by: { from: "input", id: "agents" }, format: "count", unit: "assistants" },
        { label: "Pieces of work each", by: { from: "input", id: "outputs" }, format: "count", unit: "a week" },
        { label: "Over a year", by: { from: "rate", value: 52, display: "52 weeks" }, format: "count", unit: "pieces a year" },
        { label: "That you would actually read", by: { from: "input", id: "read" }, format: "count", unit: "pieces to read" },
        { label: "At your reading time", by: { from: "input", id: "minutes" }, format: "count", unit: "minutes a year" },
        { label: "In hours", by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" }, format: "hours", unit: "hours a year" },
      ],
      headline: 5,
      resultLabel: "Hours a year reading what they produced",
      note: "This is the only calculator on this website that works out what the service costs you rather than what it saves you, and that is deliberate: the saving is the part everybody already estimates and the reviewing is the part nobody does. There is no hours-saved row because it would be a guess. Nobody has published a measurement of how long an assistant's draft takes a person to check in this industry, and every input above is therefore yours. There is also no row comparing this with a salary, and there was never going to be one. The published median wage for an administrative assistant is a real number and it is quoted further down this page, but it buys accountability and judgement and somebody who notices that the job has changed, and dividing it by anything here would be arithmetic on two things that are not the same purchase.",
      action: { label: "See how it is built", href: "/services/ai-agent-workforce" },
      secondary: { label: "Talk one job through with us", href: "/connect" },
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "You did not remove the work. You changed it from producing into reading, which is usually a good trade and is never a free one, and the reading is done by the only person who can tell whether it is right.",
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Send us one recurring job in your own words, however roughly. We will send back the brief we would write for it, the exceptions we think it needs, and an honest opinion on whether it is delegable at all yet.",
      reassure: "It is a short reply from a person, it costs nothing, and not yet is a perfectly good answer to give about a job.",
      action: { label: "Send us one job", href: "/connect" },
      ariaLabel: "Send one job for an honest opinion",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-14.jpg",
      // RE-CHECKED IN ROUND I AT THE 16:9 CROP. It keeps the mantel, the open door and the French
      // doors; the light on the floor comes from the glazed doors at the right.
      //
      // Two corrections. The fern stands in a white pot on the hearth in front of a BLACK firebox
      // whose surround is painted white, so "in the white painted fireplace opening" put it in the
      // wrong place. And the room through the open door is not dim: a window and a black leather
      // sofa are plainly visible in it, which is better for the caption than a dark doorway is.
      alt: "A living room with a wooden fireplace mantel carrying two large carved elephants and a row of turned candlesticks under a tall mirror, a fern in a white pot on the hearth in front of a black firebox whose surround is painted white, a five panel door standing open onto a further room with a window and a sofa in it, and glazed French doors at the right throwing sunlight across a polished wood floor",
      caption:
        "The door is open and the light is on the floor and nobody has walked through yet. Everything an assistant produces sits exactly like this until a person goes and looks at it, and the going and looking is not a temporary precaution for the first month. It is the shape of the job now.",
      credit: "Photograph by smoMashup1, CC BY 2.0.",
      ariaLabel: "The room nobody has walked through yet",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 10: on light, the cost section, the
       * limits section and the FAQ run as one long pale band. Flipping this one breaks the run. */
      band: "dark",
      eyebrow: "Three ways a good build produces nothing",
      heading: "None of them are the model.",
      columns: 3,
      items: WASTED,
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Take one job you keep redoing and write the brief for it this week, before anybody sells you anything. Include what should happen in the cases that are not the normal case. If you cannot finish it, you have learned the most valuable thing available today, which is that the job is not yet delegable to anybody at all.",
      actions: [
        { label: "See it on the AI page", href: "/ai#agents", variant: "light" },
        { label: "How it is built", href: "/services/ai-agent-workforce", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because three separate things drive it and only one of them is software: the hour or two of writing each brief properly, the work of giving an assistant safe access to the systems its job needs, and a running cost that tracks how much it has to read rather than how much it writes. The AI audit is an hour, done with you, and it ends with one job written down properly rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-an-agent-workforce-actually-is-and-what-it-is-not": "What it is",
    "right-once-and-right-every-time-are-different-products": "Right every time",
    "what-happens-when-you-run-the-same-job-twenty-times": "Running it again",
    "where-these-systems-actually-go-wrong-and-it-is-mostly-not-the-model": "Where it fails",
    "the-brief-is-the-product": "The brief",
    "why-the-second-assistant-costs-more-than-the-first": "The second one",
    "where-the-money-actually-goes-when-you-run-several": "Where money goes",
    "what-a-person-costs-and-why-you-cannot-divide-by-it": "What a person costs",
    "who-is-responsible-when-an-assistant-is-wrong": "Who is responsible",
    "what-supervision-looks-like-when-the-thing-you-are-supervising-is-software": "Supervision",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-test-one-assistant-before-you-run-four": "How to test one",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
