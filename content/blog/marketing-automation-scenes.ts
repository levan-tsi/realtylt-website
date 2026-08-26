/** Scene copy for the marketing automation flagship post (topic 13).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Thirteenth topic on the flagship template and the TWELFTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 12. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/marketing-automation.ts.
 * Nothing here claims a capability that page does not claim.
 *
 * THE DELIBERATE DISTANCE FROM THREE SIBLINGS, NOT ONE. This is the most crowded neighbourhood
 * in the cohort and all three neighbours were read in full before a word was written.
 *
 *   TOPIC 5, workflow automation, owns BUSYWORK: the manual step, what an interruption costs,
 *   the chain that fires by itself, the platform that switches a chain off at a 95 percent error
 *   rate. Its evidence is a timed field study of desk workers. None of that appears here, and
 *   this article never argues that automation saves you time.
 *
 *   TOPIC 3, database reactivation, owns THE OLD LIST and the consent clock: the eighteen month
 *   and three month windows in 47 CFR 64.1200(f)(5), the autodialer rule, revocation, and the
 *   five hundred dollars a message in 47 U.S.C. 227(b)(3). This article does not touch the
 *   telephone at all.
 *
 *   TOPIC 6, review automation, owns THE ASK: when to request a review, where Google's line
 *   between asking and gating falls, and the FTC rule about reviews on your own site.
 *
 *   THIS post is about the four things a campaign decides on your behalf, and about the fact
 *   that a company you have no relationship with decides whether the result is seen at all. Not
 *   the work. Not the list. Not the ask. The distribution.
 *
 * Nothing on this website has previously mentioned CAN-SPAM, deliverability, authentication, a
 * spam rate or an open rate. Checked by grep across every post body before this file was
 * written, which is why this topic gets to be about them.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. The permission that is
 * not required, the ceiling that is, and the measurement that is not one. */
export const IN_SHORT: string[] = [
  "The federal statute that governs commercial email does not require anybody's permission to send it. It requires that the message says what it is, carries a physical address, and offers an exit that keeps working for at least thirty days. Permission is not the law's demand. It is the mailbox providers' demand, and they are stricter.",
  "Google and Yahoo both publish the same ceiling for how often people may report you: three tenths of one percent. On Google's page it sits in the requirements for all senders rather than in the bulk section, so a one person office is inside it. On a list of a thousand, three complaints is the whole allowance.",
  "The number you cannot work out is your own. Yahoo states that the rate is calculated in their system on mail delivered to the inbox, which is a denominator no sender can see. What you can do is send less to fewer people more carefully, which is the entire craft.",
];

/** SCENE copy — what this is, by what it is not.
 *
 * The three nearest siblings, and this article's own territory stated by contrast. The cards do
 * NOT summarise the other articles: each one names the question that article answers and then
 * says which question is left over, which is the seam rather than a precis. */
export const NOT_THE_OTHERS: GridItem[] = [
  {
    lead: "Not the busywork",
    body: "A chain that fires when a form is submitted, so that nobody has to copy a name into a second system, is a real and valuable thing and it is a different product. That question is about work, and it is answered by whether a step a person used to do now happens without them. Nothing in this article will save you an hour.",
  },
  {
    lead: "Not the old list",
    body: "Going back to people who contacted you years ago and went quiet is its own project with its own rules, and the rules have dates in them. That question is about permission that may have gone stale. This one assumes the permission is current and asks the harder thing: what you send those people, how often, and whether it reaches them.",
  },
  {
    lead: "Not the ask",
    body: "Requesting a review at the right moment is a single message with a single job and a bright legal line running through the middle of it. That question is about one moment. This one is about the two hundred moments in between, where there is no event to react to and you are deciding whether to be in somebody's morning at all.",
  },
];

/** SCENE copy — the four decisions a campaign makes on your behalf.
 *
 * This is the article's definition, staged rather than stated. Deliberately four rather than
 * three: audience, message and timing are the three every vendor page lists, and the fourth is
 * the one none of them do, which is the whole reason this article exists. */
