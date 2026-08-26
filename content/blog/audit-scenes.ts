/** Scene copy for the AI audit flagship post (topic 19).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Nineteenth topic on the flagship template and the EIGHTEENTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 18. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * THE TRAP, and the whole file is organised around not falling into it. An article about an audit
 * written by the people who sell the audit becomes a sales page with a methodology section
 * attached. The way out is not modesty, it is subject matter: this piece is about the half of an
 * audit that produces no work for us, which is the part that tells you not to build something.
 *
 * THE SEAM AGAINST `workflow-automation`, which shipped in an earlier round and is the nearest
 * sibling in the whole cohort. That post owns the DIY hour: follow one job, note where information
 * is retyped, note what only happens if somebody remembers, and order the result. All of that is
 * mapping, it is free, it is already on this site, and THIS POST DOES NOT REPEAT ANY OF IT. It
 * links to it and starts after it. The unit here is not a step inside one job, it is a CANDIDATE
 * for a build, held against the whole business, and the question is not what the manual version
 * costs. It is whether this one should exist at all.
 *
 * SOURCE OF TRUTH for what the service does is content/services/ai-audit.ts, rewritten in the
 * same round.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. What the deliverable
 * actually is, the number that resets everybody's sense of being behind, and the shape of the risk
 * that makes ranking by an average the wrong move. */
export const IN_SHORT: string[] = [
  "The output of an audit is a decision, and most of the value in it is subtraction. A list of twelve things you could automate is not worth paying for, because you can write that yourself in an afternoon. Knowing which four of the twelve to cross out, and being able to say why, is the part that takes somebody who has watched these break.",
  "You are almost certainly not behind. The Census Bureau put a technology module on the 2018 Annual Business Survey, a sample of over 850,000 firms where answering is required by law, and found that while 90.2 percent of firms had put at least one kind of information into digital form, only 10.3 percent used even one of the nine advanced business technologies on the list. Machine learning specifically was 2.9 percent.",
  "Rank by the average outcome and you will rank wrong, because the outcomes are not distributed like that. In a study of 1,471 information technology projects worth 241 billion dollars, the ordinary ones overran by 3.6 percent on average, and 17 percent of them landed in a fat right hand tail where a thin-tailed distribution would have put 0.7 percent.",
];

/** SCENE copy — what an audit actually hands over.
 *
 * Four cards on a two column grid. This scene REPLACES the enumeration that would otherwise have
 * been four paragraphs of prose. The fourth card is the one this whole article exists for. */
export const DELIVERABLE: GridItem[] = [
  {
    lead: "A written description of how the work runs now",
    body: "Not an org chart and not a process diagram made in advance. A plain account of what actually happens, including the workaround somebody invented in 2022 that everybody now depends on and nobody has written down. This is the part that surprises owners, and it is worth having even if nothing else follows from it.",
  },
  {
    lead: "An order, with the reasoning attached",
    body: "Not a ranking by how impressive each item sounds, and not a ranking by how much it annoys you. The order has to survive somebody asking why the third one is not the first, which means the reason for each position has to be written down beside it rather than held in the head of whoever made the list.",
  },
  {
    lead: "One thing built and running",
    body: "A document that ends in a proposal is a proposal. The useful version ends with something small working in your business, because that is the only way anybody finds out whether the assumptions in the document were true, and because a first automation that exists changes how the rest of the list gets read.",
  },
  {
    lead: "The list of what you are not going to do",
    body: "The half nobody writes down and the half that pays for the exercise. Every candidate that gets crossed off saves you the build, the maintenance and the quiet failure afterwards, and the reasons for crossing things off are more reusable than the reasons for keeping them, because you will apply them again to next year's list.",
  },
];

