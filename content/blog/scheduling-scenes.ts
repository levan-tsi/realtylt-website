/** Scene copy for the AI scheduling flagship post (topic 16).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Sixteenth topic on the flagship template and the FIFTEENTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 15. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/ai-scheduling.ts. Nothing here
 * claims a capability that page does not claim, and that page was rewritten in the same round
 * because three of its claims were absolutes this article's own sources contradict.
 *
 * THE HARDEST SIBLING PROBLEM IN THE WHOLE ROLLOUT, and it is topic 7. It was read in full,
 * twice, before a word of this was written.
 *
 *   TOPIC 7, ai appointment booking, owns EVERYTHING that happens between one person asking for
 *   your time and that person standing in a house. Lead time and the no-show curve. The
 *   randomised reminder trial. Free and busy against full read access. What a booking is
 *   technically, and the difference between a text message with a date in it and an invitation
 *   with an alarm on it. Its calculator counts appointments you keep. NONE of that appears here,
 *   and this article never argues that shorter lead times or better reminders make people turn
 *   up, because that argument already exists on this website and is already properly sourced.
 *
 *   THIS post is about the appointments that need somebody ELSE'S yes. A showing on a listing
 *   you do not hold needs the listing side, the occupant and a way in; a closing needs an
 *   attorney, a lender and a title company. Your software can read and write exactly one of the
 *   calendars involved. Everything else is a message you sent and a reply you may not have. The
 *   unit is not the appointment, it is the agreement you do not have yet, and the expensive
 *   failure is not an empty porch. It is telling somebody a time was confirmed when it was not.
 *
 * Nothing on this website has previously mentioned iTIP, CalDAV, PARTSTAT, an organizer, a
 * scheduling delivery status or a counter proposal. Checked by grep across every post body and
 * every service page before this file was written.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. What the machine could
 * not do, what the standard already calls the thing you do not have, and the cost of moving it. */
export const IN_SHORT: string[] = [
  "A scheduling assistant that ran for five months at Microsoft Research finished 39% of its requests without a person ever touching them. The three commonest reasons the other 61% needed a human were all the same reason: an attendee replied in a way the system did not expect, an attendee could not take any of the offered times, or an attendee never replied at all.",
  "The calendar standards already have a word for an appointment nobody has agreed to. It is the value an invitation starts life with, and it is the value most of your confirmed showings are still sitting at when you tell somebody they are confirmed.",
  "And moving the time is not free. The standard that governs how calendar servers do scheduling requires that when the start time changes, every attendee's answer is thrown away and set back to unanswered. A reschedule does not carry the agreement with it. It asks for it again.",
];

/** SCENE copy — the seam with topic 7, stated by contrast rather than by summary.
 *
 * Three cards. Each names the question a neighbouring article answers and then says which
 * question is left over. The cards do NOT summarise those articles. */
export const NOT_THE_BOOKING: GridItem[] = [
  {
    lead: "Not whether they turn up",
    body: "Getting somebody from an inquiry into a time they have written down, and getting them to be there on the day, is a real problem with real evidence behind it, and it is written up on its own. That question has two people in it and only one calendar that has to be true. This one starts at the point where a time is agreed and asks a different question: agreed by whom.",
  },
  {
    lead: "Not the chain of steps",
    body: "Wiring your systems so that finishing one thing starts the next is a different product again. Every step in that chain is yours. Here the important steps happen in an office that is not yours, on a calendar you cannot read, run by somebody who owes you nothing and has a full week of their own.",
  },
  {
    lead: "Not the phone being answered",
    body: "Answering fast matters and it is the smallest part of this. A reply inside ten seconds that proposes eleven on Saturday has not scheduled anything. It has made an offer on behalf of three people, two of whom have not been asked yet, and the speed of it is what makes the offer sound like a fact.",
  },
];

