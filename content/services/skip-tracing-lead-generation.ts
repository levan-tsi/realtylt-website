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
  // "at a fraction of vendor pricing" was here and is gone (Round B, 2026-08-25). It is a
  // comparative price claim with nothing under it, and the rollout's standing rule is that a
  // vendor price we cannot read in a published document is a number the page refuses.
  why: "Lists are the lifeblood of prospecting, and buying them is expensive and stale. This builds fresh, owner-direct lists on demand, for the area you are working, on the day you work it.",
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
      "Turn a map of addresses into a callable list. Skip tracing turns each property into a verified owner name, phone, and email, built fresh on demand.",
  },

  /** ROUND E. Replaces a comparative claim with a quoted figure from the statute this page's
   * own flagship is built on, so the number on the page is checkable in a primary document. */
  stat: {
    value: "$2,500",
    label:
      "the minimum a court may award one person whose motor vehicle record information was obtained for a purpose federal law does not permit",
    source: {
      text: "18 U.S.C. 2724(b), Driver's Privacy Protection Act",
      href: "https://www.law.cornell.edu/uscode/text/18/2724",
    },
  },

  figure: {
    kind: "records",
    caption: "What the pipeline does to a row, illustrated",
    headers: { before: "What you start with", after: "What you can call" },
    /** ROUND E: THE STREET ADDRESSES ARE GONE, and the reason is a house rule this page was
     * breaking. STANDARD.md: "A fabricated address on a page whose argument is that the details
     * are checkable destroys the argument." These rows carried three invented owner names at
     * three real Hudson Valley street-and-town combinations. On a page about finding out who
     * lives at an address, a mocked-up record naming an owner at a specific local address is
     * the worst possible illustration, whatever the phone numbers say. The rows now describe
     * the KIND of property and the KIND of result, which is what the figure was ever showing. */
    rows: [
      {
        before: "A house on a street you are farming",
        after: ["Owner on the deed", "one mobile", "one email", "held 14 years"],
        tag: "verified",
      },
      {
        before: "A property held in a trust",
        after: ["Trustee, not a person", "one landline", "no email found", "absentee"],
        tag: "partial",
      },
      {
        before: "A recent transfer, not yet settled in the file",
        after: ["Two candidate owners", "no number matched", "nothing appended", "flagged"],
        tag: "partial",
      },
    ],
    footnote:
      "An illustration rather than a real record: no client, no address and no telephone number here belongs to anybody. What it is showing is the third row. A result that cannot be resolved is flagged as unresolved rather than filled in with the likeliest guess.",
  },

  whatItIs: [
    "It is a pipeline that turns a geography into a phone list. You draw the area, or name the streets, or point at a category on Google Maps, and the system pulls the properties. Then it enriches each one through BatchData skip-trace into an owner name, a verified phone number, and an email address wherever one exists.",
    // ROUND E: "and nobody else is calling the same rows on the same morning" is gone. It is a
    // claim about what every other agent in the county is doing this week, which nothing we run
    // can observe. The rest of the sentence is a fact about how the list is built and stands.
    "The distinction that matters is fresh versus bought. A purchased list is a snapshot of somebody else's data from some point in the past, sold to everyone who paid for it. This builds the list on demand, from current sources, for the exact area you are working.",
    "It runs at scale without you touching it. Ten addresses or ten thousand go through the same path: pull, enrich, validate, dedupe, flag what is unreachable, and hand you a clean file or write it straight into your CRM ready to work.",
  ],

  howItWorks: [
    {
      title: "Pull the properties",
      body: "Google Maps and Places give up the raw addresses for an area, a street, or a category. This is the part most people do by hand with a spreadsheet and an afternoon, and it is the part that scales the worst.",
    },
    {
      title: "Skip-trace every address",
      // ROUND E: "Absentee owners, trusts, and out-of-state owners all resolve the same way" is
      // gone. The page's own `limits` and its flagship both say the opposite: a trust resolves
      // to a trustee rather than a person, and a recent transfer often does not resolve at all.
      body: "Each property runs through BatchData enrichment, which resolves the address to the owner on the record and appends a phone number and an email address where the file has them. A trust or a company resolves to whatever the record actually names, which is frequently not a person you can ring, and that comes back flagged rather than smoothed over.",
    },
    {
      title: "Record where every number came from",
      // ROUND E: NEW STEP, and it is the one the flagship argues is the whole job. See
      // /blog/skip-tracing-real-estate-legal-owner-phone-numbers: two federal statutes turn on
      // where the information came from and what purpose it was released under, and both
      // attach to the person who obtained it rather than to the tool.
      body: "Every enriched row carries the source it came from and the date it was appended, and the permitted purpose your enrichment account operates under is agreed in writing once, at the start. This is the part nobody sells and it is the part somebody will eventually ask you about. Resellers of this kind of data are required to keep the purpose on file for five years, so the answer exists and it is a fair question to ask before you sign.",
    },
    {
      title: "Validate, suppress and clean before you call",
      body: "Numbers are checked, duplicates are collapsed, anything thin is flagged rather than padded out, and the list is run against your own suppression list and the national do-not-call registry before it reaches anything that dials. A list with a lot of dead numbers burns the hours you spend on it. Nobody publishes an honest figure for how many of them are dead, which is the argument for measuring your own resolve rate on a sample of your own area rather than accepting anybody's average.",
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
      // ROUND E: "The owners most likely to sell are often the ones who do not live there" is
      // gone. It is a claim about who transacts, with nothing under it, on a page whose own
      // flagship spends a section refusing to invent rates for this trade.
      body: "An owner who does not live at the property is the case where the mailing address on the roll is most likely to be out of date, which is exactly the case a trace is for. What it gives you is a way to reach them. It does not tell you anything about whether they are thinking of selling.",
    },
    {
      title: "Expired and FSBO follow-up",
      // ROUND E: "A listing that expired is a seller who still wants to sell" is gone. It is an
      // absolute about a group of people, and plenty of expired sellers have decided to stay.
      body: "A listing that came off the market is a household that was recently willing to have the conversation, which is a better starting position than a cold street. Enrichment turns the address into a way of reaching them. Whether they still want to move is the first thing to find out rather than something to assume.",
    },
    {
      title: "Filling a cold-call list without buying one",
      body: "Instead of paying a vendor for a stale list that ten other agents also bought, you generate a fresh one for the exact area you are working, on the day you are going to call it.",
    },
  ],

  limits: [
    "It does not promise a match rate. Rates vary by area and by how much public record sits behind the property, and no honest provider quotes 100%. Ask for a measured rate on a sample of your own farm before you sign anything.",
    "It does not resolve everything cleanly. Trusts, LLCs, and recently transferred properties come back flagged as partial or unreachable rather than padded out with a guess.",
    "It does not give you permission to call. Do-not-call registrations and opt-out requests apply to these results exactly as they apply to any other list you dial.",
    "It does not answer the legal question about your own use. The federal rules on where this information may come from and what it may be used for attach to the person who obtains and uses it, and a provider's terms allocate risk between you and them rather than settling that.",
    "It does not guarantee the number still reaches that person. Enrichment reports the best answer in the file at the moment it is asked, and telephone numbers get disconnected and reassigned to other people continuously.",
    "It does not make the calls. A callable list only pays if something calls it, which is why the handoff to a sequence or a voice agent is part of the build rather than an afterthought.",
    "It does not give anybody a reason to sell. A fresh list of owners is a starting position, and what you say when they pick up is still the whole job.",
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
      a: "Often, and the honest answer is that the rate depends entirely on your area. Public records tie the address to an owner on the record, and enrichment providers like BatchData resolve that owner to a phone number and, where one exists, an email. Trusts, LLCs, and recently transferred properties resolve less cleanly, and those come back flagged so you know what you are looking at. Nobody publishes a match rate with a method under it, so the figure worth having is a measured one from a sample of your own farm rather than an industry average.",
    },
    {
      q: "Is skip tracing legal?",
      // ROUND E: this used to read "Skip tracing from public records and licensed data
      // providers is legal and standard practice", which is a flat legal conclusion with
      // nothing under it, and the research behind the flagship does not support it as stated.
      // Two federal statutes govern the acquisition and both were read in the primary. See
      // /blog/skip-tracing-real-estate-legal-owner-phone-numbers.
      a: "It is not one act, so it does not have one answer. Reading a deed or a tax roll is unambiguously fine, because those records are public by law. The appended contact details are the part that carries rules. Two federal statutes govern where that information may come from and what it may be used for: the Driver's Privacy Protection Act, which permits release of anything derived from a state motor vehicle record only for a listed set of purposes, and the Fair Credit Reporting Act, which turns on the purpose you use the information for rather than on what the information contains. Both attach to the person obtaining and using the data, which is you rather than the tool. This is not legal advice for your business, and the two questions worth putting to any provider in writing are which permitted purpose your account is established under and whether anything they supply derives from a consumer reporting agency.",
    },
    {
      q: "Does using a licensed provider make it safe?",
      // ROUND E: NEW. The single most common misreading in this category, and the statute is
      // explicit about it. 18 U.S.C. 2721(b)(8) permits a licensed investigative agency to use
      // the information "for any purpose permitted under this subsection", which is a loop.
      a: "It makes it accountable, which is worth having and is not the same thing. A licence means there is a regulator, a record and something to lose. What it does not do is create a permitted purpose that the statute does not list, because the clause granting licensed investigators access grants it only for purposes already permitted elsewhere in the same subsection. Ask the licensing question, then ask separately what purpose the account sits under, and do not let the first answer stand in for the second.",
    },
    {
      q: "How is this different from buying a lead list?",
      a: "A bought list is old and shared. It was compiled at some point in the past and sold to everyone who paid, so the same owners get the same calls from several agents in the same week. This builds the list on demand, for the area you are working, on the day you work it, and you pay for the enrichment itself rather than for a middleman's margin on a file that was already resold. What that saves against any particular list vendor depends on the vendor and the volume, so this page does not print a multiple it cannot show you the working for.",
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

  /** ROUND E: its own flagship first. The marketing-automation post is second because it is the
   * other half of the same question, which is what you are allowed to do with a list once you
   * have one. The chat post came off: it was here because the page had no flagship of its own
   * and it has nothing to say about prospecting lists. */
  relatedPosts: [
    "skip-tracing-real-estate-legal-owner-phone-numbers",
    "marketing-automation-real-estate-email-deliverability",
    "workflow-automation-real-estate-business",
  ],
};
