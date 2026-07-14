import type { Service } from "./types";

/** COPY key `pay` on realtylt.com/ai. Deep link: /ai#pay */
export const invoicingAndPayments: Service = {
  slug: "invoicing-and-payments",
  aiKey: "pay",
  name: "Invoicing & Payments",
  tier: "core",

  eyebrow: "Payments · Invoicing + deposits",
  title: "Get paid faster, chase invoices never",
  lede: "The AI sends the invoice the moment a job is booked or finished, takes a deposit up front with a tap-to-pay link, and follows up politely on anything unpaid (a friendly nudge at 3 days, 7, then 14) until the money is in your account. You never have to send the awkward reminder yourself.",
  specs: ["instant invoices", "deposit + tap-to-pay links", "polite auto follow-up", "tracks who owes what"],
  why: "Late payments quietly drain small businesses, and nobody enjoys sending the third reminder. Automated invoicing and gentle chasing cut the wait from weeks to days, without you playing bad cop.",
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
      "Invoices sent the moment a job is booked or finished, deposits taken with a tap-to-pay link, and polite automatic reminders at 3, 7, and 14 days until you are paid.",
  },

  figure: {
    kind: "timeline",
    caption: "The chase, run by something that never feels awkward",
    events: [
      { at: "On booking", label: "Deposit requested", note: "A tap-to-pay link, before the work starts." },
      { at: "On completion", label: "Invoice sent", note: "Immediately, while the job is still fresh in their mind." },
      { at: "Day 3", label: "A friendly nudge", note: "Most late invoices are forgotten, not refused." },
      { at: "Day 7", label: "A second reminder", note: "Still polite. Still not you having to send it." },
      { at: "Day 14", label: "Escalated to you", note: "Now it is a real conversation, and you have the full history." },
    ],
    footnote: "Nobody enjoys sending the third reminder, which is precisely why it does not get sent.",
  },

  whatItIs: [
    "It is the part of getting paid that everyone puts off. The invoice that goes out three days late, the deposit nobody asked for, the reminder that feels awkward to send, and the fortnight of silence that follows.",
    "The AI sends the invoice the moment the job is booked or done, takes the deposit up front with a tap-to-pay link, and follows up on anything unpaid on a polite schedule until the money arrives. It tracks who owes what, so you always know, and it escalates to you only when it genuinely needs a person.",
  ],

  howItWorks: [
    {
      title: "The deposit is asked for up front",
      body: "A tap-to-pay link when the job is booked. Asking is the hard part, and a system does not find it awkward.",
    },
    {
      title: "The invoice goes out immediately",
      body: "Not at the weekend when you catch up on admin. The moment the job is finished, while it is still front of mind for the person paying.",
    },
    {
      title: "It chases, politely, on a schedule",
      body: "A nudge at three days, another at seven, another at fourteen. Most late payments are forgotten rather than refused, and a reminder is all they ever needed.",
    },
  ],

  useCases: [
    {
      title: "The invoice you forgot to send",
      body: "The work is done, the client is happy, and the invoice sat in your drafts for a week. Automating the send removes an entire category of delay.",
    },
    {
      title: "The deposit you never asked for",
      body: "Deposits reduce no-shows and cancellations, and almost nobody collects them consistently, because asking feels uncomfortable. A link in the booking confirmation does not.",
    },
    {
      title: "The reminder you did not want to send",
      body: "The third nudge is the one that gets paid, and the one that never gets sent. Handing it to a system solves it without you playing bad cop.",
    },
  ],

  faqs: [
    {
      q: "How do I get clients to pay faster?",
      a: "Send the invoice immediately rather than at the end of the week, ask for a deposit up front, and follow up on a fixed schedule. Most late payments are simple forgetfulness, so a polite reminder at three, seven, and fourteen days recovers the majority of them, and automating it means the reminders actually get sent.",
    },
    {
      q: "Can it take a deposit before the job starts?",
      a: "Yes. A tap-to-pay link goes out with the booking confirmation, which also reduces no-shows because a person who has paid something turns up.",
    },
    {
      q: "What happens if they still do not pay?",
      a: "After the automated sequence, it escalates to you with the full history: what was sent, when, and what was opened. At that point it is a real conversation, and you have not spent any of your own time getting there.",
    },
    {
      q: "Does it work with my accounting software?",
      a: "It connects to the invoicing and accounting tools you already run rather than replacing them, so the record of who owes what stays in one place.",
    },
  ],
};
