import type { Service } from "./types";

/** COPY key `pay` on realtylt.com/ai. Deep link: /ai#pay
 *
 * SYNCED WITH THE FLAGSHIP in round G. Six of this page's claims rested on a majority of late
 * payments being forgetfulness rather than refusal. That is a claim about WHY a payment is
 * late, and the round G second pass went and followed it: figures for HOW MANY invoices are
 * late do exist and the most prominent states a sample (the QuickBooks Small Business Late
 * Payments Report, a 2025 survey of more than two thousand small businesses, published by a
 * company that sells invoicing software), but a count is not a reason and none of it is about
 * a brokerage. Every one of the killed claims is listed with its replacement in
 * docs/blog-flagship/ROUND-G-LOG.md and guarded in lib/blog/zombie-claims.test.ts.
 *
 * The page also had an audience problem the post fixed. Written for a tradesman finishing a job,
 * it read as though a brokerage's main receivable were an invoice it sends. It is not: the
 * largest sum comes out of a closing another party runs, on a date the transaction sets. The
 * page now says what it can honestly cover and leaves the commission alone. */
export const invoicingAndPayments: Service = {
  slug: "invoicing-and-payments",
  aiKey: "pay",
  name: "Invoicing & Payments",
  tier: "core",

  eyebrow: "Payments · Invoicing + deposits",
  title: "Get paid faster, chase invoices never",
  lede: "The AI sends the invoice the moment a job is booked or finished, takes a deposit up front with a tap-to-pay link, and follows up politely on anything unpaid (a friendly nudge at 3 days, 7, then 14), then hands anything still open to you with the history attached. You never have to send the awkward reminder yourself.",
  specs: ["instant invoices", "deposit + tap-to-pay links", "polite auto follow-up", "tracks who owes what"],
  why: "Nobody enjoys sending the third reminder, which is why it does not get sent. Automating the invoice and the follow-up means both happen on the day they were supposed to, without you playing bad cop.",
  keywords: [
    "automated invoicing software",
    "invoice payment reminders",
    "collect deposits online",
    "get paid faster small business",
    "accounts receivable automation",
  ],

  seo: {
    title: "Automated Invoicing and Payment Follow-Up",
    description:
      "Invoices raised when the thing that creates the charge actually happens, deposits taken with a tap-to-pay link, and polite automatic reminders on a fixed schedule.",
  },

  /** SOURCED, added in round G. Regulation CC's large deposit exception is written in dollars,
   * which is why it applies to a brokerage's cheques as a matter of routine. */
  stat: {
    value: "$6,725",
    label: "above which the ordinary funds availability schedule stops applying to a cheque deposit",
    source: {
      text: "12 CFR 229.13(b), Regulation CC, large deposit exception",
      href: "https://www.law.cornell.edu/cfr/text/12/229.13",
    },
  },

  figure: {
    kind: "timeline",
    caption: "The chase, run by something that never feels awkward",
    events: [
      { at: "On booking", label: "Deposit requested", note: "A tap-to-pay link, before the work starts." },
      { at: "On the event", label: "Invoice raised", note: "Against the agreement, when the thing that creates the charge actually happens." },
      { at: "Day 3", label: "A friendly nudge", note: "The first reminder, sent whether or not anybody feels like sending it." },
      { at: "Day 7", label: "A second reminder", note: "Still polite. Still not you having to send it." },
      { at: "Day 14", label: "Escalated to you", note: "Now it is a real conversation, and you have the full history." },
    ],
    footnote:
      "An illustration of the sequence, not a recording of one. No client, amount or reference on it belongs to anybody. The cadence above is a starting point rather than a rule, and it is yours to set.",
  },

  whatItIs: [
    "It is the part of getting paid that everyone puts off. The invoice that goes out three days late, the deposit nobody asked for, the reminder that feels awkward to send, and the fortnight of silence that follows.",
    "The AI raises the invoice when the thing that creates the charge happens, takes the deposit up front with a tap-to-pay link, and follows up on anything unpaid on a schedule you set. It tracks who owes what, so you always know, and it escalates to you only when it genuinely needs a person.",
    "In a brokerage the harder half is earlier than any of that. Referral fees, transaction-linked work and anything that becomes due because of an event in somebody else's office cannot be chased, because no invoice exists yet. That half is a standing job that goes and asks whether the event has happened, and it is the part worth having.",
  ],

  howItWorks: [
    {
      title: "It asks whether the event happened",
      body: "For anything that becomes due because of somebody else's closing, a standing job checks in on a schedule rather than waiting for a person to remember. This is the step an ordinary invoicing tool has no reason to include, and it is the one that matters most here.",
    },
    {
      title: "The deposit is asked for up front",
      body: "A tap-to-pay link when the job is booked. Asking is the hard part, and a system does not find it awkward.",
    },
    {
      title: "The invoice is raised against the agreement",
      body: "Not against a conversation. Whatever you both signed is what makes the charge collectable, and the invoice quotes it, because whoever eventually pays it was probably not part of the exchange that produced it.",
    },
    {
      title: "It chases, politely, on your schedule",
      body: "A nudge, then another, then it stops and hands the situation to you. The timings are yours to set, and the value is that the second and third ones actually get sent.",
    },
    {
      title: "It reconciles against the bank",
      body: "What was asked for, matched against what actually arrived. A note in an email saying a payment has gone out is not a receipt, and a system that treats it as one produces a ledger that is confidently wrong.",
    },
  ],

  useCases: [
    {
      title: "The referral you never heard closed",
      body: "You sent a client to another brokerage months ago and their deal closed without anybody telling you. There is nothing to chase because no invoice exists, and the fix is asking rather than reminding.",
    },
    {
      title: "The invoice you forgot to send",
      body: "The work is done, the client is happy, and the invoice sat in your drafts for a week. Automating the send removes an entire category of delay.",
    },
    {
      title: "The deposit you never asked for",
      body: "Asking for money up front is uncomfortable and a link in the booking confirmation is not. Whether you ask at all is a decision about your terms rather than about software.",
    },
    {
      title: "The reminder you did not want to send",
      body: "The second and third nudges are the ones that do not get sent. Handing them to a system means they go out on the day they were supposed to, worded the same way every time.",
    },
  ],

  limits: [
    "It does not collect a debt. After the sequence it hands the situation back to you with the full history, and a client who will not pay is still a conversation you have to have.",
    "It does not tell you an event happened. It can ask, cheaply and repeatedly, and anybody at the other end can decline to answer.",
    "It does not handle your commission, and does not claim to. A commission comes out of a closing somebody else runs on a date the transaction sets, which is a different mechanism from an invoice you send and follow up.",
    "It does not make money arrive sooner than the rail allows. When a deposit becomes available to spend is set by regulation and by your bank's policy inside it, and no software moves that.",
    "It does not touch money that is not yours. Anything held on behalf of somebody else is governed by rules specific to your state and your licence, and that is a conversation for your attorney.",
    "It does not decide your terms. What you charge, what you ask for up front and how long you wait are your calls. This only makes sure they happen on schedule.",
    "It does not verify a change of payment instructions. That is a telephone call to a number you already had, made by a person, and it is not a feature.",
  ],

  faqs: [
    {
      q: "How do I get clients to pay faster?",
      a: "Raise the invoice when the thing that creates the charge happens rather than at the end of the week, ask for a deposit up front where your terms allow it, and follow up on a fixed schedule so the awkward second and third reminders actually go out. In a brokerage there is an earlier step that matters more: for anything that becomes due because of somebody else's closing, somebody has to ask whether it has happened, because there is no invoice to chase until they do.",
    },
    {
      q: "Does this handle my commission?",
      a: "No, and any product that says it does should be asked to explain exactly how, in your state, with your closing agent. A commission is paid out of a closing another party runs on a date the transaction sets. What automation can usefully do around it is track that the transaction happened and reconcile what arrived against what you expected.",
    },
    {
      q: "Can it take a deposit before the job starts?",
      a: "Yes. A tap-to-pay link goes out with the booking confirmation. Whether a deposit is appropriate at all is a question about your terms and, for some kinds of money in this industry, about which account it is allowed to sit in.",
    },
    {
      q: "What happens if they still do not pay?",
      a: "After the automated sequence, it escalates to you with the full history: what was sent, when, and what was opened. At that point it is a real conversation, and you have not spent any of your own time getting there.",
    },
    {
      q: "Somebody emailed asking us to change their bank details. What now?",
      a: "Telephone them on a number you already had before that email arrived, and confirm it with a person. Not the number in the message and not one you found this afternoon. The FBI's 2024 report records 21,442 business email compromise complaints and $2.77 billion in reported losses, and its worked example of a spoofed request to wire closing funds sits in exactly that category. No software replaces the phone call.",
    },
    {
      q: "Does it work with my accounting software?",
      a: "It connects to the invoicing and accounting tools you already run rather than replacing them, so the record of who owes what stays in one place, and so the reconciliation happens against your real bank feed rather than against a list of what was sent.",
    },
  ],

  relatedPosts: [
    "invoicing-and-payments-real-estate-brokerage",
    "workflow-automation-real-estate-business",
  ],
};
