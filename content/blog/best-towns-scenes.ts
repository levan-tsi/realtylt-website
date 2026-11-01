/** Scene copy for "Which Hudson Valley towns offer the best opportunities for real estate
 * investors?" (slug best-places-to-invest-hudson-valley).
 *
 * ROUND 21, 2026-11-01. The refresh came through the agents' content chain (draft, second reader,
 * final check) and was built here as a flagship. Each `scene:` line of the draft became one of the
 * scenes below, in the kinds the template supports; the draft's photographs and its "summary"
 * placeholders became figures drawn from the post's own facts. No stock photos.
 *
 * THE RULES THIS FILE IS HELD TO (the same as seller-disclosure-scenes.ts):
 *  - every number, date and source name printed here appears in the post;
 *  - scene copy is labels and short lines, never a body sentence repeated (flagship.test.ts walks
 *    every string for an eight-word echo);
 *  - an example the post invents is printed as one; no em dashes, sentence case.
 *
 * HUD's FY2027 two-bedroom figures are NOT drawn: huduser.gov refused a script on 2026-11-01, so
 * the benchmark scene teaches how to read the figure instead of printing one nobody read. */

import type { FlagshipContent } from "@/lib/blog/flagship";
import { BEST_TOWNS_QUIZ } from "./best-towns-quiz";

const HUD = "https://www.huduser.gov/portal/datasets/fmr.html";
const GOV_R8 = "https://www.governor.ny.gov/news/governor-hochul-announces-mid-hudson-winners-downtown-revitalization-initiative-and-ny-forward";
const GOV_PROJECTS = "https://governor.ny.gov/news/governor-hochul-announces-25-transformational-projects-mid-hudson-part-downtown-revitalization";
const GOV_R7 = "https://www.governor.ny.gov/news/governor-hochul-announces-mid-hudson-region-winners-seventh-round-downtown-revitalization";
const MTA = "https://away.mta.info/deals/dia-beacon-2024-2025/";
const KINGSTON_2022 = "https://kingston-ny.gov/filestorage/8399/8469/48370/ETPA_Implementation_Fact_Sheet_Kingston_New_York.pdf";
const KINGSTON_2025 = "https://www.kingston-ny.gov/filestorage/8399/8469/48370/City_of_Kingston_2025_Rental_Vacancy_Survey.pdf";
const COURT = "https://nycourts.gov/reporter/3dseries/2025/2025_03691.htm";
const READ = { text: "read November 1, 2026" };

