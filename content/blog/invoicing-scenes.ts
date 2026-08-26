/** Scene copy for the invoicing and payments flagship post (topic 17).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Seventeenth topic on the flagship template and the SIXTEENTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 16. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/invoicing-and-payments.ts, which
 * was rewritten in the same round because six of its claims were about a majority of late
 * payments being forgotten rather than refused, which is a claim about a reason and nothing
 * published measures one.
 *
 * THE TRAP THIS TOPIC IS SET UP TO FALL INTO, and the whole file is organised around not falling
 * into it. The generic version of this article is "send invoices faster and chase them harder",
 * written for a plumber. The audience here runs a brokerage, and in a brokerage the largest sum
 * of money that arrives all year does not arrive because somebody chased an invoice. It arrives
 * out of a closing that another party runs, on a date another party sets.
 *
 * SO THE ARTICLE REFUSES THE PART IT CANNOT ESTABLISH, on the page rather than only here. It
 * does not describe how a commission is documented or disbursed, because that varies by state,
 * by closing agent and by brokerage, and no primary source was found that states it generally.
 * What it does instead is cover the three things that ARE establishable in primary law and that
 * a brokerage owner actually controls: who you may pay and be paid by (RESPA), when money you
 * have received becomes money you can spend (Regulation CC), and what a payment rail costs and
 * what you may pass on (NY General Business Law 518, and Nacha's own rules for ACH).
 *
 * THE DELIBERATE DISTANCE FROM TOPIC 16, written in the same round. Scheduling owns a date that
 * other people control and an agreement you do not have. This one owns the RAIL and the LEDGER:
 * how the money physically moves, when it is really there, whose it is, and which events that
 * ought to create a charge happen where you cannot see them. Neither article re-argues the
 * other, and neither one's calculator counts anything the other counts.
 *
 * Nothing on this website has previously mentioned RESPA, a kickback, a settlement statement,
 * Regulation CC, funds availability, a surcharge, ACH, a wire or business email compromise.
 * Checked by grep across every post body and every service page before this file was written.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. What the article refuses,
 * the fact that reorganises the topic, and the number that is not what anybody expects. */
export const IN_SHORT: string[] = [
  "The largest sum a brokerage receives in a year is not collected by chasing anybody. It comes out of a closing run by somebody else, on a date set by somebody else, and this article does not tell you how that works in your state, because no primary source states it generally and guessing at it would be the least useful thing on the page.",
  "What federal law does state plainly is who you may pay and who may pay you. Paying anybody for a referral in a transaction with a federally related mortgage loan on it is a criminal offence with a fine, a prison term and treble damages attached, and there is one carve-out that matters to you: payments between real estate brokers under cooperative brokerage and referral arrangements are expressly permitted.",
  "And getting paid is not one event, it is three. Regulation CC lets a bank make an electronic payment available the business day after it arrives and a local cheque available on the second business day, and for the part of a cheque above $6,725 on one banking day that schedule does not apply at all.",
];

/** SCENE copy — what is actually an invoice in this business.
 *
 * Four cards on a two column grid. The first is the refusal, stated as a card rather than buried,
 * because a business owner reading a page about invoicing will look for their commission first
 * and deserves to be told immediately that this page is not about it. */
export const WHAT_IS_AN_INVOICE: GridItem[] = [
  {
    lead: "The commission, almost certainly not",
    body: "It is created by a closing and it is paid out of that closing by whoever is running it, on a date fixed by the transaction rather than by you. The mechanics differ by state, by closing agent and by brokerage agreement, and this page does not describe yours. What is worth noticing is only this: the thing you are owed is not a document you send and then chase, so a product built around sending and chasing is not aimed at it.",
  },
  {
    lead: "The referral fee, yes",
    body: "You sent somebody to another brokerage, they closed it, a fee was agreed. That is a claim you have to make, to a business that has no automatic reason to tell you the day it happened. Federal law names this arrangement specifically and permits it, which makes it one of the few genuinely ordinary receivables in the whole trade, and one of the easiest to forget exists.",
  },
  {
    lead: "Everything you charge a fee for, yes",
    body: "Rental placements, property management, marketing work billed separately, a service somebody engaged you for. These are ordinary invoices with ordinary terms and they behave the way invoices behave everywhere else, which is why the general advice about invoicing applies to them and only to them.",
  },
  {
    lead: "The money that is not yours, separately",
    body: "Anything you hold on behalf of somebody else is governed by state rules about separate accounts and about not mixing it with your own, and those rules are not summarised here because they are specific to your state and to your licence. Ask your attorney rather than a website, and treat any product that offers to sit between you and that account as a question rather than a feature.",
  },
];

