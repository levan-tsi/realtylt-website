/** Scene copy for "How long it takes to sell a house in New York, phase by phase"
 * (slug timeline-selling-a-house-ny).
 *
 * ROUND 21, 2026-11-01. The refresh came through the agents' content chain and was built here as a
 * flagship. Each `scene:` line of the draft became one of the scenes below, in the kinds the
 * template supports; the draft's photographs (a kitchen table, a faucet, an empty living room, a
 * porch light) became figures drawn from the post's own facts. No stock photos.
 *
 * THE RULES THIS FILE IS HELD TO (the same as seller-disclosure-scenes.ts):
 *  - every number, date and source name printed here appears in the post;
 *  - no duration is printed as typical: the owner's rule of 2026-11-01 (no "in our experience"
 *    number; a duration only with a named public source); the scenes print what sets each phase's
 *    pace and the two time limits the post sources (round 22);
 *  - scene copy is labels and short lines, never a body sentence repeated (flagship.test.ts walks
 *    every string for an eight-word echo); no em dashes, sentence case. */

import type { FlagshipContent } from "@/lib/blog/flagship";
import { TIMELINE_QUIZ } from "./timeline-quiz";

const NYSBA_PCDA = "https://nysba.org/pcda-amended-500-seller-credit-deleted-and-additional-questions-added-to-pcds/";
const NYSBA_LEGALEASE = "https://nysba.org/legalease-buying-and-selling-real-estate/";
const DOS_FORM = "https://dos.ny.gov/property-condition-disclosure-statement-eff-7125";
const RPL_462 = "https://www.nysenate.gov/legislation/laws/RPP/462";
const FANNIE = "https://selling-guide.fanniemae.com/sel/b2-1.2-01/loan-value-ltv-ratios";
const CFPB = "https://www.consumerfinance.gov/archive/blog/mortgage-borrowers-can-challenge-inaccurate-appraisals-through-the-reconsideration-of-value-process/";
const TP584 = "https://tax.ny.gov/pdf/current_forms/property/tp584i.pdf";
const FORM = "https://forms.justia.com/new-york/statewide/real-estate/title/residential-contract-of-sale-2000-long-form-42326.html";
const LEGALEASE_INSPECT = { text: "New York State Bar Association, LegalEase", href: "https://nysba.org/legalease-buying-and-selling-real-estate/" };
const READ = { text: "read November 1, 2026" };

