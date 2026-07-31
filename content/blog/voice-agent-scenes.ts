/** Scene copy for the AI voice agents flagship post.
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the
 * content layer. This is topic 2 of the flagship template, and it is the file that proves the
 * template works: it adds no component of its own. Every scene below resolves to a primitive
 * that already existed or that this round generalised out of the first topic's bespoke code.
 *
 * SOURCE OF TRUTH for what the product does is content/services/ai-voice-agents.ts. Nothing
 * here claims a capability that page does not already claim. Where this piece goes further
 * than the service page it goes into GENERAL mechanics (why latency decides a phone call) or
 * into law, never into new promises about our own stack.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { ConversationEvent, ConversationTurn, FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, for the reader who is skimming and for the
 * assistants that increasingly answer on somebody's behalf. Every line is argued in the body;
 * a summary that claims something the article does not support is how a summary box becomes a
 * liability. */
export const IN_SHORT: string[] = [
  "A missed call is not a message waiting for you in the morning. Most callers never leave one, so it arrives as nothing at all: no name, no number worth calling back, no record that anybody wanted you.",
  "Speed decides who gets the conversation. Across 1.25 million leads, firms that made contact within the hour were nearly seven times likelier to reach a decision maker than firms that waited one more hour.",
  "An AI voice agent answers every call, qualifies inside a normal conversation, books from your real calendar and writes the outcome to your CRM. It does not close, and it says out loud that it is an assistant.",
];

/** SCENE copy — the response audit. The page's cited data graphic.
 *
 * REAL third-party data, and a DIFFERENT cut of it from the one the chat flagship uses. That
 * post visualises the odds of qualifying by response speed (60x / 8.6x / 1x). This one
 * visualises the distribution of how long companies actually took, from the same paper's
 * other study, because the shocking number for a phone piece is not the multiplier. It is
 * that 23% of businesses never answered a customer who had raised their hand.
 *
 * Figures are from Harvard Business Review, "The Short Life of Online Sales Leads" (2011), by
 * James Oldroyd, Kristina McElheran and David Elkington. They audited 2,241 US companies by
 * submitting a test inquiry through each company's own website and timing the reply: 37%
 * responded within an hour, 16% within one to 24 hours, 24% took more than 24 hours, and 23%
 * never responded. Average response time among those that replied within 30 days: 42 hours.
 *
 * The caveat is on screen and is not decorative. This is cross-industry research from 2011
 * measuring WEB inquiries, not phone calls, and saying so is the difference between a chart
 * and an advert with axes. */
export const RESPONSE_AUDIT = {
  eyebrow: "The evidence",
  caption: "How long 2,241 companies took to answer an inquiry from their own website",
  bars: [
    { label: "Answered within an hour", value: 37, display: "37%" },
    { label: "Answered within 1 to 24 hours", value: 16, display: "16%" },
    { label: "Took longer than 24 hours", value: 24, display: "24%" },
    { label: "Never answered at all", value: 23, display: "23%" },
  ],
  /** Shares of a whole, so the axis runs to 100 rather than to the biggest bar. Scaled to
   * its own maximum, the 37% bar would be drawn full width, and a full-width bar reads as
   * "all of them". */
  max: 100,
  /** The accent goes on the 23%, not on the fastest bar. The fast bar is the reassuring one
   * and it is not the finding. */
  lit: 3,
  basis: "Share of the 2,241 companies audited.",
  sourceText:
    "Harvard Business Review, The Short Life of Online Sales Leads (2011), reporting the audit by James Oldroyd, Kristina McElheran and David Elkington.",
  sourceHref: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
  note: "Cross-industry research from 2011, timing replies to inquiries submitted through a website rather than to phone calls. These percentages are not a real estate benchmark and should not be quoted as one. The shape is the part that carries over.",
};

/** SCENE copy — the four moves.
 *
 * Lifted from the four steps in content/services/ai-voice-agents.ts (`howItWorks`) and put
 * into the article's voice. The scene REPLACES the list rather than repeating it, so these
 * words appear exactly once on the page. */
export const FOUR_MOVES: GridItem[] = [
  {
    lead: "It answers every call, including the ones at nine on a Sunday.",
    body: "Inbound calls route to the agent whenever you are unavailable, or always, depending on how you set it up. It greets the caller, answers what it can from your listings, and never sends anybody to voicemail.",
  },
  {
    lead: "It calls new leads back in seconds, not in the morning.",
    body: "The moment an inquiry lands from your site, a portal or a campaign, the agent dials. It is calling while the person is still on the page, which is the only window that has ever really been open.",
  },
  {
    lead: "It qualifies inside a normal conversation.",
    body: "Budget, area, timeline, whether they are pre-approved, whether they have a house to sell. Not a script read at somebody. The questions you would ask, in the order a conversation actually goes.",
  },
  {
    lead: "It books, and then it writes it down.",
    body: "Real availability from your calendar, offered on the call and confirmed on the call. Afterwards the transcript, the qualification and the outcome go into your CRM, so the appointment you walk into is one you already understand.",
  },
];

