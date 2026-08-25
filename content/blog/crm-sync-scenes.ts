/** Scene copy for the two-way CRM sync flagship post (topic 10).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Tenth topic on the flagship template and the NINTH IN A ROW that adds no component of
 * its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 9. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/crm-sync.ts. Nothing here claims
 * a capability that page does not claim.
 *
 * THE DELIBERATE DISTANCE FROM ITS NEAREST SIBLING. Topic 5, workflow automation, is the closest
 * article in the cohort and it already owns the whole subject of busywork: steps that a person
 * repeats, what an interruption costs, and the chain that fires by itself. It mentions a
 * duplicate record ONCE, as step five of an eight step example, and that single line is the
 * entire seam between the two articles.
 *
 *   TOPIC 5 is about WORK moving between systems. A form is submitted, so a task is created and
 *   a reply goes out, and the argument is what the manual version of that costs.
 *
 *   THIS post is about one FACT being true in more than one place at the same time. Not the
 *   work, the record. It is about what a computer can and cannot know about whether two rows
 *   describe the same human being, about the three answers a serious matching system gives
 *   rather than two, and about the four ways a sync silently damages a record it was built to
 *   protect: erasing a field, applying an update twice, losing an update, and merging two people
 *   who are not the same person.
 *
 * Not one source, chart, statute or number is shared with topic 5, and none of the interruption
 * or platform material that post rests on appears here at all.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. The measurement, the
 * model, the mechanics, which is the order the article itself runs in. */
export const IN_SHORT: string[] = [
  "Duplicate contacts are not a discipline problem. Every route into your business creates a record, each one is separately correct about the person in front of it, and nothing in the building has the job of noticing that two of them are the same woman.",
  "Deciding whether two records are one person is a studied problem with a published answer, and the answer has three outcomes rather than two: a match, a nonmatch, and a middle band held for a person to look at. The thresholds either side of that band are set from the two error rates you are willing to accept, and you cannot set both of them to zero.",
  "Most of the damage a sync does is not a failure. It is a design decision nobody made out loud: whether an update replaces the whole record or changes named fields, what happens when the same message arrives twice, and which side wins when both of them changed.",
];

/** SCENE copy — the two records.
 *
 * The article's cold open, staged as the thing a reader would actually be looking at. FOUR cards
 * rather than two, because the pair on its own is just an anecdote: the third and fourth cards
 * are the argument, and both of them say something the body does not.
 *
 * The names are invented and the situation is a composite. No address, no real client, nothing
 * that could be checked against a person. */
export const TWO_OF_HER: GridItem[] = [
  {
    // The dates and the source lines are the story three paragraphs above this scene, in the
    // shape a record actually takes. The first draft said "Created 14 March" and "a quarter past
    // ten at night", neither of which is in the article: invented precision in a scene whose
    // whole argument is that the details on a record came from somewhere real.
    lead: "Created in March, by your website",
    body: "Kathy Brown. A personal email address. A mobile number typed into a phone with one thumb, on a valuation form, late in the evening. Source: home valuation. No owner, because nobody had picked it up yet. Everything on it is exactly what she typed, which is what a form is for.",
  },
  {
    lead: "Created in June, by whoever answered",
    body: "Katherine Brown. A work email. A different mobile, the one she actually answers. Source: inbound call. Owner: the person who took it. Everything on it is exactly what she said out loud to somebody who was writing it down, which is a different question and gets a different answer.",
  },
  {
    lead: "Neither of them is the wrong one",
    body: "This is the part that changes what the fix has to be. There is no mistake in either record and no training that would have prevented it, because both systems did the correct thing with the information they were given. The duplicate is not an error. It is the shape two correct systems make when neither can see the other.",
  },
  {
    lead: "And only one of them knows she sold",
    body: "The August listing and the September contract were entered against the June record, because that is the one the agent was working from. The March record still says she is thinking about it. The campaign that emailed her three days before closing was pointed at exactly the right segment, and there is nothing in it that failed.",
  },
];

