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