/** SCENE copy — funds availability. Cited data graphic ONE.
 *
 * Regulation CC, 12 CFR part 229, read on law.cornell.edu, three sections:
 *
 *   229.10(b)(1): "A bank shall make funds received for deposit in an account by an electronic
 *   payment available for withdrawal not later than the business day after the banking day on
 *   which the bank received the electronic payment." And (b)(2), which is what "received" means:
 *   "An electronic payment is received when the bank receiving the payment has received both
 *   (i) Payment in actually and finally collected funds; and (ii) Information on the account and
 *   amount to be credited."
 *
 *   229.12(b): a depositary bank shall make funds deposited by a local check available "not later
 *   than the second business day following the banking day on which funds are deposited".
 *
 *   229.13(b): "Sections 229.10(c) and 229.12 do not apply to the aggregate amount of deposits by
 *   one or more checks to the extent that the aggregate amount is in excess of $6,725 on any one
 *   banking. day." (The stray full stop is in the source.) And 229.13(h)(4): "a 'reasonable
 *   period' is an extension of up to one business day for checks described in 229.10(c)(1)(vi),
 *   five business days for checks described in 229.12(b)(1) through (4)".
 *
 * THE THIRD BAR IS DERIVED AND THE DERIVATION IS STATED, here and in the basis line: 229.12(b)'s
 * second business day plus 229.13(h)(4)'s extension of up to five business days for exactly that
 * class of cheque is the seventh business day. Nothing else on the chart is arithmetic.
 *
 * NO AXIS MAXIMUM because these are counts of business days rather than shares of anything, and
 * the smallest bar is one seventh of the largest, which renders short rather than as a hairline.
 *
 * WHY THE THIRD BAR IS LIT: because it is the one that describes a brokerage. A commission cheque
 * is a large deposit by construction.
 *
 * AND THE THING THE NOTE HAS TO SAY, because a chart of a legal schedule invites exactly the
 * wrong reading: these are CEILINGS the regulation permits, not observations of any bank. */
export const AVAILABILITY = {
  eyebrow: "The evidence",
  caption: "The latest a bank may make a deposit available to you",
  bars: [
    { label: "An electronic payment, once the bank has the funds", value: 1, display: "1 business day" },
    { label: "A local cheque", value: 2, display: "2 business days" },
    { label: "The part of a cheque above $6,725 in one day", value: 7, display: "up to 7" },
  ],
  lit: 2,
  basis:
    "Business days from deposit to the money being available for withdrawal, as permitted by Regulation CC. The first two are the deadlines the regulation sets outright. The third is the second business day plus the extension of up to five business days the same regulation allows once the large deposit exception is invoked, which is the exception that applies to the amount above $6,725 deposited by cheque on one banking day.",
  sourceText:
    "12 CFR 229.10(b), 229.12(b) and 229.13(b) and (h)(4), Regulation CC, availability of funds and collection of checks.",
  sourceHref: "https://www.law.cornell.edu/cfr/text/12/229.12",
  note: "Read every bar as a ceiling rather than as a measurement. This is the latest a bank is permitted to make the money available, not what your bank does, and plenty of banks are faster than the regulation requires on plenty of deposits. One detail is worth carrying anyway, because it is the one that catches people out. An electronic payment's clock does not start when the sender presses send: the regulation says the payment is received when the receiving bank has both the funds in finally collected form and the information about which account to credit, so a transfer initiated late on a Friday can be a Tuesday. And the subpart these rules sit in is titled availability of funds and disclosure of funds availability policies. The second half of that title is the useful one. Your bank has a written policy of its own inside these limits, and that document, rather than this chart, is what governs your account.",
};

