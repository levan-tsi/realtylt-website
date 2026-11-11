import type { Service } from "./types";

/** COPY key `chat` on realtylt.com/ai. Deep link: /ai#chat
 *
 * THE 78% IS GONE FROM THIS PAGE (2026-08-25, SERVICES-CRITIQUE.md §2a). It was asserted
 * three times here while `relatedPosts` pointed at the post that proves the figure has no
 * published report, no stated sample and no methodology behind it.
 *
 * What replaced it is what the post actually rests on, and it can be checked. Harvard
 * Business Review, "The Short Life of Online Sales Leads" (2011), by James Oldroyd, Kristina
 * McElheran and David Elkington:
 *   - an audit of 2,241 US companies, a test inquiry submitted through each company's own
 *     website: 23% never replied at all, and among those that replied inside thirty days the
 *     average took 42 hours;
 *   - a separate study of 1.25 million sales leads at 29 B2C and 13 B2B companies: firms
 *     trying to make contact within an hour were "nearly seven times" as likely to qualify the
 *     lead, which they defined as a meaningful conversation with a key decision maker, as firms
 *     trying even an hour later.
 * Re-read 2026-11-11 (saved in realtylt-agents company/agents/seo/runs/r28-services/sources/
 * voice/). It is cross-industry work from 2011, and the page says so.
 *
 * lib/blog/zombie-claims.test.ts reads content/services/**, so the 78% cannot come back.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a heating and cooling company, a
 * dental office, a salon or gym, a real estate office whose chat searches the listings as ONE
 * example). Vendor names out of the copy (BRAND section 5). It answers only from what the owner
 * approved; a quote for a job, a diagnosis or a promise goes to a person. The close names the
 * free website door (the AI plan's films: the chat film carries it). */
