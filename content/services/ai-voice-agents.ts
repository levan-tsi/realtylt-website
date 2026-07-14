import type { Service } from "./types";

/** COPY key `voice` on realtylt.com/ai. Deep link: /ai#voice */
export const aiVoiceAgents: Service = {
  slug: "ai-voice-agents",
  aiKey: "voice",
  name: "AI Voice Agents",
  tier: "flagship",

  eyebrow: "Voice · Inbound + Outbound",
  title: "AI that answers the calls, and makes them",
  lede: "Vapi voice agents pick up every inbound call 24/7 and dial leads back to qualify them, holding natural conversations at sub-second latency, then logging the outcome and booking the next step.",
  specs: ["Vapi", "sub-second latency", "inbound + outbound", "auto follow-up"],
  why: "A missed call is a lost commission. AI that answers instantly and calls leads back in seconds turns dead inquiries into booked appointments, without hiring an ISA.",
  keywords: [
    "ai voice agent for real estate",
    "ai phone agent real estate",
    "real estate ai cold calling",
    "automated lead follow up calls",
    "real estate isa replacement",
  ],

  seo: {
    title: "AI Voice Agents for Real Estate: Inbound and Outbound Calls",
    description:
      "AI phone agents that answer every inbound call 24/7 and call new leads back within seconds, qualify them in a natural conversation, book the appointment, and log the outcome.",
  },

  figure: {
    kind: "timeline",
    caption: "One inbound call, end to end",
    events: [
      { at: "0.0s", label: "The phone rings", note: "9:42pm. A buyer who just saw a listing on your site." },
      { at: "0.4s", label: "The agent picks up", note: "Sub-second first word. No hold music, no voicemail." },
      { at: "0:38", label: "Question answered", note: "Beds, taxes, and what the seller will look at." },
      { at: "1:26", label: "Qualified", note: "Price band, area, timeline, financing, all captured." },
      { at: "2:11", label: "Appointment booked", note: "Saturday 11:00am, straight into your calendar." },
      { at: "2:12", label: "Logged", note: "Transcript, outcome, and next step written to the CRM." },
    ],
    footnote: "The same agent runs the call in reverse: a new lead comes in, it dials them back before they cool off.",
  },

  whatItIs: [
    "It is a voice on the phone, running on Vapi, that can hold a real conversation. It answers your inbound calls when you cannot, and it dials your new leads back before they move on to the next agent. It listens, it answers, it asks the questions that qualify a person, and it books the next step on your calendar.",
    "Sub-second latency is the reason it works. The gap between a person finishing their sentence and the agent starting its reply is short enough that the conversation feels like a conversation. Long pauses are what make people hang up on a phone bot, and the whole design goes after that one problem.",
    "It runs in both directions. Inbound, it is the receptionist who never misses a call at 9pm on a Sunday. Outbound, it is the follow-up caller who reaches a new lead in seconds rather than the industry-standard hours, and keeps calling the ones who do not answer the first time.",
  ],

  howItWorks: [
    {
      title: "Every call gets answered",
      body: "Inbound calls route to the voice agent whenever you are unavailable, or always, depending on how you want it set up. It greets the caller, answers what it can from your listings and your knowledge base, and never sends someone to voicemail.",
    },
    {
      title: "New leads get called back immediately",
      body: "The moment a lead comes in from your site, a portal, or a campaign, the agent dials them. Speed is the whole advantage: the person who reaches the lead first usually gets the appointment, and the agent is dialing while the lead is still on the page.",
    },
    {
      title: "It qualifies inside a normal conversation",
      body: "Budget, area, timeline, whether they are pre-approved, and whether they have a house to sell all come out naturally. It is not reading a script at them. It is asking the questions you would ask, and following what they say.",
    },
    {
      title: "It books, then it writes it down",
      body: "Real availability from your calendar, offered on the call, confirmed on the call. Afterwards the transcript, the qualification, and the outcome go into your CRM, so the appointment you walk into is one you understand.",
    },
  ],

  useCases: [
    {
      title: "The Sunday evening call",
      body: "A buyer sees a listing on Sunday night and calls. You are at dinner. The agent answers, tells them what they want to know, and books a Tuesday showing. You find out about it from your calendar, not from a missed call.",
    },
    {
      title: "Speed to lead on new inquiries",
      body: "A portal lead arrives. The agent calls it back in seconds and qualifies it while your competitors are still waiting for the next batch of their morning call list. The appointment goes to whoever got there first.",
    },
    {
      title: "Working an old list without a caller",
      body: "You have a list of leads nobody has called in months. The agent works through it outbound, holds real conversations, finds the handful who are ready to move now, and puts them on your calendar.",
    },
    {
      title: "The ISA you did not hire",
      body: "An inside sales agent costs a salary, needs training, and works a shift. The voice agent runs every hour of every day at a fraction of that, and it never has a bad morning on the phones.",
    },
  ],

  faqs: [
    {
      q: "Can an AI voice agent replace an ISA?",
      a: "It replaces the mechanical part of the ISA role: answering every call, dialing every new lead within seconds, qualifying on budget, area, and timeline, and booking the appointment. It does not replace an experienced agent on a listing appointment. Most teams run the AI as the first contact and keep people for the conversations where judgment and relationship matter.",
    },
    {
      q: "Do callers know they are speaking to an AI?",
      a: "The agent identifies itself as an assistant. In practice, callers care far more that someone picked up at 9pm and answered their question than about who did. We do not build agents that pretend to be a specific human being.",
    },
    {
      q: "How fast does an AI phone agent respond during a call?",
      a: "Sub-second. The delay between the caller finishing a sentence and the agent starting its answer is short enough to feel like a normal conversation. That latency is the single thing that decides whether a phone AI sounds usable or unbearable, which is why the stack is built around it.",
    },
    {
      q: "Can it call leads back automatically?",
      a: "Yes, and that is where most of the value sits. A new lead from your website, a portal, or an ad triggers an outbound call within seconds. It can also retry on a schedule, so the lead that did not answer at 2pm gets a call at 6pm instead of being written off.",
    },
    {
      q: "What happens if the caller asks something the AI cannot answer?",
      a: "It says so plainly, and it books time with you rather than guessing. It will not invent a price, a legal position, or a fact about a property. Anything it cannot verify becomes a booked call, which is the honest and the higher-converting outcome.",
    },
    {
      q: "Does it work with my calendar and my CRM?",
      a: "Yes. It reads your live availability so it only ever offers slots you actually have, and it writes the call transcript, the qualification, and the outcome back into your CRM. It plugs into the systems you already run rather than adding another one.",
    },
    {
      q: "Is it legal to have an AI make outbound calls?",
      a: "The same rules that govern your own outbound calling apply: you need consent to call, you must honor do-not-call requests, and the agent identifies itself as an AI assistant. We configure it to respect calling windows and opt-outs, and it logs every call so the record is there.",
    },
  ],

  relatedPosts: ["ai-chat-assistant-real-estate-website", "workflow-automation-real-estate-business"],
};