/** SCENE copy — what firms had actually adopted. Cited data graphic ONE.
 *
 * Zolas, Kroff, Brynjolfsson, McElheran, Beede, Buffington, Goldschlag, Foster and Dinlersoz,
 * "Advanced Technologies Adoption and Use by U.S. Firms: Evidence from the Annual Business
 * Survey", NBER Working Paper 28290, December 2020. Read in the NBER PDF with pdftotext.
 *
 * The instrument, quoted: "The 2018 ABS is a large, nationally representative sample of over
 * 850,000 firms covering all private, nonfarm sectors of the economy." And on why that matters:
 * "Response to the ABS is required by law, reducing selection bias, though certainly not
 * eliminating it. In contrast, many privately funded surveys typically used in empirical work on
 * technology adoption suffer from low response rates and significant selection bias." The response
 * rate for the portion used was 68.7 percent, and about 67 percent of the firms sampled had fewer
 * than 10 employees.
 *
 * The two drawn figures, quoted: "According to our LBD tabulation weights, 90.2% (75.6%
 * non-imputed) of firms that collect at least one type of information stored at least one type of
 * information in digital format." And: "Based on our LBD tabulation weights, only 10.3% (8.5%
 * non-imputed) of firms adopt at least one of the listed advanced business technologies."
 *
 * MACHINE LEARNING IS IN THE NOTE AND NOT ON THE CHART. Its use rate is 2.9 percent, which against
 * a 100 axis is a hairline that reads as an artefact rather than as a finding. Same call round G
 * made on a $25,000 bar, and the same fix: the number is stated in writing instead.
 *
 * AXIS MAXIMUM 100 because these are shares of a whole.
 *
 * WHY THE SECOND BAR IS LIT: the gap between the two is the entire argument for doing an audit at
 * all, and the small bar is the one that describes what is left to do. */
export const ADOPTION = {
  eyebrow: "The evidence",
  caption: "What US firms had actually adopted, on a survey of over 850,000 of them",
  bars: [
    { label: "Kept at least one kind of information digitally", value: 90.2, display: "90.2%" },
    { label: "Used at least one advanced business technology", value: 10.3, display: "10.3%" },
  ],
  max: 100,
  lit: 1,
  basis:
    "Share of firms, weighted to the national population of businesses, from the technology module of the 2018 Annual Business Survey run by the Census Bureau with the National Center for Science and Engineering Statistics. The first bar counts firms that collect at least one type of information and hold at least one of those types digitally. The second counts firms reporting any use of at least one of nine listed advanced business technologies, which include robotics, machine learning, machine vision, natural language processing, voice recognition, augmented reality, radio frequency identification, touchscreens and automated guided vehicles.",
  sourceText:
    "Zolas and others, Advanced Technologies Adoption and Use by U.S. Firms: Evidence from the Annual Business Survey, National Bureau of Economic Research, 2020.",
  sourceHref: "https://www.nber.org/system/files/working_papers/w28290/w28290.pdf",
  note: "Three things this cannot be stretched to say, and one it says firmly. It cannot say anything about 2026: the reference year is 2017 and both the technology and the words people use for it have moved a great deal since. It cannot be read as nobody using AI, because a firm buying a service that happens to run on it is not a firm adopting a technology on this list. And a third bar was not drawn: machine learning specifically came in at 2.9 percent use and 0.7 percent testing, which against this axis renders as a hairline rather than as a bar, so it is here in writing instead. What it does say firmly is the shape. Two thirds of the sampled firms had fewer than ten employees, answering was required by law rather than voluntary, and the distance between the two bars was enormous. The paper's authors also note that the Census public use tables do not correct for sample weights the way they do, so figures taken from those tables read lower still.",
};

/** SCENE copy — the three subtractions.
 *
 * THIS IS THE ARTICLE'S METHOD and it is deliberately not the workflow post's. That one is about
 * mapping one job and putting the steps in an order. These three are applied afterwards, to
 * candidates rather than to steps, and every one of them is a way of removing something from a
 * list rather than a way of scoring it. */
export const SUBTRACTIONS: GridItem[] = [
  {
    lead: "Does it happen often enough to be worth owning?",
    body: "Not often enough to save time. Often enough that somebody will notice within a week when it stops working, because everything built has a day when it stops working. A job that runs four times a year fails silently and is discovered by a client, which is the most expensive way to find out anything.",
  },
  {
    lead: "Could you write the rule down for a new hire?",
    body: "If the answer needs a paragraph beginning with it depends, the honest first task is not a build, it is a decision that nobody has made. Software will make that decision for you by accident, consistently, in whichever direction the person writing the prompt happened to lean that morning.",
  },
  {
    lead: "Where does a wrong answer end up?",
    body: "In a spreadsheet somebody checks on Friday, or in front of a client, in writing, with your name on it. This is the question that removes the most candidates and it is the one people skip, because it is the only one whose answer does not improve with better software.",
  },
];

