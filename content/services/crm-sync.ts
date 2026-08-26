import type { Service } from "./types";

/** COPY key `crmsync` on realtylt.com/ai. Deep link: /ai#crmsync */
export const crmSync: Service = {
  slug: "crm-sync",
  aiKey: "crmsync",
  name: "Two-Way CRM Sync",
  tier: "more",

  eyebrow: "Sync · Two-way CRM",
  title: "Your CRM stays true without the data entry",
  lede: "Every call, text, booking, and enriched contact writes straight back to Follow Up Boss, kvCORE, HubSpot, or your CRM, and pulls updates the other way. n8n keeps both sides in lockstep so nothing lives in two places out of date.",
  specs: ["Follow Up Boss / kvCORE / HubSpot", "two-way sync", "n8n orchestration", "no double entry"],
  // ROUND D, 2026-08-25. Was "Agents lose deals to stale, half-updated CRMs. Real-time two-way
  // sync means the record you look at is the record that's true, with every touch logged
  // automatically." Two problems. The first sentence asserts that deals are lost and nobody
  // here has measured that; the flagship post refuses to price a stale record for exactly that
  // reason. The second says the record is "true" without qualification, which the research on
  // this page's own topic does not support. Replaced with the mechanism, which is real and
  // needs no figure under it. THIS IS /ai COPY: the journey and this page now differ here.
  why: "A stale record is not a filing problem. It is the reason an automated message goes to somebody who signed last week. Two-way sync means the record in front of you is the one the rest of your systems are acting on, with every call, text and booking written to it as it happens.",
  keywords: [
    "crm sync automation real estate",
    "follow up boss integration",
    "kvcore automation",
    "two way crm sync realtor",
    "real estate crm data entry automation",
  ],

  seo: {
    title: "Two-Way CRM Sync for Follow Up Boss, kvCORE, and HubSpot",
    description:
      "Every call, text, booking, and enriched contact writes back to your CRM, and updates flow the other way, so the record you are looking at is true.",
  },

  /** ROUND D: `stat` added, carrying the one measurement in this subject with a published
   * method behind it. Winkler's overview for the Census Bureau cites his own earlier finding
   * about first name pairs among pairs that are TRUE MATCHES. It is the number that explains
   * why deduplication is hard, and it comes from outside this business, so it carries its
   * source.
   *
   * ROUND I RESTORED THE HEDGE, and it went missing here first. The operative sentence, read
   * in the Census PDF: "Winkler (1990a) showed that even high quality files MIGHT CONTAIN 20+%
   * error in first name pairs and 10+% error in last name pairs among pairs that are true
   * matches." This comment dropped "might", and the label underneath it then printed the
   * number as a flat property of every cleaned file. Same figure, same source, correct
   * citation; only the modality had moved, which is the cheapest way for a page to overstate
   * a paper it is quoting accurately. */
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
      { label: "The AI takes a call", note: "Transcript, outcome, and next step land on the contact record." },
      { label: "A text is answered", note: "The thread is attached to the lead, not stranded in a phone." },
      { label: "The CRM is updated", note: "A stage change in Follow Up Boss flows back out to everything else." },
      { label: "Nothing is retyped", note: "One record, true in both places, all the time." },
    ],
    // ROUND D: was "The deals lost to a stale CRM are lost quietly, which is why nobody counts
    // them." It asserts that deals are lost, which nobody here has measured and which the
    // flagship post explicitly refuses to price. Guarded in lib/blog/zombie-claims.test.ts.
    footnote: "Every arrow above is a decision somebody made: which field identifies a person, which side wins a disagreement, and what happens when the same message arrives twice.",
  },

  whatItIs: [
    "It is the connection between your CRM and everything that actually happens. Calls, texts, bookings, enriched contacts, and website conversations all produce information that should be on the contact record, and most of it never gets there because putting it there is somebody's manual job.",
    "Two-way sync means it lands automatically, and that changes to the CRM flow back out to the systems that need them. n8n keeps both sides in step, so the record you are looking at is the one the automations are acting on rather than a copy of how things were.",
  ],

  howItWorks: [
    {
      title: "Everything writes back",
      body: "Every AI call, text, booking, and enrichment writes to the contact record as it happens, with the transcript and the outcome attached.",
    },
    {
      title: "Changes flow the other way too",
      body: "A stage change or a note added in the CRM propagates out, so the automation acting on that contact is acting on current information.",
    },
    {
      // ROUND D: was "Deduping and conflict rules mean one contact stays one contact, rather
      // than becoming three slightly different ones across three systems." The published model
      // this rests on says you choose between two error rates and cannot set both to zero, so
      // a flat guarantee is not a claim this page can make. What it can describe is the
      // mechanism, including the third outcome, which is the honest and more useful answer.
      title: "One person, matched rather than retyped",
      body: "An inbound record is compared against what is already there on a rule agreed when it is built, so a match updates the existing contact. Pairs that are genuinely ambiguous go to a short review list rather than being merged on a guess.",
    },
  ],

  useCases: [
    {
      title: "The CRM that is finally accurate",
      body: "Every touch is logged, so the record reflects the relationship rather than the last time somebody remembered to update it.",
    },
    {
      title: "No more double entry",
      // ROUND D: was "...which is where a large share of admin hours quietly go." An unsourced
      // quantity. Guarded in lib/blog/zombie-claims.test.ts.
      body: "Information a system already holds stops being retyped into the next system, which removes the step where a number gets one digit wrong on its way across.",
    },
    {
      title: "Automations that act on the current record",
      // ROUND D: was "...is what a stale CRM costs you, and it is entirely avoidable." Two
      // claims with nothing under them: that it is a cost, and that it is entirely avoidable.
      body: "A nurture sequence firing at somebody who already went under contract is the visible version of a record that is out of date, and it happens because the sequence and the deal are looking at two different copies of the same person.",
    },
  ],

  limits: [
    "It does not clean the data already in there. Sync keeps both sides in step. Years of half-finished records are a separate job, and enrichment is the service for it.",
    "It does not decide which side is right. Conflict rules get agreed when it is built, and the rule that suits your team has to be chosen rather than assumed.",
    "It does not open a system that will not open. Most CRMs expose an API and this is orchestrated in n8n rather than limited to a fixed list, but a closed platform stays closed.",
    "It does not make anybody use the CRM. A record that is finally true is worth nothing if the team is still working out of a notebook.",
    "It does not remove the human decision. The published model for matching records has three outcomes rather than two, and the middle one is a short list of ambiguous pairs for a person to settle. Anything advertising a hundred percent automatic resolution has widened its threshold and is merging people.",
  ],

  faqs: [
    {
      q: "What is two-way CRM sync?",
      a: "It means information flows in both directions: activity from your calls, texts, bookings, and automations writes into the CRM, and changes made inside the CRM flow back out to the systems that act on them. One-way sync leaves one side permanently out of date.",
    },
    {
      q: "Does it work with Follow Up Boss or kvCORE?",
      a: "Yes, along with HubSpot and most CRMs that expose an API. The sync is orchestrated in n8n, so it is not limited to a fixed list of supported integrations.",
    },
    {
      q: "Will it create duplicate contacts?",
      // ROUND D: was a flat "No." The model that every serious matching system rests on
      // (Fellegi and Sunter 1969, as restated in Winkler's Census Bureau overview) sets its
      // thresholds from error bounds on false matches AND false nonmatches, so a build chooses
      // between two kinds of error and cannot have zero of both. A flat no was not something
      // this page could stand behind.
      a: "Preventing them is what it is for: a nominated identity field and a matching rule agreed when it is built mean an inbound record matching an existing contact updates that contact. What no honest build promises is that matching is never wrong in either direction, because the published model behind all of this sets its thresholds from the two error rates you are willing to accept and cannot drive both to zero. That is why ambiguous pairs go to a review list instead of being merged.",
    },
    {
      q: "Which side wins when both systems have changed the same field?",
      a: "Whichever one your conflict rule says, and the rule is a decision made when the sync is built rather than a default. A common arrangement is that the most recently changed value wins for facts like a phone number, while the CRM wins for anything about the relationship such as the stage of a deal. There is no rule that is right for every field, and the important part is that yours is written down somewhere you can read it.",
    },
  ],

  relatedPosts: [
    "crm-sync-real-estate-duplicate-contact-records",
    "ai-agent-workforce-real-estate-assistants",
    "workflow-automation-real-estate-business",
  ],
};
