import type { Service } from "./types";

/** COPY key `docs` on realtylt.com/ai. Deep link: /ai#docs
 *
 * NO "NEVER" ON THIS PAGE (2026-08-25, SERVICES-CRITIQUE.md §5). `why` used to end
 * "so deadlines never slip through a PDF", and useCases[0] was titled "The deadline that
 * never slips". Misreading a date on a scanned rider is the entire failure mode of this
 * category, so a guarantee is the one thing a document reader cannot offer, and this is a
 * page about contract deadlines. Both now promise what the product actually does: the
 * deadline is FLAGGED the day the contract lands, not the week it expires. */
export const documentProcessing: Service = {
  slug: "document-processing",
  aiKey: "docs",
  name: "Document Processing",
  tier: "more",

  eyebrow: "Documents · Parse + Extract",
  title: "Contracts and disclosures, read in seconds",
  lede: "Drop in a purchase agreement, disclosure, or lease and the AI extracts the terms, dates, and parties, flags what's missing, and files the structured data into your CRM and transaction folder. No manual re-keying of the same fields ten times.",
  specs: ["contract + disclosure parsing", "key-date extraction", "missing-field flags", "auto-filed to CRM"],
  why: "Transaction paperwork is a slow, error-prone tax on every deal. Automated extraction pulls the critical dates and terms out on the way in, so a deadline is flagged the day the contract lands, not the week it expires.",
  keywords: [
    "real estate document processing ai",
    "contract data extraction real estate",
    "ai disclosure review",
    "transaction coordinator automation",
    "real estate paperwork automation",
  ],

  seo: {
    title: "AI Document Processing for Real Estate Contracts",
    description:
      "Purchase agreements, disclosures, and leases parsed in seconds. Terms, key dates, and parties extracted, missing fields flagged, and filed into your CRM.",
  },

  /** ROUND F. The page carried no number at all. This one is from the flagship's third cited
   * chart and it is deliberately the HUMAN figure rather than a machine one: a page selling
   * automated reading should say out loud what the alternative actually scores. */
  stat: {
    value: "94.36%",
    label:
      "what people scored answering factual questions about scanned and photographed business documents, in the published study that measured it",
    source: {
      text: "Mathew, Karatzas and Jawahar, DocVQA, Table 1, human performance on the test split",
      href: "https://arxiv.org/abs/2007.00398",
    },
  },

  figure: {
    kind: "records",
    /** ROUND F: "One purchase agreement, thirty seconds" is gone. Nobody has timed that, on
     * these documents, and a duration printed beside an illustration reads as a measurement.
     * The dates went with it for the reason the skip-tracing page's addresses went: mocked-up
     * specifics on a page whose argument is that the details are checkable. What the rows show
     * now is the KIND of value and the KIND of result, and the third one is the point. */
    caption: "What a reader does to a file, illustrated",
    headers: { before: "What went in", after: "What came out, structured" },
    rows: [
      {
        before: "A purchase agreement as a clean PDF",
        after: ["Parties", "price", "every date printed in a fixed field"],
        tag: "extracted",
      },
      {
        before: "A disclosure scanned on an office machine",
        after: ["Parties matched", "one signature block empty", "flagged for a person"],
        tag: "gap found",
      },
      {
        before: "A rider photographed on a phone, changed by hand",
        after: ["Handwriting read", "the date it counts from not on the page", "held back"],
        tag: "needs a rule",
      },
    ],
    footnote:
      "An illustration rather than a real file: no client, no property and no date here belongs to anybody. What it is showing is the third row. A value the system cannot resolve is held back for a person rather than written with the likeliest guess, because a wrong date inherits the authority of your calendar and a blank one does not.",
  },

  whatItIs: [
    "It reads the paperwork. A purchase agreement, a disclosure, or a lease goes in, and the terms, the key dates, and the parties come out as structured data rather than as a PDF somebody has to open and squint at.",
    "It also tells you what is wrong: the missing signature, the field left blank, the date that contradicts another date. Then it files everything into your CRM and your transaction folder, and puts the deadlines on the calendar.",
  ],

  howItWorks: [
    {
      title: "Drop the document in",
      body: "Purchase agreements, disclosures, leases, and addenda. Scans and photographs are handled as well as clean PDFs, and the quality of the original is the single biggest thing that moves how much comes back.",
    },
    {
      title: "It extracts what matters",
      body: "Terms, parties, and the dates: closing, inspection, mortgage contingency, and the ones buried in the middle of the document that nobody re-reads.",
    },
    {
      title: "It flags, files, and reminds",
      body: "Missing fields and signatures are flagged for a human. Everything else is written to the CRM and the transaction folder, with the deadlines on your calendar.",
    },
    {
      /** ROUND F. A step this page did not have, and the flagship is the argument for it: a
       * value read correctly off a page can still be the wrong answer, because what a period
       * counts from and what a business day means are not printed on the document. */
      title: "The counting rules get written down",
      body: "Every extracted value records which document and which page it came from, and the rules for turning a period into a date get agreed once, in writing, rather than being inherited from whatever the software assumed.",
    },
  ],

  useCases: [
    {
      title: "The deadline you saw on day one",
      body: "Key dates reach the calendar on the day the document arrives rather than when someone gets round to reading page nine.",
    },
    {
      title: "The end of re-keying",
      body: "The same names, dates, and figures stop being typed into a CRM, a spreadsheet, and a checklist by hand.",
    },
    {
      title: "The missing signature, caught early",
      body: "Found on the day the document arrives instead of on the day it matters.",
    },
  ],

  limits: [
    "It does not guarantee a date. Misreading a line on a scanned rider is the failure mode of this whole category, which is why anything it is not confident about is flagged for a person rather than filed quietly.",
    "It does not know what a value means. It reads what the page says. Turning a period into a date needs a counting rule that lives in your business rather than in the document, and if nobody has written that rule down the software has picked one for you.",
    "It does not replace the document. The extracted fields are a reading of the contract, not the contract, so the original has to be kept and kept findable.",
    "It does not give a legal opinion, and it should not. It surfaces what the document says and what is missing, so somebody qualified can act on it.",
    "It does not replace reading the contract. It puts the dates on the calendar and the fields in the CRM. Understanding the deal is still the job.",
    "It does not fix a document. A missing signature gets flagged, not solved, and chasing it is a person's work.",
  ],

  faqs: [
    {
      q: "Can AI read a real estate contract?",
      /** ROUND F. Was "Yes. It reliably extracts structured facts". "Reliably" is doing work
       * the published measurements do not support: on real scanned forms at low resolution, a
       * commercial engine lost about a quarter of the words when it had to find them itself.
       * The answer now says what actually varies, which is the page rather than the software. */
      a: "Yes, and how well depends far more on the page than on the software. Printed text in a clean PDF is the easy case. A scan or a phone photograph is harder, and published research on real scanned forms found that finding the words on the page, rather than reading them, is where most of the loss happens. What it does not do is give a legal opinion, and it should not.",
    },
    {
      q: "What happens if it gets something wrong?",
      a: "Anything it is not confident about is flagged for a human rather than filed silently. That design exists because the two failures are not equally expensive: a blank field gets noticed and costs a few minutes, and a wrong date that looks right is believed by everybody downstream.",
    },
    {
      q: "Is the extracted data the legal record?",
      a: "No. The fields are a reading of the document made on a particular day, and they drop whatever the reader was not looking for, including a strike-through or a note in a margin. The federal rule on retaining electronic records asks for something that accurately reflects the information set forth in the contract, so the original stays the record and every extracted value should carry the document and page it came from.",
    },
    {
      q: "Can it read handwriting?",
      a: "Often, and the honest answer has a shape to it. Neat handwriting in a box designed for it is usually fine. What is genuinely hard is what matters most in real estate paperwork: a figure written over a struck-through one, a date altered in a margin, initials that are not meant to be legible even to a person. Those are the marks a build should be designed to flag rather than guess at.",
    },
    {
      q: "Does it replace a transaction coordinator?",
      a: "It removes the re-keying and the deadline tracking, which is the part of the job that is mechanical and the part where mistakes happen. The judgment, the chasing, and the client relationship stay with a person.",
    },
  ],

  relatedPosts: [
    "document-processing-real-estate-contract-deadlines",
    "data-enrichment-real-estate-stale-contact-records",
    "workflow-automation-real-estate-business",
  ],
};
