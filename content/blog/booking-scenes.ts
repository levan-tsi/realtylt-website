/** Scene copy for the AI appointment booking flagship post (topic 7).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Seventh topic on the flagship template and the SIXTH IN A ROW that adds no component of
 * its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topic 6. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/ai-appointment-booking.ts: reply
 * in seconds, offer only slots that are genuinely free, book inside the same conversation, send
 * the confirmation and the reminders. Nothing here claims a capability that page does not claim.
 *
 * THE DELIBERATE DISTANCE FROM TOPICS 1 AND 2. The obvious way to write this post is "answer
 * fast", which is the chat post's argument and the voice post's argument, and writing it that way
 * would have produced a third copy of an article that already exists twice. So this piece is
 * about the SECOND half of the problem: what happens between the moment a time is agreed and the
 * moment somebody actually stands in the house. Its evidence is about lead time and reminders,
 * neither of which appears anywhere else in the cohort, and the response-speed research the two
 * earlier posts rest on is deliberately not re-used here.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, each checkable by somebody else in the primary
 * document rather than in a summary of it. */
export const IN_SHORT: string[] = [
  "An appointment is not an outcome, it is a prediction, and the further away you put it the worse the prediction gets. In 51,529 appointments at one university eye clinic, the no-show rate at a lead time of six months was more than four times the rate at nought to two weeks.",
  "One reminder, sent 72 hours ahead, moved attendance from 80.5% to 87.5% in a randomised trial of 1,848 people, and a text did the job as well as a phone call at roughly two thirds of the cost.",
  "A calendar invitation is a different object from a text message that mentions Thursday. One of them puts an event with an alarm on the other person's phone and tells you whether they accepted it. The other one hopes.",
];

/** SCENE copy — the lead time chart. Cited data graphic ONE.
 *
 * A SEVENTH body of evidence, and the one nobody in this category cites: how far ahead the
 * appointment was booked. McMullen MJ and Netland PA, "Lead time for appointment and the no-show
 * rate in an ophthalmology clinic", Clinical Ophthalmology 2015;9:513-516, doi 10.2147/OPTH.S82151.
 * Read in the paper itself on PubMed Central, not in a summary of it.
 *
 * Method, from the paper: a cross-sectional retrospective study pooling every appointment in the
 * computerised scheduling database at the University of Virginia Eye Clinic over a 12-month
 * period, 51,529 appointments in total, split between a resident clinic and a faculty clinic.
 *
 * The figures, quoted from the Results: "The average no-show rate was 21.7% and 6.6% for
 * resident- and faculty-clinic, respectively (P<0.001)." "With a lead time for appointment of 0-2
 * weeks, the average no-show rate was 9.1% and 2.4% for the resident- and faculty-clinic,
 * respectively." "With a lead time for appointment of 6 months, the average no-show rate
 * increased to 38.3% (P<0.001) and 6.9% (P<0.001) for the resident-and faculty-clinic,
 * respectively."
 *
 * BOTH CLINICS ARE ON THE CHART ON PURPOSE. Showing only the resident clinic would put the most
 * alarming number on screen (38.3%) with nothing to argue with it. The faculty clinic's baseline
 * is a third of the resident clinic's and its curve is far flatter, and that pair is the honest
 * picture: the level is a property of the population, the SLOPE is the finding. A business owner
 * reading this has no idea which of the two clinics they resemble, and that is the point. */
export const LEAD_TIME = {
  eyebrow: "The evidence",
  caption: "How often people failed to show up, by how far ahead it was booked",
  bars: [
    { label: "Resident clinic, booked 0 to 2 weeks ahead", value: 9.1, display: "9.1%" },
    { label: "Resident clinic, booked 6 months ahead", value: 38.3, display: "38.3%" },
    { label: "Faculty clinic, booked 0 to 2 weeks ahead", value: 2.4, display: "2.4%" },
    { label: "Faculty clinic, booked 6 months ahead", value: 6.9, display: "6.9%" },
  ],
  /** Shares of the appointments in each group, so the axis runs to 100. Scaled to its own
   * largest bar the 38.3% would be drawn full width, and a full-width bar reads as everybody. */
  max: 100,
  lit: 1,
  basis:
    "Share of scheduled appointments where the patient did not attend, from 51,529 appointments in one clinic's scheduling database over twelve months. The two clinics are shown separately because their baseline rates differ by more than a factor of three. The slope is the finding, not the level: both rise steeply with how far ahead the appointment was made.",
  sourceText:
    "Michael J McMullen and Peter A Netland, Lead time for appointment and the no-show rate in an ophthalmology clinic, Clinical Ophthalmology 2015;9:513-516, University of Virginia School of Medicine.",
  sourceHref: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4370946/",
  note: "This is an eye clinic, and a patient is not a buyer. Nobody has run this study on listing appointments and these percentages are not a benchmark for anything you do. What transfers is the direction, which is uncomfortable enough on its own: the appointment you push out to a date that suits everybody is measurably less likely to happen than the one you take tomorrow. The paper's own model makes the same point from the other side, estimating the clinic's no-show rate would fall by nearly 60% if every appointment were booked within two weeks.",
};

