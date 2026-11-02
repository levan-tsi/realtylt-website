/** The ten-question check at the end of "The top 5 renovations that increase home value in New
 * York" (slug top-5-renovations-increase-home-value-ny).
 *
 * ROUND 22, 2026-11-01. The owner's rule for every long post: a ten-question quiz at the end, four
 * answers each, the result at the end; a pass shows the porch light, under 50 percent says try
 * again. Wired as the `quiz` scene in renovations-scenes.ts.
 *
 * THE RULES THIS FILE IS HELD TO (renovations-quiz.test.ts):
 *  - exactly ten questions, four distinct choices each, the answer index in range;
 *  - every question is a fact the post teaches, and every number in a `why` appears in the post;
 *  - `why` is one plain sentence that names the section of the post to reread;
 *  - no em dashes, no claim the post does not make;
 *  - report figures only for the four projects the post quotes (the licence note in
 *    renovations-post.ts): the wrong choices are other percentages, never a fifth project's data. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const RENOVATIONS_QUIZ: QuizQuestion[] = [
  {
    q: "What does the Cost vs. Value Report mean by \"cost recouped\"?",
    choices: [
      "The job cost minus the contractor's profit",
      "The value a project adds at resale, divided by what it cost",
      "The share of the cost a lender will finance",
      "The tax deduction on a renovation",
    ],
    answer: 1,
    why: "Divide the value a project adds at sale by its cost; above 100% it returns more than it cost; see \"How a renovation adds value at sale\".",
  },
  {
    q: "Which project led the Middle Atlantic region in the 2025 report?",
    choices: ["A minor kitchen remodel", "Manufactured stone veneer", "Garage door replacement", "Steel entry door replacement"],
    answer: 2,
    why: "The garage door replacement recouped 336.6% of its cost in the region in 2025; see \"1. Garage door replacement\".",
  },
  {
    q: "The garage door recouped 203.6% in the 2024 report and 336.6% in 2025. What should you read from that?",
    choices: [
      "The 2025 figure is a promise for your house",
      "The figure only rises over time",
      "The report made an error in 2024",
      "The order of the list more than the decimal, since the value side is a survey of opinion",
    ],
    answer: 3,
    why: "The value side is an opinion survey that moves year to year, so a project near the top two years running is the safer bet; see \"The 2025 figures for New York, and how to read them\".",
  },
  {
    q: "Why do the report's editors say exterior projects return more than interior remodels?",
    choices: [
      "Curb appeal weighs heavily in a price, and exterior replacements need less skilled labor",
      "Exterior work is tax deductible",
      "Buyers never look inside",
      "Exterior projects need no permit",
    ],
    answer: 0,
    why: "Real estate professionals place high value on curb appeal, and exterior replacements cost less to do; see \"1. Garage door replacement\".",
  },
  {
    q: "What did a steel entry door replacement recoup in the Middle Atlantic region in 2025?",
    choices: ["45%", "219.8%", "107.2%", "150%"],
    answer: 1,
    why: "It cost $2,684 on average, added $5,900 at resale and recouped 219.8%; see \"2. Steel entry door replacement\".",
  },
  {
    q: "What keeps a kitchen remodel \"minor\" in the sense that pays back?",
    choices: [
      "Custom cabinets and commercial appliances",
      "Moving the sink to an island",
      "Keeping the layout, plumbing and gas line where they are",
      "Taking down a wall to open the room",
    ],
    answer: 2,
    why: "A face-lift that keeps the layout recouped 107.2% in the region in 2025, and the more complex the project, the lower the return; see \"4. A minor kitchen remodel\".",
  },
  {
    q: "Which condition rating makes a loan ineligible for sale to Fannie Mae until the deficiencies are repaired?",
    choices: ["C1", "C3", "C5", "C6"],
    answer: 3,
    why: "A C6 deficiency affects safety, soundness or structural integrity and must be repaired to at least C5; see \"5. The repairs an appraiser rates first\".",
  },
  {
    q: "An owner turns a small bedroom into a grand primary bath. What risk do the report's editors name?",
    choices: [
      "Buyers may see the loss of a bedroom rather than the gain of a bathroom",
      "The bath will need a separate permit every year",
      "The house loses its certificate of occupancy",
      "Nothing: baths always pay back",
    ],
    answer: 0,
    why: "Changing how a room is used may meet the owner's needs and still be at odds with what buyers want; see \"Projects that rarely pay back at sale\".",
  },
  {
    q: "You hire a painter to scrape and repaint the trim on a house built in 1965. What does the EPA's rule require?",
    choices: [
      "Nothing, because the work is outside",
      "A certified firm with workers trained in lead-safe practices",
      "Only a building permit",
      "A new disclosure form",
    ],
    answer: 1,
    why: "Paid work that disturbs painted surfaces in a home built before 1978 needs a certified firm and trained workers; see \"What an older Hudson Valley house adds to the plan\".",
  },
  {
    q: "What do the report's editors recommend before a real decision about your own house?",
    choices: [
      "Use the national average as your quote",
      "Pick the project with the highest percentage",
      "Written estimates from reputable local remodelers and a real estate professional's read of nearby prices",
      "Wait for next year's report",
    ],
    answer: 2,
    why: "The report compares defined projects and is less successful for a particular address; see \"The 2025 figures for New York, and how to read them\".",
  },
];
