import type { Service } from "./types";

/** COPY key `pay` on realtylt.com/ai. Deep link: /ai#pay
 *
 * SYNCED WITH THE FLAGSHIP in round G. Six of this page's claims rested on a majority of late
 * payments being forgetfulness rather than refusal, a claim about WHY a payment is late that no
 * source holds. Every killed claim is listed with its replacement in
 * docs/blog-flagship/ROUND-G-LOG.md and guarded in lib/blog/zombie-claims.test.ts.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's deposits, a cleaning
 * company's monthly invoices, an accounting office's engagement fees, a real estate office's
 * referral fees as ONE example). The stat changed: the brand check fails any dollar figure on an
 * AI page (company/BRAND.md F5), so Regulation CC's large-deposit threshold is now stated as a
 * rule without its number, and the stat is the FBI's 2024 count of business email compromise
 * complaints. Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/invoicing/: 12 CFR 229.13(b) (eCFR and Cornell
 * LII) and the FBI IC3 2024 Internet Crime Report (Business Email Compromise: 21,442 complaints,
 * losses of 2,770,151,146 dollars). The report's "worked example of a faked request to wire
 * closing funds" is no longer cited: it was not found in today's read. */
export const invoicingAndPayments: Service = {
  slug: "invoicing-and-payments",
  aiKey: "pay",
  name: "Invoicing & Payments",
  tier: "core",

  eyebrow: "Payments · Invoices and deposits",
  title: "Automated invoicing: get paid on time without chasing",
  lede: "The job is finished on Friday, the invoice goes out the following Thursday, and the reminder that should follow it never gets sent at all. We set up invoicing that raises the invoice when the job is booked or done, asks for a deposit up front with a tap-to-pay link, and follows up politely on anything unpaid on a schedule the owner sets. After the last reminder, anything still open goes to a person with the history attached.",
  specs: ["invoices raised on the day", "deposit and tap-to-pay links", "polite reminders on schedule", "tracks who owes what"],
  why: "Nobody enjoys sending the third reminder, which is why it does not get sent. Automate the invoice and the follow-up, and both happen on the day they were supposed to, worded the same way every time. The owner keeps the hard conversations and loses the awkward ones.",
  keywords: [
    "automated invoicing software",
    "invoice payment reminders",
    "how to get clients to pay on time",
    "collect deposits online",
    "accounts receivable automation for small business",
  ],

  seo: {
    title: "Automated invoicing and payment reminders for small business",
    description:
      "Automated invoicing for a small business: invoices raised when the job happens, deposits by tap-to-pay link, polite reminders on a schedule, and a person for the rest.",
  },

  /** Round 28: a count, not a sum (the brand check refuses a dollar figure on an AI page). It is
   * the reason the bank-details answer below says a person phones a number already on file. */
  stat: {
    value: "21,442",
    label: "business email compromise complaints the FBI's Internet Crime Complaint Center received in 2024",
    source: {
      text: "FBI, Internet Crime Report 2024 (IC3). Reported complaints, not every case.",
      href: "https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf",
    },
  },

  figure: {
    kind: "timeline",
    caption: "The chase, run by something that never feels awkward",
    events: [
      { at: "On booking", label: "Deposit requested", note: "A tap-to-pay link with the booking confirmation, before the work starts." },
      { at: "On the job", label: "Invoice raised", note: "Against the agreement, the day the work that creates the charge is done." },
      { at: "Day 3", label: "A friendly nudge", note: "The first reminder, sent whether or not anybody feels like sending it." },
      { at: "Day 7", label: "A second reminder", note: "Still polite. Still not the owner having to send it." },
      { at: "Day 14", label: "Passed to a person", note: "Now it is a real conversation, and the person has the full history." },
    ],
    footnote:
      "An invented illustration of the sequence, not a recording of one. No client, amount or reference on it belongs to anybody. The timing is a starting point rather than a rule, and the owner sets it.",
  },

  whatItIs: [
    "It is the part of getting paid that everyone puts off. The invoice that goes out three days late. The deposit nobody asked for. The reminder that feels awkward to send. And the fortnight of silence that follows.",
    "The system raises the invoice when the thing that creates the charge happens. It takes the deposit up front with a tap-to-pay link. It follows up on anything unpaid, on a schedule the owner sets. It tracks who owes what, so the owner always knows. And it hands the case to a person only when it truly needs one.",
    "It fits any business that sends invoices: a contractor taking deposits before a job, a cleaning or landscaping company billing every month, an accounting office sending engagement fees, a salon or spa selling packages. For a real estate office the harder half comes earlier: a referral fee falls due because of a closing in somebody else's office, and nothing can be chased until somebody asks whether it has happened. There a standing job goes and asks.",
  ],

  howItWorks: [
    {
      title: "We set the terms with the owner",
      body: "Which jobs take a deposit and how much, when an invoice is raised, the reminder days and the wording, and when a case goes to a person. The owner approves the terms and every message before the first invoice goes out.",
    },
    {
      title: "The deposit is asked for up front",
      body: "A tap-to-pay link when the job is booked. Asking is the hard part, and a system does not find it awkward.",
    },
    {
      title: "The invoice is raised against the agreement",
      body: "Not against a chat. Whatever both sides signed or accepted is what makes the charge collectable, and the invoice quotes it. Whoever ends up paying it was often not part of the exchange that produced it.",
    },
    {
      title: "It chases, politely, on the owner's schedule",
      body: "A nudge, then another, then it stops and hands the case to a person. The timings are the owner's to set. The value is that the second and third ones really do get sent.",
    },
    {
      title: "It reconciles against the bank",
      body: "To reconcile is to check what was asked for against what really arrived. A note in an email saying a payment has gone out is not a receipt, and a system that treats it as one builds a ledger that is confidently wrong.",
    },
    {
      title: "It asks whether an outside event happened",
      body: "For anything that falls due because of somebody else's work, such as a referral fee on another office's sale, a standing job checks in on a schedule rather than waiting for a person to remember. A plain invoicing tool has no reason to include this step.",
    },
  ],

  handoff: {
    provides: [
      "The terms: deposits, when invoices go out, how long customers have to pay.",
      "Access to the invoicing or accounting tool the business already uses.",
      "The bank feed, read only, so payments can be matched to invoices.",
      "The wording of the reminders, or a yes on ours.",
    ],
    approves: [
      "The terms and every reminder, before the first one goes out.",
      "Every case after the last reminder: a call, a payment plan or a write-off.",
      "Any refund, discount or credit.",
      "Any change to where a payment should go, confirmed by phone on a number already on file.",
    ],
  },

  useCases: [
    {
      title: "A contractor's deposit, asked for every time",
      body: "Asking for money up front feels awkward. Sending a link in the booking confirmation does not. Whether to ask at all is a decision about the business's terms rather than about software.",
    },
    {
      title: "The invoice that sat in the drafts",
      body: "The work is done, the customer is happy, and the invoice sat in the drafts for a week. Sending it automatically on the day takes out a whole kind of delay.",
    },
    {
      title: "A cleaning or landscaping company's monthly invoices",
      body: "Recurring work is billed on the same day each month, the reminders go only to the customers who have not paid, and the owner sees one list of who owes what.",
    },
    {
      title: "The reminder nobody wanted to send",
      body: "The second and third nudges are the ones that do not get sent. Hand them to a system and they go out on the day they were meant to, worded the same way every time.",
    },
    {
      title: "A real estate office's referral that closed quietly",
      body: "A client was sent to another office months ago. Their deal closed and nobody said. There is nothing to chase, because no invoice exists yet. The fix is asking rather than reminding.",
    },
  ],

  limits: [
    "It does not collect a debt. After the sequence it hands the case back to a person with the full history. A customer who will not pay is still a conversation somebody has to have.",
    "It does not know an outside event happened. It can ask, cheaply and again and again. Anybody at the other end can decline to answer.",
    "It does not handle a real estate commission, and does not claim to. A commission comes out of a closing somebody else runs, on a date the deal sets, which is a different thing from an invoice the business sends and follows up.",
    "It does not make money arrive sooner than the payment system allows. When a cheque deposit can be spent is set by Regulation CC, which stops the ordinary schedule above a set amount in one banking day, and by the bank's own policy inside it. No software moves that.",
    "It does not touch money that is not the business's. Anything held for somebody else is ruled by law specific to the state and the trade. That is a talk for the business's lawyer.",
    "It does not decide the terms. What the business charges, what it asks for up front and how long it waits are the owner's calls. This only makes sure they happen on schedule.",
    "It does not check a change of payment instructions. That is a phone call to a number the business already had, made by a person. It is not a feature.",
  ],

  faqs: [
    {
      q: "How do I get clients to pay on time?",
      a: "Raise the invoice when the thing that creates the charge happens, rather than at the end of the week. Ask for a deposit up front where the terms allow it. Then follow up on a fixed schedule, so the awkward second and third reminders really do go out. Where money falls due because of somebody else's work, such as a referral fee, somebody has to ask whether it has happened; there is no invoice to chase until they do.",
    },
    {
      q: "Can it take a deposit before the job starts?",
      a: "Yes. A tap-to-pay link goes out with the booking confirmation. Whether a deposit is right at all is a question about the business's terms, and for some kinds of money held for clients it is a question about which account it is allowed to sit in.",
    },
    {
      q: "What happens if they still do not pay?",
      a: "After the automatic sequence, it comes to a person with the full history: what was sent, when, and what was opened. At that point it is a real conversation, and nobody has spent their own time getting there.",
    },
    {
      q: "Somebody emailed asking us to change their bank details. What now?",
      a: "Phone them on a number the business already had before that email arrived, and confirm it with a person. Not the number in the message, and not one found this afternoon. The FBI's Internet Crime Complaint Center received 21,442 business email compromise complaints in 2024, with reported losses in the billions. No software replaces the phone call.",
    },
    {
      q: "Does this handle a real estate commission?",
      a: "No, and any product that says it does should be asked to explain exactly how, in that state, with that closing agent. A commission is paid out of a closing another party runs, on a date the deal sets. What automation can usefully do around it is track that the deal happened and reconcile what arrived against what was expected.",
    },
    {
      q: "What should a payment reminder say?",
      a: "The business's name, the invoice number, the amount due as it appears on the invoice, the date it was due and one link to pay, in a sentence that assumes the customer forgot rather than refused. The second reminder says the same thing a little more plainly. Anything sharper than that is a conversation for a person, not a template.",
    },
    {
      q: "Does it work with my accounting software?",
      a: "It connects to the invoicing and accounting tools the business already runs and does not replace them, so the record of who owes what stays in one place, and the matching happens against the real bank feed rather than against a list of what was sent.",
    },
  ],

  relatedPosts: [
    "invoicing-and-payments-real-estate-brokerage",
    "workflow-automation-real-estate-business",
  ],
};
