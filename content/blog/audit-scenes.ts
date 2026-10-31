/** Scene copy for "How to use AI in my business" (slug ai-audit-small-business-what-not-to-automate).
 *
 * ROUND 14, 2026-10-30: REBUILT FROM THE REFRESHED POST. The refresh (company/pieces/ai/
 * ai-audit-small-business-what-not-to-automate/post.md, approved after the review chain) cut the
 * 2018 Census module, the 2013 Oxford study and every scene built on them, and replaced them with
 * three 2026 sources. The earlier fourteen scenes are in git history; none of their copy survives
 * here, because a scene may only print what the approved post says.
 *
 * Each scene below draws one data point from the piece's visuals/data-points.md: dp1 who uses AI,
 * dp2 where the use goes, dp3 use by firm size, dp4 what it did to the work, dp5 the three
 * questions with dp7's invented example run on them, dp6 the five steps. The three questions are
 * the post's infographic; the five summary lines are the data points' "one infographic of the
 * whole post"; the free file is the offer.
 *
 * THE RULES: every number, date and source name printed here appears word for word in the post;
 * no body sentence is repeated (flagship.test.ts walks every string); no em dashes; sentence
 * case; no claim the post does not make. Shares are drawn on full tracks, and counts from
 * different questions or reference periods never share one reading. */

import type { FlagshipContent } from "@/lib/blog/flagship";

const CENSUS_STORY = "https://www.census.gov/library/stories/2026/05/ai-use-businesses.html";
const CES = "https://www2.census.gov/library/working-papers/2026/adrm/ces/CES-WP-26-25.pdf";
const FED =
  "https://www.clevelandfed.org/collections/press-releases/2026/pr-20260303-fed-survey-small-business-optimism-wanes-as-performance-metrics-hold-steady";
const NIST = "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";
const READ = { text: "read October 29, 2026" };
const CES_SOURCE = { text: "Bonney and others, working paper CES 26-25, Census Bureau, April 2026", href: CES };

