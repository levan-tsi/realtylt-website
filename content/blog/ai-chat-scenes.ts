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
 * READ IN THE PRIMARY DOCUMENT on 2026-08-03, and two things in this block were wrong before
 * that. hbr.org paywalls the article; the full text is two pages and its operative sentence is:
 *
 *   "a separate study, which involved 1.25 million sales leads received by 29 B2C and 13 B2B
 *   companies in the U.S. Firms that tried to contact potential customers within an hour of
 *   receiving a query were nearly seven times as likely to qualify the lead (which we defined
 *   as having a meaningful conversation with a key decision maker) as those that tried to
 *   contact the customer even an hour later -- and more than 60 times as likely as companies
 *   that waited 24 hours or longer."
 *
 * Fault 1: the on-screen source said "29 companies". It is 29 B2C AND 13 B2B, so 42.
 * Fault 2: it credited "Dr James Oldroyd's study". The separate study is the article's own
 * ("a phenomenon WE explored"), so it carries all three authors like the voice post's does.
 * Fault 3: the paper publishes TWO ratios, not three. The middle bar is 60/7, which is our
 * arithmetic on their numbers rather than a figure they printed, and that was said only here
 * in a comment where no reader could see it. It is now in the note, on screen, and the bar
 * reads "about 8.6x" so the eye meets the approximation before the footnote does.
 *
 * 60x is also a floor, not a point estimate: the paper says "more than 60 times". Indexing the
 * 24-hour case at 1x and drawing 60 is the conservative reading of that. */
export const RESPONSE_CURVE = {
  caption: "Relative odds of qualifying a lead, by how fast you respond",
  bars: [
    { label: "Within 1 hour", value: 60, display: "60x" },
    { label: "One hour later", value: 8.6, display: "about 8.6x" },
    { label: "After 24 hours", value: 1, display: "1x" },
  ],
  sourceText:
    "Harvard Business Review, The Short Life of Online Sales Leads (2011), by James Oldroyd, Kristina McElheran and David Elkington, reporting their separate study of 1.25 million sales leads received by 29 B2C and 13 B2B companies in the US.",
  sourceHref: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
  note: 'Cross-industry lead response research, not a real estate study. The paper publishes two ratios rather than three: contact within an hour was "nearly seven times" as likely to qualify a lead as contact an hour later, and "more than 60 times" as likely as waiting a day or more. The middle bar is those two divided, not a third figure they measured. The pattern is what carries over.',
};

/** SCENE copy — "In short".
 *
 * Three lines that carry the whole argument, for the reader who is skimming and for the AI
 * assistants that increasingly answer questions ON someone's behalf. Deliberately NOT a
 * restatement of the hero excerpt (which sets up the problem): these are the answers.
 *
 * Every line is already argued somewhere in the body. A summary that claims something the
 * article does not support is how a summary box becomes a liability.
 *
 * IT BECAME ONE, and the fix is the reason this comment now names the failure. Line one asserted
 * "roughly 78% of leads close with whoever responds first" for a day after the body had been
 * rewritten to say that figure has no traceable source and that this article declines to use it.
 * So the page argued against itself, and it did it in the single worst place: this box exists to
 * be lifted by an assistant answering on somebody's behalf, which made the unsourceable number
 * the most quotable thing on a page whose whole argument is that the details are checkable.
 *
 * The rule that follows: when a claim is removed from the body, grep the SCENES for it. The
 * summary, the calculator note and the chart caption are separate files and none of them moves
 * on its own. */
export const IN_SHORT: string[] = [
  "Being first buys the conversation. Trying within the hour was nearly seven times likelier to reach a decision maker than waiting one more hour.",
  "A good assistant answers at any hour, searches the live MLS, moves to text, and writes what it learns to the CRM.",
  "It does not close, and it should say so rather than invent an answer it cannot verify.",
];

