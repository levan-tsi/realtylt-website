import type { Service } from "./types";

/** COPY key `book` on realtylt.com/ai. Deep link: /ai#book */
export const aiAppointmentBooking: Service = {
  slug: "ai-appointment-booking",
  aiKey: "book",
  name: "AI Appointment Booking",
  tier: "core",

  eyebrow: "Booking · Turn inquiries into jobs",
  title: "Every inquiry booked while it's still hot",
  lede: "When someone asks for your time, the AI replies in seconds, offers your real open slots, and books the job right there in the conversation, then sends the confirmation and reminders so they actually show up. No phone tag, no “let me check my calendar,” no lead going cold overnight.",
  specs: ["instant reply + booking", "confirmations + reminders", "cuts no-shows", "fills open slots"],
  why: "Most jobs go to whoever books first, yet inquiries sit for hours waiting on a callback. Booking the appointment inside that first conversation, and reminding them so they turn up, turns far more inquiries into paid work.",
  keywords: [
    "ai appointment setter",
    "online booking for service business",
    "reduce no-shows automation",
    "automated appointment reminders",
    "book more jobs automatically",
  ],

  seo: {
    title: "AI Appointment Booking: Book the Job in the First Conversation",
    description:
      "An AI that replies in seconds, offers your real open slots, books the appointment inside the conversation, and sends the confirmations and reminders that stop no-shows.",
  },

  figure: {
    kind: "timeline",
    caption: "Inquiry to confirmed booking, in one conversation",
    events: [
      { at: "0s", label: "The inquiry arrives", note: "8:15pm, from your website." },
      { at: "6s", label: "The AI replies", note: "Not tomorrow morning. Now, while they are still there." },
      { at: "40s", label: "Real slots offered", note: "Read live from your calendar, so nothing double-books." },
      { at: "1:10", label: "Booked", note: "Confirmed inside the same conversation. No phone tag." },
      { at: "24h before", label: "Reminded", note: "The reminder is what turns a booking into an attendance." },
    ],
    footnote: "The job usually goes to whoever booked it first, and hours of silence is how you lose it.",
  },

  whatItIs: [
    "It is the piece between someone asking for your time and that time appearing on your calendar. Today that gap is a callback you owe, a voicemail, a text sent at a bad moment, and a couple of hours in which a competitor answered first.",
    "The AI closes the gap. It replies in seconds, reads your real availability so it only offers slots you actually have, books the appointment inside the same conversation, and then sends the confirmation and the reminders that decide whether the person turns up.",
  ],

  howItWorks: [
    {
      title: "It replies while they are still there",
      body: "Seconds, not hours. The person who asked for your time has not moved on to the next name on their list yet, which is the entire window.",
    },
    {
      title: "It books against your real calendar",
      body: "Live availability, so nothing double-books and nothing has to be rearranged the next morning. The slot it offers is a slot you have.",
    },
    {
      title: "It reminds them so they show",
      body: "Confirmation immediately, reminders before. A booking is not revenue until the person actually arrives, and reminders are the cheapest way to make them.",
    },
  ],

  useCases: [
    {
      title: "The evening inquiry",
      body: "Someone asks at 8pm. By 8:02 they are booked for Thursday. In the old version of this, you called them back at 10am and they had already booked with someone else.",
    },
    {
      title: "The end of phone tag",
      body: "Two people trying to find a mutually free hour by voicemail is a solved problem, and solving it recovers most of the inquiries lost to friction.",
    },
    {
      title: "No-shows that stop happening",
      body: "A confirmation and two reminders is not a clever idea, it is just something nobody has time to do consistently. Automating it fills the empty slot in your week.",
    },
  ],

  faqs: [
    {
      q: "What is an AI appointment setter?",
      a: "It is software that answers an inquiry immediately, offers your genuine open times, and books the appointment inside that first conversation, then confirms it and sends reminders. It removes the callback and the phone tag, which is where most inquiries are lost.",
    },
    {
      q: "How does it know when I am free?",
      a: "It reads your live calendar, so it only ever offers slots that are genuinely open and it cannot double-book you. If you block time out, those slots disappear from what it offers.",
    },
    {
      q: "Will it reduce no-shows?",
      a: "That is what the confirmations and reminders are for. Reminders are the single most reliable way to improve attendance, and the reason they are underused is that nobody sends them consistently by hand.",
    },
    {
      q: "Can it book on the phone as well as by text?",
      a: "Yes. The same booking runs behind the AI voice agent, so a caller can be booked mid-conversation exactly as a website visitor can.",
    },
  ],
};
