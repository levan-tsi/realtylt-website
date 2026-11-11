import type { Service } from "./types";

/** COPY key `scheduling` on realtylt.com/ai. Deep link: /ai#scheduling
 *
 * SYNCED WITH THE FLAGSHIP in round G. Three of this page's claims were absolutes that the
 * post's own primary sources contradict, and they are listed with their replacements in
 * docs/blog-flagship/ROUND-G-LOG.md and guarded in lib/blog/zombie-claims.test.ts. The short
 * version: a scheduling layer can stop YOUR calendar being offered twice, because your calendar
 * is the one it can read and write. It cannot stop somebody else promising the same two
 * o'clock to another person, and "the double-booking that cannot happen" said it could.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's estimate visit, a
 * dental office, an accounting office meeting that needs three people, a salon, a real estate
 * showing on another office's listing as one example). The stat's label is now exact: the 61%
 * is the share of requests in the study's final phase (Study 3b), not of all 1,626 meetings.
 * Re-read 2026-11-11: arXiv 1703.08428 ("The remaining 61% of requests ... requiring some
 * intervention by a macrotask worker"; 32%, 27%, 26% the three commonest reasons, all an
 * attendee), RFC 6638 section 3.2.8 (a reschedule resets every attendee's PARTSTAT to
 * NEEDS-ACTION), RFC 5546. Saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/scheduling/. */