export const FOUR_DECISIONS: GridItem[] = [
  {
    lead: "Who it goes to",
    body: "The audience is a query, and a query written once runs forever against a database that keeps changing. The person who bought last spring is still matching the buyer segment because nobody wrote the rule that takes them out of it. When a campaign embarrasses somebody it is far more often because of who it reached than because of what it said, and the audience is the half nobody opens again.",
  },
  {
    lead: "What it says",
    body: "The only part anybody edits, and the part that carries the least risk when it is wrong. A dull message to the right person on the right morning is forgettable. A brilliant message to somebody who bought through you in March reads as evidence that you do not know who they are, and being forgotten is a far cheaper outcome than that.",
  },
  {
    lead: "When it arrives",
    body: "Behaviour triggers move this from a calendar to a reaction, which is a genuine improvement and is also where the strangeness comes from. Somebody looks at three listings on a Sunday evening, and what arrives on Monday tells them exactly how closely they are being watched. How long to wait is a design decision, and it is a decision whether or not anybody makes it on purpose.",
  },
  {
    lead: "Whether it arrives at all",
    body: "This is the one nobody chooses, and it is decided by a company you have no contract with, using a rule they publish and a number they will not show you. It is the reason the other three matter more than they look: every one of them is an input into a reputation you cannot inspect, and the effects arrive weeks later on a different send.",
  },
];

/** SCENE copy — what is inside a commercial email besides the message. Cited data graphic ONE.
 *
 * Steven Englehardt, Jeffrey Han and Arvind Narayanan (Princeton University), "I never signed up
 * for this! Privacy implications of email tracking", Proceedings on Privacy Enhancing
 * Technologies 2018 (1), pages 109 to 126. Read in the published PDF with pdftotext.
 *
 * The method, quoted from the paper: "Our crawler visited 15,700 sites and attempted to sign up
 * for emails on each of these. The resulting corpus contains 12,618 emails from 902 distinct
 * senders."
 *
 * The findings, quoted: "We find that 85% of emails in our corpus contain embedded third-party
 * content, and 70% contain resources categorized as trackers by popular tracking-protection
 * lists." And: "We find that about 29% of emails leak the user's email address to at least one
 * third party, and about 19% of senders sent at least one email that had such a leak. The
 * majority of these leaks (62%) are intentional, based on our heuristics."
 *
 * THREE BARS, NOT FOUR, AND THE REASON IS THE DENOMINATOR. The paper also reports that "11% of
 * links contain embedded content requests that leak the email address to a third party". That
 * figure is a share of LINKS, not of emails, so putting it beside three shares of emails would
 * draw four bars against two different denominators. It is in the prose instead. This is the
 * same discipline topic 11 applied to two disagreeing tables in one paper.
 *
 * AXIS PINNED TO 100 because these are shares of a whole. Left to scale itself the 85 would fill
 * the track and read as the maximum, and the empty right hand end of each track is the point.
 *
 * WHY THE THIRD BAR IS LIT: it is the one about the reader's own clients rather than about
 * advertising in general. */
export const TRACKING = {
  eyebrow: "The evidence",
  caption: "What a corpus of 12,618 commercial emails was carrying besides the message",
  bars: [
    { label: "Contained third-party content", value: 85, display: "85%" },
    { label: "Contained a known tracker", value: 70, display: "70%" },
    { label: "Leaked the recipient's address to a third party", value: 29, display: "29%" },
  ],
  max: 100,
  lit: 2,
  basis:
    "Three shares of the same corpus of 12,618 commercial emails from 902 senders, collected by a crawler that subscribed to mailing lists on 15,700 websites, then opened in a real email client while the network traffic was recorded.",
  sourceText:
    "Steven Englehardt, Jeffrey Han and Arvind Narayanan, I never signed up for this! Privacy implications of email tracking, Proceedings on Privacy Enhancing Technologies 2018.",
  sourceHref: "https://petsymposium.org/popets/2018/popets-2018-0006.pdf",
  note: "The authors state their own limit and it is the one that matters here: \"our corpus of emails is not intended to be representative, and we are unable to draw conclusions about the extent of tracking in the typical user's mailbox.\" So read this as what commercial mailing lists were doing rather than as what your own provider does. The study is also from 2018, and the third bar in particular describes a practice that mailbox providers have since made harder rather than one that has grown. What has not changed is the mechanism, and the mechanism is the reason it is here: none of this is added by the sender, all of it arrives with the tooling, and the researchers' own list of open questions includes whether a sender setting up a campaign is even told that the tracking is there.",
};