/** SCENE copy — the escalation table. Cited data graphic ONE.
 *
 * Justin Cranshaw, Emad Elwany, Todd Newman, Rafal Kocielnik, Bowen Yu, Sandeep Soni, Jaime
 * Teevan and Andres Monroy-Hernandez, "Calendar.help: Designing a Workflow-Based Scheduling Agent
 * with Humans in the Loop", CHI 2017, arXiv:1703.08428v1, 24 March 2017. Read in the arXiv PDF
 * with pdftotext.
 *
 * Method, from Table 1 and the Evaluation section: Study 3b ran from 5 April 2016 to 25 August
 * 2016 with open usage and no gratuity, 178 participants with at least one scheduling request,
 * 1,981 invitees, 1,626 meetings and 15,659 emails. Subscribers cc'd an email assistant, which
 * proposed times from the subscriber's calendar and negotiated with the invitees.
 *
 * Table 3, quoted as printed, is the reasons a request escalated to a macrotask, which is the
 * paper's name for handing the whole thing to a trained human being:
 *
 *   "Multiple or out of bound email responses from an attendee." 32%
 *   "None of the proposed times were acceptable to everyone." 27%
 *   "Timed-out while waiting for a response from an attendee." 26%
 *   "Other / unknown / not instrumented." 14%
 *   "Manual (worker) escalation in processing ballot response." 8%
 *   "Cannot access organizer's calendar." 7%
 *   "Manual (worker) escalation in proposing meeting times." 7%
 *   "Manual (worker) escalation in determining attendees." 2%
 *
 * And the caveat that has to travel with the chart, quoted: "Note, these are not mutually
 * exclusive: multiple reasons can trigger macrotasks in parallel." The shares therefore do not
 * sum to a hundred; they sum to a hundred and twenty three.
 *
 * FOUR BARS OUT OF EIGHT, and the choice is the argument. The three largest are drawn because
 * all three are the same category of failure and the paper's own wording says so: an attendee
 * did something. "Cannot access organizer's calendar" is drawn as the fourth because it is the
 * only row on the whole table that is about the organiser's own systems, which is the half every
 * product in this category is sold on. The four excluded rows are one uninstrumented bucket and
 * three internal worker escalations, none of which describes a party to the meeting.
 *
 * AXIS PINNED TO 100 because these are shares of the escalating requests.
 *
 * WHY THE FOURTH BAR IS LIT: because it is the small one. The thing your software controls is
 * the thing that went wrong least.
 */
export const ESCALATIONS = {
  eyebrow: "The evidence",
  caption: "Why a scheduling agent had to hand the meeting to a person",
  bars: [
    { label: "An attendee replied in a way it did not expect", value: 32, display: "32%" },
    { label: "No offered time worked for everybody", value: 27, display: "27%" },
    { label: "An attendee never replied at all", value: 26, display: "26%" },
    { label: "It could not read the organiser's own calendar", value: 7, display: "7%" },
  ],
  max: 100,
  lit: 3,
  basis:
    "Four of the eight reasons recorded when a request escalated from the automated workflow to a trained human, across a five month deployment in which 178 people scheduled 1,626 meetings by email. The first three are things an attendee did. The fourth is the only row on the published table that is about the organiser's own systems. A request can carry more than one reason at once, so the eight rows sum to more than a hundred.",
  sourceText:
    "Cranshaw, Elwany, Newman, Kocielnik, Yu, Soni, Teevan and Monroy-Hernandez, Calendar.help: Designing a Workflow-Based Scheduling Agent with Humans in the Loop, CHI 2017, Table 3.",
  sourceHref: "https://arxiv.org/abs/1703.08428",
  note: "These are meetings between information workers, not showings, and the assistant worked by email rather than by text. What carries is the shape, and the shape is uncomfortable for anybody selling this category. The failures cluster almost entirely on the side of the table the vendor does not control, and the failure the demonstrations are about, reading the organiser's calendar, is the smallest bar on the chart. Four other rows are not drawn: one is an uninstrumented bucket at 14%, and three at 8%, 7% and 2% are the system escalating internally rather than anything a party to the meeting did. Read the three big bars as one finding rather than three, because they are three ways of writing down the same sentence: somebody else had not answered yet.",
};

