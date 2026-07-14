import type { Service } from "./types";

/** COPY key `qualify` on realtylt.com/ai. Deep link: /ai#qualify */
export const leadQualification: Service = {
  slug: "lead-qualification",
  aiKey: "qualify",
  name: "Lead Qualification",
  tier: "more",

  eyebrow: "Qualification · Score + Route",
  title: "The hot leads reach you first",
  lede: "Every inbound lead is scored on intent, budget, and timeline from what they actually say and do, then routed to the right agent or nurture track. Claude reads the conversation, ranks the pipeline, and surfaces who to call now.",
  specs: ["intent + budget + timeline scoring", "Claude-read conversations", "auto-routing", "live pipeline ranking"],
  why: "Treating every lead the same wastes your best hours on tire-kickers. Automatic qualification puts the ready-to-move sellers and buyers at the top, before a competitor calls them.",
  keywords: [
    "ai lead qualification real estate",
    "lead scoring automation realtor",
    "real estate lead routing",
    "automated lead prioritization",
    "qualify real estate leads with ai",
  ],

  seo: {
    title: "AI Lead Qualification and Scoring for Real Estate",
    description:
      "Every inbound lead scored on intent, budget, and timeline from what they actually said, then routed to the right agent or nurture track, with the ready-to-move ones surfaced first.",
  },

  figure: {
    kind: "records",
    caption: "The same three leads, before and after they are read",
    headers: { before: "What the form said", after: "What the conversation said" },
    rows: [
      {
        before: "D. Okafor, buyer inquiry",
        after: ["Pre-approved", "Under contract to sell", "Wants to see it this week"],
        tag: "call now",
      },
      {
        before: "T. Reyes, buyer inquiry",
        after: ["No pre-approval yet", "Lease ends in Sept", "Just started looking"],
        tag: "nurture",
      },
      {
        before: "M. Lund, home value request",
        after: ["Relocating for work", "Needs to sell by spring", "Has not listed yet"],
        tag: "call now",
      },
    ],
    footnote: "All three look identical in the CRM. Two of them are worth your morning.",
  },

  whatItIs: [
    "It is the difference between a list of leads and a ranked pipeline. Every inbound lead looks the same on a form. What separates them is what they say next, and that is where the intent, the budget, and the timeline actually live.",
    "Claude reads the conversation, the chat, or the call transcript, scores the lead on those three things, and routes it: to you if it is hot, to a nurture track if it is not. The list you look at in the morning is ordered by who is worth calling.",
  ],

  howItWorks: [
    {
      title: "It reads what they actually said",
      body: "Not the checkbox they ticked. The chat, the call, and the behavior together say far more about readiness than any form field.",
    },
    {
      title: "It scores on the three things that matter",
      body: "Intent, budget, and timeline. A pre-approved buyer with a house under contract and a lease running out is not the same lead as someone browsing, and should not sit next to them.",
    },
    {
      title: "It routes and it ranks",
      body: "Hot goes to a person, immediately. Everything else goes to the nurture track that suits it, and the pipeline stays ordered by who to call now.",
    },
  ],

  useCases: [
    {
      title: "The morning call list that is actually ordered",
      body: "You spend your best hours on the leads most likely to transact rather than working down the list in the order they arrived.",
    },
    {
      title: "The hot lead that did not look hot",
      body: "A home-value request from someone relocating on a deadline reads as routine on a form and as urgent in the conversation.",
    },
    {
      title: "The right agent on the right lead",
      body: "Routing by area, price band, or specialty, automatically, instead of by whoever happened to grab it.",
    },
  ],

  faqs: [
    {
      q: "How does AI qualify a real estate lead?",
      a: "It reads the actual conversation rather than the form, and scores the lead on intent, budget, and timeline: whether they are pre-approved, whether they have a house to sell, and when they need to move. Those three things predict who transacts, and none of them appear on a contact form.",
    },
    {
      q: "What is lead scoring?",
      a: "It is ranking leads by how likely they are to transact soon, so your time goes to the ones that are ready. Without it, every lead in the CRM looks identical and the ordering of your day is effectively random.",
    },
    {
      q: "Does a low score mean the lead is dropped?",
      a: "No. It means the lead goes to a nurture track instead of your call list. Most leads are not ready today and are ready in six months, and the point of scoring is to stop those two groups getting the same treatment.",
    },
  ],
};
