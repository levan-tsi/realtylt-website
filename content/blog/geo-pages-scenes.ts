/** Scene copy for the area (GEO) landing pages flagship post (topic 9).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Ninth topic on the flagship template and the EIGHTH IN A ROW that adds no component of
 * its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6, 7 and 8. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/geo-landing-pages.ts. Nothing
 * here claims a capability that page does not claim.
 *
 * THE DELIBERATE DISTANCE FROM ITS NEAREST SIBLING. Topic 8, local SEO, is the closest article in
 * the cohort by subject and the two were written in the same session precisely so the seam could
 * be drawn on purpose rather than discovered later:
 *
 *   TOPIC 8 is about being ranked as a BUSINESS on the local pack, where Google publishes three
 *   inputs and one of them is how far the searcher is standing from your front door.
 *
 *   THIS post starts where that one stops. A page is the only surface where distance is not one
 *   of the inputs, which is exactly why building one per area is the oldest tactic in local
 *   marketing and exactly why Google's spam policy names it twice. The article is about the line
 *   between a page that is genuinely about somewhere and a page that is a template with the town
 *   swapped, and about the second thing nobody in this category mentions, which is that an area
 *   page is an advertisement about a community and there is a regulation about that.
 *
 * Not one source, chart, statute or number is shared with topic 8, and the fair housing treatment
 * is deliberately built on 24 CFR part 100 rather than on the 42 U.S.C. 3604 material the lead
 * qualification post already rests on. That post is about who gets routed to a person; this one
 * is about what an advertisement may say and where it may be placed. Different provisions,
 * different sentences, different argument.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. Policy, measurement,
 * regulation, which is the order the article itself runs in. */
export const IN_SHORT: string[] = [
  "Google's spam policies name this tactic twice. Doorway abuse covers pages targeted at specific regions or cities that funnel users to one page, and scaled content abuse covers using generative AI tools to generate many pages without adding value for users. Neither entry says a page per area is forbidden. Both say what makes one worthless.",
  "A page that repeats itself is machine readable. In a sample of 17,168 web pages classified by hand, 13.8% were judged spam overall, and among the pages that compressed to a quarter of their size or better, 70% were.",
  "An area page is an advertisement about a community, and that is regulated separately from anything Google does. The fair housing rules name selecting locations for advertising that deny parts of the market information about housing opportunities, and discouraging somebody by exaggerating drawbacks or failing to inform them of a neighbourhood's desirable features. Both prohibitions hang on the same clause: because of race, colour, religion, sex, handicap, familial status or national origin.",
];

/** SCENE copy — the two policy names.
 *
 * Read in the primary: developers.google.com/search/docs/essentials/spam-policies. Quoted as
 * written:
 *
 *   "Doorway abuse is when sites or pages are created to rank for specific, similar search
 *    queries. They lead users to intermediate pages that are not as useful as the final
 *    destination."
 *   Examples include "Having multiple domain names or pages targeted at specific regions or
 *    cities that funnel users to one page" and "Creating substantially similar pages that are
 *    closer to search results than a clearly defined, browseable hierarchy".
 *   "Scaled content abuse is when many pages are generated for the primary purpose of
 *    manipulating search rankings and not helping users."
 *   Examples include "Using generative AI tools or other similar tools to generate many pages
 *    without adding value for users" and "Creating many pages where the content makes little or
 *    no sense to a reader but contains search keywords".
 *
 * THE WORDING HAS CHANGED and it is worth recording. The policy used to be headed "doorway
 * pages"; the current text calls it doorway abuse, and scaled content abuse is the entry that
 * did not exist when most advice about location pages was written.
 *
 * THE CARDS DISTIL, THEY DO NOT QUOTE, and the first draft did the opposite. It repeated both
 * definitions and both example lists word for word, which the prose section immediately above it
 * also quotes, so a reader met the same two sentences twice inside one screen. A scene REPLACES
 * the prose it stages. The body carries the citation; this carries the four questions the two
 * entries actually put to a buyer, and the fourth card is the paragraph that used to close that
 * body section and has been deleted from it. */