/** SCENE copy — the three outcomes.
 *
 * Ivan Fellegi and Alan Sunter, "A Theory for Record Linkage", Journal of the American
 * Statistical Association 64 (1969), 1183-1210, formalising ideas Howard Newcombe published in
 * 1959. THE 1969 PAPER ITSELF WAS NOT READ: every free copy traced to a dead university course
 * link, and the publisher's copy is paywalled. So it is credited the way the article credits it,
 * as the origin, and what is actually quoted here is the restatement in the document that WAS
 * read in full, William Winkler's overview for the US Census Bureau.
 *
 * Winkler's decision rule, quoted as written:
 *
 *   "If R > T_mu, then designate pair as a match.
 *    If T_lambda <= R <= T_mu, then designate pair as a possible match and hold for clerical
 *    review.
 *    If R < T_lambda, then designate pair as a nonmatch."
 *
 * And the sentence underneath it, which is the one this scene exists for: "The cutoff thresholds
 * T_mu and T_lambda are determined by a priori error bounds on false matches and false
 * nonmatches." Plus: "Rule (2) partitions the set into three disjoint subregions. The region
 * T_lambda <= R <= T_mu is referred to as the no-decision region or clerical review region."
 *
 * THE CARDS DISTIL, THEY DO NOT QUOTE. The body carries the rule and the citation; these are
 * what each of the three outcomes costs you when it is wrong, which the body does not say. */
export const THREE_ANSWERS: GridItem[] = [
  {
    lead: "Above the line: merge them",
    body: "The pattern of agreements is the kind only the same person produces. The two records become one and the second history is folded into the first. When this one is wrong you have fused two people, and somebody opens a contact expecting one conversation and finds a stranger's in it. That is the expensive mistake, and it is the one an over-confident setting produces.",
  },
  {
    lead: "In the middle: ask somebody",
    body: "Enough agrees to be interesting and not enough to be sure. The pair waits in a queue for a human being who looks at both and decides in about two seconds, because a person has context that is not in either row. This band is the price of the other two being right, and every product that advertises full automation has quietly abolished it.",
  },
  {
    lead: "Below the line: leave them alone",
    body: "Two people who happen to share a surname, or the same person with nothing in common between the two rows. When this one is wrong she stays in your database twice and every campaign counts her twice. It is the cheap mistake and it is the one you already have, which is precisely why the pressure is always to move the line and merge more.",
  },
];

/** SCENE copy — the commonest surnames. Cited data graphic ONE.
 *
 * United States Census Bureau, "Frequently Occurring Surnames from the 2010 Census". Read on the
 * Bureau's own page, which states the method and carries the top ten in the page itself rather
 * than only in the downloadable files.
 *
 * Quoted from the page: "Tabulations of all surnames occurring 100 or more times in the 2010
 * Census returns are provided in the files listed below... The third link provides zipped Excel
 * and CSV (comma separated) files of the complete list of 162,253 names."
 *
 * The published top ten, in order: Smith 2,442,977 / Johnson 1,932,812 / Williams 1,625,252 /
 * Brown 1,437,026 / Jones 1,425,470 / Garcia 1,166,120 / Miller 1,161,437 / Davis 1,116,357 /
 * Rodriguez 1,094,924 / Martinez 1,060,159. The first five are plotted.
 *
 * WHY BROWN IS THE LIT BAR: it is the surname in the article's opening, and the point of the
 * chart is that the reader can see how much company she has. Nothing was chosen to flatter the
 * chart; Brown is fourth on the published list and is drawn fourth.
 *
 * NO AXIS MAXIMUM, deliberately. These are counts rather than shares of a whole, the five bars
 * sit between 58 and 100 percent of the largest, and no bar renders as a hairline. */
export const SURNAMES = {
  eyebrow: "The evidence",
  caption: "How many people in the United States carried each of these surnames",
  bars: [
    { label: "Smith", value: 2442977, display: "2,442,977" },
    { label: "Johnson", value: 1932812, display: "1,932,812" },
    { label: "Williams", value: 1625252, display: "1,625,252" },
    { label: "Brown", value: 1437026, display: "1,437,026" },
    { label: "Jones", value: 1425470, display: "1,425,470" },
  ],
  lit: 3,
  basis:
    "Counts of people by surname from the 2010 Census returns, as published by the Census Bureau. The five drawn here are the five commonest of the 162,253 surnames that occurred at least a hundred times, and the fourth is the surname in the story at the top of this article.",
  sourceText:
    "United States Census Bureau, Frequently Occurring Surnames from the 2010 Census.",
  sourceHref: "https://www.census.gov/topics/population/genealogy/data/2010_surnames.html",
  note: "This is the whole country in 2010 and your database is not the whole country, so treat the bars as an order of magnitude rather than as a rate that applies to your file. Two limits matter more than the age. Surnames are distributed very unevenly by place, so a name that is unremarkable nationally can be the only one in a village and genuinely useful evidence there. And a matching rule never uses a surname on its own, which is exactly the point: the chart is here to show what a surname is worth by itself, which is close to nothing, and therefore why everything else on the record has to do the work.",
};

