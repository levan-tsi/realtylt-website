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

/** The film. One definition, read by the scene that plays it AND by the VideoObject JSON-LD,
 * so the two can never disagree about length, dimensions or what the clip actually shows.
 *
 * Unlike the chat film this one is entirely a rendered stage: no /ai galaxy footage, so no
 * headed browser and no GPU capture. A voice agent is a sound rather than a screen, and a
 * screen recording of a phone call is just a phone. What the film shows instead is this page's
 * own teardown, moving.
 *
 * The cut was DERIVED FROM THE VOICE: the narration was generated and measured first, and the
 * stage was built to its measured line boundaries. Regenerating it is fully scripted, see
 * docs/blog-flagship/FLAGSHIP-HANDOFF.md. */
/** ROUND 24 REFRESH (2026-11-03), from the agents' refresh draft and its second reader's 33 notes
 * (realtylt-agents company/agents/seo/drafts/2026-11-02-ai-voice-agent-missed-calls-real-estate*).
 * In the scenes: no vendor name (the call path named the voice platform); "AI assistant" in every
 * disclosure; outbound only with the consent and calling-hours checks (FCC 24-17 read 2026-11-03:
 * an AI voice is an artificial voice under the TCPA, prior express consent absent an emergency or an
 * exemption; 47 CFR 64.1200(c)(1), 8 a.m. to 9 p.m. at the called party's location); capability
 * lines made conditional on the connections, the source being our own service page; the
 * prevalence lines with no source ("most callers", "every third real call", "most people never
 * read") gone; five scenes added for the new sections (what it never does, who it fits, the
 * screening questions, the roadmap, the quiz). The film is kept as rendered. */
import { VOICE_QUIZ } from "./voice-quiz";

/** Our own method, cited as ours. */
const METHOD = { text: "our method, the RealtyLT AI assessment" };

export const VOICE_FILM = {
  src: "/video/film-942pm.mp4",
  poster: "/video/film-942pm-poster.jpg",
  width: 1280,
  height: 720,
  seconds: 45,
  /** ISO 8601, which is the only duration format VideoObject accepts. */
  duration: "PT45S",
  name: "9:42pm: what an AI voice agent does when the phone rings and nobody is there",
  description:
    "A buyer rings a real estate office at 9:42 on a Sunday evening. Four rings, then voicemail, and they call the next agent. The film then shows the same call taken by an AI voice agent: it says it is an assistant and that the call is recorded, answers from the listing, declines to guess at what it cannot verify, books from the live calendar and writes the whole call to the CRM.",
} as const;

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, for the reader who is skimming and for the
 * assistants that increasingly answer on somebody's behalf. Every line is argued in the body;
 * a summary that claims something the article does not support is how a summary box becomes a
 * liability. */
export const IN_SHORT: string[] = [
  "A call that rings out without a message can leave only a number and a time, not the reason anyone rang, and by the time you call back the caller may be talking to someone else.",
  /** ROUND I: "reach a decision maker" was a softening of what the study measured. The
   * operative sentence, read in the primary document and quoted in full in ai-chat-scenes.ts,
   * says firms were nearly seven times as likely "to qualify the lead (which we defined as
   * having a meaningful conversation with a key decision maker)". Reaching somebody is a
   * materially easier outcome than having a meaningful conversation with them, and the easier
   * one was attached to the 7x on all three of the short surfaces a skimmer sees. */
  "Speed decides who gets the conversation. Across 1.25 million leads, firms that made contact within the hour were nearly seven times likelier to get a meaningful conversation with a decision maker than firms that waited one more hour.",
  "An AI voice agent answers the calls you cannot take, asks the questions you approved and, when it is connected to your calendar, books a time. It does not close, and its first sentence says it is an AI assistant.",
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
  note: "Cross-industry research from 2011, timing replies to inquiries submitted through a website rather than to phone calls. These percentages are not a benchmark for any one trade and should not be quoted as one. They are a reason to measure your own response times, not a measurement of them.",
};

