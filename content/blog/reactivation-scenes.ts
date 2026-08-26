/** Scene copy for the database reactivation flagship post.
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. This is topic 3 of the flagship template. Like topic 2 it adds no component of its own:
 * every scene below resolves to a primitive that already existed.
 *
 * SOURCE OF TRUTH for what the product does is content/services/database-reactivation.ts.
 * Nothing here claims a capability that page does not already claim. Where this piece goes
 * further than the service page it goes into GENERAL mechanics (why a list nobody works stays
 * unworked) or into published federal rules, never into new promises about our own stack.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { ConversationEvent, ConversationTurn, FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** The film. One definition, read by the scene that plays it AND by the VideoObject JSON-LD, so
 * the two can never disagree about length, dimensions or what the clip actually shows.
 *
 * This is the first of the three films built on REAL FOOTAGE rather than on a rendered stage.
 * The b-roll lives in scripts/film/footage and the cut is committed under
 * scripts/film/reactivation, so the artifact can be rebuilt from a clean checkout: vo.mjs
 * (generate and MEASURE the narration), bg.mjs (cut the picture bed to those measured
 * boundaries), render.mjs (draw the type on transparent PNGs), assemble.mjs (composite, mix,
 * encode, poster from frame zero).
 *
 * 1280x720 because that is the footage's native resolution and nothing in this film is
 * upscaled. */
export const REACTIVATION_FILM = {
  src: "/video/film-reactivation.mp4",
  poster: "/video/film-reactivation-poster.jpg",
  width: 1280,
  height: 720,
  seconds: 49,
  /** ISO 8601, which is the only duration format VideoObject accepts. */
  duration: "PT49S",
  name: "The lead from 2023 that nobody has called since",
  description:
    "A record sitting in a real estate CRM since 2023, and what an AI reactivation campaign does with it. The film covers the consent check that comes before any message is sent, including the three month window an inquiry buys under the federal do-not-call rules, the opener that references what that person originally asked about, and the small number of conversations that turn into a booked appointment.",
} as const;

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, for the reader who is skimming and for the assistants
 * that increasingly answer on somebody's behalf. Every line is argued in the body; a summary
 * that claims something the article does not support is how a summary box becomes a liability. */
export const IN_SHORT: string[] = [
  "The leads you already paid for are the cheapest pipeline you own, and almost nobody works them, because working them properly is repetitive misery rather than a discipline problem.",
  "Two thirds of sellers hire an agent who was referred by somebody they know, or one they had already worked with. Your database is the only version of that group you hold a list of.",
  "Before any of it there is a consent question with a date on it. An inquiry buys three months under the federal do-not-call rules, and an automated call or text to a mobile needs written consent that no amount of warmth substitutes for.",
];

/** SCENE copy — how sellers found their agent. The page's cited data graphic.
 *
 * REAL third-party data, and deliberately a different study from the one the other two flagships
 * lean on. Those cite HBR/Oldroyd on response speed, which is the wrong evidence for a piece
 * about a list that went cold two years ago.
 *
 * Figures are Exhibit 7-1, "Method used to find real estate agent", all sellers, from the
 * National Association of REALTORS 2025 Home Buyers and Sellers Generational Trends Report.
 * Methodology, from the report's own page: NAR mailed a 127-question survey in July 2024 to
 * 167,750 recent home buyers, received 5,390 responses, an adjusted response rate of 3.2
 * percent, covering the twelve months ending June 2024. Seller data comes from those buyers who
 * also sold a home.
 *
 * WHICH BAR IS LIT MATTERS. The accent is on "used the agent previously", not on the biggest
 * bar, because that is the one this piece is about. And the 4 percent bar for an agent making
 * contact is on the chart on purpose: it is the number that argues AGAINST cold outreach, and a
 * chart that only carries the flattering bars is an advert with axes. */