/** SCENE copy — what automated matching did to the largest matching job in the country, and what
 * it could not do. Cited data graphic TWO.
 *
 * William E. Winkler, "Overview of Record Linkage and Current Research Directions", Research
 * Report Series (Statistics #2006-2), Statistical Research Division, U.S. Census Bureau, report
 * issued 8 February 2006. Read in the Bureau's own PDF with pdftotext.
 *
 * Quoted as written: "In a very large 1990 Decennial Census application, the computerized
 * procedures were able to reduce the need for clerks and field follow-up from an estimated 3000
 * individuals over 3 months to 200 individuals over 6 weeks (Winkler 1995). The reason for the
 * need for 200 clerks is that both first name and age were missing from a small proportion of
 * Census forms and Post Enumeration Survey forms."
 *
 * THE SECOND SENTENCE IS WHY THE CHART EXISTS. Everybody quotes a reduction; almost nobody
 * quotes the reason the remainder was irreducible, and the reason is not that the algorithm was
 * not clever enough. It is that some forms had a blank where the name was.
 *
 * NO AXIS MAXIMUM. These are counts of people, the shrinkage is the finding, and a 200 bar
 * beside a 3,000 bar is supposed to be a sliver. What the bars CANNOT show is that the two
 * periods differ, three months against six weeks, so the periods are written into the labels
 * rather than left in the basis line. */
export const CENSUS_CLERKS = {
  eyebrow: "The evidence",
  caption: "People needed to finish the matching in the 1990 Decennial Census",
  bars: [
    { label: "Clerks and follow-up, over 3 months", value: 3000, display: "3,000" },
    { label: "Clerks needed after, over 6 weeks", value: 200, display: "200" },
  ],
  lit: 1,
  basis:
    "The figures Winkler records for the 1990 Decennial Census matching application: an estimated 3,000 individuals over three months before the computerised procedures, and 200 individuals over six weeks after them. The two bars cover different lengths of time and a bar chart cannot show that, so both periods are written into the labels.",
  sourceText:
    "William E. Winkler, Overview of Record Linkage and Current Research Directions, U.S. Census Bureau Research Report Series (Statistics #2006-2), 2006.",
  sourceHref:
    "https://www.census.gov/content/dam/Census/library/working-papers/2006/adrm/rrs2006-02.pdf",
  note: "This was a national census in 1990, not a small business database, and it was matched against a survey designed to be matched against it, which is far better raw material than anything in a CRM. Read the second bar rather than the first. Two hundred people were still needed at the end, and the reason the paper gives is not that the matching was not good enough: it is that first name and age were simply missing from some of the forms. There is no procedure for a blank field. The transferable finding is the shape rather than the ratio, and the shape is that automation takes the volume out and leaves the ambiguity in.",
};

/** SCENE copy — three ways a correctly built sync produces nothing.
 *
 * Deliberately not any sibling's three, and not a restatement of the limits section: the limits
 * are what the service cannot do, and these are the ways a competent build ends up worthless
 * anyway. All three are about the business rather than about the software, which is the half
 * nobody quotes for. */
export const WASTED: GridItem[] = [
  {
    lead: "The review queue nobody opens",
    body: "The middle band only works if a person actually goes there. A queue with four hundred pairs in it and no owner is not a safety mechanism, it is a filing cabinet, and the pairs in it are the exact records most likely to be the ones you care about. Ten minutes on a Friday is the whole job. Nobody schedules it, because the day it is set up it is empty.",
  },
  {
    lead: "Fields that were never agreed, only defaulted",
    body: "Somebody has to say which side wins for each field that both systems can change, and it is a slow conversation because half the answers turn out to be that nobody remembers what the field was for. Skipping it does not remove the decision. It hands the decision to whichever system happens to write last, which is a rule you will discover months later by losing something.",
  },
  {
    lead: "A record that is finally true and nobody reads",
    body: "The whole point of this is that the thing in front of you when you pick up the phone is current. If the team still works from a notebook, a group chat and their own memory, the CRM becomes an immaculate archive that describes a business happening somewhere else. No integration has ever reached into a notebook, and no amount of accuracy substitutes for somebody looking.",
  },
];

/** SCENE copy — what a sync is actually made of, drawn as hops.
 *
 * The service page's own `figure` flow plus the three hops that page does not name, which are
 * the three this article is about: the identity decision, the conflict rule, and the fact that
 * the middle band ends at a person.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing
 * is clipped by the container edge at 390px. 33 characters lost a letter on the reactivation
 * post; "A call or a form" is 16. */