/** SCENE copy — the ceiling. Cited data graphic TWO.
 *
 * Same paper, the System Efficiency section, quoted: "In Study 3b, 39% of the requests
 * Calendar.help received were completed entirely within the microtasking workflows of Tiers 1
 * and 2, never escalating to a macrotask. The remaining 61% of requests were partially processed
 * in Tiers 1 and 2, requiring some intervention by a macrotask worker at some point in the
 * request life-cycle."
 *
 * THE HONEST READING, and it is in the note rather than hidden: Tier 1 is automation and Tier 2
 * is a non-expert human doing a small piece of work, so 39% is NOT "39% fully automated". It is
 * the share that never needed the expensive person. The paper is explicit that Tiers 1 and 2 are
 * different things, and quoting the number without that would overstate it in our favour.
 *
 * ALSO IN THE NOTE, because it is the sentence that makes this transfer to real estate: 84% of
 * the requests in the same study were two-person meetings, and only 15% involved three or more
 * attendees. The population that produced this table is overwhelmingly the EASY case.
 *
 * AXIS PINNED TO 100 because the two bars are shares of one population and sum to it. */
export const CEILING = {
  eyebrow: "The evidence",
  caption: "How 1,626 real scheduling requests actually finished",
  bars: [
    { label: "Finished without the expert ever being called in", value: 39, display: "39%" },
    { label: "Needed a trained person at some point", value: 61, display: "61%" },
  ],
  max: 100,
  lit: 1,
  basis:
    "Shares of the 1,626 meetings scheduled during the five month deployment. The first bar is the share handled entirely inside the system's structured workflow, which the authors are careful to say includes small pieces of work done by non-expert people as well as fully automated steps. The second is the share that reached a trained scheduling worker at some point in its life.",
  sourceText:
    "Cranshaw et al., Calendar.help, CHI 2017, System Efficiency: 39% of requests completed entirely within the microtasking workflows, the remaining 61% requiring some intervention.",
  sourceHref: "https://arxiv.org/abs/1703.08428",
  note: "Two things stop this being a verdict on automation. The first is that the 39% is not a fully automated share: the authors describe Tier 1 as software and Tier 2 as a person doing one small defined task, and the number covers both, so it is the share that never needed the expensive human rather than the share no human touched. The second is the population. In the same study, 84% of the requests were meetings between two people and only 15% had three or more attendees, up to a maximum of eleven. A showing on somebody else's listing is a three or four party appointment as a matter of course, which means this chart was produced by a much easier version of the problem than the one you have on a Saturday morning.",
};

/** SCENE copy — who actually has to agree before a showing is real.
 *
 * Four cards, and the scene REPLACES the prose that used to list them. Deliberately not a list of
 * job titles: each card is a different KIND of permission, because they fail in different ways
 * and they are chased in different ways. */
export const WHO_AGREES: GridItem[] = [
  {
    lead: "The person you are meeting",
    body: "The only one everybody thinks about, and the only one whose calendar the conversation can actually negotiate with, because they are in the conversation. If this were the whole problem then a booking link would have solved it years ago, and for a listing appointment at your own office it very nearly is.",
  },
  {
    lead: "Whoever controls the property",
    body: "On your own listing that is you, which is why your own listings feel easy and other people's do not. On somebody else's it is an agent with a full week, and behind that agent a seller who has to leave the house, or a tenant who has rights about being given notice. None of those three is in your conversation and none of them owes you a reply this afternoon.",
  },
  {
    lead: "The way in",
    body: "A code, a key, a box, an alarm, a doorman, a gate. This one is not a person and so it never gets counted as a party, and it is the one that silently carries a time window: a code that works between ten and four is a constraint on the appointment exactly as much as a seller who works from home is.",
  },
  {
    lead: "The professionals, on a closing",
    body: "A closing is the same problem with the volume turned up. An attorney, a lender, a title company and both sides of the deal have to be in one room or on one call, and every one of them is running the same week you are. This is the appointment where the cost of a wrong assumption is not an empty morning.",
  },
];

