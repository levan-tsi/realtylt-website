/** Scene copy for the skip tracing flagship post (topic 12).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Twelfth topic on the flagship template and the ELEVENTH IN A ROW that adds no component
 * of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 11. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/skip-tracing-lead-generation.ts.
 * Nothing here claims a capability that page does not claim.
 *
 * THE DELIBERATE DISTANCE FROM ITS NEAREST SIBLING. Topic 3, database reactivation, is the
 * closest article in the cohort and it already owns the whole subject of CALLING people. It
 * carries 47 CFR 64.1200(f)(5) and the eighteen month and three month windows, 64.1200(a)(2) on
 * autodialers, the revocation rule, 47 U.S.C. 227(b)(3) and its five hundred dollars a message,
 * and the sixteen thousand dollar figure that belongs to a different statute. None of that is
 * repeated here, and this article hands the reader to that one by name when the question is
 * about the call.
 *
 *   TOPIC 3 is about a person who IS in your database and once gave you their number. Its
 *   question is whether that permission has expired.
 *
 *   THIS post is about a person who is NOT in your database and never gave you anything. Its
 *   question is where the number came from, because in the two statutes that govern that half
 *   the answer decides what you are allowed to do next. Not the call. The acquisition.
 *
 * The Driver's Privacy Protection Act and the Fair Credit Reporting Act appear nowhere else on
 * this site. Neither does the FTC's Do Not Call Data Book, the FCC's reassigned numbers order,
 * or the Census Bureau's mobility survey. Not one source, chart, statute or number here is
 * shared with topic 3.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. The acquisition, the
 * purpose, the standing refusal, which is the order the article itself runs in. */
export const IN_SHORT: string[] = [
  "A traced phone number is not a lead, it is a record with a history. Two federal statutes care about where it came from and what you intend to do with it, and neither of them is the one everybody in this trade talks about.",
  "The Driver's Privacy Protection Act lists the purposes for which information out of a state motor vehicle record may be released. Selling somebody a house is not among them, and the exception for licensed investigators does not add a purpose, it only names who may act on one that already exists.",
  "The Fair Credit Reporting Act does not turn on what the data is. It turns on what you use it for, which means the same name and address can be an ordinary public record in one hand and a consumer report in another.",
];

/** SCENE copy — the four honest answers to the only question that matters.
 *
 * The article's cold open ends on a question the agent could not answer. This is the answer set,
 * and the fourth card is the argument: three of these are fine and the fourth is the one that
 * gets quietly given.
 *
 * The situation is a composite. No address, no real client, nothing that could be checked
 * against a person. */
export const WHERE_FROM: GridItem[] = [
  {
    lead: "From a public record you can name",
    body: "A deed, a tax roll, a recorded mortgage, a probate filing. These are public because a legislature decided they should be, the county will tell you the same thing over the counter, and there is nothing to be uncomfortable about. What a public record almost never carries is a mobile number, which is precisely why the chain does not stop here.",
  },
  {
    lead: "From the person, at some earlier point",
    body: "They filled in a form, they rang the office, they signed something at an open house. This is the strongest answer there is and it is the one a good CRM can evidence with a date and a source. It is also the answer that makes this whole article unnecessary, and it is available for a vanishingly small share of any prospecting list.",
  },
  {
    lead: "From a compiler, under a purpose the compiler recorded",
    body: "Data resellers are required by law to keep records of who received information and the permitted purpose it was taken under, and to keep them for five years. That means there is an answer written down somewhere. Ask your provider what purpose your account was set up under and you will learn more in five minutes than any article can tell you.",
  },
  {
    lead: "Nobody knows, and nobody asked",
    body: "This is the usual answer and it is the reason this article exists. The list came from a tool, the tool bought from an aggregator, the aggregator bought from somebody else, and at no point did a person in your business form a view about which permitted purpose the request sat under. The obligation does not disappear because the chain is long.",
  },
];

