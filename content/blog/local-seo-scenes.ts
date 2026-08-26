/** Scene copy for the local SEO flagship post (topic 8).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Eighth topic on the flagship template and the SEVENTH IN A ROW that adds no component
 * of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 and 7. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/local-seo.ts. Nothing here
 * claims a capability that page does not claim.
 *
 * THE DELIBERATE DISTANCE FROM ITS NEAREST SIBLING. Topic 9, geo landing pages, is the closest
 * article in the cohort by subject, and the two would collapse into one piece if either drifted.
 * The seam is drawn on purpose and it is a real one:
 *
 *   THIS post is about being ranked as a BUSINESS. The thing being ordered is a Business
 *   Profile, the surface is the local pack on Google Maps and Search, the query is answered
 *   before anybody reaches a website, and one of the three inputs Google publishes is how far
 *   the searcher is standing from your front door, which no amount of work will move.
 *
 *   TOPIC 9 is about being ranked as a PAGE, on the organic long tail, in places the profile's
 *   radius does not reach, and about the line Google's spam policy draws through exactly that
 *   tactic. Not one source, chart, statute or number is shared between the two.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document rather than in a summary
 * of it. The first is Google's own sentence, the second is a 2005 Cornell experiment, the third
 * is a field experiment run inside eBay. */
export const IN_SHORT: string[] = [
  "Google publishes what decides the local results, in one sentence: they are mainly based on relevance, distance and popularity. One of those three is where the person searching happens to be standing, and nothing you do will move it.",
  "Being at the top of a short list is worth something on its own. In a Cornell eye-tracking study where the top two results were secretly swapped, most readers still clicked the one on top even when a panel of judges had rated the other one better.",
  "When eBay switched off the search ads it was buying against its own name, 99.5% of the clicks it had been paying for came back through unpaid search anyway. Renting attention and earning it are not the same purchase, and the difference is only visible if somebody runs the experiment.",
];

/** SCENE copy — the three factors, in Google's own words.
 *
 * Read in the primary: support.google.com/business/answer/7091, "Tips to improve your local
 * ranking on Google". Quoted from that page as written:
 *
 *   "There's no way to request or pay for a better local ranking on Google."
 *   "We do our best to keep the search algorithm details confidential to make the ranking system
 *    as fair as possible for everyone."
 *   "Local results are mainly based on relevance, distance, and popularity."
 *   "Relevance is how well a Business Profile matches what someone is searching for."
 *   "Distance refers to how far each business is from the customer who's searching. If a customer
 *    doesn't share where they are, Google uses what it knows about their location."
 *   "Prominence means how well-known a business is. Prominent places are more likely to show up
 *    in search results. This factor's also based on info like how many websites link to your
 *    business and how many reviews you have. More reviews and positive ratings can help your
 *    business's local ranking."
 *
 * THE THIRD CARD IS WHERE THE INDUSTRY CONSENSUS AND THE DOCUMENT DISAGREE, and the card says so
 * rather than smoothing it over. Every article in this category, and this repo's own service
 * page until this round, lists directory citations among the things that move the local pack.
 * They are not in the document. What the document names under prominence is links and reviews. */
export const THREE_FACTORS: GridItem[] = [
  {
    lead: "Relevance, which is the boring one you control completely.",
    body: "Google's page says relevance is how well a Business Profile matches what someone is searching for, and that the way to help is to provide complete and detailed business information. Categories, services, hours, the address. It is the least interesting item on this list and the only one you can finish in an afternoon.",
  },
  {
    lead: "Distance, which you cannot touch at all.",
    body: "How far each business is from the person searching, and when they have not said where they are, Google uses what it already knows about their location. There is no version of this work that changes where your office is or where somebody is standing when they reach for their phone.",
  },
  {
    lead: "Prominence, which is links and reviews rather than the thing everybody says it is.",
    body: "Google describes prominence as how well known a business is, based on information like how many websites link to your business and how many reviews you have. Directory listings that agree with each other are not named anywhere on that page. They may still be worth tidying. They are not what the document says is being measured.",
  },
];