/** SCENE copy — the size of the gap. The page's SECOND cited graphic, and the reason it
 * exists is that this article's central claim had no number under it.
 *
 * The section it sits in argues that latency is not a specification on a phone agent, it is
 * the product, and that a caller reads silence as nobody being there. Every word of that was
 * assertion. This is the measurement: across ten languages on five continents, the average
 * gap between one person finishing a question and the next person starting to answer is 208
 * milliseconds, and every language's commonest gap falls between nothing and two tenths of a
 * second. That is the window a phone agent is trying to sit inside, and prose cannot show a
 * reader how narrow it is.
 *
 * Read in the primary document: Stivers, Enfield, Brown, Englert, Hayashi, Heinemann,
 * Hoymann, Rossano, de Ruiter, Yoon and Levinson, "Universals and cultural variation in
 * turn-taking in conversation", PNAS 106(26), 2009, PMID 19553212. Every figure below is
 * quoted from that paper: mean +208 ms across the full dataset, cross-linguistic median
 * +100 ms, Japanese fastest at +7 ms, Danish slowest at +469 ms, overall mode 0 ms with each
 * language's mode between 0 and +200 ms.
 *
 * NOT ONE NUMBER HERE IS OURS, deliberately. The obvious fifth bar is what a slow voice stack
 * takes to answer, and we have not measured it, so drawing it would put an invented figure on
 * a chart. The note draws the comparison in words instead, against the paper's own slowest
 * number, where the reader can check the arithmetic. */
export const TURN_GAP = {
  eyebrow: "The size of the gap",
  caption: "How long people leave before answering a question, measured in ten languages",
  bars: [
    { label: "Japanese, the fastest of the ten", value: 7, display: "7 ms" },
    { label: "The halfway point across all ten", value: 100, display: "100 ms" },
    { label: "The average across all ten", value: 208, display: "208 ms" },
    { label: "Danish, the slowest of the ten", value: 469, display: "469 ms" },
  ],
  /** THE AXIS IS THE ARGUMENT, so it is pinned rather than left to scale itself. Scaled to
   * its own biggest bar, Danish would be drawn full width and read as the maximum a person
   * could possibly wait, which is the opposite of the finding. Pinned to one second, the
   * empty right half of every track is the point: all of human conversation, across ten
   * languages and five continents, happens inside the left half of a single second. The
   * basis line says out loud what the track is, because an unlabelled axis is a lie you did
   * not have to tell. */
  max: 1000,
  /** The average, not the extreme. The two end bars exist to show how tight the whole span
   * is; the 208 is the number a reader should walk away holding. */
  lit: 2,
  /** TWO LEVELS ON ONE AXIS, said out loud, which is the lesson the workflow post's chart had to
   * learn the same day this one shipped. The outer bars are two of the ten language averages;
   * the inner two are the middle and the average of the whole dataset. Every figure is exact
   * and every label is accurate, and that is not the same as the chart being true: bars sitting
   * side by side get read as one comparison unless the caption says otherwise. */
  basis:
    "The grey track behind each bar is one full second. The outer two bars are the fastest and the slowest of the ten language averages. The inner two are the middle and the average of the whole dataset, which sit apart because the spread runs long. Ten languages on five continents, measured from video of ordinary unscripted conversation between two and six people. Yes or no questions were 67% of everything coded.",
  sourceText:
    "Stivers and ten co-authors, Universals and cultural variation in turn-taking in conversation, PNAS 2009.",
  sourceHref: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2705608/",
  note: "Read what this does not say. Every conversation in it happened face to face, and not one of them was a phone call. The same paper found responses came earlier when the questioner was looking at the recipient in nine of its ten languages, reaching significance in five, which is exactly what a phone takes away. It measures people answering people, so it has nothing at all to say about what a caller will put up with from a machine. What it does establish is the size of the window. Every one of the ten languages had its commonest gap somewhere between nothing and two tenths of a second. The authors also note that speakers are sensitive to shifts of a hundred milliseconds. An agent that takes a full second has left more than twice the gap of the slowest language average in the study.",
};