/** SCENE copy — the same day rail. Cited data graphic TWO.
 *
 * Nacha, "Same Day ACH", read on nacha.org. Nacha writes the ACH network's operating rules, so
 * this is the rule-making body describing its own rule rather than a vendor describing a market.
 *
 * The two operative lines, quoted from Nacha's own timeline on that page: against 2020, "Same Day
 * ACH Dollar Limit per Transaction increased from $25,000 to $100,000"; against 2022, "Same Day
 * ACH Dollar Limit per Transaction increased from $100,000 to $1 million".
 *
 * NO AXIS MAXIMUM because these are dollar amounts rather than shares. The smallest bar is 2.5
 * percent of the largest and renders as a short bar rather than as a hairline, checked on the
 * shipped chart at 390 and at 1440.
 *
 * WHY THE THIRD BAR IS LIT: it is the one that changes what a brokerage can do, because it is
 * the first ceiling that clears an ordinary commission payment.
 *
 * THE ANNOUNCED FURTHER INCREASE IS IN THE NOTE AND NOT ON THE CHART. The same page carries a
 * banner announcing a rise to ten million dollars, with no effective date visible on the page,
 * and drawing an announced number beside three that have taken effect would put a plan on the
 * same axis as a fact. */
export const SAME_DAY = {
  eyebrow: "The evidence",
  caption: "What one same day ACH payment is allowed to carry",
  bars: [
    { label: "From 2020", value: 100000, display: "$100,000" },
    { label: "From 2022", value: 1000000, display: "$1 million" },
  ],
  lit: 1,
  basis:
    "The per payment ceiling on a same day ACH credit, on the dates Nacha's own timeline gives for each increase. Nacha writes the operating rules for the ACH network, so this is the rule maker stating its own limit rather than a provider describing the market. The bars are dollar amounts, so the axis runs to the larger of them.",
  sourceText: "Nacha, Same Day ACH, network timeline of per transaction dollar limits.",
  sourceHref: "https://www.nacha.org/content/same-day-ach",
  note: "Two bars rather than three, and the missing one is worth saying out loud. Nacha's timeline records the same ceiling at $25,000 before 2020, and drawn against a million that is two and a half percent of the track, which renders as a dot rather than as a bar and would read as nothing at all. It is here in writing instead. What none of these numbers tells you is whether your own bank offers same day origination on your account, at what daily cut-off, and at what fee, and those three answers are the whole difference between a rail existing and a rail being available to you. Ask your bank rather than reading them off this page. Nacha's page also carries an announcement that the ceiling is going to ten million dollars, which is not drawn here because an announced number and a number in force are different things.",
};

/** SCENE copy — the four rails and what each one actually is.
 *
 * The card bodies carry the primaries the article quotes elsewhere rather than restating the
 * paragraphs around them: this scene REPLACES the list that would otherwise have been prose. */
export const RAILS: GridItem[] = [
  {
    lead: "A wire",
    body: "Under the funds availability rules a wire is an electronic payment, so the deadline for it to be available is the business day after your bank has both the money in finally collected form and the instructions about where to put it. It is the fastest ordinary way a large sum reaches a business account, it is priced accordingly at both ends, and the speed is exactly why it is the rail that fraud aims at.",
  },
  {
    lead: "ACH",
    body: "The cheap rail, run to rules written by Nacha rather than by any one bank, and the one most brokerages use without ever asking what tier of it they are on. There is a same day version with a published per payment ceiling and there is the ordinary version, and the difference between them on a Friday afternoon is several days of your money sitting somewhere else.",
  },
  {
    lead: "A cheque",
    body: "Still the default in a great deal of this industry, and the only rail on this list where the amount changes the timing. The availability schedule stops applying to the part of a deposit above a stated dollar figure, and a brokerage cheque is above it as a matter of course, so the regulation's ordinary two day promise is not the promise you are getting.",
  },
  {
    lead: "A card",
    body: "The convenient rail for the small end: a deposit, an application fee, a management charge. It is the only one of the four whose fee is visibly a percentage, which is why it is the only one anybody is ever tempted to pass on to the customer, and it is therefore the only one with a New York statute attached to what you are allowed to do about that.",
  },
];