/** SCENE copy — the three exceptions that look like they might fit a real estate agent.
 *
 * 18 U.S.C. 2721(b), read in full at law.cornell.edu. Fourteen permitted uses are listed. Three
 * of them are the ones a prospector would reach for, and none of them survives being read. The
 * cards state what each one actually says.
 *
 * Quoted as written from the statute:
 *
 *   (b)(3): "For use in the normal course of business by a legitimate business or its agents,
 *   employees, or contractors, but only-- (A) to verify the accuracy of personal information
 *   submitted by the individual to the business or its agents, employees, or contractors; and
 *   (B) if such information as so submitted is not correct or is no longer correct, to obtain
 *   the correct information, but only for the purposes of preventing fraud by, pursuing legal
 *   remedies against, or recovering on a debt or security interest against, the individual."
 *
 *   (b)(8): "For use by any licensed private investigative agency or licensed security service
 *   for any purpose permitted under this subsection."
 *
 *   (b)(12): "For bulk distribution for surveys, marketing or solicitations if the State has
 *   obtained the express consent of the person to whom such personal information pertains."
 *
 * THE CARDS DISTIL, THEY DO NOT QUOTE. The body carries the quotations and the citation; these
 * are what each exception actually permits, which is the half a summary always drops. */
export const THREE_EXCEPTIONS: GridItem[] = [
  {
    lead: "The legitimate business one has a second half",
    body: "It permits a business to check information a person gave it directly, and then, if that information turns out to be wrong, to go and find the right version. The clause names what for: preventing fraud, pursuing a legal remedy, or recovering a debt. Prospecting somebody who has never contacted you is not the first half, and selling them a house is not the second.",
  },
  {
    lead: "The investigator one is a loop, not a door",
    body: "This is the clause the trade leans on, and read in full it does not do what it is asked to do. It permits a licensed investigative agency to use the information for any purpose already permitted by the same subsection. The licence answers who is allowed to act. It does not add a purpose to the list, so the purpose still has to be found somewhere else on it.",
  },
  {
    lead: "The marketing one exists, with a condition attached",
    body: "There is an exception for bulk distribution for surveys, marketing or solicitations, so the statute clearly contemplates this. The condition is that the state has obtained the express consent of the person the information is about, and express consent is separately defined as consent in writing. That is an opt in held by the state, not a box anybody in your office can tick.",
  },
];

/** SCENE copy — where people who moved last year went. Cited data graphic ONE.
 *
 * U.S. Census Bureau, Current Population Survey Annual Social and Economic Supplement, Table A-1,
 * "Annual Geographic Mobility Rates, By Type of Movement: 1948-2023". Read in the Bureau's own
 * xlsx (hst_mig_a_1.xlsx), not in a summary: the workbook was unzipped and the 2023 row read out
 * of the sheet.
 *
 * The 2023 row, in thousands: total 1 year old and over 327,167; same residence 301,543; total
 * movers 25,624; movers within the United States 24,330; same county 13,851; different county
 * 10,480, of which same state 5,987 and different state 4,493; movers from abroad 1,294.
 *
 * The four bars are the four destinations that sum to the total: same county, different county
 * in the same state, different state, and from abroad.
 *
 * The method, quoted from the workbook's own notes: "One-year geographic mobility is measured as
 * living in a different residence exactly one year prior to completing the survey." And the
 * sample: "The sample includes persons who are currently living in the United States (50 states
 * and the District of Columbia), are noninstitutionalized, and are either a civilian adult (at
 * least 15 years old) or are living with at least one civilian adult (at least 15 years old)."
 * Also from the notes: "Estimates may not sum to totals due to rounding."
 *
 * WHY THE FIRST BAR IS LIT: it is the finding. More than half of everybody who moved stayed in
 * the same county, which is the situation that makes a record wrong and the person still local,
 * and it is the situation in which two people with the same name are hardest to tell apart.
 *
 * NO AXIS MAXIMUM, deliberately. These are counts of people rather than shares of a whole, and
 * the smallest bar is a little over nine percent of the largest, which renders as a short bar
 * rather than as a hairline. */