export const TWO_NAMES: GridItem[] = [
  {
    lead: "Where does the page send them?",
    body: "The doorway entry turns on the handover rather than on the writing. If an area page is a landing strip whose job is to move somebody along to a general enquiry form or to one master page, the reader got an intermediate step instead of the thing they searched for. If the page answers the question on its own and somebody could stop there satisfied, it is not doing what that entry describes.",
  },
  {
    lead: "What is on it at that number?",
    body: "The other entry is about volume without substance, and the volume by itself is not the part being named. Twenty pages each carrying a closing, a street and a real answer are twenty pages. Twenty pages carrying the same four paragraphs are one page with twenty addresses, and changing the adjectives does not change which of those you have.",
  },
  {
    lead: "Who read it before it went live?",
    body: "The line runs through what was added between the generating and the publishing, which makes it a question about your process rather than about your software. What gets added, in practice, is a person who knows the place reading the page and changing it. If nobody in the chain has been there, nothing was added and the entry is describing you.",
  },
  {
    lead: "And nobody is telling you not to do this.",
    body: "Nothing in the policy says a business may not have one page for each place it works. Both entries describe pages that hand the reader on or say nothing, which is a judgement about quality rather than about structure. The structure is fine. The usual execution is the thing with a name.",
  },
];

/** SCENE copy — the self-assessment questions that bite here.
 *
 * Read in the primary: developers.google.com/search/docs/fundamentals/creating-helpful-content,
 * "Creating Helpful, Reliable, People-First Content". Quoted as written:
 *
 *   "Does your content clearly demonstrate first-hand expertise and a depth of knowledge (for
 *    example, expertise that comes from having actually used a product or service, or visiting a
 *    place)?"
 *   "Are you producing lots of content on many different topics in hopes that some of it might
 *    perform well in search results?"
 *   "Are you using extensive automation to produce content on many topics?"
 *   "Is the content mass-produced by or outsourced to a large number of creators, or spread
 *    across a large network of sites, so that individual pages or sites don't get as much
 *    attention or care?"
 *   "Are you writing to a particular word count because you've heard or read that Google has a
 *    preferred word count? (No, we don't.)"
 *   "Does the content provide insightful analysis or interesting information that is beyond the
 *    obvious?"
 *
 * THE FIRST ONE IS THE WHOLE ARTICLE IN A PARENTHESIS. Google's own example of first-hand
 * expertise is having visited a place. There is no better test of an area page anywhere, and it
 * is sitting inside a bracket in a document everybody in this category claims to have read. */
export const THE_TEST: GridItem[] = [
  {
    lead: "Have you been there.",
    body: "Google's own list asks whether the content demonstrates first-hand expertise, and its example of what that means is expertise that comes from having actually visited a place. Read that beside a page about a town you have never worked in. There is no writing technique that produces it and no model that can fake it, because the thing being asked for is a fact about you.",
  },
  {
    lead: "Are you making a lot of pages and hoping.",
    body: "Two of the warning-sign questions are whether you are producing lots of content on many topics in the hope some of it performs, and whether you are using extensive automation to produce content on many topics. Answering yes to either is the document's own description of search-engine-first content, and the fix it suggests is not better writing. It is fewer pages.",
  },
  {
    lead: "Are you writing to a length.",
    body: "One of the warning signs on the list is writing to a word count, and Google answers it in the same breath: it has no preferred one. That matters more here than anywhere else, because a target length is the only thing that can make a page about a town you know inside out and a page about a town you have never visited come out the same size.",
  },
];

