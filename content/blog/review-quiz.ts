/** The ten-question check at the end of "How to get more Google reviews" (slug
 * automated-google-review-requests-real-estate).
 *
 * ROUND 28, 2026-11-11, the refresh that re-aimed the post at local business owners. The owner's
 * quiz rule (2026-10-31): about ten questions, four answers each, the result at the end. DATA only.
 * Held by review-quiz.test.ts: ten questions, four distinct choices, every number in a `why` in
 * the post, every `why` names a heading the post has, no em dashes. The questions are the SEO
 * agent's draft of 2026-11-09, with the headings it named. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const REVIEW_QUIZ: QuizQuestion[] = [
  {
    q: "In the 2026 vendor survey, what share of the panel said they would use nothing below five stars?",
    choices: ["41 percent", "10 percent", "68 percent", "97 percent"],
    answer: 1,
    why: 'Only 10 percent insisted on five stars, while 68 percent set their floor at four; see "Why the ask does not happen".',
  },
  {
    q: "What does Google's policy call sending the review link only to customers who answered well?",
    choices: ["Feedback screening", "An incentive", "Selective solicitation of positive reviews", "Pressure on the premises"],
    answer: 2,
    why: 'Merchants may not selectively solicit positive reviews; see "The line you may not cross, and exactly where it is".',
  },
  {
    q: "Which word carries the weight in the federal rule on review suppression?",
    choices: ["Misrepresent", "Publish", "Remove", "Rating"],
    answer: 0,
    why: 'A labelled selection is honest; an unlabelled one that implies it shows most or all is what the rule describes; see "The federal half, which is about your own website".',
  },
  {
    q: "In the 2011 study, a one-star rise from rounding alone led to roughly what rise in revenue?",
    choices: ["5.4 percent", "31 percent", "15 percent", "9 percent"],
    answer: 3,
    why: 'About 9 percent at the rounding threshold, against 5.4 percent on the plain comparison; see "What one extra star was worth, in a study that measured money".',
  },
  {
    q: "For which restaurants was the effect of a star close to zero?",
    choices: ["Independent restaurants", "Chains", "Restaurants with many reviews", "New restaurants"],
    answer: 1,
    why: 'A brand name already answers what reviews answer; see "What one extra star was worth, in a study that measured money".',
  },
  {
    q: "What should start the review message?",
    choices: [
      "A list pasted in weekly",
      "The owner's memory",
      "An event in a system you already use that marks the job finished",
      "A quiet Friday afternoon",
    ],
    answer: 2,
    why: 'A real event, not anyone\'s memory, starts the ask; see "What review automation actually does".',
  },
  {
    q: "How much time a week should be budgeted for replying to reviews?",
    choices: ["Fifteen minutes", "None", "Ninety seconds", "Four minutes"],
    answer: 0,
    why: 'The replying is the part that is easy to forget; see "What it takes to run".',
  },
  {
    q: "A job scores 1 or 2 for impact. What is the verdict?",
    choices: ["Automate it at once", "Buy a second tool", "Leave it alone and ask by hand", "Gate the link"],
    answer: 2,
    why: 'A setup kept for a few asks a month takes more attention than it saves; see "Is it worth automating".',
  },
  {
    q: "What happens in week 1 of the roadmap?",
    choices: [
      "Connect the tool",
      "The signed-out check, and the event that means a job is finished written down",
      "A review widget added to the website",
      "Customers asked to mention the town",
    ],
    answer: 1,
    why: 'The check and the finished-job event come before any tool; see "What to do first".',
  },
  {
    q: "Who gets the Google review link?",
    choices: [
      "Only customers who score five",
      "Only customers who score four or five",
      "Only customers who do not reply",
      "Everybody, whatever they answer",
    ],
    answer: 3,
    why: 'Whatever comes back, the same link goes out; see "What review automation actually does".',
  },
];
