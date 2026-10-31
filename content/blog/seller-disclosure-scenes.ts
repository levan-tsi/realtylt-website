/** Scene copy for "Seller disclosure in New York" (slug seller-disclosure-requirements-new-york).
 *
 * ROUND 14, 2026-10-30. The post's words came through the agents' review chain and Levan's desk
 * (company/pieces/realtylt/seller-disclosure-requirements-new-york/post.md) and are approved as
 * written. Each scene below draws one data point from that piece's visuals/data-points.md, plus
 * the infographic of the whole post ("the disclosure plan") and the free file.
 *
 * THE RULES THIS FILE IS HELD TO:
 *  - every number, date and source name printed here appears word for word in the post;
 *  - scene copy is labels and short lines, never a body sentence repeated (flagship.test.ts
 *    walks every string for an eight-word echo);
 *  - no em dashes, sentence case, no claim the post does not make. */

import type { FlagshipContent } from "@/lib/blog/flagship";

const NYSBA = "https://nysba.org/pcda-amended-500-seller-credit-deleted-and-additional-questions-added-to-pcds/";
const DOS_FORM = "https://dos.ny.gov/property-condition-disclosure-statement-eff-7125";
const HGAR = "https://hgar.com/nysar-legal-update-amended-pcds-must-be-used-beginning-july-1-2025";
const S10426 = "https://www.nysenate.gov/legislation/bills/2025/S10426";
const RPL = (s: string) => `https://www.nysenate.gov/legislation/laws/RPP/${s}`;
const EPA = "https://www.epa.gov/lead/real-estate-disclosures-about-potential-lead-hazards";
const READ = { text: "read October 29, 2026" };