/** SCENE copy — the four moves.
 *
 * Lifted from the four steps in content/services/ai-voice-agents.ts (`howItWorks`) and put
 * into the article's voice. The scene REPLACES the list rather than repeating it, so these
 * words appear exactly once on the page. */
export const FOUR_MOVES: GridItem[] = [
  {
    lead: "It answers the calls you cannot take, including the ones at nine on a Sunday.",
    body: "Inbound calls route to the agent whenever you are unavailable, or always, depending on how you set it up. It says it is an AI assistant, answers what it can from your own information, and books a call back for the rest.",
  },
  {
    lead: "It can call new inquiries back quickly, when the checks allow.",
    body: "When an inquiry lands from your site, a portal or a campaign, the agent first checks the consent the person gave and the calling hours where they are. If both pass it calls; if not, the callback goes on a person's list.",
  },
  {
    lead: "It qualifies inside a normal conversation.",
    body: "What the job is, where it is, how soon it is needed and how they found you. Not a script read at someone. The questions you would ask, in the order a conversation actually goes.",
  },
  {
    lead: "It books, and then it writes it down.",
    body: "When it is connected to your calendar, it offers times from your live availability and confirms one on the call. Afterwards the notes and the outcome go into your customer records, so the appointment you walk into is one you already understand.",
  },
];

/** SCENE copy — the outbound direction.
 *
 * The service page calls outbound the half where most of the value sits, and the article was
 * almost entirely about receiving. These are deliberately NOT "it dials in seconds": that is
 * already FOUR_MOVES[1], and a scene repeating a claim the page has made is the duplication the
 * probe exists to catch. These two are what the instant-dial line does not cover, and both are
 * claims the service page already makes (`howItWorks` retry-on-schedule, and the
 * database-reactivation use case). */
export const OUTBOUND: GridItem[] = [
  {
    lead: "You can point it at one person and tell it to call.",
    body: "It does not have to wait for a trigger. Say someone registers and agreed to a call back. You tell the agent to dial that contact, and it does, inside the calling hours, with the same questions and the same booking at the end.",
  },
  {
    lead: "It can try again on a schedule you set.",
    body: "Someone who did not pick up at two in the afternoon may pick up later. You decide how many tries and when, inside the calling hours, and a request to stop ends the calls.",
  },
  {
    lead: "It can work a list, but only a consented one.",
    body: "Past inquiries who agreed to this kind of call can be worked through, with the ones ready to move handed back to you. A name without that consent comes off the list before the agent sees it.",
  },
  {
    lead: "A person approves every list first.",
    body: "A seasonal reminder or a new opening in the calendar can go to the people who asked to hear about it. A person approves the list and the script before the first call, and the call step cannot run without that approval.",
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
    text: "Hi. Water is coming through our bedroom ceiling since the storm. Do you come out to Beacon?",
  },
  {
    who: "us",
    at: "9:42 pm",
    text: "I am the company's AI assistant, and this call is recorded so nothing gets lost between now and the morning. Beacon is inside the area the company covers. What would you like to know?",
  },
  {
    who: "them",
    at: "9:43 pm",
    text: "Can someone look at it tomorrow, and what does a repair like that usually cost?",
  },
  {
    who: "us",
    at: "9:43 pm",
    text: "The visit I can book straight from the calendar. The cost I am not going to guess at. Nobody knows until the roofer has looked at it, and it is the kind of answer that decides who you hire. Let me book the visit, and a person will go through the cost with you there.",
  },
  { who: "them", at: "9:44 pm", text: "Tomorrow morning is fine." },
  {
    who: "us",
    at: "9:44 pm",
    text: "Nine thirty is open. You are booked in, and I have sent the details to the number you are calling from.",
  },
];