/** SCENE copy — redundancy is measurable. Cited data graphic ONE.
 *
 * Alexandros Ntoulas, Marc Najork, Mark Manasse and Dennis Fetterly, "Detecting Spam Web Pages
 * through Content Analysis", WWW 2006, pages 83-92, Microsoft Research. Read in the conference
 * proceedings PDF, not in a summary of it.
 *
 * Method, from the paper: a crawl of 105 million pages, of which about 54% are English as judged
 * by MSN Search's own parser. "We drew a uniform random sample, henceforth named DS, of 17,168
 * pages out of the English-written portion of the 105 million pages. We manually inspected every
 * sampled page and labeled it as spam or not. In DS, 2,364 pages (13.8%) were labeled as spam,
 * while 14,804 (86.2%) were labeled as non-spam."
 *
 * The compressibility figure, quoted from section 4.6: "We measure the redundancy of web pages by
 * the compression ratio, the size of the uncompressed page divided by the size of the compressed
 * page. We used GZIP to compress pages... in aggregate, 70% of all sampled pages with a
 * compression ratio of at least 4.0 were judged to be spam."
 *
 * WHAT THIS DOES NOT SAY, and the note says it out loud: the paper measures repetition INSIDE one
 * page. A set of near-identical area pages is repetition ACROSS pages, which is a different
 * measurement and nobody has published it. The finding transfers as an intuition about what a
 * machine can cheaply notice, not as a number about location pages. Stating that plainly is the
 * difference between citing a paper and borrowing its authority. */
export const REDUNDANCY = {
  eyebrow: "The evidence",
  caption: "How often a page that repeats itself turned out to be spam",
  bars: [
    { label: "Every page in the hand-classified sample", value: 13.8, display: "13.8%" },
    { label: "Pages that compress to a quarter or better", value: 70, display: "70%" },
  ],
  max: 100,
  lit: 1,
  basis:
    "The share of pages a person judged to be spam. The sample is 17,168 English pages drawn uniformly at random from a 105 million page crawl and inspected one at a time; 2,364 of them were labelled spam. The second bar is the subset whose compression ratio was at least four, which is a machine's way of saying the page says the same thing several times.",
  sourceText:
    "Alexandros Ntoulas (UCLA), Marc Najork, Mark Manasse and Dennis Fetterly (Microsoft Research), Detecting Spam Web Pages through Content Analysis, WWW 2006, pages 83-92.",
  sourceHref:
    "https://www.ambuehler.ethz.ch/CDstore/www2006/devel-www2006.ecs.soton.ac.uk/programme/files/pdf/3052.pdf",
  note: "This is the web of 2005 and a search engine that no longer exists under that name, and spam here means what four researchers judged it to be. Two limits matter more than the age. The paper measures repetition inside a single page, and a set of near-identical town pages is repetition across pages, which is a different thing that nobody has published a figure for. And an entirely honest page with a large navigation, a footer and a repeated call to action also compresses well, which is why the authors treat compressibility as one heuristic among the ten they test rather than as a rule. What it is worth carrying is the cheapness of the observation: sameness is the easiest quality in the world for a machine to measure.",
};

/** SCENE copy — the complaints. Cited data graphic TWO.
 *
 * National Fair Housing Alliance, 2025 Fair Housing Trends Report, reporting complaint data for
 * calendar and fiscal year 2024. Read in the report PDF.
 *
 * Method and figures, quoted from the report: "There were 32,321 fair housing complaints received
 * by FHOs, HUD, FHAP agencies, and the DOJ in 2024, a decrease of 1,829 (5.36 percent) complaints
 * compared to the 34,150 complaints received in 2023. Eighty-two (82) private, non-profit fair
 * housing organizations (FHOs) processed 74.12 percent of complaints, compared to 20.90 percent
 * by FHAP agencies, 4.85 percent by HUD, and 0.14 percent by the DOJ."
 *
 * The transaction-type table gives: rental 27,007 (83.56%), harassment 815 (2.52%), sales 659
 * (2.04%), HOA/condo 203 (0.63%), advertising 108 (0.33%), appraisal 39 (0.12%), lending 220,
 * insurance 27, other 3,255. The report's own sentence on the advertising figure: "Other
 * housing-related transactions included 108 complaints of discriminatory advertising by housing
 * providers and 203 complaints of discrimination by homeowners or condominium associations."
 *
 * RENTAL IS DELIBERATELY OFF THE CHART and the basis line says so. It is 83.56% of the total and
 * plotting it would compress every other bar to a hairline, which would hide the only comparison
 * this scene exists to make. Leaving a category out of a chart is a decision that has to be
 * disclosed on the chart, which is what the basis line is for.
 *
 * THE POINT OF THIS SCENE IS THE SIZE OF THE BAR, NOT ITS OPPOSITE. Advertising is the smallest
 * named category on the list. That is the argument: this is not what people complain about, which
 * is exactly why nobody writing twenty town pages has ever thought about it, and the regulation
 * applies at the same strength either way. */