/** SCENE copy — the position experiment. Cited data graphic ONE.
 *
 * Thorsten Joachims, Laura Granka, Bing Pan, Helene Hembrooke and Geri Gay, "Accurately
 * Interpreting Clickthrough Data as Implicit Feedback", SIGIR 2005, Cornell University. Read in
 * the paper itself (cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf), not in a
 * summary of it.
 *
 * Method, from the paper: two phases. Phase II is the one charted here. 22 participants were
 * recruited and usable eye-tracking data was recorded for 16 of them, 6 in the "normal"
 * condition, 5 in "swapped" and 5 in "reversed". Each answered the same ten questions using
 * Google. "The manipulations to the results page were performed by a proxy that intercepted the
 * HTTP request to Google. None of the changes were detectable by the subjects and they did not
 * know that we manipulated the results. When asked after their session, none of the subjects had
 * suspected any manipulation." In the swapped condition "the top two results returned by Google
 * were switched in order". Five judges, separate from the subjects, then ranked the abstracts by
 * how promising they looked, with inter-judge agreement of 82.5% on the Phase II abstracts.
 *
 * THE NUMBERS ARE COUNTS, NOT PERCENTAGES, IN THE PAPER, and they are small. Table 3 gives, for
 * each condition, how often the reader clicked link one only, link two only, both or neither.
 * The three bars below are the cases where exactly ONE of the top two was clicked, and they are
 * built from these cells:
 *
 *   normal, the first-shown abstract judged more relevant:  19 clicked it, 1 clicked the other  (19/20)
 *   normal, the second-shown abstract judged more relevant:  5 clicked the top, 2 clicked it     (5/7)
 *   swapped, the second-shown abstract judged more relevant: 10 clicked the top, 7 clicked it   (10/17)
 *
 * The paper's own reading of the first two: "we can reject this hypothesis with high probablility,
 * since 19/20 is significantly different from 2/7 assuming a binomial distribution", and of the
 * third: "also under the swapped condition, there is still a strong bias to click on link one even
 * if the second abstract is more relevant". Its conclusion is quoted in the prose.
 *
 * THE AXIS IS PINNED TO 100 because these are shares of a whole. Scaled to their own largest bar
 * the 95% would fill the track and the 59% would read as a little over half of it, which is the
 * wrong picture: the honest one is that even the worst case here is still most people. */
export const TRUST_BIAS = {
  eyebrow: "The evidence",
  caption: "Where the click went when a reader picked one of the top two results",
  /** LABELS KEPT SHORT ON PURPOSE. A bar label is SVG text at a fixed size in user units, so at
   * 390 it renders at roughly two thirds the size of the body copy whatever it says, and a
   * long one is a full-width line of small type. Shot beside the shipped booking chart at 390
   * to set the length: its longest label is 42 characters, and the first draft of the third bar
   * here was 86. */
  bars: [
    { label: "On top, judged the better of the two", value: 95, display: "19 of 20" },
    { label: "On top, judged the worse of the two", value: 71, display: "5 of 7" },
    { label: "On top only after a secret swap, judged worse", value: 59, display: "10 of 17" },
  ],
  max: 100,
  lit: 2,
  basis:
    "Of the results pages where a reader clicked exactly one of the top two links, the share where the click landed on the link displayed first. Sixteen subjects, ten questions each, three conditions, with a proxy silently reordering Google's results. The three groups hold twenty, seven and seventeen pages between them, and the paper reports them as counts for that reason.",
  sourceText:
    "Thorsten Joachims, Laura Granka, Bing Pan, Helene Hembrooke and Geri Gay, Accurately Interpreting Clickthrough Data as Implicit Feedback, SIGIR 2005, Cornell University.",
  sourceHref: "https://www.cs.cornell.edu/people/tj/publications/joachims_etal_05a.pdf",
  note: "Sixteen undergraduates in a laboratory, published in 2005, on ten blue links, twenty years before the results page looked anything like it looks now. Nobody has run this experiment on a map pack and these percentages are not a benchmark for one. What transfers is the mechanism, and it is uncomfortable: a share of the clicks at the top of a list are going there because the list said so, not because the reader compared anything. The paper was written to work out whether clicks can be trusted as feedback for a search engine, which is a different question from the one this article is asking, and its authors make no marketing claim anywhere in it.",
};