/** SCENE copy — why an appointment dies between the booking and the day.
 *
 * Four reasons, and the scene REPLACES the prose that used to list them, so these words appear
 * once on the page. Only the first is evidenced by the chart above; the other three are named as
 * mechanisms rather than as measurements, which is what the prose around it says too. */
export const WHY_THEY_DROP: GridItem[] = [
  {
    lead: "Their situation moves.",
    body: "Nine days is long enough for an offer to be accepted on something else, for a mortgage conversation to go badly, or for a job to change. None of that is about you and none of it is recoverable. It is simply what happens to plans that are left out in the weather.",
  },
  {
    lead: "The commitment cools.",
    body: "The person who agreed to Thursday was in the mood that made them message you at a quarter past eight on a Sunday. By the following Wednesday they are a different person with a different week, and the appointment is now an obligation rather than an impulse.",
  },
  {
    lead: "They forget, in the ordinary way.",
    body: "Not carelessly. It went into a mental note rather than into a calendar, because you wrote it in a text message and they were walking at the time. This is the one reason on this list that a machine can fix outright, which is why the next section is about reminders.",
  },
  {
    lead: "They booked somebody else in the meantime.",
    body: "A nine day gap is nine days in which they can keep looking, and most people do. The appointment did not fail on the day. It failed on the Tuesday after they saw two other houses with an agent who had a Saturday free.",
  },
];

/** SCENE copy — the reminder trial. Cited data graphic TWO.
 *
 * Zhou-wen Chen, Li-zheng Fang, Li-ying Chen and Hong-lei Dai, "Comparison of an SMS text
 * messaging and phone reminder to improve attendance at a health promotion center: A randomized
 * controlled trial", Journal of Zhejiang University Science B 2008;9(1):34-38,
 * doi 10.1631/jzus.B071464. Read in the paper on PubMed Central.
 *
 * Method, from the paper: 1,859 people with appointments at the health promotion centre of Sir
 * Run Run Shaw Hospital, Zhejiang University, between April and May 2007, assigned by
 * computer-generated random numbers into three groups. 1,848 were analysed: SMS reminder 615,
 * telephone contact 614, no reminder 619. A single reminder went to both intervention groups 72
 * hours before the appointment, with the same content in both.
 *
 * The figures, quoted from the Results: "Attendance rates of control, SMS and telephone groups
 * were 80.5%, 87.5% and 88.3%, respectively." The odds ratios against control were 1.698 (95% CI
 * 1.224 to 2.316, P=0.001) for SMS and 1.829 (95% CI 1.333 to 2.509, P<0.001) for telephone, and
 * "there was no difference between the SMS group and the telephone group (P=0.670)". Cost per
 * attendance was 0.31 Yuan for SMS against 0.48 Yuan for the phone calls.
 *
 * THE 0.8 POINT GAP BETWEEN THE TWO REMINDER BARS IS NOT A FINDING and the basis line says so
 * out loud, because a chart is exactly the object that invites a reader to draw the conclusion
 * the paper explicitly refused. The same defect had to be corrected on the workflow chart, where
 * two bars that were not disjoint invited a comparison that was not available. Here the two arms
 * are disjoint and the comparison is simply not significant. */