export const COMPLAINTS = {
  eyebrow: "The evidence",
  /** THE EXCLUSION IS IN THE TITLE, not only in the basis line. Found by looking: with rental
   * off the chart, the 815 harassment bar fills its track, and a full-width bar reads as most of
   * everything. It is not: rental is 27,007 of the 32,321. A reader who takes only the chart
   * title away has to take the omission with it. */
  caption: "Housing discrimination complaints in 2024, by transaction, with rental left off",
  bars: [
    { label: "Harassment", value: 815, display: "815" },
    { label: "Real estate sales", value: 659, display: "659" },
    { label: "Homeowner or condominium associations", value: 203, display: "203" },
    { label: "Discriminatory advertising", value: 108, display: "108" },
    { label: "Appraisal", value: 39, display: "39" },
  ],
  lit: 3,
  basis:
    "Complaints received in 2024 by private fair housing organisations, HUD, state and local fair housing assistance agencies and the Department of Justice, counted by the kind of transaction they concerned. The total across all categories is 32,321. Rental accounts for 27,007 of those and is left off this chart on purpose, because plotting it would draw every bar above as a hairline.",
  sourceText:
    "National Fair Housing Alliance, 2025 Fair Housing Trends Report, complaint data for 2024.",
  sourceHref:
    "https://nationalfairhousing.org/wp-content/uploads/2025/11/2025-NFHA-Fair-Housing-Trends-Report.pdf",
  note: "These are complaints received, not findings of discrimination, and the difference is the whole distance between an allegation and a case. The compiler is a membership organisation of the fair housing groups that handle most of them, which it states in the report: 82 private organisations processed 74% of the 2024 total, so the counts describe who was collecting as much as what happened, and fewer organisations reported than the year before. An advertising complaint is not necessarily about a web page. The reason this chart is here is the fourth bar being small: advertising is the least complained-about category on the list, which is exactly why it is the one nobody building twenty area pages has thought about.",
};

/** SCENE copy — the three ways a set of area pages is wasted.
 *
 * Deliberately not any sibling's three, and not a restatement of the limits section: the limits
 * are what the service cannot do, and these are the ways a competent build produces nothing. */
export const WASTED: GridItem[] = [
  {
    lead: "They are built for the towns you wish you worked in.",
    body: "The list of areas nearly always starts as a list of ambitions, and the pages for the places you have never worked are the ones with nothing on them, which are the ones that read as filler, which are the ones that make the whole set look like a template. The pages you can actually fill are usually the ones you thought were too obvious to bother with.",
  },
  {
    lead: "They are written to a length instead of to a question.",
    body: "Somebody decides the pages should be six hundred words and the writing becomes the job of reaching six hundred words. Google's own list of warning signs asks whether you are writing to a particular word count, and answers in a bracket that it has no preferred one. A page that answers its question in two hundred words and stops is a better page.",
  },
  {
    lead: "Nobody ever goes back to them.",
    body: "The proof on an area page has a date on it whether or not the date is printed. The closing you cite, the street you name, the price you mention and the school you describe all age, and a page whose most recent fact is four years old is telling every reader exactly how long it has been since you worked there.",
  },
];

/** SCENE copy — how one area page actually comes to exist.
 *
 * The service page's own `figure` flow, drawn as hops, plus the two hops that page does not name:
 * the human read before publication, and the fact that the record of the lead stays yours.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. 33 characters lost a letter on the reactivation post;
 * "One page, one place" is 19. */
export const PAGE_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The area", connects: "One page, one place" },
  { label: "The facts", connects: "Work you actually did" },
  { label: "The draft", connects: "Written fast, read slowly" },
  { label: "The page", connects: "A real URL in the sitemap" },
  { label: "The answer", connects: "Written to be quoted" },
  { label: "The lead", connects: "Your form, your record" },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. */