/** SCENE copy — the eligibility rules. Cited from the primary.
 *
 * support.google.com/business/answer/3038177, "Guidelines for representing your business on
 * Google". Quoted as written:
 *
 *   "Doctors, dentists, lawyers, financial planners, and insurance or real estate agents are all
 *    individual practitioners."
 *   "Sales associates or lead generation agents for corporations aren't individual practitioners
 *    and aren't eligible for a Business Profile."
 *   "A practitioner shouldn't have multiple Business Profiles to cover all of their
 *    specializations."
 *   "The title of the Business Profile for the practitioner should include only the name of the
 *    practitioner, and shouldn't include the name of the organization."
 *   "If a practitioner is the only public-facing practitioner at a location and represents a
 *    branded organization, it's best for the practitioner to share a Business Profile with the
 *    organization."
 *   "They can be contacted directly at the verified location during stated hours."
 *   "If your business rents a physical mailing address but doesn't operate out of that location,
 *    also known as a virtual office, that location isn't eligible for a Business Profile."
 *   "Businesses can't list an office at a co-working space unless that office maintains clear
 *    signage, receives customers at the location during business hours, and is staffed during
 *    business hours by your business staff."
 *   "The boundaries of your profile's overall service area shouldn't extend farther than about 2
 *    hours of driving time from where your business is based."
 *
 * These are the four that decide something for an agent. The scene REPLACES the prose that would
 * otherwise list them, so each appears once on the page. */
export const PROFILE_RULES: GridItem[] = [
  {
    lead: "An agent is a practitioner, and the guidelines say so by name.",
    body: "Doctors, dentists, lawyers, financial planners and real estate agents are all listed in the same sentence as individual practitioners, which is the category that gets its own profile. Support staff are told not to create one. Sales associates and lead generation agents for corporations are named as not eligible at all.",
  },
  {
    lead: "One profile each, not one per thing you do.",
    body: "A practitioner should not hold several profiles to cover their specialisations. The buyer's-agent profile, the listings profile and the investment profile are one profile with three services on it, and splitting them is a suspension risk rather than a clever way to cover more ground.",
  },
  {
    lead: "Your profile carries your name, not the brokerage's.",
    body: "Where several public-facing practitioners work at one location, the guidelines say the organisation gets its own profile and the practitioner's title should include only the practitioner's name. The exception is the solo practitioner at a branded location, who is told it is best to share the organisation's profile rather than start a second one.",
  },
  {
    lead: "An address you do not sit in is not an address.",
    body: "A rented mailing address that you do not operate from is called a virtual office in the guidelines and is not eligible. A desk in a co-working space needs clear signage, staff during business hours and the ability to receive customers there. And a service area is capped at roughly two hours of driving from where the business is based.",
  },
];

/** SCENE copy — what the maintenance actually is.
 *
 * Matches content/services/local-seo.ts. The fourth card is the one this article adds to that
 * page rather than repeating it: the part that decays is not the ranking, it is the accuracy,
 * and accuracy is the only one of the three published factors that a machine can hold still. */
