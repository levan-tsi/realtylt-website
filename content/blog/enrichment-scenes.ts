/** Scene copy for the data enrichment flagship post (topic 15).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Fifteenth topic on the flagship template and the FOURTEENTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 14. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/data-enrichment.ts. Nothing
 * here claims a capability that page does not claim.
 *
 * THE DELIBERATE DISTANCE FROM THREE SIBLINGS, ALL READ IN FULL BEFORE A WORD WAS WRITTEN.
 * This is the most dangerous neighbourhood in the whole cohort, because the next article along
 * uses the same vendors and the same technology.
 *
 *   TOPIC 12, skip tracing, owns THE ACQUISITION and it owns the law: the Driver's Privacy
 *   Protection Act, the Fair Credit Reporting Act, the permitted-purpose list, the $2,500 floor
 *   in 18 U.S.C. 2724, the do-not-call registry. It is about getting contact information for
 *   somebody who never gave it to you. NONE OF THAT IS RE-ARGUED HERE. This article hands the
 *   reader there by name, in one paragraph and one FAQ, exactly as topic 12 hands the consent
 *   question to topic 3.
 *
 *   TOPIC 10, two-way CRM sync, owns MATCHING BETWEEN TWO SYSTEMS YOU OWN: whether two rows are
 *   the same woman, the published three-outcome decision rule, the clerical review queue, the
 *   conflict rule. Both of those systems are yours and you can look inside both.
 *
 *   TOPIC 3, database reactivation, owns THE OLD LIST and whether the permission has expired.
 *
 *   THIS post is about a claim that arrives from OUTSIDE about somebody already in your
 *   database: what an appended value actually asserts, how old it is, whether it is an
 *   observation or an inference, what happens when two sources disagree, and what it replaced.
 *   The spine is decay, provenance and the overwrite, and none of the three neighbours touches
 *   any of them.
 *
 * Nothing on this website has previously mentioned data brokers, derived data, the CCPA right
 * to correct, the SHIELD Act or employee tenure. Checked by grep across every post body before
 * this file was written.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. What the value is, what
 * nobody publishes about it, and the failure that is not the one people brace for. */
export const IN_SHORT: string[] = [
  "An appended field is somebody else's assertion about a person, and it arrives without the two things that would let you weigh it: when it was true, and who said so. The Federal Trade Commission put compulsory orders to nine of these companies and reported that most of their data comes from other companies like them rather than from an original source.",
  "There is no honest published rate for how fast contact data goes stale. We followed the circulating figures rather than assuming where they came from, and they end at a press release with a distribution disclaimer on it, at vendor blog posts, and at an aggregator citing a benchmark whose original is not linked. On the pages we opened, the same claim is quoted at thirty percent, at twenty two and a half, at twenty to thirty, and at up to seventy for email addresses.",
  "And the expensive failure is not the record that comes back empty. It is the field you already knew, quietly replaced by a value you cannot check, in a row that does not record what was there before.",
];

/** SCENE copy — what this is, by what it is not.
 *
 * Three near topics, and this article's own territory stated by contrast. The cards do NOT
 * summarise the other articles: each names the question that one answers and then says which
 * question is left over. The first card is the important one, because topic 12 is the article
 * a reader is most likely to have arrived from. */
export const NOT_THE_NEIGHBOURS: GridItem[] = [
  {
    lead: "Not the trace",
    body: "Starting from a property and finding contact details for an owner who has never spoken to you is a different act with two federal statutes attached to it, and it has its own long article on this site. That question is about acquiring something. This one starts from a person who is already in your database, usually because they came to you, and asks what you are entitled to believe about the row you now hold.",
  },
  {
    lead: "Not the duplicate",
    body: "Deciding whether two records in your own systems describe one person is a question you can answer, because you can open both. There is a published model for it, and it has a third outcome worth knowing about. Here the other record is inside a company you have no access to, and you cannot see how it decided anything.",
  },
  {
    lead: "Not the old list",
    body: "Whether you may still contact somebody who went quiet three years ago is a question about permission, and permission has dates in it. This article assumes you are allowed to make the call. It is about whether the number you would dial is the one that reaches her, and about what happened to the number that used to be in that field.",
  },
];

/** SCENE copy — what an appended value does not tell you.
 *
 * Four properties, deliberately framed as absences rather than as risks. Every one of them is a
 * question a reader can put to a provider in one sentence, which is the point: this is a
 * checklist disguised as an argument. */