export const AGENT_SOURCE = {
  eyebrow: "The evidence",
  caption: "How sellers found the agent they hired",
  bars: [
    { label: "Referred by a friend, neighbor or relative", value: 38, display: "38%" },
    { label: "Used the agent previously to buy or sell", value: 28, display: "28%" },
    { label: "Referred by another agent or broker", value: 4, display: "4%" },
    { label: "Found them on a website", value: 4, display: "4%" },
    { label: "The agent made contact directly", value: 4, display: "4%" },
  ],
  /** Shares of a whole, so the axis runs to 100 rather than to the biggest bar. Scaled to its
   * own maximum, the 38 percent bar would be drawn full width, and a full-width bar reads as
   * "all of them". */
  max: 100,
  lit: 1,
  /** NAR's own category is "Referred by (or is) a friend, neighbor or relative", and the bar
   * label drops the "(or is)" only because it will not fit. It is restored here because it
   * matters in our favour: the largest bar includes the agent who WAS the friend or the
   * relative, which is a stronger version of the point this page makes, not a weaker one. */
  basis: "Share of all sellers surveyed. NAR's largest category is worded \"referred by (or is) a friend, neighbor or relative\", so it counts the agent who was already the friend. The remaining options each accounted for 3 percent or less.",
  /** The period is on screen deliberately. This report was published in 2025 but the survey
   * behind it was mailed in July 2024 and covers the twelve months to June 2024, and a reader
   * who assumes "2025 report" means "2025 data" has been misled by an accurate citation. NAR's
   * newer edition reports the same two categories at 37 and 29 percent, so the two thirds this
   * page argues from holds in both, but the numbers drawn here are this report's.
   *
   * The SELLER caveat was added 2026-08-03 after reading the methodology page. The survey was
   * mailed to recent BUYERS; NAR states plainly that "Information about sellers comes from
   * those buyers who also sold a home". So 5,390 is the buyer response count and the seller
   * sub-sample behind this exhibit is smaller than that. Printing the buyer figure under a
   * seller chart without saying so overstates the base, which is the sort of accurate-looking
   * citation that is still misleading. */
  sourceText:
    "National Association of REALTORS, 2025 Home Buyers and Sellers Generational Trends Report, Exhibit 7-1, covering the twelve months to June 2024. Survey mailed to 167,750 recent buyers, 5,390 responses; seller answers come from those buyers who also sold a home, so the seller base is smaller.",
  sourceHref:
    "https://cms.nar.realtor/sites/default/files/2025-03/2025-home-buyers-and-sellers-generational-trends-report-04-01-2025.pdf",
  note: "This measures how sellers found the agent they ended up hiring. It is not a measurement of how well any outreach method works, and it says nothing about reactivating a CRM. The reason it is here is the shape: the business goes to people who were already known, and the small bar for direct contact is the honest limit on that argument.",
};

/** SCENE copy — the four moves.
 *
 * Lifted from content/services/database-reactivation.ts (`howItWorks`, plus the opener language
 * in `faqs`) and put into the article's voice. The scene REPLACES the list rather than repeating
 * it, so these words appear exactly once on the page. */
export const FOUR_MOVES: GridItem[] = [
  {
    lead: "It goes through the whole list, not the top of it.",
    body: "Every dormant contact gets a genuine attempt rather than a blast. They are grouped by what they originally asked for and how long ago they went quiet, which is what lets the first message be specific instead of generic.",
  },
  {
    lead: "It opens with something that is true about them.",
    body: "It references what that person actually asked about, asks a real question rather than checking in, and takes no for an answer the first time it is given. The opener is the entire difference between a follow-up and spam.",
  },
  {
    lead: "It holds the conversation, by text and by phone.",
    body: "Is the move still on, what changed, what does the timeline look like now, is there a house to sell. It follows the answer instead of reading a script over the top of it, at whatever hour the reply happens to arrive.",
  },
  {
    lead: "It books the few who are ready, with the context attached.",
    body: "Most of the list will still say no, and that is the expected result rather than a failure. The handful whose circumstances moved get put on your calendar along with what they just said, so you walk in already knowing.",
  },
];

