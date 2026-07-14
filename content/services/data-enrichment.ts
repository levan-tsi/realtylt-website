import type { Service } from "./types";

/** COPY key `enrich` on realtylt.com/ai. Deep link: /ai#enrich */
export const dataEnrichment: Service = {
  slug: "data-enrichment",
  aiKey: "enrich",
  name: "Data Enrichment",
  tier: "more",

  eyebrow: "Enrichment · Append + Verify",
  title: "Half a name becomes a full profile",
  lede: "A bare address or partial contact is enriched into verified phone, email, and property detail through BatchData and public-record sources, deduped and validated, so every record in your pipeline is actually reachable.",
  specs: ["BatchData + public records", "phone + email verification", "property detail append", "dedupe + validate"],
  why: "You can't work a lead you can't reach. Enrichment turns thin, unusable records into complete, callable profiles, lifting the connect rate on lists you already own.",
  keywords: [
    "real estate data enrichment",
    "skip trace enrichment api",
    "contact append real estate",
    "verify phone email real estate leads",
    "property data enrichment",
  ],

  seo: {
    title: "Real Estate Data Enrichment: Append and Verify Contacts",
    description:
      "Thin records become callable profiles. Phone and email appended and verified, property detail added, duplicates collapsed, and unreachable rows flagged rather than sold to you as leads.",
  },

  figure: {
    kind: "records",
    caption: "The same CRM, before and after a pass",
    headers: { before: "The record you have", after: "The record you can work" },
    rows: [
      {
        before: "“Jenna, from the open house”",
        after: ["J. Kowalski", "(845) 555 0188 verified", "email appended"],
        tag: "reachable",
      },
      {
        before: "Email only, no phone, 2022",
        after: ["Phone appended", "Owns in Fishkill", "Bought 2016"],
        tag: "reachable",
      },
      {
        before: "Duplicate of an existing contact",
        after: ["Merged", "History preserved", "One record, not two"],
        tag: "deduped",
      },
    ],
    footnote: "A CRM full of records you cannot reach is not a pipeline. It is a filing cabinet.",
  },

  whatItIs: [
    "It is the pass that makes the records you already own usable. Most CRMs are full of half-leads: a first name and an email, an address with no phone, a duplicate of a contact that already exists, a number that stopped working two years ago.",
    "Enrichment resolves them through BatchData and public-record sources into a verified phone, an email, and the property detail behind the address, then dedupes and validates so the list you hand to a caller is one they can actually work.",
  ],

  howItWorks: [
    {
      title: "Append what is missing",
      body: "A phone number for the email-only contact, an email for the phone-only one, and the property detail behind the address.",
    },
    {
      title: "Verify what is there",
      body: "Numbers are checked rather than assumed. A list where a third of the numbers are dead burns the hours spent dialing it, which is a cost people rarely count.",
    },
    {
      title: "Dedupe and flag",
      body: "Duplicates merge with their history intact, and records that came back thin are flagged as thin rather than padded out to look complete.",
    },
  ],

  useCases: [
    {
      title: "The CRM you cannot call",
      body: "Thousands of contacts, missing numbers. One enrichment pass turns an archive into a callable list.",
    },
    {
      title: "Open-house sign-ins",
      body: "A first name and a scrawled email become a full, reachable profile with the property they already own attached.",
    },
    {
      title: "Before you spend on outreach",
      body: "Verifying first means the campaign spends on people who exist, which is the cheapest optimisation available to any outbound effort.",
    },
  ],

  faqs: [
    {
      q: "What is data enrichment?",
      a: "It is filling in what a contact record is missing and verifying what it already has: appending a phone number or an email, adding the property detail behind an address, checking that the number still works, and collapsing duplicates. The result is a record you can actually act on.",
    },
    {
      q: "How is enrichment different from skip tracing?",
      a: "Skip tracing starts from a property and finds the owner. Enrichment starts from a contact you already have and completes it. They use the same underlying sources, and in practice most pipelines need both.",
    },
    {
      q: "What happens to records that cannot be enriched?",
      a: "They come back flagged as thin or unreachable rather than padded out with a guess. A dead number that looks like a live one is worse than a blank field, because you pay for it in dial time.",
    },
  ],
};
