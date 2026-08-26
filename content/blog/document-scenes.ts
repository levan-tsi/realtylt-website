/** Scene copy for the document processing flagship post (topic 14).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Fourteenth topic on the flagship template and the THIRTEENTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 13. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/document-processing.ts.
 * Nothing here claims a capability that page does not claim, and that page carries a standing
 * instruction from round A: NO "NEVER" ANYWHERE ON IT. Misreading a line on a scanned rider is
 * the failure mode of this whole category, so a guarantee is the one thing this product cannot
 * offer. Nothing in this file promises one either.
 *
 * THE DELIBERATE DISTANCE FROM TOPIC 5, which was read in full before a word was written.
 *
 *   TOPIC 5, workflow automation, owns BUSYWORK: the manual step, what an interruption costs,
 *   the chain that fires by itself, the platform that switches a chain off at a 95 percent error
 *   rate, and the highlighter over one deal. Its evidence is a timed field study of desk
 *   workers. None of that appears here, and THIS ARTICLE NEVER ARGUES THAT IT SAVES YOU TIME.
 *   Its calculator carries no hours-saved row for exactly that reason.
 *
 *   TOPIC 10, two-way CRM sync, owns whether two rows are the same person. Topic 15, data
 *   enrichment, written in the same round as this one, owns what an outside file asserts about
 *   somebody you already hold. Neither is about reading, and this one is only about reading.
 *
 *   THIS post is about extraction from an unreliable original, and about the half nobody
 *   writes about: a value can be read correctly off the page and still be the wrong answer,
 *   because what it counts from is not written on the page.
 *
 * Nothing on this website has previously mentioned OCR accuracy, entity linking, Regulation Z,
 * a business day definition, consummation or ESIGN. Checked by grep across every post body
 * before this file was written.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. The easy half, the hard
 * half, and the half that is not about reading at all. */
export const IN_SHORT: string[] = [
  "Turning ink into text is close to solved on a clean page and is not solved on a bad one. In the one published study of real scanned forms we could find, a commercial engine recovered the words almost exactly once it knew where they were, and lost a quarter of them when it had to find them first.",
  "Knowing which value belongs to which label is a different and much harder problem, and the same study measured it. Labelling a piece of text as a question or an answer scored a little over a half. Joining an answer to the question it belongs to scored four hundredths.",
  "And the expensive failure is not a misread character. It is a date that was read perfectly and counted from the wrong event, in the wrong kind of day, because none of that is printed anywhere on the page it came off.",
];

/** SCENE copy — what this is, by what it is not.
 *
 * Three near topics, and this article's own territory stated by contrast. The cards do NOT
 * summarise the other articles: each names the question that one answers and then says which
 * question is left over. */
export const NOT_THE_WORK: GridItem[] = [
  {
    lead: "Not the busywork",
    body: "Wiring your systems together so that finishing one step starts the next is a real and valuable thing, it is a different product, and it is written up on its own. That question is about work that a person used to do by hand. This one is about a single value that a machine claims it found on a page, and whether that claim is true.",
  },
  {
    lead: "Not the duplicate",
    body: "Deciding whether two contact records describe one person is a question about your own database, and there is a published model for answering it. This one never leaves the document. There is one copy of the page, nobody disputes whose it is, and everything difficult happens between the paper and the field.",
  },
  {
    lead: "Not the append",
    body: "Filling in what a contact record is missing brings in an assertion from a company you have never spoken to. Here the source is in your hand. You can put it next to the output and check, line by line, which is the whole reason this is a tractable problem and the reason the fix is boring rather than clever.",
  },
];

/** SCENE copy — what the original actually is.
 *
 * Four properties of the document you really receive, as against the clean PDF every vendor
 * demonstration uses. Deliberately not a list of file formats: every card is a reason the page
 * itself is unreliable evidence, which is the article's premise. */