export const WHAT_A_FIELD_ASSERTS: GridItem[] = [
  {
    lead: "It does not say when",
    body: "A phone number in an enrichment response is the best answer in somebody's file on the day you asked, and the file does not say when it was assembled. Two numbers that look identical in your CRM can be a fact confirmed last month and a fact that was true in a different decade, and nothing in the row distinguishes them.",
  },
  {
    lead: "It does not say who",
    body: "The name on your invoice is the company you bought from, and that company mostly bought it as well. So the truthful answer to where a value came from is the last name in a chain rather than the name of whoever first wrote it down, and nobody publishes the chain. That is not a criticism of any particular supplier. It is the shape of the market, and a federal regulator has said so on the record.",
  },
  {
    lead: "It does not say observed or inferred",
    body: "Some of what sits in these files was written down by somebody who saw it happen. Some of it was worked out from other things, by a company that has never met the person it describes. Both come back through the same interface in the same shape, so a conclusion that has been rounded into a value is indistinguishable from a measurement by the time it reaches your CRM.",
  },
  {
    lead: "It does not say what it replaced",
    body: "This is the one that costs money and it is entirely under your control. If the pass wrote into a field that already held something, the row should say so. Whether yours does is a thing you can check this afternoon, and the answer decides whether a bad pass is reversible. Where it does not, the old value is simply gone, nobody chose to discard it, and the one person who could have confirmed it was right is the client whose number you no longer have.",
  },
];

/** SCENE copy — where the data comes from. Cited data graphic ONE.
 *
 * Federal Trade Commission, "Data Brokers: A Call for Transparency and Accountability", May
 * 2014. Read in the Commission's own PDF with pdftotext.
 *
 * THE METHOD, quoted, and it is the reason this twelve year old report is still the primary
 * document on the subject: "in December 2012, the Commission initiated a study of data broker
 * practices. It issued identical Orders to File Special Reports ('Orders') under section 6(b) of
 * the Federal Trade Commission Act to nine data brokers seeking information about their data
 * collection and use practices." The nine are named in the report. Compulsory process, named
 * respondents, a stated scope of "practices starting January 1, 2010".
 *
 * THE THREE BARS, each with the same denominator of nine, quoted as written:
 *   "All but one of the data brokers in this study purchase information about individuals from
 *   wide-ranging commercial sources."  -> 8
 *   "Seven of the nine data brokers in the Commission's study provide data to each other", and
 *   in the body, "seven of the nine data brokers buy from or sell information to each other".
 *   -> 7
 *   "All but three of the nine data brokers obtain information directly from federal government
 *   sources."  -> 6
 *
 * A COUNT OF NINE IS THE AXIS, because these are counts out of a known, tiny population rather
 * than shares of anything. Setting max to 9 is what stops the 8 bar reading as "almost all
 * data brokers" when what it means is "eight of the nine companies the FTC ordered".
 *
 * WHY THE MIDDLE BAR IS LIT: it is the one that breaks provenance. A company buying from an
 * original source can tell you where a value came from. A ring of companies buying from each
 * other cannot, and the report says so in as many words. */
export const BROKER_SOURCES = {
  eyebrow: "The evidence",
  caption: "Where nine data brokers got their data, under compulsory FTC orders",
  bars: [
    { label: "Purchase information about individuals from commercial sources", value: 8, display: "8 of 9" },
    { label: "Buy data from, or sell it to, each other", value: 7, display: "7 of 9" },
    { label: "Obtain information directly from federal government sources", value: 6, display: "6 of 9" },
  ],
  max: 9,
  lit: 1,
  basis:
    "Counts out of the nine named companies the Federal Trade Commission ordered to file special reports in December 2012 under section 6(b) of the FTC Act, covering their practices from January 2010. The three rows overlap: most of the nine do all three. The axis is nine because that is the whole population studied, not a sample of the industry.",
  sourceText:
    "Federal Trade Commission, Data Brokers: A Call for Transparency and Accountability, May 2014.",
  sourceHref:
    "https://www.ftc.gov/system/files/documents/reports/data-brokers-call-transparency-accountability-report-federal-trade-commission-may-2014/140527databrokerreport.pdf",
  note: "This report is from 2014 and the industry has changed a great deal since, so do not read the bars as a description of whoever supplies your own enrichment today. Read the middle one as a structural fact, because that is what it is: when companies in a market mostly buy from each other, no single one of them can tell you where a value originally came from. The chart cannot show you the thing that follows from it, which is that the answer to \"where did this come from\" stops being a name and becomes a direction of travel. Nothing about that arrangement has become simpler in the years since.",
};

