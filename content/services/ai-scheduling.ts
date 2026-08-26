import type { Service } from "./types";

/** COPY key `scheduling` on realtylt.com/ai. Deep link: /ai#scheduling
 *
 * SYNCED WITH THE FLAGSHIP in round G. Three of this page's claims were absolutes that the
 * post's own primary sources contradict, and they are listed with their replacements in
 * docs/blog-flagship/ROUND-G-LOG.md and guarded in lib/blog/zombie-claims.test.ts. The short
 * version: a scheduling layer can stop YOUR calendar being offered twice, because your calendar
 * is the one it can read and write. It cannot stop a listing agent promising the same two
 * o'clock to somebody else, and "the double-booking that cannot happen" said it could. */
export const aiScheduling: Service = {
  slug: "ai-scheduling",
  aiKey: "scheduling",
  name: "Calendar Autopilot",
  tier: "more",

  eyebrow: "Scheduling · Calendar Autopilot",
  title: "Appointments that book themselves",
  lede: "The AI reads intent from a chat or call, offers real open slots from your Google or Outlook calendar, books the showing or consult, and sends the confirmations and reminders. It reschedules on request without a human touching it.",
  specs: ["Google + Outlook calendar", "live availability", "auto reminders", "self-serve reschedule"],
  why: "The gap between “interested” and “on the calendar” is where leads go cold. Instant booking closes that gap in the same conversation that opened it, and holding the slot the moment it is taken is what stops your own diary being offered twice.",
  keywords: [
    "ai appointment scheduling real estate",
    "automated showing scheduling",
    "real estate calendar automation",
    "ai booking assistant realtor",
    "auto schedule real estate appointments",
  ],

  seo: {
    title: "AI Scheduling: Showings and Consults That Book Themselves",
    description:
      "Live availability from Google or Outlook, offered inside the conversation, held the moment it is taken, confirmed, reminded, and rescheduled without a human.",
  },

  /** SOURCED, added in round G. From the published deployment of a real scheduling assistant:
   * 39% of 1,626 requests finished inside the structured workflow and 61% needed a trained
   * person, and the three commonest reasons were all an attendee. */
  stat: {
    value: "61%",
    label: "of real scheduling requests needed a trained person, and the top three reasons were all the other party",
    source: {
      text: "Cranshaw et al., Calendar.help, CHI 2017, 1,626 meetings over five months",
      href: "https://arxiv.org/abs/1703.08428",
    },
  },

  figure: {
    kind: "timeline",
    caption: "Interested to booked, without a callback",
    events: [
      { at: "In the chat", label: "Intent detected", note: "They asked to see it. That is the moment." },
      { at: "Instantly", label: "Real slots offered", note: "Read live from Google or Outlook, so nothing your own diary already holds is offered." },
      { at: "On acceptance", label: "The slot is held", note: "Written to your calendar as they take it, not at the end of the conversation." },
      { at: "Automatically", label: "Confirmed and reminded", note: "And rescheduled by them, without you." },
    ],
    footnote:
      "An illustration of the sequence, not a recording of one. Where an appointment needs somebody outside your office to agree, the second step becomes a request rather than an offer.",
  },

  whatItIs: [
    "It is the scheduling layer under the chat and the voice agent. When a conversation reaches the point where someone wants to see a property or sit down with you, the AI reads that intent and books it there and then, from your live Google or Outlook calendar.",
    "It handles the rest of the lifecycle too: the confirmation, the reminders that decide whether they show up, and the reschedule request that would otherwise cost you two phone calls.",
    "Where the appointment needs a permission that is not yours, which covers any showing on a listing somebody else holds, the same layer sends the request, records who has actually replied, holds your own side while it waits, and confirms to your client once rather than twice.",
  ],

  howItWorks: [
    {
      title: "It notices the moment",
      body: "Wanting to see the place is intent, and it is short-lived. The AI catches it inside the conversation rather than logging it for a callback.",
    },
    {
      title: "It offers slots you actually have",
      body: "Live availability from Google or Outlook, so it will not offer time your own calendar already holds. Any access constraint you have told it about, such as a property that needs notice, narrows what it offers before anybody sees a time.",
    },
    {
      title: "It holds the slot as it is taken",
      body: "Written to your calendar the moment somebody accepts, rather than at the end of the exchange, so two people asking within a minute of each other cannot both be offered it. A system that can only read a calendar cannot do this.",
    },
    {
      title: "It tracks who has actually agreed",
      body: "A reply is a thing that happened and silence is not, and the two are kept apart. Where a request is outstanding, your client is told a request has gone in rather than told a time.",
    },
    {
      title: "It confirms, reminds, and reschedules",
      body: "Reminders before the appointment, and a self-serve reschedule if their plans change. A moved time is re-confirmed rather than assumed, because moving an appointment clears everybody's previous answer.",
    },
  ],

  useCases: [
    {
      title: "The showing booked inside the chat",
      body: "The visitor never leaves the conversation to find a booking link, which is one fewer step between wanting to see a house and having a time for it.",
    },
    {
      title: "Your own diary, offered once",
      body: "Availability is read live and the slot is written as it is taken, so the same time cannot go out twice from your side. What happens on the other side of a co-broke is not something any software can promise.",
    },
    {
      title: "The request that is chased without you",
      body: "A showing on somebody else's listing waits on somebody else's reply. The request goes out, the chase goes out, and you find out when it is answered instead of remembering to ask.",
    },
    {
      title: "The reschedule you did not have to negotiate",
      body: "They move it themselves, your calendar updates, and neither of you spends a call on it.",
    },
  ],

  limits: [
    "It does not create time. It reads your live calendar and can only offer what is genuinely free, so a full week books nothing.",
    "It does not make anybody else reply. Where an appointment needs a listing agent, an occupant or a professional to agree, all it can do is ask, chase once, and then hand it to you.",
    "It cannot prevent every double booking. It can stop your own calendar being offered twice, because that is the calendar it reads and writes. It has no visibility of anybody else's diary and no authority over it.",
    "It does not know an access rule nobody has told it. Notice periods, lockbox hours and alarm windows are not published anywhere a machine can read, so they narrow what it offers only once somebody types them in.",
    "It does not stop a no-show. Reminders and an easy reschedule are worth having, and some people still will not turn up.",
    "It does not replace the calendar you already use. It reads and writes Google or Outlook rather than asking you to move to something new.",
  ],

  faqs: [
    {
      q: "How does AI scheduling avoid double-booking?",
      a: "It reads your live calendar at the moment it offers a slot and writes the slot as soon as somebody takes it, so the same time cannot go out twice from your side. That is the half it can guarantee. It cannot see or control another office's diary, so if a listing agent promises the same slot to somebody else, no scheduling software prevents that.",
    },
    {
      q: "Does it work with Google Calendar and Outlook?",
      a: "Yes, both. It reads availability and writes the booking back into whichever one you already use. Write access matters as much as read access: a system that can only read cannot hold a slot while somebody decides.",
    },
    {
      q: "What happens with a showing on somebody else's listing?",
      a: "It sends the request, records the reply when it comes, chases once if it does not, and holds your own slot in the meantime. Your client is told a request has gone in rather than told a time, and gets the time once somebody has actually agreed to it.",
    },
    {
      q: "If I move an appointment, does everybody have to confirm again?",
      a: "Yes, and that is the correct behaviour rather than an inconvenience. The standard that governs how calendar servers do scheduling requires that a change to the start time, end time or duration resets every attendee's status to unanswered, because the agreement was to a particular time. A build that carries the old confirmations forward is carrying something that has been cleared.",
    },
    {
      q: "Can people reschedule without calling me?",
      a: "Yes. A reschedule link handles it, the calendar updates, and the reminders adjust. Where other parties are involved, the moved time goes back to them as a fresh request rather than as a notification.",
    },
  ],

  relatedPosts: [
    "ai-scheduling-real-estate-showing-confirmations",
    "ai-appointment-booking-no-shows-real-estate",
    "workflow-automation-real-estate-business",
  ],
};
