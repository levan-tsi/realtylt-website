/** Scene copy for "The top 5 renovations that increase home value in New York"
 * (slug top-5-renovations-increase-home-value-ny).
 *
 * ROUND 22, 2026-11-01. The last seeded stub, written as a flagship to the house method of the
 * round-21 pages: the old 2025 post's picture lines ("a before and after of a minor kitchen
 * remodel") became figures drawn from the post's own facts. No stock photos beyond the cover.
 *
 * THE RULES THIS FILE IS HELD TO (the same as timeline-scenes.ts, plus one):
 *  - every number, date and source name printed here appears in the post;
 *  - scene copy is labels and short lines, never a body sentence repeated (flagship.test.ts walks
 *    every string for an eight-word echo); no em dashes, sentence case;
 *  - no scene prints a figure from the Cost vs. Value Report: its re-use guidelines bar a chart or
 *    table that simulates the report's display, so the four projects' figures live in the post's
 *    prose list only (round 22 follow-up, the coordinator's safe route: the bars scene `ranked` was
 *    removed), and the calculator carries only the reader's numbers. */

import type { FlagshipContent } from "@/lib/blog/flagship";
import { RENOVATIONS_QUIZ } from "./renovations-quiz";

const CVV_METHOD = "https://www.jlconline.com/cost-vs-value/2025/methodology";
const FANNIE_CONDITION = "https://selling-guide.fanniemae.com/sel/b4-1.3-06/property-condition-and-quality-construction-improvements";
const EPA_RRP = "https://www.epa.gov/lead/renovation-repair-and-painting-program";
const READ = { text: "read November 1, 2026" };