/** SCENE copy — how long you have to stop, according to the two documents that say. Cited data
 * graphic TWO.
 *
 * Two deadlines for the same act, from two primaries read in the original:
 *
 *   15 U.S.C. 7704(a)(4)(A)(i), quoted as written: it is unlawful "for the sender to initiate
 *   the transmission to the recipient, more than 10 business days after the receipt of such
 *   request, of a commercial electronic mail message that falls within the scope of the
 *   request."
 *
 *   Yahoo's published sender requirements, quoted as written: "Honor unsubscribes within 2
 *   days."
 *
 * THERE IS NO THIRD BAR FOR GOOGLE, and that absence was CHECKED rather than assumed. Google's
 * sender guidelines page was fetched and searched for any figure followed by "day" or "business
 * day": zero matches on the whole page. Google requires one-click unsubscribe and a visible
 * unsubscribe link and states no deadline in days at all. Recording that here because "the
 * vendor page does not say" is exactly the kind of grounds a previous round asserted without
 * looking, and it is the reason this chart has two bars rather than three.
 *
 * NO AXIS MAXIMUM. These are counts of days rather than shares of a whole, and 2 against 10 is
 * a fifth of the track, which renders as a short bar rather than as a hairline. */
export const DEADLINES = {
  eyebrow: "The evidence",
  caption: "How long you have to stop, after somebody asks you to",
  bars: [
    { label: "The federal statute, after an opt-out request", value: 10, display: "10 business days" },
    { label: "Yahoo, after an unsubscribe", value: 2, display: "2 days" },
  ],
  lit: 1,
  basis:
    "Two deadlines for the same act, each taken from the document that sets it. 15 U.S.C. 7704(a)(4), linked in the section above, makes a further commercial message unlawful more than ten business days after the request. Yahoo's published sender requirements, linked below, say to honor unsubscribes within two days.",
  /** SOURCE TEXT IS THE THING THE LINK POINTS AT, and nothing else. The first version read
   * "15 U.S.C. 7704(a)(4) and Yahoo Sender Best Practices. Google's sender guidelines state no
   * deadline in days." Rendered, the whole string is one hyperlink to Yahoo, so a sentence
   * making a claim about Google's page was underlined and pointing somewhere else. Found by
   * looking at the shipped chart rather than by reading the payload. The statement about
   * Google belongs in the note, where it already is. */
  sourceText: "Yahoo Sender Best Practices, honor unsubscribes within 2 days.",
  sourceHref: "https://senders.yahooinc.com/best-practices/",
  note: "The two bars are not in the same unit, and the difference runs in the safe direction: ten business days covers a longer stretch of calendar than ten days does, so the drawn gap is smaller than the real one rather than larger. There is no third bar for Google, and that is a checked absence rather than an omission: their sender guidelines page carries no figure in days anywhere on it. Read this as which document is actually setting your deadline, not as a scale of penalties. The statute is enforceable and the requirement is not, and the requirement is still the one that will change what happens to your mail.",
};

/** SCENE copy — three ways a correctly built campaign produces nothing.
 *
 * Deliberately not any sibling's three, and not a restatement of the limits section: the limits
 * are what the service cannot do, and these are the ways a competent build ends up worthless
 * anyway. All three are about the business rather than about the software. */