/** SCENE copy — the consent checklist. This page's actual contribution.
 *
 * The most generous thing this piece can do is hand the reader a test they can run on anybody
 * selling them a reactivation campaign, including us. Every item is a real, checkable action
 * with a real rule under it, and every rule was read in the regulation itself rather than in a
 * summary of it. Nothing here is legal advice and the body says so. */
export const CONSENT_CHECK: GridItem[] = [
  {
    lead: "Go and read the form they actually filled in.",
    body: "For an automated call or text the rule wants a signed agreement that says, in clear and conspicuous words, that you may use an automatic dialer or an artificial voice, and that agreeing is not a condition of getting anything. An electronic signature counts. A line saying you agree to be contacted almost certainly does not.",
  },
  {
    lead: "Check the date, not how warm it feels.",
    body: "An inquiry gives you three months of established business relationship. A closed transaction gives you eighteen. After that a number on the national registry is a number you may not solicit, and there is no version of that rule that cares how promising the lead looked in your CRM.",
  },
  {
    lead: "Decide how a no gets recorded before the first message goes out.",
    body: "Stop, quit, end, revoke, opt out, cancel and unsubscribe are opt-outs by definition, and so is anything else a person reasonably says. It has to be honored within ten business days, you cannot force people through one specific channel to do it, and it has to reach every list you hold rather than the one it arrived on.",
  },
];

/** SCENE copy — the teardown.
 *
 * An ILLUSTRATION of the pattern, not a recording of a real client, and the scene says so on
 * screen. Written to demonstrate exactly the behaviour the article argues for: the consent and
 * the date are checked before anything is sent, the opener names what this person originally
 * asked about, the reply is followed rather than steered, and the times offered are real.
 *
 * Drawn as bubbles rather than as a transcript: this exchange starts as a text message, and the
 * voice piece's call log would say the wrong thing about the channel. */
export const REVIVAL_TURNS: ConversationTurn[] = [
  {
    who: "us",
    at: "Tue 10:12 am",
    text: "Hi Dana, it is Levan's office. You asked us about Wappingers back in 2023. Is a move still on the table, or did that get shelved?",
  },
  {
    who: "them",
    at: "Tue 12:48 pm",
    text: "shelved for a while honestly. we have started talking about it again though",
  },
  {
    who: "us",
    at: "Tue 12:49 pm",
    text: "That happens more than you would think. Same area, or has that changed? And is this a buy, a sell, or both?",
  },
  { who: "them", at: "Tue 12:53 pm", text: "both. we would have to sell this one first" },
  {
    who: "us",
    at: "Tue 12:54 pm",
    text: "Then the useful first step is knowing what yours is worth now. Levan has Thursday at 5:30 or Saturday morning. Which is easier?",
  },
  { who: "them", at: "Tue 1:31 pm", text: "thursday works" },
];

export const REVIVAL_EVENTS: ConversationEvent[] = [
  { at: "Before any of it", label: "Consent and dates checked", detail: "What the 2023 form said, and whether a no had ever been recorded." },
  { at: "Tue 10:12 am", label: "Opened on their own question", detail: "Wappingers, because Wappingers is what they asked about." },
  { at: "Tue 12:49 pm", label: "Followed the answer", detail: "The house to sell is the news. The script would have missed it." },
  { at: "Tue 12:54 pm", label: "Offered real availability", detail: "Read off the calendar rather than proposed and confirmed later." },
  { at: "Tue 1:31 pm", label: "Written back to the CRM", detail: "The reply, the timeline and the second property, on the record." },
];

/** SCENE copy — the revival path.
 *
 * The compact abstraction, not a re-telling of the teardown: each hop names what it actually
 * CONNECTS TO, which is the part a conversation view cannot show. The consent hop is deliberately
 * second, because on this topic it is genuinely the second thing that happens. */
