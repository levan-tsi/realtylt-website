/** Scene copy for the workflow automation flagship post.
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. This is topic 5 of the flagship template, and the fourth in a row that adds no component
 * of its own: every scene below resolves to a primitive that already existed.
 *
 * SOURCE OF TRUTH for what the product does is content/services/workflow-automation.ts. Nothing
 * here claims a capability that page does not already claim. The rebuilt chain in the diagram is
 * that page's own `figure` (trigger plus five nodes) in the article's voice, and the setup-time
 * line in the cost section is its own FAQ answer. Where this piece goes further it goes into
 * PUBLISHED research and PUBLISHED vendor documentation, both quoted from the source rather than
 * from a summary of it, never into new promises about our own stack.
 *
 * NO CONVERSATION SCENE, deliberately. The `Conversation` primitive stages an exchange, and the
 * demonstration this topic actually has is a chain of system hops with no second party in it.
 * Forcing it into bubbles would have put topic 1's content on topic 5's page.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site.
 *
 * ROUND 24 REFRESH (2026-11-03), from the agents' refresh draft and its second reader's 24 notes
 * (realtylt-agents company/agents/seo/drafts/2026-11-03-workflow-automation-real-estate-business*).
 * What changed in the scenes, and why: no platform name in visitor copy (the brand rule; the
 * sources stay linked in the body); the twenty five minutes is ELAPSED TIME before resumption in
 * one study's sample, never a cost per task; the rebuilt chain's reply is DRAFTED and waits for a
 * person's approval (our own scoring: anything that reaches a customer is risk 3 or more and keeps
 * a person on it); "stays green, nobody is told" became what the documentation supports (failed
 * runs are marked errored in the run history; who hears about it depends on the setup); the
 * prevalence lines with no source ("almost nobody", "most people", "nearly every") are gone; six
 * scenes added for the new sections (the screening questions, the cost shape, the first month,
 * who it fits, the roadmap, the quiz). The film is kept as it was rendered; its caption now says
 * where the page and the film differ. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";
import { WORKFLOW_QUIZ } from "./workflow-quiz";

/** Our own method, cited as ours: the screening questions, the scores, the four checks and the
 * verdicts of the AI assessment (published in full on the post on what to automate first). */
const METHOD = { text: "our method, the RealtyLT AI assessment" };

/** The film. One definition, read by the scene that plays it AND by the VideoObject JSON-LD, so
 * the two can never disagree about length, dimensions or what the clip actually shows.
 *
 * Third film built on real footage, same committed recipe as the reactivation and qualification
 * ones: vo.mjs generates and MEASURES the narration, bg.mjs cuts the picture bed to those
 * measured boundaries, render.mjs draws the type on transparent PNGs, assemble.mjs composites and
 * mixes. 1280x720 because that is the footage's native resolution and nothing here is upscaled.
 *
 * ONE THING THIS ONE DOES THAT THE OTHER THREE DID NOT: the cut lives in scripts/film/workflow/
 * cut.mjs and every other script imports the length and the fade point from it. The previous
 * films wrote the length into two files and the fade into one, which is exactly how a re-recorded
 * line leaves a hardcoded fade behind and blacks out the last third of a render.
 *
 * Four of the nine picture beats are deliberately BLACK, alternating with the footage. Three of
 * them are held cards (the by-hand log, the wired chain, the rule) and hairline type over a
 * sunlit kitchen is not a card, it is a smudge. */
export const WORKFLOW_FILM = {
  src: "/video/film-workflow.mp4",
  poster: "/video/film-workflow-poster.jpg",
  width: 1280,
  height: 720,
  seconds: 59,
  /** ISO 8601, which is the only duration format VideoObject accepts. */
  duration: "PT59S",
  name: "Ninety seconds of typing, and the wait before the work comes back",
  description:
    "A form arrives at 11:47pm and nobody sees it until the morning. The film follows the same lead by hand, eight steps spread across three days, then wired as a single chain whose first and last hop land in the same minute. It closes on the quiet failure: one platform's default pause applies only when a chain fails on 95 percent or more of its runs, so a chain failing one time in twenty keeps running, and its failed runs wait in a history somebody has to open.",
} as const;

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, for the reader who is skimming and for the assistants
 * that increasingly answer on somebody's behalf. Each one is a number somebody else can check:
 * the first two are the cited field study, the third is Zapier's own documented default. */