export const WASTED: GridItem[] = [
  {
    lead: "A segment nobody ever leaves",
    body: "Somebody defines the buyer audience on the day it is built and never writes the rule that removes a person from it. Two years later it contains everyone who has ever filled in anything, including the family whose closing you attended. Every campaign is then aimed at a group that has quietly stopped meaning anything, and the reporting will look fine because the reporting counts sends.",
  },
  {
    lead: "A sender address nobody owns",
    body: "The mail goes out from a subdomain a contractor set up, authenticated by records nobody in the business can read, and the reputation attached to it belongs to whoever last configured it. The day it goes wrong there is nobody to ask. This is dull, it takes an afternoon to fix while it is small, and it is unfixable in a hurry.",
  },
  {
    lead: "Reporting that measures the sending",
    body: "Sends, opens, clicks. All three are counts of what your own software did, and the first is entirely under your control. A dashboard built out of them will show a healthy campaign right up to the point where the mail stops arriving, because nothing in it is a measurement of the only thing that matters, which is whether a person read something and thought better of you for it.",
  },
];

/** SCENE copy — what actually happens between pressing send and being read.
 *
 * Six hops. The service page's own flow describes the trigger and the message; this adds the
 * three hops between the send and the inbox that no vendor page draws, because they are the ones
 * the sender does not control.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing
 * is clipped by the container edge at 390px. 33 characters lost a letter on the reactivation
 * post; "Something happened" is 18. */
export const EMAIL_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The trigger", connects: "Something happened" },
  { label: "The audience", connects: "Who still matches" },
  { label: "The send", connects: "Your software's last act" },
  { label: "The signature", connects: "Who says this is yours" },
  { label: "The judgement", connects: "Someone else's rule" },
  { label: "The inbox", connects: "Or the other folder" },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Twelve scenes, zero components, no film. */