export const aiScheduling: Service = {
  slug: "ai-scheduling",
  aiKey: "scheduling",
  name: "Calendar Autopilot",
  tier: "more",

  eyebrow: "Scheduling · AI calendar assistant",
  title: "An AI scheduling assistant that books real open times",
  lede: "A customer asks for a time and the answer waits until somebody is off the phone, by which point the customer has asked somewhere else. We set up an AI scheduling assistant that offers real open times from the business's own calendar inside the chat or the call, holds the slot the moment it is taken, sends the confirmation and the reminders, and moves the time on request. Where other people have to agree, it asks them and tracks who has actually said yes.",
  specs: ["your live calendar", "real open times only", "reminders sent for you", "who has said yes, tracked"],
  why: "The gap between “interested” and “on the calendar” is where a customer cools. Booking inside the same conversation closes that gap. Holding the slot the moment it is taken means the business's own calendar is never offered twice, and a time that needs other people is called confirmed only when they have said so.",
  keywords: [
    "ai scheduling assistant for business",
    "ai calendar assistant",
    "what is a scheduling assistant",
    "automated scheduling",
    "ai appointment scheduling",
  ],

  seo: {
    title: "AI scheduling assistant for small business appointments",
    description:
      "An AI scheduling assistant that offers real open times from the business's calendar, holds the slot, sends reminders and tracks who has actually said yes.",
  },

  /** SOURCED, added in round G, label made exact in round 28. From the published deployment of a
   * real scheduling assistant: in its final phase 39% of requests finished inside the structured
   * workflow and 61% needed a trained person, and the three commonest reasons were all an
   * attendee. */
  stat: {
    value: "61%",
    label: "of scheduling requests needed a trained person at some point, and the top three reasons were all the other party",
    source: {
      text: "Cranshaw et al., Calendar.help, CHI 2017, a scheduling assistant run with real users; the figure is from its final phase",
      href: "https://arxiv.org/abs/1703.08428",
    },
  },

  figure: {
    kind: "timeline",
    caption: "Interested to booked, without a callback",
    events: [
      { at: "In the chat", label: "A time is asked for", note: "A homeowner asks when someone can come and look at the deck. That is the moment." },
      { at: "Straight away", label: "Real open times offered", note: "Read live from the contractor's calendar. Nothing the calendar already holds is offered." },
      { at: "On acceptance", label: "The slot is held", note: "Written to the calendar as it is taken, not at the end of the conversation." },
      { at: "Before the visit", label: "Confirmed and reminded", note: "A confirmation now and a reminder the day before, and an easy way to move it." },
    ],
    footnote:
      "An invented example of the sequence, not a recording of one. Where an appointment needs somebody outside the business to agree, the second step becomes a request rather than an offer.",
  },

  whatItIs: [
    "It is the scheduling layer under the chat assistant and the voice agent. A conversation reaches the point where someone wants a time: an estimate visit, a cleaning, a consultation, a haircut, a showing. The assistant reads that, and books it there and then from the business's live calendar.",
    "It handles the rest of the appointment's life too. The confirmation. The reminders before the day. And the reschedule request that would otherwise cost the front desk two phone calls.",
    "Some appointments need people who are not the business. An accounting office meeting may need two partners and the client; a real estate showing on another office's listing needs that office to agree. There the same layer sends the request, records who has actually replied, holds the business's own side while it waits, and tells the customer once, when the time is real.",
    "It fits any business that books time with customers: a contractor's estimate visits, a dental or accounting office's appointments, a salon, spa or gym's sessions, a real estate office's showings. For a practice that keeps health records it books and reminds only: the reminder names the time and the place, never the treatment.",
  ],

  howItWorks: [
    {
      title: "We connect the calendar the business already uses",
      body: "Read and write access to the calendar the team already keeps, plus the rules a calendar does not know: how long each kind of appointment takes, the gap between visits, the hours the business books, and any notice a job needs. The owner approves those rules before anything is offered.",
    },
    {
      title: "It notices the moment",
      body: "Wanting a time is short-lived. The assistant catches it inside the conversation rather than logging it for somebody to call back later.",
    },
    {
      title: "It offers times the business actually has",
      body: "Live availability, so it never offers time the calendar already holds, narrowed by the rules the owner gave it. A time that would break one of them is never shown.",
    },
    {
      title: "It holds the slot as it is taken",
      body: "The booking is written to the calendar the moment somebody accepts, rather than at the end of the exchange. So two people asking within a minute of each other cannot both be offered it. A system that can only read a calendar cannot do this.",
    },
    {
      title: "It tracks who has actually agreed",
      body: "A reply is a thing that happened, and silence is not. The two are kept apart. Where a request to another person is outstanding, the customer is told a request has gone in rather than told a time.",
    },
    {
      title: "It confirms, reminds and reschedules",
      body: "A confirmation now, reminders before the appointment, and a self-serve reschedule if plans change. A moved time is re-confirmed rather than assumed, because moving an appointment clears everybody's previous answer.",
    },
  ],

  handoff: {
    provides: [
      "Access to the calendar the business already uses, for each person who takes appointments.",
      "The booking rules: how long each appointment takes, the gaps, the hours, the notice a job needs.",
      "The wording of the confirmation and the reminder, and how far ahead each goes.",
      "Contact details of customers who agreed to get confirmations and reminders by text or email.",
    ],
    approves: [
      "The booking rules, and every change to them.",
      "Any exception: a time outside the hours, a double appointment, a rush job.",
      "What happens when another person has not answered after one reminder.",
      "Any cancellation the business makes, which a person always sends.",
    ],
  },

  useCases: [
    {
      title: "A contractor's estimate visit, booked inside the chat",
      body: "The homeowner never leaves the conversation to find a booking link. That is one step fewer between wanting someone to look at the job and having a time for it, and the slot is written to the calendar as it is taken.",
    },
    {
      title: "A dental or accounting office, offered once",
      body: "Availability is read live and each slot is written as it is taken, so the same time cannot go out twice from the office's side. The reminder carries the time and the address, and the front desk spends no call on either.",
    },
    {
      title: "A meeting that needs three people",
      body: "An accounting office books a client meeting with two partners. The assistant holds the office's side, sends the request, records who has replied and calls it confirmed only when all three have said yes. Until then the client hears that a request has gone in.",
    },
    {
      title: "A salon, spa or gym, moved without a call",
      body: "The customer moves the appointment themselves from the link in the reminder. The calendar updates, the reminders follow the new time, and nobody at the desk spends a call on it.",
    },
    {
      title: "A real estate showing on another office's listing",
      body: "A showing on somebody else's listing waits on somebody else's reply. The request goes out, the follow-up goes out once, and the agent finds out when it is answered instead of remembering to ask.",
    },
  ],

  limits: [
    "It does not create time. It reads the live calendar and can only offer what is genuinely free. A full week books nothing.",
    "It does not make anybody else reply. Some appointments need a partner, a client, an occupant or another office to agree. There, all it can do is ask, follow up once, and then hand it to a person.",
    "It cannot prevent every double booking. It can stop the business's own calendar being offered twice, because that is the calendar it reads and writes. It has no view of anybody else's diary and no authority over it.",
    "It does not know a rule nobody has told it. Notice periods, travel time between jobs and the hours a room is free are not written anywhere a machine can read, so they narrow what it offers only once somebody types them in.",
    "It does not stop a no-show. Reminders and an easy reschedule are worth having. Some people still will not turn up.",
    "It does not ask the business to move to a new calendar. It reads and writes the one the team already uses.",
  ],

  faqs: [
    {
      q: "What is an AI scheduling assistant?",
      a: "A system that books appointments from a business's live calendar inside the conversation where someone asks for a time, by chat, text or phone. It offers only real open times, writes the booking as it is taken, sends the confirmation and reminders, and handles the reschedule. Where other people must agree, it sends the request and tracks who has actually replied.",
    },
    {
      q: "How does AI scheduling avoid double-booking?",
      a: "It reads the live calendar at the moment it offers a slot, and writes the slot as soon as somebody takes it. So the same time cannot go out twice from the business's side. That is the half it can guarantee. It cannot see or control another office's diary, so if somebody else promises the same slot to another person, no scheduling software prevents that.",
    },
    {
      q: "Does it work with Google Calendar and Outlook?",
      a: "Yes. It reads availability from the calendar the team already uses and writes the booking back into it. Write access matters as much as read access, because a system that can only read cannot hold a slot while somebody decides.",
    },
    {
      q: "What happens when another person has to agree to the time?",
      a: "It sends the request, records the reply when it comes, follows up once if it does not, and holds the business's own slot in the meantime. The customer is told a request has gone in rather than told a time, and gets the time once everybody needed has actually agreed to it.",
    },
    {
      q: "If I move an appointment, does everybody have to confirm again?",
      a: "Yes, and that is the correct behaviour rather than an inconvenience. The standard that governs how calendar servers do scheduling requires it: a change to the start time, end time or duration resets every attendee's status to unanswered, because the agreement was to a particular time. A build that carries the old confirmations forward is carrying something that has been cleared.",
    },
    {
      q: "Can customers reschedule without calling?",
      a: "Yes. A reschedule link in the confirmation handles it. The calendar updates and the reminders adjust. Where other people are involved, the moved time goes back to them as a fresh request rather than as a notice, for the reason in the answer above.",
    },
  ],

  relatedPosts: [
    "ai-scheduling-real-estate-showing-confirmations",
    "ai-appointment-booking-no-shows-real-estate",
    "workflow-automation-real-estate-business",
  ],
};