export const TIMELINE_FLAGSHIP: FlagshipContent = {
  hero: {
    moment: "5",
    suffix: "phases",
    photo: "/images/lifestyle/selling.jpg",
    signature: "porchlight",
  },
  scenes: {
    /** The five phases as one numbered path, each with what sets its pace. Round 22: the typical
     * ranges are gone (the owner's rule), the two sourced time limits stand above the path. */
    glance: {
      kind: "steps",
      band: "dark",
      eyebrow: "The whole sale on one line",
      heading: "Five phases, and what sets the pace of each",
      lede: "Your deal sets the dates. The law fixes only a few of them.",
      alt: "The five phases of a New York home sale and what sets the pace of each: preparation, set by the house; on the market, set by price, condition and town; the contract stage, set by the attorneys; contract to closing, set by the dates written into the contract; then closing week; two fixed limits: the inspector's written report within five business days, and the disclosure statement before the buyer signs.",
      facts: [
        { figure: "5", title: "Business days for the inspector's written report" },
        { figure: "Before signing", title: "When the disclosure statement must reach the buyer" },
      ],
      steps: [
        { title: "Preparation", body: "Before the listing.", chips: [{ label: "Pace", value: "The house" }] },
        { title: "On the market", chips: [{ label: "Pace", value: "Price and town" }] },
        { title: "The contract stage", chips: [{ label: "Pace", value: "The attorneys" }] },
        { title: "Contract to closing", body: "The loan, the appraisal, the title.", chips: [{ label: "Pace", value: "The contract" }] },
        { title: "Closing week", body: "The walk-through, then the closing." },
      ],
      sources: [{ text: "Real Property Law 462", href: RPL_462 }, LEGALEASE_INSPECT, { text: "Standard residential contract, 11-2000", href: FORM }, READ],
    },

    /** The first moves in phase 1, and the state's form beside them. */
    "week-one": {
      kind: "tiles",
      band: "light",
      eyebrow: "Phase 1: the slow paper first",
      heading: "Three things to start before anything else",
      alt: "Three first moves for a seller: three comparable sales that truly match the house, the state's disclosure form DOS-1614-f (Rev. 02/25) with 56 questions required since July 1, 2025, and a pre-listing inspection for an older house.",
      columns: 3,
      tiles: [
        { figure: "3", title: "Recent nearby sales that truly match", body: "Adjusted for condition, size, updates and location." },
        { figure: "56", title: "Questions on DOS-1614-f (Rev. 02/25)", body: "Required since July 1, 2025, delivered before the buyer signs." },
        { title: "A pre-listing inspection", body: "For an older house: fix it or price it before a buyer finds it." },
      ],
      sources: [
        { text: "Real Property Law 462", href: RPL_462 },
        { text: "Department of State, DOS-1614-f (Rev. 02/25)", href: DOS_FORM },
        { text: "New York State Bar Association, Karl Holtzschue, February 28, 2024", href: NYSBA_PCDA },
        READ,
      ],
    },

    /** The offer board: the five comparisons the list gives, paired as the list pairs them. */
    offers: {
      kind: "grid",
      band: "dark",
      eyebrow: "Phase 2: reading an offer",
      heading: "Five things to compare, and price is only one",
      columns: 3,
      items: [
        { lead: "Price", body: "The headline, and the one term everyone sees first." },
        { lead: "Financing and pre-approval", body: "How sure the money is, which decides phase 4." },
        { lead: "Down payment and deposit", body: "How much the buyer has at stake." },
        { lead: "Contingencies", body: "Mortgage, inspection, appraisal: the ways out." },
        { lead: "Closing date and rent-back", body: "Whether the dates fit your move." },
      ],
    },

    /** The contract stage as a path, with the moment it binds marked, and the binder warning. */
    "contract-path": {
      kind: "steps",
      band: "light",
      eyebrow: "Phase 3: the New York contract stage",
      heading: "From an accepted offer to a signed contract",
      alt: "The New York contract stage in five steps: an accepted offer, the deal sheet to both attorneys, the contract drafted by an agent upstate or the seller's attorney downstate, the attorneys negotiating, and both sides signing, when rights and obligations are fixed and the buyer pays the deposit.",
      facts: [{ figure: "Escrow", title: "The deposit, held by the seller's attorney until closing" }],
      steps: [
        { title: "An offer is accepted", body: "Not yet a contract." },
        { title: "The deal sheet goes to both attorneys" },
        { title: "The contract is drafted", body: "Upstate, usually by an agent; downstate, usually by the seller's attorney." },
        { title: "The attorneys negotiate", body: "Inspection findings, the mortgage contingency, the deposit, what stays." },
        { title: "Both sides sign", body: "Rights and obligations are fixed; the deposit goes into escrow." },
      ],
      close: "Sign nothing earlier, a binder included, before your attorney reads it.",
      sources: [{ text: "New York State Bar Association, LegalEase", href: NYSBA_LEGALEASE }, { text: "Standard residential contract, 11-2000, paragraph 6", href: FORM }, READ],
    },

    /** Phase 4 as questions rather than a fixed sequence: the order varies with the contract. */
    "after-contract": {
      kind: "flow",
      band: "dark",
      eyebrow: "Phase 4: contract to closing",
      heading: "Three questions between a signed contract and a clear to close",
      lede: "The order varies with the contract and the loan; the inspection can even come before signing.",
      alt: "Three questions after the contract: if the appraisal comes in below the price, the loan is usually sized to the lower value and the parties choose among five outcomes; if the loan commitment does not come, the contract's financing terms decide; if the title search finds a lien or an old mortgage, the seller's attorney clears it; otherwise the lender issues a clear to close.",
      gates: [
        {
          ask: "Does the appraisal meet the price?",
          pass: "Yes",
          exit: "No",
          outcome: "The loan follows the lower value",
          detail: "Cash for the gap, a lower price, a split, a reconsideration of value, or a cancellation if the contract allows.",
        },
        {
          ask: "Does the loan commitment come through?",
          pass: "Yes",
          exit: "No",
          outcome: "The contract's financing terms decide",
          detail: "Which is why the strength of the financing mattered at the offer.",
        },
        {
          ask: "Does the title search come back clean?",
          pass: "Yes",
          exit: "No",
          outcome: "Your attorney clears it first",
          detail: "A paid-off mortgage never discharged is the common case.",
        },
      ],
      end: { title: "Clear to close", detail: "Then the walk-through and the closing." },
      sources: [
        { text: "Fannie Mae Selling Guide B2-1.2-01, topic dated June 1, 2022", href: FANNIE },
        { text: "Consumer Financial Protection Bureau, October 6, 2022", href: CFPB },
        { text: "New York State Bar Association, LegalEase", href: NYSBA_LEGALEASE },
        READ,
      ],
    },

    /** Closing week as the folder and the forms. */
    "closing-folder": {
      kind: "tiles",
      band: "light",
      eyebrow: "Phase 5: closing week",
      heading: "What the last week asks of you",
      alt: "Closing week for a seller: a folder of receipts and warranties for the walk-through, an empty and broom-clean house, the deed and the state's transfer tax return Form TP-584 (TP-584-NYC in the city) signed at closing, and the keys handed over.",
      columns: 2,
      tiles: [
        { title: "One folder on the counter", body: "Receipts and warranties for every agreed repair." },
        { title: "An empty, broom-clean house", body: "Movers booked before the walk-through." },
        { figure: "TP-584", title: "The transfer tax return, signed with the deed", body: "TP-584-NYC for a sale in New York City." },
        { title: "The keys", body: "The mortgage paid from the proceeds, the balance to you." },
      ],
      sources: [{ text: "Department of Taxation and Finance, TP-584-I (8/25)", href: TP584 }, READ],
    },

    /** The blueprint as five lines, each with who owns the stage. */
    blueprint: {
      kind: "summary",
      band: "light",
      eyebrow: "Who owns each stage",
      ariaLabel: "The five stages of the sale and who owns each one",
      claims: [
        "Strategy and preparation: you, with your agent and attorney.",
        "Launch and negotiation: your agent.",
        "The contract: the two attorneys, until both sides sign.",
        "The buyer's due diligence: the buyer, the lender and the title company.",
        "Closing: you and your attorney, with the buyer's side across the table.",
      ],
    },

    /** The four weeks before a listing, as a numbered path. */
    "first-month": {
      kind: "steps",
      band: "dark",
      eyebrow: "The month before the listing",
      heading: "Four weeks, in the order we suggest",
      alt: "Four weeks before a listing: week 1 an agent, an attorney, a market analysis and the disclosure form; week 2 a pre-listing inspection and decluttering; week 3 repairs, cleaning and the form filled in with the attorney; week 4 photos, the listing description, the two offer terms that matter and showing hours.",
      steps: [
        { title: "First week", body: "An agent, an attorney, a market analysis and the form." },
        { title: "Second week", body: "A pre-listing inspection if the house is older; decluttering and the fix list." },
        { title: "Third week", body: "Repairs and cleaning finished; the form filled in with your attorney." },
        { title: "Fourth week", body: "Photos, floor plan and description; two terms besides price; showing hours." },
      ],
      close: "Your house sets the pace; the weeks set the order.",
      sources: [{ text: "the post's own plan" }],
    },

    /** Who it fits, and the three cases it fits less well. */
    fit: {
      kind: "grid",
      band: "light",
      eyebrow: "Before you build your calendar",
      heading: "Does this timeline fit your sale?",
      columns: 2,
      items: [
        { lead: "It fits", body: "A one- to four-family house in New York, sold to a buyer with a mortgage, on a moving date you work back from." },
        { lead: "It fits less well", body: "An all-cash buyer, a co-op or condominium unit, or a house in another state." },
      ],
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
      passLine: "You can sketch your own calendar. If your dates are tight, call or write and we will build it around them with you.",
      failLine: "Under half this time. Reread the contract stage and phase 4, then have another go.",
      questions: TIMELINE_QUIZ,
    },

    /** The one ask at the end. */
    talk: {
      kind: "offer",
      band: "light",
      eyebrow: "Talk with us",
      text: "Bring your target date and we will count back through the five phases with you, and say which step is likely to be your slow one.",
      reassure: "A conversation, not a listing agreement. Nothing to sign.",
      action: { label: "Book a consultation", href: "/connect" },
      ariaLabel: "Book a consultation about your selling timeline",
    },
  },

  headingLabels: {
    "how-long-it-takes-to-sell-a-house-the-timeline-at-a-glance": "At a glance",
    "phase-1-preparation": "1. Preparation",
    "phase-2-on-the-market": "2. On the market",
    "phase-3-the-new-york-contract-stage": "3. The contract stage",
    "phase-4-from-contract-to-closing": "4. Contract to closing",
    "phase-5-closing-week": "5. Closing week",
    "your-home-selling-blueprint": "The blueprint",
    "what-to-do-first": "What to do first",
    "who-this-guide-fits": "Who it fits",
    "frequently-asked-questions": "Common questions",
  },
};