export const REVIVAL_PATH: { label: string; connects: string; at?: string }[] = [
  // THE FIRST CAPTION HAS TO BE THE SHORTEST. Every caption is centred under its node, and the
  // first node sits at the very start of the scroll container, so a caption wider than the node
  // spacing has nowhere to go on the left and is clipped by the container's own edge rather than
  // hidden behind a scroll affordance. "Your CRM, including the quiet half" lost its first
  // letter at 390px. Measured, not guessed: scripts/_scratch-r3-shots.mjs frames this scene.
  { label: "The list", connects: "Your CRM, all of it", at: "2023" },
  { label: "The check", connects: "What the form said" },
  { label: "The opener", connects: "What they asked for" },
  { label: "The reply", connects: "Text or phone" },
  { label: "The record", connects: "Every answer, including no" },
  { label: "The handoff", connects: "Booked time with a person", at: "Thu 5:30" },
];

/** SCENE copy — the three failure modes.
 *
 * Deliberately NOT the other two topics' failure modes. Those are about an assistant with
 * nothing wired to it, and about a phone agent that never hands off. These are the three ways a
 * reactivation campaign that works technically still costs you something. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "The whole list goes out on day one.",
    body: "Thirty thousand messages from a business number that has never sent one is not a campaign, it is a filtering event. The carriers make that decision quietly and they do not tell you, so the first thing you notice is that your ordinary messages to real clients stopped arriving.",
  },
  {
    lead: "The opener is about you.",
    body: "Just checking in. Wanted to touch base. Circling back. Those three phrases are what turns a follow-up into a blast, because none of them contain a single fact about the person receiving them. If the first line would work on anybody, it will work on nobody.",
  },
  {
    lead: "The answers get thrown away.",
    body: "A no with a reason attached is the most valuable thing the whole exercise produces. Bought last year. Waiting on rates. Moving out of state. That is a map of what your market is actually doing, written by the market, and most campaigns record it as a status change and delete the sentence.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Note what is NOT here: a component. Topic 1 shipped five bespoke scenes, topic 2 shipped zero,
 * and so does this one. The primitives were right.
 *
 * The film is this topic's OWN, and is the first built on real footage. Reusing either earlier
 * film was never an option: one is narrated around a buyer messaging a website at 11:40pm and
 * the other around a phone ringing at 9:42, and this piece is about a record that has not moved
 * since 2023. */
