import type { Service } from "./types";

/** COPY key `reactivation` on realtylt.com/ai. Deep link: /ai#reactivation
 *
 * The old line "The average database holds tens of thousands in unworked commission" was an
 * unsourced dollar claim about a database nobody has measured; its own flagship post refuses to
 * make it. Killed 2026-08-25, Round B. Do not bring a dollar or rate claim back.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a heating company's past customers,
 * an accounting office's former clients, a salon or gym's lapsed members, a real estate office's
 * old leads as ONE example). The consent check stays the first step and now says who makes the
 * call when the consent does not cover an AI voice: a person. Re-read 2026-11-11 against the eCFR
 * copy saved in realtylt-agents company/agents/seo/runs/r28-services/sources/voice/:
 * 47 CFR 64.1200(f)(5) (eighteen months from a purchase, three months from an inquiry),
 * 64.1200(a)(2) (prior express written consent for a telemarketing call or text with an autodialer
 * or an artificial voice), and the ten-business-day limit on honoring a revocation. */
export const databaseReactivation: Service = {
  slug: "database-reactivation",
  aiKey: "reactivation",
  name: "Database Reactivation",
  tier: "core",

  eyebrow: "Revive · Past customers and old leads",
  title: "Win back past customers from the list already in the CRM",
  lede: "There are hundreds of past customers and old inquiries in the CRM, and nobody has asked any of them anything since the day they came in. We set up an AI that works that list by text, and by phone where the consent allows, with an opener about what each person actually bought or asked for. It finds who is ready now and books them on the calendar. The cheapest list a business owns is the one it forgot.",
  specs: ["consent checked first", "a real question, not a blast", "finds who is ready now", "books to your calendar"],
  why: "Every name on that list was paid for once, in advertising or in work done, and nobody has asked them anything since. Reactivation works the customers and leads the business already has instead of buying new ones, so the main cost is the asking. What that is worth depends on the business's own list, not on an average of somebody else's.",
  keywords: [
    "database reactivation",
    "how to win back past customers",
    "re-engage old leads",
    "crm lead reactivation",
    "database reactivation real estate",
  ],

  seo: {
    title: "Database reactivation: win back past customers and old leads",
    description:
      "AI database reactivation for a small business: past customers and old leads worked by text and, with consent, by phone, the ready ones found and booked in.",
  },

  figure: {
    kind: "transcript",
    caption: "A past customer, worked by text this morning",
    turns: [
      { who: "ai", text: "Hi Dana, this is the assistant at the heating company that serviced your furnace last November. Are you due for this year's check, or has that been taken care of?" },
      { who: "visitor", text: "oh right, we never booked it this year" },
      { who: "ai", text: "Happy to help with that. Same address on Maple Street? There is Tuesday at 10:00am or Thursday at 2:00pm." },
      { who: "visitor", text: "thursday" },
      { who: "ai", text: "Booked for Thursday at 2:00pm, and a technician will confirm the day before. Reply STOP any time and we will not text again." },
    ],
    footnote: "An invented example, sent to a past customer who agreed to texts. Working that list again costs the asking rather than the finding.",
  },

  whatItIs: [
    "It is an AI that works the people already sitting in the CRM: past customers due for the next visit, the inquiries from two years ago, the people who said not right now, the ones nobody has called since the day they came in. It texts, and calls where the consent allows, with a real, conversational opener. It listens to what comes back and finds the ones whose circumstances have changed.",
    "The economics are the point. Those names were already paid for, in advertising or in work done. Reactivation does not buy new traffic. It works a list the business already owns, which makes the appointments it books cheap compared with every other source in the budget.",
    "The reason nobody does it by hand is that the work is genuinely awful. Hundreds of conversations to find the handful of people whose circumstances changed, most of them going to voicemail, and the reward for doing it properly is doing it again next quarter. Human follow-up also dies at the second attempt, because a third starts to feel like pestering, and the person who did not pick up at two on a Tuesday was driving rather than deciding.",
    "It fits any business with a list older than its memory: a heating, plumbing or landscaping company whose past customers are due again, an accounting office whose former clients may need help this year, a salon, spa or gym with lapsed members, a real estate office with buyer and seller inquiries from years ago. We do not run it for a health practice: a list of patients is not one we work.",
  ],

  howItWorks: [
    {
      title: "It works out what the business is allowed to send",
      body: "Before a single message, three things get checked. What date and source each record carries. What the consent behind it actually covers, and whether it covers texts or an AI voice at all. And what the CRM does with the word stop. That check decides the size of the campaign, and it is the half of this that gets skipped.",
    },
    {
      title: "We write the openers with the owner",
      body: "Old contacts are grouped by what they bought or asked about and how long ago they went quiet, so each opener is relevant rather than generic. The owner approves every opener before it goes out, and the list it goes to.",
    },
    {
      title: "It goes through the list nobody has time for",
      body: "Every permitted contact gets one genuine attempt, not a blast, at a sensible hour where they live. Where the consent covers a text but not an AI call, a person makes any call.",
    },
    {
      title: "It holds a real conversation",
      body: "It asks whether the need is still there, what changed and when, and it follows the answer rather than reading a script over it. A STOP, or anything that reads like one, ends every message to that number.",
    },
    {
      title: "It finds intent and books the ones who are ready",
      body: "Most will still say no, and that is fine. The handful whose situation changed get booked into the calendar and handed to a person with the context of what they just said.",
    },
  ],

  handoff: {
    provides: [
      "The CRM or the customer list, with the date and source of each record where it exists.",
      "What the business's forms and invoices said about texts and calls, so the consent can be read.",
      "What past customers bought or asked about, so the opener is about them.",
      "The calendar, with the times it may book.",
    ],
    approves: [
      "The list it may contact, after the consent check, before the first message.",
      "Every opener and every follow-up, word for word.",
      "Who is left out: past clients whose relationship is the business's own to keep.",
      "Every booking that needs a price or an offer, which a person makes.",
    ],
  },

  useCases: [
    {
      title: "Past customers due for the next visit",
      body: "A heating company's tune-ups, a landscaper's spring cleanups, a pest company's season: the customers who booked last year are the easiest to book this year, if somebody asks. Reactivation asks all of them, once, at the right time of year.",
    },
    {
      title: "The CRM nobody has opened in a year",
      body: "Thousands of contacts, all paid for, none worked. Reactivation goes through every one it is allowed to contact and returns the ones worth a person's time.",
    },
    {
      title: "The 'not right now' from 2023",
      body: "Not right now had a timeline attached to it, and that timeline has passed. An accounting office's prospect who said next year, a gym member who paused for the summer, a buyer who shelved a move: the ones who meant it are ready now, and nobody called them.",
    },
    {
      title: "A slow month with no new spend",
      body: "When new inquiries dry up, the cheapest list is the one the business already owns. Reactivation works it without adding a dollar of advertising.",
    },
    {
      title: "The list the business can actually send to",
      body: "The first thing this produces is not a campaign. It is a number: how many of those contacts the business is still permitted to text or call. Most owners have never had that number, and it changes what the rest of this is worth.",
    },
    {
      title: "The no with a reason attached",
      body: "A no is not a wasted message. A no with a reason is the most useful thing the whole exercise produces, because it says which part of the list is genuinely done and which part is only early.",
    },
  ],

  /** Lifted from this service's own flagship post, "What it does not do, and should not pretend
   * to" (content/blog/ai-posts.ts). The "not a subscription" entry is the one worth keeping
   * whatever else changes: it is the sentence a competitor selling this will not say. */
  limits: [
    "It does not manufacture intent. Most of that list will say no again, because most of them meant it. What changes is that somebody finally asked, and the few whose situation moved get found in the week it moved.",
    "It does not fix a list with no consent behind it. If the records carry no date and no source, the honest first project is a cleanup, not a campaign.",
    "It is not a subscription. A list is finite: it is worked once, and the same list is a year away from being worth working again. Reactivation is a harvest, not a lead source.",
    "It is not the relationship. Long-time clients, and anybody whose relationship is the real asset, get a call from a person. A machine reintroducing itself to them is worse than no contact at all.",
    "It does not close. It finds the conversation. Everything after somebody says yes to a Thursday is the work the people in the business do best.",
    "It does not call with an AI voice anyone whose consent does not cover it. Where the consent covers a text but not an AI call, any call is made by a person.",
  ],

  faqs: [
    {
      q: "What is database reactivation?",
      a: "It is the practice of systematically re-contacting the past customers and old leads already in the CRM to find the ones whose situation has changed. Because those contacts were already paid for, in advertising or in work done, the appointments it produces cost little compared with finding new customers.",
    },
    {
      q: "How do I win back past customers?",
      a: "Ask them, once, about something they actually bought or asked about, at the time of year it matters, and make it easy to say yes or no. A tune-up reminder to last year's furnace customers works; a generic newsletter to everyone does not ask anything. Read the consent first, honor every stop, and leave the long-time clients to a person.",
    },
    {
      q: "Do old leads actually convert?",
      a: "Some of them do, and that is the whole business case. A lead who said not right now two years ago was giving a timeline, and that timeline has since passed. The job is finding the small share whose circumstances changed. That is exactly the kind of patient, repetitive work AI does well and people do not have time for.",
    },
    {
      q: "Is it annoying to text people who went quiet years ago?",
      a: "Not if the opener is honest and relevant, which is what separates this from a blast. It refers to what they originally bought or asked about, it asks a real question, and it takes no for an answer the first time. Opt-outs are honored immediately.",
    },
    {
      q: "Am I allowed to text leads from 2023?",
      a: "It depends on what the record says, and the rules have dates in them. The established business relationship that exempts a business from the national do-not-call registry runs eighteen months from a purchase or transaction, and three months from an inquiry, under 47 CFR 64.1200(f)(5). So a 2023 form fill ran out of both a long time ago. An automated text is a separate and stricter question: the same regulation requires prior express written consent before a telemarketing call or text made with an autodialer or an artificial voice reaches a mobile number, and a checkbox saying you agree to be contacted is usually not that. And a request to stop has to be honored within ten business days, in any reasonable words. All three are answerable from the business's own records in an afternoon, and a vendor who cannot say how a campaign handles them is not ready to send it. None of this is legal advice.",
    },
    {
      q: "How does it decide who is worth calling?",
      a: "It reads intent from what the person actually says: whether the need is still there, whether the timing moved, whether something changed. Everyone permitted gets one attempt. Only the ones showing real intent reach the calendar, and a person takes it from there.",
    },
  ],

  /** Own post FIRST. Two cards, because RelatedPosts is a two-column grid and an odd count leaves
   * a visible empty cell. */
  relatedPosts: [
    "database-reactivation-old-real-estate-leads",
    "ai-voice-agent-missed-calls-real-estate",
  ],
};
