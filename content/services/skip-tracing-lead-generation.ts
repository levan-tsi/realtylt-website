import type { Service } from "./types";

/** COPY key `data` on realtylt.com/ai. Deep link: /ai#data */
export const skipTracingLeadGeneration: Service = {
  slug: "skip-tracing-lead-generation",
  aiKey: "data",
  name: "Skip Tracing & Lead Generation",
  tier: "flagship",

  eyebrow: "Prospecting · Skip-trace + Lead-gen",
  title: "Raw addresses become reachable people",
  lede: "Scrape owner leads from Google Maps and Places, then enrich each address into a verified phone and email through BatchData skip-trace, automatically, at scale. A cold map becomes a callable pipeline.",
  specs: ["Google Maps / Places", "BatchData enrichment", "verified phone + email", "at scale"],
  why: "Lists are the lifeblood of prospecting, and buying them is expensive and stale. This builds fresh, owner-direct lists on demand, at a fraction of vendor pricing.",
  keywords: [
    "real estate skip tracing software",
    "real estate lead generation automation",
    "find property owner contact info",
    "real estate prospecting tool",
    "seller lead generation ai",
  ],

  seo: {
    title: "Real Estate Skip Tracing and Lead Generation, Automated",
    description:
      "Turn a map of addresses into a callable list. Automated skip tracing enriches each property into a verified owner name, phone, and email, built fresh on demand instead of bought stale.",
  },

  figure: {
    kind: "records",
    caption: "What the pipeline actually does to a row",
    headers: { before: "What you start with", after: "What you can call" },
    rows: [
      {
        before: "412 Verplanck Ave, Beacon NY",
        after: ["J. Moreno", "(845) 555 0142", "j.moreno@…", "owned 14 yrs"],
        tag: "verified",
      },
      {
        before: "88 Willow St, Poughkeepsie NY",
        after: ["R. Feld (trust)", "(845) 555 0119", "no email found", "absentee"],
        tag: "partial",
      },
      {
        before: "7 Ridge Rd, Cold Spring NY",
        after: ["A. Whitmore", "(914) 555 0177", "aw@…", "free & clear"],
        tag: "verified",
      },
    ],
    footnote:
      "Every row is checked before it lands: numbers validated, duplicates collapsed, and anything unreachable flagged instead of quietly sold to you as a lead.",
  },

  whatItIs: [
    "It is a pipeline that turns a geography into a phone list. You draw the area, or name the streets, or point at a category on Google Maps, and the system pulls the properties. Then it enriches each one through BatchData skip-trace into an owner name, a verified phone number, and an email address wherever one exists.",
    "The distinction that matters is fresh versus bought. A purchased list is a snapshot of somebody else's data from some point in the past, sold to everyone who paid for it. This builds the list on demand, from current sources, for the exact area you are working, and nobody else is calling the same rows on the same morning.",
    "It runs at scale without you touching it. Ten addresses or ten thousand go through the same path: pull, enrich, validate, dedupe, flag what is unreachable, and hand you a clean file or write it straight into your CRM ready to work.",
  ],

  howItWorks: [
    {
      title: "Pull the properties",
      body: "Google Maps and Places give up the raw addresses for an area, a street, or a category. This is the part most people do by hand with a spreadsheet and an afternoon, and it is the part that scales the worst.",
    },
    {
      title: "Skip-trace every address",
      body: "Each property runs through BatchData enrichment, which resolves the address to the current owner and appends a phone number and an email address. Absentee owners, trusts, and out-of-state owners all resolve the same way.",
    },
    {
      title: "Validate and clean before you call",
      body: "Numbers are checked, duplicates are collapsed, and anything that came back thin is flagged rather than padded out. A list where 40% of the numbers are dead is worse than no list, because it burns the hours you spend dialing it.",
    },
    {
      title: "Hand it to whatever works it",
      body: "The finished list lands in your CRM, or in an outbound campaign, or in front of a voice agent that calls it. The point of building a callable list is that something calls it, and the same stack does that part too.",
    },
  ],

  useCases: [
    {
      title: "Farming a neighborhood you want to own",
      body: "Pick the streets. The pipeline returns every owner on them with a number and an email, so a farm is a thing you can actually work this week instead of a mailer you send and hope about.",
    },
    {
      title: "Absentee and out-of-state owners",
      body: "The owners most likely to sell are often the ones who do not live there. Skip tracing resolves the mailing address behind the property and gives you a way to reach them directly.",
    },
    {
      title: "Expired and FSBO follow-up",
      body: "A listing that expired is a seller who still wants to sell. Enrichment turns the address into a phone number, and you are the first call they get rather than the twentieth postcard.",
    },
    {
      title: "Filling a cold-call list without buying one",
      body: "Instead of paying a vendor for a stale list that ten other agents also bought, you generate a fresh one for the exact area you are working, on the day you are going to call it.",
    },
  ],

  faqs: [
    {
      q: "What is skip tracing in real estate?",
      a: "Skip tracing is the process of taking a property address and finding the current owner's contact details: their name, a working phone number, and an email address. In real estate it is how prospectors turn a list of houses into a list of people they can actually call, which is the difference between a map and a pipeline.",
    },
    {
      q: "How accurate is automated skip tracing?",
      a: "Match rates vary by area and by how much public record exists behind the property, and no honest provider promises 100%. What matters more than the headline rate is what happens to the misses: this pipeline validates numbers, collapses duplicates, and flags a row as partial or unreachable rather than handing you a dead number dressed up as a lead.",
    },
    {
      q: "Can I find a property owner's phone number from just the address?",
      a: "Usually, yes. Public records tie the address to an owner, and enrichment providers like BatchData resolve that owner to a phone number and, where one exists, an email. Trusts, LLCs, and recently transferred properties resolve less cleanly, and those come back flagged so you know what you are looking at.",
    },
    {
      q: "Is skip tracing legal?",
      a: "Skip tracing from public records and licensed data providers is legal and standard practice in real estate prospecting. Calling the results is where the rules live: you must honor do-not-call registrations and opt-out requests, and any automated outreach has to follow the same consent rules as your own dialing.",
    },
    {
      q: "How is this different from buying a lead list?",
      a: "A bought list is old and shared. It was compiled at some point in the past and sold to everyone who paid, so the same owners get the same calls from several agents in the same week. This builds the list on demand, for the area you are working, on the day you work it, and it costs a fraction of vendor pricing because you are paying for enrichment rather than for a middleman's margin.",
    },
    {
      q: "How many records can it process?",
      a: "It runs the same path whether it is ten addresses or ten thousand, because the pulling, enriching, validating, and deduping are all automated. The practical limit is your enrichment budget and how many calls you can actually make, not the pipeline.",
    },
    {
      q: "What happens to the list after it is built?",
      a: "It lands wherever it gets worked: your CRM, an SMS or email sequence, or an AI voice agent that dials it and books the ones who are interested. Building a callable list only pays if something calls it, so the handoff is part of the build.",
    },
  ],

  relatedPosts: ["workflow-automation-real-estate-business", "ai-chat-assistant-real-estate-website"],
};
