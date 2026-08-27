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
  why: "A missed call is a lost conversation, and the conversation is where every deal starts. AI that answers instantly and calls leads back in seconds turns dead inquiries into booked appointments, without hiring an ISA.",
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
      "AI phone agents that answer every call 24/7 and call new leads back in seconds, qualify them in a natural conversation, book the appointment, and log it.",
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
    // "rather than the industry-standard hours" was here until 2026-08-25 and had no industry
    // and no standard behind it. Replaced with the figure this repo has actually read in the
    // primary document, carrying its own caveat, the way the chat page carries the same study.
    "It runs in both directions. Inbound, it is the receptionist who never misses a call at 9pm on a Sunday. Outbound, it is the follow-up caller who reaches a new lead within seconds of the inquiry landing, and keeps calling the ones who do not answer the first time. For a sense of the gap that closes: when Harvard Business Review audited 2,241 US companies in 2011 by submitting an inquiry through each firm's own website, the companies that replied at all took an average of 42 hours. That is cross-industry work about web forms rather than phone calls, so read it as the shape of the problem and not as a real estate benchmark.",
  ],

  howItWorks: [
    {
      title: "Every call gets answered",
      body: "Inbound calls route to the voice agent whenever you are unavailable, or always, depending on how you want it set up. It greets the caller, answers what it can from your listings and your knowledge base, and never sends someone to voicemail.",
    },
    {
      title: "New leads get called back immediately",
      // ROUND 48: "the person who reaches the lead first usually gets the appointment" is the
      // claim round C removed from /services/ai-appointment-booking as "Most jobs go to whoever
      // books first". The audited research this page cites measures how much likelier a fast
      // contact is to reach a real conversation, not who wins the job. Retraction swept here.
      body: "The moment a lead comes in from your site, a portal, or a campaign, the agent dials them. Speed is the whole advantage, and the agent is dialing while the lead is still on the page rather than after they have moved on to the next name on their list.",
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
      body: "A portal lead arrives. The agent calls it back in seconds and qualifies it while your competitors are still waiting for the next batch of their morning call list. The conversation happens while the person is still thinking about it.",
    },
    {
      title: "Working an old list without a caller",
      body: "You have a list of leads nobody has called in months. The agent works through it outbound, holds real conversations, finds the handful who are ready to move now, and puts them on your calendar.",
    },
    {
      title: "Call this one, now",
      body: "You do not have to wait for a trigger. Point the agent at a single contact and tell it to call, and it dials on the spot with the same qualifying conversation and the same booking. Useful the moment somebody registers and you want them spoken to before they open the next tab.",
    },
    {
      title: "Telling a lot of people at once",
      body: "A price drop, an open house, a new listing that matches what a group of people told you they wanted. The agent works the whole list in parallel instead of one at a time, has a real conversation with whoever picks up, and books the ones who are interested. Consent and calling windows apply exactly as they would if you dialed the list yourself.",
    },
    {
      title: "The ISA you did not hire",
      // "at a fraction of that" was an unsourced cost comparison against a salary nobody here
      // has measured. Removed 2026-08-25; what is left is true and checkable.
      body: "An inside sales agent costs a salary, needs training, and works a shift. The voice agent runs every hour of every day, it does not need a rota, and it never has a bad morning on the phones. What it costs tracks how many calls it takes rather than how many people you employ.",
    },
  ],

  /** These were already the best writing on the services surface. They were just buried inside
   * three FAQ answers and a whatItIs paragraph, where a reader has to go looking for them and
   * an AI answer will not lift them. Promoted, plus the fourth one from this service's own
   * flagship post. SERVICES-CRITIQUE.md §4 named this page as the proof the section was worth
   * building: "That is the standard. It is just not a field, so nineteen pages do not have to
   * meet it." */
  limits: [
    "It does not close, and on the phone the reason is specific. Half of what a good agent hears in a first call is not in the words, and a transcript records none of it.",
    "It does not replace an experienced agent on a listing appointment. It replaces the mechanical part of the ISA role: picking up, qualifying on budget, area and timeline, and booking the next step.",
    "It will not invent a price, a legal position, or a fact about a property. Anything it cannot verify becomes a booked call, which is the honest outcome and the higher-converting one.",
    "It does not pretend to be a specific human being. The agent identifies itself as an assistant, and we do not build ones that do otherwise.",
    "It does not replace ringing back the people who matter. If the caller is a past client or your seller's neighbor, the agent's job is to hold the door open for twenty minutes, not to be the relationship.",
    /** ROUND I, SERVICES-CRITIQUE.md §5, raised 2026-08-03 and open through eight rounds: this
     * page said "it logs every call so the record is there" and never said whether the thing
     * logged is audio. It still does not say, because nobody here knows: it is OWNER-QUESTIONS
     * §1.3 and writing an answer would be inventing a product fact, which Round A's rule
     * forbids on exactly this example.
     *
     * What CAN be written is the rule the build has to satisfy whichever way the answer goes,
     * and that is what this entry and the FAQ below carry. It is a selling point under either
     * answer, which is the point SERVICES-CRITIQUE made: the page was silent about the thing
     * its own flagship post spends a paragraph on. */
    "It does not settle your recording policy, and that policy is decided by where the caller is sitting rather than where you are. New York is a one-party consent state and California is an all-party one, so a line that answers calls from out of state has to be set up for the stricter rule. Whether a particular build keeps the audio or only the transcript is part of that setup, and it is a decision to make on purpose.",
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
      q: "Do I need consent to record these calls?",
      a: "It is decided by the caller's state rather than yours. New York is a one-party state: the offense is Penal Law section 250.05, and the definition that governs a telephone call, at section 250.00, is the recording of a telephonic communication by a person who is not a sender or receiver of it, so a participant may record a call they are on. California is the other kind, and Penal Code section 632 makes it an offense to record a confidential communication without the consent of all parties. On an inbound call you rarely know where the caller is until they say, so the workable rule is to plan for the stricter one and to disclose at the start of the call rather than at the end. Whether a particular build keeps the audio or only the transcript is part of setting it up, and it is worth having in writing before the line goes live. None of this is legal advice, and the article on this service carries both statutes in full.",
    },
    {
      q: "Is it legal to have an AI make outbound calls?",
      a: "The same rules that govern your own outbound calling apply: you need consent to call, you must honor do-not-call requests, and the agent identifies itself as an AI assistant. We configure it to respect calling windows and opt-outs, and it logs every call so the record is there.",
    },
  ],

  /** Own flagship first, the way ai-chat-assistant does it: the deep dive on THIS service is
   * the most useful next click from this page, not a sibling topic. */
  relatedPosts: [
    "ai-voice-agent-missed-calls-real-estate",
    "ai-chat-assistant-real-estate-website",
    "ai-clone-real-estate-agent-video-avatar",
  ],
};