/** SCENE copy — the four states an invitation can be in.
 *
 * iCalendar Transport-Independent Interoperability Protocol, RFC 5546, December 2009, section
 * 2.1.1 "Scheduling State". Read in the RFC text itself.
 *
 * Quoted: "The state of a particular 'Attendee' relative to an iCalendar object used for
 * scheduling is defined by the 'PARTSTAT' parameter in the 'ATTENDEE' property for each
 * 'Attendee'. When an 'Organizer' issues the initial iCalendar object, 'Attendee' status is
 * typically unknown. The 'Organizer' specifies this by setting the 'PARTSTAT' parameter to
 * 'NEEDS-ACTION'. Each 'Attendee' modifies their 'ATTENDEE' property 'PARTSTAT' parameter to an
 * appropriate value as part of a 'REPLY' message sent back to the 'Organizer'."
 *
 * The card bodies are about what each state MEANS to a person running a business, not a gloss on
 * the specification. The specification is quoted in the body of the article, once, where it
 * belongs. */
export const STATES: GridItem[] = [
  {
    lead: "Nobody has answered",
    body: "The state every invitation is born in, and the standard names it out loud: when the organiser sends the thing out, the answer is set to needs action, because nothing has come back. This is not a failure state and it is not an error. It is the honest description of a proposal, and it is where a great many appointments are sitting at the moment somebody is told they are confirmed.",
  },
  {
    lead: "They said yes",
    body: "Somebody on the other end took a deliberate action and a reply came back to the organiser saying so. The important part is not the word yes, it is that it arrived as a message rather than as an absence. A reply is a thing that happened. Silence is a thing that did not happen, and the two are only the same if you decide they are.",
  },
  {
    lead: "They said no",
    body: "The cheapest outcome on this list, and the one everybody dreads. A no on Thursday costs a message. The same no at twenty past nine on Saturday costs a morning, a drive, and the part of a client's confidence that comes from believing you when you tell them something is settled.",
  },
  {
    lead: "They said maybe",
    body: "The standard has a state for tentative, and so does every calendar you have ever used, and almost nobody uses it deliberately. It is the correct answer far more often than it gets given, and a system that can carry a maybe without rounding it up to a yes is telling you something true about your Saturday.",
  },
];

/** SCENE copy — what your own system knows about a message it sent.
 *
 * Scheduling Extensions to CalDAV, RFC 6638, June 2012, section 3.2.9 "Schedule Status Values".
 * Read in the RFC text itself. The specification defines a "delivery" status carried in the
 * SCHEDULE-STATUS property parameter, and the codes are quoted here as printed:
 *
 *   1.0 "The scheduling message is pending. That is, the server is still in the process of
 *       sending the message."
 *   1.1 "The scheduling message has been successfully sent. However, the server does not have
 *       explicit information about whether the scheduling message was successfully delivered to
 *       the recipient."
 *   1.2 "The iTIP message has been sent and delivered."
 *   3.7 "The scheduling message was not delivered because the server did not recognize the
 *       calendar user address as a valid calendar user."
 *   3.8 "The scheduling message was not delivered due to insufficient privileges."
 *   5.1 "The scheduling message was not delivered because the server could not complete delivery
 *       of the message. This is likely due to a temporary failure."
 *   5.2 "...the server was not able to find a way to deliver the message. This is likely a
 *       permanent failure."
 *   5.3 "...rejected because scheduling with that recipient is not allowed."
 *
 * THREE CARDS, NOT EIGHT. The eight codes collapse into three things a business owner can act
 * on, and printing eight status codes on a marketing site would be showing off rather than
 * explaining. The counts in the cards are counts of the codes as published. */
