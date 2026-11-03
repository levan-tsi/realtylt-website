/** Scene copy for "Final walk through checklist for New York buyers" (slug final-walk-through-checklist).
 *
 * ROUND 24, 2026-11-03. The post was a plain repost (1,119 words, no scenes); the agents' refresh
 * draft of 2026-11-02 and its second reader's 15 notes (realtylt-agents
 * company/agents/seo/drafts/2026-11-02-final-walk-through-checklist*) made it a flagship here.
 *
 * THE RULES THIS FILE IS HELD TO:
 *  - every fact printed here is in the post with its source: the statute's two cases (General
 *    Obligations Law 5-1311, checked against FindLaw's copy current as of January 1, 2026, the
 *    Senate page refusing scripts), the 2020 Penfield court's reading of "broom clean" (as reported
 *    by Smith, Gambrell and Russell, December 16, 2020), the Closing Disclosure's three business days
 *    (CFPB);
 *  - no typical duration and no seller-presence rule: the second reader asked for a named source
 *    and none was found, so the page gives the method (book after the move-out, leave room for
 *    every test, ask your agent) instead of a number;
 *  - the fixes for a problem are possible and agreed, never promised;
 *  - scene copy is labels and short lines, never a body sentence repeated (flagship.test.ts);
 *  - no em dashes, sentence case, the porch light on the quiz pass (the RealtyLT motif). */

import type { FlagshipContent } from "@/lib/blog/flagship";
import { WALKTHROUGH_QUIZ } from "./walkthrough-quiz";

const GOL = "https://www.nysenate.gov/legislation/laws/GOB/5-1311";
const BROOM = "https://www.sgrlaw.com/newsroom/publications/court-answers-an-existential-question-how-clean-is-broom-clean";
const CFPB = "https://www.consumerfinance.gov/ask-cfpb/what-is-a-closing-disclosure-en-1983/";
const GUIDE = { text: "this guide's checklist; your own contract comes first" };