export const MOVERS = {
  eyebrow: "The evidence",
  caption: "Where the people who changed address in 2023 ended up",
  bars: [
    { label: "Moved within the same county", value: 13851, display: "13.9 million" },
    { label: "Different county, same state", value: 5987, display: "6.0 million" },
    { label: "Different state", value: 4493, display: "4.5 million" },
    { label: "Moved from abroad", value: 1294, display: "1.3 million" },
  ],
  lit: 0,
  basis:
    "People aged one and over who were living at a different address a year earlier, counted by the Current Population Survey and published by the Census Bureau as Table A-1. The four bars are the four destinations the Bureau distinguishes, and together they are the 25.6 million people the survey counts as movers in 2023.",
  sourceText:
    "U.S. Census Bureau, Current Population Survey Annual Social and Economic Supplement, Table A-1, Annual Geographic Mobility Rates by Type of Movement, 1948 to 2023.",
  sourceHref:
    "https://www.census.gov/data/tables/time-series/demo/geographic-mobility/historic.html",
  /** THE PORTABILITY REASON IN THIS NOTE WAS WRONG and it was checked in the second pass. It
   * said a move does not break a number "because numbers have been portable between carriers for
   * years". Portability is defined at 47 CFR 52.21(m) as retaining a number "at the same
   * location" when switching CARRIER, so it is not about moving house at all. The true reason is
   * that a mobile number is not attached to a building. Recorded because giving a wrong REASON
   * for a right conclusion is the exact defect Round D's second pass caught twice. */
  note: "This counts people, not records, and the distinction matters more here than anywhere else in this article. A move breaks an address. It does not automatically break a mobile number, because a mobile number was never attached to a building. So read the first bar as the reason a mailing address goes wrong, not as a rate at which phone numbers go wrong, and treat the two as separate problems with separate answers. The Bureau also states that estimates may not sum to totals due to rounding, and that this is a survey rather than a count, so these are estimates with sampling error around them rather than exact figures.",
};

/** SCENE copy — who people complained about. Cited data graphic TWO.
 *
 * Federal Trade Commission, National Do Not Call Registry Data Book 2024, published November
 * 2024. Read in the Commission's own PDF with pdftotext.
 *
 * The FY 2024 complaints by call type, quoted as the document tabulates them: Robocall
 * 1,099,223; Live Caller 763,970; Call Type Not Reported 221,940. Those three sum to 2,085,133,
 * which is the figure the same document gives for total FY 2024 complaints in its complaints by
 * year chart, so the three bars are the whole year rather than a selection from it.
 *
 * The registry size, from the same document: "Since its inception in 2003, the Registry has
 * continued to grow. As of September 30, 2024, there were 254 million active registrations."
 *
 * The method, and the honesty, quoted from the document: "Statistical data on complaints is
 * based on unverified complaints reported by consumers, not on a consumer survey." And the
 * definition, which is the reason the registry figure is not a count of people: "For the
 * purposes of this report, 'active registrations' are those registrations consumers have placed
 * on the Registry that have not been subsequently deleted by the consumer or removed by the FTC.
 * The FTC removes numbers that have been disconnected and reassigned. Numbers that have been
 * disconnected but not reassigned remain on the registry."
 *
 * WHY THE SECOND BAR IS LIT: it is the one this article is about. Everybody assumes the
 * complaint problem is robots. Three quarters of a million complaints in one year were about a
 * human being dialling, which is exactly what a prospector with a traced list is.
 *
 * NO AXIS MAXIMUM. These are counts of complaints, and the smallest is a fifth of the largest,
 * so nothing renders as a hairline. */
export const COMPLAINTS = {
  eyebrow: "The evidence",
  caption: "Do Not Call complaints in the 2024 federal fiscal year, by what was on the line",
  bars: [
    { label: "A recorded call", value: 1099223, display: "1,099,223" },
    { label: "A live person dialling", value: 763970, display: "763,970" },
    { label: "Call type not reported", value: 221940, display: "221,940" },
  ],
  lit: 1,
  basis:
    "Complaints submitted to the Federal Trade Commission during the 2024 federal fiscal year, split by what the person reported was on the other end. The three bars sum to 2,085,133, which is the total the same Data Book reports for the year.",
  sourceText:
    "Federal Trade Commission, National Do Not Call Registry Data Book 2024, November 2024.",
  sourceHref: "https://www.ftc.gov/system/files/ftc_gov/pdf/DNC-Data-Book-2024.pdf",
  note: "The Commission states plainly what this is and is not: the complaint data is based on unverified complaints reported by consumers rather than on a consumer survey, so these are reports rather than findings, and nobody has checked each one. There is no denominator here either, so this cannot tell you what share of calls draw a complaint, only how many complaints arrived. Read the second bar rather than the first. A recorded call is the thing everybody legislates about, and three quarters of a million of these complaints were about a person dialling by hand, which is what a prospecting list is for.",
};

