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
  // THE 73% IS DEAD (Round B, 2026-08-25). "73% of customers read reviews before they book"
  // sat here, in `stat` and in an FAQ, with no source. It was hunted for: BrightLocal's Local
  // Consumer Review Survey is the only annually repeated primary survey of this behaviour, its
  // 2026 edition publishes its method (a representative panel of 1,002 US adult consumers via
  // SurveyMonkey), and 73 is not a figure in it. What is in it is 97% who read reviews for
  // local businesses at all, 41% who "always" do, and, most usefully for THIS page, 74% who
  // seek reviews written in the last three months. So the number here is now that one, quoted
  // as written, with the survey named beside it.
  why: "Reviews are read before they are ever mentioned, and the ones people read are the recent ones. This asks every customer at the moment the work is fresh in their mind, which is the only moment the ask actually works, and a steady trickle is worth more than a good year three years ago.",
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
    value: "74%",
    label: "of consumers look for reviews written in the last three months",
    source: {
      text: "BrightLocal, Local Consumer Review Survey 2026. A representative panel of 1,002 US adult consumers, and a survey run by a company that sells review software.",
      href: "https://www.brightlocal.com/research/local-consumer-review-survey/",
    },
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
      // ROUND 47: "the difference between asking today and asking on Friday is most of your
      // reviews" is a magnitude nobody has measured, which is the class round D removed from
      // three other service pages. The flagship makes the same point without a quantity.
      body: "Not next week. Enthusiasm has a half-life, and an ask that lands after somebody has moved on does not produce a worse review, it produces no review.",
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
      // ROUND 47: this said "Asking every HAPPY customer, every time". The mechanic round B
      // rewrote this whole page for is that everyone is asked whatever they scored, which the
      // lede, whatItIs, howItWorks[2], the figure footnote and limits[0] all now say. The
      // retraction swept five fields and missed this one, and the word it missed is the word the
      // page exists to remove. The title went with it: on this page's own argument the rating
      // moves toward the truth rather than upward, which is limits[4]'s point.
      title: "The ask that actually happens, every time",
      body: "Asking every customer, at the moment the work is fresh in their mind, is a simple idea that fails purely on consistency. Automating it removes the only failure mode it has.",
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

  limits: [
    "It does not choose who gets asked. Everyone does, whatever they scored, because selectively soliciting the people you expect to be kind is the practice Google's policy rules out.",
    "It does not remove a review. A published review belongs to the customer. The only things that change it are you answering it and you fixing what is behind it.",
    "It does not make anybody leave one. It removes the friction and the forgetting. The customer still has to want to.",
    "It does not present a selection as your whole reputation. Reviews pulled through to your own site are labelled a selection of recent reviews, for the reason in the FAQ below.",
    "It does not fix the service. A steady flow of honest reviews of a bad experience is simply a faster way to find out.",
  ],

  faqs: [
    {
      q: "How do I get more Google reviews?",
      a: "Ask every customer, by text, at the moment the job finishes, and make it one tap to the review page. The reason most businesses have few reviews is not that customers are unwilling, it is that the ask is inconsistent and late. Volume and recency both matter: in BrightLocal's Local Consumer Review Survey 2026, run on a panel of 1,002 US adults, 47% said they would not use a business with fewer than 20 reviews and 74% said they look for reviews written in the last three months. That is a survey by a company that sells review software, so treat it as what people say they do rather than as a measurement of what they did.",
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

  /** Own flagship first, then the sibling, which is the pattern the other posted services
   * follow. Two cards and not three because RelatedPosts is a two-column grid and an odd count
   * leaves a visible empty cell. */
  relatedPosts: [
    "automated-google-review-requests-real-estate",
    "workflow-automation-real-estate-business",
  ],
};
