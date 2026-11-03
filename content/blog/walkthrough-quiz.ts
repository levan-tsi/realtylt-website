/** The ten-question check at the end of "Final walk through checklist for New York buyers"
 * (slug final-walk-through-checklist).
 *
 * ROUND 24, 2026-11-03, the refresh of the walk-through post. The owner's quiz rule (2026-10-31):
 * about ten questions, four answers each, the result at the end, the porch light on a pass. DATA
 * only; the quiz primitive renders it.
 *
 * THE RULES THIS FILE IS HELD TO (walkthrough-quiz.test.ts): ten questions, four distinct choices,
 * every number in a `why` appears in the post, every `why` names a heading the post has, no em
 * dashes. The second reader's corrections of 2026-11-02 are in the questions themselves: no
 * typical duration is tested (none could be sourced), "broom clean" is tested on the 2020 court's
 * reading, and the fixes for a problem are possible and agreed, never promised. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const WALKTHROUGH_QUIZ: QuizQuestion[] = [
  {
    q: "What is the final walk-through for?",
    choices: [
      "A second home inspection",
      "Checking the house against what the contract promised",
      "Renegotiating the price",
      "Meeting the seller",
    ],
    answer: 1,
    why: 'It checks the house against the contract and does not replace the inspection; see "What the final walk-through is for".',
  },
  {
    q: "What are the walk-through's three jobs?",
    choices: [
      "Price, taxes and insurance",
      "Paint, carpet and landscaping",
      "Mortgage, title and deed",
      "Condition, repairs and inclusions",
    ],
    answer: 3,
    why: 'Confirm the condition, the repairs and the inclusions; see "What the final walk-through is for".',
  },
  {
    q: "You notice a problem the inspection missed, and it is not new damage. What does the guide suggest?",
    choices: [
      "Take a photo and ask your attorney what the contract allows",
      "Refuse to close until it is fixed",
      "Ignore it, because only new damage counts",
      "Ask the seller at the door for money",
    ],
    answer: 0,
    why: 'The walk-through does not replace the inspection, so a missed problem goes to your attorney with a photo; see "What the final walk-through is for".',
  },
  {
    q: "When should the walk-through be booked?",
    choices: [
      "A month before closing",
      "Before the home inspection",
      "Near the closing, once the seller has moved out",
      "A week after closing",
    ],
    answer: 2,
    why: 'An empty house shows the damage furniture hides; see "When to schedule it and how long it takes".',
  },
  {
    q: "How does the checklist suggest testing outlets?",
    choices: [
      "Look at them",
      "Plug in a phone charger or night light",
      "Switch off the breaker",
      "Ask the seller",
    ],
    answer: 1,
    why: 'A charger or a night light in each outlet; see "The final walk-through checklist".',
  },
  {
    q: "It is a cold day. What does the guide say about the air conditioning?",
    choices: [
      "Run it anyway, whatever the season",
      "Skip it and say nothing",
      "Ask the seller to run it after closing",
      "Check its instructions first, and if it cannot be tested, note it and ask your attorney",
    ],
    answer: 3,
    why: 'The equipment\'s instructions may limit when it should run; see "The final walk-through checklist".',
  },
  {
    q: "Where a contract does not define it, what did a New York court in 2020 hold that \"broom clean\" means?",
    choices: [
      "Professionally cleaned",
      "Free of garbage, refuse, trash and other debris, and not professionally cleaned",
      "Repainted and the carpets shampooed",
      "Whatever the buyer expects",
    ],
    answer: 1,
    why: 'The Penfield court in 2020; your own contract\'s wording still comes first; see "The final walk-through checklist".',
  },
  {
    q: "What is the first step when a buyer finds a problem?",
    choices: [
      "Cancel the closing",
      "Fix it before closing",
      "Document it with photos, and a video for anything that runs or leaks",
      "Leave and decide later",
    ],
    answer: 2,
    why: 'Document it, then call your agent and attorney before you leave; see "What if you find a problem?".',
  },
  {
    q: "What does a credit at closing or an escrow holdback need?",
    choices: [
      "The buyer and the seller to agree, and where there is a mortgage the lender may have to approve it",
      "Nothing: it happens automatically",
      "Only the buyer's agent's signature",
      "A court order",
    ],
    answer: 0,
    why: 'They are possible fixes the attorneys negotiate, never automatic; see "What if you find a problem?".',
  },
  {
    q: "In the suggested planning schedule, what does a buyer do first?",
    choices: [
      "Book movers",
      "Run the dishwasher",
      "Call the seller",
      "Find the inclusions list and any repair agreement in the contract",
    ],
    answer: 3,
    why: 'Every later step checks the house against those papers; see "What to do first".',
  },
];