export const UNRELIABLE_ORIGINAL: GridItem[] = [
  {
    lead: "It is often a photograph",
    body: "Not a scan and not a file, and the difference is not cosmetic. A page held under a phone is captured at whatever angle and in whatever light happened to be available, and that geometry is baked in before any software sees it. Detail that was never captured is not recoverable further down the chain, however clever the thing at the end of it is.",
  },
  {
    lead: "The changes are handwritten",
    body: "There is an unhelpful symmetry in a form. The printed body is easy to read and carries nothing specific to your deal, because it is identical on every copy in the state. Everything that makes this transaction different from that one was added afterwards by a person with a pen, which is to say that legibility and importance run in opposite directions down the page.",
  },
  {
    lead: "It arrives in pieces",
    body: "A file is a base document plus addenda plus riders plus a disclosure, signed at different moments, and a later page can change a term on an earlier one. Read as separate documents they all parse. Read as a transaction they contradict each other, and nothing in any single page tells a reader which version won.",
  },
  {
    lead: "It has been copied",
    body: "Printed, signed, scanned, emailed, printed again, signed again, photographed. Each pass loses a little contrast and gains a little noise, and the thing that degrades first is thin ink: a decimal point, a comma, the difference between a one and a seven in somebody's handwriting.",
  },
];

/** SCENE copy — reading. Cited data graphic ONE.
 *
 * Guillaume Jaume, Hazim Kemal Ekenel and Jean-Philippe Thiran, "FUNSD: A Dataset for Form
 * Understanding in Noisy Scanned Documents", arXiv:1905.13538v2, 29 October 2019. Read in the
 * arXiv PDF with pdftotext.
 *
 * The corpus, quoted: "The dataset comprises 199 real, fully annotated, scanned forms. The
 * documents are noisy and vary widely in appearance." And where they came from: the RVL-CDIP
 * collection is "composed of 400,000 grayscale images of various documents from the 1980s-1990s",
 * which "have a low resolution of around 100 dpi" and "are also of low quality with various types
 * of noise added by successive scanning and printing procedures". The sampling: "we manually
 * checked the 25,000 images from the form category. We discarded unreadable and similar forms,
 * resulting in 3,200 eligible documents, out of which we randomly sampled 199 to annotate."
 *
 * Table IV, quoted as printed: "OCR results based on Levenshtein similarity. Results expressed
 * in %. Method Tesseract Google Vision / Text detection + OCR 3.4 76.4 / OCR 7.3 94.4."
 *
 * TESSERACT IS DELIBERATELY NOT A THIRD BAR. Its 7.3 and 3.4 look devastating and would be
 * unfair to draw, because the paper explains them: "The Tesseract OCR engine performs poorly on
 * the FUNSD dataset, which can be explained by the fact that the minimum quality of 300 dpi
 * needed by Tesseract is not met in the FUNSD dataset." A tool used below its own stated minimum
 * is not evidence about tools. It is in the prose with that explanation attached.
 *
 * AXIS PINNED TO 100 because both are similarity scores expressed as percentages.
 *
 * WHY THE SECOND BAR IS LIT: it is the one that describes the job. Nobody hands a system a page
 * with the words already located. */
export const READING = {
  eyebrow: "The evidence",
  caption: "How much of the text came back, off 199 real scanned forms",
  bars: [
    { label: "Reading words the system was already told the position of", value: 94.4, display: "94.4%" },
    { label: "Finding the words on the page and then reading them", value: 76.4, display: "76.4%" },
  ],
  max: 100,
  lit: 1,
  basis:
    "Two measurements of the same commercial vision engine on the same 199 scanned forms, scored by Levenshtein similarity, which compares the characters produced against the characters that were really there rather than counting a word as simply right or wrong. The first row was given the location of every word. The second had to find them.",
  sourceText:
    "Guillaume Jaume, Hazim Kemal Ekenel and Jean-Philippe Thiran, FUNSD: A Dataset for Form Understanding in Noisy Scanned Documents, 2019.",
  sourceHref: "https://arxiv.org/abs/1905.13538",
  note: "Read this as the shape of the problem rather than as a score for any product you would buy. The forms are from the nineteen eighties and nineties at about a hundred dots per inch, the measurement is from 2019, and engines have moved since. What has not moved is the eighteen point gap between the two bars, because it is not a fact about the engine. It is a fact about the page: the harder the original, the more of the work is deciding where the writing is, and that step happens before anything clever gets a chance to help. The paper's other engine, an open source one, scored 7.3 and 3.4 on the same two rows, and the authors explain why in the same paragraph, so it is quoted in the text above rather than drawn here as though it were a fair comparison.",
};

