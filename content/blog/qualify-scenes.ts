/** Scene copy for the lead qualification flagship post.
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. This is topic 4 of the flagship template, and the third in a row that adds no component
 * of its own: every scene below resolves to a primitive that already existed.
 *
 * SOURCE OF TRUTH for what the product does is content/services/lead-qualification.ts. Nothing
 * here claims a capability that page does not already claim. Where this piece goes further than
 * the service page it goes into GENERAL mechanics (what a readiness signal sounds like in a
 * sentence) or into published law and the Code of Ethics, never into new promises about our own
 * stack.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { ConversationEvent, ConversationTurn, FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** The film. One definition, read by the scene that plays it AND by the VideoObject JSON-LD, so
 * the two can never disagree about length, dimensions or what the clip actually shows.
 *
 * Second film built on real footage, same committed recipe as the reactivation one: vo.mjs
 * generates and MEASURES the narration, bg.mjs cuts the picture bed to those measured
 * boundaries, render.mjs draws the type on transparent PNGs, assemble.mjs composites and mixes.
 * 1280x720 because that is the footage's native resolution and nothing here is upscaled.
 *
 * Three of the nine picture beats are deliberately BLACK. The three-record card and the fair
 * housing line are the two moments in the cut that ask a viewer to stop and read, and footage
 * under either of them is noise. */
export const QUALIFY_FILM = {
  src: "/video/film-qualify.mp4",
  poster: "/video/film-qualify-poster.jpg",
  width: 1280,
  height: 720,
  seconds: 53,
  /** ISO 8601, which is the only duration format VideoObject accepts. */
  duration: "PT53S",
  name: "Three leads that look identical, and the two that are worth your morning",
  description:
    "Three real estate leads arrive looking the same on a CRM screen. The film shows what separates them, why arrival time is the one thing about a lead that predicts nothing, and what an AI qualification system reads instead: intent, budget and timeline, scored out of the sentences the person actually wrote. It closes on the rule that keeps scoring on the right side of fair housing law.",
} as const;

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, for the reader who is skimming and for the assistants
 * that increasingly answer on somebody's behalf. */
export const IN_SHORT: string[] = [
  "Your call list is sorted by when each lead arrived, which is the one thing about a lead that predicts nothing at all.",
  "Fifteen percent of sellers said they needed to sell as quickly as possible and forty three percent said they were in no hurry. Both groups submit the same contact form.",
  "Score what somebody told you about their plans, never who they appear to be. Qualification is allowed to change the order of your morning, and it must never change what anybody is allowed to see or ask.",
];

/** SCENE copy — urgency of sale. The page's cited data graphic.
 *
 * A THIRD study, deliberately. The chat and voice flagships cite HBR/Oldroyd on response speed
 * and the reactivation piece cites how sellers found their agent; none of those is evidence about
 * how much leads differ from each other, which is this piece's actual claim.
 *
 * Figures are Exhibit 6-23, "Urgency of sale", all sellers, from the National Association of
 * REALTORS 2025 Home Buyers and Sellers Generational Trends Report. Methodology, from the
 * report's own page: NAR mailed a 127-question survey in July 2024 to 167,750 recent home
 * buyers, received 5,390 responses, an adjusted response rate of 3.2 percent, covering the twelve
 * months to June 2024. Seller data comes from those buyers who also sold a home.
 *
 * THE CAVEAT IS THE IMPORTANT PART and it is on screen. This was asked of people who had already
 * sold, looking backwards. It is not a measurement of what share of anybody's INQUIRIES are
 * urgent and it cannot be turned into one. What it establishes is only that the spread exists and
 * is wide, which is all this page needs it to establish. */
