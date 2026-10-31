/** Scene copy for "How to use AI in my business" (slug ai-audit-small-business-what-not-to-automate).
 *
 * ROUND 15, 2026-10-31: REBUILT ON THE OWNER'S VERDICT. Round 14 shrank the post to 1,779 words and
 * eight scenes; he preferred the older, bigger version ("our old blogs are bigger, better and more
 * detailed because we ran multiple publishing rounds on them; they just have older data"). So the
 * post got its depth back, with the 2026 data in place of the 2018 and 2013 figures, and these
 * scenes are its figures: every one meant to be reused as a frame of the long-form video, then
 * cut into shorts and carousels.
 *
 * New in this round: the firm-size chart reads ONE survey and ONE reference period (round 14 put
 * two surveys side by side, which confused him); use by trade; why the rest say no; the four
 * checks for who stays on the job; how the audit runs; the six groups of questions; the three
 * verdicts; two relatable photographs; and the quiz.
 *
 * THE RULES: every number, date and source name printed here appears word for word in the post;
 * no body sentence of eight words or more is repeated (flagship.test.ts walks every string); no
 * em dashes; sentence case; no claim the post does not make. Shares are drawn on full tracks, and
 * counts from different questions or reference periods never share one reading. */

import type { FlagshipContent } from "@/lib/blog/flagship";

const CENSUS_STORY = "https://www.census.gov/library/stories/2026/05/ai-use-businesses.html";
const CES = "https://www2.census.gov/library/working-papers/2026/adrm/ces/CES-WP-26-25.pdf";
const FED =
  "https://www.clevelandfed.org/collections/press-releases/2026/pr-20260303-fed-survey-small-business-optimism-wanes-as-performance-metrics-hold-steady";
const NIST = "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf";
const READ = { text: "read October 31, 2026" };
const STORY_SOURCE = { text: "Census Bureau, May 26, 2026", href: CENSUS_STORY };
const CES_SOURCE = { text: "Bonney and others, working paper CES 26-25, Census Bureau, April 2026", href: CES };
const METHOD = { text: "our method" };

