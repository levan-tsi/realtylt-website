import type { Service } from "./types";

/** COPY key `enrich` on realtylt.com/ai. Deep link: /ai#enrich
 *
 * ROUND F changed `why` and `lede` (an outcome claim and an absolute, both disowned by this
 * page's own limits); HIS GO of 2026-08-27 changed "phone + email verification" to "phone + email
 * checks" (verification shows a number is well formed, in service and not a duplicate, not that
 * it reaches that person). ROUND F also removed the invented person from the figure.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's job list, an
 * accounting office's client list, a gym's members, a real estate office's open-house sign-ins
 * as ONE example). Vendor names out of the copy (BRAND section 5). The FTC stat came off: the
 * FTC's PDF and its report page both answered 404 to this lane's reader on 2026-11-11, so the
 * "20 sources" figure could not be re-read today (never a guessed citation; LEARNINGS 10-29). The
 * orchestrator can read it in his Chrome and put it back. The stale-data FAQ no longer repeats the
 * circulating percentages it disowns. */
export const dataEnrichment: Service = {
  slug: "data-enrichment",
  aiKey: "enrich",
  name: "Data Enrichment",
  tier: "more",

  eyebrow: "Enrichment · Append and check",
  title: "Data enrichment: from half a contact to a usable record",
  lede: "The customer list has a first name and an email for one person, a phone that stopped working for another, and the same customer three times. We run a pass that fills in what is missing from trusted data sources, checks what is already there, collapses the duplicates and marks every new value with where it came from and when. What came back is never mixed silently into what the business already knew.",
  specs: ["fills in missing contact details", "phone and email checks", "duplicates collapsed", "source and date on every value"],
  why: "A customer nobody can reach is a customer nobody can serve. Enrichment fills the gaps in records the business already owns, and writes down where each value came from and when, so every row says how much to trust it.",
  keywords: [
    "data enrichment",
    "contact data enrichment for small business",
    "crm data cleanup",
    "verify phone numbers and emails",
    "real estate data enrichment",
  ],

  seo: {
    title: "Data enrichment for small business: contacts filled and checked",
    description:
      "Data enrichment for a small business: missing phones and emails filled in, numbers checked, duplicates collapsed, and the source and date kept on every value.",
  },

  figure: {
    kind: "records",
    caption: "What a pass does to a row, illustrated",
    headers: { before: "The record the business has", after: "The record the team can work" },
    rows: [
      {
        before: "A first name and an email, from a sign-up sheet",
        after: ["Full name", "a mobile appended", "source and date recorded"],
        tag: "filled",
      },
      {
        before: "A service address with no contact behind it",
        after: ["The property detail", "when it last changed hands", "no contact found"],
        tag: "partial",
      },
      {
        before: "A customer whose number the business already had",
        after: ["The file disagrees", "both values kept", "sent to a person"],
        tag: "needs a decision",
      },
    ],
    footnote:
      "An illustration rather than a real record. No customer, no address and no telephone number here belongs to anybody. What it is showing is the third row: when an outside file disagrees with something the business already knew, the honest behaviour is to keep both and ask. The common default is to overwrite without telling anybody.",
  },

  whatItIs: [
    "It is the pass that makes the records a business already owns usable. Most customer lists are full of half-records: a first name and an email, an address with no phone, a duplicate of a contact that already exists, a number that stopped working two years ago.",
    "Enrichment resolves them through trusted data sources and public records into a phone number, an email and, for a business that works on homes, the property detail behind the address. Then it collapses duplicates and checks each value, so the list handed to the team is one it can actually work. What a check establishes is that a number is well formed, in service and not a duplicate. That is useful, and it is not the same as establishing that it reaches that person.",
    "It fits any business with an old or messy customer list: a contractor or landscaper with years of job addresses, an accounting office with client emails from three systems, a salon or gym with members who changed numbers, a real estate office with open-house sign-ins. Before anything is appended, we agree with the owner which part of the list is worth working at all.",
  ],

  howItWorks: [
    {
      title: "We agree the rules before the pass",
      body: "Which records are worth a pass, which fields may be filled, and what happens when an outside file disagrees with something the business already holds. The owner approves those rules, and they go on the job before a single record changes.",
    },
    {
      title: "Append what is missing",
      body: "A phone number for the email-only contact, an email for the phone-only one, and the property detail behind the address where the business needs it.",
    },
    {
      title: "Check what is there",
      body: "Numbers and emails are checked rather than assumed. Time spent dialling numbers that no longer connect is a real cost, and one almost nobody counts, which is why the checking happens before the list is handed over rather than after.",
    },
    {
      title: "Collapse duplicates and flag the thin ones",
      body: "Duplicates merge with their history intact. Records that came back thin are flagged as thin, rather than padded out to look complete.",
    },
    {
      title: "Source, date, and what happens on a disagreement",
      body: "Every enriched value records where it came from and when it was written. Where an outside file disagrees with what the record already held, both values can be kept, so a person settles it rather than a default.",
    },
  ],

  handoff: {
    provides: [
      "The customer list or CRM export, and which part of it is worth working.",
      "Which fields may be filled in, and which must never be overwritten.",
      "What the business may use each record for, so the consent stays attached.",
      "The person who settles disagreements between old and new values.",
    ],
    approves: [
      "The rules for the pass, before any record changes.",
      "A sample of the results, before the whole list is run.",
      "Every disagreement between a value the business had and a new one.",
      "Anything sent to an enriched contact, under the same consent rules as any other.",
    ],
  },

  useCases: [
    {
      title: "The customer list nobody can call",
      body: "Thousands of contacts, and no working numbers against most of them. A pass over the part of it the business would actually work turns an archive into something the team can pick up and use.",
    },
    {
      title: "A contractor's old job addresses",
      body: "Years of addresses from past jobs, many with an old phone or none. The pass fills in what it can, marks where each value came from, and leaves the rest flagged rather than guessed.",
    },
    {
      title: "An accounting office's clients across three systems",
      body: "The same client appears with three emails. The duplicates collapse into one record with the history kept, and the disagreement over which email is current goes to the person who knows the client.",
    },
    {
      title: "A real estate office's open-house sign-ins",
      body: "A first name and a scrawled email become a fuller record, with the property they already own attached and a note saying where the rest of it came from.",
    },
    {
      title: "Before spending on outreach",
      body: "Checking first means a campaign is not spending on rows that were never going to reach anybody. And it is cheap to do on a sample before it is done on everything.",
    },
  ],

  limits: [
    "It does not invent a contact. A record that will not resolve comes back flagged as thin or unreachable, because a dead number that looks live costs more than a blank field.",
    "It does not guarantee a match. How much resolves depends on the area and on how much public record sits behind the address. No honest provider quotes a rate before seeing the list.",
    "It does not say how old a value is unless the source passes that through. Freshness is the most useful thing an appended field could carry, and it is the one most often missing from the response, so it is worth asking for by name.",
    "It does not know which answer is right when two sources disagree. That is a decision about the business, and it gets made once. It is worth asking which way the CRM leans before the first import: keep the value it already holds, or take the new one.",
    "It does not make a list callable in the legal sense. Do-not-call registrations and consent rules apply to an enriched record exactly as they do to any other.",
    "It does not keep a list fresh on its own. A pass is true on the day it runs, so a list that matters gets a smaller pass again before each use rather than one big pass every few years.",
    "It does not say anybody is interested. Enrichment makes a record reachable. Whether that person wants to hear from the business is a different question.",
  ],

  faqs: [
    {
      q: "What is data enrichment?",
      a: "It is filling in what a contact record is missing, and checking what it already has: appending a phone number or an email, adding the property detail behind an address where it matters, confirming that a number is in service, and collapsing duplicates. What arrives is an assertion from an outside file rather than something the business observed, which is why the source and the date matter as much as the value.",
    },
    {
      q: "How is enrichment different from skip tracing?",
      a: "Skip tracing starts from a property or an address and finds the owner. Enrichment starts from a contact the business already has and completes it. They use similar underlying sources. The legal weight sits with skip tracing, because there is no prior relationship behind it.",
    },
    {
      q: "Will enrichment overwrite the data I already have?",
      a: "Only if the pass is set up that way, so settle which way rather than assuming. Decide it deliberately: fill blanks only, keep both values in separate fields, or send disagreements to a person. Whichever is chosen, the previous value, the source and the date should be written to the record. Without them there is no way back from a bad pass.",
    },
    {
      q: "How fast does contact data go stale?",
      a: "There is no published rate worth quoting: the figures that circulate trace back to press releases and vendor pages rather than to a study with a stated sample. What is knowable is the mechanism. A field stops being true when something happens to a person: a move, a new job, a new number. So the rate belongs to the people on a particular list rather than to the data, and it is different for a gym's members than for an accounting office's long-time clients.",
    },
    {
      q: "What happens to records that cannot be enriched?",
      a: "They come back flagged as thin or unreachable rather than padded out with a guess. A dead number that looks like a live one is worse than a blank field, and it is paid for in dialling time.",
    },
    {
      q: "How do I clean up my CRM data?",
      a: "Start with the part of the list worth working, not all of it. Collapse the duplicates first, then check the numbers and emails, then fill what is missing, keeping the source and date on every new value. Send every disagreement with an existing value to a person. Then keep it clean going forward with one identity field that every app matches on.",
    },
  ],

  relatedPosts: [
    "data-enrichment-real-estate-stale-contact-records",
    "document-processing-real-estate-contract-deadlines",
  ],
};