export const BEST_TOWNS_FLAGSHIP: FlagshipContent = {
  hero: {
    moment: "5",
    suffix: "towns",
    photo: "/images/counties/rockland.jpg",
    signature: "porchlight",
  },
  scenes: {
    /** The four strategies as a map to the towns: what each one costs you, not the definitions
     * the list above already gives. */
    strategies: {
      kind: "grid",
      band: "dark",
      eyebrow: "Four strategies, five towns",
      heading: "Each strategy points to a town, and each one asks you to give something up",
      columns: 2,
      glow: true,
      items: [
        { lead: "Cash flow", body: "In this guide: Poughkeepsie. You give up: the bigger gain later." },
        { lead: "Appreciation", body: "In this guide: Beacon. You give up: income in the early years." },
        { lead: "Stability", body: "In this guide: White Plains. You give up: yield." },
        { lead: "Growth and revitalization", body: "In this guide: Kingston, and Newburgh for the experienced. You give up: certainty." },
      ],
    },

    /** The draft's three columns: who it fits, who it fits less well, where those readers go. */
    fit: {
      kind: "grid",
      band: "light",
      eyebrow: "Before you read the towns",
      heading: "Is this guide for you?",
      columns: 3,
      items: [
        { lead: "It fits", body: "A first rental, a unit or two added, a one- to five-unit building, or a house hack." },
        { lead: "It fits less well", body: "A home with no rental plan, a large older building in Kingston, or a first major rehab." },
        { lead: "Read instead", body: "The town pages and the home search, legal advice for Kingston, a building that rents close to as is." },
      ],
    },

    /** How to read a Fair Market Rent. The FY2027 county figures are waiting on the editor's
     * lookup, so the scene teaches the method and prints no number. */
    fmr: {
      kind: "steps",
      band: "dark",
      eyebrow: "The public benchmark",
      heading: "How to read a HUD Fair Market Rent",
      alt: "How to use a HUD Fair Market Rent: a two-bedroom figure with utilities included, set near the 40th percentile, fiscal 2027 in force from October 1, 2026, read for your county, set beside the seller's rent and checked against comparable listings above and below it.",
      facts: [
        { figure: "2 bedrooms", title: "The figure most investors use" },
        { figure: "40th", title: "Percentile of standard units, near where HUD sets it" },
        { figure: "FY2027", title: "In force from October 1, 2026" },
      ],
      steps: [
        { title: "Find your county's area on HUD USER", body: "Dutchess and Orange, Ulster, or Westchester, Putnam and Rockland." },
        { title: "Write the figure beside the seller's rent", body: "Utilities are included in HUD's figure, so check who pays them in the lease." },
        {
          title: "Check the street on both sides of it",
          body: "Comparable listings above and below the benchmark.",
          example: "An invented example: a renovated unit near the station asks well above it. Ask why before you believe it.",
        },
      ],
      close: "A benchmark, not a floor and not a ceiling.",
      sources: [{ text: "HUD USER, Fair Market Rents", href: HUD }, READ],
    },

    /** Poughkeepsie's anchors and the award, as a card of facts. */
    poughkeepsie: {
      kind: "tiles",
      band: "light",
      eyebrow: "Cash flow: the demand side",
      heading: "What sits under Poughkeepsie's tenant demand",
      alt: "A card of Poughkeepsie facts: a $10 million Downtown Revitalization Initiative award in the eighth round, 10 projects totaling $9.7 million named on May 14, 2026, 2,514 students at Vassar College and 6,382 at Marist University.",
      columns: 2,
      tiles: [
        { figure: "$10 million", title: "Downtown Revitalization Initiative, eighth round", body: "Mid-Hudson winner, March 11, 2025." },
        { figure: "10 projects", title: "Totaling $9.7 million", body: "Named by the state on May 14, 2026." },
        { figure: "2,514", title: "Students at Vassar College" },
        { figure: "6,382", title: "Students at Marist University" },
      ],
      note: "Demand is the town's half. Whether a price is moderate against its rent is each building's own test.",
      sources: [
        { text: "Governor's office, March 11, 2025", href: GOV_R8 },
        { text: "Governor's office, May 14, 2026", href: GOV_PROJECTS },
        { text: "Vassar College, about", href: "https://www.vassar.edu/about" },
        { text: "Marist University, about", href: "https://www.marist.edu/about" },
        READ,
      ],
    },

    /** Beacon: the street-level test as a flow, the draft's "balance" made into questions. */
    beacon: {
      kind: "flow",
      band: "dark",
      eyebrow: "Appreciation: the street-level test",
      heading: "Does this house carry itself, or is it a bet on growth?",
      lede: "About 80 minutes from Grand Central, and a short walk from the station to Dia Beacon. Then the numbers of one street.",
      alt: "A two-question test for a Beacon house: if the rent the street supports covers the monthly costs, it is a cash-flow buy; if not, and you cannot carry the gap from your own income, it is not your house; otherwise it is a bet on appreciation you can afford.",
      gates: [
        {
          ask: "Does the rent this street supports cover every monthly cost?",
          pass: "No",
          exit: "Yes",
          outcome: "It carries itself",
          detail: "A cash-flow buy, wherever it sits.",
        },
        {
          ask: "Can you carry the gap from your own income for years?",
          pass: "Yes",
          exit: "No",
          outcome: "Not your house",
          detail: "Thin early cash flow is the price of the bet.",
        },
      ],
      end: { title: "A bet on appreciation you can afford", detail: "Compare the price with the street's rent before you assume the trend continues." },
      sources: [{ text: "MTA, Dia Beacon package, 2024 to 2025", href: MTA }, { text: "the post's own test" }, READ],
    },

    /** White Plains: the facts behind the stability case. */
    "white-plains": {
      kind: "tiles",
      band: "light",
      eyebrow: "Stability: why look here",
      heading: "White Plains, by its public facts",
      alt: "A card of White Plains facts: Westchester's county government at 148 Martine Avenue, the federal courthouse at 300 Quarropas Street, a $10 million Downtown Revitalization Initiative award in the seventh round announced February 8, 2024, and the station the state calls the busiest in the lower Hudson Valley.",
      columns: 2,
      tiles: [
        { title: "Westchester's county government", body: "148 Martine Avenue." },
        { title: "Federal courthouse, Southern District of New York", body: "300 Quarropas Street." },
        { figure: "$10 million", title: "Downtown Revitalization Initiative, seventh round", body: "Announced February 8, 2024." },
        { title: "The busiest Metro-North station in the lower Hudson Valley", body: "In the state's own words." },
      ],
      note: "Reasons to look, not a promise about a building. Judge one on vacancy, tenure, condition and financing, then yield.",
      sources: [
        { text: "Westchester County government", href: "https://www.westchestercountyny.gov/" },
        { text: "U.S. District Court, Southern District of New York", href: "https://www.nysd.uscourts.gov/" },
        { text: "Governor's office, February 8, 2024", href: GOV_R7 },
        READ,
      ],
    },

    /** Kingston: the city's own vacancy counts, by survey year and, for 2025, by building size,
     * against the act's 5% line. Separate panels: different years, different samples. */
    "kingston-vacancy": {
      kind: "bars",
      band: "dark",
      label: "Kingston's vacancy",
      eyebrow: "The number the rule rests on",
      heading: "Kingston's vacancy in the buildings the act covers",
      lede: "Net vacancy, from the city's own surveys. The act's emergency line is 5%.",
      alt: "Bars of Kingston's net vacancy rate in buildings covered by the Emergency Tenant Protection Act: 6.7% in 2019, 1.57% in 2022 and 7.04% in 2025, and in 2025 by building size 7.91% for 6 to 14 units, 14.29% for 15 to 22 units and 3.73% for more than 22 units, against the act's 5% emergency line.",
      max: 16,
      panels: [
        {
          title: "By survey year",
          bars: [
            { label: "2019", value: 6.7, display: "6.7%" },
            { label: "2022", value: 1.57, display: "1.57%", lit: true, tag: "The survey behind the 2022 adoption" },
            { label: "2025", value: 7.04, display: "7.04%" },
          ],
        },
        {
          title: "2025, by building size",
          bars: [
            { label: "6 to 14 units", value: 7.91, display: "7.91%" },
            { label: "15 to 22 units", value: 14.29, display: "14.29%" },
            { label: "More than 22 units", value: 3.73, display: "3.73%", lit: true, tag: "Below the 5% line" },
          ],
        },
      ],
      callout: { figure: "5%", text: "The act's line for a housing emergency" },
      note: "Samples change between surveys: some buildings were later found exempt. A survey is not the rule; the city decides what follows it.",
      sources: [
        { text: "City of Kingston, 2025 Rental Vacancy Survey, published August 2025 (the 2019, 2022 and 2025 rates)", href: KINGSTON_2025 },
        { text: "City of Kingston, ETPA fact sheet, 2022", href: KINGSTON_2022 },
        READ,
      ],
    },

    /** Kingston's rule as dated events: adopted, upheld, surveyed again, and what we could not
     * find. True-date spacing; the open question is drawn hollow. */
    "kingston-timeline": {
      kind: "timeline",
      band: "light",
      eyebrow: "Kingston's rule, in order",
      heading: "Adopted, upheld, surveyed again",
      lede: "Spaced by the real calendar. The hollow dot is the day we looked for a city decision on the 2025 survey and found none.",
      alt: "A timeline of Kingston's rent rule: adopted in 2022 after a 1.57% vacancy survey, upheld by the Court of Appeals on June 18, 2025, surveyed again with a report published in August 2025 finding 7.04%, and no published city decision on that survey found when checked on November 1, 2026.",
      events: [
        { date: "2022-07-01", display: "2022", title: "Kingston adopts the act", detail: "After a vacancy survey found 1.57%." },
        { date: "2025-06-18", display: "June 18, 2025", title: "The Court of Appeals upholds the declaration", detail: "2025 NY Slip Op 03691." },
        { date: "2025-08-13", display: "August 2025", title: "The 2025 survey is published", detail: "7.04% in sampled covered buildings; 3.73% in those over 22 units." },
        {
          date: "2026-11-01",
          display: "November 1, 2026",
          title: "No published city decision found",
          detail: "Ask HCR and your attorney about a specific building.",
          pending: true,
        },
      ],
      sources: [
        { text: "City of Kingston, ETPA fact sheet, 2022", href: KINGSTON_2022 },
        { text: "New York Court of Appeals, June 18, 2025", href: COURT },
        { text: "City of Kingston, 2025 Rental Vacancy Survey", href: KINGSTON_2025 },
        READ,
      ],
    },

    /** Newburgh: who it suits and who should start elsewhere. */
    newburgh: {
      kind: "grid",
      band: "dark",
      eyebrow: "Newburgh: high risk, high potential",
      heading: "Who it suits, and who should start somewhere else",
      columns: 2,
      items: [
        { lead: "Suits", body: "Renovation experience, money in reserve, time to hold, and patience with a building department." },
        { lead: "Start elsewhere", body: "A first purchase, a short timeline, or no reserve for the months with no rent." },
      ],
    },

    /** The one sum every plan rests on, in the reader's own numbers. Multiplication only, so
     * every step is a row: the rent, the share kept, the year. */
    numbers: {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "What does this rent leave you in a year?",
      ariaLabel: "What a monthly rent leaves you in a year, in your own numbers",
      inputs: [
        {
          kind: "range",
          id: "rent",
          label: "Monthly rent the unit earns",
          hint: "The rent on the lease or the rent roll, not the asking rent of a vacant unit.",
          min: 800,
          max: 6000,
          step: 25,
          initial: 2000,
          format: "money",
          width: "w-[5.5rem]",
        },
        {
          kind: "range",
          id: "kept",
          label: "Share of the rent left after every monthly cost",
          hint: "After the mortgage payment, taxes, insurance, repairs, vacancy, management and any utilities you pay. Work it out from the building's own bills.",
          min: 0,
          max: 60,
          step: 1,
          initial: 12,
          format: "percent",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "Monthly rent", by: { from: "input", id: "rent" }, format: "money", unit: "a month" },
        { label: "Left after every monthly cost", by: { from: "input", id: "kept" }, format: "money", unit: "a month" },
        { label: "Left over a year", by: { from: "rate", value: 12, display: "x 12 months" }, format: "money", unit: "a year" },
      ],
      headline: 2,
      resultLabel: "Your cash flow in a year",
      note: "Your arithmetic, not a forecast: the share is your own estimate from the bills, and at zero the building does not carry itself. Divide the year by the cash you put in for the cash-on-cash return.",
      action: { label: "How to calculate ROI and cap rate", href: "/blog/calculate-roi-cap-rate-investment-property-ny" },
      secondary: { label: "Talk to Levan", href: "/connect" },
    },

    /** The four weeks, as a numbered path. */
    "first-month": {
      kind: "steps",
      band: "dark",
      eyebrow: "The first month",
      heading: "Four weeks from a strategy to a decision",
      alt: "A four-week plan: week 1 goals and markets, week 2 the HUD benchmark and the street, week 3 real buildings through the ROI guide, week 4 the local rules and a written decision to buy, keep looking or wait.",
      steps: [
        { title: "Week 1: goals and markets", chips: [{ label: "One page", value: "Strategy and numbers" }, { label: "Towns", value: "One primary, one backup" }] },
        { title: "Week 2: the benchmark and the street", chips: [{ label: "HUD USER", value: "Your county's figure" }, { label: "Listings", value: "Above and below it" }] },
        { title: "Week 3: buildings", chips: [{ label: "The ROI guide", value: "Block and building" }] },
        { title: "Week 4: rules and a decision", chips: [{ label: "Check", value: "Stabilization, registration, short-term limits" }, { label: "Write", value: "Buy, keep looking or wait" }] },
      ],
      close: "Start week 1 tonight.",
      sources: [{ text: "the post's own plan" }],
    },

    /** The ten-question check, the owner's rule for every long post. The RealtyLT result states
     * are the dark house and the porch light, never the AI brand's brain. */
    quiz: {
      kind: "quiz",
      band: "night",
      label: "Quiz",
      ariaLabel: "Quiz: what did you learn",
      eyebrow: "Ten questions",
      title: "What did you learn? Check it in two minutes",
      brand: "realtylt",
      passLine: "You can match a town to a strategy. If one building is on your mind, call or write and we will run its numbers with you.",
      failLine: "Under half this time. Reread the strategies and the Kingston section, then have another go.",
      questions: BEST_TOWNS_QUIZ,
    },
  },

  headingLabels: {
    "first-choose-a-strategy": "Choose a strategy",
    "who-this-guide-fits": "Who it fits",
    "a-public-benchmark-for-hudson-valley-real-estate-rents": "The rent benchmark",
    "cash-flow-poughkeepsie": "Poughkeepsie",
    "appreciation-beacon": "Beacon",
    "stability-white-plains": "White Plains",
    "growth-with-rules-to-know-kingston": "Kingston",
    "high-risk-high-potential-newburgh": "Newburgh",
    "your-investment-plan": "Your plan",
    "what-to-do-first": "The first month",
    "frequently-asked-questions": "Common questions",
  },
};