/** SCENE copy — the fraud numbers. Cited data graphic THREE.
 *
 * Federal Bureau of Investigation, Internet Crime Complaint Center, "2024 Internet Crime Report",
 * read in the Bureau's own PDF with pdftotext.
 *
 * The overall scale, quoted from the report's own accessibility description of its headline
 * figure: "In 2024, complaints totaled 859,532, with losses of $16.6 billion, representing a 33
 * percent increase from 2023. 256,256 complaints reported an actual loss. For complaints, the
 * average reported loss was $19,372."
 *
 * Business email compromise, from the two crime type tables: 21,442 complaints, and losses of
 * $2,770,151,146.
 *
 * The three bars are the Financial Fraud Kill Chain figures, quoted: "Chart describes FFKC
 * activity in 2024: 3,020 complaints attempted for $848.4 million. Domestic: 2,651 complaints,
 * $469.1 million frozen; International: 369 complaints, $92.5 million frozen; 66% success rate."
 *
 * THE TWO FROZEN FIGURES ARE DRAWN SEPARATELY RATHER THAN SUMMED, because the report publishes
 * them separately and a summed bar would be a number of mine standing beside two of theirs.
 *
 * A DEFINITIONAL POINT THAT BELONGS IN THE PROSE AND NOT ON A CHART: the report's own glossary
 * defines its Real Estate crime type as "Loss of funds from a real estate investment or fraud
 * involving rental or timeshare property", and its worked example of a spoofed closing wire sits
 * under business email compromise instead. Drawing the two counts side by side would invite
 * exactly the wrong inference, so the distinction is made in the text.
 *
 * NO AXIS MAXIMUM because these are dollar amounts. */
export const KILL_CHAIN = {
  eyebrow: "The evidence",
  caption: "Money the FBI was asked to freeze in 2024, and what it froze",
  bars: [
    { label: "Reported to the kill chain across 3,020 complaints", value: 848.4, display: "$848.4m" },
    { label: "Frozen, domestic", value: 469.1, display: "$469.1m" },
    { label: "Frozen, international", value: 92.5, display: "$92.5m" },
  ],
  lit: 0,
  basis:
    "Dollars in millions, from the 2024 figures for the Financial Fraud Kill Chain, the process the Bureau uses to ask a receiving bank to freeze a fraudulent transfer. The first bar is what was reported to it across 3,020 complaints. The second and third are the amounts frozen on domestic and on international requests, published separately by the Bureau and left separate here. The Bureau states a 66 percent success rate for the year.",
  sourceText: "Federal Bureau of Investigation, Internet Crime Complaint Center, 2024 Internet Crime Report.",
  sourceHref: "https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf",
  note: "Two cautions and one reason this is on the page at all. The first caution is that everything in this report is a complaint somebody filed rather than an audited figure, and the report says so about its own data. The second is that a freeze is not a recovery: it stops money moving on while the rest is worked out. The reason it is here is the shape of the first bar against the other two, which is what happens to a payment once it has left. There is also no figure anywhere in that report, or anywhere in this article, for how much of this touches a brokerage specifically, because the report does not count it that way: its own real estate category is defined as something else entirely, so the property version of this crime is inside the business email compromise total rather than beside it.",
};

/** SCENE copy — the staged exchange.
 *
 * STAGED AND SAID TO BE STAGED in the `note`, which the primitive requires. No company name, no
 * person, no address, no invoice number and no amount appears in it. Rounds E and F both found
 * fabricated specifics live on service pages, once as three invented street addresses and once as
 * an invented person with an invented "verified" telephone number, and the cheapest way not to
 * repeat that is to write an illustration with nothing in it to fabricate.
 *
 * THE POINT OF THE TRANSCRIPT is the second event. The charge is not created by the invoice. It
 * is created by an event in a building you cannot see, and the only automation that matters here
 * is the thing that goes and asks. */
