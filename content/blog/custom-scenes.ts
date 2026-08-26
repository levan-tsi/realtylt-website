/** Scene copy for the custom automation flagship post (topic 20).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Twentieth topic on the flagship template and the NINETEENTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed. This is
 * the last topic in the rollout.
 *
 * NO FILM SCENE, same as topics 6 to 19. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * THE SEAM, against the two nearest siblings, both of which were read in full before a word of
 * this was written. `workflow-automation` owns a STEP OF WORK and asks what the manual version
 * costs; its teaching content is the hour with a piece of paper. `ai-agent-workforce` owns an
 * ASSISTANT and asks the difference between right once and right every time; its teaching content
 * is supervision. `ai-audit`, written in the same round as this one, owns a CANDIDATE and asks
 * whether it should exist at all.
 *
 * This one owns THE THING YOU NOW OWN, and its question is what a build costs on every day after
 * the day it works. Maintenance, the single person who understands it, and the interfaces that
 * change underneath it without asking. Nothing here re-argues what to automate first, how to map
 * a job, or how to supervise an assistant.
 *
 * WHAT IT REFUSES, and the refusal was FOLLOWED rather than asserted. The figure everybody quotes
 * for maintenance as a share of a system's lifetime cost traces back to a 1978 Communications of
 * the ACM survey and to a 2000 IT Professional article. Crossref confirms the 1978 paper exists.
 * The ACM Digital Library answers 403 to it, and computer.org answers 200 with an 8,211 byte
 * JavaScript shell containing none of the article's text: no occurrence of "maintenance", of "80",
 * or of the author's name. So neither could be read in the primary and NO SHARE IS PRINTED.
 *
 * SOURCE OF TRUTH for what the service does is content/services/custom-automation.ts, rewritten in
 * the same round.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. When a bespoke build is
 * the right answer, the promise that turns out to be shorter than a business's memory, and where
 * the cost of software going wrong actually lands. */
export const IN_SHORT: string[] = [
  "A custom build is the right answer when the step that is capping you is specific to how you work, and the wrong answer far more often than the people who sell them will say. The useful test is not whether it can be built. Almost anything can. It is whether you can afford to own it for as long as you will have it.",
  "Everything it stands on belongs to somebody else, and their promises are shorter than a business's memory. Google's cloud terms commit to twelve months of notice before a backwards-incompatible change to a customer-facing interface, with carve-outs including anything needed to avoid a substantial economic or material technical burden, and none of it applies to a service that has not reached general availability. Meta guarantees a Graph API version for two years from the day its successor ships. Microsoft's modern lifecycle policy promises a minimum of twelve months.",
  "And when software goes wrong, most of the cost lands on the business using it rather than the business that made it. The study the American standards institute commissioned on this put the annual national cost of inadequate software testing at 59.5 billion dollars and split it 38.3 billion to users against 21.2 billion to developers.",
];

/** SCENE copy — when an off-the-shelf tool genuinely cannot.
 *
 * Four cards on a two column grid. This scene REPLACES the enumeration that would otherwise have
 * been four paragraphs. The fourth card exists to stop the other three being read as permission. */
export const WHEN_CUSTOM: GridItem[] = [
  {
    lead: "The step is between two products, not inside one",
    body: "Every product is excellent at its own job and nobody sells the gap. When the expensive part of your week is carrying something from one system to another and reconciling what does not match, there is no product to buy, because the shape of the problem is the shape of your particular pair of systems.",
  },
  {
    lead: "The rule is yours and nobody else has it",
    body: "How you decide which enquiries get called first, what makes a listing ready to go live, which of your arrangements gets chased and when. A product implements the average version of a rule. If your version is the reason you win, configuring somebody else's average is a slow way of giving it up.",
  },
  {
    lead: "The volume is real but too small to be a market",
    /** ROUND I removed "in about two hundred businesses nationally". The forty times a month is
     * a hypothetical about the reader's own business and reads as one. That clause was a claim
     * about the world with nothing behind it, sitting in a grid card, which is a field with no
     * `source` and no `basis`. Found by a narrowed version of the check the checker recommended
     * and did not build: figures asserted in a NARRATIVE scene field that the post's own body
     * never states. Over the twenty posts it returns 14 of 382, which is a usable rate; the
     * unnarrowed version returns 150 and the checker was right that it should not be built. */
    body: "Something that happens forty times a month in your business happens in too few other businesses for anybody to build a product for it. This is the most common genuine case and it is also the one where the build should be smallest.",
  },
  {
    lead: "And the case that is not on this list",
    body: "Wanting it to work exactly the way it does now. That is the most expensive reason to build anything, because you are paying to preserve a process rather than to improve one, and the version of it that gets built will be harder to change than the habits it was made to protect.",
  },
];