export const REMINDERS = {
  eyebrow: "The evidence",
  caption: "Attendance with one reminder, sent 72 hours before",
  bars: [
    { label: "No reminder at all", value: 80.5, display: "80.5%" },
    { label: "One text message", value: 87.5, display: "87.5%" },
    { label: "One phone call", value: 88.3, display: "88.3%" },
  ],
  max: 100,
  lit: 1,
  basis:
    "Share of people who attended, from 1,848 randomly assigned appointments. The 0.8 point gap between the text and the call is not a result: the paper reports no significant difference between the two (P=0.670). What is significant is either of them against no reminder at all.",
  sourceText:
    "Zhou-wen Chen, Li-zheng Fang, Li-ying Chen and Hong-lei Dai, Comparison of an SMS text messaging and phone reminder to improve attendance at a health promotion center: A randomized controlled trial, Journal of Zhejiang University Science B 2008;9(1):34-38.",
  sourceHref: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2170466/",
  note: "China, 2007, paid health check-ups, and a population that had already chosen to spend money on the appointment. Seven points is what one reminder was worth there and it is not a number to expect on a listing appointment, because nobody has measured that. Two things do carry. A single reminder is the only intervention in this literature that is both cheap and reliably effective, and the cheap channel performed as well as the expensive one, at roughly two thirds of the cost per person who turned up.",
};

/** SCENE copy — the four moves.
 *
 * The mechanic, matching content/services/ai-appointment-booking.ts. The fourth card is the one
 * this article adds to that page rather than repeating it: the reminder is not a courtesy, it is
 * the only step on the list with a randomised trial behind it. */
export const FOUR_MOVES: GridItem[] = [
  {
    lead: "It answers while they are still holding the phone.",
    body: "Seconds rather than the following morning. This part is the same argument the chat and voice pages make and it is genuinely the smaller half of this one, because answering fast and then agreeing on a date nine days out has solved the cheap problem and left the expensive one alone.",
  },
  {
    lead: "It offers the soonest real slots, not a menu.",
    body: "Read live from your calendar so it cannot offer a time you do not have, and ordered so the nearest one is the easy one to take. That ordering is a small decision with the whole of the chart above behind it.",
  },
  {
    lead: "It writes the appointment on both calendars.",
    body: "Yours, and theirs, as an actual event with an alarm on it rather than as a sentence in a message thread. The section below on what a booking technically is explains why those two things are not the same object.",
  },
  {
    lead: "It reminds them, which is the part with a trial behind it.",
    body: "A confirmation immediately and a reminder before the day. It is the least impressive item on this list and the only one where somebody randomised eighteen hundred people to find out whether it works.",
  },
];

/** SCENE copy — the staged exchange.
 *
 * STAGED AND SAID TO BE STAGED in the `note`, which the primitive requires. The address is
 * invented, and inventing an address is a thing this repo has done badly once before in a film
 * cut, so it is worth being explicit: 32 Delavan is a name chosen to sound ordinary and is not a
 * real listing.
 *
 * THE POINT OF THE TRANSCRIPT is the two times it offers. A booking assistant that lists a
 * fortnight of availability is a worse product than one that offers tomorrow evening and
 * Saturday morning, and the reason is on the chart above rather than in anybody's opinion. */
export const THE_BOOKING = {
  eyebrow: "The mechanic",
  heading: "Sunday, a quarter past eight.",
  note: "A staged illustration, not a client's messages. The address, the times and the wording are invented; the sequence is the one the service page describes.",
  themLabel: "The buyer",
  usLabel: "The assistant",
  turnsHeading: "The exchange",
  eventsHeading: "What happened on your side",
  turns: [
    { who: "them" as const, at: "8:15 pm", text: "Is 32 Delavan still available? We would like to see it." },
    { who: "us" as const, at: "8:15 pm", text: "It is. I can get you in tomorrow at 6:30pm or Saturday at 10am. Which suits you better?" },
    { who: "them" as const, at: "8:19 pm", text: "Tomorrow works. Is it okay if my sister comes, she is the one who knows about roofs" },
    { who: "us" as const, at: "8:19 pm", text: "Of course. You are booked for tomorrow, Monday, at 6:30pm at 32 Delavan. I have sent a calendar invitation to this number so it lands on your phone, and Levan will meet you there." },
    { who: "them" as const, at: "8:20 pm", text: "got it, thanks" },
  ],
  events: [
    { at: "8:15 pm", label: "The calendar is read", detail: "Free and busy times only, not the contents of anything, and the two soonest genuine openings are offered." },
    { at: "8:19 pm", label: "The slot is written", detail: "Held on your calendar the moment they choose it, so the next person asking cannot be offered it." },
    { at: "8:19 pm", label: "The invitation goes out", detail: "A real calendar event with an alarm on it, sent to them, not a sentence in a thread." },
    { at: "5:30 pm", label: "The reminder", detail: "Twenty five hours later, the day of. The single cheapest thing on this page and the only one with a randomised trial behind it." },
  ],
};

