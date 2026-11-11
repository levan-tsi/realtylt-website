import type { Service } from "./types";

/** COPY key `docs` on realtylt.com/ai. Deep link: /ai#docs
 *
 * NO "NEVER" ON THIS PAGE (2026-08-25, SERVICES-CRITIQUE.md §5). Misreading a date on a scanned
 * page is the entire failure mode of this category, so a guarantee is the one thing a document
 * reader cannot offer. The page promises what the product actually does: a deadline is FLAGGED the
 * day the document lands, not the week it expires.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's signed estimates and
 * change orders, a property manager's leases, an accounting office's intake, a real estate
 * office's contracts as ONE example). Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/docs/: DocVQA (arXiv 2007.00398: "human performance
 * (94.36% accuracy)") and the E-SIGN Act at 15 U.S.C. 7001(d) ("accurately reflects the
 * information set forth in the contract"). Cut: "Published research on real scanned forms found
 * that most of the loss happens in finding the words" (no source re-read today). */
export const documentProcessing: Service = {
  slug: "document-processing",
  aiKey: "docs",
  name: "Document Processing",
  tier: "more",

  eyebrow: "Documents · Read and file",
  title: "Document processing: paperwork read, dates on the calendar",
  lede: "A signed estimate, a change order, a lease or a contract arrives as a PDF or a phone photo, and somebody types the same names and dates into three places, if they get to it. We set up document processing that reads the paperwork as it arrives, pulls out the terms, the dates and the names, flags what is missing, and files the details in the business's folders, its CRM and its calendar. Anything it is not sure about goes to a person.",
  specs: ["reads contracts and forms", "key dates to the calendar", "missing fields flagged", "filed to your CRM"],
  why: "Paperwork is slow, and it is easy to get wrong, and every job, lease or deal pays that tax. Pulling the key dates and terms out on the way in means a deadline is flagged the day the document lands, not the week it runs out.",
  keywords: [
    "document processing automation for small business",
    "ai document processing",
    "contract data extraction",
    "automate paperwork small business",
    "real estate document processing ai",
  ],

  seo: {
    title: "AI document processing for small business paperwork",
    description:
      "AI document processing for a small business: contracts, leases and forms read as they arrive, terms and dates pulled out, missing fields flagged, and filed.",
  },

  /** ROUND F. Deliberately the HUMAN figure rather than a machine one: a page selling automated
   * reading should say out loud what the alternative actually scores. */
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
    caption: "What a reader does to a file, illustrated",
    headers: { before: "What went in", after: "What came out, structured" },
    rows: [
      {
        before: "A signed estimate as a clean PDF",
        after: ["Customer", "amount", "start date printed in a fixed field"],
        tag: "extracted",
      },
      {
        before: "A lease scanned on an office machine",
        after: ["Parties matched", "one signature block empty", "flagged for a person"],
        tag: "gap found",
      },
      {
        before: "A change order photographed on a phone, changed by hand",
        after: ["Handwriting read", "what the new date counts from is missing", "held back"],
        tag: "needs a rule",
      },
    ],
    footnote:
      "An illustration rather than a real file. No customer, no property and no date here belongs to anybody. What it is showing is the third row: a value the system cannot settle is held back for a person rather than written with the likeliest guess, because a wrong date inherits the authority of the calendar, and a blank one does not.",
  },

  whatItIs: [
    "It reads the paperwork. A signed estimate, a change order, a lease, an engagement letter or a purchase contract goes in. The terms, the key dates and the parties come out as structured data, rather than as a PDF somebody has to open and squint at.",
    "It also says what is wrong: the missing signature, the field left blank, the date that contradicts another date. Then it files everything into the CRM and the job or client folder, and puts the deadlines on the calendar.",
    "It fits any business that runs on signed paper: a contractor's estimates, change orders and insurance certificates, a property manager's leases and renewals, an accounting office's engagement letters and intake forms, a real estate office's contracts and their deadlines. For an office that handles tax or health documents, the documents stay in the business's own systems and access is limited to the people who already see them.",
  ],

  howItWorks: [
    {
      title: "We agree what to pull and the counting rules",
      body: "Which documents, which fields, and how a period becomes a date: calendar days or business days, counted from signing or from delivery. The owner approves those rules in writing, so the software never picks one silently.",
    },
    {
      title: "The document goes in",
      body: "By email, upload or a folder the team already uses. Scans and photographs are handled as well as clean PDFs. The quality of the original is the single biggest thing that moves how much comes back.",
    },
    {
      title: "It extracts what matters",
      body: "Terms, parties and the dates: the start, the deadlines, the renewals, and the ones buried in the middle of the document that nobody re-reads.",
    },
    {
      title: "It flags, files and reminds",
      body: "Missing fields, missing signatures and anything the reader is not confident about go to a person. What is settled is written to the CRM and the folder, and the deadlines go on the calendar.",
    },
    {
      title: "Every value points back to its page",
      body: "Every extracted value records which document and which page it came from, so anyone can open the original and check it in one click.",
    },
  ],

  handoff: {
    provides: [
      "Examples of each kind of document the business handles, a few of each.",
      "The fields that matter in each, and how the business counts its deadlines.",
      "Where the documents arrive today, and where the results should be filed.",
      "The person who checks the flagged values.",
    ],
    approves: [
      "The counting rules for dates, in writing, before the first document.",
      "Every value the reader flags as uncertain.",
      "Any deadline before it is put on a customer's or client's calendar.",
      "What the business does about a missing signature, which a person chases.",
    ],
  },

  useCases: [
    {
      title: "A contractor's change orders, read on the day",
      body: "A change order signed on site and photographed on a phone lands in the job file with the new amount and the new date pulled out, and anything handwritten that the reader is unsure of goes to the office for a check.",
    },
    {
      title: "A property manager's lease dates on the calendar",
      body: "Renewal and notice dates reach the calendar the day the lease arrives, instead of waiting until someone gets round to reading page nine.",
    },
    {
      title: "An accounting office's engagement letters",
      body: "The signed letter is read, the client and the scope are filed against the client record, and a missing signature is caught on the day it arrives rather than in April.",
    },
    {
      title: "A real estate office's contract deadlines",
      body: "The inspection and financing dates in a purchase contract are pulled out and put on the agent's calendar, with the page each came from, and anything the contract counts in business days is counted by the office's written rule.",
    },
    {
      title: "The end of re-keying",
      body: "The same names, dates and figures stop being typed into a CRM, a spreadsheet and a checklist by hand.",
    },
  ],

  limits: [
    "It does not guarantee a date. Misreading a line on a scanned page is the failure mode of this whole category. That is why anything it is not confident about is flagged for a person rather than filed quietly.",
    "It does not know what a value means. It reads what the page says. Turning a period into a date needs a counting rule, and that rule lives in the business rather than in the document. If nobody has written it down, the software has picked one.",
    "It does not replace the document. The extracted fields are a reading of the contract, not the contract, so the original has to be kept, and kept findable.",
    "It does not give a legal opinion, and it should not. It surfaces what the document says and what is missing, so somebody qualified can act on it.",
    "It does not do the reading for the person who signs. It puts the dates on the calendar and the fields in the CRM. Understanding the agreement is still the job.",
    "It does not fix a document. A missing signature gets flagged, not solved. Chasing it is a person's work.",
  ],

  faqs: [
    {
      q: "Can AI read a contract?",
      a: "Yes, and how well depends far more on the page than on the software. Printed text in a clean PDF is the easy case. A scan or a phone photograph is harder, and handwriting changed in a margin is harder still. That is why every value carries the page it came from, and anything uncertain goes to a person. What it does not do is give a legal opinion, and it should not.",
    },
    {
      q: "How do I automate paperwork in a small business?",
      a: "Start with the one document the business handles most and the three or four fields everyone retypes from it, such as the customer, the amount and the dates. Write down how the business counts its deadlines. Then have the documents read as they arrive, the settled values filed and the uncertain ones sent to a person. Add the next document only once the first reads cleanly for a month.",
    },
    {
      q: "What happens if it gets something wrong?",
      a: "Anything it is not confident about is flagged for a person rather than filed silently. That design exists because the two failures are not equally expensive. A blank field gets noticed and costs a few minutes. A wrong date that looks right is believed by everybody downstream.",
    },
    {
      q: "Is the extracted data the legal record?",
      a: "No. The fields are a reading of the document made on a particular day, and they drop whatever the reader was not looking for, including a strike-through or a note in a margin. The federal rule on retaining electronic records asks for something that accurately reflects the information set forth in the contract. So the original stays the record, and every extracted value should carry the document and page it came from.",
    },
    {
      q: "Can it read handwriting?",
      a: "Often, and the honest answer has a shape to it. Neat handwriting in a box designed for it is usually fine. What is truly hard is what matters most: a figure written over a struck-through one, a date altered in a margin, initials that are not meant to be legible even to a person. Those are the marks a build should be designed to flag rather than guess at.",
    },
    {
      q: "Does it take over the office manager's job?",
      a: "No. It removes the re-keying and the deadline tracking, which is the mechanical part of the job and the part where mistakes happen. The judgment, the chasing and the customer relationship stay with the person, who now has more time for them.",
    },
  ],

  relatedPosts: [
    "document-processing-real-estate-contract-deadlines",
    "data-enrichment-real-estate-stale-contact-records",
    "workflow-automation-real-estate-business",
  ],
};