/** SCENE copy — the same file, three labels. Cited data graphic TWO.
 *
 * Same report, different finding, which is why it is a second chart rather than three more bars
 * on the first one. Quoted as written:
 *   "four of the five data brokers that sell marketing products allow consumers to opt out"  ->
 *   five of the nine sell marketing products.
 *   "Four of the data brokers studied sell risk mitigation products, which clients use to verify
 *   their customers' identities or detect fraud."  -> 4
 *   "Three of the data brokers studied provide 'people search' websites through which users can
 *   search for publicly available information about consumers."  -> 3
 *
 * The counts sum to more than nine because several of the companies sell in more than one
 * category, and the basis line says so rather than letting a reader do arithmetic that does not
 * work.
 *
 * WHY THE FIRST BAR IS LIT: a marketing product is the one an agent's enrichment pass is most
 * likely to be buying from, and it is the category the same report finds the weakest consumer
 * correction rights in. */
export const PRODUCT_LINES = {
  eyebrow: "The evidence",
  caption: "What the same nine companies sell the same underlying data as",
  bars: [
    { label: "Marketing products, for reaching people", value: 5, display: "5 of 9" },
    { label: "Risk products, for checking that people are who they say", value: 4, display: "4 of 9" },
    { label: "People search sites, for looking a person up", value: 3, display: "3 of 9" },
  ],
  max: 9,
  lit: 0,
  basis:
    "Counts out of the same nine companies, from the same report. They add up to more than nine because several of them sell in more than one category, which is the finding rather than an error: the same underlying records are packaged as a marketing list, as an identity check and as a public lookup page.",
  sourceText:
    "Federal Trade Commission, Data Brokers, May 2014, on the three product categories the nine sell.",
  sourceHref:
    "https://www.ftc.gov/system/files/documents/reports/data-brokers-call-transparency-accountability-report-federal-trade-commission-may-2014/140527databrokerreport.pdf",
  note: "The counts are from 2014 and the industry has changed since, so read them as a shape rather than as a market share, and note that the three overlap because several of the nine sell in more than one category. What the chart cannot draw is the part that matters, which is that nothing in the underlying records changes as they move between these three shelves. The same rows, the same fields, the same unknown ages, sold three times under three descriptions to three kinds of buyer, and the description is picked at the moment of sale rather than at the moment anybody wrote the data down.",
};

/** SCENE copy — decay is a property of the people. Cited data graphic THREE.
 *
 * U.S. Bureau of Labor Statistics, "Employee Tenure in 2024", USDL-24-1971, released 26
 * September 2024, Table 1. Read on the Bureau's own pages.
 *
 * The method, quoted: "The U.S. Department of Labor's Chief Evaluation Office sponsored the
 * January 2024 survey to collect information on employee tenure. Since 1996, these surveys have
 * been conducted biennially in January as a supplement to the Current Population Survey (CPS).
 * The CPS is a monthly sample survey of about 60,000 households." And the Bureau's own gloss on
 * what a median is, quoted because half of what is written about data decay depends on people
 * not knowing: median employee tenure is "the point at which half of all workers had more tenure
 * and half had less tenure".
 *
 * The headline for context, quoted: "The median number of years that wage and salary workers had
 * been with their current employer was 3.9 years in January 2024, down from 4.1 years in January
 * 2022 and the lowest since January 2002."
 *
 * Table 1, January 2024, total, by age: 25 to 34 years 2.7 · 35 to 44 years 4.6 · 45 to 54 years
 * 7.0 · 55 to 64 years 9.6.
 *
 * WHY THIS CHART IS IN AN ARTICLE ABOUT REAL ESTATE CONTACT RECORDS, stated in the note rather
 * than smuggled: it is the only decay measurement in this whole subject with a published method
 * and a named survey behind it, it is about employment rather than about a homeowner's mobile
 * number, and the absence of an equivalent measurement for the fields an agent's CRM actually
 * holds is itself the finding.
 *
 * NO AXIS MAXIMUM. These are counts of years rather than shares of a whole, and the smallest bar
 * is 28 percent of the largest, so it renders short rather than as a hairline. Checked on the
 * shipped chart at 1440 and at 390.
 *
 * WHY THE FIRST BAR IS LIT: it is the fastest one, and the point of the chart is that a single
 * decay rate cannot describe a population that contains both ends of it. */