export const THE_WORK: GridItem[] = [
  {
    lead: "It finishes the profile, which is duller than it sounds.",
    body: "Primary category and the secondary ones, every service written out, the service area drawn, the hours including the odd ones, the address, the attributes. Google's own advice for the relevance half is simply to provide complete and detailed information, and the reason that instruction is so unsatisfying is that there is no trick hiding inside it.",
  },
  {
    lead: "It keeps the profile true when the business changes.",
    body: "New number, new hours over a holiday weekend, a service you stopped offering, a photograph of an office you moved out of. Nothing about this is clever and all of it goes stale silently, because a profile does not tell you when it has become wrong.",
  },
  {
    lead: "It keeps the two things Google actually names moving.",
    body: "Reviews, which is asking every client rather than the pleased ones, and mentions on other people's websites, which comes from the ordinary work of being somewhere: a local sponsorship, a chamber page, a piece of coverage. Both are named in the ranking document. Neither can be bought without buying a problem.",
  },
  {
    lead: "It watches the searches you were actually shown for.",
    body: "The profile reports what happened: how many people rang, asked for directions or tapped through to the site, and which searches surfaced you. That is the only measurement in this whole article that is genuinely yours, and it is sitting there whether anybody looks at it or not.",
  },
];

/** SCENE copy — the eBay field experiment. Cited data graphic TWO.
 *
 * Thomas Blake, Chris Nosko and Steven Tadelis, "Consumer Heterogeneity and Paid Search
 * Effectiveness: A Large Scale Field Experiment", NBER Working Paper 20171 (2014), published as
 * Econometrica 2015;83(1):155-174. Read in the working paper PDF, not in a summary of it.
 *
 * Method, from the paper: "In March of 2012, eBay conducted a test to study the returns of brand
 * keyword search advertising. Brand terms are any queries that include the term eBay such as
 * 'ebay shoes'." eBay halted that advertising on Yahoo! and MSN while continuing to buy the same
 * terms on Google, and Google's traffic is the control.
 *
 * The figures, quoted from the paper. The naive comparison: "Column 1 shows the results which
 * suggest that click volume was 5.6 percent lower in the period after advertising was suspended."
 * The controlled one: "In fact, only 0.529 percent of the click traffic is lost so 99.5 percent is
 * retained. Notice that this is a lower bound of retention because some of the 0.5 percent of
 * traffic that no longer comes through Google may be switching to non-Google traffic." And the
 * headline: "The experiment revealed that almost all (99.5 percent) of the forgone click traffic
 * from turning off brand keyword paid search was immediately captured by natural search traffic
 * from the platform, in this case Bing."
 *
 * The return-on-investment figures live in the prose rather than on this chart, because one of
 * them is negative and a bar chart cannot draw a negative honestly. Quoted from the paper: "we
 * calculate Return on Investment (ROI) using typical OLS methods, which result in a ROI of over
 * 4,100% without time and geographic controls, and a ROI of over 1,400% with such controls. We
 * then use our experimental methods that control for endogeneity to find a ROI of -63%, with a
 * 95% confidence interval of [-124%, -3%], rejecting the hypothesis that the channel yields
 * positive returns at all."
 *
 * THE AXIS IS PINNED TO 10, which is neither of the two obvious answers, and the first draft got
 * it wrong in a way that only looking found. Left to scale itself the chart drew a 5.6% LOSS as
 * a full-width bar, which reads as everything and is the exact defect the Round B log records
 * against the Luca chart. Pinned to 100, both bars are slivers and the ratio that is the whole
 * finding disappears. Ten per cent is a stated ceiling with no natural meaning, so the basis line
 * says out loud that it was chosen, the same way the voice post's turn-gap chart declares its
 * one-second axis. */
