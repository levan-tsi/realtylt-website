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
  // "Most jobs go to whoever books first" was here until 2026-08-25 and had nothing under it,
  // which is the same shape of claim as the 78% this repo killed on the chat page. Replaced
  // with the two things the flagship post can actually evidence: an appointment left waiting is
  // one somebody else can take, and an appointment pushed a long way out is measurably less
  // likely to happen (McMullen and Netland 2015, cited on the post).
  why: "An inquiry waiting on a callback is one somebody else can answer, and a time agreed for a fortnight away is one that often does not happen at all. Booking inside the first conversation and reminding them before the day are the two cheap moves that turn more inquiries into work you actually do.",
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
      "An AI that replies in seconds, offers your real open slots, books inside the conversation, and sends the confirmations and reminders that stop no-shows.",
  },

  /** The one number on this page, and it carries its own derivation because of the field added
   * to `Service["stat"]` on 2026-08-25. It is the trial the flagship post rests on, quoted at
   * the size it was measured: a single reminder, 72 hours ahead, in a randomised comparison
   * against no reminder at all. The caveat that it is a Chinese health check-up centre in 2007
   * lives on the post, where there is room to say it properly. */
  stat: {
    value: "87.5%",
    label: "attended after one text reminder, against 80.5% with none",
    source: {
      text: "Chen, Fang, Chen and Dai, Journal of Zhejiang University Science B, 2008. A randomised trial of 1,848 appointments at one health promotion centre, not a real estate figure.",
      href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2170466/",
    },
  },

  figure: {
    kind: "timeline",
    caption: "Inquiry to confirmed booking, in one conversation",
    events: [
      { at: "0s", label: "The inquiry arrives", note: "8:15pm, from your website." },
      { at: "6s", label: "The AI replies", note: "Not tomorrow morning. Now, while they are still there." },
      { at: "40s", label: "Real slots offered", note: "Read live from your calendar, so a slot it offers is one your own diary still shows." },
      { at: "1:10", label: "Booked", note: "Confirmed inside the same conversation. No phone tag." },
      // ROUND 47: the note read "The reminder is what turns a booking into an attendance", which
      // states as a certainty the thing `limits[0]` denies one screen below and which the trial
      // this page quotes measures at seven points rather than at all of them.
      { at: "24h before", label: "Reminded", note: "One reminder moved attendance seven points in the trial this page quotes. It is still only a reminder." },
    ],
    // "The job usually goes to whoever booked it first" was the same unsourced claim that came
    // out of `why` on 2026-08-25, still alive one field lower down. A retraction that misses the
    // second copy has retracted nothing, which is the lesson the 78% taught this repo.
    footnote: "Every step between the ask and the slot is a place the inquiry can stop, and hours of silence is the widest one.",
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
      body: "Live availability, so it will not offer time your own calendar already holds. Where an appointment also needs somebody outside your office, their agreement is a message you have sent rather than a time you have, and no calendar integration changes that.",
    },
    {
      title: "It reminds them so they show",
      body: "Confirmation immediately, reminders before. A booking is not revenue until the person actually arrives, and reminders are the cheapest way to make them.",
    },
  ],

  useCases: [
    {
      title: "The evening inquiry",
      // ROUND 47: ended "and they had already booked with someone else", the narrative form of
      // "Most jobs go to whoever books first", which round C removed from `why` and from the
      // figure footnote on this same page. `why` now says an inquiry waiting on a callback is one
      // somebody else CAN answer. This one asserted that somebody else did.
      body: "Someone asks at 8pm. By 8:02 they are booked for Thursday. In the old version of this, you called them back at 10am and found out what fourteen hours had done to it.",
    },
    {
      title: "The end of phone tag",
      // ROUND 47: "The inquiries lost to that friction are lost quietly, which is why almost
      // nobody counts them" is word for word the shape round D removed from /services/crm-sync
      // ("The deals lost to a stale CRM are lost quietly, which is why nobody counts them"),
      // for the reason its comment gives: it asserts a loss nobody here has measured. The
      // retraction did not reach this page. Replaced with what is actually knowable.
      body: "Two people trying to find a mutually free hour by voicemail is a solved problem. What it costs is not something anybody here has measured, and it is not something your own reports can tell you either, because an inquiry that goes quiet leaves the same trace as one that was never serious.",
    },
    {
      title: "The no-shows you can actually prevent",
      body: "A confirmation and a reminder is not a clever idea, it is just something nobody has time to do consistently. It is also the only part of this that has been through a randomised trial, and the limits below say plainly what it still cannot do.",
    },
  ],

  limits: [
    "It does not make anybody turn up. Confirmations and reminders are the most reliable thing anyone has for attendance, and they are still only reminders.",
    "It does not create availability. If the week is full it books nothing, and it does not offer a slot you have blocked out.",
    "It does not qualify the appointment for you. Booking fast puts more of your week in front of people, including the ones who were never going to buy.",
    "It does not handle the conversation that follows. It gets the time on the calendar. What happens in that meeting is the part you are paid for.",
    "It does not repair a calendar you do not trust. If half your commitments live in somebody's head, a system reading the calendar will offer a slot you are already standing in a kitchen for.",
  ],

  faqs: [
    {
      q: "What is an AI appointment setter?",
      a: "It is software that answers an inquiry immediately, offers your genuine open times, and books the appointment inside that first conversation, then confirms it and sends reminders. It removes the callback and the phone tag, which is where most inquiries are lost.",
    },
    {
      q: "How does it know when I am free?",
      a: "It reads your live calendar, so what it offers is time your own diary still shows as free, and blocking time out removes those slots. That is the half it can guarantee. The half it cannot is anybody else's calendar, which is why the scheduling article on this site treats a showing on somebody else's listing as an agreement you do not have yet rather than as a booking.",
    },
    {
      q: "Will it reduce no-shows?",
      a: "That is what the confirmations and reminders are for, and it is the one part of this with a randomised trial behind it: in a comparison of 1,848 appointments, attendance was 80.5% with no reminder and 87.5% with a single text sent 72 hours ahead. That was a health check-up centre rather than a listing appointment, so read the direction rather than the decimal. The other half is less obvious: booking inside the first conversation usually shortens the gap between the ask and the day, and shorter gaps go with far better attendance.",
    },
    {
      q: "Can it book on the phone as well as by text?",
      a: "Yes. The same booking runs behind the AI voice agent, so a caller can be booked mid-conversation exactly as a website visitor can.",
    },
  ],

  /** Own flagship first, then the sibling it shares a booking layer with. Two cards and not
   * three because RelatedPosts is a two-column grid and an odd count leaves an empty cell. The
   * chat post came off this list when the booking post landed: it is the better link for the
   * "answer fast" half, and this page's own post is the better link for all of it. */
  relatedPosts: [
    "ai-appointment-booking-no-shows-real-estate",
    "ai-voice-agent-missed-calls-real-estate",
  ],
};