/** SCENE copy — the booking path, drawn as a system.
 *
 * This is content/services/ai-appointment-booking.ts's own `figure` timeline, drawn as hops
 * rather than retold as a list, plus the two hops that page's timeline does not name: the write
 * back to the calendar and the invitation.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. 33 characters lost a letter on the reactivation post;
 * "Site, text or call" is 18. */
export const BOOKING_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The ask", connects: "Site, text or call", at: "8:15 pm" },
  { label: "The reply", connects: "Seconds, not Monday" },
  { label: "The times", connects: "Free and busy, read live" },
  { label: "The hold", connects: "Written to the calendar" },
  { label: "The invite", connects: "An event on their phone" },
  { label: "The reminder", connects: "Before the day, not after", at: "5:30 pm" },
];

/** SCENE copy — the three ways this is wasted.
 *
 * Deliberately not any sibling's three. These are the ways the whole exercise fails while every
 * individual message sends perfectly, which is a different list from the limits section. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "It fills the week with the wrong people.",
    body: "Booking is a volume amplifier and it does not read intent. If nothing sits between the inquiry and the calendar, you will spend Saturday driving to three houses for people who are eleven months away, which is a worse week than the one you had before.",
  },
  {
    lead: "The calendar it reads is not the calendar you live in.",
    body: "Half the appointments in a small business are agreed by voice and never written down anywhere a machine can see. A booking assistant reading a calendar with holes in it will offer a slot you are already standing in somebody's kitchen for, and it will do it politely.",
  },
  {
    lead: "The reminder is the first thing switched off.",
    body: "It feels like nagging, somebody complains once, and it quietly comes off. It is also the only element of this whole system with a randomised controlled trial behind it, and taking it out leaves you paying for the impressive half and throwing away the half that was measured.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. */
