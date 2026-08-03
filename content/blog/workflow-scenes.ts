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
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

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
  name: "Ninety seconds of typing, and the twenty five minutes it actually costs",
  description:
    "A form arrives at 11:47pm and nobody sees it until the morning. The film follows the same lead by hand, eight steps spread across three days, then wired as a single chain whose first and last hop land in the same minute. It closes on the failure nobody warns you about: the platforms only switch a chain off when it fails almost every time it runs, so a chain failing one time in twenty stays on, stays green, and nobody is told.",
} as const;

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, for the reader who is skimming and for the assistants
 * that increasingly answer on somebody's behalf. Each one is a number somebody else can check:
 * the first two are the cited field study, the third is Zapier's own documented default. */
export const IN_SHORT: string[] = [
  "The ninety seconds of typing is not the cost. Twenty four information workers were timed to the second at their desks, and interrupted work was picked up again an average of twenty five minutes and twenty six seconds later.",
  "You are not automating step four. You are automating one through eight, because the chain is where the reloading happens and a chain is exactly what these tools are good at.",
  "Zapier's own documentation says it pauses a chain that errors ninety five percent of the times it ran in the last seven days. Read that the other way: a chain failing one time in twenty is a chain nobody is going to tell you about.",
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
    "Average elapsed time, 24 information workers observed at their desks and timed to the second. The middle figure is not a third category: nine resumptions in ten were self-started, and 90.1% at 21 min 28 sec with 9.9% at 61 min 37 sec averages out to exactly the 25 min 26 sec on the third bar.",
  sourceText:
    "Gloria Mark, Victor M. Gonzalez and Justin Harris, No Task Left Behind? Examining the Nature of Fragmented Work, Proceedings of CHI 2005, University of California, Irvine. Over 700 hours of observation; 57 percent of work segments ended in an interruption and 77.2 percent of interrupted work was resumed the same day.",
  sourceHref: "https://ics.uci.edu/~gmark/CHI2005.pdf",
  note: "These were managers, analysts and software developers at one technology company, observed in a single field study, and not one of them sold a house. It measures how fragmented desk work is. It is not a measurement of how much of your week is copy and paste, it cannot be turned into one, and no automation should be sold to you on the back of it. What it establishes is the only thing this page needs it for: the interruption costs far more than the task that caused it.",
};

/** SCENE copy — the three excuses.
 *
 * The article's own three, put into the article's voice. The scene REPLACES the three bold
 * paragraphs the post used to carry, so these words appear exactly once on the page. */
