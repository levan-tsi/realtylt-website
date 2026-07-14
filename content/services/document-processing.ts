import type { Service } from "./types";

/** COPY key `docs` on realtylt.com/ai. Deep link: /ai#docs */
export const documentProcessing: Service = {
  slug: "document-processing",
  aiKey: "docs",
  name: "Document Processing",
  tier: "more",

  eyebrow: "Documents · Parse + Extract",
  title: "Contracts and disclosures, read in seconds",
  lede: "Drop in a purchase agreement, disclosure, or lease and the AI extracts the terms, dates, and parties, flags what's missing, and files the structured data into your CRM and transaction folder. No manual re-keying of the same fields ten times.",
  specs: ["contract + disclosure parsing", "key-date extraction", "missing-field flags", "auto-filed to CRM"],
  why: "Transaction paperwork is a slow, error-prone tax on every deal. Automated extraction pulls the critical dates and terms instantly, so deadlines never slip through a PDF.",
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
      "Purchase agreements, disclosures, and leases parsed in seconds. Terms, key dates, and parties extracted, missing fields flagged, and the structured data filed into your CRM.",
  },

  figure: {
    kind: "records",
    caption: "One purchase agreement, thirty seconds",
    headers: { before: "What went in", after: "What came out, structured" },
    rows: [
      {
        before: "Purchase agreement (14 pp, PDF)",
        after: ["Closing 03/14", "Inspection ends 02/19", "Mortgage contingency 02/28"],
        tag: "3 key dates",
      },
      {
        before: "Property disclosure (6 pp, scan)",
        after: ["Parties matched", "Signed by seller", "Buyer signature missing"],
        tag: "1 flag",
      },
      {
        before: "Both, filed",
        after: ["Written to the CRM", "In the transaction folder", "Deadlines on the calendar"],
        tag: "done",
      },
    ],
    footnote: "The deadline that slips is almost never the one somebody knew about. It is the one buried on page nine.",
  },

  whatItIs: [
    "It reads the paperwork. A purchase agreement, a disclosure, or a lease goes in, and the terms, the key dates, and the parties come out as structured data rather than as a PDF somebody has to open and squint at.",
    "It also tells you what is wrong: the missing signature, the field left blank, the date that contradicts another date. Then it files everything into your CRM and your transaction folder, and puts the deadlines on the calendar.",
  ],

  howItWorks: [
    {
      title: "Drop the document in",
      body: "Purchase agreements, disclosures, leases, and addenda. Scans and photographs work as well as clean PDFs.",
    },
    {
      title: "It extracts what matters",
      body: "Terms, parties, and every critical date: closing, inspection, mortgage contingency, and the ones buried in the middle of the document that nobody re-reads.",
    },
    {
      title: "It flags, files, and reminds",
      body: "Missing fields and signatures are flagged for a human. Everything else is written to the CRM and the transaction folder, with the deadlines on your calendar.",
    },
  ],

  useCases: [
    {
      title: "The deadline that never slips",
      body: "Key dates get onto the calendar the moment the contract is signed rather than when someone gets round to reading page nine.",
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

  faqs: [
    {
      q: "Can AI read a real estate contract?",
      a: "Yes. It reliably extracts structured facts: parties, dates, prices, and contingencies, including from scans. What it does not do is give a legal opinion, and it should not. It surfaces what the document says and flags what is missing so a person can act on it.",
    },
    {
      q: "What happens if it gets something wrong?",
      a: "Anything it is not confident about is flagged for a human rather than filed silently. The design goal is to catch the missing signature and the buried deadline, so uncertainty escalates rather than getting buried.",
    },
    {
      q: "Does it replace a transaction coordinator?",
      a: "It removes the re-keying and the deadline tracking, which is the part of the job that is mechanical and the part where mistakes happen. The judgment, the chasing, and the client relationship stay with a person.",
    },
  ],
};
