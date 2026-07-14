import type { Service } from "./types";

/** COPY key `reactivation` on realtylt.com/ai. Deep link: /ai#reactivation */
export const databaseReactivation: Service = {
  slug: "database-reactivation",
  aiKey: "reactivation",
  name: "Database Reactivation",
  tier: "core",

  eyebrow: "Revive · Cold Database",
  title: "Wake the leads you already paid for",
  lede: "AI works your dormant CRM, texting and calling old leads with relevant, conversational outreach, surfacing who's ready to move now and booking them straight to your calendar. The cheapest pipeline you own is the one you forgot.",
  specs: ["CRM reactivation", "AI text + call", "intent detection", "books to calendar"],
  why: "The average database holds tens of thousands in unworked commission. Reactivation turns leads you already paid to acquire into appointments, at near-zero new cost.",
  keywords: [
    "database reactivation real estate",
    "ai to re-engage old leads",
    "crm lead reactivation",
    "revive dead real estate leads",
    "real estate cold lead follow up",
  ],

  seo: {
    title: "Database Reactivation: Wake Your Cold Real Estate Leads",
    description:
      "AI works your dormant CRM by text and by phone, holds real conversations with old leads, finds the ones ready to move now, and books them straight into your calendar.",
  },

  figure: {
    kind: "transcript",
    caption: "A lead from 2023, worked by text this morning",
    turns: [
      { who: "ai", text: "Hi Dana, it's Levan's office. You were looking around Wappingers back in 2023. Are you still thinking about a move, or did that get shelved?" },
      { who: "visitor", text: "shelved for a while but honestly we've been talking about it again" },
      { who: "ai", text: "That happens a lot. Same area, or has that changed? And is this a buy, a sell, or both?" },
      { who: "visitor", text: "both, we'd need to sell the house here first" },
      { who: "ai", text: "Then the first useful thing is knowing what yours is worth today. Levan has Thursday at 5:30 or Saturday morning. Which works?" },
    ],
    footnote: "You already paid to acquire this lead. Reactivation is the cheapest appointment you will book this month.",
  },

  whatItIs: [
    "It is an AI that works the leads already sitting in your CRM: the ones from two years ago, the ones who said not right now, the ones nobody has called since the day they came in. It texts and calls them with a real, conversational opener, listens to what comes back, and finds the ones whose circumstances have changed.",
    "The economics are the point. Those leads are already paid for. Reactivation does not buy new traffic, it converts inventory you own, which makes the appointments it books close to free compared with every other source in your budget.",
  ],

  howItWorks: [
    {
      title: "It goes through the database nobody has time for",
      body: "Every dormant contact gets a genuine attempt, not a blast. Old leads are segmented by what they originally wanted and how long ago they went quiet, so the opener is relevant rather than generic.",
    },
    {
      title: "It holds a real conversation",
      body: "By text and by phone. It asks whether the move is still on, what changed, and what the timeline looks like now, and it follows the answer rather than reading a script over it.",
    },
    {
      title: "It surfaces intent and books the ones who are ready",
      body: "Most will still say no, and that is fine. The handful whose life changed get booked into your calendar and handed to you with the context of what they just said.",
    },
  ],

  useCases: [
    {
      title: "The CRM nobody has opened in a year",
      body: "Thousands of contacts, all paid for, none worked. Reactivation goes through them all and returns the ones worth your time.",
    },
    {
      title: "The 'not right now' from 2023",
      body: "Not right now had a timeline attached to it, and that timeline has passed. The people who meant it are ready now, and nobody called them.",
    },
    {
      title: "A slow month with no new spend",
      body: "When lead flow dries up, the cheapest pipeline is the one you already own. Reactivation fills a calendar without adding a dollar of ad budget.",
    },
  ],

  faqs: [
    {
      q: "What is database reactivation?",
      a: "It is the practice of systematically re-contacting the old, cold leads already in your CRM to find the ones whose situation has changed. Because those contacts were already paid for, the appointments it produces cost almost nothing compared with buying new leads.",
    },
    {
      q: "Do old real estate leads actually convert?",
      a: "Some of them do, and that is the whole business case. A lead who said not right now two years ago was giving you a timeline, and that timeline has since passed. The job is finding the small percentage whose circumstances changed, which is exactly the kind of patient, repetitive work AI does well and people do not.",
    },
    {
      q: "Is it annoying to text people who went cold years ago?",
      a: "Not if the opener is honest and relevant, which is what separates this from a blast. It references what they originally asked about, it asks a real question, and it takes no for an answer the first time. Opt-outs are honored immediately.",
    },
    {
      q: "How does it decide who is worth calling?",
      a: "It reads intent from what the person actually says: whether the move is still on, whether the timeline moved, whether they now have a house to sell. Everyone gets an attempt. Only the ones showing real intent reach your calendar.",
    },
  ],
};