export const CALL_EVENTS: ConversationEvent[] = [
  { at: "9:42 pm", label: "Answered on the second ring", detail: "No hold, no voicemail, no callback form." },
  { at: "9:42 pm", label: "Said what it was", detail: "An AI assistant, and the call is recorded. Before anything else." },
  { at: "9:43 pm", label: "Answered from the record", detail: "The service area, read off the company's own list rather than recalled." },
  { at: "9:43 pm", label: "Declined to invent an answer", detail: "Flagged for a person instead of guessing at it." },
  { at: "9:44 pm", label: "Booked from the connected calendar", detail: "Offered a time from the live availability." },
  { at: "9:45 pm", label: "Written to the records", detail: "The notes and the outcome, before dinner ended." },
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
    body: "If the answer is a person's name rather than the words AI assistant, stop there. Everything else on this list depends on whether the provider treats disclosure as a feature or as a problem to be managed.",
  },
  {
    lead: "Ask what it does with a question it cannot answer.",
    body: "You are listening for one specific behavior: it says so, and it books a call. If the demo never once shows the agent failing at something, then you have been shown an advertisement rather than a product.",
  },
  {
    lead: "Ask to hear a call that went sideways.",
    body: "Anything sounds good reading a script to a cooperative caller. Ask for a recording where somebody interrupted it, changed their mind halfway, or went quiet.",
  },
];

/** SCENE copy — the call path diagram.
 *
 * The compact abstraction, not a re-telling of the teardown: each hop names what it actually
 * CONNECTS TO, which is the part a conversation view cannot show. Every connection here is
 * one the service page already claims. */
export const CALL_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The call", connects: "Your own number, any hour", at: "9:42 pm" },
  { label: "The agent", connects: "An AI assistant, given limits" },
  // Kept short deliberately: this is the third node, and the third node is the last one visible
  // before the spine scrolls on a 390px phone. A longer caption here cuts mid-phrase and reads as
  // a broken layout rather than as a scroller.
  { label: "Your services", connects: "What it may state" },
  { label: "Your calendar", connects: "Live availability, not a guess" },
  { label: "The record", connects: "Your records, with the notes" },
  { label: "The handoff", connects: "Time booked with a person", at: "9:30 am" },
];

/** SCENE copy — the three failure modes.
 *
 * Deliberately NOT the chat post's three. Those were about an assistant with nothing wired to
 * it; these are the three ways a phone agent that works technically still loses you the call. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "It is set up to answer everything.",
    body: "Set the hand-off first: the point at which it stops talking and books.",
  },
  {
    lead: "No limits were written down.",
    body: "Write the limits on price, condition and anything legal before the first call.",
  },
  {
    lead: "Nobody reads the calls.",
    body: "In the trial a named person reads every call; after it reads cleanly, a weekly reading.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Note what is NOT here: a component. Topic 1 shipped five bespoke scenes; this topic ships
 * zero, because the primitives it needed (`statbars`, `diagram`, `conversation`, `plate`) were
 * generalised in the same round rather than copied. That is the whole test of the template.
 *
 * The film is this topic's OWN. The chat piece's film was never an option: it is narrated
 * around a buyer MESSAGING a website at 11:40pm and being texted listings, and putting a video
 * about the wrong channel on a page arguing that you should say what is true would have cost
 * more than a failed checklist item is worth. */