/** SCENE copy — how project outcomes are actually distributed. Cited data graphic TWO.
 *
 * Alexander Budzier and Bent Flyvbjerg, "Double Whammy: How ICT Projects are Fooled by Randomness
 * and Screwed by Political Intent", Said Business School Working Paper, University of Oxford, 2013,
 * read in the arXiv PDF (arXiv:1304.4590) with pdftotext.
 *
 * The sample, quoted: "in total our sample comprises 1,471 projects, which represents a total value
 * of USD 241 billion (in 2010 USD), it is the largest academic dataset to date." It is assembled
 * from three sources the paper describes separately: 142 projects gathered from private-sector
 * organisations (20 of about 200 approached, a 10 percent response rate), 149 from published GAO
 * and UK National Audit Office reports, and 1,180 multi-year projects from US federal E300 filings.
 *
 * The three drawn regimes are the paper's own decomposition and they sum to 100. Quoted: "The
 * probability of falling prey to budget cuts is relatively low but affects 6% of all projects."
 * "The managed performance regime shows that normal projects have an average cost overrun of
 * +3.6%, with a standard deviation of 14.8%. This regime has the highest probability of occurring
 * a project stays within normal bounds of (-30%, +48%) with a 77% likelihood." And: "The
 * probability of becoming a Black Swan is estimated at 17% a very high risk compared to thin-tailed
 * distributions where outliers are happening with no more than 0.7% probability on both ends of
 * the tail."
 *
 * THE SIZE CAVEAT IS NOT OPTIONAL AND IT IS IN THE NOTE. The median project in this sample was
 * planned at 3.3 million dollars. Nothing a brokerage commissions is that. What transfers is the
 * SHAPE of the distribution rather than the percentages, and the note says so rather than letting
 * a reader take 17 percent home as their own risk.
 *
 * AXIS MAXIMUM 100 because these are shares of a whole and they sum to it.
 *
 * WHY THE THIRD BAR IS LIT: the whole point of the chart is that the small bar is the one that
 * decides how you should rank a list. */
export const OUTCOMES = {
  eyebrow: "The evidence",
  caption: "Where 1,471 technology projects actually landed against their budgets",
  bars: [
    { label: "Cut back under budget pressure", value: 6, display: "6%" },
    { label: "Ordinary, within minus 30 and plus 48 percent", value: 77, display: "77%" },
    { label: "In the fat right hand tail", value: 17, display: "17%" },
  ],
  max: 100,
  lit: 2,
  basis:
    "Share of projects falling into each of the three regimes the authors fit to their cost overrun distribution, on a sample of 1,471 information technology projects worth 241 billion dollars, assembled from private sector records, published national audit reports and United States federal budget filings. The middle regime is an ordinary bell curve with an average overrun of 3.6 percent. The authors give 0.7 percent as the share a thin-tailed distribution would put in the outer tails, against the 17 percent they measure.",
  sourceText:
    "Budzier and Flyvbjerg, Double Whammy: How ICT Projects are Fooled by Randomness and Screwed by Political Intent, Said Business School, University of Oxford, 2013.",
  sourceHref: "https://arxiv.org/abs/1304.4590",
  note: "Do not take 17 percent home as your own number. The median project in this sample was planned at 3.3 million dollars and the average at 122 million, and nothing a small business commissions is remotely that size. What transfers is the shape rather than the percentages, and the shape is the useful part: the middle of this distribution is unremarkable and the tail is where the damage lives, so an average tells you almost nothing about what you are risking. That is a specific argument against a specific habit, which is ranking a list of candidates by expected payback and working down it. The authors also set out why the industry's most quoted failure figures were contested in the academic literature, on the grounds that the sampling was skewed towards failure, the data collection was opaque and the categorisation was methodologically biased. A separate piece of research that tested exactly that is described further down this page.",
};