export const PAID_SEARCH = {
  eyebrow: "The evidence",
  caption: "Clicks eBay lost when it stopped paying for its own name, measured two ways",
  bars: [
    { label: "Before and after, on the same engine", value: 5.6, display: "5.6%" },
    { label: "Against an engine where the ads kept running", value: 0.529, display: "0.5%" },
  ],
  max: 10,
  lit: 1,
  basis:
    "The share of click traffic that did not arrive after eBay stopped bidding on queries containing its own name in March 2012. The first bar is a before-and-after comparison on one search engine. The second is a difference-in-differences estimate using a second search engine, where eBay kept buying the same terms, as the control for seasonality. The axis runs to ten per cent, which is a ceiling we chose: neither figure has a natural maximum, and letting the chart scale itself would draw a 5.6% loss at full width.",
  sourceText:
    "Thomas Blake, Chris Nosko and Steven Tadelis, Consumer Heterogeneity and Paid Search Effectiveness: A Large Scale Field Experiment, NBER Working Paper 20171, published in Econometrica 2015;83(1):155-174.",
  sourceHref: "https://www.nber.org/system/files/working_papers/w20171/w20171.pdf",
  note: "This is eBay, a name tens of millions of people type on purpose, and that matters more than anything else on the chart. The finding is about queries containing the word eBay, where the free result was sitting directly under the paid one and the person was going there anyway. Nobody is typing your name, which is precisely why this does not transfer as a promise and does transfer as a warning: the traffic that substitutes most cleanly is the traffic you were already going to get, and the only way anyone found that out was by switching the spend off in one place and leaving it on in another.",
};

/** SCENE copy — the three ways the work is wasted.
 *
 * Deliberately not any sibling's three. These are the ways an entirely competent local search
 * effort produces nothing, which is a different list from the limits section: the limits are
 * about what the service cannot do, and these are about what the business does to itself. */