export const IN_SHORT: string[] = [
  "Workflow automation connects the programs you already pay for, so that finishing one step, such as sending a quote, starts the next and nobody retypes what a system already knows.",
  "Score each job for impact and risk before building anything. A job whose result reaches a customer keeps a person approving it, and a low-impact job is left alone.",
  "A chain can fail quietly. One platform pauses a chain only when 95 percent of its runs in 7 days fail, so every chain needs a failure report to a named owner, tested once.",
];

/** SCENE copy — work fragmentation. The page's cited data graphic.
 *
 * A FIFTH study, deliberately. The chat and voice flagships cite HBR/Oldroyd on response speed,
 * the reactivation piece cites how sellers found their agent, and the qualification piece cites
 * urgency of sale. None of those is evidence about what a small manual step actually costs, which
 * is this piece's whole argument.
 *
 * Figures are from Mark, Gonzalez and Harris, "No Task Left Behind? Examining the Nature of
 * Fragmented Work", Proceedings of CHI 2005, Donald Bren School of Information and Computer
 * Science, University of California, Irvine. Method, from the paper's own Methodology section:
 * 24 information workers (7 managers, 9 analysts, 8 developers) at one company were shadowed,
 * each formally observed and timed for three and a half days, an average of 25 hours 42 minutes
 * per person, over 700 formal hours of observation in total, with the observer noting the time to
 * the second.
 *
 * Every figure below was read in the paper, not in a summary of it. That matters here more than
 * usual: the number the internet attributes to this research is "23 minutes 15 seconds", and the
 * paper does not contain it. The published figure is 25 minutes 26 seconds, and the same paper
 * says 77.2 percent of interrupted work was resumed the same day rather than the 81.9 percent that
 * circulates with it. Quote the paper.
 *
 * THE CAVEAT IS THE IMPORTANT PART and it is on screen. These were desk workers at a technology
 * company observed in one field study, and not one of them sold a house. */
export const FRAGMENTED = {
  eyebrow: "The evidence",
  /** The caption is rendered as the scene heading AND as the SVG title, so it has to hold at the
   * heading size rather than read well as prose. Kept near the length of the qualification
   * post's, which holds on one line at 1440. */
  caption: "How long it took to get back to interrupted work",
  /** THREE BARS BECAME FOUR, because two of the three were not the categories a reader would
   * take them for.
   *
   * As shipped, bar 2 was "Before interrupted work was picked up again" (25 min 26 sec) and
   * bar 3 was "Before it was picked up, when somebody else prompted it" (61 min 37 sec). Both
   * labels are literally accurate and both figures are in the paper. Side by side they invite
   * a comparison that is not available, because they are not disjoint: 25 min 26 sec is the
   * average over EVERY same-day resumption and it already contains the externally prompted
   * ones. A reader sees 25 against 61 and concludes prompting roughly doubles it.
   *
   * The paper gives the honest pair and it makes the point HARDER, not softer: work people went
   * back to on their own resumed in 21 min 28 sec, work that waited for somebody else sat for
   * 61 min 37 sec. Nearly three times, not twice. The article's own audit grid was already
   * quoting that pair correctly; only the chart was mixing an average with a subset.
   *
   * The arithmetic reconciles exactly and is now in the basis line, for the same reason the
   * calculator puts its chain on screen: 90.1% self-resumed at 21 min 28 sec plus 9.9%
   * externally resumed at 61 min 37 sec gives 25 min 26 sec. Nothing is derived and nothing is
   * ours; all four figures are quoted from the paper. */
  bars: [
    { label: "Time in one piece of work before switching", value: 11.07, display: "11 min 4 sec" },
    { label: "Back to it when you went back on your own", value: 21.47, display: "21 min 28 sec" },
    { label: "Back to it, averaged over every case", value: 25.43, display: "25 min 26 sec" },
    { label: "Back to it only because somebody else prompted it", value: 61.62, display: "61 min 37 sec" },
  ],
  /** Durations against each other, not shares of a whole, so the axis scales to the largest bar.
   * A `max` here would draw all four short and lose the ratio that is the entire point. */
  lit: 2,
  basis:
    "Average elapsed time, 24 information workers observed at their desks and timed to the second. All three resumption figures count work picked up again the same day, which was 77.2 percent of everything interrupted. The middle figure is not a third category. That is because nine resumptions in ten were self-started, and 90.1% at 21 min 28 sec with 9.9% at 61 min 37 sec averages out to exactly the 25 min 26 sec on the third bar.",
  sourceText:
    "Mark, Gonzalez and Harris, the CHI 2005 paper from UC Irvine. 57 percent of working spheres were interrupted and 77.2 percent of interrupted work was resumed the same day.",
  sourceHref: "https://ics.uci.edu/~gmark/CHI2005.pdf",
  note: "These were managers, analysts and software developers at one technology company, observed in a single field study, and none of them ran a small business. The times are how long passed before work was picked up again, usually with other activities in between, not time lost. It measures how fragmented desk work was. It is not a measurement of your week, and no automation should be sold to you on the back of it.",
};