export const aiChatAssistant: Service = {
  slug: "ai-chat-assistant",
  aiKey: "chat",
  name: "AI Chat Assistant",
  tier: "flagship",

  eyebrow: "Website chat · Answers and bookings",
  title: "A website chatbot that answers and books",
  lede: "A customer lands on the website at 11:40 at night with one question, finds nobody to ask, and closes the tab. We put an AI chat assistant on the site that answers from the business's own information, takes the details, books a time from the real calendar and texts the confirmation. Anything it cannot check goes to a person, with the conversation attached. This is the one you can try right now.",
  specs: ["answers at any hour", "from your own information", "books on your calendar", "the chat goes to your CRM"],
  why: "Harvard Business Review reported that firms trying to reach a lead within an hour were nearly seven times likelier to have a meaningful conversation with a decision maker than firms trying even an hour later. The assistant answers while the person is still on the page, asks the first questions and books a time. An inquiry that arrives at night is answered at night.",
  keywords: [
    "website chatbot",
    "ai chatbot for small business",
    "ai customer service chatbot",
    "chatbot for lead generation",
    "ai chatbot for real estate",
  ],

  seo: {
    title: "AI chatbot for small business websites: answers and bookings",
    description:
      "An AI chat assistant for a small business website: it answers from the business's own information, takes the details, books a time and hands off to a person.",
  },

  /** The source was never missing from the page, only from the field (ROUND I). */
  stat: {
    value: "23%",
    label: "of 2,241 US companies never answered a website inquiry at all",
    source: {
      text: "Harvard Business Review, The Short Life of Online Sales Leads (2011), by James Oldroyd, Kristina McElheran and David Elkington. A test inquiry submitted through the website of each of 2,241 US companies. Cross-industry work from 2011, not a study of one trade.",
      href: "https://hbr.org/2011/03/the-short-life-of-online-sales-leads",
    },
  },

  figure: {
    kind: "transcript",
    caption: "A late-night question, start to booked visit",
    turns: [
      { who: "visitor", text: "do you service furnaces in fishkill? mine is making a banging noise" },
      {
        who: "ai",
        text: "Yes, Fishkill is inside our service area. I can't tell what the noise is from here, but a technician can look at it. The first open visits are tomorrow at 9:00am or 1:00pm. Would one of those work?",
      },
      { who: "visitor", text: "9 works" },
      {
        who: "ai",
        text: "Booked for 9:00am. What name and number should the technician use? I will text you the confirmation.",
      },
      { who: "visitor", text: "Sam, 845-555-0134" },
    ],
    footnote:
      "An invented example. The service area and the open times come from the company's own information and calendar; the details and the conversation go to the CRM before the tab closes.",
  },

  whatItIs: [
    "It is a text chat on the business's own website, answered by AI. It behaves like a well-briefed member of the team rather than a decision-tree bot. A visitor can ask whether the business covers their town, what a first visit involves, what the hours are or how soon someone can come, and get a straight answer to each in the same conversation.",
    "It answers only from what the owner approved: the services, the service area, the hours, the published prices if the business publishes them, the questions customers usually ask. Anything outside that, such as a quote for a particular job, a diagnosis or a promise, is not guessed. It takes the details and books a person to answer.",
    "It is connected to the systems that make the answer real. Times come from the live calendar, so a booked time is a real one. When the visitor wants the details in hand, it texts them to the number the visitor gives. When the conversation needs a voice, it can hand over to a phone call. For a real estate office it can also search the live listings, so the homes it quotes are the ones on the market this minute.",
    "Everything the visitor says is kept. The name, the number, what they need, where and when, and the full conversation land in the CRM. So the follow-up starts from what the person actually said, instead of a name and an email address.",
  ],

  howItWorks: [
    {
      title: "We write what it may answer",
      body: "Before it goes live we sit with the owner and write the defaults: the questions it may answer and the answers, the jobs it may book, what it never says, and its first line, that it is an AI assistant. The owner approves that page and every change to it.",
    },
    {
      title: "It answers in seconds, at any hour",
      body: "The assistant is live on every page of the site. Someone landing at 11:40pm gets the same reply speed as someone landing at lunchtime. The inquiry never sits in an inbox waiting for morning.",
    },
    {
      title: "It asks the first questions, then books",
      body: "What the job is, where and how soon, asked inside the conversation. Then it offers a real open time from the calendar and books it while the visitor is still interested.",
    },
    {
      title: "It moves to the channel the visitor wants",
      body: "The confirmation or the details go out by text to the number the visitor gives. If the visitor would rather talk, the conversation can move to a phone call with everything already known, so nobody has to start over.",
    },
    {
      title: "It hands over, and writes it all down",
      body: "Anything it cannot check goes to a person, with the conversation attached. Every chat, the answers and the booking are written to the CRM, so the morning starts from a list rather than an inbox.",
    },
  ],

  handoff: {
    provides: [
      "The answers it may give: services, service area, hours, published prices if any, the common questions.",
      "The calendar, with the times it may offer.",
      "Access to the CRM, or an inbox, where the chats and the leads should land.",
      "A place on the website for it, on the site the business already has.",
    ],
    approves: [
      "The page of what it may answer, and every change to it.",
      "Any quote for a particular job, any discount and any promise.",
      "The first reply to every lead it hands over.",
      "A weekly read of the chats it had, and what to fix.",
    ],
  },

  useCases: [
    {
      title: "The after-hours visitor",
      body: "The searching that happens after the office closes does not wait for it to open. A homeowner asks about a furnace at 11pm. The assistant answers from the company's own information, books a morning visit and texts the confirmation. In the morning the company has a booked visit instead of a contact form.",
    },
    {
      title: "A dental or accounting office with the same ten questions",
      body: "Do you take new clients, where do I park, what should I bring. The assistant answers the questions the office approved, books a first appointment and leaves the front desk with the conversations that need them. It does not discuss anyone's records.",
    },
    {
      title: "A salon or gym, booked while the visitor is looking",
      body: "Someone browses the services and starts to leave. The assistant asks one useful question, offers the open times for that service and books one, which turns an anonymous visit into a named customer with a time.",
    },
    {
      title: "A real estate office, searching the listings",
      body: "A visitor asks for three bedrooms under a price in a town. The assistant searches the live listings, texts the matches and asks whether the agent should call about one of them. Anything about a seller's terms goes to the agent.",
    },
  ],

  /** Lifted from this service's own flagship post, "What it does not do, and should not
   * pretend to", and re-aimed at local owners in round 28. */
  limits: [
    "It does not close a sale. It does not read a room, and it has no instinct for what is really going on behind a question. That judgment stays with the people in the business, who now hear about every inquiry.",
    "It does not answer what it cannot verify. Asked whether a job will cost a certain amount, the honest answer is that nobody knows until somebody looks. So it says so, and books the visit or the call.",
    "It does not invent a price, a diagnosis, a listing or a legal opinion. Anything outside what the owner approved, or what it can check against the calendar or the listings, becomes a booked call rather than a confident wrong answer.",
    "It does not pretend to be a person. It introduces itself as an AI assistant in its first line, and we do not build one that claims to be a particular human being.",
    "It does not text anyone who has not given their number for that reason. A visitor who asks for a text gets one; nobody is added to a list by the chat.",
  ],

  faqs: [
    {
      q: "How does a website chatbot work for a small business?",
      a: "A chat window on the site, answered by AI from the information the owner approved: services, area, hours and the common questions. It asks what the visitor needs, offers a real open time from the calendar and books it, texts the confirmation, and writes the conversation to the CRM. Anything it cannot check goes to a person instead of being guessed.",
    },
    {
      q: "How fast does an AI assistant reply to a website lead?",
      a: "In seconds, at any hour. The research worth quoting is Harvard Business Review's 2011 report on 1.25 million sales leads at 29 consumer and 13 business companies: firms that tried to make contact within an hour were nearly seven times as likely to qualify the lead as firms that tried even an hour later, where qualifying meant a meaningful conversation with somebody who could decide. That is cross-industry work rather than a study of one trade, so what carries over is the shape rather than the multiple.",
    },
    {
      q: "Will visitors know they are talking to an AI?",
      a: "Yes. The assistant says it is an AI assistant in its first line. What visitors care about is whether the answer is correct and immediate. When a question genuinely needs a person, it says so and books the call rather than pretending.",
    },
    {
      q: "What happens when the AI does not know the answer?",
      a: "It says it does not know, and it gets a person involved. It will not invent a price, a diagnosis, a listing or a legal opinion. Anything outside what the owner approved becomes a booked call or a message for the team, with the conversation attached. That is a better outcome than a confident wrong answer.",
    },
    {
      q: "Are AI chatbots worth it for a small business?",
      a: "Where questions arrive when nobody can answer them, yes: evenings, weekends, or a front desk that is always with somebody. Where the website gets few visitors, or a person already answers every inquiry within minutes, the honest answer is no: a clear contact form and a promise of when someone will reply, kept every time, does the job.",
    },
    {
      q: "Can I add an AI chat assistant to my existing website?",
      a: "Yes. It is a small piece of code that drops into the site the business already has, whether it came from a website builder or was built by hand, so the site does not need rebuilding. It connects to the calendar and the CRM the business already runs.",
    },
    {
      q: "Can an AI chatbot search real estate listings?",
      a: "For a real estate office, yes. It searches the live listings feed during the conversation, so it answers with the homes that are active at that moment rather than a stale export, filtered by price, beds, baths and area as the search bar would be, and it can text the results to the visitor. It says nothing about a seller's terms; those go to the agent.",
    },
    {
      q: "What does it do with the leads it captures?",
      a: "It writes them to the CRM with the full conversation, the phone number, what the person needs, where and when. The follow-up starts from what they actually said, so the person who calls back is not starting from a blank contact form.",
    },
  ],

  door: "website",

  relatedPosts: ["ai-chat-assistant-real-estate-website", "workflow-automation-real-estate-business"],
};