export const WALKTHROUGH_FLAGSHIP: FlagshipContent = {
  /** The held moment is the visit's three jobs, the frame every room is checked against. */
  hero: {
    moment: "3",
    suffix: "jobs",
    photo: "/images/listings/house-11.jpg",
    signature: "porchlight",
  },
  scenes: {
    jobs: {
      kind: "tiles",
      band: "light",
      label: "The three jobs",
      eyebrow: "What the visit checks",
      heading: "Condition, repairs, inclusions",
      alt: "Three tiles for the walk-through's jobs: the condition, with nothing new broken since you last saw the house; the repairs the seller agreed to, with receipts; and the inclusions the contract lists, present and not swapped.",
      columns: 3,
      tiles: [
        { figure: "1", title: "Condition", body: "Nothing new broken or damaged since your last visit, move-out included." },
        { figure: "2", title: "Repairs", body: "Each agreed fix done, with receipts and any warranties." },
        { figure: "3", title: "Inclusions", body: "Everything the contract lists is there, and not swapped for less." },
      ],
      sources: [GUIDE],
    },

    loss: {
      kind: "tiles",
      band: "dark",
      label: "If the house is damaged",
      eyebrow: "New York's risk of loss rule",
      heading: "Before title or possession passes",
      lede: "The default rule, unless the contract says otherwise.",
      alt: "Two tiles for General Obligations Law 5-1311 before title or possession passes: if all or a material part is destroyed without the buyer's fault, the seller cannot enforce the contract and the buyer can recover what was paid; if an immaterial part is destroyed, the contract stands and the price is reduced by the loss.",
      columns: 2,
      tiles: [
        { title: "A material part destroyed", body: "The seller cannot enforce the contract. The buyer can get back what was paid." },
        { title: "An immaterial part destroyed", body: "The contract stands. The price comes down by the amount of the loss." },
      ],
      sources: [{ text: "NY General Obligations Law 5-1311, checked November 3, 2026", href: GOL }],
      note: "Your contract can change this, and your attorney will know how yours does.",
    },

    fits: {
      kind: "grid",
      band: "light",
      label: "Who it fits",
      eyebrow: "Who this list is for",
      heading: "A signed contract and a closing date",
      columns: 2,
      items: [
        { lead: "It fits", body: "A buyer in New York with a signed contract, a closing date and the inclusions and any repair agreement in writing, condo or house." },
        { lead: "Not yet under contract", body: "Start with the first-time buyer checklist and the home inspection checklist. The walk-through comes at the end." },
        { lead: "Hoping to reopen the deal", body: "The visit checks the house against the contract. Price and terms are a question for your attorney." },
        { lead: "Selling", body: "Read it to see what the buyer will test, then ask your own attorney what move-out requires." },
      ],
    },

    timing: {
      kind: "steps",
      band: "dark",
      label: "When to book it",
      eyebrow: "When, and for how long",
      heading: "An empty house, and no clock on the visit",
      alt: "Four steps for timing the walk-through: read what the contract says about inspecting before closing, book it after the seller's move-out as close to closing as practical, leave room for every test with nothing booked straight after, and call the attorneys with what you found before the closing table.",
      steps: [
        { title: "Read the contract", body: "Some contracts set when the buyer may inspect." },
        { title: "After the move-out", body: "The morning of closing or the day before, with the house empty." },
        { title: "Room for every test", body: "No typical length is printed here; book a slot with nothing straight after it." },
        { title: "Then the call", body: "A problem list or an all-clear to your agent and attorney, before the table." },
      ],
      sources: [GUIDE],
    },

    groups: {
      kind: "tiles",
      band: "light",
      label: "The list at a glance",
      eyebrow: "The checklist, grouped",
      heading: "Five groups, tested, not looked at",
      alt: "Five tiles for the checklist's groups: systems, appliances, interior, repairs and inclusions, and broom clean with the garage and exterior.",
      columns: 3,
      tiles: [
        { title: "Systems", body: "Heat, cooling where its instructions allow, water, drains, switches and outlets." },
        { title: "Appliances", body: "Every included one, run: dishwasher, laundry, burners, oven, fridge, fans." },
        { title: "Interior", body: "Windows and doors that lock, walls and floors after the move, no new stains." },
        { title: "Repairs and inclusions", body: "Contract in hand, each agreed fix and each listed item, one by one." },
        { title: "Broom clean and outside", body: "Empty rooms, garage, attic and sheds; plantings and fixtures still there." },
      ],
      sources: [GUIDE],
    },

    broom: {
      kind: "tiles",
      band: "dark",
      label: "What broom clean means",
      eyebrow: "Broom clean, read by a New York court",
      heading: "Swept and empty, not professionally cleaned",
      alt: "Three tiles on broom clean: your contract's own wording comes first; where it is not defined, a Penfield court in 2020 read it as free of garbage, refuse, trash and other debris at hand-over; and it does not require professional cleaning, while belongings left behind fail it.",
      columns: 3,
      tiles: [
        { title: "Your contract first", body: "If it defines the term, its words control." },
        { title: "Where it is not defined", body: "Free of garbage, refuse, trash and other debris at hand-over." },
        { title: "What it is not", body: "Not a professional clean. Belongings left behind fail it." },
      ],
      sources: [{ text: "Witter v. Nitschke, Penfield Town Justice Court, 2020, reported December 16, 2020", href: BROOM }],
    },

    problem: {
      kind: "steps",
      band: "light",
      label: "If something is wrong",
      eyebrow: "If you find a problem",
      heading: "Document, call, let the attorneys negotiate",
      alt: "Three steps when the walk-through finds a problem: document it with photos and a video, call your agent and attorney before leaving, and let the attorneys negotiate a fix such as a credit at closing, an escrow holdback or a short delay, which both sides must agree to and the lender may have to approve.",
      steps: [
        { title: "Document it", body: "Several angles, and video for anything that runs or leaks." },
        { title: "Call before you leave", body: "Your agent alerts the seller's side. Your attorney decides how to protect you." },
        { title: "The attorneys negotiate", body: "A credit at closing, an escrow holdback or a short delay: possible fixes, never automatic." },
      ],
      close: "Both sides agree to any fix, and a lender may have to approve one that changes the closing figures.",
      sources: [GUIDE, { text: "CFPB, the Closing Disclosure", href: CFPB }],
    },

    roadmap: {
      kind: "steps",
      band: "dark",
      label: "The planning schedule",
      eyebrow: "A suggested schedule",
      heading: "From the inclusions list to the closing table",
      alt: "A suggested planning schedule: about two weeks before closing find the inclusions list and the repair agreement and ask for receipts; the week of closing book the walk-through and compare the Closing Disclosure with the Loan Estimate; the day before review the papers with your agent; on the day test every line and call before leaving.",
      steps: [
        { title: "About two weeks before", body: "The inclusions list, the repair agreement, the receipts asked for." },
        { title: "The week of closing", body: "The visit booked; the Closing Disclosure set beside the Loan Estimate." },
        { title: "The day before", body: "The papers reviewed with your agent, the bag packed." },
        { title: "The day itself", body: "Every line tested, every problem photographed, the call made." },
      ],
      close: "Any date your contract sets comes before this schedule.",
      sources: [GUIDE, { text: "CFPB, the Closing Disclosure, last reviewed May 2, 2023", href: CFPB }],
    },

    bag: {
      kind: "grid",
      band: "light",
      label: "What to bring",
      eyebrow: "The bag, the night before",
      heading: "Six things by the front door",
      columns: 3,
      glow: false,
      items: [
        { lead: "The papers", body: "The contract, the inclusions list and the repair agreement." },
        { lead: "A charged phone", body: "For photos and the short videos, and for the call." },
        { lead: "A charger or night light", body: "The quickest outlet test there is." },
        { lead: "A flashlight", body: "For under the sinks, the attic and the basement." },
        { lead: "A notepad", body: "One line per problem, with the room it is in." },
        { lead: "The printed list", body: "Ticked room by room, then kept with the contract." },
      ],
    },

    quiz: {
      kind: "quiz",
      band: "night",
      label: "Quiz",
      ariaLabel: "Quiz: what did you learn",
      eyebrow: "Ten questions",
      title: "What did you learn? Check it in two minutes",
      brand: "realtylt",
      passLine: "You are ready for the walk-through. If your closing is close and you want someone beside you for it, call or write.",
      failLine: "The house stays dark this time. Reread the three jobs and the short list, then have another go.",
      questions: WALKTHROUGH_QUIZ,
    },
  },

  headingLabels: {
    "what-the-final-walk-through-is-for": "What it is for",
    "who-this-checklist-fits": "Who it fits",
    "when-to-schedule-it-and-how-long-it-takes": "When to book it",
    "the-final-walk-through-checklist": "The checklist",
    "what-if-you-find-a-problem": "If you find a problem",
    "what-to-do-first": "What to do first",
    "your-pre-closing-plan": "The night before",
    "frequently-asked-questions": "Questions",
    sources: "Sources",
  },
};