/** SCENE copy — what a vendor actually promises. Cited data graphic ONE.
 *
 * Three published policies, each read on the vendor's own page rather than in an article about it.
 *
 *   Google Cloud Platform Terms of Service, section 1.4(e), Discontinuation of Services, quoted:
 *   "Google will notify Customer at least 12 months before: (i) discontinuing any Service (or
 *   associated material functionality) unless Google replaces such discontinued Service or
 *   functionality with a materially similar Service or functionality; or (ii) significantly
 *   modifying a Customer-facing Google API in a backwards-incompatible manner. Nothing in this
 *   Section 1.4(e) (Discontinuation of Services) limits Google's ability to make changes required
 *   to comply with applicable law, address a material security risk, or avoid a substantial
 *   economic or material technical burden. This Section 1.4(e) (Discontinuation of Services) does
 *   not apply to Cloud Identity Services or pre-general availability Services."
 *
 *   Microsoft Modern Lifecycle Policy, quoted: "Microsoft will provide a minimum of 12 months'
 *   notification prior to ending support if no successor product or service is offered, excluding
 *   free services or preview releases."
 *
 *   Meta Graph API versioning, quoted: "Each version is guaranteed to operate for at least two
 *   years. A version will no longer be usable two years after the date that the subsequent version
 *   is released."
 *
 * NO AXIS MAXIMUM because these are counts of months rather than shares. The two twelves are half
 * the track against the twenty four, which renders as a real bar rather than as a hairline.
 *
 * WHY THE THIRD BAR IS LIT: it is the longest of the three, and the argument is that the longest
 * promise on this chart is shorter than the life of anything a business actually runs.
 *
 * THE HONEST CAVEAT, and it is in the note rather than hidden: these are three different KINDS of
 * promise about three different kinds of thing. What they have in common is the only thing being
 * drawn, which is the number of months a business gets. */
export const NOTICE = {
  eyebrow: "The evidence",
  caption: "How much warning a vendor's own policy promises you",
  bars: [
    { label: "Google Cloud, before a backwards-incompatible API change", value: 12, display: "12 months" },
    { label: "Microsoft, before support ends with no successor", value: 12, display: "12 months minimum" },
    { label: "Meta, a Graph API version after its successor ships", value: 24, display: "24 months" },
  ],
  lit: 2,
  basis:
    "Months of notice or continued operation, taken from three vendors' own published policies rather than from any article about them. The first is Google's commitment in its cloud terms of service to notify a customer before discontinuing a service or making a backwards-incompatible change to a customer-facing interface. The second is Microsoft's stated minimum notification under its modern lifecycle policy where no successor is offered. The third is Meta's guarantee that a Graph API version keeps working, measured from the release date of the version after it rather than from its own.",
  sourceText: "Google Cloud Platform Terms of Service 1.4(e); Microsoft Modern Lifecycle Policy; Meta Graph API versioning.",
  sourceHref: "https://cloud.google.com/terms/",
  note: "Three different promises about three different things, drawn together because the only thing they have in common is the number of months a business gets. Two things a lifted copy of this chart has to carry with it. Every one of these commitments has exceptions written into it, so a bar here is a policy rather than a term you could plan around, and the article this comes from quotes them. And the third bar is measured from the release of the NEXT version rather than of the one you built on, so a version that is already eighteen months old carries six months rather than twenty four. None of these vendors is behaving badly. They are being unusually clear, and what they are being clear about is that the ground moves.",
};

/** SCENE copy — the three costs that begin on the day it works.
 *
 * The article's spine, and deliberately not the workflow post's failure modes, which are about a
 * chain breaking, or the agent-workforce post's supervision argument, which is about an assistant
 * being wrong. These are about ownership. */
