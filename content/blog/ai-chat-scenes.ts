/** Scene copy for the AI chat assistant flagship post.
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the
 * content layer. These four moves were lifted VERBATIM out of the numbered list in
 * AI_CHAT_ASSISTANT_POST (content/blog/ai-posts.ts) when the list became a scene, so the
 * article's own text is what renders. Nothing here is new copy.
 *
 * When this flagship is cloned to the other service topics, each topic gets its own file in
 * this shape and reuses the same scene components.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent } from "@/lib/blog/flagship";

/** The film. One definition, read by the scene that plays it AND by the VideoObject JSON-LD,
 * so the two can never disagree about length, dimensions or what the clip actually shows.
 * Regenerating it is fully scripted: see docs/blog-flagship/FLAGSHIP-HANDOFF.md. */
export const FILM = {
  src: "/video/film-1140pm.mp4",
  poster: "/video/film-1140pm-poster.jpg",
  width: 1280,
  height: 720,
  seconds: 39,
  /** ISO 8601, which is the only duration format VideoObject accepts. */
  duration: "PT39S",
  name: "11:40pm: what an AI chat assistant actually does in the gap",
  description:
    "A buyer asks a real estate website about a contingent offer at 11:40pm. The assistant answers, declines to invent what it does not know, searches the live MLS, texts the matches, writes the lead to the CRM, and books the call. Cut with live footage of the RealtyLT AI system at realtylt.com/ai.",
} as const;

export interface Move {
  /** The move itself, in the article's words. */
  lead: string;
  /** What it means in practice. */
  body: string;
}

/** SCENE 7 copy — the system diagram.
 *
 * The compact abstraction of the chain, not a re-telling of the teardown: each hop names what
 * it actually CONNECTS TO, which is the part the conversation view cannot show. Every
 * connection here is one the site already claims elsewhere (MLS Grid feed, text, the CRM). */
export const SYSTEM_STEPS: { label: string; connects: string; at?: string }[] = [
  { label: "The question", connects: "Your own website, any hour", at: "11:40 pm" },
  { label: "The assistant", connects: "A language model, given limits" },
  { label: "Live inventory", connects: "The MLS Grid feed" },
  { label: "The reply", connects: "Sent by text" },
  { label: "The record", connects: "CRM, with the transcript" },
  { label: "The handoff", connects: "A booked call with a person", at: "9:15 am" },
];

/** SCENE 2b copy — the response curve.
 *
 * REAL third-party data, cited. The article leaned on "roughly 78% of leads close with whoever
 * responds first" three times without ever sourcing it, which is a bad look on a page whose
 * whole argument is honesty.
 *
 * These figures are from Harvard Business Review, "The Short Life of Online Sales Leads"
 * (2011), reporting Dr James Oldroyd's Lead Response Management study of ~1.25 million leads
 * across 29 companies: firms that tried to contact a lead within an hour were nearly 7 times
 * likelier to qualify it than those that waited one more hour, and more than 60 times likelier
 * than those that waited 24 hours or more.
 *
 * So the bars are RELATIVE odds indexed to the 24-hour case: 60x, 60/7 = 8.6x, 1x. The scene
 * states the source and the sample on screen, and says plainly that it is cross-industry lead
 * response research rather than a real-estate-specific study. */
export const RESPONSE_CURVE = {
  caption: "Relative odds of qualifying a lead, by how fast you respond",
  bars: [
    { label: "Within 1 hour", value: 60, display: "60x" },
    { label: "One hour later", value: 8.6, display: "8.6x" },
    { label: "After 24 hours", value: 1, display: "1x" },
  ],
  sourceText:
    "Harvard Business Review, The Short Life of Online Sales Leads (2011), reporting Dr James Oldroyd's study of about 1.25 million leads across 29 companies.",
  sourceHref: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
  note: "Cross-industry lead response research, not a real estate study. The pattern is what carries over.",
};