export const URGENCY = {
  eyebrow: "The evidence",
  /** "actually" was in this line and cost it a second row with one word on it at 1440. The
   * caption is rendered as the scene heading AND as the SVG title, so it has to hold on one
   * line at the heading size rather than read well as prose. */
  caption: "How urgent recent sellers said their sale was",
  bars: [
    { label: "Very urgently, as quickly as possible", value: 15, display: "15%" },
    { label: "Somewhat urgently, within a reasonable time", value: 42, display: "42%" },
    { label: "Not urgently, waited for the right offer", value: 43, display: "43%" },
  ],
  /** Shares of a whole, so the axis runs to 100 rather than to the biggest bar. */
  max: 100,
  /** The accent goes on the smallest bar. It is the group the whole piece is about, and lighting
   * the biggest one would say the opposite of the finding. */
  lit: 0,
  basis: "Share of all sellers surveyed.",
  sourceText:
    // 2026-08-03, from the methodology page: the survey was mailed to recent BUYERS, and NAR
    // says "Information about sellers comes from those buyers who also sold a home". 5,390 is
    // the buyer response count, so the seller base under this exhibit is smaller and printing
    // the buyer number alone overstates it.
    "National Association of REALTORS, 2025 Home Buyers and Sellers Generational Trends Report, Exhibit 6-23, covering the twelve months to June 2024. Survey mailed to 167,750 recent buyers, 5,390 responses; seller answers come from those buyers who also sold a home, so the seller base is smaller.",
  sourceHref:
    "https://cms.nar.realtor/sites/default/files/2025-03/2025-home-buyers-and-sellers-generational-trends-report-04-01-2025.pdf",
  note: "This was asked of people who had already sold, looking back at how it went. It is not a measurement of how many of your inquiries are urgent and cannot be used as one. All it establishes is that the spread between the most urgent sellers and the least urgent ones is very wide, which is the only thing this page needs it for.",
};

/** SCENE copy — what it actually does.
 *
 * Lifted from content/services/lead-qualification.ts (`howItWorks` plus the ranked-pipeline point
 * in `whatItIs`) and put into the article's voice. The scene REPLACES the list rather than
 * repeating it, so these words appear exactly once on the page. */
export const WHAT_IT_DOES: GridItem[] = [
  {
    lead: "It reads what they said, not the box they ticked.",
    body: "The chat, the call transcript, and what they did on the site, together. A checkbox records the option somebody clicked. A sentence records what they were actually thinking about when they wrote it.",
  },
  {
    lead: "It scores the three things that predict.",
    body: "Intent, budget and timeline. A pre-approved buyer with a house under contract and a lease running out is not the same lead as somebody reading about the area, and putting them next to each other is the mistake.",
  },
  {
    lead: "It routes rather than filters.",
    body: "The ready ones reach a person straight away. Everybody else goes to the follow-up that suits where they actually are. Nobody is removed, nothing is closed off, and the difference is speed and order rather than access.",
  },
  {
    lead: "The list you open in the morning is already in order.",
    body: "That is the whole deliverable. It does not make any lead better than it was. It stops the order of your best three hours being decided by a timestamp nobody chose.",
  },
];

/** SCENE copy — the three signals.
 *
 * The teaching content, and the part a reader can use tomorrow whether or not they ever buy
 * anything. Each one is written as what it SOUNDS like in a sentence, because that is the form
 * the signal actually arrives in. */
export const THREE_SIGNALS: GridItem[] = [
  {
    lead: "Intent: acting, or reading about acting.",
    body: "One specific address beats a question about the market every time. So does any sentence containing we have, we need or we already. Somebody gathering information asks what things cost. Somebody moving asks what happens next.",
  },
  {
    lead: "Budget: tested, or assumed.",
    body: "Pre-approved is a fact. Paying cash is a fact. A number somebody arrived at on a mortgage calculator at eleven at night is a hope, and the difference between the three is a single question that nobody minds being asked.",
  },
  {
    lead: "Timeline: a date, and the reason behind it.",
    body: "Spring is not a timeline. A lease ending in March is a timeline. The reason is what makes the date real, and when somebody volunteers it unprompted they have told you they are not browsing.",
  },
];

/** SCENE copy — the fair housing rules.
 *
 * This page's actual contribution, and the reason it exists rather than being a feature list.
 * Every rule here is a practical action, and the two it rests on were read in the statute and in
 * the Code of Ethics rather than in a summary of either. Nothing here is legal advice and the
 * body says so. */
