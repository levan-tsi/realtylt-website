import type { Service } from "./types";

/** COPY key `voice` on realtylt.com/ai. Deep link: /ai#voice
 *
 * Round 28 (2026-11-11, the owner's word: AI is for business owners, a real estate office is one
 * example among several; a service page shows what is actually done). Re-aimed at local owners and
 * made to agree with the refreshed post `ai-voice-agent-missed-calls-real-estate` (branch r28-voice):
 * the AI-assistant sentence first, answers only from what the owner approved, a call-back only after
 * the consent and calling-hours checks, a named person reading every call in the trial. The
 * "sub-second" figure is gone: the post dropped it as a promised response time with no test behind
 * it (the owner's question since round 24), and the page now says what the post says.
 * Sources (read 2026-11-11, saved in realtylt-agents company/agents/seo/runs/r28-services/sources/):
 * HBR 2011, FCC 24-17, 47 CFR 64.1200(c)(1), PNAS 2009, NY Penal Law 250.00 and 250.05, California
 * Penal Code 632. */
export const aiVoiceAgents: Service = {
  slug: "ai-voice-agents",
  aiKey: "voice",
  name: "AI Voice Agents",
  tier: "flagship",

  eyebrow: "Voice · Answering and call-backs",
  title: "An AI voice agent that answers the calls an owner misses",
  lede: "The phone rings while the owner is on a roof, with a patient or halfway through a haircut, and the caller tries the next business on the list. We set up an AI voice agent that answers those calls, says it is an AI assistant, answers from the information the owner approved and books the next step. Anything it cannot check goes to a person.",
  specs: ["answers when nobody can", "says it is an AI", "books on your calendar", "call notes to your CRM"],
  why: "A call nobody answers can go to the next business on the list. The agent picks up, takes down what the job is, where it is and how soon it is needed, and books the visit. The person who calls back has the notes in hand, and nobody on the team has to sit by the phone to make that happen.",
  keywords: [
    "ai voice agent",
    "ai receptionist for small business",
    "ai answering service",
    "ai phone answering service for small business",
    "ai voice agent for real estate",
  ],

  seo: {
    title: "AI voice agent and answering service for small business",
    description:
      "An AI voice agent that answers the calls a busy owner misses, says it is an AI assistant, books the visit and passes anything it cannot check to a person.",
  },

  figure: {
    kind: "timeline",
    caption: "One evening call to a roofer, end to end",
    events: [
      { at: "0:00", label: "The phone rings", note: "9:42pm. Water is coming through a ceiling, and the roofer is off for the night." },
      { at: "0:03", label: "The agent picks up", note: "Its first sentence says it is the company's AI assistant." },
      { at: "0:40", label: "Question answered", note: "Yes, the town is inside the service area. The answer comes from the company's own list." },
      { at: "1:10", label: "Price refused", note: "It does not guess a cost. The roofer quotes after seeing the roof." },
      { at: "1:50", label: "Visit booked", note: "Tomorrow 8:00am, a slot the roofer left open on the calendar." },
      { at: "1:52", label: "Notes sent", note: "The address, the leak and the booked time, in the roofer's inbox and the CRM." },
    ],
    footnote: "An invented example. The same agent can call new inquiries back, once the consent and calling-hours checks pass.",
  },

  whatItIs: [
    "An AI voice agent is a phone voice that answers when nobody at the business can. It says at the start that it is an AI assistant. It answers from the information the owner approved, asks the first questions a person would ask, and books the next step on the calendar. Anything it cannot check, such as a price, a diagnosis or a promise, becomes a call back from a person, with the notes already written.",
    "It fits businesses whose calls come in while hands are busy: a roofer or a plumber on a job, a dental or accounting office whose front desk is with someone, a salon, spa or gym in the middle of an appointment, a real estate office out on a showing. It does not fit an office where a person already answers almost every call and calls after hours are rare. There a voicemail greeting that says when someone will call back, and a team that keeps that promise, does the job without us.",
    "Speed matters because people move on. In 2011 Harvard Business Review reported an audit of 2,241 US companies, each sent an inquiry through its own website: 23 percent never replied at all, and among the companies that replied within 30 days the average reply took 42 hours. That is cross-industry research about web forms rather than phone calls, and not a study of any one trade. Read it as the shape of the problem, not as a benchmark.",
    "The pause decides whether it sounds usable. On a phone there is no face to read, so a silence makes the caller guess whether the line dropped or nobody is there. A 2009 study of conversation in 10 languages, in the Proceedings of the National Academy of Sciences, found the most common gap between one speaker finishing and the next starting was between 0 and 200 milliseconds. So the setup keeps the agent's pause as short as it can, and we ask every owner to test it on a real call before it goes live rather than take anyone's figure, ours included.",
  ],

  howItWorks: [
    {
      title: "We write down what it may say",
      body: "Before anything goes live we sit with the owner and write the defaults on one page: the questions it may answer and the answers, the jobs it may book and how long each takes, what it never says (a price, a diagnosis, a promise), and its first sentence, that it is an AI assistant. The owner approves that page.",
    },
    {
      title: "Every call gets answered",
      body: "Calls go to the agent when nobody can pick up, after hours, or on every call, as the owner chooses. It greets the caller, answers from the approved page and the calendar, and never leaves someone in a voicemail box.",
    },
    {
      title: "It asks the first questions, then books",
      body: "What the job is, where it is and how soon it is needed, asked in a normal conversation rather than read from a script. Then it offers a real open slot from the calendar and confirms it on the call.",
    },
    {
      title: "It hands over, with the notes",
      body: "Anything outside the approved page becomes a call back from a person. After every call the transcript, the answers and the next step go to the owner's inbox and the CRM, so whoever calls back already knows the story.",
    },
    {
      title: "Call-backs only after two checks",
      body: "It can call a new inquiry back, call one person when told to, or work through a list. Before it dials, two checks must pass: the person gave consent for that kind of call, and it is within calling hours where they live, 8 a.m. to 9 p.m. If either check fails, the call is scheduled for a person.",
    },
    {
      title: "A trial with a person reading every call",
      body: "For the first weeks a named person, usually the owner, reads every call, decides what gets fixed and can switch the agent off. It stays on only when the calls read cleanly, and the page of what it may say is changed only by that person.",
    },
  ],

  handoff: {
    provides: [
      "The phone line, forwarded to the agent when nobody can answer.",
      "The answers it may give: the service area, the hours, the jobs taken and what each visit involves.",
      "The calendar, with the slots it may offer.",
      "The consent wording on the website's forms, approved by the business's attorney, before any call-back runs.",
    ],
    approves: [
      "The page of what it may say, and every change to it.",
      "Any price, quote, discount or promise. Those are always a person's.",
      "Any list of people to call, before the first call is made.",
      "The trial calls, read one by one, and whether the agent stays on.",
    ],
  },

  useCases: [
    {
      title: "A roofer on a ladder",
      body: "A homeowner calls about a leak at 7:40 in the evening. The agent answers, checks the address is inside the service area, declines to guess a price and books a morning visit. The roofer sees it on the calendar with the caller's notes, and calls back if anything needs a person.",
    },
    {
      title: "A dental or accounting office with a busy desk",
      body: "The front desk is with a patient or a client and the second line rings. The agent answers the routine questions it was given, such as the hours, the parking and which documents to bring, and books a time or takes a message for the desk. It does not discuss anyone's records, treatment or taxes.",
    },
    {
      title: "A salon, spa or gym in the middle of an appointment",
      body: "Hands are busy with a client and the caller wants Saturday. The agent offers the open Saturday slots for that service, books one, and the booking lands in the calendar the business already uses.",
    },
    {
      title: "A real estate office out on a showing",
      body: "An agent is showing a house when a call comes in about another listing. The voice agent answers the questions it was given about that listing, books a showing on the agent's calendar and passes anything about price or terms to the agent.",
    },
    {
      title: "Calling back a new inquiry",
      body: "A form comes in at 2pm from a person who ticked the box to be called. Inside calling hours, the agent calls back, asks the first questions and books a time. If the box was not ticked, or the hour is wrong where the person lives, the call goes on a person's list instead.",
    },
    {
      title: "One call, now",
      body: "The owner points the agent at a single contact who asked to be called and tells it to call. It dials on the spot, with the same first questions and the same booking. Useful when someone asks for a call and should hear from the business before they try the next one.",
    },
    {
      title: "A list of people who asked to hear",
      body: "Past customers asked to be told when spring bookings open. The agent can work the list in parallel rather than one call at a time, but only the people with a written line beside their name saying how and when they consented, and only after a person approves the list.",
    },
  ],

  limits: [
    "It does not close a sale or agree a price. Much of what a person hears on a first call is not in the words, and a transcript records none of it.",
    "It does not take over the front desk. It takes the repeatable first contact off the desk: picking up, asking the first questions and booking the next step, so the people there have more time for the conversations that need them.",
    "It will not invent a price, a diagnosis, a legal position or a fact about a job. Anything it cannot check from the approved page becomes a call back from a person.",
    "It does not pretend to be a person. It says in its first sentence that it is an AI assistant, and we do not build one that claims to be a particular human being.",
    "It is not the relationship. A past customer or a long-time client gets a call back from a person; the agent only holds the door open until then.",
    "It does not call anyone who has not consented to that kind of call, and it does not call outside calling hours where the person lives. When either check fails, a person makes the call.",
    // The recording rule stays as a limit because nobody here can say whether a given build keeps
    // the audio (OWNER-QUESTIONS 1.3): what CAN be written is the rule the setup has to meet.
    "It does not settle the recording policy. That is decided by where the caller is, not where the business is: New York lets one party to a call consent, California requires every party for a confidential call. A line that takes calls from out of state is set up for the stricter rule, and whether a build keeps the audio or only the transcript is decided on purpose, with the business's attorney.",
  ],

  faqs: [
    {
      q: "What is an AI voice agent for a small business?",
      a: "A phone voice that answers the calls nobody at the business can take. It says it is an AI assistant, holds a short conversation from the information and calendar the owner approved, and books the next step. Anything it cannot check, such as a price, becomes a call back from a person, with the notes written.",
    },
    {
      q: "Can an AI phone answering service work for a small business?",
      a: "It works where calls come in while hands are busy: trades on job sites, offices whose front desk is with someone, salons, spas and gyms mid-appointment, a real estate office on showings. It is the wrong buy where a person already answers almost every call and calls after hours are rare. A voicemail greeting that names when someone will call back, kept every time, does that job for free.",
    },
    {
      q: "Will callers know they are talking to an AI?",
      a: "Yes. The agents we set up say they are an AI assistant in their first sentence, and we will not build one that pretends to be a particular human being. Where the call is recorded, the opening says that too. Saying it is an AI and asking consent to record are two different things, and the script handles both.",
    },
    {
      q: "How fast does an AI phone agent respond during a call?",
      a: "The pause is kept as short as the setup allows, because on a phone a silence makes the caller wonder whether the line dropped. In ordinary conversation the most common gap between turns is under a fifth of a second, by a 2009 study of 10 languages. We do not quote a figure for the agent: test it on a real call before it goes live, ours included.",
    },
    {
      q: "Can it call new inquiries back automatically?",
      a: "Yes, after two checks. The person must have given consent for that kind of call, and it must be within calling hours where they live, 8 a.m. to 9 p.m. Then it calls, asks the first questions and books a time, and it can try once more later the same day inside those hours. If either check fails, the call is scheduled for a person.",
    },
    {
      q: "What happens when it cannot answer something?",
      a: "It says so plainly and books a call back from a person rather than guessing. It will not invent a price, a diagnosis, a legal position or a fact about a job. The person who calls back gets the transcript and the caller's answers first, so the caller does not have to start over.",
    },
    {
      q: "Does it take over the front desk?",
      a: "No. It takes the repeatable first contact off the desk: answering the calls nobody can pick up, calling back new inquiries where the consent and calling-hours checks pass, asking the first questions the owner approved, and booking a time. The people at the desk keep every conversation that needs judgment, and have more time for them.",
    },
    {
      q: "Does it work with my calendar and my CRM?",
      a: "Yes. It reads the live availability, so it only offers slots that are really open, and it writes the transcript, the answers and the outcome back to the CRM after every call. It plugs into the systems the business already runs rather than adding another one to keep up.",
    },
    {
      q: "Do I need consent to record these calls?",
      a: "It is decided by the caller's state rather than the business's. In New York the offense is eavesdropping, Penal Law section 250.05, and the definition that governs a phone call, at section 250.00, is the recording of a telephonic communication by a person other than a sender or receiver of it, without the consent of either. So a party to the call can consent. California's Penal Code section 632 makes it an offense to record a confidential communication without the consent of all parties. On an inbound call the caller's state is rarely known until they say, so the workable rule is to plan for the stricter one and to say it at the start of the call. None of this is legal advice; the article on this service carries both statutes.",
    },
    {
      q: "Is it legal to have an AI make outbound calls?",
      a: "Under the Telephone Consumer Protection Act, a call that uses an artificial voice needs the called person's prior express consent unless an emergency or an exemption applies, and in 2024 the Federal Communications Commission confirmed that an AI-generated voice counts as an artificial voice. Telemarketing calls also have to respect do-not-call requests and calling hours, 8 a.m. to 9 p.m. where the person is. The purpose of the call and the states involved matter, so the business's attorney reviews the setup before the first outbound call.",
    },
  ],

  /** Own post first: the deep dive on THIS service is the most useful next click from here. */
  relatedPosts: [
    "ai-voice-agent-missed-calls-real-estate",
    "ai-chat-assistant-real-estate-website",
    "ai-appointment-booking-no-shows-real-estate",
  ],
};