/** SCENE copy — "In short".
 *
 * Three lines that carry the whole argument, for the reader who is skimming and for the AI
 * assistants that increasingly answer questions ON someone's behalf. Deliberately NOT a
 * restatement of the hero excerpt (which sets up the problem): these are the answers.
 *
 * Every line is already argued somewhere in the body. A summary that claims something the
 * article does not support is how a summary box becomes a liability. */
export const IN_SHORT: string[] = [
  "Being first buys the conversation. Roughly 78% of leads close with whoever responds first.",
  "A good assistant answers at any hour, searches the live MLS, moves to text, and writes what it learns to the CRM.",
  "It does not close, and it should say so rather than invent an answer it cannot verify.",
];

/** SCENE copy — the three failure modes.
 *
 * Lifted VERBATIM from the bullet list that used to sit under "Where it goes wrong" in
 * AI_CHAT_ASSISTANT_POST. Same rule as the four moves: the scene REPLACES the list rather
 * than repeating it. */
export const FAILURE_MODES: Move[] = [
  {
    lead: "It is not connected to anything.",
    body: "An assistant with no MLS access can only talk in generalities, and a visitor works that out in about one question.",
  },
  {
    lead: "The handoff is a dead end.",
    body: "It qualifies a hot lead beautifully and then drops them into an inbox nobody watches. The value was never the captured email. It was the booked appointment.",
  },
  {
    lead: "Nobody reads the transcripts.",
    body: "They are the most useful sales material you will ever own, because they are a record of the exact questions your market is asking, in their own words. Most people never open them.",
  },
];

/** One turn of the teardown conversation. */
export interface Turn {
  who: "visitor" | "assistant";
  at: string;
  text: string;
}

/** One thing the system did while the conversation was happening. */
export interface Event {
  at: string;
  label: string;
  detail: string;
}

/** SCENE 5 copy — the teardown.
 *
 * This is an ILLUSTRATION of the pattern, not a transcript from a real client, and the scene
 * says so on screen. It is written to demonstrate the exact behaviour the article argues for:
 * the assistant refuses to guess at something it cannot verify, says so plainly, moves to a
 * channel people open, and hands off to a person. Deliberately no invented tax figures, days
 * on market or phone numbers: the honesty of this scene is the whole point of it. */
export const TEARDOWN_TURNS: Turn[] = [
  {
    who: "visitor",
    at: "11:40 pm",
    text: "Would the seller look at a contingent offer?",
  },
  {
    who: "assistant",
    at: "11:40 pm",
    text: "I am not going to guess at that one. Nobody knows until it is asked, and it is the kind of answer that decides an offer. I will have someone ask the listing agent and come back to you with a real answer.",
  },
  {
    who: "assistant",
    at: "11:40 pm",
    text: "While you are here: do you want the three bedrooms under $600k that are actually active in Beacon right now? I can text them over.",
  },
  { who: "visitor", at: "11:41 pm", text: "Yes please." },
  {
    who: "assistant",
    at: "11:41 pm",
    text: "Sent. I have also put you down for a call in the morning so you get the contingency answer from a person.",
  },
];

export const TEARDOWN_EVENTS: Event[] = [
  { at: "11:40 pm", label: "Answered", detail: "No wait, no form, no canned reply." },
  { at: "11:40 pm", label: "Declined to invent an answer", detail: "Flagged for a human instead." },
  { at: "11:41 pm", label: "Searched the live MLS", detail: "Active matches from the MLS Grid feed." },
  { at: "11:41 pm", label: "Sent by text", detail: "The channel people actually open." },
  { at: "11:41 pm", label: "Written to the CRM", detail: "Name, price band, area, and the transcript." },
  { at: "9:15 am", label: "Call booked", detail: "A person, starting from what they already said." },
];