/** SCENE copy — the six steps of an audit, drawn as the order they have to happen in.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. "One job, as it ran" is 18. */
export const AUDIT_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The account", connects: "One job, as it ran" },
  { label: "The candidates", connects: "Everything nameable" },
  { label: "The cuts", connects: "Three questions" },
  { label: "The order", connects: "Reasons written down" },
  { label: "The first build", connects: "Small, and running" },
  { label: "The re-read", connects: "The list, six weeks on" },
];

/** SCENE copy — what an audit should tell you not to automate.
 *
 * Deliberately concrete and deliberately about this trade rather than about businesses in general,
 * because a generic version of this list is worthless and everybody has read it. */
export const DO_NOT: GridItem[] = [
  {
    lead: "Anything that states a fact about a property",
    body: "Square footage, a tax figure, a school district, a boundary, whether a permit exists. These read like data and behave like liability, and the correct build is one that fetches the value from the record that governs it or says it does not know, which is a different and much smaller project than the one people ask for.",
  },
  {
    lead: "The judgment call you make four times a year",
    body: "Whether to take a listing, whether to advise a price cut, whether this buyer is real. It is rare, it is high stakes, and its rule cannot be written down without lying about how the decision is actually made. Rare and important is the exact opposite of the profile worth building for.",
  },
  {
    lead: "Anything whose failure is silent",
    body: "A job that quietly stops running, a message that quietly stops sending, a field that quietly stops updating. If nothing in the business goes visibly wrong when it fails, then nobody will notice for months, and the thing you automated has become a thing you believe is happening.",
  },
];

/** SCENE copy — three ways an audit produces nothing.
 *
 * Deliberately not the limits section restated: limits are what the service cannot do, and these
 * are what an audit that was done properly still fails to deliver. Also deliberately not the
 * workflow post's failure modes, which are about a chain breaking after it is built. */
