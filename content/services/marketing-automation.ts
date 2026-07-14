import type { Service } from "./types";

/** COPY key `marketing` on realtylt.com/ai. Deep link: /ai#marketing */
export const marketingAutomation: Service = {
  slug: "marketing-automation",
  aiKey: "marketing",
  name: "Marketing Automation",
  tier: "core",

  eyebrow: "Marketing · Multi-channel Automation",
  title: "Campaigns that run themselves",
  lede: "Email and SMS drip, social posting, listing promotion, retargeting, and nurture sequences, all triggered by what each lead actually does. Behavior fires the next touch, so the right message lands at the right moment without you lifting a finger.",
  specs: ["email + SMS drip", "social + listing promotion", "behavior-triggered", "retargeting + nurture"],
  why: "Most leads aren't ready today. They're ready in six months, and they buy from whoever stayed top of mind. Behavior-triggered nurture keeps you present across every channel.",
  keywords: [
    "real estate marketing automation",
    "automated email drip real estate",
    "real estate sms marketing",
    "lead nurturing automation real estate",
    "social media automation for realtors",
  ],

  seo: {
    title: "Real Estate Marketing Automation: Email, SMS, and Nurture",
    description:
      "Behavior-triggered email and SMS campaigns, social posting, listing promotion, and retargeting. The next touch fires from what the lead actually did, not from a calendar.",
  },

  figure: {
    kind: "flow",
    caption: "One buyer, six months, no manual sends",
    trigger: "She saves a listing in Beacon",
    nodes: [
      { label: "Same day", note: "Three similar listings by SMS. She opens two of them." },
      { label: "Week 2", note: "She viewed the same street twice. A Beacon market note goes out." },
      { label: "Month 3", note: "She has gone quiet. Cadence drops to monthly rather than stopping." },
      { label: "Month 6", note: "She opens two listings in a week. You get told to call her today." },
    ],
    footnote: "The sequence responds to behavior. A lead who goes quiet is nurtured, not hammered.",
  },

  whatItIs: [
    "It is marketing that reacts. Instead of a calendar that sends the same email to everyone on day three, the sequence watches what each lead actually does: what they opened, which listings they viewed, which street they keep coming back to, and it fires the next touch off that.",
    "It runs across the channels that reach people: email, SMS, social posting, listing promotion, and retargeting, all from one behavior signal rather than four disconnected tools. The lead who is heating up gets more contact. The lead who is six months out gets kept warm without being burned out.",
  ],

  howItWorks: [
    {
      title: "Behavior becomes the trigger",
      body: "Saving a listing, opening a text, viewing the same area three times, or going quiet for a month all mean something different, and each one starts a different sequence.",
    },
    {
      title: "The message matches the moment",
      body: "Someone who just saved a listing gets similar ones today. Someone who has not engaged in weeks gets a market note, not a fifth showing request. Relevance is what stops the unsubscribe.",
    },
    {
      title: "You get told when to step in",
      body: "The system nurtures, but it does not pretend to close. When a lead's behavior says they are ready now, it surfaces them and tells you to call.",
    },
  ],

  useCases: [
    {
      title: "The six-month buyer",
      body: "Most leads are not ready today. Nurture keeps you present for the whole wait, so when they are ready, you are the agent they have been hearing from all year.",
    },
    {
      title: "New listing, right audience",
      body: "A listing goes live and the people whose saved criteria it matches hear about it first, by text, before it appears on a portal.",
    },
    {
      title: "The lead who went quiet",
      body: "Silence gets a change of cadence and a change of message, rather than the same drip email arriving for the ninth time.",
    },
  ],

  faqs: [
    {
      q: "What is real estate marketing automation?",
      a: "It is software that sends the right message to a lead based on what they did rather than on a fixed schedule. Saving a listing, opening a text, or going quiet each trigger a different next step across email, SMS, and social, so the follow-up stays relevant without anyone sending it by hand.",
    },
    {
      q: "How is this different from a normal drip campaign?",
      a: "A drip campaign sends email three on day seven no matter who you are. Behavior-triggered nurture watches what the lead actually does and changes the message and the cadence accordingly, which is why it keeps working past the second email.",
    },
    {
      q: "Will automated marketing annoy my leads?",
      a: "It annoys them when it is irrelevant, which is exactly what behavior triggers fix. A lead who goes quiet gets less contact and different content, not more of the same. The opt-out is always honored, and cadence backs off automatically.",
    },
    {
      q: "Can it text leads, not just email them?",
      a: "Yes. SMS is part of the same sequence, and it is usually the channel that gets opened. Texts are sent under the same consent rules as any other outbound message, with opt-outs honored automatically.",
    },
  ],

  relatedPosts: ["workflow-automation-real-estate-business"],
};