export const THREE_COSTS: GridItem[] = [
  {
    lead: "It is now a thing that has to keep working",
    body: "Not a purchase, a possession. Somebody has to notice when it stops, and the noticing is the expensive half, because a chain that quietly does nothing looks exactly like a chain that had nothing to do. The cheapest useful thing any build can have is a loud failure, and it is the easiest thing to leave out of a scope.",
  },
  {
    lead: "One person understands it",
    body: "Usually the person who built it, occasionally one person in your office, and for a year that is completely fine. It stops being fine at the exact moment you need a change and that person is unavailable, and the amount of the original cost you have to pay again at that point is a function of how well it was written down rather than how well it was built.",
  },
  {
    lead: "It stands on things you do not control",
    body: "Every system it touches is somebody else's, running to somebody else's release schedule, and some of the changes that break a chain are not even the ones a vendor calls breaking. A new value in a field, a rate limit tightened, a login flow that adds a step. None of that is a fault. All of it is Tuesday.",
  },
];

/** SCENE copy — where the cost of bad software lands. Cited data graphic TWO.
 *
 * "The Economic Impacts of Inadequate Infrastructure for Software Testing", RTI for the National
 * Institute of Standards and Technology, NIST Planning Report 02-3, May 2002. Read in the report
 * PDF on nist.gov with pdftotext.
 *
 * Method, quoted: "RTI conducted surveys with both software developers and industry users of
 * software... Two industry groups were selected for detailed analysis: automotive and aerospace
 * equipment manufacturers and financial services providers and related electronic communications
 * equipment manufacturers." Those two case studies were then extrapolated: "The per-employee
 * impacts for these sectors were extrapolated to other manufacturing and service industries to
 * develop an approximate estimate."
 *
 * The drawn figures come from Table ES-4, quoted: "the national annual cost estimates of an
 * inadequate infrastructure for software testing are estimated to be $59.5 billion... Software
 * developers accounted for about 40 percent of total impacts, and software users accounted for the
 * about 60 percent." The table gives $21.2 billion and $38.3 billion respectively.
 *
 * A SEPARATE FINDING FROM THE SAME REPORT IS DELIBERATELY NOT DRAWN, and it is the most quoted
 * table in software economics. Table 5-1, the relative cost of repairing a defect at each stage of
 * development, carries the words "(Example Only)" in its own caption. It is an illustration the
 * report uses to explain a concept, not a measurement, and a chart of it would be a fabrication
 * with a citation attached. That is recorded in the prose rather than hidden.
 *
 * NO AXIS MAXIMUM because these are dollar amounts. */
export const BEARING = {
  eyebrow: "The evidence",
  caption: "Who pays when software does not work, in one year of one economy",
  bars: [
    { label: "Borne by the businesses using the software", value: 38.3, display: "$38.3bn" },
    { label: "Borne by the businesses making it", value: 21.2, display: "$21.2bn" },
  ],
  lit: 0,
  basis:
    "Billions of dollars a year, from the national estimate in the report the National Institute of Standards and Technology commissioned on the economic impact of inadequate software testing infrastructure. The two bars sum to the report's headline figure of 59.5 billion dollars. The split was derived from surveys of software developers and of software users in two industries and then extrapolated per employee to the rest of the economy.",
  sourceText:
    "RTI for the National Institute of Standards and Technology, The Economic Impacts of Inadequate Infrastructure for Software Testing, Planning Report 02-3, 2002.",
  sourceHref: "https://www.nist.gov/system/files/documents/director/planning/report02-3.pdf",
  note: "Two caveats and one reason this is here. It is from 2002, which is a long time ago in this field, and the national total rests on an extrapolation from two industries rather than on a census, both of which the report states about itself. The ratio is the part worth carrying rather than the totals, and the ratio is the whole argument of this article: the business that ends up paying for software not working is overwhelmingly the business using it, not the one that wrote it. That is true of a product you buy and it is true twice over of something built for you alone, because there is no other customer to notice the fault first and no vendor whose next release fixes it. One more thing from the same report is deliberately absent from this page, and it is explained in the section below.",
};

/** SCENE copy — the life of a one-off, drawn as the order it happens in.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. "Quoted, and finite" is 18. */
export const LIFECYCLE: { label: string; connects: string; at?: string }[] = [
  { label: "The build", connects: "Quoted, and finite" },
  { label: "The day it works", connects: "Everything else starts" },
  { label: "The custodian", connects: "One person, usually" },
  { label: "The change", connects: "Somebody else's release" },
  { label: "The repair", connects: "Yours, on their clock" },
  { label: "The retirement", connects: "A decision, not a drift" },
];