export const FOUR_MOVES: Move[] = [
  {
    lead: "It answers immediately, at any hour.",
    body: "Not a canned reply. An actual answer to the actual question.",
  },
  {
    lead: "It searches the live MLS.",
    body: "Ask it for three bedrooms under $600k in Beacon and it queries the MLS Grid feed and tells you what is genuinely active right now, not what was active when somebody last exported a spreadsheet.",
  },
  {
    lead: "It moves to a channel people open.",
    body: "Matching listings go out by text. People read texts. People do not read the fourth email from an agent they have never met.",
  },
  {
    lead: "It captures what it learns.",
    body: "Name, number, price band, area, timeline, and the transcript, all written to the CRM so your callback starts from what they said rather than from a blank record.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * This object is the whole contract between a topic and the flagship rendering path. Every
 * `[[scene:key]]` in AI_CHAT_ASSISTANT_POST resolves against `scenes` here; a key with no
 * entry renders nothing rather than breaking the page. A new service topic writes a file in
 * this shape, drops the markers into its markdown, and touches no component.
 *
 * `band` is declared per scene, so a topic owns its own light/dark rhythm (no two adjacent
 * bands should share a background). `label` decides the rail: a scene with one is a
 * navigation destination, a scene without one is not. The pull quote and the close carry no
 * label deliberately — a quote is not somewhere you jump back to, and the close is where the
 * page ends anyway.
 *
 * `kind: "component"` still names a bespoke component. Those are the scenes not yet reduced to
 * primitives; the plan and the order are in docs/blog-flagship/FLAGSHIP-HANDOFF.md. */
export const AI_CHAT_FLAGSHIP: FlagshipContent = {
  film: FILM,
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
      heading: "A question at 11:40pm, and everything that fires behind the answer.",
      caption: [
        `Narrated, ${FILM.seconds} seconds. The flight through the galaxy into the neural map is live footage of the system running at `,
        { href: "/ai#chat", label: "realtylt.com/ai" },
        ". The 11:40pm exchange is staged for the film, and every line in it is something this page already says the assistant does. For the unstaged version, go and ask it yourself.",
      ],
    },
    "response-curve": { kind: "component", id: "response-curve", band: "light" },
    "response-gap": { kind: "component", id: "response-gap", band: "dark", label: "The gap" },
    "leads-calculator": {
      kind: "component",
      id: "cold-open-calculator",
      band: "light",
      label: "Your numbers",
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
      text: "The measure of an AI assistant is not how human it sounds. It is whether the answer was correct, whether it was immediate, and whether a real person showed up when it mattered.",
    },
    teardown: { kind: "component", id: "teardown", band: "light", label: "The teardown" },
    "failure-modes": {
      kind: "grid",
      band: "light",
      eyebrow: "Three ways it fails",
      heading: "All avoidable, all common.",
      columns: 3,
      items: FAILURE_MODES,
    },
    "system-diagram": {
      kind: "component",
      id: "system-diagram",
      band: "dark",
      label: "What it connects to",
    },
    /** The primary action is deliberately the LIVE assistant rather than a contact form. The
     * whole post argues that being answered immediately is the thing that matters, so the
     * close has to offer exactly that, not a form that replies tomorrow. This scene also
     * suppresses the template's generic "Ask us" band, so the reader gets one ending, not two. */
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "The buyer at 11:40pm is not coming back tomorrow to check whether you replied. They are going to be at somebody's open house on Saturday. The only real question is whose.",
      actions: [
        { label: "Talk to it right now", href: "/ai#chat", variant: "light" },
        { label: "See how it is built", href: "/services/ai-chat-assistant", variant: "outline-light" },
      ],
      footnote:
        "Ask it something hard. It will either answer, or tell you it cannot and offer to book a call.",
    },
  },

  /** Short rail labels for the prose headings. The ids and the ORDER are derived from the
   * document, so a heading renamed here degrades to its full text instead of leaving a dead
   * row, and _scratch-toc.mjs fails on a key that matches no heading. */
  headingLabels: {
    "the-number-everyone-quotes-and-what-it-really-means": "The number",
    "what-an-ai-chat-assistant-actually-does": "What it does",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