export const DELIVERY: GridItem[] = [
  {
    lead: "It has not gone yet",
    body: "One of the eight published codes means the server is still trying. That is a perfectly ordinary state to be in for a few seconds and a very bad one to be in for a day, and the only way anybody finds out which it was is by looking. Nothing about a pending message looks different, from your side, from a message that landed.",
  },
  {
    lead: "It went, and nobody knows if it arrived",
    body: "Two codes cover sent. One says delivered. The other says sent, and then says in as many words that the server has no explicit information about whether it was delivered, which is the ordinary case whenever the invitation travelled by email. That distinction is written into an internet standard because it is real, and it is the difference between a confirmation and a hope.",
  },
  {
    lead: "It failed, in one of five ways",
    body: "The other five codes are all failures, and they are separated because the right response differs: the address was not a calendar user at all, you did not have permission, the delivery could not be completed this time, no route existed, or scheduling with that recipient is not allowed. Two of the five are worth retrying and three are not, and a system that treats them the same will quietly keep sending into a wall.",
  },
];

/** SCENE copy — the staged exchange.
 *
 * STAGED AND SAID TO BE STAGED in the `note`, which the primitive requires. There is no address,
 * no name and no telephone number in it, deliberately: rounds E and F both found fabricated
 * street addresses and a fabricated person with a fabricated "verified" number live on service
 * pages, and the cheapest way not to repeat that is to write an illustration that contains no
 * specifics to fabricate.
 *
 * THE POINT OF THE TRANSCRIPT is that the other side counters. RFC 5546's method table describes
 * COUNTER as "Used by an Attendee to negotiate a change in an iCalendar object. Examples include
 * the request to change a proposed event time", and this is what that looks like when the
 * attendee is another brokerage. The events column shows the one thing that matters: the buyer
 * was never told a time until the counter came back. */
export const THE_REQUEST = {
  eyebrow: "The mechanic",
  heading: "Thursday, half past four.",
  note: "A staged illustration, not a real exchange. No address, name or number appears in it because none of them would be real. The sequence is the one the service page describes.",
  themLabel: "The listing side",
  usLabel: "The assistant",
  turnsHeading: "The exchange",
  eventsHeading: "What happened on your side",
  turns: [
    {
      who: "us" as const,
      at: "4:31 pm",
      text: "Buyer would like to view your listing. Saturday 11am or Saturday 2pm both work our side. Either possible?",
    },
    { who: "them" as const, at: "6:02 pm", text: "not 11, tenant needs 24h notice. 2 is probably ok, checking with them" },
    { who: "us" as const, at: "6:02 pm", text: "Understood. Holding 2pm Saturday as unconfirmed on our side and not offering it elsewhere. Tell us either way by Friday 6pm and we will confirm to the buyer then." },
    { who: "them" as const, at: "Fri 11:14 am", text: "tenant is fine with 2. code is on the sheet" },
    { who: "us" as const, at: "11:14 am", text: "Confirmed. Saturday 2pm. Sending an invitation to this number so it lands on your calendar too." },
  ],
  events: [
    {
      at: "4:31 pm",
      label: "Two times proposed, nothing promised",
      detail: "The buyer is told a request has gone in and is not told a time. Nobody has agreed to anything yet, and the message the buyer receives says exactly that.",
    },
    {
      at: "6:02 pm",
      label: "The counter is recorded as a counter",
      detail: "Not as a rejection and not as a booking. One of the two proposals is dead, the other is alive and unanswered, and the difference is written down rather than remembered.",
    },
    {
      at: "6:02 pm",
      label: "Your own side is held",
      detail: "The 2pm is blocked on your calendar the moment it becomes the live proposal, so nothing else can be offered into it while you wait. This is the only calendar in the whole exchange your software can actually control.",
    },
    {
      at: "Fri 11:14 am",
      label: "The buyer is told, once",
      detail: "Nineteen hours after the request went in, and it is the first time the buyer has been given a time. That delay is the honest cost of not having promised anything on Thursday.",
    },
  ],
};

/** SCENE copy — the path from an ask to an appointment everybody has agreed to.
 *
 * The service page's flow has three steps: notice the moment, offer real slots, confirm and
 * remind. All three are about a conversation with one person. What this adds is the middle,
 * which is the part that has nothing to do with your calendar at all.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. 33 characters lost a letter on the reactivation post;
 * "Somebody wants in" is 17. */