export const GEO_PAGES_FLAGSHIP: FlagshipContent = {
  /** THE SMALLEST HERO NUMBER IN THE COHORT, and it is a measurement of a difference rather than
   * a count of anything. The eight before it were 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12
   * reviews, 9 days and 3 results. One word is what changes between page nine and page ten of a
   * templated set, and it is the entire argument of the article in a single numeral. */
  hero: {
    moment: "1",
    suffix: "word",
    photo: "/images/counties/rockland.jpg",
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
    "two-names": {
      kind: "grid",
      band: "dark",
      eyebrow: "What the policy actually names",
      heading: "Two entries, and only one of them is the one everybody quotes.",
      columns: 2,
      glow: true,
      items: TWO_NAMES,
      label: "The policy",
    },
    plate: {
      kind: "plate",
      /** DARK, and both charts on this post stay LIGHT, which is the opposite arrangement from
       * topic 8. The two posts are each other's nearest sibling by subject, so the rhythm was
       * planned as a pair: topic 8 carries its dark bands on its charts, this one carries them
       * on its plates and grids. Same primitives, different page. */
      band: "dark",
      src: "/images/listings/house-06.jpg",
      // ROUND I: the bunting is red, white and blue FAN bunting, the semicircular kind, hung in a
      // row along the balcony rail. "Small pennant bunting" is a different object and the colours
      // are the whole reason the caption works. The warm orange in the windows is light rather
      // than curtains, so the alt no longer says which.
      alt: "A green and teal painted Queen Anne Victorian with a pointed turret and tall arched windows in red painted surrounds glowing warm orange, a first-floor balcony hung with a row of red, white and blue fan bunting, a tall pink banner beside the entrance, standing against a bank of dark conifers",
      caption:
        "Somebody in this town knows why there is bunting on that balcony this week. That is the whole difference between a page about a place and a page with a place name in it, and it is not a writing problem. It is a question of whether you have ever been there on a Saturday.",
      credit: "Photograph by Kathleen Tyler Conklin, CC BY 2.0.",
      ariaLabel: "The house that is somewhere in particular",
    },
    "the-test": {
      kind: "grid",
      band: "dark",
      eyebrow: "Google's own questions",
      heading: "Three of them decide whether your area pages are worth publishing.",
      columns: 3,
      items: THE_TEST,
      label: "The questions",
    },
    redundancy: {
      kind: "statbars",
      band: "light",
      label: "Sameness",
      ...REDUNDANCY,
    },
    "page-path": {
      kind: "diagram",
      band: "dark",
      label: "The page",
      eyebrow: "The system",
      heading: "From a place you have worked to a lead that stays yours.",
      lede: "Six hops, and the third one is where every cheap version of this service stops. A draft written in ninety seconds is not the problem. A draft nobody read before it went live is a page nobody read at all, which is the condition the spam policy is actually describing.",
      steps: PAGE_PATH,
      altPrefix: "The path from one area you have worked in to a published page and a lead on your own site",
    },
    "geo-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many of these pages can you honestly write?",
      ariaLabel: "How many area pages you have something true to say on",
      inputs: [
        {
          kind: "range",
          id: "areas",
          label: "Areas you would want a page for",
          hint: "Every town, village and hamlet on the list, including the ambitious ones. This is the number that comes out of the first meeting.",
          min: 1,
          max: 40,
          step: 1,
          /** 15 rather than 14 so the default lands on a whole page. Found by driving the
           * sliders: 14 areas at 40% renders "5.6 pages" in the headline, and six tenths of a
           * page is not a thing. The note says what a fractional answer means, because dragging
           * will still produce one. */
          initial: 15,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "worked",
          label: "Share where you have actually done the work",
          hint: "A closing, a listing, a rental, a client you still speak to. Somewhere you could name a street without checking a map.",
          min: 5,
          max: 100,
          step: 5,
          initial: 40,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "hours",
          label: "Hours to write one page that is genuinely about that place",
          hint: "Including finding the proof, writing the answers and reading it back as somebody who lives there.",
          min: 1,
          max: 12,
          step: 1,
          initial: 4,
          format: "hours",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "Areas on the list", by: { from: "input", id: "areas" }, format: "count", unit: "areas" },
        { label: "Where you have something true to say", by: { from: "input", id: "worked" }, format: "count", unit: "pages" },
        { label: "At your writing time", by: { from: "input", id: "hours" }, format: "hours", unit: "hours of work" },
      ],
      headline: 1,
      resultLabel: "Pages that would actually be about somewhere",
      note: "When the middle row lands between two whole numbers, read it as between two whole numbers rather than as a fraction of a page: five and a half means five you are sure of and one you are arguing with yourself about. This is the shortest calculator on this website and there is a reason for the length: there are only three numbers in this subject that anybody can honestly supply, and all three of them are yours. There is no row for what a page is worth, and there was never going to be one. Nobody publishes the search volume for a service in your particular town with a stated method, Google publishes no model of how much traffic a page receives, and the only figures circulating in this category come from tools that estimate them and do not say how. The number this does produce is the one that decides whether the whole exercise is a marketing asset or a folder of filler, and it is almost always smaller than the number in the first meeting.",
      action: { label: "See how it is built", href: "/services/geo-landing-pages" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "The question is never how many pages you can produce. It is how many places you can say something true about, and that number was fixed before anybody opened a laptop.",
    },
    complaints: {
      kind: "statbars",
      band: "light",
      label: "The complaints",
      ...COMPLAINTS,
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest list",
      text: "Send us the list of areas you want pages for and we will send back which of them we think you can fill, based on what is already public about where you have worked, and what each of the others would need before it was worth publishing.",
      reassure: "It is a short reply from a person, it costs nothing, and a shorter list is a perfectly good answer.",
      action: { label: "Ask which ones are real", href: "/connect" },
      ariaLabel: "Ask which of your areas can carry a page",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-04.jpg",
      // WRITTEN FROM THE CROP. The first version had it "standing on a mown green lawn" with a
      // utility pole at the left edge, both of which are in the photograph and neither of which
      // survives the plate's 21:9 crop: it cuts at the porch rail.
      alt: "A large white Victorian house with a conical turret roof, two brick chimneys and a wraparound porch carried on turned posts with scrollwork brackets, photographed from below against a deep blue sky, with a tall dark cypress at the right edge",
      caption:
        "One page, about one place, with the name of a street on it and something on it that only somebody who has stood here would write. That is the entire product. Everything else in this article is about the pages you should not publish in order to have this one.",
      credit: "Photograph by Jan Tik, CC BY 2.0.",
      ariaLabel: "The one page worth publishing",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6, 7 and 8: on light, the cost section, this
       * grid and the FAQ run as one long pale band. Flipping it breaks the run. */
      band: "dark",
      eyebrow: "Three ways a good build is wasted",
      heading: "None of them are the search engine.",
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
      text: "Open the two pages you are least sure about and read them out loud, one after the other, to somebody who lives in one of those towns. You will know inside a paragraph. The only thing a set of area pages can be built out of is the work you have already done, and the honest version of this project starts by finding out how much of that there is.",
      actions: [
        { label: "See it on the AI page", href: "/ai#geopages", variant: "light" },
        { label: "How it is built", href: "/services/geo-landing-pages", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because the cost tracks the one thing that is yours rather than ours: how many areas you can genuinely fill, and how much of the material for them has to be gathered from you rather than written. The AI audit is an hour, done with you, and it ends with an honest list of areas rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "why-a-page-and-not-a-profile": "Why a page",
    "what-googles-spam-policy-actually-names": "The policy",
    "the-example-that-is-about-the-thing-we-sell": "About us",
    "what-separates-a-real-area-page-from-a-doorway": "The line",
    "repetition-is-measurable-and-somebody-measured-it": "Sameness",
    "what-actually-goes-on-a-page-that-is-about-somewhere": "What goes on it",
    "the-part-that-is-regulated-and-it-is-not-the-search-engine": "The regulation",
    "what-an-area-page-may-and-may-not-say": "May and may not",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-test-whether-a-page-is-about-anywhere-in-twenty-minutes": "How to test one",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