export const FAIR_PLAY: GridItem[] = [
  {
    lead: "Score the plan, never the person.",
    body: "Timeline, financing status, whether there is a house to sell, what they asked about. Never a name, a photograph, a language, a neighborhood, or anything a model could quietly use to guess at who somebody is. If an input would be indefensible said out loud, it is indefensible in a weight.",
  },
  {
    lead: "Make every score point at a sentence.",
    body: "You should be able to open any lead and see the words that produced the number. A score you cannot trace is one you cannot explain to a client, cannot correct when it is wrong, and cannot defend to anybody who asks a harder question than your client would.",
  },
  {
    lead: "Change your order, never their access.",
    body: "Qualification decides who you call first. It must never decide who gets to see a listing, who gets a straight answer, or who is allowed to reach a human being. The moment a low score means less service rather than a later call, you have crossed from ranking your time into rationing housing.",
  },
];

/** SCENE copy — the teardown.
 *
 * An ILLUSTRATION of the pattern, not a recording of a real visitor, and the scene says so on
 * screen. Written so that every event in the right-hand column traces to a specific sentence in
 * the left-hand one, because that traceability IS the rule the page argues for. If this scene
 * contained a single score that did not point at a line the visitor wrote, the page would be
 * demonstrating the opposite of its own argument. */
export const QUALIFY_TURNS: ConversationTurn[] = [
  { who: "them", at: "8:12 pm", text: "hi, is the place on Sherman Ave still available?" },
  {
    who: "us",
    at: "8:12 pm",
    text: "It is. Are you looking to move fairly soon, or getting a feel for the area first?",
  },
  { who: "them", at: "8:13 pm", text: "pretty soon. we have to be out of our rental by the end of March" },
  {
    who: "us",
    at: "8:13 pm",
    text: "That is a real deadline, so it is worth being precise about the rest. Have you spoken to a lender yet, or is that still ahead of you?",
  },
  { who: "them", at: "8:15 pm", text: "we got pre-approved last month" },
  {
    who: "us",
    at: "8:15 pm",
    text: "Then you are in better shape than most people at this stage. Levan has Thursday at 5:30 or Saturday at 10. Which is easier?",
  },
];

export const QUALIFY_EVENTS: ConversationEvent[] = [
  { at: "8:12 pm", label: "Intent: acting", detail: "One specific address, not a question about the market." },
  { at: "8:13 pm", label: "Timeline: a date with a reason", detail: "End of March, because a lease ends. Not a preference." },
  { at: "8:15 pm", label: "Budget: tested", detail: "Pre-approved last month, in their own words." },
  { at: "8:15 pm", label: "Scored, and every point traceable", detail: "Three signals, three sentences they wrote. Nothing inferred." },
  { at: "8:15 pm", label: "Routed to a person, same conversation", detail: "On what they said. Nothing about who they are." },
];

/** SCENE copy — the routing path.
 *
 * The compact abstraction, not a re-telling of the teardown: each hop names what it actually
 * CONNECTS TO. The consent-style check sits fourth, because on this topic the fairness question
 * is a step in the chain rather than a disclaimer at the end of it. */
export const ROUTING_PATH: { label: string; connects: string; at?: string }[] = [
  // The first caption has to be the shortest: it is centred under a node sitting at the very
  // start of the scroll container, so anything wider than the node spacing is clipped by the
  // container edge on a 390px phone. Measured on the reactivation post, where it cost a letter.
  { label: "The inquiry", connects: "Site, portal or call", at: "8:12 pm" },
  { label: "The conversation", connects: "What they actually said" },
  { label: "The score", connects: "Intent, budget, timeline" },
  { label: "The check", connects: "Plans, never people" },
  { label: "The route", connects: "A person, or the right follow-up" },
  { label: "The morning", connects: "A list already in order", at: "7:00 am" },
];

/** SCENE copy — the three failure modes.
 *
 * Deliberately not the other topics' three. These are the three ways a scoring system that works
 * technically still makes your business worse. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "The number replaces the sentence.",
    body: "Within a month nobody opens the transcript, because there is a 92 next to the name and 92 is easier to read than a paragraph. The score was supposed to decide the order you read things in, not to be the thing you read.",
  },
  {
    lead: "It scores what is easy to count.",
    body: "Email opens, page views, minutes on site, number of sessions. All of those are measurable and none of them are readiness. They measure curiosity, and the most curious person on your list is very often the one furthest from moving.",
  },
  {
    lead: "Nobody ever checks it against what happened.",
    body: "Take last quarter's top twenty and look at who actually transacted. If the ranking had no relationship to the outcome, you do not have a scoring system, you have a horoscope with a confidence percentage on it. This takes an hour and almost nobody does it.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Twelve scenes, zero components. */