/** SCENE copy — understanding. Cited data graphic TWO.
 *
 * Same paper, Table VI, quoted as printed: "Baseline results for the entity labeling and
 * linking. Precision and recall expressed in %. Task Entity labeling / Entity Linking.
 * Precision - 2.1 / Recall - 99.2 / F1-score 0.57 0.04."
 *
 * The tasks are defined in the paper: "Semantic entity labeling is the task of assigning to each
 * semantic entity a label from a set of four predefined categories: question, answer, header or
 * other" and "Entity linking is the task of predicting the relations between semantic entities."
 *
 * AND THE PART THAT MAKES IT DAMNING, quoted: "Note that we test the algorithms by assuming that
 * we know the optimal word grouping, word location, and textual content. In this way, we only
 * assess the specific task." Both numbers were produced with the reading already done perfectly.
 *
 * A SEPARATE CHART RATHER THAN TWO MORE BARS ON THE ONE ABOVE, and the reason is the
 * denominator. Levenshtein similarity and F1 are not the same quantity, and putting 94.4 beside
 * 0.57 in one track would draw two units against one axis. Same discipline topic 13 applied to a
 * share of links beside a share of emails, and topic 11 to two disagreeing tables in one paper.
 *
 * AXIS PINNED TO 100 and the values are the F1 scores multiplied by a hundred, because F1 runs
 * from 0 to 1 and the basis line says so. The displayed labels are the scores as the paper
 * printed them. */
export const UNDERSTANDING = {
  eyebrow: "The evidence",
  caption: "How much of the meaning came back, from the same 199 forms",
  bars: [
    { label: "Calling a piece of text a question, an answer or a heading", value: 57, display: "0.57" },
    { label: "Joining an answer to the question it belongs to", value: 4, display: "0.04" },
  ],
  max: 100,
  lit: 1,
  basis:
    "Two F1 scores from the same paper and the same 199 forms. F1 runs from 0 for useless to 1 for perfect and combines how often the system was right when it made a claim with how much of the truth it found. The bars are drawn on that scale. Both were measured with the reading step handed to the system already done correctly.",
  sourceText:
    "Jaume, Ekenel and Thiran, FUNSD, Table VI, baseline results for entity labeling and linking.",
  sourceHref: "https://arxiv.org/abs/1905.13538",
  note: "These are the authors' own simple baselines, published to give the field something to beat, and the field has beaten them. Do not read the second bar as what a system you could buy today would do. Read it as which half of the job is hard, because that ordering has not changed: the character recognition is the part that mostly works, and the part that mostly does not is knowing that this number is the answer to that question. Note also what the second bar is made of. Recall was 99.2, so the method found nearly every real link. Precision was 2.1, so it claimed a great many that were not there, and at that precision roughly one claimed link in fifty is a real one. A system tuned that way has technically found your closing date, along with a great many things that are not it, and nothing in the output says which is which.",
};

/** SCENE copy — the ceiling. Cited data graphic THREE.
 *
 * Minesh Mathew, Dimosthenis Karatzas and C.V. Jawahar, "DocVQA: A Dataset for VQA on Document
 * Images", arXiv:2007.00398v3, 5 January 2021. Read in the arXiv PDF with pdftotext.
 *
 * The corpus, quoted: "The DocVQA comprises 50,000 questions framed on 12,767 images", drawn
 * "from pages of 6,071 industry documents", from "as early as 1900 to as recent as 2018", and
 * "they include typewritten, printed, handwritten and born-digital text". The test split is
 * 5,188 questions on 1,287 images.
 *
 * All three bars are from Table 1, test split, and NONE OF THEM IS A MODEL SCORE, which is the
 * whole reason this chart is safe to draw six years after the paper. A model number would be
 * stale; a human number and two ceilings imposed by the reading step are properties of the
 * corpus.
 *
 *   Human, accuracy 94.36. Method, quoted: "For measuring human performance, we collect answers
 *   for all questions in test split, with help a few volunteers from our institution."
 *
 *   OCR substring UB, 87.00. Defined: "the upper bound on predicting the correct answer provided
 *   the answer can be found as a substring in the sequence of OCR tokens."
 *
 *   OCR subsequence UB, 77.00. Defined: "upper bound on predicting the correct answer, provided
 *   the answer is a subsequence of the OCR tokens' sequence." The authors say why they compute
 *   the second one: the substring test "has a downside that the substring match in all cases need
 *   not be an actual answer match. For example if the answer is '2' which is the most common
 *   answer in the dataset, it will match with a '2' in '2020' or a '2' in '2pac'."
 *
 * AXIS PINNED TO 100 because all three are accuracy percentages on the same split.
 *
 * WHY THE FIRST BAR IS LIT: because 94.36 is the number this article needs the reader to hold.
 * The comparison everybody makes is against perfect, and perfect is not what a person does. */
