/** The ten-question check at the end of "How to follow up with old leads" (slug
 * database-reactivation-old-real-estate-leads).
 *
 * ROUND 29, 2026-11-14, the refresh that re-aimed the post at local business owners. The owner's
 * quiz rule (2026-10-31): about ten questions, four answers each, the result at the end. DATA only.
 * Held by reactivation-quiz.test.ts: ten questions, four distinct choices, every number in a `why` in
 * the post, every `why` names a heading the post has, no em dashes, and no right answer says a
 * list may be contacted on a hunch. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const REACTIVATION_QUIZ: QuizQuestion[] = [
  {
    q: "How long does an established business relationship last after a purchase, under the federal telemarketing rule?",
    choices: ["Three months", "Eighteen months", "Five years", "As long as the customer is on your list"],
    answer: 1,
    why: 'The regulation counts a purchase or transaction within the eighteen months before the call; see "How long does an old lead stay yours to call?".',
  },
  {
    q: "And how long after an inquiry or an application?",
    choices: ["Eighteen months", "Twelve months", "Three months", "Until they reply"],
    answer: 2,
    why: 'An inquiry counts within the three months before the call; see "How long does an old lead stay yours to call?".',
  },
  {
    q: "What does an autodialed or artificial-voice telemarketing call or text to a mobile number need?",
    choices: [
      "A friendly opener",
      "A relationship older than a year",
      "The prior express written consent of the person",
      "Nothing, if the number is on your list",
    ],
    answer: 2,
    why: 'The regulation requires prior express written consent for such a call; see "When does an automated text or call need written consent?".',
  },
  {
    q: "Which reply counts as a stop request by itself, without any other words?",
    choices: ["Maybe later", "Stop", "Thanks", "Who is this"],
    answer: 1,
    why: 'Stop, quit, end, revoke, opt out, cancel and unsubscribe are reasonable means per se; see "How does a stop request have to be handled?".',
  },
  {
    q: "What is the outer limit for honoring a request to revoke consent?",
    choices: ["The next day", "Ten business days", "Ninety days", "The end of the campaign"],
    answer: 1,
    why: 'A request must be honored within a reasonable time not to exceed ten business days; see "How does a stop request have to be handled?".',
  },
  {
    q: "Under the federal statute, what may a person recover for each violation, if more than the actual loss?",
    choices: [
      "Five hundred dollars",
      "Nothing, only an order to stop",
      "One month of your sales",
      "Whatever the carrier decides",
    ],
    answer: 0,
    why: 'The statute allows actual loss or five hundred dollars for each violation, whichever is greater, and up to three times that for a willful or knowing violation; see "What can go wrong if the rules are missed?".',
  },
  {
    q: "What does the worth-it test say about a list where no record has a date or a source?",
    choices: [
      "Text it in small batches",
      "Leave it alone until the records are cleaned",
      "Buy a bigger list",
      "Call everyone at night",
    ],
    answer: 1,
    why: 'A list with no dates and sources is left alone until the records are cleaned; see "Is it worth automating at all?".',
  },
  {
    q: "What is the first job of a reactivation run?",
    choices: ["Writing the opener", "Sending the first batch", "A count of the records by date, source and consent", "Booking the calendar"],
    answer: 2,
    why: 'The first job is a count, not a campaign; see "What does it take to run?".',
  },
  {
    q: "In the invented heating company example, how many of the 1,400 records were customers who bought within the last eighteen months?",
    choices: ["210", "880", "310", "520"],
    answer: 3,
    why: 'The count was 520 recent customers, 210 with a signed consent for automated texts and 880 older records; see "How long does an old lead stay yours to call?".',
  },
  {
    q: "What does the roadmap tell you to do in week one?",
    choices: [
      "Open one record and write down its date, source and consent",
      "Send a message to the whole list",
      "Buy a number for texting",
      "Ask a vendor for a price",
    ],
    answer: 0,
    why: 'Week one is one record opened, with its date, source and consent written down; see "What to do first".',
  },
];