/** SCENE copy — the teardown.
 *
 * An ILLUSTRATION of the pattern, not a recording of a real client, and the scene says so on
 * screen. It is written to demonstrate exactly the behaviour the article argues for: it says
 * what it is and that the call is recorded before anything else happens, it answers from the
 * record rather than from memory, it refuses to guess at the one question it cannot verify,
 * and it hands off to a person. No invented tax figure, no invented address, no phone number. */
export const CALL_TURNS: ConversationTurn[] = [
  {
    who: "them",
    at: "9:42 pm",
    text: "Hi. I am looking at the colonial you have listed. Is it still available?",
  },
  {
    who: "us",
    at: "9:42 pm",
    text: "It is. I am the assistant for the office, and I record calls so nothing gets lost between now and the morning. What would you like to know about it?",
  },
  {
    who: "them",
    at: "9:43 pm",
    text: "What are the taxes on it, and would the seller look at a contingent offer?",
  },
  {
    who: "us",
    at: "9:43 pm",
    text: "The taxes I can read you straight off the listing. The contingent offer I am not going to guess at. Nobody knows until the listing agent is actually asked, and it is the kind of answer that decides an offer. Let me put you with a person in the morning.",
  },
  { who: "them", at: "9:44 pm", text: "Morning is fine." },
  {
    who: "us",
    at: "9:44 pm",
    text: "Nine thirty is open. You are booked in, and I have sent the details to the number you are calling from.",
  },
];

export const CALL_EVENTS: ConversationEvent[] = [
  { at: "9:42 pm", label: "Answered on the second ring", detail: "No hold, no voicemail, no callback form." },
  { at: "9:42 pm", label: "Said what it was", detail: "An assistant, and the call is recorded. Before anything else." },
  { at: "9:43 pm", label: "Answered from the record", detail: "Read off the listing rather than recalled." },
  { at: "9:43 pm", label: "Declined to invent an answer", detail: "Flagged for a person instead of guessing at it." },
  { at: "9:44 pm", label: "Booked from the live calendar", detail: "Only offered a time that was genuinely free." },
  { at: "9:45 pm", label: "Written to the CRM", detail: "Transcript, qualification and outcome, before dinner ended." },
];

/** SCENE copy — what to ask a vendor.
 *
 * The most generous thing this page can do is hand the reader a test they can run on ANYBODY
 * selling them a voice agent, including us. It also breaks up the longest prose run on the
 * page, which was 1,929px of unbroken text through the legal section.
 *
 * Every question is one our own service page would pass, which is the point: a checklist that
 * only we could pass is a spec sheet wearing a checklist's clothes. */
export const VENDOR_QUESTIONS: GridItem[] = [
  {
    lead: "Ask what it says in its first sentence.",
    body: "If the answer is a person's name rather than the word assistant, stop there. Everything else on this list is downstream of whether the vendor treats disclosure as a feature or as a problem to be managed.",
  },
  {
    lead: "Ask what it does with a question it cannot answer.",
    body: "You are listening for one specific behavior: it says so, and it books a call. If the demo never once shows the agent failing at something, you have been shown an advertisement rather than a product.",
  },
  {
    lead: "Ask to hear a call that went sideways.",
    body: "Anything sounds good reading a script to a cooperative caller. Ask for a recording where somebody interrupted it, changed their mind halfway, or went quiet, because that is roughly every third real call.",
  },
];

/** SCENE copy — the call path diagram.
 *
 * The compact abstraction, not a re-telling of the teardown: each hop names what it actually
 * CONNECTS TO, which is the part a conversation view cannot show. Every connection here is
 * one the service page already claims. */
export const CALL_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The call", connects: "Your own number, any hour", at: "9:42 pm" },
  { label: "The agent", connects: "A voice on Vapi, given limits" },
  { label: "Your listings", connects: "What it is allowed to state" },
  { label: "Your calendar", connects: "Live availability, not a guess" },
  { label: "The record", connects: "CRM, with the transcript" },
  { label: "The handoff", connects: "Time booked with a person", at: "9:30 am" },
];

/** SCENE copy — the three failure modes.
 *
 * Deliberately NOT the chat post's three. Those were about an assistant with nothing wired to
 * it; these are the three ways a phone agent that works technically still loses you the call. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "It is set up to answer everything.",
    body: "An agent that never hands off eventually becomes the thing standing between a serious buyer and you. The most important setting is not what it can say. It is the point at which it stops talking and books.",
  },
  {
    lead: "Nobody told it what it may not say.",
    body: "The limits are the configuration. Give an agent no boundary on price, condition or anything legal and it will fill the silence, fluently, and you will hear about it from the client rather than from the log.",
  },
  {
    lead: "The transcripts are never opened.",
    body: "Every call is a record of the exact questions your market is asking, in their own words, with the objection attached. It is the best sales material you will ever own and most people never read a line of it.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Note what is NOT here: a component. Topic 1 shipped five bespoke scenes; this topic ships
 * zero, because the primitives it needed (`statbars`, `diagram`, `conversation`, `plate`) were
 * generalised in the same round rather than copied. That is the whole test of the template.
 *
 * There is also no `film` and no `[[scene:reel]]`. The film that exists belongs to the chat
 * piece: it is narrated around a buyer MESSAGING a website at 11:40pm and being texted
 * listings. Reusing it here would put a video about the wrong channel on a page arguing that
 * you should say what is true, and one failed checklist item is cheaper than that. */