export const QUALIFY_FLAGSHIP: FlagshipContent = {
  film: QUALIFY_FILM,
  /** A share rather than a clock or a year: the held moment on this topic is how few of the
   * people on that list are actually in a hurry. The three heroes before this one were 11:40pm,
   * 9:42pm and 2023, so a percentage is also the first one that is not a point in time. */
  hero: {
    moment: "15%",
    suffix: "urgent",
    photo: "/images/counties/westchester.jpg",
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
    reel: {
      kind: "film",
      band: "dark",
      label: "Watch it",
      ariaLabel: "Watch it work",
      eyebrow: "Watch it work",
      heading: "Three leads that look the same, and the two that are not.",
      caption: [
        `Narrated, ${QUALIFY_FILM.seconds} seconds. The voice reading it is a licensed clone of my own, which seemed worth saying rather than leaving you to wonder. The three records are invented and the exchange is staged, but both numbers in it are real: the fifteen percent is the survey cited below and the fair housing line at the end is the statute quoted further down. The whole build is on the `,
        { href: "/services/lead-qualification", label: "service page" },
        ".",
      ],
    },
    urgency: {
      kind: "statbars",
      band: "light",
      label: "The evidence",
      ...URGENCY,
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/counties/ulster.jpg",
      alt: "Lake Awosting at Minnewaska State Park Preserve, New York, seen from the cliffs above the water",
      caption:
        "Minnewaska on a Saturday. Of the three people who asked you about a house up here this week, one has a closing date and two are the better part of a year from doing anything, and all three of them used the same contact form.",
      credit: "Photograph by Gaurav Pandit, CC BY 3.0.",
      ariaLabel: "The ridge above Minnewaska",
    },
    "what-it-does": {
      kind: "grid",
      band: "dark",
      label: "What it does",
      eyebrow: "What it actually does",
      heading: "Four moves.",
      columns: 2,
      glow: true,
      items: WHAT_IT_DOES,
    },
    "three-signals": {
      kind: "grid",
      band: "light",
      label: "The three signals",
      /** Eyebrows are uppercase and tracked, so they run about 40 percent wider than the same
       * words in body text. At 45 characters this one wrapped to two lines at 390px with the
       * last word alone. Keep an eyebrow near the length of the reactivation post's, which
       * holds. */
      eyebrow: "Take this, whether or not you buy",
      heading: "What a ready lead sounds like.",
      columns: 3,
      items: THREE_SIGNALS,
    },
    "triage-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How much of your year goes to sorting?",
      ariaLabel: "How many hours go to sorting leads",
      inputs: [
        {
          kind: "range",
          id: "leads",
          label: "New leads in a month",
          hint: "Everything that arrives as a name and a phone number: forms, portals, ads, referrals.",
          min: 10,
          max: 400,
          step: 10,
          initial: 60,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes before you know which kind of lead it is",
          hint: "Reading it, dialling, leaving the message, writing the note, dialling again.",
          min: 1,
          max: 30,
          step: 1,
          initial: 6,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "notready",
          label: "The share who turn out not to be moving yet",
          hint: "The ones you would still answer, still send listings to, and still not put at the top of Tuesday.",
          min: 10,
          max: 95,
          step: 5,
          initial: 70,
          format: "percent",
          width: "w-[5.5rem]",
        },
      ],
      chain: [
        {
          label: "New leads",
          by: { from: "input", id: "leads" },
          format: "count",
          unit: "a month",
        },
        {
          label: "Minutes finding out which is which",
          by: { from: "input", id: "minutes" },
          format: "count",
          unit: "minutes a month",
        },
        {
          label: "Over a year",
          by: { from: "rate", value: 12, display: "12 months" },
          format: "count",
          unit: "minutes a year",
        },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours a year",
        },
        {
          label: "Spent on people who were not moving yet",
          by: { from: "input", id: "notready" },
          format: "hours",
          unit: "hours a year",
        },
      ],
      headline: 4,
      resultLabel: "Sorting, not selling",
      note: "There is no dollar figure at the end of this one and no hourly-rate slider, which is a deliberate refusal rather than an omission. Those hours are the cheap half of the problem and they are the half that is easy to count. The expensive half has no slider at all, because it happens once: the seller who has to be out by spring, sitting third in a list sorted by arrival time, still waiting on Thursday. One of those in a year is worth more than every hour above it, and nobody who has not seen your pipeline can tell you how often it happens to you. The hours are what the sorting costs. The order is what it costs you.",
      action: { label: "See how it is built", href: "/services/lead-qualification" },
      secondary: { label: "Get a second read", href: "/connect" },
    },
    /** Placed on the outcomes paragraph, which describes a report the article admits almost
     * nobody runs. Offering to run it is the only offer on this page that costs us more than it
     * makes us, which is why it is the right one. The reassurance repeats the article's own
     * disclaimer rather than softening it. */
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The report nobody runs",
      text: "Pull the leads your system ranked lowest last quarter, and we will read what they actually got back from you beside what the highest-ranked ones got. That comparison is the only one that looks at outcomes instead of inputs.",
      reassure: "Nothing on this page is legal advice and this would not be either. You keep the report whatever you decide.",
      action: { label: "Run the outcomes check", href: "/connect" },
      ariaLabel: "Ask us to run the outcomes check",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "A lead score is not a judgement about a person. It is a guess about a date, and the only honest input is what they told you about theirs.",
    },
    teardown: {
      kind: "conversation",
      band: "light",
      /** Bubbles: this one starts as a typed exchange on a website, so a call log would say the
       * wrong thing about the channel. */
      layout: "bubbles",
      label: "The teardown",
      eyebrow: "The teardown",
      heading: "Watch three signals arrive in four sentences.",
      note: "The pattern, not a recording of a real visitor. The contact is invented.",
      themLabel: "Visitor",
      usLabel: "The assistant",
      turnsHeading: "The conversation",
      eventsHeading: "What got scored, and from which line",
      turns: QUALIFY_TURNS,
      events: QUALIFY_EVENTS,
    },
    "fair-play": {
      kind: "grid",
      band: "light",
      label: "The three rules",
      eyebrow: "The part nobody sells you",
      heading: "Three rules that keep a score on the right side of the line.",
      columns: 3,
      items: FAIR_PLAY,
    },
    "routing-path": {
      kind: "diagram",
      band: "dark",
      label: "What it connects to",
      eyebrow: "The system",
      heading: "What it is connected to.",
      lede: "A score is only as good as what it read and what it is allowed to change. This is every hop between the inquiry and the order of your morning.",
      steps: ROUTING_PATH,
      altPrefix: "The chain from an inquiry to a call list already in order",
    },
    "failure-modes": {
      kind: "grid",
      band: "light",
      eyebrow: "Three ways it fails",
      heading: "None of them are the technology.",
      columns: 3,
      items: FAILURE_MODES,
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Tomorrow morning there is a list, and the order it is in was decided by a timestamp. Somewhere on it is the person who has to be out by spring, and they are going to hire whoever calls them back.",
      actions: [
        { label: "See it on the AI page", href: "/ai#qualify", variant: "light" },
        { label: "How it is built", href: "/services/lead-qualification", variant: "outline-light" },
      ],
      footnote:
        "The chat assistant on that page is live and will answer you right now. Scoring runs against one office's own leads, so there is no shared demo to look at. Nothing on this page is legal advice, and the fair housing rules quoted here are the floor rather than the ceiling.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-the-list-is-actually-sorted-by": "The list",
    "what-a-form-cannot-tell-you-and-a-conversation-can": "What a form misses",
    "what-lead-qualification-actually-does": "What it does",
    "the-three-signals-and-what-they-sound-like": "The signals",
    "the-part-that-can-get-you-in-trouble": "Fair housing",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "where-it-goes-wrong": "Where it fails",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
