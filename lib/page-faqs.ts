import { SITE } from "@/lib/site";

/** Visible FAQs for the three core marketing pages (launch-list quick win, round 39).
 *
 * The services pages already answer questions this way (components/services/Faq.tsx) and
 * emit FAQPage schema; /buying, /selling and /financing had neither. The answers here are
 * written the way Levan would answer them on the phone, and every claim is either the
 * page's own (seller-paid buyer compensation on /buying; the 24-hour cash offer and the
 * 15-comp method on /selling) or a number that holds for New York generally. No answer
 * promises a result.
 */

export type PageFaqItem = { q: string; a: string };

export const BUYING_FAQS: PageFaqItem[] = [
  {
    q: "What does it cost to work with you as a buyer?",
    a: "In nearly every case, nothing. Our compensation comes from the seller's side of the transaction, and we put that in writing before we tour a single home. If a specific listing ever works differently, you will know before you see it, not after.",
  },
  {
    q: "Do I need a pre-approval before we start looking?",
    a: "Not for the first conversation. Before we write an offer, yes: sellers do not take offers seriously without one. If you do not have a lender yet, we will introduce you to ones our clients have closed with.",
  },
  {
    q: "Which areas do you cover?",
    a: "Most of downstate New York: Dutchess, Westchester, Putnam, Rockland, Ulster, and Orange counties, plus all five boroughs of New York City. If your search runs from Poughkeepsie to Brooklyn, one team handles all of it.",
  },
  {
    q: "How long does it take to buy a home in New York?",
    a: "The search is yours to pace, and nobody here rushes you into a house. Once an offer is accepted, New York's contract process usually takes 60 to 90 days to reach closing, and we manage every step in between.",
  },
  {
    q: "What happens after my offer is accepted?",
    a: "New York is an attorney state, so the contract is drawn and reviewed by lawyers. We schedule the inspection, keep the attorneys, lender, and sellers moving, and walk the property with you before closing. You are never the one chasing people.",
  },
];

export const SELLING_FAQS: PageFaqItem[] = [
  {
    q: "What are the two ways you price a home?",
    a: "A guaranteed cash offer in 24 hours, or a full listing priced from 15 comparable properties: five active, five pending, five sold. You see both numbers and choose the trade: speed and certainty, or top of market.",
  },
  {
    q: "What does selling cost me?",
    a: "The commission and every other cost is in the listing agreement you sign before anything goes live, so nothing surprises you at the closing table. Ask us for the net sheet: one page that shows what you walk away with at a given price.",
  },
  {
    q: "Do I need to renovate before listing?",
    a: "Usually no. Most repairs return less than they cost at sale. We walk the house and tell you the short list that actually moves the price, and what to leave for the next owner.",
  },
  {
    q: "How fast will it sell?",
    a: "Priced from the comps, most well-presented homes go under contract within the first few weeks; the cash-offer route closes on your schedule. What sets the pace is price, condition, and season, and we will be straight with you about all three.",
  },
  {
    q: "Can I sell this home and buy the next one at the same time?",
    a: "Yes, and we do it constantly. We line up the two timelines and negotiate the flexibility you need on each side. When certainty matters more than the last dollar, the cash offer on your sale removes the hardest variable.",
  },
];

export const FINANCING_FAQS: PageFaqItem[] = [
  {
    q: "Are you a lender?",
    a: "No. We are your agents, and the financing help here is about protecting your side of the deal. We connect you with lenders our clients have actually closed with, and we read the numbers with you before you sign anything.",
  },
  {
    q: "What is the difference between pre-qualification and pre-approval?",
    a: "A pre-qualification is an estimate built from what you tell a lender. A pre-approval means the lender has verified your income, credit, and assets. That letter is what a seller takes seriously when your offer lands next to someone else's.",
  },
  {
    q: "How much do I need for a down payment?",
    a: "Less than most people think. Conventional programs start around 3 to 5 percent, FHA at 3.5, and VA and USDA can be zero down if you qualify. Twenty percent avoids mortgage insurance, but waiting years to save it often costs more than the insurance does.",
  },
  {
    q: "What closing costs should I expect in New York?",
    a: "Plan on roughly 2 to 5 percent of the purchase price on top of your down payment: lender fees, title, attorney, and New York's mortgage recording tax. Above one million dollars the state adds the mansion tax. We put the full sheet in front of you before you commit.",
  },
  {
    q: "My credit is not perfect. Can I still buy?",
    a: "Often, yes. FHA programs go lower than most people expect, and a good loan officer can map the two or three moves that raise your score fastest. The only way to know is to ask, and the conversation costs nothing.",
  },
];

/** FAQPage JSON-LD for a marketing page — same shape the services pages emit. */
export function pageFaqJsonLd(faqs: PageFaqItem[], path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE.url}${path}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
