import type { Service } from "./types";

/** COPY key `reviews` on realtylt.com/ai. Deep link: /ai#reviews
 *
 * THE MECHANIC ON THIS PAGE WAS REWRITTEN 2026-08-25 (SERVICES-CRITIQUE.md §1), and the
 * rewrite is not a wording change. The page used to describe review gating in three places
 * while its own FAQ defined gating as the thing you must not do. So the mechanic is: EVERYONE
 * gets the same Google link, whatever they scored. A low score ALSO opens a private line to the
 * owner, as well as the link and never instead of it.
 *
 * Google's contribution policy (support.google.com/contributionpolicy/answer/7400114) lists
 * under "We do not allow merchants to": "Offer incentives", "Discourage or prohibit negative
 * reviews, or selectively solicit positive reviews from customers", and, when soliciting, "nor
 * should they request that specific content be included", "Merchants requesting that staff
 * solicit a certain number of reviews". Re-read 2026-11-11.
 *
 * The website embed is described as "a selection of recent reviews" for a federal reason:
 * 16 CFR 465.7(b) turns on MISREPRESENTING that a review block represents most or all reviews
 * submitted while suppressing by rating. Re-read 2026-11-11 (eCFR).
 *
 * THE 73% IS DEAD (Round B, 2026-08-25): it had no source. The stat is BrightLocal's 74%, quoted
 * as written, with the survey and its seller named beside it (re-read 2026-11-11: "74% seek
 * reviews written in the last three months"; "47% of consumers won't use a business with fewer
 * than 20 reviews"; "a representative panel of 1,002 US adult consumers via SurveyMonkey").
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a plumber, a dental or accounting
 * office, a salon or spa, a real estate office as one example); the closing transcript is a
 * water-heater job, not a closing. Sources saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/reviews/. */