export const THE_CHASE = {
  eyebrow: "The mechanic",
  heading: "The first Tuesday of the month.",
  layout: "bubbles" as const,
  note: "A staged illustration, not a real exchange. There is no company, person, amount or reference in it because none of them would be real. The sequence is the one the service page describes.",
  themLabel: "The other brokerage",
  usLabel: "Your office",
  turnsHeading: "The exchange",
  eventsHeading: "What happened on your side",
  turns: [
    {
      who: "us" as const,
      at: "9:04 am",
      text: "Morning. Checking in on the referral we sent over in February. Has it gone to contract or closed?",
    },
    { who: "them" as const, at: "2:41 pm", text: "closed in july! sorry, thought accounting had sorted you out" },
    {
      who: "us" as const,
      at: "2:42 pm",
      text: "No problem at all. Sending the invoice now against the agreement we signed in February. Who is the best person for it to go to?",
    },
    { who: "them" as const, at: "3:10 pm", text: "send it to me, i will walk it over" },
  ],
  events: [
    {
      at: "First Tuesday",
      label: "The asking is the automation",
      detail: "Nothing here was waiting for an invoice to be chased. It was waiting for somebody to ask whether the thing that creates the charge had happened yet, and that question is on a schedule rather than on a memory.",
    },
    {
      at: "2:41 pm",
      label: "The event is recorded, not the reply",
      detail: "What goes into the system is that the transaction closed and when, because that date is what the charge attaches to. The apology is not data.",
    },
    {
      at: "2:42 pm",
      label: "The invoice is raised against the agreement",
      detail: "Not against a conversation. The referral agreement is the document that makes this collectable, and the invoice quotes it, because the person who eventually pays it will not have been in this exchange.",
    },
    {
      at: "3:10 pm",
      label: "The chasing starts here, and only here",
      detail: "Everything the ordinary invoicing advice is about begins at this point, which is four months after the money was earned. That gap is the part of this subject nobody writes about.",
    },
  ],
};

/** SCENE copy — the path one payment actually takes.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. 33 characters lost a letter on the reactivation post;
 * "In somebody else's" is 18. */
export const MONEY_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The event", connects: "In somebody else's" },
  { label: "The record", connects: "Somebody has to ask" },
  { label: "The charge", connects: "Against an agreement" },
  { label: "The rail", connects: "Wire, ACH, cheque, card" },
  { label: "The clearing", connects: "One to seven days" },
  { label: "The match", connects: "Bank against ledger" },
];

/** SCENE copy — three ways a working build produces nothing.
 *
 * Deliberately not the limits section restated: limits are what the product cannot do, and these
 * are what a build that works perfectly still fails to deliver. Also deliberately not topic 16's
 * three, which are about proposals, holds and chases; these are about triggers, evidence and
 * reconciliation. */