export const WASTED: GridItem[] = [
  {
    lead: "It is done once, in a burst, and then left.",
    body: "A profile filled in properly in March and never opened again is a profile that is wrong by November, and wrong in the small ways nobody reports: an hour, a number, a service. The work is not the filling in. The work is the not stopping, which is the only part anybody finds boring enough to skip.",
  },
  {
    lead: "It chases the ranking and ignores the profile's own report.",
    body: "There is a screen that tells you how many people rang, how many asked for directions and what they searched to find you. Businesses that never open it end up arguing about a position they cannot see instead of a call volume they can, and they have no idea whether anything they paid for made a difference.",
  },
  {
    lead: "It gets the reviews by asking the happy ones.",
    body: "Reviews are one of the two things the ranking document actually names, which is exactly why the temptation to curate them is strongest here. Asking selectively is against Google's own policy, it is the fastest way to lose a profile, and it produces a review history that reads as bought to anybody who scrolls it.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. */
export const LOCAL_SEO_FLAGSHIP: FlagshipContent = {
  /** A COUNT OF SLOTS, and the smallest hero number in the cohort. The seven before it were
   * 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews and 9 days, so this is the first that is
   * simply how many places there are. Three is the whole argument of the piece: the list is
   * short, it is short everywhere, and it was short before anybody optimised anything. */
  hero: {
    moment: "3",
    suffix: "results",
    photo: "/images/hero/hero-cand-bear-mountain.jpg",
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
    "ranking-factors": {
      kind: "grid",
      band: "dark",
      eyebrow: "What Google says decides it",
      heading: "Three inputs, and you can only work on two of them.",
      columns: 3,
      glow: true,
      items: THREE_FACTORS,
      label: "The three",
    },
    "trust-bias": {
      /** BOTH CHARTS ON THIS POST ARE DARK, and it is a rhythm decision taken across the pair of
       * posts written this round rather than one at a time. Every shipped chart in the cohort is
       * light, which on a post shaped like this one produces two long pale runs: the prose, the
       * chart and the next section all on paper. Topic 9's charts stay light and its rhythm is
       * carried by its grids, so the two nearest siblings in the set do not look like each
       * other either. The primitive has supported a dark band since it was written. */
      kind: "statbars",
      band: "dark",
      label: "The top slot",
      ...TRUST_BIAS,
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-08.jpg",
      // ROUND I: the lawn is short, even and plainly mown, so "unmown" was simply the opposite of
      // the picture. The chimney is an external stone stack standing against the front of the
      // house rather than rising through the middle of the roof.
      alt: "A brick and stone cottage with red-painted timbering, red window frames and a red front door, a wide stone chimney stack standing against the front of the house and rising past the roof, set in mature woodland behind a short mown lawn with deep shrub borders and a line of flat stepping stones leading toward the door",
      caption:
        "Somebody within a few miles of this house is looking for an agent this week and will choose from three names on a phone screen. Whether yours is one of them is decided partly by a number nobody in this business ever writes down, which is how far away from them your front door happens to be.",
      credit: "Photograph by hoyasmeg, CC BY 2.0.",
      ariaLabel: "The house down the path",
    },
    "profile-rules": {
      kind: "grid",
      band: "dark",
      eyebrow: "The rules nobody reads",
      heading: "Four sentences in the guidelines that decide what you are allowed to have.",
      columns: 2,
      items: PROFILE_RULES,
      label: "The rules",
    },
    "the-work": {
      kind: "grid",
      band: "dark",
      eyebrow: "The mechanic, in four parts",
      heading: "Finish it, keep it true, feed the two things Google names, read the report.",
      columns: 2,
      items: THE_WORK,
      label: "The work",
    },
    "local-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "What is the listing you already have worth, before anybody optimises anything?",
      ariaLabel: "What your existing Business Profile is already producing in a year",
      inputs: [
        {
          kind: "range",
          id: "calls",
          label: "Calls from your Business Profile in a month",
          hint: "Not a guess. Open the profile's own performance screen and read it off. If the number is zero, that is the finding.",
          min: 0,
          max: 120,
          step: 1,
          /** THE DEFAULTS ARE DELIBERATELY MODEST, and the first draft's were not. It opened on
           * 14 calls, 55% real and an 8% close rate, which produced $66,528 before the reader
           * had touched anything, on a page arguing that nobody can promise you a ranking. A
           * default is a claim: it is the number a reader who drags nothing takes away. */
          initial: 9,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "real",
          label: "Share that were somebody you could actually help",
          hint: "Not the wrong numbers, not the vendors, not the person who wanted the office next door.",
          min: 10,
          max: 100,
          step: 5,
          initial: 50,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "client",
          label: "Share of those that eventually became a client",
          hint: "Your own rate on a stranger who found you cold, which is usually lower than your rate on a referral.",
          min: 1,
          /** Capped at 25 rather than 40. A quarter of cold callers becoming clients is already
           * at the top of anything anybody in this business would claim, and a slider that can
           * be dragged to 40 invites a reader to build a number out of the top of every range at
           * once. */
          max: 25,
          step: 1,
          initial: 5,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "commission",
          label: "Your average commission on one of those",
          hint: "Your side of one closing, after the split, before tax.",
          min: 2000,
          max: 30000,
          step: 500,
          initial: 9000,
          format: "money",
          width: "w-[8rem]",
        },
      ],
      chain: [
        { label: "Calls from the profile", by: { from: "input", id: "calls" }, format: "count", unit: "a month" },
        { label: "Over a year", by: { from: "rate", value: 12, display: "12 months" }, format: "count", unit: "calls a year" },
        { label: "People you could help", by: { from: "input", id: "real" }, format: "count", unit: "conversations" },
        { label: "Who became a client", by: { from: "input", id: "client" }, format: "count", unit: "closings" },
        { label: "At your commission", by: { from: "input", id: "commission" }, format: "money", unit: "a year" },
      ],
      headline: 4,
      resultLabel: "What the free listing is already producing",
      note: "There is no row anywhere in this ladder for what a better position would add, and its absence is the honest part. Google's own page says local results are mainly based on relevance, distance and popularity, gives no weights, and states plainly that there is no way to request or pay for a better local ranking. Nobody outside Google has published a measurement of the map pack that states its sample and its method in the way this article demands of a number, so multiplying your calls by a ranking improvement would be arithmetic with a made-up number in the middle of it. What this does instead is measure the thing that is already happening, in the numbers on your own screen, so that whatever comes next has something honest to be compared against.",
      action: { label: "See how it is built", href: "/services/local-seo" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "A local ranking is not a position on a page. It is a standing answer, given on your behalf, in a moment you will never see, to a decision you were not invited to.",
    },
    "paid-search": {
      /** Dark for the reason given on `trust-bias` above. Rendered and read at 1440 and 390
       * before it was kept. */
      kind: "statbars",
      band: "dark",
      label: "The experiment",
      ...PAID_SEARCH,
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The two screens",
      text: "Send us the name of your business and the town you want to be found in, and we will send back what your profile looks like from outside it: the categories it claims, what is missing, and where it sits for the three searches your market actually types.",
      reassure: "It is a short reply from a person, it costs nothing, and it is useful whether you buy anything or not.",
      action: { label: "Ask for the outside view", href: "/connect" },
      ariaLabel: "Ask for an outside view of your profile",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-02.jpg",
      // WRITTEN FROM THE CROP, not from the file. Round B removed "with two terracotta pots of
      // red geraniums either side of the step" because the 21:9 crop cuts the bottom of the frame
      // and takes both pots with it.
      //
      // ROUND I PUT THEM BACK, and this is the first case in the cohort where Round F's rule
      // reverses an earlier correction rather than adding to it. The Plate ships 16:9 at 390 and
      // 21:9 at 1440, and the 16:9 crop is the taller of the two: both pots are plainly inside
      // the frame a phone renders. Round B was right about the laptop and wrong about the phone,
      // and the phone crop is the one the alt has to cover. The octagonal window over the door
      // and the brass lantern beside it were missing at either crop.
      alt: "The front of a white-painted stone house with black shutters, an octagonal window over a dark panelled front door and a brass lantern beside it, a mass of white flowering shrub arching over the entrance, two terracotta pots of red flowers standing either side of the door, and a white fretwork fence above clipped box hedges across the foreground",
      caption:
        "This is what a Business Profile is, and it is worth being unromantic about it. Somebody stands here for a moment, reads the name, the hours and the last few things other people said, and decides whether to knock. Everything in this article is about that doorstep rather than about your website.",
      credit: "Photograph by Wonderlane, CC BY 2.0.",
      ariaLabel: "The front door somebody arrives at",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 and 7: on light, the cost section, this
       * grid and the FAQ run as one long pale band. Flipping it breaks the run in half. */
      band: "dark",
      eyebrow: "Three ways the work is wasted",
      heading: "None of them are the ranking.",
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
      text: "Somewhere in your market this week, three names came up on a phone and a stranger picked one of them. There is no notification for that, no line in the CRM, and no way to know it happened. It will happen again tomorrow, and the only part of it you can do anything about is the part that is sitting unfinished on a screen you have not opened this year.",
      actions: [
        { label: "See it on the AI page", href: "/ai#localseo", variant: "light" },
        { label: "How it is built", href: "/services/local-seo", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because the cost tracks two things that are yours rather than ours: how much of the profile and the surrounding record is wrong today, and how many places you want to be genuinely present in rather than merely listed. The AI audit is an hour, done with you, and it ends with the profile finished and the report screen open rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "the-search-that-already-happened-and-why-you-cannot-see-it": "The search",
    "what-google-actually-publishes-about-this": "What Google says",
    "the-input-you-cannot-do-anything-about": "Distance",
    "why-the-top-of-a-very-short-list-is-worth-more-than-it-should-be": "The top slot",
    "what-prominence-is-made-of-and-what-it-is-not": "Prominence",
    "the-profile-rules-that-decide-whether-you-can-have-one-at-all": "The rules",
    "what-local-seo-actually-does-week-to-week": "What it does",
    "what-renting-the-same-attention-costs": "Renting it",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-find-out-where-you-actually-stand-in-ten-minutes": "How to check",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
