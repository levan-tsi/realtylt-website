import type { Service } from "./types";

/** COPY key `scheduling` on realtylt.com/ai. Deep link: /ai#scheduling */
export const aiScheduling: Service = {
  slug: "ai-scheduling",
  aiKey: "scheduling",
  name: "Calendar Autopilot",
  tier: "more",

  eyebrow: "Scheduling · Calendar Autopilot",
  title: "Appointments that book themselves",
  lede: "The AI reads intent from a chat or call, offers real open slots from your Google or Outlook calendar, books the showing or consult, and sends the confirmations and reminders. It reschedules on request without a human touching it.",
  specs: ["Google + Outlook calendar", "live availability", "auto reminders", "self-serve reschedule"],
  why: "The gap between “interested” and “on the calendar” is where leads go cold. Instant, conflict-free booking closes that gap in the same conversation that opened it.",
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
      "Live availability from Google or Outlook, offered inside the conversation, booked without conflicts, confirmed and reminded automatically, and rescheduled without a human touching it.",
  },

  figure: {
    kind: "timeline",
    caption: "Interested to booked, without a callback",
    events: [
      { at: "In the chat", label: "Intent detected", note: "They asked to see it. That is the moment." },
      { at: "Instantly", label: "Real slots offered", note: "Read live from Google or Outlook. No conflicts, no guessing." },
      { at: "Same conversation", label: "Booked", note: "Before they close the tab and the interest cools." },
      { at: "Automatically", label: "Confirmed and reminded", note: "And rescheduled by them, without you." },
    ],
    footnote: "Interested and on the calendar are separated by about ten minutes of enthusiasm.",
  },

  whatItIs: [
    "It is the scheduling layer under the chat and the voice agent. When a conversation reaches the point where someone wants to see a property or sit down with you, the AI reads that intent and books it there and then, from your live Google or Outlook calendar.",
    "It handles the rest of the lifecycle too: the confirmation, the reminders that decide whether they show up, and the reschedule request that would otherwise cost you two phone calls.",
  ],

  howItWorks: [
    {
      title: "It notices the moment",
      body: "Wanting to see the place is intent, and it is short-lived. The AI catches it inside the conversation rather than logging it for a callback.",
    },
    {
      title: "It offers slots you actually have",
      body: "Live availability from Google or Outlook, so nothing double-books and nothing has to be undone the next morning.",
    },
    {
      title: "It confirms, reminds, and reschedules",
      body: "Reminders before the appointment, and a self-serve reschedule if their plans change, without a phone call in either direction.",
    },
  ],

  useCases: [
    {
      title: "The showing booked inside the chat",
      body: "The visitor never leaves the conversation to find a booking link, which is where a meaningful share of them are lost.",
    },
    {
      title: "The double-booking that cannot happen",
      body: "Because availability is read live rather than from a form somebody filled in last week.",
    },
    {
      title: "The reschedule you did not have to negotiate",
      body: "They move it themselves, your calendar updates, and neither of you spends a call on it.",
    },
  ],

  faqs: [
    {
      q: "How does AI scheduling avoid double-booking?",
      a: "It reads your live calendar at the moment it offers the slot, so it can only ever offer time that is genuinely free. Blocked time disappears from what it offers automatically.",
    },
    {
      q: "Does it work with Google Calendar and Outlook?",
      a: "Yes, both. It reads availability and writes the booking back into whichever one you already use.",
    },
    {
      q: "Can people reschedule without calling me?",
      a: "Yes. A reschedule link handles it, the calendar updates, and the reminders adjust. That removes one of the most common reasons an appointment quietly becomes a no-show.",
    },
  ],
};