export const THREE_LIES: GridItem[] = [
  {
    lead: "It only takes a minute.",
    body: "It takes a minute forty times a month, which is an afternoon, which is a listing appointment you did not go on. And a minute of typing is never a minute. It is a minute plus whatever it costs to get back to what you were doing, which the study above puts closer to twenty five.",
  },
  {
    lead: "I would rather do it myself, so I know it is done right.",
    body: "This is the honest objection and the other two are excuses. Wanting to see the work is correct. The answer is not to trust a system blindly, it is to build one you can watch, and that is a different thing with a different price.",
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
    body: "Not the ideal version. The one that actually happened last week, including the part where somebody had to chase a signature twice. Write down every step, including the ones that feel too small to write down. Those are the ones.",
  },
  {
    lead: "Mark every step where information moves between two systems by hand.",
    body: "That is your list. It is always longer than the person writing it expected, and the worst offenders are invisible because everyone stopped noticing them years ago.",
  },
  {
    lead: "Mark every step that only happens if somebody remembers.",
    body: "That is your risk, and it is a different list. In the study above, work people came back to themselves resumed in twenty one minutes and twenty eight seconds. Work that waited for somebody else to prompt it sat for sixty one minutes and thirty seven seconds.",
  },
  {
    lead: "Rank by how often it happens, not by how annoying it is.",
    body: "The most irritating task is rarely the most expensive one. The expensive one is the boring thing you do fifty times a month without noticing. Most people are surprised twice: by how long the list is, and then by how dull the top of it is.",
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
  { label: "The reply", connects: "A real answer, in seconds" },
  { label: "The route", connects: "Scored, then assigned" },
  { label: "The task", connects: "Calendared, with the context" , at: "11:47 pm" },
];

/** SCENE copy — the three rules for automation you can watch.
 *
 * The post's original three, now with the mechanism named in each one. Both mechanisms were read
 * in the vendors' own documentation rather than assumed: n8n's error workflow starts with an
 * Error Trigger, and Zapier keeps a per-run history with a documented status vocabulary. */
export const WATCHABLE: GridItem[] = [
  {
    lead: "Every run gets logged.",
    body: "If you cannot answer did it run, and what did it do, you have not built an automation. You have built a black box that mostly agrees with you. Every one of these platforms keeps a per-run history; the real question is whether anybody has opened it since the week it went live.",
  },
  {
    lead: "Failures shout.",
    body: "n8n's documented pattern is a separate error workflow, beginning with an Error Trigger, that runs when an execution fails and can message a person. It is one setting on each chain and it takes five minutes. Without it, a failure lands in a log nobody reads.",
  },
  {
    lead: "Anything genuinely ambiguous stops and asks.",
    body: "A system that guesses when it should have asked will eventually guess wrong in front of a client, in writing. The line is easy to find: any step where a person would have hesitated is a step the machine should hand back.",
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
    body: "The chain that demonstrates well is almost never the chain that runs forty times a month. The boring one at the top of the frequency list is worth more than the clever one, and it is the one nobody volunteers to build.",
  },
  {
    lead: "It automates a bad process, faster.",
    body: "If the manual version loses leads, the automated version loses them at three in the morning, at scale, with a log entry saying it worked. Wiring makes a process consistent, and consistency is only an improvement when the process was right.",
  },
  {
    lead: "Nobody owns it.",
    body: "Chains get built during a project and abandoned after it. Six months later a vendor renames a field, and the person who knew what the third step did has moved on. Write down who is responsible for each chain before you switch it on, or it becomes one of the mistakes it was built to remove.",
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
  /** A duration rather than a clock, a year or a share: the held moment on this topic is the gap
   * between what a small job takes and what it costs. The four heroes before this one were
   * 11:40pm, 9:42pm, 2023 and 15%, so this is the first that is a length of time rather than a
   * point in one. */
  hero: {
    moment: "25",
    suffix: "minutes",
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
        `Narrated, ${WORKFLOW_FILM.seconds} seconds. The voice reading it is a licensed clone of my own, which seemed worth saying rather than leaving you to wonder. The lead is invented and the timestamps are staged, but both numbers on screen are the cited ones from further down this page: the twenty five minutes is the field study and the ninety five percent is Zapier's own documentation. The chain it draws is the one on the `,
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
      alt: "A person at a wooden desk with an accounting screen open on a laptop, one hand on the trackpad and the other keying the same figures into a separate desk calculator",
      caption:
        "A number is on the screen. A person is typing it into something else. This is the entire subject of this article, and if the picture looks unremarkable, that is the finding: nobody in this business thinks they spend their week doing this, and everybody does.",
      credit: "Photograph by Wilfred Iven, CC0.",
      ariaLabel: "The busywork, photographed",
    },
    rebuilt: {
      kind: "diagram",
      band: "dark",
      label: "The chain, wired",
      eyebrow: "The system",
      heading: "The same job, with nobody in the middle of it.",
      lede: "Every hop below is a step somebody used to do by hand the following morning. The two timestamps are the point: the first and the last are the same minute.",
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
          hint: "Count from the audit above: every time somebody types in something another system already knows.",
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
          hint: "The article's example is ninety seconds. Most people guess low here, then find the real number in the audit.",
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
      note: "This counts the typing and nothing else, which makes it the smallest honest version of the number. It deliberately does not multiply anything by twenty five minutes and twenty six seconds. That figure is real and it is on this page, but it was measured on twenty four desk workers at a technology company and none of them were selling houses, and this article says a few paragraphs up that anybody converting it into a dollar figure for your business has stopped citing it and started decorating with it. That applies to us. So the interruption cost, which is almost certainly the larger half, is missing from the number above on purpose, and the hourly figure is yours rather than an average we picked.",
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
      text: "Whatever you are running today, tell us which platform it is on and we will send back the exact setting that makes a failed chain tell a person instead of a log file.",
      reassure: "It works whether or not we ever build you anything, which is rather the point.",
      action: { label: "Ask for the setting", href: "/connect" },
      ariaLabel: "Ask for the failure-alert setting",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "The task worth automating first is almost never the one that sounds impressive. It is the one you have done so many times that you stopped seeing it.",
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
      alt: "The Hudson River at dusk seen from the hills above West Point, with cloud lit orange over the far bank",
      caption:
        "This is what a chain failing one time in twenty looks like. It stays switched on, it stays green, and it is doing exactly what you think it is doing ninety five percent of the time. The two people a month it drops never appear anywhere, and nothing in the system has the job of telling you their names.",
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
      text: "Somewhere in your week is a step you have done four hundred times and stopped being able to see. It is not the interesting one. It is the dull one that has been costing you an afternoon a month since the year you started.",
      actions: [
        { label: "See it on the AI page", href: "/ai#workflow", variant: "light" },
        { label: "How it is built", href: "/services/workflow-automation", variant: "outline-light" },
      ],
      footnote:
        "There is no price on this page because there is no honest one: what a chain costs depends on how many systems it has to touch and how much of it needs a judgment rather than a field copy. The AI audit is the hour described above, done with you, and it ends with the first chain built rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-ninety-seconds-actually-costs": "The real cost",
    "what-it-actually-looks-like": "The chain today",
    "what-automation-actually-is-without-the-jargon": "What it is",
    "how-to-find-your-own-version-of-this": "Find yours",
    "the-failure-nobody-warns-you-about": "When it goes quiet",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
