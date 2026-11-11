import type { Service } from "./types";

/** COPY key `crmsync` on realtylt.com/ai. Deep link: /ai#crmsync
 *
 * ROUND D (2026-08-25) and ROUND 47 removed three unqualified claims ("agents lose deals to stale
 * CRMs", "the record you look at is true", "deals lost quietly"); they are guarded in
 * lib/blog/zombie-claims.test.ts and stay gone.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's job app and CRM, an
 * accounting office's client portal, a salon's booking app, a real estate office's CRM as ONE
 * example). Vendor and tool names out of the copy (BRAND section 5): the page says "the CRM the
 * business already uses". Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/crmsync/: Winkler, Overview of Record Linkage, U.S.
 * Census Bureau 2006 ("even high quality files might contain 20+% error in first name pairs ...
 * among pairs that are true matches"; thresholds "determined by a priori error bounds on false
 * matches and false nonmatches"; a middle band "held for clerical review"). The stat keeps the
 * hedge ROUND I restored. */
export const crmSync: Service = {
  slug: "crm-sync",
  aiKey: "crmsync",
  name: "Two-Way CRM Sync",
  tier: "more",

  eyebrow: "Sync · Two-way CRM",
  title: "CRM sync: the customer record stays current without retyping",
  lede: "The booking is in one app, the invoice in another, the call notes on somebody's phone, and the CRM shows a customer who has not been touched in a month. We connect the apps the business already uses to its CRM in both directions: every call, text, booking and job is written to the customer's record as it happens, and a change in the CRM flows back out to the systems that act on it.",
  specs: ["works with the CRM you use", "two-way sync", "one person, one record", "no double entry"],
  why: "A stale record is not a filing problem. It is the reason an automated message goes to somebody who already booked, or already paid, last week. With two-way sync, the record in front of the team is the one the other systems act on, and every touch is written to it as it happens.",
  keywords: [
    "crm integration for small business",
    "two way crm sync",
    "crm data entry automation",
    "duplicate contacts in crm",
    "crm sync automation real estate",
  ],

  seo: {
    title: "Two-way CRM sync for small business: no double entry",
    description:
      "CRM sync for a small business: every call, text, booking and job writes back to the customer record, changes flow the other way, and duplicates go to a person.",
  },

  /** ROUND D: the one measurement in this subject with a published method behind it, with the
   * hedge ROUND I restored ("might contain 20+% error"). */
  stat: {
    value: "20%+",
    label: "of record pairs that are the same person can disagree on the first name, even in files somebody has already cleaned",
    source: {
      text: "W. E. Winkler, Overview of Record Linkage and Current Research Directions, U.S. Census Bureau, 2006",
      href: "https://www.census.gov/content/dam/Census/library/working-papers/2006/adrm/rrs2006-02.pdf",
    },
  },

  figure: {
    kind: "flow",
    caption: "Both directions, continuously, without anyone typing",
    trigger: "Anything happens anywhere",
    nodes: [
      { label: "A call is taken", note: "The transcript, the outcome and the next step land on the customer's record." },
      { label: "A text is answered", note: "The thread is attached to the customer, not stranded on one person's phone." },
      { label: "A job is booked or paid", note: "The booking app and the invoicing app write the date and the amount to the same record." },
      { label: "The CRM is updated", note: "A stage change in the CRM flows back out, so a reminder stops when the job is booked." },
      { label: "Nothing is retyped", note: "The call, the text and the booking arrive on the record without anybody copying them across. Copying across is where a digit goes missing." },
    ],
    footnote: "An invented example. Every arrow above is a decision somebody made: which field identifies a person, which side wins a disagreement, and what happens when the same message arrives twice.",
  },

  whatItIs: [
    "It is the connection between the CRM and everything that actually happens. Calls, texts, bookings, jobs, invoices and website conversations all produce information that belongs on the customer's record. Most of it never gets there, because putting it there is somebody's manual job.",
    "Two-way sync means it lands automatically, and that changes made in the CRM flow back out to the systems that need them. So the record the team is looking at is the one the automations are acting on, not a copy of how things were last month.",
    "It fits any business that runs on more than one app: a contractor with a job app, a CRM and an accounting tool; an accounting office with a client portal and a practice tool; a salon or gym with a booking app and a CRM; a real estate office with a CRM and a transaction tool. Before anything is connected, we write down which app is the record of truth for each kind of fact.",
  ],

  howItWorks: [
    {
      title: "We map the apps and agree the rules",
      body: "Which apps hold which facts, which field identifies a person, and which side wins when both have changed. The owner approves those rules, and they are written down where anyone can read them.",
    },
    {
      title: "Everything writes back",
      body: "Every call, text, booking, job and enrichment writes to the customer's record as it happens, with the transcript or the details attached.",
    },
    {
      title: "Changes flow the other way too",
      body: "A stage change or a note added in the CRM goes back out, so the automation acting on that customer is acting on current information.",
    },
    {
      title: "One person, matched rather than retyped",
      body: "An inbound record is compared against what is already there, by the rule agreed when it was built. A match updates the existing contact. Pairs that are genuinely ambiguous go to a short review list for a person; they are not merged on a guess.",
    },
    {
      title: "Watched, with a person told when it breaks",
      body: "Every sync is logged, and a failure sends a message to a named person rather than silently leaving the two sides apart. A sync breaks the day an app renames a field, so somebody is always the one who looks.",
    },
  ],

  handoff: {
    provides: [
      "Access to the CRM and to each app that should write to it.",
      "Which app is the record of truth for each fact: the phone, the address, the stage.",
      "The person who settles the review list of possible duplicates.",
      "The person who is told when a sync fails.",
    ],
    approves: [
      "The matching rule and the conflict rule, before the first record moves.",
      "Every merge on the review list of ambiguous pairs.",
      "Any bulk change to existing records.",
      "Which fields never leave the CRM.",
    ],
  },

  useCases: [
    {
      title: "A contractor whose reminders stop when the job is booked",
      body: "The estimate follow-up stops the moment the job lands in the job app, because the CRM hears about it. The visible version of a stale record, a reminder sent to somebody who already booked, goes away.",
    },
    {
      title: "No more double entry",
      body: "Information one app already holds stops being retyped into the next. That removes the step where a number gets one digit wrong on its way across.",
    },
    {
      title: "An accounting office with one client record",
      body: "The client portal, the practice tool and the CRM agree on the client's email and phone, so a document request goes to the address the client actually uses.",
    },
    {
      title: "A salon or gym where the booking app and the CRM agree",
      body: "A cancelled membership or a moved appointment in the booking app changes the record the marketing reads, so nobody gets a welcome-back offer the day after they cancelled.",
    },
    {
      title: "A real estate office whose nurture stops at contract",
      body: "A nurture sequence can fire at somebody who already went under contract. That happens because the sequence and the deal are looking at two different copies of the same person, and two-way sync gives them one.",
    },
  ],

  limits: [
    "It does not clean the data already in there. Sync keeps both sides in step. Years of half-finished records are a separate job, and data enrichment is the service for it.",
    "It does not decide which side is right. Conflict rules get agreed when it is built. The rule that suits the team has to be chosen rather than assumed.",
    "It does not open an app that will not open. Most CRMs and business apps expose a connection for this, and the sync is built to each one rather than limited to a fixed list. But a closed platform stays closed.",
    "It does not make anybody use the CRM. If the team is still working out of a notebook, an up-to-date record is worth nothing.",
    "It does not remove the human decision. The published model for matching records has three outcomes rather than two. The middle one is a short list of ambiguous pairs for a person to settle. Anything advertising a hundred percent automatic resolution has widened its threshold. It is merging people.",
  ],

  faqs: [
    {
      q: "What is two-way CRM sync?",
      a: "It means information flows in both directions. Activity from calls, texts, bookings, jobs and automations writes into the CRM, and changes made inside the CRM flow back out to the systems that act on them. One-way sync leaves one side permanently out of date.",
    },
    {
      q: "Does it work with the CRM I already use?",
      a: "Usually, yes. Most CRMs and the common booking, job and invoicing apps expose a connection for this, and the sync is built to each one rather than limited to a fixed list of supported integrations. Where an app offers no connection at all, we say so before anything is built.",
    },
    {
      q: "Will it create duplicate contacts?",
      a: "Preventing them is what it is for. The owner nominates an identity field and a matching rule is agreed when it is built, so an inbound record matching an existing contact updates that contact. What no honest build promises is that matching is never wrong in either direction, because the published model behind all of this sets its thresholds from the two error rates a business is willing to accept and cannot drive both to zero. That is why ambiguous pairs go to a review list instead of being merged.",
    },
    {
      q: "Which side wins when both systems have changed the same field?",
      a: "Whichever one the conflict rule says. The rule is a decision made when the sync is built, rather than a default. A common arrangement has two halves: the most recently changed value wins for facts like a phone number, and the CRM wins for anything about the relationship, such as the stage of a job. There is no rule that is right for every field. The important part is that it is written down somewhere the team can read it.",
    },
    {
      q: "How do I stop duplicate contacts in my CRM?",
      a: "Decide which field identifies a person, usually the mobile number or the email, make every app match on it before creating a record, and send the uncertain pairs to a person rather than merging them automatically. Then clean the duplicates already there once, as a separate job, and the sync keeps new ones from piling up.",
    },
  ],

  relatedPosts: [
    "crm-sync-real-estate-duplicate-contact-records",
    "ai-agent-workforce-real-estate-assistants",
    "workflow-automation-real-estate-business",
  ],
};