/** SCENE copy — the three excuses.
 *
 * The article's own three, put into the article's voice. The scene REPLACES the three bold
 * paragraphs the post used to carry, so these words appear exactly once on the page. */
export const THREE_LIES: GridItem[] = [
  {
    lead: "It only takes a minute.",
    body: "In the invented example it takes a minute forty times a month. And the minute is not the whole of it: in the study above, interrupted work went to the back of the queue and usually waited a while, with other things done first, before anyone came back to it.",
  },
  {
    lead: "I would rather do it myself, so I know it is done right.",
    body: "This is the fair objection. Wanting to see the work is correct. The answer is not to trust a system blindly. It is to build one you can watch, with a person approving anything a customer will read.",
  },
  {
    lead: "It is not worth automating something this small.",
    body: "Individually, correct. The point is that these steps form a chain, and a chain is exactly what these tools are good at. You are not automating step four. You are automating one through eight, and the saving is in the joins.",
  },
];

/** SCENE copy — the hour with a piece of paper.
 *
 * The teaching content, and the part a reader can use tomorrow whether or not they ever buy
 * anything. Four moves rather than the five bullets the post used to carry: the first two bullets
 * were one instruction split in half, and the split made the list look longer than the job is. */
export const AUDIT: GridItem[] = [
  {
    lead: "Follow one real job, end to end.",
    body: "Not the ideal version. The one that actually happened last week, including the part where somebody had to chase a signature twice. Write down every step, including the ones that feel too small to write down.",
  },
  {
    lead: "Mark every step where information moves between two systems by hand.",
    body: "That is your list. The steps worth finding are often the ones nobody notices any more, because they have been done by hand for years.",
  },
  {
    lead: "Mark every step that only happens if somebody remembers.",
    body: "That is your risk, and it is a different list. In the study above, work people came back to themselves resumed in twenty one minutes and twenty eight seconds. Work that waited for somebody else to prompt it sat for sixty one minutes and thirty seven seconds.",
  },
  {
    lead: "Score each job for impact and risk, not by how annoying it is.",
    body: "Two scores from 1 to 5, each with a reason. How often a job happens and how much judgement it needs feed both, and the four checks set a floor under the risk.",
  },
];

/** SCENE copy — the rebuilt chain.
 *
 * This is content/services/workflow-automation.ts's own `figure`: the 11:47pm trigger and its five
 * nodes, drawn as a system rather than re-told as a list. It claims nothing the service page does
 * not already claim.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. Measured on the reactivation post, where it cost a
 * letter. "Site or portal" is 14 characters.
 *
 * The two timestamps are the argument: the first hop and the last hop are the same minute. */
export const REBUILT_CHAIN: { label: string; connects: string; at?: string }[] = [
  { label: "The form", connects: "Site or portal", at: "11:47 pm" },
  { label: "The record", connects: "Matched, not duplicated" },
  { label: "The details", connects: "Phone and address checked" },
  { label: "The reply", connects: "Drafted, for a person to approve" },
  { label: "The route", connects: "Scored, then assigned" },
  { label: "The task", connects: "Calendared, with the context" , at: "11:47 pm" },
];