/** SCENE copy — three ways a working custom build stops being worth it.
 *
 * Deliberately not the limits section restated: limits are what the service cannot do, and these
 * are what a build that runs perfectly still does to a business. Also deliberately not the
 * workflow post's failure modes, which are about the chain itself breaking. */
export const WASTED: GridItem[] = [
  {
    lead: "The process it was built around went away",
    body: "You changed portals, or the brokerage restructured, or the thing it fed into got replaced. The chain still runs, faultlessly, on a shape of work that no longer exists, and because it never errors nobody has any reason to look at it. This is the ending nobody plans for, and it does not announce itself on the day it happens.",
  },
  {
    lead: "It got extended once too often",
    body: "Every addition was reasonable and every one was cheaper than starting again. Somewhere around the fifth, the thing stopped being a chain anybody could hold in their head, and the cost of the next change stopped being proportional to the size of the change. The signal is somebody saying they would rather not touch it.",
  },
  {
    lead: "Nobody ever decided to retire it",
    body: "Systems are switched on by a decision and switched off by an accident. A build with no review date will run until something breaks it, which means the question of whether it is still earning its keep gets answered by a vendor's release schedule rather than by you.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. Last topic of the twenty. */
export const CUSTOM_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings, $2,500, 0.3 percent, 3 business days, 20
   * sources, 1 of three, 0 invoices, 14 videos and 4 crossed off. This one is a single UNFAMILIAR
   * VALUE arriving in a field, which is the smallest event in the whole set and is the one that
   * ends a two year run. */
  hero: {
    moment: "1",
    suffix: "new value",
    /** NOT either plate. The plates are a tool wall and punched cards; this is grey network cable
     * looped by hand through a frame, which is texture behind type rather than a subject. */
    photo: "/images/editorial/patch-panel.jpg",
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
    "when-custom": {
      kind: "grid",
      band: "dark",
      eyebrow: "Four cases",
      heading: "Three of these are real. The fourth is the expensive one.",
      columns: 2,
      glow: true,
      items: WHEN_CUSTOM,
      label: "When it is right",
    },
    notice: {
      kind: "statbars",
      band: "dark",
      label: "What you are promised",
      ...NOTICE,
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/tool-wall.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS and which contains the 21:9
      // crop a laptop ships. Measured in round F: the Plate primitive renders 2.33 at 1440 and
      // 1.78 at 390, so the phone sees a taller slice. The taller crop adds the bench top along
      // the bottom with a blue tarpaulin folded on it and papers beside it, neither of which is in
      // the 21:9 slice. ONE CORRECTION MADE BY LOOKING: an earlier version of this comment said
      // nothing in the photograph carries lettering, and the phone crop has a labelled plastic
      // bottle standing on the bench. Its label is not legible at the shipped size, so the alt
      // says a labelled bottle rather than naming anything on it.
      //
      // ROUND I: there are no shears at the right. What is there is two hand saws, a hacksaw
      // frame and a large steel try square, with a pair of dark goggles and two pairs of dividers
      // below them, and the goggles and the square were the two most prominent objects in that
      // half of the frame and were not mentioned at all. A second pair of goggles, bright yellow,
      // hangs among the pliers at the top. The bottle's label reads Mobil at the shipped crop,
      // which is enough to call it engine oil and not enough to quote.
      alt: "A workshop wall hung with hand tools in deliberate rows on pale painted boarding, adjustable spanners, pliers, a red pipe wrench and long handled bolt cutters along the top with a pair of yellow goggles among them, long files and rasps standing upright at the left, hammers and scrapers beside them, a shelf of screwdrivers with yellow, green, red and black handles ranked by size across the middle with chisels and punches hanging beneath it, two hand saws, a hacksaw frame and a large steel try square at the right against exposed brick with a second pair of goggles and two pairs of dividers below them, and a bench along the bottom of the frame carrying a blue plastic sheet, a labelled bottle of engine oil, a black folder and loose papers",
      caption:
        "Nobody buys a wall like this. It accumulates, one tool at a time, each one bought for a job that a tool already on the wall could not quite do. That is what a bespoke build actually is, and it is also the warning in the picture: every one of these has to be found, kept sharp and put back, and a wall nobody maintains is just a lot of metal on a hook.",
      credit: "Photograph by huw-ogilvie, CC BY 2.0.",
      ariaLabel: "Hand tools hung in rows on a workshop wall",
    },
    "three-costs": {
      kind: "grid",
      band: "dark",
      eyebrow: "Three costs that start on the day it works",
      heading: "None of them are on the quote.",
      columns: 3,
      items: THREE_COSTS,
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from the Google Cloud Platform Terms of Service, section 1.4(e). Quoted rather
       * than paraphrased because every summary of it reports the twelve months and drops the
       * sentence after it, and the sentence after it is the one that decides what the promise is
       * actually worth. */
      text: "Nothing in this Section 1.4(e) (Discontinuation of Services) limits Google's ability to make changes required to comply with applicable law, address a material security risk, or avoid a substantial economic or material technical burden.",
    },
    bearing: {
      kind: "statbars",
      /** DARK rather than light, measured rather than chosen: with this chart on a light field the
       * prose either side of it ran as one pale band of 18 to 21 percent of the article, against a
       * shipped cohort range of 14 to 17. Flipping it breaks the run and costs nothing else. */
      band: "dark",
      label: "Who pays",
      ...BEARING,
    },
    lifecycle: {
      kind: "diagram",
      band: "dark",
      label: "The life of it",
      eyebrow: "The system",
      heading: "The quote covers the first box.",
      lede: "Six stages, and the whole of the commercial conversation happens at the left hand end. Everything from the third box onward is yours, it is open ended, and it is where a build either quietly earns its keep for years or quietly stops. Note that the last one is the only stage that requires somebody to make a decision, which is why it is the one that almost never happens.",
      steps: LIFECYCLE,
      altPrefix:
        "The life of a bespoke automation from a quoted build, through the day it starts working, a single custodian, a change made on somebody else's release schedule, a repair you pay for on their timing, and a deliberate retirement",
    },
    "changes-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How often does somebody else change something your build stands on?",
      ariaLabel: "How many outside changes a year a bespoke automation is exposed to",
      inputs: [
        {
          kind: "range",
          id: "systems",
          label: "Separate systems the chain would touch",
          hint: "Count anything with its own login. Your CRM, your calendar, your email sender, your document store, the portal, the accounting package.",
          min: 2,
          max: 15,
          step: 1,
          initial: 5,
          format: "count",
          width: "w-[3.5rem]",
        },
        {
          kind: "range",
          id: "perYear",
          label: "Changes each of them publishes in a year that you would have to read",
          hint: "Not every release. The ones with a version number, a deprecation notice or a new required field in them.",
          min: 1,
          max: 12,
          step: 1,
          initial: 2,
          format: "count",
          width: "w-[3.5rem]",
        },
        {
          kind: "range",
          id: "breaks",
          label: "Share of those that would actually break something on your side",
          hint: "Most of them will not touch you. The honest number here is low and the point is that it is not zero.",
          min: 5,
          max: 100,
          step: 5,
          initial: 25,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "hours",
          label: "Hours to notice, diagnose and fix one",
          hint: "Noticing is usually the long part, especially where the failure is silent rather than loud.",
          min: 1,
          max: 24,
          step: 1,
          initial: 4,
          format: "count",
          width: "w-[3.5rem]",
        },
      ],
      chain: [
        { label: "Systems the chain touches", by: { from: "input", id: "systems" }, format: "count", unit: "systems" },
        { label: "Changes a year you would have to read", by: { from: "input", id: "perYear" }, format: "count", unit: "changes" },
        {
          label: "That break something on your side",
          by: { from: "input", id: "breaks" },
          format: "count",
          /** SHORT ON PURPOSE. A chain unit renders inside a shrink-0 cell and cannot wrap; round
           * E shipped 66px and 32px of horizontal overflow from exactly this. The explanation
           * belongs in the row label on the left, which does wrap. */
          unit: "breaks",
        },
        { label: "At your repair time", by: { from: "input", id: "hours" }, format: "hours", unit: "hours a year" },
      ],
      headline: 1,
      resultLabel: "Times a year somebody else changes something this stands on",
      note: "The headline is the second row rather than the hours, and the reason is the argument of the whole article. The hours at the settings this opens with are a small number that nobody would refuse to spend. The exposure is the thing being bought: you have agreed to keep up with several other companies' release schedules, permanently, in exchange for a step of work you no longer do. Whether that trade is good depends entirely on how large the step was, which is why there is no verdict here. Shares produce fractions, and a quarter of a breakage is not a thing, so read anything with a decimal in it as a rough count. Four things this refuses to put a number on. There is no share of a system's lifetime cost that goes on maintenance, and the reason is specific rather than a shrug: the figure everybody quotes traces to a 1978 survey and a 2000 magazine article, and neither could be read in the original, so nothing is printed. There is no lifespan for a custom build, because nobody publishes one. There is no price, because it depends on which systems. And there is no comparison against what an off-the-shelf tool would have cost, because the case for building is that the tool does not exist.",
      action: { label: "See how it is built", href: "/services/custom-automation" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Describe the one step that is actually capping you, in a paragraph, the way you would describe it to somebody starting on Monday. We will tell you whether a product already does it, whether it is a build, or whether the real answer is that a decision has not been made yet.",
      reassure:
        "It is a short reply from a person, it costs nothing, and a fair share of the time the honest answer is that something you already pay for will do it, which is a cheaper outcome for you and a worse one for us.",
      action: { label: "Describe the step", href: "/connect" },
      ariaLabel: "Describe the step that is capping you",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/jacquard-cards.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS. The taller crop adds a fourth
      // card along the bottom edge and more of the wooden frame at the left, neither of which is
      // in the 21:9 slice. Nothing in this photograph carries legible lettering.
      //
      // ROUND I: the lacing is PALE CREAM CORD threaded through the edges of the cards, not "dark
      // lacing tape running between them"; what runs between the cards is the dark seam where two
      // of them hinge. The cards are stacked up the frame rather than laid across it. And the
      // caption asserted an AGE for a photographed object, which is the one thing a photograph
      // cannot carry: the source title is "Punched cards from a Jacquard loom" and gives no date,
      // the body of this post never mentions Jacquard, so "two hundred years old" rested on
      // nothing. The point never needed it.
      alt: "Punched cards laced edge to edge into a continuous band, four of them stacked up the frame with the top and bottom ones cut off, each a stiff cream rectangle pierced with rows of round holes in irregular groups and stained brown along its edges, pale cream lacing cord threaded through the edge of every card down both sides, and dark timber with a thin metal rod along the right hand edge",
      caption:
        "This is a program, and there is nothing electronic in it. Every hole is an instruction, the loom cannot do anything the cards do not say, and the reason this one still exists is that somebody kept the cards. That is the entire lesson: the machine was never the fragile part. The fragile part is the description of what it was supposed to do, and whether anybody can still read it.",
      credit: "Photograph by pedrik, CC BY 2.0.",
      ariaLabel: "Punched cards from a Jacquard loom",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 19: on light, the cost section, the
       * limits section and the how-to run as one long pale band. Flipping this one breaks it. */
      band: "dark",
      eyebrow: "Three ways a build that still runs stops being worth it",
      heading: "None of them are the code failing.",
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
      text: "Take the step you would most like to hand over and write two things about it. First, the names of every system it would have to touch. Second, the name of the person who would notice if it silently stopped. If the first list is long and the second is empty, you have not found a build yet. You have found a decision that has to be made before anybody writes anything.",
      actions: [
        { label: "See it on the AI page", href: "/ai#plus", variant: "light" },
        { label: "How it is built", href: "/services/custom-automation", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because the honest range on this topic is genuinely wide: connecting two systems that both have a decent way in is days, and something that has to read documents or reach an office that is not yours is a different order of work. What does not vary is that the build is quoted and the ownership is not, and the second one is the part worth talking about first. The AI audit is an hour, done with you, and it exists partly to establish that a custom build is not the answer.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-custom-actually-means-and-when-nothing-off-the-shelf-will-do": "When it is right",
    "the-quote-covers-the-part-that-ends": "What is quoted",
    "everything-it-stands-on-belongs-to-somebody-else": "Whose ground",
    "the-change-that-is-not-a-breaking-change": "Not a break",
    "who-pays-when-software-does-not-work": "Who pays",
    "the-number-this-page-will-not-print": "The missing share",
    "what-makes-a-bespoke-build-survivable": "Survivable",
    "what-happens-on-the-day-you-want-to-change-it": "Changing it",
    "when-not-to-commission-one-at-all": "When not to",
    "how-to-test-a-builder-before-you-hire-one": "Test a builder",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