export const WASTED: GridItem[] = [
  {
    lead: "The trigger is a date, not an event",
    body: "A sequence that begins when somebody remembers to press a button has automated the reminders and left the expensive part alone. The whole difficulty in this topic is that the moment worth reacting to happens in an office that is not yours, so anything that starts from your own action is starting too late by definition.",
  },
  {
    lead: "It decides it was paid from an email",
    body: "Somebody writes that the payment has gone out and the record closes. It has not gone out, or it has gone out on a rail that takes four more days, or it has gone out to a different account. A system that treats a sentence as a receipt produces a ledger that is confidently wrong, which is worse than one that is obviously incomplete.",
  },
  {
    lead: "The ledger and the bank never meet",
    body: "Every invoice sent, every reminder timestamped, and nobody has compared any of it to what actually landed in the account. Reconciliation is the least interesting thing in this whole subject and it is the only step that turns a record of what you asked for into a record of what you have.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Fifteen scenes, zero components, no film. */
export const INVOICING_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings, $2,500, 0.3 percent, 3 business days, 20
   * sources and 1 of three. This one is a ZERO, and it is the first: the number of invoices that
   * were raised for a fee that had been earned five months earlier. */
  hero: {
    moment: "0",
    suffix: "invoices",
    /** NOT either plate and not the cover. The plates are an adding machine and a cash register,
     * the cover is the register keys, so nothing appears twice anywhere on this post. An empty
     * till is texture behind type here rather than a subject. */
    photo: "/images/editorial/till-drawer.jpg",
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
    "what-is-an-invoice": {
      kind: "grid",
      band: "dark",
      eyebrow: "Four kinds of money",
      heading: "Only two of these behave like an invoice.",
      columns: 2,
      glow: true,
      items: WHAT_IS_AN_INVOICE,
      label: "What is an invoice",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from 12 U.S.C. 2607(b). Quoted rather than paraphrased because the operative
       * words are "other than for services actually performed", and every summary of RESPA
       * paraphrases them into something softer. */
      text: "No person shall give and no person shall accept any portion, split, or percentage of any charge made or received for the rendering of a real estate settlement service in connection with a transaction involving a federally related mortgage loan other than for services actually performed.",
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/adding-machine.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS and which contains the 21:9
      // crop a laptop ships. Measured in round F: the Plate primitive renders 2.33 at 1440 and
      // 1.78 at 390, so the phone sees a taller slice. The taller crop adds the bottom row of
      // number keys and the two arrow-marked keys at the foot of the right hand column, and the
      // narrow ruled window along the top. Only legible key markings are named.
      alt: "The keyboard of an old blue-grey mechanical adding machine photographed square on, several columns of round cream number keys running from nine at the top down to three, a narrow ruled window with printed digits along the top edge, a right hand block of larger cream keys marked with a division sign, a STOP key, a minus sign, a NON SHIFT key, a plus sign and a key marked NEG with a cross on it, two more keys below them marked with arrows pointing left and right, and a single column of number keys down the far right edge",
      caption:
        "Every key on this machine does one thing and does it visibly, and the paper roll behind it exists so that somebody can go back afterwards and see how a total was arrived at. That second half is the part worth keeping. A payment system that cannot show you what a figure is made of has not saved you the arithmetic, it has only moved it somewhere you cannot check it.",
      credit: "Photograph by Les Chatfield, CC BY 2.0.",
      ariaLabel: "The keyboard of a mechanical adding machine",
    },
    availability: {
      kind: "statbars",
      band: "dark",
      label: "When it is yours",
      ...AVAILABILITY,
    },
    rails: {
      kind: "grid",
      band: "dark",
      eyebrow: "Four ways money arrives",
      heading: "The rail decides the timing, the price and the risk.",
      columns: 2,
      items: RAILS,
    },
    "same-day": {
      kind: "statbars",
      band: "light",
      label: "The fast rail",
      ...SAME_DAY,
    },
    "kill-chain": {
      kind: "statbars",
      band: "dark",
      label: "The wrong account",
      ...KILL_CHAIN,
    },
    "the-chase": {
      kind: "conversation",
      band: "light",
      label: "The ask",
      ...THE_CHASE,
    },
    "money-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "From something happening to money you can spend.",
      lede: "Six hops, and every product in this category is sold on the third. The first two are where the money is actually lost, because an event nobody recorded cannot be charged for, and the last two are where a business finds out whether the third one worked. Note that only the middle two happen inside your own office.",
      steps: MONEY_PATH,
      altPrefix:
        "The path from an event in somebody else's office, through recording it and raising a charge against an agreement, to a payment rail, a clearing period and a reconciliation against the bank",
    },
    "events-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many things happen in a year that your office hears about late?",
      ariaLabel: "How many chargeable events your office learns about late",
      inputs: [
        {
          kind: "range",
          id: "events",
          label: "Things you could raise a charge for in a year",
          hint: "Closings, referrals you sent out, rental placements, management months, and anything else you charge a separate fee for. Count events rather than dollars.",
          min: 10,
          max: 400,
          step: 5,
          initial: 60,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "outside",
          label: "Share that happen somewhere other than your own office",
          hint: "A closing run by a title company or an attorney counts. A referral closed by another brokerage counts. A rental you placed yourself does not.",
          min: 10,
          max: 100,
          step: 5,
          initial: 60,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "untold",
          label: "Share of those where nobody tells you on the day",
          hint: "Not out of bad faith. The person who knows has closed a file and moved on, and telling you was nobody's job.",
          min: 5,
          max: 100,
          step: 5,
          initial: 45,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes to reconstruct one afterwards",
          hint: "Finding the agreement, working out what was owed, establishing when it happened, and asking somebody to confirm it.",
          min: 5,
          max: 90,
          step: 5,
          initial: 20,
          format: "count",
          width: "w-[4rem]",
        },
      ],
      chain: [
        { label: "Chargeable events in a year", by: { from: "input", id: "events" }, format: "count", unit: "events" },
        { label: "Happening outside your office", by: { from: "input", id: "outside" }, format: "count", unit: "events" },
        {
          label: "Where nobody tells you on the day",
          by: { from: "input", id: "untold" },
          format: "count",
          /** SHORT ON PURPOSE. A chain unit renders inside a shrink-0 cell and cannot wrap;
           * round E shipped 66px and 32px of horizontal overflow from exactly this. The
           * explanation belongs in the row label on the left, which does wrap. */
          unit: "unlogged",
        },
        { label: "At your reconstruction time", by: { from: "input", id: "minutes" }, format: "count", unit: "minutes" },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours a year",
        },
      ],
      headline: 2,
      resultLabel: "Chargeable events a year your office hears about late",
      note: "The headline is the third row rather than the hours, and the hours row is doing deliberate work underneath it. At the settings this opens with, the reconstruction adds up to a number of hours that would not survive a budget meeting, and that is the point: the cost of this is not the time. It is that some of those events carried a fee and the fee was never raised, and there is no way to work out from a spreadsheet which ones. Shares produce fractions, and half an event is not a thing, so read anything with a decimal in it as a rough count. Four things this deliberately refuses. There is no dollar value per event, because it depends entirely on which kind of event it was. There is no share of invoices that go unpaid, and the reason is narrower than it first looked. Figures for that do exist and the most prominent of them does state a sample: the QuickBooks Small Business Late Payments Report describes itself as based on a 2025 survey of more than two thousand small businesses, published by a company that sells invoicing software. What none of them measures is WHY, which is the thing this page needed and the thing the old version of this service page asserted. There is no recovery rate for a reminder sequence for the same reason, and none of it is about a brokerage. And there is no row for your commission, because this article does not claim to know how that arrives where you are.",
      action: { label: "See how it is built", href: "/services/invoicing-and-payments" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Send us the list of things your business charges a separate fee for. We will send back which of them are ordinary invoices that a reminder sequence genuinely helps with, and which of them are events in somebody else's office that need asking about instead, because those two need completely different work and they get sold as one product.",
      reassure:
        "It is a short reply from a person, it costs nothing, we do not need access to your accounting, and a list written on the back of an envelope is enough to answer it.",
      action: { label: "Send us the list", href: "/connect" },
      ariaLabel: "Send us the list of what you charge for",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/register-keys.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS. The taller crop carries the
      // row of small round keys along the bottom and more of the machine's scrolled iron frame,
      // neither of which is in the 21:9 slice. Only legible markings are named.
      alt: "A close view of the keys of an antique cash register, round enamelled key tops on brass stalks standing above a polished wooden case, several of them numbered 90, 80, 70, 9 and 8 in dark blue on white, three red keys at the left reading $9, $8 and a 7 cut off by the frame edge, a knurled brass key in the middle with RECEIPT printed across its white top, and a small glass display window at the top right corner showing the letters Cen",
      caption:
        "Every round key on this machine sets an amount, and one of them does something else entirely: it prints the evidence. On a mechanical register, entering the figure and producing the receipt are two separate actions, deliberately, because a number somebody typed and a record somebody can hold are different objects. A payments build that closes a receivable on the strength of an email has collapsed those two back into one.",
      credit: "Photograph by Steve Snodgrass, CC BY 2.0.",
      ariaLabel: "The keys of an antique cash register",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 16: on light, the cost section, the
       * limits section and the how-to run as one long pale band. Flipping this one breaks it. */
      band: "dark",
      eyebrow: "Three ways a working build produces nothing",
      heading: "None of them are the reminders.",
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
      text: "Write down every arrangement you are currently a party to where somebody else's event is what makes you money. Referrals you have sent out, deals somebody else is closing, work you have done that gets billed when a transaction lands. Then write beside each one how you would find out that it happened. If the honest answer for any of them is that somebody would probably mention it, that is the one worth a phone call this week.",
      actions: [
        { label: "See it on the AI page", href: "/ai#pay", variant: "light" },
        { label: "How it is built", href: "/services/invoicing-and-payments", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because the work divides in two and only you know the split: the ordinary invoicing half is short and standard, and the half that goes and asks other people's offices whether something has happened is bespoke to who those offices are and how they answer. The AI audit is an hour, done with you, and for this topic it starts with the list of things you charge for rather than with any software.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-counts-as-an-invoice-in-a-brokerage-and-what-does-not": "What is an invoice",
    "what-this-article-refuses-to-tell-you-about-your-commission": "What it refuses",
    "the-law-that-decides-who-you-may-pay-and-who-may-pay-you": "Who you may pay",
    "paid-is-three-different-days-and-only-one-of-them-is-yours": "Three days",
    "what-each-rail-costs-and-what-you-are-allowed-to-pass-on": "The rails",
    "the-payment-instruction-that-was-not-from-your-client": "The wrong account",
    "what-a-payments-build-can-honestly-do-in-a-brokerage": "What it does",
    "why-the-chasing-is-the-small-half": "The small half",
    "how-to-test-one-before-you-buy-it": "Test one yourself",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
