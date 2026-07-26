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