export const CEILING = {
  eyebrow: "The evidence",
  caption: "The most anyone could get right, on 5,188 questions about document images",
  bars: [
    { label: "People, answering the questions themselves", value: 94.36, display: "94.36%" },
    { label: "Ceiling if the answer merely appears somewhere in what was read", value: 87.0, display: "87.0%" },
    { label: "Ceiling if the answer has to be a run of what was read", value: 77.0, display: "77.0%" },
  ],
  max: 100,
  lit: 0,
  basis:
    "Three figures from one table in one paper, all on the same 5,188 test questions about scanned and photographed business documents. The first is what volunteers scored. The other two are not scores at all: they are the most any system could possibly get right if it is limited to the text the reading step managed to produce, computed two ways, the second stricter than the first.",
  sourceText:
    "Minesh Mathew, Dimosthenis Karatzas and C.V. Jawahar, DocVQA: A Dataset for VQA on Document Images, 2021.",
  sourceHref: "https://arxiv.org/abs/2007.00398",
  note: "Two things worth taking from this and neither is the one people expect. The first is that a person reading a document and answering a question about it was right 94.36 percent of the time, not 100, and the people in question were volunteers doing it carefully with no deadline. Any comparison that treats the human path as flawless is comparing against something that does not exist. The second is that the lower two bars are ceilings rather than results. Whatever sits on top of the reading step, however good it gets, it cannot answer from text the reading step did not produce, and on this corpus that alone put the roof at 87 or at 77 depending on how strictly you count. The authors' own baselines came in well below both, and those figures are from 2020 and are not quoted here, because a stale model score would be the one number on this page that says something false.",
};

/** SCENE copy — the six hops between paper and a date on a calendar.
 *
 * The service page's flow has three steps and all three are on the left of this diagram. What
 * this adds is the two hops after the fields come out, which are the two where a correct
 * extraction still becomes a wrong answer.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing
 * is clipped by the container edge at 390px. 33 characters lost a letter on the reactivation
 * post; "A photo of paper" is 16. */
export const DOC_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The original", connects: "A photo of paper" },
  { label: "The characters", connects: "Ink read as text" },
  { label: "The fields", connects: "Which text is which" },
  { label: "The meaning", connects: "What it counts from" },
  { label: "The check", connects: "Somebody, or nobody" },
  { label: "The calendar", connects: "Where it becomes real" },
];

/** SCENE copy — three ways a correct extraction still costs you.
 *
 * Deliberately not the limits section restated: limits are what the product cannot do, and these
 * are what a build that works perfectly still fails to deliver. All three are about the business
 * around the software rather than about the software. */