/** SCENE copy — three ways a technically clean trace produces nothing worth having.
 *
 * Deliberately not any sibling's three, and not a restatement of the limits section: the limits
 * are what the service cannot do, and these are the ways a competent build ends up worthless
 * anyway. All three are about the business rather than the software. */
export const WASTED: GridItem[] = [
  {
    lead: "A list nobody can say no to",
    body: "If a person asks not to be contacted again and there is no field for it, no owner of that field and no check before the next run, then the same list will produce the same call in six weeks. That is worse than never having called, because the first call was a nuisance and the second one is evidence. The suppression list is the least interesting part of this and it is the part that decides whether you are safe.",
  },
  {
    lead: "Volume standing in for a reason to ring",
    body: "The pipeline makes it cheap to produce three hundred numbers, and cheap production quietly changes the question from who should I speak to into how many can I get through. A traced number carries no signal at all about whether that person is thinking of moving. Whatever you might have known about that came from the public record you started from, and whether the pipeline carries it forward alongside the number is a thing to check on your own output rather than to assume.",
  },
  {
    lead: "A file with no memory of where it came from",
    body: "Rows arrive with a name and a number and nothing else, get pasted into a CRM, and six months later nobody can tell them apart from the people who filled in a form on your website. At that point every consent question about your whole database has become unanswerable, and the honest fix is a cleanup rather than a campaign. Carry the source and the date with every row from the first minute, because you cannot add them later.",
  },
];

/** SCENE copy — the chain a traced number actually travels.
 *
 * Six hops. The service page's own pipeline (pull, enrich, validate, hand off) plus the two hops
 * that page does not name and that this article is about: the source under each number, and the
 * permitted purpose the request sat under.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing
 * is clipped by the container edge at 390px. 33 characters lost a letter on the reactivation
 * post; "A house, on a map" is 17. */
export const TRACE_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The property", connects: "A house, on a map" },
  { label: "The record", connects: "A deed, a roll, a filing" },
  { label: "The owner", connects: "A name, and maybe two" },
  { label: "The source", connects: "Where the number came from" },
  { label: "The purpose", connects: "What it was released for" },
  { label: "The call", connects: "Suppressed, or made" },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. */