export const SYNC_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The event", connects: "A call or a form" },
  { label: "The identity", connects: "Which contact is this" },
  { label: "The mapping", connects: "This field, that field" },
  { label: "The direction", connects: "One way, or both ways" },
  { label: "The conflict rule", connects: "Which side wins, agreed" },
  { label: "The record", connects: "One person, one history" },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. */
export const CRM_SYNC_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments so far have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12
   * reviews, 9 days, 3 results and 1 word. Two is the smallest possible count of a thing that
   * should only exist once, and the entire article is about the gap between that 2 and the 1
   * person it describes. */
  hero: {
    moment: "2",
    suffix: "records",
    photo: "/images/lifestyle/selling.jpg",
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
    "two-of-her": {
      kind: "grid",
      band: "dark",
      eyebrow: "The two records",
      heading: "Both of them are correct. That is the problem.",
      columns: 2,
      glow: true,
      items: TWO_OF_HER,
      label: "The two records",
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-07.jpg",
      // WRITTEN FROM THE 21:9 CROP, not from the catalogue title. Checked against the plate
      // swatch: the wreath, the 1820 plaque, the 279 and the second red building are all inside
      // the crop; there is no lawn and no full view of either roof.
      alt: "A red clapboard house in snow with white window frames, an oval plaque reading 1820 on the wall and the number 279 painted beside a dark teal front door hung with a red berried wreath under a green garland, with a second, weathered red building standing behind it to the left and snow laden bare branches crossing the top of the frame",
      caption:
        "The date on the plaque and the number beside the door are there because a description of this house does not find it. Red, gable end, snow on the roof: so is the building behind it. The number is the only thing on that wall which means one house and not another, and a contact record works exactly the same way.",
      credit: "Photograph by Muffet, CC BY 2.0.",
      ariaLabel: "The number beside the door",
    },
    surnames: {
      kind: "statbars",
      /** LIGHT, and the second chart on this post is DARK, which is a different arrangement from
       * both of its predecessors: topic 8 carried two dark charts and topic 9 two light ones.
       * Deciding it as a pair keeps the three most recent posts from sharing a rhythm. */
      band: "light",
      label: "The surname",
      ...SURNAMES,
    },
    "three-answers": {
      kind: "grid",
      band: "dark",
      eyebrow: "The decision rule",
      heading: "Three outcomes, and the middle one is a person.",
      columns: 3,
      items: THREE_ANSWERS,
      label: "Three answers",
    },
    "census-clerks": {
      kind: "statbars",
      band: "dark",
      label: "What is left",
      ...CENSUS_CLERKS,
    },
    "sync-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "From something happening to one record that is true.",
      lede: "Six hops, and the two that decide whether this works are the second and the fifth. Everything between them is plumbing that either exists or does not. The identity decision and the conflict rule are judgements about your business, they are made once, and they are the two nobody asks about before signing.",
      steps: SYNC_PATH,
      altPrefix: "The path from an event in one system to a single contact record that both systems agree about",
    },
    "crm-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How much of this is a computer's job and how much is somebody's afternoon?",
      ariaLabel: "How many contact pairs would need a person to decide",
      inputs: [
        {
          kind: "range",
          id: "contacts",
          label: "Contacts in your CRM",
          hint: "The number on the dashboard, including the years you have stopped thinking about.",
          min: 500,
          max: 20000,
          step: 100,
          initial: 3000,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "routes",
          label: "Share who could have reached you more than one way",
          hint: "Anybody who might have filled in a form and also rung, or come through a portal and also met you at an open house. Past clients and long term nurture contacts are usually the highest.",
          min: 5,
          max: 100,
          step: 5,
          initial: 25,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "differ",
          label: "Share of those where the details would not match exactly",
          hint: "A short name against a formal one, a work email against a personal one, a moved house. The Census research on high quality files found more than one pair in five disagreed on the first name alone.",
          min: 5,
          max: 100,
          step: 5,
          initial: 20,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes to look at one pair and decide",
          hint: "Usually seconds when you know the person and several minutes when you do not.",
          min: 1,
          max: 10,
          step: 1,
          initial: 2,
          format: "count",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "Contacts in the database", by: { from: "input", id: "contacts" }, format: "count", unit: "contacts" },
        { label: "Who could have arrived more than once", by: { from: "input", id: "routes" }, format: "count", unit: "possible pairs" },
        { label: "Where the details would not match exactly", by: { from: "input", id: "differ" }, format: "count", unit: "pairs to settle" },
        { label: "At your deciding time", by: { from: "input", id: "minutes" }, format: "count", unit: "minutes" },
        { label: "In hours", by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" }, format: "hours", unit: "hours of somebody's attention" },
      ],
      headline: 2,
      resultLabel: "Pairs a computer should not settle on its own",
      note: "The headline is the middle row rather than the hours, because the hours are the easy half: the number that decides whether this project is an afternoon or a fortnight is how many pairs end up in front of a person, and that is the number nobody quotes on. Sliders that multiply shares will produce a fraction of a pair, which is not a thing; read two and a half as between two and three. What this refuses to do is tell you how many duplicates you actually have. Figures for that circulate widely and every one traced back to a company selling data cleaning software, quoting its own customers, with no published sample and no method, so both of the shares above are yours to supply and the second of them carries a hint pointing at the one measurement in this subject that does have a method behind it. There is also no row for what a stale record costs in commission, and there was never going to be one: the email that went to the wrong version of somebody is real, and nobody can show you the arithmetic that turns it into money.",
      action: { label: "See how it is built", href: "/services/crm-sync" },
      secondary: { label: "Ask us what your fields do", href: "/connect" },
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "You can decide how often it merges two people who are not the same person, and you can decide how often it leaves one person in there twice. You cannot decide both, and the difference between them is somebody's afternoon.",
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Send us a list of the systems that create a contact in your business and the one field each of them uses to recognise somebody. We will send back where the duplicates are coming from, which of the joins is doing the damage, and which parts of the fix are a week and which are an afternoon.",
      reassure: "It is a short reply from a person, it costs nothing, and we do not need access to your database to answer it.",
      action: { label: "Ask where yours come from", href: "/connect" },
      ariaLabel: "Ask where your duplicates come from",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-09.jpg",
      // WRITTEN FROM THE 21:9 CROP AS RENDERED, and the first version was wrong in three ways
      // that only appeared once the real plate was photographed. It called the structure "a low
      // wall": it is a stone-faced building front with a small gable and a garage opening, and
      // the number sits high up on that gable rather than at eye level. It said the number was
      // "set into it in pale pebbles", which the picture does not support: the digits are picked
      // out in the stonework and are not obviously paler. And it attributed the planted roof to
      // the wall, when the garden is on the flat roof running off to the right of the gable.
      alt: "A building front faced in rounded river stones with the number 1734 picked out in the stonework of its small gable and a dark open garage doorway beneath, the flat roof running off to the right planted as a garden of red, orange and yellow tulips and daffodils, a pale house rising behind it, a bed of tulips at ground level and a white picket fence at each end",
      caption:
        "The number is built into the stonework of that gable, which is a great deal more trouble than a plaque. That is the whole of what a good record is: one deliberate, unambiguous piece of information that means this and nothing else, put there on purpose by a person who knew it would matter later to somebody looking for the place.",
      credit: "Photograph by pnwra, CC BY 2.0.",
      ariaLabel: "The number set into the wall",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 9: on light, the cost section, the
       * limits section and the FAQ run as one long pale band. Flipping this one breaks the run. */
      band: "dark",
      eyebrow: "Three ways a good build produces nothing",
      heading: "None of them are the software.",
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
      text: "Type your own surname into your own CRM and see how many of you there are. It takes one screen and it settles an argument people have in meetings for months, and if more than one of you comes back you already know which version of everybody else your Tuesday email is talking to.",
      actions: [
        { label: "See it on the AI page", href: "/ai#crmsync", variant: "light" },
        { label: "How it is built", href: "/services/crm-sync", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because the cost tracks four things nobody can guess from an article: how many systems have to be joined, whether each of them has an interface a program can use, how many fields have to be mapped by hand, and whether the records already in there have to be reconciled first. The AI audit is an hour, done with you, and it ends with a list of your fields rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "why-there-are-two-of-her-and-it-is-not-carelessness": "Why two",
    "what-the-same-person-means-to-a-computer": "The same person",
    "a-name-is-not-an-identifier-and-this-is-how-far-from-one-it-is": "Names",
    "somebody-solved-this-properly-and-the-answer-has-three-outcomes": "The model",
    "the-third-answer-is-a-person-and-it-is-the-one-nobody-sells-you": "The third answer",
    "what-a-sync-is-actually-made-of": "What a sync is",
    "the-field-that-gets-erased": "The erased field",
    "the-same-update-arriving-twice": "Arriving twice",
    "when-both-sides-changed-at-once": "Both sides",
    "which-side-is-right-and-why-somebody-has-to-say-it-out-loud": "Which side wins",
    "what-the-identity-field-actually-is-in-your-crm": "The identity field",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-find-out-how-bad-yours-is-in-twenty-minutes": "How to check yours",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