export const AUDIT_FLAGSHIP: FlagshipContent = {
  /** Held moment: the count of the post's own method, the three questions. Not a statistic. The
   * field behind it is a front desk with the phone in use, the owner's "relatable" ask. */
  hero: {
    moment: "3",
    suffix: "questions",
    photo: "/images/editorial/front-desk-phone.jpg",
    signature: "porchlight",
  },
  scenes: {
    "in-short": {
      kind: "summary",
      band: "light",
      ariaLabel: "In short",
      eyebrow: "In short",
      claims: [
        "About one firm in five uses AI inside a business function; close to one in two has someone using a tool somewhere.",
        "The use is narrow: sales and marketing first, and most users run it in three or fewer functions.",
        "It adds to the work people already do: 2.3 percent of AI-using firms added staff and 2.0 percent cut.",
        "Three questions cross ideas off: often enough to be noticed, a rule a new hire can follow, a wrong answer a person sees first.",
        "Rank what survives by its worst day, and keep a person on anything a customer sees.",
      ],
    },

    deliverable: {
      kind: "tiles",
      band: "light",
      eyebrow: "What you hold at the end",
      heading: "Shorter than the list you brought",
      alt: "Four things an owner should hold at the end of a good audit: a written account of the work, an order with reasons, the list of what will not be built, and a plan for the first build.",
      columns: 2,
      tiles: [
        {
          title: "A written account of how the work runs now",
          body: "Including the workaround somebody invented years ago that the office now depends on.",
        },
        {
          title: "An order, with the reason beside each position",
          body: "So the order survives somebody asking why the third item is not the first.",
        },
        {
          title: "The list of what you will not build",
          body: "The half nobody writes down. Its reasons are the part you use again.",
        },
        {
          title: "A plan for the first build",
          body: "Picked by its worst day, with the person who approves it named.",
        },
      ],
      sources: [METHOD],
    },

    /** dp1: three surveys, three questions, three panels. Never one reading. */
    "who-uses-ai": {
      kind: "bars",
      band: "light",
      label: "Who uses AI",
      eyebrow: "Different questions, different counts",
      heading: "One firm in five, or close to one in two",
      lede: "Three surveys asked three different questions. Read each panel on its own.",
      alt: "Three panels from three surveys: 19.8 percent of US businesses used AI in a business function as of May 3, 2026, 18 percent of firms did between November 2025 and January 2026, and 46 percent of firms with 1 to 499 employees had the business or its employees using AI in some way.",
      panels: [
        {
          title: "Business Trends and Outlook Survey, as of May 3, 2026",
          bars: [{ label: "Used AI in any business function, all US businesses", value: 19.8, display: "19.8 percent", lit: true }],
        },
        {
          title: "Census working paper, November 2025 to January 2026",
          bars: [{ label: "Used AI in a business function", value: 18, display: "18 percent", lit: true }],
        },
        {
          title: "Small Business Credit Survey, fielded September 3 to November 14, 2025",
          bars: [
            {
              label: "Business or employees use AI in some way",
              tag: "Firms with 1 to 499 employees",
              value: 46,
              display: "46 percent",
              lit: true,
            },
          ],
        },
      ],
      sources: [STORY_SOURCE, CES_SOURCE, { text: "Federal Reserve Banks, March 3, 2026, 6,525 responses", href: FED }, READ],
      note: "The three counts answer different questions, so they are not one series and they do not add up.",
    },

    /** dp3, rebuilt: one survey, one reference period, now against six months on. */
    "by-firm-size": {
      kind: "bars",
      band: "dark",
      eyebrow: "Use of AI by firm size, now and in six months",
      heading: "The bigger the firm, the bigger the jump it plans",
      lede: "One survey and one reference period, November 2025 to January 2026.",
      alt: "Three pairs of bars from one Census working paper: firms with 1 to 4 employees at 18 percent and about 21 percent expected, firms with 100 to 249 employees at 25 percent and 34 percent expected, and firms with 250 or more employees at 31 percent and 40 percent expected.",
      panels: [
        {
          title: "1 to 4 employees",
          bars: [
            { label: "Using AI", value: 18, display: "18 percent", lit: true },
            { label: "Expected within six months", value: 21, display: "about 21 percent", hollow: true },
          ],
        },
        {
          title: "100 to 249 employees",
          bars: [
            { label: "Using AI", value: 25, display: "25 percent", lit: true },
            { label: "Expected within six months", value: 34, display: "34 percent", hollow: true },
          ],
        },
        {
          title: "250 or more employees",
          bars: [
            { label: "Using AI", value: 31, display: "31 percent", lit: true },
            { label: "Expected within six months", value: 40, display: "40 percent", hollow: true },
          ],
        },
      ],
      sources: [CES_SOURCE, READ],
      note: "Solid bars are measured use. Outlines are what the firms expected, not a measurement.",
    },

    "by-sector": {
      kind: "bars",
      band: "light",
      eyebrow: "Use of AI by trade, as of May 3, 2026",
      heading: "Information and finance lead, retail trails",
      alt: "Four bars from the Census Bureau's survey as of May 3, 2026: the Information sector at 39.7 percent, Finance and Insurance at 33.9 percent, all businesses at 19.8 percent and Retail Trade at around 14 percent.",
      panels: [
        {
          bars: [
            { label: "Information", value: 39.7, display: "39.7 percent" },
            { label: "Finance and Insurance", value: 33.9, display: "33.9 percent" },
            { label: "All businesses", value: 19.8, display: "19.8 percent", lit: true },
            { label: "Retail Trade", value: 14, display: "around 14 percent" },
          ],
        },
      ],
      sources: [STORY_SOURCE, READ],
      note: "Shares of the businesses in each sector, from one survey reading.",
    },

    "why-not": {
      kind: "bars",
      band: "dark",
      eyebrow: "Among firms with no plans for AI",
      heading: "Most say it does not apply to them",
      alt: "Among firms with no plans to use AI, 65 percent said it is not applicable to the business, 22 percent named a lack of knowledge of what AI can do, and 20 percent named concerns about privacy or security.",
      panels: [
        {
          bars: [
            { label: "AI is not applicable to the business", value: 65, display: "65 percent", lit: true },
            { label: "Not knowing what AI can do", value: 22, display: "22 percent" },
            { label: "Concerns about privacy or security", value: 20, display: "20 percent" },
          ],
        },
      ],
      sources: [CES_SOURCE, READ],
      note: "A firm could give more than one reason, so the bars do not add up.",
    },

    /** dp2: four bars and one callout for the 57 percent. */
    "where-it-goes": {
      kind: "bars",
      band: "light",
      eyebrow: "Among firms using AI",
      heading: "Sales and marketing first",
      alt: "Among firms using AI in a business function, 52 percent use it in sales and marketing, 45 percent in strategy and business development, 41 percent in IT and 40 percent in research and development, and 57 percent use it in three or fewer functions.",
      panels: [
        {
          bars: [
            { label: "Sales and marketing", value: 52, display: "52 percent", lit: true },
            { label: "Strategy and business development", value: 45, display: "45 percent" },
            { label: "IT", value: 41, display: "41 percent" },
            { label: "Research and development", value: 40, display: "40 percent" },
          ],
        },
      ],
      callout: { figure: "57 percent", text: "of the users had AI in three or fewer functions; 24 percent in only one." },
      sources: [CES_SOURCE, READ],
      note: "Shares of the firms using AI, not of all firms. One firm can use it in several functions, so the bars do not add up.",
    },

    /** dp4: separate tracks, because one firm can give several answers. */
    "the-person-stays": {
      kind: "bars",
      band: "dark",
      label: "The person stays",
      eyebrow: "What AI did to the work",
      heading: "The person stays",
      lede: "Each bar is its own share of the firms using AI. One firm can be in more than one count.",
      alt: "Separate bars for firms using AI: 44 percent said it added to tasks workers already do, about 10 percent that it did a task an employee used to do, about 11 percent that it brought in a new task, about 5 percent reported any change in headcount with 2.3 percent up and 2.0 percent down, and 16 percent replaced software or equipment with AI tools.",
      panels: [
        {
          title: "Tasks",
          bars: [
            { label: "Added to tasks workers already do", value: 44, display: "44 percent", lit: true },
            { label: "Took on a task an employee did before", value: 10, display: "about 10 percent" },
            { label: "Brought in a new task", value: 11, display: "about 11 percent" },
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
        {
          title: "Software and equipment",
          bars: [{ label: "Replaced existing software or equipment with AI tools", value: 16, display: "16 percent" }],
        },
      ],
      callout: { figure: "66 percent", text: "of firms with any change to tasks saw only AI helping a person with their work." },
      sources: [CES_SOURCE, READ],
    },

    "plate-counter": {
      kind: "plate",
      band: "light",
      src: "/images/editorial/bakery-counter.jpg",
      alt: "A neighbourhood bakery counter: croissants, brioche and pastries on red plates with handwritten labels, coffee urns on the shelf behind and a worker at the back of the shop.",
      caption:
        "Every label on this counter was written by hand, by someone who knows the regulars. The reorders, invoices and reminders behind it are the repeated work worth a look.",
      credit: "Photo: Infrogmation of New Orleans, CC BY 2.0.",
      ariaLabel: "A bakery counter",
    },

    /** dp5, the infographic of the post: three gates in order, every no into one tray. */
    "three-gates": {
      kind: "flow",
      band: "dark",
      label: "The three questions",
      eyebrow: "The three questions, in order",
      heading: "Any one no is enough to cross an idea off",
      alt: "A track runs past three gates, how often a job happens, whether its rule can be written down for a new hire, and where a wrong answer lands, and a no at any gate sends the idea into a tray marked not building, while what survives is ranked by its worst day.",
      tray: "Not building",
      gates: [
        {
          ask: "Does it happen often enough that a failure gets noticed within a week?",
          pass: "Yes",
          exit: "No",
          outcome: "Too rare for a break to be found",
          detail: "A weekly job reports its own failure. A quarterly one hides it.",
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
      example: "Eleven ideas in, four crossed off at the three questions.",
      sources: [METHOD, { text: "NIST AI 100-1, January 2023, checked current October 31, 2026", href: NIST }],
      note: "Avoiding a risk is one of the four responses the framework lists, which makes not building a legitimate result.",
    },

    "shortlist-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many of your ideas are still standing at the end?",
      ariaLabel: "How many automation ideas survive the three questions",
      inputs: [
        {
          kind: "range",
          id: "candidates",
          label: "Ideas you could name right now that you would hand to AI",
          hint: "Write them on paper first, without judging any of them.",
          min: 3,
          max: 40,
          step: 1,
          initial: 12,
          format: "count",
          width: "w-[4rem]",
        },
        {
          kind: "range",
          id: "often",
          label: "Share that happen often enough for a failure to be noticed within a week",
          hint: "Weekly or more counts. Quarterly almost never does.",
          min: 10,
          max: 100,
          step: 5,
          initial: 65,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "writable",
          label: "Share whose rule you could write down for a new hire",
          hint: "If the honest answer starts with it depends, count it out.",
          min: 10,
          max: 100,
          step: 5,
          initial: 70,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "safe",
          label: "Share where a wrong answer would reach a person before a customer",
          hint: "Not whether it would be wrong. Where it would land if it were.",
          min: 10,
          max: 100,
          step: 5,
          initial: 60,
          format: "percent",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "Ideas you can name", by: { from: "input", id: "candidates" }, format: "count", unit: "ideas" },
        { label: "Happening often enough", by: { from: "input", id: "often" }, format: "count", unit: "ideas" },
        { label: "With a rule you could write down", by: { from: "input", id: "writable" }, format: "count", unit: "ideas" },
        { label: "Where a wrong answer lands somewhere safe", by: { from: "input", id: "safe" }, format: "count", unit: "left" },
      ],
      headline: 3,
      resultLabel: "Ideas still standing at the end",
      note: "Shares produce fractions, so read anything with a decimal as a rough count. Move the last slider first: it usually moves the answer most. This counter puts no number on a failure rate, a payback period or the cost of a build, on purpose.",
    },

    "do-not": {
      kind: "tiles",
      band: "light",
      label: "Not to automate",
      eyebrow: "What stays with a person",
      heading: "Four kinds of work we leave alone",
      alt: "Four kinds of work that stay with a person: facts a customer relies on unless read from the record, judgment calls made a few times a year, anything whose failure is silent, and anything you would be embarrassed to say a machine did.",
      columns: 2,
      tiles: [
        { title: "Facts a customer relies on", body: "Prices, policies, appointment rules: read from the record, or say there is none." },
        { title: "Rare judgment calls", body: "Taking on a client, changing a price, letting a customer go." },
        { title: "Anything whose failure is silent", body: "If nothing visibly goes wrong when it stops, nobody finds out for months." },
        { title: "Anything you would be embarrassed to explain", body: "The free test, applied before the other three." },
      ],
      sources: [METHOD],
    },

    "stay-on-job": {
      kind: "tiles",
      band: "dark",
      label: "Who stays on the job",
      eyebrow: "The four checks",
      heading: "One yes, and a person approves every result",
      lede: "We run every job past these four before deciding who runs it.",
      alt: "Four checks for every job: whether the result binds the business, reaches a customer, feeds another system people act on, or could damage trust if wrong, with one yes meaning a person approves every result.",
      columns: 2,
      tiles: [
        { figure: "1", title: "It binds the business", body: "A price, a contract, a payment, a promised date." },
        { figure: "2", title: "It reaches a customer", body: "Or anyone outside the office." },
        { figure: "3", title: "It feeds another system", body: "The schedule or the books that people act on." },
        { figure: "4", title: "It could damage trust if it is wrong", body: "The question to ask out loud, not to assume." },
      ],
      sources: [METHOD],
      note: "Two or more yes answers: the binding part, such as setting a price or signing, stays with the person alone.",
    },

    "plate-garage": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/mechanic-laptop.jpg",
      alt: "A mechanic in a repair shop leans over the open bonnet of a car, reading a diagnostic program on a laptop set on the engine bay.",
      caption: "The laptop reads the fault codes. The mechanic decides what the car needs, and tells the customer.",
      credit: "Photo: Shixart1985 (Nenad Stojković), CC BY 2.0, via Wikimedia Commons.",
      ariaLabel: "A mechanic with a laptop",
    },

    "audit-path": {
      kind: "steps",
      band: "light",
      eyebrow: "From one job to the first build",
      heading: "Six steps, and the third does the most work",
      alt: "Six steps from a written account of one job, through naming every idea, cutting the list with the three questions, ordering what survives, building the first one small, to reading the list again months later.",
      steps: [
        { title: "The account", body: "One real job, written down as it ran." },
        { title: "The ideas", body: "Every one you can name, unjudged." },
        { title: "The cuts", body: "The three questions, one at a time." },
        { title: "The order", body: "Worst day first, a settled rule second, the size of the saving last." },
        { title: "The first build", body: "Small, visible when it fails, with a person approving." },
        { title: "The re-read", body: "The same list, months later, because the business moved." },
      ],
      sources: [METHOD],
    },

    "audit-day": {
      kind: "steps",
      band: "dark",
      label: "How the audit runs",
      eyebrow: "If you ask us to run it",
      heading: "What happens, in order",
      alt: "The audit in order: a short note before the call, about 75 minutes with the owner, about 20 minutes with each person who does a repeated job, notes back within two business days, the scoring, the report and a 30 minute readout, then the route the owner picks.",
      facts: [
        { figure: "75 minutes", title: "on the call with you" },
        { figure: "20 minutes", title: "with everyone who repeats a job" },
        { figure: "Two business days", title: "for our notes to come back to you" },
      ],
      steps: [
        { title: "Before the call", body: "Bring the person who does the admin, and rough numbers for three months." },
        { title: "The call", body: "The last real week, walked through. Nothing pitched." },
        { title: "The people who do the work", body: "Where they wait, and what they do so it does not go wrong." },
        { title: "The notes", body: "Sent back to you to correct, with one question: is anything missing?" },
        { title: "The scoring", body: "Every step labelled, impact and risk with reasons, one verdict per job." },
        { title: "The report and the readout", body: "About three business days after the last interview, then about 30 minutes together." },
        { title: "The route you pick", body: "We build and run it, or we build it with your person and hand it over. You own it." },
      ],
      sources: [METHOD],
    },

    "six-groups": {
      kind: "tiles",
      band: "light",
      eyebrow: "The questions we ask",
      heading: "Six groups, answered alone before any call",
      alt: "The audit questions in six groups: the business in five minutes, last week walked through, the job list, the numbers, what you want to build, and what you would never hand to a machine.",
      columns: 3,
      tiles: [
        { title: "The business in five minutes", body: "Questions 1 to 3: what you sell, what a customer is worth, how many enquiries." },
        { title: "Last week, walked through", body: "Questions 4 to 6: one real day, one real job, one evening enquiry." },
        { title: "The job list", body: "Questions 7 to 10: double typing, and what would break if a job stopped." },
        { title: "The numbers", body: "Questions 11 and 12: what an hour costs, and the calls that go unanswered." },
        { title: "What you want to build", body: "Questions 13 to 15: the task you resent, the 40 hours, the number that moves." },
        { title: "Never handed to a machine", body: "Questions 16 to 18: your limits, your approvals, what is sensitive." },
      ],
      sources: [METHOD],
    },

    report: {
      kind: "tiles",
      band: "dark",
      label: "What you get",
      eyebrow: "Every job gets one verdict",
      heading: "Three verdicts, each with its reason",
      alt: "The three verdicts in the report: let a system run it, keep a person on it, or leave it alone, each written with its reason.",
      columns: 3,
      tiles: [
        { title: "Let a system run it", body: "Fixed steps a system does the same way every time, with nothing reaching a customer." },
        { title: "Keep a person on it", body: "The system prepares, a person approves, and the send step waits for that approval." },
        { title: "Leave it alone", body: "Too small, too rare, or nobody would notice it stopping. The reason is written down." },
      ],
      sources: [METHOD],
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
      sources: [METHOD],
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

    /** The roadmap the owner asked for (2026-10-31): the order to apply the post alone. */
    roadmap: {
      kind: "steps",
      band: "dark",
      label: "Your roadmap",
      eyebrow: "On your own, week by week",
      heading: "From one written job to one measured result",
      alt: "A five-stage roadmap: in week one write one job down and run the evening test, in weeks two and three let the list sit and settle the rules, in week four pick the idea with the smallest worst day, in weeks five to eight run a four-week trial with a person approving, and every few months read the list again.",
      steps: [
        { title: "Week one", body: "One job written down, the questions answered, the evening test run." },
        { title: "Weeks two and three", body: "The list rests. Rules get decided. Tools you already pay for get checked first." },
        { title: "Week four", body: "One idea, the smallest worst day, and the name of the person who approves it." },
        { title: "Weeks five to eight", body: "A four-week trial with a person approving every result, hours counted before and after." },
        { title: "Every few months", body: "The list, read again." },
      ],
      close: "Nothing on this path costs money until an idea has passed every test.",
      sources: [METHOD],
    },

    /** The owner's quiz (2026-10-31): ten questions, each from a fact the post teaches, with the
     * `why` naming the section in plain words. It sits after the common questions and before the
     * next step: it is the end of the reading, and its one pass link leads into the same ask the
     * page closes on. */
    quiz: {
      kind: "quiz",
      band: "night",
      label: "Quiz",
      ariaLabel: "Quiz: what did you learn",
      eyebrow: "Ten questions",
      title: "What did you learn? Check it in two minutes",
      brand: "ai",
      passLine: "You have the method. If you want a second pair of eyes on your own list, we can run the audit with you.",
      failLine: "Under half this time. Skim the three questions again, then have another go.",
      questions: [
        {
          q: "In the Census Bureau's survey, about what share of US businesses used AI in a business function as of May 3, 2026?",
          choices: ["About 1 in 5", "About 1 in 2", "About 3 in 4", "Almost all of them"],
          answer: 0,
          why: "It was 19.8 percent, from the section on how small businesses use AI in 2026. The 46 percent figure answers a wider question.",
        },
        {
          q: "Which of these is the first of the three questions?",
          choices: [
            "Is it the biggest time saving on the list?",
            "Does it happen often enough that a failure gets noticed within a week?",
            "Is there an AI tool that already does it?",
            "Would it impress customers?",
          ],
          answer: 1,
          why: "How often a job runs decides whether anyone notices when it breaks. That is the first question.",
        },
        {
          q: "Three people in your office describe the same decision three different ways. What does that tell you?",
          choices: [
            "One of them is doing it wrong",
            "The rule was never decided, so deciding it comes before any build",
            "The job is ready to automate",
            "You need more staff",
          ],
          answer: 1,
          why: "From the second question: software freezes whichever version its builder heard, so the rule gets decided first.",
        },
        {
          q: "Which of the three questions crosses off the most ideas?",
          choices: ["How often it happens", "Whether the rule can be written down", "Where a wrong answer lands", "How much it would cost"],
          answer: 2,
          why: "The third one. Where a mistake lands is a fact about your business, so better software does not change the answer.",
        },
        {
          q: "Among AI-using firms in the 2026 Census paper, what share reported a decrease in headcount?",
          choices: ["About 2 percent", "About 20 percent", "About 44 percent", "About 66 percent"],
          answer: 0,
          why: "It was 2.0 percent down and 2.3 percent up. The common effect was AI adding to tasks people already do.",
        },
        {
          q: "What do we sort a shortlist by first?",
          choices: ["The biggest saving", "How contained the worst case is", "Which idea is newest", "Which tool is cheapest"],
          answer: 1,
          why: "From the section on what the order gets sorted by: containment first, a settled rule second, the size of the saving last.",
        },
        {
          q: "What is the right build for a fact a customer relies on, such as a price or a policy?",
          choices: [
            "Let the model write its best guess",
            "Read it from the record that governs it, and say so when there is no record",
            "Leave the answer blank",
            "Ask the customer to check it",
          ],
          answer: 1,
          why: "From the section on what should not be automated: a system may report what a source says, or say it does not know.",
        },
        {
          q: "In our builds, what has to happen before a message a model wrote reaches a customer?",
          choices: [
            "Nothing, if the draft looks good",
            "A person approves it, and the send step cannot run without that approval",
            "The customer agrees once, up front",
            "It goes out, and a person checks it later",
          ],
          answer: 1,
          why: "From the section on who stays on the job: the approval is built into the system, never just written in its instructions.",
        },
        {
          q: "What happens on the audit call?",
          choices: [
            "We demonstrate tools and quote a price",
            "We walk through your last real week and pitch nothing",
            "We build the first automation live",
            "We review your website",
          ],
          answer: 1,
          why: "From the section on how the audit runs: about 75 minutes on the last real week, with no pitch, no tools named and no savings promised.",
        },
        {
          q: "Why does this page give no failure rate for AI projects?",
          choices: [
            "Because the rate is zero",
            "No 2026 public survey measures it for small businesses, and the most quoted figure cannot be checked",
            "It is a trade secret",
            "Every project works with the right tool",
          ],
          answer: 1,
          why: "From the section on the failure rate: a number whose method nobody can check stays off the page.",
        },
      ],
    },
  },

  headingLabels: {
    "what-an-ai-audit-for-a-small-business-is-for": "What an audit is for",
    "start-with-one-job-written-down": "One job written down",
    "how-small-businesses-use-ai-in-2026": "Who uses AI",
    "the-three-questions-is-it-worth-automating-at-all": "The three questions",
    "what-should-not-be-automated": "What not to automate",
    "who-should-stay-on-the-job": "Who stays on the job",
    "why-ranking-by-the-average-outcome-gets-it-wrong": "Rank by worst day",
    "what-the-audit-is-and-how-it-runs": "How the audit runs",
    "the-questions-we-ask-in-an-audit": "The questions we ask",
    "what-you-get-at-the-end": "What you get",
    "how-to-run-one-yourself-in-one-evening": "Run it yourself",
    "your-roadmap-week-by-week": "Your roadmap",
    "common-questions-about-using-ai-in-a-small-business": "Common questions",
  },
};