export const BOOKING_FLAGSHIP: FlagshipContent = {
  /** A DISTANCE IN DAYS, which is what this topic's held moment actually is. The six heroes
   * before it were 11:40pm, 9:42pm, 2023, 15%, 25 minutes and 12 reviews, so this is the first
   * that is a gap between two dates rather than a point, a share or a count. */
  hero: {
    moment: "9",
    suffix: "days",
    photo: "/images/hero/hero-cand-breakneck-south.jpg",
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
    "lead-time": {
      kind: "statbars",
      band: "light",
      label: "The lead time",
      ...LEAD_TIME,
    },
    "why-they-drop": {
      kind: "grid",
      band: "dark",
      eyebrow: "Between the booking and the day",
      heading: "Four ways an agreed time quietly stops being one.",
      columns: 2,
      glow: true,
      items: WHY_THEY_DROP,
    },
    reminders: {
      kind: "statbars",
      band: "light",
      // "The trial", not "The reminder": the heading it sits under is already a rail row and
      // two rows with the same word on them is a rail that reads as a duplicate.
      label: "The trial",
      ...REMINDERS,
    },
    "four-moves": {
      kind: "grid",
      band: "dark",
      eyebrow: "The mechanic, in four parts",
      heading: "Answer, offer, write it down, remind.",
      columns: 2,
      items: FOUR_MOVES,
    },
    "the-booking": {
      kind: "conversation",
      band: "light",
      label: "The booking",
      ...THE_BOOKING,
    },
    plate: {
      /** LIGHT, not dark, and the reason is rhythm rather than taste: it follows the
       * why-they-drop grid, which is dark, and two full-bleed dark bands with nothing between
       * them read as one long band with a seam in it. */
      kind: "plate",
      band: "light",
      src: "/images/listings/house-05.jpg",
      alt: "An empty clapboard house with a covered porch and bare windows, photographed from the front path in flat afternoon light with nobody in the frame",
      caption:
        "This is the six thirty that nobody came to. The house was open, the lights were on, and the cost had already been paid: the drive out, the forty minutes, and the Saturday slot that was quietly given away nine days earlier to hold this one.",
      credit: "Photograph by Jimmy_Joe, CC BY 2.0.",
      ariaLabel: "The appointment nobody kept",
    },
    "booking-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "From a message to an event on somebody's phone.",
      lede: "Six hops, and the two timestamps are not the argument this time. The gap between the first hop and the last is what the chart above is about: this whole chain exists to make that gap a day rather than a fortnight.",
      steps: BOOKING_PATH,
      altPrefix: "The path from an inquiry at 8:15pm to a reminder sent the following afternoon",
    },
    "booking-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many of the people who ask actually end up in front of you?",
      ariaLabel: "How many appointments you actually keep in a year",
      inputs: [
        {
          kind: "range",
          id: "asks",
          label: "People who ask for your time in a week",
          hint: "Every channel: the website, the portal, the phone, the text somebody sends because they got your number from a sign.",
          min: 1,
          max: 60,
          step: 1,
          initial: 8,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "answered",
          label: "Share that get a real answer the same day",
          hint: "Not an acknowledgement. An answer with a time in it.",
          min: 10,
          max: 100,
          step: 5,
          initial: 70,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "booked",
          label: "Share of those that reach an agreed slot",
          hint: "The ones that survive the back and forth and end up as a time both of you have written down.",
          min: 10,
          max: 100,
          step: 5,
          initial: 60,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "kept",
          label: "Share of agreed slots where somebody turns up",
          hint: "Your number, not the clinic's. If you have never counted, count the next twenty and come back.",
          min: 40,
          max: 100,
          step: 5,
          initial: 80,
          format: "percent",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "People asking", by: { from: "input", id: "asks" }, format: "count", unit: "a week" },
        { label: "Over a year", by: { from: "rate", value: 52, display: "52 weeks" }, format: "count", unit: "asks a year" },
        { label: "Answered the same day", by: { from: "input", id: "answered" }, format: "count", unit: "conversations" },
        { label: "Reaching an agreed slot", by: { from: "input", id: "booked" }, format: "count", unit: "appointments" },
        { label: "Where somebody turns up", by: { from: "input", id: "kept" }, format: "count", unit: "appointments" },
      ],
      headline: 4,
      resultLabel: "Appointments you actually keep, a year",
      note: "There is no second column here and no line showing what this would become with reminders switched on, and the missing row is the point. The trial on this page found one reminder worth about seven percentage points of attendance, in China, in 2007, among people who had already paid for a health check-up. Applying that to your listing appointments would be the most flattering arithmetic on this website and it would be arithmetic nobody has done. Every rate above is yours for the same reason: three of them have never been measured for this industry by anybody, and a default we typed in would quietly become the number you remember.",
      action: { label: "See how it is built", href: "/services/ai-appointment-booking" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "The time that suits everybody is almost never the time that happens. The soonest awkward slot beats the perfect one a fortnight out, and it is not close.",
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The count, at least",
      text: "Tell us how you take appointments today and we will send back the two questions worth measuring first: your median gap between the ask and the slot, and how many of the last twenty were kept.",
      reassure: "It is a short reply from a person, it costs nothing, and the answer is useful whether you buy anything or not.",
      action: { label: "Ask for the two questions", href: "/connect" },
      ariaLabel: "Ask for the two measurements worth taking",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-13.jpg",
      alt: "A weathered saltbox house with a long sloping rear roof, seen across a lawn in autumn with the front door standing open",
      caption:
        "And this is the whole point of the machinery: one ordinary weekday evening on which two people stand in a house at the time they said they would. Nothing about that afternoon is impressive. Everything expensive in this article happens because it did not.",
      credit: "Photograph by CityLimitsJunction, CC BY 4.0.",
      ariaLabel: "The appointment that happened",
    },
    "failure-modes": {
      kind: "grid",
      band: "light",
      eyebrow: "Three ways it is wasted",
      heading: "None of them are the booking software.",
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
      text: "Somewhere in your calendar is a slot you agreed to nine days ago, for a person who was certain on the Sunday and is now somebody else's client. It is not written down as a loss anywhere, and it will happen again inside the month.",
      actions: [
        { label: "See it on the AI page", href: "/ai#book", variant: "light" },
        { label: "How it is built", href: "/services/ai-appointment-booking", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because the cost tracks two things that are yours rather than ours: how many calendars and systems have to agree with each other, and whether the reminders go by text, which is billed per message. The AI audit is an hour, done with you, and it ends with the first booking path live on one channel rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "the-gap-nobody-measures-because-it-does-not-look-like-a-loss": "The gap",
    "why-distance-kills-an-appointment": "Why it dies",
    "the-second-half-which-is-the-reminder": "The second half",
    "what-ai-appointment-booking-actually-does": "What it does",
    "what-reading-your-calendar-should-actually-mean": "Your calendar",
    "what-a-booking-is-technically-and-why-most-of-them-are-not-one": "What a booking is",
    "what-to-do-about-the-ones-who-still-do-not-turn-up": "When they miss",
    "how-to-test-one-before-you-buy-it": "How to test one",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