export const REACTIVATION_FLAGSHIP: FlagshipContent = {
  film: REACTIVATION_FILM,
  /** A year rather than a time of day, because the held moment on this topic is a date on a
   * record. The porchlight breath rather than the voice piece's ring: this is a light somebody
   * left on, not a phone nobody is answering. Breakneck Ridge rather than the twilight or the
   * night street, so the three heroes are three different photographs. */
  hero: {
    moment: "2023",
    suffix: "last contact",
    photo: "/images/hero/valley-aerial.jpg",
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
    /** The caption discloses that the narration is a voice clone, the same as the voice piece
     * does. It costs one sentence, and on a page arguing that the first message has to be honest
     * about who is sending it, leaving it out would be the exact thing the piece warns about. */
    reel: {
      kind: "film",
      band: "dark",
      label: "Watch it",
      ariaLabel: "Watch it work",
      eyebrow: "Watch it work",
      heading: "A record from 2023, and what happens when somebody finally opens it.",
      caption: [
        `Narrated, ${REACTIVATION_FILM.seconds} seconds. The voice reading it is a licensed clone of my own, which seemed worth saying rather than leaving you to wonder. The exchange is staged and the record is invented, but the two numbers in it are not: the two thirds is the survey cited below and the three months is the regulation quoted further down. The whole build is on the `,
        { href: "/services/database-reactivation", label: "service page" },
        ".",
      ],
    },
    "agent-source": {
      kind: "statbars",
      band: "light",
      label: "The evidence",
      ...AGENT_SOURCE,
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/counties/dutchess.jpg",
      // ROUND I re-read this at the 16:9 crop. Accurate but thin, so the picture went in. The
      // walkers on the deck matter to the caption: they are the visible half of "somebody finally
      // went and looked", and the old alt did not mention them.
      alt: "The Walkway Over the Hudson, the former Poughkeepsie railroad bridge, its black steel trusses running the width of the frame on tall piers standing in the river, small figures walking the deck and a flag flying from it, with the Poughkeepsie waterfront and a wooded bluff behind under a flat grey sky",
      caption:
        "The Poughkeepsie railroad bridge burned on the eighth of May, 1974, and then stood there unused for thirty five years. It reopened on the third of October, 2009, as a footpath. Nothing about it had changed in the meantime except that somebody finally went and looked at what was already standing.",
      credit: "Photograph by bobistraveling, CC BY 2.0.",
      ariaLabel: "A bridge that sat unused for thirty five years",
    },
    "four-moves": {
      kind: "grid",
      band: "dark",
      label: "Four moves",
      eyebrow: "What it actually does",
      heading: "Four moves.",
      columns: 2,
      glow: true,
      items: FOUR_MOVES,
    },
    /** DARK. Same reason as the qualification post's fair-play grid: this page ran 5,732px,
     * a quarter of its height, without one dark band in it, and this is the section the
     * article says is the whole reason a large share of these campaigns should never have
     * been sent. If one thing in that stretch carries the weight, it is the consent check. */
    "consent-check": {
      kind: "grid",
      band: "dark",
      label: "The three checks",
      eyebrow: "Take this to anybody, including us",
      heading: "Three things to check before a single message goes out.",
      columns: 3,
      items: CONSENT_CHECK,
    },
    "list-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "What is actually in that list?",
      ariaLabel: "What working the list once might return",
      inputs: [
        {
          kind: "range",
          id: "contacts",
          label: "Contacts sitting in your CRM",
          hint: "Everybody who ever raised a hand and then went quiet.",
          min: 200,
          max: 20000,
          step: 100,
          initial: 3000,
          format: "count",
          width: "w-[7rem]",
        },
        {
          kind: "range",
          id: "reachable",
          label: "The share you can still legally message",
          hint: "Dated consent, a source on the record, and not on the registry. Read the three checks above before you guess high.",
          min: 5,
          max: 100,
          step: 5,
          initial: 30,
          format: "percent",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "moving",
          label: "Of those, the share who answer AND are actually moving",
          hint: "Not the reply rate. The people whose situation genuinely changed.",
          min: 1,
          max: 20,
          step: 1,
          initial: 2,
          format: "percent",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "taken",
          label: "Of those, the share that becomes a deal you take",
          min: 5,
          max: 60,
          step: 5,
          initial: 20,
          format: "percent",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "commission",
          label: "Your average commission per closed deal",
          min: 1000,
          max: 30000,
          step: 500,
          initial: 6000,
          format: "money",
          width: "w-[7.5rem]",
        },
      ],
      chain: [
        {
          label: "Contacts in the database",
          by: { from: "input", id: "contacts" },
          format: "count",
          unit: "in total",
        },
        {
          label: "You can still legally message",
          by: { from: "input", id: "reachable" },
          format: "count",
          unit: "contacts",
        },
        {
          label: "Who answer and are actually moving",
          by: { from: "input", id: "moving" },
          format: "count",
          unit: "conversations",
        },
        {
          label: "That become a deal you take",
          by: { from: "input", id: "taken" },
          format: "count",
          unit: "deals",
        },
        {
          label: "In commission",
          by: { from: "input", id: "commission" },
          format: "money",
          unit: "once",
        },
      ],
      headline: 4,
      resultLabel: "What working the list once might return",
      note: "Every multiplier in this one is yours. There is not a single rate of ours in it, and that is deliberate rather than lazy: no independent study of cold database response rates in real estate exists, this article says a few paragraphs up that anybody quoting you a conversion rate before they have seen your database is quoting a number they made up, and we are not going to do it in a widget either. The defaults are set low on purpose so the first thing you do is argue with them. Note also that there is no row turning this into an annual figure. A database is finite. This is what working the list once might return, not a number that repeats every year, and a vendor who annualises it is selling you a subscription to a harvest.",
      action: { label: "See how it is built", href: "/services/database-reactivation" },
      secondary: { label: "Check yours with us", href: "/connect" },
    },
    /** Placed on the sentence that says both costs are avoided in the same place: before the
     * first message goes out. This is the one topic where the offer is genuinely protective
     * rather than commercial, so it says out loud that we do not need the file. */
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "Before the first message",
      text: "Run your own list through the three checks above. If you would rather have a second pair of eyes on it, tell us roughly what is in there and where the records came from, and we will tell you which parts of it we would not touch.",
      reassure: "We do not need the file itself to answer that, and nothing gets sent to anybody.",
      action: { label: "Ask before you send", href: "/connect" },
      ariaLabel: "Ask us about your own list before sending",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "A cold lead is not somebody who lost interest. It is somebody whose timing was wrong once, and nobody has asked them since.",
    },
    teardown: {
      kind: "conversation",
      band: "light",
      layout: "bubbles",
      label: "The teardown",
      eyebrow: "The teardown",
      heading: "Watch it open a record from 2023.",
      note: "The pattern, not a recording of a real client. The contact is invented.",
      themLabel: "Dana",
      usLabel: "The assistant",
      /** "On her phone", not "what she received": this column carries BOTH sides, and it is
       * drawn from her handset's point of view, with our messages arriving on the left and hers
       * sent on the right. A heading naming only one direction argues with the picture. */
      turnsHeading: "On her phone",
      eventsHeading: "What happened behind it",
      turns: REVIVAL_TURNS,
      events: REVIVAL_EVENTS,
    },
    "revival-path": {
      kind: "diagram",
      band: "dark",
      label: "What it connects to",
      eyebrow: "The system",
      heading: "What it is connected to.",
      lede: "Reactivation is not a message. It is a chain, and the second link is the one everybody selling this leaves out.",
      steps: REVIVAL_PATH,
      altPrefix: "The chain from a dormant CRM record to a booked appointment",
    },
    "failure-modes": {
      kind: "grid",
      band: "light",
      eyebrow: "Three ways it fails",
      heading: "None of them are the technology.",
      columns: 3,
      items: FAILURE_MODES,
    },
    /** The close deliberately does not invite the reader to try a reactivation campaign on a
     * demo. There is nothing to try: it runs against one office's own database. The chat
     * assistant on the AI page is the thing that is genuinely live, and the footnote says which
     * is which rather than letting the button imply otherwise. */
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "That list is not going to get warmer on its own. Every month a few more of those people stop being not right now, and the ones who move are helped by whoever happened to be in front of them that week.",
      actions: [
        { label: "See it on the AI page", href: "/ai#reactivation", variant: "light" },
        { label: "How it is built", href: "/services/database-reactivation", variant: "outline-light" },
      ],
      footnote:
        "The chat assistant on that page is live and will answer you right now. A reactivation campaign runs against one office's own database and its own consent records, so there is no shared demo to look at. None of the rules quoted on this page are legal advice, and all of them move.",
    },
  },

  /** Short rail labels for the prose headings. The ids and the ORDER are derived from the
   * document, so a renamed heading degrades to its full text instead of leaving a dead row, and
   * the toc probe fails on a key that matches no heading. */
  headingLabels: {
    "what-is-actually-sitting-in-that-database": "The database",
    "why-nobody-works-it": "Why nobody does it",
    "what-database-reactivation-actually-does": "What it does",
    "the-part-nobody-selling-you-this-will-mention": "The rules",
    "what-it-costs-when-it-goes-wrong": "What it costs",
    "what-to-ask-before-you-let-anybody-text-that-list": "What to ask",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "where-it-goes-wrong": "Where it fails",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
