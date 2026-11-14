/** The ten-question check at the end of "How to rank in Google Maps" (slug
 * local-seo-real-estate-map-pack-google-business-profile).
 *
 * ROUND 29, 2026-11-14, the refresh that re-aimed the post at local business owners. The owner's
 * quiz rule (2026-10-31): about ten questions, four answers each, the result at the end. DATA only.
 * Held by local-seo-quiz.test.ts: ten questions, four distinct choices, every number in a `why` in
 * the post, every `why` names a heading the post has, no em dashes, and no right answer says a
 * position can be bought. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const LOCAL_SEO_QUIZ: QuizQuestion[] = [
  {
    q: "What does Google's own page say about paying for a better local ranking?",
    choices: [
      "A verified profile can buy one",
      "There is no way to request or pay for one",
      "Only businesses with a storefront can pay",
      "It can be bought through a review service",
    ],
    answer: 1,
    why: 'Google says there is no way to request or pay for a better local ranking; see "How do you rank in Google Maps?".',
  },
  {
    q: "Which three inputs does Google say local results are mainly based on?",
    choices: [
      "Relevance, distance and popularity",
      "Price, speed and opening hours",
      "Category, address and website",
      "Reviews, photos and posts",
    ],
    answer: 0,
    why: 'The page names relevance, distance and popularity, and publishes no weights; see "How do you rank in Google Maps?".',
  },
  {
    q: "Which of the three inputs can no amount of work change?",
    choices: ["Relevance", "Prominence", "The number of photos", "Distance"],
    answer: 3,
    why: 'Distance is how far the business is from the person searching, a physical fact; see "Which parts of the ranking can you not change?".',
  },
  {
    q: "The Whitespark survey asked how many experts to score how many factors?",
    choices: ["47 experts, 187 factors", "187 experts, 47 factors", "100 experts, 187 factors", "47 experts, 100 factors"],
    answer: 0,
    why: 'Each of 47 experts scored 187 factors from 0 to 5; see "What do local search experts say matters most?".',
  },
  {
    q: "Which factor did the experts put first for the map results?",
    choices: ["The number of photos", "The main category on the profile", "A website with a blog", "The year the business started"],
    answer: 1,
    why: 'The main category on the profile came first, with 227; see "What do local search experts say matters most?".',
  },
  {
    q: "A plumber runs the business from a home address. What does Google tell a service-area business to do with it?",
    choices: ["Show it on the profile", "Replace it with a rented mailbox", "Hide it from customers", "Use a friend's shop address"],
    answer: 2,
    why: 'Google says a service-area business should hide its address, and gives a plumber working from a residential address as its example; see "Can a plumber who works from home show a home address?".',
  },
  {
    q: "Which business name risks the suspension of a profile?",
    choices: [
      "The name on the sign and the invoices",
      "The name with a phone number and a tagline added",
      "The name with the town in the address field",
      "The name in the same spelling as the website",
    ],
    answer: 1,
    why: 'Unnecessary information in the name, such as a tagline or a phone number, can lead to suspension; see "What does Google allow in your profile?".',
  },
  {
    q: "How should a business send its review link?",
    choices: [
      "To the customers it expects to be happy",
      "Only after a discount is offered",
      "To one in three customers",
      "The same link to every customer",
    ],
    answer: 3,
    why: 'Google lists selectively soliciting positive reviews among what a business may not do, and incentives are strictly prohibited; see "How do reviews affect your ranking in Google Maps?".',
  },
  {
    q: "When eBay stopped paying for ads on its own name, how much of the click traffic did it keep?",
    choices: ["5.6 percent", "0.529 percent", "99.5 percent", "63 percent"],
    answer: 2,
    why: 'Only 0.529 percent of the click traffic was lost, so 99.5 percent was retained; see "What does it cost to rent the same attention?".',
  },
  {
    q: "What does the worth-it test say to do with a profile for one location?",
    choices: [
      "Do the profile by hand once, automate the part that decays, and approve anything sent in your name",
      "Automate every reply and never read them",
      "Pay for a ranking guarantee",
      "Leave the profile alone for a year",
    ],
    answer: 0,
    why: 'Do the profile by hand once, automate the review request and the report, and approve what goes out in your name; see "Is it worth doing this yourself, or having it done?".',
  },
];