export const WASTED: GridItem[] = [
  {
    lead: "It described the official version",
    body: "Everybody answered honestly and everybody described the process as it is supposed to work. The real one has three steps in it that exist because a system does not do something it was bought to do, and nobody mentions those, because after two years they stop feeling like steps and start feeling like the job.",
  },
  {
    lead: "It ended in a document",
    body: "A ranked list with nothing built is a piece of homework, and homework has a half life of about a fortnight in a working business. The value of shipping the first item is not the item, it is that the rest of the list gets read differently by people who have now seen one of these actually arrive.",
  },
  {
    lead: "Nobody re-read it",
    body: "The order was right in March and by September two of the candidates have gone away, a new system has arrived, and something that was ruled out because nobody could write the rule down now has a rule, because somebody was forced to decide it. A list that is never re-read is a snapshot being used as a plan.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Fourteen scenes, zero components, no film. */
export const AUDIT_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings, $2,500, 0.3 percent, 3 business days, 20
   * sources, 1 of three, 0 invoices and 14 videos. This one is a COUNT OF THINGS REMOVED from a
   * list, which is the only held moment in the set that measures work not done. */
  hero: {
    moment: "4",
    suffix: "crossed off",
    /** NOT either plate. The plates are an instrument panel and a bank of isolator switches; this
     * is counters resting on rods, which is texture behind type rather than a subject. */
    photo: "/images/editorial/abacus.jpg",
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
    deliverable: {
      kind: "grid",
      band: "dark",
      eyebrow: "Four things it hands over",
      heading: "The fourth one is why it is worth paying for.",
      columns: 2,
      glow: true,
      items: DELIVERABLE,
      label: "What it produces",
    },
    adoption: {
      kind: "statbars",
      band: "dark",
      label: "You are not behind",
      ...ADOPTION,
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/dial-panel.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS and which contains the 21:9
      // crop a laptop ships. Measured in round F: the Plate primitive renders 2.33 at 1440 and
      // 1.78 at 390, so the phone sees a taller slice. The taller crop adds the lower band of the
      // panel carrying two more Cyrillic labels. Only legible lettering is named.
      alt: "Three round pressure gauges set into a chipped yellow instrument panel, the large central one with a black needle resting near the low end of its scale and the word for oil extraction stencilled in Cyrillic capitals on the panel above it, a smaller gauge at each side, the left one showing a scale of ten to sixteen and the right one partly cut off by the frame, and two more Cyrillic labels stencilled along the bottom edge beneath the dials",
      caption:
        "Three gauges, three needles, and not one of them tells anybody what to do. A reading is a fact about the machine, and turning it into an action needs somebody who knows what this machine is for, what it did last week and what happens downstream if it is shut off. Every dashboard sold on the strength of its numbers is selling the easy half.",
      credit: "Photograph by Thomas Quine, CC BY 2.0.",
      ariaLabel: "Three pressure gauges on a yellow instrument panel",
    },
    subtractions: {
      kind: "grid",
      band: "dark",
      eyebrow: "The three questions",
      heading: "Every one of them removes candidates rather than scoring them.",
      columns: 3,
      items: SUBTRACTIONS,
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from the NIST AI Risk Management Framework, AI 100-1, section 1.2.1. Quoted
       * rather than paraphrased because the phrase people reach for is "manage the risk", and the
       * framework's own sentence contains an option that is not managing it. */
      text: "In cases where an AI system presents unacceptable negative risk levels, such as where significant negative impacts are imminent, severe harms are actually occurring, or catastrophic risks are present, development and deployment should cease in a safe manner until risks can be sufficiently managed.",
    },
    outcomes: {
      kind: "statbars",
      band: "light",
      label: "How they land",
      ...OUTCOMES,
    },
    "do-not": {
      kind: "grid",
      band: "dark",
      eyebrow: "Three things to leave alone",
      heading: "Every audit should hand you a list like this.",
      columns: 3,
      items: DO_NOT,
    },
    "audit-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "Six steps, and the third one is the product.",
      lede: "Drawn as the order it has to happen in rather than as a menu. Most of what gets sold under this name is the first two boxes, which are the ones you could do without help. The third is where the money is and it is the only step whose output is shorter than its input. Note that the last box is a date rather than a task, and that it is the one everybody skips.",
      steps: AUDIT_PATH,
      altPrefix:
        "The path from a written account of one job as it actually ran, through naming every candidate, cutting the list with three questions, ordering what survives with the reasons attached, building the first one small, and re-reading the list six weeks later",
    },
    "shortlist-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many of your candidates would still be standing at the end?",
      ariaLabel: "How many automation candidates survive the three questions",
      inputs: [
        {
          kind: "range",
          id: "candidates",
          label: "Things you could name right now that you would automate",
          hint: "Write them on paper first. Most people get to somewhere between eight and twenty before they run out, and the exercise is more useful than the number.",
          min: 3,
          max: 40,
          step: 1,
          initial: 12,
          format: "count",
          width: "w-[4rem]",
        },
        {
          kind: "range",
          id: "often",
          label: "Share that happen often enough that a failure would be noticed within a week",
          hint: "Weekly or more is comfortably yes. Quarterly is almost always no, whatever the time saving looks like on paper.",
          min: 10,
          max: 100,
          step: 5,
          initial: 65,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "writable",
          label: "Share whose rule you could write down for a new hire",
          hint: "The test is whether somebody competent could follow the written version without asking you. If the honest answer needs the phrase it depends, count it out.",
          min: 10,
          max: 100,
          step: 5,
          initial: 70,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "safe",
          label: "Share where a wrong answer would not reach a client before a person saw it",
          hint: "Not whether it would be wrong. Where it would land if it were. This is the question that removes the most candidates.",
          min: 10,
          max: 100,
          step: 5,
          initial: 60,
          format: "percent",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "Candidates you can name", by: { from: "input", id: "candidates" }, format: "count", unit: "candidates" },
        { label: "Happening often enough", by: { from: "input", id: "often" }, format: "count", unit: "candidates" },
        {
          label: "Whose rule you could write down",
          by: { from: "input", id: "writable" },
          format: "count",
          /** SHORT ON PURPOSE. A chain unit renders inside a shrink-0 cell and cannot wrap; round
           * E shipped 66px and 32px of horizontal overflow from exactly this. The explanation
           * belongs in the row label on the left, which does wrap. */
          unit: "candidates",
        },
        { label: "Where a wrong answer lands somewhere safe", by: { from: "input", id: "safe" }, format: "count", unit: "left" },
      ],
      headline: 3,
      resultLabel: "Candidates still standing at the end",
      note: "The number is meant to come out small, and the honest reading of that is not that automation rarely works. It is that most of a list is answered by a question rather than by a quote, and answering it costs nothing. Shares produce fractions, and two thirds of a candidate is not a thing, so read anything with a decimal in it as a rough count. Move the last slider first: it usually moves the answer more than the other two shares together, and it is the one an enthusiastic conversation skips. Four things this deliberately refuses to put a number on. There is no failure rate for automation projects, because the most quoted one in the industry has been reconstructed by researchers with their own data and shown to measure deviation from an estimate rather than whether anything succeeded. There is no payback period, because it depends entirely on which candidate. There is no figure for hours saved by an audit, because an audit saves no hours. And there is nothing here about what a build costs, because this arithmetic is about whether a build should happen at all.",
      action: { label: "See how it is built", href: "/services/ai-audit" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Send us your list. Not a description of your business, the actual list of things you would automate if somebody handed you the budget tomorrow. We will send back which ones we would cross off and why, in writing, before anybody talks about money.",
      reassure:
        "It is a short reply from a person, it costs nothing, and the reply is genuinely often that two of them are worth doing and the rest are not. That answer is the product working, not us being difficult.",
      action: { label: "Send us your list", href: "/connect" },
      ariaLabel: "Send us your list of things you would automate",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/switch-box.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS. The taller crop adds the thick
      // black cables leaving the bottom of each box and more of the green steel frame at the right.
      // Only legible markings are named.
      alt: "Three red industrial isolator boxes bolted in a row to a concrete block wall, each with a black lever handle on its face, the levers at different angles so no two are set the same way, the middle box stencilled FREZA and the one below it 500 V, faded painted markings on the others, and thick black cables running out of the bottom of each box past a green steel frame",
      caption:
        "Three switches, and the useful thing about them is that no two are in the same position. Somebody decided, for each one, whether the thing behind it should be running today. That decision took a second and it is the entire job. Everything expensive in this subject comes from switching something on and never afterwards asking whether it should still be on.",
      credit: "Photograph by Vladimir Mokry, CC0 1.0.",
      ariaLabel: "Three red industrial isolator switches on a concrete wall",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 18: on light, the cost section, the
       * limits section and the how-to run as one long pale band. Flipping this one breaks it. */
      band: "dark",
      eyebrow: "Three ways a careful audit produces nothing",
      heading: "None of them are the analysis being wrong.",
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
      text: "Write the list tonight, on paper, without editing it. Then go down it once with a single question against every line: if this went wrong, who would find out, and how. Cross off anything where the honest answer is a client, and cross off anything where the honest answer is nobody. What is left is short, and it is the only part of the list worth a conversation with anybody.",
      actions: [
        { label: "See it on the AI page", href: "/ai#consult", variant: "light" },
        { label: "How it is built", href: "/services/ai-audit", variant: "outline-light" },
      ],
      footnote:
        "The audit is an hour, done with you, and it is deliberately priced so that the answer being no costs you almost nothing. What it is not is a discovery call with a proposal attached: the output is written, it names the things we would not build, and it is yours whether or not you go on to build anything with us.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-an-audit-is-actually-for-and-it-is-not-the-list": "What it is for",
    "the-part-that-is-already-free-and-is-not-repeated-here": "The free half",
    "you-are-almost-certainly-not-behind": "Not behind",
    "the-three-questions-that-do-the-cutting": "The three cuts",
    "what-should-not-be-automated-in-a-property-business": "Leave alone",
    "why-ranking-by-the-average-outcome-gets-it-wrong": "Ranking wrong",
    "the-failure-rate-nobody-can-give-you": "The missing rate",
    "what-the-order-actually-gets-sorted-by": "The order",
    "how-to-run-one-yourself-without-us": "Do it yourself",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-an-audit-does-not-do": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