/** ROUND 29 (2026-11-14): one sent quote, followed up. The service page's own figure
 * (content/services/workflow-automation.ts: a roofing quote sent on Tuesday at 4:10pm) in the
 * article's voice. An invented example, said in the text above the scene. The first caption is
 * the shortest, as the rebuilt chain's is. */
export const QUOTE_CHAIN: { label: string; connects: string; at?: string }[] = [
  { label: "The quote", connects: "Sent", at: "Tue 4:10 pm" },
  { label: "The record", connects: "Logged once" },
  { label: "Day 3", connects: "Note drafted, approved" },
  { label: "A reply", connects: "Stops it, goes to you" },
  { label: "Day 7", connects: "A task: call them" },
  { label: "The outcome", connects: "Won or lost marked" },
];

/** ROUND 29: the same wiring in other kinds of business. Every line is the service page's own
 * example (content/services/workflow-automation.ts "Where it earns its keep"); the people in them
 * stay with a person. */
export const BY_TRADE: GridItem[] = [
  {
    lead: "A roofer, plumber or heating company",
    body: "A sent quote starts the follow-up above. Any reply stops it and goes to the owner with the quote attached.",
  },
  {
    lead: "A dental office",
    body: "The new-patient forms land in the right place and a confirmation is drafted for the front desk to approve, so the front desk sees one finished record. Nothing in the chain reads or moves anyone's treatment record.",
  },
  {
    lead: "An accounting office in tax season",
    body: "A list of the documents each client still owes is kept current from what has arrived, and a drafted reminder, once approved, goes only to the clients still missing something.",
  },
  {
    lead: "A salon, spa or gym",
    body: "A booking starts a drafted confirmation and reminder. A person approves what the message says before the chain is switched on.",
  },
  {
    lead: "A real estate or title office",
    body: "A signed contract puts the inspection reminder, the document requests and the key dates on the calendar. What each date means is still a person's call.",
  },
  {
    lead: "A one-person business",
    body: "Start with the one chain at the top of the frequency list, and judge it after a month against the baseline.",
  },
];

/** SCENE copy — the three rules for automation you can watch.
 *
 * The post's original three, now with the mechanism named in each one. Both mechanisms were read
 * in the vendors' own documentation rather than assumed: n8n's error workflow starts with an
 * Error Trigger, and Zapier keeps a per-run history with a documented status vocabulary. */
export const WATCHABLE: GridItem[] = [
  {
    lead: "Every run gets logged.",
    body: "If you cannot answer did it run, and what did it do, you have built a black box that mostly agrees with you. The platforms cited on this page keep a run history. The real question is whether anybody has opened it since the week it went live.",
  },
  {
    lead: "Failures reach a named person.",
    body: "Whatever the tool, a failure goes to an owner, the failed work is kept so it can be finished by hand, and the report is tested once.",
  },
  {
    lead: "Anything genuinely ambiguous stops and asks.",
    body: "A possible duplicate it cannot confirm, a request that matches no rule, a model suggestion it is unsure of: the chain hands the item to a person instead of guessing.",
  },
];

/** SCENE copy — the three ways the project fails.
 *
 * Deliberately not the other topics' three, and deliberately not the same list as the three rules
 * above. Those are ways a running chain betrays you. These are ways the whole exercise is wasted
 * while every individual chain works perfectly. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "You automate the impressive one.",
    body: "The chain that demonstrates well is not always the one with the most impact or the smallest worst day. Score first, and the dull, contained job often goes to the top.",
  },
  {
    lead: "It automates a bad process, faster.",
    body: "If the manual version loses inquiries, the automated version can lose them at three in the morning, with a log entry saying it ran. Fix the process on paper first, while it is still cheap to argue with.",
  },
  {
    lead: "Nobody owns it.",
    body: "A chain built during a project can be abandoned after it. If a program later renames a field, somebody has to know what the third step did. Write down who owns each chain before you switch it on.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Eleven scenes, zero components. The film is added by the `reel` scene once it exists; a film
 * scene with no film renders nothing, and lib/blog/flagship.test.ts fails on that combination
 * rather than letting it ship as a silent hole. */
