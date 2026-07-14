import type { Service } from "./types";

/** COPY key `chat` on realtylt.com/ai. Deep link: /ai#chat */
export const aiChatAssistant: Service = {
  slug: "ai-chat-assistant",
  aiKey: "chat",
  name: "AI Chat Assistant",
  tier: "flagship",

  eyebrow: "Website AI Assistant",
  title: "The assistant your visitors actually talk to",
  lede: "Real text chat on Claude. It searches your MLS live, texts matching listings over Twilio SMS, hands off to a Vapi voice call, and captures the lead before it bounces. This is the one you can touch right now.",
  specs: ["Claude", "MLS Grid API", "Twilio SMS", "Vapi handoff"],
  why: "78% of leads close with whoever responds first, yet most sites answer in hours. This replies in seconds, qualifies, and books, so no inquiry dies overnight.",
  keywords: [
    "ai chatbot for real estate website",
    "real estate website assistant",
    "ai lead capture for realtors",
    "mls search chatbot",
    "24/7 real estate lead response",
  ],

  seo: {
    title: "AI Chat Assistant for Real Estate Websites",
    description:
      "A live AI chat assistant that searches your MLS, texts matching listings over SMS, hands off to a voice call, and captures the lead in seconds instead of hours.",
  },

  stat: {
    value: "78%",
    label: "of leads close with whoever responds first",
  },

  figure: {
    kind: "transcript",
    caption: "A real exchange, start to lead",
    turns: [
      { who: "visitor", text: "any 3 bedroom under 600k in beacon?" },
      {
        who: "ai",
        text: "Four active right now in Beacon under $600k. The closest to your ask is a 3 bed / 2 bath on Verplanck, listed at $565,000. Want me to text you all four?",
      },
      { who: "visitor", text: "yeah text me" },
      {
        who: "ai",
        text: "Sent. What number should I use, and would you like Levan to call you this evening about the Verplanck one?",
      },
      { who: "visitor", text: "845-555-0134, evening works" },
    ],
    footnote:
      "Listings pulled live from the MLS. Number, intent, and timeline written to the CRM before the tab closes.",
  },

  whatItIs: [
    "It is a text chat on your own website, answered by Claude, that behaves like a well-briefed member of your team rather than a decision-tree bot. A visitor can ask for three bedrooms under $600k in Beacon, ask what the taxes look like, ask whether the seller will take a contingency, and get a straight answer to each one in the same conversation.",
    "It is wired to the systems that make the answer real. Listing questions hit the MLS Grid feed, so the inventory it quotes is the inventory that exists this minute. When a visitor wants the listings in their hand, it sends them by SMS through Twilio. When the conversation gets serious enough to need a voice, it hands off to a Vapi call rather than leaving a form behind.",
    "Everything it learns is captured. Name, number, price band, area, timeline, and the full transcript land in your CRM, so the follow-up starts from what the person actually said instead of a name and an email address.",
  ],

  howItWorks: [
    {
      title: "It answers in seconds, at any hour",
      body: "The assistant is live on every page of your site. Someone landing at 11:40pm gets the same reply speed as someone landing at lunchtime, which is the entire point: the inquiry never sits in an inbox waiting for morning.",
    },
    {
      title: "It searches the real MLS, not a cached list",
      body: "Questions about inventory are answered against the MLS Grid API, filtered to what is genuinely active. It quotes prices, beds, baths, and addresses that hold up, because it read them a second ago.",
    },
    {
      title: "It moves the conversation to a channel that converts",
      body: "Matching listings go out by Twilio SMS, which people open. If the visitor wants to talk, a Vapi voice agent picks the conversation up on the phone with everything already known about them, so nobody has to start over.",
    },
    {
      title: "It qualifies, books, and writes it all down",
      body: "Budget, area, timeline, and motivation get asked naturally inside the conversation. The lead and the transcript are written to your CRM, and the appointment is booked while the visitor is still interested.",
    },
  ],

  useCases: [
    {
      title: "The after-hours buyer",
      body: "Most home searching happens at night on a phone. The assistant answers at 11pm, sends four matching listings by text, and books a Saturday showing. In the morning you have a booked appointment instead of a contact form.",
    },
    {
      title: "The visitor who was about to bounce",
      body: "Someone browses three listings and starts to leave. The assistant asks one useful question, gets a price band and an area, and turns an anonymous session into a named lead with a phone number.",
    },
    {
      title: "The listing inquiry you would have missed",
      body: "A buyer asks about a specific address while you are at a closing. The assistant answers on the facts, captures the number, and hands you a person to call back rather than a missed call notification.",
    },
    {
      title: "The seller quietly checking their value",
      body: "A homeowner asking what their street is selling for is a seller lead in disguise. The assistant recognises it, offers a valuation, and routes them to a listing conversation instead of a listings page.",
    },
  ],

  faqs: [
    {
      q: "Can an AI chatbot actually search the MLS?",
      a: "Yes. This one queries the MLS Grid API live during the conversation, so it answers with the listings that are active at that moment rather than a stale export. It can filter by price, beds, baths, and area exactly as you would in the search bar, and it can text the results to the visitor over SMS.",
    },
    {
      q: "How fast does an AI assistant reply to a website lead?",
      a: "In seconds, at any hour. That matters because roughly 78% of leads close with whoever responds first, and most real estate websites answer in hours, if at all. The assistant is the difference between a lead you contacted and a lead your competitor contacted.",
    },
    {
      q: "Will visitors know they are talking to an AI?",
      a: "Yes, and we recommend it. The assistant introduces itself as an assistant. What people care about is whether the answer is correct and immediate, and it is. When a question genuinely needs the agent, it says so and books the call rather than pretending.",
    },
    {
      q: "What happens when the AI does not know the answer?",
      a: "It says it does not know, then gets a human involved. It will not invent a listing, a price, or a legal opinion. Anything outside what it can verify against the MLS or your own knowledge base becomes a booked call with you, which is a better outcome than a confident wrong answer.",
    },
    {
      q: "Does an AI chat assistant replace an ISA?",
      a: "It replaces the part of an ISA's job that is speed and repetition: answering instantly, qualifying on budget and timeline, and booking the appointment. It does not replace the judgment of an experienced agent on the call that follows. Most teams use it as the first responder and keep people for the conversations that matter.",
    },
    {
      q: "Can I add an AI chat assistant to my existing website?",
      a: "Yes. It is a widget that drops into any site, including Brivity, kvCORE, WordPress, Squarespace, and a custom build. It does not require rebuilding your website, and it connects to whatever CRM you already run.",
    },
    {
      q: "What does it do with the leads it captures?",
      a: "It writes them to your CRM with the full transcript, the phone number, the price band, the area, and the timeline the person gave. The follow-up starts from what they actually said, which is why the callback converts better than a callback off a blank contact form.",
    },
  ],

  relatedPosts: ["ai-chat-assistant-real-estate-website", "workflow-automation-real-estate-business"],
};