/** SCENE copy — the three failure modes.
 *
 * Lifted VERBATIM from the bullet list that used to sit under "Where it goes wrong" in
 * AI_CHAT_ASSISTANT_POST. Same rule as the four moves: the scene REPLACES the list rather
 * than repeating it. */
/** SCENE copy — the three self-checks.
 *
 * Every other flagship stages its rules section as an ACTION grid after the explanation:
 * reactivation's consent check, qualification's fair-play rules, workflow's three rules for
 * keeping a chain visible. This post explained three rules across seven hundred words of
 * quoted statute and then handed the reader nothing to do with them, which made it the only
 * post in the set whose hardest reading had no exit.
 *
 * It ADDS rather than repeats: two instructions that were buried at the end of a statute
 * paragraph came out of the prose and became fuller versions of themselves here, and the
 * first rule never had an action at all. A scene replaces the markdown it stages, so those
 * sentences now appear exactly once on the page.
 *
 * Three columns on a dark band. That combination is already proved by the workflow post and
 * is new to this one, which matters because this post's other three-column grid sits on mist
 * and the two would otherwise be the same picture twice. */
export const SELF_CHECKS: Move[] = [
  {
    lead: "Open your own chat window and read the first thing it says.",
    body: "The test is not whether a disclosure exists somewhere in your terms. It is whether a stranger on a phone would know, inside one line, that they are talking to software. If you have to go looking for it, it is not clear and conspicuous, and the fix is one sentence you can write this evening.",
  },
  {
    lead: "Time one of your own listing pages twice, and keep both numbers.",
    body: "Once before the widget goes on and once after, on a phone rather than on your desktop, because that is where your traffic is. The thresholds are published and the test costs nothing. If the vendor cannot tell you what their script weighs, that is your answer, and the good ones load nothing at all until somebody taps the bubble.",
  },
  {
    lead: "Tab into the chat window, then try to tab back out of it.",
    body: "Keyboard only, no mouse, on the page a buyer would actually land on. If focus goes in and will not come out, a visitor using a screen reader is stuck on your website with no way forward. That is not a slow page. That is somebody who cannot leave your front door.",
  },
];

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
    /** This plate used to be the Poughkeepsie railroad bridge, which the reactivation post also
     * carries. Two flagships in a five-post cohort were running the same photograph, and
     * `siblingOverlap` cannot see it because it reads text. It was also the wrong picture: a
     * flat grey river on a page whose whole argument is that somebody wanted to know one thing
     * about ONE HOUSE. The bridge stays where it earns its place, on reactivation, where a
     * crossing that sat unused for thirty five years is the argument. */
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-01.jpg",
      // ROUND I re-read this at the 16:9 crop. Nothing was wrong, only thin: the shipped phone
      // crop carries the gambrel roof, the row of dormers and the two walls in front of the house
      // and the old alt described none of it. The house number is legible on the porch beam and
      // is deliberately NOT transcribed: it is a real house, and the skip-tracing post on this
      // site argues at length about publishing an address somebody did not publish themselves.
      alt: "A cedar shingled house with a gambrel roof and a row of shingled dormers, a deep covered porch across the front carried on bracketed white posts with a lantern hanging under it, seen from the street over a river stone wall and a brick retaining wall, with mature trees crowding in on both sides",
      caption:
        "A shingled house with a deep porch and a light hanging in it. This is the shape of nearly every question this article is about. Nobody messages a real estate website at twenty to midnight to ask what an AI assistant is. They ask whether the seller of one specific house would look at a contingent offer, and no amount of fluency answers that. Something behind the conversation has to know which house you mean.",
      credit: "Photograph by CodyR, CC BY 2.0.",
      ariaLabel: "A house with a porch light on",
    },
    "response-curve": { kind: "component", id: "response-curve", band: "light" },
    "response-gap": { kind: "component", id: "response-gap", band: "dark", label: "The gap" },
    "leads-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "What is answering late costing you?",
      ariaLabel: "What answering late costs",
      inputs: [
        {
          kind: "range",
          id: "inquiries",
          label: "Inquiries through your site each month",
          hint: "Form fills, chat starts, is-this-still-available texts.",
          min: 5,
          max: 200,
          step: 5,
          initial: 40,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "choice",
          id: "speed",
          label: "How fast do you reply, honestly?",
          initial: 1,
          options: [
            // The share HANDED OVER, against an immediate reply: an immediate reply wins about
            // 90% of the conversations, a few hours about half, the next day about a fifth.
            { value: 0, label: "Within minutes", sub: "Usually first", display: "none of them" },
            {
              value: 0.4,
              label: "A few hours",
              sub: "Often second or third",
              display: "40% of them",
            },
            {
              value: 0.68,
              label: "The next day",
              sub: "Usually too late",
              display: "68% of them",
            },
          ],
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
          label: "Inquiries through your site",
          by: { from: "input", id: "inquiries" },
          format: "count",
          unit: "a month",
        },
        {
          label: "Handed to whoever answered first",
          by: { from: "input", id: "speed" },
          format: "count",
          unit: "a month",
        },
        {
          label: "Over a year",
          by: { from: "rate", value: 12, display: "12 months" },
          format: "count",
          unit: "a year",
        },
        {
          label: "That would have become a closing",
          by: { from: "rate", value: 0.05, display: "a 5% close rate" },
          format: "count",
          unit: "a year",
        },
        {
          label: "In commission",
          by: { from: "input", id: "commission" },
          format: "money",
          unit: "a year",
        },
      ],
      headline: 4,
      resultLabel: "Commission you are handing over",
      note: "The arithmetic is on screen on purpose, because the easy version of this calculator is a lie. The reply curve is a judgement and not a measurement: an immediate reply is treated as winning roughly nine conversations in ten, a few hours about half, the next day about a fifth. It is shaped by the research quoted above rather than derived from it, and deliberately not by the unsourced 78% figure this article declines to use. The 5% close rate is ours and is deliberately low, because an inquiry is a conversation and not a signed deal, and a calculator that multiplies every missed inquiry by a full commission is selling you something. The two numbers you can drag are yours. All three are a place to start arguing from, not a measurement of your business.",
      action: { label: "See how it is built", href: "/services/ai-chat-assistant" },
      secondary: { label: "Talk it through", href: "/connect" },
    },
    "self-checks": {
      kind: "grid",
      band: "dark",
      eyebrow: "Three you can run tonight",
      heading: "All three take an afternoon, and none of them needs us.",
      columns: 3,
      items: SELF_CHECKS,
    },
    /** Placed straight after "How to test one before you buy it", which is the most generous
     * section in the piece: four questions the reader can put to any vendor, us included. The
     * offer is to run those same five questions for them. Nothing new is being sold here. */
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "Or have us run it",
      text: "Send us the address of your site and we will put all five of those questions to whatever is answering on it now, then send you back what it actually said.",
      reassure: "No charge, and nobody calls you unless you ask us to.",
      action: { label: "Send us your site", href: "/connect" },
      ariaLabel: "Have us test your current chat widget",
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
        "Ask it the thing you think would catch it out. The answer you want is either a real one or an honest no.",
    },
  },

  /** Short rail labels for the prose headings. The ids and the ORDER are derived from the
   * document, so a heading renamed here degrades to its full text instead of leaving a dead
   * row, and _scratch-toc.mjs fails on a key that matches no heading. */
  headingLabels: {
    "the-number-everyone-quotes-and-where-it-actually-comes-from": "The number",
    "what-an-ai-chat-assistant-actually-does": "What it does",
    "what-makes-an-answer-true-which-is-the-whole-job": "True answers",
    "the-part-nobody-selling-you-a-chat-widget-mentions": "The fine print",
    "what-it-costs-and-how-long-it-takes": "What it costs",
    "how-to-test-one-before-you-buy-it": "How to test one",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