export const AI_VOICE_FLAGSHIP: FlagshipContent = {
  /** A phone ringing at 9:42 on a Sunday evening, which is the moment the piece opens on and
   * the same moment the service page's own timeline starts from. Millerton at night rather
   * than the chat piece's twilight, so the two heroes are not the same photograph. */
  hero: {
    moment: "9:42",
    suffix: "pm",
    photo: "/images/hero/millerton-night.jpg",
    signature: "ring",
  },
  scenes: {
    "in-short": {
      kind: "summary",
      band: "light",
      ariaLabel: "In short",
      eyebrow: "In short",
      claims: IN_SHORT,
    },
    "response-audit": {
      kind: "statbars",
      band: "light",
      label: "The evidence",
      ...RESPONSE_AUDIT,
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/counties/putnam.jpg",
      alt: "Dusk over the Hudson at Cold Spring, New York, with the pilings of an old dock standing in the shallows",
      caption:
        "Cold Spring, from the water. The call at 9:42 is somebody deciding whether they are driving up on Saturday, and that decision does not wait until Monday to get made.",
      credit: "Photograph by eleephotography, CC BY 2.0.",
      ariaLabel: "A Hudson Valley river town",
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
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "A phone call has no typing indicator. Every second of silence is the caller deciding whether anybody is actually there.",
    },
    teardown: {
      kind: "conversation",
      band: "light",
      /** A call, so it is drawn as a call log and not as a messaging thread. Bubbles would
       * have made the voice piece look like a reskin of the chat piece. */
      layout: "transcript",
      label: "The teardown",
      eyebrow: "The teardown",
      heading: "Watch it take the 9:42 call.",
      note: "The pattern, not a recording of a real client.",
      themLabel: "Caller",
      usLabel: "Agent",
      turnsHeading: "What the caller heard",
      eventsHeading: "What happened behind it",
      turns: CALL_TURNS,
      events: CALL_EVENTS,
    },
    "vendor-questions": {
      kind: "grid",
      band: "light",
      label: "What to ask",
      eyebrow: "Take this to anybody, including us",
      heading: "Three questions that separate a product from a demo.",
      columns: 3,
      items: VENDOR_QUESTIONS,
    },
    "call-path": {
      kind: "diagram",
      band: "dark",
      label: "What it connects to",
      eyebrow: "The system",
      heading: "What it is connected to.",
      lede: "An agent is only as good as what it can reach. This is every hop between the ring and the appointment you walk into.",
      steps: CALL_PATH,
      altPrefix: "The chain from a ringing phone to a booked appointment",
    },
    "failure-modes": {
      kind: "grid",
      band: "light",
      eyebrow: "Three ways it fails",
      heading: "None of them are the technology.",
      columns: 3,
      items: FAILURE_MODES,
    },
    /** The close deliberately does NOT say "talk to it right now". The chat assistant is live
     * on the AI page and can be talked to; a voice agent is stood up per office against that
     * office's own numbers and calendar, so an invitation to ring one would be a promise this
     * page cannot keep. The footnote says which is which. */
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "The buyer who rang at 9:42 is not going to try you again on Monday. They are being shown a house on Saturday by whoever picked up. The only question left is whose listing they are standing in.",
      actions: [
        { label: "See it on the AI page", href: "/ai#voice", variant: "light" },
        { label: "How it is built", href: "/services/ai-voice-agents", variant: "outline-light" },
      ],
      footnote:
        "The chat assistant on that page is live and will answer you right now. A voice agent is stood up per office, against your own number and your own calendar, so there is no shared demo line to ring.",
    },
  },

  /** Short rail labels for the prose headings. The ids and the ORDER are derived from the
   * document, so a renamed heading degrades to its full text instead of leaving a dead row,
   * and scripts/_scratch-toc.mjs fails on a key that matches no heading. */
  headingLabels: {
    "what-a-missed-call-actually-costs": "The cost",
    "why-nobody-leaves-the-voicemail": "No voicemail",
    "what-an-ai-voice-agent-actually-does": "What it does",
    "the-one-thing-that-decides-whether-it-works": "Latency",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "the-legal-part-nobody-sells-you": "The legal part",
    "where-it-goes-wrong": "Where it fails",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