export const AUDIT_FLAGSHIP: FlagshipContent = {
  /** Held moment: the count of the post's own method, the three questions. Not a statistic. */
  hero: {
    moment: "3",
    suffix: "questions",
    photo: "/images/editorial/abacus.jpg",
    signature: "porchlight",
  },
  scenes: {
    "in-short": {
      kind: "summary",
      band: "light",
      ariaLabel: "In short",
      eyebrow: "In short",
      claims: [
        "About one firm in five uses AI inside a business function; close to one in two has someone using a tool.",
        "The use goes to sales and marketing first, and most users run it in three or fewer functions.",
        "It adds to the work people already do: about 2 percent of AI-using firms cut staff and about 2.3 percent hired.",
        "Three questions cross ideas off: often enough to be noticed, a rule a new hire can follow, a wrong answer a person sees first.",
        "What stays with a person, and the order the rest is built in: the most contained worst day first.",
      ],
    },

    /** dp3: two panels, two reference periods, never one axis unlabelled. */
    "by-firm-size": {
      kind: "bars",
      band: "dark",
      eyebrow: "Use of AI by firm size",
      heading: "The largest firms use it most",
      lede: "Two surveys with different reference periods: read each panel on its own.",
      alt: "Two panels from two surveys with different reference periods: firms with 250 or more employees used AI at 37 percent and firms with four or fewer under 20 percent, and firms with 1 to 4 employees were at 18 percent with about 21 percent expected within six months.",
      panels: [
        {
          title: "Business Trends and Outlook Survey, as of May 3, 2026",
          bars: [
            { label: "250 or more employees", value: 37, display: "37 percent", lit: true },
            {
              label: "Four or fewer employees",
              value: 20,
              display: "under 20 percent",
              hollow: true,
              tag: "An upper bound, drawn as an outline",
            },
          ],
        },
        {
          title: "Census working paper, November 2025 to January 2026",
          bars: [
            { label: "1 to 4 employees, using AI now", value: 18, display: "18 percent", lit: true },
            {
              label: "1 to 4 employees, within six months",
              value: 21,
              display: "about 21 percent",
              hollow: true,
              tag: "An expectation, drawn as an outline",
            },
          ],
        },
      ],
      sources: [{ text: "Census Bureau, May 26, 2026", href: CENSUS_STORY }, CES_SOURCE, READ],
      note: "Solid bars are measured shares. Outlines are a bound or an expectation, not a measurement.",
    },

    /** dp1: three bars, each labelled with what its survey counted. */
    "who-uses-ai": {
      kind: "bars",
      band: "light",
      eyebrow: "Different questions, different counts",
      heading: "One firm in five, or close to one in two",
      alt: "Three bars from three surveys: 19.8 percent of US businesses used AI as of May 3, 2026, 18 percent used it in a business function between November 2025 and January 2026, and 46 percent of firms with 1 to 499 employees had the business or its employees using AI in some way.",
      panels: [
        {
          bars: [
            {
              label: "Use AI, all US businesses",
              tag: "Business Trends and Outlook Survey, as of May 3, 2026",
              value: 19.8,
              display: "19.8 percent",
              lit: true,
            },
            {
              label: "Used AI in a business function",
              tag: "Census working paper, November 2025 to January 2026",
              value: 18,
              display: "18 percent",
            },
            {
              label: "Business or employees use AI in some way",
              tag: "Small Business Credit Survey, 1 to 499 employees, released March 3, 2026",
              value: 46,
              display: "46 percent",
            },
          ],
        },
      ],
      sources: [
        { text: "Census Bureau, May 26, 2026", href: CENSUS_STORY },
        CES_SOURCE,
        {
          text: "Federal Reserve Banks, March 3, 2026, 6,525 responses, fielded September 3 to November 14, 2025",
          href: FED,
        },
        READ,
      ],
      note: "Three surveys asked three different questions, so the bars are not one series and do not add up.",
    },

    /** dp2: three bars and one callout for the 57 percent. */
    "where-it-goes": {
      kind: "bars",
      band: "dark",
      eyebrow: "Among firms using AI",
      heading: "Sales and marketing first",
      alt: "Among firms using AI, 52 percent use it in sales and marketing, 45 percent in strategy and business development and 41 percent in IT, and 57 percent use it in three or fewer functions.",
      panels: [
        {
          bars: [
            { label: "Sales and marketing", value: 52, display: "52 percent", lit: true },
            { label: "Strategy and business development", value: 45, display: "45 percent" },
            { label: "IT", value: 41, display: "41 percent" },
          ],
        },
      ],
      callout: { figure: "57 percent", text: "of the users had AI in three or fewer functions." },
      sources: [CES_SOURCE, READ],
      note: "Shares of the firms using AI, not of all firms. One firm can use it in several functions, so the bars do not add up.",
    },

    /** dp4: separate tracks, never one grid, because one firm can give both answers. */
    "the-person-stays": {
      kind: "bars",
      band: "light",
      eyebrow: "What AI did to the work",
      heading: "The person stays",
      lede: "Each bar is its own share of the firms using AI. One firm can be in more than one count.",
      alt: "Four separate bars for firms using AI: 44 percent said it added to tasks their workers already do, about 5 percent reported any change in headcount, 2.3 percent up and 2.0 percent down.",
      panels: [
        {
          title: "Tasks",
          bars: [
            { label: "Said AI added to tasks their workers already do", value: 44, display: "44 percent", lit: true },
          ],
        },
        {
          title: "Headcount",
          bars: [
            { label: "Any change in headcount", value: 5, display: "about 5 percent" },
            { label: "Headcount up", value: 2.3, display: "2.3 percent" },
            { label: "Headcount down", value: 2.0, display: "2.0 percent" },
          ],
        },
      ],
      sources: [CES_SOURCE, READ],
    },

    /** dp5, the infographic of the post: three gates in order, every no into one tray, and
     * dp7's invented example run on them in words. */
    "three-gates": {
      kind: "flow",
      band: "dark",
      eyebrow: "The three questions, in order",
      heading: "Any one no is enough to cross an idea off",
      alt: "A track runs past three gates, how often a job happens, whether its rule can be written down for a new hire, and where a wrong answer lands, and a no at any gate sends the idea into a tray marked not building with its reason, while what survives is ranked by its worst day.",
      tray: "Not building",
      gates: [
        {
          ask: "Does it happen often enough that a failure gets noticed within a week?",
          pass: "Yes",
          exit: "No",
          outcome: "Too rare for a break to be found",
          detail: "Weekly or more is a yes; quarterly is almost always a no.",
        },
        {
          ask: "Can the rule be written down for a new hire?",
          pass: "Yes",
          exit: "No",
          outcome: "No settled rule yet",
          detail: "Deciding the rule comes first. Ask three people, separately.",
        },
        {
          ask: "Does a wrong answer land where a person sees it first?",
          pass: "Yes",
          exit: "No",
          outcome: "It would land on a customer",
          detail: "Better software does not change this answer.",
        },
      ],
      end: {
        title: "Rank what survives by its worst day",
        detail: "The most contained failure goes first.",
      },
      example: "Eleven ideas in, four crossed off at the three questions, seven left to rank.",
      sources: [{ text: "our method" }, { text: "NIST AI 100-1, January 2023, checked current October 29, 2026", href: NIST }],
      note: "Avoiding a risk is one of the four responses the framework lists, which makes not building a legitimate result.",
    },

    /** dp6: the five steps as one card. */
    "one-evening": {
      kind: "steps",
      band: "light",
      eyebrow: "One evening, then two weeks",
      heading: "Run the test yourself",
      alt: "A checklist of five steps for one evening, from writing every idea down to reading the list again in two weeks, ending with the line that what is left is usually short.",
      steps: [
        { title: "Write every idea down, without judging it" },
        { title: "Ask three people the rule question, separately" },
        { title: "Note where a wrong answer would land, and who would find out", body: "Before writing any benefit." },
        { title: "Cross off what lands on a customer, and what lands on nobody" },
        { title: "Read the list again in two weeks" },
      ],
      close: "What is left is usually short.",
      sources: [{ text: "our method" }],
    },

    /** The free file's line. */
    sheet: {
      kind: "offer",
      band: "light",
      eyebrow: "The free file",
      text: "The three-question sheet: one page with the three columns ready and the five steps under them.",
      reassure: "A free printable PDF, one page. Nothing to sign up for.",
      action: { label: "Download the sheet", href: "/downloads/three-question-sheet.pdf" },
      ariaLabel: "Download the free three-question sheet",
    },
  },

  headingLabels: {
    "what-small-firms-do-with-ai-in-2026": "AI in small firms",
    "where-the-use-goes-and-what-it-does-to-the-team": "Where the use goes",
    "the-three-questions-that-cross-ideas-off": "The three questions",
    "what-we-leave-with-a-person": "Left with a person",
    "rank-what-survives-by-its-worst-day": "Rank by worst day",
    "why-this-page-gives-no-failure-rate-for-ai-projects": "No failure rate",
    "run-the-test-yourself-in-one-evening-and-read-it-again-in-two-weeks": "Run it yourself",
  },
};
