import type { Service } from "./types";

/** COPY key `reviews` on realtylt.com/ai. Deep link: /ai#reviews
 *
 * THE MECHANIC ON THIS PAGE WAS REWRITTEN 2026-08-25 (SERVICES-CRITIQUE.md §1), and the
 * rewrite is not a wording change. The page used to describe review gating in three places
 * while its own FAQ defined gating as the thing you must not do and claimed "This asks
 * everyone." Everyone got the survey; only the fives got the review link, and the link is
 * what the rule is about.
 *
 * Google's contribution policy (support.google.com/contributionpolicy/answer/7400114) lists
 * under "We do not allow merchants to": "Discourage or prohibit negative reviews, or
 * selectively solicit positive reviews from customers." That sentence described the product
 * this page was selling.
 *
 * So the mechanic here is now: EVERYONE gets the same Google link, whatever they scored. A
 * low score ALSO opens a private line to the owner, as well as the link and never instead of
 * it. That is the version that is compliant and, on this page's own argument, the better
 * product: a business with nothing but fives reads as filtered, and a four answered well
 * reads as real.
 *
 * The website embed is described as "a selection of recent reviews" for a second, federal
 * reason: 16 CFR 465.7(b) (89 FR 68077, 22 August 2024) turns on MISREPRESENTING that a
 * review block represents most or all reviews submitted while suppressing by rating. A
 * labelled selection is a different thing from a reviews section that implies it is the whole
 * set, so the label is load-bearing and the words "your best feedback" are gone. */
export const reviewAutomation: Service = {
  slug: "review-automation",
  aiKey: "reviews",
  name: "Review Automation",
  tier: "core",

  eyebrow: "Reputation · Reviews on autopilot",
  title: "More 5-star reviews, without the awkward ask",
  lede: "The moment a job wraps, the AI texts the customer and walks them one tap to your Google review page. No chasing, no forgetting. Everyone gets the same link, whatever they scored, because asking only the people you expect to be kind is review gating and Google's policy rules it out. A low score gets the link and a private message from you as well, so you hear about a problem the day it happens instead of reading it later.",
  specs: ["auto-request at job end", "one-tap Google reviews", "the same link for everyone", "a low score reaches you too"],
  why: "73% of customers read reviews before they book, and the business with the most recent reviews wins the call. This asks every customer at the moment the work is fresh in their mind, which is the only moment the ask actually works.",
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
      "Every customer is asked at the right moment, one tap from your Google review page. The same link for everyone, and a low score reaches you privately as well.",
  },

  stat: {
    value: "73%",
    label: "of customers read reviews before they book",
  },

  figure: {
    kind: "transcript",
    caption: "A four gets the link too, and a call the same day",
    turns: [
      { who: "ai", text: "Hi Marcus, glad the closing went through today. Quick one: how did we do, one to five?" },
      { who: "visitor", text: "4. everything was fine, the lender just took forever to send the clear to close" },
      { who: "ai", text: "That is worth knowing, thank you. I have sent the lender point straight to Levan and he will call you today. Here is the Google link too, if you want to say that in your own words: [link]" },
      { who: "visitor", text: "will do" },
    ],
    footnote: "Every customer gets this link, whatever they scored. What a low score adds is the private message to the owner, sent the same minute.",
  },

  whatItIs: [
    "It is the review request that never gets sent. Every business knows it should ask, almost nobody asks consistently, and the ones who do ask late, when the customer has moved on and the enthusiasm has cooled.",
    "The AI texts the customer at the moment the job wraps, which is the only moment the ask actually works, and takes them one tap to your Google review page. Every customer gets that link, including the ones who were not thrilled, because only asking the people you expect to be kind is review gating, and Google's policy names selectively soliciting positive reviews as something merchants may not do.",
    "What the score changes is what happens on your side. A low answer opens a private message to you at the same time as the link goes out, so the thing that went wrong reaches you the day it happened, while it is still something you can put right. That is a better outcome than a suppressed review, and it is also the only version of this that is allowed.",
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
      title: "Everyone gets the same link",
      body: "The review page goes to every customer, whatever they scored. Only asking the ones you expect to be kind is review gating, and Google's contribution policy lists selectively soliciting positive reviews as a thing merchants may not do.",
    },
    {
      title: "A rough score also reaches you, privately, at once",
      body: "As well as the link, not instead of it. A low answer pings you with what they said and who said it, the same minute, so you get to make the call before the week is out rather than finding out from the review.",
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
      title: "The four you answered the same day",
      body: "A four with a straight reply under it reads more honestly than a wall of fives, and the customer who got a call about it often comes back and edits it themselves. What changes is that you heard about it on the day.",
    },
    {
      title: "A profile that does not look managed",
      body: "Asking everyone produces a mix, and a mix is what a real business looks like. Prospects read the low reviews and the replies to them first, which is the part a filtered profile cannot give you.",
    },
  ],

  faqs: [
    {
      q: "How do I get more Google reviews?",
      a: "Ask every customer, by text, at the moment the job finishes, and make it one tap to the review page. The reason most businesses have few reviews is not that customers are unwilling, it is that the ask is inconsistent and late. Around 73% of customers read reviews before they book, so recency and volume both compound.",
    },
    {
      q: "Is it against Google's policy to automate review requests?",
      a: "Asking every customer for an honest review is fine, and automating the timing of that ask does not change it. What is not allowed is incentivising reviews, or only asking the people you expect to leave a good one. Google's contribution policy lists, under what merchants may not do, discouraging or prohibiting negative reviews or selectively soliciting positive ones. So this sends the same link to everyone, whatever they scored, and the score decides what reaches you privately rather than who gets asked.",
    },
    {
      q: "What is review gating?",
      a: "Review gating is surveying customers first and only sending the public review link to the ones who answered well. It is common, it is usually sold as catching problems early, and it is the specific practice Google's policy rules out. Screening feedback so you can fix things is fine. Screening who is allowed to review you is not, and the difference is whether the unhappy customer still gets the link.",
    },
    {
      q: "What happens when someone is unhappy?",
      a: "You get told immediately, with their score and what they wrote, and they get the review link like everybody else. The private message is what buys you the chance to make it right the same day. Doing that well is worth more than a suppressed review, and a four with your answer under it is more persuasive to the next prospect than a page of fives.",
    },
    {
      q: "Can my Google reviews go on my own website?",
      a: "Yes. Recent reviews can be pulled through to your site automatically, shown and labelled as a selection of recent reviews rather than as the whole set. That wording matters: the FTC's rule on consumer reviews, 16 CFR 465.7, is about misrepresenting a review block as representing most or all of what customers submitted while quietly holding back the low ones. A labelled selection is honest. A reviews section that implies it is everything is not.",
    },
  ],

  relatedPosts: ["workflow-automation-real-estate-business"],
};
