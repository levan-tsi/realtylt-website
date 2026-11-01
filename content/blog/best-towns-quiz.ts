/** The ten-question check at the end of "Which Hudson Valley towns offer the best opportunities
 * for real estate investors?" (slug best-places-to-invest-hudson-valley).
 *
 * ROUND 21, 2026-11-01. The owner's rule for every long post: a ten-question quiz at the end, four
 * answers each, the result at the end; a pass shows the porch light, under 50 percent says try
 * again. Wired as the `quiz` scene in best-towns-scenes.ts.
 *
 * THE RULES THIS FILE IS HELD TO (best-towns-quiz.test.ts):
 *  - exactly ten questions, four distinct choices each, the answer index in range;
 *  - every question is a fact the post teaches, and every number in a `why` appears in the post;
 *  - `why` is one plain sentence that names the section of the post to reread;
 *  - no em dashes, no claim the post does not make. The wrong choices are wrong on purpose; the
 *    `why` line under every question says which one was right. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const BEST_TOWNS_QUIZ: QuizQuestion[] = [
  {
    q: "Which strategy needs purchase prices that are moderate against rents, and deep tenant demand that is not seasonal?",
    choices: ["Appreciation", "Cash flow", "Stability", "Growth and revitalization"],
    answer: 1,
    why: "Cash flow is steady monthly income after every expense, and it only works where prices are moderate against rents; see \"First choose a strategy\".",
  },
  {
    q: "Near which percentile of the market's standard units does HUD set its Fair Market Rents?",
    choices: ["The 10th", "The 25th", "The 75th", "The 40th"],
    answer: 3,
    why: "HUD sets the two-bedroom figure near the 40th percentile, utilities included; see \"A public benchmark for Hudson Valley real estate rents\".",
  },
  {
    q: "A seller says a renovated unit near the station rents well above the county's Fair Market Rent. How do you use the benchmark?",
    choices: [
      "As a ceiling: the rent cannot be above it",
      "As a public benchmark, then check comparable listings on the street above and below it",
      "As the rent to charge",
      "Ignore it for renovated units",
    ],
    answer: 1,
    why: "A Fair Market Rent is neither a floor nor a ceiling for one unit, so the street's listings on both sides of it decide whether the claimed rent holds; see \"A public benchmark for Hudson Valley real estate rents\".",
  },
  {
    q: "What did Poughkeepsie win in the eighth round of New York's Downtown Revitalization Initiative?",
    choices: ["$1 million", "$10 million", "$4.5 million", "$20 million"],
    answer: 1,
    why: "Poughkeepsie was the Mid-Hudson winner of $10 million, and on May 14, 2026 the state named 10 projects totaling $9.7 million; see \"Cash flow: Poughkeepsie\".",
  },
  {
    q: "In Beacon, when prices run ahead of what a street's rents support, what is the buyer mostly betting on?",
    choices: ["Steady monthly cash flow", "Rent stabilization", "Appreciation", "Short-term rentals"],
    answer: 2,
    why: "When prices run ahead of rents the buyer is betting on appreciation and should expect thin early cash flow, which is a test for each street; see \"Appreciation: Beacon\".",
  },
  {
    q: "How does a stability investor judge a building in White Plains?",
    choices: [
      "On yield first",
      "On renovation upside",
      "On public grants nearby",
      "On vacancy history, tenant tenure, condition and financing, with yield last",
    ],
    answer: 3,
    why: "Offices, courts and a busy station are reasons to look, and the building itself is judged on vacancy, tenure, condition and financing before yield; see \"Stability: White Plains\".",
  },
  {
    q: "Under the Emergency Tenant Protection Act Kingston adopted in 2022, which buildings are the first screen for rent stabilization?",
    choices: [
      "Every rental building in the city",
      "Six or more units, built before 1974",
      "One- to five-unit buildings",
      "Buildings built after 1974",
    ],
    answer: 1,
    why: "The act reaches buildings with six or more units built before 1974, subject to exemptions, so count the units and check the year built; see \"Growth with rules to know: Kingston\".",
  },
  {
    q: "What net vacancy rate did Kingston's 2025 survey find in the sampled buildings the act covers?",
    choices: ["1.57%", "3.73%", "5%", "7.04%"],
    answer: 3,
    why: "The 2025 survey found 7.04%, above the act's 5% line, except buildings of more than 22 units at 3.73%; the 1.57% was the 2022 survey; see \"Growth with rules to know: Kingston\".",
  },
  {
    q: "Who does Newburgh suit best?",
    choices: [
      "A first-time buyer with no reserve",
      "An investor with renovation experience, money in reserve and time to hold",
      "A buyer who wants a quick resale",
      "Anyone who needs steady cash flow from the first month",
    ],
    answer: 1,
    why: "In an old building the renovation, the permits and the months with no rent can outweigh the price, so experience and a reserve come first; see \"High risk, high potential: Newburgh\".",
  },
  {
    q: "What does the plan say to do in the first week?",
    choices: [
      "Make an offer on the best-looking building",
      "Order an inspection",
      "Write your strategy and goals in numbers, then pick a primary and a backup town",
      "Ask for a rent roll",
    ],
    answer: 2,
    why: "Week 1 is goals and markets on one page, so every building after it is judged against the same line; see \"What to do first\".",
  },
];
