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
import { REACTIVATION_QUIZ } from "./reactivation-quiz";

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
  "The people already on your list are the cheapest customers you can ask, and the asking is the part that gets skipped. Reactivation does that work with a person approving what is sent.",
  "A survey is a reason to ask, not a forecast. In the real estate market, the National Association of REALTORS release of April 2026 reports that 91 percent of buyers would use their agent again or recommend them.",
  "Before any message there are three checks: the date on the record, the written consent behind an automated text, and how a stop is recorded. The rules have dates in them, and a lawyer reads your own records against them.",
];

/** SCENE copy — what buyers and sellers reported about agents. The page's cited data graphic.
 *
 * ROUND 29 (2026-11-14): the 2025 report's exhibit 7-1 (how sellers found their agent, a seller
 * sub-sample) is replaced by the three shares the NAR news release of April 15, 2026 prints, read in
 * the release itself today. Lit bar: buyers who would use their agent again or recommend them, the
 * one that argues for asking people who already know a business. It is a survey of what buyers say,
 * in one industry, and the note says so. */
export const AGENT_SOURCE = {
  eyebrow: "The evidence",
  caption: "What buyers and sellers reported about agents, in the 2026 NAR release",
  bars: [
    { label: "Buyers who would use their agent again or recommend them", value: 91, display: "91%" },
    { label: "Sellers who worked with an agent", value: 91, display: "91%" },
    { label: "Buyers who bought through an agent", value: 88, display: "88%" },
  ],
  /** Shares of a whole, so the axis runs to 100. */
  max: 100,
  lit: 0,
  basis: "Shares of the respondents the release describes. NAR mailed a 120-question survey in July 2025 to 173,250 recent home buyers and received 6,103 responses; the seller shares come from the same release.",
  sourceText:
    "National Association of REALTORS, 2026 Home Buyers and Sellers Generational Trends, news release of April 15, 2026. Read November 14, 2026.",
  sourceHref:
    "https://www.nar.realtor/newsroom/baby-boomers-remain-largest-share-of-home-buyers-as-first-time-buying-falls-to-record-low",
  note: "This is what buyers say they would do, in one industry. It is not a measurement of how well any outreach works, and it says nothing about reactivating a customer list. It is here for one reason: the people who already know a business are a reason to ask a question. The numbers are the survey's, and nothing in this page converts them into a forecast.",
};

/** SCENE copy — the four moves.
 *
 * Lifted from content/services/database-reactivation.ts (`howItWorks`, plus the opener language
 * in `faqs`) and put into the article's voice. The scene REPLACES the list rather than repeating
 * it, so these words appear exactly once on the page. */
export const FOUR_MOVES: GridItem[] = [
  {
    lead: "It goes through every contact you may reach, not the top of the list.",
    body: "Each permitted contact gets one genuine attempt rather than a blast. They are grouped by what they bought or asked for and how long ago they went quiet. That is what lets the first message be specific instead of generic.",
  },
  {
    lead: "It opens with something that is true about them.",
    body: "It references what that person actually bought or asked about, asks a real question rather than checking in, and takes no for an answer the first time it is given. A person approves the opener before it goes out.",
  },
  {
    lead: "It holds the conversation, by text and by phone where the consent allows.",
    body: "Is the need still there, what changed, what does the timeline look like now. It follows the answer instead of reading a script over the top of it, at whatever hour the reply happens to arrive.",
  },
  {
    lead: "It books the few who are ready, with the context attached.",
    body: "The list will still hold plenty of nos, and that is the expected result rather than a failure. The handful whose circumstances moved are put on your calendar along with what they just said, so a person walks in already knowing.",
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
    lead: "Read the form they actually filled in.",
    body: "For an automated call or text the regulation wants a signed agreement with a clear and conspicuous disclosure that the person authorizes automated calls and is not required to sign. Read your actual form and its actual disclosure against that wording, not against a summary of it.",
  },
  {
    lead: "Check the date, not how warm it feels.",
    body: "A relationship counts for eighteen months after a purchase and three months after an inquiry. Outside it, a number on the national registry is a number you may not solicit by phone. Nothing in the rule asks how promising the lead looked.",
  },
  {
    lead: "Decide how a stop is recorded before the first message.",
    body: "Stop, quit, end, revoke, opt out, cancel and unsubscribe each count as a reasonable way to revoke by themselves, and other words count when a reasonable person would understand them that way. Ten business days is the outer limit. Stopping at once is stricter, and it is what we run.",
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
    text: "Hi Dana, this is the assistant at the heating company that serviced your furnace last November. Are you due for this year's check, or has that been taken care of?",
  },
  { who: "them", at: "Tue 12:48 pm", text: "oh right, we never booked it this year" },
  {
    who: "us",
    at: "Tue 12:49 pm",
    text: "Happy to help with that. Same address on Maple Street? There is Tuesday at 10:00am or Thursday at 2:00pm.",
  },
  { who: "them", at: "Tue 12:53 pm", text: "thursday" },
  {
    who: "us",
    at: "Tue 12:54 pm",
    text: "Booked for Thursday at 2:00pm, and a technician will confirm the day before. Reply STOP any time and we will not text again.",
  },
];

