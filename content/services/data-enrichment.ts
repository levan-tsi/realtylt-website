import type { Service } from "./types";

/** COPY key `enrich` on realtylt.com/ai. Deep link: /ai#enrich
 *
 * TWO /ai COPY FIELDS WERE CHANGED IN ROUND F and both are recorded in ROUND-F-LOG.md, because
 * changing COPY widens the drift between this surface and the journey.
 *
 *   `why` ended "lifting the connect rate on lists you already own", which is an outcome claim
 *   with nothing under it, on the one page in the set whose own flagship argues that an
 *   appended value is a claim rather than a fact.
 *
 *   `lede` ended "so every record in your pipeline is actually reachable". That is an absolute,
 *   and this page's own second `limit` contradicts it in as many words: it does not guarantee a
 *   match. A promise a page disowns four fields later is worse than no promise.
 *
 * `specs` still says "phone + email verification" and is left alone as COPY. What verification
 * actually establishes is that a number is well formed, in service and not a duplicate, which
 * is not the same as establishing that it reaches that person, and the limits and the FAQ now
 * say so. Flagged for the owner rather than changed. */
export const dataEnrichment: Service = {
  slug: "data-enrichment",
  aiKey: "enrich",
  name: "Data Enrichment",
  tier: "more",

  eyebrow: "Enrichment · Append + Verify",
  title: "Half a name becomes a full profile",
  lede: "A bare address or partial contact is enriched into phone, email, and property detail through BatchData and public-record sources, deduped and validated, with what came back marked as what came back rather than merged silently into what you already knew.",
  specs: ["BatchData + public records", "phone + email verification", "property detail append", "dedupe + validate"],
  why: "You can't work a lead you can't reach. Enrichment fills the gaps in records you already own, and records where each value came from and when, so the row tells you how much to trust it.",
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
      "Thin records become callable profiles. Phone and email appended and verified, duplicates collapsed, and unreachable rows flagged rather than sold to you.",
  },

  /** ROUND F. The page carried no number at all. This one is from the flagship's own opening
   * moment, and it is the answer to the only question that matters about an appended field:
   * who says so. It is a fact about one company in a federal study, not about all of them, and
   * the label says which. */
  stat: {
    value: "20",
    label:
      "the number of different sources one data broker told the Federal Trade Commission it draws consumers' contact information from",
    source: {
      text: "FTC, Data Brokers: A Call for Transparency and Accountability, May 2014",
      href: "https://www.ftc.gov/system/files/documents/reports/data-brokers-call-transparency-accountability-report-federal-trade-commission-may-2014/140527databrokerreport.pdf",
    },
  },

  /** ROUND F: THE INVENTED PERSON IS GONE. These rows carried a made-up surname, a made-up
   * telephone number marked "verified", a specific Hudson Valley town and a purchase year, all
   * attached to a first name from an open house. That is the same house rule the skip-tracing
   * page was breaking in Round E, on the page whose own flagship argues that an appended value
   * is somebody else's claim: a mocked-up person makes the illustration look like a record.
   * The rows now describe the KIND of gap and the KIND of result. */
  figure: {
    kind: "records",
    caption: "What a pass does to a row, illustrated",
    headers: { before: "The record you have", after: "The record you can work" },
    rows: [
      {
        before: "A first name and an email, from a sign-in sheet",
        after: ["Full name", "a mobile appended", "source and date recorded"],
        tag: "filled",
      },
      {
        before: "A mailing address with no property behind it",
        after: ["The parcel", "when it last changed hands", "no contact found"],
        tag: "partial",
      },
      {
        before: "A contact whose number you already had",
        after: ["The file disagrees", "both values kept", "sent to a person"],
        tag: "needs a decision",
      },
    ],
    footnote:
      "An illustration rather than a real record: no client, no address and no telephone number here belongs to anybody. What it is showing is the third row. When an outside file disagrees with something you already knew, the honest behaviour is to keep both and ask, and the common default is to overwrite without telling anybody.",
  },

  whatItIs: [
    "It is the pass that makes the records you already own usable. Most CRMs are full of half-leads: a first name and an email, an address with no phone, a duplicate of a contact that already exists, a number that stopped working two years ago.",
    "Enrichment resolves them through BatchData and public-record sources into a phone number, an email, and the property detail behind the address, then dedupes and validates so the list you hand to a caller is one they can actually work. What validation establishes is that a number is well formed, in service and not a duplicate, which is a useful check and is not the same as establishing that it reaches that person.",
  ],

  howItWorks: [
    {
      title: "Append what is missing",
      body: "A phone number for the email-only contact, an email for the phone-only one, and the property detail behind the address.",
    },
    {
      title: "Verify what is there",
      /** ROUND F: "A list where a third of the numbers are dead" is gone. Nobody has measured
       * that, here or anywhere with a stated method, and it was our own number. */
      body: "Numbers are checked rather than assumed. Dialling time spent on numbers that no longer connect is a real cost and it is one almost nobody counts, which is why the checking happens before the list is handed over rather than after.",
    },
    {
      title: "Dedupe and flag",
      body: "Duplicates merge with their history intact, and records that came back thin are flagged as thin rather than padded out to look complete.",
    },
    {
      /** ROUND F. A step this page did not have, and the flagship is the argument for it: an
       * appended value is an assertion with an age and a source, and a pass that writes over a
       * field you already had has destroyed something without asking. */
      title: "Source, date, and what happens on a disagreement",
      body: "Every enriched value records where it came from and when it was written. Where an outside file disagrees with something the record already held, the rule is agreed with you at the start rather than inherited from a default, and both values can be kept so a person can settle it.",
    },
  ],

  useCases: [
    {
      title: "The CRM you cannot call",
      body: "Thousands of contacts and no numbers against most of them. A pass over the part of it you would actually work turns an archive into something you can pick up and use.",
    },
    {
      title: "Open-house sign-ins",
      body: "A first name and a scrawled email become a fuller record, with the property they already own attached and a note saying where the rest of it came from.",
    },
    {
      title: "Before you spend on outreach",
      body: "Checking first means the campaign is not spending on rows that were never going to reach anybody, and it is cheap to do on a sample before it is done on everything.",
    },
  ],

  limits: [
    "It does not invent a contact. A record that will not resolve comes back flagged as thin or unreachable, because a dead number that looks live costs you more than a blank field.",
    "It does not guarantee a match. How much resolves depends on the area and on how much public record sits behind the address, and no honest provider quotes a rate before seeing the list.",
    "It does not tell you how old a value is unless the provider passes that through. Freshness is the most useful thing an appended field could carry and it is the one most often missing from the response, so it is worth asking for by name.",
    "It does not know which answer is right when two sources disagree. That is a decision about your business, it gets made once, and the common software default is that whichever value arrived most recently wins.",
    "It does not make a list callable in the legal sense. Do-not-call registrations and consent rules apply to an enriched record exactly as they do to any other.",
    "It does not tell you anybody is interested. Enrichment makes a record reachable. Whether that person wants to hear from you is a different question.",
  ],

  faqs: [
    {
      q: "What is data enrichment?",
      a: "It is filling in what a contact record is missing and checking what it already has: appending a phone number or an email, adding the property detail behind an address, confirming that a number is in service, and collapsing duplicates. What arrives is an assertion from an outside file rather than something you observed, which is why the source and the date matter as much as the value.",
    },
    {
      q: "How is enrichment different from skip tracing?",
      a: "Skip tracing starts from a property and finds the owner. Enrichment starts from a contact you already have and completes it. They use the same underlying sources, and in practice most pipelines need both. The legal weight sits with skip tracing, because there is no prior relationship behind it.",
    },
    {
      q: "Will enrichment overwrite the data I already have?",
      a: "Only if the pass is configured that way, and the common default is that the newer value wins. Decide it deliberately: fill blanks only, keep both values in separate fields, or send disagreements to a person. Whichever you choose, the previous value, the source and the date should be written to the record, because without them there is no way back from a bad pass.",
    },
    {
      q: "How fast does contact data go stale?",
      a: "There is no published rate worth quoting. The figures that circulate range from about twenty two percent to seventy percent a year for the same claim, and they trace back to press releases and vendor pages rather than to a study with a stated sample. What is knowable is the mechanism: a field stops being true when something happens to a person, so the rate belongs to the people in your database rather than to the data, and it is different for a first-time buyer and a couple downsizing.",
    },
    {
      q: "What happens to records that cannot be enriched?",
      a: "They come back flagged as thin or unreachable rather than padded out with a guess. A dead number that looks like a live one is worse than a blank field, because you pay for it in dial time.",
    },
  ],

  relatedPosts: [
    "data-enrichment-real-estate-stale-contact-records",
    "document-processing-real-estate-contract-deadlines",
    "skip-tracing-real-estate-legal-owner-phone-numbers",
  ],
};