export const SKIP_TRACING_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments so far have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12
   * reviews, 9 days, 3 results, 1 word, 2 records and 10 mornings. This one is a sum of money
   * and it is the only figure in the article that is fixed by Congress rather than estimated by
   * anybody: 18 U.S.C. 2724(b)(1) lets a court award "actual damages, but not less than
   * liquidated damages in the amount of $2,500" to a person whose motor vehicle record
   * information was obtained for a purpose the chapter does not permit. Per person. */
  hero: {
    moment: "$2,500",
    suffix: "a person",
    /** NOT the same photograph as the first plate. The cold open field and the plate two
     * screens below it were both `mailboxes-row` in the first draft, which is one picture used
     * twice on one page: the exact defect session 15 recorded when two flagships shared the
     * Poughkeepsie bridge, one page further in. This one is a single box a long way down a wet
     * road in bare woods, which is atmosphere behind type rather than a subject. */
    photo: "/images/editorial/mailbox-road.jpg",
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
    "where-from": {
      kind: "grid",
      band: "dark",
      eyebrow: "The only question that matters",
      heading: "Where did you get this number?",
      columns: 2,
      glow: true,
      items: WHERE_FROM,
      label: "Where it came from",
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/mailboxes-row.jpg",
      // RE-READ IN ROUND I AT THE 16:9 CROP, which is the one a phone ships; the note under this
      // used to say it was written from the 21:9 one, which Round F established is the smaller of
      // the two. There are FOUR boxes in the crop, not three: an early draft said three because
      // the second and third overlap from this angle. The legible numbers are 70 and 60.
      //
      // Two corrections. The 70 is painted on the rust brown box's DOOR, under the embossed U.S.
      // MAIL and APPROVED BY THE POSTMASTER-GENERAL, not on its side. And the alt described the
      // background as a hillside and left out the thing that dominates it: a long ridge closing
      // the valley with a pale cliff face standing at its top.
      alt: "Four metal rural mailboxes standing in a row on a rough grey plank carried on splayed timber legs, one small and rust streaked, one pale and ribbed with writing along its side, one rust brown with U S MAIL and APPROVED BY THE POSTMASTER-GENERAL embossed on its door and a large hand painted 70 across the same door, and one silver with a small 60 written low on its door, all of them standing in long grass in front of a green field, with orange and gold autumn woodland rising behind it, two small farm buildings at the treeline and a long ridge closing the valley with a pale cliff face at its top",
      caption:
        "Two of these carry a number that anybody driving past can read, which is the whole point of a mailbox. Not one of them carries a telephone number, and that is not an oversight either. The information a person puts where the public can see it is a decision they made, and the information they did not put there is also a decision.",
      credit: "Photograph by _Imaji_, CC BY 2.0.",
      ariaLabel: "Four mailboxes on a plank",
    },
    movers: {
      kind: "statbars",
      /** LIGHT here and DARK for the second chart, which is the arrangement topic 10 used and
       * the reverse of topic 9. Deciding it as a pair keeps consecutive posts from sharing a
       * rhythm. */
      band: "light",
      label: "Who moved",
      ...MOVERS,
    },
    "three-exceptions": {
      kind: "grid",
      band: "dark",
      eyebrow: "The three that look like they fit",
      heading: "Read in full, none of them is about selling a house.",
      columns: 3,
      items: THREE_EXCEPTIONS,
      label: "The exceptions",
    },
    "plate-two": {
      kind: "plate",
      band: "light",
      src: "/images/editorial/ledger-names.jpg",
      // RE-READ IN ROUND I AT THE 16:9 CROP. Two columns of entries, not one. Individual names
      // are legible in the original but are NOT enumerated here: they are transcribed as
      // "personal names" because a list of eighteenth century pay roll names read off a
      // photograph is exactly the invented precision this cohort has been caught on before.
      //
      // "An open page of an old payroll journal" followed the photographer's own title ("Very Old
      // payroll Journal") rather than the picture. What is in the frame is a single sheet, torn
      // away down its right edge, ruled into columns whose heads read Names, Commencing and
      // Ending. So the alt now describes a sheet, and the caption no longer says "in a book".
      // The column heads are described rather than the ranks beside the names, which are at the
      // limit of what the shipped crop resolves.
      alt: "A single sheet of an old pay roll photographed close up, the paper aged to a deep yellow and torn away down its right edge, ruled into columns whose heads read Names, Commencing and Ending above narrow money columns, two columns of personal names written in brown ink cursive down the sheet, each name followed by dates and a short row of figures",
      caption:
        "Every line here is a person, written down by somebody whose job it was to be accurate, on a sheet that was never meant to leave the room it was kept in. A list of names has always been easy to make and easy to move. What has changed is that the list now arrives with a telephone number attached to it, and nothing about the list tells you where that part came from.",
      credit: "Photograph by peagreengirl, CC BY 2.0.",
      ariaLabel: "A page of names in a ledger",
    },
    complaints: {
      kind: "statbars",
      band: "dark",
      label: "The complaints",
      ...COMPLAINTS,
    },
    "trace-path": {
      kind: "diagram",
      band: "dark",
      label: "The chain",
      eyebrow: "The system",
      heading: "From a house on a map to a phone ringing.",
      lede: "Six hops, and the two that decide whether this is safe are the fourth and the fifth. Everything else is engineering that either works or does not. The source under each number and the purpose the request sat under are the two nobody asks about, they are answerable in writing, and they are the two you will be asked about if anything ever goes wrong.",
      steps: TRACE_PATH,
      altPrefix:
        "The chain from a property on a map to a telephone ringing, through the record, the owner, the source of the number and the purpose it was released for",
    },
    "trace-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many numbers would you have to be able to account for?",
      ariaLabel: "How many traced numbers you would be responsible for",
      inputs: [
        {
          kind: "range",
          id: "addresses",
          label: "Addresses in the area you would work",
          hint: "The streets you would farm, or the absentee owners in one town. Count properties rather than people.",
          min: 50,
          max: 5000,
          step: 50,
          initial: 400,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "resolve",
          label: "Share where a phone number comes back at all",
          hint: "Your own provider can tell you this for your own area, and it is the one number on this page you should not accept from anybody who has not run it for you.",
          min: 10,
          max: 100,
          step: 5,
          initial: 60,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "dial",
          label: "Share you would actually dial",
          hint: "Not the share you intend to dial. The share you got through last time, before the week filled up.",
          min: 5,
          max: 100,
          step: 5,
          initial: 40,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes per attempt, including the ones nobody answers",
          hint: "Dialling, waiting, leaving something or not, and writing down what happened.",
          min: 1,
          max: 10,
          step: 1,
          initial: 3,
          format: "count",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        {
          label: "Properties in the area",
          by: { from: "input", id: "addresses" },
          format: "count",
          unit: "properties",
        },
        {
          label: "Numbers that come back",
          by: { from: "input", id: "resolve" },
          format: "count",
          /** SHORT ON PURPOSE, and it was not. This unit read "numbers whose source you would
           * have to be able to name", which is 302px of text inside a `shrink-0` cell: at 390
           * it pushed the document to 456px and the whole article scrolled sideways by 66px.
           * Measured with scripts/_scratch-e-overflow.mjs, which named this exact span. The
           * long phrasing survives where it belongs, in `resultLabel` above the big number,
           * which wraps. Chain units are cells and have to stay short. */
          unit: "numbers to account for",
        },
        {
          label: "Numbers you would actually ring",
          by: { from: "input", id: "dial" },
          format: "count",
          unit: "calls",
        },
        {
          label: "At your time per attempt",
          by: { from: "input", id: "minutes" },
          format: "count",
          unit: "minutes",
        },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours at the phone",
        },
      ],
      headline: 1,
      resultLabel: "Numbers whose source you would have to be able to name",
      note: "The headline is the second row rather than the hours, because the hours are the easy half and everybody already knows roughly what they are. The number that matters is how many records you would be holding, because each one of them is a thing somebody could ask you about, and the answer has to be the same for the first as for the last. Two things this deliberately will not do. It will not tell you a match rate. The second slider is yours to set, and that is a checked refusal rather than a shrug: the circulating figures were followed, they are bands of roughly 70 to 90 percent, every page carrying one is a company that sells skip tracing or a page ranking such companies, and none of the ones opened states a sample. Your own provider can measure it for your own area in an afternoon, which is worth more than any band. And there is no row that turns calls into appointments or appointments into commission. Nobody has published a rate for cold outreach to traced numbers in this industry with a method under it, and inventing one here would undo the only argument this article is making.",
      action: { label: "See how it is built", href: "/services/skip-tracing-lead-generation" },
      secondary: { label: "Ask us what your list would need", href: "/connect" },
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "A licence says who is allowed to act on a permitted purpose. It does not create one. If the purpose is not already on the list, hiring somebody with a licence does not put it there.",
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Tell us what you would use a list for and where you would work, and send the name of the provider you are considering. We will send back the questions to put to them in writing, what a good answer looks like, and which parts of what you want are ordinary public record work and which parts are not.",
      reassure:
        "It is a short reply from a person, it costs nothing, we do not need access to any list, and if the honest answer is that you do not need this we will say so.",
      action: { label: "Ask what your list would need", href: "/connect" },
      ariaLabel: "Ask what your list would need",
    },
    "plate-three": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/no-solicitation.jpg",
      // RE-READ IN ROUND I AT THE 16:9 CROP. The first draft said the figure was struck through
      // with a diagonal bar; photographed at the plate's real geometry there is no bar, so that
      // claim went in Round G. The word order is WARNING above NO SOLICITATION, both between
      // exclamation marks on the first line only.
      //
      // TWO ROUND I CORRECTIONS, and the caption one is the worst single defect the checker found
      // in the cohort.
      //
      // The figure is not "in a broad hat". The hat is coming OFF, drawn above and clear of the
      // head with a motion line over it, which is the whole joke of the sign. And the sign has a
      // third line the alt omitted: Thank You!, in script between two rules, which is the exact
      // detail the caption's last sentence turns on.
      //
      // The caption said "Two million PEOPLE said the same thing to the Federal Trade Commission
      // last year." The Commission's Do Not Call Data Book 2024 counts 2,085,133 COMPLAINTS for
      // the fiscal year (1,099,223 robocall, 763,970 live caller, 221,940 not reported), which is
      // the sum the statbars scene four screens above renders bar by bar, and the same document
      // says the data is "unverified complaints reported by consumers, not a consumer survey".
      // Complaints are not people; one person can file many. The article's own prose refuses this
      // exact conflation three paragraphs earlier, about the 254 million registrations: "That is
      // not a count of people". So the page argued against itself, in the one scene field that
      // carries no source. "Last year" also went, because it is a floating reference that reads
      // wrong the day FY2025 publishes.
      alt: "A weathered red metal sign filling the frame, scratched and faded, carrying a large white outlined triangle with a white pictogram inside it of a figure striding to the right with a case in one hand and its broad hat flying off above its head with a motion line over it, and beneath the triangle the words exclamation mark WARNING exclamation mark above the words NO SOLICITATION, both in white capitals, and below those, between two short rules, the words Thank You! in a white script hand, with a pale grey surface showing at each edge of the frame",
      caption:
        "Somebody bought this, drilled it to their own wall and looked at it every day, which is a considerable amount of trouble to go to in order to say one thing. The Federal Trade Commission counted two million complaints saying it in a single fiscal year, and 254 million numbers are registered saying it in advance. Neither of those is a headcount. This is one person, and it still says thank you at the bottom.",
      credit: "Photograph by upyernoz, CC BY 2.0.",
      ariaLabel: "A no solicitation sign",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 11: on light, the cost section, the
       * limits section and the FAQ run as one long pale band. Flipping this one breaks the run. */
      band: "dark",
      eyebrow: "Three ways a clean trace produces nothing",
      heading: "None of them are the data.",
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
      text: "Open the last list anybody in your office worked and pick one row at random. Ask where that person's number came from and under what purpose it was released. If the answer arrives in a minute you have a good provider and a process. If it does not, you have found the actual project, and it is smaller and duller and far more useful than buying more rows.",
      actions: [
        { label: "See it on the AI page", href: "/ai#data", variant: "light" },
        {
          label: "How it is built",
          href: "/services/skip-tracing-lead-generation",
          variant: "outline-light",
        },
      ],
      footnote:
        "There is no price on this page because the cost tracks four things nobody can guess from an article: how many properties you would run, what your enrichment provider charges per resolved record in your area, whether the suppression and consent fields already exist in your CRM or have to be built, and whether anything calls the list afterwards. The AI audit is an hour, done with you, and it ends with a list of the questions to put to your provider rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-skip-tracing-is-and-why-it-is-a-chain-rather-than-a-lookup": "What it is",
    "the-record-is-not-stale-because-anybody-was-careless": "Why records rot",
    "where-the-number-came-from-decides-what-you-may-do-with-it": "Where it came from",
    "the-statute-nobody-selling-this-will-name": "The first statute",
    "what-a-licence-actually-buys-and-it-is-not-a-new-permission": "The licence",
    "the-second-statute-turns-on-your-purpose-not-on-the-data": "The second statute",
    "two-hundred-and-fifty-four-million-standing-refusals": "The refusals",
    "the-number-itself-does-not-stay-still": "The number moves",
    "what-a-trace-is-actually-made-of": "What a trace is",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-audit-your-own-list-in-twenty-minutes": "Audit your list",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