export const reviewAutomation: Service = {
  slug: "review-automation",
  aiKey: "reviews",
  name: "Review Automation",
  tier: "core",

  eyebrow: "Reputation · Review requests",
  title: "Google review requests: ask every customer once, on the day",
  lede: "The job went well, the customer meant to write a review, and then the week moved on. We set up a text that goes to every customer when the job ends, one tap from the business's Google review page. Everyone gets the same link, whatever they scored, because asking only the people expected to be kind is what Google's policy rules out. A low score also reaches the owner the same minute, so a problem gets a call that day instead of a surprise later.",
  specs: ["asks when the job ends", "one tap to Google", "the same link for everyone", "a low score reaches the owner"],
  why: "People read reviews before they call, and the ones they read are the recent ones. This asks every customer while the work is fresh in their mind, every time, not only when somebody remembers. A steady trickle of honest reviews says more about a business today than a good year three years ago.",
  keywords: [
    "how to get more google reviews",
    "how to get more google reviews for my business",
    "automated review requests",
    "review request text",
    "online reputation management small business",
  ],

  seo: {
    title: "How to get more Google reviews: one request, on the day",
    description:
      "We text every customer one tap to the Google review page when the job ends. The same link for everyone, no incentives, and a low score reaches the owner too.",
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
      { who: "ai", text: "Hi Marcus, thanks for having us out today. Quick one: how did we do, one to five?" },
      { who: "visitor", text: "4. great work, the part just took three weeks to arrive" },
      { who: "ai", text: "That is worth knowing, thank you. I have sent the point about the part straight to the owner, and she will call you today. Here is the Google link too, if you would like to say it in your own words: [link]" },
      { who: "visitor", text: "will do" },
    ],
    footnote: "An invented example. Every customer gets this link, whatever they scored. What a low score adds is the private message to the owner, sent the same minute.",
  },

  whatItIs: [
    "It is the review request that otherwise never gets sent. Every owner knows to ask. Asking every time, on the busy weeks too, is the hard part, and an ask that comes after the customer has moved on is easy to ignore.",
    "We set up a text that goes out when the job is marked done, which is the moment the ask works. It takes the customer one tap to the business's Google review page. Every customer gets that link, including the ones who were not thrilled, because only asking the people expected to be kind is review gating, and Google's policy names selectively soliciting positive reviews as something merchants may not do.",
    "What the score changes is what happens on the owner's side. A low answer sends a private message to the owner at the same time as the link goes out. So the thing that went wrong reaches the business the day it happened, while it can still be put right. That is better than a suppressed review, and it is also the only version of this that is allowed.",
    "It fits any business that finishes work for customers it can text: a plumber or a roofer after a job, a dental or accounting office after an appointment, a salon or spa after a visit, a real estate office after a closing. For an office that keeps health or financial records, the text names the business and never the treatment or the return.",
  ],

  howItWorks: [
    {
      title: "We connect it to the moment a job ends",
      body: "The trigger is an event in the software the business already uses: a job marked done, an invoice paid, an appointment checked out. That event, rather than somebody's memory, starts the message, so the ask happens on the busy weeks too.",
    },
    {
      title: "We write the text with the owner",
      body: "Short, in the business's own name, with one question, one to five, and the link. No discount, gift or prize for a review, no pressure, and no request for particular words: all three are on Google's list of what merchants may not do. The owner approves the wording before the first text goes out.",
    },
    {
      title: "Everyone gets the same link",
      body: "The review page goes to every customer, whatever they scored. Only asking the ones expected to be kind is review gating, and Google's contribution policy lists selectively soliciting positive reviews as a thing merchants may not do.",
    },
    {
      title: "A rough score also reaches the owner, at once",
      body: "As well as the link, not instead of it. A low answer pings the owner with what was said and who said it, the same minute. So the call happens before the week is out, rather than the owner finding out from the review.",
    },
    {
      title: "Replies are handled, and STOP means stop",
      body: "A reply of STOP ends every text to that number. A question or a complaint in a reply goes to a person, not to an automatic answer. Nobody is asked twice for the same job.",
    },
  ],

  handoff: {
    provides: [
      "The event that marks a job done, in the software the business already uses.",
      "Customers' mobile numbers, from people who agreed to get texts from the business.",
      "The link to the business's Google review page.",
      "Who gets the low-score message, and how soon they call back.",
    ],
    approves: [
      "The wording of the text, once, and every change to it.",
      "Every reply posted under a review, in the owner's name.",
      "The call back to the customer who gave a low score.",
      "Which reviews appear on the business's own website, labelled as a selection.",
    ],
  },

  useCases: [
    {
      title: "A plumber or a roofer, after every job",
      body: "The job is marked done on the phone in the truck and the text goes out while the customer is still at home. Asking every customer at the moment the work is fresh is a simple idea that fails only on consistency, and automating it removes that failure.",
    },
    {
      title: "A dental or accounting office, after an appointment",
      body: "The front desk checks the client out and the text follows. It names the office and asks how the visit went, and never mentions a treatment or a tax matter. A low score goes to the office manager, not to the person at the desk.",
    },
    {
      title: "A salon or spa, after a visit",
      body: "The visit is paid and the text arrives while the customer is still on the way home. A steady flow of recent reviews reads as a business that is busy right now, which is what a new customer is quietly checking for.",
    },
    {
      title: "A real estate office, after a closing",
      body: "The closing is recorded and the client gets the same one-tap link. A slow lender or a long wait shows up as a four with the reason, and the agent hears about it the same day.",
    },
    {
      title: "The four answered the same day",
      body: "A four with a straight reply under it reads more honestly than a wall of fives. And a customer who got a call about it sometimes edits the review themselves. What changes is that the owner heard about it on the day.",
    },
    {
      title: "A profile that does not look managed",
      body: "Asking everyone produces a mix, and a mix is what a real business looks like. New customers read the low reviews and the replies to them first. That is the part a filtered profile cannot give.",
    },
  ],

  limits: [
    "It does not choose who gets asked. Everyone does, whatever they scored. That is because selectively soliciting the people expected to be kind is the practice Google's policy rules out.",
    "It does not remove a review. A published review belongs to the customer. The only things that change it are the owner answering it and fixing what is behind it.",
    "It does not make anybody leave one. It is built to take the forgetting and the delay out of the ask; whether a customer writes is the customer's choice.",
    "It offers no discount, gift or prize for a review, and it does not ask for particular words or a staff member's name in one. Google's policy lists all of those under what merchants may not do.",
    "It does not present a selection as the whole reputation. Reviews pulled through to the business's own site are labelled a selection of recent reviews. The reason is in the questions below.",
    "It does not fix the service. A steady flow of honest reviews of a bad experience is simply a faster way to find out.",
  ],

  faqs: [
    {
      q: "How do I get more Google reviews?",
      a: "Ask every customer, by text, at the moment the job finishes, and make it one tap to the review page. Volume and recency both matter. In BrightLocal's Local Consumer Review Survey 2026, run on a panel of 1,002 US adults, 47% said they would not use a business with fewer than 20 reviews, and 74% said they look for reviews written in the last three months. That is a survey by a company that sells review software, so treat it as what people say they do rather than a measurement of what they did.",
    },
    {
      q: "How do I get reviews without begging customers?",
      a: "Ask once, at the right moment, with nothing attached. One short text when the job ends, one question and one link, and no follow-up chain. Nobody is asked twice for the same job, a reply of STOP ends the texts, and no discount or gift is offered, which Google's policy forbids anyway. One plain ask at the right hour reads as a business that cares how the job went.",
    },
    {
      q: "Is it against Google's policy to automate review requests?",
      a: "Asking every customer for an honest review is allowed, and automating the timing of that ask does not change it. What is not allowed is offering an incentive, asking for particular content, or only asking the people expected to leave a good one. Google's contribution policy lists, under what merchants may not do, discouraging or prohibiting negative reviews or selectively soliciting positive ones. So this sends the same link to everyone, whatever they scored. The score decides what reaches the owner privately, rather than who gets asked.",
    },
    {
      q: "What is review gating?",
      a: "Review gating is surveying customers first, and only sending the public review link to the ones who answered well. It is common, and it is usually sold as catching problems early. It is also the specific practice Google's policy rules out. Screening feedback so problems get fixed is fine. Screening who is allowed to leave a review is not. The difference is whether the unhappy customer still gets the link.",
    },
    {
      q: "What happens when someone is unhappy?",
      a: "The owner is told straight away, with the score and what the customer wrote. The customer gets the review link like everybody else. The private message is what buys the chance to make it right the same day. Doing that well is worth more than a suppressed review, and a four with the owner's answer under it says more to the next customer than a page of fives.",
    },
    {
      q: "Can my Google reviews go on my own website?",
      a: "Yes. Recent reviews can be pulled through to the business's site automatically. They are shown and labelled as a selection of recent reviews, rather than as the whole set. That wording matters. The FTC's rule on consumer reviews, 16 CFR 465.7, is about misrepresenting a review block as representing most or all of what customers submitted while quietly holding back the low ones. A labelled selection is honest. A reviews section that implies it is everything is not.",
    },
  ],

  /** Own post first, then the sibling. Two cards and not three because RelatedPosts is a
   * two-column grid and an odd count leaves a visible empty cell. */
  relatedPosts: [
    "automated-google-review-requests-real-estate",
    "workflow-automation-real-estate-business",
  ],
};
