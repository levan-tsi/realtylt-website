import type { Service } from "./types";

/** COPY key `book` on realtylt.com/ai. Deep link: /ai#book
 *
 * "Most jobs go to whoever books first" was on this page until 2026-08-25 and had nothing under
 * it (round C); its narrative copies were swept in round 47. Do not bring it back in any field.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's estimate visit, a
 * dental cleaning, a salon or gym, a real estate showing as one example), led by the owner's
 * phrase "how to reduce no-shows" (keyword map: the no-show is the pain, the setter is a
 * seller's phrase). Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/booking/: Chen, Fang, Chen and Dai 2008
 * (PMC2170466: "A total of 1848 participants"; "80.5%, 87.5% and 88.3%"; "A reminder was sent
 * ... 72 h prior to the appointment") and McMullen and Netland 2015 (PMC4370946: 51,529
 * appointments; 0 to 2 weeks ahead 9.1% missed against 38.3% at six months in the resident clinic,
 * 2.4% against 6.9% in the faculty clinic). "Far better attendance" became the measured numbers. */
export const aiAppointmentBooking: Service = {
  slug: "ai-appointment-booking",
  aiKey: "book",
  name: "AI Appointment Booking",
  tier: "core",

  eyebrow: "Booking · Fewer no-shows",
  title: "Fewer no-shows: booked in the first conversation",
  lede: "A customer asks for a time in the evening, gets a callback the next morning, and has booked somewhere else by then. We set up AI appointment booking that replies in seconds, offers the business's real open times and books the appointment inside that first conversation. Then it sends the confirmation and one reminder before the day, so more people actually show up.",
  specs: ["reply and book in one go", "real open times only", "confirmation and reminder", "easy to move, hard to forget"],
  why: "An inquiry waiting on a callback is one somebody else can answer. A time agreed months away is one that is missed far more often. So book inside the first conversation, keep the date close, and remind before the day. Those are the cheap moves that turn more inquiries into work that actually happens.",
  keywords: [
    "how to reduce no shows",
    "appointment booking system",
    "appointment reminder text",
    "automated appointment scheduling",
    "what is an ai appointment setter",
  ],

  seo: {
    title: "How to reduce no-shows: AI appointment booking and reminders",
    description:
      "AI appointment booking for a local business: it replies in seconds, offers real open times, books in the first conversation and sends the reminder that cuts no-shows.",
  },

  /** The one number in the band, at the size it was measured: a single text reminder, 72 hours
   * ahead, in a randomised comparison against no reminder. The caveat that it is one Chinese
   * health check-up centre in 2007 sits in the source line beside it. */
  stat: {
    value: "87.5%",
    label: "attended after one text reminder, against 80.5% with none",
    source: {
      text: "Chen, Fang, Chen and Dai, Journal of Zhejiang University Science B, 2008. A randomised trial of 1,848 appointments at one health check-up centre, not a figure for any other trade.",
      href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2170466/",
    },
  },

  figure: {
    kind: "timeline",
    caption: "Inquiry to confirmed booking, in one conversation",
    events: [
      { at: "0s", label: "The inquiry arrives", note: "8:15pm, from the website: a homeowner wants an estimate for a new patio." },
      { at: "6s", label: "The AI replies", note: "Not tomorrow morning. Now, while they are still there." },
      { at: "40s", label: "Real times offered", note: "Read live from the contractor's calendar: Thursday at 4:00pm or Saturday at 10:00am." },
      { at: "1:10", label: "Booked", note: "Confirmed inside the same conversation. No phone tag." },
      { at: "72h before", label: "Reminded", note: "One reminder moved attendance seven points in the trial this page quotes. It is still only a reminder." },
    ],
    footnote: "An invented example. Every step between the ask and the slot is a place the inquiry can stop, and hours of silence is the widest one.",
  },

  whatItIs: [
    "It is the piece between someone asking for the business's time and that time appearing on the calendar. Today that gap is a callback somebody owes, a voicemail, a text sent at a bad moment, and a few hours in which another business answered first.",
    "The AI closes the gap. It replies in seconds. It reads the real availability, so it only offers times the business actually has. It books the appointment inside the same conversation. Then it sends the confirmation and the reminder that decide whether the person turns up.",
    "How far ahead a time is booked matters as much as how fast. At one university eye clinic, appointments booked up to two weeks ahead were missed 9.1 percent of the time in the clinic run by residents, against 38.3 percent for appointments booked six months ahead. That is a clinic, not any other trade, so read the direction rather than the decimals: a time kept close is a time kept.",
    "It fits any business that books time with customers: a contractor's estimate visits, a dental office's cleanings, a salon, spa or gym's sessions, an accounting office's consultations, a real estate office's showings and listing appointments. For a practice that keeps health records it books and reminds only, and the reminder names the time and the place, never the treatment.",
  ],

  howItWorks: [
    {
      title: "We set the booking rules with the owner",
      body: "Which appointments it may book, how long each takes, the hours, the gaps between visits, how far ahead it may book and what the reminder says. The owner approves those rules before the first booking.",
    },
    {
      title: "It replies while they are still there",
      body: "Seconds, not hours. The person who asked has not moved on to the next name on their list yet, which is the whole window.",
    },
    {
      title: "It books against the real calendar",
      body: "Live availability, so it never offers time the calendar already holds, and it offers the nearest good times first. Where an appointment also needs someone outside the business, that person's agreement is a request sent rather than a time held, and no calendar connection changes that.",
    },
    {
      title: "It reminds them so they show",
      body: "A confirmation straight away and a reminder before the day, with an easy way to move the time. A booking is not work done until the person actually arrives, and a reminder is the cheapest way to help that happen.",
    },
    {
      title: "It tells a person what it booked",
      body: "Every booking lands on the calendar with the conversation attached, and anything outside the rules, such as a rush job or a time out of hours, goes to a person instead of being booked.",
    },
  ],

  handoff: {
    provides: [
      "The calendar the business already uses, for each person who takes appointments.",
      "The booking rules: the kinds of appointment, how long each takes, the hours and the gaps.",
      "The words of the confirmation and the reminder, or a yes on ours.",
      "Contact details of customers who agreed to get confirmations and reminders.",
    ],
    approves: [
      "The booking rules, and every change to them.",
      "Any booking outside the rules: a rush job, a time out of hours, a double appointment.",
      "What happens to someone who misses an appointment, which a person always decides.",
      "A monthly look at no-shows and how far ahead people booked.",
    ],
  },

  useCases: [
    {
      title: "The evening estimate request",
      body: "A homeowner asks a contractor for an estimate at 8pm. By 8:02 they are booked for Thursday. In the old version, someone called back at 10am and found out what fourteen hours had done to it.",
    },
    {
      title: "A dental or accounting office, booked close",
      body: "A new client or patient asks for a first appointment. The assistant offers the nearest open times rather than the first slot in three weeks, books one, and sends the reminder. The front desk spends no call on it.",
    },
    {
      title: "A salon, spa or gym, the no-shows that can be prevented",
      body: "A confirmation and a reminder are not clever ideas. They are just things nobody has time to send every time. They are also the part of this that has been through a randomised trial, and the limits below say plainly what they still cannot do.",
    },
    {
      title: "A real estate office, a showing booked in the chat",
      body: "A visitor asks to see a house. The assistant books the time on the agent's calendar inside the conversation and, where the listing belongs to another office, sends that request rather than promising a time nobody has agreed to.",
    },
    {
      title: "The end of phone tag",
      body: "Two people trying to find a free hour by voicemail is a solved problem. What it costs any one business is not something anyone here has measured, and the business's own reports cannot say either, because an inquiry that goes quiet leaves the same trace as one that was never serious.",
    },
  ],

  limits: [
    "It does not make anyone turn up. Confirmations and reminders are the most reliable things anyone has for attendance, and they are still only reminders.",
    "It does not create availability. If the week is full it books nothing, and it does not offer a time the business has blocked out.",
    "It does not qualify the appointment. Booking fast puts more of the week in front of people, including the ones who were never going to buy.",
    "It does not handle the meeting that follows. It gets the time on the calendar. What happens in that meeting is the part the business is paid for.",
    "It does not text anyone who did not agree to get confirmations and reminders, and a reply of STOP ends them for that number.",
    "It does not repair a calendar nobody trusts. If half the commitments live in someone's head, a system reading the calendar will offer a time somebody is already standing in a kitchen for.",
  ],

  faqs: [
    {
      q: "How do I reduce no-shows?",
      a: "Book inside the first conversation, keep the date close, and send a reminder before the day with an easy way to move it. In a randomised trial of 1,848 appointments at one health check-up centre, attendance was 80.5 percent with no reminder and 87.5 percent with a single text sent 72 hours ahead. At one university eye clinic, appointments booked far ahead were missed several times more often than ones booked within two weeks. Neither study is about any other trade, so read the direction rather than the decimal.",
    },
    {
      q: "What should an appointment reminder text say?",
      a: "The business's name, the day and the time, the address, and one way to move it. Nothing private: for a health or financial practice, never the treatment or the matter. Send it to people who agreed to get reminders, and let a reply of STOP end them.",
    },
    {
      q: "What is an AI appointment setter?",
      a: "Software that answers an inquiry immediately, offers the business's genuine open times and books the appointment inside that first conversation, then confirms it and sends the reminder. It removes the callback and the phone tag, which is where many inquiries go quiet.",
    },
    {
      q: "How does it know when I am free?",
      a: "It reads the live calendar, so what it offers is time the calendar still shows as free. Blocking time out removes those slots. That is the half it can guarantee. The half it cannot is anyone else's calendar, which is why an appointment that needs another office is treated as a request until they agree.",
    },
    {
      q: "Will it reduce no-shows?",
      a: "That is what the confirmations and reminders are for, and it is the part of this with a randomised trial behind it: one text 72 hours ahead moved attendance from 80.5 to 87.5 percent in that study. The other half is less obvious. Booking inside the first conversation usually shortens the gap between the ask and the day, and in the eye clinic study shorter gaps went with far fewer missed appointments.",
    },
    {
      q: "Can it book on the phone as well as by text?",
      a: "Yes. The same booking runs behind the AI voice agent, so a caller can be booked mid-conversation exactly as a website visitor can, with the same rules and the same reminder.",
    },
  ],

  /** Own post first, then the sibling it shares a booking layer with. Two cards: RelatedPosts is a
   * two-column grid and an odd count leaves an empty cell. */
  relatedPosts: [
    "ai-appointment-booking-no-shows-real-estate",
    "ai-voice-agent-missed-calls-real-estate",
  ],
};