export const TENURE = {
  eyebrow: "The evidence",
  caption: "How long people had been with their current employer, by age, January 2024",
  bars: [
    { label: "25 to 34 years old", value: 2.7, display: "2.7 years" },
    { label: "35 to 44 years old", value: 4.6, display: "4.6 years" },
    { label: "45 to 54 years old", value: 7.0, display: "7.0 years" },
    { label: "55 to 64 years old", value: 9.6, display: "9.6 years" },
  ],
  lit: 0,
  basis:
    "Median years of tenure with the current employer, from a supplement to the Current Population Survey, a monthly sample of about sixty thousand households. Median means the point at which half of all workers had more and half had less, so half of the youngest group had been in the job under two years and nine months.",
  sourceText: "U.S. Bureau of Labor Statistics, Employee Tenure in 2024, Table 1, released September 2024.",
  sourceHref: "https://www.bls.gov/news.release/tenure.t01.htm",
  note: "This is about employment, not about the mobile number of somebody who bought a house from you, and it is here for one reason: it is the only measurement in the whole of this subject that names its survey, its sample and its definition. Use it as an argument rather than as a number. Whatever underlies a field decides how fast that field goes wrong, and the rate is different for different people, so a single percentage covering everybody in your database is describing a population that does not exist. We went looking for an equivalent measurement for a personal mobile number, a personal email address or a homeowner's mailing address and did not find one with a stated method, which is worth holding next to the fact that every figure circulating about data decay is quoted as though somebody had done exactly that study.",
};

/** SCENE copy — the six hops from your record to your record.
 *
 * It is a loop on purpose, and the last hop is the one nobody draws: what the row says AFTER the
 * pass. The service page's flow has three steps, all on the left of this diagram.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing
 * is clipped by the container edge at 390px. 33 characters lost a letter on the reactivation
 * post; "What you hold now" is 17. */
export const ENRICH_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "Your record", connects: "What you hold now" },
  { label: "The query", connects: "What you send out" },
  { label: "The match", connects: "Their guess, unseen" },
  { label: "The claim", connects: "A value with an age" },
  { label: "The write", connects: "What it lands on" },
  { label: "The row", connects: "What it says after" },
];

/** SCENE copy — three ways a successful pass leaves you worse off.
 *
 * Deliberately not the limits section restated: limits are what the product cannot do, and these
 * are what a pass that worked exactly as specified still costs you. All three are about the
 * business rather than about the vendor. */