export const SCHED_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The ask", connects: "Somebody wants in" },
  { label: "The constraints", connects: "Access hours, notice" },
  { label: "The proposal", connects: "Two times, no promise" },
  { label: "The replies", connects: "Yes, no, or nothing" },
  { label: "The hold", connects: "Your side only" },
  { label: "The confirmation", connects: "Once, and to everyone" },
];

/** SCENE copy — three ways a working scheduling build produces nothing.
 *
 * Deliberately not the limits section restated: limits are what the product cannot do, and these
 * are what a build that works perfectly still fails to deliver. All three are about the business
 * around the software. */
export const WASTED: GridItem[] = [
  {
    lead: "A proposal is presented as a booking",
    body: "The single most expensive setting in this whole category, and it is usually not a setting at all, it is the wording of one automatic message. If the note that goes out when a request is raised says confirmed, then every unanswered request in your system is a promise, and you will only find out which ones were real on the morning.",
  },
  {
    lead: "The hold is never released",
    body: "Blocking your own calendar while you wait for somebody else is correct, and a hold that nothing ever clears is a calendar that fills up with appointments that did not happen. Within a month the machine is reading a diary that is busier than your life, and offering nothing, politely.",
  },
  {
    lead: "The chase has no end",
    body: "A request that has been sitting unanswered for two days needs a decision from a person, not a fourth reminder to somebody who has already ignored three. If nothing in the build ever says this one is not going to happen, the queue grows and the client who is waiting hears nothing at all, which is the one outcome worse than a no.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Fifteen scenes, zero components, no film. */
export const SCHEDULING_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings, $2,500, 0.3 percent, 3 business days and 20
   * sources. This one is a RATIO rather than a count or a share, and it is the first: how many
   * of the people who had to agree actually had. */
  hero: {
    moment: "1",
    suffix: "of three",
    /** NOT either plate and not the cover. The plates are a signal lever frame and a departure
     * board, the cover is a station clock, so nothing appears twice anywhere on this post. A
     * switchboard is texture behind type here rather than a subject. */
    photo: "/images/editorial/switchboard.jpg",
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
    "not-the-booking": {
      kind: "grid",
      band: "dark",
      eyebrow: "Three things this is not",
      heading: "The hard part is not the booking.",
      columns: 3,
      glow: true,
      items: NOT_THE_BOOKING,
      label: "What this is not",
    },
    escalations: {
      kind: "statbars",
      band: "light",
      label: "Where it broke",
      ...ESCALATIONS,
    },
    "who-agrees": {
      kind: "grid",
      band: "dark",
      eyebrow: "Before eleven on Saturday is real",
      heading: "Four permissions, and you hold one of them.",
      columns: 2,
      items: WHO_AGREES,
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/lever-frame.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS and which contains the 21:9
      // crop a laptop ships. Measured in round F: the Plate primitive renders 2.33 at 1440 and
      // 1.78 at 390, so the phone sees a taller slice. The taller crop adds the floor of the box
      // and the run of rail beyond the window; both are described.
      alt: "A long rank of tall painted signal levers in a railway signal box, receding away from the camera, most of them white with red and yellow levers standing among them, each with a curved catch handle at the top, a row of small brass instruments and dials mounted on the frame above them, a polished plank floor below and a window along the right showing track outside",
      caption:
        "A mechanical interlocking is the oldest working answer to this problem. Every lever in the frame is physically prevented from moving until the levers it conflicts with are set correctly, so a signalman cannot offer two trains the same piece of track even by accident. The bars are cut so that a wrong combination is impossible rather than discouraged, which is a higher standard than any calendar has ever been held to.",
      credit: "Photograph by Steve Knight, CC BY 2.0.",
      ariaLabel: "A signal box lever frame",
    },
    ceiling: {
      kind: "statbars",
      band: "dark",
      label: "The ceiling",
      ...CEILING,
    },
    states: {
      kind: "grid",
      band: "dark",
      eyebrow: "The four answers",
      heading: "Every invitation is one of these, and one of them is silence.",
      columns: 2,
      items: STATES,
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from RFC 6638 section 3.2.8, and quoted rather than paraphrased because the
       * MUST is the point: this is not a design opinion about rescheduling, it is a requirement
       * on any server implementing the standard. */
      text: "Servers MUST reset the PARTSTAT property parameter value of all ATTENDEE properties, except the one that corresponds to the Organizer, to NEEDS-ACTION for each calendar component change that causes any instance to be rescheduled.",
    },
    delivery: {
      kind: "grid",
      band: "dark",
      eyebrow: "What your own system knows",
      heading: "Eight answers to did it arrive, and only one of them is yes.",
      columns: 3,
      items: DELIVERY,
    },
    "the-request": {
      kind: "conversation",
      band: "light",
      label: "The request",
      ...THE_REQUEST,
    },
    "sched-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "From somebody asking to everybody agreeing.",
      lede: "Six hops, and the products in this category are sold on the first and the last. The middle four are the ones that decide whether a Saturday happens, and every one of them is a question about people who do not work for you. Note where the hold sits, and note that it is the only step in the chain your software can carry out with any authority.",
      steps: SCHED_PATH,
      altPrefix:
        "The path from a request to view a property through the access constraints, a proposal of two times, the replies from the other side, a hold on your own calendar, and one confirmation",
    },
    "yes-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many agreements are you carrying that nobody actually gave you?",
      ariaLabel: "How many unconfirmed commitments you carry in a year",
      inputs: [
        {
          kind: "range",
          id: "appts",
          label: "Appointments you arrange in a month",
          hint: "Everything you have to set up with somebody outside your own office: showings on other people's listings, inspections, appraisals, walkthroughs, closings.",
          min: 2,
          max: 80,
          step: 1,
          initial: 20,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "choice",
          id: "parties",
          label: "People who have to agree, other than you",
          hint: "Count the ones who can stop it happening. The person you are meeting is one. The listing side is another. An occupant with a notice period is a third, and on a closing it is more than that.",
          initial: 1,
          options: [
            { value: 1, label: "One", sub: "Your own listing, your own office", display: "1 other party" },
            { value: 2, label: "Two", sub: "The usual showing on somebody else's listing", display: "2 other parties" },
            { value: 3, label: "Three", sub: "An occupied property, or a small closing", display: "3 other parties" },
          ],
        },
        {
          kind: "range",
          id: "silent",
          label: "Share where you never get an explicit yes in writing",
          hint: "Be honest rather than aspirational. A voice message you did not keep, a nod at an open house and a thread that just went quiet all count as no reply.",
          min: 5,
          max: 100,
          step: 5,
          initial: 40,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes spent chasing one of them",
          hint: "The message, the second message, the call, and the two minutes afterwards working out what you are now going to tell the client.",
          min: 1,
          max: 30,
          step: 1,
          initial: 4,
          format: "count",
          width: "w-[4rem]",
        },
      ],
      chain: [
        { label: "Appointments a month", by: { from: "input", id: "appts" }, format: "count", unit: "a month" },
        { label: "Over a year", by: { from: "rate", value: 12, display: "12 months" }, format: "count", unit: "appointments" },
        { label: "Agreements they need from other people", by: { from: "input", id: "parties" }, format: "count", unit: "yeses" },
        {
          label: "Where no yes ever came back",
          by: { from: "input", id: "silent" },
          format: "count",
          /** SHORT ON PURPOSE. A chain unit renders inside a shrink-0 cell and cannot wrap;
           * round E shipped 66px and 32px of horizontal overflow from exactly this. The
           * explanation belongs in the row label on the left, which does wrap. */
          unit: "unconfirmed",
        },
        { label: "At your chasing time", by: { from: "input", id: "minutes" }, format: "count", unit: "minutes" },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours a year",
        },
      ],
      headline: 3,
      resultLabel: "Agreements a year that were never actually given",
      note: "The headline is the fourth row rather than the hours, and the hours row underneath it is doing deliberate work. At the settings this opens with, the chasing comes to a number of hours that any owner would shrug at, and that is the trap: the cost of this is not the time, it is that a share of those unconfirmed agreements are being described to a client as confirmed. Shares produce fractions, and two thirds of an agreement is not a thing, so read anything with a decimal in it as a rough count. Four things this deliberately refuses. There is no no-show rate anywhere in it, because whether somebody turns up is a different article on this site with real evidence behind it and this one has nothing to add to it. There is no figure for how often a listing side declines, because nobody has published one. There is no money row, because the value of a Saturday morning depends on what was in it. And there is no second column showing what this becomes with a scheduling layer switched on, because we have not measured that on your appointments and the study on this page was run on office meetings between two people.",
      action: { label: "See how it is built", href: "/services/ai-scheduling" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/departure-board.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS. The taller crop adds the
      // ceiling above the screens and the top of the concourse wall below them. Only the words
      // that are actually legible at that crop are transcribed.
      alt: "Five blue framed electronic departure screens mounted in a row under a station roof, each headed Departures in white on blue with a yellow departure time and destination beneath it, Edinburgh, Aberdeen, Kyle of Lochalsh and Dingwall among them, each screen listing its calling points in small yellow type and carrying the operator name First ScotRail along the bottom, the words On time set beside several of the times, and the rightmost screen headed Subsequent Departures",
      caption:
        "Every time on this board was decided by somebody who is not standing in front of it, and the board's whole job is to say which ones are still true. On time is a claim being made now about a plan made months ago, and it is republished the moment it stops being true. That is the standard a scheduling system should be held to, and almost none of them are: they tell you a time once and then go quiet.",
      credit: "Photograph by David Jones, CC BY 2.0.",
      ariaLabel: "A station departure board",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 15: on light, the cost section, the
       * limits section and the how-to run as one long pale band. Flipping this one breaks it. */
      band: "dark",
      eyebrow: "Three ways a working build produces nothing",
      heading: "None of them are the calendar.",
      columns: 3,
      items: WASTED,
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Tell us how a showing on somebody else's listing gets set up in your office today, from the message arriving to the buyer being told a time. We will send back where the unconfirmed gap is in your version of it, and which single message is the one that turns a proposal into a promise.",
      reassure:
        "It is a short reply from a person, it costs nothing, we do not need access to your calendar to answer it, and the answer is useful whether you buy anything or not.",
      action: { label: "Send us your version", href: "/connect" },
      ariaLabel: "Send us how a showing gets set up in your office",
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Open your calendar and find the next appointment that needs somebody outside your office. Then answer one question about it out loud: which of the people it depends on has actually replied, in writing, and where is that reply. If the answer is that you are fairly sure, you have found the thing this whole article is about, and you have found it while there is still time to send a message.",
      actions: [
        { label: "See it on the AI page", href: "/ai#scheduling", variant: "light" },
        { label: "How it is built", href: "/services/ai-scheduling", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because two things move it and neither is the calendar connection: how many parties a typical appointment of yours needs, and whether the people on the other side can be reached the same way every time or whether half of them are a phone call. The AI audit is an hour, done with you, and for this topic it starts by walking one real showing backwards from the confirmation to the first message.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-a-scheduling-problem-is-once-the-calendar-is-not-yours": "The real problem",
    "the-part-nobody-automates-is-the-part-that-is-other-people": "What broke",
    "who-has-to-say-yes-before-a-showing-is-real": "Who agrees",
    "the-standard-already-has-a-word-for-an-appointment-nobody-agreed-to": "The word for it",
    "moving-the-time-throws-away-every-yes-you-had": "Moving it",
    "your-own-system-knows-whether-the-message-arrived": "Did it arrive",
    "what-a-scheduling-layer-can-honestly-do-across-calendars-it-does-not-own": "What it does",
    "why-offering-a-slot-you-cannot-hold-is-worse-than-offering-nothing": "The false yes",
    "how-to-test-one-before-you-buy-it": "Test one yourself",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
