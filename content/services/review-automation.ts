import type { Service } from "./types";

/** COPY key `reviews` on realtylt.com/ai. Deep link: /ai#reviews */
export const reviewAutomation: Service = {
  slug: "review-automation",
  aiKey: "reviews",
  name: "Review Automation",
  tier: "core",

  eyebrow: "Reputation · Reviews on autopilot",
  title: "More 5-star reviews, without the awkward ask",
  lede: "The moment a job wraps, the AI texts the happy customer and walks them one tap to your Google review page. No chasing, no forgetting. The best reviews land on your site automatically, and a rough one is caught privately first so you can make it right before it ever goes public.",
  specs: ["auto-request at job end", "one-tap Google reviews", "puts the best up front", "flags issues privately"],
  why: "73% of customers read reviews before they book, and the business with the most recent 5-stars wins the call. This asks every happy customer at the perfect moment, so your rating climbs on its own.",
  keywords: [
    "automated review requests",
    "get more google reviews",
    "review request automation",
    "online reputation management small business",
    "ask for reviews by text",
  ],

  seo: {
    title: "Automated Google Review Requests by Text",
    description:
      "Every happy customer gets asked at the right moment, one tap from your Google review page. The best reviews land on your site, and unhappy feedback is caught privately first.",
  },

  stat: {
    value: "73%",
    label: "of customers read reviews before they book",
  },

  figure: {
    kind: "transcript",
    caption: "The ask, sent at the only moment it works",
    turns: [
      { who: "ai", text: "Hi Marcus, glad the closing went smoothly today. Quick one: how did we do, one to five?" },
      { who: "visitor", text: "5, honestly the whole thing was painless" },
      { who: "ai", text: "That means a lot. Would you put that in a Google review? One tap, takes about thirty seconds: [link]" },
      { who: "visitor", text: "done" },
    ],
    footnote: "A four or below never sees this link. It routes to a private conversation so it can be fixed instead of published.",
  },

  whatItIs: [
    "It is the review request that never gets sent. Every business knows it should ask, almost nobody asks consistently, and the ones who do ask late, when the customer has moved on and the enthusiasm has cooled.",
    "The AI texts the customer at the moment the job wraps, which is the only moment the ask actually works, and takes them one tap to your Google review page. Happy customers land on Google. An unhappy one is caught privately first, so you get the chance to fix it before it becomes public.",
  ],

  howItWorks: [
    {
      title: "It asks the moment the job is done",
      body: "Not next week. Enthusiasm has a half-life, and the difference between asking today and asking on Friday is most of your reviews.",
    },
    {
      title: "One tap, no friction",
      body: "A text with a direct link to your Google review page. Every extra step between the ask and the review costs you a share of the people willing to leave one.",
    },
    {
      title: "The rough ones are caught privately",
      body: "A low score routes to a private conversation with you instead of a public review link, so a bad experience becomes something you can put right.",
    },
  ],

  useCases: [
    {
      title: "The rating that climbs on its own",
      body: "Asking every happy customer, every time, at the right moment, is a simple idea that fails purely on consistency. Automating it removes the only failure mode.",
    },
    {
      title: "Recency, which is what people actually read",
      body: "A steady flow of recent reviews reads as a business that is busy right now, which is the thing a prospect is silently checking for.",
    },
    {
      title: "The bad review that never happened",
      body: "Catching a four-out-of-five privately turns a public complaint into a fixed problem and, often, into a five afterwards.",
    },
  ],

  faqs: [
    {
      q: "How do I get more Google reviews?",
      a: "Ask every happy customer, by text, at the moment the job finishes, and make it one tap to the review page. The reason most businesses have few reviews is not that customers are unwilling, it is that the ask is inconsistent and late. Around 73% of customers read reviews before they book, so recency and volume both compound.",
    },
    {
      q: "Is it against Google's policy to automate review requests?",
      a: "Asking every customer for an honest review is fine. What is not allowed is incentivising reviews, or only asking the people you expect to leave a good one, which is called review gating. This asks everyone. What it does with the answer is route unhappy feedback to a private conversation, which is about fixing the problem, not about hiding it.",
    },
    {
      q: "What happens when someone is unhappy?",
      a: "They get a private conversation with you rather than a public review link, and you get told immediately. That is a chance to make it right, which is worth more than a review either way.",
    },
    {
      q: "Can the best reviews go on my own website?",
      a: "Yes. Reviews can be pulled through to your site automatically so your best recent feedback appears where prospects are already looking.",
    },
  ],
};