export const RENOVATIONS_FLAGSHIP: FlagshipContent = {
  hero: {
    moment: "5",
    suffix: "renovations",
    photo: "/images/listings/house-16.jpg",
    signature: "porchlight",
  },
  scenes: {
    /** The one formula the post rests on, with its invented example. */
    formula: {
      kind: "tiles",
      band: "light",
      eyebrow: "The formula",
      heading: "Cost recouped, in three numbers",
      lede: "An invented example, not data.",
      alt: "How cost recouped works, as an invented example: a job that costs $10,000 and adds $8,000 to the sale price has recouped 80% of its cost.",
      columns: 3,
      tiles: [
        { figure: "$10,000", title: "What the job costs", body: "Your contractor's written quote." },
        { figure: "$8,000", title: "What buyers would pay for it", body: "The value side: an estimate, never a promise." },
        { figure: "80%", title: "Cost recouped", body: "Value divided by cost. Above 100% it pays for itself at sale." },
      ],
      sources: [{ text: "Cost vs. Value methodology, 2025", href: CVV_METHOD }],
    },

    /** Fannie Mae's condition scale, the fifth renovation's whole case. */
    condition: {
      kind: "steps",
      band: "light",
      eyebrow: "The scale an appraiser uses",
      heading: "Six condition ratings, and the one that stops a loan",
      alt: "Fannie Mae's six condition ratings for a house, from C1, new and never occupied, through C5, obvious deferred maintenance, to C6, deficiencies that affect safety, soundness or structural integrity, which must be repaired to at least C5 before the loan can be sold to Fannie Mae.",
      steps: [
        { title: "C1", body: "New, never occupied." },
        { title: "C2", body: "No deferred maintenance; virtually everything new or redone." },
        { title: "C3", body: "Well maintained, normal wear, some parts updated." },
        { title: "C4", body: "Adequately maintained; some parts near the end of their life." },
        { title: "C5", body: "Obvious deferred maintenance; significant repairs needed." },
        { title: "C6", body: "Safety, soundness or structure affected: repair to C5 first." },
      ],
      close: "Lift the house off C6 and C5 before you spend on finishes.",
      sources: [{ text: "Fannie Mae, B4-1.3-06, June 4, 2025", href: FANNIE_CONDITION }, READ],
    },

    /** The two rules an older house adds, as a card. */
    "older-house": {
      kind: "tiles",
      band: "dark",
      eyebrow: "Before the work starts",
      heading: "What the age of the house adds",
      alt: "Two rules for an older house: for a home built before 1978, paid work that disturbs paint needs a firm certified under the EPA's lead rule, and any job that needs a permit should close it, since the disclosure form asks about certificates of occupancy.",
      columns: 3,
      tiles: [
        { figure: "1978", title: "Built before it? The lead rule applies", body: "Paid work that disturbs paint needs a certified firm." },
        { title: "Ask for the certificate", body: "Before the first scrape, not after." },
        { title: "Close the permit", body: "The disclosure form asks about certificates of occupancy." },
      ],
      sources: [{ text: "EPA lead rule page, updated June 17, 2026", href: EPA_RRP }, READ],
    },

    /** The order to spend in, as a numbered path. */
    plan: {
      kind: "steps",
      band: "light",
      eyebrow: "The order to spend in",
      heading: "Six steps before the first contract",
      alt: "Six steps before a renovation: know the house's value and nearby sales, fix what lowers the condition rating, get written quotes for the same scope, check the permit and lead rules, spend first on what a buyer sees, and keep every invoice, warranty and permit.",
      steps: [
        { title: "Know where you start", body: "A current value and the recent sales nearby." },
        { title: "Fix the rating first", body: "Safety, structure, roof, water, heat." },
        { title: "Quotes for one scope", body: "Two or three per project, comparable line by line." },
        { title: "Check the rules", body: "A permit if needed; a certified firm before 1978." },
        { title: "Then the curb", body: "Door, garage door, front of the house, then the kitchen." },
        { title: "One folder", body: "Invoices, warranties and closed permits, ready for the sale." },
      ],
      sources: [{ text: "the post's own plan" }],
    },

    /** The reader's own quote against the reader's own estimate. No report figure enters the
     * arithmetic: the guidelines bar the report's data from any calculator. */
    calculator: {
      kind: "calculator",
      band: "light",
      label: "Your quote",
      eyebrow: "In your numbers",
      heading: "What would your quote add to the sale price?",
      ariaLabel: "What a renovation quote might add to a sale price, in your own numbers",
      inputs: [
        {
          kind: "range",
          id: "quote",
          label: "Your contractor's written quote",
          hint: "The full price for the scope, not the materials alone.",
          min: 1000,
          max: 60000,
          step: 500,
          initial: 10000,
          format: "money",
          width: "w-[7.5rem]",
        },
        {
          kind: "range",
          id: "share",
          label: "Share of it you expect buyers on your street to pay",
          hint: "Your own estimate, from the sales nearby and a real estate professional's read. Over 100% means the job pays for itself.",
          min: 0,
          max: 200,
          step: 5,
          initial: 80,
          format: "percent",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "The quote", by: { from: "input", id: "quote" }, format: "money", unit: "spent" },
        { label: "Added to the sale price", by: { from: "input", id: "share" }, format: "money", unit: "on your estimate" },
      ],
      headline: 1,
      resultLabel: "What the job adds at sale, on your estimate",
      note: "Your arithmetic, not a forecast and not the report's figure: the share is your own estimate for your street. Where it sits under the quote, the rest is what you pay to enjoy the work until you sell.",
      action: { label: "How a home valuation is built", href: "/home-value" },
      secondary: { label: "Talk to Levan", href: "/connect" },
    },

    /** The ten-question check. The RealtyLT result states are the dark house and the porch light,
     * never the AI brand's brain. */
    quiz: {
      kind: "quiz",
      band: "night",
      label: "Quiz",
      ariaLabel: "Quiz: what did you learn",
      eyebrow: "Ten questions",
      title: "What did you learn? Check it in two minutes",
      brand: "realtylt",
      passLine: "You can rank your own projects before you spend. If you want a read on your street's sales first, call or write.",
      failLine: "Under half this time. Reread the four priced projects and the repairs an appraiser rates first, then have another go.",
      questions: RENOVATIONS_QUIZ,
    },

    /** The one ask at the end. */
    talk: {
      kind: "offer",
      band: "light",
      eyebrow: "Talk with us",
      text: "Bring your list of projects and your quotes, and we will set them against the recent sales on your street before you sign anything.",
      reassure: "A conversation, not a listing agreement. Nothing to sign.",
      action: { label: "Book a consultation", href: "/connect" },
      ariaLabel: "Book a consultation about renovating before a sale",
    },
  },

  headingLabels: {
    "how-a-renovation-adds-value-at-sale": "How value is added",
    "the-2025-figures-for-new-york-and-how-to-read-them": "The 2025 figures",
    "1-garage-door-replacement": "1. Garage door",
    "2-steel-entry-door-replacement": "2. Entry door",
    "3-manufactured-stone-veneer": "3. Stone veneer",
    "4-a-minor-kitchen-remodel": "4. Minor kitchen",
    "5-the-repairs-an-appraiser-rates-first": "5. Repairs first",
    "why-outside-work-leads-the-list": "Why outside leads",
    "projects-that-rarely-pay-back-at-sale": "Rarely pays back",
    "what-an-older-hudson-valley-house-adds-to-the-plan": "Older houses",
    "before-you-spend-the-order-we-suggest": "Before you spend",
    "frequently-asked-questions": "Common questions",
  },
};
