/** The ten-question check at the end of "How long it takes to sell a house in New York, phase by
 * phase" (slug timeline-selling-a-house-ny).
 *
 * ROUND 21, 2026-11-01. The owner's rule for every long post: a ten-question quiz at the end, four
 * answers each, the result at the end; a pass shows the porch light, under 50 percent says try
 * again. Wired as the `quiz` scene in timeline-scenes.ts.
 *
 * THE RULES THIS FILE IS HELD TO (timeline-quiz.test.ts):
 *  - exactly ten questions, four distinct choices each, the answer index in range;
 *  - every question is a fact the post teaches, and every number in a `why` appears in the post;
 *  - `why` is one plain sentence that names the section of the post to reread;
 *  - no em dashes, no claim the post does not make. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const TIMELINE_QUIZ: QuizQuestion[] = [
  {
    q: "In our experience, how long does the New York contract stage commonly take after an offer is accepted?",
    choices: ["A single day", "One to three months", "One to two weeks", "Over a year"],
    answer: 2,
    why: "The attorneys negotiate until both sides sign, which in our experience commonly takes one to two weeks; see \"Phase 3: The New York contract stage\".",
  },
  {
    q: "When are a New York seller's rights and obligations fixed?",
    choices: [
      "When the seller accepts the offer",
      "When both sides sign the contract of sale",
      "When the agents send the deal sheet",
      "At the final walk-through",
    ],
    answer: 1,
    why: "An accepted offer is not yet a contract, and the bar association says that once you sign, your rights and obligations are determined; see \"Phase 3: The New York contract stage\".",
  },
  {
    q: "A buyer asks you to sign a short binder before the attorneys have drafted anything. What does the bar association warn?",
    choices: [
      "A binder is never binding in New York",
      "Only the buyer's signature counts",
      "A binder or other early paper may be a binding contract, so your attorney reads it first",
      "A binder replaces the contract of sale",
    ],
    answer: 2,
    why: "The bar association warns that early paper may constitute a binding contract, so nothing is signed before your attorney reads it; see \"Phase 3: The New York contract stage\".",
  },
  {
    q: "What must the seller of most one- to four-family homes in New York deliver before the buyer signs the contract?",
    choices: [
      "The appraisal report",
      "The completed property condition disclosure statement",
      "The title search",
      "The final walk-through checklist",
    ],
    answer: 1,
    why: "Real Property Law 462 requires the completed statement before the buyer signs a binding contract of sale; see \"Disclosure and marketing\".",
  },
  {
    q: "Which disclosure form is current, and since when?",
    choices: [
      "DOS-1614-f (Rev. 02/25), required since July 1, 2025",
      "The January 2024 form, required since March 20, 2024",
      "Any version the attorney has on file",
      "DOS-1614-f (Rev. 06/23), required since 2023",
    ],
    answer: 0,
    why: "The Department of State has required Rev. 02/25 since July 1, 2025, and a copy printed before July 2025 is out of date; see \"Disclosure and marketing\".",
  },
  {
    q: "What changed for the disclosure on March 20, 2024?",
    choices: [
      "The form was retired",
      "Buyers now fill out the form",
      "The form became optional upstate",
      "The $500 credit instead of the form was repealed and flood questions were added",
    ],
    answer: 3,
    why: "Since March 20, 2024 a seller cannot give a $500 credit instead of the form, and seven flood questions took it from 49 to 56 questions; see \"Disclosure and marketing\".",
  },
  {
    q: "The appraisal comes in below the contract price on a financed purchase. What usually happens to the loan?",
    choices: [
      "The lender cancels it at once",
      "The lender lends the full price anyway",
      "It is sized to the lower value",
      "The seller must make repairs first",
    ],
    answer: 2,
    why: "Fannie Mae's guide values a purchase at the lower of the price and the appraised value, so the gap has to be settled another way; see \"The appraisal\".",
  },
  {
    q: "When can the buyer's home inspection happen in New York?",
    choices: [
      "Only after closing",
      "Only on the day of the walk-through",
      "Only after the appraisal",
      "Before or after the contract is signed",
    ],
    answer: 3,
    why: "The bar association tells buyers to inspect before or after signing a contract, and the inspector's written report is due within five business days; see \"The buyer's inspection\".",
  },
  {
    q: "Which tasks come first, before the listing goes live?",
    choices: [
      "An agent, an attorney, a comparative market analysis and the disclosure form",
      "Showings and open houses",
      "The final walk-through",
      "Signing the deed",
    ],
    answer: 0,
    why: "The first week starts pricing and paperwork, the two pieces every later step waits on; see \"What to do first\".",
  },
  {
    q: "With an all-cash buyer, what drops out of contract to closing?",
    choices: [
      "The lender's loan approval and the lender-ordered appraisal",
      "Every appraisal and every inspection",
      "The contract and the deposit",
      "The title search and the deed",
    ],
    answer: 0,
    why: "With no lender there is no loan approval and no lender-ordered appraisal, though a cash buyer may still order an appraisal or an inspection; see \"Who this guide fits\".",
  },
];
