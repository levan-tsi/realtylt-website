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
  why: "Agents lose deals to stale, half-updated CRMs. Real-time two-way sync means the record you look at is the record that's true, with every touch logged automatically.",
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
      "Every call, text, booking, and enriched contact writes back to your CRM automatically, and updates flow the other way, so the record you are looking at is the record that is true.",
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
    footnote: "The deals lost to a stale CRM are lost quietly, which is why nobody counts them.",
  },

  whatItIs: [
    "It is the connection between your CRM and everything that actually happens. Calls, texts, bookings, enriched contacts, and website conversations all produce information that should be on the contact record, and most of it never gets there because putting it there is somebody's manual job.",
    "Two-way sync means it lands automatically, and that changes to the CRM flow back out to the systems that need them. n8n keeps both sides in lockstep, so the record you are looking at is the record that is true.",
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
      title: "No record lives in two places",
      body: "Deduping and conflict rules mean one contact stays one contact, rather than becoming three slightly different ones across three systems.",
    },
  ],

  useCases: [
    {
      title: "The CRM that is finally accurate",
      body: "Every touch is logged, so the record reflects the relationship rather than the last time somebody remembered to update it.",
    },
    {
      title: "No more double entry",
      body: "Information a system already holds stops being retyped into the next system, which is where a large share of admin hours quietly go.",
    },
    {
      title: "Automations that act on the truth",
      body: "A nurture sequence firing at someone who already went under contract is what a stale CRM costs you, and it is entirely avoidable.",
    },
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
      a: "No. Deduping and conflict rules are part of the build, so an inbound lead matching an existing contact updates that record rather than creating a second one.",
    },
  ],
};