export const WORKFLOW_FLAGSHIP: FlagshipContent = {
  film: WORKFLOW_FILM,
  /** ROUND 24: the held moment is the post's own plan, four weeks from one job to a written
   * decision, in place of "25 minutes". The second reader of 2026-11-03 was right that the study's
   * twenty five minutes beside the title reads as the cost of a small task, which the study never
   * measured. The plan is ours and it is what the reader leaves with. */
  hero: {
    moment: "4",
    suffix: "weeks",
    photo: "/images/counties/orange.jpg",
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
    reel: {
      kind: "film",
      band: "dark",
      label: "Watch it",
      ariaLabel: "Watch it work",
      eyebrow: "Watch it work",
      heading: "One lead, by hand and then wired.",
      caption: [
        `Narrated, ${WORKFLOW_FILM.seconds} seconds. The voice reading it is a licensed clone of my own, which seemed worth saying rather than leaving you to wonder. The lead is invented and the timestamps are staged. Both numbers are the cited ones further down this page: the twenty five minutes is the field study's average wait before interrupted work was resumed, and the one time in twenty comes from a platform's documented 95 percent pause rule. One difference: in the film the reply goes out by itself, and on our builds a person approves a reply before it is sent. The chain is the one on the `,
        { href: "/services/workflow-automation", label: "service page" },
        ".",
      ],
    },
    fragmented: {
      kind: "statbars",
      band: "light",
      label: "The real cost",
      ...FRAGMENTED,
    },
    "quote-chain": {
      kind: "diagram",
      band: "dark",
      label: "One quote",
      eyebrow: "An invented example",
      heading: "A quote, followed up, with nobody chasing it.",
      lede: "The day-3 note is drafted from the owner's wording and waits for a person to approve it. On day 7 the chain puts a call on the owner's list rather than drafting another message.",
      steps: QUOTE_CHAIN,
      altPrefix: "The chain from a roofing quote sent on Tuesday at 4:10pm to a won or lost mark",
    },
    "by-trade": {
      kind: "grid",
      band: "light",
      label: "Other trades",
      eyebrow: "The same wiring",
      heading: "Six kinds of business, one idea.",
      columns: 3,
      items: BY_TRADE,
    },
    "three-lies": {
      kind: "grid",
      band: "dark",
      label: "The three excuses",
      /** Eyebrows are uppercase and tracked, so they run about 40 percent wider than the same
       * words in body text. Keep them near 33 characters or they wrap at 390px with one word
       * alone on the second row. */
      eyebrow: "Why nobody fixes it",
      heading: "Three things we tell ourselves.",
      columns: 3,
      glow: true,
      items: THREE_LIES,
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/lifestyle/financing.jpg",
      // ROUND I: the old alt said "one hand on the trackpad and the other keying the same figures
      // into a separate desk calculator". BOTH hands are at the calculator; the trackpad is
      // visible and empty, and the calculator is lying across the laptop's own keyboard. This is
      // the photograph the whole article rests on and it was described wrongly.
      alt: "A person at a dark wooden desk with an accounting screen open on a laptop, a large desk calculator lying across the laptop's own keyboard and both of their hands at it, one keying the number pad and the other resting on its edge, with the laptop's trackpad visible and untouched, a potted plant and an orange folder at the left and a stack of ring binders and a glass of water at the right",
      caption:
        "A number is on the screen. A person is typing it into something else. That is the subject of this whole guide, and the picture looks unremarkable because the work does: it is easy to stop noticing how often it happens.",
      credit: "Photograph by Wilfred Iven, CC0.",
      ariaLabel: "The busywork, photographed",
    },
    rebuilt: {
      kind: "diagram",
      band: "dark",
      label: "The chain, wired",
      eyebrow: "The system",
      heading: "The same job, with nobody retyping it.",
      lede: "Every hop below is a step somebody used to do by hand the following morning. The first and the last land in the same minute, and the drafted reply waits there for a person to approve it.",
      steps: REBUILT_CHAIN,
      altPrefix: "The chain from a form submitted at 11:47pm to a task on somebody's calendar",
    },
    audit: {
      kind: "grid",
      band: "light",
      label: "Find your own",
      eyebrow: "Take this, whether or not you buy",
      heading: "An hour, a piece of paper, and four honest questions.",
      columns: 2,
      items: AUDIT,
    },
    "busywork-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How much of your year is the busywork tax?",
      ariaLabel: "How many hours a year the busywork takes",
      inputs: [
        {
          kind: "range",
          id: "steps",
          label: "Manual steps you or your team repeat in a week",
          hint: "Count from the hour with the paper above: every time somebody types in something another system already knows.",
          min: 10,
          max: 400,
          step: 10,
          initial: 60,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes each one takes",
          hint: "The invented example uses ninety seconds. Time a few of yours rather than guess.",
          min: 0.5,
          max: 15,
          step: 0.5,
          initial: 2,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "hourly",
          label: "What an hour of that person's time is worth",
          hint: "Yours, or whoever actually does the typing.",
          min: 20,
          max: 300,
          step: 5,
          initial: 75,
          format: "money",
          width: "w-[6.5rem]",
        },
      ],
      chain: [
        {
          label: "Manual steps",
          by: { from: "input", id: "steps" },
          format: "count",
          unit: "a week",
        },
        {
          label: "Minutes of typing",
          by: { from: "input", id: "minutes" },
          format: "count",
          unit: "minutes a week",
        },
        {
          label: "Over a year",
          by: { from: "rate", value: 52, display: "52 weeks" },
          format: "count",
          unit: "minutes a year",
        },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours a year",
        },
        {
          label: "At your hourly value",
          by: { from: "input", id: "hourly" },
          format: "money",
          unit: "a year",
        },
      ],
      headline: 3,
      resultLabel: "Hours of typing, a year",
      note: "This counts the typing and nothing else. It does not multiply anything by twenty five minutes and twenty six seconds: that figure is how long interrupted work waited before it was resumed in one study of twenty four desk workers at a technology company, not a cost per task, and it cannot be turned into a dollar figure for your business. The interruption is left out on purpose, and the hourly figure is yours rather than an average we picked. Use the result as a baseline for the outcome brief, not as a promise.",
      action: { label: "See how it is built", href: "/services/workflow-automation" },
      secondary: { label: "Bring us your week", href: "/connect" },
    },
    /** Placed after the silent-failure section, which establishes that the error alarm is one
     * setting per chain and that almost nobody turns it on. Sending somebody that setting helps
     * a reader who will never hire us, on chains we did not build. That is the whole test of
     * whether an offer is earned. */
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The alarm, at least",
      text: "Whatever you are running today, tell us which platform it is on. We will send back the exact setting that makes a failed chain tell a person instead of a log file.",
      reassure: "It works whether or not we ever build you anything, which is rather the point.",
      action: { label: "Ask for the setting", href: "/connect" },
      ariaLabel: "Ask for the failure-alert setting",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "The first job to wire is the one with real impact and the smallest worst day, not the one that sounds most impressive.",
    },
    silence: {
      kind: "grid",
      band: "light",
      label: "The three rules",
      eyebrow: "The part nobody sells you",
      heading: "Three rules that keep a chain visible.",
      columns: 3,
      items: WATCHABLE,
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/hero/hudson-twilight.jpg",
      // ROUND I re-read this at the 16:9 crop. Nothing in it was wrong, only thin: the old alt
      // gave a screen reader the place and none of the picture.
      alt: "The Hudson at dusk from a wooded height above West Point, the river running away between two dark forested headlands, a band of cloud lit orange and red low over the far reach, and deep blue sky with pale cloud above it",
      caption:
        "A chain failing one time in twenty is not paused by a 95 percent rule. It keeps running, its failed runs sit in a history somebody has to open, and whether anyone hears about them depends on how it was set up.",
      credit: "Photograph by Wei Zhang@Hudson, CC BY 2.0.",
      ariaLabel: "The evening nothing went wrong",
    },
    "failure-modes": {
      kind: "grid",
      band: "light",
      eyebrow: "Three ways it is wasted",
      heading: "None of them are the technology.",
      columns: 3,
      items: FAILURE_MODES,
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Somewhere in your week is a step done so often that nobody sees it any more. One page, one highlighter and one honest hour will find it.",
      actions: [
        { label: "See it on the AI page", href: "/ai#workflow", variant: "light" },
        { label: "How it is built", href: "/services/workflow-automation", variant: "outline-light" },
      ],
      footnote:
        "What a chain takes depends on how many systems it touches, whether they connect, and how much of it needs a judgement rather than a field copy. The AI assessment is the hour described above, done with you, and it ends with a written plan.",
    },

    /** ROUND 24: the screening questions and the verdict, as a track with exits. Our method,
     * labelled as ours (the second reader's note 10: proposed screening questions, not a sourced
     * universal test). */
    "worth-it": {
      kind: "flow",
      band: "dark",
      label: "The screening questions",
      eyebrow: "Before anything is built",
      heading: "Five questions, and leaving it alone is an answer",
      lede: "Each question can send a job to the tray. What survives gets an outcome brief and a verdict from its two scores.",
      alt: "A track runs past five gates: what breaks if we stopped doing this, whether a tool you already pay for does it, whether a failure would be noticed within a week, whether the rule can be written for a new hire, and whether the impact scores 3 or more, where a no at any gate sends the job to a tray marked leave it alone and what survives gets a written outcome brief and a verdict from its risk score.",
      tray: "Leave it alone",
      gates: [
        { ask: "Does anything break if we stop doing it?", pass: "Yes", exit: "No", outcome: "Stop doing it", detail: "A job nobody needs is stopped, not wired." },
        { ask: "Is it missing from the programs you already pay for?", pass: "Missing", exit: "One does it", outcome: "Switch the setting on", detail: "No build for a gap the tool already closes." },
        { ask: "Would a failure be noticed within a week?", pass: "Yes", exit: "No", outcome: "Too rare to watch", detail: "Or a check is put in place first." },
        { ask: "Can the rule be written for a new hire?", pass: "Yes", exit: "No", outcome: "Settle the rule first", detail: "Each stall in the two-minute test is a missing rule." },
        { ask: "Does the impact score 3 or more out of 5?", pass: "Yes", exit: "No", outcome: "Saves too little", detail: "A small saving still adds a chain to look after." },
      ],
      end: {
        title: "Write the outcome brief, then the verdict from the risk score",
        detail: "Risk 3 or more, or it reaches a customer: a person approves every result. Low risk and high impact: it runs by itself, with limits and a log.",
      },
      example: "The salon's quarterly stock report leaves at the fifth gate.",
      sources: [METHOD],
    },

    /** ROUND 24: the cost section's three drivers and the ongoing cost, as tiles. No price and no
     * delivery promise (the second reader's note 14): our build times stay in the prose, labelled
     * "in our builds". */
    "cost-shape": {
      kind: "tiles",
      band: "light",
      label: "What it takes",
      eyebrow: "What it takes to run",
      heading: "Three things to settle, and one people forget",
      alt: "Four tiles: how many systems the chain touches, whether those systems have a usable connection, how many steps need a judgement rather than a field copy, and ownership, the person who notices when the chain breaks.",
      columns: 2,
      tiles: [
        { figure: "1", title: "Systems touched", body: "A form into a calendar is two. A quote request that checks history, drafts and books is four." },
        { figure: "2", title: "Usable connections", body: "Whether each program lets software read and write to it, or a person has to stay in between." },
        { figure: "3", title: "Judgement steps", body: "Most of the time goes on agreeing what the right answer is, not on the wiring." },
        { figure: "4", title: "Ownership", body: "A login expires, a field is renamed, a form gets a new question. Somebody has to notice." },
      ],
      sources: [METHOD],
    },

    /** ROUND 24: the first month as a path. The test is on a COPY with test records and test logins
     * (the second reader's note 17), and it tests the approval step as well as the alert. The
     * quarterly cadence is labelled a suggested starting plan (note 18). */
    "first-month": {
      kind: "steps",
      band: "dark",
      label: "The first month",
      eyebrow: "After it goes live",
      heading: "Read it, break a copy of it, then check it on a schedule",
      alt: "Three steps after a chain goes live: in week one read its run history line by line against what you meant; then break a test copy on purpose with test records and test logins and try to send without approval; then a suggested check of the history once a quarter, more often for a busy chain that reaches customers.",
      steps: [
        { title: "Week one: read the history", body: "Line by line, for one chain, against what you meant it to do." },
        { title: "Break a copy on purpose", body: "Test records and test logins only. Watch who hears about it, and try sending without approval." },
        { title: "Then a regular check", body: "A suggested start: once a quarter, more often for a busy chain that reaches customers." },
      ],
      close: "A successful run can still do the wrong thing. Reading the history is how you find out.",
      sources: [METHOD],
    },

    /** ROUND 24: who it fits and who it does not, with what the second group does instead. */
    fits: {
      kind: "grid",
      band: "light",
      label: "Who it fits",
      eyebrow: "Who this is for",
      heading: "A good fit, a poor fit, and what to do instead",
      columns: 2,
      items: [
        { lead: "A good fit", body: "A job that happens many times a week across two or more tools: inquiries by form or email, bookings that must reach a calendar, orders copied into a sheet. Or a small team where one person runs the office." },
        { lead: "A poor fit", body: "Work that is mostly judgement on each case, a process that still changes every month, a job done once a quarter, or a step a program you already pay for can do." },
        { lead: "Instead, for a poor fit", body: "Write the process down and run it by hand for a month, switch on the feature in the tool you have, or leave the job alone." },
        { lead: "Either way", body: "Anything a customer reads keeps a person approving it, whoever builds the chain." },
      ],
    },

    /** ROUND 24: the four-week roadmap, one job to a written decision. */
    roadmap: {
      kind: "steps",
      band: "light",
      label: "The roadmap",
      eyebrow: "Your four weeks",
      heading: "From one job to a decision written down",
      alt: "The four-week roadmap: in week one pick the most frequent job, write its steps, run the two-minute test and write the baseline; in weeks two and three score it, run the screening questions, write the outcome brief and build one chain with a failure report and an approval step; in week four break the test copy, try to send without approval, and write the decision and its owner.",
      steps: [
        { title: "Week one", body: "The most frequent job, every step written, the two-minute test, the baseline." },
        { title: "Weeks two and three", body: "The two scores, the screening questions, the outcome brief, one chain with a failure report and an approval step." },
        { title: "Week four", body: "Break the test copy, try to send without approval, then write it down: keep, change or switch off, and who owns it." },
      ],
      close: "In the plumber's office: keep, office manager owns it, next check in January.",
      sources: [METHOD],
    },

    /** The owner's quiz (2026-10-31): ten questions from facts the post teaches, tested against the
     * post in workflow-quiz.test.ts. AI brand, so the AI brand's pass state. */
    quiz: {
      kind: "quiz",
      band: "night",
      label: "Quiz",
      ariaLabel: "Quiz: what did you learn",
      eyebrow: "Ten questions",
      title: "What did you learn? Check it in two minutes",
      brand: "ai",
      passLine: "You have the method. If you want a second pair of eyes on your own list, we can run the assessment with you.",
      failLine: "Under half this time. Skim the screening questions and the four checks again, then have another go.",
      questions: WORKFLOW_QUIZ,
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-ninety-seconds-actually-costs": "The real cost",
    "what-it-actually-looks-like": "The chain today",
    "what-workflow-automation-for-small-business-is-without-the-jargon": "What it is",
    "how-to-find-your-own-version-of-this": "Find yours",
    "is-it-worth-automating": "Worth automating?",
    "the-failure-nobody-warns-you-about": "When it goes quiet",
    "how-to-follow-up-on-every-quote-without-chasing-it": "Every quote",
    "what-the-ai-readiness-assessment-hands-over": "The assessment",
    "what-it-takes-to-run": "What it takes",
    "the-first-month-and-the-two-things-to-do-in-it": "The first month",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "who-this-fits-and-who-it-does-not": "Who it fits",
    "what-to-do-first": "Your four weeks",
    "common-questions": "Common questions",
    "what-to-do-about-it": "What to do",
    "sources": "Sources",
  },
};