export const AI_VOICE_FLAGSHIP: FlagshipContent = {
  film: VOICE_FILM,
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
    /** The caption discloses that the narration is a voice clone. On a page whose whole
     * argument is that an AI voice should say what it is, narrating the film with a synthetic
     * copy of a real person and staying quiet about it would be the exact hypocrisy the piece
     * warns about. It costs one sentence and it is the most on-brand sentence here. */
    reel: {
      kind: "film",
      band: "dark",
      label: "Watch it",
      ariaLabel: "Watch it work",
      eyebrow: "Watch it work",
      heading: "A phone ringing at 9:42, and the same call taken properly.",
      caption: [
        `Narrated, ${VOICE_FILM.seconds} seconds. The voice reading it is a licensed clone of my own, which on this page seemed worth saying out loud rather than leaving you to wonder. The call is staged for the film and every line in it is something this page already says the agent does. The seven-times figure is the study cited below. For the version nobody staged, the `,
        { href: "/services/ai-voice-agents", label: "service page" },
        " has the whole build.",
      ],
    },
    "response-audit": {
      kind: "statbars",
      band: "light",
      label: "The evidence",
      ...RESPONSE_AUDIT,
    },
    /** Dark on purpose. It lands in the middle of the longest run of white reading column on
     * the page, and it is also the only place the article's central claim about latency has a
     * measured number under it. */
    "turn-gap": {
      kind: "statbars",
      band: "dark",
      label: "The silence",
      ...TURN_GAP,
    },
    "calls-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "What do the calls you never took add up to?",
      ariaLabel: "What missed calls add up to",
      inputs: [
        {
          kind: "range",
          id: "missed",
          label: "Calls you miss in a month",
          hint: "Evenings, weekends, a job site, a client in the chair. Count the ones that rang out.",
          min: 5,
          max: 120,
          step: 5,
          initial: 25,
          format: "count",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "real",
          label: "Of those, the share that were a real inquiry",
          hint: "Wrong numbers, sales calls and suppliers are not inquiries.",
          min: 10,
          max: 100,
          step: 5,
          initial: 60,
          format: "percent",
          width: "w-[5.5rem]",
        },
        {
          kind: "choice",
          id: "callback",
          label: "When do you usually call them back?",
          initial: 1,
          options: [
            {
              value: 0.25,
              label: "Within the hour",
              sub: "Most are still deciding",
              display: "a quarter of them",
            },
            {
              value: 0.5,
              label: "Later the same day",
              sub: "Half have moved on",
              display: "half of them",
            },
            {
              value: 0.75,
              label: "Tomorrow, when you notice",
              sub: "They already spoke to someone",
              display: "three quarters of them",
            },
          ],
        },
      ],
      chain: [
        {
          label: "Calls that rang out",
          by: { from: "input", id: "missed" },
          format: "count",
          unit: "a month",
        },
        {
          label: "That were a real inquiry",
          by: { from: "input", id: "real" },
          format: "count",
          unit: "a month",
        },
        {
          label: "You never get back into a conversation with",
          by: { from: "input", id: "callback" },
          format: "count",
          unit: "a month",
        },
        {
          label: "Over a year",
          by: { from: "rate", value: 12, display: "12 months" },
          format: "count",
          unit: "a year",
        },
      ],
      headline: 3,
      resultLabel: "Conversations a year going to whoever picked up",
      note: "Two things are worth knowing about these sums. The first is that they are far gentler than the research above would justify. The 1.25 million lead study found firms contacting within an hour were nearly seven times likelier to get a meaningful conversation with a decision maker than firms that waited one more hour, and more than sixty times likelier than firms that waited a day. Turning odds like that into a slider would produce a number nobody should believe, so the callback curve here is a plain judgement, and yours to disagree with. The second is that the sum stops at conversations. What one is worth depends on your trade and your prices, so that last step is yours to finish. This counts inbound calls only, and the contacts already sitting cold in your records are a different population in a different article.",
      action: { label: "See how it is built", href: "/services/ai-voice-agents" },
      secondary: { label: "Ask about yours", href: "/connect" },
    },
    /** Placed after the legal section, on the sentence telling the reader to have their own
     * attorney read the script. Handing over the script itself is the give: it makes that hour
     * cheaper, and the disclosure lines are already published in the prose above, so this is
     * offering a document rather than making a new claim. */
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The script itself",
      text: "Ask and we will send you in writing the exact opening our agents use. One line says it is an assistant. The other says the call is recorded. Give those to your attorney rather than a blank page.",
      reassure: "One page, no charge, and yours to use whoever ends up building the thing.",
      action: { label: "Ask for the script", href: "/connect" },
      ariaLabel: "Ask for the disclosure script",
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/counties/putnam.jpg",
      // ROUND I: enriched from the 16:9 crop, and the caption's "from the water" corrected. The
      // camera is standing on the stony shore looking out, not on the river.
      alt: "Dusk over the Hudson at Cold Spring, New York, four broken pilings and a slab of an old dock standing in the shallows in front of a stony shore, dark wooded hills closing the river on both sides and the sky going gold and pink between them",
      caption:
        "Cold Spring, from the shore. The call at 9:42 is someone deciding who comes to look at their roof this week, and that decision does not wait until Monday to get made.",
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
    /** Light, deliberately: it sits between two dark bands (four-moves and the pull quote) with
     *  only prose in between, and three darks in a row flattens the rhythm of the whole middle. */
    outbound: {
      kind: "grid",
      band: "light",
      label: "Calling out",
      eyebrow: "The other direction",
      heading: "Calling out, and the rules it follows.",
      columns: 2,
      items: OUTBOUND,
    },
    /** The first sentence used to be "A phone call has no typing indicator", which is the
     * opening sentence of a body paragraph two screens above it, word for word. A pull quote
     * that lifts a nearby sentence is a copy and paste rather than a distillation, and it is
     * the one scene on this page where the reader reads the same words twice. Nine of the
     * cohort's ten statements were already original; this was the tenth. */
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "On a phone, silence is all the caller hears while the agent works out its answer. Keep it short, and test it yourself.",
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
      heading: "Each one is a setup problem.",
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
      text: "In the story at the top, the caller at 9:42 did not try again on Monday. Ring your own number this Sunday and hear what they heard.",
      actions: [
        { label: "See it on the AI page", href: "/ai#voice", variant: "light" },
        { label: "How it is built", href: "/services/ai-voice-agents", variant: "outline-light" },
      ],
      footnote:
        "The chat assistant on that page is live and will answer you right now. A voice agent is set up for each business, against its own number and its own calendar, so there is no shared demo line to ring.",
    },

    /** ROUND 24: the four things it never does, as tiles. */
    never: {
      kind: "tiles",
      band: "dark",
      label: "What it never does",
      eyebrow: "The limits, before anything else",
      heading: "Four things it never does",
      alt: "Four tiles for what an AI voice agent never does: close a sale, guess at what it cannot verify, pretend to be a person, or take over a relationship that matters.",
      columns: 2,
      tiles: [
        { figure: "1", title: "Close", body: "Tone, pauses and the second voice in the room stay with you." },
        { figure: "2", title: "Guess", body: "What it cannot check becomes a booked call." },
        { figure: "3", title: "Pretend", body: "Its first sentence says it is an AI assistant." },
        { figure: "4", title: "Replace you", body: "Past clients and referrals get a message and your call back." },
      ],
      sources: [METHOD, { text: "our AI voice agents page", href: "https://realtylt.com/services/ai-voice-agents" }],
    },

    /** ROUND 24: who it fits and who it does not, with what the second group does instead. */
    fits: {
      kind: "grid",
      band: "light",
      label: "Who it fits",
      eyebrow: "Who this is for",
      heading: "A good fit, a poor fit, and what to do instead",
      columns: 2,
      items: [
        { lead: "A good fit", body: "Calls that come while you cannot pick up: job sites, a patient or a client in the chair, showings, evenings and weekends. First questions that repeat, and a booked time as the next step." },
        { lead: "A poor fit", body: "An office where a person answers almost every call, or callers who are nearly all past clients and referrals expecting you by name." },
        { lead: "Instead, for a poor fit", body: "A shared phone rota, a greeting that says when you call back and keeps that promise, or a text back where the caller agreed to texts." },
        { lead: "Either way", body: "Whatever answers the phone says what it is, and a person owns what happens next." },
      ],
    },

    /** ROUND 24: the screening questions and the verdict for answering calls. Our method. */
    "worth-it": {
      kind: "flow",
      band: "dark",
      label: "The screening questions",
      eyebrow: "Before anything is set up",
      heading: "Is answering your missed calls worth automating?",
      lede: "Each question can send the job to the tray. What survives keeps a person on it, because a caller is a customer.",
      alt: "A track runs past four gates: whether anything breaks if the job stops, whether the phone or booking tool you already pay for does it, whether the rule can be written for a new hire, and whether the impact scores 3 or more, where a no sends the job to a tray marked leave it alone and what survives is set up with a person approving what the agent may say.",
      tray: "Leave it alone",
      gates: [
        { ask: "Does anything break if the calls go unanswered?", pass: "Yes", exit: "No", outcome: "Stop worrying about it", detail: "If nothing breaks, nothing needs building." },
        { ask: "Is it missing from the tools you already pay for?", pass: "Missing", exit: "One does it", outcome: "Switch the setting on", detail: "A phone system's own feature comes first." },
        { ask: "Can the rule be written for a new hire?", pass: "Yes", exit: "No", outcome: "Settle the rule first", detail: "Each stall in the two-minute test is a missing default." },
        { ask: "Does the impact score 3 or more out of 5?", pass: "Yes", exit: "No", outcome: "Saves too little", detail: "A person keeps answering." },
      ],
      end: {
        title: "Set it up with a person on it",
        detail: "Risk at least 3: the agent says only what a person approved, and outbound calls wait for an approved list.",
      },
      example: "The accounting office's assistant stalls at tax-season appointments, so that default is written first.",
      sources: [METHOD],
    },

    /** ROUND 24: the suggested trial schedule. */
    roadmap: {
      kind: "steps",
      band: "light",
      label: "The roadmap",
      eyebrow: "A suggested trial schedule",
      heading: "One job, one direction, a decision written down",
      alt: "A suggested trial schedule: this week ring your own number, read the missed calls and run the two-minute test; over the next two weeks write and approve the defaults and try evening and weekend calls on one line with a named person reading every call; then write the decision down with its owner.",
      steps: [
        { title: "This week", body: "Ring your own number, read the missed calls, run the two-minute test." },
        { title: "The next two weeks", body: "Approve the defaults and the opening line; one direction on one line, every call read." },
        { title: "Then", body: "Keep it, change it or leave it alone, with the reason and the owner written down." },
      ],
      close: "A schedule to start from, not a deadline: the reading decides when it moves on.",
      sources: [METHOD],
    },

    /** The owner's quiz (2026-10-31), tested against the post in voice-quiz.test.ts. AI brand. */
    quiz: {
      kind: "quiz",
      band: "night",
      label: "Quiz",
      ariaLabel: "Quiz: what did you learn",
      eyebrow: "Ten questions",
      title: "What did you learn? Check it in two minutes",
      brand: "ai",
      passLine: "You know what to ask. If you want us to look at your phone line and the jobs around it with you, we can run the assessment together.",
      failLine: "Under half this time. Skim the legal part and the screening questions again, then have another go.",
      questions: VOICE_QUIZ,
    },
  },

  /** Short rail labels for the prose headings. The ids and the ORDER are derived from the
   * document, so a renamed heading degrades to its full text instead of leaving a dead row,
   * and scripts/_scratch-toc.mjs fails on a key that matches no heading. */
  headingLabels: {
    "what-a-missed-call-actually-costs": "The cost",
    "why-nobody-leaves-the-voicemail": "No voicemail",
    "what-an-ai-voice-agent-for-small-business-does": "What it does",
    "the-same-agent-pointed-the-other-way": "Calling out",
    "the-one-thing-that-decides-whether-it-works": "Latency",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "the-legal-part-nobody-sells-you": "The legal part",
    "where-it-goes-wrong": "Where it fails",
    "who-an-ai-voice-agent-fits-and-who-it-does-not": "Who it fits",
    "is-it-worth-automating": "Worth automating?",
    "what-to-do-first": "Your first weeks",
    "common-questions": "Common questions",
    "what-to-do-about-it": "What to do",
    sources: "Sources",
  },
};