export const WASTED: GridItem[] = [
  {
    lead: "Everything is flagged, so nothing is",
    body: "A reader that marks a third of its output as uncertain has told you the truth and has also handed you a queue somebody now has to work. Within a fortnight the flags are being cleared in batches without the pages being opened, which is worse than having no flags, because now there is a record saying somebody checked.",
  },
  {
    lead: "The output has nowhere to land",
    body: "The extraction is correct and it is sitting in a report. The calendar it should have written to belongs to somebody else, the CRM field it should have filled does not exist yet, and so the values get retyped by hand from the report. The reading was never the bottleneck and this is how you find that out.",
  },
  {
    lead: "Nobody owns the exceptions",
    body: "Every document type eventually produces one the system has not seen: an addendum from another state, a form somebody rebuilt in a word processor, a page that is genuinely ambiguous. If there is no named person whose job it is to look at those, they do not go into a queue. They go into the deal, quietly, as whatever the machine guessed.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Fourteen scenes, zero components, no film. */
export const DOCUMENT_PROCESSING_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings, $2,500 and 0.3 percent. This one is the
   * plainest of the lot and it is chosen because the surprise is not the number: it is that the
   * same three words are defined twice in one regulation and the document does not say which
   * definition it is using. */
  hero: {
    moment: "3",
    suffix: "business days",
    /** NOT either plate. A corridor of archive boxes is texture behind type rather than a
     * subject, and the two plates on this post are a rack of office stamps and an 1825 deed,
     * so nothing is used twice on one page. */
    photo: "/images/editorial/archive-stacks.jpg",
    signature: "porchlight",
  },
  scenes: {
    "in-short": {
      kind: "summary",
      band: "light",
      ariaLabel: "In short",
      eyebrow: "In short",
      claims: IN_SHORT,
    },
    "not-the-work": {
      kind: "grid",
      band: "dark",
      eyebrow: "Three things this is not",
      heading: "The paperwork is not the busywork.",
      columns: 3,
      glow: true,
      items: NOT_THE_WORK,
      label: "What this is not",
    },
    "unreliable-original": {
      kind: "grid",
      band: "dark",
      eyebrow: "What actually arrives",
      heading: "Four things wrong with the page before anybody reads it.",
      columns: 2,
      items: UNRELIABLE_ORIGINAL,
      label: "The original",
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/office-stamps.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS and which contains the 21:9
      // crop a laptop ships. Measured this round: the Plate primitive renders 2.33 at 1440 and
      // 1.78 at 390, so the phone sees a taller slice. ORIGINAL is only legible in the taller
      // crop, and it is the most useful word on the rack for this article. Only the words that
      // are actually readable are named; several labels are worn or turned away.
      //
      // ROUND I: the red and white plate is not a label lying BESIDE the dark handled stamp. It
      // IS that stamp's body, a rotary selector with a brass winged key on its side, and it
      // carries six numbered settings rather than the two the old alt quoted. PAID, at the left
      // of the same row, was missing from the alt altogether.
      alt: "A worn wooden rack of rubber stamps photographed from above, the printed labels on their sides reading COPY, PROFORMA, ORIGINAL, DUPLICATE and TRIPLICATE along one row, SURFACE MAIL on a long stamp below them, PAID at the left and INSURED at the right of the row under that, and COPY again along the bottom, with a dark red wooden handled stamp standing in the middle whose red body is a rotary selector listing six settings, AIR PARCEL POST, DO NOT BEND, FIRST CLASS MAIL, FOR DEPOSIT ONLY, HAND STAMP ONLY and PARCEL POST, with a brass winged key at its side",
      caption:
        "ORIGINAL, DUPLICATE, TRIPLICATE, COPY. Four words on one rack, and every one of them exists because somebody needed to know which version they were holding before they acted on it. A document reader makes a new copy of the facts in a contract and it does not stamp it, so the question those stamps answered becomes yours to answer instead.",
      credit: "Photograph by mpclemens, CC BY 2.0.",
      ariaLabel: "A rack of office stamps",
    },
    reading: {
      kind: "statbars",
      band: "dark",
      label: "What came back",
      ...READING,
    },
    understanding: {
      kind: "statbars",
      band: "dark",
      label: "What it meant",
      ...UNDERSTANDING,
    },
    "human-ceiling": {
      kind: "statbars",
      band: "dark",
      label: "The ceiling",
      ...CEILING,
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from 12 CFR 1026.2(a)(13). Quoted rather than paraphrased because almost
       * everybody in a transaction uses "closing" and "consummation" as though they were the
       * same word, and the regulation that sets the deadlines does not. */
      text: "Consummation means the time that a consumer becomes contractually obligated on a credit transaction.",
    },
    "doc-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "From a photograph of a page to a date somebody relies on.",
      lede: "Six hops, and the products in this category are sold on the first three. The fourth is where a correctly read value becomes a wrong answer, and the fifth is the only one that catches it. Both of those are decisions about your business rather than settings in a piece of software, and neither of them is a question a demonstration answers.",
      steps: DOC_PATH,
      altPrefix:
        "The path from a photographed page to a date on a calendar, through character recognition, field assignment, what the value is counted from and whether a person checks it",
    },
    "check-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many values reach your calendar without anybody opening the page again?",
      ariaLabel: "How many extracted values go unchecked in a year",
      inputs: [
        {
          kind: "range",
          id: "deals",
          label: "Transactions you close in a year",
          hint: "Both sides, and count the ones that fell apart after contract, because those generated paperwork too.",
          min: 4,
          max: 120,
          step: 2,
          initial: 12,
          format: "count",
          width: "w-[4rem]",
        },
        {
          kind: "range",
          id: "docs",
          label: "Documents in a typical file",
          hint: "The agreement, every addendum and rider, the disclosures, the inspection paperwork, the mortgage documents. This is not worth guessing at. Open a file you closed last month and count.",
          min: 3,
          max: 30,
          step: 1,
          initial: 8,
          format: "count",
          width: "w-[4rem]",
        },
        {
          kind: "range",
          id: "fields",
          label: "Dates, names and figures pulled out of each one",
          hint: "Count what you would actually want in a system, not what is on the page. Parties, prices, deposits, and every date.",
          min: 3,
          max: 25,
          step: 1,
          initial: 8,
          format: "count",
          width: "w-[4rem]",
        },
        {
          kind: "range",
          id: "unread",
          label: "Share that goes straight through without the page being opened",
          hint: "Be honest rather than aspirational. If the point of the build was that somebody stops reading, this number is high by design.",
          min: 10,
          max: 100,
          step: 5,
          initial: 75,
          format: "percent",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes to check one value against the page it came from",
          hint: "Finding the line, reading it, agreeing with it. Seconds on a clean PDF and minutes on a photograph of a rider.",
          min: 1,
          max: 10,
          step: 1,
          initial: 2,
          format: "count",
          width: "w-[4rem]",
        },
      ],
      chain: [
        { label: "Transactions in a year", by: { from: "input", id: "deals" }, format: "count", unit: "transactions" },
        { label: "Documents to be read", by: { from: "input", id: "docs" }, format: "count", unit: "documents" },
        { label: "Values pulled out of them", by: { from: "input", id: "fields" }, format: "count", unit: "values" },
        {
          label: "Where nobody opens the page again",
          by: { from: "input", id: "unread" },
          format: "count",
          /** SHORT ON PURPOSE. A chain unit renders inside a shrink-0 cell and cannot wrap;
           * round E shipped 66px and 32px of horizontal overflow from exactly this. The
           * explanation belongs in the row label on the left, which does wrap. */
          unit: "unchecked",
        },
        { label: "At your checking time", by: { from: "input", id: "minutes" }, format: "count", unit: "minutes" },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours a year",
        },
      ],
      headline: 3,
      resultLabel: "Values a year that nobody reads off the page",
      note: "The headline is the fourth row rather than the hours, because the hours are the reassuring half and the count is the one worth sitting with. Notice what the last row does: at the settings this opens with, checking every single value against its own page is a couple of days of work spread across a year. That is affordable, and it is not what happens, because the whole reason the system exists is so that nobody opens the page. Shares of values produce fractions, and a third of a date is not a thing, so read anything with a decimal in it as a rough count. Three things this deliberately refuses. There is no accuracy figure for our own extraction anywhere in it, because we have not measured one on your paperwork and the published measurements above are on other people's documents. There is no hours-saved row, both because saving hours is a different article on this site and because nobody has published a measurement of what re-keying a transaction file costs in this industry. And there is no dollar figure for a missed deadline, which is the number this category invites you to imagine, because the honest version of it depends on the contract, the state, the counterparty and whether anybody was willing to be reasonable that week.",
      action: { label: "See how it is built", href: "/services/document-processing" },
      secondary: { label: "Send us one document", href: "/connect" },
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/deed-1825.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS. The taller crop carries two
      // things the 21:9 one cuts off: more of the boundary description at the top, and the
      // closing dower clause and attestation at the foot. The printed line is transcribed
      // exactly as it appears; the handwritten names are legible and are deliberately NOT
      // transcribed, because a two hundred year old hand is exactly the thing this article says
      // gets misread, and guessing at one in alt text would be the mistake it warns about.
      //
      // ROUND I: "brown ink" was a colour that is not in the file. MEASURED rather than judged by
      // eye: every sampled pixel of deed-1825.jpg has a channel spread of exactly 0, so the scan
      // is pure greyscale and there is no brown anywhere in it. The hand is dark grey on a pale
      // grey sheet, and that is now what the alt says.
      alt: "A folded sheet of a handwritten and printed deed from 1825, reproduced in black and white, the upper half filled with a looping dark hand describing a boundary, an acreage and a pew in a meeting house, a horizontal fold crease across the middle, then a heavy printed line reading To have and to hold the said granted premises with all the, and beneath it a printed paragraph whose ruled gaps are filled in by hand so that the pronouns and the names in the sentence are handwritten insertions, ending in a printed clause about a wife releasing her right of dower and the words IN WITNESS WHEREOF",
      caption:
        "A real estate contract has had this shape for two hundred years. A printed paragraph that is identical on every copy, with the part that decides who owns what written into the holes in it by hand. Two hundred years later the format is the same and so is the difficulty: the printed text is easy to read and carries no information, and the handwriting is the whole deal.",
      credit: "Photograph by museado, CC0 1.0.",
      ariaLabel: "A deed from 1825 with its blanks filled in by hand",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 13: on light, the cost section, the
       * limits section and the how-to run as one long pale band. Flipping this one breaks the
       * run. */
      band: "dark",
      eyebrow: "Three ways a working build produces nothing",
      heading: "None of them are the reading.",
      columns: 3,
      items: WASTED,
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Send us one document you would want read automatically, with anything private crossed out, and tell us the five values you would want off it. We will tell you which of the five are printed in a fixed place, which depend on handwriting, and which one is not really on the page at all and would have to come from a rule you decide.",
      reassure:
        "It is a short reply from a person, it costs nothing, we do not need access to your transaction folder, and one page is genuinely enough to answer it.",
      action: { label: "Send us one document", href: "/connect" },
      ariaLabel: "Send us one document",
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Open the last file you closed and find the earliest deadline in it. Then answer two questions out loud: what event does that date count from, and where is that event written down. If the answer to the second one is that everybody just knew, you have found the thing a document reader cannot do for you, and you have also found the reason it is worth having one.",
      actions: [
        { label: "See it on the AI page", href: "/ai#docs", variant: "light" },
        { label: "How it is built", href: "/services/document-processing", variant: "outline-light" },
      ],
      footnote:
        "There is no price here because three things move it and none of them is the reading: how many document TYPES you want handled, because each type is its own set of expectations, whether your originals are files or photographs of paper, and whether there is somewhere for the output to go when it arrives. The AI audit is an hour, done with you, and for this topic it starts by opening one real file rather than a sample one.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-document-processing-actually-is-and-why-the-reading-is-the-easy-half": "What it is",
    "the-original-is-not-a-document-it-is-a-photograph-of-one": "The original",
    "what-was-actually-measured-on-forms-that-look-like-yours": "The measurement",
    "finding-a-word-and-knowing-what-it-is-for-are-two-different-problems": "The hard half",
    "a-person-is-not-perfect-at-this-either-and-somebody-published-the-number": "The human number",
    "the-date-is-not-the-deadline": "The date",
    "the-same-three-words-mean-two-different-things-in-one-regulation": "Two definitions",
    "a-wrong-date-costs-more-than-a-missing-one": "Wrong beats missing",
    "what-the-extracted-copy-is-and-what-it-is-not": "What the copy is",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "how-to-test-a-document-reader-on-ten-of-your-own-files": "Test one yourself",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