export const MARKETING_AUTOMATION_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings and $2,500. This one is a threshold that two
   * of the largest mailbox providers in the world publish in the same words, and that almost
   * nobody sending marketing email has ever seen: keep your spam rate below 0.3 percent. */
  hero: {
    moment: "0.3",
    suffix: "percent",
    /** NOT either plate. A wall of numbered post office boxes is texture behind type rather
     * than a subject, and the two plates on this post are a flyer kiosk and a bank of index
     * drawers, so nothing is used twice on one page. */
    photo: "/images/editorial/post-office-boxes.jpg",
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
    "not-the-others": {
      kind: "grid",
      band: "dark",
      eyebrow: "Three things this is not",
      heading: "The neighbours own most of this street.",
      columns: 3,
      glow: true,
      items: NOT_THE_OTHERS,
      label: "What this is not",
    },
    "four-decisions": {
      kind: "grid",
      band: "dark",
      eyebrow: "What a campaign decides for you",
      heading: "Four decisions, and you only ever edit the second.",
      columns: 2,
      items: FOUR_DECISIONS,
      label: "The four decisions",
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/flyer-kiosk.jpg",
      // RE-CHECKED IN ROUND I AT THE 16:9 CROP, which is the one a phone ships and the vertical
      // superset of the 21:9 one this was originally written from. The legible fragments really
      // are on the sheets: GRADUATE SCHOOL, LSAT, MCAT, Are You Ready, FREE SCREENING, RENT, LIVE
      // CLOSE TO CAMPUS. There is no visible board behind them; the paper covers the whole frame,
      // which is the point of the caption. Two things the old alt missed: bright blue is one of
      // the loudest colours on the board and was not listed, and there are several sheets with
      // tear off tabs rather than one.
      alt: "A kiosk covered edge to edge in overlapping paper flyers in hot pink, magenta, bright blue, yellow, green, orange and white, several curling away from the surface, several carrying rows of tear off tabs, with fragments of wording legible across them including GRADUATE SCHOOL, LSAT, MCAT, Are You Ready, FREE SCREENING, RENT and LIVE CLOSE TO CAMPUS, and no bare board visible anywhere behind the paper",
      caption:
        "Every sheet here was written by somebody who had thought about it. Each one is addressed to nobody in particular, which is the only thing they have in common, and it is enough to make all of them invisible at once. This is what a database of people who half remember you sees when a broadcast arrives, and no amount of care inside one sheet fixes it.",
      credit: "Photograph by Richard Ha, CC BY 2.0.",
      ariaLabel: "A kiosk covered in flyers",
    },
    "email-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "From something happening to somebody reading it.",
      lede: "Six hops, and your software stops at the third. The last three are the ones that decide whether any of the first three mattered, they are performed by companies you have no agreement with, and the only one of them you can influence is the fourth. Everything written about marketing automation is about the first two hops.",
      steps: EMAIL_PATH,
      altPrefix:
        "The path from a trigger in your own software to a message being read, through the audience, the send, the authentication signature and somebody else's filtering judgement",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from the abstract of RFC 7489, the DMARC specification. It is quoted rather
       * than paraphrased because the whole deliverability industry sells the opposite of it. */
      text: "DMARC does not produce or encourage elevated delivery privilege of authenticated email.",
    },
    deadlines: {
      kind: "statbars",
      band: "dark",
      label: "The deadlines",
      ...DEADLINES,
    },
    tracking: {
      kind: "statbars",
      /** DARK, and it was LIGHT until the band probe was run. On light it sat inside a
       * 6,430px single-tone run, 22 percent of the article, because the calculator either side
       * of it is fixed light and so is prose. Flipped, the run is back inside the range every
       * shipped post is in. Both charts on this post are therefore dark, which is a different
       * arrangement from topic 12 in the same round (one light, one dark). */
      band: "dark",
      label: "What is inside",
      ...TRACKING,
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/index-drawers.jpg",
      // RE-READ IN ROUND I AT THE 16:9 CROP, which is the one a phone ships, and two things were
      // wrong. "Each drawer carrying a range of surnames" is false of the whole bottom tier: it
      // reads DISTRICT, blank, DISTRICT, HANSARD, HANSARD, HANSARD, HANSARD. And the handles are
      // long brass bail pulls on two posts, not cup handles. Both errors were repeated in
      // public/images/ATTRIBUTIONS.md and both are corrected there too.
      //
      // The caption also asserted WHY the ranges are uneven, which nothing in the frame supports.
      // The two filing schemes in one cabinet are visible, are a better fact, and are now what it
      // argues from.
      alt: "Three tiers of wooden card index drawers filling the frame, warm honey coloured varnished pine with long brass bail handles, each drawer carrying a small white card in a metal frame lettered by hand, the middle tier reading ranges of surnames such as ROC to RYZ and SAR to SGZ while the bottom tier reads DISTRICT twice and HANSARD four times with one card left blank, and a dark metal rack, a paler cabinet and a bundle of newspapers at the right hand edge",
      caption:
        "Somebody wrote every one of those labels by hand, and the bottom tier is not filed the way the tier above it is. One row runs in ranges of surnames; the row beneath it repeats two subject words and leaves a card blank. Two schemes in one cabinet is what a segment turns into, and it is the part of a campaign nobody revisits. A query written once keeps running against a database that will not stop changing underneath it.",
      credit: "Photograph by waferboard, CC BY 2.0.",
      ariaLabel: "A wall of index drawers",
    },
    "complaint-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many people have to press the button before you are over the line?",
      ariaLabel: "How many complaints reach the published ceiling",
      inputs: [
        {
          kind: "range",
          id: "list",
          label: "People you would send to",
          hint: "The list as it actually is, not the segment you intend to build.",
          min: 100,
          max: 20000,
          step: 100,
          initial: 1400,
          format: "count",
          width: "w-[5rem]",
        },
        {
          kind: "range",
          id: "covered",
          label: "Share whose mailbox is at a provider that publishes a ceiling",
          hint: "Gmail and Yahoo both publish the same figure. Count the domains in your own list rather than guessing at this one: it is an afternoon's work and it decides how much of this section applies to you.",
          min: 20,
          max: 100,
          step: 5,
          initial: 80,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "sends",
          label: "Sends in a month",
          hint: "Count everything, including the ones a sequence fires without anybody deciding.",
          min: 1,
          max: 12,
          step: 1,
          initial: 2,
          format: "count",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "People on the list", by: { from: "input", id: "list" }, format: "count", unit: "people" },
        {
          label: "Whose provider publishes a ceiling",
          by: { from: "input", id: "covered" },
          format: "count",
          /** SHORT ON PURPOSE. This read "messages the published rule covers" and pushed the
           * document to 352px at a 320 viewport, because a chain unit renders inside a
           * `shrink-0` cell and cannot wrap. Named by scripts/_scratch-e-overflow.mjs. The
           * explanation lives in the row LABEL on the left, which does wrap. */
          unit: "covered messages",
        },
        {
          label: "At the published ceiling",
          by: { from: "rate", value: 0.003, display: "0.3%, the figure Google and Yahoo both publish" },
          format: "count",
          unit: "complaints in one send",
        },
        { label: "Across a month of sending", by: { from: "input", id: "sends" }, format: "count", unit: "complaints a month" },
        { label: "Across a year", by: { from: "rate", value: 12, display: "12 months" }, format: "count", unit: "complaints a year" },
      ],
      headline: 2,
      resultLabel: "Complaints in one send that reach the published ceiling",
      note: "The headline is the third row rather than the yearly figure, because a single send is the unit a person actually decides about and because the number is small enough to be startling. Shares of people produce fractions, and half a complaint is not a thing; read two and a half as between two and three. Three things this deliberately refuses. It will not compute your actual spam rate, and it cannot: Yahoo states the rate is calculated in their system on mail that was delivered to the inbox, which is a denominator no sender can see, so what you have here is a ceiling expressed in your own units rather than a measurement of you. There is no open rate and no click rate anywhere in this chain, because the section above shows what an open actually counts and it is not attention. And there is no row for what a damaged sending reputation costs in money, because nobody has published a figure for that with a method under it and this article is not going to be the first to make one up.",
      action: { label: "See how it is built", href: "/services/marketing-automation" },
      secondary: { label: "Ask us to look at your sending", href: "/connect" },
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 12: on light, the cost section, the
       * limits section and the FAQ run as one long pale band. Flipping this one breaks the run. */
      band: "dark",
      eyebrow: "Three ways a good build produces nothing",
      heading: "None of them are the software.",
      columns: 3,
      items: WASTED,
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Send us the domain you send marketing email from and roughly how many people are on the list. We will tell you what your authentication records currently say, whether the address in your From line is aligned with them, and which of the two published requirements you are already meeting without knowing it.",
      reassure:
        "It is a short reply from a person, it costs nothing, everything we would read is published in public DNS, and we do not need access to your mailing tool or your list.",
      action: { label: "Ask us to look at your sending", href: "/connect" },
      ariaLabel: "Ask us to look at your sending",
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Open the last campaign you sent and read it as the person third from the bottom of the list, the one who bought through you two years ago and has not heard from you since except in a segment. If it does not survive that, the fix is not a better subject line. It is a smaller list, and a smaller list is the one change in this entire subject that costs nothing and works immediately.",
      actions: [
        { label: "See it on the AI page", href: "/ai#marketing", variant: "light" },
        { label: "How it is built", href: "/services/marketing-automation", variant: "outline-light" },
      ],
      footnote:
        "There is no price on this page because the cost tracks four things nobody can guess from an article: how many channels you want joined, whether your sending domain and its authentication already exist or have to be set up, how much of your contact data can be trusted enough to segment on, and whether anybody in the business will own the audience rules afterwards. The AI audit is an hour, done with you, and it starts by reading what your domain currently publishes about itself.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-marketing-automation-actually-is-once-you-take-the-busywork-out-of-it": "What it is",
    "the-law-that-governs-your-email-does-not-require-permission": "The law",
    "whether-your-market-note-is-an-advertisement-is-decided-by-its-subject-line": "The subject line",
    "the-companies-that-actually-decide-whether-your-mail-arrives": "Who decides",
    "the-requirement-everybody-files-under-bulk-sending-and-where-it-actually-sits": "The two lists",
    "what-spf-dkim-and-dmarc-assert-in-their-own-words": "The three records",
    "what-one-click-unsubscribe-actually-is-and-why-it-protects-you": "One-click exit",
    "three-tenths-of-one-percent-and-why-you-cannot-work-out-your-own": "The ceiling",
    "what-an-open-actually-measures": "What an open is",
    "why-the-second-campaign-is-harder-than-the-first": "Why it compounds",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-audit-your-own-sending-in-an-afternoon": "Audit your sending",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