export const SELLER_DISCLOSURE_FLAGSHIP: FlagshipContent = {
  hero: {
    moment: "56",
    suffix: "questions",
    photo: "/images/editorial/signature-ink.jpg",
    signature: "porchlight",
  },
  scenes: {
    /** dp2, the timeline. True-date spacing; the law filled, the bill hollow. */
    "form-timeline": {
      kind: "timeline",
      band: "dark",
      eyebrow: "How the form changed",
      heading: "What is law now, and what is only a bill",
      lede: "Spaced by the real calendar. Filled dots are law. Hollow dots are a bill and the day we checked on it.",
      alt: "A timeline from March 20, 2024, when the $500 credit was repealed and seven flood questions took the form from 49 to 56, through the septic amendment signed on September 27, 2024 and DOS-1614-f (Rev. 02/25) required on July 1, 2025, to bill S10426 of May 15, 2026, still in committee and not law when checked on October 29, 2026.",
      events: [
        {
          date: "2024-03-20",
          display: "March 20, 2024",
          title: "The $500 credit is repealed",
          detail: "Seven flood questions are added: 49 to 56 questions.",
        },
        {
          date: "2024-09-27",
          display: "September 27, 2024",
          title: "The septic amendment is signed",
          detail: "Septic information under question 36, the sewage question.",
        },
        {
          date: "2025-07-01",
          display: "July 1, 2025",
          title: "DOS-1614-f (Rev. 02/25) is required",
          detail: "Older printed copies are out of date.",
        },
        {
          date: "2026-05-15",
          display: "May 15, 2026",
          title: "Bill S10426 would add question 27-a",
          detail: "Testing or cleanup near a Superfund or brownfield site.",
          pending: true,
        },
        {
          date: "2026-10-29",
          display: "October 29, 2026",
          title: "Still in the Senate Judiciary Committee",
          detail: "Not law. The current form does not ask it.",
          pending: true,
        },
      ],
      sources: [
        { text: "New York State Bar Association, Karl Holtzschue, February 28, 2024", href: NYSBA },
        { text: "New York State Association of REALTORS, legal update published by HGAR, 2025", href: HGAR },
        { text: "Department of State form page, in effect from July 1, 2025", href: DOS_FORM },
        { text: "Senate bill S10426", href: S10426 },
        READ,
      ],
    },

    /** dp1, the anatomy figure: the form as 56 cells, a section per group, with a count strip. */
    "form-anatomy": {
      kind: "cells",
      band: "light",
      eyebrow: "The form, question by question",
      heading: "56 questions in four sections",
      lede: "Every cell is one question on DOS-1614-f (Rev. 02/25), in the order the form asks them.",
      alt: "The New York disclosure form drawn as 56 cells in four sections, with the eight flood questions highlighted, question 36 on sewage outlined, and a bar showing the form grew from 49 to 56 questions when seven flood questions were added on March 20, 2024.",
      groups: [
        { label: "General information", range: "Questions 1 to 9", from: 1, to: 9 },
        { label: "Environmental", range: "Questions 10 to 27", from: 10, to: 27 },
        { label: "Structural", range: "Questions 28 to 33", from: 28, to: 33 },
        { label: "Mechanical systems and services", range: "Questions 34 to 56", from: 34, to: 56 },
      ],
      marks: [
        { cells: [10, 11, 12, 13, 14, 15, 16, 17], label: "Eight flood questions", tone: "fill" },
        { cells: [36], label: "Question 36, the sewage question", tone: "ring", numbered: true },
      ],
      strip: [
        { label: "Questions before March 20, 2024", value: 49, display: "49" },
        { label: "Questions since, with seven flood questions added", value: 56, display: "56", lit: true },
      ],
      sources: [
        { text: "Real Property Law 462(2), the form text", href: RPL("462") },
        { text: "Department of State, DOS-1614-f (Rev. 02/25)", href: DOS_FORM },
        { text: "New York State Bar Association, Karl Holtzschue, February 28, 2024", href: NYSBA },
        READ,
      ],
      note: "The sections and the flood questions are counted from the form text in the statute.",
    },

    /** dp4, one line of the form and its four boxes. The tick is an example, not data. */
    "four-answers": {
      kind: "tiles",
      band: "dark",
      eyebrow: "One line of the form",
      heading: "Every question takes one of the same four answers",
      alt: "One line of the disclosure form with its four answer boxes, Yes, No, Unkn and NA, with Unkn ticked as an example, beside the rules: answer from your actual knowledge, complete the form yourself, it is not a warranty, and a seller is liable only for a willful failure.",
      specimen: {
        line: "Any question on the form",
        options: ["Yes", "No", "Unkn", "NA"],
        ticked: 2,
        tag: "Unkn (unknown) is ticked here as an example. It is a fair answer when you do not know.",
      },
      columns: 2,
      tiles: [
        { title: "Answer from your actual knowledge", body: "Real Property Law 461 defines knowledge that way." },
        { title: "Complete the form yourself", body: "As the form's own instructions say." },
        { title: "It is not a warranty", body: "And not a substitute for inspections." },
        { title: "Liable only for a willful failure", body: "For that, the buyer's actual damages, under Real Property Law 465." },
      ],
      sources: [
        { text: "DOS-1614-f (Rev. 02/25), Department of State", href: DOS_FORM },
        { text: "Real Property Law 461", href: RPL("461") },
        { text: "Real Property Law 465", href: RPL("465") },
        READ,
      ],
    },

    /** dp3, the decision flow: two questions, two exits, one end state. */
    "who-files": {
      kind: "flow",
      band: "light",
      eyebrow: "Does the form apply to your sale",
      heading: "Two questions decide it",
      alt: "A decision flow: if the home is not a one- to four-family home, such as a condominium unit or co-op apartment, it is outside the act; if the transfer is one of the 14 kinds in Real Property Law 463, no statement is needed; otherwise the seller delivers the statement before the buyer signs a binding contract.",
      gates: [
        {
          ask: "Is it a one- to four-family home?",
          pass: "Yes",
          exit: "No",
          outcome: "Outside the act",
          detail: "Condominium units, co-op apartments, homeowners' association property the seller does not own in fee simple, and land where a home is still to be built.",
        },
        {
          ask: "Is the sale one of the 14 kinds of transfer in section 463?",
          pass: "No",
          exit: "Yes",
          outcome: "No statement needed",
          detail: "Court orders and foreclosures, estates and trusts, transfers between co-owners or spouses, government transfers, and new homes never lived in.",
        },
      ],
      end: {
        title: "The seller delivers the completed statement before the buyer signs a binding contract of sale",
        detail: "Your attorney confirms it for your sale.",
      },
      sources: [
        { text: "Real Property Law 461", href: RPL("461") },
        { text: "Real Property Law 462", href: RPL("462") },
        { text: "Real Property Law 463", href: RPL("463") },
        READ,
      ],
    },

    /** dp5, the lead paint card: six tiles, the two numbers large. */
    "lead-paint": {
      kind: "tiles",
      band: "dark",
      eyebrow: "Homes built before 1978",
      heading: "Six federal duties for the seller of most pre-1978 homes",
      alt: "A card for homes built before 1978 listing the seller's six federal lead paint duties: the pamphlet, disclosing known lead paint, handing over reports, the Lead Warning Statement, 10 days for the buyer's inspection and keeping signed copies for three years.",
      columns: 3,
      tiles: [
        { title: "Give the buyer the pamphlet", body: "The EPA's Protect Your Family From Lead in Your Home." },
        { title: "Disclose known lead-based paint and hazards" },
        { title: "Hand over any reports" },
        { title: "Put the Lead Warning Statement in the contract" },
        {
          figure: "10 days",
          title: "For the buyer's lead inspection or risk assessment",
          body: "The parties can change it in writing, or the buyer can waive it.",
        },
        { figure: "Three years", title: "Keep signed copies of the disclosures", body: "Counted from the sale." },
      ],
      sources: [
        {
          text: "U.S. Environmental Protection Agency, lead hazard disclosures page, updated May 27, 2026",
          href: EPA,
        },
        READ,
      ],
    },

    /** The infographic of the whole post: three facts, then the four steps, with step 3's map of
     * each paper to its question number lit on a miniature of the 56-question form. */
    "disclosure-plan": {
      kind: "steps",
      band: "light",
      eyebrow: "The disclosure plan",
      heading: "Four steps before you list",
      alt: "The disclosure plan in four steps, talk to your attorney, list every known issue, gather the paper, fill in and deliver the form, with step 3 mapping each document to the questions that ask for it on a miniature of the 56-question form.",
      facts: [
        { figure: "Rev. 02/25", title: "DOS-1614-f, required since July 1, 2025" },
        { figure: "56", title: "Questions, in four sections" },
        { title: "Delivered before the buyer signs a binding contract" },
      ],
      steps: [
        { title: "Talk to your attorney before you list" },
        {
          title: "Walk your house and list every known issue",
          body: "Every past repair and improvement too.",
          example: "Roof leak two winters ago; carpenter ant treatment; sump pump that runs every spring.",
        },
        {
          title: "Gather the paper the form asks about",
          body: "Plus permits for any work done, warranties, repair invoices and your own purchase inspection report.",
          chips: [
            { label: "Certificates of occupancy", value: "Question 9" },
            { label: "Flood insurance and elevation certificates", value: "Questions 15 and 16" },
            { label: "Radon, water and mold test reports", value: "Questions 24, 35 and 27" },
            { label: "Septic age and pump-out dates", value: "Question 36" },
          ],
          mini: { total: 56, breaks: [9, 27, 33], lit: [9, 15, 16, 24, 27, 35, 36] },
        },
        { title: "Fill it in yourself, review it with your attorney, deliver it before the buyer signs" },
      ],
      sources: [
        { text: "the post's own plan" },
        { text: "question numbers from DOS-1614-f (Rev. 02/25), Department of State", href: DOS_FORM },
        READ,
      ],
    },

    /** The free file's line. */
    "prep-sheet": {
      kind: "offer",
      band: "light",
      eyebrow: "The free file",
      text: "The disclosure prep sheet: one page that ties each document to the question number that asks for it, with a box to tick for each.",
      reassure: "A free printable PDF, one page. Nothing to sign up for.",
      action: { label: "Download the prep sheet", href: "/downloads/seller-disclosure-prep-sheet-ny.pdf" },
      ariaLabel: "Download the free disclosure prep sheet",
    },
  },

  headingLabels: {
    "the-form-is-required-on-most-sales": "Required on most sales",
    "what-the-56-questions-cover": "The 56 questions",
    "answer-from-what-you-actually-know": "How to answer",
    "selling-as-is-does-not-cover-a-known-hidden-defect": "Selling as is",
    "frequently-asked-questions": "Common questions",
  },
};
