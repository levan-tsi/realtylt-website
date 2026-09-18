import type { Service } from "./types";

/** COPY key `data` on realtylt.com/ai. Deep link: /ai#data */
export const skipTracingLeadGeneration: Service = {
  slug: "skip-tracing-lead-generation",
  aiKey: "data",
  name: "Skip Tracing & Lead Generation",
  tier: "flagship",

  eyebrow: "Prospecting · Skip-trace + Lead-gen",
  title: "Raw addresses become reachable people",
  lede: "It pulls owner leads from Google Maps. Then it finds a phone and an email for each address. That step is called skip tracing, and it runs on its own, a whole list at a time. A cold map becomes a list you can work.",
  specs: ["Google Maps / Places", "BatchData enrichment", "phone + email append", "at scale"],
  // "at a fraction of vendor pricing" was here and is gone (Round B, 2026-08-25). It is a
  // comparative price claim with nothing under it, and the rollout's standing rule is that a
  // vendor price we cannot read in a published document is a number the page refuses.
  why: "Prospecting means reaching out to find new clients, and it runs on lists. Bought lists cost a lot and go stale fast. This builds a fresh list of the owners themselves, whenever you ask. You get it for the area you are working, on the day you work it.",
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
      "Real estate skip tracing software that turns a map of addresses into a list you can work: an owner name, a phone, and an email, built fresh on demand.",
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
    headers: { before: "What you start with", after: "What comes back" },
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
        tag: "resolved",
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
      "An illustration rather than a real record. No client, no address and no telephone number here belongs to anybody. What it is showing is the third row. A result that cannot be resolved is flagged as unresolved, rather than filled in with the likeliest guess.",
  },

  whatItIs: [
    "It is a pipeline that turns an area into a phone list. You draw the area, or name the streets, or point at a category on Google Maps. The system pulls the properties. Then it enriches each one through BatchData skip-trace. What comes back is an owner name, a phone number, and an email address wherever one exists.",
    // ROUND E: "and nobody else is calling the same rows on the same morning" is gone. It is a
    // claim about what every other agent in the county is doing this week, which nothing we run
    // can observe. The rest of the sentence is a fact about how the list is built and stands.
    "The difference that matters is fresh versus bought. A purchased list is a snapshot of someone else's data from some point in the past. It was sold to everyone who paid for it. This builds the list on demand, from current sources, for the exact area you are working.",
    "It runs at scale without you touching it. Ten addresses or ten thousand go through the same path. Pull, enrich, validate, dedupe, and flag what is unreachable. Then it hands you a clean file, or writes it straight into your CRM ready to work.",
  ],

  howItWorks: [
    {
      title: "Pull the properties",
      body: "Google Maps and Places give up the raw addresses. That can be an area, a street, or a category. Most people do this part by hand, with a spreadsheet and an afternoon. It is also the part that scales the worst.",
    },
    {
      title: "Skip-trace every address",
      // ROUND E: "Absentee owners, trusts, and out-of-state owners all resolve the same way" is
      // gone. The page's own `limits` and its flagship both say the opposite: a trust resolves
      // to a trustee rather than a person, and a recent transfer often does not resolve at all.
      body: "Each property runs through BatchData enrichment. That resolves the address to the owner on the record. It then appends a phone number and an email address where the file has them. A trust or a company resolves to whatever the record actually names. That is frequently not a person you can ring, and it comes back flagged rather than smoothed over.",
    },
    {
      title: "Record where every number came from",
      // ROUND E: NEW STEP, and it is the one the flagship argues is the whole job. See
      // /blog/skip-tracing-real-estate-legal-owner-phone-numbers: two federal statutes turn on
      // where the information came from and what purpose it was released under, and both
      // attach to the person who obtained it rather than to the tool.
      body: "Every enriched row carries two extra fields. One is the source it came from. The other is the date it was appended. The permitted purpose your enrichment account operates under is agreed in writing once, at the start. This is the part nobody sells. It is also the part someone will eventually ask you about. Resellers of this kind of data are required to keep the purpose on file for five years. So the answer exists, and it is a fair question to ask before you sign.",
    },
    {
      title: "Validate, suppress and clean before you call",
      body: "Numbers are checked. Duplicates are collapsed. Anything thin is flagged rather than padded out. Then the list is run against two more lists before it reaches anything that dials. Your own suppression list, and the national do-not-call registry. A list with a lot of dead numbers burns the hours you spend on it. Nobody publishes an honest figure for how many of them are dead. So measure your own resolve rate on a sample of your own area, rather than accepting anybody's average.",
    },
    {
      title: "Hand it to whatever works it",
      body: "The finished list lands where you work it. Your CRM, an outbound campaign, or a voice agent that calls it. The point of building the list is that something works it. The same stack does that part too.",
    },
  ],

  useCases: [
    {
      title: "Farming a neighborhood you want to own",
      body: "Pick the streets. The pipeline returns every owner on them, with a number and an email. So a farm becomes a thing you can work this week. Not a mailer you send and hope about.",
    },
    {
      title: "Absentee and out-of-state owners",
      // ROUND E: "The owners most likely to sell are often the ones who do not live there" is
      // gone. It is a claim about who transacts, with nothing under it, on a page whose own
      // flagship spends a section refusing to invent rates for this trade.
      body: "Take an owner who does not live at the property. That is the case where the mailing address on the roll is most likely to be out of date. It is exactly the case a trace is for. What it gives you is a way to reach them. It does not tell you anything about whether they are thinking of selling.",
    },
    {
      title: "Expired and FSBO follow-up",
      // ROUND E: "A listing that expired is a seller who still wants to sell" is gone. It is an
      // absolute about a group of people, and plenty of expired sellers have decided to stay.
      body: "A listing came off the market. That household was recently willing to have the conversation, which is a better starting position than a cold street. Enrichment turns the address into a way of reaching them. Whether they still want to move is the first thing to find out, rather than something to assume.",
    },
    {
      title: "Filling a cold-call list without buying one",
      body: "A vendor's list is stale, and it was sold to everyone else who paid for it. Instead of buying one, you generate a fresh list. It covers the exact area you are working, on the day you are going to call it.",
    },
  ],

  limits: [
    "It does not promise a match rate. Rates vary by area, and by how much public record sits behind the property. No honest provider quotes 100%. Ask for a measured rate on a sample of your own farm before you sign anything.",
    "It does not resolve everything cleanly. Trusts, LLCs, and recently transferred properties come back flagged. They are marked partial or unreachable, not padded out with a guess.",
    "It does not give you permission to call. Do-not-call registrations and opt-out requests apply to these results exactly as they apply to any other list you dial.",
    "It does not answer the legal question about your own use. The federal rules attach to the person who obtains and uses the information. Those rules cover where it may come from, and what it may be used for. A provider's terms allocate risk between you and them. They do not settle that.",
    "It does not guarantee the number still reaches that person. Enrichment reports the best answer in the file at the moment it is asked. And telephone numbers get disconnected and reassigned to other people all the time.",
    "It does not make the calls. A list you can work only pays if something calls it. That is why the handoff is part of the build. It goes to a sequence or a voice agent, and it is not an afterthought.",
    "It does not give anybody a reason to sell. A fresh list of owners is a starting position. What you say when they pick up is still the whole job.",
  ],

  faqs: [
    {
      q: "What is skip tracing in real estate?",
      a: "Skip tracing means taking a property address and finding the current owner's contact details. That is their name, a working phone number, and an email address. In real estate it turns a list of houses into a list of people you can call. That is the difference between a map and a pipeline.",
    },
    {
      q: "How accurate is automated skip tracing?",
      a: "Match rates vary by area, and by how much public record exists behind the property. No honest provider promises 100%. Figures do circulate, usually as bands of 70 to 90 percent. The pages carrying them are companies that sell skip tracing, or pages ranking those companies. None we opened states a sample, so there is no independent measurement to quote you. Two things matter more than the headline rate. A phone hit rate and a connect rate are different quantities. The second is much lower, so ask which one you are being quoted. The other is what happens to the misses. This pipeline validates numbers, collapses duplicates, and flags a row as partial or unreachable. It does not hand you a dead number dressed up as a lead.",
    },
    {
      q: "Can I find a property owner's phone number from just the address?",
      a: "Often, and the honest answer is that the rate depends entirely on your area. Public records tie the address to an owner on the record. Enrichment providers like BatchData then resolve that owner to a phone number and, where one exists, an email. Trusts, LLCs, and recently transferred properties resolve less cleanly. Those come back flagged, so you know what you are looking at. Nobody publishes a match rate with a method under it. So the figure worth having is a measured one. Take a sample of your own farm rather than an industry average.",
    },
    {
      q: "Is skip tracing legal?",
      // ROUND E: this used to read "Skip tracing from public records and licensed data
      // providers is legal and standard practice", which is a flat legal conclusion with
      // nothing under it, and the research behind the flagship does not support it as stated.
      // Two federal statutes govern the acquisition and both were read in the primary. See
      // /blog/skip-tracing-real-estate-legal-owner-phone-numbers.
      a: "It is not one act, so it does not have one answer. Reading a deed or a tax roll is plainly fine, because those records are public by law. The appended contact details are the part that carries rules. Two federal statutes govern where that information may come from and what it may be used for. The Driver's Privacy Protection Act covers anything derived from a state motor vehicle record. It permits release only for a listed set of purposes. The Fair Credit Reporting Act turns on the purpose you use the information for. It does not turn on what the information contains. Both attach to the person obtaining and using the data, which is you rather than the tool. This is not legal advice for your business. Two questions are worth putting to any provider in writing. Which permitted purpose is your account established under? And does anything they supply derive from a consumer reporting agency?",
    },
    {
      q: "Does using a licensed provider make it safe?",
      // ROUND E: NEW. The single most common misreading in this category, and the statute is
      // explicit about it. 18 U.S.C. 2721(b)(8) permits a licensed investigative agency to use
      // the information "for any purpose permitted under this subsection", which is a loop.
      a: "It makes it accountable, which is worth having, and is not the same thing. A licence means there is a regulator, a record and something to lose. What it does not do is create a permitted purpose that the statute does not list. The clause granting licensed investigators access grants it only for purposes already permitted elsewhere in the same subsection. Ask the licensing question. Then ask separately what purpose the account sits under. Do not let the first answer stand in for the second.",
    },
    {
      q: "How is this different from buying a lead list?",
      a: "A bought list is old and shared. It was compiled at some point in the past and sold to everyone who paid. So the same owners get the same calls from several agents in the same week. This builds the list on demand, for the area you are working, on the day you work it. And you pay for the enrichment itself. Not for a middleman's margin on a file that was already resold. What that saves against any particular list vendor depends on the vendor and the volume. So this page does not print a multiple it cannot show you the working for.",
    },
    {
      q: "How many records can it process?",
      a: "It runs the same path whether it is ten addresses or ten thousand. The pulling, enriching, validating, and deduping are all automated. The practical limit is your enrichment budget, and how many calls you can actually make. It is not the pipeline.",
    },
    {
      q: "What happens to the list after it is built?",
      a: "It lands wherever it gets worked. That is your CRM, an SMS or email sequence, or an AI voice agent. The voice agent dials the list and books the ones who are interested. Building the list only pays if something works it. So the handoff is part of the build.",
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
