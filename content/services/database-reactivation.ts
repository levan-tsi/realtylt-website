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
      "AI works your dormant CRM by text and by phone, holds real conversations with old leads, finds the ones ready to move now, and books them in.",
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
    "The reason nobody does it by hand is that the work is genuinely awful. Three hundred conversations to find four people whose circumstances changed, most of them going to voicemail, and the reward for doing it properly is getting to do it again next quarter. Human follow-up also dies at the second attempt, because a third starts to feel like pestering, and the person who did not pick up at two on a Tuesday was driving rather than deciding.",
  ],

  howItWorks: [
    {
      title: "It works out what you are allowed to send",
      body: "Before a single message: what date and source each record carries, what the consent behind it actually covers, and what your CRM does with the word stop. That check decides the size of the campaign, and it is the half of this that gets skipped.",
    },
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
    {
      title: "The list you can actually send to",
      body: "The first thing this produces is not a campaign, it is a number: how many of those contacts you are still permitted to text or call. Most people have never had that number, and it changes what the rest of this is worth.",
    },
    {
      title: "The no with a reason attached",
      body: "A no is not a wasted message. A no with a reason is the most useful thing the whole exercise produces, because it tells you which part of your list is genuinely dead and which part is only early.",
    },
  ],

  /** Lifted from this service's own flagship post, "What it does not do, and should not pretend
   * to" (content/blog/ai-posts.ts). The "not a subscription" entry is the one worth keeping
   * whatever else changes: it is the sentence a competitor selling this will not say. */
  limits: [
    "It does not manufacture intent. Most of that list will say no again, because most of them meant it. What changes is that somebody finally asked, and the few whose situation moved get found in the week it moved.",
    "It does not fix a list with no consent behind it. If the records carry no date and no source, the honest first project is a cleanup, not a campaign.",
    "It is not a subscription. A database is finite: you work it once, and the same list is a year away from being worth working again. Reactivation is a harvest, not a lead source.",
    "It does not replace calling the people who actually matter. Your past clients, and anybody whose relationship is the real asset, are your calls. A machine reintroducing itself to them is worse than no contact at all.",
    "It does not close. It finds the conversation. Everything after somebody says yes to a Thursday is the reason you have a job.",
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
      q: "Am I allowed to text leads from 2023?",
      a: "It depends on what the record says, and the rules have dates in them. The established business relationship that exempts you from the national do-not-call registry runs eighteen months from a purchase or transaction and three months from an inquiry, under 47 CFR 64.1200(f)(5), so a 2023 form fill ran out of both a long time ago. An automated text is a separate and stricter question: the same regulation requires prior express written consent before an autodialer or artificial voice reaches a mobile number, and a checkbox saying you agree to be contacted is usually not that. And an opt-out has to be honored within ten business days, in whatever words the person used. All three are answerable from your own records in an afternoon, and a vendor who cannot tell you how a campaign handles them is not ready to send it. None of this is legal advice.",
    },
    {
      q: "How does it decide who is worth calling?",
      a: "It reads intent from what the person actually says: whether the move is still on, whether the timeline moved, whether they now have a house to sell. Everyone gets an attempt. Only the ones showing real intent reach your calendar.",
    },
  ],

  /** Own flagship FIRST. This page had a 3,400-word researched post with the consent rules in
   * it sitting behind it and linked to two siblings instead. Two cards, because RelatedPosts is
   * a two-column grid and an odd count leaves a visible empty cell. */
  relatedPosts: [
    "database-reactivation-old-real-estate-leads",
    "ai-voice-agent-missed-calls-real-estate",
  ],
};