export const REVIVAL_EVENTS: ConversationEvent[] = [
  { at: "Before any of it", label: "Consent and dates checked", detail: "What the form said, whether a stop had ever been recorded, and that this customer is inside the eighteen months. A person approved the list and the opener." },
  { at: "Tue 10:12 am", label: "Opened on what she bought", detail: "The furnace service, because that is what she bought." },
  { at: "Tue 12:49 pm", label: "Followed the answer", detail: "The tune-up was never booked. That is the news a script would have missed." },
  { at: "Tue 12:54 pm", label: "Offered real availability", detail: "Read off the calendar and confirmed with a stop notice." },
  { at: "Tue 1:31 pm", label: "Written back to the record", detail: "The reply, the booking and the stop option, on the record." },
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
  { label: "The list", connects: "Your records, all of them", at: "Last Nov" },
  { label: "The check", connects: "What the form said" },
  { label: "The opener", connects: "What they asked for" },
  { label: "The reply", connects: "Text or phone" },
  { label: "The record", connects: "Every answer, including no" },
  { label: "The handoff", connects: "Booked time with a person", at: "Thu 2:00" },
];

/** SCENE copy — the three failure modes.
 *
 * Deliberately NOT the other two topics' failure modes. Those are about an assistant with
 * nothing wired to it, and about a phone agent that never hands off. These are the three ways a
 * reactivation campaign that works technically still costs you something. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "The whole list goes out on day one.",
    body: "A business number that has never sent a campaign suddenly sends thousands of messages. Carriers set their own rules for that traffic, and the registration the channel asks for exists for it. Start with a small, registered batch that a person has approved.",
  },
  {
    lead: "The opener is about you.",
    body: "Just checking in. Wanted to touch base. Circling back. None of those contains a single fact about the person receiving them. If the first line would work on anybody, it says nothing to the one who reads it.",
  },
  {
    lead: "The answers get thrown away.",
    body: "A no with a reason attached is the most useful thing the whole exercise produces. Bought last year. Waiting on a quote. Moved away. That is what your customers are telling you, in their own words, and most campaigns record it as a status change and drop the sentence.",
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
    moment: "18",
    suffix: "months",
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
      band: "dark",
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
          label: "The share you may still contact",
          hint: "A date, a source and a consent that covers the channel. Read the three checks above before you guess high.",
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
          label: "Of those, the share who answer AND have a need again",
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
          label: "Of those, the share that becomes a booked job",
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
          label: "Your average job, visit or sale, before costs",
          min: 100,
          max: 20000,
          step: 100,
          initial: 500,
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
          label: "You may still contact",
          by: { from: "input", id: "reachable" },
          format: "count",
          unit: "contacts",
        },
        {
          label: "Who answer and have a need again",
          by: { from: "input", id: "moving" },
          format: "count",
          unit: "conversations",
        },
        {
          label: "That become a booked job",
          by: { from: "input", id: "taken" },
          format: "count",
          unit: "jobs",
        },
        {
          label: "At your average job",
          by: { from: "input", id: "commission" },
          format: "money",
          unit: "once",
        },
      ],
      headline: 4,
      resultLabel: "What working the list once might return",
      note: "Every multiplier in this one is yours, and there is no rate of ours in it. This page prints no response rate because no independent measurement of cold list response is cited in it, and a figure we invented would be the thing the page warns about. The defaults are set low on purpose so the first thing you do is argue with them. There is also no row that turns the result into an annual figure: a list is finite, and this is what working it once might return.",
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
      text: "Run your own list through the three checks above. If you would rather have a second pair of eyes on it, then tell us roughly what is in there and where the records came from. We will tell you which parts of it we would not touch.",
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
      heading: "Watch it open a record from last November.",
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
    /** ROUND 29: who it fits and who it does not, with what the second group does instead. */
    fits: {
      kind: "grid",
      band: "light",
      label: "Who it fits",
      eyebrow: "Who this is for",
      heading: "A good fit, a poor fit, and what to do instead",
      columns: 2,
      items: [
        { lead: "A good fit", body: "A list of dated past customers or inquiries and a reason for them to hear from you again: tune-ups, seasonal work, lapsed regulars, former clients, a tour-no-buy list, old sellers and buyers." },
        { lead: "A poor fit", body: "Records with no date or source, a list of a few dozen names, nobody to read the replies, or a patient list, which carries privacy rules this page does not cover." },
        { lead: "Instead, for a poor fit", body: "Open one record, clean the list, and work a short one by hand with your own words." },
        { lead: "Either way", body: "A person approves the list and every message, and a stop is recorded the day it arrives." },
      ],
    },
    /** ROUND 29: the roadmap, one record and then one count. Our method. */
    roadmap: {
      kind: "steps",
      band: "light",
      label: "The roadmap",
      eyebrow: "A suggested schedule",
      heading: "One record, then one count, then a decision written down",
      alt: "A suggested schedule: in week 1 one record opened and its date and source written down; in week 2 the records counted by channel; in weeks 3 and 4 the worth-it test and a decision written down.",
      steps: [
        { title: "Week 1", body: "Open one record. Is there a date, a source and a consent? Write down what you find." },
        { title: "Week 2", body: "Count the records by channel: recent purchase, signed consent for automated texts, email with no stop on file." },
        { title: "Weeks 3 and 4", body: "The worth-it test; then clean the records, work a short list by hand, or have a system work a long dated one with a person approving every message. Write the decision and the date down." },
      ],
      close: "A schedule to start from, not a deadline.",
      sources: [{ text: "our method, the RealtyLT AI assessment" }],
    },
    /** ROUND 29: the owner's quiz (2026-10-31), tested against the post in reactivation-quiz.test.ts. AI brand. */
    quiz: {
      kind: "quiz",
      band: "night",
      label: "Quiz",
      ariaLabel: "Quiz: what did you learn",
      eyebrow: "Ten questions",
      title: "What did you learn? Check it in two minutes",
      brand: "ai",
      passLine: "You know the checks that come before a message. The free AI quiz at the end of this page turns them into your own result.",
      failLine: "Under half this time. Read the three checks and the stop rules again, then have another go.",
      questions: REACTIVATION_QUIZ,
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Every record on your own list either carries a date and a source, or it does not. Which of the two it is decides what comes next, and one record opened tonight tells you faster than anybody can.",
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
    "what-is-database-reactivation": "What it is",
    "how-do-you-follow-up-with-old-leads": "How to follow up",
    "which-old-leads-and-past-customers-may-you-contact": "The rules",
    "what-can-go-wrong-if-the-rules-are-missed": "What goes wrong",
    "what-does-it-take-to-run": "What it takes",
    "is-it-worth-automating-at-all": "Worth automating?",
    "what-should-you-ask-before-anybody-texts-your-list": "What to ask",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "where-does-it-go-wrong": "Where it fails",
    "who-this-fits-and-who-it-does-not": "Who it fits",
    "what-to-do-first": "Your first weeks",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