export const WASTED: GridItem[] = [
  {
    lead: "The database looks finished",
    body: "Before the pass, the gaps were visible and everybody handled the list accordingly. Afterwards every row is full, and nothing in the interface distinguishes a number a client typed in herself from a number a file suggested. The database now carries the confidence of its best row and the accuracy of its worst, and the only person who could tell the two apart has stopped being able to.",
  },
  {
    lead: "Nobody can undo it",
    body: "Six weeks later somebody notices a run of wrong numbers and wants to know which pass introduced them. If the write did not record the previous value, the date and the source, that question has no answer, and the only remaining option is to run another pass over the top of it and hope.",
  },
  {
    lead: "It is spent on people you will never call",
    body: "Enrichment is charged per record, and a database that has been collecting for years holds a great many rows nobody has any intention of calling. Running the whole thing is the default because it is one click, and it converts a budget into fullness rather than into conversations. The version worth buying is the one where somebody chose the rows first, and choosing them costs an hour.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Fourteen scenes, zero components, no film. */
export const DATA_ENRICHMENT_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings, $2,500, 0.3 percent and 3 business days.
   * This one is the number of places a single company told a federal regulator it gets contact
   * information from, and it is here because it is the answer to the only question that matters
   * about an appended field: who says so. */
  hero: {
    moment: "20",
    suffix: "sources",
    /** NOT either plate. A wall of torn paper is texture behind type rather than a subject, and
     * the two plates on this post are a painted sign and a manuscript page, so nothing is used
     * twice on one page. */
    photo: "/images/editorial/posters-peeled.jpg",
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
    "not-the-neighbours": {
      kind: "grid",
      band: "dark",
      eyebrow: "Three things this is not",
      heading: "The article next door owns half of what you came here for.",
      columns: 3,
      glow: true,
      items: NOT_THE_NEIGHBOURS,
      label: "What this is not",
    },
    "what-a-field-asserts": {
      kind: "grid",
      band: "dark",
      eyebrow: "What arrives in the column",
      heading: "Four things an appended value does not tell you.",
      columns: 2,
      items: WHAT_A_FIELD_ASSERTS,
      label: "What it asserts",
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/ghost-sign-foundry.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS and which contains the 21:9
      // crop a laptop ships. Only what is legible is named: the upper letters really are
      // unreadable, because two paintings overlap there, and FOUNDRY and CO really are clear.
      alt: "Looking steeply up a red brick wall at a tall painted sign, white capital letters on a dark ground, the letters at the top overlapping each other so that no word can be read, with FOUNDRY and CO clearly legible below them, a window in the brickwork to the right and pale blue sky along the left edge",
      caption:
        "Somebody painted that, and it was true. Somebody painted over it, and that was true too. What is left is a wall carrying two claims at once, one of them readable and neither of them dated, and no way to tell from the wall which one you are looking at. That is what a contact record looks like after a pass that overwrote a field, and unlike the wall, your CRM shows you only the top layer.",
      credit: "Photograph by A Continuous Lean, CC BY 2.0.",
      ariaLabel: "A painted sign half worn off a brick wall",
    },
    "broker-sources": {
      kind: "statbars",
      band: "dark",
      label: "Where it comes from",
      ...BROKER_SOURCES,
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from the executive summary of the FTC's 2014 data broker report. Quoted rather
       * than paraphrased because it is a federal regulator, after compulsory process against
       * nine named companies, saying that provenance is not recoverable. */
      text: "It would be virtually impossible for a consumer to determine how a data broker obtained his or her data; the consumer would have to retrace the path of data through a series of data brokers.",
    },
    "product-lines": {
      kind: "statbars",
      band: "dark",
      label: "What it is sold as",
      ...PRODUCT_LINES,
    },
    tenure: {
      kind: "statbars",
      band: "dark",
      label: "How fast it rots",
      ...TENURE,
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/palimpsest-page.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS. The alt describes only what
      // is VISIBLE. It does not say the fainter marks are the older text, because at this size
      // that cannot be told apart from ink showing through from the other side of the leaf, and
      // the fact that this page is a palimpsest comes from the museum's own title rather than
      // from anything a reader can see here. The caption carries that; the alt does not.
      alt: "A stained parchment leaf in ochre and olive, closely covered in Greek script in dark brown ink with several lines and one large initial picked out in red, fainter marks visible between and behind the writing, the ragged left edge lit blue where a rod holds it against a pale mount",
      caption:
        "The page was scraped clean and written on again, which is what people did when parchment was expensive. The older text is still there, faintly, under the newer one, and the only reason anybody can read it now is that somebody went looking for it with the right equipment. Keeping what you overwrote costs a database column. Recovering it afterwards costs a research project.",
      credit: "Photograph by Walters Art Museum Illuminated Manuscripts, CC0 1.0.",
      ariaLabel: "A manuscript page written over an older erased text",
    },
    "enrich-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "From your own record back to your own record.",
      lede: "Six hops, and it is a loop rather than a line, which is the thing that makes this different from every other data project in your business. The output lands on top of the input. Three of the six happen inside a company you have no access to, and the only two you control are the first and the last, which is where all of the available honesty lives.",
      steps: ENRICH_PATH,
      altPrefix:
        "The path from a contact record you already hold, out to a matching decision made inside somebody else's system, and back onto the same row",
    },
    "overwrite-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many fields would a pass replace that you already knew?",
      ariaLabel: "How many appended values would land on a field that already had one",
      inputs: [
        {
          kind: "range",
          id: "records",
          label: "Records you would run",
          hint: "The number you would actually send, which for most people starts as the whole database and should not be.",
          min: 200,
          max: 20000,
          step: 100,
          initial: 2000,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "filled",
          label: "Share that already hold a phone number or an email",
          hint: "Not the share you would call. The share where the field you are about to enrich is not empty. Sort by the column and look.",
          min: 10,
          max: 100,
          step: 5,
          initial: 40,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "differ",
          label: "Share of those where an outside file comes back with something else",
          hint: "This one is yours to supply and it is worth measuring rather than guessing: run two hundred records where you already know the answer and count the disagreements. Nobody can quote it to you honestly before seeing your list.",
          min: 5,
          max: 100,
          step: 5,
          initial: 25,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes to settle one disagreement by hand",
          hint: "Opening the record, seeing where your own value came from, deciding. Seconds when you remember the person and much longer when you do not.",
          min: 1,
          max: 10,
          step: 1,
          initial: 3,
          format: "count",
          width: "w-[4rem]",
        },
      ],
      chain: [
        { label: "Records in the pass", by: { from: "input", id: "records" }, format: "count", unit: "records" },
        {
          label: "Where the field is not empty",
          by: { from: "input", id: "filled" },
          format: "count",
          unit: "filled fields",
        },
        {
          label: "Where an outside file says something else",
          by: { from: "input", id: "differ" },
          format: "count",
          /** SHORT ON PURPOSE. A chain unit renders inside a shrink-0 cell and cannot wrap;
           * round E shipped 66px and 32px of horizontal overflow from exactly this. The
           * explanation belongs in the row label on the left, which does wrap. */
          unit: "disagreements",
        },
        { label: "At your settling time", by: { from: "input", id: "minutes" }, format: "count", unit: "minutes" },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours",
        },
      ],
      headline: 2,
      resultLabel: "Fields where somebody has to decide which answer is yours",
      note: "The headline is the third row rather than the hours, because the hours are the affordable half and the count is the one nobody asks about before buying. Every one of those is a moment where something will choose on your behalf if nobody has chosen deliberately, and the choosing happens silently. Shares of records produce fractions, and half a disagreement is not a thing, so read anything with a decimal in it as a rough count. Three things this deliberately refuses. There is no rate of decay anywhere in it, because the figures that circulate do not survive being followed, which is worked through in the section above. There is no figure for how often the appended value turns out to be the correct one, because the only person who can measure that is you, on a couple of hundred of your own records where you already know the answer, and that measurement is worth more than anybody's benchmark. And there is no money in this calculator at all: a reachable client is not a commission, the loss from a number you can no longer reach is not payable on any date, and the arithmetic that turns either into a dollar figure does not exist.",
      action: { label: "See how it is built", href: "/services/data-enrichment" },
      secondary: { label: "Ask us what your last pass did", href: "/connect" },
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 14: on light, the cost section, the
       * limits section and the how-to run as one long pale band. Flipping this one breaks the
       * run. */
      band: "dark",
      eyebrow: "Three ways a pass that worked leaves you worse off",
      heading: "All three happen after the data arrives.",
      columns: 3,
      items: WASTED,
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Export twenty contacts you would swear you know, phone numbers and all, and send them to us with the numbers removed. We will run them and send back what an enrichment pass would have written into those fields, so you can see for yourself how many agree with what you already had, how many disagree, and how many come back empty.",
      reassure:
        "It is twenty rows, it costs nothing, we do not need access to your CRM, and you keep the only copy that has the real numbers in it.",
      action: { label: "Ask us what your last pass did", href: "/connect" },
      ariaLabel: "Ask us what your last pass did",
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Pick one contact you are certain about, somebody whose number you have used, and open their record. Then find the answer to a single question: where did that number come from, and when. If your CRM cannot tell you that about the one person you are sure of, it cannot tell you about the four thousand you are not, and every argument in this article is an argument about a column you have not added yet.",
      actions: [
        { label: "See it on the AI page", href: "/ai#enrich", variant: "light" },
        { label: "How it is built", href: "/services/data-enrichment", variant: "outline-light" },
      ],
      footnote:
        "There is no figure here because the largest part of the bill is paid to somebody else, per record, and it moves with how many records you send and whether you are charged for attempts or for successes. What we would build around it is the smaller and duller half: deciding which records are worth running at all, writing the source and the date onto every row, and making sure a value that lands on a field which already had one goes somewhere a person can see. The AI audit is an hour, done with you, and for this topic it starts by looking at what your existing rows already say about themselves.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-data-enrichment-actually-is-and-what-it-is-not": "What it is",
    "what-comes-back-is-a-claim-rather-than-a-fact": "A claim, not a fact",
    "where-an-appended-field-actually-comes-from": "Where it comes from",
    "observation-and-inference-arrive-in-the-same-column": "Guess or measurement",
    "the-same-file-sold-under-three-different-names": "Three names",
    "nobody-has-published-an-honest-decay-rate-and-we-went-and-looked": "The decay rate",
    "a-rate-is-a-property-of-the-people-not-of-the-data": "Whose rate",
    "what-to-do-when-two-sources-disagree": "When they disagree",
    "the-one-law-that-describes-this-is-about-whoever-holds-the-data": "The law",
    "what-new-yorks-law-actually-covers-and-it-is-not-this": "New York",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-find-out-what-your-last-pass-actually-did": "Audit your rows",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
