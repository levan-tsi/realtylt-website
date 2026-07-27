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

export interface Move {
  /** The move itself, in the article's words. */
  lead: string;
  /** What it means in practice. */
  body: string;
}

/** The flagship's on-page table of contents, in document order.
 *
 * Curated rather than derived, for the same reason the service pages curate theirs: the rail
 * shows one short line per row, and a full H2 like "The number everyone quotes, and what it
 * really means" does not fit. Prose ids are the slugified headings from lib/blog/toc.ts;
 * scene ids are `scene-<key>`, applied by the flagship layout in app/blog/[slug]/page.tsx.
 *
 * `scene: true` marks a visual destination so the rail can tick it differently: the reader
 * can see there is something to LOOK at there, not just more prose.
 *
 * Deliberately omits the pull quote and the closing scene. A quote is not somewhere you
 * navigate back to, and the close is where the page ends anyway. Keep the ids in sync with
 * the markdown headings and the scene markers; scripts/_scratch-toc.mjs asserts every row
 * resolves to a real element. */
export const FLAGSHIP_TOC: { id: string; label: string; scene?: boolean }[] = [
  { id: "the-number-everyone-quotes-and-what-it-really-means", label: "The number" },
  { id: "scene-response-gap", label: "The gap", scene: true },
  { id: "scene-leads-calculator", label: "Your numbers", scene: true },
  { id: "what-an-ai-chat-assistant-actually-does", label: "What it does" },
  { id: "scene-four-moves", label: "Four moves", scene: true },
  { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
  { id: "scene-teardown", label: "The teardown", scene: true },
  { id: "common-questions-answered-honestly", label: "Common questions" },
  { id: "where-it-goes-wrong", label: "Where it goes wrong" },
  { id: "what-to-do-about-it", label: "What to do" },
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
